// An in-memory Platform for the verification scripts (verify-comments.mjs,
// verify-caching.mjs). Shared rather than duplicated so that adding to the
// Platform port means updating one stub, not hunting for every copy.

/**
 * @param {object} [options]
 * @param {boolean} [options.limited]    rate limiter reports the key exhausted
 * @param {boolean} [options.challenge]  Turnstile verdict
 * @param {boolean} [options.moderator]  Access gate verdict
 * @param {boolean} [options.cache]      provide a counting httpCache stub
 * @param {Record<string, string>} [options.pathDigests]
 * @param {Record<string, string>} [options.assetDigests]
 * @param {string} [options.versionId]
 */
export function memoryPlatform({
  limited = false,
  challenge = true,
  moderator = true,
  cache = false,
  content = new Map(),
  pathDigests = {},
  assetDigests = {},
  adminResyncToken,
  versionId = "test",
} = {}) {
  const rows = [];
  const purges = [];
  const state = new Map();
  let verifications = 0;
  let cacheCalls = 0;
  return {
    rows,
    /** Every purgeCache call, in order — the assertion surface for tags. */
    purges,
    state,
    get verifications() { return verifications; },
    get cacheCalls() { return cacheCalls; },
    platform: {
      content: () => new Map(content),
      versionId,
      digests: { build: "test-build", paths: pathDigests, assets: assetDigests },
      assets: async () => null,
      views: { get: async () => 0, put: async () => {} },
      comments: {
        enabled: true,
        listThread: async (slug) => rows.filter((item) => item.postSlug === slug),
        insert: async (item) => rows.push(item),
        setHidden: async (id, hidden) => {
          const item = rows.find((candidate) => candidate.id === id);
          if (item) item.hidden = hidden;
        },
        get: async (id) => rows.find((item) => item.id === id) ?? null,
      },
      challenge: {
        verify: async () => {
          verifications += 1;
          return challenge;
        },
      },
      rateLimit: { hit: async () => limited },
      moderation: { authorized: () => moderator },
      secrets: { commentIpSalt: "test-salt", adminResyncToken },
      httpCache: cache
        ? {
            match: async () => { cacheCalls += 1; return undefined; },
            put: async () => { cacheCalls += 1; },
            delete: async () => { cacheCalls += 1; return true; },
          }
        : null,
      purgeCache: async (options) => {
        purges.push(options);
        return { success: true };
      },
      cacheState: {
        get: async (key) => state.get(key) ?? null,
        put: async (key, value) => void state.set(key, value),
      },
      waitUntil: (promise) => void promise,
      autoEncodesBody: false,
    },
  };
}
