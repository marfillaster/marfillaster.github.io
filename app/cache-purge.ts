// -----------------------------------------------------------------------------
// Manual edge-cache purge.
//
// Deploys need no purge: Workers Cache keys include the Worker version (see
// wrangler.jsonc), so shipping a new version makes every previous entry
// unreachable on its own. This endpoint exists for the cases a deploy cannot
// express — clearing something now, without shipping.
//
// It clears the edge layer only. The inner response cache in
// app/http-caching.ts is digest-keyed and cannot be purged; it turns over when
// content changes or CACHE_EPOCH is bumped, which is the real nuclear option.
//
// Measured on staging, `cache.purge({ tags })` only reaches entries stored by
// the version issuing the purge, so path prefixes are the dependable form.
// -----------------------------------------------------------------------------

import type { Platform, PurgeOptions } from "./platform.ts";

function noStore(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Takes the admin bearer token; requests carrying Authorization bypass Workers
 * Cache, so the endpoint cannot cache itself.
 */
export async function handleCachePurge(
  request: Request,
  platform: Platform,
): Promise<Response> {
  const token = platform.secrets.adminResyncToken;
  if (!token || request.headers.get("Authorization") !== `Bearer ${token}`) {
    return noStore({ error: "unauthorized" }, 401);
  }

  let body: PurgeOptions;
  try {
    body = (await request.json()) as PurgeOptions;
  } catch {
    return noStore({ error: "expected a JSON body" }, 400);
  }

  const options: PurgeOptions = body.purgeEverything
    ? { purgeEverything: true }
    : {
        ...(body.tags?.length ? { tags: body.tags } : {}),
        ...(body.pathPrefixes?.length
          ? { pathPrefixes: body.pathPrefixes }
          : {}),
      };

  if (!options.purgeEverything && !options.tags && !options.pathPrefixes) {
    return noStore(
      { error: "expected tags, pathPrefixes, or purgeEverything" },
      400,
    );
  }

  const result = await platform.purgeCache(options);
  return noStore(
    {
      ...result,
      purged: options,
      note: "Clears Workers Cache only; the inner response cache turns over on a content change or a CACHE_EPOCH bump.",
    },
    result.success ? 200 : 502,
  );
}
