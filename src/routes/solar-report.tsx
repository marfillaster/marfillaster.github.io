import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";

const title =
  "Residential 6.5 kWp Solar Performance Summary — Cavite, Philippines (Dec 2025–Jun 2026)";
const description =
  "Summary of seven months of real residential solar performance from a 6.5 kWp / 14.3 kWh / 8 kW system in Cavite, Philippines: bill cut, payback, self-sufficiency, and battery behavior. Links to the full report and raw markdown.";
const url = "https://blog.homestack.space/solar-report/";
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

const systemChips = [
  "6.5 kWp PV",
  "14.3 kWh battery",
  "8.0 kW AC inverter",
  "Cavite, Philippines",
  "₱16.10/kWh flat · 56% feed-in",
] as const;

const headlineMetrics = [
  {
    label: "Annual bill cut",
    value: "₱131,445",
    note: "~68% of pre-solar bill",
  },
  {
    label: "Simple payback",
    value: "~3.1 yrs",
    note: "on ₱400k turnkey",
  },
  {
    label: "Year-1 generation",
    value: "~8,210 kWh",
    note: "~22.5 kWh/day baseline",
  },
  {
    label: "CO₂ avoided",
    value: "~5.2 t/yr",
    note: "≈237 trees · 24,800 km",
  },
] as const;

const monthlyBills = [
  { month: "Dec 2025", without: "₱13,424", net: "₱7,291" },
  { month: "Jan 2026", without: "₱11,736", net: "₱7,039" },
  { month: "Feb 2026", without: "₱10,609", net: "₱8,420" },
  { month: "Mar 2026", without: "₱12,464", net: "₱10,520" },
  { month: "Apr 2026", without: "₱17,542", net: "₱12,165" },
  { month: "May 2026", without: "₱18,633", net: "₱13,162" },
  { month: "Jun 2026", without: "₱18,539", net: "₱11,144" },
] as const;

export default function SolarReport() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Case study · 6.5 kWp · Cavite, PH · Dec 2025 – Jun 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Residential solar performance — seven months in
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Real generation, self-sufficiency, bill impact, and battery
            behavior from a 6.5 kWp / 14.3 kWh / 8 kW system across 211 days of
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

          <p className="mt-8 border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground">
            The short version: seven months in, the array covers roughly
            two-thirds to three-quarters of the house and is tracking to a
            ~3.1-year payback. The biggest lever on the bill is the{" "}
            <em>timing</em> of PHEV charging: charging days pull ~24 kWh from
            the grid versus ~9 kWh otherwise, because the car currently charges
            in the late afternoon and evening instead of the midday solar
            window. If you're sizing a system here, the variable that
            generalizes from this single-site data is load timing, not panel
            count. Once it was running I also took it through Meralco net
            metering — that paperwork is its own story:{" "}
            <Link
              to="/net-metering-general-trias/"
              className="underline underline-offset-4 hover:text-primary"
            >
              Net Metering Journey in General Trias
            </Link>
            .
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
            Self-sufficiency climbed from 54% in December to a peak of 77% in
            March, eased to ~70% across April and May as household consumption
            rose (avg daily load went from ~29 to ~39 kWh), then dropped to
            ~60% in June as the wet season arrived. June generation fell ~16%
            (from ~27.8 to ~23.4 kWh/day) while load held steady, so grid
            import climbed to ~462 kWh — the highest month yet. This is the
            expected seasonal turn for a tropical site, not a system problem.
          </p>
          <p className="mt-3">
            No equipment fault is visible. Peak PV reached 5.4 kW (68% of
            inverter capacity), there is zero clipping, and battery round-trip
            efficiency stays in the healthy 94–98% band (~96% in June). The
            worst day remains 2026-01-02, which generated only 4.7 kWh — about
            74% below baseline, an overcast wet-season day rather than a fault;
            June's low-generation days trace to the same wet-season cloud.
          </p>
          <p className="mt-3">
            The highest-impact lever is moving PHEV charging into the midday
            solar window (09:00–14:00): it currently lands in the late
            afternoon and evening, when it draws straight from the grid and
            more than doubles daily import.{" "}
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
            Net savings peaked in May at ₱13,162, then eased to ₱11,144 in June
            even though the import rate rose to ₱16.10/kWh — the wet-season
            generation dip pushed more load onto the grid. Each month is billed
            at the rate that applied then (rates climbed from ₱14.41 in December
            to ₱16.10 in June); the ~₱131k annual figure is projected at today's
            rate.
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

        <ShareLinks url={url} title={title} />

        <Comments />
      </div>
    </SiteShell>
  );
}
