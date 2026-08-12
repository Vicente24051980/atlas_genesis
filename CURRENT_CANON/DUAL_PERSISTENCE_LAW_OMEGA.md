# DUAL PERSISTENCE LAW Ω — GitHub + Notion

Status: **INVIOLABLE CANONICAL LAW**  
Effective: **2026-08-12**

## Law

Every ATLAS Ω implementation that changes canon, operating rules, portfolio universes, engines, algorithms, guardrails, research conclusions promoted to canon, health tracking rules, or system architecture MUST be persisted in **both GitHub and Notion**.

**GitHub + Notion is mandatory dual persistence.**

A change written to only one layer is not considered a completed implementation.

## Required state machine

- `PENDING` — requested but not written.
- `GITHUB_ONLY` — written to GitHub, Notion missing.
- `NOTION_ONLY` — written to Notion, GitHub missing.
- `PERSISTENCE_INCOMPLETE` — any one-sided state.
- `DUAL_PERSISTED` — GitHub and Notion both updated and verified.

Only `DUAL_PERSISTED` counts as implementation complete.

## Responsibilities of each layer

### GitHub

Canonical technical/versioned source for:
- code and algorithms;
- immutable or versioned rules;
- CURRENT_CANON documents;
- schemas, tests, APIs and runtime implementation;
- auditable history and commit trace.

### Notion

Canonical visual/relational knowledge layer for:
- human-readable canon summaries;
- connected system architecture;
- current portfolio/universe views;
- rules, rationale and operational status;
- links back to GitHub source when applicable.

## Inviolable rules

1. No assistant may claim **implemented**, **saved**, **canonical**, **done**, or equivalent if only one persistence layer was updated.
2. If one connector/write fails, report `PERSISTENCE_INCOMPLETE` explicitly and identify which side failed.
3. Do not silently defer the missing side to a later turn.
4. GitHub code/version history remains authoritative for technical implementation; Notion remains the visual/relational mirror. Dual persistence does not erase source-of-truth distinctions.
5. Contradictions between GitHub and Notion trigger an immediate reconciliation audit; they must not be resolved by silently choosing the more convenient copy.
6. Historical material need not be retroactively duplicated unless it is promoted or modified as current canon.
7. User instructions explicitly saying not to touch one layer override execution for that turn, but the state must be marked `PERSISTENCE_INCOMPLETE` until dual persistence is restored.

## Completion check

Before declaring completion, verify:

`GitHub write successful AND Notion write successful => DUAL_PERSISTED`

Anything else:

`=> PERSISTENCE_INCOMPLETE`

## Scope

This law applies across ATLAS OS and all branches, including Atlas Financiero Ω, Salud, Gemelo Digital, Biblioteca, IA/Tecnología, Proyectos, Economía/Geopolítica, Psicológico and future branches.
