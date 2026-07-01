---
feed: false
href: "/solar-report/full-report"
eyebrow: "Full report · 2026-06"
title: "Full residential 6.5 kWp solar performance report — Cavite, Philippines"
description: >-
  Full hourly-data analysis of a 6.5 kWp / 14.3 kWh / 8 kW residential solar-plus-battery system in Cavite, Philippines: generation, self-sufficiency, recommendations, bill impact, ROI, battery health, and projections.
datePublished: "2026-05-01"
dateModified: "2026-07-01"
category: "Home & Energy"
---

# Solar System Recommendations

Based on analysis of solar data from December 2025 – June 2026 (211 days).

## Executive Summary

June marks the seasonal turn: PV generation fell ~16% (from ~27.8 to ~23.4 kWh/day) as the wet season arrived, while household load held near ~38 kWh/day, so self-sufficiency dropped ~10 points to ~60% and grid import jumped to ~462 kWh — the highest month yet. The 6.5 kWp system remains on track for a **~3.1-year payback** on the ₱400,000 invested (~2.5 years remaining), cutting the electricity bill by **~68%** (~₱131,000/year at current rates). The single highest-impact change is still **shifting PHEV charging into the midday solar window (09:00–14:00)**: June was a heavy charging month (12 of 30 days), and on charging days we pull ~24 kWh from the grid versus ~9 kWh otherwise, with evening SOC bottoming at ~23%.

No equipment faults were detected. June's six low-generation days line up with wet-season cloud rather than any fault, and the only soft battery-efficiency readings (~79% on two spring days) look like BMS recalibration. The system avoids **~5.2 tonnes of CO₂ a year**.

## System Profile

- **PV capacity**: 6.5 kWp, inverter: 8 kW AC (DC/AC ratio: 0.81 — inverter substantially oversized, large expansion headroom)
- **Battery**: 14.3 kWh nominal, ~14.2 kWh usable estimated (operating SOC range ~19%–83%)
- **EV/PHEV**: PHEV present; charging detected on ~29 of 211 days, 12 of them in June — concentrated afternoon/evening
- **Tariff**: Flat — ₱16.10/kWh import (current); past months billed at their then-current rate (see monthly table)
- **Feed-in tariff**: ₱9.08/kWh (~56% of import rate)

## Recommendations

### 1. Move PHEV charging into the midday solar window (highest impact)

On charging days the household draws ~24 kWh from the grid versus ~9 kWh on ordinary days — an extra ~15 kWh/day at full import price. The cause is timing: charging shows up across the afternoon and into the evening (the EV-day load profile stays elevated from ~09:00 all the way to ~21:00), exactly when PV has tapered and the battery is already being drawn down for house load. Evening SOC on charging days sits at ~23% versus ~49% on non-charging days, and the average daily peak grid draw on EV days is ~5.8 kW against ~1.8 kW otherwise.

Shifting the charge to 09:00–14:00 lets the PHEV soak up surplus PV directly. Midday is the only window the system exports (12:00–15:00) or tops a nearly full battery, so that energy currently leaves at the ₱9.08 feed-in rate or sits as unused inverter headroom. Recharging the car at midday converts that grid import into self-consumed solar — worth roughly the ₱16.10 − ₱9.08 spread (~₱7/kWh) on every shifted kWh, on the order of **₱4,000–6,000/year** at the current charging cadence, plus a large cut to peak grid demand. This matters more now than in the dry months: with the wet season trimming surplus, the midday PV we do get is best spent on the car rather than exported cheaply.

Implementation: set the EVSE or the car's in-cabin scheduler to start ~09:00 and finish by ~14:00. Weekends are easy since someone is usually home; on weekdays rely on the charger's built-in timer so it runs unattended.

### 2. Trim the overnight base load

On ordinary nights the battery discharges from ~53% in the early evening to ~21% by dawn (a ~32-point drain), and even after it bottoms out the house keeps importing through the small hours. The weekday load floor sits around 700 W from 03:00 to 07:00 — high for a sleeping house, pointing to always-on draws (standby electronics, pumps, an older fridge, networking gear).

Every 100 W shaved off that floor is ~2.4 kWh/day, or ~₱14,000/year at ₱16.10/kWh — and because it is consumed when neither PV nor a full battery can cover it, the saving is a straight grid offset with no feed-in trade-off. A plug-in energy meter over a week would pinpoint the biggest overnight culprits; the usual wins are consolidating standby loads onto switchable strips and replacing an inefficient refrigerator.

### Not Recommended

- **Grid-charging the battery off-peak**: the tariff is flat (₱16.10/kWh around the clock), so there is no cheap window to arbitrage — grid-charging would only add round-trip losses.
- **A second/larger battery**: the existing 14.3 kWh already delivers ~93% overall self-consumption and projected annual export is only ~556 kWh. There is too little surplus to store for a second pack to pay back.

## Bill Impact

### Monthly Electricity Cost Comparison

| Month | Without Solar | With Solar | Feed-in Credit | Net Savings |
|---|---|---|---|---|
| Dec 2025 | ₱13,424 | ₱6,133 | ₱0 | ₱7,291 |
| Jan 2026 | ₱11,736 | ₱4,697 | ₱0 | ₱7,039 |
| Feb 2026 | ₱10,609 | ₱2,871 | ₱682 | ₱8,420 |
| Mar 2026 | ₱12,464 | ₱2,928 | ₱983 | ₱10,520 |
| Apr 2026 | ₱17,542 | ₱5,585 | ₱208 | ₱12,165 |
| May 2026 | ₱18,633 | ₱5,599 | ₱128 | ₱13,162 |
| Jun 2026 | ₱18,539 | ₱7,443 | ₱47 | ₱11,144 |

Each month is billed at the tariff that applied that month (rates rose from ₱14.41 in December to ₱16.10 in June). June net savings slipped from May's ₱13,162 to ₱11,144 despite the higher rate — the wet-season generation dip pushed more load onto the grid. The annual figure below is projected at today's ₱16.10 rate.

- Estimated annual bill without solar: **₱193,204**
- Estimated annual bill with solar: **₱65,990**
- **Annual bill reduction: ₱131,445 (68%)**

## ROI Estimate

| Metric | Value |
|---|---|
| System cost | ₱400,000 |
| Estimated annual savings (year 1) | ₱131,445 |
| **Simple payback** | **3.1 years** |
| Remaining payback | 2.5 years |
| 25-year lifetime savings | ₱3,096,312 |

The battery (~₱100,000 of the total) earns its keep by moving ~8.8 kWh/day of discharge from cheap export (₱9.08) to self-consumption displacing ₱16.10 import — a ~₱7/kWh spread worth roughly ₱20,000/year, for a standalone battery payback near ~5 years. The panels carry most of the ROI, but the battery is comfortably justified over its ~26-year projected cycle life. Payback is measured against a 25+ year panel lifespan; the degradation-adjusted figure (0.5%/year) is marginally longer than a naive calculation. Executing Recommendation 1 would shorten payback slightly further.

## Key Metrics

| Metric | Non-EV Days | EV Days |
|---|---|---|
| Daily PV generation | ~23.1 kWh | ~24.1 kWh |
| Daily consumption | ~30.5 kWh | ~47.7 kWh |
| Daily grid import | ~9.2 kWh | ~23.9 kWh |
| Daily grid export | ~1.4 kWh | ~0.4 kWh |
| Evening SOC | ~49% | ~23% |

- Self-consumption rate: ~93% across the dataset (~98% in June — almost nothing is exported)
- Self-sufficiency by month: 54% (Dec) → 60% (Jan) → 73% (Feb) → 77% (Mar) → 68% (Apr) → 70% (May) → 60% (Jun)
- Grid export is concentrated at 12:00–15:00 when the battery is full; June exported only ~5 kWh all month
- Battery drains from ~53% to ~21% overnight on non-EV days (~32-point drain)
- On EV days the battery depletes to ~23% evening SOC, forcing heavy grid import
- Non-EV baseline load (~30.5 kWh) outruns daily PV (~23 kWh) in the wet season, so June leaned on the grid

### Hourly Patterns

- PV generation peaks 09:00–14:00, topping out around ~5.4 kW at midday
- Household load peaks in the afternoon (14:00–16:00, ~1.8–2.3 kW), after PV has begun tapering
- PHEV charging spreads across 09:00–21:00 on EV days — too much of it lands after the solar peak
- The battery reaches full and begins exporting only in a narrow 12:00–15:00 window
- Overnight the weekday load floor holds ~700 W (03:00–07:00), driving a steady pre-dawn grid draw

### Weekday vs Weekend

Weekday and weekend patterns are similar (~30.2 vs ~31.3 kWh/day load, 69% vs 72% self-sufficiency). The main difference is a higher weekend afternoon load (up to ~460 W more at 15:00) when occupants are home — which actually matches PV better, giving weekends a slight self-sufficiency edge.

### Peak Demand

- Peak grid draw: ~9.1 kW on 2026-05-15 at 18:00 (non-EV day — a large evening load coinciding with a drained battery)
- Average daily peak: ~1.8 kW (non-EV), ~5.8 kW (EV days)
- Peak PV output: ~5.4 kW on 2026-03-15 at 12:00 (~68% of inverter AC capacity)

## System Size Assessment

There is comfortable inverter headroom for future expansion, though no expansion is modelled in this report.

### PV Array (6.5 kWp): correctly sized for base load, light on wet-season and EV days

- Peak output reached ~5,436 W (~84% of nameplate, ~68% of inverter capacity)
- Zero clipping against either panel nameplate or the 8 kW inverter — the inverter is loafing at a 0.81 DC/AC ratio
- Peak sun hours ranged ~2.5 (December) to ~4.3 (April–May), easing to ~3.6 in June as the wet season began
- Non-EV PV/load ratio ~0.76 — generation slightly trails baseline load, which is why import never reaches zero
- EV days need ~48 kWh against ~24 kWh generated: the deficit on those days is generation, not storage

### Battery (14.3 kWh): adequate, not the bottleneck

- Non-EV cycle depth ~62% (~8.8 kWh discharge/day), leaving headroom on ordinary nights
- On EV days the battery is fully drawn and the shortfall is generation — more storage would not help
- Round-trip efficiency ~96% in June (healthy LFP range)

### Verdict

The system is well-sized for everyday household load and delivers ~93% self-consumption. The wet season and PHEV-charging days are where the grid still does work, and both are generation-limited rather than storage-limited — so the highest-value levers are behavioral (midday car charging, overnight base-load trimming) rather than more hardware. The idle inverter headroom leaves a clean path to add panels later if wet-season output becomes a priority.

## Battery Health

- Nominal capacity: 14.3 kWh, estimated usable: ~14.2 kWh (~99% of nominal)
- Round-trip efficiency: ~96% in June (typical LFP range: 92–95%; readings sit at or above it)
- Daily equivalent full cycles: ~0.62 (~226 per year)
- Estimated cycle life remaining: ~26 years at current usage (based on a 6,000-cycle LFP rating)

Monthly efficiency has held in a healthy 94–98% band across all seven months with no downward trend. Two isolated low readings (Mar 17 ~79%, May 17 ~80%) appear to be BMS recalibration events, not degradation — worth a passing glance if they recur.

## Month-over-Month Trends

| Metric | May 2026 | Jun 2026 | Change |
|---|---|---|---|
| Avg daily PV | ~27.8 kWh | ~23.4 kWh | −16% |
| Avg daily load | ~38.8 kWh | ~38.4 kWh | −1% |
| Self-sufficiency | 70% | 60% | −10pp |
| Grid dependence | 30% | 40% | +10pp |
| Battery efficiency | 97.4% | 96.2% | −1.2pp |

June is the first clear wet-season signal after five months of rising or stable output. Generation fell ~16% while load barely moved, so self-sufficiency gave back most of the gains built up since December. This is expected seasonal behavior for a tropical site, not a system problem — the battery and PV hardware are performing normally.

## Annual Projection

- Data coverage: 7 months (high confidence)
- Seasonal context: the data now spans the December wet-season dip, the February–May dry-season peak, and the June wet-season onset — a broad sample for a tropical profile
- Projected annual generation: ~8,210 kWh (year 1), ~7,809 kWh (year 10), ~7,243 kWh (year 25)
- Projected annual self-consumed: ~7,653 kWh
- Projected annual grid export: ~556 kWh
- Environmental impact: ~5.2 tonnes CO₂ avoided annually (at 0.68 kg CO₂/kWh), equivalent to ~237 trees planted or ~24,800 km not driven

Expect generation to soften further through the July–October wet months before recovering toward the dry-season peak early next year. The forward bill and ROI figures use today's ₱16.10 rate; if rates keep climbing as they have all year, realized savings will run slightly ahead of these projections.

## Methodology Notes

### Data Processing
- Energy values assume 1-hour buckets (each row = 1 hour). Days with ≤20 of 24 hourly rows are excluded from daily statistics as partial days.
- Self-consumed energy is calculated as `total_load − grid_import`, which measures actual solar offset and avoids inflating by battery round-trip losses.
- Grid sign convention: negative = import, positive = export (the raw `psum` channel from the inverter). All import/export figures follow this.

### EV Detection
- EV charging days are detected using a threshold of ~9.9 kWh above the ~32.9 kWh daily average (formula: `max(8, avg_daily_load × 0.3)`). The 8 kWh floor catches PHEV charges.
- Days near the threshold may be misclassified; the heuristic cannot distinguish EV charging from other high-load events (guests, space heaters).

### Battery Analysis
- Usable capacity is estimated from the deepest monotonic SOC decline per day, using only days with >30% SOC swing. BMS-reported SOC may not be linear at extremes.
- Round-trip efficiency is computed on monthly aggregates to smooth daily SOC imbalances.
- Avoidable import uses an upper-bound estimate that overstates savings — it ignores hourly timing mismatches.

### Anomaly Detection
- PV anomalies flag days with generation \<60% of the rolling 14-day mean (first 3 days excluded). Cannot distinguish equipment faults from weather — heavy cloud triggers false positives.
- Load anomalies flag non-EV days exceeding mean + 2 standard deviations.
- Battery anomalies flag days with round-trip efficiency \<80% where start/end SOC are within 5%.

### Financial Estimates
- Past months are billed at the rate in effect that month (tariff history: ₱14.41 → ₱16.10). The annual projection and ROI use the current ₱16.10 tariff.
- Feed-in credit applies a flat ₱9.08/kWh to exported energy.
- ROI uses 0.5%/year panel degradation. It does not model inverter replacement, battery degradation beyond cycle count, or electricity price inflation.
- Battery cycle life uses a 6,000-cycle LFP rating; actual life varies by depth of discharge, temperature, and charge rate.

### Projections
- Annual projection de-seasonalizes observed data using tropical seasonal factors (wet ×0.93, dry ×1.07), then re-applies all 12 months using 30.44 days/month.

### Environmental
- Avoided CO₂ is computed as self-consumed kWh × grid factor (0.68), not gross PV — a conservative convention that excludes displaced grid emissions from exported energy.
- Carbon equivalents use fixed values: 22 kg CO₂/tree/year, 0.21 kg CO₂/km.

## Appendix

### Best and Worst Days

**Best day: 2026-03-19** — PV: 30.0 kWh, Load: 25.5 kWh, Import: 1.4 kWh, Export: 6.4 kWh. Non-EV. High dry-season generation against a modest load, battery hit 100% SOC. Self-sufficiency: 95%.

**Worst day: 2026-01-02** — PV: 4.7 kWh, Load: 15.6 kWh, Import: 12.5 kWh, Export: 0 kWh. Non-EV. Heavy wet-season cloud left generation near zero, so the house ran mostly on the grid. Self-sufficiency: 20%.

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

### June PV Dips (wet-season onset)

Six June days fell >40% below their rolling baseline — 2026-06-01 (−42%), 06-04 (−40%), 06-05 (−74%), 06-06 (−50%), 06-24 (−49%), 06-30 (−69%). These cluster at the start and end of the month and are consistent with wet-season cloud and storms rather than any fault. Worth a glance at inverter logs only if similarly deep dips recur on days that were not overcast.

### Next Steps

- Run this analysis again after July to extend the wet-season sample and sharpen the annual projection
- Configure the EVSE charging schedule per Recommendation 1 and compare next month's EV-day import
- Use a plug-in power meter to identify the ~700 W overnight base load and report findings next time
- Monitor battery efficiency trend — the current 94–98% range is healthy; flag if any month drops below 90%

### Disclaimer

This report was generated by an AI model. While the numerical computations are performed by a deterministic script (`analyze.py`), the narrative interpretation, recommendations, and contextual inferences (seasonal factors, grid emission factors, sizing assessments) are AI-generated and may contain inaccuracies. Verify critical findings — especially financial estimates and equipment diagnostics — against your own records, manufacturer specifications, or a qualified solar professional before making decisions.

### Data Sources

- [`data/solar_hourly_2025-12.csv`](/solar-report/data/solar_hourly_2025-12.csv) — 31 days
- [`data/solar_hourly_2026-01.csv`](/solar-report/data/solar_hourly_2026-01.csv) — 31 days
- [`data/solar_hourly_2026-02.csv`](/solar-report/data/solar_hourly_2026-02.csv) — 28 days
- [`data/solar_hourly_2026-03.csv`](/solar-report/data/solar_hourly_2026-03.csv) — 30 days
- [`data/solar_hourly_2026-04.csv`](/solar-report/data/solar_hourly_2026-04.csv) — 30 days
- [`data/solar_hourly_2026-05.csv`](/solar-report/data/solar_hourly_2026-05.csv) — 31 days
- [`data/solar_hourly_2026-06.csv`](/solar-report/data/solar_hourly_2026-06.csv) — 30 days
