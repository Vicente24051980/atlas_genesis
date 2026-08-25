# INVESTMENT DISCIPLINE & COMPOUNDING Ω

**Status:** ACTIVE CANON  
**Effective date:** 2026-08-24  
**Version:** 1.0.0  
**Implementation:** `src/atlas/algorithm/investment-discipline-compounding-omega.ts`  
**Tests:** `src/atlas/algorithm/investment-discipline-compounding-omega.test.ts`

## Purpose
Convert the robust ideas from Graham, Fisher, Lynch, Damodaran, Munger, Bogle, Malkiel, Housel, Kahneman and Taleb into executable ATLAS Ω gates without turning book narratives into authority.

This module does not create BUY/SELL decisions by itself. It improves selection, expected-return diagnostics, replacement discipline and anti-ruin controls.

## Canonical laws

1. **BASE RATE BEFORE HERO STORY.** A famous winner is never a valid cohort.
2. **SURVIVORSHIP EVIDENCE WITHOUT FAILURES IS PROCESS-INVALID.** Comparable failures must be represented.
3. **NARRATIVE MUST BRIDGE TO NUMBERS.** Required chain: `TAM → CUSTOMERS → VOLUME/PRICE → REVENUE → MARGIN → OCF → FCF → ROIC → PER SHARE`.
4. **GROWTH WITHOUT INCREMENTAL ROIC > WACC IS NOT COMPOUNDING.**
5. **ENTERPRISE GROWTH ≠ OWNER ECONOMICS.** FCF/share, EPS/share and net share count are mandatory where applicable.
6. **CURRENT MOAT ≠ FUTURE MOAT.** Moat Migration Ω audits whether durability is moving toward or away from data, workflow, regulation/certification, network effects and scale.
7. **BUYBACK HEADLINE ≠ SHAREHOLDER ACCRETION.** Net diluted share count decides whether repurchases create owner accretion.
8. **VALUATION COMPRESSION MUST BE SURVIVABLE.** A great business that requires permanent multiple expansion is not automatically a great stock from P0.
9. **AVOIDING RUIN > MAXIMIZING A SMALL EXTRA CAGR.** Permanent-loss, refinancing and forced-equity risk can veto an apparently attractive return.
10. **ACTIVE STOCK SELECTION MUST CLEAR AN INDEX HURDLE.** An active position must offer a meaningful advantage over the relevant passive alternative.
11. **INCUMBENT WINS THE TIE.** Absent a confirmed structural falsifier, replacement normally requires either at least **+3 percentage points of net Expected CAGR** after rotation friction or at least **+5 ATLAS score points** with comparable evidence.
12. **CATALYST ≠ THESIS. PRODUCT/USAGE/BACKLOG ≠ FCF.**
13. **CYCLICALS REQUIRE MID-CYCLE ECONOMICS.** Peak earnings may not be annualized as normalized owner economics.
14. **PRE-MORTEM + INVERSION ARE MANDATORY BEFORE HIGH-CONVICTION REPLACEMENT.**

## Engines / gates

### Base-Rate & Survivorship Gate Ω
Inputs: comparable cohort, documented winners and failures, evidence traceability, survivor-only flag.

Fail conditions include survivor-only evidence. Cohorts below 10 are cautionary rather than robust priors.

### Narrative-to-Numbers Bridge Ω
The first broken stage caps the chain. Evidence after a missing upstream stage cannot be promoted as if the chain were continuous.

`FCF` is the minimum Economic Proof destination in this bridge; `ROIC + PER SHARE` completes owner-economics proof.

### Reinvestment Runway & ROIC Ω
Measures:

`ROIC spread = incremental ROIC - WACC`

High-quality compounding requires both a positive spread and a credible runway for reinvestment. Historic ROIC without future reinvestment capacity is not enough.

### Per-Share Economics Ω
Mandatory checks where data exist:

`Revenue growth → FCF growth → FCF/share growth → EPS/share growth → diluted share count`.

If enterprise FCF grows faster than FCF/share because dilution absorbs the difference, ATLAS records ownership leakage.

### Moat Migration Ω
A moat is dynamic. AI, platform shifts, distribution changes, regulation and customer workflow can move the source of durability.

A company may retain a strong current moat while simultaneously entering `WEAKENING` if forward durability deteriorates.

### Capital Allocation Quality Ω
Capital allocation is evaluated through incremental ROIC, dilution, distributions, acquisitions and leverage. Buybacks only count positively when they reduce net diluted ownership and do not destroy higher-return reinvestment opportunities.

### Expected CAGR Driver Bridge Ω
Diagnostic only:

`Expected CAGR ≈ normalized FCF growth + shareholder yield ± annualized multiple change - dilution - fragility penalty`

This is a **driver decomposition / sanity check**, not a replacement for canonical Bear/Base/Bull terminal-value scenario calculation in `RETURN_OBJECTIVE_SEPARATION_OMEGA.md`.

If scenario Expected CAGR and driver decomposition diverge materially, the divergence must be investigated rather than averaged away.

### Valuation Compression Stress Ω
ATLAS must test whether the expected return remains acceptable if the terminal valuation multiple contracts.

A successful business that produces a poor return under realistic multiple normalization is marked as expectation-dense.

### Convexity / Ruin Guard Ω
Checks leverage, interest coverage, near-term refinancing, forced-equity risk, permanent-loss risk and binary-event dependency.

A `VETO` from ruin risk cannot be offset by a higher Expected CAGR score.

### Active-vs-Index Hurdle Ω
Default hurdle: candidate Expected CAGR must exceed the relevant benchmark Expected CAGR by at least **2 percentage points**, unless a strategy-specific hurdle is explicitly configured.

This is not an index forecast engine; both candidate and benchmark inputs must satisfy evidence integrity.

### Anti-Churn / Replacement Hurdle Ω
Default rule:

`Net Replacement Advantage = Expected CAGR(challenger) - Expected CAGR(incumbent) - rotation friction`

Absent a structural falsifier in the incumbent, replacement requires either:

- `Net Replacement Advantage >= +3pp`, or
- `ATLAS score advantage >= +5 points`,

and the challenger must also clear Active-vs-Index Ω.

Tax/transaction/financing friction remains governed by `DECISION_DISCIPLINE_TAX_FRICTION_OMEGA.md`; callers may pass verified rotation friction into the replacement gate.

### Pre-Mortem & Inversion Ω
Before high-conviction replacement, list explicit failure modes, probabilities, severities, mitigations and evidence IDs.

The engine does not invent a falsifier from fear. It identifies unmitigated failure paths that require red-team review or veto.

## Canonical placement

The module runs after evidence/identity integrity and GREEN recording, alongside Business Quality/Growth/Economic Throughput and before final Competition for Capital replacement decisions.

Recommended decision chain:

`INTEGRITY → GREEN → BUSINESS QUALITY/GROWTH → BASE RATE → NARRATIVE-TO-NUMBERS → REINVESTMENT RUNWAY → PER-SHARE ECONOMICS → MOAT MIGRATION → CAPITAL ALLOCATION → VALUATION → EXPECTED RETURN → VALUATION COMPRESSION → RUIN GUARD → ACTIVE-vs-INDEX → COMPETITION FOR CAPITAL → ANTI-CHURN REPLACEMENT → PRE-MORTEM → RECOMMENDATION AUDIT → LIVE VALIDATION → MODEL LEARNING → FINAL RANK`

## Anti-contamination

- `BUSINESS QUALITY ≠ EXPECTED RETURN`.
- `CATALYST ≠ THESIS`.
- `BACKLOG ≠ FCF`.
- `REVENUE GROWTH ≠ FCF/SHARE GROWTH`.
- `ROIC HISTORY ≠ REINVESTMENT RUNWAY`.
- `CURRENT MOAT ≠ FUTURE MOAT`.
- `BUYBACK SPEND ≠ NET SHARE REDUCTION`.
- `LOW P/E ≠ MARGIN OF SAFETY`.
- `HIGH CAGR ESTIMATE ≠ ACCEPTABLE RUIN RISK`.
- `CHALLENGER +1PP ≠ JUSTIFIED ROTATION`.
- `INDEX HURDLE FAIL ≠ BAD COMPANY`; it means active capital lacks sufficient demonstrated advantage.
- `PRE-MORTEM ≠ FALSIFIER`; only evidence can confirm a structural falsifier.

## Governance

Any threshold change must pass Model Learning & Governance Ω. One winning stock, one failed stock, one book, one video or one market regime cannot recalibrate the module.

The default +3pp Expected CAGR / +5 score replacement hurdle and +2pp Active-vs-Index hurdle remain configurable implementation defaults, not immutable laws of nature. Changes require documented out-of-sample evidence and a versioned Model Change Record.
