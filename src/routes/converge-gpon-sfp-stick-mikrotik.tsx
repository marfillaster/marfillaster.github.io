import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/converge-gpon-sfp-stick-mikrotik.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Replacing a Converge Skyworth ONT with an ODI GPON SFP stick on MikroTik";
const description =
  "A tested Converge FiberX GPON ONT replacement build log: Skyworth GN630V to ODI DFP-34X-2C2 GPON SFP stick in a MikroTik RB5009, VLAN 10 DHCP, SC/APC to SC/UPC connector caveat, and the minimum working configuration.";
const url =
  "https://marfillaster.github.io/converge-gpon-sfp-stick-mikrotik/";
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
    "Converge FiberX",
    "GPON SFP",
    "ODI DFP-34X-2C2",
    "Skyworth GN630V",
    "MikroTik RB5009",
    "RouterOS v7",
    "RTL960x",
    "ONT replacement",
    "VLAN 10",
    "SC APC SC UPC",
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
  ["#disclaimer", "Disclaimer"],
  ["#tested-hardware", "Hardware"],
  ["#what-actually-mattered", "Minimum config"],
  ["#connector-mismatch", "Connector"],
  ["#gather-values", "Values"],
  ["#configure-stick", "Stick config"],
  ["#routeros", "RouterOS"],
  ["#swap-the-ont", "Swap"],
  ["#verify", "Verify"],
  ["#command-reference", "Commands"],
  ["#references", "References"],
] as const;

export default function ConvergeGponSfpStickMikrotik() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · Converge GPON · MikroTik RB5009
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Replacing a Converge ONT with a GPON SFP stick
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Skyworth GN630V to ODI DFP-34X-2C2 in the RB5009 SFP+ cage: the
            connector gotcha, VLAN 10 handoff, and the minimum config that
            actually worked on my line.
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
