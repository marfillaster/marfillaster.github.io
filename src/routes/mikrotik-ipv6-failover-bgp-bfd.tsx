import { MDXProvider } from "@mdx-js/react";
import { useEffect } from "react";
import type { MetaFunction } from "react-router";
import Post from "../content/mikrotik-ipv6-failover-bgp-bfd.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Fast IPv6 failover on RouterOS — BGP + BFD over WireGuard";
const description =
  "Add BFD to the existing MikroTik/Ubuntu-BIRD BGP session over WireGuard, cutting dead-tunnel detection from BGP hold-time expiry to sub-second route withdrawal.";
const url =
  "https://blog.homestack.space/mikrotik-ipv6-failover-bgp-bfd/";
const ogImage = "https://blog.homestack.space/og.png";
const author = "marfillaster";
const datePublished = "2026-05-17";
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
  dependencies: "Ubuntu, BIRD 2.x, MikroTik RouterOS v7, WireGuard, BGP, BFD",
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
    "BGP",
    "BFD",
    "bird2",
    "IPv6 failover",
    "WireGuard",
    "MikroTik",
    "RouterOS v7",
    "CGNAT",
    "fast IPv6 failover",
    "RFC 6996",
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
      name: "Fast IPv6 failover on RouterOS",
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

const birdNavItems = [
  ["#overview", "Overview"],
  ["#design-decisions", "Design"],
  ["#1-conventions-and-placeholders", "Conventions"],
  ["#2-vps--add-bfd-to-bird2", "VPS bird2"],
  ["#3-home-router--enable-bfd-on-the-existing-bgp-session", "Home router"],
  ["#4-verification", "Verify"],
  ["#references", "References"],
] as const;

export default function MikrotikIpv6FailoverBgpBfd() {
  useEffect(() => {
    if (window.location.hash === "#vyos" || window.location.hash.startsWith("#vyos-")) {
      window.location.replace(
        `/mikrotik-ipv6-failover-bgp-bfd/vyos/${
          window.location.hash === "#vyos" ? "" : window.location.hash
        }`,
      );
    }
    if (window.location.hash === "#chr" || window.location.hash.startsWith("#chr-")) {
      window.location.replace(
        `/mikrotik-ipv6-failover-bgp-bfd/chr/${
          window.location.hash === "#chr" ? "" : window.location.hash
        }`,
      );
    }
  }, []);

  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik · BGP + BFD failover
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Fast IPv6 failover on RouterOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add BFD to the existing BGP session over WireGuard — BFD down in
            ~700&nbsp;ms, route withdrawn fast enough for Happy Eyeballs.
            Pick an Ubuntu/BIRD, VyOS, or CHR relay implementation.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 17 May 2026</time>
          </p>
        </article>

        <div className="not-prose mt-10 border-b">
          <div role="tablist" aria-label="BFD relay implementation" className="flex gap-2">
            <a
              href="/mikrotik-ipv6-failover-bgp-bfd/"
              role="tab"
              aria-selected="true"
              aria-current="page"
              className="border-b-2 border-foreground px-3 py-2 text-sm font-medium text-foreground"
            >
              Ubuntu + BIRD
            </a>
            <a
              href="/mikrotik-ipv6-failover-bgp-bfd/vyos/"
              role="tab"
              aria-selected="false"
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              VyOS
            </a>
            <a
              href="/mikrotik-ipv6-failover-bgp-bfd/chr/"
              role="tab"
              aria-selected="false"
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              CHR
            </a>
          </div>
        </div>

        <TableOfContents items={birdNavItems} />

        <div role="tabpanel" id="bird-panel" aria-label="Ubuntu + BIRD">
          <MDXProvider components={mdxComponents}>
            <Post />
          </MDXProvider>
        </div>

        <ShareLinks url={url} title={title} />

        <Comments />
      </div>
    </SiteShell>
  );
}
