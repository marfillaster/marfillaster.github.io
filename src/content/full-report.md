---
feed: false
href: "/solar-report/full-report"
eyebrow: "Full report · 2026-10"
title: "Full residential 6.5 kWp solar performance report — Cavite, Philippines"
description: >-
  Full hourly-data analysis of a 6.5 kWp / 14.3 kWh / 8 kW residential solar-plus-battery system in Cavite, Philippines: generation, self-sufficiency, recommendations, bill impact, ROI, battery health, and projections.
datePublished: "2026-05-01"
dateModified: "2026-11-01"
category: "Home & Energy"
---

# Solar System Recommendations

Based on analysis of solar data from December 2025 – October 2026 (334 days).

## Executive Summary

October generation held level with September at ~22.0 kWh/day, but consumption rose ~12% to **~41.1 kWh/day**, the highest monthly average in the dataset. Grid import reached ~597 kWh, also a dataset high, and self-sufficiency fell ~5 points to **~53.2%**, second only to August's flood month. The month's saving came to **~₱11,382** at ₱16.78/kWh, up on September only because load was higher. Export was zero for the second month running.

Two things drove the rise. Ordinary-day load climbed ~3.9 kWh/day, spread across most hours rather than in one block, and the overnight floor reached **~1,057 W**, the highest of any month, above April's ~1,024 W. Charging days rose to nine, and charging still starts at 06:00 before the array produces anything.

No PV anomalies were flagged and the battery is healthy, with October's round-trip efficiency at ~99.6% once month-boundary carry-over is accounted for. The system remains on a **~3.0-year payback** on ₱400,000 (~2.1 years remaining), cutting the annual bill ~64%. The overnight floor is the largest addressable saving, and it has now risen two months in a row.

The system avoids **~5.3 tonnes of CO₂ a year**.

## System Profile

- **PV capacity**: 6.5 kWp, inverter: 8 kW AC (DC/AC ratio: 0.81 — inverter substantially oversized, large expansion headroom)
- **Battery**: 14.3 kWh nominal, ~14.1 kWh usable estimated (operating SOC range ~17%–76%)
- **EV/PHEV**: PHEV present; charging detected on 51 of 334 days, 9 of them in October
- **Tariff**: Flat — ₱16.78/kWh import (current, effective October 2026); past months billed at their then-current rate (see monthly table)
- **Feed-in tariff**: ₱10.14/kWh export credit (~60% of import rate)
- **Location**: Cavite, Philippines — tropical, ~14.4°N

## Alerts

### Battery Alerts

- **2026-10-18**: round-trip efficiency ~80% on 5.0 kWh charged and 4.0 kWh discharged — a single shallow cycle on a ~19.9 kWh generation day, right at the flag threshold.

This is the only flag in October, against two in September, bringing the total to six in 334 days (2026-03-17, 2026-05-17, 2026-08-01, 2026-09-15, 2026-09-23, 2026-10-18). Every one has been a low-throughput day where a partial cycle makes the daily ratio unreliable, and October's month-level efficiency is normal. No BMS check is indicated.

## Recommendations

### 1. Meter and cut the overnight load floor (highest impact)

The household drew ~1,057 W through the small hours of October (01:00–05:00), up from ~893 W in September and ~738 W in August, and well above the ~815 W dataset average. It is now the highest floor in the dataset. The battery reached its 10–11% floor on 14 of 31 days, and grid import between midnight and 06:00 averaged ~6.4 kWh per night, up from ~5.3 kWh in September.

The 01:00–05:00 floor alone was ~5.3 kWh per night, ~164 kWh across the month, or ~₱2,750. Annualised, every 100 W removed is ~2.4 kWh/day and **~₱14,700/year** at ₱16.78/kWh. Removing 350 W, which would bring the floor back to where it sat from December to March (~670–740 W), is ~₱51,400/year and would bring the remaining payback from ~2.1 years to ~1.2.

The floor tracked the hot months through April and May, eased through the wet season, and has now risen two months in a row without April's heat. That pattern points to something added or running longer since August rather than weather. Identifying it needs measurement: a plug-in power meter moved around the house over a week, or a clamp meter on individual circuits. Start with whatever runs overnight that did not in August: air conditioners and their thermostat settings, anything that runs a compressor or a motor, and anything newly left on standby.

### 2. Start charging at 09:00, not 06:00

Charging days averaged ~53.4 kWh of load in October against ~22.9 kWh of generation, and drew ~30.6 kWh from the grid each, up from ~26.2 kWh in September. Across the dataset the battery reaches evening at ~21% SOC on charging days against ~43% on ordinary days, and the average daily peak grid draw is ~6.0 kW against ~1.9 kW.

The 06:00 start has not changed. October's charging days drew ~1.4–1.7 kW above an ordinary day at 06:00–07:00, when the array produces ~0.3–1.0 kW and the battery is at or near its floor. The largest block ran 13:00–17:00 (up to ~2.1 kW extra at 13:00), and further draws appeared at 21:00 (~1.5 kW) and 01:00–02:00 (~0.7–0.8 kW), so some sessions ran overnight. Moving the start to ~09:00 and finishing by ~14:00 puts the session against the peak generation window.

The financial gain is modest. With the feed-in credit at ~60% of import, moving a kWh from grid import to self-consumption is worth ~₱6.64, and on charging days the array rarely has surplus to give. The larger benefit is keeping the battery from being drained before the evening peak. Set the EVSE or in-cabin scheduler to start ~09:00 and stop by ~14:00, and avoid starting sessions late in the evening.

### 3. Recognise that generation, not storage, is the constraint

On October charging days the array made ~22.9 kWh against ~53.4 kWh of load; on ordinary days, ~21.6 kWh against ~36.1 kWh. The battery peaked at 99% on one day (Oct 25) and averaged a ~66% daily peak, and export was zero for the month. A larger battery would have had nothing more to charge with. Avoidable import, the ceiling on what better battery scheduling could recover, is ~1.2 kWh/day, ~₱7,350/year, and that is an upper bound.

The inverter has room for more generation: peak output has never exceeded 5.44 kW against an 8 kW AC rating (68%), with zero clipping hours in 334 days and a DC/AC ratio of 0.81. Roughly 3–4 kWp could be added before the inverter becomes the limit. No roof expansion is assumed here, so nothing is modelled.

### Not Recommended

- **Grid-charging the battery off-peak**: the tariff is flat at ₱16.78/kWh around the clock, so there is no cheap window to arbitrage. Grid-charging would only add round-trip losses.
- **A second battery**: export totals ~311 kWh across 334 days (~0.9 kWh/day) and has been zero for two months. There is almost nothing spare to store.

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
| Sep 2026 | 16.71 | ₱18,439 | ₱7,674 | ₱0 | ₱10,765 |
| **Oct 2026** | **16.78** | **₱21,405** | **₱10,023** | **₱1** | **₱11,382** |

Each month is billed at the rate in effect that month. October's ₱11,382 saving is ~₱600 above September's, but generation barely moved; the higher figure comes from the solar offsetting a larger load at a slightly higher rate. The grid bill rose to ₱10,023, the highest in the dataset by ~₱2,350, because load grew to ~1,276 kWh, up ~172 kWh on September, while generation rose only ~29 kWh.

- Estimated annual bill without solar: ₱208,217
- Estimated annual bill with solar: ₱77,813
- **Annual bill reduction: ₱133,849 (64%)**

The annual figures are projected at today's ₱16.78/₱10.14 tariff.

## ROI Estimate

| Metric | With Battery | Without Battery |
|---|---|---|
| System cost | ₱400,000 | ₱300,000 |
| Estimated annual savings (year 1) | ₱133,849 | ₱118,368 |
| **Simple payback** | **3.0 years** | **2.5 years** |
| Remaining payback | 2.1 years | 1.6 years |
| 25-year lifetime savings | ₱3,152,941 | ₱2,788,275 |

**Battery incremental ROI**: the battery (~₱100,000 of the total) adds ~₱15,500/year over the panels-only case by shifting ~8.0 kWh/day of discharge from export at ₱10.14 to self-consumption displacing ₱16.78 import. Standalone battery payback is **~6.5 years** against a ~28-year projected cycle life.

That is longer than last month's ~5.9 years, and the cause is again the tariff. The feed-in credit rose ₱0.49 to ₱10.14 while the import rate rose only ₱0.07, narrowing the import/export spread from ₱7.06 to ₱6.64/kWh. Each stored kWh is worth that spread, so a better-paid export shrinks the battery's share of the return. The panels carry most of it either way, and the battery remains justified over its life.

Payback is measured against a 25+ year panel lifespan. The ₱400,000 is the total invested figure including financing cost; hardware-only cost would yield a shorter payback.

## Key Metrics

| Metric | Non-EV Days | EV Days |
|---|---|---|
| Daily PV generation | ~22.1 kWh | ~24.8 kWh |
| Daily consumption | ~31.0 kWh | ~50.5 kWh |
| Daily grid import | ~10.3 kWh | ~25.8 kWh |
| Daily grid export | ~1.1 kWh | ~0.2 kWh |
| Evening SOC | ~43% | ~21% |

- Self-consumption rate: ~94.7% across the dataset — 98.9% (Sep), 99.7% (Oct)
- Self-sufficiency: 58.4% (Sep), 53.2% (Oct) — October is the second-lowest month, above only August
- Grid export is concentrated at 12:00–15:00 once the battery is full; September and October had no such window, and no export
- Battery drains from ~50% to ~20% overnight on ordinary days (~30 points); in October it reached its 10–11% floor on 14 days and ended the month at 21%
- Charging days generate slightly *more* than ordinary days (~24.8 vs ~22.1 kWh) — charging clusters on better-weather days, which flatters the charging-day PV figure
- Ordinary-day load (~31.0 kWh) exceeds generation (~22.1 kWh), giving a PV/load ratio of 0.71 across the dataset, down from 0.73

### Hourly Patterns

- Peak generation runs 09:00–14:00, with output topping out at 5.44 kW (2026-03-15, 12:00) — 84% of panel nameplate, 68% of inverter capacity
- Ordinary-day load peaks around midday to mid-afternoon (~1.8–2.0 kW) and again in the evening, while the overnight floor sits at ~815 W on the dataset average and ~1,057 W in October
- October's ordinary-day load ran above September's in most hours, by the most at 06:00 (~450 W) and 14:00 (~440 W), and by ~350–390 W at 18:00–19:00
- Charging draw appears across 06:00–22:00 and, in October, at 01:00–02:00 as well; the 06:00–07:00 block lands before meaningful generation
- Overnight import runs from roughly 18:00 through 06:00, when the battery is exhausted and generation is zero
- Peak grid draw across the whole dataset was 9.1 kW on 2026-05-15 at 18:00, on an ordinary day — an evening coincidence of household loads, not charging

### Weekday vs Weekend

Weekday and weekend consumption are similar (~30.8 vs ~31.5 kWh/day, 66% vs 68% self-sufficiency). Weekend load runs ~250 W higher at 11:00 and 15:00, when occupants are home and generation is at its peak, so load-shifting is more practical at weekends; weekday gains need timer-based automation instead.

### Peak Demand

- Peak grid draw: 9.1 kW on 2026-05-15 at 18:00 (ordinary day)
- Average daily peak: ~1.9 kW (ordinary), ~6.0 kW (charging days)
- Peak PV output: 5.4 kW on 2026-03-15 at 12:00 (68% of inverter capacity)
- No inverter limiting observed at any point in 334 days

## System Size Assessment

No roof expansion is assumed in this report.

### PV Array (6.5 kWp): correctly sized for base load, short in the wet season and as load grows

- Peak output reached 5,436 W (84% of nameplate, 68% of inverter capacity)
- Zero clipping hours against either panel nameplate or inverter AC rating across 334 days
- Peak sun hours ranged from 2.4/day (August) to 4.3/day (April–May); dataset average 3.46
- Ordinary-day PV/load ratio is 0.71 — generation covers roughly 70% of an ordinary day's consumption
- On charging days the array covers ~49% of load (~24.8 kWh against ~50.5 kWh) — the deficit is generation, not timing or storage
- October's ~22.0 kWh/day covered ~53% of a ~41.1 kWh/day load, against ~59% in September

### Battery (14.3 kWh): adequate, and not the bottleneck

- Ordinary days: ~8.3 kWh charged, ~8.0 kWh discharged, ~57% cycle depth
- Charging days: ~57% cycle depth, emptying every evening because generation runs out before the battery fills
- October: ~212 kWh charged, peak SOC 99% on one day, average daily peak ~66% — extra capacity would have sat mostly empty
- Round-trip efficiency ~95–99% once month-boundary carry-over is accounted for
- Avoidable import averages ~1.2 kWh/day (~385 kWh total), bounding what better scheduling could recover

### Verdict

The system is well-sized for the load it was bought for, and the load is now moving away from it. Storage has never been the limiting factor and the inverter has never come close. The eleven-month record shows import driven by two things only load and generation address: the overnight floor, and charging days that consume twice what the array produces. October added a third, a broad rise in ordinary-day load. Optimization lies in the overnight floor first, charge timing second, and added capacity third if roof area appears.

## Battery Health

- Nominal capacity: 14.3 kWh, estimated usable: ~14.1 kWh (99% of nominal, from 286 qualifying days)
- Daily equivalent full cycles: ~0.57 (~207 per year); ~197 cycles used to date
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
| Sep 2026 | 96.7% | 16% → 12% | −0.6 kWh | 96.5% |
| **Oct 2026** | **98.9%** | **12% → 21%** | **+1.3 kWh** | **99.6%** |

October started at the SOC floor and ended ~9 points higher, so ~1.3 kWh of its charge was still in the battery at month end. Across eleven months the adjusted range is 95.3%–99.6% with no downward trend — healthy for LFP, which is typically rated 92–95%.

## Month-over-Month Trends

| Metric | Sep 2026 | Oct 2026 | Change |
|---|---|---|---|
| Avg daily PV | ~21.7 kWh | ~22.0 kWh | +1% |
| Avg daily load | ~36.8 kWh | ~41.1 kWh | +12% |
| Self-sufficiency | 58.4% | 53.2% | −5pp |
| Grid dependence | 42% | 47% | +5pp |
| Battery efficiency (adjusted) | 96.5% | 99.6% | +3.1pp |

Generation held steady; the change is all load. Ordinary days rose from ~32.2 to ~36.1 kWh, of which the overnight floor accounts for ~0.8 kWh, and the rest is spread across the day. Charging days rose from seven to nine and each drew more, ~53.4 kWh against ~51.9 kWh. Together they added ~172 kWh of load against ~29 kWh of extra generation, so almost all of the increase came from the grid.

Across eleven months, self-sufficiency has run from a December floor of 54.3% to a March peak of 76.5%, declined through the wet season to 59.9% (June), recovered to 66.5% (July), fell to the dataset low of 51.8% (August), recovered to 58.4% (September), and is now at 53.2%. October is the first month in which the decline came from load rather than weather.

## Annual Projection

- Data coverage: 11 months (high confidence)
- Seasonal context: tropical profile, dry months ×1.07, wet (June–October) ×0.93, transitional ×1.0
- De-seasonalized baseline: ~22.5 kWh/day
- Projected annual generation: ~8,230 kWh (year 1), ~7,827 kWh (year 10), ~7,260 kWh (year 25)
- Projected annual self-consumed: ~7,794 kWh
- Projected annual grid export: ~435 kWh
- Environmental impact: ~5.3 tonnes CO₂ avoided annually (at 0.68 kg CO₂/kWh), equivalent to ~241 trees planted or ~25,200 km not driven

### August is an outlier, not a season

August was an exceptional weather event — the monsoon produced widespread flooding across Luzon, with waters still not subsided in parts of the island into early September. It should not be treated as a normal August or folded into a revised wet-season factor.

Excluding it raises the de-seasonalized baseline from ~22.5 to ~23.1 kWh/day, lifting projected annual generation from ~8,230 to ~8,440 kWh, **~3%**. August does not dominate the average because December and January are independently weak.

The assumed tropical seasonal factors do not match this site. Comparing each month's observed output against the eleven-month mean:

| Month | Observed factor | Assumed factor |
|---|---|---|
| Dec 2025 | 0.73 | 1.00 |
| Jan 2026 | 0.74 | 1.07 |
| Feb 2026 | 1.05 | 1.07 |
| Mar 2026 | 1.21 | 1.07 |
| Apr 2026 | 1.23 | 1.07 |
| May 2026 | 1.24 | 1.07 |
| Jun 2026 | 1.04 | 0.93 |
| Jul 2026 | 1.13 | 0.93 |
| Aug 2026 | 0.70 | 0.93 |
| Sep 2026 | 0.96 | 0.93 |
| Oct 2026 | 0.97 | 0.93 |

September and October both land close to their assumed factor. The real shape is a strong March–May peak (~1.21–1.24 against an assumed 1.07) and a weak December–January trough (~0.73–0.74 against an assumed 1.00–1.07). The model has the amihan months roughly 35% too high. July (1.13) remains one of the stronger months, so a blanket July–October downgrade would be wrong.

Correcting this needs a second year of data, since each factor is currently a single observation. November and December will show whether the trough starts as early this year. Until then the projection stands as computed, with the caveat that its month-to-month distribution is less reliable than its annual total.

## Methodology Notes

### Data Processing
- Energy values assume 1-hour buckets (each row = 1 hour). Days with ≤20 of 24 hourly rows are excluded from daily statistics as partial days.
- Self-consumed energy is calculated as `total_load - grid_import`, which measures actual solar offset and avoids inflating by battery round-trip losses.

### EV Detection
- Charging days are detected using a threshold of 10.2 kWh above the 34.0 kWh daily average (formula: `max(8, avg_daily_load × 0.3)`). The threshold rose from 10.0 kWh as October's load lifted the average, which moved one September day back to ordinary (seven charging days rather than eight).
- Days near the threshold may be misclassified. The heuristic cannot distinguish charging from other high-load events such as guests or unusual appliance use, which matters more now that ordinary-day load is rising.

### Battery Analysis
- **Usable capacity** is estimated from the deepest monotonic SOC decline per day, using only days with >30% SOC swing (286 qualifying days). BMS-reported SOC may not be linear at extremes.
- **Round-trip efficiency** is computed on monthly aggregates. The adjusted column corrects for start/end SOC imbalance using the ~14.1 kWh usable estimate; that correction is itself an approximation, and is most sensitive in low-throughput months.
- **Avoidable import** is a daily upper-bound estimate that overstates savings — it ignores hourly timing mismatches between surplus generation and demand.
- **Overnight floor** figures are the mean load across the 01:00–05:00 hours, computed outside `analyze.py`.

### Anomaly Detection
- **PV anomalies**: flags days generating \<60% of the rolling 14-day mean (first 3 days excluded). Cannot distinguish equipment faults from weather; a monsoon month triggers heavy false positives, as August demonstrates. October had none.
- **Load anomalies**: flags non-EV days exceeding mean + 2 standard deviations. None were found.
- **Battery anomalies**: flags days with round-trip efficiency \<80% where start/end SOC are within 5% and charging exceeds 1 kWh.

### Financial Estimates
- Past months are billed at the rate in effect that month; the annual projection and ROI use the current ₱16.78/₱10.14 tariff.
- Feed-in credit applies a flat rate regardless of period.
- ROI uses 0.5%/year panel degradation. It does not model inverter replacement (~10–15 years), battery degradation beyond cycle count, or electricity price inflation — the last of which is material here, since the import rate has moved from ₱14.41 to ₱16.78 in eleven months.
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
| Oct 2026 | 22.0 | 3.4 | 14.1% | 47% |

### Next Steps

- Meter the overnight load floor over one week per Recommendation 1, starting with whatever changed between August (~738 W) and October (~1,057 W)
- Move the charging start from 06:00 to ~09:00 per Recommendation 2, avoid late-evening sessions, and compare November's charging-day import against October's ~30.6 kWh
- Re-run this analysis after November and December; a second December–January is needed to settle the seasonal-factor question
- Continue tracking the tariff: the export credit is now ₱10.14 (~60% of import), which lengthens the battery's incremental payback as it rises
- Record notable weather or occupancy events in `data/month_notes.md` as they happen

### Disclaimer

This report was generated by an AI model. While the numerical computations are performed by a deterministic script (`analyze.py`), the narrative interpretation, recommendations, and contextual inferences (seasonal factors, grid emission factors, sizing assessments) are AI-generated and may contain inaccuracies. The without-battery ROI, the SOC-adjusted battery efficiency and the overnight floor figures are computed outside that script and carry the extra assumptions noted in the methodology. Verify critical findings — especially financial estimates and equipment diagnostics — against your own records, manufacturer specifications, or a qualified solar professional before making decisions based on this report.

### Data Sources

- [`data/solar_hourly_2025-12.csv`](/solar-report/data/solar_hourly_2025-12.csv) — 31 days
- [`data/solar_hourly_2026-01.csv`](/solar-report/data/solar_hourly_2026-01.csv) — 31 days
- [`data/solar_hourly_2026-02.csv`](/solar-report/data/solar_hourly_2026-02.csv) — 28 days
- [`data/solar_hourly_2026-03.csv`](/solar-report/data/solar_hourly_2026-03.csv) — 30 days
- [`data/solar_hourly_2026-04.csv`](/solar-report/data/solar_hourly_2026-04.csv) — 30 days
- [`data/solar_hourly_2026-05.csv`](/solar-report/data/solar_hourly_2026-05.csv) — 31 days
- [`data/solar_hourly_2026-06.csv`](/solar-report/data/solar_hourly_2026-06.csv) — 30 days
- [`data/solar_hourly_2026-07.csv`](/solar-report/data/solar_hourly_2026-07.csv) — 31 days
- [`data/solar_hourly_2026-08.csv`](/solar-report/data/solar_hourly_2026-08.csv) — 31 days
- [`data/solar_hourly_2026-09.csv`](/solar-report/data/solar_hourly_2026-09.csv) — 30 days
- [`data/solar_hourly_2026-10.csv`](/solar-report/data/solar_hourly_2026-10.csv) — 31 days
- `data/month_notes.md` — August monsoon and early-September context
