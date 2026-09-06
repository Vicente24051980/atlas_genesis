# ATLAS Ω — DETERMINISTIC PORTFOLIO RECONCILIATION GATE

Date: 2026-09-06
Status: CANONICAL GATE

## Problem detected
The same ATLAS state produced three materially incompatible portfolio candidates (25, 29, 31). This is a determinism/governance failure, not acceptable portfolio uncertainty.

All three candidates lose canonical portfolio authority until reconciled under one frozen snapshot and one objective function.

## Canonical objective
MAX RETURN / LOW VOL at portfolio level.

- PORTFOLIO > TICKER.
- Diversification, sector balance, geography and visual portfolio symmetry have zero independent utility.
- Risk decomposition: 40% permanent-loss risk + 20% tail risk + 40% volatility.
- Replacement/addition is authorized only when it improves portfolio utility after costs/constraints.
- N is endogenous, subject only to an explicit user constraint when supplied.

## TEST / PORTFOLIO firewall
TEST and PORTFOLIO are different artifacts.

TEST:
- may be equal-weighted to isolate stock-selection performance;
- does not define optimal production sizing;
- cannot overwrite the production portfolio.

PORTFOLIO:
- uses endogenous N and optimized sizing;
- optimizes portfolio-level MAX RETURN / LOW VOL;
- cannot be changed merely to increase experimental sample size.

## Reconciliation universe
Use the UNION of every ticker appearing in the conflicting 25-, 29- and 31-name candidates. No ticker gets incumbent privilege.

Every ticker must use the same as-of timestamp, source policy, transformations, scenario set, return model and risk model.

## Deterministic pipeline
Universe -> eligibility -> expected return -> risk -> fragility -> scenarios -> portfolio marginal contribution -> endogenous N -> sizing.

For additions:
ΔU(j | P) = U(P + j) - U(P)

For replacements:
ΔU(i -> j | P) = U(P - i + j) - U(P)

Marginal contributions must be recorded for the complete reconciliation universe.

## Stopping rule
Starting from the best feasible seed, add/replace deterministically until no admissible move improves U by the preregistered materiality threshold. The threshold, tie-breaker and numerical tolerance must be fixed BEFORE optimization.

If the user imposes portfolio-size bounds (e.g. 25 <= N <= 35), optimize within those bounds; do not choose N narratively.

## Tie-break law
For utility ties within numerical tolerance:
1. lower permanent-loss risk;
2. lower tail risk;
3. lower volatility;
4. higher expected return;
5. lexicographic ticker order only as final deterministic machine tie-break.

## Required output
A portfolio may be called `ATLAS Ω MAX RETURN / LOW VOL` only if it ships with:
- frozen snapshot ID / as-of timestamp;
- full reconciliation universe;
- complete marginal ranking;
- final N and stopping reason;
- final weights summing to 100%;
- objective U before/after every accepted move;
- rejected moves and ΔU;
- hard-gate failures;
- `globalOptimalityProven` flag;
- deterministic rerun hash.

## Global-optimum honesty
Local deterministic search is not proof of the combinatorial global optimum. Unless an exact/global solver proves otherwise:
`globalOptimalityProven = false`.

The correct label is therefore `DETERMINISTIC IMPLEMENTATION RESULT`, not `globally optimal portfolio`.

## Invalidation law
If the same frozen inputs + same code + same configuration produce different tickers, N or weights beyond numerical tolerance:
`DETERMINISM_FAILURE = TRUE`
and portfolio authority is revoked until fixed.

## Current consequence
The prior 25-, 29- and 31-name outputs are archived as conflicting candidates. None is canonical. The next portfolio must be generated from this reconciliation gate and be reproducible.