# LINGOTTO VISIBLE BOOK MATRIX Ω v0.1

**Status:** RESEARCH / PARTIAL / NON-CANONICAL DATASET  
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
- Backtests start at `PUBLICATION_DATE`.

## Directionality warning
SEC Form D records identify `Lingotto Offshore Long/Short US Fund LP`, with Lingotto Investment Management LLP as investment manager. Therefore at least one Lingotto-managed vehicle is explicitly long/short. A 13F long cannot be interpreted as net directional conviction without hedge/short disclosure.

## Legal continuity vs skill
SEC filing headers show the filer history:
`Exor Investments (UK) LLP -> Exor Capital LLP -> Lingotto Investment Management LLP`.
This supports legal/organizational continuity only. It does not validate investment skill.

## 13F filing timeline — verified / working
| Period end | Filing / publication date | Status |
|---|---|---|
| 2023-06-30 | 2023-08-11 | verified SEC; first Lingotto-name 13F located |
| 2024-03-31 | 2024-05-15 | working/secondary history; exact SEC accession still to pin |
| 2024-06-30 | 2024-08-12 | verified SEC |
| 2024-09-30 | 2024-11-13 | verified SEC |
| 2024-12-31 | 2025-02-04 | working/secondary history; exact SEC accession to pin |
| 2025-03-31 | 2025-05-15 | verified SEC |
| 2025-06-30 | 2025-08-13 | filing date from secondary holdings history; primary accession to pin |
| 2025-09-30 | 2025-11-12/13 | original + amendment; amendment verified SEC 2025-11-13 |
| 2025-12-31 | 2026-02-10 | verified SEC |
| 2026-03-31 | 2026-05-14 | verified SEC |
| 2026-06-30 | 2026-07-29 | working from secondary history; primary accession to pin |

## Visible-book snapshots already verified
- Q2 2023: 33 lines; approximately $1.548bn visible 13F value.
- Q2 2024: 50 lines; approximately $2.976bn visible 13F value.
- Q4 2024: 53 lines; approximately $3.728bn visible 13F value.
- Q4 2025: 39 lines; approximately $5.738bn visible 13F value.
- Q1 2026: 35 lines; approximately $5.064bn visible 13F value.

These are visible 13F totals only, not AUM or total portfolio NAV.

## Position-history samples — for pipeline validation only
These examples are not the backtest sample and must not be cherry-picked into conclusions.

### TSM
Secondary history indicates:
- Q1 2024 initiation: 135,000 shares; filed 2024-05-15.
- Q2 2024: 185,000; +37.0%; filed 2024-08-12.
- Q4 2025: 274,878; +34.1%; filed 2026-02-10.
- Q1 2026: 277,227; +0.9%; filed 2026-05-14.
- Q2 2026: 308,743; +11.4%; filed 2026-07-29.

### NOW
Secondary history indicates:
- Q1 2024: 36,104 after +19.9%; filed 2024-05-15.
- Q2/Q3/Q4 2024: unchanged.
- Q2 2025: +27.7%.
- Q4 2025: +518.9% share increase, but corporate-action/split normalization must be checked before interpreting.
- Q1 2026: +36.6%.

### CVNA
Secondary history indicates:
- Q1 2024: -19.5% shares; filed 2024-05-15.
- Q2 2024: +1.4%.
- Q3 2024: +4.1%.
- Q4 2024: +1.5%.

This is useful because it shows a known winner did not simply have monotonically rising disclosed shares; retrospective narrative must not rewrite this path.

### RRC
Secondary history indicates:
- Q1 2024: unchanged.
- Q2 2024: +1.5%.
- Q3 2024: +3.8%.
- Q4 2024: +2.5%.

### VEON
Secondary history indicates gradual additions through 2024:
+0.5%, +1.0%, +3.6%, +2.9% shares quarter-on-quarter.

### PONY
Secondary history provides a negative-control style case:
- Q4 2024 initiated.
- Q1 2025 +27.5%.
- Q2 2025 +55.6%.
- Q4 2025 +72.6%.
- Q1 2026 -19.1%.
- Q2 2026 -45.3%.

This must be included in the full sample; it is exactly the sort of path that prevents survivorship/cherry-picking.

## Data model
Each row in the final matrix must contain:
`PERIOD_END | PUBLICATION_DATE | ACCESSION | CUSIP | TICKER | ISSUER | SHARES | VALUE_USD | VISIBLE_13F_WEIGHT | SHARE_QOQ | VALUE_QOQ | PRICE_EFFECT | EVENT_CLASS | SOURCE_TYPE | AMENDMENT_STATE | SPLIT_ADJUSTED | SECTOR_BENCHMARK | NOTES`

Additional portfolio-level fields:
`VISIBLE_BOOK_VALUE | LINE_COUNT | DENOMINATOR_STATE | LONG_SHORT_KNOWN | TOTAL_AUM_KNOWN | COVERAGE_NOTES`

## Event rules — ex ante
Do not infer conviction from target ownership alone.
Candidate research events:
- `NEW_VISIBLE_POSITION`
- `SHARE_ADD_25`
- `SHARE_ADD_50`
- `SHARE_CUT_25`
- `SHARE_CUT_50`
- `VISIBLE_WEIGHT_TOP10`
- `PERSIST_3Q`
- `EXIT_VISIBLE_BOOK`

Thresholds must be locked before return analysis. If multiple thresholds are tested, report the full sensitivity grid and multiple-testing risk.

## Backtest outputs
From publication date:
- 6M / 12M / 24M absolute return
- excess vs broad market
- excess vs sector benchmark
- hit rate
- median alpha
- mean alpha
- bootstrap confidence interval where sample permits
- MFE / MAE
- drawdown

Run separately for:
1. new visible positions,
2. material share increases,
3. persistence,
4. exits/reductions,
5. 13D/G events,
6. visible-book-weight buckets.

## Current status
`LINGOTTO_SKILL_STATE = A1_SAMPLE_INCOMPLETE`

No alpha claim is authorized yet.
