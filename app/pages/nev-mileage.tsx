// Port of src/routes/nev-mileage.tsx (PHEV report summary). Meta and copy
// unchanged; Link → <a>.

import type { Handle } from "remix/ui";
import { ogVersion } from "../../src/content/nev-og-version.ts";
import type { MetaDescriptor } from "../head.ts";
import { Comments, SiteShell } from "../components.tsx";
import { PageStats, ShareLinks } from "../interactive.tsx";

const title =
  "BYD Sealion 6 PHEV mileage & running-cost report — Cavite, Philippines (Dec 2025–Jul 2026)";
const description =
  "Real-world EV/PHEV efficiency, electric-vs-fuel running cost, usage split, and battery health from a BYD Sealion 6 tracked over 9,600 km in Cavite, Philippines. Links to the full report and raw markdown.";
const url = "https://blog.homestack.space/nev-mileage/";
const ogImage = `https://blog.homestack.space/nev-mileage/og-image.png?v=${ogVersion}`;
const author = "Ken Marfilla";
const datePublished = "2026-05-15";
const dateModified = "2026-08-02";

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

export const nevMileageDescriptors: MetaDescriptor[] = [
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
  "9,600 km tracked",
  "65% EV usage",
  "Cavite, Philippines",
];

const headlineMetrics = [
  {
    label: "Combined efficiency",
    value: "5.79 L/100km",
    note: "beats the 8–10 L/100km class benchmark",
  },
  {
    label: "EV running cost",
    value: "₱2.62/km",
    note: "vs ₱5.92/km on fuel — 56% cheaper",
  },
  {
    label: "Saved vs ICE",
    value: "₱16,600",
    note: "tracked window only · ≈760 kg CO₂ avoided",
  },
  {
    label: "Battery health",
    value: "99% SOH",
    note: "after ~59 metered charge cycles",
  },
];

const cumulative = [
  {
    mode: "HEV (fuel)",
    distance: "3,360 km",
    energy: "305.44 L",
    efficiency: "9.09 L/100km",
    costPerKm: "₱5.92",
  },
  {
    mode: "EV (electric)",
    distance: "6,240 km",
    energy: "1,087.50 kWh",
    efficiency: "5.74 km/kWh",
    costPerKm: "₱2.62",
  },
  {
    mode: "Combined",
    distance: "9,600 km",
    energy: "—",
    efficiency: "5.79 L/100km*",
    costPerKm: "₱3.77",
  },
];

export function NevMileagePage(_: Handle) {
  return () => (
    <SiteShell>
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Case study · BYD Sealion 6 · Cavite, PH · Dec 2025 – Jul 2026
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            PHEV running cost — eight months of tracked driving
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Owned since September 2024; consistent refuel-by-refuel tracking
            started in December 2025. This covers the 9,600 km logged so far
            (Dec 2025 – Jul 2026) — a slice of the ~32,000 km lifetime
            odometer — with odometer- and meter-tracked efficiency,
            electric-vs-fuel running cost, usage split, and battery health for
            a BYD Sealion 6.
          </p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={datePublished}>Published 15 May 2026</time>
            <PageStats path="/nev-mileage/" title={title} />
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {vehicleChips.map((chip) => (
              <li className="rounded-full border px-2.5 py-1 font-mono">{chip}</li>
            ))}
          </ul>

          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <a
              href="/nev-mileage/full-report"
              className="underline underline-offset-4 hover:text-primary"
            >
              Read the full report →
            </a>
            <a
              href="/nev-mileage/full-report.md"
              download
              className="underline underline-offset-4 hover:text-primary"
            >
              Download raw markdown ↓
            </a>
          </p>

          <p className="mt-8 border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground">
            The short version: 65% of the driving was electric, the combined
            figure landed at 5.79 L/100km, and electric kilometers cost less
            than half what fuel kilometers do (₱2.62 vs ₱5.92/km). The headline
            efficiency means little on its own — the real variable is the
            EV/HEV split, which is a function of charging access and
            discipline, not the car. Your numbers will move with where you can
            plug in, not your right foot. Read any single tank's efficiency
            with care, too: the car meters mains charging but not regen or
            engine-generated charge, so one interval's figure depends heavily
            on where it started in the charge cycle. The home charging
            behind this is solar-fed; that side is written up separately:{" "}
            <a
              href="/solar-report/"
              className="underline underline-offset-4 hover:text-primary"
            >
              Residential solar performance
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
            The split between electric and fuel driving climbed steadily from
            ~48% EV to a peak of ~76% by June 2026, and has been trip-driven
            since: 74%, then 38% on a road-trip tank, then 67% in July. EV
            kilometers cost ₱2.62 each against ₱5.92 on fuel, so every
            kilometer shifted onto electric saves about ₱3.30 at the current
            tariff — a wider gap than six months ago, because pump prices have
            climbed to ₱82.30/L from ₱53.04/L across the tracked period. That
            price rise, not the car, is what has moved running cost from
            ₱3.24/km in March to ₱4.76/km in July.
          </p>
          <p className="mt-3">
            The ₱16,600 saved vs ICE above only covers the 9,600 km actually
            logged — it excludes the ~22,421 km driven between acquisition
            (Sep 2024) and when tracking started (Dec 2025), which has no
            recorded fuel/EV split. Extrapolating the tracked period's
            average cost/km across the full 32,021 km lifetime odometer puts
            estimated lifetime savings at roughly ₱55,300 — a rough estimate
            that assumes the untracked driving had a similar EV/fuel mix and
            pricing, not a measured figure.
          </p>
          <p className="mt-3">
            Combined consumption of 5.79 L/100km comfortably beats the 8–10
            L/100km benchmark for mid-size SUV PHEVs and undercuts a
            comparable ICE SUV by roughly 33–48% on running cost. Fuel
            efficiency held in a tight 8.1–9.5 L/100km band for seven
            intervals, then read 11.57 L/100km on a tank covering a provincial
            round trip. Trip telemetry from those same days puts the
            charge-sustaining driving at about 14.8 km/L on both legs, well
            ahead of the 11.0 km/L cumulative figure — so the tank reads
            thirsty because of how the car apportions distance between its
            two modes, not because the driving was wasteful.
          </p>
          <p className="mt-3">
            Battery state of health is 99% after ~59 metered charge cycles
            (real cycling is higher — engine-generated charge is not metered),
            and the
            next scheduled service lands around 40,000 km or ~September
            2026 — whichever comes first, roughly two months out at the
            current pace.{" "}
            <a
              href="/nev-mileage/full-report#ai-analysis"
              className="underline underline-offset-4 hover:text-primary"
            >
              See recommendations →
            </a>
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
                  <tr className="border-b last:border-b-0">
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
            Total spend so far is ₱36,222 over 9,600 km.
          </p>
          <p className="mt-6 text-sm">
            <a
              href="/nev-mileage/full-report"
              className="underline underline-offset-4 hover:text-primary"
            >
              Full analysis · trends · anomalies · projections →
            </a>
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
