# ATLAS Ω — POINT ZERO PIT RUNTIME BINDING

Status: CANONICAL RUNTIME BOUNDARY
Date: 2026-09-07

## Law

Canonical Point Zero selection MUST enter through:

`runtime.agentic_omega.point_zero_rebuild.run_point_zero_rebuild`

with an explicit `AS_OF_TIMESTAMP` and a collection of versioned `SecuritySnapshot` objects.

`RAW_PROVIDER_OBJECT -> SELECTION` is forbidden.

## Required sequence

`PROVIDER -> SECURITY_SNAPSHOT -> PIT VALIDATION -> ASSESSMENT BINDINGS -> FULL_UNIVERSE_COMPETITION -> CLEAN RANKING`

The runtime fails closed when any of the following is true:

- provider output is not a `SecuritySnapshot`;
- snapshot schema version is not supported;
- snapshot timestamp is after `AS_OF_TIMESTAMP`;
- any consumed publication timestamp is after `AS_OF_TIMESTAMP`;
- corporate-action publication is after `AS_OF_TIMESTAMP`;
- confidence is invalid;
- security identity is unresolved;
- a required assessment binding is absent or non-numeric.

## Provider authority

Existing provider/capture scripts may continue to produce research evidence, but their raw dictionaries/JSON rows have ZERO direct canonical selection authority. They must be normalized into `SecuritySnapshot` before selection.

In particular, `scripts/point_zero_sec_e1_capture.py` remains an E1 evidence-capture utility. Its output MUST NOT be fed directly into canonical ranking. Historical use is PIT-safe only after publication timestamps have been bounded by the requested `AS_OF_TIMESTAMP`; if that cannot be proven, classify the evidence `PIT_UNSAFE` / `EVIDENCE_PENDING`.

## Required score bindings for current Python runtime

The current bridge expects timestamped values at:

- `fundamentals.fundamental_quality_score`
- `fundamentals.normalized_economics_score`
- `fundamentals.evidence_completeness_score`
- `estimates.expected_return_score`
- `estimates.regime_compatibility_score`
- `estimates.normalized_expected_cagr_pct`
- `valuation.valuation_confidence_pct`
- `volatility.market_validation_score`
- `volatility.market_data_age_hours`

These bindings are an adapter contract, not new independent engines or new score authority.

## Selection/execution separation

Broker availability, current holding status, personal capital, cost basis, P/L, replacement hysteresis and transaction/tax frictions remain outside clean Point Zero membership. They may be evaluated only after the clean desired portfolio is frozen.

## CI

`architecture-consolidation-ci.yml` must execute `runtime/agentic_omega/test_point_zero_rebuild_pit.py`.

A green CI proves only the runtime boundary and invariants. It does not prove historical PIT completeness, ER calibration, alpha, or global portfolio optimality.
