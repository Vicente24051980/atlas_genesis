# ENTRY TIMING RETURN-AWARE Ω v2

Status: ACTIVE CANON  
Date: 2026-08-20

## Purpose

Correct the execution error of asking a candidate to fall an additional fixed percentage after a material correction has already occurred.

Canonical separation remains:

**SELECTION != ENTRY.**

Size-Neutral Return Ranking Ω decides whether expected return is sufficiently attractive. GREEN CONTINUITY Ω measures market sponsorship. Entry Timing Return-Aware Ω decides whether the current execution point is asymmetric enough.

## Core correction

For every candidate, calculate the correction that has **already occurred** from synchronized regular-market data before requesting any additional pullback.

Observed correction is the maximum relevant negative displacement among:
- 1W return;
- 1M return;
- 3M return;
- distance from ATH.

Then compare that observed correction with ticker-specific historical bands:
- `normalPullbackPct`;
- `elevatedPullbackPct`;
- `stressDrawdownPct`.

The engine must output `additionalDropRequiredPct = max(0, normalPullbackPct - observedCorrectionPct)` only when a no-chase state still exists.

If the ticker has already reached the normal/elevated/stress dislocation band while thesis and falsifiers remain intact, `additionalDropRequiredPct` is **0**. ATLAS must not mechanically ask for another -3%, -5%, -10% or any other universal decline.

## GREEN integration without contamination

GREEN CONTINUITY Ω remains independent and records the observed number of positive horizons.

Committee execution rule for candidates with evidence-backed **Size-Neutral Return Score >=850/1000**:
- GREEN 5/5: strongest continuity; eligible for `BUY_NOW`, `BUY_THE_DIP` or dislocation entry depending on timing.
- GREEN 4/5: valid; does not fail merely because one horizon is red.
- GREEN 3/5: valid when return is strong; execution is normally starter/confirmation unless a material dislocation is already present.
- GREEN 0–2/5: immediate entry is blocked pending market confirmation, but this is not a fundamental falsifier by itself.

Return score never rewrites the GREEN history. GREEN never overrides valuation, Economic Proof or Falsifiers.

## States

- `BUY_NOW`
- `BUY_THE_DIP`
- `STARTER_NOW_DISLOCATION`
- `STARTER_CONFIRMATION`
- `WAIT_NO_CHASE`
- `WAIT_RETURN`
- `WAIT_GREEN`
- `WAIT_EVENT`
- `EVIDENCE_PENDING`
- `REJECT_ENTRY`

## Falsifiers

A confirmed Falsifiers Ω veto remains absolute and independent. A falling price cannot convert a broken thesis into a buyable dip.

## Calibration example — NXPI, 2026-08-20

User-observed Trading 212 snapshots around $224.72 showed approximately:
- 1W: -3.72%
- 1M: -15.89%
- 3M: -27.54%

This is a canonical example of why a generic recommendation to wait for 'another -3% to -5%' can be logically wrong. The engine must first compare the correction already realized with NXPI's own historical pullback bands, then classify the entry. If those bands are already reached and the return/evidence thesis remains valid, the correct state is staged dislocation entry rather than mechanically waiting for an additional arbitrary decline.

## Constitutional rules

- PRICE != FUNDAMENTAL EVIDENCE.
- FALLING PRICE != CHEAPNESS.
- SELECTION != ENTRY.
- GREEN 5/5 != AUTOMATIC BUY.
- GREEN 3/5 OR 4/5 != AUTOMATIC REJECT when return is strong.
- ALREADY-OCCURRED DRAWDOWN MUST BE CREDITED.
- UNIVERSAL EXTRA-DROP TARGETS ARE FORBIDDEN.
- FALSIFIERS Ω VETO REMAINS ABSOLUTE.
