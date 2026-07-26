// -----------------------------------------------------------------------------
// workerd adapter for the Remix app. The only file that knows about Cloudflare
// bindings.
//
// Two cached entrypoints, one behind the other. The default export normalizes
// the URL — query strings never change a response here except under /api/ and
// /comments/, so it strips them everywhere else, and every ?utm_* variant of a
// page plus every sprayed ?x=1..n on a path that does not exist collapses onto
// one entry. It then hands off to `Site`, which owns the router, the content
// map and the renderer.
//
// Both layers cache, and they do different jobs:
//
//   - The gateway's layer answers a request whose URL is already canonical —
//     the common case — without running any code at all, so nothing is billed
//     but the request itself.
//   - `Site`'s layer is what the normalization pays off in: every URL the
//     gateway rewrote lands on one shared entry there, so a spray costs one
//     render rather than one per variant.
//
// See wrangler.jsonc for the matching `exports` config.
// -----------------------------------------------------------------------------

import { WorkerEntrypoint, cache } from "cloudflare:workers";
import { createApp } from "../app/app.tsx";
import { createGaClient, syncViewsForDate } from "../app/analytics.ts";
import { canonicalUrl, isPurgeManaged } from "../app/cache-key.ts";
import { ADMIN_PURGE_PATH } from "../app/cache-purge.ts";
import type {
  CommentRow,
  CommentsStore,
  Platform,
  PurgeOptions,
  PurgeResult,
} from "../app/platform.ts";
import { ASSET_DIGESTS, BUILD_DIGEST, PATH_DIGESTS } from "./cache-digests.generated.ts";
import { CONTENT } from "./remix-content.generated.ts";

interface RemixEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CF_VERSION_METADATA?: { id: string };
  PAGE_VIEWS: {
    get(key: string): Promise<string | null>;
    put(
      key: string,
      value: string,
      options?: { expirationTtl?: number },
    ): Promise<void>;
  };
  COMMENTS_DB?: D1Database;
  /** Workers rate-limit binding; see `ratelimits` in wrangler.jsonc. */
  NOT_FOUND_LIMITER?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
  GA_PROPERTY_ID?: string;
  GA_SERVICE_ACCOUNT_KEY?: string;
  ADMIN_RESYNC_TOKEN?: string;
  COMMENTS_ENABLED?: string;
  COMMENTS_LOCAL_DEV?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  COMMENT_IP_SALT?: string;
}

interface D1Result<row> {
  results: row[];
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<row>(): Promise<D1Result<row>>;
  first<row>(): Promise<row | null>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

interface D1CommentRow {
  id: string;
  post_slug: string;
  parent_id: string | null;
  author: string;
  body_md: string;
  body_html: string;
  ip_hash: string;
  created_at: string;
  hidden: number;
}

function mapComment(row: D1CommentRow): CommentRow {
  return {
    id: row.id,
    postSlug: row.post_slug,
    parentId: row.parent_id,
    author: row.author,
    bodyMd: row.body_md,
    bodyHtml: row.body_html,
    ipHash: row.ip_hash,
    createdAt: row.created_at,
    hidden: row.hidden === 1,
  };
}

function createCommentsStore(db: D1Database | undefined, enabled: boolean): CommentsStore {
  const select = `
    SELECT id, post_slug, parent_id, author, body_md, body_html,
           ip_hash, created_at, hidden
    FROM comments`;
  if (!db || !enabled) {
    return {
      enabled: false,
      async listThread() { return []; },
      async insert() { throw new Error("Comments are not enabled"); },
      async setHidden() { throw new Error("Comments are not enabled"); },
      async get() { return null; },
    };
  }

  return {
    enabled: true,
    async listThread(postSlug) {
      const result = await db
        .prepare(`${select} WHERE post_slug = ? ORDER BY created_at ASC`)
        .bind(postSlug)
        .all<D1CommentRow>();
      return result.results.map(mapComment);
    },
    async insert(row) {
      await db.prepare(
        `INSERT INTO comments
          (id, post_slug, parent_id, author, body_md, body_html, ip_hash, created_at, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        row.id,
        row.postSlug,
        row.parentId,
        row.author,
        row.bodyMd,
        row.bodyHtml,
        row.ipHash,
        row.createdAt,
        row.hidden ? 1 : 0,
      ).run();
    },
    async setHidden(id, hidden) {
      await db.prepare("UPDATE comments SET hidden = ? WHERE id = ?")
        .bind(hidden ? 1 : 0, id)
        .run();
    },
    async get(id) {
      const row = await db.prepare(`${select} WHERE id = ?`)
        .bind(id)
        .first<D1CommentRow>();
      return row ? mapComment(row) : null;
    },
  };
}

interface SchedulerContext {
  waitUntil(promise: Promise<unknown>): void;
}

/**
 * Purges the calling entrypoint's cache. Local dev has no Workers Cache and no
 * cache.purge to call; nothing is cached in front of it either, so reporting
 * success is accurate there rather than merely convenient.
 */
function purgeEdge(options: PurgeOptions): Promise<PurgeResult> {
  const purge = (cache as { purge?: (options: PurgeOptions) => Promise<PurgeResult> })
    .purge;
  return typeof purge === "function"
    ? purge.call(cache, options)
    : Promise.resolve({ success: true });
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

  const localComments = env.COMMENTS_LOCAL_DEV === "true";
  const commentsReady =
    env.COMMENTS_ENABLED === "true" &&
    Boolean(env.COMMENTS_DB) &&
    (localComments ||
      Boolean(
        env.TURNSTILE_SITE_KEY &&
          env.TURNSTILE_SECRET_KEY &&
          env.COMMENT_IP_SALT,
      ));
  const platform: Platform = {
    content: () => new Map(CONTENT),
    versionId: env.CF_VERSION_METADATA?.id ?? "workerd-dev",
    digests: {
      build: BUILD_DIGEST,
      paths: PATH_DIGESTS,
      assets: ASSET_DIGESTS,
    },
    assets: (request) => env.ASSETS.fetch(request),
    views: {
      async get(path) {
        return Number((await env.PAGE_VIEWS.get(path)) ?? "0");
      },
      async put(path, views) {
        await env.PAGE_VIEWS.put(path, String(views));
      },
    },
    comments: createCommentsStore(
      env.COMMENTS_DB,
      commentsReady,
    ),
    challenge: {
      async verify(token, ip) {
        if (localComments) return true;
        if (!token || !env.TURNSTILE_SECRET_KEY) return false;
        const response = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              secret: env.TURNSTILE_SECRET_KEY,
              response: token,
              remoteip: ip,
            }),
          },
        );
        if (!response.ok) return false;
        return ((await response.json()) as { success?: boolean }).success === true;
      },
    },
    rateLimit: {
      async hit(key) {
        const count = Number((await env.PAGE_VIEWS.get(key)) ?? "0") + 1;
        await env.PAGE_VIEWS.put(key, String(count), { expirationTtl: 600 });
        return count > 5;
      },
    },
    // Native limiter, so guarding a flood costs no KV writes.
    floodLimit: {
      async hit(key) {
        if (!env.NOT_FOUND_LIMITER) return false;
        const { success } = await env.NOT_FOUND_LIMITER.limit({ key });
        return !success;
      },
    },
    moderation: {
      authorized(request) {
        return localComments || Boolean(request.headers.get("Cf-Access-Jwt-Assertion"));
      },
    },
    turnstileSiteKey: localComments ? undefined : env.TURNSTILE_SITE_KEY,
    secrets: {
      gaServiceAccountKey: env.GA_SERVICE_ACCOUNT_KEY,
      gaPropertyId: env.GA_PROPERTY_ID,
      adminResyncToken: env.ADMIN_RESYNC_TOKEN,
      turnstileSecretKey: env.TURNSTILE_SECRET_KEY,
      commentIpSalt: env.COMMENT_IP_SALT,
    },
    // workerd's CacheStorage carries a non-standard `default` cache; the DOM
    // lib this project compiles against doesn't know it.
    httpCache: (caches as unknown as { default?: Cache }).default ?? null,
    // Network-wide, unlike httpCache.delete, which only reaches this colo.
    // Clears `Site`'s layer only — purges are scoped to the entrypoint that
    // issues them, which is why the gateway clears its own (see below).
    purgeCache: purgeEdge,
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

/**
 * The cached entrypoint: everything the application does happens here, behind
 * the edge cache configured for it in wrangler.jsonc.
 */
export class Site extends WorkerEntrypoint<RemixEnv> {
  fetch(request: Request): Promise<Response> {
    currentCtx = this.ctx;
    return getApp(this.env).router.fetch(request);
  }
}

interface GatewayContext extends SchedulerContext {
  exports: { Site: { fetch(request: Request): Promise<Response> } };
}

export default {
  // Deliberately thin, and deliberately not calling getApp: this runs on every
  // miss of *this* entrypoint's cache, so building the router here would give
  // back what the cache saves.
  async fetch(
    request: Request,
    _env: RemixEnv,
    ctx: GatewayContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const canonical = canonicalUrl(url);
    const response = await ctx.exports.Site.fetch(
      canonical ? new Request(canonical, request) : request,
    );

    // `Site` issued a purge that could not reach this layer. The copies here
    // are duplicates of documents `Site` can rebuild, so dropping all of them
    // costs a cold cache and nothing else.
    if (request.method === "POST" && url.pathname === ADMIN_PURGE_PATH && response.ok) {
      ctx.waitUntil(purgeEdge({ purgeEverything: true }));
    }

    if (!isPurgeManaged(url.pathname)) {
      return response;
    }

    // Highest precedence of the three cache headers, and Cloudflare strips it
    // before the client sees it. Set here rather than in the handler so only
    // this layer opts out: `Site` stored its copy before the response got here,
    // and that one is still purgeable.
    const uncached = new Response(response.body, response);
    uncached.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
    return uncached;
  },

  scheduled(_event: unknown, env: RemixEnv, ctx: SchedulerContext): void {
    const { platform } = getApp(env);
    ctx.waitUntil(
      syncViewsForDate(platform, createGaClient(platform), "yesterday", "yesterday"),
    );
  },
};
