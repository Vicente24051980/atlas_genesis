# ATLAS Ω — Agentic Runtime Ω v2.1 Hardening

**Status:** IMPLEMENTED · MERGE CANDIDATE
**Effective:** 2026-08-17
**Extends:** Agentic Runtime Ω v2.

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

Capabilities now disclose:

- Red Team completion required;
- critical metric provenance required;
- explicit temporal supersession;
- durable multi-process ledger.

## Tests

Hardening tests cover:

- incomplete Falsifiers review fails closed;
- a confirmed falsifier still vetoes immediately;
- explicit temporal supersession removes the superseded conflict only when declared;
- stale DurableAgenticLedger instances reload before appending;
- API readiness requires completed Falsifiers review;
- API readiness requires critical metric provenance.

The dedicated Agentic Runtime v2 CI workflow is extended to run the hardening suite in addition to all v1/v2 tests.

## Invariants preserved

No majority voting. Falsifiers Ω veto remains absolute. Missing evidence remains non-evidence. External candidate evidence remains non-canonical by default. `READY_FOR_EXECUTION_GATE` remains separate from BUY/SELL and broker execution. Evolution remains proposal-only. CORE-00 is untouched.
