# Certification ladder

## Level 0 — deterministic kernel

Required now:
- strict TypeScript compile;
- hard-gate tests;
- deterministic tie-breaking;
- circuit-breaker transitions;
- fallback execution;
- provider snapshot provenance;
- verified-outcome learning.

## Level 1 — fixture/replay adapters

For each provider/backend adapter:
- request translation fixtures;
- response/error normalization;
- timeout/rate-limit fixtures;
- streaming fixtures where applicable;
- secret redaction assertions.

## Level 2 — live smoke certification

Timestamped checks against explicitly configured providers. Live availability, quota and free-tier observations never modify canonical policy by themselves.

## Level 3 — comparative routing evaluation

Measure per task class:
- verified quality;
- reliability;
- p50/p95 latency;
- cost;
- quota exhaustion/failure rate;
- hallucination/verification rejection rate.

Only comparative evidence may justify changing default routing weights.
