import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/multi-homed-ipv6.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title = "Multi-homing IPv6 over CGNAT on RouterOS";
const description =
  "Run two IPv6 uplinks at once on a MikroTik RB5009 behind residential CGNAT under one announceable provider-assigned /48 — VPS path with BFD as primary, Route64 path as backup, BGP best-path picks the active default, netwatch drains LAN RA if both paths die. Includes the ASN + /48 acquisition story.";
const url = "https://blog.homestack.space/multi-homed-ipv6-cgnat-mikrotik/";
const ogImage = "https://blog.homestack.space/og.png";
const author = "marfillaster";
const datePublished = "2026-05-27";
const dateModified = "2026-05-27";

const seriesUrl = "https://blog.homestack.space/mikrotik-home-network/";
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
  dependencies:
    "MikroTik RouterOS v7, Ubuntu, BIRD 2.x, WireGuard, BGP, BFD, ASN + /48",
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
    url: seriesUrl,
  },
  keywords: [
    "multi-homing",
    "IPv6",
    "BGP",
    "BFD",
    "MikroTik RB5009",
    "RouterOS v7",
    "CGNAT",
    "ASN",
    "provider-assigned /48",
    "Route64",
    "WireGuard",
    "bird2",
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
      item: seriesUrl,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Multi-homing IPv6 over CGNAT on RouterOS",
      item: url,
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
  {
    "script:ld+json": breadcrumbData,
  },
];

const navItems = [
  ["#overview", "Overview"],
  ["#1-topology", "Topology"],
  ["#2-wan-architecture", "WAN architecture"],
  ["#3-conventions-and-placeholders", "Conventions"],
  ["#4-vps--wireguard-transit-bgp-ibgp-to-home-bfd", "VPS"],
  ["#5-home-router--both-bgp-sessions-bfd-on-the-vps-one", "Home router"],
  ["#6-bfd-where-the-peer-supports-it", "BFD"],
  ["#7-last-resort-fallback--netwatch--lan-ra-drain", "Last-resort fallback"],
  ["#8-verification", "Verify"],
  ["#references", "References"],
] as const;

export default function MultiHomedIpv6CgnatMikrotik() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · Series finale
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Multi-homing IPv6 over CGNAT on RouterOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Two IPv6 uplinks at once under one announceable
            provider-assigned /48 — VPS path with BFD as primary, Route64
            path as backup, BGP best-path picks the active default.
            Includes the ASN&nbsp;+ /48 acquisition story.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 27 May 2026</time>
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
