# ASTRA MASTER RECONCILIATION 2026-09-07 — REPOSITORY VERIFIED

STATUS: IMPLEMENTATION_BRANCH
ROLE: Repository-verified correction of the pre-access declarative ASTRA baseline.
DO_NOT_USE_AS_RUNTIME_SOURCE_OF_TRUTH: true

## Authority-state taxonomy
All ATLAS claims must use this progression and may not skip stages:

DECLARED -> CODE_PRESENT -> TESTED -> CI_GREEN -> MERGED -> RUNTIME_BOUND -> CANONICAL_AUTHORITY

A component that is only CODE_PRESENT or TESTED is not active authority. A merged component is not automatically runtime-bound. CURRENT_CANON_DIRECTORY is not runtime authority by itself.

## Reconciled findings

### Continuity / PR #160
- PR #160 exists and is open/unmerged.
- Pure/runtime continuity tests pass.
- The real Notion integration gate failed before exercising continuity logic because `NOTION_API_KEY` was empty in GitHub Actions.
- Therefore the current classification is: CODE_PRESENT + TESTED + PARTIAL_CI_GREEN; REAL_NOTION_INTEGRATION_BLOCKED_BY_SECRET_CONFIGURATION; NOT_MERGED; NOT_RUNTIME_AUTHORITY.
- Do not weaken or bypass the real-Notion gate. The correct remediation is to provision an authorized repository/environment secret and rerun the gate.

### Governance / PR #169
- Guardrails are implemented on an open draft branch: capability leases, independent persistence/scheduling/spawn/delete/inter-agent permissions, C0-C3 authority gate, external-state firewall, privilege-laundering block, verified-shutdown logic, checkpoints and state reconciliation.
- Classification: CODE_PRESENT; UNMERGED; RUNTIME_AUTHORITY_UNPROVEN.
- The prior statement `NOT IMPLEMENTED` is superseded.

### Point Zero / PR #172
- PR #172 is MERGED.
- It removes causal-driver overlap as an automatic diversification/redundancy penalty, keeps causal-diversification as diagnostic/provenance only, and stops the greedy helper from claiming global optimality.
- Greedy selection must not publish `OPTIMAL_N` unless global optimality is proven or certified.
- Mean-variance optimization is not imposed as a constitutional requirement; the optimizer remains methodology-agnostic subject to validated risk machinery and honest optimality claims.
- Classification: MERGED; runtime/selection authority must still be read from the active control plane rather than inferred from merge alone.

### Memory duplication
- Duplicate assistant-memory entries are a memory-hygiene/provenance concern.
- They do not by themselves prove GitHub<->Notion semantic drift.
- Rule: MEMORY_DUPLICATION != DUAL_PERSISTENCE_SYNC_FAILURE without source-level evidence.

### OpenClaw
- No production authority is granted by default.
- Coupling status remains UNKNOWN until an Exit Test is executed.
- Do not classify probable failure without evidence.

## Non-negotiable promotion rules
1. New research components default to `DIRECT_SCORE_WEIGHT = 0` and `PORTFOLIO_ACTION_ALLOWED = false`.
2. Only a canonical factor owner may contribute direct score for its factor.
3. Evidence from other modules may change confidence/provenance, not duplicate points.
4. No `OPTIMAL_N` claim without a global-optimality proof/certificate compatible with the active selector.
5. CI green is necessary but insufficient for canonical authority.
6. No branch is merged solely because its PR prose says a capability exists.

## Current P0
1. Provision `NOTION_API_KEY` for the PR #160 real-Notion workflow using an integration authorized to read the ATLAS Continuity Registry.
2. Rerun `real-notion-continuity`; require all preregistered real-registry cases to pass with epistemic-promotion rate 0.
3. Audit PR #169 focused CI before merge; preserve its unmerged/non-authority state until then.
4. Verify the merged Point Zero selector is actually bound to the active selection path before assigning `RUNTIME_BOUND` or `CANONICAL_AUTHORITY`.
5. Enforce the authority-state taxonomy and factor-ownership ledger before further engine proliferation.

## Superseded claims from the declarative baseline
The following statements must not be used as current facts:
- `GitHub access = NO`
- `PR #160 = UNKNOWN`
- `Continuity tests = NOT RUN`
- `Verified Shutdown = NOT IMPLEMENTED`
- `Authority guardrails = normative only`
- `Memory duplication proves GitHub/Notion sync failure`
- `OpenClaw coupling fail = probable`
- `Efficient frontier / mean-variance is mandatory for endogenous N`

They remain useful only as historical evidence of the pre-repository-access audit state.
