import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/net-metering.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title = "Net Metering Journey in General Trias";
const description =
  "A realistic, step-by-step account of getting a 6 kWp rooftop solar system approved for net metering with Meralco in Rosario, Cavite: the PEE-sealed A3 SLD, the forms, the venues, the fees, and a ~50-day timeline.";
const url =
  "https://marfillaster.github.io/net-metering-general-trias/";
const ogImage =
  "https://marfillaster.github.io/net-metering-general-trias/og.png";
const author = "marfillaster";
const datePublished = "2026-05-16";
const dateModified = "2026-05-16";

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
    "net metering",
    "Meralco",
    "Philippines",
    "rooftop solar",
    "Cavite",
    "General Trias",
    "single line diagram",
    "PEE",
    "QE-COC",
    "bi-directional meter",
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
      "Net metering journey in General Trias — Meralco net-metering process timeline",
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
  ["#why-bother-with-net-metering", "Why net metering"],
  ["#prep-work-before-filing", "Prep work"],
  ["#whats-actually-on-the-a3-sld", "What's on the A3 SLD"],
  ["#the-timeline-step-by-step", "Timeline"],
  ["#total-elapsed-time", "Elapsed time"],
  ["#lessons-learned", "Lessons learned"],
  ["#closing", "Closing"],
  ["#downloadable-forms", "Downloadable forms"],
] as const;

export default function NetMeteringGeneralTrias() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Field log · Meralco net metering · Cavite, PH
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Net Metering Journey in General Trias
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            What it actually took to get a 6 kWp rooftop array approved for net
            metering with Meralco — documents, venues, fees, and dates, with no
            hype.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 16 May 2026</time>
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
