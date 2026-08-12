# ATLAS Ω — THREAD PERSISTENCE LAW

Status: CANONICAL GOVERNANCE RULE — INVIOLABLE
Effective date: 2026-08-12
Scope: ALL ATLAS OS branches and all relevant analytical threads

## Inviolable rule

Every ATLAS-relevant thread MUST be persisted in both:

1. **GitHub** — versioned, canonical, implementation and evidence layer.
2. **Notion** — visual, relational, navigable knowledge layer.

A thread is **not considered archived, implemented or complete** until both writes exist.

This rule is automatic. If the destinations are already known, ATLAS MUST NOT ask for confirmation before attempting the dual write.

## Dual-write contract

`THREAD -> GitHub + Notion -> COMPLETE`

If only one write succeeds:

`THREAD -> PARTIAL_SYNC / PENDING_SECOND_WRITE`

The system MUST NOT report the thread as fully persisted while either destination is missing.

## Operational enforcement

Every relevant persistence event should preserve, when practical:

- `sync_id` — stable identifier shared by both copies;
- effective/capture date;
- GitHub repository + path;
- Notion page ID / URL;
- `sync_status`: `COMPLETE` or `PARTIAL_SYNC`;
- affected ATLAS branch / engine;
- epistemic state: fact, evidence, hypothesis, interpretation, decision, implementation or work-in-progress.

### Completion gate

An ATLAS task that explicitly requires GitHub + Notion persistence cannot be declared **DONE**, **ARCHIVED**, **IMPLEMENTED** or **SYNCED** unless:

`github_write == SUCCESS AND notion_write == SUCCESS`

Otherwise the only admissible persistence state is:

`PARTIAL_SYNC`

### Same-interaction rule

When the user instructs `GitHub y Notion`, `ley inviolable`, or an equivalent dual-persistence command, ATLAS must attempt both writes in the same interaction whenever both connectors are available.

Chat history alone never satisfies persistence.

### Failure behavior

If one destination fails:

1. preserve the successful write;
2. mark the event `PARTIAL_SYNC`;
3. retry the missing destination when the tool surface permits within the same interaction;
4. never fabricate a successful second write;
5. report exactly which side remains unsynchronized.

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
- cross-links to related GitHub and Notion material;
- explicit WIP status for incomplete research.

## Implementation dual-sync clause — INVIOLABLE

Every ATLAS implementation — feature, fix, API integration, connector, architecture change, workflow, deployment, migration or rollback — MUST be recorded in both GitHub and Notion.

`IMPLEMENTATION -> GitHub + Notion -> COMPLETE`

An implementation is **not DONE** merely because code works, a workflow is green, an APK builds, a backend deploys, or a Notion page exists. Completion requires both sides.

### GitHub implementation record
- executable code/configuration and tests where applicable;
- commit/PR/run traceability;
- rollback point or recovery path for material changes;
- implementation documentation when the change affects architecture, providers, data contracts or governance.

### Notion implementation record
- what changed and why;
- current operational status;
- affected ATLAS modules/branches;
- GitHub commit/PR/run links when applicable;
- validation result, known limitations and next action;
- rollback/reference state for material changes.

If either write is missing, the implementation state is:

`PARTIAL_SYNC / NOT COMPLETE`

No material ATLAS implementation may exist only in chat history, only in GitHub, or only in Notion. GitHub remains the canonical executable/versioned layer; Notion remains the navigable operational/knowledge layer. They MUST stay synchronized.

## Non-negotiable behavior

This law applies across **all ATLAS branches**, not only Atlas Financiero Ω.

No relevant thread may be intentionally retained only in chat history.

No material implementation may be declared complete until its GitHub and Notion records both exist.

No arbitrary simplification, pruning, or omission may silently remove a relevant thread from one side of the dual-write system.

## Governance

This file defines a higher-layer persistence and implementation-synchronization rule and does **not** modify CORE-00 or add a sixth core engine.

Supersession rule: any older persistence guidance that conflicts with this document is superseded by this law.
