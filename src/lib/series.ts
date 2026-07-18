// -----------------------------------------------------------------------------
// Series data. Single source of truth for the RB5009 home-network series
// order; each series post renders <SeriesNav current="..." /> as its first
// MDX block, and the markdown renderer expands it from this table. Steps 4
// (VPS) and 5 (Route64) are equal paths to a routable IPv6 prefix — peers,
// not primary/fallback. Pick one.
// (The GPON SFP-stick post is deliberately not part of this series.)
// -----------------------------------------------------------------------------

export const SERIES: ReadonlyArray<{
  slug: string;
  href: string;
  title: string;
  note: string;
}> = [
  {
    slug: "start",
    href: "/mikrotik-home-network/",
    title: "A small home network behind CGNAT",
    note: "Start here — overview, address plan, path-choice matrix",
  },
  {
    slug: "vlan",
    href: "/mikrotik-vlan-guest-iot/",
    title: "Trusted, IoT, and Guest VLANs",
    note: "Foundation — everything else sits on this",
  },
  {
    slug: "dns",
    href: "/encrypted-dns-stable-resolver-mikrotik/",
    title: "Encrypted DNS with a stable resolver",
    note: "Independent layer — needs no IPv6 uplink",
  },
  {
    slug: "vps",
    href: "/vps-ipv6-cgnat-mikrotik/",
    title: "Routed IPv6 over CGNAT via a VPS",
    note: "Equal path A — self-operated /48, BGP, Ubuntu/BIRD or VyOS",
  },
  {
    slug: "route64",
    href: "/route64-ipv6-cgnat-mikrotik/",
    title: "Routed IPv6 over CGNAT via Route64",
    note: "Equal path B — broker-operated /56, free, single uplink",
  },
  {
    slug: "per-vlan-ipv6",
    href: "/mikrotik-per-vlan-ipv6/",
    title: "Per-VLAN IPv6 on RouterOS",
    note: "GUA + ULA + RDNSS per VLAN, isolation, anti-spoof — after either path",
  },
  {
    slug: "failover",
    href: "/mikrotik-ipv6-failover-bgp-bfd/",
    title: "Fast IPv6 failover",
    note: "Optional — VPS path only, Ubuntu/BIRD or VyOS",
  },
  {
    slug: "unifi",
    href: "/unifi-controller-routeros-containers-mikrotik/",
    title: "UniFi controller on the router",
    note: "Optional add-on",
  },
  {
    slug: "multi-homed-ipv6-cgnat-mikrotik",
    href: "/multi-homed-ipv6-cgnat-mikrotik/",
    title: "Multi-homing IPv6 over CGNAT on RouterOS",
    note: "Series finale — own ASN + /48, both paths active under BGP best-path",
  },
];
