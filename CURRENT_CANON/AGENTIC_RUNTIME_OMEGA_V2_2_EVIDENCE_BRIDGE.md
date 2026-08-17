# ATLAS Ω — Agentic Runtime Ω v2.2 Evidence Bridge

**Status:** IMPLEMENTED · MERGE CANDIDATE
**Effective:** 2026-08-17
**Extends:** Agentic Runtime Ω v2.1 Hardening.

## Purpose

Connect governed Agent Infrastructure Ω evidence envelopes to the executable Agentic Runtime Ω without introducing prose extraction, automatic canon promotion or hidden observation dates.

## Pipeline

`Agent Infrastructure EvidenceEnvelope → explicit metadata.metrics → EvidenceEnvelopeAdapter → MetricObservation candidates → v2.1 provenance/Red-Team/Evidence-Director gates → eight workers → OutcomeReceipt`

The bridge is intentionally narrow. It does not treat arbitrary scraped/document text as structured investment evidence.

## Input contract

The bridge consumes the existing `EvidenceEnvelope` from `api/agent_infrastructure.py` and only adapts metric objects explicitly supplied under:

`metadata.metrics[]`

Each metric may contain:

- `key`;
- `value`;
- `observed_at`;
- `confidence`;
- `freshness_days`;
- `unit`;
- `polarity`;
- `metadata`.

`key` and `value` are required for conversion. Malformed metrics are rejected rather than guessed.

## Provenance invariants

The resulting `MetricObservation` preserves:

- envelope source;
- envelope source type (`web`, `document`, `api`, `memory`);
- content hash;
- envelope retrieval timestamp in metadata;
- evidence classification;
- provider metadata;
- metric-specific observation time when supplied.

### Retrieval time is not observation time

`retrieved_at` is never copied into `MetricObservation.observed_at`. It proves when ATLAS acquired the envelope, not when the underlying economic fact occurred. A critical metric lacking its own `observed_at` therefore fails the v2.1 critical-provenance gate.

## Candidate-only law

All adapted metrics carry:

- `evidenceCandidateOnly=true`;
- `autoCanonical=false`.

Even if an inbound envelope claims `canonical=true`, the bridge records that claim only as metadata and does not promote the metric. Canonical authority remains downstream of ATLAS evidence governance.

## No prose extraction

The adapter never:

- parses envelope `content` for numbers;
- uses LLM-generated semantic extraction;
- infers missing metric keys;
- infers units;
- invents polarity;
- substitutes retrieval timestamps for observation dates.

An envelope containing useful prose but no explicit `metadata.metrics` produces zero observations and the worker system fails closed to `WATCH/NOT_EVALUATED` as applicable.

## Evidence weighting

`source_type` is preserved so Evidence Director Ω continues to apply its v2 source-quality weights. In particular, `memory` remains materially lower-weight than primary/regulatory/company-quality evidence.

## API

New router: `api/agentic_evidence_bridge.py`.

Endpoints:

- `GET /v1/agentic-omega/v2/evidence-capabilities`;
- `POST /v1/agentic-omega/v2/from-evidence`.

The execution endpoint shares the v2.1 `DurableAgenticLedger`, governance lock, `GovernedWorkerCoordinator` and `RunRecovery` chain. It emits an append-only `EVIDENCE_ADAPTER_RECEIPT` containing adapter counts and envelope content hashes.

## Guardrails

- `parseEnvelopeProse=false`;
- `externalEvidenceAutoCanonical=false`;
- `retrievalTimeIsObservationTime=false`;
- Falsifiers review completion required;
- critical metric provenance required;
- `READY_FOR_EXECUTION_GATE` is not a trade instruction;
- bridge `decisionAuthority=false`.

## Tests

The focused suite covers:

1. explicit structured metric conversion;
2. no prose parsing without `metadata.metrics`;
3. retrieval timestamp never substitutes economic observation time;
4. inbound canonical claim cannot auto-promote a metric;
5. memory source type remains preserved;
6. malformed metrics are rejected;
7. full structured envelope can reach only `READY_FOR_EXECUTION_GATE`, never a trade;
8. unstructured envelope fails closed;
9. missing metric observation date fails critical provenance downstream.

The existing Agentic Runtime v2 CI workflow is extended to execute both runtime adapter tests and API bridge tests in addition to all v1/v2/v2.1 suites.

## Invariants preserved

No majority voting. Falsifiers Ω retains absolute independent veto. External infrastructure has no investment-decision authority. Evidence candidates remain non-canonical by default. Broker execution remains separate. Evolution remains proposal-only. CORE-00 remains frozen.
