import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/post.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";

const title = "Home network on residential CGNAT — RB5009 build log";
const description =
  "Build log for a usable home network behind residential CGNAT: VLAN segmentation, UniFi controller in RouterOS containers, routed IPv6 over WireGuard with a $3/mo VPS, and DNS-over-HTTPS with ULA RDNSS. Reproducible, paste-ready snippets for MikroTik RB5009.";
const url = "https://marfillaster.github.io/mikrotik-home-network/";
const ogImage = "https://marfillaster.github.io/mikrotik-home-network/og.png";
const author = "marfillaster";
const datePublished = "2026-05-15";
const dateModified = "2026-05-15";

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
  ["#abstract", "Abstract"],
  ["#design-decisions", "Design"],
  ["#1-topology-and-address-plan", "1. Topology"],
  ["#2-conventions-and-placeholders", "2. Conventions"],
  ["#3-lan-segmentation-comes-first", "3. VLANs"],
  ["#4-unifi-controller-on-the-router", "4. Controller"],
  ["#5-ipv6-over-wireguard-via-a-routed-48", "5. IPv6"],
  ["#6-encrypted-dns-with-stable-resolver-addresses", "6. DNS"],
  ["#7-end-to-end-verification", "7. Verify"],
  ["#a-appendix-a--sub-second-ipv6-failover-bgp--bfd", "Appendix"],
  ["#glossary", "Glossary"],
] as const;

export default function MikrotikHomeNetwork() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · Converge fiber, PH
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Building a usable home network behind residential CGNAT
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            VLANs, a UniFi controller running on the router itself, routed IPv6
            over WireGuard, and encrypted DNS. Each section stands alone; pick
            the parts that match your situation.
          </p>
        </article>

        <TableOfContents items={navItems} />

        <MDXProvider components={mdxComponents}>
          <Post />
        </MDXProvider>
      </div>
    </SiteShell>
  );
}
