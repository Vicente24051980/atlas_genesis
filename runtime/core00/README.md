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

## Current physical implementation

- HashEngine: materialized for text payloads using the declared CORE-HASH-v1 normalization profile (Unicode NFC, CRLF -> LF, UTF-8, SHA-256).
- StructuralEngine: runtime pending.
- AuthenticationEngine: runtime pending.
- ReferenceEngine: runtime pending.
- EpistemicEngine: runtime pending.
- CASE-001..CASE-030 fixtures: not yet physically materialized here.

The validation harness deliberately reports `RUNTIME_PENDING` after a successful HashEngine step until the remaining frozen engines are physically implemented. It MUST NOT report a successful CORE-00 admission prematurely.

## Frozen validation corpus

- L0 Happy Path: 10 cases
- L1 Ambiguous: 8 cases
- L2 Conflicting: 8 cases
- L3 Adversarial: 4 cases

The runtime test suite MUST contain exactly the canonical CASE-001..CASE-030 payloads and expected outcomes before CORE-00 can claim runtime parity.

## Current runtime tests

`test_hash_engine.py` verifies hash round-trip, CRLF normalization, Unicode NFC normalization, fail-fast mismatch behavior, and prevention of a false CORE-00 PASS while downstream engines remain unimplemented.

## Initialization gate

Runtime initialization is complete only when:

- canonical payload fixtures are physically present;
- runtime hashes are recalculated from physical bytes;
- fixture manifests retain expected canonical identity;
- all 30 cases execute through the five-engine pipeline;
- actual results match frozen expected outcomes;
- no new engine, schema or conceptual behavior was introduced to make tests pass.

Until those conditions are met, CORE-00 remains `Runtime Pending` and MUST NOT be reported as 30/30 runtime-passing.