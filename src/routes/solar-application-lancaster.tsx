import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/solar-application-lancaster.mdx";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Solar Panel Installation Application Guide for Lancaster New City";
const description =
  "Lancaster New City solar installation: the exact CIDC documents to prepare, a Letter of Intent template, where to submit, and how to get your gate pass on the same visit.";
const url =
  "https://blog.homestack.space/solar-application-lancaster/";
const ogImage =
  "https://blog.homestack.space/solar-application-lancaster/og.png";
const author = "marfillaster";
const datePublished = "2025-12-01";
const dateModified = "2025-12-01";

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
    "Lancaster New City solar installation",
    "CIDC solar permit",
    "solar panels Cavite",
    "solar panel application",
    "Lancaster New City",
    "General Trias",
    "Cavite",
    "rooftop solar",
    "Letter of Intent solar",
    "Waiver of Accountability",
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
      "Solar panel installation application guide for Lancaster New City — CIDC document checklist",
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
  ["#introduction", "Introduction"],
  ["#required-documents-checklist", "Required documents"],
  ["#letter-of-intent-template", "Letter of Intent template"],
  ["#where-and-when-to-submit", "Where & when to submit"],
  ["#tips-for-a-smooth-approval", "Tips for approval"],
  ["#closing", "Closing"],
] as const;

export default function SolarApplicationLancaster() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Guide · Residential solar · Cavite, PH
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Solar Panel Installation Application Guide for Lancaster New City
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The exact documents CIDC requires before you can install solar
            panels on your unit — with a copy-ready Letter of Intent template
            and where to submit.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published December 2025</time>
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
