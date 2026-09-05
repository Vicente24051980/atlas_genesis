# ATLAS AI — Memory Foundation Ω v1

This module is the first executable slice of **ATLAS AI — Personal Cognitive OS Ω v1.0**.

## Scope

Implemented now:

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

Not implemented yet:

- actual Notion read/write adapter
- actual GitHub memory adapter
- semantic/LLM parser
- embeddings or vector retrieval
- relationship graph persistence
- Vicente Decision Model
- Decision Prediction
- Contradiction Detection
- model/tool routing
- autonomous execution

## Persistent storage rule

Only **Notion + GitHub** are canonical persistent knowledge layers.

This engine is pure logic. Storage adapters are deliberately separate so the cognitive schema is not coupled to a database vendor.

## First acceptance contract

Given a longitudinal state containing:

- active project;
- established facts/claims;
- hypotheses;
- unresolved open loops;
- provenance;

then a bare follow-up such as `Sigue` must recover the highest-confidence relevant open loop from the active project and return its next best action **without inventing missing context**.

## Critical epistemic rule

`Memory != Digital Twin`.

An explicit statement by Vicente is stored as explicit memory. A future conclusion about what Vicente would probably do is a derived prediction and must carry independent confidence + provenance. Predictions must never be silently promoted into remembered user statements.
