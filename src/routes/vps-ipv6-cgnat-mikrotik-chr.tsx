import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import ChrPost from "../content/chr-vps-ipv6-cgnat-mikrotik.mdx";
import {
  SeriesNav,
  TableOfContents,
  mdxComponentsWithHeadingPrefix,
} from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "MikroTik CHR relay for routed IPv6 over CGNAT — VPS, routed /48";
const description =
  "Run the VPS-routed IPv6 over CGNAT path with a MikroTik CHR relay: provider-routed /48, WireGuard to the home MikroTik, eBGP route exchange, and RouterOS firewall rules.";
const url = "https://marfillaster.github.io/vps-ipv6-cgnat-mikrotik/chr/";
const ubuntuUrl = "https://marfillaster.github.io/vps-ipv6-cgnat-mikrotik/";
const ogImage = "https://marfillaster.github.io/og.png";
const author = "marfillaster";
const datePublished = "2026-05-21";
const dateModified = "2026-05-24";

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
    "MikroTik CHR",
    "MikroTik",
    "RouterOS v7",
    "CGNAT",
    "WireGuard",
    "IPv6",
    "routed /48",
    "BGP",
    "VPS",
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
  ["#chr-overview", "Overview"],
  ["#chr-design-decisions", "Design"],
  ["#chr-1-topology-recap", "Topology"],
  ["#chr-2-conventions-and-placeholders", "Conventions"],
  ["#chr-3-bootstrap-chr-from-rescue", "Bootstrap"],
  ["#chr-4-chr--provider-addressing", "WAN"],
  ["#chr-5-chr--wireguard-relay", "WireGuard"],
  ["#chr-6-chr--bgp-route-exchange", "BGP"],
  ["#chr-7-chr--relay-firewall", "Firewall"],
  ["#chr-8-mikrotik--wireguard-client-and-bgp", "MikroTik"],
  ["#chr-9-verification", "Verify"],
  ["#chr-references", "References"],
] as const;

const chrMdxComponents = mdxComponentsWithHeadingPrefix("chr-");

export default function VpsIpv6CgnatChr() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik · VPS-routed /48 · CHR relay
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            MikroTik CHR relay for routed IPv6 over CGNAT
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Same VPS-routed /48 design as the Ubuntu/BIRD path, implemented
            with RouterOS CHR, WireGuard, BGP filters, and relay firewall
            rules.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 21 May 2026</time>
          </p>
        </article>

        <SeriesNav current="vps" />

        <div className="not-prose mt-10 border-b">
          <div role="tablist" aria-label="VPS relay implementation" className="flex gap-2">
            <a
              href={ubuntuUrl.replace("https://marfillaster.github.io", "")}
              role="tab"
              aria-selected="false"
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Ubuntu + BIRD
            </a>
            <a
              href="/vps-ipv6-cgnat-mikrotik/vyos/"
              role="tab"
              aria-selected="false"
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              VyOS
            </a>
            <a
              href="/vps-ipv6-cgnat-mikrotik/chr/"
              role="tab"
              aria-selected="true"
              aria-current="page"
              className="border-b-2 border-foreground px-3 py-2 text-sm font-medium text-foreground"
            >
              CHR
            </a>
          </div>
        </div>

        <TableOfContents items={navItems} />

        <div role="tabpanel" id="chr" aria-label="MikroTik CHR">
          <MDXProvider components={chrMdxComponents}>
            <ChrPost />
          </MDXProvider>
        </div>

        <ShareLinks url={url} title={title} />

        <Comments />
      </div>
    </SiteShell>
  );
}
