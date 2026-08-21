# RETURN OBJECTIVE SEPARATION Ω

**Status:** ACTIVE CANON  
**Effective date:** 2026-08-21  
**Authority:** explicit user correction after Europe return-ranking audit  
**Implementation:** `src/atlas/algorithm/return-objective-separation-omega.ts`

## Purpose

Prevent ATLAS Ω from answering a request for **return** with a ranking that is actually dominated by company quality, moat, Economic Proof, prestige or a multi-factor opportunity composite.

## Constitutional separation

ATLAS has four separate ranking objectives:

1. **HISTORICAL RETURN** — verified past-window market return.
2. **EXPECTED RETURN** — evidence-backed forward CAGR from the current entry price.
3. **BUSINESS QUALITY** — business, moat, economics and durability.
4. **COMPOSITE OPPORTUNITY** — multi-engine opportunity view.

These outputs may be displayed side by side, but must never be silently substituted for one another.

## Pure-return law

Requests for `más retorno`, `máximo retorno`, `por retorno`, `retorno esperado`, `retorno futuro`, `Expected Return`, `CAGR`, `retorno` or `rentabilidad` route to **EXPECTED RETURN** unless explicitly anchored to a historical period.

Historical windows route to **HISTORICAL RETURN**.

## EXPECTED RETURN ranking rule

The ordering variable is **probability-weighted forward CAGR from a verified current price**.

Canonical terminal-value calculation:

`P̄_h = Σ(probability_i × P_terminal_i)`

`Expected CAGR = (P̄_h / P0)^(1/h) - 1`

For the standard three-scenario / three-year Motor 13 configuration:

`P̄_3 = 0.20 × P_bear + 0.60 × P_base + 0.20 × P_bull`

`Expected CAGR = (P̄_3 / P0)^(1/3) - 1`

Scenario CAGRs must never be averaged directly. Expected terminal capital is computed first and only then geometrically annualized.

### What may affect ranking order

- verified current price P0;
- scenario terminal values;
- scenario probabilities;
- explicit dilution/per-share effects;
- horizon normalization.

### What may NOT add ranking points

- generic company quality;
- moat score;
- fame;
- market capitalization;
- analyst coverage;
- absolute FCF dollars;
- index membership;
- GREEN continuity;
- Economic Proof score itself;
- Money Rotation score;
- momentum score.

## MOTOR 13 PRICE & TARGET INTEGRITY GATE Ω — 2026-08-21

### Trigger

A 21-Aug-2026 audit detected systemic temporal/scale contamination in Expected Return inputs. Multiple matrices mixed stale historical prices, current prices, pre/post corporate-action scales and terminal targets built on incompatible price regimes. The mathematical CAGR engine remained valid, but the ranking output was invalid because its denominators and targets were not contemporaneously reconciled.

### Hard-reset rule

If P0 fails integrity, the following are invalidated together for that observation set:

- P0;
- inherited terminal targets;
- inherited Expected CAGR;
- inherited ranking position.

**Do not repair a contaminated ranking by replacing P0 while retaining inherited P3 targets.** Both sides of the valuation ratio must be independently reconstructed and reconciled.

### P0 integrity requirements

Before a ticker may enter a canonical Expected Return ranking, P0 must carry:

1. exact ticker and primary listing;
2. currency and quotation unit (USD, CAD, EUR, CHF, GBp, etc.);
3. exact observation date;
4. observation type: official close or intraday snapshot;
5. timestamp when intraday;
6. source/evidence identifier;
7. corporate-action normalization status, including stock splits where relevant.

An intraday observation may never be labelled as an official close. If the requested session has not closed, either use a timestamped intraday P0 or the latest completed official close and label it explicitly.

### Terminal-target integrity requirements

Bear/Base/Bull terminal values must be rebuilt from contemporaneous fundamentals and must use the same per-share scale and currency as P0. At minimum the valuation trace must expose the material drivers used: EPS/FCF or operating cash-flow bridge, diluted share count/dilution assumptions, net debt/cash, sanctioned production/capacity and the terminal multiple or valuation method.

Unsanctioned growth projects do not enter the base case merely because they exist in the pipeline. They require explicit probability treatment or a bull/upside scenario until sanctioned.

### Corporate-action gate

Any split, reverse split, spin-off, merger, ticker migration or other material corporate action between the source period and P0 requires explicit normalization before ranking. A target on a pre-action share scale cannot be compared with a post-action P0.

### Fail-closed behavior

If any required P0 or terminal-target integrity field is missing, stale, contradictory or unreconciled:

`EXPECTED RETURN → EVIDENCE_PENDING / INVALIDATED`

The ticker must not receive a canonical rank. No placeholder target, inherited target or guessed scale is permitted to fill the gap.

### Reset propagation invariant

`P0 FAIL → P0 DELETE + P3 DELETE + CAGR DELETE + RANK DELETE`

A ranking may be regenerated only after:

`VERIFIED P0 → CONTEMPORARY FUNDAMENTALS → BEAR/BASE/BULL P3 → EXPECTED TERMINAL VALUE → CAGR → FALSIFIER GATE → RANK`

### Epistemic labels

Outputs derived only from supplied but unverified inputs must be labelled:

`INPUTS PROVIDED / NOT INDEPENDENTLY VERIFIED`

Only evidence-reconciled inputs may be labelled:

`CANONICAL VERIFIED`

Mathematical correctness alone never upgrades source integrity.

## Economic Proof = survival gate, not return bonus

For EXPECTED RETURN candidates:

- **5/5 PASS** → eligible;
- **4/5 PASS** → eligible only if the sole FAIL is non-material;
- **3/5 or lower** → excluded;
- **material FAIL at 4/5** → excluded;
- **Falsifiers Ω** → absolute veto.

A 4/5 company with a higher verified Expected CAGR ranks above a 5/5 company with a lower Expected CAGR if both survive the applicable gates.

## HISTORICAL RETURN ranking rule

Historical Return is ordered by verified total market return for the requested window. Business quality, Economic Proof, moat and forward return do not alter that ordering.

## BUSINESS QUALITY ranking rule

Business Quality remains a separate surface for Economic Proof, FCF conversion, incremental ROIC, moat, durability, balance-sheet quality and structural growth quality.

**BEST COMPANY ≠ HIGHEST EXPECTED RETURN.**

## COMPOSITE OPPORTUNITY rule

Composite Opportunity may combine return, revisions, flows, momentum, specialist engines, risk and business evidence. It may never be presented as a pure-return ranking.

## Required output labeling

Any ranked table must expose its objective:

- `HISTORICAL RETURN — <window>`;
- `EXPECTED RETURN — <horizon>`;
- `BUSINESS QUALITY`;
- `COMPOSITE OPPORTUNITY`.

For Expected Return, also expose the P0 observation date/type and verification state.

## Anti-contamination invariants

**RETURN REQUEST → RETURN METRIC.**  
**QUALITY = FILTER / SEPARATE DIAGNOSTIC, NOT RETURN BONUS.**  
**HISTORICAL ≠ FORWARD.**  
**COMPOSITE ≠ PURE RETURN.**  
**FALSIFIERS Ω REMAINS ABSOLUTE.**  
**MATH PASS ≠ DATA PASS.**  
**STALE P0 OR P3 → NO CANONICAL RANK.**
