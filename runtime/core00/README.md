# CORE-00 Runtime

Status: Runtime Verification Pending
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

- HashEngine: materialized for text payloads using CORE-HASH-v1 normalization (Unicode NFC, CRLF -> LF, UTF-8, SHA-256).
- StructuralEngine: materialized and connected.
- AuthenticationEngine: materialized and connected.
- ReferenceEngine: materialized and connected.
- EpistemicEngine: materialized and connected.
- ValidationHarness: sequential 5-engine pipeline with fail-fast behavior.
- Fixture generator: `generate_all_fixtures.py` deterministically materializes CASE-001..CASE-030 on disk for CI/runtime verification.
- Unit tests: currently 15 tests and passing in GitHub Actions as of the latest inspected runs.

The five engines being implemented does NOT by itself certify CORE-00. Certification remains pending until the physical runner executes all 30 generated fixtures and produces a matching `CORE00_STATUS.md` with the complete expected matrix.

## Physical runner invocation

Run CORE-00 from the repository root as a Python module:

```bash
python -m runtime.core00.runner
```

Do NOT invoke it as:

```bash
python runtime/core00/runner.py
```

Reason: module execution preserves the repository root on Python's import path and allows package imports such as `runtime.core00.validation_harness` to resolve consistently in GitHub Actions and local execution. Direct script execution changes `sys.path` to the script directory and previously caused `ModuleNotFoundError: No module named 'runtime'` in CI.

## Frozen validation corpus

- L0 Happy Path: 10 cases
- L1 Ambiguous: 8 cases
- L2 Conflicting: 8 cases
- L3 Adversarial: 4 cases

The runtime suite MUST contain exactly CASE-001..CASE-030 during physical execution, with deterministic input bytes, regenerated hashes, expected terminal states and expected fail-fast boundaries.

## CI checkpoint

The CORE-00 workflow performs, in order:

1. Python unit tests.
2. Physical generation of all 30 fixtures.
3. `python -m runtime.core00.runner`.
4. Verification of `runtime/core00/CORE00_STATUS.md`.
5. Artifact upload of the status report.

The workflow must not claim success unless the report contains the exact 30/30 runtime certification condition required by the frozen contract.

## Initialization gate

Runtime verification is complete only when:

- all canonical payload fixtures are physically materialized;
- runtime hashes are recalculated from physical bytes;
- fixture manifests retain expected canonical identity;
- all 30 cases execute through the appropriate five-engine/fail-fast path;
- actual results match frozen expected outcomes;
- downstream engines remain unexecuted after terminal failures;
- no new engine, schema or conceptual behavior was introduced merely to make tests pass.

Until those conditions are demonstrated by GitHub Actions and `CORE00_STATUS.md`, CORE-00 remains `Runtime Verification Pending` and MUST NOT be reported as 30/30 runtime-certified.

Verification checkpoint trigger: 2026-08-08 — documentation-only change to execute the physical CORE-00 workflow from the current `main` head without modifying runtime behavior.
