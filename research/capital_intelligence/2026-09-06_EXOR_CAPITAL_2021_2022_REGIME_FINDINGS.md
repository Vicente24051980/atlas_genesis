# CAPITAL INTELLIGENCE Ω — Exor Capital 2021–2022 regime findings

**Status:** PRIMARY SEC NORMALIZED / PERSISTENCE MODEL STILL CENSORED  
**Date:** 2026-09-06  
**Scope:** Q1-2021 through Q4-2022, anchored to Q4-2020 for transition events.  
**Rule:** same CIK is legal continuity only; regime continuity and skill remain unproven.

## Filing chain verified

Primary SEC filing dates / report dates:

- 2021Q1 — report 2021-03-31; accepted 2021-04-29 09:07:25; 9 lines.
- 2021Q2 — report 2021-06-30; accepted 2021-07-29 15:08:01; 13 lines.
- 2021Q3 — report 2021-09-30; accepted 2021-11-01 15:41:49; 14 lines.
- 2021Q4 — report 2021-12-31; accepted 2022-01-18 09:51:36; 16 lines.
- 2022Q1 — report 2022-03-31; accepted 2022-05-03 12:28:30; 16 lines.
- 2022Q2 — report 2022-06-30; accepted 2022-08-12 11:59:35; 16 lines.
- 2022Q3 — report 2022-09-30; accepted 2022-11-07 09:45:49; 16 lines.
- 2022Q4 — report 2022-12-31; accepted 2023-02-15 06:16:21; 18 lines.

The manager name at the filings is Exor Capital LLP. Q4-2020 was still Exor Investments (UK) LLP, so the transition boundary is observable between those filings.

## Late-filing anomaly — quarantine

SEC accession `0001732768-23-000001`, accepted 2023-02-14 16:21:32, is a non-amendment 13F-HR whose stated period of report is **2021-12-31**, despite an original 13F-HR for that same period having been filed on 2022-01-18.

The following day, accession `0001732768-23-000002` was filed for 2022-12-31.

Therefore:

`2023-02-14_LATE_Q4_2021_FILING = QUARANTINED_RECONCILIATION_REQUIRED`

It is not allowed to overwrite the point-in-time 2021Q4 snapshot or create a new investment event until the filing semantics are reconciled. Point-in-time backtests must use information actually public at each historical date.

## Economic composition shift

The original Exor Capital sequence broadens beyond the earlier mining/resources core.

New visible long positions during the period include:

- 2021Q2: Weatherford, Valaris, Desktop Metal, Skillsoft.
- 2021Q4: Fathom Digital Manufacturing.
- 2022Q1: KraneShares CSI China Internet.
- 2022Q2: Paramount Global.
- 2022Q3: Teva.
- 2022Q4: NexGen Energy and Invesco Golden Dragon China ETF.

This is evidence of a changing observable book, not evidence of superior skill.

## Derivatives firewall

Two 13F put positions are explicitly separated from long holdings:

- `QQQJ_PUT` — Invesco NASDAQ Next Gen 100 put; first visible 2021Q3; exits by 2022Q1.
- `SMH_PUT` — VanEck Semiconductor ETF put; first visible 2021Q4; exits by 2022Q2.

Rules:

- `LONG_HOLDING_LIFE != OPTION_HOLDING_LIFE`
- puts do not enter long-book persistence estimates.
- option notional/share counts are not pooled with ordinary-share turnover.

## Event-count structure

Quarter-to-quarter mechanical event counts from the normalized share ledger:

- 2020Q4→2021Q1: 6 increases, 2 decreases, 2 exits, 1 unchanged.
- 2021Q1→2021Q2: 4 new, 8 increases, 1 decrease.
- 2021Q2→2021Q3: 1 new put, 8 increases, 1 decrease, 4 unchanged.
- 2021Q3→2021Q4: 2 new, 6 increases, 3 decreases, 5 unchanged.
- 2021Q4→2022Q1: 1 new long, 1 put exit, 6 increases, 2 decreases, 7 unchanged.
- 2022Q1→2022Q2: 1 new long, 1 put exit, 4 increases, 6 decreases, 5 unchanged.
- 2022Q2→2022Q3: 1 new long, 1 long exit, 2 increases, 2 decreases, 11 unchanged.
- 2022Q3→2022Q4: 2 new longs, 8 increases, 4 decreases, 4 unchanged.

These counts are descriptive only. They do not measure dollar turnover because share counts across securities are not commensurable.

## Holding-life / censoring audit

Within the combined Q4-2020→Q4-2022 window, most economically important long spells remain censored.

Examples:

- Cameco, Gatos, Harmony, NovaGold, RRC, SLB, VanEck Junior Gold and VEON are both left- and right-censored in this window.
- Desktop Metal, Skillsoft, Valaris and Weatherford begin inside the window but are right-censored at Q4-2022.
- Liberty Oilfield is left-censored and exits in 2022Q3.
- the only clean complete spells currently observed are the two option positions, each visible for two quarter-end snapshots.

Therefore a manager-specific long-holding survival distribution is still not identified.

`PERSISTENCE_SURPRISE_LONG = NOT_COMPUTABLE`

Do not infer an expected long holding life from option spells or from censored long positions.

## Regime conclusion

The 2021–2022 evidence supports:

- `LEGAL_CIK_CONTINUITY = TRUE`
- `OBSERVABLE_BOOK_CHANGE = TRUE`
- `PROCESS_STABILITY_ACROSS_2020_2021 = UNPROVEN`
- `POOLING_EXOR_INVESTMENTS_UK_WITH_EXOR_CAPITAL = FALSE`
- `EXOR_CAPITAL_SKILL = A1_SAMPLE_INCOMPLETE`

The next statistically useful extension is 2023 through the first Lingotto filing. It should test whether the widening of the book continues and, critically, close enough long spells to estimate survival/holding-life without fabricating a persistence benchmark.
