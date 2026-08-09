# ATLAS Ω — CURRENT CANON

Status: Current canonical architecture baseline
Date: 2026-08

## CORE-00

`UO 1.1 RC1 — 30/30 Spec Frozen (Runtime Pending) — FUNCTIONAL FREEZE`

CORE-00 MUST NOT be expanded with new engines or schemas before physical runtime execution.

### Five-engine ingestion pipeline

1. HashEngine — cryptographic integrity (`CORE-HASH-v1` for text; RFC 8785/JCS for JSON).
2. StructuralEngine — contract/type/limit admissibility; `additionalProperties: false`.
3. AuthenticationEngine — provenance/signature verification: VERIFIED, UNVERIFIED -> QUARANTINED, INVALID.
4. ReferenceEngine — derivation graph coherence and DAG enforcement.
5. EpistemicEngine — reasoning, resolution state and epistemic reconciliation.

## Frozen corpus — 30/30

- L0 Happy Path: 10/10.
- L1 Ambiguous: 8/8.
- L2 Conflicting: 8/8.
- L3 Adversarial: 4/4.
  - CASE-027 -> HashEngine.
  - CASE-028 -> AuthenticationEngine / QUARANTINED.
  - CASE-029 -> ReferenceEngine / circular DAG dependency.
  - CASE-030 -> StructuralEngine / malformed schema payload.

## RFC-PEA-001 / RFC-PEV-001

Business Quality Ω and Valuation Ω remain independent of price behavior.

Pre-earnings: PEA Ω + Confidence, Expectations Gap Ω and Earnings Opportunity.
Post-event: Realized Earnings Outcome Ω, Forecast Error Ω, confirmation gates, PEV Ω and signed Gap Retention.
Purchase Priority Ω is an experimental review-order modifier, not an automatic thesis modifier.

Grade F (`Fundamental Deterioration Candidate`) MUST route to `Auditor Ω -> Thesis Falsifier Gate`; it MUST NOT automatically modify the thesis.

### TASK-PEA-001 blind freeze

Pre-event `pea_manifest_locked.json` is cryptographically sealed using RFC 8785 (JCS) + SHA-256 and is immutable/independent from later `earnings_outcome.json` and `pev_report.json` artifacts.

## Epistemic governance

`Information Received != Admissible Evidence`.

### Simón ATLAS

Information is not filtered according to whether it confirms an existing narrative. Admission depends on evidence standards. Contradictory evidence is not degraded for being inconvenient; it raises review priority and activates falsifier evaluation.

Master axiom: "No elijas qué creer. Elige qué estándares debe superar algo antes de merecer ser creído."

### Law Ω017 — Incentives

"Las estructuras producen comportamientos más persistentemente que las intenciones."

Sequence: Ω015 Accumulation -> Ω016 Direction -> Ω017 Incentives.

Universal audit question: "¿Qué comportamiento recompensa realmente este sistema?"

## E2E-001 — higher layer

E2E-001 does NOT modify CORE-00 and does NOT create a sixth Core engine.

Flow:

`Transcript/Input -> UO 1.1 + CORE-00 Harness -> Orchestrator -> Epistemic Classification Skill -> Facts | Evidence | Hypotheses | Interpretations -> Biblioteca Atlas | Atlas Conspiraciones | Gemelo Digital -> Certified Output`

Interpretations are preserved with attribution and are not promoted to canonical evidence merely by being retained. ATLAS must be capable of preserving an idea without having to believe it.

## NARRATIVE SATURATION Ω v1.0 — higher-layer indicator

NARRATIVE SATURATION Ω is canonical for Conspiraciones Atlas Ω, MONEY ROTATION Ω and HISTORICAL DISLOCATION Ω.

It treats major macro/monetary covers as narrative and regime-stress sensors, not as predictions or trade signals. The canonical pattern is:

`TREND -> EXTREME -> COVER -> POSSIBLE REGIME RESPONSE`

The 2026-08-08 Economist Big Mac / "The Global Currency Beef" cover is frozen as the first out-of-sample Phoenix 2026 watch case. It must be tested against predefined monetary confirmers/falsifiers without later reinterpretation.

Document: `docs/canon/NARRATIVE_SATURATION_OMEGA_v1.md`.

## PREDICTION ATTEMPT Ω v1.0 — higher-layer forecasting discipline

PREDICTION ATTEMPT Ω is canonical for prospective scenario work across Conspiraciones Atlas Ω, MONEY ROTATION Ω, HISTORICAL DISLOCATION Ω, RISK Ω and CATALYSTS Ω.

It allows ATLAS to try to forecast only as an auditable probability exercise:

`SIGNAL -> HYPOTHESIS -> SCENARIOS -> PROBABILITIES -> WATCH WINDOW -> CONFIRMERS/FALSIFIERS -> SCORECARD`

Every prediction attempt must be frozen before the outcome, include mutually exclusive scenarios whose probabilities sum to 100%, cite evidence, define confirmers/falsifiers, and receive a post-mortem after the horizon closes.

It must never produce BUY, SELL, REDUCE, certainty language, hidden failed forecasts, or retrospective probability edits.

Document: `docs/canon/PREDICTION_ATTEMPT_OMEGA_v1.md`.

Anti-intention rule:

`Observed conduct -> incentive structure -> motivation hypothesis -> additional evidence required`.

Gemelo Digital causal matrix:

`Demonstrated Values under conflict/cost -> Incentives -> Decisions -> Habits -> Results`.

## Next technical milestone

**Runtime Initialization**: physical materialization on disk, recalculation of real runtime hashes and execution of the frozen 30-case suite.

## Governance rule

Older Atlas documents remain historical inputs unless explicitly reconciled with this current canon. No legacy document may silently override this baseline.