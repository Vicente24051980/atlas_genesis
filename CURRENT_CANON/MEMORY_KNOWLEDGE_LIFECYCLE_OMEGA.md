# ATLAS Ω — Memory & Knowledge Lifecycle Ω v1.1

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

## User memory vs Agent memory — explicit design decision
ATLAS uses BOTH, with hard namespace separation.

### USER / CONSTITUTIONAL MEMORY
Stores explicit mandates, portfolio constraints, accepted canon, durable preferences and user-approved operating rules.
- authority: highest
- write policy: explicit user statement or accepted canon only
- persistence: indefinite until explicit supersession
- agent inference may never silently enter this namespace

### AGENT / ANALYTICAL MEMORY
Stores hypotheses, intermediate conclusions, research state, event interpretations, temporary rankings and inferred relationships.
- authority: subordinate to evidence and USER/CONSTITUTIONAL memory
- write policy: provenance + confidence + temporal validity mandatory
- persistence: class-specific TTL/revalidation
- repeated inference does not become canonical truth

Conflict rule: USER/CONSTITUTIONAL memory governs mandates; external FACT evidence governs factual truth. A user preference cannot convert a false factual claim into FACT.

## Retrieval architecture — explicit design decision
ATLAS uses HYBRID RETRIEVAL, not Vector OR Graph.

1. EXACT/KEY retrieval — ticker, date, engine, experiment ID, canonical rule, commit/report ID.
2. VECTOR/SEMANTIC retrieval — fuzzy concept recall, analogous cases, narrative similarity and broad discovery.
3. GRAPH retrieval — explicit causal, ownership, supply-chain, customer, competitor, CAPEX and monetization relationships.

Retrieval ranking = semantic relevance × authority × freshness × evidence quality × entity/date match, with superseded/expired records filtered before decisive use.

Vector similarity can discover evidence but cannot establish a relationship. Graph edges can encode relationships but cannot establish economic materiality. Both must pass Memory Quality Gate Ω before affecting a verdict.

## Mandatory metadata contract
memory_id; namespace(user|agent); class; subject/entity; ticker(s); engine(s); created_at; observed_at; effective_from; expires_at/revalidate_at; source/provenance; evidence_grade; confidence; status; supersedes; superseded_by; experiment_id; regime/context; falsifiers; tags.

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

## Mem0 cookbook signal — 20-Aug-2026
The Mem0 guidance emphasizing User vs Agent memory, Vector vs Graph retrieval, persistence and metadata is treated as architecture validation, not vendor lock-in. ATLAS adopts the design principles independently of storage vendor. Mem0 remains an implementation candidate/adapter, not a constitutional dependency.

## Canonical principle
MEMORY ≠ TRUTH.
MEMORY + PROVENANCE + TEMPORAL VALIDITY + EVIDENCE + CONTRADICTION CONTROL → USABLE KNOWLEDGE.
