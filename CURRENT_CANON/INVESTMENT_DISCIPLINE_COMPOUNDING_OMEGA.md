# INVESTMENT DISCIPLINE & COMPOUNDING Ω

**Status:** `ACTIVE_SUBORDINATE_ENGINE_SET`  
**Effective authority reset:** 2026-09-06  
**Master authority:** `docs/canon/ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md`  
**Implementation:** `src/atlas/algorithm/investment-discipline-compounding-omega.ts`

## Authority boundary

This module supplies fundamental diagnostics, evidence gates and anti-ruin checks to the single ATLAS Point-Zero rebuild.

It has **zero independent authority** to protect an incumbent, set a fixed replacement hurdle, impose a benchmark hurdle as a membership gate, set `OPTIMAL_N` or define a parallel final ranking.

Any legacy rule such as **“INCUMBENT WINS THE TIE”**, `+3pp Expected CAGR`, `+5 score points` or a fixed active-vs-index hurdle is **not a clean-selection rule**. Such thresholds may be used only as explicitly downstream execution-friction diagnostics after the blind portfolio has already been selected, and they may never change the Point-Zero winner.

## Fundamental engines retained

- Base-Rate & Survivorship Gate Ω.
- Narrative-to-Numbers Bridge Ω.
- Reinvestment Runway & Incremental ROIC Ω.
- Per-Share Economics Ω.
- Moat Migration Ω.
- Capital Allocation Quality Ω.
- Expected CAGR Driver Bridge Ω as a diagnostic decomposition.
- Valuation Compression Stress Ω.
- Convexity / Ruin Guard Ω.
- Pre-Mortem & Inversion Ω.

## Surviving laws

- Base rate before hero story.
- Survivorship-only evidence is invalid.
- Narrative must bridge to numbers.
- Growth without adequate incremental ROIC is not compounding.
- Enterprise growth is not owner economics.
- Current moat is not automatically future moat.
- Buyback spend is not automatically shareholder accretion.
- Valuation compression must be survivable.
- Permanent-loss and forced-financing risk may veto an attractive headline return.
- Catalyst, product usage and backlog are not substitutes for FCF/owner-economics proof.
- Cyclicals require normalized/mid-cycle economics.

## Clean-selection integration

`Point Zero → T0 → screening → quality/growth → base rate → narrative-to-numbers → reinvestment runway → per-share economics → moat migration → capital allocation → valuation → Expected Return → valuation stress → ruin guard → Falsifiers → comparable duels → Competition for Capital → whole-portfolio marginal utility → fully endogenous OPTIMAL_N`

Current holding status, personal P/L, average cost, position size and prior portfolio decisions are not inputs to this sequence.

## Execution-only legacy functions

Anti-churn / replacement-hurdle functions in the implementation are classified as `EXECUTION_ONLY_LEGACY_COMPATIBILITY`. They may help quantify turnover friction **after** clean selection but cannot be called to decide the Point-Zero membership set.

Active-vs-index functions are `DIAGNOSTIC_ONLY` unless the MASTER UNIVERSE PROMPT is explicitly amended in the future; they do not create a portfolio membership veto today.

## Final rule

**No intentes justificar la cartera que ya tenemos. Intenta derrotarla.**
