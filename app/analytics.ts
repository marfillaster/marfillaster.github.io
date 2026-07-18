// -----------------------------------------------------------------------------
// Analytics API (port of the production workers/app.ts handlers) as app-layer
// route handlers over the Platform port. GA4 access goes through GaClient so
// the Node adapter can run without credentials (stub), and the HTTP cache is
// optional (workerd: caches.default; Node: null).
// -----------------------------------------------------------------------------

// ga4.ts is runtime-agnostic (fetch + Web Crypto only) and shared with the
// production worker; it stays in workers/ so that file remains untouched
// until cutover — one copy, two importers.
import { getActiveUsers, getViewsByPath, normalizePath } from "../workers/ga4.ts";
import type { Platform } from "./platform.ts";

const CACHE_TTL_SECONDS = 60;
// Backfill/resync default start — arbitrarily early, older than the blog.
const RESYNC_DEFAULT_SINCE = "2020-01-01";

export interface GaClient {
  getViewsByPath(startDate: string, endDate: string): Promise<Map<string, number>>;
  getActiveUsers(pageTitle: string): Promise<number>;
}

/**
 * Real GA4 client when a service-account key is configured; otherwise a stub
 * with fixed numbers so dev servers show plausible stats without credentials.
 */
export function createGaClient(platform: Platform): GaClient {
  const { gaServiceAccountKey, gaPropertyId } = platform.secrets;

  if (gaServiceAccountKey && gaPropertyId) {
    return {
      getViewsByPath: (start, end) =>
        getViewsByPath(gaServiceAccountKey, gaPropertyId, start, end),
      getActiveUsers: (title) =>
        getActiveUsers(gaServiceAccountKey, gaPropertyId, title),
    };
  }

  return {
    getViewsByPath: async () => new Map(),
    getActiveUsers: async () => 2,
  };
}

export async function handlePageviews(
  request: Request,
  platform: Platform,
  ga: GaClient,
): Promise<Response> {
  const url = new URL(request.url);
  const rawPath = url.searchParams.get("path");
  const title = url.searchParams.get("title");
  if (!rawPath || !rawPath.startsWith("/")) {
    return Response.json(
      { error: "missing or invalid 'path' query param" },
      { status: 400 },
    );
  }
  const path = normalizePath(rawPath);

  const cache = platform.httpCache;
  const cacheKey = cache ? new Request(url.toString(), request) : null;
  if (cache && cacheKey) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const [views, activeUsers] = await Promise.all([
      platform.views.get(path),
      title ? ga.getActiveUsers(title) : Promise.resolve(0),
    ]);

    const response = Response.json(
      { path, views, activeUsers },
      { headers: { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` } },
    );

    if (cache && cacheKey) {
      await cache.put(cacheKey, response.clone());
    }
    return response;
  } catch (err) {
    console.error("pageviews lookup failed", err);
    return Response.json({ error: "analytics unavailable" }, { status: 502 });
  }
}

// Sums GA4 views from `since` (default RESYNC_DEFAULT_SINCE) through 2 days
// ago and overwrites the counters — safe to call repeatedly, since it always
// recomputes full totals rather than adding deltas. The nightly cron takes
// over from "yesterday" onward once this has run once.
export async function handleResync(
  request: Request,
  platform: Platform,
  ga: GaClient,
): Promise<Response> {
  const auth = request.headers.get("Authorization");
  const token = platform.secrets.adminResyncToken;
  if (!token || auth !== `Bearer ${token}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const since =
    new URL(request.url).searchParams.get("since") ?? RESYNC_DEFAULT_SINCE;

  try {
    const totals = await ga.getViewsByPath(since, "2daysAgo");

    for (const [path, views] of totals) {
      await platform.views.put(path, views);
    }

    return Response.json({
      pagesUpdated: totals.size,
      totalViews: [...totals.values()].reduce((a, b) => a + b, 0),
      since,
      through: "2daysAgo",
    });
  } catch (err) {
    console.error("resync failed", err);
    return Response.json({ error: "resync failed" }, { status: 502 });
  }
}

/** Daily cron body: add yesterday's per-page deltas onto the stored counters. */
export async function syncViewsForDate(
  platform: Platform,
  ga: GaClient,
  startDate: string,
  endDate: string,
): Promise<void> {
  const deltas = await ga.getViewsByPath(startDate, endDate);

  for (const [path, delta] of deltas) {
    const current = await platform.views.get(path);
    await platform.views.put(path, current + delta);
  }
}
