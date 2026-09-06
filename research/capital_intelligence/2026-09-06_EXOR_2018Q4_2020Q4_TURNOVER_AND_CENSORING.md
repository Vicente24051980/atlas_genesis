# CAPITAL INTELLIGENCE Ω — Exor Investments (UK) turnover + holding-life censoring

**Status:** PRIMARY-SEC DESCRIPTIVE ANALYSIS / NO SKILL INFERENCE  
**Date:** 2026-09-06  
**Scope:** consecutive 13F snapshots 2018Q4→2020Q4 for the `EXOR_INVESTMENTS_UK` regime only.  
**Parent dataset:** `2026-09-06_EXOR_2018Q4_2020Q4_CONSECUTIVE_SEC_SNAPSHOTS.csv`  
**Event ledger:** `2026-09-06_EXOR_2018Q4_2020Q4_EVENT_LEDGER.csv`

## Event law
Events are generated mechanically from quarter-end reported share counts after economic-identity reconciliation. A CUSIP change does not create an exit/re-entry by itself.

States:
- `NEW`
- `INCREASE`
- `DECREASE`
- `EXIT`
- `UNCHANGED`

These are filing-observable states, not transaction dates. A `NEW` event means absent at the prior quarter-end and present at the current quarter-end; it does not identify the intra-quarter purchase date.

## Turnover methodology
A pure sum of raw share changes is not economically comparable across issuers because share units differ. Therefore the descriptive turnover proxy values each share delta using the quarter-end implied price (`reported market value / reported shares`). For exits, the prior-quarter implied price is used because no current-quarter position value exists.

For transition `t-1 → t`:

`BUY_NOTIONAL_PROXY = Σ max(Δshares,0) × quarter-end implied price`

`SELL_NOTIONAL_PROXY = Σ max(-Δshares,0) × quarter-end implied price`

`AVG_VISIBLE_BOOK = (visible_book_t-1 + visible_book_t) / 2`

Two descriptive metrics are retained:

`ONE_WAY_TURNOVER_PROXY = min(BUY_NOTIONAL_PROXY, SELL_NOTIONAL_PROXY) / AVG_VISIBLE_BOOK`

`SYMMETRIC_TURNOVER_PROXY = (BUY_NOTIONAL_PROXY + SELL_NOTIONAL_PROXY) / (2 × AVG_VISIBLE_BOOK)`

Neither is true executed turnover because 13F does not reveal transaction prices, intra-quarter round trips, derivatives/non-13F assets or cash flows. They are explicitly labeled proxies.

## Quarterly results

| Transition | New | Increase | Decrease | Exit | Unchanged | Buy notional proxy ($M) | Sell notional proxy ($M) | One-way turnover proxy | Symmetric turnover proxy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2018Q4→2019Q1 | 0 | 2 | 1 | 0 | 4 | 13.673 | 2.471 | 0.64% | 2.09% |
| 2019Q1→2019Q2 | 0 | 5 | 1 | 0 | 1 | 18.601 | 13.222 | 2.88% | 3.47% |
| 2019Q2→2019Q3 | 0 | 2 | 4 | 1 | 0 | 31.313 | 35.243 | 6.22% | 6.61% |
| 2019Q3→2019Q4 | 2 | 4 | 2 | 0 | 0 | 129.219 | 151.732 | 21.34% | 23.20% |
| 2019Q4→2020Q1 | 0 | 2 | 4 | 0 | 2 | 32.066 | 85.816 | 6.16% | 11.32% |
| 2020Q1→2020Q2 | 0 | 5 | 2 | 0 | 1 | 108.114 | 16.541 | 3.48% | 13.12% |
| 2020Q2→2020Q3 | 1 | 1 | 3 | 0 | 4 | 11.445 | 25.276 | 1.86% | 2.98% |
| 2020Q3→2020Q4 | 2 | 5 | 2 | 0 | 2 | 116.367 | 45.803 | 6.32% | 11.19% |

Visible book totals ($M): 2018Q4 351.426; 2019Q1 420.752; 2019Q2 496.342; 2019Q3 509.806; 2019Q4 701.339; 2020Q1 340.214; 2020Q2 609.883; 2020Q3 622.324; 2020Q4 827.376.

## Descriptive findings
The largest turnover episode in this window is `2019Q3→2019Q4`: one-way proxy 21.34%, symmetric proxy 23.20%. It contains two new visible positions (Range Resources and Schlumberger), increases in Cameco, New Gold, NovaGold and VEON, and reductions in Harmony and Sibanye.

The subsequent `2019Q4→2020Q1` transition shows material net selling/reduction, particularly in Sibanye, while RRC and SLB increase. `2020Q1→2020Q2` then shows substantial buy-side notional activity but much lower one-way turnover because offsetting sells are small.

This pattern is inconsistent with describing the regime as uniformly low-turnover or uniformly high-turnover. Turnover is regime-state dependent and episodic within the observed window.

## Holding-life audit — censoring problem
A valid holding-life distribution cannot yet be estimated from this block alone.

Reason: there are **zero fully uncensored completed holding spells** in the 2018Q4→2020Q4 window.

- Cameco, Harmony, New Gold, NovaGold, Sibanye and VEON are present at the first observed snapshot and remain at the final snapshot: `LEFT_CENSORED + RIGHT_CENSORED`.
- VanEck Junior Gold Miners is already present at the first snapshot, exits by 2019Q3 and re-enters in 2020Q4. Its first spell is `LEFT_CENSORED`; its second spell is `RIGHT_CENSORED`.
- Range Resources and Schlumberger first appear in 2019Q4 and remain at 2020Q4: `RIGHT_CENSORED`.
- Liberty Oilfield Services first appears in 2020Q3 and remains at 2020Q4: `RIGHT_CENSORED`.
- Gatos Silver first appears in 2020Q4: `RIGHT_CENSORED`.

Therefore a sample median/mean holding-life from this block would be statistically invalid and biased downward/upward depending on the censoring treatment.

## PERSISTENCE_SURPRISE gate
`PERSISTENCE_SURPRISE` remains **NOT COMPUTABLE** for this regime until the observation window is extended far enough backward/forward to estimate the manager-specific holding-duration distribution with censoring-aware methods.

Required next method after extending the panel:
1. Build complete holding spells by economically reconciled security identity.
2. Mark `left_censored`, `right_censored`, and exact-entry/exact-exit states.
3. Estimate survival using Kaplan-Meier or an equivalent censoring-aware estimator rather than naive completed-spell averages.
4. Define expected duration conditional on regime and, if sample size permits, event class / position materiality.
5. Only then compute a persistence residual/surprise.

Until that gate is satisfied: `PERSISTENCE_SIGNAL = UNRESOLVED`.

## Skill state
No alpha or allocator-skill conclusion follows from turnover or persistence structure alone.

`EXOR_INVESTMENTS_UK_SKILL = A1_SAMPLE_INCOMPLETE`

`POOLING_WITH_EXOR_CAPITAL_OR_LINGOTTO = FALSE`

`TURNOVER_PROXY = DESCRIPTIVE_ONLY`

`PERSISTENCE_SURPRISE = NOT_COMPUTABLE`
