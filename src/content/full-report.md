---
feed: false
href: "/solar-report/full-report"
eyebrow: "Full report · 2026-05"
title: "Full residential 6.5 kWp solar performance report — Cavite, Philippines"
description: >-
  Full hourly-data analysis of a 6.5 kWp / 14.3 kWh / 8 kW residential solar-plus-battery system in Cavite, Philippines: generation, self-sufficiency, recommendations, bill impact, ROI, battery health, and projections.
datePublished: "2026-05-01"
dateModified: "2026-06-01"
category: "Home & Energy"
---

# Solar System Recommendations

Based on analysis of solar data from December 2025 – May 2026 (181 days).

## Executive Summary

The 6.5 kWp system is on track for a **~3.2-year payback** on the ₱400,000 invested (~2.7 years remaining), cutting the electricity bill by **~70%** — roughly ₱126,000/year. Self-sufficiency climbed from 54% in December to a 77% peak in March as the dry season arrived, then eased to ~70% in April–May as household load rose. The single highest-impact change is **shifting PHEV charging into the midday solar window (09:00–14:00)**: charging currently lands in the late afternoon and evening, when it pulls 1.3–1.6 kW straight from the grid and more than doubles daily import (~21 kWh on charging days vs ~9 kWh otherwise).

No equipment faults were detected. Six low-generation days trace to cloudy December/January weather, and two days of soft battery round-trip efficiency (~79%) look like BMS recalibration rather than degradation. The system avoids **~5.1 tonnes of CO₂ a year**.

## System Profile

- **PV capacity**: 6.5 kWp, inverter: 8 kW AC (DC/AC ratio: 0.81 — inverter substantially oversized, large expansion headroom)
- **Battery**: 14.3 kWh nominal, ~14.3 kWh usable estimated (operating SOC range 20%–86%)
- **EV/PHEV**: PHEV present; charging detected on ~27 of 181 days, concentrated afternoon/evening
- **Tariff**: Flat — ₱15.5/kWh import
- **Feed-in tariff**: ₱8.80/kWh (~57% of import rate)

## Recommendations

### 1. Move PHEV charging into the midday solar window (highest impact)

On charging days the household pulls ~21 kWh from the grid versus ~9 kWh on ordinary days — an extra ~12 kWh/day. The reason is timing: charging shows up from early afternoon into the evening (peaking 14:00–20:00), exactly when PV has tapered and the battery is already being drawn down for house load. By 16:00–20:00 on charging days the grid draw averages 1.3–1.6 kW continuously, and evening SOC on those days sits at ~29% versus ~52% on non-charging days.

Shifting the charge to 09:00–14:00 lets the PHEV soak up surplus PV directly. Midday is when the system is most often exporting (12:00–15:00) or topping a nearly full battery (~80% SOC by 14:00), so that energy currently leaves at the ₱8.80 feed-in rate or is simply unused inverter headroom. Recharging the car at midday converts roughly that 12 kWh/day from ₱15.5 grid import into self-consumed solar — about **₱150–180 saved per charging day**, on the order of **₱4,000–5,000/year** at the current charging cadence, with a corresponding cut to peak grid demand.

Implementation: set the EVSE or the car's in-cabin scheduler to start at ~09:00 and finish by ~14:00. On weekends this is easy since someone is usually home; on weekdays, rely on the charger's built-in timer so it runs unattended.

### 2. Trim overnight base load

On ordinary nights the battery discharges from ~56% in the early evening to ~22% by dawn, and even after it bottoms out the house keeps importing ~0.6–0.7 kWh every hour from roughly 22:00 to 06:00 — about 6–8 kWh of grid energy each night at full import price. The overnight load floor sits around 700–900 W, which is high for a sleeping house and points to always-on draws (standby electronics, pumps, an older fridge, networking gear).

Every 100 W shaved off that floor is ~2.4 kWh/day, or ~₱13,000/year at ₱15.5/kWh — and because it is consumed when neither PV nor a full battery can cover it, the saving is dollar-for-dollar grid offset with no feed-in trade-off. A plug-in energy meter over a week would pinpoint the biggest overnight culprits; the usual wins are consolidating standby loads onto switchable strips and replacing an inefficient refrigerator.

### 3. Consider adding panels — the inverter has room

The 8 kW inverter is paired with only 6.5 kWp of panels, a DC/AC ratio of 0.81. Peak output observed all year was 5.4 kW — just 68% of the inverter's AC rating and 84% of panel nameplate — so there has been **zero clipping** and the inverter is loafing. There is comfortable headroom to add ~2–3 kWp without touching the inverter.

More generation matters most in two places the data flags: the December–January wet-season dip (capacity factor fell to ~10.5% and self-sufficiency to 54%), and high-load PHEV/AC days where the deficit is generation, not storage. Extra midday PV would also feed Recommendation 1's daytime car charging. The main caveat is roof space and orientation — this projection assumes new panels match the existing tilt and aspect.

### Not Recommended

- **Grid-charging the battery off-peak**: the tariff is flat (₱15.5/kWh around the clock), so there is no cheap window to arbitrage — grid-charging would only add round-trip losses.
- **A second/larger battery**: the existing 14.3 kWh already delivers ~92% overall self-consumption and projected annual export is only ~611 kWh. There is too little surplus to store for a second pack to pay back.

## Bill Impact

### Monthly Electricity Cost Comparison

| Month | Without Solar | With Solar | Feed-in Credit | Net Savings |
|---|---|---|---|---|
| Dec 2025 | ₱14,440 | ₱6,597 | ₱0 | ₱7,842 |
| Jan 2026 | ₱12,874 | ₱5,152 | ₱96 | ₱7,818 |
| Feb 2026 | ₱11,916 | ₱3,224 | ₱784 | ₱9,476 |
| Mar 2026 | ₱13,663 | ₱3,209 | ₱1,099 | ₱11,553 |
| Apr 2026 | ₱18,151 | ₱5,779 | ₱218 | ₱12,590 |
| May 2026 | ₱18,633 | ₱5,599 | ₱128 | ₱13,162 |

- Estimated annual bill without solar: **₱180,840**
- Estimated annual bill with solar: **₱59,610**
- **Annual bill reduction: ₱125,917 (70%)**

Savings grew through the period as generation rose with the dry season and household load (AC, PHEV) climbed — the more electricity used, the more the system displaces at ₱15.5/kWh. Feed-in credit is minor (~₱4,700/year) because almost everything generated is consumed on-site rather than exported.

## ROI Estimate

| Metric | With Battery | Without Battery |
|---|---|---|
| System cost | ₱400,000 | ₱280,000 |
| Estimated annual savings (year 1) | ₱125,917 | ~₱92,000 |
| **Simple payback** | **~3.2 years** | **~3.0 years** |
| Remaining payback | ~2.7 years | ~2.5 years |
| 25-year lifetime savings | ~₱2,966,000 | ~₱2,150,000 |

**Battery incremental ROI**: the ₱120,000 battery adds roughly ₱34,000/year by shifting evening and overnight load from grid import (₱15.5) to stored solar, rather than exporting that solar at ₱8.80. That implies a battery-only payback of ~3.5 years — slightly longer than the panels alone, but well inside the battery's cycle-life horizon (see Battery Health). The panels carry most of the return, and the battery is justified primarily because it lifts self-sufficiency from the ~50% a panel-only system would manage here to ~70%, insulating the household from evening grid reliance.

The ₱400,000 figure is the all-in reported cost; if it includes financing, the hardware-only payback would be shorter. Payback is comfortably within the 25-year panel lifespan. Implementing Recommendations 1 and 2 would push annual savings higher and shorten the remaining payback toward ~2.4 years.

## Key Metrics

| Metric | Non-EV Days | EV/High-Load Days |
|---|---|---|
| Daily PV generation | ~23 kWh | ~24 kWh |
| Daily consumption | ~30 kWh | ~45 kWh |
| Daily grid import | ~9 kWh | ~21 kWh |
| Daily grid export | ~1.7 kWh | ~0.3 kWh |
| Evening SOC | ~52% | ~29% |

- Self-consumption rate: ~99% (Dec), ~85% (Feb), ~97% (May) — overall ~92%
- Self-sufficiency: 54% (Dec) → 60% (Jan) → 73% (Feb) → 77% (Mar) → 68% (Apr) → 70% (May)
- Grid export concentrates at 12:00–15:00 when the battery is full (~80% SOC)
- The battery drains from ~56% to ~22% overnight on ordinary days (~33-point drain)
- On high-load days the battery hits ~20% by late evening, forcing heavy grid import
- Non-EV baseline load (~30 kWh) runs a bit ahead of daily PV (~23 kWh), so storage bridges the gap but cannot fully close it in the wet season

### Hourly Patterns

- PV ramps from ~06:00, peaks 11:00–13:00 at ~3.6–3.7 kW (max 5.4 kW), and fades by 18:00 — about 3.6 peak-sun-hours on average.
- House load peaks in the afternoon/evening (14:00–18:00, ~1.8–1.9 kW) — after PV has rolled off, which is why the battery does its heavy lifting then.
- PHEV/high-load charging surges in the afternoon and evening; on those days load runs 1.5–3 kW above baseline from 14:00 to 20:00.
- The battery charges through late morning and is typically full (~80–86% SOC) by 13:00–14:00, after which midday surplus exports.
- Overnight import runs ~0.6–0.7 kWh/hour from ~22:00 to 06:00 once the battery is depleted — the steadiest grid draw of the day.

### Weekday vs Weekend

Weekday and weekend consumption are essentially the same (~29.7 kWh each; 70% vs 72% self-sufficiency). The only notable intraday shift is heavier mid-afternoon load on weekends (~13:00 and 15:00) and slightly lighter early-evening load (~17:00), consistent with occupants being home midday on weekends.

### Peak Demand

- Peak grid draw: **9.1 kW on 2026-05-15 at 18:00** (a non-EV day) — an unusually high evening spike worth noting if a demand charge is ever introduced.
- Average daily peak: ~1.8 kW (ordinary days), ~4.9 kW (high-load/EV days).
- Peak PV output: 5.4 kW on 2026-03-15 at 12:00 (68% of inverter capacity).

## System Size Assessment

Roof expansion room was not specified, but the inverter clearly has the electrical headroom for more panels.

### PV Array (6.5 kWp): well-sized for base load, undersized for high-load days

- Peak output reached 5,436 W (84% of nameplate, 68% of inverter capacity).
- No clipping at either the panel or inverter level — output never approached the 8 kW AC limit, so additional panels would generate freely.
- Peak sun hours ranged from ~2.5/day (Dec–Jan wet season) to ~4.3/day (Mar–May dry season).
- Non-EV PV/load ratio is ~0.77 — generation slightly trails consumption, so the system leans on the battery and some grid even on ordinary days.
- On PHEV/AC-heavy days the deficit is generation: load nearly doubles while PV is unchanged, so import spikes regardless of storage.

### Battery (14.3 kWh): adequate and not the bottleneck

- Ordinary-day cycle depth ~62% (charge ~9.3 kWh, discharge ~8.9 kWh), with headroom to spare — the battery rarely floors out except on high-load days.
- On high-load days cycle depth rises to ~67% and the pack empties by late evening; a bigger battery wouldn't help because the shortfall is generation, not storage capacity.
- Round-trip efficiency observed at 94.5–98.3% monthly — healthy LFP behavior.
- Estimated avoidable import is only ~1.6 kWh/day, confirming the battery is already capturing most of the available surplus.

### Verdict

The system is well-matched to ordinary household use and delivers a strong ~70% bill cut and ~3.2-year payback. The battery is correctly sized and healthy; the real optimization levers are behavioral (midday PHEV charging, overnight base-load trimming) and, secondarily, a modest panel addition that the oversized inverter would absorb without clipping. More storage is not warranted.

## Battery Health

- Nominal capacity: 14.3 kWh, estimated usable: ~14.3 kWh (estimate effectively at nominal — treat as an upper bound; true usable is likely ~90–95% given the 20% SOC floor).
- Round-trip efficiency: 94.5%–98.3% monthly (typical LFP range 92–95%; the high readings reflect favorable start/end SOC alignment).
- Daily equivalent full cycles: ~0.63 (~230/year).
- Estimated cycle life remaining: ~26 years at current usage (based on a 6,000-cycle LFP rating) — calendar aging, not cycling, will be the limiting factor.

Efficiency shows no declining trend across the six months (it dipped to 94.5% in March, recovered to 98% in April), so no degradation concern. Two isolated low-efficiency days (Mar 17 ~79%, May 17 ~80%) appear to be BMS recalibration events; worth a glance only if they recur.

## Month-over-Month Trends

| Metric | Dec | Jan | Feb | Mar | Apr | May |
|---|---|---|---|---|---|---|
| Avg daily PV | ~16.5 | ~16.7 | ~23.6 | ~27.2 | ~27.6 | ~27.8 kWh |
| Avg daily load | ~30.1 | ~26.8 | ~27.5 | ~29.4 | ~39.0 | ~38.8 kWh |
| Self-sufficiency | 54% | 60% | 73% | 77% | 68% | 70% |
| Grid dependence | 46% | 40% | 27% | 23% | 32% | 30% |
| Battery efficiency | 98.3% | 96.7% | 96.3% | 94.5% | 98.0% | 97.4% |

Two stories dominate. First, generation jumped ~41% from January to February and kept climbing as the dry season set in — PV nearly doubled from the December trough, lifting self-sufficiency to its March peak. Second, household load surged ~33% in April and stayed high in May: this was sustained air-conditioning while our daughter was home on summer break, with the PHEV off the road (in the shop) for much of April. That AC load — not car charging — is why several late-April days register as "high-load" and why self-sufficiency slipped back from 77% to ~70% even as generation held steady.

## Annual Projection

- Data coverage: 6 months (**high confidence**).
- Seasonal context: spans the December–January wet-season trough through the February–May dry-season ramp; a dry-season factor of ~1.07 was applied to Mar–May.
- Projected annual generation: ~8,064 kWh (year 1), ~7,669 kWh (year 10), ~7,114 kWh (year 25).
- Projected annual self-consumed: ~7,452 kWh.
- Projected annual grid export: ~611 kWh.
- Environmental impact: ~5.1 tonnes CO₂ avoided annually (at 0.68 kg CO₂/kWh), equivalent to ~230 trees planted or ~24,000 km not driven.

Expect generation to stay strong through the dry months and dip again in the mid-year wet season (roughly June–October), mirroring the December–January trough seen here. A full year of data will tighten the wet-season half of this estimate.

## Methodology Notes

This section documents the heuristics, assumptions, and caveats behind the computations. All numerical results come from a deterministic script (`analyze.py`); the items below describe modelling choices that affect interpretation.

### Data Processing
- Energy values assume 1-hour buckets (each row = 1 hour). Days with ≤20 of 24 hourly rows are excluded from daily statistics.
- Self-consumed energy is `total_load − grid_import`, which measures actual solar offset and avoids inflating the figure by battery round-trip losses.

### EV Detection
- High-load days are flagged using a threshold of ~9.6 kWh above the ~32 kWh daily average (`max(8, avg_daily_load × 0.3)`). 27 of 181 days were flagged.
- The heuristic cannot distinguish PHEV charging from other high-load events. Notably, the late-April cluster (Apr 25–29) was heavy air-conditioning during a school break while the PHEV was off the road, so the "EV day" bucket overstates actual charging in April–May. EV-day metrics should be read as "high-load days," not strictly charging days.

### Battery Analysis
- **Usable capacity** is estimated from the deepest monotonic SOC decline per day (days with >30% SOC swing). Here the estimate reached nominal, which is optimistic — BMS SOC non-linearity at the extremes can bias it upward; true usable is more likely ~90–95% of nominal.
- **Round-trip efficiency** is computed on monthly aggregates to smooth daily SOC imbalances.
- **Avoidable import** uses a daily upper-bound estimate that can overstate savings by ignoring hourly timing mismatches.

### Anomaly Detection
- **PV anomalies**: flags days with generation \<60% of the rolling 14-day mean (first 3 days excluded); cannot separate equipment faults from heavy cloud cover.
- **Load anomalies**: flags non-EV days exceeding mean + 2 standard deviations.
- **Battery anomalies**: flags days with round-trip efficiency \<80% where start/end SOC are within 5%.

### Financial Estimates
- Flat tariff of ₱15.5/kWh import, feed-in at ₱8.80/kWh (~57%), applied uniformly.
- ROI uses 0.5%/year panel degradation. It does not model inverter replacement (~10–15 years), electricity-price inflation, or battery degradation beyond cycle count.
- The "without battery" projection assumes all non-real-time solar is exported at the feed-in rate rather than stored.

### Projections
- Annual projection de-seasonalizes observed data using tropical-climate factors (wet ×0.93, dry ×1.07), then re-applies all 12 months, using 30.44 days/month.

### Environmental
- Avoided CO₂ is computed as self-consumed kWh × grid factor (0.68 kg/kWh for the Philippines) — conservative, since exported kWh also displace grid generation.
- Carbon equivalents use 22 kg CO₂/tree/year and 0.21 kg CO₂/km.

## Appendix

### Best and Worst Days

**Best day: 2026-03-19** — PV: 30.0 kWh, Load: 25.5 kWh, Import: 1.4 kWh, Export: 6.4 kWh. Non-EV. A high-generation dry-season day with moderate load; the battery hit 100% SOC and surplus was exported. Self-sufficiency: 95%.

**Worst day: 2026-01-02** — PV: 4.7 kWh, Load: 15.6 kWh, Import: 12.5 kWh, Export: 0 kWh. Non-EV. A heavily overcast wet-season day — generation collapsed to ~74% below baseline, so the house ran almost entirely on the grid. Self-sufficiency: 20%.

### Capacity Factor

| Month | Avg Daily kWh | Peak Sun Hours | Capacity Factor | Grid Dependence |
|---|---|---|---|---|
| Dec 2025 | 16.5 | 2.5 | 10.5% | 46% |
| Jan 2026 | 16.7 | 2.6 | 10.7% | 40% |
| Feb 2026 | 23.6 | 3.6 | 15.1% | 27% |
| Mar 2026 | 27.2 | 4.2 | 17.4% | 23% |
| Apr 2026 | 27.6 | 4.3 | 17.7% | 32% |
| May 2026 | 27.8 | 4.3 | 17.8% | 30% |

### Next Steps

- Run this analysis again after June–July to capture the wet-season trough and firm up the annual projection.
- Configure the EVSE/charging schedule per Recommendation 1, then compare next month's high-load-day import.
- Use a plug-in power meter for a week to identify the overnight base load behind the ~0.7 kWh/hour grid draw.
- Keep an eye on the two low-efficiency battery days — current 94–98% range is healthy; flag if any month drops below 90%.

### Disclaimer

This report was generated by an AI model. While the numerical computations are performed by a deterministic script (`analyze.py`), the narrative interpretation, recommendations, and contextual inferences (seasonal factors, grid emission factor, sizing assessments) are AI-generated and may contain inaccuracies. Verify critical findings — especially financial estimates and equipment diagnostics — against your own records, manufacturer specifications, or a qualified solar professional before acting on them.

### Data Sources

- [`data/solar_hourly_2025-12.csv`](/solar-report/data/solar_hourly_2025-12.csv) — 31 days
- [`data/solar_hourly_2026-01.csv`](/solar-report/data/solar_hourly_2026-01.csv) — 31 days
- [`data/solar_hourly_2026-02.csv`](/solar-report/data/solar_hourly_2026-02.csv) — 28 days
- [`data/solar_hourly_2026-03.csv`](/solar-report/data/solar_hourly_2026-03.csv) — 30 days
- [`data/solar_hourly_2026-04.csv`](/solar-report/data/solar_hourly_2026-04.csv) — 30 days
- [`data/solar_hourly_2026-05.csv`](/solar-report/data/solar_hourly_2026-05.csv) — 31 days
