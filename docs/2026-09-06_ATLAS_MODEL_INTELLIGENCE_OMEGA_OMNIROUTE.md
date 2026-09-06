# ATLAS Model Intelligence Ω — OmniRoute integration decision

**Issue:** #165  
**Status:** IMPLEMENTED ON FEATURE BRANCH / NOT CANONICAL UNTIL REVIEW + MERGE

## Decision

ATLAS will remain model- and provider-agnostic. OmniRoute is treated as an upstream infrastructure reference and an optional execution backend, never as the ATLAS cognitive kernel.

The architectural invariant is:

`ATLAS task → requirements → hard gates → evidence-based model score → route plan → fallback/circuit breaker → execution → verification → learning`

The model/router layer cannot promote its own output to canonical evidence.

## Why

OmniRoute v3.8.49 exposes a broad provider-routing surface and advertises automatic fallback, MCP/A2A, OpenAI-compatible APIs, evaluation tooling, local/provider routing, caching and memory capabilities. Those are useful infrastructure patterns, but ATLAS has stricter requirements around provenance, deterministic policy gates, replaceability, and separation of execution from epistemic authority.

## Upstream pin

`artzy/OmniRoute@45ca8ead4108d36b4f7179cd1606c4cff53d5f5a` (`release/v3.8.49`, MIT).

A full checkout is reproducible with `scripts/sync-omniroute-upstream.sh`; the large upstream tree is deliberately kept out of Git under `.vendor/`.

## Architecture boundary

### ATLAS owns

- task classification and requirements;
- privacy/local-only policy;
- provider/model exclusions;
- model-quality evidence and task-specific telemetry;
- scoring weights and hard gates;
- route health state and ATLAS fallback order;
- provenance, verification, contradiction detection and canonical memory;
- permission to act.

### Execution backends may own

- transport to model APIs;
- provider-specific request translation;
- transient retries below ATLAS policy;
- provider discovery/catalog observations;
- vendor-specific streaming/token mechanics.

## Hard gate doctrine

Quality never overrides a hard requirement. A model is rejected before scoring when it violates any requested constraint: unsupported task, required tools/vision, minimum context, local-only, free-only, latency ceiling, explicit provider/model exclusion, or open circuit.

This is the same class of safety invariant ATLAS uses elsewhere: optimization occurs only inside the feasible set.

## Scoring doctrine

For feasible routes, the MVP ranks on:

- quality;
- reliability;
- task-specific quality;
- latency;
- cost/free-tier status;
- quota headroom;
- observed hallucination penalty.

Weights are explicit. Exact-score ties are deterministic by provider/model key. The default score is not canonical forever; it is a bootstrap policy to be calibrated against ATLAS task outcomes.

## Failure doctrine

Circuit breakers are route-specific. Consecutive failures open a route; after cooldown it becomes half-open; a successful probe closes it. Opening one model/provider never authorizes bypassing privacy or other hard gates.

## ADOPT / ADAPT / REJECT

| OmniRoute capability/pattern | ATLAS decision | Reason |
|---|---|---|
| Multi-provider routing | ADOPT | Avoid provider lock-in |
| Automatic fallback | ADAPT | Must remain within ATLAS hard-policy feasible set |
| Circuit breaker / cooldown | ADOPT | Failure isolation |
| Free-tier/quota awareness | ADAPT | Runtime observation; provider rules can change |
| Routing evaluation | ADOPT | Necessary to learn task-specific model quality |
| OpenAI-compatible/local backends | ADOPT | Stable execution boundary |
| MCP/A2A capability | ADAPT | Useful only behind ATLAS permission/provenance gates |
| OmniRoute memory as ATLAS memory | REJECT | Execution memory cannot become canonical cognition |
| Silent credential/cookie import | REJECT | Secret and privacy boundary |
| Upstream UI/desktop/build bundle in kernel | REJECT | Unnecessary attack/update surface |
| Provider response = verified truth | REJECT | Violates ATLAS epistemic safety |

## Next certification layers

The code in this PR is the deterministic policy core. Live provider connectors should be certified separately with fixture/replay tests and then live smoke tests. Provider catalogs and free-tier limits must remain timestamped observations because they are mutable external facts.

## Canonical status

This document and implementation remain non-canonical until PR review and merge under `AGENTS.md` governance. No portfolio, legal, medical, personal-memory or autonomous-action rule is changed by this work.
