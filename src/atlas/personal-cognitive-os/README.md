# ATLAS AI — Memory Foundation Ω v1

This module is the first executable slice of **ATLAS AI — Personal Cognitive OS Ω v1.0**.

## Current status

**EXPERIMENTAL — LIVE CONTINUITY FAILED.**

The first preregistered continuity test failed because historical retrieval recovered only 1/10 target project contexts. A deterministic remediation was then implemented, including a Notion Continuity Registry contract, fail-closed project retrieval, regression tests and CI.

That remediation passed CI, but the subsequent **live-chat retest failed again**: only 3/10 target conversations recovered the correct project. Multiple `Sigue` continuations resumed unrelated projects (for example Exor/Lingotto or DINASTÍA material inside Strategy Factory, European-base, HobbieCode, accident and ProPicks contexts).

Therefore:

`CI_SUCCESS != LIVE_CONTINUITY_VALIDATION`

The live missing link is the runtime binding that must force every continuity request through:

`CHAT CONTEXT -> ACTIVE PROJECT IDENTIFICATION -> NOTION CONTINUITY REGISTRY READ -> ContinuityRegistryRecord -> RESPONSE`

Until that path is actually invoked by the live conversation runtime, this module is not a validated continuity system.

Full live-retest record:

`CURRENT_CANON/experiments/ATLAS_AI_CONTINUITY_MVP_LIVE_RETEST_2026-09-06.md`

## Implemented now

- `ATLAS_CAPTURE Ω`
- `ATLAS_PARSER Ω`
- typed cognitive units
- `CONTEXT_ROUTER Ω`
- `OPEN_LOOPS_ENGINE Ω`
- `ZERO-INBOX Ω`
- minimal `ATLAS_EXECUTIVE Ω`
- minimal Daily Brief surfacing
- continuity resolution for short follow-ups such as `Sigue`
- epistemic separation between explicit user statements, preferences, hypotheses and future validated facts
- `ContinuityRegistryRecord` persistent-state contract
- deterministic continuity retrieval from an explicit project-state registry
- fail-closed behavior when `Sigue` is ambiguous
- 10-case continuity retrieval regression tests
- epistemic-promotion regression test
- dedicated CI gate for the continuity MVP

## Persistent storage rule

Only **Notion + GitHub** are canonical persistent knowledge layers.

The human-readable registry is **ATLAS Continuity Registry Ω** in Notion. It stores, per project:

- project ID and state;
- established claims;
- hypotheses;
- current open loop;
- next best action;
- evidence standard;
- provenance;
- update date.

GitHub owns the retrieval contract, deterministic logic, tests and governance. The Notion client/authentication boundary remains outside the pure cognitive engine; runtime must read the registry and map rows into `ContinuityRegistryRecord` objects before retrieval.

## Retrieval rule

A bare `Sigue` is never allowed to pick whichever open loop has the highest global confidence.

Resolution order inside the deterministic engine:

1. exact project hint;
2. explicit active-project context;
3. if exactly one project is active, use it;
4. otherwise fail closed as ambiguous.

For non-bare queries, lexical retrieval must clear a minimum evidence threshold and an ambiguity margin. Weak matches return no state.

**Important:** these rules only protect the system if the live runtime actually invokes the deterministic retrieval path.

## Acceptance contract

Given a persisted project state containing:

- active project;
- established claims;
- hypotheses;
- unresolved open loop;
- next best action;
- provenance;

then `Sigue` with the correct active-project context must recover the same project state without promoting any hypothesis into `established`.

The locked live threshold remains:

- Project Recovery >= 9/10
- Open-Loop Recovery >= 8/10
- Established Recovery >= 85%
- Hypothesis Recovery >= 85%
- Epistemic Promotion Rate = 0%

Current live Project Recovery: **3/10 — FAIL**.

## Critical epistemic rule

`Memory != Digital Twin`.

An explicit or validated memory remains separate from a hypothesis. Repeated retrieval has zero evidentiary weight. The continuity layer copies hypotheses into `hypotheses`; it must never silently move them into `established`.

## Governance note

PR #134 was merged before the live retest was completed, despite its own stated merge gate. The code remains merged, but **merged code is not promoted evidence of live validity**. This README and the live-retest record are the controlling status for continuity validation.

## Deliberately not promoted

- Vicente Decision Model
- Decision Prediction
- relationship graph inference
- autonomous execution
- model/tool routing expansion

These remain downstream of a passing live continuity/retrieval test.
