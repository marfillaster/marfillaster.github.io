import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/home-network-cgnat.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title = "Home network on residential CGNAT — RB5009 series index";
const description =
  "Series index for a small, opinionated home network on a MikroTik RB5009 behind residential CGNAT. Two equal paths to routable IPv6 — a self-operated VPS routing a /48, or the free Route64 broker routing a /56 — with shared VLAN, DNS, and ULA-only-trusted-VLAN scaffolding.";
const url = "https://blog.homestack.space/mikrotik-home-network/";
const ogImage = "https://blog.homestack.space/mikrotik-home-network/og.png";
const author = "marfillaster";
const datePublished = "2026-05-15";
const dateModified = "2026-05-21";

const seriesName = "MikroTik RB5009 home network behind CGNAT";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: title,
  description,
  url,
  mainEntityOfPage: url,
  image: ogImage,
  datePublished,
  dateModified,
  inLanguage: "en",
  author: {
    "@type": "Person",
    name: author,
    url: "https://github.com/marfillaster",
  },
  publisher: {
    "@type": "Person",
    name: author,
    url: "https://github.com/marfillaster",
  },
  isPartOf: {
    "@type": "CreativeWorkSeries",
    name: seriesName,
    url,
    numberOfItems: 8,
    hasPart: [
      { "@type": "TechArticle", url, name: "A small home network behind CGNAT" },
      {
        "@type": "TechArticle",
        url: "https://blog.homestack.space/mikrotik-vlan-guest-iot/",
        name: "Trusted, IoT, and Guest VLANs on RouterOS",
      },
      {
        "@type": "TechArticle",
        url: "https://blog.homestack.space/encrypted-dns-stable-resolver-mikrotik/",
        name: "Encrypted DNS with a stable resolver address on RouterOS",
      },
      {
        "@type": "TechArticle",
        url: "https://blog.homestack.space/vps-ipv6-cgnat-mikrotik/",
        name: "Routed IPv6 over CGNAT via a VPS-routed /48",
      },
      {
        "@type": "TechArticle",
        url: "https://blog.homestack.space/route64-ipv6-cgnat-mikrotik/",
        name: "Routed IPv6 over CGNAT via Route64",
      },
      {
        "@type": "TechArticle",
        url: "https://blog.homestack.space/mikrotik-per-vlan-ipv6/",
        name: "Per-VLAN IPv6 on RouterOS",
      },
      {
        "@type": "TechArticle",
        url: "https://blog.homestack.space/mikrotik-ipv6-failover-bgp-bfd/",
        name: "Fast IPv6 failover on RouterOS",
      },
      {
        "@type": "TechArticle",
        url: "https://blog.homestack.space/unifi-controller-routeros-containers-mikrotik/",
        name: "Running the UniFi controller on the RB5009",
      },
    ],
  },
  keywords: [
    "MikroTik RB5009",
    "UniFi 6",
    "Converge ICT",
    "CGNAT",
    "WireGuard",
    "IPv6",
    "DNS over HTTPS",
    "BGP",
    "BFD",
    "home network",
  ],
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "marfillaster · notes",
      item: "https://blog.homestack.space/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "RB5009 home network series",
      item: url,
    },
  ],
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CGNAT (Carrier-Grade NAT)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CGNAT is when your ISP shares one public IPv4 address across many customers by NATing them behind a carrier-operated NAT. Your WAN interface gets an address in RFC 6598 space (100.64.0.0/10) — not a public IPv4 — and the ISP handles port translation upstream. It's common on residential fiber where public IPv4 is scarce. Inbound IPv4 services (port forwards, HE 6in4) stop working; outbound NAT still does.",
      },
    },
    {
      "@type": "Question",
      name: "How do I check if I'm behind CGNAT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compare two addresses. Read the WAN IPv4 on your router (on RouterOS: /ip/address/print where interface=<wan>). Then check what ipinfo.io or curl ifconfig.me reports. If the router's WAN address starts with 100.64–100.127 (RFC 6598) or otherwise differs from the public address, you're behind CGNAT.",
      },
    },
    {
      "@type": "Question",
      name: "Does Hurricane Electric's 6in4 tunnelbroker work behind CGNAT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. HE's 6in4 uses IP protocol 41 (raw IPv6 inside IPv4), and carrier-grade NAT only translates TCP, UDP, and ICMP — protocol 41 packets get dropped. Use a WireGuard-based path instead: either the Route64 broker for a free routed /56, or a self-operated VPS routing a /48.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a VPS to get routable IPv6 behind CGNAT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The Route64 broker path hands out a routed /56 over WireGuard with no VPS to operate. The VPS-routed /48 path is the alternative if you'd rather own the relay end and get a larger prefix. Both produce the same per-VLAN result; the rest of the build is identical either way.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between a routed /48 and a routed /56?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A /48 gives you 65,536 /64 subnets; a /56 gives you 256. Both are ample for one /64 per home VLAN. /48 is the IETF 'site allocation' size from RFC 6177; /56 is what consumer ISPs and most brokers (including Route64) hand out by default.",
      },
    },
  ],
};

export const meta: MetaFunction = () => [
  { title },
  { name: "description", content: description },
  { name: "author", content: author },
  { property: "og:url", content: url },
  { property: "og:type", content: "article" },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:image", content: ogImage },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  {
    property: "og:image:alt",
    content:
      "RB5009 home network build log — diagram showing VPS, WireGuard tunnel, RB5009, APs, and VLANs",
  },
  { property: "og:site_name", content: "marfillaster · notes" },
  { property: "article:published_time", content: datePublished },
  { property: "article:modified_time", content: dateModified },
  { property: "article:author", content: author },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { name: "twitter:image", content: ogImage },
  { tagName: "link", rel: "canonical", href: url },
  {
    "script:ld+json": structuredData,
  },
  {
    "script:ld+json": breadcrumbData,
  },
  {
    "script:ld+json": faqData,
  },
];

const navItems = [
  ["#overview", "Overview"],
  ["#design-decisions", "Design"],
  ["#1-topology", "Topology"],
  ["#2-shared-conventions", "Conventions"],
  ["#3-pick-a-path-vps-routed-48-or-route64-56", "Pick a path"],
  ["#4-lan-segmentation-comes-first", "VLANs"],
  ["#5-keeping-streaming-off-the-routable-ipv6-path", "ULA-only"],
  ["#6-encrypted-dns-with-stable-resolver-addresses", "DNS"],
  ["#7-verification-path-agnostic", "Verify"],
  ["#faq", "FAQ"],
  ["#glossary", "Glossary"],
] as const;

export default function MikrotikHomeNetwork() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Series index · MikroTik RB5009 · Converge fiber, PH
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            A small home network behind CGNAT
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Two equal paths to routable IPv6 — a self-operated VPS routing a
            /48, or the free Route64 broker routing a /56 — over shared VLAN,
            DNS, and per-VLAN address scaffolding. Pick a path; the rest of
            the build is identical either way.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 15 May 2026</time>
          </p>
        </article>

        <TableOfContents items={navItems} />

        <MDXProvider components={mdxComponents}>
          <Post />
        </MDXProvider>

        <ShareLinks url={url} title={title} />

        <Comments />
      </div>
    </SiteShell>
  );
}
