# ATLAS Ω — PORTFOLIO DETERMINISM & RECONCILIATION Ω v1.0

**Date:** 2026-09-06  
**Status:** CANONICAL  
**Scope:** ATLAS MAIN portfolio construction / MAX RETURN · LOW VOL

## Problem this canon resolves

ATLAS produced three incompatible candidate portfolios from materially the same state: a 25-name candidate, a 29-name candidate, and a 31-name four-session test basket. The 31-name basket was not a superset of the 29-name portfolio: several names disappeared while older names re-entered. This proves that the implementation still allowed narrative discretion and objective drift.

These outputs are therefore **not** accepted as separate versions of the optimal portfolio. They are superseded as portfolio claims and are retained only as reconciliation inputs.

## Canonical objective

`PORTFOLIO > TICKER`

ATLAS optimizes portfolio utility under the explicit objective:

`MAX RETURN / LOW VOL`

No independent authority is granted to sector balance, geographic balance, aesthetic diversification, number of drivers, or portfolio neatness.

Risk decomposition:

`RISK = 0.40 * PERMANENT_LOSS + 0.20 * TAIL_RISK + 0.40 * VOLATILITY`

A replacement or addition is valid only if it improves portfolio-level utility after risk.

## Critical separation: PORTFOLIO vs TEST

### PORTFOLIO mode
Purpose: maximize the canonical return/risk objective.

- `N` is endogenous.
- weights are optimized, not forced equal.
- output is intended for capital allocation.
- the same snapshot and implementation must reproduce the same tickers and weights.

### TEST mode
Purpose: isolate stock-selection behavior experimentally.

- equal weighting may be used by design.
- fixed `N` may be imposed by the experiment.
- output is not an optimized portfolio.
- results cannot be promoted to strategic portfolio authority without rerunning PORTFOLIO mode.

`TEST_OUTPUT != PORTFOLIO_OUTPUT`

## OBJECTIVE LOCK Ω — mandatory precondition

Before any portfolio generation, ATLAS must freeze and emit:

- `SNAPSHOT_ID`
- `AS_OF_TIMESTAMP`
- `CANON_VERSION`
- `MODE = PORTFOLIO | TEST`
- `HORIZON`
- `OBJECTIVE_FUNCTION`
- `RISK_FUNCTION`
- `UNIVERSE_ID`
- `ELIGIBILITY_RULES`
- `SIZING_RULE`
- `N_RULE`
- `SEARCH_ALGORITHM_VERSION`
- `TIE_BREAK_RULE`
- `RANDOM_SEED`, if any stochastic component exists

If any of these fields changes, a different output is allowed. If none changes, a different output is a **determinism failure**.

## Reconciliation universe

The first reconciliation run must use the **union of all tickers appearing in the 25, 29, and 31 outputs**. No ticker is privileged because it appeared in more than one candidate. No ticker is excluded because it appeared only once.

The exact same point-in-time inputs must be used for every ticker.

Pipeline:

`UNION_UNIVERSE`
→ `ELIGIBILITY`
→ `EXPECTED_RETURN`
→ `RISK`
→ `FRAGILITY`
→ `SCENARIOS`
→ `PORTFOLIO_MARGINAL_CONTRIBUTION`
→ `ENDOGENOUS_N`
→ `SIZING`

## Marginal utility law

For an addition:

`ΔU_add(j) = U(P ∪ {j}) - U(P)`

For a replacement:

`ΔU_swap(i→j) = U(P - {i} + {j}) - U(P)`

For a deletion:

`ΔU_remove(i) = U(P - {i}) - U(P)`

The selector must expose these marginal values for every boundary decision.

A ticker enters only when its best feasible addition or replacement improves portfolio utility above the predeclared hurdle.

## Endogenous N

`N` is not chosen for aesthetics, round numbers, legacy lists, or minimum diversification.

Construction continues while the next feasible addition produces material positive utility:

`ΔU_next > MIN_MATERIAL_UTILITY_GAIN`

Stop when:

`ΔU_next <= MIN_MATERIAL_UTILITY_GAIN`

The threshold must be fixed before seeing the reconciliation result.

## Deterministic local search limitation

Current implementation may use deterministic local search. Therefore:

`globalOptimalityProven = false`

No output may be called “globally optimal” unless a certified global solver or an exhaustive/branch-and-bound proof establishes it.

Allowed label:

`ATLAS Ω MAX RETURN / LOW VOL — DETERMINISTIC LOCAL OPTIMUM CANDIDATE`

until stronger proof exists.

## Required stability tests

A portfolio candidate cannot be promoted to canonical execution unless it passes:

1. **Re-run determinism:** identical snapshot → identical tickers and weights.
2. **Ordering invariance:** input ticker order does not change the result.
3. **Initialization robustness:** multiple deterministic starting portfolios converge to the same solution or disclose multiple local optima.
4. **Boundary audit:** every in/out ticker near the cutoff has explicit `ΔU` and swap comparisons.
5. **Weight perturbation test:** small numerical perturbations do not cause large composition jumps without a corresponding utility discontinuity.
6. **Objective integrity:** no hidden diversification/sector/geography preference enters outside the canonical risk/utility function.
7. **Mode firewall:** TEST settings cannot leak into PORTFOLIO mode.

## Tie-break law

If two feasible candidates have utility differences below numerical tolerance:

1. incumbent wins if already owned;
2. lower estimated permanent-loss risk wins;
3. lower tail risk wins;
4. lower expected transaction/friction cost wins;
5. stable lexical ticker order is the final deterministic tie-break.

No narrative tie-break is permitted.

## Output contract

Every canonical portfolio run must output:

- objective lock header;
- final `N`;
- tickers and weights;
- portfolio expected return estimate;
- permanent-loss estimate;
- tail-risk estimate;
- volatility estimate;
- resulting utility;
- marginal ranking of all included names;
- marginal ranking of at least the first excluded frontier;
- all `ΔU_add` and `ΔU_swap` values around the boundary;
- `globalOptimalityProven` boolean;
- algorithm/version/hash or run identifier sufficient to reproduce the result.

## Status of prior candidate portfolios

- 25-name candidate: `RECONCILIATION_INPUT_ONLY`
- 29-name candidate: `RECONCILIATION_INPUT_ONLY`
- 31-name equal-weight test basket: `TEST_ONLY`

None may be called the canonical optimal ATLAS portfolio until rerun through this reconciled deterministic procedure.

## Governing law

**Same snapshot + same canon + same mode + same universe + same algorithm = same portfolio.**

If not, ATLAS has a reproducibility bug and must fail closed rather than emit another narrative portfolio.
