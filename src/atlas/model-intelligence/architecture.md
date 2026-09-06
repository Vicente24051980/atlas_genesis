# Architecture map

## Flow

1. `ProviderRegistrySnapshot` supplies timestamped candidate observations.
2. `RoutingRequirements` defines the feasible set.
3. `rankCandidates` applies hard gates before any score.
4. `buildRoutePlan` removes routes with open circuits and builds primary + fallback order.
5. `executeRoutePlan` invokes an injected transport adapter; transport or verification failure advances to the next already-approved route.
6. `learnTelemetry` updates task-specific evidence from verified outcomes for future routing.

## Invariants

- Provider/model identity is data, never a compile-time dependency.
- Free-tier/quota/provider catalogs are observations with provenance and time.
- No score overrides a hard gate.
- Fallback does not widen the feasible set.
- Execution success does not equal epistemic truth.
- Learning uses verified outcomes and does not mutate prior snapshots.
- Canonical ATLAS memory and action authority remain outside this module.
