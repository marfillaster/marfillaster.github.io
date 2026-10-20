// Verification for the caching layer: URL canonicalization, content digests,
// document headers, the deploy reconcile, and the manual purge endpoint. Run
// with `pnpm test:caching`.
//
// The invariant worth the most here is header coverage. Workers Cache applies
// a default TTL to any response that carries no Cache-Control (two hours for a
// 200), so a route added without one would be cached far longer than intended.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "../app/app.tsx";
import { canonicalUrl, isPurgeManaged } from "../app/cache-key.ts";
import { handleCachePurge } from "../app/cache-purge.ts";
import { createAppData } from "../app/post-index.ts";
import { CACHE_EPOCH } from "../src/lib/cache-epoch.mjs";
import { computeDigests, listFiles } from "./lib/cache-digests.mjs";
import { BUILD_DIGEST, PATH_DIGESTS } from "../workers/cache-digests.generated.ts";
import { planPurge, reconcileCache } from "../workers/cache-reconcile.ts";
import { memoryPlatform } from "./lib/memory-platform.mjs";

const repoRoot = resolve(fileURLToPath(import.meta.url), "../..");
const origin = "https://example.test";
const url = (path) => new URL(path, origin);

// --- cache keys ------------------------------------------------------------
// Requests are handed to `Site` with the query stripped, so tracking parameters
// and sprayed junk collapse onto one entry rather than each forcing a render.
// The request path stays canonical, which is what keeps entries addressable by
// tag — a cf.cacheKey override silently breaks tag purges (see app/cache-key.ts).
const canonical = (path) => {
  const result = canonicalUrl(url(path));
  return result === null ? null : result.pathname + result.search;
};

assert.equal(canonical("/mikrotik-vlan-guest-iot/?utm_source=hn"), "/mikrotik-vlan-guest-iot/");
assert.equal(canonical("/?fbclid=abc&x=1"), "/");
assert.equal(canonical("/rss.xml?nonce=9"), "/rss.xml");
// Already canonical: nothing to rewrite.
assert.equal(canonical("/"), null);
assert.equal(canonical("/mikrotik-vlan-guest-iot/"), null);

// Unmatched paths are stripped too — that is the shape a scanner sprays, and a
// cacheable 404 only collapses if the junk never reaches the key.
assert.equal(canonical("/wp-login.php?x=91237"), "/wp-login.php");
assert.equal(canonical("/nope/deeper?a=1&b=2"), "/nope/deeper");

// /comments/ and /api/ read parameters to select a response, so their queries
// pass through untouched.
assert.equal(canonical("/comments/article/?fragment=1"), null);
assert.equal(canonical("/api/analytics/pageviews?path=/a/"), null);

// Redirect sources are stripped like everything else. The cost is that a 301
// no longer forwards campaign parameters to the canonical URL; the gain is that
// no path on the site has a cache key an outsider can vary.
assert.equal(canonical("/mikrotik-vlan-guest-iot?utm_source=hn"), "/mikrotik-vlan-guest-iot");
assert.equal(canonical("/solar-report/full-report/?ref=hn&z=2"), "/solar-report/full-report/");

// Both entrypoints cache, and a purge only reaches the one that issued it. A
// comment thread's freshness comes from a purge inside `Site`, so the gateway
// must not hold a copy; everything else is purged by the deploy reconcile.
assert.equal(isPurgeManaged("/comments/mikrotik-vlan-guest-iot"), true);
assert.equal(isPurgeManaged("/"), false);
assert.equal(isPurgeManaged("/mikrotik-vlan-guest-iot/"), false);
assert.equal(isPurgeManaged("/api/analytics/pageviews"), false);

// --- digests ---------------------------------------------------------------
const digests = await computeDigests(repoRoot, CACHE_EPOCH);
const repeat = await computeDigests(repoRoot, CACHE_EPOCH);
assert.deepEqual(repeat, digests, "digests must be deterministic across runs");
assert.ok(Object.keys(digests.paths).length > 10);
assert.ok(Object.keys(digests.assets).length > 0);

// Bumping the epoch is the nuclear clear: every path digest has to move.
const bumped = await computeDigests(repoRoot, `${CACHE_EPOCH}-bumped`);
for (const [path, value] of Object.entries(digests.paths)) {
  assert.notEqual(bumped.paths[path], value, `epoch bump must move ${path}`);
}
// Static files are hashed from their own bytes, so the epoch leaves them be.
assert.deepEqual(bumped.assets, digests.assets);

// The index pages render frontmatter from every post, so they share a digest
// and differ from any single post's.
assert.equal(digests.paths["/"], digests.paths["/rss.xml"]);
assert.equal(digests.paths["/"], digests.paths["/sitemap.xml"]);
assert.notEqual(digests.paths["/"], digests.paths["/mikrotik-vlan-guest-iot/"]);

// --- app-level headers -----------------------------------------------------
const contentDir = resolve(repoRoot, "src/content");
const content = new Map(
  await Promise.all(
    (await listFiles(contentDir))
      .filter((path) => [".md", ".mdx"].includes(extname(path)))
      .map(async (path) => [
        relative(contentDir, path).split(sep).join("/"),
        await readFile(path, "utf8"),
      ]),
  ),
);

const harness = memoryPlatform({
  content,
  pathDigests: digests.paths,
  assetDigests: digests.assets,
  adminResyncToken: "admin-token",
});
const app = createApp(harness.platform);
const data = createAppData(harness.platform);
const samplePost = data.feedItems[0];

const get = (path, headers) =>
  app.fetch(new Request(new URL(path, origin), { headers }));

const home = await get("/");
assert.equal(home.status, 200);
assert.equal(home.headers.get("ETag"), `"${digests.paths["/"]}"`);
assert.match(home.headers.get("Cache-Control"), /stale-if-error=86400/);
// The homepage can't be prefix-purged without purging the site, so its edge
// TTL is what retires it; every other document waits for a purge.
assert.match(home.headers.get("Cache-Control"), /s-maxage=300\b/);
assert.match(home.headers.get("Cloudflare-CDN-Cache-Control"), /max-age=300\b/);
// Set unconditionally: an identity copy stored without Vary could otherwise
// be handed to a client that asked for gzip.
assert.equal(home.headers.get("Vary"), "Accept-Encoding");

// A matching If-None-Match is answered before anything renders.
const revalidated = await get("/", { "If-None-Match": home.headers.get("ETag") });
assert.equal(revalidated.status, 304);
assert.equal(revalidated.headers.get("ETag"), home.headers.get("ETag"));
// A stale validator still gets the document.
assert.equal((await get("/", { "If-None-Match": '"stale"' })).status, 200);

const postResponse = await get(samplePost.href);
assert.equal(postResponse.headers.get("ETag"), `"${digests.paths[samplePost.href]}"`);
assert.notEqual(postResponse.headers.get("ETag"), home.headers.get("ETag"));
assert.match(postResponse.headers.get("Cache-Control"), /s-maxage=604800\b/);

// Every route emits an explicit Cache-Control — see the note at the top.
const routes = [
  "/",
  "/rss.xml",
  "/sitemap.xml",
  "/solar-report/",
  "/solar-report/full-report",
  "/nev-mileage/",
  "/nev-mileage/full-report",
  samplePost.href,
  samplePost.href.replace(/\/$/, ""), // canonical redirect
  "/no-such-page",
];
for (const path of routes) {
  const response = await get(path);
  assert.ok(
    response.headers.get("Cache-Control"),
    `${path} responded ${response.status} with no Cache-Control`,
  );
}

// The gateway and the redirect handler composed: `Site` is handed the stripped
// URL, so the Location it echoes has no query either. Worth asserting together
// because the parameters are dropped in one file and echoed in another (the
// Node adapter has no gateway, hence the explicit canonicalUrl call).
const trackedSource = `${samplePost.href.replace(/\/$/, "")}?utm_source=hn`;
const redirected = await app.fetch(
  new Request(canonicalUrl(url(trackedSource)) ?? url(trackedSource)),
);
assert.equal(redirected.status, 301);
assert.equal(redirected.headers.get("Location"), samplePost.href);

// --- unmatched paths ------------------------------------------------------
// A 404 is the one route an attacker chooses, so it has to be cheap and
// repeatable. Caching it is safe because a path that becomes real is published
// by a deploy, and the deploy reconcile purges every added path.
const missing = await get("/no-such-page-at-all");
assert.equal(missing.status, 404);
assert.match(missing.headers.get("Cache-Control"), /s-maxage=86400/);
assert.doesNotMatch(missing.headers.get("Cache-Control"), /no-store/);

// Extensionless misses skip the asset binding entirely; only file-shaped paths
// are worth confirming, since real assets never reach the Worker.
let assetLookups = 0;
const counting = memoryPlatform({ content, pathDigests: digests.paths });
counting.platform.assets = async () => {
  assetLookups += 1;
  return null;
};
const countingApp = createApp(counting.platform);
const fetchFrom = (app, path) => app.fetch(new Request(new URL(path, origin)));
await fetchFrom(countingApp, "/no-such-page");
assert.equal(assetLookups, 0);
await fetchFrom(countingApp, "/missing-image.png");
assert.equal(assetLookups, 1);

// Over the per-IP ceiling, unmatched paths are refused before rendering.
const flooded = memoryPlatform({
  content,
  pathDigests: digests.paths,
  flooding: true,
});
const floodedApp = createApp(flooded.platform);
const refused = await fetchFrom(floodedApp, "/anything");
assert.equal(refused.status, 429);
assert.equal(refused.headers.get("Cache-Control"), "no-store");
assert.equal(refused.headers.get("Retry-After"), "10");
// Real routes are unaffected by the ceiling.
assert.equal((await fetchFrom(floodedApp, "/")).status, 200);

// --- deploy reconcile ------------------------------------------------------
// Cached pages survive deploys, so each deploy purges what its digests say
// changed. Code, styles and dependencies move BUILD_DIGEST: everything goes,
// because a cached page from the old build points at assets the new one no
// longer serves.
const current = { build: BUILD_DIGEST, paths: PATH_DIGESTS };
const postPath = "/mikrotik-ipv6-failover-bgp-bfd/";
assert.ok(PATH_DIGESTS[postPath] && PATH_DIGESTS[`${postPath}vyos/`], "fixture paths exist");

assert.deepEqual(planPurge(null, current), { purgeEverything: true });
assert.deepEqual(planPurge({ ...current, build: "old" }, current), { purgeEverything: true });
assert.equal(planPurge(current, current), null);

const withPaths = (changes) => ({ build: current.build, paths: { ...current.paths, ...changes } });
// One post edited: its prefix without the slash, which also takes its
// redirect and its variants.
assert.deepEqual(planPurge(withPaths({ [postPath]: "old" }), current), {
  pathPrefixes: ["/mikrotik-ipv6-failover-bgp-bfd"],
});
// A variant and its parent collapse onto the parent's prefix.
assert.deepEqual(
  planPurge(withPaths({ [postPath]: "old", [`${postPath}vyos/`]: "old" }), current),
  { pathPrefixes: ["/mikrotik-ipv6-failover-bgp-bfd"] },
);
// A new post: its path was absent, and may hold a cached 404.
const { [postPath]: _removed, ...withoutPost } = current.paths;
assert.deepEqual(planPurge({ build: current.build, paths: withoutPost }, current), {
  pathPrefixes: ["/mikrotik-ipv6-failover-bgp-bfd"],
});
// A removed post: purged so it stops being served.
assert.deepEqual(
  planPurge(withPaths({ "/retired-post/": "x" }), current),
  { pathPrefixes: ["/retired-post"] },
);
// A frontmatter edit moves the index pages. RSS and the sitemap purge by
// prefix; `/` is left to its short TTL, since its prefix is every path.
const indexEdit = planPurge(
  withPaths({ "/": "old", "/rss.xml": "old", "/sitemap.xml": "old" }),
  current,
);
assert.deepEqual(indexEdit, { pathPrefixes: ["/rss.xml", "/sitemap.xml"] });
assert.equal(planPurge(withPaths({ "/": "old" }), current), null);
// Past Cloudflare's 30-prefix limit, purge everything.
const manyChanged = Object.fromEntries(
  Array.from({ length: 31 }, (_, i) => [`/gone-${i}-post/`, "x"]),
);
assert.deepEqual(planPurge(withPaths(manyChanged), current), { purgeEverything: true });

// The stored state only advances once both layers purged, so a failure is
// retried by the next request, cron run or post-deploy call.
function reconcileHarness({ stored, failSite = false } = {}) {
  const kv = new Map(stored ? [["cache:reconciled", JSON.stringify(stored)]] : []);
  const calls = { gateway: [], site: [], settled: [] };
  return {
    kv,
    calls,
    deps: {
      env: {
        PAGE_VIEWS: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => void kv.set(k, v) },
        CF_VERSION_METADATA: { id: "v2" },
      },
      purgeGateway: async (options) => (calls.gateway.push(options), { success: true }),
      purgeSite: async (options) =>
        (calls.site.push(options), { success: !failSite, errors: failSite ? [{ code: 1, message: "x" }] : [] }),
      waitUntil: (promise) => calls.settled.push(promise),
    },
  };
}

const fresh = reconcileHarness();
assert.deepEqual(await reconcileCache(fresh.deps), {
  action: "purged",
  versionId: "v2",
  build: BUILD_DIGEST,
  purge: { everything: true },
});
assert.deepEqual(fresh.calls.gateway, [{ purgeEverything: true }]);
assert.deepEqual(fresh.calls.site, [{ purgeEverything: true }]);
assert.equal(fresh.calls.settled.length, 1, "a settle purge is scheduled");
const advanced = JSON.parse(fresh.kv.get("cache:reconciled"));
assert.equal(advanced.build, BUILD_DIGEST);
assert.equal(advanced.versionId, "v2");

const steady = reconcileHarness({ stored: { ...advanced } });
assert.equal((await reconcileCache(steady.deps)).action, "none");
assert.equal(steady.calls.gateway.length + steady.calls.site.length, 0);

const failing = reconcileHarness({
  stored: { ...advanced, paths: { ...advanced.paths, [postPath]: "old" } },
  failSite: true,
});
await assert.rejects(reconcileCache(failing.deps), /cache purge failed/);
assert.equal(
  JSON.parse(failing.kv.get("cache:reconciled")).paths[postPath],
  "old",
  "a failed purge leaves the state behind, so the next attempt purges again",
);

// --- manual purge ----------------------------------------------------------
const purgeRequest = (body, token) =>
  new Request(new URL("/api/cache/purge", origin), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(body),
  });

const manual = memoryPlatform({ adminResyncToken: "admin-token" });
assert.equal(
  (await handleCachePurge(purgeRequest({ tags: ["site"] }), manual.platform)).status,
  401,
);
assert.equal(
  (
    await handleCachePurge(
      purgeRequest({}, "admin-token"),
      manual.platform,
    )
  ).status,
  400,
);
assert.equal(
  (
    await handleCachePurge(
      purgeRequest({ tags: ["post-x"] }, "admin-token"),
      manual.platform,
    )
  ).status,
  200,
);
assert.deepEqual(manual.purges, [{ tags: ["post-x"] }]);

// purgeEverything is exclusive of the other options.
await handleCachePurge(
  purgeRequest({ purgeEverything: true, tags: ["site"] }, "admin-token"),
  manual.platform,
);
assert.deepEqual(manual.purges.at(-1), { purgeEverything: true });

console.log("caching verification passed");
