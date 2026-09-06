# LINGOTTO Q2→Q3 2025 PRIMARY DIFF AUDIT Ω

**Status:** PRIMARY SEC / EVENT FREEZE PRE-RETURNS  
**Date:** 2026-09-06

## Purpose
Reconstruct the Q2→Q3 2025 visible-book transition from primary SEC filings without using return information.

## Sources
- Q2-2025 13F: accession `0001172661-25-003216`, filed 2025-08-13, 45 entries, visible value `$4,704,514,584`.
- Q3-2025 original: accession `0001172661-25-004702`, filed 2025-11-12, 35 entries.
- Q3-2025 amendment: accession `0001172661-25-004755`, filed 2025-11-13, amendment no. 1, checkbox `adds new holdings entries`, 36 entries, visible value `$5,411,143,736`.

## Critical amendment-semantic conflict
SEC Form 13F instructions state that an amendment designated `adds new holdings entries` should include only holdings entries reported in addition to those already reported in a current public Form 13F for the same period.

Lingotto's Q3-2025 amendment does not behave like a simple add-only delta. Its information table repeats nearly all original holdings. The key observable anomaly is SLB:

- Q3 original: one SLB common row, `5,950,941` units.
- Q3 amendment: SLB common `4,149,171` plus SLB call `1,801,770`.
- Sum = `5,950,941`.

The amendment therefore appears to reclassify/split the SLB exposure while being formally marked `adds new holdings entries`. Blindly summing original + amendment would double-count almost the entire book.

### Mandatory state
`AMENDMENT_SEMANTICS_CONFLICT = TRUE`

Base handling:
1. 2025-11-12 original = first public information state.
2. 2025-11-13 amendment = second public information state.
3. Do **not** sum duplicate rows.
4. For Q3 quarter-end security reconstruction, use the amendment table as the operative amended snapshot where a row is duplicated, while preserving the original separately for publication-timing analysis.
5. Any signal created only by the amendment starts on 2025-11-13.

## Q2→Q3 common-share events frozen before returns
Percentages use reported share counts after matching by CUSIP/class and excluding known option rows.

| Security | Q2-2025 shares | Q3-2025 amended-state shares | QoQ | Frozen event |
|---|---:|---:|---:|---|
| API Group | 204,800 | 307,200 | +50.0% | `SHARE_ADD_50` |
| Aurora Innovation | 3,450,000 | 6,081,579 | +76.3% | `SHARE_ADD_50` |
| Carvana | 3,765,251 | 3,093,536 | -17.8% | none |
| First Majestic Silver | 9,964,096 | 10,022,690 | +0.6% | none |
| Harmony Gold | 18,209,275 | 11,334,733 | -37.8% | `SHARE_CUT_25` |
| NovaGold | 34,902,954 | 35,111,968 | +0.6% | none |
| PONY AI | 2,379,892 | 2,379,892 | 0.0% | none |
| Range Resources | 7,161,614 | 7,200,474 | +0.5% | none |
| Recursion | 3,675,077 | 3,675,077 | 0.0% | none |
| SLB common | 4,128,645 | 4,149,171 | +0.5% | none; amendment-sensitive |
| ServiceNow | 46,104 | 46,104 | 0.0% | none |
| Sibanye Stillwater | 28,430,409 | 28,430,409 | 0.0% | none |
| TSM ADR | 205,000 | 205,000 | 0.0% | none |
| Tempus AI | 783,859 | 783,859 | 0.0% | none |
| Tesla | 43,961 | 43,961 | 0.0% | none |
| Teva | 28,156,918 | 28,588,790 | +1.5% | none |
| Valaris | 3,655,900 | 3,710,929 | +1.5% | none |
| VEON | 5,957,666 | 6,044,094 | +1.5% | none |

## Option row kept separate
SLB call:
- Q2-2025: `1,391,770`
- Q3-2025 amendment: `1,801,770`
- change: approximately `+29.5%`
- state: `OPTION_ADD_25`, **not** common-share `SHARE_ADD_25`.

## Exit candidates visible from Q2 but absent from Q3
The following Q2 rows are absent from the Q3 amended-state table and are candidate `EXIT_VISIBLE_BOOK` events, subject to corporate-action review:
- Alphabet common
- Alphabet call
- Capital One
- CBRE
- KKR
- Life Time Group
- Oscar Health
- Rocket Companies
- Sportradar

These remain `EXIT_CANDIDATE` until security/corporate-action checks are complete.

## Corporate-action block
`Paramount Global` in Q2 and `Paramount Skydance Corp` in Q3 have different issuer/CUSIP identities around the transaction. This is **not** classified as an exit + new position until the conversion/exchange mechanics are normalized.

State: `CORPORATE_ACTION_OPEN`.

## Anti-hindsight rule
No market prices, 6M/12M/24M returns, sector alpha or winner/loser labels were used to define any event above.

## Current conclusion
This quarter materially weakens narrative shortcuts:
- two clear common-share additions: API Group and Aurora;
- one clear common-share cut: Harmony Gold;
- many large visible-weight changes can occur without material share changes;
- SLB demonstrates why amendment semantics and option separation are mandatory;
- Paramount demonstrates why CUSIP changes must be normalized before classifying exits/news.

`LINGOTTO_SKILL_STATE = A2_TIMELINE_COMPLETE_HOLDINGS_EXTRACTION_IN_PROGRESS`

No alpha claim authorized.
