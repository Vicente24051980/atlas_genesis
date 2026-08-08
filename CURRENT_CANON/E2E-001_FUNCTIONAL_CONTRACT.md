# E2E-001 — Functional Contract

Status: Conceptually Frozen / Execution Pending
Layer: Above CORE-00
Core impact: NONE

## Purpose

E2E-001 formalizes the separation between preserving meaning and granting truth. ATLAS may retain an idea, attribution, hypothesis or interpretation without promoting it to canonical evidence.

> ATLAS debe ser capaz de conservar una idea sin tener que creerla.

## Operational success contract

A successful E2E-001 execution MUST satisfy all of the following:

1. The input successfully passes CORE-00.
2. The higher layer classifies the resulting material into the appropriate epistemic class:
   - fact
   - evidence
   - hypothesis
   - interpretation
3. Authorship and context are preserved.
4. Narratives are not promoted to evidence merely because they are coherent, attractive, repeated or attributable.
5. Gemelo Digital is updated only at the epistemic level justified by the classified material.
6. The system produces a certified, traceable output.

## Architectural boundary

`Input/Transcript -> UO 1.1 + CORE-00 Harness -> Orchestrator -> Epistemic Classification Skill -> Facts | Evidence | Hypotheses | Interpretations -> destination routing -> Gemelo Digital (when admissible) -> Certified Traceable Output`

E2E-001 MUST NOT modify CORE-00, UO 1.1 RC1, the frozen five-engine pipeline, or the frozen 30-case corpus.

## Meaning preservation vs truth concession

The system MUST preserve documentary meaning while keeping epistemic status explicit.

Examples:

- `Author X argues Y` may be retained as a sourced fact about X's stated position.
- `Y is objectively true` does NOT follow from the previous statement.
- A hypothesis may remain investigable without becoming canonical evidence.
- An interpretation may be archived with attribution and context while retaining `canonical_evidence = false` unless independently promoted by the applicable evidence rules.

## Routing intent

- Biblioteca Atlas: documentary facts, sourced positions and preserved context.
- Evidence layer: admissible evidence evaluated under current standards.
- Atlas Conspiraciones: investigable hypotheses without automatic truth promotion.
- Interpretations: preserved with explicit attribution and epistemic status.
- Gemelo Digital: receives only updates justified by the epistemic level and relevant contract.

## Anti-attribution-of-intention invariant

`Observed conduct -> incentive structure -> motivation hypothesis -> additional evidence required`

Observed outcomes MUST NOT be converted directly into claims of hidden intent.

## Execution gate

Conceptual design is closed for E2E-001. No additional conceptual architecture is required before testing.

The next valid action is an execution against a real transcript/input, using the actual Orchestrator + Epistemic Classification Skill, and inspecting the produced certified output.

### Required execution evidence

The first real run SHOULD retain, at minimum:

- immutable input reference/hash from the applicable runtime path;
- CORE-00 admission result;
- classification result for each material assertion;
- attribution/context preservation evidence;
- routing destination(s);
- Gemelo Digital mutation or explicit `NO_UPDATE` with reason;
- output certification metadata;
- trace linking input -> classifications -> routes -> output.

## Pass criterion

E2E-001 passes its litmus test only if ATLAS can preserve a meaningful idea without silently converting preservation into belief, evidence, fact or thesis.