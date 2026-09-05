# ATLAS AI — Personal Cognitive OS Ω v1.0

**Status:** CANONICAL  
**Date:** 2026-09-05  
**Persistent knowledge infrastructure:** GitHub + Notion only

## Mission

Build ATLAS AI as Vicente's persistent 24/7 personal cognitive operating system: capture life and work context, structure it, preserve longitudinal memory, close open loops, reason with explicit epistemic status, learn Vicente's decision patterns, select models/tools safely, propose what Vicente would probably do, and learn from outcomes.

ATLAS must not become another inbox Vicente has to maintain.

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
Human-readable persistent layer for:
- memory
- projects
- people and relationships
- decisions
- context
- knowledge
- open loops
- outcomes and learning

### GitHub Cognitive Kernel
Versioned machine/governance layer for:
- architecture
- schemas
- rules
- engines
- prompts
- tests
- permissions policy
- routing policy
- governance

External systems are sources/tools, not additional master memories.

## Canonical modules

1. `ATLAS Capture Ω` — voice, text, conversations and future authorized inputs.
2. `Structure Engine Ω` — atomizes captures into typed cognitive objects.
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
20. `ATLAS Model Router Ω`
21. `ATLAS Tool Router Ω`
22. `ATLAS Permission & Containment Ω`
23. `ATLAS Personal Data Gateway Ω`
24. `Result Validator Ω`
25. `ATLAS Daily Brief Ω`
26. `Live Response Ω`

## Epistemic Layer Ω

Atlas must never silently collapse distinct epistemic classes. Minimum canonical classes:

- `FACT`
- `USER_STATED`
- `INFERENCE`
- `PREFERENCE`
- `HYPOTHESIS`
- `PREDICTION`
- `STALE_MEMORY`
- `CONTRADICTION`

Every decision-relevant memory must support:

```yaml
source: <origin>
source_type: <epistemic class>
created_at: <timestamp>
valid_from: <timestamp|null>
valid_until: <timestamp|null>
confidence: <0..1>
provenance: <reference>
supersedes: <id|null>
contradicts: [<id>]
```

Atlas must distinguish an explicit Vicente statement from an inferred Vicente pattern.

Suggested inference strength:
- `EXPLICIT`
- `DERIVED_HIGH`
- `DERIVED_MEDIUM`
- `DERIVED_LOW`
- `UNKNOWN`

## Context Router Ω

A capture may belong to multiple contexts simultaneously. Routing is many-to-many, not forced single-folder classification.

Possible targets include:
- project
- person
- life area
- research thread
- investment system
- decision history
- action
- open loop

Classification should be automatic unless confidence is too low to route safely.

## Open Loops Engine Ω

Detect language and semantics such as:
- queda pendiente
- mañana miramos
- sigue
- acuérdate
- falta comprobar
- cuando ocurra X
- hay que terminar
- quiero investigar
- no hemos cerrado

Canonical object:

```yaml
open_loop:
  id: OL-YYYY-NNNNN
  project: <context>
  subject: <subject>
  status: ACTIVE|WAITING|BLOCKED|RESOLVED|DISMISSED
  created_from: <provenance>
  objective: <definition of done>
  evidence_required: <standard>
  last_progress: <summary>
  next_best_action: <action>
  waiting_for: <event/person/date|null>
  confidence: <0..1>
```

A future input such as `Sigue` must resolve against active context/open loops rather than start from zero.

## Vicente Decision Model Ω

The Digital Twin is not merely memory. It models Vicente's decision function longitudinally.

Canonical training trace:

```text
situation
→ information available at the time
→ relevant preferences
→ constraints
→ alternatives considered
→ Vicente's actual decision
→ outcome
→ learning
```

Decision Prediction must compare current situations with historical analogues, stable and time-varying preferences, constraints, contradictions, outcomes and explicit statements.

Predictions must include confidence and provenance and must never be represented as remembered facts.

## Contradiction Detection Ω

Detect at least:
- explicit statement vs explicit statement
- current preference vs stale preference
- rule vs proposed action
- decision vs stated objective
- inferred pattern vs new observed behavior
- evidence vs stored hypothesis

Contradiction is a first-class object, not an error to hide.

## Two-speed cognition

### LIVE
For time-sensitive inputs, immediate responses, urgent open loops and authorized alerts.

### CONSOLIDATION
Periodic maintenance for:
- deduplication
- memory consolidation
- stale-memory detection
- contradiction review
- relationship updates
- open-loop reconciliation
- decision outcome ingestion
- briefing preparation

## ATLAS Executive Ω

The Executive decides what deserves Vicente's attention.

Internal processing volume must not become UI volume. Atlas may process many objects while surfacing only the few that change a decision, require approval, create risk, or deserve attention.

## Model Router Ω

```text
TASK
→ classify capability
→ eligible models
→ rank by reasoning fit / modality / reliability / privacy / latency / cost
→ execute
→ validate
```

The Vicente Model and persistent memory must remain provider-independent.

## Tool Router Ω

```text
INTENT
→ REQUIRED CAPABILITY
→ TOOL DISCOVERY
→ ELIGIBLE TOOLS
→ RANK
   capability
   reliability
   privacy
   permissions
   latency
   cost
   provenance
→ BEST TOOL
→ EXECUTION
→ VALIDATION
```

Atlas routes by capability, not by hard-coded product identity where avoidable.

## Permission & Containment Ω

Minimum capability classes:

- `READ`
- `WRITE`
- `CREATE`
- `MODIFY`
- `DELETE`
- `COMMUNICATE`
- `PURCHASE`
- `FINANCIAL`
- `LEGAL`
- `IDENTITY`
- `EXTERNAL_WEB`
- `PERSONAL_DATA`

Every executable action should be evaluable as:

```yaml
action:
  capability: <capability>
risk:
  level: LOW|MEDIUM|HIGH|CRITICAL
permission:
  granted: true|false
scope: <authorized scope>
requires_user_confirmation: true|false
audit:
  provenance: <origin>
  timestamp: <time>
```

High-impact financial, legal, identity, destructive, purchase or external-communication actions require explicit policy and, by default, human approval.

## Personal Data Gateway Ω

External systems remain at source. Atlas retrieves authorized data when required and persists only relevant structured knowledge, references, relationships and provenance into the GitHub/Notion architecture.

Potential sources/tools include email, calendar, contacts, Drive, photos, documents, web and future authorized services.

## Result Validator Ω

Before a result becomes action, durable knowledge, or decision-model evidence, validate:
- task completion
- provenance
- epistemic class
- permission compliance
- contradictions
- confidence
- expected vs observed outcome where applicable

## Canonical end-to-end flow

```text
CAPTURE
→ STRUCTURE
→ CONTEXT ROUTING
→ MEMORY RETRIEVAL
→ UNDERSTANDING
→ REASONING
→ VICENTE MODEL
→ PREDICTION (when relevant)
→ EXECUTIVE
→ MODEL/TOOL SELECTION
→ PERMISSION CHECK
→ ACTION / RESPONSE
→ RESULT VALIDATION
→ LEARNING
→ CONSOLIDATION
```

## Construction order

### Phase 1 — Memory Foundation
Capture, typed schemas, Structure Engine, Context Router, provenance and epistemic layer.

### Phase 2 — Operational Memory
Memory Retrieval, Open Loops Engine, Actions, Zero-Inbox lifecycle and Daily Brief.

### Phase 3 — Personal Graph
People/Relationships, projects, decisions and transversal graph links.

### Phase 4 — Digital Twin
Vicente Model, longitudinal decision traces, temporal preferences, outcomes and learning.

### Phase 5 — Cognitive Intelligence
Contradiction Detection and Decision Prediction with calibrated confidence/provenance.

### Phase 6 — Atlas Executive & Execution
Executive attention policy, Model Router, Tool Router, Permission & Containment, Personal Data Gateway and Result Validator.

## First functional acceptance test

Atlas passes the first meaningful MVP test when Vicente can end a multi-day research conversation, return later and say only `Sigue`, and Atlas can reliably recover:

1. the correct active project/thread;
2. what is already established;
3. what remains hypothesis;
4. the unresolved open loop;
5. the evidence standard required;
6. the next best action;
7. provenance for the recovered state.

## Durable moat

ATLAS's durable advantage is not a particular LLM. It is the accumulated and governed combination of:

`longitudinal decisions + preferences + outcomes + projects + relationships + contradictions + rules + memory + provenance + execution history`.

---

**Canonical target:** ATLAS AI is a persistent personal cognitive OS, not a chatbot with memory and not a note-taking application.