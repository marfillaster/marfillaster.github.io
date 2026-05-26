import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/home-network-cgnat.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title = "Home network on residential CGNAT — RB5009 series index";
const description =
  "Series index for a small, opinionated home network on a MikroTik RB5009 behind residential CGNAT. Two equal paths to routable IPv6 — a self-operated VPS routing a /48, or the free Route64 broker routing a /56 — with shared VLAN, DNS, and ULA-only-trusted-VLAN scaffolding.";
const url = "https://blog.homestack.space/mikrotik-home-network/";
const ogImage = "https://blog.homestack.space/mikrotik-home-network/og.png";
const author = "marfillaster";
const datePublished = "2026-05-15";
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
    "UniFi 6",
    "Converge ICT",
    "CGNAT",
    "WireGuard",
    "IPv6",
    "DNS over HTTPS",
    "BGP",
    "BFD",
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
    content:
      "RB5009 home network build log — diagram showing VPS, WireGuard tunnel, RB5009, APs, and VLANs",
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
  ["#design-decisions", "Design"],
  ["#1-topology", "Topology"],
  ["#2-shared-conventions", "Conventions"],
  ["#3-pick-a-path-vps-routed-48-or-route64-56", "Pick a path"],
  ["#4-lan-segmentation-comes-first", "VLANs"],
  ["#5-keeping-streaming-off-the-routable-ipv6-path", "ULA-only"],
  ["#6-encrypted-dns-with-stable-resolver-addresses", "DNS"],
  ["#7-verification-path-agnostic", "Verify"],
  ["#glossary", "Glossary"],
] as const;

export default function MikrotikHomeNetwork() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Series index · MikroTik RB5009 · Converge fiber, PH
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            A small home network behind CGNAT
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Two equal paths to routable IPv6 — a self-operated VPS routing a
            /48, or the free Route64 broker routing a /56 — over shared VLAN,
            DNS, and per-VLAN address scaffolding. Pick a path; the rest of
            the build is identical either way.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 15 May 2026</time>
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
