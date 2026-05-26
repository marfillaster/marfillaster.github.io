import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/unifi-controller-routeros-containers-mikrotik.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Running the UniFi controller on the RB5009 — MongoDB + UniFi in RouterOS containers";
const description =
  "Run the UniFi Network Application and its MongoDB on a MikroTik RB5009 as RouterOS containers — no second always-on box. USB swap + ext4 storage, the ARMv8.0-A Mongo 4.4.18 pin, veths on the main LAN, memory caps, and verification. Paste-ready RouterOS v7.";
const url =
  "https://blog.homestack.space/unifi-controller-routeros-containers-mikrotik/";
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
  dependencies: "MikroTik RouterOS v7 containers, USB ext4, UniFi Network Application, MongoDB 4.4.18 (ARMv8.0-A)",
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
    "UniFi Network Application",
    "MongoDB",
    "RouterOS containers",
    "MikroTik RB5009",
    "self-hosted controller",
    "ARMv8.0-A",
    "RouterOS v7",
    "home network",
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
      name: "Running the UniFi controller on the RB5009",
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
  ["#1-what-you-need-first", "Prerequisites"],
  ["#2-conventions-and-placeholders", "Conventions"],
  ["#3-usb-layout-swap-and-ext4-data", "USB layout"],
  ["#4-container-veths-on-vlan-1", "veths"],
  ["#5-mongo-bootstrap-user", "Mongo user"],
  ["#6-mongo-and-unifi-containers", "Containers"],
  ["#7-verification", "Verify"],
  ["#8-notes-and-caveats", "Caveats"],
  ["#references", "References"],
] as const;

export default function UnifiControllerRouterOSContainers() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Build log · MikroTik RB5009 · RouterOS containers
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Running the UniFi controller on the RB5009
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            UniFi Network Application + MongoDB as RouterOS containers on the
            RB5009 — no second always-on box. The companion to the CGNAT build
            log.
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
