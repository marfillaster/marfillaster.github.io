---
feed: false
href: "/solar-report/full-report"
eyebrow: "Full report · 2026-08"
title: "Full residential 6.5 kWp solar performance report — Cavite, Philippines"
description: >-
  Full hourly-data analysis of a 6.5 kWp / 14.3 kWh / 8 kW residential solar-plus-battery system in Cavite, Philippines: generation, self-sufficiency, recommendations, bill impact, ROI, battery health, and projections.
datePublished: "2026-05-01"
dateModified: "2026-09-04"
category: "Home & Energy"
---

# Solar System Recommendations

Based on analysis of solar data from December 2025 – August 2026 (273 days).

## Executive Summary

August was the weakest month on record: a multi-week monsoon cut generation to ~15.8 kWh/day, ~38% below July, and self-sufficiency fell ~15 points to **~51.8%** — below December's ~54.3%, the previous floor. Grid import rose to ~440 kWh and the month's bill saving dropped to **~₱8,150** despite the tariff rising to ₱16.75/kWh. Household load fell ~19% to ~29.5 kWh/day over the same period, with only 4 charging days against July's 9, which cushioned the loss considerably.

None of this is an equipment problem. The monsoon produced widespread flooding across Luzon and was an exceptional event rather than a normal wet season; the eleven August days flagged as low-generation anomalies all fall inside it, and the battery's raw 105.8% round-trip efficiency is the month-boundary artefact anticipated last month — the mirror of July's 91.9%. Adjusted for the ~9.5 kWh the battery carried into August and discharged, the month reads **~99%**, in line with every prior month.

The system remains on a **~3.0-year payback** on ₱400,000 (~2.2 years remaining), cutting the annual bill ~66%. The overnight load floor is still the largest addressable saving, and a wet month makes the case stronger rather than weaker: when generation collapses, the overnight draw is the one load that neither panels nor battery can reach.

The system avoids **~5.2 tonnes of CO₂ a year**.

## System Profile

- **PV capacity**: 6.5 kWp, inverter: 8 kW AC (DC/AC ratio: 0.81 — inverter substantially oversized, large expansion headroom)
- **Battery**: 14.3 kWh nominal, ~14.2 kWh usable estimated (operating SOC range ~17%–79%)
- **EV/PHEV**: PHEV present; charging detected on 42 of 273 days, 4 of them in August (down from 9 in July)
- **Tariff**: Flat — ₱16.75/kWh import (current, effective August 2026); past months billed at their then-current rate (see monthly table)
- **Feed-in tariff**: ₱9.23/kWh export credit (~55% of import rate)
- **Location**: Cavite, Philippines — tropical, ~14.4°N

## Alerts

### PV Generation Alerts

Eleven August days generated less than 60% of their rolling baseline, the largest cluster in the dataset. All of them sit inside the multi-week monsoon recorded in `data/month_notes.md` — the event that flooded much of Luzon and had not fully receded by early September.

| Date | Daily PV (kWh) | Expected (kWh) | Deviation |
|---|---|---|---|
| 2026-08-29 | 1.4 | ~19.7 | −93% |
| 2026-08-08 | 4.7 | ~17.3 | −73% |
| 2026-08-13 | 4.5 | ~15.3 | −71% |
| 2026-08-05 | 6.4 | ~21.1 | −70% |
| 2026-08-14 | 4.7 | ~13.9 | −66% |
| 2026-08-02 | 9.4 | ~24.5 | −62% |
| 2026-08-06 | 8.4 | ~19.4 | −57% |
| 2026-08-28 | 8.5 | ~19.4 | −56% |
| 2026-08-07 | 8.0 | ~17.9 | −55% |
| 2026-08-17 | 6.8 | ~13.0 | −48% |
| 2026-08-04 | 11.8 | ~22.1 | −46% |

**No action is indicated.** These days carry the signature of weather rather than a fault: output is suppressed across the entire daylight window rather than cutting off abruptly, the dips cluster in consecutive runs (Aug 4–8, Aug 13–14, Aug 28–29) as weather systems do, and the array recovered to ~29.3 kWh on 31 August — a figure a degraded or partly shaded array could not reach. The anomaly test compares each day to its own trailing 14-day mean and cannot separate cloud from equipment; in a month like this it will flag heavily by design.

The one day worth naming is **2026-08-29 at 1.4 kWh** (−93%). That is the deepest single-day dip in 273 days. It still reads as weather — the neighbouring days are also depressed and the following day recovered to ~13.1 kWh — but if a dip that severe ever recurs on a clear day, that would point to soiling or new shading and warrant an inverter log check.

### Battery Alerts

- **2026-08-01**: round-trip efficiency 68.5% on 2.3 kWh charged and 1.5 kWh discharged. The throughput is too small for the ratio to mean anything; a single partial cycle at the end of a near-full battery produces figures like this. Not a concern.

Two comparable days appear earlier in the dataset (2026-03-17 at 78.7%, 2026-05-17 at 79.8%), both isolated. There is no pattern.

## Recommendations

### 1. Meter and cut the overnight load floor (highest impact)

The household draws ~738 W through the small hours of August (01:00–05:00) and ~779 W across the full dataset. That floor runs every night regardless of weather, and it is the only significant load that neither the panels nor the battery can offset by retiming — by 02:00 the battery is typically at ~20% SOC and the remainder comes from the grid at full import price.

August makes the cost of this plain. In a month when generation collapsed, the overnight draw did not: it accounted for roughly 3.7 kWh per night, ~115 kWh across the month, or ~₱1,900 at the new rate. Annualised, every 100 W removed from that floor is ~2.4 kWh/day and **~₱14,700/year** at ₱16.75/kWh. Removing 300 W — plausible if the cause is standby electronics plus one mis-cycling appliance — is ~₱44,000/year, which would pull roughly nine months off the remaining payback (2.2 years down to ~1.5).

The floor has held between ~700 and ~780 W for nine months, so this is a fixed draw rather than a seasonal one. Identifying it needs measurement, not inference: a plug-in power meter moved around the house over a week, or a clamp meter on individual circuits, will separate the refrigerator from networking gear, CCTV, pumps and standby loads. Start with anything that runs a compressor or a motor, then anything with a permanently lit LED.

### 2. Keep charging inside the 09:00–14:00 window

Charging days now average ~48.4 kWh of load against ~24.8 kWh of generation, and the battery reaches evening at ~22% SOC against ~47% on ordinary days. The average peak grid draw on charging days is ~5.6 kW against ~1.8 kW otherwise.

Charging is currently spread across 06:00–21:00. The hours that matter are the tail: any charge still running after ~18:00 draws from an exhausted battery at the same time as the evening household peak, which is what produces the ~5.6 kW figure. Compressing the session into 09:00–14:00 puts it against the six-hour peak generation window (09:00–14:00) and keeps it clear of the evening.

The financial gain here is modest — with the feed-in credit at ~55% of import, moving a kWh from grid-import to self-consumption is worth ~₱7.52, and the array rarely has genuine surplus on charging days anyway. Treat this as demand smoothing and evening comfort rather than a large saving. Set the EVSE or in-cabin scheduler to start ~09:00 and stop by ~14:00.

### 3. Recognise that generation, not storage, is the constraint

On August charging days the array made ~21.0 kWh against ~46.2 kWh of load. Even on ordinary August days it made ~15.0 kWh against ~27.0 kWh. No retiming closes gaps of that size, and no additional battery helps: the battery already cycles to ~58% depth and reached its 10–11% floor on most August days because there was nothing available to charge it with. Avoidable import — the ceiling on what better battery scheduling could recover — is ~1.3 kWh/day, ~₱8,000/year, and that is an upper bound.

The inverter has unusual room for more generation: peak output has never exceeded 5.44 kW against an 8 kW AC rating (68%), with zero clipping hours in 273 days and a DC/AC ratio of 0.81. Roughly 3–4 kWp could be added before the inverter becomes the limit. No roof expansion is assumed here so nothing is modelled, but if roof area becomes available, the inverter will not be the obstacle — and a wet season this deep is the argument for it, since extra capacity earns most on marginal-light days.

### Not Recommended

- **Grid-charging the battery off-peak**: the tariff is flat at ₱16.75/kWh around the clock, so there is no cheap window to arbitrage. Grid-charging would only add round-trip losses.
- **A second battery**: export totals ~311 kWh across 273 days (~1.1 kWh/day). There is almost nothing spare to store, and in the wet season there is nothing at all.
- **Reacting to August's generation figures**: the array performed correctly for the light available. Cleaning, re-tilting or servicing on the strength of a monsoon month would spend money against weather.

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
| Jul 2026 | 16.00 | ₱18,001 | ₱6,038 | ₱166 | ₱12,129 |
| **Aug 2026** | **16.75** | **₱15,302** | **₱7,371** | **₱217** | **₱8,148** |

Each month is billed at the rate in effect that month. August's ₱8,148 is the weakest saving since January, and the fall is larger than it looks: the rate rose to ₱16.75, so the same solar contribution should have been worth *more*. The saving fell because the array delivered ~300 kWh less than July while the grid made up the difference at the highest rate yet charged.

- Estimated annual bill without solar: ₱201,008
- Estimated annual bill with solar: ₱71,369
- **Annual bill reduction: ₱133,476 (66%)**

The annual figures are projected at today's ₱16.75/₱9.23 tariff. Annual reduction has slipped from ~68% to ~66% with August's data added, which is the wet season asserting itself in the average rather than any change in system behaviour.

## ROI Estimate

| Metric | With Battery | Without Battery |
|---|---|---|
| System cost | ₱400,000 | ₱300,000 |
| Estimated annual savings (year 1) | ₱133,476 | ₱114,871 |
| **Simple payback** | **3.0 years** | **2.6 years** |
| Remaining payback | 2.2 years | 1.8 years |
| 25-year lifetime savings | ₱3,144,154 | ₱2,705,887 |

**Battery incremental ROI**: the battery (~₱100,000 of the total) shifts ~8.3 kWh/day of discharge from export at ₱9.23 to self-consumption displacing ₱16.75 import — a ~₱7.52/kWh spread worth ~₱18,600/year, giving a standalone battery payback near **~5.4 years** against a ~27-year projected cycle life.

That is a longer battery payback than last month's ~4.7-year estimate, and the reason is August: battery throughput fell to ~140 kWh charged against July's ~281 kWh, because a monsoon leaves little surplus to store. The battery earns its return from surplus generation, so a wet season suppresses its incremental case specifically while barely touching the panels'. Expect the figure to move back toward ~4.7 years as dry-season months re-enter the average. The panels carry most of the return either way, and the battery remains justified over its life.

Payback is measured against a 25+ year panel lifespan. The ₱400,000 is the total invested figure including financing cost; hardware-only cost would yield a shorter payback.

## Key Metrics

| Metric | Non-EV Days | EV Days |
|---|---|---|
| Daily PV generation | ~22.2 kWh | ~24.8 kWh |
| Daily consumption | ~30.1 kWh | ~48.4 kWh |
| Daily grid import | ~9.4 kWh | ~23.9 kWh |
| Daily grid export | ~1.3 kWh | ~0.3 kWh |
| Evening SOC | ~47% | ~22% |

- Self-consumption rate: ~93.7% across the dataset — 94.8% (Jul), 96.9% (Aug)
- Self-sufficiency: 66.5% (Jul), 51.8% (Aug) — August is the dataset low, below December's 54.3%
- Grid export concentrated at 12:00–15:00 when the battery is full; in August there was almost no such window
- Battery drains from ~50% to ~20% overnight on ordinary days (~30 points); on charging days it starts the night at ~24% and reaches ~15%
- Charging days still generate slightly *more* than ordinary days (~24.8 vs ~22.2 kWh) — charging clusters on better-weather days, which flatters the charging-day PV figure
- Ordinary-day load (~30.1 kWh) exceeds generation (~22.2 kWh), giving a PV/load ratio of 0.74 across the dataset

### Hourly Patterns

- Peak generation runs 09:00–14:00, with output topping out at 5.44 kW (2026-03-15, 12:00) — 84% of panel nameplate, 68% of inverter capacity
- Ordinary-day load peaks around midday to mid-afternoon (~1.8–2.0 kW) and again in the evening, while the overnight floor sits at ~700–780 W
- Charging draw appears across 06:00–21:00, far wider than the generation window, which is what pushes charging-day peak grid draw to ~5.6 kW
- Export occurs only in the 12:00–15:00 window and only once the battery is near full — ~1.1 kWh/day averaged over the dataset
- Overnight import runs from roughly 18:00 through 06:00, when the battery is exhausted and generation is zero
- Peak grid draw across the whole dataset was 9.1 kW on 2026-05-15 at 18:00, on an ordinary day — an evening coincidence of household loads, not charging

### Weekday vs Weekend

Weekday and weekend consumption are similar (~29.7 vs ~30.9 kWh/day, 68% vs 71% self-sufficiency). The difference sits in daytime shape: weekend load runs 220–360 W higher from 10:00 to 15:00, when occupants are home and generation is at its peak, which is why weekends convert slightly more of the array's output directly. This is why load-shifting advice is more practical at weekends; weekday gains need timer-based automation instead.

### Peak Demand

- Peak grid draw: 9.1 kW on 2026-05-15 at 18:00 (ordinary day)
- Average daily peak: ~1.8 kW (ordinary), ~5.6 kW (charging days)
- Peak PV output: 5.4 kW on 2026-03-15 at 12:00 (68% of inverter capacity)
- No inverter limiting observed at any point in 273 days

## System Size Assessment

No roof expansion is assumed in this report.

### PV Array (6.5 kWp): correctly sized for base load, short in the wet season

- Peak output reached 5,436 W (84% of nameplate, 68% of inverter capacity)
- Zero clipping hours against either panel nameplate or inverter AC rating across 273 days
- Peak sun hours ranged from 2.4/day (August) to 4.3/day (April–May); dataset average 3.48
- Ordinary-day PV/load ratio is 0.74 — generation covers roughly three-quarters of an ordinary day's consumption
- On charging days the array covers ~51% of load (~24.8 kWh against ~48.4 kWh) — the deficit is generation, not timing or storage
- August exposed the floor: at ~15.8 kWh/day the array covered ~54% of a reduced ~29.5 kWh/day load

### Battery (14.3 kWh): adequate, and not the bottleneck

- Ordinary days: ~8.6 kWh charged, ~8.2 kWh discharged, ~58% cycle depth — meaningful headroom remains on a typical day
- Charging days: ~59% cycle depth, emptying every evening because generation runs out before the battery fills
- August: ~140 kWh charged against July's ~281 kWh — the battery spent the month cycling in a narrow low band with nothing to store
- Round-trip efficiency ~95–99% once month-boundary carry-over is accounted for
- Avoidable import averages ~1.3 kWh/day (~359 kWh total), bounding what better scheduling could recover

### Verdict

The system is well-sized for how the household actually uses it, and August did not change that assessment — it stress-tested it. Storage has never been the limiting factor and the inverter has never come close. Ordinary days still run near ~75% self-sufficiency in normal weather, with residual import concentrated overnight where only load reduction reaches it. Charging days and monsoon weeks are both limited by total generation, which only more panels would address. Optimization lies in the overnight load floor first, charge scheduling second, and added capacity third if roof area appears.

## Battery Health

- Nominal capacity: 14.3 kWh, estimated usable: ~14.2 kWh (99% of nominal)
- Daily equivalent full cycles: ~0.58 (~213 per year); ~169 cycles used to date
- Estimated cycle life remaining: ~27 years at current usage (based on a 6,000-cycle LFP rating)

Raw monthly round-trip efficiency is distorted whenever a month starts and ends at very different states of charge, because energy charged in one month is discharged in the next. Adjusting for that carry-over using the ~14.2 kWh usable estimate:

| Month | Raw | SOC start → end | Carry-over | Adjusted |
|---|---|---|---|---|
| Dec 2025 | 98.3% | 23% → 20% | −0.5 kWh | 98.1% |
| Jan 2026 | 96.7% | 17% → 46% | +4.1 kWh | 98.3% |
| Feb 2026 | 96.3% | 42% → 22% | −2.9 kWh | 95.3% |
| Mar 2026 | 94.5% | 22% → 53% | +4.4 kWh | 95.8% |
| Apr 2026 | 98.0% | 22% → 21% | −0.1 kWh | 97.9% |
| May 2026 | 97.4% | 21% → 11% | −1.4 kWh | 96.9% |
| Jun 2026 | 96.2% | 11% → 11% | ±0.0 kWh | 96.2% |
| Jul 2026 | 91.9% | 11% → 92% | +11.5 kWh | 95.8% |
| **Aug 2026** | **105.8%** | **91% → 24%** | **−9.5 kWh** | **99.1%** |

August's impossible 105.8% is the exact mirror of July's depressed 91.9%: the battery entered August nearly full with energy the July meter had already counted as charged, then discharged it. Adjusted, the nine-month range is 95.3%–99.1% with no downward trend — healthy for LFP, which is typically rated 92–95%. The August adjusted figure sits at the top of the range partly because the month's low throughput (~140 kWh) makes the ratio more sensitive to the carry-over estimate; it should not be read as an improvement.

## Month-over-Month Trends

| Metric | Jul 2026 | Aug 2026 | Change |
|---|---|---|---|
| Avg daily PV | ~25.4 kWh | ~15.8 kWh | −38% |
| Avg daily load | ~36.3 kWh | ~29.5 kWh | −19% |
| Self-sufficiency | 66.5% | 51.8% | −15pp |
| Grid dependence | 34% | 48% | +15pp |
| Battery efficiency (adjusted) | 95.8% | 99.1% | +3.3pp |

The generation fall is weather. The load fall is behavioural: consumption dropped ~211 kWh month-over-month, of which roughly 92 kWh is the five fewer charging days (each adds ~18.3 kWh over an ordinary day) and the remainder a broad easing across the household. Those two moves partly cancel — had load held at July's level, August's self-sufficiency would have landed nearer 42% than 52%.

Set against the full nine months, self-sufficiency traces the seasons clearly: a December floor of 54.3%, a March peak of 76.5%, then a wet-season decline through June (59.9%), a July recovery (66.5%), and now an August low of 51.8%. The August figure is the deepest point recorded and the first time any month fell below the December baseline.

## Annual Projection

- Data coverage: 9 months (high confidence)
- Seasonal context: tropical profile, dry months ×1.07, wet ×0.93, transitional ×1.0
- De-seasonalized baseline: ~22.3 kWh/day
- Projected annual generation: ~8,153 kWh (year 1), ~7,754 kWh (year 10), ~7,193 kWh (year 25)
- Projected annual self-consumed: ~7,641 kWh
- Projected annual grid export: ~512 kWh
- Environmental impact: ~5.2 tonnes CO₂ avoided annually (at 0.68 kg CO₂/kWh), equivalent to ~236 trees planted or ~24,700 km not driven

### August is an outlier, not a season

August was an exceptional weather event — the monsoon produced widespread flooding across Luzon, with waters still not subsided in parts of the island into early September. It should not be treated as a normal August or folded into a revised wet-season factor.

Excluding it changes the annual projection less than expected: the de-seasonalized baseline rises from ~22.3 to ~23.0 kWh/day, lifting projected annual generation from ~8,153 to ~8,386 kWh, **~3%**. August does not dominate the average because December and January are independently weak.

That points at a separate and more consequential issue: the assumed tropical seasonal factors do not match this site. Comparing each month's observed output against the nine-month mean:

| Month | Observed factor | Assumed factor |
|---|---|---|
| Dec 2025 | 0.73 | 1.00 |
| Jan 2026 | 0.74 | 1.07 |
| Feb 2026 | 1.04 | 1.07 |
| Mar 2026 | 1.20 | 1.07 |
| Apr 2026 | 1.22 | 1.07 |
| May 2026 | 1.23 | 1.07 |
| Jun 2026 | 1.03 | 0.93 |
| Jul 2026 | 1.12 | 0.93 |
| Aug 2026 | 0.70 | 0.93 |

The real shape is a strong March–May peak (~1.20–1.23 against an assumed 1.07) and a weak December–January trough (~0.73–0.74 against an assumed 1.00–1.07). The model has the amihan months roughly 35% too high. July, meanwhile, is one of the stronger months observed (1.12) despite being classed as wet — so a blanket July–October downgrade would be wrong.

Correcting this needs a second year of data before the empirical factors can be trusted, since each is currently a single observation and December–January carries only two months. Until then the projection stands as computed, with the caveat that its month-to-month distribution is less reliable than its annual total.

## Methodology Notes

### Data Processing
- Energy values assume 1-hour buckets (each row = 1 hour). Days with ≤20 of 24 hourly rows are excluded from daily statistics as partial days.
- Self-consumed energy is calculated as `total_load - grid_import`, which measures actual solar offset and avoids inflating by battery round-trip losses.

### EV Detection
- Charging days are detected using a threshold of 9.9 kWh above the 32.9 kWh daily average (formula: `max(8, avg_daily_load × 0.3)`).
- Days near the threshold may be misclassified. The heuristic cannot distinguish charging from other high-load events such as guests or unusual appliance use.

### Battery Analysis
- **Usable capacity** is estimated from the deepest monotonic SOC decline per day, using only days with >30% SOC swing (235 qualifying days). BMS-reported SOC may not be linear at extremes.
- **Round-trip efficiency** is computed on monthly aggregates. The adjusted column corrects for start/end SOC imbalance using the ~14.2 kWh usable estimate; that correction is itself an approximation, and is most sensitive in low-throughput months.
- **Avoidable import** is a daily upper-bound estimate that overstates savings — it ignores hourly timing mismatches between surplus generation and demand.

### Anomaly Detection
- **PV anomalies**: flags days generating <60% of the rolling 14-day mean (first 3 days excluded). Cannot distinguish equipment faults from weather; a monsoon month triggers heavy false positives, as August demonstrates.
- **Load anomalies**: flags non-EV days exceeding mean + 2 standard deviations. None were found.
- **Battery anomalies**: flags days with round-trip efficiency <80% where start/end SOC are within 5% and charging exceeds 1 kWh.

### Financial Estimates
- Past months are billed at the rate in effect that month; the annual projection and ROI use the current ₱16.75/₱9.23 tariff.
- Feed-in credit applies a flat rate regardless of period.
- ROI uses 0.5%/year panel degradation. It does not model inverter replacement (~10–15 years), battery degradation beyond cycle count, or electricity price inflation — the last of which is material here, since the import rate has risen from ₱14.41 to ₱16.75 in nine months.
- The without-battery projection is computed separately from `analyze.py`, which does not model it: direct self-consumption (`min(pv, load)` in generating hours) is valued at the import rate, and export plus battery discharge at the feed-in rate.
- Battery cycle life uses a 6,000-cycle LFP rating. Calendar aging is not modelled.

### Projections
- The annual projection de-seasonalizes observed data using tropical seasonal factors, then re-applies all 12 months, assuming 30.44 days/month. See the caveat above regarding the wet-season factor.

### Environmental
- Avoided CO₂ is computed as self-consumed kWh × grid factor, not gross PV × grid factor. This is conservative — exported kWh also displace fossil generation.
- Carbon equivalents use fixed values: 22 kg CO₂/tree/year, 0.21 kg CO₂/km.

## Appendix

### Best and Worst Days

**Best day: 2026-03-19** — PV: 30.0 kWh, Load: 25.5 kWh, Import: 1.4 kWh, Export: 6.4 kWh. Ordinary day. Peak dry-season generation against a modest load, with the battery reaching 100% and carrying the evening almost unaided. Self-sufficiency: 95%.

**Worst day: 2026-08-29** — PV: 1.4 kWh, Load: 21.4 kWh, Import: 20.0 kWh, Export: 0 kWh. Ordinary day. The deepest point of the August monsoon; the array produced almost nothing, the battery never rose above 23% SOC, and effectively the entire day ran on grid import. Self-sufficiency: 6%.

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
| Aug 2026 | 15.8 | 2.4 | 10.1% | 48% |

### Next Steps

- Meter the overnight load floor over one week per Recommendation 1 — it survived a month in which everything else moved, and remains the largest identified saving
- Re-run this analysis after September and October — but expect early September to stay depressed while Luzon flooding subsides; those months extend the wet-season record rather than settling the seasonal-factor question, which needs a second December–January to resolve
- Expect September's raw battery efficiency to read *low*, as the mirror of August's high reading — the battery entered September at ~24% SOC
- Watch the battery's incremental payback recover from ~5.4 years as dry-season throughput returns; treat a figure that stays above ~5.5 years into the dry season as worth investigating
- Continue tracking the import rate, now ₱16.75 and up ~16% in nine months, which shortens payback faster than modelled
- Record notable weather or occupancy events in `data/month_notes.md` as they happen — the August entry is what separates this month's eleven anomaly flags from a fault investigation

### Disclaimer

This report was generated by an AI model. While the numerical computations are performed by a deterministic script (`analyze.py`), the narrative interpretation, recommendations, and contextual inferences (seasonal factors, grid emission factors, sizing assessments) are AI-generated and may contain inaccuracies. The without-battery ROI and the SOC-adjusted battery efficiency figures are computed outside that script and carry the extra assumptions noted in the methodology. Verify critical findings — especially financial estimates and equipment diagnostics — against your own records, manufacturer specifications, or a qualified solar professional before making decisions based on this report.

### Data Sources

- `data/solar_hourly_2025-12.csv` — 31 days
- `data/solar_hourly_2026-01.csv` — 31 days
- `data/solar_hourly_2026-02.csv` — 28 days
- `data/solar_hourly_2026-03.csv` — 30 days
- `data/solar_hourly_2026-04.csv` — 30 days
- `data/solar_hourly_2026-05.csv` — 31 days
- `data/solar_hourly_2026-06.csv` — 30 days
- `data/solar_hourly_2026-07.csv` — 31 days
- `data/solar_hourly_2026-08.csv` — 31 days
- `data/month_notes.md` — August monsoon context
