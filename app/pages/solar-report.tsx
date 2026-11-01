// Port of src/routes/solar-report.tsx (solar report summary).

import type { Handle } from "remix/component";
import type { MetaDescriptor } from "../head.ts";
import { breadcrumbList } from "../site.ts";
import { Comments, SiteShell } from "../components.tsx";
import { PageStats, ShareLinks } from "../interactive.tsx";

const title =
  "Residential 6.5 kWp Solar Performance Summary — Cavite, Philippines (Dec 2025–Oct 2026)";
const description =
  "Summary of eleven months of real residential solar performance from a 6.5 kWp / 14.3 kWh / 8 kW system in Cavite, Philippines: bill cut, payback, self-sufficiency, and battery behavior. Links to the full report and raw markdown.";
const url = "https://blog.homestack.space/solar-report/";
const ogImage = "https://blog.homestack.space/solar-report/og-image.png";
const author = "Ken Marfilla";
const datePublished = "2026-05-01";
const dateModified = "2026-11-01";

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
  "₱16.78/kWh flat · 60% feed-in",
];

const headlineMetrics = [
  {
    label: "Annual bill cut",
    value: "₱133,849",
    note: "~64% of pre-solar bill",
  },
  {
    label: "Simple payback",
    value: "~3.0 yrs",
    note: "on ₱400k turnkey",
  },
  {
    label: "Year-1 generation",
    value: "~8,230 kWh",
    note: "~22.5 kWh/day baseline",
  },
  {
    label: "CO₂ avoided",
    value: "~5.3 t/yr",
    note: "≈241 trees · 25,200 km",
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
  { month: "Sep 2026", without: "₱18,439", net: "₱10,765" },
  { month: "Oct 2026", without: "₱21,405", net: "₱11,382" },
];

export function SolarReportPage(_: Handle) {
  return () => (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Case study · 6.5 kWp · Cavite, PH · Dec 2025 – Oct 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Residential solar performance — eleven months in
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Real generation, self-sufficiency, bill impact, and battery
            behavior from a 6.5 kWp / 14.3 kWh / 8 kW system across 334 days of
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
            The short version: eleven months in, the array is still tracking
            to a ~3.0-year payback. October generation held level with
            September at ~22.0 kWh/day, but load rose ~12% to ~41.1 kWh/day,
            the highest month in the dataset, so grid import set a record
            (~597 kWh), self-sufficiency fell to ~53.2%, and export was zero for
            the second month running. There was no weather event behind it:
            this is the first month whose decline came from load rather than
            generation. The main finding got sharper again: the overnight base
            load rose to ~1,057 W, the highest on record and up from ~738 W in
            August, ~5.3 kWh bought at the full rate every night, ~₱2,750 for
            the month. If you're sizing a system here, the variable that
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
            to 66.5% in July, fell to the dataset low of 51.8% in August, came
            back to 58.4% in September, and dropped to 53.2% in October.
            Generation barely moved (+1%), but household load rose ~12% to
            ~41.1 kWh/day: ordinary days used ~3.9 kWh more, spread across most
            hours, and there were nine charging days. The extra ~172 kWh of
            load against ~29 kWh of extra generation came almost entirely from
            the grid, and the grid bill reached ₱10,023, the highest in the
            dataset.
          </p>
          <p className="mt-3">
            No equipment fault is visible. Peak PV reached 5.44 kW (68% of
            inverter capacity), with zero clipping in 334 days, and October had
            no low-generation days. The single battery flag (Oct 18) was a
            shallow partial cycle. Round-trip efficiency read 98.9% raw and
            ~99.6% adjusted for month-boundary carry-over; across eleven months
            the adjusted range is 95.3%–99.6% with no downward trend.
          </p>
          <p className="mt-3">
            The highest-impact lever is unchanged and grew for a second month:
            the overnight floor rose to ~1,057 W in October, from ~893 W in
            September, and the battery reached its floor on 14 nights. Every
            100 W trimmed off it is worth ~₱14,700 a year at ₱16.78/kWh. The
            second is charge timing: sessions still start at 06:00, before the
            array produces anything, and some now run overnight; moving the
            start to ~09:00 puts them against peak generation.{" "}
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
            Net savings peaked in May at ₱13,162, fell to ₱8,148 in the
            August monsoon, and recovered to ₱10,765 in September and ₱11,382
            in October. October's saving rose only because the solar offset a
            larger load; its grid bill was the highest in the dataset
            (₱10,023), and nothing was exported. Each month is billed at the
            rate that applied then (rates moved from ₱14.41 in December to
            ₱16.78 in October); the ~₱134k annual figure is projected at
            today's rate.
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
