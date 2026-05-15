import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { SiteShell } from "../components/site-shell";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";
import { ogVersion } from "../content/nev-og-version";

const title =
  "BYD Sealion 6 PHEV mileage & running-cost report — Cavite, Philippines (Dec 2025–Mar 2026)";
const description =
  "Real-world EV/PHEV efficiency, electric-vs-fuel running cost, usage split, and battery health from a BYD Sealion 6 tracked over 5,123 km in Cavite, Philippines. Links to the full report and raw markdown.";
const url = "https://marfillaster.github.io/nev-mileage/";
const ogImage = `https://marfillaster.github.io/nev-mileage/og-image.png?v=${ogVersion}`;
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

const vehicleChips = [
  "BYD Sealion 6",
  "Plug-in hybrid",
  "5,123 km tracked",
  "63% EV usage",
  "Cavite, Philippines",
] as const;

const headlineMetrics = [
  {
    label: "Combined efficiency",
    value: "6.0 L/100km",
    note: "beats the 8–10 L/100km class benchmark",
  },
  {
    label: "EV running cost",
    value: "₱2.51/km",
    note: "vs ₱4.81/km on fuel — 48% cheaper",
  },
  {
    label: "Saved vs ICE",
    value: "₱10,900",
    note: "≈355 kg CO₂ avoided so far",
  },
  {
    label: "Battery health",
    value: "99% SOH",
    note: "after ~31 charge cycles",
  },
] as const;

const cumulative = [
  {
    mode: "HEV (fuel)",
    distance: "1,919 km",
    energy: "165.52 L",
    efficiency: "8.6 L/100km",
    costPerKm: "₱4.81",
  },
  {
    mode: "EV (electric)",
    distance: "3,204 km",
    energy: "562.0 kWh",
    efficiency: "5.7 km/kWh",
    costPerKm: "₱2.51",
  },
  {
    mode: "Combined",
    distance: "5,123 km",
    energy: "—",
    efficiency: "6.0 L/100km*",
    costPerKm: "₱3.37",
  },
] as const;

export default function NevMileage() {
  return (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Case study · BYD Sealion 6 · Cavite, PH · Dec 2025 – Mar 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            PHEV running cost — the first three months of tracked driving
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Owned since September 2024; consistent refuel-by-refuel tracking
            started in December 2025. This covers the 5,123 km logged so far
            (Dec 2025 – Mar 2026) — a slice of the ~27,500 km lifetime
            odometer — with odometer- and meter-tracked efficiency,
            electric-vs-fuel running cost, usage split, and battery health for
            a BYD Sealion 6.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 15 May 2026</time>
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {vehicleChips.map((chip) => (
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
              to="/nev-mileage/full-report"
              className="underline underline-offset-4 hover:text-primary"
            >
              Read the full report →
            </Link>
            <a
              href="/nev-mileage/full-report.md"
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
              <div key={m.label} className="rounded-md border p-4">
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
            The split between electric and fuel driving has been consistent
            at roughly 63% EV cumulatively, rising to 72% in the most recent
            tank. EV kilometers cost ₱2.51 each against ₱4.81 on fuel, so
            every kilometer shifted onto electric saves about ₱2.30 at the
            current tariff and ~₱55.75/L pump price.
          </p>
          <p className="mt-3">
            Combined consumption of 6.0 L/100km comfortably beats the 8–10
            L/100km benchmark for mid-size SUV PHEVs and undercuts a
            comparable ICE SUV by roughly 38–45% on running cost. Fuel
            efficiency holds steady at 8.3–8.6 L/100km and EV efficiency at
            5.4–5.7 km/kWh — no anomalies in the tracked sessions.
          </p>
          <p className="mt-3">
            Battery state of health is 99% after ~31 charge cycles, and the
            next scheduled service lands at 40,000 km, roughly Q3–Q4 2026.{" "}
            <Link
              to="/nev-mileage/full-report#recommendations"
              className="underline underline-offset-4 hover:text-primary"
            >
              See recommendations →
            </Link>
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Cumulative cost &amp; efficiency
          </h2>
          <div className="not-prose mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Mode</th>
                  <th className="py-2 pr-4 font-medium">Distance</th>
                  <th className="py-2 pr-4 font-medium">Fuel / energy</th>
                  <th className="py-2 pr-4 font-medium">Efficiency</th>
                  <th className="py-2 pr-4 font-medium">Cost/km</th>
                </tr>
              </thead>
              <tbody>
                {cumulative.map((row) => (
                  <tr key={row.mode} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 align-top">{row.mode}</td>
                    <td className="py-2 pr-4 align-top">{row.distance}</td>
                    <td className="py-2 pr-4 align-top">{row.energy}</td>
                    <td className="py-2 pr-4 align-top">{row.efficiency}</td>
                    <td className="py-2 pr-4 align-top">{row.costPerKm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            *Combined efficiency converts EV cost into equivalent fuel liters.
            Total spend so far is ₱17,277 over 5,123 km.
          </p>
          <p className="mt-6 text-sm">
            <Link
              to="/nev-mileage/full-report"
              className="underline underline-offset-4 hover:text-primary"
            >
              Full analysis · trends · anomalies · projections →
            </Link>
          </p>
        </section>

        <section className="mt-16 rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Disclaimer:</strong> the report
            is AI-assisted. Efficiency, cost, and usage figures are derived
            from odometer and meter readings entered by hand, so accuracy
            depends on those inputs. Values are for personal tracking and
            should not be used for warranty claims, tax filings, or official
            reporting without independent verification.
          </p>
        </section>

        <ShareLinks url={url} title={title} />

        <Comments />
      </div>
    </SiteShell>
  );
}
