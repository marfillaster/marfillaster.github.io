---
feed: false
href: "/solar-report/full-report"
eyebrow: "Full report · 2026-07"
title: "Full residential 6.5 kWp solar performance report — Cavite, Philippines"
description: >-
  Full hourly-data analysis of a 6.5 kWp / 14.3 kWh / 8 kW residential solar-plus-battery system in Cavite, Philippines: generation, self-sufficiency, recommendations, bill impact, ROI, battery health, and projections.
datePublished: "2026-05-01"
dateModified: "2026-08-01"
category: "Home & Energy"
---

# Solar System Recommendations

Based on analysis of solar data from December 2025 – July 2026 (242 days).

## Executive Summary

July recovered most of what June's wet-season onset took away: generation rose ~8% to ~25.4 kWh/day, household load eased ~5% to ~36.3 kWh/day, and self-sufficiency climbed ~7 points back to **~66%**. Grid import fell from 462 kWh to ~377 kWh, and the month's bill saving was **~₱12,100** at the new ₱16.00/₱9.27 tariff. The 6.5 kWp system holds a **~3.0-year payback** on ₱400,000 (~2.3 years remaining), cutting the annual bill ~68%.

The apparent drop in battery round-trip efficiency to ~92% is a month-boundary artefact, not degradation: July opened at 11% SOC and closed at 92%, leaving ~11.5 kWh charged but not yet discharged. Adjusted for that, July's efficiency is ~96% — in line with every prior month. No equipment faults were detected.

The most significant revision this month concerns PHEV charge timing. On closer inspection of the charging-day hourly profile, the midday surplus that recommendation assumed largely does not exist on charging days — the battery is only ~55–63% charged through the early afternoon, so a car charging then competes with the battery rather than soaking up spare solar. The highest-impact action is now **the overnight base load**, which costs ~₱25,000/year at full import price.

The system avoids **~5.4 tonnes of CO₂ a year**.

## System Profile

- **PV capacity**: 6.5 kWp, inverter: 8 kW AC (DC/AC ratio: 0.81 — inverter substantially oversized, large expansion headroom)
- **Battery**: 14.3 kWh nominal, ~14.2 kWh usable estimated (operating SOC range ~18%–82%)
- **EV/PHEV**: PHEV present; charging detected on 35 of 242 days, 9 of them in July (down from 12 in June)
- **Tariff**: Flat — ₱16.00/kWh import (current, effective July 2026); past months billed at their then-current rate (see monthly table)
- **Feed-in tariff**: ₱9.27/kWh (~58% of import rate)

## Alerts

### PV Generation Alerts

| Date | Daily PV (kWh) | Expected (kWh) | Deviation |
|---|---|---|---|
| 2026-07-29 | 7.3 | ~27.0 | −73% |

This is the only July day flagged, and its shape matches weather rather than a fault: generation is depressed across the whole daylight window rather than cutting off abruptly, and it falls in the heart of the wet season. Comparable days appear in June (2026-06-05 at −74%, 2026-06-30 at −69%). No action is needed unless a dip this deep recurs on a clear day, which would instead point to soiling or new shading.

### Battery Alerts

None in July. The month's headline efficiency of ~91.9% would normally warrant a look, but it is explained entirely by where the month happened to start and end. The battery sat at 11% SOC at 00:00 on 1 July and 92% at 23:00 on 31 July — roughly 11.5 kWh charged during July that will be discharged in August. Crediting that stored energy gives ~96.0%, squarely inside the 92–95% LFP band and consistent with the seven months before it. The two soft readings on record remain 2026-03-17 (78.7%) and 2026-05-17 (79.8%), both isolated and consistent with BMS recalibration.

## Recommendations

### 1. Trim the overnight base load (highest impact)

Between midnight and 07:00 the house draws ~4.3 kWh straight from the grid every night on ordinary days. The battery has nothing left to give by then — SOC bottoms at ~20–21% around 04:00–06:00 — so every one of those kilowatt-hours is bought at the full ₱16.00 rate with no feed-in trade-off to weigh against it. That is roughly **₱25,000 a year** flowing out during the hours the house is asleep.

The load floor itself is the problem: ~630–950 W sustained from 03:00 to 06:00 in July, and ~700 W across the whole small-hours window over the full dataset. A sleeping household should sit well below that. The usual causes are always-on draws — standby electronics, a pump, networking and CCTV gear, an ageing refrigerator cycling harder than it should. Every 100 W removed from that floor is ~2.4 kWh/day, or **~₱14,000/year**.

Implementation: run a plug-in energy meter across one week, one circuit at a time, starting with the refrigerator and the entertainment/networking cluster. Consolidate genuine standby loads onto switchable strips. This is the rare optimization that needs no behavioural change once done — the saving repeats every night whether anyone is home or not.

### 2. Start the PHEV charge earlier, but expect a modest gain

On the nine July charging days the house pulled ~23.3 kWh from the grid against ~7.6 kWh on ordinary days — an extra ~15.7 kWh at full price, and evening SOC bottomed at ~17% versus ~46% otherwise. The instinct is to move that charge into the midday solar window, and directionally that is still right: the charging load currently runs from ~13:00 to ~20:00, with its 5.2 kW peak at 14:00 and a long tail into the evening when PV is gone and the battery is already being drawn down.

The gain is smaller than previously estimated, and it is worth being precise about why. On charging days the battery is only at ~60% SOC at 13:00 and ~55% at 14:00 — it never fills, and the array exports nothing at all (0.0 kWh/day on July charging days). There is therefore no idle surplus for a midday charge to absorb; energy sent to the car at noon is energy the battery does not store, and would have returned to the house that evening at ~95% round-trip. The genuinely free surplus is only what actually leaves the property — ~17.9 kWh exported in all of July, worth about **₱120/month** at the ₱6.73 import/export spread if fully self-consumed. The earlier ₱4,000–6,000/year figure assumed a midday surplus that the charging-day data does not show.

What still helps is compressing the charge into 09:00–14:00 rather than letting it run to 20:00. That keeps the tail out of the 18:00–21:00 window where the battery is exhausted and every kWh comes from the grid at peak household draw, and it cuts the average charging-day peak grid draw (~4.2 kW in July, versus ~1.4 kW on ordinary days). Treat it as a demand-smoothing and comfort measure rather than a large financial win. Set the EVSE or in-cabin scheduler to start ~09:00 and stop by ~14:00.

### 3. Recognise that generation, not storage, is the constraint on charging days

On July charging days the array made ~28.5 kWh against ~51.5 kWh of load. No amount of retiming closes a gap that size, and no additional battery capacity helps either — the battery already cycles to ~61% depth and empties every charging evening because there is nothing left to fill it with. The only lever that would move this materially is more generation.

The inverter has unusual room for it: peak output has never exceeded 5.44 kW against an 8 kW AC rating (68%), with zero clipping hours recorded in 242 days and a DC/AC ratio of 0.81. Around 3–4 kWp could be added before the inverter becomes the limit. No roof expansion is assumed in this report, so nothing is modelled — but if roof area ever becomes available, the inverter will not be the obstacle.

### Not Recommended

- **Grid-charging the battery off-peak**: the tariff is flat at ₱16.00/kWh around the clock, so there is no cheap window to arbitrage. Grid-charging would only add round-trip losses.
- **A second or larger battery**: overall self-consumption is already ~93%, and projected annual export is only ~552 kWh. There is too little surplus to store for a second pack to pay back.
- **Chasing the July efficiency reading**: see the battery alert above — the dip is a calendar artefact, and acting on it would mean servicing a healthy battery.

## Bill Impact

### Monthly Electricity Cost Comparison

| Month | Rate (₱/kWh) | Without Solar | With Solar | Feed-in Credit | Net Savings |
|---|---|---|---|---|---|
| Dec 2025 | 14.41 | ₱13,424 | ₱6,133 | ₱0 | ₱7,291 |
| Jan 2026 | 14.13 | ₱11,736 | ₱4,697 | ₱0 | ₱7,039 |
| Feb 2026 | 13.80 | ₱10,609 | ₱2,871 | ₱682 | ₱8,420 |
| Mar 2026 | 14.14 | ₱12,464 | ₱2,928 | ₱983 | ₱10,520 |
| Apr 2026 | 14.98 | ₱17,542 | ₱5,585 | ₱208 | ₱12,165 |
| May 2026 | 15.50 | ₱18,633 | ₱5,599 | ₱128 | ₱13,162 |
| Jun 2026 | 16.10 | ₱18,539 | ₱7,443 | ₱47 | ₱11,144 |
| **Jul 2026** | **16.00** | **₱18,001** | **₱6,038** | **₱166** | **₱12,129** |

Each month is billed at the rate that actually applied then; the annual figures below are projected at today's ₱16.00/₱9.27.

- Estimated annual bill without solar: **₱194,558**
- Estimated annual bill with solar: **₱66,286**
- **Annual bill reduction: ₱132,289 (68%)**

July's saving recovered ~₱1,000 on June despite a marginally lower import rate, driven by the ~85 kWh drop in grid import. Feed-in credit remains a rounding error at ₱166 — the system exports so little that the export rate barely matters to the household economics.

## ROI Estimate

| Metric | Value |
|---|---|
| System cost | ₱400,000 |
| Estimated annual savings (year 1) | ₱132,289 |
| **Simple payback** | **3.0 years** |
| Remaining payback | 2.3 years |
| 25-year lifetime savings | ₱3,116,193 |

The battery (~₱100,000 of the total) moves ~8.7 kWh/day of discharge from cheap export at ₱9.27 to self-consumption displacing ₱16.00 import — a ~₱6.73/kWh spread worth roughly ₱21,000/year, for a standalone battery payback near ~4.7 years against a ~26-year projected cycle life. The panels carry most of the return, but the battery is comfortably justified. Payback is measured against a 25+ year panel lifespan, and the degradation-adjusted figure (0.5%/year) is marginally longer than a naive calculation.

Note that the ₱400,000 is the total invested figure, which includes financing cost; hardware-only cost would yield a shorter payback.

## Key Metrics

### July 2026

| Metric | Non-EV Days (22) | Charging Days (9) |
|---|---|---|
| Daily PV generation | ~24.2 kWh | ~28.5 kWh |
| Daily consumption | ~30.1 kWh | ~51.5 kWh |
| Daily grid import | ~7.6 kWh | ~23.3 kWh |
| Daily grid export | ~0.8 kWh | ~0.0 kWh |
| Evening SOC | ~46% | ~17% |
| Avg daily peak grid draw | ~1.4 kW | ~4.2 kW |

- Self-consumption rate: 98.0% (Jun), 94.8% (Jul) — the July uptick in export reflects better generation, not changed behaviour
- Self-sufficiency: 59.9% (Jun), 66.5% (Jul)
- Grid export is concentrated at 12:00–15:00 when the battery approaches full (~76–79% SOC)
- The battery drains from ~52% in the early evening to ~20% by dawn on ordinary days (a ~32-point drain)
- On charging days the battery reaches only ~55–63% at midday and bottoms at ~15–17%, forcing heavy evening grid import
- Charging days generate *more* than ordinary days (~28.5 vs ~24.2 kWh) — charging is clustered on good-weather days, which slightly flatters the charging-day PV figure

### Hourly Patterns

- PV ramps from ~07:00, peaks 09:00–14:00 in the ~2.3–3.7 kW band, and is effectively finished by 17:00
- Household load on ordinary days peaks at ~1.9–2.0 kW at 14:00–15:00 and again stays high through the evening, well after PV has tapered
- On charging days load jumps to 4.6–5.2 kW at 13:00–15:00 and stays above 2 kW until ~20:00 — the charge window overlaps only the back half of the solar day
- The battery finishes charging around 13:00–14:00 on ordinary days (~76–79% SOC), which is exactly when the small export window opens
- Overnight grid import runs ~0.6–0.75 kWh every hour from 22:00 to 06:00, totalling ~4.3 kWh/night at full import price
- Morning SOC bottoms at ~20% around 05:00–06:00 on ordinary days, ~15% on charging days

### Weekday vs Weekend

Weekday and weekend consumption patterns are similar (~30.2 vs ~31.5 kWh/day, 69% vs 72% self-sufficiency). The only notable difference is a daytime shift: weekend load runs 210–350 W higher between 10:00 and 15:00, when someone is home and PV is at its strongest — which is why weekend self-sufficiency is marginally better despite higher consumption. Load-shifting advice is therefore easier to act on at weekends; weekday changes need timer-based automation.

### Peak Demand

- Peak grid draw: 9.1 kW on 2026-05-15 at 18:00 (a non-charging day) — dataset-wide maximum
- Average daily peak: ~1.8 kW on ordinary days, ~5.3 kW on charging days across the full dataset (~1.4 kW and ~4.2 kW respectively in July)
- Peak PV output: 5.4 kW on 2026-03-15 at 12:00 — 68% of inverter AC capacity, 84% of panel nameplate
- No clipping recorded against either the panel nameplate or the inverter in 242 days

## System Size Assessment

No roof expansion is assumed in this report.

### PV Array (6.5 kWp): correctly sized for base load, short on charging days

- Peak output reached 5,436 W (84% of nameplate, 68% of inverter capacity)
- Zero clipping hours against either limit — output has never been constrained by equipment
- Peak sun hours range from ~2.5/day in December to ~4.3/day in April–May; July at ~3.9
- Non-charging PV/load ratio of ~0.76 means the array covers roughly three-quarters of ordinary household demand outright
- On charging days the array covers ~55% of load (~28.5 kWh against ~51.5 kWh) — the deficit is generation, not timing or storage

### Battery (14.3 kWh): adequate on ordinary days, not the bottleneck

- Ordinary days cycle to ~61% depth, charging ~9.1 kWh and discharging ~8.7 kWh — meaningful headroom remains
- Charging days cycle to the same ~61% depth but from a lower ceiling, and empty by evening; a larger pack would have nothing extra to store
- Avoidable import averages ~1.4 kWh/day across the dataset (~344 kWh total), which bounds what better battery scheduling could recover
- Round-trip efficiency observed at 94.5–98.3% across the first seven months; July's ~92% reading resolves to ~96% once the month-boundary SOC gain is credited

### Verdict

The system is well-sized for how the household actually uses it. Storage is not the limiting factor, and the inverter has never been the limiting factor. Ordinary days already run at ~75% self-sufficiency and the remaining import is concentrated overnight, where no amount of generation or storage retiming reaches it — only load reduction does. Charging days are limited by total generation, which only more panels would address. Optimization therefore lies in the overnight load floor first, charge scheduling second.

## Battery Health

- Nominal capacity: 14.3 kWh, estimated usable: ~14.2 kWh (99% of nominal)
- Round-trip efficiency: 94.5–98.3% over the first seven months; July's raw ~91.9% is a calendar artefact and resolves to ~96.0% adjusted for the 11%→92% SOC swing across the month boundary
- Daily equivalent full cycles: ~0.61 (~224 per year); ~157 cycles used to date
- Estimated cycle life remaining: ~26 years at current usage (based on a 6,000-cycle LFP rating)

There is no efficiency trend to act on. Eight months of readings sit in a band consistent with a healthy LFP pack, and the one out-of-band month has a mechanical explanation. This is worth re-checking in the August report, where the reverse artefact should appear — August opens with a nearly full battery and will discharge energy it did not charge, which should push its raw efficiency *above* the true value.

## Month-over-Month Trends

| Metric | Jun 2026 | Jul 2026 | Change |
|---|---|---|---|
| Avg daily PV | ~23.4 kWh | ~25.4 kWh | +8% |
| Avg daily load | ~38.4 kWh | ~36.3 kWh | −5% |
| Self-sufficiency | 59.9% | 66.5% | +7pp |
| Grid dependence | 40% | 34% | −7pp |
| Battery efficiency (raw) | 96.2% | 91.9% | −4.3pp |

July's improvement comes from both sides at once: better generation and lighter consumption. The generation recovery is modest against the dry-season peak (~27.8 kWh/day in May) and consistent with a wet-season month that had fewer washouts than June — six deeply overcast days in June versus one in July. The load easing tracks the drop in charging days, from 12 in June to 9 in July. Neither change looks structural; expect August to sit in the same wet-season band.

The battery efficiency line is the one number in this table not to read at face value — see Battery Health above.

## Annual Projection

- Data coverage: 8 months (high confidence)
- Seasonal context: December–July covers both the dry-season peak and the first two wet-season months; de-seasonalized baseline ~23.1 kWh/day
- Projected annual generation: ~8,432 kWh (year 1), ~8,020 kWh (year 10), ~7,439 kWh (year 25)
- Projected annual self-consumed: ~7,880 kWh
- Projected annual grid export: ~552 kWh
- Environmental impact: ~5.4 tonnes CO₂ avoided annually (at 0.68 kg CO₂/kWh), equivalent to ~244 trees planted or ~25,500 km not driven

The tropical seasonal profile is shallow compared with temperate latitudes — the spread between the dry-season peak (~27.8 kWh/day in May) and the wet-season floor (~23.4 kWh/day in June) is only ~16%, against the 2–3× swing a temperate installation sees. August through November should stay in the wet-season band before recovering from December. With eight months covering both seasons, this projection is now on a firm footing; the main remaining uncertainty is how deep the August–October wet season runs.

## Methodology Notes

This section documents the heuristics, assumptions, and caveats behind the computations. All numerical results are produced by a deterministic script; the items below describe modelling choices that affect interpretation.

### Data Processing
- Energy values assume 1-hour buckets (each row = 1 hour). Days with ≤20 of 24 hourly rows are excluded from daily statistics as partial days.
- Self-consumed energy is calculated as `total_load − grid_import`, which measures actual solar offset and avoids inflating the figure with battery round-trip losses.
- **July data completeness**: 159 of 8,928 expected five-minute samples are missing from the source data, 101 of them during dark hours. Hourly energy is summed over the samples present rather than interpolated, so gaps are dropped rather than estimated. This understates July generation by ~1.25% (~9.8 kWh) overall, concentrated on 2026-07-07 (~10%), 2026-07-09 (~8%), and 2026-07-21 (~6%). Day-level comparisons involving those three dates should allow for it; monthly figures are essentially unaffected.

### EV Detection
- Charging days are detected using a threshold of 10.0 kWh above the 33.3 kWh daily average (formula: `max(8, avg_daily_load × 0.3)`).
- Days near the threshold may be misclassified, and the heuristic cannot distinguish PHEV charging from other high-load events such as guests or extended aircon use.

### Battery Analysis
- **Usable capacity** is estimated from the deepest monotonic SOC decline per day, using only days with >30% SOC swing (220 qualifying days). BMS-reported SOC may not be linear at extremes.
- **Round-trip efficiency** is computed on monthly aggregates. Where SOC differs materially between the start and end of a month, the raw figure is skewed — July is a clear instance, and the adjusted value is given alongside it.
- **Avoidable import** is a daily upper-bound estimate that overstates the recoverable amount, since it ignores hourly timing mismatches.

### Anomaly Detection
- **PV anomalies**: days generating <60% of the rolling 14-day mean (first 3 days excluded). Weather and equipment faults are indistinguishable to this test.
- **Load anomalies**: non-charging days exceeding the mean by more than 2 standard deviations. None were flagged in the dataset.
- **Battery anomalies**: days with round-trip efficiency <80% where start and end SOC are within 5% and charging exceeds 1 kWh.

### Financial Estimates
- Past months are billed at the rate in effect that month; the annual projection and ROI use the current ₱16.00/₱9.27 tariff.
- Feed-in credit applies a flat rate regardless of time of day.
- ROI uses 0.5%/year panel degradation. It does not model inverter replacement (~10–15 years), battery degradation beyond cycle count, or electricity price inflation — the last of which is conservative, since the import rate has risen ~11% across the eight months tracked.
- Battery cycle life uses a 6,000-cycle LFP rating. Actual life varies with depth of discharge, temperature, and charge rate; calendar ageing is not modelled.

### Projections
- The annual projection de-seasonalizes observed data using tropical seasonal factors (dry months ×1.07, wet ×0.93, transitional ×1.0), then re-applies all 12 months, assuming 30.44 days/month.
- Additional-panel scenarios are not modelled in this report.

### Environmental
- Avoided CO₂ is computed as self-consumed kWh × grid factor, not gross PV × grid factor. This is conservative — exported kWh also displace grid generation.
- Carbon equivalents use fixed values: 22 kg CO₂/tree/year and 0.21 kg CO₂/km.

## Appendix

### Best and Worst Days

**Best day: 2026-03-19** — PV: 30.0 kWh, Load: 25.5 kWh, Import: 1.4 kWh, Export: 6.4 kWh. Non-charging day. Peak dry-season generation met a light load, filling the battery to 100% and leaving genuine surplus to export. Self-sufficiency: 95%.

**Worst day: 2026-01-02** — PV: 4.7 kWh, Load: 15.6 kWh, Import: 12.5 kWh, Export: 0. Non-charging day. A near-total generation washout in the lowest-sun month; the battery never rose above 30% and the grid carried the day. Self-sufficiency: 20%.

**July's worst: 2026-07-29** — PV: 7.3 kWh against ~27 expected. A wet-season washout, described in Alerts above.

### Capacity Factor

| Month | Avg Daily kWh | Peak Sun Hours | Capacity Factor | Grid Dependence |
|---|---|---|---|---|
| Dec 2025 | 16.5 | 2.5 | 10.5% | 46% |
| Jan 2026 | 16.7 | 2.6 | 10.7% | 40% |
| Feb 2026 | 23.6 | 3.6 | 15.1% | 27% |
| Mar 2026 | 27.2 | 4.2 | 17.4% | 23% |
| Apr 2026 | 27.6 | 4.3 | 17.7% | 32% |
| May 2026 | 27.8 | 4.3 | 17.8% | 30% |
| Jun 2026 | 23.4 | 3.6 | 15.0% | 40% |
| Jul 2026 | 25.4 | 3.9 | 16.3% | 34% |

### Next Steps

- Meter the overnight load floor over one week per Recommendation 1 — this is now the largest identified saving and the only one that repeats every night
- Configure the EVSE schedule for a 09:00–14:00 window and compare next month's charging-day evening import and peak draw
- Re-run this analysis after August to extend wet-season coverage; expect August's raw battery efficiency to read *high* as the mirror image of July's artefact
- Continue tracking monthly round-trip efficiency; flag genuinely if an adjusted figure drops below 90%
- Watch whether the import rate keeps climbing — it has risen from ₱14.41 to ₱16.00 in eight months, which shortens payback further than modelled

### Disclaimer

This report was generated by an AI model. While the numerical computations are performed by a deterministic script (`analyze.py`), the narrative interpretation, recommendations, and contextual inferences (seasonal factors, grid emission factors, sizing assessments) are AI-generated and may contain inaccuracies. Verify critical findings — especially financial estimates and equipment diagnostics — against your own records, manufacturer specifications, or a qualified solar professional before making decisions based on this report.

### Data Sources

- `data/solar_hourly_2025-12.csv` — 31 days
- `data/solar_hourly_2026-01.csv` — 31 days
- `data/solar_hourly_2026-02.csv` — 28 days
- `data/solar_hourly_2026-03.csv` — 30 days
- `data/solar_hourly_2026-04.csv` — 30 days
- `data/solar_hourly_2026-05.csv` — 31 days
- `data/solar_hourly_2026-06.csv` — 30 days
- `data/solar_hourly_2026-07.csv` — 31 days
