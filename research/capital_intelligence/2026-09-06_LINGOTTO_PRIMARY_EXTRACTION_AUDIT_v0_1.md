# LINGOTTO PRIMARY EXTRACTION AUDIT Ω v0.1

**Status:** PRIMARY SEC EXTRACTION / AUDIT IN PROGRESS  
**Date:** 2026-09-06  
**Parent:** `research/capital_intelligence/2026-09-06_LINGOTTO_VISIBLE_BOOK_MATRIX_v0_1.md`

## Critical correction — Q3 2025 amendment semantics
SEC Form 13F-HR/A filed 2025-11-13 is marked **“adds new holdings entries”**, not “restatement”. Therefore the correct reconstruction rule for Q3-2025 is:

`Q3_2025_COMPLETE_VISIBLE_BOOK = ORIGINAL_2025-11-12 + ADDITIONAL_ENTRIES_2025-11-13`

Do **not** replace the original filing with the amendment. Preserve both public-information timestamps.

### Amendment handling states
- `RESTATEMENT` → amended filing supersedes the specified prior information.
- `ADDS_NEW_HOLDINGS_ENTRIES` → amendment supplements the original; combine for complete quarter-end visible book.
- `UNKNOWN_AMENDMENT_TYPE` → no quarter-level event classification until resolved.

This distinction is mandatory for all future 13F amendments.

## Primary SEC extraction — Q4 2025 vs Q1 2026
The following rows are taken directly from SEC information tables. They are used to validate the extraction/diff pipeline; they are not yet a performance backtest.

| Ticker | Q4-2025 shares | Q1-2026 shares | Share QoQ | Q4 visible wt | Q1 visible wt | Interpretation |
|---|---:|---:|---:|---:|---:|---|
| CVNA | 2,855,140 | 2,548,077 | -10.8% | 21.00% | 15.82% | active reduction; value decline larger than share cut due price effect |
| TEVA | 28,422,768 | 27,770,857 | -2.3% | 15.46% | 16.52% | shares slightly reduced while visible weight rose |
| SBSW | 28,430,409 | 19,575,936 | -31.1% | 7.06% | 4.86% | material reduction |
| VEON | 6,060,852 | 6,042,061 | -0.3% | 5.55% | 5.52% | effectively unchanged |
| GDXJ | 2,602,894 | 1,990,572 | -23.5% | 5.16% | 4.72% | meaningful reduction |
| RRC | 7,216,694 | 7,193,719 | -0.3% | 4.43% | 6.42% | shares unchanged; higher weight is predominantly price effect, **not accumulation** |
| VAL | 3,719,176 | 3,706,866 | -0.3% | 3.27% | 7.18% | shares unchanged; weight surge is price effect, **not accumulation** |
| SLB common | 4,158,163 | 5,406,567 | +30.0% | 2.78% | 5.51% | genuine common-share increase |
| SLB call | 1,801,770 | 410,000 | -77.2% | 1.21% | 0.42% | option exposure sharply reduced; do not net mechanically with common |
| TSM | 274,878 | 277,227 | +0.9% | 1.46% | 1.85% | essentially unchanged shares |
| TEM | 1,143,526 | 1,415,766 | +23.8% | 1.18% | 1.26% | sub-25% add; near threshold but does not qualify `SHARE_ADD_25` |
| NOW | 285,325 | 389,886 | +36.6% | 0.76% | 0.80% | `SHARE_ADD_25`, not `SHARE_ADD_50` |
| PONY | 4,107,512 | 3,324,068 | -19.1% | 1.04% | 0.62% | reduction, below -25% event threshold |
| NVDA | 514,967 | 614,357 | +19.3% | 1.67% | 2.12% | add below +25% event threshold |
| PSKY | 47,193,833 | 46,061,363 | -2.4% | 11.02% | 8.24% | essentially unchanged shares; weight decline mostly price effect |

Visible-book denominators:
- Q4-2025: `$5,738,292,716`
- Q1-2026: `$5,064,156,767`

## Immediate methodological consequence
The Q4→Q1 primary pair demonstrates why `VISIBLE_WEIGHT_ACCELERATION` cannot substitute for `SHARE_ACCELERATION`:
- **RRC**: shares -0.3%, visible weight 4.43%→6.42%.
- **VAL**: shares -0.3%, visible weight 3.27%→7.18%.

Calling either “accumulation” from weight alone would be false. Weight change must be decomposed into share decision + price effect + denominator effect.

## Event classifier — frozen before returns
For ordinary common/ADR rows after corporate-action normalization:
- `NEW_VISIBLE_POSITION`: absent prior quarter, present current quarter.
- `SHARE_ADD_25`: shares +25% to <50%.
- `SHARE_ADD_50`: shares >=+50%.
- `SHARE_CUT_25`: shares -25% to >-50%.
- `SHARE_CUT_50`: shares <=-50%.
- `EXIT_VISIBLE_BOOK`: prior shares >0, current shares =0.
- `PERSIST_3Q`: present for >=3 consecutive quarter-end books.
- `VISIBLE_WEIGHT_TOP10`: top-decile rank by visible 13F weight within that filing; this is **not** total-portfolio conviction.

Options are classified separately by `PUT_CALL` and are never merged with common-share events unless an explicit exposure-normalization method is preregistered.

## Return-analysis gate
No 6M/12M/24M performance calculation may begin until:
1. all quarter information tables are extracted from primary SEC filings;
2. Q3-2025 original + add-entries amendment are combined correctly;
3. corporate actions/splits are normalized;
4. event table is frozen and hashed/committed;
5. benchmark mapping rules are frozen.

## State
`LINGOTTO_SKILL_STATE = A2_TIMELINE_COMPLETE_HOLDINGS_EXTRACTION_IN_PROGRESS`

No alpha claim authorized.
