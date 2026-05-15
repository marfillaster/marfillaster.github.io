# Solar System Recommendations

Based on analysis of solar data from 2025-12 to 2026-04 (150 days).

## Executive Summary

Your 6.5 kWp Cavite system is performing well across five months. Self-sufficiency climbed from 54% in December to a peak of 76% in March, then dipped to 68% in April as household consumption jumped sharply (avg daily load rose from ~29 to ~39 kWh, +33% month-over-month). **Important context the user clarified:** the PHEV was in the shop for all of April, so the load surge is not from EV charging — it is the second AC unit running nearly 24/7 because the user's daughter was home for summer break. The 12 days the detector flagged as "EV days" in April are actually high-AC days. At ₱15/kWh and 56% feed-in, the system is on track to cut your annual electricity bill by ~₱116k (~69%), giving a simple payback of ~3.5 years on the ₱400k investment, or ~3.1 years from today.

For Dec–Mar, the highest-impact lever is shifting PHEV charging earlier into the solar window (Dec–Mar EV days average ~19.5 kWh import vs ~7.3 kWh on non-EV days). For April specifically — and for any future summer-break stretch when the second AC runs continuously — the highest-impact lever shifts to AC management (see Recommendation 1B).

No equipment fault is visible. Peak PV reached 5.4 kW (68% of inverter capacity), there is zero clipping, and battery round-trip efficiency stays in the healthy 94–98% band. One day worth flagging: 2026-01-02 generated only 4.7 kWh against an expected ~17.8 kWh — confirm against weather/inverter logs.

The system is projected to avoid ~4.7 tonnes of CO₂ per year, equivalent to ~216 trees or ~22,600 km of car driving.

## System Profile

- **Location**: Cavite, Philippines (tropical, ~14°N)
- **PV capacity**: 6.5 kWp, inverter: 8.0 kW AC (DC/AC ratio: 0.81)
- **Battery**: 14.3 kWh nominal, ~14.3 kWh estimated usable (SOC range ~20%–86%)
- **EV/PHEV**: PHEV present (in the shop all of April 2026 — no home charging that month); 37 days flagged by the EV-day detector across 150 full days, but the 12 April flags are actually heavy-AC days, not EV charging
- **Tariff**: Flat rate at ₱15/kWh
- **Feed-in tariff**: 56% of import rate (~₱8.40/kWh credit)

## Alerts

### PV Generation Alerts

**Action required:** On 2026-01-02, PV generation was 4.7 kWh against an expected ~17.8 kWh (74% below baseline). If this does not match a known weather event or planned shutdown, check inverter logs and error codes for that date — the depth of the dip is large enough to warrant ruling out an inverter fault, tripped breaker, or partial-day outage.

The remaining low-PV days look weather-driven, but worth a glance against rainfall records:

| Date | Daily PV (kWh) | Expected (kWh) | Deviation |
|---|---|---|---|
| 2025-12-07 | 9.9 | ~17.5 | -43% |
| 2025-12-08 | 9.6 | ~16.4 | -41% |
| 2025-12-09 | 8.6 | ~15.5 | -45% |
| 2026-02-08 | 10.9 | ~19.4 | -44% |
| 2026-03-17 | 15.8 | ~28.3 | -44% |

If dips this severe recur without matching weather, investigate panel soiling or new shading.

### Battery Alerts

- **2026-03-17**: round-trip efficiency 78.7% on 8.6 kWh charged / 6.8 kWh discharged. Likely a one-off (this date also had a 44% PV dip, so SOC behavior may have been unusual). Monitor for recurrence.

No load anomalies were flagged for the dataset.

## Recommendations

### 1A. Shift PHEV charging into the late-morning solar window (Dec–Mar pattern)

What is happening now: solar output peaks 11:00–13:00, with average peak ~3.5 kW. On Dec–Mar EV days, the load profile shows a heavy charging tail running 14:00 through 20:00 — average EV-day load reaches ~3.9 kW at 15:00 and stays above ~2.6 kW until 19:00. By 16:00, PV is already down to ~700 W and the battery is forced into deep discharge (~1.3 kW out), leaving the grid to supply ~1.7 kWh in that single hour on EV days. The all-time peak grid draw of 8.7 kW (2025-12-02 at 16:00) was on a PHEV charging day.

Why it is suboptimal: non-EV days average ~7.3 kWh of import; EV days average ~19.5 kWh. That ~12 kWh/day delta is the vehicle being charged after the PV peak has passed.

What to change: when the PHEV is back from the shop, schedule the EVSE (or PHEV's onboard timer) to charge between roughly 10:00 and 14:00. Even partial improvement compounds: the analysis identifies ~1.7 kWh/day of avoidable import as an upper-bound flexible-load opportunity, ~₱9,300/year. Moving half of charging into the noon window also flattens the evening grid peak and reduces battery deep-discharge stress.

Implementation: most modern PHEVs let you set a "depart by" time or a charging window in the car's settings. If the EVSE has its own scheduler, set it there as a fail-safe. On rainy days, override and charge whenever you can.

### 1B. Manage the second AC unit during summer break (April pattern)

What is happening now: April load jumped to ~39 kWh/day (+33% vs March) because the second AC unit ran nearly 24/7 with your daughter home. The 12 April days flagged as "EV days" are this AC pattern, not vehicle charging. Self-sufficiency dropped from 76% (March) to 68% (April) even though PV generation actually held flat — the system simply could not keep up with continuous AC.

Why it matters: summer break is recurring (every April–May), so this pattern will likely repeat each year. With one AC running through the night, the battery is being asked to cover what the panels cannot — and overnight AC load goes straight to grid once the battery is depleted. Continuous AC also tends to be the single largest discretionary load in the home.

What to change — in priority order:
1. **Pre-cool during the solar peak (11:00–14:00)** and let the room coast warmer afterward. Solar is essentially free at noon (you are exporting at half-rate); using it directly to drop the room 1–2 °C below your target gives you a thermal buffer that reduces afternoon/evening compressor runtime.
2. **Raise the overnight setpoint by 1–2 °C** if comfort allows. Each °C typically cuts AC consumption by ~5–10%. Overnight AC is the highest-cost kWh in the system because it lands entirely on grid import after the battery drains.
3. **If the second AC is a non-inverter unit**, the upgrade payback during summer-break months is short — an inverter split typically uses 30–50% less energy at part-load. Worth getting a quote if it is being run 4+ months a year.
4. **Schedule the second AC to "off" or eco mode during 22:00–05:00** if anyone in the room can tolerate it. That is the window where the battery has nothing left and the grid is doing all the work.

Quantified impact: if April's continuous AC adds roughly 10 kWh/day vs the non-summer baseline, even a 30% reduction (3 kWh/day × 60 summer-break days) saves ~180 kWh, or ~₱2,700/year just from this season. A bigger setpoint or inverter-AC upgrade could easily double that.

### 2. Tighten the overnight base load

What is happening now: on non-EV days the home draws ~600–900 W continuously from midnight to 06:00 — over six hours that is ~4.4 kWh of grid+battery overnight base load. Battery alone covers most of the early evening, but by 22:00 SOC is averaging ~39% and falling, so by 02:00–05:00 the grid is supplying ~0.5 kWh per hour. Hour-of-the-day imports peak at ~0.6 kWh at 23:00 and again at 04:00–05:00.

Why it matters: even modest overnight reductions translate directly into saved import — every 100 W of always-on load removed saves ~2.4 kWh/day, or ~₱13,000/year at ₱15/kWh. It is one of the few opportunities the battery cannot help with, because it is depleted by then.

What to change: a plug-in power meter (e.g. P3 Kill A Watt or any local equivalent at <₱1,000) can identify the overnight offenders in an evening or two. Common culprits: pool/aquarium pumps left on continuously, water heater set to maintain at night, second fridge, gaming consoles in standby, networking gear. Even a smart plug with a schedule on a single 100 W device can pay for itself in a month.

### 3. Hold off on hardware additions until charging behavior is optimized

What the data says: there is no inverter or panel constraint. Peak PV reached 84% of panel nameplate and 68% of inverter capacity, with zero clipping hours. The battery is well-matched to the house-only baseline (non-EV cycle depth ~61%, evening SOC averages ~57% on non-EV days). Annual export is projected at only ~680 kWh — there is no large pool of unused midday surplus that more storage could capture.

Why this matters: a second battery's payback is set by how much you reduce export-at-feed-in-rate vs avoid import-at-full-rate. With only ~1.9 kWh/day average export on non-EV days and ~0.8 kWh on EV days, the arbitrage opportunity is small — likely a 10+ year payback on a second battery purchase.

How to act: revisit storage expansion only if (a) PHEV usage doubles or you switch to a full BEV, or (b) you add significant new daytime load you cannot shift.

### Not Recommended

- **Larger inverter for headroom**: zero clipping observed, no extra generation to unlock.
- **Second battery now**: export volume too low (~2 kWh/day average) to amortize within a useful period.
- **Grid-charging the battery off-peak**: tariff is flat, so there is no off-peak window to exploit, and the round-trip efficiency loss (~5%) would cost rather than save.

## Bill Impact

### Monthly Electricity Cost Comparison

| Month | Without Solar | With Solar | Feed-in Credit | Net Savings |
|---|---|---|---|---|
| 2025-12 | ₱13,974 | ₱6,385 | ₱0 | ₱7,589 |
| 2026-01 | ₱12,459 | ₱4,986 | ₱92 | ₱7,564 |
| 2026-02 | ₱11,531 | ₱3,120 | ₱748 | ₱9,160 |
| 2026-03 | ₱13,222 | ₱3,106 | ₱1,049 | ₱11,166 |
| 2026-04 | ₱17,565 | ₱5,592 | ₱208 | ₱12,181 |

April's "without solar" bill is the highest in the dataset because household load was ~39 kWh/day (PHEV-heavy month). Even so, net savings hit a record ₱12,181 — solar is doing more work in absolute terms when consumption is higher.

- Estimated annual bill without solar: ₱167,294
- Estimated annual bill with solar: ₱56,427
- **Annual bill reduction: ₱115,973 (~69%)**

## ROI Estimate

| Metric | With Battery | Without Battery (estimated) |
|---|---|---|
| System cost | ₱400,000 | ₱280,000 |
| Estimated annual savings (year 1) | ₱115,973 | ~₱99,000 |
| **Simple payback** | **~3.5 years** | **~2.8 years** |
| Remaining payback (from today, age 0.4 yr) | ~3.1 years | ~2.4 years |
| 25-year lifetime savings (with degradation) | ₱2,731,854 | ~₱2,330,000 |

**Battery incremental ROI**: the ₱120,000 battery adds roughly ₱17,000/year in incremental savings (energy that would otherwise have been exported at 56% feed-in is instead self-consumed at full ₱15/kWh, plus reduced overnight import on non-EV days). That puts battery-only payback at roughly ~7 years, leaving ~12+ years of healthy cycle life beyond payback (cycle-life estimate below). The panels carry most of the financial case; the battery is an incremental but defensible investment, especially for outage resilience and the comfort of evening self-sufficiency.

The without-battery numbers above are estimated, not directly computed from hourly data — actual figures would depend on whether the inverter can self-consume PV without a battery present. Treat them as directional.

Note: the ₱400,000 figure represents total cost as you reported it. If financing is included, the hardware-only payback would be slightly shorter.

## Key Metrics

| Metric | Non-EV Days | EV Days |
|---|---|---|
| Daily PV generation | ~21.7 kWh | ~23.7 kWh |
| Daily consumption | ~26.5 kWh | ~43.0 kWh |
| Daily grid import | ~7.3 kWh | ~19.5 kWh |
| Daily grid export | ~2.0 kWh | ~0.8 kWh |
| Evening SOC | ~57% | ~27% |

Followed by:

- Self-consumption rate: 99% (Dec), 96% (Jan), 85% (Feb), 83% (Mar), 96% (Apr) — high values reflect that almost all generated solar is consumed; low export.
- Self-sufficiency: 54% → 60% → 73% → 76% → 68% across Dec → Apr; April dropped due to PHEV-heavy month.
- Grid export concentrated at 12:00–14:00 when battery hits ~83% SOC and surplus spills.
- Battery drains from ~61% (evening) to ~23% (early morning) on non-EV days — ~38 percentage points overnight.
- On EV days, battery is already depleted to ~30% by evening, leaving little overnight buffer and forcing heavy grid import after 16:00.
- Non-EV baseline load (~26.5 kWh) is well-matched to PV (~21.7 kWh) — the deficit is mostly overnight base load.

### Hourly Patterns

- **PV peak**: 09:00–14:00, averaging ~2,200–3,500 W. Single highest measured was 5.4 kW on 2026-03-15 at 12:00.
- **Non-EV load peak**: shifts late, with ~1.5 kW from 14:00 to 18:00 — driven by afternoon cooking and early-evening AC.
- **EV charging window**: load surges to ~2.2–3.9 kW from 09:00 through 19:00 on EV days. The heaviest single hour averages ~3.9 kW at 15:00.
- **Battery taper**: charging slows after 13:00 once SOC reaches ~80%; full export window is short (12:00–14:00).
- **Overnight grid window**: 22:00–06:00 averages ~0.5 kWh/hour of import on non-EV days — ~4.4 kWh/day of base-load import that the battery cannot fully cover.

### Weekday vs Weekend

Weekday and weekend patterns are similar (~26.7 kWh weekday vs ~25.8 kWh weekend, 72% vs 74% self-sufficiency). The notable difference is timing: weekend midday consumption is ~300–435 W higher at 12:00–13:00 (likely lunch cooking and household activity at home), while weekday evenings 17:00 and 21:00 are ~250–350 W higher (return-from-work appliance use). This means weekend solar matches household demand slightly better, hence the marginally higher self-sufficiency.

### Peak Demand

- Peak grid draw: **8.7 kW on 2025-12-02 at 16:00** (EV day).
- Average daily peak: ~1.5 kW (non-EV), ~4.7 kW (EV days).
- Peak PV output: 5.4 kW on 2026-03-15 at 12:00 (68% of 8 kW inverter capacity — comfortable headroom, no clipping).

## System Size Assessment

You indicated no plans for additional panels.

### PV Array (6.5 kWp): correctly sized for base load, deficit on EV days

- Peak output reached 5,436 W (84% of nameplate, 68% of inverter capacity).
- Peak sun hours per month: 2.5 (Dec) → 4.3 (Apr). The dataset spans dry-season ramp-up; expect a wet-season decline (Jun–Oct) of ~10–15%.
- Non-EV PV/load ratio is ~0.82 — PV covers about 82% of non-EV daily energy if perfectly time-shifted, which the battery enables for evening/early-morning loads but not deep overnight.
- EV days have a ~20 kWh/day deficit that no realistic battery sizing solves — it is a generation-vs-load mismatch, addressable only by load timing or more panels.
- Zero clipping hours observed against either panel nameplate or inverter capacity.

### Battery (14.3 kWh): adequate for non-EV days, stretched on EV days

- Non-EV days: ~9.4 kWh charge / ~8.8 kWh discharge, ~61% cycle depth, evening SOC ~57%. Healthy headroom.
- EV days: ~9.0 kWh charge / ~9.6 kWh discharge, ~67% cycle depth, evening SOC ~27%. Battery is fully spent before night begins.
- Round-trip efficiency: 94–98% across months — well within healthy LFP range.
- Avoidable import: ~1.7 kWh/day average — most of this is the EV-day timing mismatch, not a storage capacity shortfall.

### Verdict

The system is well-sized for the household. The optimization opportunity is behavioral (when the PHEV charges, what runs overnight), not hardware. Hardware additions would carry long payback periods at current usage and tariff.

## Battery Health

- Nominal capacity: 14.3 kWh, estimated usable: ~14.3 kWh (~100% of nominal — the SOC-based estimate suggests the BMS is reporting a wide usable window).
- Round-trip efficiency by month: 98.3% (Dec), 96.7% (Jan), 96.3% (Feb), 94.5% (Mar), 98.0% (Apr) — all within healthy LFP range (typical 92–95%).
- Daily equivalent full cycles: ~0.63 (~230 cycles per year).
- At a typical 6,000-cycle LFP rating, estimated remaining cycle life: ~26 years at current usage. In practice, calendar aging will be the limiting factor, not cycles.

The slight Mar dip (94.5%) was driven by 2026-03-17, the same day flagged in the battery alert. Watch the April–May trend; if any month dips below 90%, flag for investigation.

## Month-over-Month Trends

| Metric | Dec | Jan | Feb | Mar | Apr | Δ (Mar→Apr) |
|---|---|---|---|---|---|---|
| Avg daily PV | 16.5 | 16.7 | 23.6 | 27.2 | 27.6 | +2% |
| Avg daily load | 30.1 | 26.8 | 27.5 | 29.4 | 39.0 | +33% |
| Self-sufficiency | 54% | 60% | 73% | 76% | 68% | −8 pp |
| Grid dependence | 46% | 40% | 27% | 23% | 32% | +8 pp |
| Battery efficiency | 98% | 97% | 96% | 95% | 98% | +3 pp |

The Dec → Mar arc is classic dry-season PV ramp combined with relatively stable load. April broke the pattern: PV stayed flat (already near seasonal peak) while load surged ~33% from March. The PHEV was in the shop for all of April, so the increase is not vehicle charging — it is the second AC unit running near-continuously with the user's daughter home for summer break. The "EV days" the detector flagged in April should be read as "high-AC days." Self-sufficiency dropped not because the system underperformed but because continuous AC outstripped what the panels and battery could cover — addressed in Recommendation 1B.

## Annual Projection

- Data coverage: 5 months (moderate confidence).
- Seasonal context: dataset spans late dry season (Dec–Apr) — wet-season months (Jun–Oct) will produce ~10–15% less.
- De-seasonalized baseline daily PV: ~21.0 kWh.
- Projected annual generation: ~7,663 kWh (year 1), ~7,289 kWh (year 10), ~6,761 kWh (year 25) — assumes 0.5%/year panel degradation.
- Projected annual self-consumed: ~6,983 kWh.
- Projected annual grid export: ~680 kWh (very low — almost everything generated is used on-site).
- Environmental impact: ~4.7 tonnes CO₂ avoided annually (at 0.68 kg CO₂/kWh Philippine grid factor), equivalent to ~216 trees planted or ~22,600 km of car driving.

Expect the wet season (Jun–Oct) to drop daily PV by ~10–15% and self-sufficiency by 5–10 percentage points. The next analysis after July will materially improve projection confidence.

## Methodology Notes

### Data Processing
- Energy values assume 1-hour buckets (each row = 1 hour). Days with ≤20 of 24 hourly rows are excluded from daily statistics as partial days.
- Self-consumed energy is calculated as `total_load - grid_import`.

### EV Detection
- EV charging days are detected using a threshold of 9.2 kWh above the 30.6 kWh daily average (formula: `max(8, avg_daily_load × 0.3)`). The 8 kWh floor catches PHEV charges; the 30% factor scales with household size.
- Days near the threshold may be misclassified; the heuristic cannot distinguish EV charging from other large sustained loads. **Confirmed false positives in this dataset:** all 12 April 2026 "EV days" are actually heavy-AC days (the PHEV was in the shop that month and not charging at home).

### Battery Analysis
- **Usable capacity** is estimated from the deepest monotonic SOC decline per day, using only days with >30% SOC swing. BMS-reported SOC may not be linear at extremes; the 100% figure suggests the BMS reports the full nameplate window as usable, which is generous.
- **Round-trip efficiency** is computed on monthly aggregates to smooth daily SOC imbalances.
- **Avoidable import** is a daily upper-bound estimate that ignores hourly timing mismatches.

### Anomaly Detection
- **PV anomalies**: flags days with generation <60% of the rolling 14-day mean (first 3 days excluded). Cannot distinguish equipment faults from heavy-cloud weather.
- **Load anomalies**: flags non-EV days exceeding mean + 2 standard deviations.
- **Battery anomalies**: flags days with round-trip efficiency <80% where start/end SOC are within 5%.

### Financial Estimates
- Flat tariff at ₱15/kWh and 56% feed-in are user-provided.
- ROI uses 0.5%/year panel degradation. Does not model inverter replacement (~10–15 yr), battery degradation beyond cycle count, or electricity price inflation.
- Without-battery ROI is an estimate based on typical direct-self-consumption shapes; not directly computed from hourly data.
- Battery cycle life uses a 6,000-cycle LFP rating; actual life varies by manufacturer, depth of discharge, temperature.

### Projections
- Annual projection de-seasonalizes observed data using tropical-Philippines seasonal factors, then re-applies all 12 months. With 5 months of data (mostly dry season), confidence is moderate.

### Environmental
- Carbon equivalents use 22 kg CO₂/tree/year and 0.21 kg CO₂/km. Philippine grid factor 0.68 kg CO₂/kWh.

## Appendix

### Best and Worst Days

**Best day: 2026-03-19** — PV: 30.0 kWh, Load: 25.5 kWh, Import: 1.4 kWh, Export: 6.4 kWh. Non-EV day. Strong dry-season generation matched to a quiet day at home; battery hit 100% and surplus spilled to grid. Self-sufficiency: 95%.

**Worst day: 2026-01-02** — PV: 4.7 kWh, Load: 15.6 kWh, Import: 12.5 kWh, Export: 0 kWh. Non-EV day. Generation was 74% below expected; battery never charged past ~30% SOC. Self-sufficiency: 20%. Worth checking inverter logs against weather for that date.

### Capacity Factor

| Month | Avg Daily kWh | Peak Sun Hours | Capacity Factor | Grid Dependence |
|---|---|---|---|---|
| 2025-12 | 16.5 | 2.5 | 10.5% | 46% |
| 2026-01 | 16.7 | 2.6 | 10.7% | 40% |
| 2026-02 | 23.6 | 3.6 | 15.1% | 27% |
| 2026-03 | 27.2 | 4.2 | 17.4% | 23% |
| 2026-04 | 27.6 | 4.3 | 17.7% | 32% |

### Next Steps

- Check inverter logs for 2026-01-02 to rule out an equipment fault.
- Configure the EVSE/PHEV to charge between 10:00 and 14:00 (per Recommendation 1) and compare next month's EV-day import.
- Use a plug-in power meter for a few evenings to identify overnight base load (per Recommendation 2).
- Re-run this analysis after May/June to capture wet-season onset and sharpen the annual projection.
- Monitor monthly battery efficiency — current 94–98% range is healthy; flag if any month drops below 90%.

### Disclaimer

This report was generated by an AI model. While the numerical computations are performed by a deterministic script (`analyze.py`), the narrative interpretation, recommendations, and contextual inferences (seasonal factors, grid emission factors, sizing assessments, without-battery ROI estimate) are AI-generated and may contain inaccuracies. Verify critical findings against your own records, manufacturer specifications, or a qualified solar professional before making decisions based on this report.

### Data Sources

- `data/solar_hourly_2025-12.csv` — 31 days
- `data/solar_hourly_2026-01.csv` — 31 days
- `data/solar_hourly_2026-02.csv` — 28 days
- `data/solar_hourly_2026-03.csv` — 30 days
- `data/solar_hourly_2026-04.csv` — 30 days
