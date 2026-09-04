# ATLAS Ω — DIVIDENDOLOGY EXTRACTION Ω v1.0

**Effective:** 2026-09-04  
**Status:** ACTIVE / DIAGNOSTIC / OUT-OF-SAMPLE VALIDATION REQUIRED  
**Authority:** additive research-and-learning module under ATLAS Ω v4.0; it cannot override Falsifier Veto, canonical valuation, Competition for Capital, Replacement Firewall, or Model Learning Governance.

## Mission

Reverse-engineer useful public Dividendology methodology without importing vendor authority, marketing claims, portfolio labels, or dividend-yield bias into ATLAS.

The module asks one question:

> Which signals add incremental information beyond the engines ATLAS already has?

## Canonical non-duplication rule

Most useful Dividendology concepts already exist in ATLAS and therefore **must not be scored twice**:

- ROIC - WACC and reinvestment runway -> `REINVESTMENT_RUNWAY_ROIC_OMEGA_V1`.
- FCF/share and dilution -> `PER_SHARE_ECONOMICS_OMEGA_V1`.
- Capital allocation / buybacks / distributions / M&A -> `CAPITAL_ALLOCATION_QUALITY_OMEGA_V1`.
- Forward moat durability -> `MOAT_MIGRATION_OMEGA_V1`.
- Reverse DCF / implied expectations -> canonical `VALUATION_OMEGA` + Expectations Gap.
- 13F / manager convergence -> `INSTITUTIONAL_CONVERGENCE_OMEGA_V1`.
- Any permanent model change -> `MODEL_LEARNING_GOVERNANCE_OMEGA_V1`.

Therefore `DIVIDENDOLOGY_EXTRACTION_OMEGA_V1` has **0 direct ATLAS score weight** until broad, repeated, economically material out-of-sample evidence justifies migration of a genuinely new signal.

## Compounder Efficiency Ω — research synthesis

A diagnostic 0-100 synthesis is permitted for comparison and research only:

`DRE Ω = 20% Reinvestment Runway/ROIC + 20% FCF Quality + 15% Forward Growth + 25% Expectation Gap + 15% Capital Allocation + 5% Moat Confirmation`

These are **research weights**, not canonical scoring weights.

Classification:

- `ELITE` >= 85
- `STRONG` >= 75
- `MIXED` >= 60
- `WEAK` < 60
- `EVIDENCE_PENDING` when the evidence bundle is incomplete or untraceable.

The output is a cross-engine diagnostic only. It cannot add the same economic fact to the final ATLAS score a second time.

## Unique candidate signal: Sustainable Distribution Delta Ω

The currently identified incremental signal is:

`SDD Ω = 5Y FCF CAGR - 5Y Dividend CAGR`

Interpretation:

- Positive SDD -> distribution growth is being funded by at least equally strong FCF growth.
- Near-zero SDD -> broadly matched growth.
- Persistently negative SDD -> dividend growth is consuming future headroom.
- Very negative SDD combined with >100% FCF payout and weak balance-sheet coverage -> sustainability warning.

SDD never becomes an automatic SELL and does not convert a dividend cut into a structural falsifier without causal analysis.

## Dividend Sustainability Overlay Ω

Applicable only when the company pays a dividend.

Inputs:

- 5Y FCF CAGR.
- 5Y dividend CAGR.
- FCF payout ratio.
- Net debt / EBITDA and/or interest coverage.
- Dividend cut history as a contextual penalty requiring causal review.

Diagnostic weighting:

- FCF payout / coverage: 45%.
- Sustainable Distribution Delta: 35%.
- Balance-sheet coverage: 20%.

States:

`RESILIENT / SUSTAINABLE / STRETCHED / UNSUSTAINABLE / EVIDENCE_PENDING / NOT_APPLICABLE`.

### Absolute laws

1. **Dividend yield earns 0 points.**
2. **No dividend earns 0 penalty.**
3. Dividend Aristocrat / Dividend King labels earn 0 points.
4. A high yield can be a distress symptom and is never interpreted as quality by itself.
5. Dividend sustainability is a capital-allocation/risk diagnostic, not a separate investment objective.
6. A non-dividend compounder remains fully eligible for ATLAS.

## Out-of-sample migration gate

A signal extracted from Dividendology can become canonical scoring logic only if all conditions hold:

1. Ex-ante timestamped dataset exists.
2. Winners and failures are both included.
3. Survivorship bias is controlled.
4. The signal adds information beyond existing ATLAS engines.
5. Out-of-sample performance is repeated across a sufficiently broad cohort.
6. Improvement is economically material after turnover, drawdown and risk.
7. Model Learning Governance approves a versioned migration.

If a signal is redundant, it remains **documentation only** and never gets a second weight.

## Implementation

- `src/atlas/algorithm/dividendology-extraction-omega.ts`
- `src/atlas/algorithm/dividendology-extraction-omega.test.ts`
- `src/atlas/algorithm/atlas-primary-engine-hierarchy.ts`

## Decision authority

`DIVIDENDOLOGY_EXTRACTION_OMEGA_V1` cannot by itself:

- create BUY / SELL;
- change portfolio weight;
- override a confirmed falsifier;
- replace canonical valuation;
- infer real-time institutional flow from 13F;
- bypass Competition for Capital or Replacement Firewall;
- convert a dividend yield into expected return.

Its direct ATLAS score delta is always `0` in v1.0.
