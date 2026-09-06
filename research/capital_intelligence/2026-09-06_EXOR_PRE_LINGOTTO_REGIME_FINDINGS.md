# CAPITAL INTELLIGENCE Ω — Pre-Lingotto regime findings

**Status:** BUILDING / PRIMARY SEC ONLY  
**Date:** 2026-09-06  
**Scope in this block:** verified snapshots for 2018Q4, 2019Q3 and 2020Q1. Missing intermediate quarters are explicitly not interpolated.

## Verified snapshot totals

- 2018Q4 — 7 lines; visible 13F value = $351.426M; accepted 2019-02-05 10:20:20.
- 2019Q3 — 6 lines; visible 13F value = $509.806M; accepted 2019-10-24 07:11:02.
- 2020Q1 — 8 lines; visible 13F value = $340.214M; accepted 2020-04-28 13:06:55.

All values are visible Section 13(f) book only.

## Composition evidence

The pre-Lingotto Exor Investments (UK) book is extremely concentrated in mining/resources and selected ADRs. Recurrent names across the verified snapshots include:

- Cameco
- Harmony Gold
- New Gold
- NovaGold
- Sibanye Stillwater
- VEON

By 2020Q1 the verified snapshot also contains Range Resources and Schlumberger.

This is a materially different economic mix from the later Lingotto-era book and strengthens the regime-segmentation rule:

`SAME_CIK != SAME_INVESTMENT_PROCESS`

## Important methodological point

Do **not** infer entry or exit quarter across missing snapshots.

Example: Range Resources and Schlumberger are present in 2020Q1 and absent in the verified 2019Q3 snapshot. Because 2019Q4 has not yet been normalized in this block, the correct event state is:

`ENTRY_WINDOW = (2019Q3, 2020Q1] / EXACT_QUARTER_UNRESOLVED`

Likewise, VanEck Junior Gold Miners is present in 2018Q4 and absent by 2019Q3, but the exact exit quarter is unresolved until 2019Q1/Q2 are normalized.

## Persistence correction

Absolute duration remains non-informative until the manager-specific holding-life distribution is complete.

Required metric after population completion:

`PERSISTENCE_SURPRISE = observed holding duration - expected duration conditional on regime turnover / holding-life distribution`

No position receives a persistence signal merely because it appears in multiple filings.

## First descriptive regime signal

Between the verified 2019Q3 and 2020Q1 snapshots, Sibanye shares fall from 42.42M to 12.42M while Cameco falls from 9.58M to 8.61M; however this is **not** yet an event attribution because the missing 2019Q4 snapshot could contain intermediate transactions. It is retained as a cumulative two-snapshot change only.

## Skill state

No alpha inference is authorized from this historical block.

- `EXOR_INVESTMENTS_UK_SKILL = A1_SAMPLE_INCOMPLETE`
- `EXOR_CAPITAL_SKILL = A1_SAMPLE_INCOMPLETE`
- `LINGOTTO_SKILL = A1_SAMPLE_INCOMPLETE`
- `POOLING_ALLOWED = FALSE`

## Next required block

Normalize the missing intermediate filings in order:

1. 2019Q1
2. 2019Q2
3. 2019Q4
4. 2020Q2
5. 2020Q3
6. 2020Q4
7. full 2021–2022 Exor Capital period

Only after consecutive snapshots exist should quarter-to-quarter event ledgers be generated and manager turnover / holding-life estimated.
