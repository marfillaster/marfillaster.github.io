// -----------------------------------------------------------------------------
// Deploy-time invalidation for the cross-version Workers Cache.
//
// Both entrypoints set `cross_version_cache` (wrangler.jsonc), so cached
// documents survive a deploy and a deploy has to retire what it changed. The
// build records a digest per document path (workers/cache-digests.generated.ts);
// this module compares them with the set the last reconcile stored in KV and
// purges the difference by path prefix, from both entrypoints, since a purge
// only reaches the entrypoint that issues it. Prefix purges work across
// versions; tag purges do not (app/cache-key.ts).
//
//   - A code, style, dependency or CACHE_EPOCH change moves BUILD_DIGEST, and
//     with it every page: purge everything. A cached page from the previous
//     build may point at fingerprinted scripts and CSS this deploy no longer
//     serves, so this one is never optional.
//   - A content change moves only the pages that render it: purge those, plus
//     any path that appeared (a cached 404) or disappeared.
//   - `/` is never purged by prefix, which would be the whole site; it has a
//     short edge TTL instead (app/http-caching.ts).
//
// Nothing depends on the post-deploy call succeeding. The gateway runs this
// before the first request each isolate serves, the hourly cron runs it, and
// GET /api/cache/reconcile runs it on demand; the stored state only advances
// after both purges succeed, so a failure is retried by whichever comes next.
// Each request after the first in an isolate pays nothing.
// -----------------------------------------------------------------------------

import type { PurgeOptions, PurgeResult } from "../app/platform.ts";
import { BUILD_DIGEST, PATH_DIGESTS } from "./cache-digests.generated.ts";

export const RECONCILE_PATH = "/api/cache/reconcile";

const STATE_KEY = "cache:reconciled";

/** Cloudflare accepts at most 30 prefixes in one purge. */
const MAX_PREFIXES = 30;

/** Purged by TTL rather than prefix: a prefix of `/` matches every path. */
const TTL_ONLY_PATHS = new Set(["/"]);

/**
 * In-flight requests on the previous version can store its render after the
 * first purge lands. A second, identical purge this long after the first
 * clears anything stored in that window.
 */
const SETTLE_MS = 20_000;

export interface Digests {
  build: string;
  paths: Readonly<Record<string, string>>;
}

interface StoredState extends Digests {
  versionId: string;
  reconciledAt: string;
}

export interface ReconcileEnv {
  PAGE_VIEWS: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
  CF_VERSION_METADATA?: { id: string };
}

export interface ReconcileDeps {
  env: ReconcileEnv;
  /** Purges in the gateway's own layer. */
  purgeGateway(options: PurgeOptions): Promise<PurgeResult>;
  /** Purges in `Site`'s layer (an RPC into that entrypoint). */
  purgeSite(options: PurgeOptions): Promise<PurgeResult>;
  waitUntil(promise: Promise<unknown>): void;
}

export interface ReconcileResult {
  action: "none" | "purged";
  versionId: string;
  build: string;
  purge?: { everything: true } | { pathPrefixes: string[] };
}

/** What to purge going from `stored` to `current`; null when nothing changed. */
export function planPurge(stored: Digests | null, current: Digests): PurgeOptions | null {
  if (!stored || stored.build !== current.build) {
    return { purgeEverything: true };
  }

  const changed = new Set<string>();
  for (const [path, digest] of Object.entries(current.paths)) {
    if (stored.paths[path] !== digest) changed.add(path);
  }
  for (const path of Object.keys(stored.paths)) {
    if (!(path in current.paths)) changed.add(path);
  }

  // Without the trailing slash, so `/post` (its redirect, or a cached 404
  // from before it existed) goes with `/post/`. Variants under a post share
  // its prefix; purging them too costs a re-render, nothing more.
  const prefixes = [...changed]
    .filter((path) => !TTL_ONLY_PATHS.has(path))
    .map((path) => path.replace(/\/$/, ""))
    .sort();
  const minimal = prefixes.filter(
    (prefix, i) => !prefixes.some((other, j) => j !== i && prefix !== other && prefix.startsWith(other)),
  );

  if (minimal.length === 0) return null;
  if (minimal.length > MAX_PREFIXES) return { purgeEverything: true };
  return { pathPrefixes: [...new Set(minimal)] };
}

const CURRENT: Digests = { build: BUILD_DIGEST, paths: PATH_DIGESTS };

async function purgeBoth(deps: ReconcileDeps, options: PurgeOptions): Promise<void> {
  const results = await Promise.all([deps.purgeGateway(options), deps.purgeSite(options)]);
  const failed = results.find((result) => !result.success);
  if (failed) {
    throw new Error(`cache purge failed: ${JSON.stringify(failed.errors ?? [])}`);
  }
}

export async function reconcileCache(deps: ReconcileDeps): Promise<ReconcileResult> {
  const versionId = deps.env.CF_VERSION_METADATA?.id ?? "unknown";
  const raw = await deps.env.PAGE_VIEWS.get(STATE_KEY);
  const stored = raw ? (JSON.parse(raw) as StoredState) : null;
  const plan = planPurge(stored, CURRENT);
  const result: ReconcileResult = { action: "none", versionId, build: CURRENT.build };

  if (plan) {
    await purgeBoth(deps, plan);
    deps.waitUntil(
      new Promise((resolve) => setTimeout(resolve, SETTLE_MS))
        .then(() => purgeBoth(deps, plan))
        .catch((error) => console.error("settle purge failed", error)),
    );
    result.action = "purged";
    result.purge = plan.purgeEverything
      ? { everything: true }
      : { pathPrefixes: plan.pathPrefixes ?? [] };
  }

  if (plan || stored?.versionId !== versionId) {
    const state: StoredState = {
      ...CURRENT,
      versionId,
      reconciledAt: new Date().toISOString(),
    };
    await deps.env.PAGE_VIEWS.put(STATE_KEY, JSON.stringify(state));
  }
  return result;
}
