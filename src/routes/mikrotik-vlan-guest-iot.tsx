import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/mikrotik-vlan-guest-iot.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Trusted, IoT, and Guest VLANs on RouterOS — hybrid trunks, east-west isolation";
const description =
  "Split a flat home LAN into trusted, IoT, and Guest VLANs on a single MikroTik RB5009 with two UniFi APs on hybrid-trunk ports — bridge VLAN table, per-VLAN DHCP, and a reviewable east-west firewall. Pure IPv4 plus 802.1Q; no IPv6, no VPS. Paste-ready RouterOS v7.";
const url =
  "https://blog.homestack.space/mikrotik-vlan-guest-iot/";
const ogImage = "https://blog.homestack.space/og.png";
const author = "marfillaster";
const datePublished = "2026-05-17";
const dateModified = "2026-05-17";

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
  dependencies: "MikroTik RouterOS v7, 802.1Q, UniFi 6 AP",
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
    "VLAN",
    "LAN segmentation",
    "MikroTik RB5009",
    "RouterOS v7",
    "bridge VLAN filtering",
    "hybrid trunk",
    "UniFi 6 AP",
    "east-west isolation",
    "IoT VLAN",
    "guest network",
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
      name: "Trusted, IoT, and Guest VLANs on RouterOS",
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

const navItems = [
  ["#overview", "Overview"],
  ["#design-decisions", "Design"],
  ["#1-topology-and-address-plan", "Topology"],
  ["#2-conventions-and-placeholders", "Conventions"],
  ["#3-bridge-vlan-table-and-l3-gateways", "Bridge VLAN"],
  ["#4-dhcp-scopes", "DHCP"],
  ["#5-firewall--input-services-and-east-west-isolation", "Firewall"],
  ["#6-verification", "Verify"],
  ["#7-the-iot-printer-exception", "Printer"],
  ["#references", "References"],
] as const;

export default function LanSegmentationVlansMikrotik() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · VLAN segmentation
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Trusted, IoT, and Guest VLANs on RouterOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Split a flat LAN with two UniFi APs on hybrid trunks and a
            reviewable east-west firewall. Pure IPv4 plus 802.1Q — the first
            layer of the CGNAT build log.
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
