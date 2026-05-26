import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import VyosPost from "../content/vyos-vps-ipv6-cgnat-mikrotik.mdx";
import {
  SeriesNav,
  TableOfContents,
  mdxComponentsWithHeadingPrefix,
} from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "VyOS relay for routed IPv6 over CGNAT — VPS, routed /48";
const description =
  "Run the VPS-routed IPv6 over CGNAT path with a VyOS relay: provider-routed /48, WireGuard to the RB5009, eBGP route exchange, and interface-based relay firewall.";
const url = "https://blog.homestack.space/vps-ipv6-cgnat-mikrotik/vyos/";
const ubuntuUrl = "https://blog.homestack.space/vps-ipv6-cgnat-mikrotik/";
const ogImage = "https://blog.homestack.space/og.png";
const author = "marfillaster";
const datePublished = "2026-05-21";
const dateModified = "2026-05-21";

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
  dependencies: "VyOS 1.4+, MikroTik RouterOS v7, WireGuard, BGP",
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
    "VyOS",
    "MikroTik RB5009",
    "CGNAT",
    "WireGuard",
    "IPv6",
    "routed /48",
    "BGP",
    "RouterOS v7",
    "VPS",
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
      item: seriesUrl,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Routed IPv6 over CGNAT via a VPS-routed /48",
      item: ubuntuUrl,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "VyOS relay",
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
  ["#vyos-overview", "Overview"],
  ["#vyos-design-decisions", "Design"],
  ["#vyos-1-topology-recap", "Topology"],
  ["#vyos-2-conventions-and-placeholders", "Conventions"],
  ["#vyos-3-baseline-vyos-networking", "Baseline"],
  ["#vyos-4-vyos--wireguard-and-bgp", "VyOS"],
  ["#vyos-5-vyos--relay-firewall", "Firewall"],
  ["#vyos-6-home-router--wireguard-client-and-bgp", "Home router"],
  ["#vyos-7-verification", "Verify"],
  ["#vyos-references", "References"],
] as const;

const vyosMdxComponents = mdxComponentsWithHeadingPrefix("vyos-");

export default function VpsIpv6CgnatVyos() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · VPS-routed /48 · VyOS relay
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            VyOS relay for routed IPv6 over CGNAT
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Same VPS-routed /48 design as the Ubuntu/BIRD path, implemented
            with VyOS WireGuard, BGP policy, and relay firewall rules.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 21 May 2026</time>
          </p>
        </article>

        <SeriesNav current="vps" />

        <div className="not-prose mt-10 border-b">
          <div role="tablist" aria-label="VPS relay implementation" className="flex gap-2">
            <a
              href={ubuntuUrl.replace("https://blog.homestack.space", "")}
              role="tab"
              aria-selected="false"
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Ubuntu + BIRD
            </a>
            <a
              href="/vps-ipv6-cgnat-mikrotik/vyos/"
              role="tab"
              aria-selected="true"
              aria-current="page"
              className="border-b-2 border-foreground px-3 py-2 text-sm font-medium text-foreground"
            >
              VyOS
            </a>
            <a
              href="/vps-ipv6-cgnat-mikrotik/chr/"
              role="tab"
              aria-selected="false"
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              CHR
            </a>
          </div>
        </div>

        <TableOfContents items={navItems} />

        <div role="tabpanel" id="vyos" aria-label="VyOS">
          <MDXProvider components={vyosMdxComponents}>
            <VyosPost />
          </MDXProvider>
        </div>

        <ShareLinks url={url} title={title} />

        <Comments />
      </div>
    </SiteShell>
  );
}
