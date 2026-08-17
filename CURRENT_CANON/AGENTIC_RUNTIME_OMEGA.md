# ATLAS Ω — Agentic Runtime Ω

**Status:** ACTIVE · IMPLEMENTED v1.0
**Effective:** 2026-08-17
**Implementation:** `runtime/agentic_omega/`
**API:** `api/agentic_omega.py`
**Reference architecture studied:** `razzant/ouroboros`

## Purpose

Materialize the Investment Committee Ω as an auditable agentic execution layer while preserving ATLAS constitutional authority. The runtime borrows architectural ideas from Ouroboros — task/result pipelines, durable outcome records, post-task learning, evidence-aware capability gating and specialist/subagent separation — but does not import Ouroboros governance or self-modifying authority.

ATLAS remains the epistemic and investment authority.

## Position in ATLAS

`CONSTITUTION / CURRENT_CANON → CORE-00 integrity + epistemics → Agentic Runtime Ω → specialist results → Falsifiers Ω → execution gate → measurement → learning`

`runtime/core00/` is frozen and MUST NOT be extended by this module. Agentic Runtime Ω lives in a separate package and consumes ATLAS invariants rather than rewriting them.

## Implemented v1.0

### 1. Eight independent specialists

The runtime has explicit identities for:

1. Economic Proof Ω
2. Valuation / Implied Return Ω
3. CAPEX Productivity Ω
4. Moat Ω
5. Institutional Rotation Ω
6. Macro / Regime Ω
7. Falsifiers Ω / Red Team
8. Evidence Director Ω

Results are stored by specialist identity. Duplicate specialist submissions are rejected.

### 2. No-majority-vote invariant

A run cannot progress merely because most specialists agree. If any required specialist is absent the output is `WATCH`, not BUY/HOLD or an inferred positive action.

### 3. Absolute Falsifiers Ω veto

Only Falsifiers Ω can emit `VETO` or set `confirmed_falsifier=true`. A confirmed falsifier produces `REJECT` regardless of every other specialist result.

This is a hard software invariant, not a prompt preference.

### 4. Epistemic assertions

Every assertion is explicitly labeled:

- `FACT`
- `HYPOTHESIS`
- `INTERPRETATION`
- `NOISE`

`FACT` cannot be instantiated without both `source` and `observed_at`. Confidence, freshness and evidence ID are preserved when supplied.

### 5. Outcome receipts

Every finalized run emits an `OutcomeReceipt` containing:

- run ID;
- terminal orchestration state;
- reason;
- missing specialists;
- veto state;
- context hash;
- emission timestamp.

`READY_FOR_EXECUTION_GATE` is deliberately not BUY. Passing research gates only authorizes the separate execution/sizing layer to evaluate an action.

### 6. Append-only execution memory

`AppendOnlyEventLedger` records:

- run start;
- every specialist result;
- final outcome receipt;
- evolution proposals.

Events are JSONL records linked by `previous_hash` and SHA-256 `event_hash`. The ledger verifies its full hash chain when reopened. Mutation of historical events therefore fails verification instead of being silently accepted.

### 7. Null opportunity

`NO_OPPORTUNITY` is a first-class valid terminal state. ATLAS must never manufacture a portfolio change to justify the cost of a research run.

### 8. Controlled evolution

The runtime can create an `EvolutionProposal` backed by evidence IDs, but v1.0 hard-codes:

- `requires_owner_approval = true`
- `auto_apply = false`

No runtime component is authorized to rewrite ATLAS code, Constitution, canon, gates, prompts or dependencies autonomously.

### 9. Operational API

`api/agentic_omega.py` exposes the runtime through:

- `GET /v1/agentic-omega/health`;
- `POST /v1/agentic-omega/evaluate`;
- `POST /v1/agentic-omega/evolution-proposals`.

The router is mounted in `api/app.py`. Evaluation is atomic at request level and guarded by the same software invariants as the Python runtime. The API explicitly states that `READY_FOR_EXECUTION_GATE` is not a trade instruction.

## Ouroboros adaptation boundary

### Adopt

- explicit task/result lifecycle;
- specialist/subagent separation;
- append-only durable operational memory;
- auditable outcome receipts;
- post-task learning proposals;
- sourced evidence and fail-closed thinking for unknown capability/evidence states;
- distinction between genuine failures, unresolved states and successfully recovered work.

### Adapt

Ouroboros-style self-improvement becomes **proposal-only evolution** in ATLAS. Learning may recommend a code/rule change, but promotion requires constitutional compatibility, evidence, Falsifiers review and explicit owner-controlled implementation.

### Reject

- autonomous self-modification of canonical ATLAS rules;
- majority voting among agents;
- LLM confidence as a substitute for evidence;
- rewriting historical evidence after outcomes are known;
- allowing institutional flow, macro or momentum to override fundamental evidence gates;
- direct trade execution from the agentic committee.

## Runtime state machine

`OPEN → WATCH | REJECT | NO_OPPORTUNITY | READY_FOR_EXECUTION_GATE`

Precedence:

1. confirmed Falsifiers Ω veto → `REJECT`;
2. Evidence Director Ω rejection → `REJECT`;
3. core hard-gate rejection → `REJECT`;
4. missing specialist → `WATCH`;
5. unresolved core gate → `WATCH`;
6. explicit null opportunity → `NO_OPPORTUNITY`;
7. all research gates satisfied → `READY_FOR_EXECUTION_GATE`.

## Test contract

The initial implementation includes tests proving:

1. FACT without provenance is rejected;
2. majority cannot bypass a missing specialist;
3. Falsifiers Ω veto is absolute;
4. all gates passing reaches only the execution gate, not an automatic trade;
5. null opportunity is valid;
6. ledger records are hash chained and reload-verifiable;
7. evolution remains proposal-only.

Initial local validation on 2026-08-17: **7/7 tests passed**. API smoke validation also returned `READY_FOR_EXECUTION_GATE` for a complete eight-specialist PASS packet without creating a trade action.

## Persistence

The implementation is subject to `GITHUB_NOTION_SYNC_LAW.md`. GitHub is the versioned technical source of truth; the operational mirror lives under Notion `13 — Proyectos · Atlas Genesis, App, Software y GitHub` in `ATLAS Ω — Agentic Runtime Ω · Ouroboros Adaptation · 17-ago-2026`.

## Next runtime layers

The following extensions may build on v1.0 without changing its invariants:

- persistent state backend for multi-process deployments;
- specialist worker adapters;
- Evidence Director source-quality/freshness scoring;
- contradiction graph;
- replay/recovery of interrupted runs;
- post-decision forecast-vs-realized calibration;
- automated GitHub↔Notion synchronization receipts;
- model/tool capability evidence by exact route fingerprint.

Any extension that weakens Falsifiers Ω, provenance, no-majority-vote, null-opportunity or execution separation is constitutionally invalid unless explicitly superseded by Vicente.
