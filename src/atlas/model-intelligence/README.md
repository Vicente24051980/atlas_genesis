# ATLAS Model Intelligence Ω

Provider-agnostic execution routing for ATLAS.

## Contract

`TASK → HARD GATES → SCORE → ROUTE → FALLBACK → VERIFY → LEARN`

This layer decides **where a model request may be executed**. It does not own ATLAS memory, canonical evidence, investment authority, personal policy, or truth promotion.

### Hard gates precede score

Requirements such as tool support, vision, minimum context, local-only, free-only, latency ceiling, provider/model exclusions, and circuit health are filters. A high quality score can never override them.

### Scoring is evidence-driven

Eligible routes are ranked from task quality, general quality, reliability, latency, cost/free-tier status, quota headroom, and observed hallucination rate. Tie-breaking is deterministic by `providerId/modelId`.

### Failure isolation

Circuit state is provider/model specific. Repeated failures open only that route. After cooldown it becomes half-open for a probe; success closes it again.

### Epistemic boundary

A successful model response is an **observation**, not canonical evidence. Promotion to ATLAS memory or a decision-bearing layer remains downstream of provenance and verification gates.

## OmniRoute relationship

OmniRoute is an upstream reference and optional execution backend. ATLAS owns this interface and can route through OmniRoute, OpenRouter, direct provider APIs, local Ollama, or future backends without changing the cognitive kernel.

See `third_party/omniroute/UPSTREAM.md` and `docs/2026-09-06_ATLAS_MODEL_INTELLIGENCE_OMEGA_OMNIROUTE.md`.
