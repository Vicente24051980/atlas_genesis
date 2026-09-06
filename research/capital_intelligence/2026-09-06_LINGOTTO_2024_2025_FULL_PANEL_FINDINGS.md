# CAPITAL INTELLIGENCE Ω — Lingotto 2024–2025 full-panel audit

**Date:** 2026-09-06  
**Status:** PRIMARY-SEC PANEL CLOSED / RETURN PANEL STILL SEPARATE  
**Scope:** Q4-2023 baseline through Q4-2025.

## Executive result

The complete 13F panel confirms that Lingotto cannot be modeled as a single allocator. The visible long-equity book rises from **$2.078bn / 34 lines in Q4-2023** to **$5.669bn / 38 lines in Q4-2025**, after reaching 53 lines in Q4-2024. Despite the wider line count, the top 10 long positions remain roughly **79–85%** of visible long-equity value across the panel.

`AGGREGATED_13F != SINGLE_STRATEGY`

## Filing chain

Canonical SEC sequence:

- 2023Q4 — filed 2024-02-13 — accession `0001732768-24-000001`
- 2024Q1 — 2024-05-15 — `0001732768-24-000003`
- 2024Q2 — 2024-08-12 — `0001732768-24-000005`
- 2024Q3 — 2024-11-13 — `0001172661-24-004632`
- 2024Q4 — 2025-02-04 — `0001172661-25-000491`
- 2025Q1 — 2025-05-15 — `0001172661-25-002046`
- 2025Q2 — 2025-08-13 — `0001172661-25-003216`
- 2025Q3 — Amendment No.1 filed 2025-11-13 — `0001172661-25-004755`
- 2025Q4 — 2026-02-10 — `0001172661-26-000570`

### Q3-2025 amendment treatment

The 13F-HR/A explicitly says **`adds new holdings entries`**, not restatement. The original table had 35 entries and reported $5.411143736bn. The amended table has 36 entries at the same total value and separates the prior combined SLB exposure into a common-share line plus a call line. Therefore the amended information table is used as the **canonical analytical full table**; it is not arithmetically added to the original.

## Instrument firewall

Calls are removed from the long-equity layer. The panel contains option lines in 2025 involving Alphabet, 20Y Treasury ETF and SLB. These cannot be interpreted as ordinary share accumulation.

`OPTION_POSITION != LONG_EQUITY_POSITION`

## Corporate-action firewall

- **Ginkgo Bioworks:** 1-for-40 reverse split effective 2024-08-19. Pre-split shares are divided by 40 before Q2→Q3 comparison.
- **Desktop Metal:** 1-for-10 reverse split effective 2024-06-10. Pre-split shares are divided by 10 before Q1→Q2 comparison.
- **Gatos Silver → First Majestic:** transaction completed 2025-01-16 at **2.55 First Majestic shares per Gatos share**. Q4-2024 Gatos shares are converted before comparing with Q1-2025 First Majestic. 3,727,305 Gatos shares imply ~9,504,628 First Majestic shares versus 9,750,519 reported in Q1-2025, so the normalized event is a modest visible increase, not exit+new.
- **Paramount Global → Paramount Skydance:** transaction completed 2025-08-07. Class B holders could elect **$15 cash or one Class B share**, subject to proration. Q2→Q3 is therefore `CORPORATE_ACTION_MIXED_CONSIDERATION`; its share delta is excluded from decision-flow statistics.
- **Schlumberger/SLB:** same CUSIP across issuer-label change; common and call layers stay separate.

`CORPORATE_ACTION != MANAGER_TRADE`

## Transition metrics

| Transition | long lines | visible-weight churn | approximate share-flow proxy / avg book |
|---|---:|---:|---:|
| 2023Q4→2024Q1 | 34→47 | 8.73% | 19.10% |
| 2024Q1→2024Q2 | 47→50 | 14.34% | 20.25% |
| 2024Q2→2024Q3 | 50→46 | 8.85% | 13.14% |
| 2024Q3→2024Q4 | 46→53 | 9.25% | 6.05% |
| 2024Q4→2025Q1 | 53→44 | 10.89% | 6.03% |
| 2025Q1→2025Q2 | 44→42 | 9.66% | 9.66% |
| 2025Q2→2025Q3 | 42→34 | 10.39% | 9.06% |
| 2025Q3→2025Q4 | 34→38 | 9.81% | 9.21% |

`visible-weight churn = 0.5 × Σ|w_t − w_t−1|`; it includes price effects and is **not** decision turnover.

The share-flow measure values normalized share deltas at destination-quarter implied prices and divides by average visible long-book value. It is a descriptive proxy, not audited turnover.

## Holding-life and PERSISTENCE_SURPRISE

The panel contains **42 complete, non-censored holding spells**, with a raw median of **2 quarters**. More importantly, using only spells that start after the left boundary and right-censoring those still open at Q4-2025, the Kaplan–Meier survival curve crosses 50% at **2 quarters**.

Research calibration:

- `ORDINARY`: ≤2 visible quarters
- `ABOVE_BASELINE`: >2 and <4
- `HIGH_PERSISTENCE`: ≥4
- `EXTREME_PERSISTENCE_CANDIDATE`: ≥6, subject to attribution/censoring controls

This replaces arbitrary persistence thresholds with a manager-relative baseline.

## Innovation de-mixing result

Among later-confirmed Innovation names visible in the U.S. 13F:

- TSMC: **8 consecutive quarters** from 2024Q1 through Q4-2025; estimated cohort survival at this duration ≈14.9%.
- Tempus AI: **7 quarters** from 2024Q2 through Q4-2025; survival ≈14.9%.
- Pony.ai: **5 quarters** from Q4-2024 through Q4-2025; survival ≈22.3%.
- Aurora: **4 quarters** from Q1-2025 through Q4-2025; survival ≈24.8%.
- NVDA, ServiceNow and Recursion are already present at the left boundary of this panel and remain right-censored; their full spell length cannot be estimated here.
- ASML is not present in this U.S. 13F panel.

Thus `INNOVATION_PROCESS_PERSISTENCE = DISTINCTIVE_CANDIDATE`, even though the separate public-copy performance pilot remains `NO_ALPHA_DEMONSTRATED_V1`.

## Intersection comparison

Intersection remains `STRATEGY_SIGNAL_CANDIDATE / VERY_SMALL_N` from the prior public-copy test. Rolls-Royce and Ocado are not ordinary U.S. 13F long lines in this panel; using only Carvana to represent Intersection would recreate selection bias.

## Manager aggregate performance gate

The structural manager-aggregate panel is now closed. A **same-rule post-publication return test is not yet legitimately computable from SEC 13F values alone**, because quarter-end market values precede the filing date and cannot serve as executable public-signal prices.

A valid aggregate public-copy test must use the first executable close after each filing for every eligible line. Until a point-in-time historical price panel is connected:

`MANAGER_AGGREGATE_PUBLIC_COPY_ALPHA = PRICE_PANEL_REQUIRED`

This is deliberately not treated as zero or positive.

## Canonical conclusions

- `AGGREGATED_13F != SINGLE_STRATEGY`
- `OPTION_POSITION != LONG_EQUITY_POSITION`
- `CORPORATE_ACTION != MANAGER_TRADE`
- `VISIBLE_WEIGHT_CHURN != DECISION_TURNOVER`
- `PERSISTENCE_SURPRISE` baseline = manager-relative 2-quarter median for newly observed spells
- `INNOVATION_PROCESS_PERSISTENCE = DISTINCTIVE_CANDIDATE`
- `INNOVATION_PUBLIC_COPY_ALPHA = NOT_DEMONSTRATED_V1`
- `INTERSECTION_PUBLIC_COPY = CANDIDATE / N_TOO_SMALL`
- `MANAGER_AGGREGATE_PUBLIC_COPY_ALPHA = PRICE_PANEL_REQUIRED`
- Capital Intelligence remains **corroborative only; 0 direct points** to ATLAS company score, BUY/SELL or sizing.

## Reproducibility

`research/capital_intelligence/build_lingotto_2023Q4_2025Q4_panel.py` rebuilds the primary-SEC snapshots, long/option separation, event ledger and transition metrics from the canonical accession list.

`research/capital_intelligence/2026-09-06_LINGOTTO_2024_2025_TRANSITION_METRICS.csv` freezes the derived transition statistics used here.
