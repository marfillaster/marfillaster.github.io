// -----------------------------------------------------------------------------
// workerd adapter for the Remix app (dev-only via `pnpm dev:remix-workerd`;
// never deployed until cutover). The only file that knows about Cloudflare
// bindings. Phase 3 merged the analytics API + cron here; the production
// worker (workers/app.ts) keeps serving them live until Phase 5.
// -----------------------------------------------------------------------------

import { createApp } from "../app/app.tsx";
import { createGaClient, syncViewsForDate } from "../app/analytics.ts";
import type { Platform } from "../app/platform.ts";
import { CONTENT } from "./remix-content.generated.ts";

interface RemixEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CF_VERSION_METADATA?: { id: string };
  PAGE_VIEWS: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
  GA_PROPERTY_ID?: string;
  GA_SERVICE_ACCOUNT_KEY?: string;
  ADMIN_RESYNC_TOKEN?: string;
}

interface SchedulerContext {
  waitUntil(promise: Promise<unknown>): void;
}

let cached: { router: ReturnType<typeof createApp>; platform: Platform } | null =
  null;

// The Platform is built once per isolate but waitUntil needs the current
// request's ExecutionContext; each fetch stamps it here before dispatching.
// Under concurrency a background task may land on a newer request's context,
// which only extends that request's lifetime — harmless.
let currentCtx: SchedulerContext | null = null;

function getApp(env: RemixEnv) {
  if (cached) {
    return cached;
  }

  const platform: Platform = {
    content: () => new Map(CONTENT),
    versionId: env.CF_VERSION_METADATA?.id ?? "workerd-dev",
    assets: (request) => env.ASSETS.fetch(request),
    views: {
      async get(path) {
        return Number((await env.PAGE_VIEWS.get(path)) ?? "0");
      },
      async put(path, views) {
        await env.PAGE_VIEWS.put(path, String(views));
      },
    },
    secrets: {
      gaServiceAccountKey: env.GA_SERVICE_ACCOUNT_KEY,
      gaPropertyId: env.GA_PROPERTY_ID,
      adminResyncToken: env.ADMIN_RESYNC_TOKEN,
    },
    // workerd's CacheStorage carries a non-standard `default` cache; the DOM
    // lib this project compiles against doesn't know it.
    httpCache: (caches as unknown as { default?: Cache }).default ?? null,
    waitUntil(promise) {
      try {
        currentCtx?.waitUntil(promise);
      } catch {
        promise.catch(() => {});
      }
    },
    // workerd compresses to match Content-Encoding on egress (encodeBody
    // "automatic"), letting the app emit origin-gzip documents.
    autoEncodesBody: true,
  };

  cached = { router: createApp(platform), platform };
  return cached;
}

export default {
  fetch(request: Request, env: RemixEnv, ctx: SchedulerContext): Promise<Response> {
    currentCtx = ctx;
    return getApp(env).router.fetch(request);
  },

  scheduled(_event: unknown, env: RemixEnv, ctx: SchedulerContext): void {
    const { platform } = getApp(env);
    ctx.waitUntil(
      syncViewsForDate(platform, createGaClient(platform), "yesterday", "yesterday"),
    );
  },
};
