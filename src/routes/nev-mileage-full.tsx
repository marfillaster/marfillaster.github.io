import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/nev-full-report.md";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";
import { ogVersion } from "../content/nev-og-version";

const title =
  "Full BYD Sealion 6 PHEV mileage report — Cavite, Philippines (Dec 2025–Mar 2026)";
const description =
  "Full report: per-refuel and cumulative efficiency, electric-vs-fuel running cost, usage split, AI analysis, anomalies, and projections for a BYD Sealion 6 PHEV tracked over 5,123 km in Cavite, Philippines.";
const url = "https://blog.homestack.space/nev-mileage/full-report";
const ogImage = `https://blog.homestack.space/nev-mileage/og-image.png?v=${ogVersion}`;
const author = "Ken Marfilla";
const datePublished = "2026-05-15";
const dateModified = "2026-05-15";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
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
  inLanguage: "en",
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
  { property: "og:site_name", content: "marfillaster · notes" },
  { property: "og:locale", content: "en_PH" },
  { property: "article:published_time", content: datePublished },
  { property: "article:modified_time", content: dateModified },
  { property: "article:author", content: author },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { name: "twitter:image", content: ogImage },
  { tagName: "link", rel: "canonical", href: url },
  { "script:ld+json": structuredData },
];

const navItems = [
  ["#last-refuel", "Last refuel"],
  ["#cumulative", "Cumulative"],
  ["#executive-summary", "Summary"],
  ["#ai-analysis", "AI analysis"],
  ["#recommendations", "Recommendations"],
  ["#inferred-insights", "Insights"],
  ["#data-sources", "Data"],
] as const;

export default function NevMileageFull() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Full report · BYD Sealion 6 · Cavite, PH · Dec 2025 – Mar 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            PHEV mileage &amp; running cost — full analysis
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Per-refuel and cumulative efficiency, electric-vs-fuel running
            cost, usage split, anomalies, and projections for a BYD Sealion 6.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 15 May 2026</time>
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <a
              href="/nev-mileage/"
              className="underline underline-offset-4 hover:text-primary"
            >
              ← Back to summary
            </a>
            <a
              href="/nev-mileage/full-report.md"
              download
              className="underline underline-offset-4 hover:text-primary"
            >
              Download raw markdown ↓
            </a>
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
