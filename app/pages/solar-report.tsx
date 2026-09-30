// Port of src/routes/solar-report.tsx (solar report summary).

import type { Handle } from "remix/ui";
import type { MetaDescriptor } from "../head.ts";
import { breadcrumbList } from "../site.ts";
import { Comments, SiteShell } from "../components.tsx";
import { PageStats, ShareLinks } from "../interactive.tsx";

const title =
  "Residential 6.5 kWp Solar Performance Summary — Cavite, Philippines (Dec 2025–Sep 2026)";
const description =
  "Summary of ten months of real residential solar performance from a 6.5 kWp / 14.3 kWh / 8 kW system in Cavite, Philippines: bill cut, payback, self-sufficiency, and battery behavior. Links to the full report and raw markdown.";
const url = "https://blog.homestack.space/solar-report/";
const ogImage = "https://blog.homestack.space/solar-report/og-image.png";
const author = "Ken Marfilla";
const datePublished = "2026-05-01";
const dateModified = "2026-10-01";

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
  "₱16.71/kWh flat · 58% feed-in",
];

const headlineMetrics = [
  {
    label: "Annual bill cut",
    value: "₱133,106",
    note: "~66% of pre-solar bill",
  },
  {
    label: "Simple payback",
    value: "~3.0 yrs",
    note: "on ₱400k turnkey",
  },
  {
    label: "Year-1 generation",
    value: "~8,190 kWh",
    note: "~22.4 kWh/day baseline",
  },
  {
    label: "CO₂ avoided",
    value: "~5.2 t/yr",
    note: "≈239 trees · 25,000 km",
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
];

export function SolarReportPage(_: Handle) {
  return () => (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Case study · 6.5 kWp · Cavite, PH · Dec 2025 – Sep 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Residential solar performance — ten months in
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Real generation, self-sufficiency, bill impact, and battery
            behavior from a 6.5 kWp / 14.3 kWh / 8 kW system across 303 days of
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
            The short version: ten months in, the array is still tracking to a
            ~3.0-year payback. September recovered most of August's monsoon
            loss — generation rose ~38% to ~21.7 kWh/day and self-sufficiency
            climbed back to ~58.4% — but load rose ~25% alongside it, so the
            battery hit its 10–11% floor every day and never filled, and export
            was zero for the month. The three low-generation days in the first
            week are the tail of the flooding that hit Luzon, not equipment. The
            main finding holds and got sharper: the money is in the overnight
            base load, which rose to ~890 W in September — ~4.5 kWh bought at
            the full rate every night while the battery sits empty, ~₱2,230 for
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
            to 66.5% in July, fell to the dataset low of 51.8% in August, and
            came back to 58.4% in September. Generation recovered ~38% to ~21.7
            kWh/day, but household load rose ~25% to ~36.8 kWh/day on eight
            charging days (August had three) and a heavier overnight draw. The
            extra load absorbed most of the recovered generation: the battery
            peaked at 96% and never reached full, so nothing was exported.
          </p>
          <p className="mt-3">
            No equipment fault is visible. Peak PV reached 5.44 kW (68% of
            inverter capacity), with zero clipping in 303 days. The three
            September days flagged as low generation (Sep 4, 5 and 7) sit in one
            run inside the tail of the August flooding, with output suppressed
            across the whole daylight window, and the array was back to ~30 kWh
            days by mid-month. Battery round-trip efficiency read 96.7% raw and
            ~96.5% adjusted for month-boundary carry-over; across ten months the
            adjusted range is 95.3%–99.2% with no downward trend.
          </p>
          <p className="mt-3">
            The highest-impact lever is unchanged and grew: the overnight floor
            rose to ~890 W in September, from ~734 W in August, and with the
            battery at its floor every night it came almost entirely from the
            grid. Every 100 W trimmed off it is worth ~₱14,600 a year at
            ₱16.71/kWh. The second is charge timing: September's sessions drew
            most heavily at 06:00–07:00, before the array produces anything, and
            moving the start to ~09:00 puts them against peak generation.{" "}
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
            August monsoon, and recovered to ₱10,765 in September. September's
            grid bill was the highest in the dataset (₱7,674) because load rose
            and the battery emptied every night, and the feed-in credit earned
            nothing because nothing was exported. Each month is billed at the
            rate that applied then (rates moved from ₱14.41 in December to
            ₱16.71 in September); the ~₱133k annual figure is projected at
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
