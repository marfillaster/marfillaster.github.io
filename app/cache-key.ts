// -----------------------------------------------------------------------------
// Cache-key normalization for the gateway entrypoint in workers/remix-app.ts.
//
// Nothing routable reads a query string: every searchParams call site is under
// /api/ or /comments/. So for document routes the gateway hands `Site` a
// request with the query stripped, and ?utm_source, ?fbclid and a sprayed
// ?x=1..n all collapse onto one cache entry instead of fragmenting the cache
// and forcing a render each time.
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
//
// Only exact document routes are normalized. Redirects keep their query, so a
// 301 from a non-canonical URL does not drop a visitor's campaign parameters,
// and /api/ and /comments/ need theirs to select a response at all.
// -----------------------------------------------------------------------------

/**
 * The URL `Site` should see, or null when the request should pass through
 * untouched. `documentPaths` is the digest map — its keys are exactly the
 * canonical document routes.
 */
export function canonicalDocumentUrl(
  url: URL,
  documentPaths: Readonly<Record<string, string>>,
): URL | null {
  if (url.search === "" || !Object.hasOwn(documentPaths, url.pathname)) {
    return null;
  }

  const canonical = new URL(url);
  canonical.search = "";
  return canonical;
}
