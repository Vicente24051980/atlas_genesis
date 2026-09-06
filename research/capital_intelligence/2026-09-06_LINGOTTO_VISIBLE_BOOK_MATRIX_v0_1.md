# LINGOTTO VISIBLE BOOK MATRIX Ω v0.3

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
| 2025-09-30 | 2025-11-13 amendment | `0001172661-25-004755` | VERIFIED AMENDMENT |
| 2025-12-31 | 2026-02-10 | `0001172661-26-000570` | VERIFIED |
| 2026-03-31 | 2026-05-14 | `0001172661-26-001922` | VERIFIED |
| 2026-06-30 | 2026-07-29 | `0001172661-26-002907` | VERIFIED SEC PRIMARY |

### Gap closure
The four prior accession gaps are now closed: Q3-2023, Q4-2023, Q1-2024 and Q2-2026. The study window therefore has a complete quarter-level accession map. This does **not** mean the holdings matrix is complete.

## Amendment law Ω
A 13F amendment creates two distinct public-information states:
1. `ORIGINAL_PUBLICATION_DATE` — what a public follower could first observe;
2. `AMENDED_PUBLICATION_DATE` — corrected information available later.

For amended quarters store both versions. The base backtest uses the information actually available on each date rather than silently replacing the original with hindsight. A sensitivity run may use the amended filing only, labeled `AMENDMENT_CORRECTED`.

Q3-2025: original filed 2025-11-12 (`0001172661-25-004702`); amendment filed 2025-11-13 (`0001172661-25-004755`).

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
| Q3-2025 original | 35 | $5.411144bn | SEC summary; amendment must be diffed |
| Q4-2025 | 39 | $5.738292bn | checkpoint |
| Q1-2026 | 35 | $5.064156bn | checkpoint |
| Q2-2026 | 32 | $4.665510bn | primary accession pinned |

Values are visible 13F totals only, not AUM/NAV.

## Extraction order Ω
The next stage is deterministic, not narrative:
1. download/read each SEC `infotable.xml`;
2. normalize issuer, CUSIP, class, shares/principal amount and reported value;
3. preserve puts/calls and discretion fields rather than collapsing them;
4. diff consecutive quarters by CUSIP + class;
5. map ticker only after security identity is stable;
6. normalize splits/corporate actions before `SHARE_QOQ`;
7. calculate visible-book weights from each filing's own denominator;
8. classify events only under pre-locked rules;
9. calculate returns only after the event table is frozen.

## Anti-hindsight controls
- No return data may alter event thresholds.
- No winner-specific case may be promoted into the sample definition.
- CVNA and PONY remain mandatory narrative-bias controls.
- Q3-2025 original/amendment difference must be preserved.
- Missing ticker mappings remain `UNMAPPED`; they are not guessed.
- Options are not treated as ordinary common-share longs.

## Data model
`PERIOD_END | ORIGINAL_PUBLICATION_DATE | AMENDED_PUBLICATION_DATE | ACCESSION_ORIGINAL | ACCESSION_AMENDED | CUSIP | TICKER | ISSUER | CLASS | SHARES_OR_PRINCIPAL | VALUE_USD | PUT_CALL | INVESTMENT_DISCRETION | VISIBLE_13F_WEIGHT | SHARE_QOQ | VALUE_QOQ | PRICE_EFFECT | EVENT_CLASS | SOURCE_TYPE | AMENDMENT_STATE | SPLIT_ADJUSTED | SECTOR_BENCHMARK | NOTES`

Portfolio fields:
`VISIBLE_BOOK_VALUE | LINE_COUNT | DENOMINATOR_STATE | LONG_SHORT_KNOWN | TOTAL_AUM_KNOWN | COVERAGE_NOTES`

## Event rules — ex ante
Candidate research events:
- `NEW_VISIBLE_POSITION`
- `SHARE_ADD_25`
- `SHARE_ADD_50`
- `SHARE_CUT_25`
- `SHARE_CUT_50`
- `VISIBLE_WEIGHT_TOP10`
- `PERSIST_3Q`
- `EXIT_VISIBLE_BOOK`

Thresholds are frozen before return analysis. Any threshold sensitivity must disclose the full grid and multiple-testing risk.

## Backtest outputs
From the applicable information-availability date: 6M/12M/24M absolute return, broad-market excess, sector excess, hit rate, median/mean alpha, bootstrap CI where sample permits, MFE, MAE and drawdown.

Run separately for new positions, material increases, persistence, exits/reductions, 13D/G events, visible-weight buckets and amendment sensitivity.

## Current status
`LINGOTTO_SKILL_STATE = A2_TIMELINE_COMPLETE_HOLDINGS_INCOMPLETE`

No alpha claim is authorized. The filing timeline is complete; the security-level primary matrix is not.