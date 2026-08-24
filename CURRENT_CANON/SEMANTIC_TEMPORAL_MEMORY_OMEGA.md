# ATLAS Ω — SEMANTIC TEMPORAL MEMORY Ω

**Status:** ACTIVE
**Date:** 2026-08-24
**Authority:** Infrastructure canon; subordinate to CONSTITUTION, CURRENT_CANON governance, Evidence Director Ω, Investment Committee Ω and Falsifiers Ω.

## Objective
Implement fact-centric operational memory inspired by Mem0 while preserving GitHub as ATLAS Ω canonical source of truth.

**Law:** `MEMORY ≠ TRANSCRIPT · RETRIEVAL ≠ TRUTH · REMEMBERED ≠ CANONICAL · NEWER ≠ AUTOMATICALLY CORRECT`

ATLAS must extract durable, atomic facts/state from conversations and observations instead of treating raw chat history as long-term memory. Raw transcripts may remain in source systems for audit/short-term context, but they are not the operational memory model.

## Pipeline

```text
Conversation / API / document / observation
        |
        v
Candidate Fact Extractor
        |
        v
Atomic Fact Normalizer
        |
        v
Evidence + Provenance Envelope
        |
        v
Conflict / Temporal Resolver
        |
        +--> REJECT / DUPLICATE / PENDING_CONFLICT
        |
        v
Operational Memory Store (Mem0 adapter)
        |
        v
Semantic + temporal retrieval
        |
        v
ATLAS engines / Gemelo Digital Ω
        |
        v
Canonical promotion only through GitHub governance
```

## Memory classes
Every candidate memory MUST be assigned one primary class:

- `PREFERENCE` — durable user preference.
- `RULE` — explicit operating constraint or policy.
- `DECISION` — a decision actually made, not merely proposed.
- `PORTFOLIO_STATE` — holdings, target composition, alerts, execution state.
- `OBSERVATION` — time-sensitive observed state; expires or is superseded.
- `HYPOTHESIS` — unproven causal/market thesis.
- `FALSIFIER` — condition that invalidates a thesis/decision.
- `EXTERNAL_FACT` — externally sourced factual claim requiring provenance/evidence validation.

## Canonical memory object

```json
{
  "memory_id": "uuid",
  "subject": "...",
  "predicate": "...",
  "value": "...",
  "memory_class": "PREFERENCE|RULE|DECISION|PORTFOLIO_STATE|OBSERVATION|HYPOTHESIS|FALSIFIER|EXTERNAL_FACT",
  "scope": "ATLAS|FINANCIAL|HEALTH|PSYCHOLOGICAL|HOMBRE_XXI|SPIRITUAL|GEMELO_DIGITAL|OTHER",
  "effective_from": "ISO-8601",
  "effective_to": null,
  "observed_at": "ISO-8601",
  "recorded_at": "ISO-8601",
  "confidence": 0.0,
  "source": "conversation|api|web|document|github|user_action|other",
  "source_ref": "...",
  "content_hash": "...",
  "status": "ACTIVE|SUPERSEDED|RETRACTED|PENDING_CONFLICT|EXPIRED",
  "supersedes": null,
  "superseded_by": null,
  "canonical": false,
  "ttl": null,
  "tags": []
}
```

## Atomicity gate
One memory object SHOULD represent one independently updateable proposition. Compound statements are split whenever their components could change independently.

Example input:

> User is building a FastAPI service with PostgreSQL and switched the team to TypeScript strict mode.

Store as two memories, not one.

## Conflict Resolution Ω
For the same semantic key `(subject, predicate, scope)`:

1. Exact semantic duplicate -> do not create another active memory; update retrieval metadata only.
2. Explicit user correction/decision -> new object becomes ACTIVE and prior object becomes SUPERSEDED.
3. New observation of a time-varying state -> preserve history; close prior `effective_to`; link `supersedes/superseded_by`.
4. External claim contradicting user/canon -> `PENDING_CONFLICT`; never silently overwrite canon.
5. Lower-confidence memory never replaces higher-authority canon solely because it is newer.
6. Ambiguous contradiction -> preserve both as non-canonical candidates and escalate to resolver/evidence gate.
7. `FALSIFIER` records cannot be silently deleted or weakened by a conflicting hypothesis.

## Temporal rules
- `OBSERVATION` and market state MUST carry `observed_at` and normally a TTL or explicit supersession rule.
- `PORTFOLIO_STATE` is event-sourced: changes create a new state fact and supersede the prior active fact for that key.
- Historical memories remain queryable for audit but default retrieval returns ACTIVE/effective records.
- Future-effective decisions may be stored but MUST NOT be treated as current before `effective_from`.

## Provenance and confidence
Every memory must preserve source and source reference when available. Confidence expresses extraction/evidence confidence, not investment conviction.

Suggested interpretation:
- `1.00` — explicit user instruction/confirmed canonical record.
- `0.90–0.99` — direct structured source with strong provenance.
- `0.70–0.89` — reliable extraction requiring normal validation.
- `<0.70` — do not promote; retain only as candidate when useful.

External facts remain subject to Evidence Director Ω. A remembered external claim is not a FACT merely because retrieval returned it.

## Retrieval Ω
Retrieval ranking SHOULD combine:

```text
score = semantic_relevance
      × authority_weight
      × status_weight
      × temporal_relevance
      × confidence_weight
```

Hard filters precede ranking:
- exclude `RETRACTED`;
- exclude `EXPIRED` unless historical query;
- prefer `ACTIVE` over `SUPERSEDED`;
- respect scope;
- never let semantic similarity bypass authority or falsifier gates.

Queries such as “current portfolio”, “current C3 state” or “latest rule” MUST use temporal/current-state filtering, not semantic similarity alone.

## Mem0 adapter contract
Mem0 is an implementation behind an adapter, never a constitutional dependency.

Required interface semantics:

```text
add_candidates(input, provenance) -> candidate memories
upsert(memory) -> memory_id
search(query, filters, as_of) -> ranked memories
get_current(subject, predicate, scope, as_of) -> active memory
supersede(old_id, new_memory) -> new_id
retract(memory_id, reason) -> status
history(subject, predicate, scope) -> temporal chain
```

A future memory provider must be replaceable without changing ATLAS core.

## Promotion to canon
Operational memory MAY provide context to ATLAS. It becomes canonical only when the relevant governance path writes/merges it into GitHub canon.

**Authority order:**

```text
CONSTITUTION / protected canon
> explicit current canonical decision
> explicit current user instruction
> validated evidence/state
> operational memory
> inferred candidate memory
```

Falsifiers Ω retains independent absolute veto where defined.

## Gemelo Digital Ω integration
Gemelo Digital Ω consumes current, typed memories rather than undifferentiated transcript history. Durable identity/preferences/rules can persist; rapidly changing observations must expire/supersede. Retrieval must distinguish “what is true now?” from “what was true at date X?”.

## Financial examples

```text
RULE: ai_chain_weight <= 25%
DECISION: SCCO replaces HBM
PORTFOLIO_STATE: TNET price_alert = 65 USD
OBSERVATION: AI_LAYER_C3 = NEUTRAL @ timestamp
HYPOTHESIS: AI_CAPEX monetization is propagating C1 -> C2
FALSIFIER: breadth fails downstream for defined confirmation window
```

If C3 later changes to `IMPROVING`, create a new observation, close/supersede `C3=NEUTRAL`, and preserve the historical chain. Do not mutate history invisibly.

## Anti-failure gates
- No transcript dumping into long-term memory as a substitute for extraction.
- No automatic canonicalization from Mem0.
- No silent overwrite on contradiction.
- No timeless storage of market observations.
- No retrieval result may bypass Evidence Director Ω or Falsifiers Ω.
- No secrets, credentials, account IDs or sensitive authentication material in memory.
- Do not infer a DECISION from discussion, watchlisting or a proposal.
- Do not convert a HYPOTHESIS into EXTERNAL_FACT because it was repeated.

## Success criteria
1. Current-state queries return the latest effective non-retracted fact.
2. Corrections supersede rather than coexist as equally current truth.
3. Historical state remains auditable.
4. Semantic retrieval finds relevant facts without requiring exact wording.
5. Time-sensitive observations cannot masquerade as durable facts.
6. Every externally derived memory has provenance.
7. Mem0 can be removed/replaced without altering ATLAS constitutional logic.
8. Canonical decisions remain reproducible from GitHub.
