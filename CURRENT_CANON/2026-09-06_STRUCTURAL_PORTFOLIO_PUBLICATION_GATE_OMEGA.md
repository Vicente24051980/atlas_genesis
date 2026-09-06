# ATLAS Ω — STRUCTURAL PORTFOLIO PUBLICATION GATE

Date: 2026-09-06
Status: ACTIVE_CANONICAL
Purpose: prevent narrative/incumbency contamination, caller-defined universe manipulation, and experimental equal-weight baskets from being published as the structural MAX RETURN / LOW VOL portfolio.

## Failure discovered

Repeated same-day answers produced incompatible 25/29/31-name portfolios, and an out-of-universe security was admitted despite a newly frozen universe. This proves that a valid company list is not enough: publication needs a mechanical provenance and determinism gate.

A second implementation defect was confirmed: Endogenous Portfolio Engine v2.2 evaluates candidate sets with neutral equal test weights and explicitly emits no target weights. Therefore selection output alone MUST NOT be described as a fully optimized structural MAX RETURN / LOW VOL portfolio.

A third defect was then found in the first publication-gate implementation: `allowedTickers` and `expectedCanonicalEntityCount` were caller-supplied. A caller could therefore shrink or redefine the universe and still receive a formally valid result. v1.1 closes this loophole.

## Required pipeline

`VERSIONED UNIVERSE AUTHORITY -> COMPLETE PIT ENTITY MATRIX -> HARD GATES / FALSIFIER VETO -> DETERMINISTIC SELECTION -> MARGINAL LEDGER -> COVARIANCE-AWARE SIZING -> PUBLICATION GATE`

## Universe authority lock

The sole canonical publication API resolves whitelist, entity count, source and normalized-universe hash internally from:

`src/atlas/algorithm/structural-universe-authority-omega.ts`

The caller may provide `universeVersion`, PIT snapshot, policy hash, candidates and sizing evidence. The caller may **not** provide or override the canonical whitelist, expected entity count, source, or normalized-universe hash.

Current authorities:

- `ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06` — 487 canonical economic entities.
- `ATLAS_CORE_487_PLUS_VRT_ADMITTED_488_2026-09-06` — same 487 plus explicitly admitted external challenger VRT.

VRT admission is recorded in `CURRENT_CANON/2026-09-06_VRT_ADMITTED_EXTERNAL_CHALLENGER.md`. Admission does not rewrite the historical 650 raw rows and does not grant incumbency authority.

The low-level function `runStructuralPortfolioPublicationGateUnsafe` exists only for internal deterministic mechanics/tests. Caller-supplied universes through that primitive have zero canonical publication authority.

## Mandatory publication invariants

1. Every candidate ticker must belong to the selected versioned universe authority before the selector runs.
2. Every expected canonical economic entity must have one complete PIT evidence row; incomplete-universe runs fail closed.
3. Duplicate share classes mapped to one canonical entity must carry identical normalized evidence or the run fails closed.
4. Caller input order has zero authority. The publication gate canonicalizes entity/ticker ordering before every run.
5. Default reproducibility certification is 100 reruns. Same evidence must produce identical selected tickers and N.
6. Any different composition/N hash returns `FAIL_NON_DETERMINISTIC_PORTFOLIO_SELECTION`.
7. The run persists a full marginal ledger with `DeltaU_add` and best `DeltaU_swap` for every eligible canonical entity.
8. Structural publication requires explicit covariance-aware sizing evidence, a portfolio-volatility-model hash and weights summing to one over exactly the selected names.
9. Until such sizing exists, the state is `BLOCKED_SIZING_NOT_IMPLEMENTED`; a selection may be inspected but cannot be called the canonical structural portfolio.
10. `globalOptimalityProven=false` remains mandatory while the search is deterministic local search rather than a proof of combinatorial global optimum.
11. Current-holding status, portfolio history and the user's invested capital remain zero-authority inputs during Point Zero.
12. `ADMITTED_EXTERNAL_CHALLENGER != SELECTED`. Admission only makes a security eligible to compete under the same evidence and risk rules.

## Four-session firewall

`EXPERIMENT_4D_EQUAL_WEIGHT` is a separate API and always emits authority `EXPERIMENT_ONLY`.

It cannot overwrite, certify or masquerade as the structural portfolio. Equal weighting is legitimate for a short selection experiment but is not structural position sizing.

## Canonical universe

Raw source: `data/t0-universe-user-seed-2026-09-05.txt`.
Core entities: `data/atlas-core-universe-economic-entities-2026-09-06.txt`.
Manifest: `CURRENT_CANON/2026-09-06_ATLAS_CANONICAL_UNIVERSE.md`.
Authority registry: `src/atlas/algorithm/structural-universe-authority-omega.ts`.

External challengers remain possible only through an explicit, versioned admission record. They cannot silently enter a frozen run.

## Code

- `src/atlas/algorithm/structural-universe-authority-omega.ts`
- `src/atlas/algorithm/structural-portfolio-publication-gate-omega.ts`
- `src/atlas/algorithm/structural-portfolio-publication-gate-omega.test.ts`
- `.github/workflows/endogenous-portfolio-engine-v2-ci.yml`

CI verification after the authority-lock tests: GitHub Actions run `34061344589` — SUCCESS.

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
