import { MDXProvider } from "@mdx-js/react";
import type { MetaFunction } from "react-router";
import Post from "../content/full-report.md";
import { TableOfContents, mdxComponents } from "../components/doc";
import { SiteShell } from "../components/site-shell";

const title =
  "Full residential solar performance report — Cavite, Philippines (Dec 2025–Jun 2026)";
const description =
  "Full report: hourly-data-driven analysis of a 6.5 kWp / 14.3 kWh / 8 kW residential solar+battery system in Cavite, Philippines, covering seven months from December 2025 to June 2026. Generation, self-sufficiency, recommendations, bill impact, ROI, battery health, projections, and methodology.";
const url = "https://blog.homestack.space/solar-report/full-report";
const ogImage = "https://blog.homestack.space/solar-report/og-image.png";
const author = "Ken Marfilla";
const datePublished = "2026-05-01";
const dateModified = "2026-07-01";

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
  ["#executive-summary", "Summary"],
  ["#system-profile", "System"],
  ["#recommendations", "Recommendations"],
  ["#bill-impact", "Bill"],
  ["#roi-estimate", "ROI"],
  ["#key-metrics", "Metrics"],
  ["#battery-health", "Battery"],
  ["#annual-projection", "Projection"],
  ["#methodology-notes", "Methodology"],
  ["#appendix", "Appendix"],
] as const;

export default function SolarReportFull() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Full report · 6.5 kWp · Cavite, PH · Dec 2025 – Jun 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Residential solar performance — full analysis
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Detailed monthly generation, self-sufficiency, ROI, battery health,
            and grid feed-in figures for a 6.5 kWp / 14.3 kWh / 8 kW system.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 1 May 2026</time>
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <a
              href="/solar-report/"
              className="underline underline-offset-4 hover:text-primary"
            >
              ← Back to summary
            </a>
            <a
              href="/solar-report/full-report.md"
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
