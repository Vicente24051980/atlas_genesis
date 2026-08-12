# REALIZABLE ALPHA Ω

**Status:** Canonical independent validation engine  
**Version:** v1  
**Effective date:** 2026-08-12

## Purpose

REALIZABLE ALPHA Ω prevents ATLAS from treating a spectacular historical return, backtest, alternative-asset statistic, manager track record, or external strategy claim as actionable alpha before correcting for bias, costs, liquidity and validation quality.

It formalizes the sequence:

**REPORTED RETURN → BENCHMARK CONSISTENCY → BIAS ADJUSTMENT → IMPLEMENTATION COSTS → REALIZABLE ALPHA → OUT-OF-SAMPLE/LIVE VALIDATION**

The core question is not “did it work historically?” but:

> Could the opportunity have been identified ex ante, executed at the time, and retained after all relevant costs versus a comparable benchmark?

## Inputs

All returns must use the same annualization and the same nominal/real basis.

### Reported performance
- Reported/claimed annualized return.
- Comparable benchmark annualized return.

### Bias haircuts
- Survivorship bias.
- Selection bias.
- Look-ahead bias.
- Publication bias.
- Model overfit/data mining.
- Other documented bias adjustments.

### Implementation frictions
- Management fees.
- Transaction costs.
- Storage/insurance.
- Slippage.
- Illiquidity/capacity.
- Taxes/other recurring costs when relevant.

### Validation quality
- Evidence quality 0–100.
- Out-of-sample validation yes/no.
- Years of live validation.

## Calculations

`Reported Alpha = Reported Return − Benchmark Return`

`Bias-Adjusted Return = Reported Return − Sum(Bias Haircuts)`

`Net Realizable Return = Bias-Adjusted Return − Sum(Implementation Frictions)`

`Realizable Alpha = Net Realizable Return − Benchmark Return`

When reported alpha is positive:

`Alpha Capture Ratio = Realizable Alpha / Reported Alpha`

A negative capture ratio is allowed and explicitly reveals that apparent historical alpha reverses after corrections.

## States

- **ALPHA_TRAP** — reported alpha is positive but realizable alpha is zero or negative.
- **UNPROVEN** — apparent alpha survives arithmetic but evidence/out-of-sample validation is insufficient.
- **NO_REALIZABLE_ALPHA** — no positive benchmark-relative return remains.
- **MARGINAL_ALPHA** — positive realizable alpha below 2 percentage points/year.
- **POSITIVE_ALPHA** — 2–5 percentage points/year after corrections.
- **STRONG_ALPHA** — at least 5 percentage points/year after corrections.

Validation states are tracked separately: LOW_EVIDENCE, NO_OUT_OF_SAMPLE_VALIDATION, EARLY_VALIDATION, PARTIALLY_VALIDATED, VALIDATED.

## Integration with ATLAS Ω

REALIZABLE ALPHA Ω is **not** part of the fixed ATLAS Quality Ω /100 weights and does not overwrite GREEN CONTINUITY Ω.

Canonical investment decision flow remains:

**QUALITY Ω → IMPLIED RETURN Ω → GREEN CONTINUITY Ω → ENTRY TIMING Ω → specialized validators**

REALIZABLE ALPHA Ω is invoked when the thesis relies materially on:
- historical anomalies;
- quantitative/backtested strategies;
- external manager or newsletter track records;
- alternative assets/collectibles;
- private-market or illiquid-return claims;
- any claim where survivorship/selection/cost distortion can materially alter the conclusion.

For ordinary listed-company fundamental analysis it remains dormant unless such a performance claim is being used as evidence.

## Guardrails

1. Never mix nominal and real returns.
2. Never compare mismatched periods or incompatible benchmarks.
3. Missing bias/cost inputs are not silently assumed to be zero if evidence suggests they are material; the analysis must flag the omission.
4. A high backtest with no out-of-sample validation is UNPROVEN, not BUY.
5. Positive realizable alpha is eligibility for further ATLAS diligence, never a standalone purchase instruction.
6. ALPHA_TRAP is a falsifier of the performance claim, not automatically of the underlying asset/business.
7. The engine must preserve evidence fields so every haircut can be audited.

## Example lesson

A collectible category can appear to have an exceptional historical CAGR when the dataset contains mainly surviving/winning assets. If a broader bias-adjusted sample collapses that return, and platform/storage/transaction costs consume the remainder, the correct ATLAS conclusion is **ALPHA_TRAP**, even if a small subset of individual collectibles later becomes highly valuable.

The manager may still possess selection alpha, but that becomes a separate empirical claim requiring prospective, out-of-sample and live validation.

## API

- `POST /v1/atlas/realizable-alpha`
- `GET /v1/atlas/realizable-alpha/examples`
- `GET /v1/atlas/realizable-alpha/methodology`

Implementation: `api/realizable_alpha.py`
