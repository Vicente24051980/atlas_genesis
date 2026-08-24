# ATLAS Ω — STRUCTURAL TIER PRIORITY Ω v1.0

**Status:** ACTIVE CANON / RESEARCH PRIORITY LAYER  
**Effective date:** 2026-08-24  
**Implementation:** `src/atlas/algorithm/structural-tier-priority-omega.ts`  
**Tests:** `src/atlas/algorithm/structural-tier-priority-omega.test.ts`  
**Decision authority:** NONE

## Mission

Standardize the labels **S / A+ / A / B+** as a structural research-priority classification without contaminating them with current price, analyst targets, recent stock performance or portfolio preference.

The engine exists because a company can be structurally elite and still offer a mediocre Expected Return at today's price. The reverse can also occur: a lower structural tier can become an attractive special-situation return at a sufficiently asymmetric price.

## Constitutional separation

**STRUCTURAL TIER ≠ EXPECTED RETURN.**  
**STRUCTURAL TIER ≠ PORTFOLIO WEIGHT.**  
**STRUCTURAL TIER ≠ BUY/SELL.**  
**BUSINESS QUALITY ≠ GOOD STOCK AT ANY PRICE.**  
**ANALYST TARGET ≠ STRUCTURAL EVIDENCE.**  
**MARKET CAP ≠ STRUCTURAL SCORE.**  
**RECENT PRICE RETURN ≠ BUSINESS QUALITY.**

## Inputs

All inputs must be evidence-backed and normalized before scoring:

- Business Quality Ω — 0–100
- Economic Proof E0–E4
- Forward Moat / Moat Migration Ω — 0–100
- Reinvestment Runway & ROIC Ω — 0–100
- Per-Share Economics Ω — 0–100
- Funding Robustness — 0–100
- Structural Fragility — 0–100, higher = worse
- confirmed structural falsifier flag
- open event-gate flag

No price, P/E, EV/FCF, analyst target, market capitalization, recent return or portfolio weight is an input.

## Pre-fragility score

`25% Business Quality + 20% Economic Proof + 20% Forward Moat + 15% Reinvestment Runway + 10% Per-Share Economics + 10% Funding Robustness`

Economic Proof maps E0–E4 to 0/25/50/75/100.

Fragility is then shown explicitly and can apply up to a 10-point structural penalty in the implementation. This does not replace Risk Ω, Ruin Guard Ω, CFQ Ω or AI Credit Transmission Ω.

## Tier gates

### S
Requires all of:
- structural score ≥88;
- Business Quality ≥90;
- Economic Proof ≥E3;
- Forward Moat ≥80;
- Funding Robustness ≥70;
- Structural Fragility ≤50;
- no confirmed structural falsifier.

### A+
- structural score ≥80;
- Business Quality ≥80;
- Economic Proof ≥E3;
- no confirmed structural falsifier.

### A
- structural score ≥70;
- Economic Proof ≥E2;
- no confirmed structural falsifier.

### B+
- structural score ≥60;
- Economic Proof ≥E2;
- no confirmed structural falsifier.

### BELOW_B_PLUS
Fails the above gates or is vetoed by a confirmed structural falsifier.

### EVIDENCE_PENDING
Evidence quorum or required structural inputs are incomplete.

The thresholds are versioned implementation defaults. Any recalibration requires Model Learning & Governance Ω and out-of-sample evidence.

## Event-gate law

An open earnings/regulatory/event gate can block a fresh capital conclusion without erasing the structural tier.

Example:

`NVDA = structural S` can coexist with `EVENT_GATE_OPEN / NO FRESH CAPITAL VERDICT until 26-Aug earnings`.

This preserves the distinction between company quality and current decision uncertainty.

## Capital hand-off

Structural Tier Priority Ω hands candidates downstream to:

`Valuation Method Integrity → Valuation Ω → Expected Return 3–6Y → Valuation Compression Stress → Ruin Guard → Active-vs-Index → Competition for Capital → Anti-Churn Replacement → Entry Timing`

Only that downstream chain may determine whether a structurally superior business deserves new capital at the current price.

## Required output

`TICKER → STRUCTURAL_TIER → STRUCTURAL_SCORE → ECONOMIC_PROOF → FORWARD_MOAT → RUNWAY → PER_SHARE → FUNDING → FRAGILITY → EVENT_GATE → FALSIFIERS → VALUATION_RESET_REQUIRED → CAPITAL_ACTION_NOT_AUTHORIZED`

## Calibration principle from the 24-Aug cohort

This engine deliberately allows outcomes such as:

- **AAPL:** structural S/A+ while the current capital/Expected-Return tier can be lower because valuation and incremental AI monetization are separate questions.
- **GWW:** structural A+ while current Expected Return can be capped by valuation.
- **DELL:** strong commercial AI proof without automatic high structural tier if gross-margin capture remains weaker than revenue growth.
- **ADBE:** strong owner economics with a forward-moat penalty if AI substitution evidence worsens.

These examples are calibration use-cases, not hard-coded ticker overrides.

## Final law

**S/A+/A/B+ answers “how structurally strong and economically proven is this business?” Expected Return answers “what can the shareholder plausibly earn from today's price?” Competition for Capital decides whether the opportunity deserves scarce portfolio capital. ATLAS must never merge those three questions.**
