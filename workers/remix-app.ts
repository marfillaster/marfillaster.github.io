// -----------------------------------------------------------------------------
// workerd adapter for the Remix app (Phase 2: dev-only via
// `pnpm dev:remix-workerd`; never deployed until cutover). The only file that
// knows about Cloudflare bindings. Analytics API + cron stay in workers/app.ts
// (the production worker) until Phase 3 merges them.
// -----------------------------------------------------------------------------

import { createApp } from "../app/app.tsx";
import type { Platform } from "../app/platform.ts";
import { CONTENT } from "./remix-content.generated.ts";

interface RemixEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CF_VERSION_METADATA?: { id: string };
}

let router: ReturnType<typeof createApp> | null = null;

function getRouter(env: RemixEnv) {
  if (router) {
    return router;
  }

  const platform: Platform = {
    content: () => new Map(CONTENT),
    versionId: env.CF_VERSION_METADATA?.id ?? "workerd-dev",
    assets: (request) => env.ASSETS.fetch(request),
  };

  router = createApp(platform);
  return router;
}

export default {
  fetch(request: Request, env: RemixEnv): Promise<Response> {
    return getRouter(env).fetch(request);
  },
};
