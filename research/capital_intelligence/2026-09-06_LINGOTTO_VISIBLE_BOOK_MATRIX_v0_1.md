# LINGOTTO VISIBLE BOOK MATRIX Ω v0.6

**Status:** RESEARCH / PRIMARY-FILING TIMELINE COMPLETE / HOLDINGS EXTRACTION IN PROGRESS  
**Date:** 2026-09-06  
**Parent protocol:** `research/capital_intelligence/2026-09-06_LINGOTTO_DISCLOSURE_BACKTEST_PROTOCOL.md`

## Purpose
Build the observable public-disclosure matrix for Lingotto without treating the 13F as the total portfolio.

## Mandatory interpretation
- `13F_VISIBLE_BOOK != TOTAL_PORTFOLIO`
- `TARGET_OWNERSHIP_PCT != PORTFOLIO_WEIGHT`
- `VISIBLE_13F_WEIGHT != TOTAL_PORTFOLIO_WEIGHT`
- `LONG_13F_POSITION != NET_EXPOSURE`
- `POSITION_DATE != PUBLICATION_DATE`
- Backtests start at the information-availability date.

## Directionality warning
At least one Lingotto-managed vehicle is explicitly long/short. A 13F long cannot be interpreted as net directional conviction without hedge/short disclosure.

## Legal continuity vs skill
Filer history: `Exor Investments (UK) LLP -> Exor Capital LLP -> Lingotto Investment Management LLP`. This supports legal/organizational continuity only. It does not validate investment skill.

## 13F filing timeline — complete primary-accession map for study window
| Period end | Filing/publication date | Accession | State |
|---|---|---|---|
| 2023-06-30 | 2023-08-11 | `0001732768-23-000006` | VERIFIED |
| 2023-09-30 | 2023-11-13 | `0001732768-23-000007` | VERIFIED |
| 2023-12-31 | 2024-02-13 | `0001732768-24-000001` | VERIFIED |
| 2024-03-31 | 2024-05-15 | `0001732768-24-000003` | VERIFIED |
| 2024-06-30 | 2024-08-12 | `0001732768-24-000005` | VERIFIED |
| 2024-09-30 | 2024-11-13 | `0001172661-24-004632` | VERIFIED |
| 2024-12-31 | 2025-02-04 | `0001172661-25-000491` | VERIFIED |
| 2025-03-31 | 2025-05-15 | `0001172661-25-002046` | VERIFIED |
| 2025-06-30 | 2025-08-13 | `0001172661-25-003216` | VERIFIED |
| 2025-09-30 | 2025-11-12 original | `0001172661-25-004702` | VERIFIED ORIGINAL |
| 2025-09-30 | 2025-11-13 amendment | `0001172661-25-004755` | VERIFIED AMENDMENT — SEMANTICS CONFLICT |
| 2025-12-31 | 2026-02-10 | `0001172661-26-000570` | VERIFIED |
| 2026-03-31 | 2026-05-14 | `0001172661-26-001922` | VERIFIED |
| 2026-06-30 | 2026-07-29 | `0001172661-26-002907` | VERIFIED SEC PRIMARY |

### Gap closure
The study window has a complete quarter-level accession map. This does **not** mean the security-level event matrix is complete.

## Amendment law Ω — conflict-aware
Q3-2025 amendment no. 1 is formally marked `adds new holdings entries`, but its information table repeats nearly all original rows and reclassifies SLB from one common row into common + call while preserving total units. Therefore:

`AMENDMENT_SEMANTICS_CONFLICT = TRUE`

Handling:
1. preserve 2025-11-12 original as first public-information state;
2. preserve 2025-11-13 amendment as second state;
3. do not mechanically sum duplicate rows;
4. use amended duplicated rows as operative amended-state rows while retaining original timing;
5. amendment-only signals start 2025-11-13;
6. run a sensitivity excluding amendment-sensitive rows.

## Portfolio-level checkpoints
| Period | Lines | Visible 13F value | State |
|---|---:|---:|---|
| Q2-2023 | 33 | $1.547548bn | checkpoint |
| Q3-2023 | 33 | $1.864840bn | checkpoint |
| Q4-2023 | 34 | $2.077573bn | checkpoint |
| Q1-2024 | 47 | $2.387978bn | checkpoint |
| Q2-2024 | 50 | $2.976475bn | checkpoint |
| Q3-2024 | 46 | $3.468084bn | checkpoint |
| Q4-2024 | 53 | $3.727561bn | checkpoint |
| Q1-2025 | 45 | $3.828596bn | checkpoint |
| Q2-2025 | 45 | $4.704515bn | SEC summary |
| Q3-2025 original | 35 | $5.411144bn | original information state |
| Q3-2025 amendment | 36 | $5.411144bn | amended information state; not additive mechanically |
| Q4-2025 | 39 | $5.738293bn | SEC primary |
| Q1-2026 | 35 | $5.064157bn | SEC primary |
| Q2-2026 | 32 | $4.665510bn | primary accession pinned |

Values are visible 13F totals only, not AUM/NAV.

## Frozen pairwise audits
Dedicated primary-filing audits now include:
- `research/capital_intelligence/2026-09-06_LINGOTTO_Q2_Q3_2025_PRIMARY_DIFF_AUDIT.md`
- `research/capital_intelligence/2026-09-06_LINGOTTO_Q4_2025_Q1_2026_PRIMARY_DIFF_AUDIT.md`

### Q4-2025 → Q1-2026 material common-share events
- Cloudflare `+70.8%` → `SHARE_ADD_50`
- Harmony Gold `-96.7%` → `SHARE_CUT_50`
- Microsoft `-85.9%` → `SHARE_CUT_50`
- Moderna `+53.2%` → `SHARE_ADD_50`
- Rocket Companies `-40.6%` → `SHARE_CUT_25`
- ServiceNow `+36.6%` → `SHARE_ADD_25`
- Sibanye Stillwater `-31.1%` → `SHARE_CUT_25`
- SLB common `+30.0%` → `SHARE_ADD_25`
- SLB call `-77.2%` → `OPTION_CUT_50`, kept separate from common.

New/re-entry candidates: Blue Owl, KKR re-entry, Nebius.  
Exit candidates pending identity/corporate-action review: CRH, Energy Fuels, Ginkgo Bioworks, Hyatt Hotels, Primo Brands, Sunrun, Vertiv.

Near-20% moves such as Aurora, Duolingo, Joby, MercadoLibre, NVIDIA, PONY AI and Recursion remain **none** under the frozen 25% gate. They cannot be promoted after returns are observed.

## Extraction order Ω
1. read each SEC information table;
2. normalize issuer, CUSIP, class, shares/principal amount and reported value;
3. preserve puts/calls and discretion fields;
4. diff consecutive quarters by CUSIP + class + PUT/CALL state;
5. map ticker only after security identity is stable;
6. normalize splits/corporate actions before `SHARE_QOQ`;
7. calculate visible-book weights from each filing's own denominator;
8. classify events only under pre-locked rules;
9. freeze/commit the event table;
10. calculate returns only after the event table is frozen.

## Anti-hindsight controls
- No return data may alter event thresholds.
- No winner-specific case may be promoted into the sample definition.
- CVNA and PONY remain mandatory narrative-bias controls.
- Q3-2025 original/amendment remain two public-information states.
- Amendment-sensitive rows receive an explicit flag.
- Missing ticker mappings remain `UNMAPPED`.
- Options are not ordinary common-share longs.
- Corporate-action ambiguity blocks event classification.
- Sub-threshold changes remain none even if later returns are extreme.

## Data model
`PERIOD_END | ORIGINAL_PUBLICATION_DATE | AMENDED_PUBLICATION_DATE | ACCESSION_ORIGINAL | ACCESSION_AMENDED | CUSIP | TICKER | ISSUER | CLASS | SHARES_OR_PRINCIPAL | VALUE_USD | PUT_CALL | INVESTMENT_DISCRETION | VISIBLE_13F_WEIGHT | SHARE_QOQ | VALUE_QOQ | PRICE_EFFECT | EVENT_CLASS | SOURCE_TYPE | AMENDMENT_STATE | AMENDMENT_SENSITIVE | SPLIT_ADJUSTED | SECTOR_BENCHMARK | NOTES`

Portfolio fields:
`VISIBLE_BOOK_VALUE | LINE_COUNT | DENOMINATOR_STATE | LONG_SHORT_KNOWN | TOTAL_AUM_KNOWN | COVERAGE_NOTES`

## Event rules — frozen ex ante
- `NEW_VISIBLE_POSITION`
- `SHARE_ADD_25`
- `SHARE_ADD_50`
- `SHARE_CUT_25`
- `SHARE_CUT_50`
- `VISIBLE_WEIGHT_TOP10`
- `PERSIST_3Q`
- `EXIT_VISIBLE_BOOK`

Option events are stored in a separate event family and never pooled mechanically with common-share adds/cuts.

## Backtest outputs — still locked
From applicable information-availability date: 6M/12M/24M absolute return, broad-market excess, sector excess, hit rate, median/mean alpha, bootstrap CI where sample permits, MFE, MAE and drawdown.

Run separately for new positions, material increases, persistence, exits/reductions, 13D/G events, visible-weight buckets, options and amendment sensitivity.

## Current status
`LINGOTTO_SKILL_STATE = A2_TIMELINE_COMPLETE_HOLDINGS_EXTRACTION_IN_PROGRESS`

No alpha claim is authorized. Returns remain locked until all consecutive-quarter event tables in the study window are frozen.