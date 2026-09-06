# LINGOTTO VISIBLE BOOK MATRIX Ω v0.2

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

## 13F filing timeline — primary SEC pinned where verified
| Period end | Filing/publication date | Accession | State |
|---|---|---|---|
| 2023-06-30 | 2023-08-11 | `0001732768-23-000006` | VERIFIED SEC |
| 2023-09-30 | OPEN | OPEN | DATA_GAP — primary accession not yet pinned |
| 2023-12-31 | OPEN | OPEN | DATA_GAP — primary accession not yet pinned |
| 2024-03-31 | OPEN | OPEN | DATA_GAP — secondary history suggests filing existed; primary accession not yet pinned |
| 2024-06-30 | 2024-08-12 | `0001732768-24-000005` | VERIFIED SEC |
| 2024-09-30 | 2024-11-13 | `0001172661-24-004632` | VERIFIED SEC |
| 2024-12-31 | 2025-02-04 | `0001172661-25-000491` | VERIFIED SEC |
| 2025-03-31 | 2025-05-15 | `0001172661-25-002046` | VERIFIED SEC |
| 2025-06-30 | 2025-08-13 | `0001172661-25-003216` | VERIFIED SEC |
| 2025-09-30 | 2025-11-12 original | `0001172661-25-004702` | VERIFIED SEC ORIGINAL |
| 2025-09-30 | 2025-11-13 amendment | `0001172661-25-004755` | VERIFIED SEC AMENDMENT |
| 2025-12-31 | 2026-02-10 | `0001172661-26-000570` | VERIFIED SEC |
| 2026-03-31 | 2026-05-14 | `0001172661-26-001922` | VERIFIED SEC |
| 2026-06-30 | OPEN | OPEN | DATA_GAP — do not use secondary date until primary accession pinned |

## Amendment law Ω
A 13F amendment creates two distinct public-information states:
1. `ORIGINAL_PUBLICATION_DATE` — what a public follower could first observe;
2. `AMENDED_PUBLICATION_DATE` — corrected information available later.

For amended quarters store both versions. The base backtest must use the information actually available on each date rather than silently replacing the original with hindsight. A sensitivity test may rerun the quarter using only the amended filing, but it must be labeled `AMENDMENT_CORRECTED`.

Q3-2025 is the first confirmed example in this dataset: original filed 2025-11-12 and amendment filed 2025-11-13.

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
Secondary history indicates additions over time. Do not promote any quoted Q1-2024 or Q2-2026 event to VERIFIED until the matching primary filing is pinned.

### NOW
Secondary history indicates material changes, but corporate actions/splits must be normalized before interpreting share acceleration.

### CVNA
Known winner and therefore mandatory anti-cherry-picking control. Historical disclosed-share path must be reconstructed from primary filings before narrative classification.

### RRC
Historical disclosed-share path must be reconstructed from primary filings before calling persistence or acceleration.

### VEON
Historical disclosed-share path must be reconstructed from primary filings before calling gradual accumulation.

### PONY
Mandatory negative-control style case. Secondary history suggests large additions followed by large reductions; all quarter values must be replaced by primary data before return testing.

## Data model
Each row in the final matrix must contain:
`PERIOD_END | ORIGINAL_PUBLICATION_DATE | AMENDED_PUBLICATION_DATE | ACCESSION_ORIGINAL | ACCESSION_AMENDED | CUSIP | TICKER | ISSUER | SHARES | VALUE_USD | VISIBLE_13F_WEIGHT | SHARE_QOQ | VALUE_QOQ | PRICE_EFFECT | EVENT_CLASS | SOURCE_TYPE | AMENDMENT_STATE | SPLIT_ADJUSTED | SECTOR_BENCHMARK | NOTES`

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
From the information-availability date applicable to each row:
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
6. visible-book-weight buckets,
7. amended-filing sensitivity.

## Current status
`LINGOTTO_SKILL_STATE = A1_SAMPLE_INCOMPLETE`

No alpha claim is authorized yet. Missing primary accessions remain `DATA_GAP`; they are not backfilled from secondary aggregators when the filing date itself is part of the test.