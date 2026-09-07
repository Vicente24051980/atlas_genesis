# ASTRA Ω — Phase B Authority Registry + Factor Ownership Ledger · Preregistration

**Date:** 2026-09-07  
**Status:** PREREGISTERED / NON-CANONICAL UNTIL MERGED AND TESTED  
**Branch:** `astra-phase-b-authority-factor-ledger-v1`

## Purpose

Address two live findings from the frozen ASTRA baseline without creating a second source of truth:

1. runtime/selection/score/canon authority is not sufficiently explicit at one inspectable boundary;
2. shared economic facts can be consumed by multiple engines without a formal single-owner anti-double-counting firewall.

## Authority Registry design

The new Authority Registry is a **derived projection** of `ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA`, not a parallel authority source. It exposes, per component:

- STATUS
- COMPONENT_CLASS
- RUNTIME_AUTHORITY
- SELECTION_AUTHORITY
- DIRECT_SCORE_WEIGHT
- ACTIVATION_GATE
- OWNER
- CAN_WRITE_CANON

Unknown fields remain `UNKNOWN_NOT_DECLARED`. They are never silently converted to `0`, `false`, or `ACTIVE`.

Hard invariants:

- exactly one `SOLE_MASTER` selection authority;
- automated components cannot write canon;
- Research Ω has zero direct score and no selection authority;
- declared zero-weight corroborative/shadow intelligence remains zero-weight;
- undeclared activation and score fields stay explicitly unknown.

## Factor Ownership Ledger design

Initial high-risk factor families:

- VALUATION
- FREE_CASH_FLOW
- ROIC
- BACKLOG
- CAPEX
- EXPECTATION_GAP
- ORGANIC_GROWTH

Each factor receives one canonical normalizer and an explicit scoring-owner state. Secondary consumers may reference normalized evidence but may not mint independent points from the same fact.

Fail-closed rule:

`SCORING_OWNER = UNRESOLVED_RUNTIME_MAPPING -> ADD_POINTS = DENY`

Raw backlog is explicitly `NONE_RAW_FACTOR`: backlog/RPO/contracts/orders/shipments are evidence states and cannot directly create score.

External valuation cross-check remains diagnostic-only for factor scoring.

## Validation gates

Before merge:

1. Authority Registry tests PASS.
2. Factor Ownership tests PASS.
3. CI proves exactly one sole master selection authority.
4. CI proves automated canon-write authority = false.
5. CI proves unknown score/activation fields are preserved as unknown.
6. CI proves secondary consumers cannot add independent points.
7. No claim that runtime double counting is fully eliminated until live scorers are mapped to the ledger.

## Explicit non-claims

This PR does **not** claim:

- all runtime score owners are already known;
- all legacy engines are removed;
- Factor Ownership is wired into every live scorer;
- PR #160 Continuity live Notion gate has passed;
- OpenClaw is production-authorized.

Those remain separate gates.
