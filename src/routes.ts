import { type RouteConfig, index, route } from "@react-router/dev/routes";
// @ts-ignore This helper runs in React Router's Node route-config context.
import { readRoutablePosts } from "../scripts/post-metadata.mjs";

const customHrefs = new Set([
  "/nev-mileage/",
  "/solar-report/",
]);

type RoutablePost = {
  href: string;
  routePath: string;
};

function routeId(path: string) {
  return `routes/post-${path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

const routablePosts = (await readRoutablePosts()) as RoutablePost[];

const postRoutes = routablePosts
  .filter((post) => !customHrefs.has(post.href))
  .map((post) =>
    route(post.routePath, "routes/post.tsx", { id: routeId(post.routePath) }),
  );

export default [
  index("routes/_index.tsx"),
  ...postRoutes,
  route("solar-report", "routes/solar-report.tsx"),
  route("solar-report/full-report", "routes/solar-report-full.tsx"),
  route("nev-mileage", "routes/nev-mileage.tsx"),
  route("nev-mileage/full-report", "routes/nev-mileage-full.tsx"),
] satisfies RouteConfig;
