import { MDXProvider } from "@mdx-js/react";
import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import Post from "../content/mikrotik-ipv6-failover-bgp-bfd.mdx";
import VyosPost from "../content/vyos-mikrotik-ipv6-failover-bgp-bfd.mdx";
import { TableOfContents, mdxComponents, mdxComponentsWithHeadingPrefix } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Fast IPv6 failover on RouterOS — BGP + BFD over WireGuard";
const description =
  "Add BFD to the existing MikroTik/VPS BGP session over WireGuard, cutting dead-tunnel detection from BGP hold-time expiry to sub-second route withdrawal. Includes Ubuntu/BIRD and VyOS relay variants.";
const url =
  "https://marfillaster.github.io/mikrotik-ipv6-failover-bgp-bfd/";
const ogImage = "https://marfillaster.github.io/og.png";
const author = "marfillaster";
const datePublished = "2026-05-17";
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
    "BGP",
    "BFD",
    "bird2",
    "VyOS",
    "IPv6 failover",
    "WireGuard",
    "MikroTik RB5009",
    "RouterOS v7",
    "CGNAT",
    "fast IPv6 failover",
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

const birdNavItems = [
  ["#overview", "Overview"],
  ["#design-decisions", "Design"],
  ["#1-conventions-and-placeholders", "Conventions"],
  ["#2-vps--add-bfd-to-bird2", "VPS bird2"],
  ["#3-mikrotik--enable-bfd-on-the-existing-bgp-session", "MikroTik"],
  ["#4-verification", "Verify"],
  ["#references", "References"],
] as const;

const vyosNavItems = [
  ["#vyos-overview", "Overview"],
  ["#vyos-design-decisions", "Design"],
  ["#vyos-1-conventions-and-placeholders", "Conventions"],
  ["#vyos-2-vyos--add-bfd-to-bgp", "VyOS"],
  ["#vyos-3-mikrotik--enable-bfd-on-the-vyos-bgp-session", "MikroTik"],
  ["#vyos-4-verification", "Verify"],
  ["#vyos-5-failure-test", "Failure test"],
  ["#vyos-references", "References"],
] as const;

const vyosMdxComponents = mdxComponentsWithHeadingPrefix("vyos-");

export default function MikrotikIpv6FailoverBgpBfd() {
  const [variant, setVariant] = useState<"bird" | "vyos">("bird");
  useEffect(() => {
    if (window.location.hash === "#vyos" || window.location.hash.startsWith("#vyos-")) {
      setVariant("vyos");
    }
  }, []);
  const isBird = variant === "bird";
  const selectVariant = (next: "bird" | "vyos") => {
    setVariant(next);
    window.history.replaceState(null, "", next === "vyos" ? "#vyos" : window.location.pathname);
  };

  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · BGP + BFD failover
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Fast IPv6 failover on RouterOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add BFD to the existing BGP session over WireGuard — BFD down in
            ~700&nbsp;ms, route withdrawn fast enough for Happy Eyeballs.
            Pick an Ubuntu/BIRD or VyOS relay implementation.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 17 May 2026</time>
          </p>
        </article>

        <div className="not-prose mt-10 border-b">
          <div role="tablist" aria-label="BFD relay implementation" className="flex gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={isBird}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                isBird
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => selectVariant("bird")}
            >
              Ubuntu + BIRD
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isBird}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                !isBird
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => selectVariant("vyos")}
            >
              VyOS
            </button>
          </div>
        </div>

        <TableOfContents items={isBird ? birdNavItems : vyosNavItems} />

        <div role="tabpanel" id="bird-panel" aria-label="Ubuntu + BIRD" hidden={!isBird}>
          <MDXProvider components={mdxComponents}>
            <Post />
          </MDXProvider>
        </div>
        <div role="tabpanel" id="vyos" aria-label="VyOS" hidden={isBird}>
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
