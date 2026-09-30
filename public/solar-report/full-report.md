---
feed: false
href: "/solar-report/full-report"
eyebrow: "Full report · 2026-09"
title: "Full residential 6.5 kWp solar performance report — Cavite, Philippines"
description: >-
  Full hourly-data analysis of a 6.5 kWp / 14.3 kWh / 8 kW residential solar-plus-battery system in Cavite, Philippines: generation, self-sufficiency, recommendations, bill impact, ROI, battery health, and projections.
datePublished: "2026-05-01"
dateModified: "2026-10-01"
category: "Home & Energy"
---

# Solar System Recommendations

Based on analysis of solar data from December 2025 – September 2026 (303 days).

## Executive Summary

September recovered most of August's lost generation: the array averaged ~21.7 kWh/day, up ~38% on the monsoon month, and self-sufficiency rose ~7 points to **~58.4%**. The month's saving came to **~₱10,765** at ₱16.71/kWh. Load rose faster than the recovery, though: consumption climbed ~25% to ~36.8 kWh/day on eight charging days (against August's three) and a heavier overnight draw, so the battery bottomed at its 10–11% floor on every day of the month and never filled. Export was zero for the whole month.

The three low-generation flags in September (Sep 4, 5 and 7) are the tail of the August flooding event, not equipment. The battery is healthy: raw round-trip efficiency was 96.7%, and the start and end of the month sat close enough in state of charge that no correction is needed.

The system remains on a **~3.0-year payback** on ₱400,000 (~2.2 years remaining), cutting the annual bill ~66%. The overnight load floor is still the largest addressable saving and it grew this month, to ~890 W from ~734 W in August. Charging sessions that start at 06:00, before the array produces anything, are the second item.

The system avoids **~5.2 tonnes of CO₂ a year**.

## System Profile

- **PV capacity**: 6.5 kWp, inverter: 8 kW AC (DC/AC ratio: 0.81 — inverter substantially oversized, large expansion headroom)
- **Battery**: 14.3 kWh nominal, ~14.1 kWh usable estimated (operating SOC range ~17%–77%)
- **EV/PHEV**: PHEV present; charging detected on 47 of 303 days, 8 of them in September (up from 3 in August)
- **Tariff**: Flat — ₱16.71/kWh import (current, effective September 2026); past months billed at their then-current rate (see monthly table)
- **Feed-in tariff**: ₱9.65/kWh export credit (~58% of import rate)
- **Location**: Cavite, Philippines — tropical, ~14.4°N

## Alerts

### PV Generation Alerts

Three September days generated less than 60% of their rolling baseline, all in the first week, when `data/month_notes.md` records that the August flooding had not yet subsided across parts of Luzon.

| Date | Daily PV (kWh) | Expected (kWh) | Deviation |
|---|---|---|---|
| 2026-09-07 | 5.3 | ~18.4 | −71% |
| 2026-09-05 | 8.6 | ~20.4 | −58% |
| 2026-09-04 | 10.9 | ~21.5 | −49% |

**No action is indicated.** Each of the three days shows output suppressed across the whole daylight window (Sep 7 never exceeded ~1.0 kWh in any hour) rather than cutting off, and they sit in one run between Sep 4 and Sep 8. The array produced ~30.3 kWh on 1 September and ~30.0 kWh on the 13th and 21st. A degraded or partly shaded array cannot reach those figures.

### Battery Alerts

- **2026-09-15**: round-trip efficiency 67.1% on 4.8 kWh charged and 3.2 kWh discharged — a low-generation day (~14.6 kWh) with a single shallow cycle.
- **2026-09-23**: round-trip efficiency 78.0% on 6.4 kWh charged and 5.0 kWh discharged — a charging day on which the battery never climbed above 60%.

Both are small-throughput days where a partial cycle makes the daily ratio unreliable, and the month-level efficiency (96.7%) is normal. September is the first month with two flags, bringing the total to five in 303 days (2026-03-17, 2026-05-17, 2026-08-01, 2026-09-15, 2026-09-23). None has recurred on the same conditions, so this is not a pattern yet. If three or more appear in October, it would warrant a look at the BMS logs.

## Recommendations

### 1. Meter and cut the overnight load floor (highest impact)

The household drew ~890 W through the small hours of September (01:00–05:00), up from ~734 W in August and above the ~785 W dataset average. That floor runs every night regardless of weather, and it is the only significant load that neither the panels nor the battery can offset by retiming. In September the battery reached its 10–11% floor every single day, so the overnight draw came almost entirely from the grid: ~5.3 kWh of import per night between midnight and 06:00.

The 01:00–05:00 floor alone was ~4.5 kWh per night, ~134 kWh across the month, or ~₱2,230. Annualised, every 100 W removed is ~2.4 kWh/day and **~₱14,600/year** at ₱16.71/kWh. Removing 300 W — roughly the gap between September and the quieter months — is ~₱43,900/year, which would bring the remaining payback from ~2.2 years to ~1.6.

The floor is not fixed. It sat at ~660–740 W from December to March, jumped to ~1,020 W in April and ~830 W in May, eased to ~730–800 W through the wet season, and is now back up at ~890 W. That shape tracks the hot months, which points to cooling running overnight, but the September rise came without April's heat, so something else may have been added. Identifying it needs measurement: a plug-in power meter moved around the house over a week, or a clamp meter on individual circuits. Start with air conditioners and anything that runs a compressor or a motor, then anything with a permanently lit LED.

### 2. Start charging at 09:00, not 06:00

Charging days now average ~49.2 kWh of load against ~25.0 kWh of generation, and the battery reaches evening at ~22% SOC against ~45% on ordinary days. The average peak grid draw on charging days is ~5.8 kW against ~1.8 kW otherwise.

September's eight charging days show the timing problem clearly. The largest extra draw landed at 06:00–07:00 (~2.5–2.6 kW above an ordinary day), when the array is producing ~0.2–0.9 kW and the battery is at its floor, so those hours are pure grid import. A second block ran 13:00–17:00, and smaller draws continued at 19:00–21:00. Moving the morning start to ~09:00 and finishing by ~14:00 puts the session against the peak generation window.

The financial gain is modest. With the feed-in credit at ~58% of import, moving a kWh from grid import to self-consumption is worth ~₱7.06, and on charging days the array rarely has surplus to give. The larger benefit is keeping the battery from being drained before the evening peak. Set the EVSE or in-cabin scheduler to start ~09:00 and stop by ~14:00.

### 3. Recognise that generation, not storage, is the constraint

On September charging days the array made ~24.4 kWh against ~50.9 kWh of load; on ordinary September days, ~20.7 kWh against ~31.7 kWh. The battery peaked at 96% (Sep 1) and never reached full, so there was no surplus to export or store. A larger battery would have had nothing more to charge with. Avoidable import — the ceiling on what better battery scheduling could recover — is ~1.2 kWh/day, ~₱7,300/year, and that is an upper bound.

The inverter has room for more generation: peak output has never exceeded 5.44 kW against an 8 kW AC rating (68%), with zero clipping hours in 303 days and a DC/AC ratio of 0.81. Roughly 3–4 kWp could be added before the inverter becomes the limit. No roof expansion is assumed here, so nothing is modelled.

### Not Recommended

- **Grid-charging the battery off-peak**: the tariff is flat at ₱16.71/kWh around the clock, so there is no cheap window to arbitrage. Grid-charging would only add round-trip losses.
- **A second battery**: export totals ~311 kWh across 303 days (~1.0 kWh/day) and was zero in September. There is almost nothing spare to store.
- **Reacting to the early-September dips**: the array performed correctly for the light available, and recovered to ~30 kWh days within the month.

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
| Aug 2026 | 16.75 | ₱15,302 | ₱7,371 | ₱217 | ₱8,148 |
| **Sep 2026** | **16.71** | **₱18,439** | **₱7,674** | **₱0** | **₱10,765** |

Each month is billed at the rate in effect that month. September's ₱10,765 is ~₱2,600 above August's, driven by the generation recovery. The grid bill itself rose to ₱7,674, the highest in the dataset, because load grew to ~1,104 kWh, up ~190 kWh on August, and the battery emptied every night. The feed-in credit rose to ₱9.65/kWh but earned nothing, since nothing was exported.

- Estimated annual bill without solar: ₱202,886
- Estimated annual bill with solar: ₱73,393
- **Annual bill reduction: ₱133,106 (66%)**

The annual figures are projected at today's ₱16.71/₱9.65 tariff.

## ROI Estimate

| Metric | With Battery | Without Battery |
|---|---|---|
| System cost | ₱400,000 | ₱300,000 |
| Estimated annual savings (year 1) | ₱133,106 | ₱116,112 |
| **Simple payback** | **3.0 years** | **2.6 years** |
| Remaining payback | 2.2 years | 1.7 years |
| 25-year lifetime savings | ₱3,135,438 | ₱2,735,129 |

**Battery incremental ROI**: the battery (~₱100,000 of the total) adds ~₱17,000/year over the panels-only case by shifting ~8.1 kWh/day of discharge from export at ₱9.65 to self-consumption displacing ₱16.71 import. Standalone battery payback is **~5.9 years** against a ~28-year projected cycle life.

That is longer than last month's ~5.4 years. Throughput recovered in September (~217 kWh charged against August's ~141 kWh), so the lengthening comes from the tariff: the feed-in credit rose to ₱9.65 while the import rate eased to ₱16.71, narrowing the import/export spread from ₱7.52 to ₱7.06/kWh. A better-paid export makes each stored kWh worth less. The panels carry most of the return either way, and the battery remains justified over its life.

Payback is measured against a 25+ year panel lifespan. The ₱400,000 is the total invested figure including financing cost; hardware-only cost would yield a shorter payback.

## Key Metrics

| Metric | Non-EV Days | EV Days |
|---|---|---|
| Daily PV generation | ~22.1 kWh | ~25.0 kWh |
| Daily consumption | ~30.3 kWh | ~49.2 kWh |
| Daily grid import | ~9.8 kWh | ~24.3 kWh |
| Daily grid export | ~1.2 kWh | ~0.3 kWh |
| Evening SOC | ~45% | ~22% |

- Self-consumption rate: ~94.2% across the dataset — 96.9% (Aug), 98.9% (Sep)
- Self-sufficiency: 51.8% (Aug), 58.4% (Sep) — September is the third-lowest month, above only August and December
- Grid export is concentrated at 12:00–15:00 once the battery is full; September had no such window, and no export at all
- Battery drains from ~50% to ~20% overnight on ordinary days (~30 points); in September it reached its 10–11% floor every day
- Charging days generate slightly *more* than ordinary days (~25.0 vs ~22.1 kWh) — charging clusters on better-weather days, which flatters the charging-day PV figure
- Ordinary-day load (~30.3 kWh) exceeds generation (~22.1 kWh), giving a PV/load ratio of 0.73 across the dataset

### Hourly Patterns

- Peak generation runs 09:00–14:00, with output topping out at 5.44 kW (2026-03-15, 12:00) — 84% of panel nameplate, 68% of inverter capacity
- Ordinary-day load peaks around midday to mid-afternoon (~1.8–1.9 kW) and again in the evening, while the overnight floor sits at ~785 W on the dataset average and ~890 W in September
- Charging draw appears across 06:00–21:00, with September's largest block at 06:00–07:00, before meaningful generation
- Export occurs only in the 12:00–15:00 window and only once the battery is near full — ~1.0 kWh/day averaged over the dataset
- Overnight import runs from roughly 18:00 through 06:00, when the battery is exhausted and generation is zero
- Peak grid draw across the whole dataset was 9.1 kW on 2026-05-15 at 18:00, on an ordinary day — an evening coincidence of household loads, not charging

### Weekday vs Weekend

Weekday and weekend consumption are similar (~30.1 vs ~31.0 kWh/day, 67% vs 70% self-sufficiency). Weekend load runs 220–330 W higher from 10:00 to 15:00, when occupants are home and generation is at its peak, so load-shifting is more practical at weekends; weekday gains need timer-based automation instead.

### Peak Demand

- Peak grid draw: 9.1 kW on 2026-05-15 at 18:00 (ordinary day)
- Average daily peak: ~1.8 kW (ordinary), ~5.8 kW (charging days)
- Peak PV output: 5.4 kW on 2026-03-15 at 12:00 (68% of inverter capacity)
- No inverter limiting observed at any point in 303 days

## System Size Assessment

No roof expansion is assumed in this report.

### PV Array (6.5 kWp): correctly sized for base load, short in the wet season

- Peak output reached 5,436 W (84% of nameplate, 68% of inverter capacity)
- Zero clipping hours against either panel nameplate or inverter AC rating across 303 days
- Peak sun hours ranged from 2.4/day (August) to 4.3/day (April–May); dataset average 3.47
- Ordinary-day PV/load ratio is 0.73 — generation covers roughly three-quarters of an ordinary day's consumption
- On charging days the array covers ~51% of load (~25.0 kWh against ~49.2 kWh) — the deficit is generation, not timing or storage
- September's ~21.7 kWh/day covered ~59% of a ~36.8 kWh/day load

### Battery (14.3 kWh): adequate, and not the bottleneck

- Ordinary days: ~8.4 kWh charged, ~8.1 kWh discharged, ~57% cycle depth
- Charging days: ~59% cycle depth, emptying every evening because generation runs out before the battery fills
- September: ~217 kWh charged, peak SOC 96%, floor reached daily — the battery was never full, so extra capacity would have sat empty
- Round-trip efficiency ~95–99% once month-boundary carry-over is accounted for
- Avoidable import averages ~1.2 kWh/day (~375 kWh total), bounding what better scheduling could recover

### Verdict

The system is well-sized for how the household uses it. Storage has never been the limiting factor and the inverter has never come close. The ten-month record shows import driven by two things only load and generation address: the overnight floor, and charging days that consume twice what the array produces. Optimization lies in the overnight load floor first, charge timing second, and added capacity third if roof area appears.

## Battery Health

- Nominal capacity: 14.3 kWh, estimated usable: ~14.1 kWh (99% of nominal, from 260 qualifying days)
- Daily equivalent full cycles: ~0.57 (~210 per year); ~182 cycles used to date
- Estimated cycle life remaining: ~28 years at current usage (based on a 6,000-cycle LFP rating)

Raw monthly round-trip efficiency is distorted whenever a month starts and ends at very different states of charge, because energy charged in one month is discharged in the next. Adjusting for that carry-over using the ~14.1 kWh usable estimate:

| Month | Raw | SOC start → end | Carry-over | Adjusted |
|---|---|---|---|---|
| Dec 2025 | 98.3% | 23% → 20% | −0.5 kWh | 98.1% |
| Jan 2026 | 96.7% | 17% → 46% | +4.1 kWh | 98.3% |
| Feb 2026 | 96.3% | 42% → 22% | −2.8 kWh | 95.3% |
| Mar 2026 | 94.5% | 22% → 53% | +4.4 kWh | 95.8% |
| Apr 2026 | 98.0% | 22% → 21% | −0.1 kWh | 97.9% |
| May 2026 | 97.4% | 21% → 11% | −1.4 kWh | 96.9% |
| Jun 2026 | 96.2% | 11% → 11% | ±0.0 kWh | 96.2% |
| Jul 2026 | 91.9% | 11% → 92% | +11.4 kWh | 95.8% |
| Aug 2026 | 105.8% | 91% → 24% | −9.4 kWh | 99.2% |
| **Sep 2026** | **96.7%** | **16% → 12%** | **−0.6 kWh** | **96.5%** |

September started and ended near the SOC floor, so its raw figure needs almost no correction. The low reading that last month's report anticipated did not appear, because the battery had already discharged from ~24% to ~16% before midnight on 31 August. Across ten months the adjusted range is 95.3%–99.2% with no downward trend — healthy for LFP, which is typically rated 92–95%.

## Month-over-Month Trends

| Metric | Aug 2026 | Sep 2026 | Change |
|---|---|---|---|
| Avg daily PV | ~15.8 kWh | ~21.7 kWh | +38% |
| Avg daily load | ~29.5 kWh | ~36.8 kWh | +25% |
| Self-sufficiency | 51.8% | 58.4% | +7pp |
| Grid dependence | 48% | 42% | −7pp |
| Battery efficiency (adjusted) | 99.2% | 96.5% | −2.7pp |

The generation rise is weather clearing. The load rise has two parts: five more charging days (each adds ~19 kWh over an ordinary day, ~95 kWh in total), and ordinary-day load rising from ~27.6 to ~31.7 kWh, of which the overnight floor accounts for ~0.8 kWh. Together they absorbed most of the recovered generation, which is why self-sufficiency recovered only 7 of August's 15 lost points.

Across ten months, self-sufficiency has run from a December floor of 54.3% to a March peak of 76.5%, then declined through the wet season to 59.9% (June), recovered to 66.5% (July), fell to the dataset low of 51.8% (August), and is now at 58.4%.

## Annual Projection

- Data coverage: 10 months (high confidence)
- Seasonal context: tropical profile, dry months ×1.07, wet ×0.93, transitional ×1.0
- De-seasonalized baseline: ~22.4 kWh/day
- Projected annual generation: ~8,190 kWh (year 1), ~7,790 kWh (year 10), ~7,226 kWh (year 25)
- Projected annual self-consumed: ~7,717 kWh
- Projected annual grid export: ~474 kWh
- Environmental impact: ~5.2 tonnes CO₂ avoided annually (at 0.68 kg CO₂/kWh), equivalent to ~239 trees planted or ~25,000 km not driven

### August is an outlier, not a season

August was an exceptional weather event — the monsoon produced widespread flooding across Luzon, with waters still not subsided in parts of the island into early September. It should not be treated as a normal August or folded into a revised wet-season factor.

Excluding it raises the de-seasonalized baseline from ~22.4 to ~23.0 kWh/day, lifting projected annual generation from ~8,190 to ~8,410 kWh, **~3%**. August does not dominate the average because December and January are independently weak.

The assumed tropical seasonal factors do not match this site. Comparing each month's observed output against the ten-month mean:

| Month | Observed factor | Assumed factor |
|---|---|---|
| Dec 2025 | 0.73 | 1.00 |
| Jan 2026 | 0.74 | 1.07 |
| Feb 2026 | 1.05 | 1.07 |
| Mar 2026 | 1.21 | 1.07 |
| Apr 2026 | 1.22 | 1.07 |
| May 2026 | 1.23 | 1.07 |
| Jun 2026 | 1.04 | 0.93 |
| Jul 2026 | 1.13 | 0.93 |
| Aug 2026 | 0.70 | 0.93 |
| Sep 2026 | 0.96 | 0.93 |

September is the first wet-season month to land close to its assumed factor, even with the depressed first week. The real shape is a strong March–May peak (~1.21–1.23 against an assumed 1.07) and a weak December–January trough (~0.73–0.74 against an assumed 1.00–1.07). The model has the amihan months roughly 35% too high. July (1.13) remains one of the stronger months, so a blanket July–October downgrade would be wrong.

Correcting this needs a second year of data, since each factor is currently a single observation. Until then the projection stands as computed, with the caveat that its month-to-month distribution is less reliable than its annual total.

## Methodology Notes

### Data Processing
- Energy values assume 1-hour buckets (each row = 1 hour). Days with ≤20 of 24 hourly rows are excluded from daily statistics as partial days.
- Self-consumed energy is calculated as `total_load - grid_import`, which measures actual solar offset and avoids inflating by battery round-trip losses.

### EV Detection
- Charging days are detected using a threshold of 10.0 kWh above the 33.3 kWh daily average (formula: `max(8, avg_daily_load × 0.3)`).
- Days near the threshold may be misclassified. The heuristic cannot distinguish charging from other high-load events such as guests or unusual appliance use.

### Battery Analysis
- **Usable capacity** is estimated from the deepest monotonic SOC decline per day, using only days with >30% SOC swing (260 qualifying days). BMS-reported SOC may not be linear at extremes.
- **Round-trip efficiency** is computed on monthly aggregates. The adjusted column corrects for start/end SOC imbalance using the ~14.1 kWh usable estimate; that correction is itself an approximation, and is most sensitive in low-throughput months.
- **Avoidable import** is a daily upper-bound estimate that overstates savings — it ignores hourly timing mismatches between surplus generation and demand.
- **Overnight floor** figures are the mean load across the 01:00–05:00 hours, computed outside `analyze.py`.

### Anomaly Detection
- **PV anomalies**: flags days generating <60% of the rolling 14-day mean (first 3 days excluded). Cannot distinguish equipment faults from weather; a monsoon month triggers heavy false positives, as August demonstrates.
- **Load anomalies**: flags non-EV days exceeding mean + 2 standard deviations. None were found.
- **Battery anomalies**: flags days with round-trip efficiency <80% where start/end SOC are within 5% and charging exceeds 1 kWh.

### Financial Estimates
- Past months are billed at the rate in effect that month; the annual projection and ROI use the current ₱16.71/₱9.65 tariff.
- Feed-in credit applies a flat rate regardless of period.
- ROI uses 0.5%/year panel degradation. It does not model inverter replacement (~10–15 years), battery degradation beyond cycle count, or electricity price inflation — the last of which is material here, since the import rate has moved from ₱14.41 to ₱16.71 in ten months.
- The without-battery projection is computed separately from `analyze.py`, which does not model it: direct self-consumption (`min(pv, load)` in generating hours) is valued at the import rate, and export plus battery discharge at the feed-in rate.
- Battery cycle life uses a 6,000-cycle LFP rating. Calendar aging is not modelled.

### Projections
- The annual projection de-seasonalizes observed data using tropical seasonal factors, then re-applies all 12 months, assuming 30.44 days/month. See the caveat above regarding the seasonal factors.

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
| Sep 2026 | 21.7 | 3.3 | 13.9% | 42% |

### Next Steps

- Meter the overnight load floor over one week per Recommendation 1, starting with whatever changed between August (~734 W) and September (~890 W)
- Move the charging start from 06:00 to ~09:00 per Recommendation 2 and compare October's charging-day import against September's ~26.2 kWh
- Watch the battery anomaly count: two flags in September against three in the previous nine months; three or more in October would warrant a BMS log check
- Re-run this analysis after October and November; a second December–January is needed to settle the seasonal-factor question
- Continue tracking the tariff: the export credit is now ₱9.65 (~58% of import), which lengthens the battery's incremental payback as it rises
- Record notable weather or occupancy events in `data/month_notes.md` as they happen

### Disclaimer

This report was generated by an AI model. While the numerical computations are performed by a deterministic script (`analyze.py`), the narrative interpretation, recommendations, and contextual inferences (seasonal factors, grid emission factors, sizing assessments) are AI-generated and may contain inaccuracies. The without-battery ROI, the SOC-adjusted battery efficiency and the overnight floor figures are computed outside that script and carry the extra assumptions noted in the methodology. Verify critical findings — especially financial estimates and equipment diagnostics — against your own records, manufacturer specifications, or a qualified solar professional before making decisions based on this report.

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
- `data/solar_hourly_2026-09.csv` — 30 days
- `data/month_notes.md` — August monsoon and early-September context
