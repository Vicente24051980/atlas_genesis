# ATLAS OMEGA - ProPicks Challenger + Replacement Alpha Omega

**Date:** 2026-08-29  
**Status:** ACTIVE CANONICAL ADDENDUM  
**Parent canon:** ATLAS Omega v4.0  
**Portfolio impact:** NONE until Investment Committee confirms a specific replacement.

## Canonical decision

ProPicks AI / InvestingPro is incorporated into ATLAS as an independent challenger signal, not as the decision engine.

The adopted discipline is monthly separation between:

1. **selection:** which candidates ProPicks surfaces, retains, removes or reranks;
2. **maintenance:** whether any current ATLAS 35 position still deserves its slot versus the best available alternative.

## Operating chain

`PROPICKS SIGNAL -> ATLAS INTEGRITY GATE -> EXPECTED RETURN OMEGA -> VALUATION -> FALSIFIERS -> COMPETITION FOR CAPITAL -> REPLACEMENT ALPHA -> INVESTMENT COMMITTEE`

## ProPicks Challenger Omega

Monthly ProPicks outputs receive one of three ATLAS states:

- `PASS`: ProPicks and ATLAS independently agree. This is stronger evidence, not a trade order.
- `WATCH`: ProPicks detects or removes something ATLAS must review, but ATLAS has not confirmed action.
- `REJECT`: the signal fails ATLAS hard gates, data integrity, valuation, falsifiers or traceability.

ProPicks additions do not create BUY. ProPicks removals do not create SELL.

## Replacement Alpha Omega

A challenger only enters the 35 if it beats the displaced incumbent by a clear net expected-return advantage after frictions and risks.

Formula:

`Net Replacement Alpha = Challenger Expected CAGR - Incumbent Expected CAGR + Marginal Portfolio Contribution Delta - Rotation Friction - Incremental Risk Penalty - Evidence Uncertainty Penalty - Concentration Penalty - Tax/Fee Friction`

Default thresholds:

- ordinary replacement: `>= 2.0%` net expected CAGR advantage,
- watch replacement: `>= 0.75%` net expected CAGR advantage.

## Replacement states

- `RA0_NO_ACTION_DATA_INSUFFICIENT`
- `RA1_KEEP_INCUMBENT`
- `RA2_WATCH_REPLACEMENT`
- `RA3_REPLACEMENT_CANDIDATE`
- `RA4_REPLACE_CONFIRMED`
- `RA5_EXIT_FUNDAMENTAL`

## Bias controls

ATLAS must explicitly guard against survivorship bias, look-ahead bias, backtest cherry-picking, redundant factor counting, hidden turnover costs, benchmark mismatch and regime instability.

External performance claims remain calibration-only unless independently auditable.

## Implementation

RFC: `docs/rfcs/RFC-PROPICKS-CHALLENGER-REPLACEMENT-ALPHA-OMEGA-v1.0.md`  
Engine: `src/atlas/algorithm/propicks-challenger-replacement-alpha-omega.ts`  
Tests: `src/atlas/algorithm/propicks-challenger-replacement-alpha-omega.test.ts`

## Final authority

Only Investment Committee Omega can emit BUY / HOLD / WATCH / REJECT / NO PORTFOLIO CHANGE. Falsifiers Omega keeps veto authority. Replacement Alpha Omega prevents emotional attachment and also prevents decimal-point rotation.
