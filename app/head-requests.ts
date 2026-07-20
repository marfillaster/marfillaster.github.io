// -----------------------------------------------------------------------------
// @remix-run/fetch-router matches routes on exact HTTP method and never derives
// HEAD from GET, so every route registered with router.get() 404s on HEAD
// unless something rewrites the method first. context.method (not
// context.request.method) is what dispatch matches against — this is the same
// mechanism the framework's own methodOverride middleware uses — so we flip it
// to GET for matching, then strip the body from whatever GET would have sent.
// -----------------------------------------------------------------------------

import type { Middleware } from "remix/router";

export const headRequests: Middleware = async (context, next) => {
  if (context.method !== "HEAD") {
    return next();
  }

  context.method = "GET";
  const response = await next();
  response.body?.cancel();

  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};
