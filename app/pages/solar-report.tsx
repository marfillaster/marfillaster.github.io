// Port of src/routes/solar-report.tsx (solar report summary).

import type { Handle } from "remix/ui";
import type { MetaDescriptor } from "../head.ts";
import { breadcrumbList } from "../site.ts";
import { Comments, SiteShell } from "../components.tsx";
import { PageStats, ShareLinks } from "../interactive.tsx";

const title =
  "Residential 6.5 kWp Solar Performance Summary — Cavite, Philippines (Dec 2025–Aug 2026)";
const description =
  "Summary of nine months of real residential solar performance from a 6.5 kWp / 14.3 kWh / 8 kW system in Cavite, Philippines: bill cut, payback, self-sufficiency, and battery behavior. Links to the full report and raw markdown.";
const url = "https://blog.homestack.space/solar-report/";
const ogImage = "https://blog.homestack.space/solar-report/og-image.png";
const author = "Ken Marfilla";
const datePublished = "2026-05-01";
const dateModified = "2026-09-04";

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

export const solarReportDescriptors: MetaDescriptor[] = [
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
  {
    "script:ld+json": breadcrumbList([
      { name: "marfillaster · notes", item: "https://blog.homestack.space/" },
      { name: "Solar report", item: "https://blog.homestack.space/solar-report/" },
    ]),
  },
];

const systemChips = [
  "6.5 kWp PV",
  "14.3 kWh battery",
  "8.0 kW AC inverter",
  "Cavite, Philippines",
  "₱16.75/kWh flat · 55% feed-in",
];

const headlineMetrics = [
  {
    label: "Annual bill cut",
    value: "₱133,476",
    note: "~66% of pre-solar bill",
  },
  {
    label: "Simple payback",
    value: "~3.0 yrs",
    note: "on ₱400k turnkey",
  },
  {
    label: "Year-1 generation",
    value: "~8,153 kWh",
    note: "~22.3 kWh/day baseline",
  },
  {
    label: "CO₂ avoided",
    value: "~5.2 t/yr",
    note: "≈236 trees · 24,700 km",
  },
];

const monthlyBills = [
  { month: "Dec 2025", without: "₱13,424", net: "₱7,291" },
  { month: "Jan 2026", without: "₱11,736", net: "₱7,039" },
  { month: "Feb 2026", without: "₱10,609", net: "₱8,420" },
  { month: "Mar 2026", without: "₱12,464", net: "₱10,520" },
  { month: "Apr 2026", without: "₱17,542", net: "₱12,165" },
  { month: "May 2026", without: "₱18,633", net: "₱13,162" },
  { month: "Jun 2026", without: "₱18,539", net: "₱11,144" },
  { month: "Jul 2026", without: "₱18,001", net: "₱12,129" },
  { month: "Aug 2026", without: "₱15,302", net: "₱8,148" },
];

export function SolarReportPage(_: Handle) {
  return () => (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Case study · 6.5 kWp · Cavite, PH · Dec 2025 – Aug 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Residential solar performance — nine months in
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Real generation, self-sufficiency, bill impact, and battery
            behavior from a 6.5 kWp / 14.3 kWh / 8 kW system across 273 days of
            hourly data.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 1 May 2026</time>
            <PageStats path="/solar-report/" title={title} />
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {systemChips.map((chip) => (
              <li className="rounded-full border px-2.5 py-1 font-mono">{chip}</li>
            ))}
          </ul>

          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <a
              href="/solar-report/full-report"
              className="underline underline-offset-4 hover:text-primary"
            >
              Read the full report →
            </a>
            <a
              href="/solar-report/full-report.md"
              download
              className="underline underline-offset-4 hover:text-primary"
            >
              Download raw markdown ↓
            </a>
          </p>

          <p className="mt-8 border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground">
            The short version: nine months in, the array is still tracking to a
            ~3.0-year payback, but August was the weakest month on record. A
            multi-week monsoon cut generation ~38% to ~15.8 kWh/day and pulled
            self-sufficiency down to ~51.8% — below December's previous floor.
            That is weather rather than equipment: the eleven low-generation
            days all sit inside the flooding that hit Luzon, and the array
            recovered to ~29.3 kWh on 31 August. The month sharpens the main
            finding rather than changing it. The money is in the overnight base
            load — ~3.7 kWh bought at the full rate every night while the
            battery sits empty, ~₱1,900 in August alone — and when generation
            collapses, that draw is the one load neither panels nor battery can
            reach. If you're sizing a system here, the variable that
            generalizes from this single-site data is the always-on load floor,
            not panel count. Installing it needed the subdivision
            developer's approval first:{" "}
            <a
              href="/solar-application-lancaster/"
              className="underline underline-offset-4 hover:text-primary"
            >
              Solar Panel Installation Application Guide for Lancaster New City
            </a>
            . Once it was running I also took it through Meralco net metering —
            that paperwork is its own story:{" "}
            <a
              href="/net-metering-general-trias/"
              className="underline underline-offset-4 hover:text-primary"
            >
              Net Metering Journey in General Trias
            </a>
            .
          </p>
        </article>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Headline numbers
          </h2>
          <dl className="not-prose mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {headlineMetrics.map((m) => (
              <div className="rounded-md border p-4">
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
            Self-sufficiency climbed from 54.3% in December to a peak of 76.5%
            in March, eased through the wet season to 59.9% in June, recovered
            to 66.5% in July, then fell to 51.8% in August — the dataset low,
            and the first month below the December baseline. Generation dropped
            ~38% to ~15.8 kWh/day and grid import rose to ~440 kWh. Household
            load fell ~19% to ~29.5 kWh/day over the same stretch, with four
            charging days against July's nine, which cushioned the loss
            considerably: had load held at July's level, August would have
            landed nearer 42%.
          </p>
          <p className="mt-3">
            No equipment fault is visible. Peak PV reached 5.44 kW (68% of
            inverter capacity), and there is still zero clipping in 273 days.
            The eleven August days flagged as low generation all fall inside
            the monsoon — output is suppressed across the whole daylight window
            rather than cutting off abruptly, and the dips cluster in
            consecutive runs as weather systems do. August's raw battery
            round-trip efficiency reads an impossible 105.8%, the mirror of
            July's depressed 91.9%: the pack opened August at 91% state of
            charge and closed at 24%. Adjusted for the ~9.5 kWh it carried in
            and discharged, August reads ~99%, in line with every prior month.
          </p>
          <p className="mt-3">
            The highest-impact lever is unchanged: an overnight floor of
            ~700–780 W that draws ~3.7 kWh from the grid through the small
            hours, after the battery has emptied. Every 100 W trimmed off it is
            worth ~₱14,700 a year at ₱16.75/kWh, and it repeats whether anyone
            is home or not. A wet month strengthens the case rather than
            weakening it.{" "}
            <a
              href="/solar-report/full-report#recommendations"
              className="underline underline-offset-4 hover:text-primary"
            >
              See recommendations →
            </a>
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
                  <tr className="border-b last:border-b-0">
                    <td className="py-2 pr-4 align-top">{row.month}</td>
                    <td className="py-2 pr-4 align-top">{row.without}</td>
                    <td className="py-2 pr-4 align-top">{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Net savings peaked in May at ₱13,162 and fell to ₱8,148 in August,
            the weakest since January. The fall is larger than it looks: the
            rate rose to ₱16.75, so the same solar contribution should have
            been worth more. The saving dropped because the array delivered
            ~300 kWh less than July while the grid made up the difference at
            the highest rate yet charged. Each month is billed at the rate that
            applied then (rates climbed from ₱14.41 in December to ₱16.75 in
            August); the ~₱133k annual figure is projected at today's rate.
          </p>
          <p className="mt-6 text-sm">
            <a
              href="/solar-report/full-report"
              className="underline underline-offset-4 hover:text-primary"
            >
              Full analysis · methodology · alerts · projections →
            </a>
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
