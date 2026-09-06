# ATLAS AI — Memory Foundation Ω v1

This module is the first executable slice of **ATLAS AI — Personal Cognitive OS Ω v1.0**.

## Current status

The first preregistered continuity test failed because historical retrieval recovered only 1/10 target project contexts. The remediation therefore targets retrieval directly rather than adding Digital Twin or agent architecture.

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

The live human-readable registry is **ATLAS Continuity Registry Ω** in Notion. It stores, per project:

- project ID and state;
- established claims;
- hypotheses;
- current open loop;
- next best action;
- evidence standard;
- provenance;
- update date.

GitHub owns the retrieval contract, deterministic logic, tests and governance. The Notion client/authentication boundary remains outside the pure cognitive engine; runtime code must map rows from the Notion registry into `ContinuityRegistryRecord` objects before calling the retrieval function.

## Retrieval rule

A bare `Sigue` is never allowed to pick whichever open loop has the highest global confidence.

Resolution order:

1. exact project hint;
2. explicit active-project context;
3. if exactly one project is active, use it;
4. otherwise fail closed as ambiguous.

For non-bare queries, lexical retrieval must clear a minimum evidence threshold and an ambiguity margin. Weak matches return no state.

## Acceptance contract

Given a persisted project state containing:

- active project;
- established claims;
- hypotheses;
- unresolved open loop;
- next best action;
- provenance;

then `Sigue` with the correct active-project context must recover the same project state without promoting any hypothesis into `established`.

## Critical epistemic rule

`Memory != Digital Twin`.

An explicit or validated memory remains separate from a hypothesis. Repeated retrieval has zero evidentiary weight. The continuity layer copies hypotheses into `hypotheses`; it must never silently move them into `established`.

## Deliberately not promoted yet

- Vicente Decision Model
- Decision Prediction
- relationship graph inference
- autonomous execution
- model/tool routing expansion

These remain downstream of a passing continuity/retrieval test.
