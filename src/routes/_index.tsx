import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { SiteShell } from "../components/site-shell";

const title = "marfillaster · notes";
const description =
  "Build logs and case studies on home networking, residential solar, and other long-running experiments by marfillaster.";
const url = "https://marfillaster.github.io/";

export const meta: MetaFunction = () => [
  { title },
  { name: "description", content: description },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:url", content: url },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: title },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { tagName: "link", rel: "canonical", href: url },
];

// Newest first, by publish date.
const posts = [
  {
    href: "/converge-gpon-sfp-stick-mikrotik/",
    eyebrow: "Build log · 2026-05",
    title: "Replacing a Converge ONT with a GPON SFP stick",
    description:
      "Skyworth GN630V to ODI DFP-34X-2C2 in a MikroTik RB5009: the SC/APC to SC/UPC connector gotcha, VLAN 10 DHCP handoff, and the minimum stick config that worked.",
  },
  {
    href: "/route64-ipv6-cgnat-mikrotik/",
    eyebrow: "Build log · 2026-05",
    title: "Routed IPv6 for a segmented IPv4-only LAN behind CGNAT",
    description:
      "Add real routed IPv6 to an already-segmented IPv4-only LAN behind CGNAT with Route64's free WireGuard /56 — a native global /64 per VLAN, no VPS, fast fail-to-IPv4 on outage. RouterOS v7 for the RB5009.",
  },
  {
    href: "/mikrotik-vlan-guest-iot/",
    eyebrow: "Build log · 2026-05",
    title: "Trusted, IoT, and Guest VLANs on a MikroTik RB5009",
    description:
      "Split a flat home LAN into trusted, IoT, and Guest VLANs with two UniFi APs on hybrid trunks, plus a reviewable east-west firewall. Pure IPv4 plus 802.1Q; no IPv6, no VPS. RouterOS v7 for the RB5009.",
  },
  {
    href: "/mikrotik-ipv6-failover-bgp-bfd/",
    eyebrow: "Build log · 2026-05",
    title: "Sub-second IPv6 failover on RouterOS",
    description:
      "Replace the static IPv6 default with a BGP route on a BFD-monitored WireGuard session — dead-tunnel detection from ~30 s down to ~600 ms. bird2 on the VPS, RouterOS v7 BGP/BFD, measured numbers. Companion to the CGNAT build log.",
  },
  {
    href: "/encrypted-dns-stable-resolver-mikrotik/",
    eyebrow: "Build log · 2026-05",
    title: "Encrypted DNS with a stable resolver address on RouterOS",
    description:
      "Resolve upstream over Cloudflare DoH and hand clients a resolver address that never changes — a locally assigned ULA over RA RDNSS. No VLANs, no IPv6 uplink; works on a flat IPv4-only LAN. RouterOS v7 for the RB5009.",
  },
  {
    href: "/unifi-controller-routeros-containers-mikrotik/",
    eyebrow: "Build log · 2026-05",
    title: "Running the UniFi controller on the router itself",
    description:
      "Run the UniFi Network Application and its MongoDB on a MikroTik RB5009 as RouterOS containers — no second always-on box. USB swap, the ARMv8.0-A Mongo 4.4.18 pin, veths, memory caps, verification.",
  },
  {
    href: "/net-metering-general-trias/",
    eyebrow: "Field log · 2026-05",
    title: "Net Metering Journey in General Trias",
    description:
      "A realistic, step-by-step account of getting a 6 kWp rooftop array approved for net metering with Meralco in Cavite — the PEE-sealed A3 SLD, the forms, the venues, the fees, and a ~50-day timeline.",
  },
  {
    href: "/mikrotik-home-network/",
    eyebrow: "Build log · 2026-05",
    title: "Building a usable home network behind residential CGNAT",
    description:
      "VLANs, routed IPv6 over WireGuard, and encrypted DNS. Reproducible, paste-ready snippets for the MikroTik RB5009.",
  },
  {
    href: "/nev-mileage/",
    eyebrow: "Case study · 2026-05",
    title: "BYD Sealion 6 PHEV running cost — Cavite, Philippines",
    description:
      "5,123 km of odometer- and meter-tracked driving: electric-vs-fuel running cost, 63% EV usage split, combined 6.0 L/100km efficiency, and battery health.",
  },
  {
    href: "/solar-report/",
    eyebrow: "Case study · 2026-04",
    title: "Residential 6.5 kWp solar performance — Cavite, Philippines",
    description:
      "Five months of real generation, self-sufficiency, battery behavior, and bill impact from a 6.5 kWp / 14.3 kWh / 8 kW system, with monthly tariff math and ROI payback.",
  },
  {
    href: "/solar-application-lancaster/",
    eyebrow: "Guide · 2025-12",
    title: "Solar Panel Installation Application Guide for Lancaster New City",
    description:
      "The exact CIDC documents to prepare before installing solar panels on your Lancaster New City unit — with a copy-ready Letter of Intent template, where to submit, and how to get your gate pass on the same visit.",
  },
] as const;

export default function Index() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-16 leading-relaxed">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          marfillaster · notes
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Long-running experiments, written down.
        </h1>
        <ul className="mt-12 space-y-10">
          {posts.map((p) => (
            <li key={p.href}>
              <Link to={p.href} className="group block">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {p.eyebrow}
                </p>
                <h2 className="mt-2 text-balance text-xl font-semibold tracking-tight group-hover:underline underline-offset-4 sm:text-2xl">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {p.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <section
          id="about"
          className="mt-20 scroll-mt-20 border-t pt-10"
          aria-labelledby="about-heading"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            About
          </p>
          <h2
            id="about-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-tight"
          >
            Ken Marfilla
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Based in Cavite, Philippines. These notes are personal build logs
            and case studies from long-running experiments at home — networking
            behind residential CGNAT, residential solar and battery, and
            whatever else turns into a project worth writing down.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Find me on{" "}
            <a
              href="https://github.com/marfillaster"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
