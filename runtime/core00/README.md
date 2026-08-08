# CORE-00 Runtime

Status: Runtime Initialization
Canonical spec: UO 1.1 RC1 — 30/30 Spec Frozen

This directory is the executable boundary for CORE-00. It MUST implement the frozen specification without extending it.

## Required engine order

1. HashEngine
2. StructuralEngine
3. AuthenticationEngine
4. ReferenceEngine
5. EpistemicEngine

Policy: fail fast. A rejected stage MUST stop downstream processing. UNVERIFIED provenance routes to QUARANTINED according to the frozen contract.

## Frozen validation corpus

- L0 Happy Path: 10 cases
- L1 Ambiguous: 8 cases
- L2 Conflicting: 8 cases
- L3 Adversarial: 4 cases

The runtime test suite MUST contain exactly the canonical CASE-001..CASE-030 payloads and expected outcomes before CORE-00 can claim runtime parity.

## Initialization gate

Runtime initialization is complete only when:

- canonical payload fixtures are physically present;
- runtime hashes are recalculated from physical bytes;
- fixture manifests retain expected canonical identity;
- all 30 cases execute through the five-engine pipeline;
- actual results match frozen expected outcomes;
- no new engine, schema or conceptual behavior was introduced to make tests pass.

Until the canonical case payloads are materialized here, runtime status remains `PENDING_FIXTURES` and MUST NOT be reported as 30/30 runtime-passing.
