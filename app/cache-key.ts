// -----------------------------------------------------------------------------
// Cache-key normalization for the gateway entrypoint in workers/remix-app.ts.
//
// The query string is stripped everywhere it is not needed to produce the
// response, so ?utm_source, ?fbclid and a sprayed ?x=1..n all collapse onto one
// cache entry instead of fragmenting the cache and forcing a render each time.
// Only /api/ and /comments/ are exempt: they read parameters to select a
// response at all. Every searchParams call site in the app is under one of
// those two prefixes.
//
// Stripping by exclusion rather than by an allowlist of known documents is the
// point. A 404 is cacheable here (app/app.tsx defaultHandler) but only collapses
// if the sprayed junk never reaches the key: measured on production before this
// rule, /nope?x=1 and /nope?x=2 were two MISSes, two Worker invocations and two
// cache entries. One rule covers documents, 404s and redirects alike.
//
// Redirects included: a 301 echoes the query into its Location, so a stripped
// query means `/post?utm_source=hn` lands on `/post/` with no parameters and
// analytics loses that visit's campaign attribution. That is the deliberate
// price of having no path on the site whose cache key an outsider can vary.
// Canonical URLs — the ones in rel=canonical, RSS and the sitemap — already
// carry the trailing slash, so they reach the document without redirecting and
// keep their parameters in the address bar.
//
// Stripping the request URL rather than overriding `cf.cacheKey` is
// deliberate, and was settled by measurement on staging:
//
//   - A `cf.cacheKey` override makes `cache.purge({ tags })` a silent no-op —
//     it reports success and evicts nothing. Tag purges only reach entries
//     stored under the default URL-derived key.
//   - `pathPrefixes` purges match the *request path*, not the custom key, so a
//     custom key cannot be addressed that way either.
//
// Keeping the request path canonical leaves entries addressable by both tag
// and prefix, which is what the post-deploy reconcile needs.
// -----------------------------------------------------------------------------

/** Prefixes whose handlers select a response by query string. */
const QUERY_CONSUMING_PREFIXES = ["/api/", "/comments/"];

/**
 * Prefixes whose freshness is managed by an explicit purge rather than by a
 * TTL or by the Worker version. Purges are scoped to the entrypoint that issues
 * them, and every purge here is issued from inside `Site`, so a copy held by
 * the gateway's cache would survive one and serve a comment thread that is
 * known to be stale. The gateway marks these uncacheable at its own layer;
 * `Site` still caches them, and still purges them.
 */
const PURGE_MANAGED_PREFIXES = ["/comments/"];

/** Whether the gateway must not keep its own copy of this path's response. */
export function isPurgeManaged(pathname: string): boolean {
  return PURGE_MANAGED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * The URL `Site` should see, or null when the request should pass through
 * untouched — either because there is nothing to rewrite or because the
 * handler needs the query as sent.
 */
export function canonicalUrl(url: URL): URL | null {
  if (
    url.search === "" ||
    QUERY_CONSUMING_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
  ) {
    return null;
  }

  const canonical = new URL(url);
  canonical.search = "";
  return canonical;
}
