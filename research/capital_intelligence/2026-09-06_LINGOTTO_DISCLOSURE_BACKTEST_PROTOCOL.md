# CAPITAL INTELLIGENCE Ω — Lingotto disclosure backtest protocol

**Status:** RESEARCH / VALIDATION REQUIRED  
**Date:** 2026-09-06  
**Objective:** test whether public Lingotto disclosures retain post-publication alpha after disclosure latency and benchmark adjustment. This document does **not** treat family prestige, Exor ownership or filing visibility as evidence of manager skill.

## Null hypothesis

`H0: publicly observable Lingotto position disclosures do not generate persistent positive excess returns after the filing becomes public.`

Primary horizons: `6M / 12M / 24M` from `PUBLICATION_DATE`, never quarter-end.

## Mandatory epistemic gates

### PRESTIGE TRANSFER GATE Ω
- `Agnelli/Exor reputation != Lingotto skill`.
- Manager skill must be established from attributable, reproducible return evidence.
- Until validated, `LINGOTTO_SKILL_STATE = A0_UNTESTED / A1_SAMPLE_INCOMPLETE`.

### DISCLOSURE COVERAGE GATE Ω
13F is a partial regulatory window, not the total portfolio.

For every filing store:
- `REPORT_DATE`
- `PUBLICATION_DATE`
- `FORM_TYPE`
- `VISIBLE_13F_VALUE`
- `VISIBLE_13F_LINE_COUNT`
- `US_13F_ONLY = TRUE`
- `SHORT_BOOK_VISIBLE = FALSE`
- `NON_US_LISTED_VISIBLE = FALSE unless separately disclosed`
- `PRIVATE_VISIBLE = FALSE unless separately disclosed`
- `DEBT_VISIBLE = PARTIAL/FORM_DEPENDENT`
- `DERIVATIVE_NETTING_VISIBLE = FALSE`
- `HEDGE_STATE = UNKNOWN unless separately proven`

SEC guidance is authoritative: only Section 13(f) securities belong in the form; non-US exchange shares are excluded; shorts are excluded; written options are excluded. A 13F Holdings Report means all **13(f)-reportable** holdings are reported, not the manager's entire global book.

### DENOMINATOR GATE Ω
Do not infer conviction from target-company ownership percentage.

Required fields:
- `TARGET_OWNERSHIP_PCT`
- `POSITION_VALUE`
- `VISIBLE_13F_WEIGHT = POSITION_VALUE / VISIBLE_13F_VALUE`
- `ESTIMATED_TOTAL_PORTFOLIO_WEIGHT` only if an independently sourced total denominator exists
- `DENOMINATOR_STATE = COMPLETE / 13F_VISIBLE_ONLY / INCOMPLETE`

Language discipline:
- Allowed: `5.2% of target company`.
- Allowed: `x% of visible 13F book` if reconstructed.
- Forbidden: `high portfolio conviction` without a valid portfolio denominator or a pre-defined proxy explicitly labeled as such.

## Initial filing anchors

| Report date | Publication date | Visible 13F lines | Visible 13F value | State |
|---|---:|---:|---:|---|
| 2023-06-30 | 2023-08-11 | 33 | $1,547,548,221 | verified SEC |
| 2024-06-30 | 2024-08-12 | 50 | $2,976,475,119 | verified SEC |
| 2025-12-31 | 2026-02-10 | 39 | $5,738,292,716 | verified SEC |
| 2026-03-31 | 2026-05-14 | 35 | $5,064,156,767 | verified SEC |

These totals describe only the visible Section 13(f) book. They are **not** total Lingotto AUM and must never be presented as such.

## Event universe

Construct **all** observable position events, not selected winners:

1. `NEW_VISIBLE_POSITION`
2. `VISIBLE_POSITION_INCREASE`
3. `VISIBLE_POSITION_DECREASE`
4. `VISIBLE_EXIT`
5. `13D_13G_NEW`
6. `13D_13G_AMENDMENT_UP`
7. `13D_13G_AMENDMENT_DOWN`

For 13F events, position change is inferred between quarter-end snapshots but the tradable public signal begins only on the filing publication date.

## Backtest design

For each event calculate from publication-date close or next executable session if after market close:

- `R_6M`, `R_12M`, `R_24M`
- excess vs broad market
- excess vs sector benchmark
- MFE
- MAE
- max drawdown
- volatility
- hit/miss

For increases/decreases test multiple materiality definitions:
- shares change >=25%
- shares change >=50%
- visible-book weight change >=100 bps where measurable

Do not optimize thresholds after observing outcomes without a holdout sample.

## Weighting tests

Run at least three variants:

1. **Equal-event weighting** — each disclosed event counts once.
2. **Visible-13F-weight weighting** — uses only reconstructed 13F denominator and is explicitly labeled partial-book weighting.
3. **High-materiality subset** — pre-defined threshold before return inspection.

Do not use target ownership percentage as portfolio-conviction weight.

## Benchmark discipline

Minimum comparisons:
- S&P 500 or MSCI World proxy appropriate to listing
- sector benchmark
- equal-weight universe of same-quarter new 13F positions from control allocators when available

Primary claim requires sector-adjusted alpha, not raw return.

## Latency discipline

`REPORT_DATE != PUBLICATION_DATE`.

The backtest must not buy at quarter-end. The signal is considered public only at filing acceptance/publication.

For 13F, record `LATENCY_DAYS = PUBLICATION_DATE - REPORT_DATE`.

## Survivorship / selection controls

Mandatory:
- include losers and later exits
- include delisted names where data are obtainable
- include every qualifying event under the ex-ante rule
- no cherry-picking known successes such as CVNA/TEVA
- amendments overwrite or annotate original filing state; they must not create duplicate independent observations unless they disclose genuinely new public information

## Allocator skill states

- `A0_UNTESTED`
- `A1_SAMPLE_INCOMPLETE`
- `A2_NO_POST_PUBLICATION_ALPHA`
- `A3_WEAK_OR_REGIME_DEPENDENT_ALPHA`
- `A4_PERSISTENT_POST_PUBLICATION_ALPHA`
- `A5_REPLICATED`

Only A4/A5 may justify persistent research-priority uplift. No state creates BUY authority.

## Router integration

Allocator provenance is orthogonal metadata:

`SOURCE_FLAG = LINGOTTO / INVESTOR_AB / OTHER`

Economic thesis routing remains:
- `QCO`
- `CQO`
- `NCO`
- `STO`
- `HCO`

`SOURCE_FLAG` must never choose the economic route or add points to company quality.

## Multi-route robustness

For ambiguous companies run at least two plausible thesis routes when materially possible.

Example:
- TEVA: `NCO` vs `QCO/low-growth quality` stress case.
- MOH: `NCO` vs `structural impairment` falsifier case.

If final status changes because route changes, mark `ROUTE_SENSITIVE = TRUE` and do not present a robust verdict.

## Next implementation tasks

1. Enumerate every Lingotto 13F filing from first available filing through latest available quarter.
2. Parse every information table into a normalized ticker/CUSIP/security-class history.
3. Reconcile amendments.
4. Build quarter-to-quarter event ledger.
5. Add 13D/13G events separately.
6. Resolve historical ticker/CUSIP changes and corporate actions.
7. Attach publication timestamps.
8. Join price and sector-benchmark data.
9. Run 6M/12M/24M post-publication test.
10. Only after results, update `LINGOTTO_SKILL_STATE`.

## Current conclusion

`CAPITAL INTELLIGENCE Ω` remains a **hypothesis-generating source**. Lingotto has not yet earned an allocator-skill premium in ATLAS. The existence of Exor/Giovanni Agnelli control links proves governance and disclosure identity; it does not prove post-publication investable alpha.
