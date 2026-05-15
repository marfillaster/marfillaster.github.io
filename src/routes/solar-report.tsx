import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";

const title =
  "Residential 6.5 kWp Solar Performance Summary — Cavite, Philippines (Dec 2025–Apr 2026)";
const description =
  "Summary of five months of real residential solar performance from a 6.5 kWp / 14.3 kWh / 8 kW system in Cavite, Philippines: bill cut, payback, self-sufficiency, and battery behavior. Links to the full report and raw markdown.";
const url = "https://marfillaster.github.io/solar-report/";
const ogImage = "https://marfillaster.github.io/solar-report/og-image.png";
const author = "Ken Marfilla";
const datePublished = "2026-05-01";
const dateModified = "2026-05-01";

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

const systemChips = [
  "6.5 kWp PV",
  "14.3 kWh battery",
  "8.0 kW AC inverter",
  "Cavite, Philippines",
  "₱15/kWh flat · 56% feed-in",
] as const;

const headlineMetrics = [
  {
    label: "Annual bill cut",
    value: "₱115,973",
    note: "~69% of pre-solar bill",
  },
  {
    label: "Simple payback",
    value: "~3.5 yrs",
    note: "on ₱400k turnkey",
  },
  {
    label: "Year-1 generation",
    value: "~7,663 kWh",
    note: "~21 kWh/day baseline",
  },
  {
    label: "CO₂ avoided",
    value: "~4.7 t/yr",
    note: "≈216 trees · 22,600 km",
  },
] as const;

const monthlyBills = [
  { month: "Dec 2025", without: "₱13,974", net: "₱7,589" },
  { month: "Jan 2026", without: "₱12,459", net: "₱7,564" },
  { month: "Feb 2026", without: "₱11,531", net: "₱9,160" },
  { month: "Mar 2026", without: "₱13,222", net: "₱11,166" },
  { month: "Apr 2026", without: "₱17,565", net: "₱12,181" },
] as const;

export default function SolarReport() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Case study · 6.5 kWp · Cavite, PH · Dec 2025 – Apr 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Residential solar performance — five months in
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Real generation, self-sufficiency, bill impact, and battery
            behavior from a 6.5 kWp / 14.3 kWh / 8 kW system across 150 days of
            hourly data.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 1 May 2026</time>
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {systemChips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border px-2.5 py-1 font-mono"
              >
                {chip}
              </li>
            ))}
          </ul>

          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link
              to="/solar-report/full-report"
              className="underline underline-offset-4 hover:text-primary"
            >
              Read the full report →
            </Link>
            <a
              href="/solar-report/full-report.md"
              download
              className="underline underline-offset-4 hover:text-primary"
            >
              Download raw markdown ↓
            </a>
          </p>
        </article>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Headline numbers
          </h2>
          <dl className="not-prose mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {headlineMetrics.map((m) => (
              <div
                key={m.label}
                className="rounded-md border p-4"
              >
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {m.label}
                </dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight">
                  {m.value}
                </dd>
                <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            What the data shows
          </h2>
          <p className="mt-3">
            Self-sufficiency climbed from 54% in December to a peak of 76% in
            March, then dipped to 68% in April when household consumption
            jumped sharply (avg daily load rose from ~29 to ~39 kWh). The
            April surge is not vehicle charging — the PHEV was off the road
            all month — it is the second AC unit running nearly 24/7 during
            summer break.
          </p>
          <p className="mt-3">
            No equipment fault is visible. Peak PV reached 5.4 kW (68% of
            inverter capacity), there is zero clipping, and battery round-trip
            efficiency stays in the healthy 94–98% band. One day worth
            flagging: 2026-01-02 generated only 4.7 kWh against an expected
            ~17.8 kWh — confirm against weather/inverter logs.
          </p>
          <p className="mt-3">
            For Dec–Mar, the highest-impact lever is shifting PHEV charging
            earlier into the solar window. For April specifically — and for
            future summer-break stretches — the highest-impact lever shifts to
            AC management.{" "}
            <Link
              to="/solar-report/full-report#recommendations"
              className="underline underline-offset-4 hover:text-primary"
            >
              See recommendations →
            </Link>
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Monthly bill impact
          </h2>
          <div className="not-prose mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Month</th>
                  <th className="py-2 pr-4 font-medium">Bill without solar</th>
                  <th className="py-2 pr-4 font-medium">Net savings</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBills.map((row) => (
                  <tr key={row.month} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 align-top">{row.month}</td>
                    <td className="py-2 pr-4 align-top">{row.without}</td>
                    <td className="py-2 pr-4 align-top">{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            April's "without solar" bill is the highest because household load
            was ~39 kWh/day. Even so, net savings hit a record ₱12,181 — solar
            is doing more work in absolute terms when consumption is higher.
          </p>
          <p className="mt-6 text-sm">
            <Link
              to="/solar-report/full-report"
              className="underline underline-offset-4 hover:text-primary"
            >
              Full analysis · methodology · alerts · projections →
            </Link>
          </p>
        </section>

        <section className="mt-16 rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Disclaimer:</strong> the report
            is AI-assisted. While the underlying data comes from the inverter
            export, the narrative analysis, recommendations, projections, and
            financial interpretation may contain inaccuracies. Verify critical
            findings against your own records, manufacturer specs, or a
            qualified solar professional before acting on them.
          </p>
        </section>

        <Comments />
      </div>
    </SiteShell>
  );
}
