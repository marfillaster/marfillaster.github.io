import { MDXProvider } from "@mdx-js/react";
import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import Post from "../content/vps-ipv6-cgnat-mikrotik.mdx";
import VyosPost from "../content/vyos-vps-ipv6-cgnat-mikrotik.mdx";
import {
  SeriesNav,
  TableOfContents,
  mdxComponents,
  mdxComponentsWithHeadingPrefix,
} from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Routed IPv6 for a segmented IPv4-only LAN behind CGNAT — VPS, routed /48";
const description =
  "Add real routed IPv6 to an already-segmented IPv4-only LAN behind residential CGNAT using a $3/mo VPS that routes a /48, WireGuard from the RB5009, and eBGP between them. Includes Ubuntu/BIRD and VyOS relay tabs.";
const url = "https://marfillaster.github.io/vps-ipv6-cgnat-mikrotik/";
const ogImage = "https://marfillaster.github.io/og.png";
const author = "marfillaster";
const datePublished = "2026-05-21";
const dateModified = "2026-05-21";

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
    "MikroTik RB5009",
    "CGNAT",
    "WireGuard",
    "IPv6",
    "routed /48",
    "BGP",
    "BIRD",
    "VyOS",
    "RouterOS v7",
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

const ubuntuNavItems = [
  ["#overview", "Overview"],
  ["#design-decisions", "Design"],
  ["#1-topology-recap", "Topology"],
  ["#2-conventions-and-placeholders", "Conventions"],
  ["#3-return-routing-wireguard-authorizes-bgp-routes", "Return routing"],
  ["#4-vps--wireguard-relay-and-bgp", "VPS"],
  ["#5-mikrotik--wireguard-client-and-bgp", "MikroTik"],
  ["#6-relay-side-verification", "Verify"],
  ["#a-appendix--cost-and-provider-notes", "Cost"],
  ["#glossary", "Glossary"],
] as const;

const vyosNavItems = [
  ["#vyos-overview", "Overview"],
  ["#vyos-design-decisions", "Design"],
  ["#vyos-1-topology-recap", "Topology"],
  ["#vyos-2-conventions-and-placeholders", "Conventions"],
  ["#vyos-3-baseline-vyos-networking", "Baseline"],
  ["#vyos-4-vyos--wireguard-and-bgp", "VyOS"],
  ["#vyos-5-vyos--relay-firewall", "Firewall"],
  ["#vyos-6-mikrotik--wireguard-client-and-bgp", "MikroTik"],
  ["#vyos-7-verification", "Verify"],
  ["#vyos-references", "References"],
] as const;

const vyosMdxComponents = mdxComponentsWithHeadingPrefix("vyos-");

export default function VpsIpv6Cgnat() {
  const [variant, setVariant] = useState<"ubuntu" | "vyos">("ubuntu");
  useEffect(() => {
    if (window.location.hash === "#vyos" || window.location.hash.startsWith("#vyos-")) {
      setVariant("vyos");
    }
  }, []);
  const isUbuntu = variant === "ubuntu";
  const selectVariant = (next: "ubuntu" | "vyos") => {
    setVariant(next);
    window.history.replaceState(null, "", next === "vyos" ? "#vyos" : window.location.pathname);
  };

  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · VPS-routed /48
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Routed IPv6 for a segmented IPv4-only LAN behind CGNAT
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            $3/mo VPS that routes a /48, WireGuard from the RB5009, eBGP
            between them. Pick an Ubuntu/BIRD or VyOS relay implementation.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 21 May 2026</time>
          </p>
        </article>

        <SeriesNav current="vps" />

        <div className="not-prose mt-10 border-b">
          <div role="tablist" aria-label="VPS relay implementation" className="flex gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={isUbuntu}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                isUbuntu
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => selectVariant("ubuntu")}
            >
              Ubuntu + BIRD
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isUbuntu}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                !isUbuntu
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => selectVariant("vyos")}
            >
              VyOS
            </button>
          </div>
        </div>

        <TableOfContents items={isUbuntu ? ubuntuNavItems : vyosNavItems} />

        <div role="tabpanel" id="ubuntu-panel" aria-label="Ubuntu + BIRD" hidden={!isUbuntu}>
          <MDXProvider components={mdxComponents}>
            <Post />
          </MDXProvider>
        </div>
        <div role="tabpanel" id="vyos" aria-label="VyOS" hidden={isUbuntu}>
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
