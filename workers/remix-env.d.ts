// Text-module imports bundled by wrangler for the Remix worker (see
// wrangler.remix.jsonc `rules`).

declare module "*.mdx" {
  const source: string;
  export default source;
}

declare module "*.md" {
  const source: string;
  export default source;
}

// The pieces of workerd's built-in module that this adapter uses. Declared
// here for the same reason remix-app.ts hand-rolls its D1 interfaces: the app
// project compiles with `types: ["node"]`, and the installed
// @cloudflare/workers-types carries no type for Workers Cache's purge API.
declare module "cloudflare:workers" {
  export abstract class WorkerEntrypoint<Env = unknown> {
    protected env: Env;
    protected ctx: { waitUntil(promise: Promise<unknown>): void };
  }

  export const cache: {
    purge(options: {
      tags?: string[];
      pathPrefixes?: string[];
      purgeEverything?: boolean;
    }): Promise<{
      success: boolean;
      errors?: { code: number; message: string }[];
    }>;
  };
}
