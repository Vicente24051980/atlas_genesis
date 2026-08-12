# ATLAS Ω — THREAD PERSISTENCE LAW

Status: CANONICAL GOVERNANCE RULE
Effective date: 2026-08-12
Scope: ALL ATLAS OS branches and all relevant analytical threads

## Inviolable rule

Every ATLAS-relevant thread MUST be persisted in both:

1. **GitHub** — versioned, canonical, implementation and evidence layer.
2. **Notion** — visual, relational, navigable knowledge layer.

A thread is **not considered archived or complete** until both writes exist.

## Dual-write contract

`THREAD -> GitHub + Notion -> COMPLETE`

If only one write succeeds:

`THREAD -> PARTIAL_SYNC / PENDING_SECOND_WRITE`

The system MUST NOT report the thread as fully persisted while either destination is missing.

## GitHub role

GitHub is the durable/versioned source for:
- canonical rules and governance;
- research notes and evidence snapshots;
- algorithms, schemas and implementation;
- change history and auditability.

## Notion role

Notion is the human-facing knowledge graph for:
- navigation across branches;
- summaries and decision context;
- backlinks and relationships;
- operational retrieval and review.

A copy in Notion does not by itself promote information to canonical evidence. Canonical status remains governed by ATLAS evidence and governance rules.

## Capture standard

Each persisted thread should preserve, when applicable:
- date and source;
- raw/user-supplied thesis;
- facts vs interpretations vs hypotheses;
- affected ATLAS engines or branches;
- implementation/read-through;
- falsifiers and unresolved verification items;
- cross-links to related GitHub and Notion material.

## Non-negotiable behavior

This law applies across **all ATLAS branches**, not only Atlas Financiero Ω.

No relevant thread may be intentionally retained only in chat history.

## Governance

This file defines a higher-layer persistence rule and does **not** modify CORE-00 or add a sixth core engine.
