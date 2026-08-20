# ATLAS Ω — Memory & Knowledge Lifecycle Ω v1.0

Status: ACTIVE CANON
Effective: 2026-08-20
Purpose: prevent stale, duplicated or contextless memory from contaminating evidence, decisions and calibration.

## Constitutional objective
ATLAS must not merely remember more. It must know what a memory represents, how durable it is, what evidence supports it, when it expires, and what supersedes it.

## Memory classes
1. SEMANTIC — constitutions, canonical rules, engine definitions, durable company/industry relationships.
2. EPISODIC — dated market events, sessions, earnings, macro shocks and decisions.
3. EXPERIMENTAL — baskets, tests, frozen universes, measurement windows and control groups.
4. CALIBRATION — observed successes/failures used to change engine behavior; never rewrite the historical result retrospectively.
5. GRAPH — explicit relationships among companies, assets, technologies, customers, suppliers, catalysts and risks.

## Agent vs user memory separation
- USER/CONSTITUTIONAL MEMORY: mandates, constraints, portfolio rules, accepted canon. Highest persistence; changes only by explicit replacement or constitutional conflict resolution.
- AGENT/ANALYTICAL MEMORY: hypotheses, intermediate conclusions, inferred relationships and temporary research state. Must carry provenance, confidence and expiry/revalidation rules.
Never promote an agent inference into user/canonical memory merely through repetition.

## Retrieval architecture
Use hybrid retrieval where available:
- vector/semantic retrieval for concept similarity;
- graph retrieval for explicit causal/supply-chain/entity relationships;
- exact-key retrieval for ticker, engine, date, experiment ID and canonical rule.
Retrieval rank must consider relevance × authority × freshness × evidence quality, not semantic similarity alone.

## Mandatory metadata contract
memory_id; class; subject/entity; ticker(s); engine(s); created_at; observed_at; effective_from; expires_at/revalidate_at; source/provenance; evidence_grade; confidence; status; supersedes; superseded_by; experiment_id; regime/context; falsifiers; tags.

## Lifecycle states
ACTIVE → REVALIDATE → SUPERSEDED / EXPIRED / RETIRED.
Canonical rules may also be MODIFIED under ATLAS constitutional thesis-state discipline.

## TTL / revalidation policy
TTL is class-dependent, not universal:
- Constitutional/canonical rules: no automatic expiry; explicit supersession required.
- Company structural facts: revalidate on new filing/material event or scheduled review.
- Analyst targets/recommendations: short-lived; revalidate on new note/earnings/material price move.
- Macro regime variables/yields/commodities: intraday/daily freshness required according to decision horizon.
- Money Rotation/intraday flow: session-scoped; expires after the session unless explicitly converted into persistence evidence.
- Earnings/event reactions: episodic and immutable as history, but current relevance decays.
- Experiments: immutable observation window plus separate post-test interpretation.
- Calibration lessons: persistent until falsified by sufficient new evidence; never delete the original failure/success record.

## Contradiction and supersession protocol
When new evidence conflicts with memory:
1. Preserve the old record as historical evidence.
2. Mark its current status appropriately.
3. Link new ↔ old through supersedes/superseded_by.
4. Record why the change occurred and evidence grade.
5. Do not silently overwrite a calibration outcome.

## Graph memory schema
Minimum edge: source_entity → relationship → target_entity, with timestamp, confidence, provenance and validity window.
Example categories: supplier_of, customer_of, capex_payer_to, competes_with, substitutes_for, depends_on, monetizes_usage_of, exposed_to, catalyst_for.
Graph edges are hypotheses unless supported by evidence; graph centrality is not Economic Proof.

## ATLAS integration
All engines may read this layer but cannot silently mutate canonical truth. Investment Committee Ω receives memory provenance/freshness with evidence. Money Rotation Ω must reject stale session flow. AI CAPEX PAYBACK Ω must distinguish historical CAPEX from current economics. Clinical Evidence Shock Ω must retain event chronology. AI Tollbooth Ω may use graph edges for discovery but must independently satisfy T0–T4 evidence gates.

## Memory Quality Gate Ω
Before a remembered fact materially affects BUY/HOLD/WATCH/REJECT, test:
M1 provenance known;
M2 correct entity/date/context;
M3 freshness adequate for decision horizon;
M4 not superseded;
M5 evidence grade sufficient;
M6 contradiction scan completed.
Failure of M1–M4 blocks decisive use. M5/M6 downgrade confidence or trigger revalidation.

## Canonical principle
MEMORY ≠ TRUTH.
MEMORY + PROVENANCE + TEMPORAL VALIDITY + EVIDENCE + CONTRADICTION CONTROL → USABLE KNOWLEDGE.
