// -----------------------------------------------------------------------------
// Digest-keyed HTTP caching for rendered documents (HTML, RSS, sitemap).
// A document's ETag is the build-time digest of everything that page renders
// from (workers/cache-digests.generated.ts), so a deploy that edits one post
// leaves every other page's ETag alone and readers keep their cached copies.
// If-None-Match answers 304 before any rendering, and platform.httpCache holds
// one rendered copy per colo per digest. Responses are recognized by content
// type after the handler runs, so assets, API JSON, redirects, and the 404
// page pass through untouched.
//
// This sits behind Workers Cache (see workers/remix-app.ts): the edge layer
// absorbs repeat requests without invoking the router at all, and this layer
// catches what reaches the Worker anyway — the Node adapter, cache misses, and
// anything the edge declines to store.
// -----------------------------------------------------------------------------

import type { Middleware } from "remix/router";
import type { Platform } from "./platform.ts";

// Browsers keep a document fresh for a minute, then may render their cached
// copy while revalidating in the background (a cheap 304 against the ETag
// below) or while a transient error prevents revalidation.
//
// `s-maxage` is the shared-cache window and browsers ignore it, so the edge
// keeps a document for a week while a browser rechecks every minute. Whether
// Workers Cache reads Cloudflare-CDN-Cache-Control is undocumented; s-maxage
// is honored by any shared cache, so the TTL lands either way. A week rather
// than a year is deliberate: entries survive deploys, and a deploy purges
// what it changed (workers/cache-reconcile.ts) — the week is only a floor for
// anything that purge somehow misses.
export const DOCUMENT_CACHE_CONTROL =
  "public, max-age=60, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=86400";

export const DOCUMENT_CDN_CACHE_CONTROL =
  "public, max-age=604800, stale-while-revalidate=86400, stale-if-error=86400";

// The homepage can't be purged on its own: purges go by path prefix, and `/`
// prefixes every path. It changes only when a post's title, date or
// description does, so five minutes at the edge stands in for the purge.
const HOME_CACHE_CONTROL =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400";
const HOME_CDN_CACHE_CONTROL =
  "public, max-age=300, stale-while-revalidate=86400, stale-if-error=86400";

export function documentCacheHeaders(pathname: string): {
  "Cache-Control": string;
  "Cloudflare-CDN-Cache-Control": string;
} {
  return pathname === "/"
    ? { "Cache-Control": HOME_CACHE_CONTROL, "Cloudflare-CDN-Cache-Control": HOME_CDN_CACHE_CONTROL }
    : {
        "Cache-Control": DOCUMENT_CACHE_CONTROL,
        "Cloudflare-CDN-Cache-Control": DOCUMENT_CDN_CACHE_CONTROL,
      };
}


const CACHEABLE_TYPES = ["text/html", "application/rss+xml", "application/xml"];

// Strong-format ETag + origin gzip, working with the zone's
// respect_strong_etags cache rule. Cloudflare drops ETags (weak or strong)
// from any HTML *it* compresses; with the rule enabled it keeps one when the
// origin's encoding already matches the visitor's Accept-Encoding. So
// documents leave here gzip-encoded when the client and runtime allow (see
// maybeGzip) and the browser gets working 304 revalidation. Production
// returns the strong form, unchanged; etagMatches compares weakly either way.
// Both zone rules are scoped to the blog host: the cache rule, and a
// configuration rule turning off the HTML-rewriting features (Email
// Obfuscation, Automatic HTTPS Rewrites, Rocket Loader, Server Side Excludes)
// that are on elsewhere in the zone. They are tracked declaratively in a
// private repo, not here. If HTML ETags vanish again, check those two rules.
// The cache rule also stops Cloudflare compressing anything with a strong
// ETag, which is why _headers strips ETags from the immutable /assets/*.
//
// The digest replaces the deploy version here. Paths with no digest — none
// today, but a new route added without regenerating would be one — fall back
// to the version id, which is correct if coarse.
function documentEtag(platform: Platform, pathname: string): string {
  const digest = platform.digests.paths[pathname] ?? platform.versionId;
  return `"${digest}"`;
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
  // the body on egress (encodeBody "automatic").
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

    const etag = documentEtag(platform, pathname);
    if (etagMatches(context.request.headers.get("If-None-Match"), etag)) {
      return new Response(null, {
        status: 304,
        headers: { ETag: etag, ...documentCacheHeaders(pathname) },
      });
    }

    // Query strings never change a document, so the cache keys on pathname
    // only — no cache-fill from ?utm_* variants reaching this layer. The
    // digest rides along so an entry cannot outlive the content it rendered
    // from: a changed page gets a new key rather than needing eviction.
    const cache = platform.httpCache;
    const cacheKey = cache
      ? new Request(
          new URL(
            `${pathname}?v=${encodeURIComponent(etag.replaceAll('"', ""))}`,
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
    for (const [name, value] of Object.entries(documentCacheHeaders(pathname))) {
      decorated.headers.set(name, value);
    }
    // Set unconditionally, not only when this response is gzipped: an
    // identity copy stored without Vary could otherwise be handed to a client
    // that asked for gzip.
    decorated.headers.set("Vary", "Accept-Encoding");

    if (cache && cacheKey) {
      platform.waitUntil(cache.put(cacheKey, decorated.clone()));
    }

    return maybeGzip(context.request, decorated);
  };
}
