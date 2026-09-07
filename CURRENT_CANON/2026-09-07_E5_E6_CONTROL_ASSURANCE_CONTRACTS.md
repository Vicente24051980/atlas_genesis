# ATLAS Ω — E5 CONTROL + E6 ASSURANCE CONTRACTS

**Status:** `CURRENT / CANONICAL SUBORDINATE CONFIGURATION`  
**Effective:** `2026-09-07`  
**Creates new canonical engines:** `NO`

This document records the executable configurations hosted by the already-ratified canonical engines `E5 CONTROL Ω` and `E6 ASSURANCE Ω`.

## E5 CONTROL Ω

Executable source:

`src/atlas/algorithm/e5-control-policy-omega.ts`

Test:

`src/atlas/algorithm/e5-control-policy-omega.test.ts`

E5 owns permission boundaries, human approval requirements, persistence/scheduling/delegation policy, protected sovereign objects, world-state refresh and verified shutdown requirements.

E5 does **not** generate investment conclusions and is not the execution stage itself. It controls whether a proposed material action is permitted.

Eight explicit permissions remain independent:

`READ | WRITE | EXECUTE | COMMUNICATE | PERSIST | SCHEDULE | DELEGATE | MODIFY_CANON`

No automatic component receives `MODIFY_CANON`.

Verified shutdown requires all eight conditions:

1. `MAIN_PROCESS_STOPPED`
2. `SUBAGENTS_STOPPED`
3. `SCHEDULED_JOBS_STOPPED`
4. `RETRY_QUEUES_STOPPED`
5. `TEMP_CREDENTIALS_REVOKED`
6. `PENDING_ACTIONS_CANCELLED_OR_ORPHANED_WITH_HUMAN_NOTICE`
7. `EXTERNAL_STATE_ACCOUNTED_FOR`
8. `RESTART_PATH_DISABLED`

`UNKNOWN` world state is treated as volatile; a failed required refresh produces `ACTION_BLOCKED_STALE_ASSUMPTION`.

## E6 ASSURANCE Ω

Executable source:

`src/atlas/algorithm/e6-assurance-harness-policy-omega.ts`

Test:

`src/atlas/algorithm/e6-assurance-harness-policy-omega.test.ts`

E6 has zero decision, execution and canon-write authority.

Harness datasets:

- `D1 KNOWN_GOOD`
- `D2 KNOWN_BAD`
- `D3 AMBIGUOUS`
- `D4 ADVERSARIAL`
- `D5 HISTORICAL_FROZEN_PIT`
- `D6 UNSEEN_OUT_OF_SAMPLE`

Namespace law:

- synthetic cases: `SIM-*`
- real resolved cases: `AI-*` or a formally superseding real namespace
- synthetic cases count toward real Quality Gate: `FALSE`
- mixed synthetic/real aggregate for primary quality evidence: `FORBIDDEN`

No-self-design law: the evaluated component cannot design the entirety of its own primary test set. D2/D4/D5 require independent construction or frozen historical truth. Self-proposed cases are excluded from the component's primary success metric.

Historical simulated material that used `AI-*` identifiers retains provenance but has zero authority as real-case evidence until explicitly migrated/reclassified.

## Architecture relationship

Decision pipeline:

`R0 RESEARCH → E1 EVIDENCE → E2 ASSESSMENT → E3 GATE → E4 DECISION → EXECUTION`

- `E5 CONTROL` governs authorization transversally.
- `E6 ASSURANCE` evaluates independently.
- `RESEARCH → SIGNAL → SCORE → GATE → PORTFOLIO_SELECTION → EXECUTION` is a type-separation invariant, not a one-to-one engine pipeline.
