# Implementation inventory

Core files:
- `types.ts` — provider/model-neutral data contracts.
- `provider-registry.ts` — timestamped provider catalog provenance.
- `scoring.ts` — hard gates and deterministic ranking.
- `circuit-breaker.ts` — failure isolation state machine.
- `router.ts` — primary + fallback planning.
- `execution.ts` — injected transport execution with verification-aware fallback.
- `learning.ts` — verified-outcome telemetry updates.

Tests cover each deterministic layer. Third-party provenance and a reproducible full OmniRoute checkout are under `third_party/omniroute/` and `scripts/sync-omniroute-upstream.sh`.
