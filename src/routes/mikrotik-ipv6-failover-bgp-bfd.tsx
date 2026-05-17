import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/mikrotik-ipv6-failover-bgp-bfd.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Sub-second IPv6 failover on RouterOS — BGP + BFD over WireGuard";
const description =
  "Replace the static IPv6 default route on a MikroTik RB5009 with a BGP-advertised one on a BFD-monitored WireGuard session, cutting dead-tunnel detection from ~30 s to ~600 ms. bird2 on the VPS, RouterOS v7 BGP/BFD, measured failover numbers. Companion to the CGNAT build log.";
const url =
  "https://marfillaster.github.io/mikrotik-ipv6-failover-bgp-bfd/";
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
    "BGP",
    "BFD",
    "bird2",
    "IPv6 failover",
    "WireGuard",
    "MikroTik RB5009",
    "RouterOS v7",
    "CGNAT",
    "sub-second failover",
    "RFC 6996",
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
  ["#conventions-and-placeholders", "Conventions"],
  ["#1-vps--bird2-with-bfd", "VPS bird2"],
  ["#2-mikrotik--bgp-bfd-and-remove-the-static-route", "MikroTik"],
  ["#3-verification", "Verify"],
  ["#references", "References"],
] as const;

export default function MikrotikIpv6FailoverBgpBfd() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · BGP + BFD failover
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Sub-second IPv6 failover on RouterOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Replace a static IPv6 default with a BGP route on a BFD-monitored
            WireGuard session — ~30&nbsp;s dead-tunnel detection down to
            ~600&nbsp;ms. An optional enhancement to the CGNAT build log.
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
