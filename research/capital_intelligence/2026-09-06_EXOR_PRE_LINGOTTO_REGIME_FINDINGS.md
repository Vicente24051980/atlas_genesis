# CAPITAL INTELLIGENCE Ω — Pre-Lingotto regime findings

**Status:** BUILDING / PRIMARY SEC ONLY  
**Date:** 2026-09-06  
**Scope:** consecutive verified 13F snapshots from 2018Q4 through 2020Q4.

## Correction to prior state

The earlier block treated 2019Q1, 2019Q2, 2019Q4 and 2020Q2-Q4 as unresolved filing gaps. They have now been located and verified directly in SEC EDGAR.

Therefore the sequence 2018Q4 -> 2020Q4 is now consecutive and event windows inside this interval may be resolved at quarter granularity.

`SAME_CIK != SAME_INVESTMENT_PROCESS`

remains in force. CIK continuity is an identifier fact, not evidence of process continuity.

## Consecutive verified snapshot totals

| Quarter | Report date | Accepted / filed | Lines | Visible 13F value ($000) |
|---|---:|---:|---:|---:|
| 2018Q4 | 2018-12-31 | 2019-02-05 | 7 | 351,426 |
| 2019Q1 | 2019-03-31 | 2019-05-09 13:38:52 | 7 | 420,752 |
| 2019Q2 | 2019-06-30 | 2019-07-08 09:15:46 | 7 | 496,342 |
| 2019Q3 | 2019-09-30 | 2019-10-24 07:11:02 | 6 | 509,806 |
| 2019Q4 | 2019-12-31 | 2020-01-22 09:47:39 | 8 | 701,339 |
| 2020Q1 | 2020-03-31 | 2020-04-28 13:06:55 | 8 | 340,214 |
| 2020Q2 | 2020-06-30 | 2020-07-22 08:32:56 | 8 | 609,883 |
| 2020Q3 | 2020-09-30 | 2020-10-29 07:08:40 | 9 | 622,324 |
| 2020Q4 | 2020-12-31 | 2021-01-20 12:23:54 | 11 | 827,376 |

All values are visible Section 13(f) book only.

## Exact quarter events now unlocked

Because adjacent snapshots are now present:

- VanEck Junior Gold Miners is present in 2019Q2 and absent in 2019Q3 -> `EXIT_QUARTER = 2019Q3`.
- Range Resources is absent in 2019Q3 and present in 2019Q4 -> `ENTRY_QUARTER = 2019Q4`.
- Schlumberger is absent in 2019Q3 and present in 2019Q4 -> `ENTRY_QUARTER = 2019Q4`.
- Liberty Oilfield Services is absent in 2020Q2 and present in 2020Q3 -> `ENTRY_QUARTER = 2020Q3`.
- Gatos Silver is absent in 2020Q3 and present in 2020Q4 -> `ENTRY_QUARTER = 2020Q4`.
- VanEck Junior Gold Miners is absent in 2020Q3 and present in 2020Q4 -> `REENTRY_QUARTER = 2020Q4`.

These are filing-state events, not trade-date claims. A 13F only constrains the position to the quarter-end snapshot.

## Identifier continuity warning

Sibanye Stillwater appears under CUSIP `825724206` through 2020Q1 and `82575P107` from 2020Q2. This must be treated as an identifier/corporate-action reconciliation problem before any automated event ledger is allowed to classify it as an exit plus entry.

Rule:

`CUSIP_CHANGE != POSITION_EXIT` unless issuer-level identity reconciliation fails.

## Composition evidence

The pre-Lingotto book remains highly concentrated in mining/resources and selected ADRs. Persistent names include Cameco, Harmony Gold, New Gold, NovaGold, Sibanye Stillwater and VEON. Range Resources and Schlumberger enter by 2019Q4; Liberty Oilfield Services appears in 2020Q3; Gatos Silver and a VanEck Junior Gold Miners re-entry appear in 2020Q4.

This reinforces regime segmentation but does not establish skill.

## Persistence correction

Absolute duration remains non-informative until the manager-specific holding-life distribution is complete.

Required metric after population completion:

`PERSISTENCE_SURPRISE = observed holding duration - expected duration conditional on regime turnover / holding-life distribution`

No position receives a persistence signal merely because it appears in multiple filings.

## What is now statistically allowed

For the consecutive 2018Q4-2020Q4 block we may now construct:

1. quarter-to-quarter position-state ledger;
2. gross and net share-change ledger;
3. entry / exit / re-entry events at quarter granularity;
4. holding-life observations censored correctly at block boundaries;
5. turnover estimates based on position weights, subject to price-vs-flow decomposition;
6. preliminary manager-specific persistence distribution.

What remains prohibited:

- inferring exact trade dates;
- calling mark-to-market changes purchases/sales without share evidence;
- interpreting portfolio concentration as alpha;
- pooling Exor Investments, Exor Capital and Lingotto without a regime test;
- scoring manager skill before a benchmarked out-of-sample backtest exists.

## Skill state

- `EXOR_INVESTMENTS_UK_SKILL = A1_SAMPLE_INCOMPLETE`
- `EXOR_CAPITAL_SKILL = A1_SAMPLE_INCOMPLETE`
- `LINGOTTO_SKILL = A1_SAMPLE_INCOMPLETE`
- `POOLING_ALLOWED = FALSE`

## Next required block

1. Generate the 2018Q4-2020Q4 event ledger from the consecutive SEC snapshots.
2. Reconcile issuer identity / CUSIP changes before event classification.
3. Compute share-based turnover separately from value-based turnover.
4. Extend the consecutive chain through full 2021-2022 Exor Capital period.
5. Only then estimate holding-life and `PERSISTENCE_SURPRISE` by regime.
