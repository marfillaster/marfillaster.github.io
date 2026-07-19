// -----------------------------------------------------------------------------
// workerd adapter for the Remix app (dev-only via `pnpm dev:remix-workerd`;
// never deployed until cutover). The only file that knows about Cloudflare
// bindings. Phase 3 merged the analytics API + cron here; the production
// worker (workers/app.ts) keeps serving them live until Phase 5.
// -----------------------------------------------------------------------------

import { createApp } from "../app/app.tsx";
import { createGaClient, syncViewsForDate } from "../app/analytics.ts";
import type { CommentRow, CommentsStore, Platform } from "../app/platform.ts";
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
