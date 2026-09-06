# ATLAS World Model Ω v0.1

**Status:** CANONICAL TARGET CAPABILITY SPEC — NON-OPERATIVE / IMPLEMENTATION FROZEN  
**Date:** 2026-09-06  
**Parent canon:** `CURRENT_CANON/ATLAS_AI_PERSONAL_COGNITIVE_OS_OMEGA_V1.md`  
**Persistent infrastructure:** GitHub Cognitive Kernel + Notion Knowledge Layer

## 0. Governance correction

World Model Ω is retained because the capability is valuable, but it is **not an active implementation priority** and does not authorize new runtime work while continuity remains unvalidated.

Activation prerequisites, in order:

1. Real ATLAS continuity runtime passes the locked continuity test.
2. Current capability audit is completed before feature expansion resumes.
3. World Model-specific acceptance tests are preregistered before implementation outputs are inspected.
4. Implementation begins only with the smallest decision-state + counterfactual simulation slice.

Until then:

`WORLD_MODEL = TARGET_SPEC_ONLY`

`RUNTIME_AUTHORITY = NONE`

`DECISION_WEIGHT = 0`

This document must not compete with the continuity remediation open loop.

## 1. Mission

World Model Ω defines a future ATLAS capability for comparing plausible consequences of materially different actions.

Target loop:

`OBSERVE → BUILD DECISION STATE → GENERATE ALTERNATIVES → SIMULATE PLAUSIBLE FUTURES → COMPARE → RECOMMEND → PERMISSION CHECK → ACT → VERIFY → LEARN`

Minimal transition representation:

`STATE_t + ACTION_a + EXOGENOUS_ASSUMPTIONS_s → DISTRIBUTION(OUTCOMES, UNCERTAINTY)`

A simulated future is never a fact.

## 2. Core distinction

### Memory
What is known, stated, observed or previously recorded.

### Vicente Model / Digital Twin
What Vicente is likely to choose, when enough behavioral evidence exists.

### World Model
What may happen under A/B/C/DO_NOTHING, regardless of what Vicente is predicted to choose.

Therefore:

`P(Vicente chooses A | context) != P(outcome | A, world state)`

The Digital Twin models the decision-maker. World Model models consequences. They must remain separable.

## 3. Architecture pruning — v0.1 governance revision

The first draft created five new top-level engines. That is unnecessary architecture inflation at this stage. The target capability is retained, but duplicated modules are collapsed into existing ATLAS responsibilities.

### 3.1 Decision State View — NOT a new standalone engine

Former name: `STATE_ENGINE`.

For the MVP this is a typed, decision-specific state snapshot assembled from existing Context Routing, Memory Retrieval, Contradiction Detection and Confidence/Provenance.

Minimum fields:
- objectives and horizon
- current facts
- actors/resources/constraints
- permissions
- commitments/open loops
- relevant unknowns
- stale/conflicting evidence
- material assumptions
- provenance

Do not create a persistent parallel state system unless evidence later shows the existing layers cannot support this view.

### 3.2 Counterfactual generation — capability inside reasoning/world-model path

Former name: `COUNTERFACTUAL_ENGINE`.

It must generate materially distinct alternatives, including `A0 = DO_NOTHING / STATUS_QUO` when applicable, plus delayed, partial, information-gathering, exit or reversible options where material.

It does not need a standalone service/module until benchmarks justify one.

### 3.3 `WORLD_MODEL` — retained target module

This is the only genuinely new target capability preserved as a distinct module.

It compares plausible outcomes for each action × scenario and must separate:
- endogenous effects
- exogenous assumptions
- direct and second-order effects
- path dependence
- horizon
- uncertainty
- failure modes

Allowed methods may include causal reasoning, scenario trees, statistical models, historical analogues, Monte Carlo, specialist simulators or external tools.

**A single LLM narrative is not a validated simulation.**

### 3.4 Outcome verification — folded into existing Result Validator + decision ledger

Former name: `OUTCOME_VERIFIER`.

Do not create a separate engine initially. Extend the existing result/outcome trace to store:
- forecast timestamp
- predicted range/distribution
- action actually taken
- realized outcome
- forecast error
- assumption failure
- execution deviation
- exogenous shock
- attribution confidence

### 3.5 Policy learning — folded into Learning / Consolidation until data justifies separation

Former name: `POLICY_LEARNER`.

No autonomous policy learner is authorized now. Calibration updates belong inside existing Learning/Consolidation until there is enough repeated forecast-vs-outcome evidence to justify a dedicated learner.

It may never silently rewrite Vicente's explicit values or preferences.

## 4. Anti-Self-Confirmation Law Ω

The likely Vicente action must never become the default recommended action merely because the Digital Twin predicts it.

For material decisions, Atlas must attempt to falsify the likely Vicente option and compare at least one materially distinct alternative unless only one feasible action exists.

This law remains valid even if Decision Prediction is unavailable; in that case Atlas simply compares alternatives without a predicted-Vicente baseline.

## 5. Epistemic requirements

Simulation-specific classes may be used when implementation exists:

`SCENARIO`, `ASSUMPTION`, `COUNTERFACTUAL`, `FORECAST`, `FORECAST_RANGE`, `MODEL_UNCERTAINTY`, `CALIBRATION_RESULT`, `REALIZED_OUTCOME`.

Hard rule:

**No simulated or forecast future may enter memory as `FACT`.**

## 6. Future decision protocol

For a material decision, after activation gates pass:

1. Define objective and horizon.
2. Build decision state from fresh relevant evidence.
3. Surface contradictions, stale evidence and unknowns.
4. Generate status quo plus materially distinct alternatives.
5. Make exogenous assumptions explicit.
6. Simulate plausible outcomes for each action/scenario pair.
7. Compare upside, downside, reversibility, tail risk, uncertainty and information value.
8. If available and behaviorally validated, show the Digital Twin's likely action separately.
9. Recommend based on decision quality, not similarity to historical behavior.
10. Pass permission gates.
11. Verify realized outcome later.
12. Feed measured forecast error into Learning/Consolidation.

## 7. Abstention

Atlas must abstain from high-confidence consequence claims when:
- critical variables are missing
- contradictions remain unresolved
- scenario dispersion is too high
- the domain is uncalibrated
- external evidence is stale
- irreversible downside is asymmetric and evidence is insufficient

`INFORMATION_GATHERING` may be the best action.

## 8. ATLAS Financiero Ω invariant

World Model does not replace Point Zero, underwriting, valuation, Portfolio Construction Ω or Capital-Blind Selection Ω.

It may alter a financial recommendation only through decision-relevant evidence about expected outcomes, risk, tax/liquidity/execution constraints or information value.

It may not introduce:
- sector quotas
- incumbent protection
- current personal P/L as preference
- current invested capital as preference
- familiarity bias
- narrative preference

unless a variable is explicitly relevant to a genuine execution/tax/liquidity constraint.

## 9. Longitudinal trace

Target trace:

`decision_id → state_snapshot → candidate_actions → scenario_set → predicted_outcomes → confidence → selected_action → executed_action → realized_outcome → forecast_error → attribution → learning_update`

This is the evidence base for calibration. No claimed learning without realized outcomes.

## 10. Acceptance gates before runtime activation

1. **Continuity prerequisite:** live continuity already passes its locked test.
2. **Counterfactual completeness:** status quo + materially distinct alternative.
3. **Digital Twin independence:** recommendation can disagree with predicted Vicente behavior.
4. **Provenance completeness:** material state variables and assumptions are traceable.
5. **Uncertainty honesty:** no false precision.
6. **No future-as-fact:** simulated outcomes never become FACT.
7. **Permission invariance:** simulation cannot grant execution authority.
8. **Outcome binding:** forecast can later be matched to reality.
9. **Calibration measurability:** repeated predictions produce measurable error.
10. **Contradiction gate:** unresolved material contradictions reduce confidence or block output.
11. **Point Zero finance invariance:** personal holdings/P&L/current weights cannot bias simulations except genuine constraints.

## 11. Minimal construction order after all prerequisite gates

1. decision-state schema/view using existing modules
2. explicit counterfactual generator
3. structured `WORLD_MODEL` MVP using scenario trees
4. outcome fields added to existing Result Validator / decision ledger
5. calibration metrics inside Learning/Consolidation
6. only later, if evidence demands it, split dedicated services/modules

No provider, model or vendor is hard-coded.

## 12. Target architecture — non-operative

The target flow is expressed without forcing duplicate top-level engines:

`CAPTURE → STRUCTURE → CONTEXT ROUTING → MEMORY RETRIEVAL → DECISION STATE VIEW → CONTRADICTION CHECK → REASONING / VICENTE MODEL (WHEN VALIDATED) → COUNTERFACTUALS → WORLD_MODEL → EXECUTIVE → AGENT HARNESS → MODEL/TOOL ROUTING → PERMISSION CHECK → ACTION/RESPONSE → RESULT VALIDATION + OUTCOME TRACE → LEARNING / CONSOLIDATION`

This is a target capability map, not the current runtime flow.

## 13. Invariant

**ATLAS should eventually be able to distinguish “what Vicente would probably choose” from “what appears to have the best consequence distribution.”**

That is the durable idea preserved by this specification.

---

**Governance:** World Model Ω remains a canonical target capability specification only. It has zero runtime authority, zero decision weight and zero implementation priority until continuity passes and feature expansion is explicitly reopened.