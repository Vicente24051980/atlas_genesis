# ATLAS Ω — Agentic Runtime Ω v2.1 Hardening

**Status:** ACTIVE · IMPLEMENTED · MAIN
**Effective:** 2026-08-17
**Extends:** Agentic Runtime Ω v2.
**Integrated to main:** PR #56 · squash `3ce2f3ae829aaf0c7e0f4f23bebbfd6ae475f028`
**Focused CI:** `Agentic Runtime Omega v2 CI` run `32070413389` · SUCCESS

## Purpose

Close two fail-open edges found during post-merge review of v2:

1. an empty confirmed-falsifier list did not prove that Falsifiers Ω had actually completed its review;
2. the hash-chained file ledger could be appended by two process instances from stale in-memory tails.

v2.1 strengthens both without changing investment authority or CORE-00.

## Red Team completion gate

`GovernedWorkerCoordinator` requires an explicit `falsifier_review_complete` state.

- confirmed material falsifier → `VETO` immediately, regardless of completion flag;
- no confirmed falsifier + review complete → normal Falsifiers PASS path;
- no confirmed falsifier + review incomplete → Falsifiers `NOT_EVALUATED` and Evidence Director `WATCH`.

Therefore absence of a known veto cannot masquerade as completion of Red Team work.

## Critical provenance gate

The hardening layer requires `source` and `observed_at` for core structured metrics used by:

- Economic Proof Ω;
- Valuation / Implied Return Ω;
- CAPEX Productivity Ω;
- Moat Ω.

A core metric may still have a numeric value, but without provenance its specialist result is converted to `NOT_EVALUATED`. Evidence Director is downgraded to `WATCH` when such gaps exist.

## Explicit temporal supersession

Contradictory evidence is not deleted merely because one observation is newer. An observation must explicitly set `metadata.supersedes_previous=true` before older observations for the same key are removed from the active contradiction set.

This preserves historical evidence while allowing explicit corrected/restated data to supersede stale observations.

## Durable multi-process ledger

`DurableAgenticLedger` extends the v1 append-only SHA-256 ledger.

For file-backed state it:

1. obtains a process lock and OS file lock where available;
2. reloads the current ledger from disk;
3. verifies the complete hash chain;
4. appends from the verified current tail;
5. releases the lock.

This prevents two API worker processes from independently extending the same stale hash tail.

The operational `api/agentic_omega.py` engine now uses `DurableAgenticLedger`; v2 continues sharing that same engine and ledger.

## API surface

`/v1/agentic-omega/v2/run-workers` adds:

- `falsifier_review_complete` (default false).

Capabilities disclose:

- Red Team completion required;
- critical metric provenance required;
- explicit temporal supersession;
- durable multi-process ledger.

## Validation

Hardening tests cover:

- incomplete Falsifiers review fails closed;
- a confirmed falsifier still vetoes immediately;
- explicit temporal supersession removes the superseded conflict only when declared;
- stale DurableAgenticLedger instances reload before appending;
- API readiness requires completed Falsifiers review;
- API readiness requires critical metric provenance.

GitHub Actions `Agentic Runtime Omega v2 CI` run `32070413389` completed `SUCCESS` on hardening head `a39575d019903e4f9e71003e9890dd57cb303828`. The job ran the original v1 invariants, v2 workers/recovery/calibration tests, hardening tests and API v2 tests.

## Integration record

- Branch: `agent/agentic-runtime-omega-v2-hardening`.
- PR #56: merged to `main` on 2026-08-17.
- Squash commit: `3ce2f3ae829aaf0c7e0f4f23bebbfd6ae475f028`.
- Focused CI run: `32070413389` = SUCCESS.
- Runtime/API/hardening: MAIN.
- GitHub + Notion dual persistence: required and completed in the same work session.

## Invariants preserved

No majority voting. Falsifiers Ω veto remains absolute. Missing evidence remains non-evidence. External candidate evidence remains non-canonical by default. `READY_FOR_EXECUTION_GATE` remains separate from BUY/SELL and broker execution. Evolution remains proposal-only. CORE-00 is untouched.

## Next admissible extensions

- governed adapters from Agent Infrastructure Ω evidence envelopes into typed `MetricObservation` candidates;
- evidence-ID graph edges and source lineage across contradictions;
- calibration sliced by specialist, horizon and regime;
- persistent lifecycle checkpoints for scheduled forecast settlement;
- source-specific freshness policies per evidence class.

Any extension that converts absence of evidence into positive evidence, bypasses Red Team completion, auto-promotes external content, weakens provenance or bypasses the execution gate is invalid unless explicitly superseded by the owner.
