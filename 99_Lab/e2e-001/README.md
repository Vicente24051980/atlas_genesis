# E2E-001 — Epistemic Routing Benchmark

Status: experimental benchmark
Branch: `bench/e2e-bench-001`
Scope: higher-layer integration only

## Governance boundary

E2E-001 MUST NOT modify CORE-00 or redefine the cognitive kernel. It is a higher-layer validation and routing harness.

Canonical flow under test:

```text
Transcript/Input
  -> Parser / UO 1.1
  -> Validation Harness Ω
       PASS | QUARANTINED | REJECT
  -> Orchestrator
  -> Epistemic Classification Skill
  -> Facts | Evidence | Hypotheses | Interpretations
  -> Biblioteca Atlas | Atlas Conspiraciones | Gemelo Digital
  -> Certified Output
```

## Epistemic rules

The benchmark preserves interpretations instead of deleting them.

An interpretation that is attributable to a source is represented with:

```json
{
  "kind": "interpretation",
  "canonical_evidence": false,
  "truth_claim": "not_established",
  "attribution": "preserved"
}
```

This permits documentary statements such as "Author X argues Y" to be stored as a sourced fact about the author's position without promoting Y itself to objective truth.

## Validation states

- `PASS`: structurally valid input with enough provenance to continue normal routing.
- `QUARANTINED`: structurally valid but provenance, attribution, or truth status is insufficient for canonical evidence.
- `REJECT`: malformed, internally contradictory at contract level, or explicitly attempts to promote unsupported interpretation into canonical fact.

## Files

- `epistemic_harness.py`: dependency-free reference implementation.
- `test_epistemic_harness.py`: executable benchmark tests.
- `fixtures/cases.json`: benchmark corpus.
- `CONTRACT.md`: typed contract and invariants.

## Run

```bash
python -m unittest 99_Lab/e2e-001/test_epistemic_harness.py -v
```

The implementation is intentionally isolated from production code until the benchmark is accepted.