# ATLAS AI — Personal Cognitive OS Ω v1.0

**Status:** CANONICAL — ARCHITECTURE FROZEN / NEW IMPLEMENTATION PAUSED  
**Date:** 2026-09-06  
**Persistent knowledge infrastructure:** GitHub + Notion only

## Mission

Build ATLAS AI as Vicente's persistent 24/7 personal cognitive operating system: capture life and work context, structure it, preserve longitudinal memory, close open loops, reason with explicit epistemic status, learn Vicente's decision patterns, select models/tools safely, propose what Vicente would probably do, and learn from outcomes.

ATLAS must not become another inbox Vicente has to maintain.

## Current implementation decision — 2026-09-06

The target architecture is preserved, but **new implementation work is paused before further expansion**. The existing experimental Memory Foundation work must not be promoted merely because it exists.

When the next model generation Vicente intends to evaluate is actually available with verifiable capabilities, ATLAS will run a capability audit before resuming implementation:

`REAL CAPABILITIES → GAP ANALYSIS AGAINST ATLAS OS → ARCHITECTURE REVIEW → CANON UPDATE → TESTS → IMPLEMENTATION → MERGE`

No architecture will be designed around unverified or assumed future-model capabilities.

Existing experimental PR/work should remain experimental until tests and architectural review justify promotion.

## ATLAS LAW — ZERO-INBOX Ω

**Atlas must not create work for Vicente.**

Every captured unit should resolve, except explicit exceptions, to one of:

- `ARCHIVED`
- `KNOWLEDGE`
- `ACTION`
- `WAITING`
- `DISMISSED`

## ATLAS LAW — MVP SMALL, ARCHITECTURE LARGE Ω

Implement the smallest useful slice first, while schemas and interfaces remain compatible with the target architecture. Early shortcuts must not destroy provenance, temporal validity, relationships, open loops, decision history, permissions, or future model/tool portability.

## ATLAS LAW — COGNITIVE SOVEREIGNTY Ω

The LLM is replaceable. Vicente's accumulated structured knowledge, decision history, relationships, rules, contradictions, provenance and longitudinal context are the durable asset.

No model provider owns the Vicente Model.

## ATLAS LAW — REASONING ≠ AUTHORITY Ω

Capability does not imply permission. Atlas may understand how to perform an action while remaining unauthorized to execute it.

## Persistent architecture

### Notion Knowledge Layer
Human-readable persistent layer for memory, projects, people and relationships, decisions, context, knowledge, open loops, outcomes and learning.

### GitHub Cognitive Kernel
Versioned machine/governance layer for architecture, schemas, rules, engines, prompts, tests, permissions policy, routing policy and governance.

External systems are sources/tools, not additional master memories.

## Canonical modules

1. `ATLAS Capture Ω`
2. `Structure Engine / ATLAS Parser Ω`
3. `IDEAS`
4. `DECISIONS`
5. `COMMITMENTS`
6. `PEOPLE / RELATIONSHIPS`
7. `OPEN_LOOPS`
8. `ACTIONS`
9. `Context Router Ω`
10. `Notion Knowledge Layer`
11. `GitHub Cognitive Kernel`
12. `Atlas Memory Retrieval Ω`
13. `Relationship Graph Ω`
14. `Open Loops Engine Ω`
15. `Vicente Decision Model Ω / Digital Twin`
16. `Contradiction Detection Ω`
17. `Decision Prediction Ω`
18. `Confidence + Provenance Ω`
19. `ATLAS Executive Ω`
20. `ATLAS Agent Harness Ω`
21. `ATLAS Model Router Ω`
22. `ATLAS Tool Router Ω`
23. `ATLAS Permission & Containment Ω`
24. `ATLAS Personal Data Gateway Ω`
25. `Result Validator Ω`
26. `ATLAS Daily Brief Ω`
27. `Live Response Ω`

## Agent Harness Ω

Agent execution is governed as an iterative harness rather than an unconstrained prompt loop:

`OBJECTIVE → PLAN → MODEL/TOOL ROUTING → EXECUTE → VALIDATE → PASS | MATERIAL RETRY | ESCALATE → LEARNING`

Invariants:
1. `NO LOOP WITHOUT STOP CONDITION`
2. `NO ACTION WITHOUT PERMISSION CHECK`
3. `NO SUCCESS WITHOUT VALIDATION`
4. `NO MEMORY WRITE WITHOUT PROVENANCE`
5. `NO RETRY WITHOUT MATERIAL CHANGE`
6. `NO HIGH-RISK EXECUTION WITHOUT HUMAN AUTHORITY`

## Epistemic Layer Ω

Minimum canonical classes:
`FACT`, `USER_STATED`, `INFERENCE`, `PREFERENCE`, `HYPOTHESIS`, `PREDICTION`, `STALE_MEMORY`, `CONTRADICTION`.

Every decision-relevant memory supports source, date, confidence, validity, provenance, supersession and contradictions. Atlas must distinguish an explicit Vicente statement from an inferred Vicente pattern.

Inference strength:
`EXPLICIT`, `DERIVED_HIGH`, `DERIVED_MEDIUM`, `DERIVED_LOW`, `UNKNOWN`.

## Context Router Ω

Routing is many-to-many. A capture may simultaneously belong to projects, people, life areas, research threads, investment systems, decision history, actions and open loops. Classification is automatic unless confidence is insufficient.

## Open Loops Engine Ω

Open loops are first-class persistent objects containing objective, status, evidence requirement, last progress, next best action, dependency/date and provenance. A future input such as `Sigue` must resolve against active context/open loops rather than restart from zero.

## Memory ≠ Digital Twin

Remembering an explicit statement is memory. Predicting what Vicente would probably do from longitudinal decisions, preferences, constraints, outcomes and contradictions is the Digital Twin / Vicente Decision Model. Predictions must never be represented as remembered facts.

## Vicente Decision Model Ω

Canonical training trace:

`situation → information available → relevant preferences → constraints → alternatives considered → Vicente actual decision → outcome → learning`

## Two-speed cognition

- **LIVE:** time-sensitive inputs, immediate responses, urgent open loops and authorized alerts.
- **CONSOLIDATION:** deduplication, memory consolidation, stale-memory detection, contradiction review, relationship updates, open-loop reconciliation, decision outcomes and briefing preparation.

## ATLAS Executive Ω

Internal processing volume must not become UI volume. The Executive surfaces only what changes a decision, requires approval, creates risk or deserves Vicente's attention.

## Permission & Containment Ω

Reasoning is separate from authority. Minimum capability classes include `READ`, `WRITE`, `CREATE`, `MODIFY`, `DELETE`, `COMMUNICATE`, `PURCHASE`, `FINANCIAL`, `LEGAL`, `IDENTITY`, `EXTERNAL_WEB`, `PERSONAL_DATA`. High-impact actions default to human approval unless explicit policy states otherwise.

## Canonical end-to-end flow

`CAPTURE → STRUCTURE → CONTEXT ROUTING → MEMORY RETRIEVAL → UNDERSTANDING → REASONING → VICENTE MODEL → PREDICTION → EXECUTIVE → AGENT HARNESS → MODEL/TOOL SELECTION → PERMISSION CHECK → ACTION/RESPONSE → RESULT VALIDATION → LEARNING → CONSOLIDATION`

## Construction order after capability audit

1. **Memory Foundation** — Capture, schemas, Parser, Context Router, provenance and epistemic layer.
2. **Operational Memory** — Memory Retrieval, Open Loops, Actions, Zero-Inbox and Daily Brief.
3. **Personal Graph** — People/Relationships, projects, decisions and transversal graph.
4. **Digital Twin** — Vicente Model, longitudinal decisions, temporal preferences, outcomes and learning.
5. **Cognitive Intelligence** — Contradiction Detection and Decision Prediction.
6. **Atlas Executive & Execution** — Executive, Agent Harness, Model Router, Tool Router, Permission & Containment, Personal Data Gateway and Result Validator.

## First functional acceptance test

Atlas passes the first meaningful MVP test when Vicente can end a multi-day research conversation, return later and say only `Sigue`, and Atlas reliably recovers the correct project/thread, established evidence, remaining hypotheses, unresolved open loop, evidence standard, next best action and provenance.

## Durable moat

ATLAS's durable advantage is not a particular LLM. It is:

`longitudinal decisions + preferences + outcomes + projects + relationships + contradictions + rules + memory + provenance + execution history`.

---

**Canonical target:** ATLAS AI is a persistent Personal Cognitive OS, not a chatbot with memory and not a note-taking application. Architecture preserved; new implementation remains paused until the planned next-model capability audit.