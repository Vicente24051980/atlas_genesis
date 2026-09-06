# LINGOTTO PRIMARY EXTRACTION AUDIT Ω v0.2

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
The following rows are taken directly from SEC information tables. They validate the extraction/diff pipeline; they are not yet a performance backtest.

| Ticker | Q4-2025 shares | Q1-2026 shares | Share QoQ | Q4 visible wt | Q1 visible wt | Interpretation |
|---|---:|---:|---:|---:|---:|---|
| CVNA | 2,855,140 | 2,548,077 | -10.8% | 21.00% | 15.82% | active reduction; value decline larger than share cut due price effect |
| TEVA | 28,422,768 | 27,770,857 | -2.3% | 15.46% | 16.52% | shares slightly reduced while visible weight rose |
| SBSW | 28,430,409 | 19,575,936 | -31.1% | 7.06% | 4.86% | `SHARE_CUT_25` |
| VEON | 6,060,852 | 6,042,061 | -0.3% | 5.55% | 5.52% | effectively unchanged |
| GDXJ | 2,602,894 | 1,990,572 | -23.5% | 5.16% | 4.72% | reduction below -25% event threshold |
| RRC | 7,216,694 | 7,193,719 | -0.3% | 4.43% | 6.42% | shares unchanged; higher weight is price/denominator effect, **not accumulation** |
| VAL | 3,719,176 | 3,706,866 | -0.3% | 3.27% | 7.18% | shares unchanged; weight surge is price/denominator effect, **not accumulation** |
| SLB common | 4,158,163 | 5,406,567 | +30.0% | 2.78% | 5.51% | `SHARE_ADD_25` |
| SLB call | 1,801,770 | 410,000 | -77.2% | 1.21% | 0.42% | option exposure sharply reduced; classified separately |
| TSM | 274,878 | 277,227 | +0.9% | 1.46% | 1.85% | essentially unchanged shares |
| TEM | 1,143,526 | 1,415,766 | +23.8% | 1.18% | 1.26% | below +25% event threshold |
| NOW | 285,325 | 389,886 | +36.6% | 0.76% | 0.80% | `SHARE_ADD_25` |
| PONY | 4,107,512 | 3,324,068 | -19.1% | 1.04% | 0.62% | reduction below -25% threshold |
| NVDA | 514,967 | 614,357 | +19.3% | 1.67% | 2.12% | add below +25% threshold |
| PSKY | 47,193,833 | 46,061,363 | -2.4% | 11.02% | 8.24% | shares essentially unchanged; weight decline mostly price/denominator effect |

Visible-book denominators:
- Q4-2025: `$5,738,292,716`
- Q1-2026: `$5,064,156,767`

## Primary SEC extraction — Q1 2025 vs Q2 2025
Second consecutive-quarter audit, using primary SEC information tables only.

### Threshold-crossing common/ADR events
| Ticker / issuer | Q1-2025 shares | Q2-2025 shares | Share QoQ | Frozen event |
|---|---:|---:|---:|---|
| AUR / Aurora Innovation | 2,750,000 | 3,450,000 | +25.5% | `SHARE_ADD_25` |
| NG / NovaGold | 21,722,889 | 34,902,954 | +60.7% | `SHARE_ADD_50` |
| OSCR / Oscar Health | 379,116 | 180,000 | -52.5% | `SHARE_CUT_50` |
| PONY / Pony AI | 1,529,892 | 2,379,892 | +55.6% | `SHARE_ADD_50` |
| NOW / ServiceNow | 36,104 | 46,104 | +27.7% | `SHARE_ADD_25` |
| TSLA / Tesla | 88,961 | 43,961 | -50.6% | `SHARE_CUT_50` |

### Examples that do **not** cross thresholds
- APG: 174,000 → 204,800, about +17.7%.
- RRC: 7,022,737 → 7,161,614, about +2.0%.
- SLB common: 4,052,344 → 4,128,645, about +1.9%.
- TSM: 185,000 → 205,000, about +10.8%.
- TEVA: 27,853,943 → 28,156,918, about +1.1%.
- VAL: 3,617,321 → 3,655,900, about +1.1%.
- VEON: 5,887,007 → 5,957,666, about +1.2%.

### New/exit candidates requiring identity continuity check
Primary tables show new visible Q2-2025 rows including Duolingo, KKR, Life Time Group, Rocket Companies and an iShares 20+ Year Treasury call. Q1-visible rows absent in Q2 include candidates such as Cheniere, Brookfield, Procore, Trade Desk and WillScot. These remain `NEW/EXIT_CANDIDATE` until CUSIP/class continuity and corporate actions are checked.

### Option-state example
Q2-2025 contains a separate SLB call row. It is not combined mechanically with SLB common. Option-state events use a separate event family.

## Immediate methodological consequence
The primary pairs demonstrate why `VISIBLE_WEIGHT_ACCELERATION` cannot substitute for `SHARE_ACCELERATION` and why the event classifier must be based on normalized security identity.

- RRC and VAL can gain visible weight without share accumulation.
- PONY can generate a large `SHARE_ADD_50` in one period and later a large reduction; it must remain in the full sample.
- Known winners such as CVNA do not receive special treatment.

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

## Corporate-action gate Ω
Before any share-change event is admitted:
1. CUSIP/class identity must match or a documented corporate-action bridge must exist;
2. splits/reverse splits must be normalized;
3. merger/exchange events must not be mistaken for discretionary buys/sells;
4. issuer renames alone do not reset persistence if the security identity is continuous;
5. unresolved identity change → `CORPORATE_ACTION_OPEN`, excluded from return test.

## Return-analysis gate
No 6M/12M/24M performance calculation may begin until:
1. all quarter information tables are extracted from primary SEC filings;
2. Q3-2025 original + add-entries amendment are combined correctly;
3. corporate actions/splits are normalized;
4. event table is frozen and committed;
5. benchmark mapping rules are frozen.

## State
`LINGOTTO_SKILL_STATE = A2_TIMELINE_COMPLETE_HOLDINGS_EXTRACTION_IN_PROGRESS`

No alpha claim authorized.