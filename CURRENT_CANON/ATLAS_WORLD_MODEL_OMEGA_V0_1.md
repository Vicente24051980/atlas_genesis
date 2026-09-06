# ATLAS World Model Ω v0.1

**Status:** CANONICAL ARCHITECTURAL EXTENSION — IMPLEMENTATION PAUSED  
**Date:** 2026-09-06  
**Parent canon:** `CURRENT_CANON/ATLAS_AI_PERSONAL_COGNITIVE_OS_OMEGA_V1.md`  
**Persistent infrastructure:** GitHub Cognitive Kernel + Notion Knowledge Layer

## 1. Mission

ATLAS World Model Ω adds counterfactual simulation to the Personal Cognitive OS.

ATLAS must not jump directly from understanding a situation to recommending or executing an action when the decision is material. It should first represent the current state, generate materially distinct candidate actions, simulate plausible consequences, expose uncertainty, compare outcomes against Vicente's objectives and constraints, and only then recommend or route an action.

Canonical loop:

`OBSERVE → UPDATE STATE → GENERATE ACTIONS → SIMULATE FUTURES → COMPARE → DECIDE/RECOMMEND → PERMISSION CHECK → ACT → VERIFY OUTCOME → LEARN`

Minimal transition model:

`STATE_t + ACTION_a + EXOGENOUS_ASSUMPTIONS_s → DISTRIBUTION(STATE_t+1, OUTCOME, UNCERTAINTY)`

The output is never a single deterministic future. It is a set or distribution of plausible futures with explicit assumptions, confidence and provenance.

## 2. Core distinction

### Memory
What is known, stated, observed or previously recorded.

### Vicente Decision Model Ω / Digital Twin
What Vicente would probably choose, given longitudinal preferences, constraints, decisions and outcomes.

### Decision Prediction Ω
A prediction of Vicente's likely next choice or behavior.

### World Model Ω
What is likely to happen under each candidate action, including actions Vicente might not naturally choose.

Therefore:

`P(Vicente chooses A | context) ≠ P(outcome | choose A, world state)`

Digital Twin models the decision-maker. World Model models consequences. They must not be collapsed into one system.

## 3. New canonical modules

### 3.1 `STATE_ENGINE`
Builds a decision-relevant state representation at time `t`.

Minimum fields:
- objective(s)
- current facts
- temporal state
- actors/entities
- resources
- constraints
- permissions
- commitments/open loops
- known causal relationships
- unknowns
- stale or conflicting evidence
- decision horizon
- source/provenance for every material variable

State must be decision-specific. ATLAS must not dump all memory into every simulation.

### 3.2 `COUNTERFACTUAL_ENGINE`
Generates materially distinct candidate actions and counterfactual baselines.

Mandatory baseline when applicable:
- `A0 = DO_NOTHING / STATUS_QUO`

Candidate actions must not be generated merely to confirm the Digital Twin's preferred action.

The engine must support:
- action decomposition
- mutually exclusive alternatives
- reversible vs irreversible actions
- delayed action
- partial action
- information-gathering action
- stop-loss / exit action

### 3.3 `WORLD_MODEL`
Simulates plausible state transitions and outcomes for every candidate action.

Each simulation must separate:
- endogenous consequences of the action
- exogenous assumptions/scenarios
- direct effects
- second-order effects
- path dependencies
- time horizon
- uncertainty
- failure modes

World Model may use multiple methods depending on domain: structured causal reasoning, statistical forecasting, scenario trees, historical analogues, Monte Carlo, domain simulators, external tools, specialist models or explicit rule engines.

No single LLM narrative counts as a validated simulation.

### 3.4 `OUTCOME_VERIFIER`
Compares predicted outcomes with reality after action or passage of time.

Records:
- prediction timestamp
- predicted range/distribution
- realized outcome
- forecast error
- missing variables
- wrong assumptions
- causal attribution confidence
- whether the action was actually executed as modeled

The verifier must distinguish `MODEL_ERROR`, `DATA_ERROR`, `ASSUMPTION_FAILURE`, `EXECUTION_DEVIATION`, `EXOGENOUS_SHOCK` and `UNKNOWN`.

### 3.5 `POLICY_LEARNER`
Updates decision policy from repeated prediction-versus-outcome evidence.

It may update:
- scenario priors
- calibration
- causal weights
- preferred simulation methods
- risk penalties
- uncertainty thresholds
- domain-specific routing

It must not silently rewrite Vicente's explicit values or preferences. Preference learning belongs to the Vicente Model; consequence learning belongs to the World Model.

## 4. Integration with existing ATLAS modules

### Vicente Decision Model Ω / Digital Twin
Provides:
- likely Vicente action
- relevant preferences
- personal constraints
- risk tolerance
- historical decision analogues

World Model returns consequence estimates for the likely action and credible alternatives.

### Decision Prediction Ω
Runs before or alongside counterfactual generation, but has zero authority to suppress superior alternatives.

Required output:
`LIKELY_VICENTE_ACTION` is labeled as a prediction, not as the recommended action.

### Contradiction Detection Ω
Must inspect contradictions between:
- current state variables
- stale memories
- explicit preferences
- proposed assumptions
- previous predictions
- realized outcomes

Material contradictions block high-confidence simulation until resolved or explicitly modeled as scenario uncertainty.

### Confidence + Provenance Ω
Every simulated future must carry:
- evidence provenance
- assumption list
- confidence/calibration status
- model/tool provenance
- timestamp
- horizon
- uncertainty class

### ATLAS Executive Ω
Surfaces only decision-changing results: dominant alternatives, meaningful downside, key assumptions, uncertainty, permission requirement and recommended next action.

### Agent Harness Ω
World Model becomes a planning stage inside the harness for material tasks:

`OBJECTIVE → STATE → CANDIDATE ACTIONS → SIMULATE → SELECT PLAN → MODEL/TOOL ROUTING → PERMISSION CHECK → EXECUTE → VALIDATE → LEARN`

### Permission & Containment Ω
Simulation never grants authority. A modeled action still requires the same permission gate before execution.

## 5. Epistemic requirements

Add simulation-specific epistemic classes:

- `SCENARIO`
- `ASSUMPTION`
- `COUNTERFACTUAL`
- `FORECAST`
- `FORECAST_RANGE`
- `MODEL_UNCERTAINTY`
- `CALIBRATION_RESULT`
- `REALIZED_OUTCOME`

Hard rule:

**A simulated future must never be stored or presented as a FACT.**

## 6. Decision protocol Ω

For any material decision:

1. Define objective and horizon.
2. Build `STATE_t` from fresh, relevant evidence.
3. Detect contradictions and stale inputs.
4. Generate `A0` plus materially distinct candidate actions.
5. Identify exogenous scenarios.
6. Simulate each `(action × scenario)` pair.
7. Estimate upside, downside, reversibility, tail risk, confidence and information value.
8. Compare against Vicente's objectives and constraints.
9. Show the Digital Twin's likely action separately.
10. Recommend the action with the best expected decision quality, not the action most similar to Vicente's historical behavior.
11. Route through permission gates.
12. Execute only when authorized.
13. Verify actual outcome later.
14. Update calibration and policy.

## 7. Anti-self-confirmation law Ω

The Digital Twin must not contaminate the World Model.

The World Model is required to search for consequences that can falsify the Digital Twin's preferred action.

For a material decision, at least one counterfactual must challenge the likely Vicente action unless only one feasible action exists.

## 8. Uncertainty and abstention

ATLAS must abstain from high-confidence recommendations when:
- critical state variables are missing
- the decision is dominated by unresolved contradictions
- scenario dispersion is too high
- the model is uncalibrated in the domain
- relevant external evidence is stale
- an irreversible action has asymmetric downside and insufficient evidence

In these cases, `INFORMATION_GATHERING` may be the optimal action.

## 9. ATLAS Financiero Ω adapter

World Model is a simulation layer, not a replacement for Point Zero, ranking, underwriting, valuation, Portfolio Construction Ω or Capital-Blind Selection Ω.

For a proposed portfolio change such as `X OUT → Y IN`, mandatory counterfactuals should include when material:
- keep X / no trade
- execute replacement
- hold both / partial replacement
- delay for new evidence
- valuation compression
- earnings/revenue miss
- thesis acceleration
- macro/regime shock
- sector-specific supply/demand change
- liquidity/dilution/capital-structure event

Financial outputs should prioritize distributions rather than point estimates:
- expected return range
- downside range
- probability-weighted thesis states
- drawdown sensitivity
- fundamental impairment risk
- valuation sensitivity
- information gain from waiting

**Point Zero invariant:** World Model may change a decision only through evidence about expected outcomes and risk. It may not introduce sector quotas, familiarity, incumbent protection, current personal P/L, current invested capital or narrative preference.

## 10. Personal OS adapter

Applicable domains include:
- projects
- agenda and commitments
- purchases
- relationships
- learning/research
- travel/logistics
- business decisions
- administrative decisions
- authorized communications

For high-stakes medical, legal, financial, identity or irreversible actions, World Model output remains advisory unless the existing Permission & Containment policy explicitly authorizes execution.

## 11. Learning record schema

Canonical trace:

`decision_id → state_snapshot → candidate_actions → scenario_set → predicted_outcomes → confidence → selected_action → permission_state → executed_action → realized_outcome → forecast_error → attribution → learning_update`

This trace must be longitudinal and queryable so calibration can be measured by domain and horizon.

## 12. Acceptance tests before implementation promotion

World Model implementation cannot become canonical runtime until it passes tests including:

1. **Counterfactual completeness:** includes status quo and at least one materially distinct alternative.
2. **Digital Twin independence:** recommendation can disagree with predicted Vicente behavior.
3. **Provenance completeness:** every material state variable and assumption is traceable.
4. **Uncertainty honesty:** refuses false precision when evidence is weak.
5. **No future-as-fact:** simulated outcomes never enter memory as FACT.
6. **Permission invariance:** simulation cannot bypass execution authorization.
7. **Outcome binding:** predicted decision can later be matched to realized outcome.
8. **Calibration:** repeated forecasts produce measurable error metrics.
9. **Contradiction gate:** unresolved material contradictions reduce confidence or block recommendation.
10. **Point Zero finance test:** personal holdings/P&L/current weights cannot bias financial simulation outputs unless explicitly relevant to tax, liquidity or execution constraints.

## 13. Construction order after capability audit

1. `STATE_ENGINE`
2. `COUNTERFACTUAL_ENGINE`
3. structured `WORLD_MODEL` MVP using explicit scenario trees
4. `OUTCOME_VERIFIER`
5. calibration store
6. `POLICY_LEARNER`
7. domain adapters
8. optional specialist simulators/models after benchmark validation

No model name or vendor is hard-coded into the architecture.

## 14. Canonical end-to-end architecture after this extension

`CAPTURE → STRUCTURE → CONTEXT ROUTING → MEMORY RETRIEVAL → STATE_ENGINE → CONTRADICTION CHECK → VICENTE MODEL / DECISION PREDICTION → COUNTERFACTUAL_ENGINE → WORLD_MODEL → EXECUTIVE → AGENT HARNESS → MODEL/TOOL ROUTING → PERMISSION CHECK → ACTION/RESPONSE → RESULT VALIDATION → OUTCOME_VERIFIER → POLICY_LEARNER → CONSOLIDATION`

## 15. Canonical invariant

**ATLAS should not merely predict what Vicente will do. It should estimate what is likely to happen if Vicente does A, B, C or nothing — and learn from the gap between simulated and realized outcomes.**

---

This document extends the frozen target architecture only. It does **not** authorize implementation promotion before the capability audit required by the parent canon.