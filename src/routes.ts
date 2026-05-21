import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("mikrotik-home-network", "routes/mikrotik-home-network.tsx"),
  route(
    "converge-gpon-sfp-stick-mikrotik",
    "routes/converge-gpon-sfp-stick-mikrotik.tsx",
  ),
  route("route64-ipv6-cgnat-mikrotik", "routes/route64-ipv6-cgnat-mikrotik.tsx"),
  route("vps-ipv6-cgnat-mikrotik", "routes/vps-ipv6-cgnat-mikrotik.tsx"),
  route("mikrotik-per-vlan-ipv6", "routes/mikrotik-per-vlan-ipv6.tsx"),
  route(
    "unifi-controller-routeros-containers-mikrotik",
    "routes/unifi-controller-routeros-containers-mikrotik.tsx",
  ),
  route(
    "encrypted-dns-stable-resolver-mikrotik",
    "routes/encrypted-dns-stable-resolver-mikrotik.tsx",
  ),
  route(
    "mikrotik-vlan-guest-iot",
    "routes/mikrotik-vlan-guest-iot.tsx",
  ),
  route(
    "mikrotik-ipv6-failover-bgp-bfd",
    "routes/mikrotik-ipv6-failover-bgp-bfd.tsx",
  ),
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
