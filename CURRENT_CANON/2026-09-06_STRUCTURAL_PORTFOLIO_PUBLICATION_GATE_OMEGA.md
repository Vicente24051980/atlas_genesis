# ATLAS Ω — STRUCTURAL PORTFOLIO PUBLICATION GATE

Date: 2026-09-06
Status: CANONICAL CANDIDATE
Purpose: prevent narrative/incumbency contamination and prevent experimental equal-weight baskets from being published as the structural MAX RETURN / LOW VOL portfolio.

## Failure discovered

Repeated same-day answers produced incompatible 25/29/31-name portfolios, and an out-of-universe security was admitted despite a newly frozen universe. This proves that a valid company list is not enough: publication needs a mechanical provenance and determinism gate.

A second implementation defect was confirmed: Endogenous Portfolio Engine v2.2 evaluates candidate sets with neutral equal test weights and explicitly emits no target weights. Therefore selection output alone MUST NOT be described as a fully optimized structural MAX RETURN / LOW VOL portfolio.

## Required pipeline

`CANONICAL RAW UNIVERSE -> NORMALIZED WHITELIST -> COMPLETE PIT ENTITY MATRIX -> HARD GATES / FALSIFIER VETO -> DETERMINISTIC SELECTION -> MARGINAL LEDGER -> COVARIANCE-AWARE SIZING -> PUBLICATION GATE`

## Mandatory publication invariants

1. Every candidate ticker must belong to the canonical universe whitelist before the selector runs.
2. Every canonical economic entity must have one complete PIT evidence row; incomplete-universe runs fail closed.
3. Duplicate share classes mapped to one canonical entity must carry identical normalized evidence or the run fails closed.
4. Caller input order has zero authority. The publication gate canonicalizes entity/ticker ordering before every run.
5. Default reproducibility certification is 100 reruns. Same evidence must produce identical selected tickers and N.
6. Any different composition/N hash returns `FAIL_NON_DETERMINISTIC_PORTFOLIO_SELECTION`.
7. The run persists a full marginal ledger with `DeltaU_add` and best `DeltaU_swap` for every eligible canonical entity.
8. Structural publication requires explicit covariance-aware sizing evidence, a portfolio-volatility-model hash and weights summing to one over exactly the selected names.
9. Until such sizing exists, the state is `BLOCKED_SIZING_NOT_IMPLEMENTED`; a selection may be inspected but cannot be called the canonical structural portfolio.
10. `globalOptimalityProven=false` remains mandatory while the search is deterministic local search rather than a proof of combinatorial global optimum.

## Four-session firewall

`EXPERIMENT_4D_EQUAL_WEIGHT` is a separate API and always emits authority `EXPERIMENT_ONLY`.

It cannot overwrite, certify or masquerade as the structural portfolio. Equal weighting is legitimate for a short selection experiment but is not structural position sizing.

## Canonical universe

Raw source: `data/t0-universe-user-seed-2026-09-05.txt`.
Manifest: `CURRENT_CANON/2026-09-06_ATLAS_CANONICAL_UNIVERSE.md`.

External challengers remain possible only through the canonical discovery/challenger process. They cannot silently enter a run whose whitelist is frozen to the base universe.

## Code

- `src/atlas/algorithm/structural-portfolio-publication-gate-omega.ts`
- `src/atlas/algorithm/structural-portfolio-publication-gate-omega.test.ts`
- `.github/workflows/endogenous-portfolio-engine-v2-ci.yml`

## Publication semantics

Allowed terminal publication states include:

- `CANONICAL_READY`
- `BLOCKED_METADATA_MISSING`
- `BLOCKED_UNIVERSE_MISMATCH`
- `BLOCKED_INCOMPLETE_UNIVERSE_EVIDENCE`
- `BLOCKED_CONFLICTING_ENTITY_ROWS`
- `BLOCKED_ENGINE_PENDING`
- `FAIL_NON_DETERMINISTIC_PORTFOLIO_SELECTION`
- `BLOCKED_SIZING_NOT_IMPLEMENTED`
- `BLOCKED_INVALID_SIZING`

The safe outcome is to block. ATLAS must never fill missing evidence, missing weights or an out-of-universe ticker with narrative judgment.
