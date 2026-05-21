import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/mikrotik-per-vlan-ipv6.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title = "Per-VLAN IPv6 on RouterOS";
const description =
  "Plumb a routable-IPv6 default route through to every VLAN on a MikroTik RB5009: per-VLAN GUA + ULA + RA RDNSS, IPv6 forward-chain isolation, and SLAAC anti-spoof. Path-agnostic — works after either the VPS-routed /48 or the Route64 /56 path.";
const url = "https://marfillaster.github.io/mikrotik-per-vlan-ipv6/";
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
    "IPv6",
    "SLAAC",
    "RA RDNSS",
    "ULA",
    "GUA",
    "anti-spoof",
    "VLAN",
    "RouterOS v7",
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
  ["#overview", "Overview"],
  ["#1-conventions-and-placeholders", "Placeholders"],
  ["#2-per-vlan-addresses-and-ra-rdnss", "Per-VLAN v6"],
  ["#3-ipv6-forward-chain-isolation", "Isolation"],
  ["#4-anti-spoof", "Anti-spoof"],
  ["#5-verification", "Verify"],
] as const;

export default function MikrotikPerVlanIpv6() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · per-VLAN IPv6
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Per-VLAN IPv6 on RouterOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            GUA + ULA + RA RDNSS per VLAN, IPv6 forward-chain isolation, and
            SLAAC anti-spoof — the path-agnostic LAN-side layer after either
            the VPS or Route64 path.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 21 May 2026</time>
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
