import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/encrypted-dns-stable-resolver-mikrotik.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Encrypted DNS with a stable resolver address on RouterOS — no VLANs, no IPv6 uplink";
const description =
  "Make a MikroTik RouterOS v7 box resolve upstream over Cloudflare DoH and hand clients a resolver address that never changes — a locally assigned ULA advertised via RA RDNSS. No VLAN segmentation and no IPv6 uplink required; works on a flat IPv4-only LAN. Paste-ready RouterOS v7 snippets.";
const url =
  "https://marfillaster.github.io/encrypted-dns-stable-resolver-mikrotik/";
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
    "DoH",
    "DNS over HTTPS",
    "RA RDNSS",
    "ULA",
    "RFC 4193",
    "RFC 8106",
    "MikroTik RB5009",
    "RouterOS v7",
    "encrypted DNS",
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
  ["#overview", "Overview"],
  ["#design-decisions", "Design"],
  ["#1-what-you-need-first", "Prereqs"],
  ["#2-conventions-and-placeholders", "Conventions"],
  ["#3-encrypted-upstream--doh-with-bootstrap-pins", "DoH"],
  ["#4-a-ula-on-the-lan--the-stable-resolver-address", "LAN ULA"],
  ["#5-advertise-the-resolver--ra-rdnss", "RA RDNSS"],
  ["#6-stop-handing-out-a-dhcpv4-resolver", "dns-none"],
  ["#7-verification", "Verify"],
  ["#references", "References"],
] as const;

export default function EncryptedDnsStableResolver() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · DoH + stable RDNSS
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Encrypted DNS with a stable resolver address on RouterOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cloudflare DoH upstream and a resolver address clients never have
            to relearn — a locally assigned ULA over RA RDNSS. No VLANs, no
            IPv6 uplink. The DNS companion to the CGNAT build log.
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
