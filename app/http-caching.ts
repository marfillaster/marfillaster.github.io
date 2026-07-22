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

// Browsers keep a document fresh for a minute, then may render their cached
// copy while revalidating in the background (a cheap 304 against the ETag
// below) or while a transient error prevents revalidation.
export const DOCUMENT_CACHE_CONTROL =
  "public, max-age=60, stale-while-revalidate=86400, stale-if-error=86400";

// Cloudflare gets a separate one-year freshness window so s-maxage does not
// disable stale-if-error. Deploys selectively purge mutable URLs before then.
export const DOCUMENT_CDN_CACHE_CONTROL =
  "public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400";

const CACHEABLE_TYPES = ["text/html", "application/rss+xml", "application/xml"];

// Strong-format ETag + origin gzip, working with the zone's
// respect_strong_etags cache rule. Cloudflare drops ETags (weak or strong)
// from any HTML *it* compresses; with the rule enabled it preserves a strong
// ETag when the origin's encoding already matches the visitor's
// Accept-Encoding. So documents leave here gzip-encoded when the client and
// runtime allow (see maybeGzip), Cloudflare passes them through untouched,
// and the browser gets working 304 revalidation. If HTML ETags vanish again:
// check the cache rule, then the HTML-rewriting zone features (Email
// Obfuscation, Automatic HTTPS Rewrites, Rocket Loader, Speed Brain — all
// deliberately off).
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
  // Documents are stored identity-encoded in the edge cache and compressed
  // per request on the way out: setting Content-Encoding makes workerd gzip
  // the body on egress (encodeBody "automatic"). Vary: Accept-Encoding keeps
  // downstream caches honest about the negotiation.
  const maybeGzip = (request: Request, response: Response): Response => {
    if (
      !platform.autoEncodesBody ||
      response.headers.has("Content-Encoding") ||
      !/\bgzip\b/.test(request.headers.get("Accept-Encoding") ?? "")
    ) {
      return response;
    }
    const encoded = new Response(response.body, response);
    encoded.headers.set("Content-Encoding", "gzip");
    encoded.headers.set("Vary", "Accept-Encoding");
    return encoded;
  };

  return async (context, next) => {
    const { pathname } = context.url;

    // Analytics and comments manage their own live-data caching.
    if (
      context.method !== "GET" ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/comments/")
    ) {
      return next();
    }

    const etag = documentEtag(platform.versionId, pathname);
    if (etagMatches(context.request.headers.get("If-None-Match"), etag)) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": DOCUMENT_CACHE_CONTROL,
          "Cloudflare-CDN-Cache-Control": DOCUMENT_CDN_CACHE_CONTROL,
        },
      });
    }

    // Query strings never change a document, so the cache keys on pathname
    // only — no cache-fill from ?utm_* variants. The versionId rides along so
    // caches.default can never serve a previous deploy's HTML (the zone purge
    // in cf:deploy clears the outer edge cache; this covers the inner layer
    // even if that purge fails).
    const cache = platform.httpCache;
    const cacheKey = cache
      ? new Request(
          new URL(
            `${pathname}?rmxv=${encodeURIComponent(platform.versionId)}`,
            context.url.origin,
          ),
        )
      : null;
    if (cache && cacheKey) {
      const hit = await cache.match(cacheKey);
      if (hit) {
        return maybeGzip(context.request, hit);
      }
    }

    const response = await next();
    if (!isCacheableDocument(response)) {
      return response;
    }

    const decorated = new Response(response.body, response);
    decorated.headers.set("ETag", etag);
    decorated.headers.set("Cache-Control", DOCUMENT_CACHE_CONTROL);
    decorated.headers.set(
      "Cloudflare-CDN-Cache-Control",
      DOCUMENT_CDN_CACHE_CONTROL,
    );

    if (cache && cacheKey) {
      platform.waitUntil(cache.put(cacheKey, decorated.clone()));
    }

    return maybeGzip(context.request, decorated);
  };
}
