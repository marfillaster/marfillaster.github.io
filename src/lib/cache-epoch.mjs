// -----------------------------------------------------------------------------
// The global cache epoch. Folded into every digest in
// app/cache-digests.generated.ts, so bumping it invalidates everything at once:
// new document ETags (browsers refetch), new inner cache keys, and — because
// every path digest moves — a post-deploy reconcile that purges every edge
// entry. That makes a one-character change here the nuclear clear on deploy.
//
// Bump it when something outside the hashed inputs changes the rendered output
// (a dependency upgrade that alters markdown rendering, say), or when a cache
// needs clearing for reasons the digests cannot see.
//
// Plain .mjs so both the plain-node build scripts and the TS app layer can
// import it — the same arrangement as src/lib/post-meta.mjs.
// -----------------------------------------------------------------------------

export const CACHE_EPOCH = "1";
