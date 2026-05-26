import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import ChrPost from "../content/chr-mikrotik-ipv6-failover-bgp-bfd.mdx";
import { TableOfContents, mdxComponentsWithHeadingPrefix } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "MikroTik CHR BFD failover on RouterOS — BGP + BFD over WireGuard";
const description =
  "Add BFD to the MikroTik/CHR BGP session over WireGuard so the home MikroTik withdraws the IPv6 default route quickly when the CHR relay path fails.";
const url =
  "https://blog.homestack.space/mikrotik-ipv6-failover-bgp-bfd/chr/";
const ogImage = "https://blog.homestack.space/og.png";
const author = "marfillaster";
const datePublished = "2026-05-17";
const dateModified = "2026-05-25";

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
    "BGP",
    "BFD",
    "IPv6 failover",
    "WireGuard",
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

const navItems = [
  ["#chr-overview", "Overview"],
  ["#chr-design-decisions", "Design"],
  ["#chr-1-conventions-and-placeholders", "Conventions"],
  ["#chr-2-chr--enable-bfd-on-the-home-bgp-session", "CHR"],
  ["#chr-3-home-router--enable-bfd-on-the-chr-bgp-session", "Home router"],
  ["#chr-4-verification", "Verify"],
  ["#chr-5-failure-test", "Failure test"],
  ["#chr-references", "References"],
] as const;

const chrMdxComponents = mdxComponentsWithHeadingPrefix("chr-");

export default function MikrotikIpv6FailoverBgpBfdChr() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik · BGP + BFD failover · CHR relay
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            MikroTik CHR BFD failover on RouterOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bind BFD to the existing MikroTik/CHR BGP session over WireGuard
            so the IPv6 default route withdraws quickly when the relay path dies.
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
              aria-selected="false"
              className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
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
