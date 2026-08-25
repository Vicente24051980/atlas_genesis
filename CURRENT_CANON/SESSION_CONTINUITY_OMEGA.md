# SESSION CONTINUITY Ω

Status: ACTIVE CANON
Version: v1.0
Date: 2026-08-22

## Objective
ATLAS must resume the user's investment workspace without requiring manual reconstruction of prior research context.

## Canonical chain
Portfolio/Watchlists → Audit State → Engine Ledger → Evidence Ledger → Contradictions → Falsifiers → Decision Log → Recurring Tasks → Workspace Layout → Resume.

## Required persisted state
- active portfolio snapshot/reference and broker-read state;
- watchlists and ticker research queues;
- incomplete and completed ticker audits;
- last state of every registered ATLAS engine, with GREEN Continuity Ω first in analytical order;
- evidence IDs, provenance, timestamps and integrity state;
- contradictions and unresolved data gates;
- falsifiers and adversarial-sweep state;
- Expected Return inputs/results subject to Price & Target Integrity Gate Ω;
- Decision Log Ω and immutable historical result snapshots;
- catalysts, recurring tasks and monitoring rules;
- terminal workspace/layout preferences.

## Resume contract
On application/session start, ATLAS loads the latest certified workspace manifest and renders a RESUME state. Missing/stale/corrupt components remain explicit DATA GATE / STALE / QUARANTINE. They are never silently regenerated or inferred.

## Integrity laws
1. MEMORY ≠ EVIDENCE.
2. SESSION STATE ≠ CURRENT MARKET DATA.
3. RESUME ≠ RECOMPUTE.
4. Historical observations are immutable.
5. Any current decision requiring fresh market/fundamental evidence must revalidate that evidence before Investment Committee Ω may act.
6. GREEN remains first analytical engine after identity/data integrity prerequisites; all applicable engines still execute regardless of GREEN score.
7. Broker read state never implies execution authority.

## Storage model
Use a versioned `SessionManifest` containing schema_version, session_id, created_at, last_updated_at, portfolio_ref, watchlist_refs, audit_refs, evidence_refs, decision_log_ref, task_refs, workspace_state and integrity hash/status. Large evidence payloads remain referenced rather than duplicated.

## UX
HOME/Cockpit exposes `RESUME LAST SESSION`, last certified timestamp, stale-data warnings, incomplete audits, active falsifiers/data gates, next catalysts/tasks and last Investment Committee decisions. The user can continue an audit from its last completed engine while preserving the complete prior ledger.

## Competitive product lesson
Persistent AI context is treated as a baseline terminal capability. ATLAS differentiates by preserving not only preferences/context but the evidence provenance, engine states, contradictions, falsifiers and decision lineage that produced each conclusion.
