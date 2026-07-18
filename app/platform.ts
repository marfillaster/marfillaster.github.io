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
   * or timestamp on Node. Reserved for ETag work in a later phase.
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

  /**
   * Runtime secrets. Bindings/vars on workerd; process.env on Node. All
   * optional — handlers degrade (stub GA, 401 resync) when absent.
   */
  secrets: Secrets;

  /**
   * Short-TTL HTTP response cache for the analytics API. `caches.default` on
   * workerd; null on Node, where freshness is the point.
   */
  httpCache: Cache | null;
}

export interface ViewsStore {
  get(path: string): Promise<number>;
  put(path: string, views: number): Promise<void>;
}

export interface Secrets {
  gaServiceAccountKey?: string;
  gaPropertyId?: string;
  adminResyncToken?: string;
}
