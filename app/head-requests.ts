// -----------------------------------------------------------------------------
// remix/router (fetch-router 1.0) serves HEAD from GET routes on its own, but
// only at dispatch — router middleware still sees context.method === "HEAD".
// httpCaching keys its document cache, ETags and 304s on GET, so flip HEAD to
// GET before it runs (context.method is what dispatch and middleware read; the
// framework's own methodOverride middleware uses the same mechanism), then
// strip the body from whatever GET would have sent.
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
