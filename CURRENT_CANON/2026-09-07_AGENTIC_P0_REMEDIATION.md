# ATLAS Ω — Agentic P0 Remediation

**Date:** 2026-09-07  
**Status:** CANONICAL WHEN MERGED TO `main`  
**Authority:** E5 CONTROL Ω + E6 ASSURANCE Ω  
**Rule:** LATEST AUTHORIZED CANON WINS

## Purpose

Close the concrete control and assurance gaps identified during the 7-Sep-2026 agentic audit without granting any model new authority and without treating specification as empirical proof.

## 1. Naming firewall

`ASTRA Ω` inside ATLAS remains the historical/internal architecture-audit namespace associated with the D1–D7 consolidation and Phase B authority/factor-ledger work.

A vendor or model product named Astra MUST be written as `MODEL_ASTRA` (or its exact vendor/model identifier) in new ATLAS research and capability evaluations. A model name never inherits authority from the internal `ASTRA Ω` namespace.

## 2. Model capability status

The claim `CAPABILITY_DELTA = ZERO` is not canonical and is rejected as unproven.

The correct default is:

`MODEL_CAPABILITY_DELTA = UNPROVEN`

A model capability may move from SHADOW to an ATLAS component only after a preregistered benchmark shows a measurable improvement on a defined metric and E5 confirms that the capability does not expand permissions by implication.

Model intelligence remains replaceable and zero-authority. Canon, permission boundaries, provenance, tombstones, decision history and protected sovereign objects remain ATLAS intelligence.

## 3. Memory authority firewall

Conversation/user/model memory is context, never canonical authority.

When memory conflicts with CURRENT_CANON, repository policy, Notion canonical index or a later authorized decision, the conflict MUST resolve in favor of the latest authorized canon. Memory may propose a reconciliation item; it may not overwrite canon automatically.

## 4. Shutdown evidence ladder

The eight E5 requirements S1–S8 remain mandatory.

Evidence states are now explicit:

- `SPECIFIED`: requirement exists in policy.
- `UNIT_TESTED`: deterministic invariant test passes.
- `CONTROLLED_CI_EMPIRICAL`: S1–S8 are observed in an isolated real runner/process environment.
- `LIVE_ENVIRONMENT_EMPIRICAL`: S1–S8 are observed across the actual deployed schedulers, delegated agents, queues, credentials, pending actions, external state and restart paths.

`CONTROLLED_CI_EMPIRICAL` MUST NOT be described as `LIVE_ENVIRONMENT_EMPIRICAL`.

The controlled harness is `tools/assurance/shutdown_drill.py`. Its output must label itself `CONTROLLED_CI_EMPIRICAL_NOT_PRODUCTION_LIVE`.

## 5. Unified health gate

`.github/workflows/atlas-p0-integrity-gate.yml` is the repository-level P0 assurance gate.

It must:

1. audit automatic canon-write surfaces;
2. verify E5 fail-closed invariants;
3. inventory executable effect surfaces;
4. report unresolved factor/scorer mappings;
5. run the controlled S1–S8 shutdown drill;
6. run the Python runtime suite when present;
7. persist machine-readable assurance artifacts.

A green P0 gate means only that the checks in that workflow passed for that commit. It is not proof that every ATLAS workflow, external integration or production surface is healthy.

## 6. Factor ownership / scorer mapping

Unresolved scoring owners remain fail-closed for `ADD_POINTS`. They may be consumed only as registered evidence until their real runtime scorer is mapped.

The repository integrity audit must surface every remaining `UNRESOLVED_RUNTIME_MAPPING` factor on every P0 run. New unresolved scoring authority may not silently enter the system.

A mapping is not considered closed by documentation alone: the concrete runtime callsite and the single scoring owner must be identified, tested and then updated in `atlas-factor-ownership-ledger-omega.ts`.

## 7. Effect-surface audit

The P0 audit inventories executable surfaces containing scheduling, delegation, communication, persistence and execution semantics. This inventory is a discovery control, not permission authority.

Any newly discovered material side-effect surface remains governed by E5 default-deny until explicitly classified.

## 8. Repository / knowledge availability

Repository availability is session/environment evidence, not system canon. A previous session reporting `NO_WRITE_ACCESS` or `KNOWLEDGE_BASE_UNAVAILABLE` does not persist as truth into a later session.

Every material implementation session must re-check actual repository permissions before claiming a write or retrieval limitation.

## 9. Remaining open item after this remediation

Even after a successful controlled CI drill, one material assurance item remains open until observed in the deployed environment:

`LIVE_SHUTDOWN_DRILL = EVIDENCE_PENDING`

This status must remain fail-closed and must never be upgraded from CI evidence alone.
