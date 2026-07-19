// -----------------------------------------------------------------------------
// The Platform port: everything runtime-specific the application needs,
// implemented by thin adapters (server/node.ts for Node, workers/remix-app.ts
// for workerd). The app layer imports nothing but Web APIs and this interface.
// -----------------------------------------------------------------------------

export interface Platform {
  /**
   * Post source files keyed by content-relative filename (e.g.
   * "home-network-cgnat.mdx") — src/content on disk for the Node adapter,
   * bundled text modules on workerd.
   */
  content(): Map<string, string>;

  /**
   * Deploy/version identifier. `CF_VERSION_METADATA.id` on workerd; a git SHA
   * or timestamp on Node. Keys the document ETags in app/http-caching.ts.
   */
  versionId: string;

  /**
   * Serve a static asset for this request, or null when the platform has no
   * asset at that path. Workers Assets on workerd; disk reads on Node.
   */
  assets(request: Request): Promise<Response | null>;

  /**
   * Page-view counters keyed by normalized path. KV on workerd; an in-memory
   * map (seeded with plausible numbers) on the Node dev adapter.
   */
  views: ViewsStore;

  /** Threaded-comment persistence (D1 on workerd; node:sqlite in dev). */
  comments: CommentsStore;

  /** Cloudflare Turnstile verification; the Node adapter accepts every token. */
  challenge: ChallengeVerifier;

  /** Returns true once a write key has exceeded its configured allowance. */
  rateLimit: RateLimiter;

  /** Cloudflare Access in production; unconditional in local Node dev. */
  moderation: ModerationGate;

  /** Public Turnstile widget key. Undefined in the auto-pass Node adapter. */
  turnstileSiteKey?: string;

  /**
   * Runtime secrets. Bindings/vars on workerd; process.env on Node. All
   * optional — handlers degrade (stub GA, 401 resync) when absent.
   */
  secrets: Secrets;

  /**
   * HTTP response cache: short-TTL entries for the analytics API and
   * version-keyed rendered documents (app/http-caching.ts). `caches.default`
   * on workerd; null on Node, where freshness is the point.
   */
  httpCache: Cache | null;

  /**
   * Extend the request lifetime past the response for background work such as
   * edge-cache writes. `ctx.waitUntil` on workerd; fire-and-forget on Node.
   */
  waitUntil(promise: Promise<unknown>): void;

  /**
   * True when the runtime compresses response bodies to match a
   * Content-Encoding header on egress (workerd's encodeBody "automatic").
   * Lets app/http-caching.ts emit origin-gzip documents so Cloudflare
   * passes them through untransformed, preserving the strong ETag. False on
   * Node, which serves bodies as-is.
   */
  autoEncodesBody: boolean;
}

export interface ViewsStore {
  get(path: string): Promise<number>;
  put(path: string, views: number): Promise<void>;
}

export interface Secrets {
  gaServiceAccountKey?: string;
  gaPropertyId?: string;
  adminResyncToken?: string;
  turnstileSecretKey?: string;
  commentIpSalt?: string;
}

export interface CommentRow {
  id: string;
  postSlug: string;
  parentId: string | null;
  author: string;
  bodyMd: string;
  bodyHtml: string;
  ipHash: string;
  createdAt: string;
  hidden: boolean;
}

export interface CommentsStore {
  /** False keeps the feature dormant without changing post HTML behavior. */
  enabled: boolean;
  listThread(postSlug: string): Promise<CommentRow[]>;
  insert(row: CommentRow): Promise<void>;
  setHidden(id: string, hidden: boolean): Promise<void>;
  get(id: string): Promise<CommentRow | null>;
}

export interface ChallengeVerifier {
  verify(token: string, ip: string): Promise<boolean>;
}

export interface RateLimiter {
  hit(key: string): Promise<boolean>;
}

export interface ModerationGate {
  authorized(request: Request): boolean;
}
