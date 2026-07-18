// -----------------------------------------------------------------------------
// Version-keyed HTTP caching for rendered documents (HTML, RSS, sitemap).
// Content only changes on deploy, so the ETag is the deploy version + path:
// If-None-Match answers 304 before any rendering, and the edge cache
// (platform.httpCache) holds one rendered copy per colo per deploy. Responses
// are recognized by content type after the handler runs, so assets, API JSON,
// redirects, and the 404 page pass through untouched.
// -----------------------------------------------------------------------------

import type { Middleware } from "remix/router";
import type { Platform } from "./platform.ts";

// Browsers revalidate every time (cheap 304s); the Cloudflare edge caches
// until the deploy purge. Applied to every version-keyed document response.
export const DOCUMENT_CACHE_CONTROL =
  "public, max-age=0, must-revalidate, s-maxage=31536000";

const CACHEABLE_TYPES = ["text/html", "application/rss+xml", "application/xml"];

// Strong-format ETag on purpose: Cloudflare's front line removes weak ETags
// from text/html responses it may transform, which silently killed the whole
// 304 flow on the staged worker (XML kept its weak tag, HTML lost it). With
// compression Cloudflare downgrades a strong ETag to weak on egress, which
// the weak comparison below still matches. Byte-identity is near-true per
// deploy (only hydration marker hashes vary), and the tag is never used for
// Range/If-Match, so the strong format is safe.
function documentEtag(versionId: string, pathname: string): string {
  return `"${versionId}:${pathname}"`;
}

/** Weak comparison over an If-None-Match header (list or `*`). */
function etagMatches(header: string | null, etag: string): boolean {
  if (!header) {
    return false;
  }
  if (header.trim() === "*") {
    return true;
  }
  const opaque = (tag: string) => tag.trim().replace(/^W\//, "");
  return header.split(",").some((tag) => opaque(tag) === opaque(etag));
}

function isCacheableDocument(response: Response): boolean {
  const type = response.headers.get("Content-Type") ?? "";
  return (
    response.status === 200 &&
    !response.headers.has("ETag") &&
    CACHEABLE_TYPES.some((cacheable) => type.startsWith(cacheable))
  );
}

export function httpCaching(platform: Platform): Middleware {
  return async (context, next) => {
    const { pathname } = context.url;

    // The analytics API manages its own short-TTL caching (app/analytics.ts).
    if (context.method !== "GET" || pathname.startsWith("/api/")) {
      return next();
    }

    const etag = documentEtag(platform.versionId, pathname);
    if (etagMatches(context.request.headers.get("If-None-Match"), etag)) {
      return new Response(null, {
        status: 304,
        headers: { ETag: etag, "Cache-Control": DOCUMENT_CACHE_CONTROL },
      });
    }

    // Query strings never change a document, so the cache keys on pathname
    // only — no cache-fill from ?utm_* variants.
    const cache = platform.httpCache;
    const cacheKey = cache
      ? new Request(new URL(pathname, context.url.origin))
      : null;
    if (cache && cacheKey) {
      const hit = await cache.match(cacheKey);
      if (hit) {
        return hit;
      }
    }

    const response = await next();
    if (!isCacheableDocument(response)) {
      return response;
    }

    const decorated = new Response(response.body, response);
    decorated.headers.set("ETag", etag);
    decorated.headers.set("Cache-Control", DOCUMENT_CACHE_CONTROL);

    if (cache && cacheKey) {
      platform.waitUntil(cache.put(cacheKey, decorated.clone()));
    }

    return decorated;
  };
}
