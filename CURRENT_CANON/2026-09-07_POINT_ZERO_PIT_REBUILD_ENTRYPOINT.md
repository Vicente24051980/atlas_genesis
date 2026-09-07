# ATLAS Ω — POINT ZERO PIT REBUILD ENTRYPOINT

Status: CANONICAL EXECUTION BOUNDARY
Date: 2026-09-07

## Law

All canonical clean-selection rebuilds MUST enter through:

`runCanonicalPointZeroRebuildOmega()`

in:

`src/atlas/algorithm/point-zero-rebuild-entrypoint-omega.ts`

Direct production imports of `selectCapitalBlindPortfolioOmega()` are forbidden.

## Required inputs

Every rebuild MUST provide:

- explicit `AS_OF_TIMESTAMP`;
- one or more versioned `SecuritySnapshot` objects;
- provenance and confidence on point-in-time values;
- a deterministic candidate projector that receives only PIT-validated snapshots.

## Fail-closed conditions

The rebuild MUST stop before selection when any consumed input is future-published relative to `AS_OF_TIMESTAMP`, when the snapshot timestamp is in the future, when `lastUpdatedByField` points beyond the as-of boundary, or when required provenance / identity is missing.

`ECONOMIC_PERIOD != PUBLICATION_TIMESTAMP` remains universal. Information is usable only from its publication timestamp.

## Enforcement

`scripts/point_zero_entrypoint_guard.py` fails CI when production code imports the low-level capital-blind selector directly instead of the canonical entrypoint.

`.github/workflows/omega-governance-ci.yml` runs the bypass guard plus PIT boundary tests.

## Scope clarification

This boundary proves temporal/data-contract safety of the inputs that reach clean selection. It does NOT by itself prove empirical alpha, forecast calibration, full provider coverage, or global combinatorial optimality.

Providers that cannot emit a valid `SecuritySnapshot` as-of the requested timestamp are `PIT_UNSAFE` and cannot participate in canonical clean selection until adapted.
