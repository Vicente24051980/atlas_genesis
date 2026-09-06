# ASTRA WORK BRIEF — ATLAS World Model Ω

**Run after / inside the master ATLAS AI capability-audit Work. Do not open an implementation branch merely because this brief exists.**

## Objective

Audit whether World Model Ω adds a defensible future capability to ATLAS AI and determine the smallest empirically testable design. Do not implement runtime code unless the parent capability audit explicitly reopens implementation and continuity prerequisites pass.

## Sources of truth

1. `CURRENT_CANON/ATLAS_AI_PERSONAL_COGNITIVE_OS_OMEGA_V1.md`
2. `CURRENT_CANON/ATLAS_WORLD_MODEL_OMEGA_V0_1.md`
3. `CURRENT_CANON/research/ATLAS_WORLD_MODEL_OMEGA_RESEARCH_AGENDA_2026-09-06.md`
4. `CURRENT_CANON/research/ATLAS_WORLD_MODEL_OMEGA_PREREG_TEST_SUITE_V0_1.md`
5. GitHub Issue #162

## Non-negotiable governance

- documented != implemented
- designed != validated
- plausible != calibrated
- simulation != fact
- Digital Twin != World Model
- predictive accuracy != decision value
- sophistication != incremental value
- no future-data leakage
- no non-zero decision weight without held-out evidence
- Point Zero / Capital-Blind invariants remain binding for finance
- no new top-level engines unless existing architecture demonstrably cannot support the function

## Audit tasks

### A. Repository reality audit
Inspect actual implementation before proposing changes. Map existing modules that can supply decision state, contradiction handling, provenance, result validation, decision ledger and learning/consolidation. Identify duplicate concepts and architecture inflation.

### B. Literature / external capability audit
Research current 2025–2026 work on action-conditioned world models, causal counterfactual prediction, model-based RL, agentic world modeling, research-agent world models, uncertainty-aware planning, calibration and learned simulators. Separate peer-reviewed/primary work from vendor claims and commentary. Extract only capabilities relevant to ATLAS decision support.

### C. Problem-definition audit
Test whether ATLAS actually needs a learned world model or whether structured scenario trees + domain models + calibrated forecasting capture most value. Produce the baseline ladder B0–B6 and define when escalation is justified.

### D. Counterfactual validity
Audit the difference between plausible alternative futures and causal counterfactuals. Specify abduction/action/prediction requirements where causal claims are made. Identify domains where true counterfactual identification is impossible and force epistemic labels/abstention.

### E. Uncertainty architecture
Specify aleatoric, epistemic, model, scenario and regime uncertainty. Define how disagreement, OOD detection, horizon degradation and unknown unknowns affect confidence and abstention.

### F. Calibration design
For each output type, define scoring rules and minimum sample requirements. Include Brier/reliability for binary events, interval coverage for ranges, continuous forecast error, ranking regret and decision utility. Never allow qualitative “it learned” claims without measured forecast-vs-outcome data.

### G. Finance adapter
Design, but do not activate, a finance-specific adapter that separates:
- business outcomes
- expectations/valuation
- market return
- execution/tax/liquidity constraints

Require PIT data and Point Zero invariance. Test cases must include a company whose fundamentals improve while expected stock return worsens because expectations/valuation moved further.

### H. Digital Twin adversarial separation
Construct cases where the Vicente Model predicts A but World Model evidence favors B. Verify the Executive can recommend B while preserving the behavioral prediction as a separate object.

### I. Red team
Try to break the design through leakage, narrative seduction, fake probabilities, simulator exploitation, stale state, regime shifts, feedback loops, hidden assumptions, model disagreement, irreversible actions and self-confirmation.

### J. Test suite review
Review T01–T20 without changing thresholds after seeing favorable results. Add tests only if they close a real uncovered failure mode; do not delete hard tests to obtain a pass.

## Required deliverables

1. `WORLD_MODEL_CAPABILITY_AUDIT.md`
2. `WORLD_MODEL_REPO_REALITY_MAP.md`
3. `WORLD_MODEL_LITERATURE_EVIDENCE_REGISTER.md`
4. `WORLD_MODEL_BASELINE_LADDER.md`
5. `WORLD_MODEL_COUNTERFACTUAL_VALIDITY_SPEC.md`
6. `WORLD_MODEL_UNCERTAINTY_CALIBRATION_SPEC.md`
7. `WORLD_MODEL_FINANCE_ADAPTER_DESIGN.md`
8. `WORLD_MODEL_RED_TEAM_REPORT.md`
9. `WORLD_MODEL_TEST_SUITE_REVIEW.md`
10. final verdict: `REJECT | RESEARCH_ONLY | SHADOW | ELIGIBLE_FOR_MVP_IMPLEMENTATION`

## Evidence discipline

For every claim label:
`IMPLEMENTED`, `DOCUMENTED`, `EXTERNAL_EVIDENCE`, `HYPOTHESIS`, `DESIGN_PROPOSAL`, `TESTED_PASS`, `TESTED_FAIL`, or `UNKNOWN`.

Cite file paths/commits for repository claims and primary sources for external claims. Never convert a design proposal into an implementation claim.

## Decision rule

Default verdict remains `RESEARCH_ONLY` unless evidence clears every prerequisite. Even if an MVP is implemented later, `WORLD_MODEL_DECISION_WEIGHT` remains 0 until held-out, PIT, baseline-controlled evidence demonstrates incremental decision value and Vicente explicitly approves promotion.

## North-star question

Does World Model Ω measurably improve ATLAS decisions versus simpler methods, with information genuinely available at decision time, while remaining calibrated, auditable, counterfactually honest and independent of Vicente's historical preferences?

If not, keep it out of the decision path.