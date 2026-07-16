import { getActiveUsers, getViewsByPath, normalizePath } from "./ga4";

export interface Env {
  ASSETS: Fetcher;
  PAGE_VIEWS: KVNamespace;
  GA_SERVICE_ACCOUNT_KEY: string;
  GA_PROPERTY_ID: string;
  ADMIN_RESYNC_TOKEN: string;
}

const CACHE_TTL_SECONDS = 60;
// Backfill/resync default start — arbitrarily early, older than the blog.
const RESYNC_DEFAULT_SINCE = "2020-01-01";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/analytics/pageviews") {
      return handlePageviews(request, env, ctx, url);
    }
    if (url.pathname === "/api/analytics/resync") {
      return handleResync(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(syncViewsForDate(env, "yesterday", "yesterday"));
  },
};

async function syncViewsForDate(env: Env, startDate: string, endDate: string): Promise<void> {
  const deltas = await getViewsByPath(env.GA_SERVICE_ACCOUNT_KEY, env.GA_PROPERTY_ID, startDate, endDate);

  for (const [path, delta] of deltas) {
    const current = Number((await env.PAGE_VIEWS.get(path)) ?? "0");
    await env.PAGE_VIEWS.put(path, String(current + delta));
  }
}

async function handlePageviews(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL,
): Promise<Response> {
  const rawPath = url.searchParams.get("path");
  const title = url.searchParams.get("title");
  if (!rawPath || !rawPath.startsWith("/")) {
    return Response.json({ error: "missing or invalid 'path' query param" }, { status: 400 });
  }
  const path = normalizePath(rawPath);

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const [views, activeUsers] = await Promise.all([
      env.PAGE_VIEWS.get(path).then((v) => Number(v ?? "0")),
      title ? getActiveUsers(env.GA_SERVICE_ACCOUNT_KEY, env.GA_PROPERTY_ID, title) : Promise.resolve(0),
    ]);

    const response = Response.json(
      { path, views, activeUsers },
      { headers: { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` } },
    );

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    console.error("pageviews lookup failed", err);
    return Response.json({ error: "analytics unavailable" }, { status: 502 });
  }
}

// Sums GA4 views from `since` (default RESYNC_DEFAULT_SINCE) through 2 days
// ago and overwrites the KV counters — safe to call repeatedly, since it
// always recomputes full totals rather than adding deltas. The nightly cron
// takes over from "yesterday" onward once this has run once.
async function handleResync(request: Request, env: Env, url: URL): Promise<Response> {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${env.ADMIN_RESYNC_TOKEN}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const since = url.searchParams.get("since") ?? RESYNC_DEFAULT_SINCE;

  try {
    const totals = await getViewsByPath(env.GA_SERVICE_ACCOUNT_KEY, env.GA_PROPERTY_ID, since, "2daysAgo");

    for (const [path, views] of totals) {
      await env.PAGE_VIEWS.put(path, String(views));
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
