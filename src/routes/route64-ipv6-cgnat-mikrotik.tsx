import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/route64-ipv6.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Routed IPv6 for a segmented IPv4-only LAN behind CGNAT — Route64, no VPS";
const description =
  "Add real routed IPv6 to an already-segmented IPv4-only LAN behind residential CGNAT using Route64's free WireGuard tunnel and a routed /56 — a native global /64 per VLAN, no VPS, with fast fail-to-IPv4 on outage. Paste-ready RouterOS v7 snippets for the MikroTik RB5009.";
const url = "https://marfillaster.github.io/route64-ipv6-cgnat-mikrotik/";
const ogImage = "https://marfillaster.github.io/og.png";
const author = "marfillaster";
const datePublished = "2026-05-17";
const dateModified = "2026-05-17";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description,
  url,
  mainEntityOfPage: url,
  image: ogImage,
  datePublished,
  dateModified,
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
  keywords: [
    "Route64",
    "MikroTik RB5009",
    "CGNAT",
    "WireGuard",
    "IPv6",
    "routed /56",
    "tunnel broker",
    "RouterOS v7",
    "home network",
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
    content: "marfillaster · notes — Home · Network · Solar · EV",
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
];

const navItems = [
  ["#abstract", "Abstract"],
  ["#design-decisions", "Design"],
  ["#1-topology-and-what-you-need-first", "Topology"],
  ["#2-conventions-and-placeholders", "Conventions"],
  ["#3-route64-dashboard", "Dashboard"],
  ["#4-wireguard-client", "WireGuard"],
  ["#5-native-per-vlan-ipv6-from-the-56", "Per-VLAN v6"],
  ["#6-default-route--single-uplink", "Default route"],
  ["#7-fast-fail-to-ipv4", "Fail to IPv4"],
  ["#8-ipv6-firewall-and-anti-spoofing", "Firewall"],
  ["#9-dyndns-hygiene-optional", "DynDNS"],
  ["#10-verification", "Verify"],
  ["#11-caveats", "Caveats"],
] as const;

export default function Route64Ipv6() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · Route64, no VPS
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Routed IPv6 for a segmented IPv4-only LAN behind CGNAT
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Free routed /56 over Route64's WireGuard tunnel — a native global
            /64 per VLAN, no VPS, with a fast fail-to-IPv4 on outage. The
            no-VPS companion to the CGNAT build log.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 17 May 2026</time>
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
