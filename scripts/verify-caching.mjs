// Verification for the caching layer: URL canonicalization, content digests,
// document headers, and the manual purge endpoint. Run with `pnpm test:caching`.
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
// must not hold a copy; everything else is retired by the Worker version.
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
// repeatable. Caching it is safe because entries are keyed by Worker version:
// a path that becomes real is published by a deploy, which retires this.
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
