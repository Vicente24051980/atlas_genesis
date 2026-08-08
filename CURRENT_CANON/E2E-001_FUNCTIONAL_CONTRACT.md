# E2E-001 — Functional Contract

Status: Conceptually Frozen / Execution Pending
Layer: Upper orchestration layer
Core impact: NONE

## Closure axiom

> **ATLAS debe ser capaz de conservar una idea sin tener que creerla.**

E2E-001 formalizes the separation between preserving meaning and granting truth. ATLAS may retain an idea, attribution, hypothesis or interpretation without promoting it to canonical evidence.

## E2E-001 Benchmark — Operational Success Criterion

A successful E2E-001 execution MUST satisfy all six criteria:

1. **Ingesta e Integridad**
   - The payload passes `CORE-00` using `UO 1.1 RC1 + Harness`.

2. **Triaje Epistémico**
   - The `Epistemic Classification Skill` strictly classifies material as:
     - Hecho / Fact
     - Evidencia / Evidence
     - Hipótesis / Hypothesis
     - Interpretación / Interpretation

3. **Trazabilidad y Autoría**
   - Origin, emitter/author and context are preserved explicitly.
   - Attribution MUST remain `preserved` when applicable.

4. **Inmunidad a Narrativas**
   - No interpretive, rhetorical or narrative frame may automatically ascend to evidence.
   - Coherence, repetition, attractiveness or attribution alone are insufficient for evidence promotion.

5. **Actualización Causal del Gemelo Digital**
   - `Incentives` and `Values` nodes are adjusted only at the epistemic certainty level actually verified.
   - Unsupported interpretation MUST NOT be written as demonstrated value, fact or causal certainty.

6. **Output Certificado**
   - The final output is signed/certified and traceable across the three upper repositories:
     - `Biblioteca Atlas`
     - `Atlas Conspiraciones`
     - `Gemelo Digital`

## Architectural boundary

`Payload/Transcript -> UO 1.1 RC1 + CORE-00 Harness -> Orchestrator -> Epistemic Classification Skill -> Facts | Evidence | Hypotheses | Interpretations -> Biblioteca Atlas | Atlas Conspiraciones | Gemelo Digital -> Certified Traceable Output`

E2E-001 MUST NOT modify `CORE-00`, the frozen five-engine pipeline, UO 1.1 RC1, or the frozen 30-case corpus.

## Meaning preservation vs truth concession

The system MUST preserve documentary meaning while keeping epistemic status explicit.

Examples:

- `Author X argues Y` may be retained as a sourced fact about X's stated position.
- `Y is objectively true` does NOT follow from that statement.
- A hypothesis may remain investigable without becoming canonical evidence.
- An interpretation may be archived with attribution and context while remaining non-canonical evidence unless independently promoted by the applicable evidence rules.

## Routing intent

- **Biblioteca Atlas:** documentary facts, sourced positions and preserved context.
- **Evidence layer:** admissible evidence evaluated under current standards.
- **Atlas Conspiraciones:** investigable hypotheses without automatic truth promotion.
- **Interpretations:** preserved with explicit attribution and epistemic status.
- **Gemelo Digital:** only epistemically justified causal/value/incentive updates.

## Anti-attribution-of-intention invariant

`Observed conduct -> Incentive structure -> Motivation hypothesis -> Additional evidence required`

Observed outcomes MUST NOT be converted directly into claims of hidden intent.

## Conceptual closure

**FASE CONCEPTUAL FINALIZADA.**

E2E-001 requires no further conceptual design before execution. Any proposal to add new conceptual components must be treated as a separate RFC/change request rather than silently extending this contract.

## Next valid operation

Execute E2E-001 directly against a real payload or transcript using the actual `Orchestrator + Epistemic Classification Skill` and inspect the produced output.

### Required execution evidence

The first real execution MUST retain, at minimum:

- immutable input reference/hash from the applicable runtime path;
- CORE-00 admission result;
- assertion-level epistemic classification;
- origin/emitter/context attribution record;
- routing destination(s);
- Gemelo Digital mutation or explicit `NO_UPDATE` with reason;
- output certification/signature metadata;
- end-to-end trace linking input -> CORE admission -> classifications -> routes -> repository writes -> certified output.

## Pass criterion

E2E-001 passes only if ATLAS can preserve meaningful content without silently converting preservation into belief, evidence, fact, demonstrated value, causal certainty or thesis.