# ATLAS Ω — SEMANTIC TEMPORAL MEMORY Ω — SUBORDINATE

**Status:** `ACTIVE_SUBORDINATE_INFRASTRUCTURE`  
**Original date:** `2026-08-24`  
**Consolidated:** `2026-09-07`  
**Host engines:** `E1 EVIDENCE Ω + E5 CONTROL Ω`  
**Independent architectural authority:** `NONE`

## Objective

Provide fact-centric operational memory while preserving provenance, temporal state and replaceability. Memory infrastructure does not decide, rank, execute or modify canon.

**Law:**

`MEMORY ≠ TRANSCRIPT · RETRIEVAL ≠ TRUTH · REMEMBERED ≠ CANONICAL · NEWER ≠ AUTOMATICALLY CORRECT`

## Pipeline

`SOURCE → CANDIDATE FACT → ATOMIC NORMALIZATION → E1 EVIDENCE/PROVENANCE → CONFLICT/TEMPORAL RESOLUTION → OPERATIONAL MEMORY → RETRIEVAL`

Canonical promotion is outside this memory layer and remains subject to E5-controlled human governance.

## Memory classes

`PREFERENCE | RULE | DECISION | PORTFOLIO_STATE | OBSERVATION | HYPOTHESIS | FALSIFIER | EXTERNAL_FACT`

Every memory record must preserve, when applicable:

`memory_id | subject | predicate | value | memory_class | scope | effective_from | effective_to | observed_at | recorded_at | confidence | source | source_ref | content_hash | status | supersedes | superseded_by | canonical | ttl | tags`

## Atomicity and temporal rules

- One memory object represents one independently updateable proposition.
- Exact duplicates do not become parallel active truths.
- Explicit correction creates a new object and supersedes the prior one.
- Time-varying observations preserve history and close the prior effective interval.
- External contradiction never silently overwrites canon.
- Ambiguous contradiction becomes `PENDING_CONFLICT`.
- `OBSERVATION` and `PORTFOLIO_STATE` require temporal semantics.
- Current-state queries use effective-time filters, not semantic similarity alone.

## Provenance and confidence

Confidence is extraction/evidence confidence, not investment conviction. Retrieval cannot upgrade a hypothesis into fact and cannot bypass E1 evidence qualification or E3 gates.

## Provider abstraction

Any semantic-memory provider is an adapter, not a constitutional dependency. The minimum semantic interface is:

`add_candidates | upsert | search | get_current | supersede | retract | history`

A provider must be replaceable without changing ATLAS identity, canon or decision history.

## Authority boundaries

- `E1` owns provenance, evidence status, identity and temporal truth qualification.
- `E5` owns permissions to read/write/persist/revoke memory and protects the Vicente Model and canonical memory objects.
- `E2` may consume admitted memory as evidence input; retrieval itself never becomes assessment truth.
- `E3` may veto use of stale/conflicted/forbidden memory.
- `E4` may use valid current state in decisions but cannot infer authorization from persistence.
- `E6` audits retrieval quality, temporal correctness, conflicts and reconstructability.

No memory adapter, retriever, Gemelo Digital component or learning component has `MODIFY_CANON` authority.

## Anti-failure gates

- No transcript dumping as a substitute for fact extraction.
- No automatic canonicalization.
- No silent overwrite on contradiction.
- No timeless market observations.
- No secrets, credentials, account IDs or authentication material in memory.
- Do not infer a DECISION from discussion, watchlisting or a proposal.
- Do not convert a repeated HYPOTHESIS into EXTERNAL_FACT.
- Portfolio state is `VOLATILE` and must be broker-refreshed before material financial action.

## Success criteria

1. Current-state queries return the latest effective, non-retracted fact.
2. Corrections supersede rather than coexist as equally current truth.
3. Historical state remains auditable.
4. Retrieval finds relevant facts without exact wording.
5. Time-sensitive observations cannot masquerade as durable facts.
6. Every externally derived memory retains provenance.
7. The memory provider can be removed/replaced without changing ATLAS constitutional logic.
8. Material decisions remain reconstructible from sovereign evidence/history.

The pre-consolidation detailed specification remains available in Git history of this path.
