# ATLAS Ω — ASTRA MASTER AUDIT GUARDRAILS IMPLEMENTATION

**Date:** 2026-09-06  
**Status:** `IMPLEMENTED_ON_BRANCH / PR_GATE / NOT_CANONICAL`  
**Branch:** `astra-master-audit-guardrails-2026-09-06`  
**Pre-change main reference:** `1bd56a13f4177e60205ef668e6d07e076d3bd375`  
**Master baseline claim:** `NOT_CLAIMED` — the full `ASTRA_MASTER_BASELINE_2026-09` remains a separate Work-level adversarial-audit deliverable.

## 1. Why this patch exists

Repository inspection showed that ATLAS already has material implemented infrastructure that must be reused rather than duplicated:

- append-only SHA-256 chained event ledger;
- durable multi-process ledger;
- explicit epistemic assertions and provenance hardening;
- contradiction graph / Evidence Director;
- run recovery from context snapshots;
- prediction-before-outcome calibration;
- route-fingerprint capability evidence;
- GitHub/Notion dual-persistence receipts;
- Falsifiers Ω and fail-closed research gates;
- Point Zero / Capital-Blind / PIT / statistical-backtest controls;
- existing gold, capital-destination and CAPEX-chain research engines.

The audit did **not** find equivalent executable controls for these cross-cutting runtime requirements:

1. task-scoped expiring capability leases;
2. `WRITE != PERSIST` enforcement;
3. inter-agent communication as a separate privilege;
4. consequence-aware action authority;
5. material-task contracts with checkpoints and abort criteria;
6. verified shutdown beyond the main process;
7. post-termination state reconciliation;
8. a general flow-type firewall preventing asset-allocation/fiscal/consumption/capital-return flows from being silently interpreted as productive CAPEX;
9. objective/instrument fit as an explicit last-mile gate;
10. causal-driver overlap diagnostics for possible signal double counting.

These are implemented here without changing portfolio membership, canonical score or PR #160.

## 2. New runtime components

### `runtime/agentic_omega/governance_firewall.py`

Implements:

- `Capability`: `READ`, `WRITE`, `EXECUTE`, `PERSIST`, `SCHEDULE`, `SPAWN`, `MESSAGE`, `EXTERNALIZE`, `DELETE`, `INTER_AGENT_COMMUNICATION`;
- task/resource/expiry-bound `CapabilityLease`;
- `ConsequenceClass`: C0/C1/C2/C3;
- `AuthorityMode`: `EXECUTE`, `PROPOSE_VERIFY`, `INVESTIGATE_ESCALATE`, `STOP`;
- explicit provisional uncertainty/reversibility policy thresholds, marked **not calibrated**;
- `TaskContract` with objective, assumptions, limits, success criteria, checkpoints and abort criteria;
- dynamic reassessment: `CONTINUE / COMPLETE / ESCALATE / ABORT`;
- External State Firewall;
- inter-agent privilege-laundering prevention;
- `ShutdownSnapshot` covering process, workers, subagents, scheduled jobs, temp credentials, external state, pending messages, retry queues and background tasks;
- `VERIFIED_TERMINATED` and separate `STATE_RECONCILED` states.

Hard properties:

- technical connector access does not create authority;
- `WRITE` never implies `PERSIST`;
- `MESSAGE` never implies inter-agent authority;
- privileges cannot be composed across agents unless both leases contain them;
- C3 is never autonomously executable through this gate;
- constitutionally/manual-only actions can remain blocked even after owner authorization;
- policy thresholds cannot be represented as empirically calibrated until real calibration exists.

### `runtime/agentic_omega/governance_runtime.py`

Binds the pure guardrails to the existing append-only event ledger.

Ledgered event types include:

- `TASK_CONTRACT_REGISTERED`;
- `TASK_REASSESSMENT`;
- `CAPABILITY_LEASE_REGISTERED`;
- `AUTHORITY_DECISION`;
- `EXTERNAL_STATE_DECISION`;
- `INTER_AGENT_COMMUNICATION_DECISION`;
- `SHUTDOWN_VERIFICATION`;
- `SHUTDOWN_STATE_RECONCILIATION`.

The runtime computes lease validity itself rather than trusting a caller-provided permission assertion.

### `runtime/agentic_omega/capital_flow_firewall.py`

Introduces an orthogonal **flow mechanism** taxonomy:

- `PRODUCTIVE_CAPITAL_FORMATION`;
- `ASSET_ALLOCATION`;
- `CONSUMPTION`;
- `FISCAL_PROCUREMENT`;
- `CAPITAL_RETURN`.

This is intentionally separate from the existing destination taxonomy (`GOLD_REAL_ASSETS`, semiconductors, grids, etc.). Destination answers **where**; flow type answers **what economic mechanism moved the money**.

Stage distinctions include:

- `ANNOUNCED / COMMITTED / FINANCED / DEPLOYED / ORDERED / MONETIZED`;
- `POLICY_INTENT / BUDGET_REQUEST / APPROPRIATION / CONTRACT / REVENUE`;
- `AUTHORIZED / EXECUTED`.

Hard properties:

- central-bank gold purchases may be `ASSET_ALLOCATION` evidence but cannot become productive-CAPEX/supplier-revenue proof;
- `POLICY_INTENT != BUDGET_REQUEST != APPROPRIATION != CONTRACT != REVENUE`;
- buyback authorization is not buyback execution;
- PIT uncertainty caps promotion at `SHADOW`;
- non-PIT evidence remains `DISCOVERY`;
- stage maturity is a separate promotion gate;
- research promotion creates **zero direct ATLAS score** and **zero portfolio-action authority**;
- the provisional research thresholds are explicitly marked governance heuristics, not validated alpha thresholds.

## 3. Objective / instrument last-mile gate

The same capital-flow module implements:

`OBJECTIVE -> HORIZON -> LIQUIDITY -> EXIT SPREAD -> RECOGNITION -> COUNTERPARTY DEPTH -> REVERSIBILITY -> FIT`

This converts the useful part of the gold-use-case into a general rule without creating a gold-specific investment signal.

A security/emergency objective can therefore reject an illiquid niche instrument even when the underlying economic asset is valuable.

`CAPABILITY != USABILITY != ADOPTION != VALUE` is enforced at the instrument-selection boundary rather than treated as prose.

## 4. Signal dependency / double-counting diagnostic

`SignalDependency` compares causal-driver sets and reports overlap plus shared drivers.

It is deliberately a diagnostic, not proof of statistical redundancy. It exists to catch cases where multiple ATLAS engines may be different views of the same latent driver (e.g. AI CAPEX -> backlog -> revisions -> momentum) before independent score credit is considered.

## 5. Adversarial tests

New focused tests:

- `runtime/agentic_omega/test_master_audit_guardrails.py`;
- `runtime/agentic_omega/test_governance_runtime.py`.

Cases include:

1. WRITE does not grant PERSIST;
2. lease expiry/task/resource scope;
3. C3 hard stop;
4. C2 owner/lease requirements;
5. manual-execution policy dominates authorization;
6. material task contract completeness;
7. abort/escalation on new evidence;
8. inter-agent privilege laundering blocked;
9. verified shutdown requires zero runtime residue;
10. state reconciliation is independent from process termination;
11. sovereign gold buying is not CAPEX-chain evidence;
12. budget request cannot become contract/revenue;
13. PIT uncertainty remains shadow;
14. financed productive capital may enter research production but cannot create a trade;
15. announced CAPEX is too early;
16. buyback authorization differs from execution;
17. short-horizon signal without long-horizon transmission remains shadow;
18. emergency-liquidity objective rejects an illiquid niche instrument;
19. causal-driver overlap is surfaced;
20. PIT temporal ordering is fail-closed;
21. runtime decisions are actually ledgered;
22. runtime task checkpoints are actually ledgered.

`.github/workflows/agentic-runtime-v2.yml` is updated to run both test files alongside the existing focused suite.

## 6. Explicit non-changes

This branch does **not**:

- change the current portfolio;
- change `OPTIMAL_N`;
- assign score points to Follow the Capital;
- claim FTC validation;
- promote any YouTube/news narrative to fact;
- alter the frozen Point Zero laws;
- modify CORE-00;
- merge or weaken PR #160;
- unfreeze Decision Prediction;
- unfreeze Digital Twin inference;
- claim OpenClaw integration;
- claim a completed Work-level Master Audit baseline.

## 7. PR #160 boundary

PR #160 remains an independent continuity binding whose remaining explicit gate is the real Notion smoke with authorized credentials. This implementation neither copies its incomplete live-continuity path into `main` nor bypasses that gate.

## 8. Risk / rollback

### New risks

- provisional authority thresholds could be mistaken for calibrated probabilities;
- downstream callers could bypass the firewall if execution paths are not required to use `GovernanceFirewall`;
- destination engines and the new flow taxonomy can drift unless future adapters preserve both axes;
- a `PRODUCTION` research state could be misread as portfolio authority despite the explicit zero-authority fields.

### Mitigations

- threshold outputs expose `threshold_policy_calibrated = false`;
- all production research outputs keep `direct_atlas_score_delta = 0` and `portfolio_action_allowed = false`;
- runtime decisions are ledgered;
- CI tests preserve the boundary conditions;
- this implementation remains isolated on a reversible branch until PR review/CI.

### Rollback

Close the PR / delete the branch. `main@1bd56a13f4177e60205ef668e6d07e076d3bd375` is the pre-change reference.

## 9. Completion state

`CODE_WRITTEN = TRUE`  
`FOCUSED_TESTS_ADDED = TRUE`  
`CI_WIRED = TRUE`  
`CI_RESULT = PENDING_UNTIL_PR_RUN`  
`MAIN_MODIFIED = FALSE`  
`CANON_MODIFIED = FALSE`  
`PORTFOLIO_AUTHORITY_CHANGED = FALSE`  
`DUAL_PERSISTENCE = PENDING_NOTION_MIRROR`
