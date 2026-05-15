import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("mikrotik-home-network", "routes/mikrotik-home-network.tsx"),
  route("solar-report", "routes/solar-report.tsx"),
  route("solar-report/full-report", "routes/solar-report-full.tsx"),
] satisfies RouteConfig;
