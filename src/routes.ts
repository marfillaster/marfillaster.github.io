import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("mikrotik-home-network", "routes/mikrotik-home-network.tsx"),
  route("solar-report", "routes/solar-report.tsx"),
  route("solar-report/full-report", "routes/solar-report-full.tsx"),
  route("nev-mileage", "routes/nev-mileage.tsx"),
  route("nev-mileage/full-report", "routes/nev-mileage-full.tsx"),
  route(
    "net-metering-general-trias",
    "routes/net-metering-general-trias.tsx",
  ),
  route(
    "solar-application-lancaster",
    "routes/solar-application-lancaster.tsx",
  ),
] satisfies RouteConfig;
