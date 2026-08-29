# RFC - PROPICKS CHALLENGER + REPLACEMENT ALPHA OMEGA v1.0

**Status:** CANONICAL  
**Date:** 2026-08-29  
**Engine ID:** `PROPICKS_CHALLENGER_REPLACEMENT_ALPHA_OMEGA_V1_0`  
**Scope:** monthly challenger review, candidate replacement, ATLAS 35 maintenance  
**Relationship:** external challenger layer feeding Integrity Gate, Expected Return, Valuation, Falsifiers, Competition for Capital and Recommendation Performance Audit.

## 1. Mission

Use ProPicks AI / InvestingPro as an independent challenger signal inside ATLAS, never as the portfolio brain.

ProPicks is treated as a cross-sectional quantitative stock-picking model that can surface candidates, removals and rank changes. ATLAS then decides whether the signal survives its own evidence stack.

The core sequence is:

`PROPICKS SIGNAL -> ATLAS INTEGRITY GATE -> EXPECTED RETURN -> VALUATION -> FALSIFIERS -> COMPETITION FOR CAPITAL -> REPLACEMENT ALPHA -> PORTFOLIO ACTION`

No ProPicks list, ranking, removal or marketing performance claim may bypass ATLAS gates.

## 2. Non-negotiable laws

1. ProPicks is a challenger, not an authority.
2. External ranking does not equal Expected Return Omega.
3. External removal does not equal SELL.
4. External addition does not equal BUY.
5. Proprietary model output is evidence only at the signal layer unless independently auditable.
6. Marketing performance claims are calibration-only unless the dates, benchmark, constituents, survivorship treatment and turnover costs are reproducible.
7. A portfolio slot is scarce capital; a new candidate must beat the displaced position by a clear net margin.
8. Falsifiers Omega remains an absolute veto.
9. No automatic change to the 35-position portfolio is authorized by this engine alone.

## 3. Challenger outcomes

Each monthly ProPicks input receives exactly one state:

- `PASS`: ProPicks and ATLAS independently agree. This strengthens evidence but does not create a trade order.
- `WATCH`: ProPicks finds something ATLAS has not validated, or removes/downgrades something ATLAS can still defend. This forces review.
- `REJECT`: ATLAS hard gates fail, a falsifier is confirmed, data integrity fails, or the external signal is untraceable.

## 4. Evidence treatment

External evidence states:

- `AUDITABLE_MODEL`: signal, methodology and performance claim can be independently checked.
- `TRACEABLE_SIGNAL_PROPRIETARY_METHOD`: the monthly pick/removal is visible and timestamped, but the model remains proprietary.
- `MARKETING_ONLY`: useful for discovery, not for portfolio change.
- `UNTRACEABLE`: rejected.

ATLAS must preserve the review month, as-of date, source evidence IDs, ProPicks action, ATLAS packet IDs and final challenger state.

## 5. Replacement Alpha Omega

Replacement Alpha Omega answers one question:

**Does the best alternative offer enough forward expected return, after friction and incremental risk, to justify taking one of the 35 slots from the incumbent?**

Formula:

`Net Replacement Alpha = Challenger Expected CAGR - Incumbent Expected CAGR + Marginal Portfolio Contribution Delta - Rotation Friction - Incremental Risk Penalty - Evidence Uncertainty Penalty - Concentration Penalty - Tax/Fee Friction`

Default thresholds:

- ordinary replacement hurdle: `>= 2.0%` net expected CAGR advantage,
- watch threshold: `>= 0.75%` net expected CAGR advantage.

Tiny score differences, recent price excitement, gap chasing or ticker affection do not qualify.

## 6. Replacement states

- `RA0_NO_ACTION_DATA_INSUFFICIENT`: no replacement decision because evidence, data integrity or dates are incomplete.
- `RA1_KEEP_INCUMBENT`: challenger fails or net alpha is too small.
- `RA2_WATCH_REPLACEMENT`: positive but sub-hurdle spread; keep in monthly review.
- `RA3_REPLACEMENT_CANDIDATE`: net hurdle clears but at least one required gate is still missing.
- `RA4_REPLACE_CONFIRMED`: net hurdle clears and all gates pass.
- `RA5_EXIT_FUNDAMENTAL`: incumbent has a confirmed falsifier; exit logic is separate from buying the replacement.

## 7. Monthly protocol

On the first review window of each month:

1. Capture ProPicks additions, removals, retained names and rank changes.
2. Store source evidence IDs and as-of dates.
3. Run every name through ATLAS Integrity Gate.
4. Rebuild Expected Return from current price and current fundamentals.
5. Apply Valuation Engine bear/base/bull.
6. Run Falsifiers Omega and Competition for Capital.
7. Compare incumbent versus challenger through Replacement Alpha Omega.
8. Record `PASS / WATCH / REJECT` plus `RA0-RA5` where a real displacement is considered.
9. Feed outcomes into Recommendation Performance Audit Omega.
10. Make no automatic portfolio change without final Investment Committee approval.

## 8. Bias controls

The review must explicitly check:

- survivorship bias,
- look-ahead bias,
- backtest period selection,
- turnover cost omission,
- benchmark mismatch,
- redundant features counted as independent evidence,
- regime change vulnerability,
- current valuation versus historical quality.

ProPicks may be very useful even if these are unknown, but unknowns lower authority from decision evidence to discovery/challenger evidence.

## 9. Engine contract

Canonical implementation:

- `src/atlas/algorithm/propicks-challenger-replacement-alpha-omega.ts`
- `src/atlas/algorithm/propicks-challenger-replacement-alpha-omega.test.ts`

Public functions:

- `evaluateProPicksChallenger`
- `calculateReplacementAlpha`
- `createMonthlyChallengerReview`

Outputs must preserve `externalSignalCanTrade = false` and `portfolioChangeAuthorized = false` for pure challenger review. Replacement authorization can only be produced by Replacement Alpha after all gates pass.

## 10. Persistence law

Every monthly ProPicks challenger review must be persisted to GitHub and mirrored to Notion. GitHub remains the technical source; Notion remains the operational mirror.
