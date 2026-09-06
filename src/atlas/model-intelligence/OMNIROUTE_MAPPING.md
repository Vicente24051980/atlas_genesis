# OmniRoute → ATLAS mapping

| Upstream concern | ATLAS implementation | Boundary |
|---|---|---|
| Provider/model catalog | `provider-registry.ts` | Timestamped observation; never canonical by presence alone |
| Smart/quality/latency routing | `scoring.ts` | ATLAS-owned explicit weights + hard gates |
| Fallback policy | `router.ts` + `execution.ts` | Fallback only among pre-approved feasible routes |
| Circuit breaker / cooldown | `circuit-breaker.ts` | Route-specific deterministic state |
| Free-tier/quota awareness | `types.ts` + `scoring.ts` | Mutable runtime evidence |
| Router evaluation | `learning.ts` + tests | Learns only from verified ATLAS outcomes |
| OpenAI-compatible/direct/local providers | `ModelExecutionAdapter` | Transport is injected; provider packages stay outside kernel |
| MCP/A2A | future adapter layer | Must pass ATLAS permission and provenance gates |
| Semantic cache | future execution optimization | Must not become canonical memory implicitly |
| OmniRoute memory | not adopted as ATLAS memory | Execution-side context only |
| Desktop/PWA/web UI | not vendored | Separate product surface, not cognitive kernel |
| Credentials/auth | not imported | Secrets stay outside model-intelligence data structures |

The full pinned upstream repository can be materialized with `scripts/sync-omniroute-upstream.sh` for source-level comparison without committing the vendor tree into ATLAS.
