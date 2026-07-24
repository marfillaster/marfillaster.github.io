# Caching adjustment: Workers Cache, canonical keys, content digests

> **Status: built 2026-07-25, staging-verified, not yet in production.**
>
> The plan below was written against `cross_version_cache: true` plus a
> post-deploy tag-purge reconcile. Staging measurement retired that design; what
> shipped is simpler. Read this block, then the plan for the reasoning that
> still applies.
>
> **What staging established, none of it documented by Cloudflare:**
>
> 1. `cache.purge({ tags })` only reaches entries stored by the Worker version
>    issuing the purge. It reports `success: true` and evicts nothing otherwise.
>    A post-deploy reconcile is *by definition* cross-version, so tag purging
>    could never have done that job.
> 2. A `cf.cacheKey` override makes an entry unaddressable: tag purges skip it,
>    and `pathPrefixes` purges match the *request path*, not the custom key. The
>    gateway therefore rewrites the request URL instead of overriding the key.
> 3. `pathPrefixes` and `purgeEverything` do work across versions.
> 4. `ctx.exports` needed `"compatibility_flags": ["enable_ctx_exports"]` — it is
>    default-on only from compatibility date 2025-11-17, and ours is 2025-07-01.
> 5. `cache.purge` does not exist in local workerd; the adapter treats a missing
>    method as success, which is accurate since nothing caches in front of dev.
>
> **The design that shipped:** `cross_version_cache` off. Cache keys include the
> Worker version, so a deploy retires every previous entry and **no purge step
> exists at all** — which was the original goal. That deleted the reconcile
> endpoint, its KV state, version pinning, the deploy wrapper, the quarter-hourly
> cron, and the homepage's special short TTL. What remains: the gateway (query
> stripping, so `?utm_*` variants share one entry), build-time content digests as
> ETags (an edited post does not invalidate readers' copies of the others),
> `CACHE_EPOCH`, a network-wide prefix purge when a comment is posted, and a
> token-guarded `POST /api/cache/purge` for clearing something without shipping.
>
> The cost of turning `cross_version_cache` off is one re-render per requested
> path per colo per deploy — small here, and it buys away a failure mode where a
> missed purge serves stale content for days.

## Context

Measured against the live site, the current three-layer story doesn't hold up:

- **The zone cache is not the layer serving documents.** A never-seen query string
  (`/rss.xml?n=<random>`) returns `cf-cache-status: HIT` on the same object as the bare
  URL; identity and gzip requests share one entry with the same `age`; a `no-store` 404
  carries no `cf-cache-status` at all. That is `caches.default` inside the Worker
  (`app/http-caching.ts`), keyed `path?rmxv=<versionId>`. The Worker runs on every request.
- **The deploy purge is close to ceremonial.** `scripts/purge-zone.mjs` purges 64 bare
  URLs, but the entries actually serving traffic are keyed with `?rmxv=`, which a URL
  purge cannot match. They were already invalidated by the version in the key.
- **Every deploy invalidates everything, everywhere** — browsers (the ETag is
  `versionId:path`) and the inner cache alike. A one-word typo fix re-downloads all 19
  posts for every reader and re-renders every page in every colo.
- **Comment invalidation is per-colo.** `cache.delete` in `app/comment-handlers.tsx:99`
  only clears the colo that handled the POST; elsewhere a new comment stays invisible for
  up to `s-maxage=300`.

Goal: invalidation proportional to what changed, and one cache entry per resource rather
than one per URL variant. Publishing an article should drop that article and the three pages
listing it — not the other eighteen, and not every reader's browser cache.

Cloudflare's **Workers Cache** (GA, all plans, wrangler ≥ 4.107 — we have 4.111, confirmed in
`node_modules/wrangler/config-schema.json`) is the enabling piece: a cache in front of the
Worker, with `Cache-Tag`, `cf.cacheKey` key control, and an in-Worker
`cache.purge({ tags | pathPrefixes | purgeEverything })` needing no API token.

## Design

| Layer | Keyed by | Invalidated by |
|---|---|---|
| Workers Cache (in front of the `Site` entrypoint) | pathname only — query stripped via `cf.cacheKey`; version excluded via `cross_version_cache` | tag purge from the post-deploy reconcile; `s-maxage` backstop |
| Inner `caches.default` | path + content digest | content or code change; `CACHE_EPOCH` bump |
| Browser (`ETag`) | content digest | content or code change; `CACHE_EPOCH` bump |

**How much each deploy invalidates.** A content-only deploy moves only the digests of the
changed content and the three index pages, so the reconcile purges only those tags. A deploy
touching `app/`, `src/lib/` or the CSS moves `BUILD_DIGEST`, hence every digest, so it purges
everything — correct, since a component change can alter any page. The win is that publishing
an article no longer costs a full cache turnover.

**Two platform facts the design is built around.** First, with `cross_version_cache: true` the
edge can serve a stale entry *without invoking the Worker at all*, so a purge triggered lazily
from inside the Worker would never fire for the pages that need it — the purge needs an
explicit trigger once the new version is live (step 6). Second, Cloudflare has no pre-lookup
hook: the cache sits in front of your code, and the only programmable key control is
`cf.cacheKey` on a fetch your code *makes*. Normalizing keys therefore requires an uncached
gateway entrypoint in front of a cached one (step 2).

## Steps

### 1. Enable Workers Cache on a named entrypoint

`wrangler.jsonc` and `wrangler.staging.jsonc`:

```jsonc
"cache": { "enabled": true, "cross_version_cache": true },
"exports": {
  "default": { "type": "worker", "cache": { "enabled": false } },
  "Site": { "type": "worker", "cache": { "enabled": true } }
}
```

This is the shape Cloudflare's own configuration docs use, and the pattern they name: *"This
is the recommended way to build the gateway pattern: disable caching on the gateway entrypoint
and enable it on the inner entrypoint the gateway calls through `ctx.exports`."* The `exports`
map is keyed by export name and accepts `"default"` (confirmed in the installed
`config-schema.json`), so the gateway opts out explicitly rather than by inheritance, and
`cross_version_cache` stays unambiguous at the Worker level.

Cloudflare's docs show a same-day `compatibility_date`; ours is `2025-07-01`. Try it unchanged
first and only bump if caching doesn't engage — a bump to 2026-07 crosses a year of flags
needing separate review. Note `cross_version_cache` also means gradual deployments would serve
mixed-version content; we don't use them and shouldn't start without revisiting this.

### 2. Gateway entrypoint + normalized cache keys

Restructure `workers/remix-app.ts` into two exports in the same bundle:

```ts
import { WorkerEntrypoint } from "cloudflare:workers";

export class Site extends WorkerEntrypoint<RemixEnv> {
  fetch(request: Request) {
    currentCtx = this.ctx;                       // see note below
    return getApp(this.env).router.fetch(request);
  }
}

export default {
  fetch(request: Request, env: RemixEnv, ctx: ExecutionContext) {
    const cacheKey = cacheKeyFor(new URL(request.url));
    return ctx.exports.Site.fetch(request, { cf: { cacheKey } });
  },
  scheduled(event, env, ctx) { /* unchanged */ },
};
```

The call shape mirrors the docs' own example (`ctx.exports.Backend.fetch(request, { cf: {
cacheKey: url.pathname + url.search } })`), and an empty-string or omitted `cacheKey` falls
back to the default URL-derived key — which is how `/api/*` opts out below.

- `cacheKeyFor(url)`:
  - `/api/*` → empty string, falling back to the default URL-derived key (those responses are
    `no-store`; nothing to collapse).
  - `/comments/*` → `pathname` plus the essential params in a fixed order — `fragment`,
    `reply_to`, `thread` (`app/comment-handlers.tsx:118-120,183`). Fixed order also fixes the
    documented fragmentation where `?a=1&b=2` and `?b=2&a=1` are separate keys.
  - everything else → `pathname`. **No cacheable route reads a query string** — every
    `searchParams` call site in the codebase is under `/api/*` or `/comments/*` — so for
    documents the essential set is empty and the rule is "strip everything", not an allowlist
    to maintain.
- **The gateway must not call `getApp`.** Building the router and parsing content on every
  request would negate the point; the gateway does a URL parse and a delegate call, nothing
  else.
- `currentCtx` (`workers/remix-app.ts:~150`) currently gets stamped by the default `fetch` for
  `Platform.waitUntil`. It moves into `Site.fetch` using `this.ctx`, since that is where
  request work now happens.
- `cf.cacheKey` is honored only when the call stays within the account — true here, both
  entrypoints are in one bundle.

### 3. Global cache epoch

New `src/lib/cache-epoch.mjs`, one exported constant (`.mjs` so plain-node build scripts and
the TS app can both import it — the precedent is `src/lib/post-meta.mjs`, imported by
`app/post-index.ts`):

```js
export const CACHE_EPOCH = "1";
```

Folded into every digest, so bumping it in a commit changes every ETag, every inner cache key,
and (via the reconcile) purges every edge entry. That is the nuclear clear on deploy.

### 4. Build-time content digests

New `scripts/generate-cache-digests.mjs` → committed `app/cache-digests.generated.ts`:

- `BUILD_DIGEST` = sha256 over `CACHE_EPOCH` plus the sorted (path, sha256) of `app/**/*.ts{,x}`
  (excluding the generated file itself), `src/lib/**`, `src/styles.css`,
  `src/code-highlight.css`, `workers/remix-app.ts`, and `app/assets-manifest.generated.ts`.
- `PATH_DIGESTS: Record<string, string>` — for each routable path, `sha256(BUILD_DIGEST + its
  content bytes)` truncated to 16 hex. Reuse `parsePosts(entries, { includeRouteOnly: true })`
  from `src/lib/post-meta.mjs` for the path→`contentFile` mapping — the same call
  `scripts/purge-zone.mjs` makes today. `/`, `/rss.xml` and `/sitemap.xml` digest over all
  posts' parsed *frontmatter* only, so a body-only edit doesn't move the index pages.
- `ASSET_DIGESTS: Record<string, string>` — sha256 per file under `public/`. These now matter:
  with `cross_version_cache: true`, `/og.png` and the PDFs under
  `public/mikrotik-home-network/` survive deploys, and today's `purge-zone.mjs` is what keeps
  them fresh. Losing that would be a regression. `/assets/*` is excluded — fingerprinted, new
  URL per build.
- Runs last in the build (it hashes the assets manifest):
  `"cf:build": "pnpm gen:remix-content && pnpm remix:assets && pnpm gen:cache-digests"`.

### 5. Rewire `app/http-caching.ts`

- `documentEtag(versionId, pathname)` → digest lookup in `PATH_DIGESTS`, falling back to
  `platform.versionId` for paths not in the map.
- Inner cache key `?rmxv=<versionId>` → `?v=<digest>`. Query normalization stays: the gateway
  handles the edge layer, this handles the Node adapter and anything that reaches the router
  with a query.
- **Put the edge TTL in `Cache-Control` as `s-maxage`, not only in
  `Cloudflare-CDN-Cache-Control`.** Whether Workers Cache reads the Cloudflare-specific header
  is undocumented; `s-maxage` is honored by any shared cache and ignored by browsers, so it
  works either way:
  `public, max-age=60, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=86400`.
  Seven days rather than a year is deliberate — if a reconcile call is ever missed, the site
  self-heals within a week instead of serving stale content until the next content change.
- Set `Vary: Accept-Encoding` on **every** document, not only gzipped ones. Today `maybeGzip`
  sets it conditionally; with a cache in front, an identity entry stored without `Vary` could
  be served to a gzip client.
- Tag every document `site`, and tag each page with **every post it renders**, not just itself:

  | Path | `Cache-Tag` |
  |---|---|
  | `/<post>/` | `site`, `post-<slug>` |
  | `/` | `site`, `index`, `post-<slug>` for every feed post (`buildPostIndex` filters to `feed: true`) |
  | `/rss.xml` | `site`, `index`, `post-<slug>` for every feed item |
  | `/sitemap.xml` | `site`, `index`, `post-<slug>` for every routable post (route-only included) |
  | `/comments/<slug>` | `site`, `comments-<slug>` |

  The index pages carrying their constituents' tags is what makes narrow purges correct:
  `purge({ tags: ["post-mikrotik-vlan-guest-iot"] })` takes the homepage, RSS and sitemap with
  it instead of leaving three stale listings. Comments deliberately do **not** carry
  `post-<slug>`, so a new comment doesn't drop the homepage. Cloudflare strips the header
  before the client sees it, and tags must be identical across variants of a URL. ~20 tags on
  the homepage against limits of ~1000 tags / 16 KB — no headroom concern.

### 6. Post-deploy reconcile (the purge trigger)

- `app/platform.ts`: add `purgeCache(options: { tags?: string[]; pathPrefixes?: string[];
  purgeEverything?: boolean }): Promise<{ success: boolean }>` to the port, and a KV-backed
  `cacheState` get/put pair (reuse the existing `PAGE_VIEWS` namespace under a `cache:` key
  prefix — it already doubles as the rate-limit store, `workers/remix-app.ts:197`).
- `workers/remix-app.ts`: implement `purgeCache` via `import { cache } from
  "cloudflare:workers"`. The installed `@cloudflare/workers-types` (2026-07-16) carries no
  type for it, so hand-roll a minimal interface beside the existing hand-rolled `D1Database`
  interfaces in that file.
- `server/node.ts`: no-op `purgeCache` (`httpCache` is already `null` there).
- New `POST /api/cache/reconcile` (new `app/cache-reconcile.ts`), responding
  `Cache-Control: no-store` so the edge never stores it and every call reaches the Worker:
  1. Read the stored map from KV (`{ versionId, epoch, paths, assets }`).
  2. Absent → `purgeCache({ purgeEverything: true })`, store, return `{ bootstrapped: true }`.
  3. `stored.versionId === platform.versionId` → no-op, `{ alreadyReconciled: true }`.
  4. Otherwise diff: changed/removed document paths → their tags; changed `public/` files →
     `pathPrefixes`. One combined `purgeCache({ tags, pathPrefixes })`, then store the new map.
- `"cf:deploy": "wrangler deploy && node scripts/reconcile-cache.mjs"` — a small script that
  POSTs the endpoint with 3 retries / 2s backoff (propagation insurance), prints the purge
  summary, and fails the build loudly if `success` is false.
- The endpoint is unauthenticated **by design**: step 3 of that sequence makes it idempotent
  per version, so a second caller gets `alreadyReconciled` and no purge happens. That keeps
  `ADMIN_RESYNC_TOKEN` out of the build environment. If you'd rather close it, it takes the
  same bearer check as `handleResync` (`app/analytics.ts:100-104`) plus the token as a Workers
  Builds env var.
- Backstop: call the same reconcile from the existing `scheduled` handler
  (`workers/remix-app.ts:240`) so a missed post-deploy call self-corrects within a day, well
  inside the 7-day `s-maxage`.

### 7. Network-wide comment purge

`app/comment-handlers.tsx`: tag fragment and page responses `comments-<slug>`; on a successful
POST call `platform.purgeCache({ tags: ["comments-" + slug] })` alongside the existing
per-colo `cache.delete`, which stays for the Node adapter.

### 8. Manual purge endpoint

New `POST /api/cache/purge`, guarded by the `handleResync` bearer check
(`app/analytics.ts:100-104`, `ADMIN_RESYNC_TOKEN`). Accepts `{ tags }`, `{ pathPrefixes }` or
`{ purgeEverything: true }`.

**Sharp edge to document, not solve.** A runtime purge clears the edge layer only. Inner
`caches.default` entries are digest-keyed and not tag-purgeable, so they keep serving the
previous render until the digest moves. Harmless in practice — content can't change without a
deploy, and the comment POST already deletes its inner entry in the serving colo — but it
means the true nuclear option remains a `CACHE_EPOCH` bump plus deploy. Say so in the
endpoint's response body.

### 9. Retire the zone purge

Delete `scripts/purge-zone.mjs`. Update the deploy section of `CLAUDE.md` and the caching
bullets in `docs/remix3-migration-plan.md` (lines ~100-120, ~316). `CLOUDFLARE_ZONE_ID` /
`CLOUDFLARE_API_TOKEN` can then come out of the Workers Builds environment — a dashboard
action for you, not something I can do.

### 10. Tests

Workers Cache applies default TTLs to responses with no `Cache-Control` (7200s for 200s, 1200s
for 301s, 180s for 404s), so "every route sets an explicit `Cache-Control`" becomes an
invariant a future route could silently break. Add `scripts/verify-caching.mjs` (mirroring the
in-memory platform harness in `scripts/verify-comments.mjs`) + a `test:caching` script,
asserting: `cacheKeyFor` strips every query param on document routes, preserves and orders the
three comment params, and leaves `/api/*` alone; every router path emits `Cache-Control`;
digest ETags are stable across two builds with unchanged content; an epoch bump moves every
digest; `If-None-Match` yields 304; the homepage/RSS/sitemap tag sets contain every post they
list; a comment POST calls `purgeCache`; and the reconcile diff purges exactly the changed
tags, is a no-op on repeat, and bootstraps to `purgeEverything` on empty KV.

## Verification

Staging carries the risk. Three things can't be settled from the docs: whether a cache in
front of the Worker stores the identity body that `maybeGzip` labels `Content-Encoding: gzip`
(`autoEncodesBody`); whether ETags survive the new path; and which cache-control header
Workers Cache reads for its own TTL.

1. `pnpm cf:build && wrangler deploy -c wrangler.staging.jsonc`, then against
   `blog-staging.*.workers.dev`:
   - `wrangler tail` open — a second request to a path must show the gateway running but
     **not** `Site`. That is the proof the entrypoint cache is engaged.
   - `curl --compressed` and plain `curl -I` — correct bodies, correct `Content-Encoding`,
     strong `ETag` on both.
   - `If-None-Match` with the returned ETag → `304`.
2. `/?utm_source=x`, `/?utm_source=y` and `/` must all resolve to one entry — `wrangler tail`
   shows `Site` invoked once. This is the whole point of step 2.
3. **Method safety:** the documented key composition *excludes the HTTP method*. POST a
   comment and confirm it is not served a cached GET response, and that `/api/cache/purge`
   and `/api/comments/hide` behave. If POSTs are affected, the contingency is a second,
   uncached entrypoint for mutating routes — worth knowing before production.
4. Deploy staging again with no content change → ETags identical and entries stay warm (no
   `Site` invocation on the first request after deploy). If entries turn over anyway,
   `cross_version_cache` is not taking effect and step 1 needs rework.
5. Edit one post's frontmatter, rebuild, deploy → reconcile reports purging that post's tag
   only; `wrangler tail` shows re-invocation for that post, `/`, `/rss.xml`, `/sitemap.xml`
   and nothing else. Edit only its body → the three index digests hold still.
6. Touch `public/og.png`, deploy → reconcile purges its path prefix and the new bytes serve.
7. Call `/api/cache/reconcile` a second time → `alreadyReconciled`, no purge.
8. Bump `CACHE_EPOCH`, deploy → every tag purged, every ETag new. Revert before shipping.
9. Comments: POST a comment on staging, read the fragment → visible immediately.
10. `pnpm typecheck && pnpm test:comments && pnpm test:caching`.
11. Production: ship steps 1-8 and watch `cf-cache-status`, `wrangler tail` and view counts
    for a couple of hours; **delete `purge-zone.mjs` in a separate final commit** so the
    rollback path stays one revert away.
