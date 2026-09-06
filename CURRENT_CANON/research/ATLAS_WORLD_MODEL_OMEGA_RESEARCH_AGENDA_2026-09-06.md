# ATLAS World Model Ω — Research Agenda & Validation Matrix

**Date:** 2026-09-06
**Status:** RESEARCH / PREREGISTRATION SUPPORT — NON-OPERATIVE
**Parent:** `CURRENT_CANON/ATLAS_WORLD_MODEL_OMEGA_V0_1.md`

## Purpose

Deepen the World Model target without violating the implementation freeze. This document defines what ATLAS must learn, test and measure before World Model Ω can receive runtime authority or decision weight.

## Research conclusion

The useful abstraction is not “generate realistic futures.” It is **decision-coupled, action-conditioned consequence modeling under uncertainty**.

A world model is useful to ATLAS only if it improves decisions versus simpler baselines. Photorealism, eloquence and plausible narratives are insufficient.

## Design dimensions to benchmark

1. **State abstraction** — what information is necessary and sufficient for the decision?
2. **Temporal dynamics** — how does state evolve over the relevant horizon?
3. **Uncertainty** — aleatoric, epistemic, scenario/model uncertainty and unknown unknowns.
4. **Structural priors** — causal, accounting, physical, institutional or domain constraints.
5. **Observation modality** — text, tables, time series, images, documents, tool outputs.
6. **Decision coupling** — whether the model actually conditions on candidate actions and changes planning.

## Critical failure modes

- compounding rollout error
- planner exploitation / optimizing model mistakes
- counterfactual non-identifiability
- confounding and selection bias
- false precision
- scenario collapse
- narrative coherence mistaken for causal validity
- leakage of future information
- stale state
- endogenous/exogenous variable confusion
- hidden assumption drift
- Goodhart effects
- action-policy feedback changing the environment
- failure to preserve factual evidence when constructing counterfactuals
- calibration drift across regimes/domains

## Baseline ladder

Every proposed World Model method must beat progressively stronger simpler baselines:

B0 — no simulation / current decision process
B1 — structured pros/cons + uncertainty
B2 — explicit scenario tree
B3 — historical base rates / analogues
B4 — deterministic domain model
B5 — probabilistic / Monte Carlo model where justified
B6 — learned or specialist world model

Do not deploy B6 merely because it is more sophisticated. Select the simplest method that demonstrates incremental decision value.

## Counterfactual protocol

For each material decision:

- factual state must be frozen at decision time
- A0 status quo must be represented where meaningful
- candidate actions must be materially distinct
- assumptions must be explicit and versioned
- factual observations after the decision cutoff must not leak into the forecast
- counterfactual output must distinguish identified, estimated and unknowable components
- an information-gathering action must be considered when uncertainty itself is decision-relevant

## Forecast object

Minimum future schema:

`forecast_id`
`decision_id`
`cutoff_timestamp`
`state_snapshot_hash`
`action`
`scenario`
`horizon`
`target_metric`
`point_estimate_optional`
`range_or_distribution`
`confidence`
`assumptions[]`
`unknowns[]`
`failure_modes[]`
`provenance[]`
`model_method`
`model_version`

Realized outcome must be stored separately and bound later.

## Calibration

ATLAS must measure forecast quality rather than self-report intelligence.

Candidate metrics by output type:

- binary: Brier score + reliability bins
- multiclass: log loss / Brier decomposition
- intervals: empirical coverage + interval width
- continuous: MAE/RMSE where appropriate, plus calibration of predictive intervals
- ranking decisions: pairwise accuracy / regret
- portfolio decisions: out-of-sample regret, drawdown/risk error, turnover/execution cost impact, benchmark-relative incremental value

Calibration must be segmented by domain, horizon, regime and model version when sample size permits.

## Decision-value test

The decisive benchmark is not predictive accuracy alone.

Compare:

`UTILITY(decisions_with_WM) - UTILITY(decisions_without_WM)`

with predeclared utility/risk metrics and PIT information.

World Model Ω is promoted only if incremental value survives out-of-sample evaluation and is not explained by leakage, extra information unavailable to the baseline, or excessive complexity.

## Finance-specific research design

For ATLAS Financiero Ω:

- preserve Point Zero and Capital-Blind invariants
- use PIT fundamentals, estimates, prices and macro state
- separate business-state simulation from market-price simulation
- explicitly model expectation gap: a good business outcome can coexist with a bad stock return if priced in
- scenario dimensions may include revenue/volume, margins, capex, FCF, dilution, rates, multiples, competitive response, regulation, supply constraints and execution
- avoid assigning probabilities when evidence cannot support them; scenario ranges may be preferable
- compare against existing ATLAS underwriting/ranking baseline before adding weight
- no live score/ranking weight until preregistered OOS evidence demonstrates incremental value

## Personal-decision domains

World Model methods must be domain-specific. A financial model must not be reused blindly for health, legal, relationships or logistics.

High-stakes health/legal domains require stronger abstention, external authority and human-professional gates. Simulations must never masquerade as professional certainty.

## Digital Twin separation test

Create adversarial cases where historical Vicente behavior favors A while evidence favors B. The system passes only if World Model output and Executive recommendation can select B without rewriting the historical preference record.

## Anti-confirmation test

Given a candidate favored by Vicente or by ATLAS prior ranking, force generation of the strongest plausible failure path and at least one materially different alternative. Measure whether the model changes confidence appropriately when disconfirming evidence is introduced.

## Model-risk controls

- champion/challenger models
- version pinning
- deterministic replay where feasible
- provenance hashes
- cutoff timestamps
- explicit abstention
- bounded rollout horizons
- independent validation for high-impact decisions
- model disagreement surfaced, not averaged away blindly
- no autonomous policy self-modification

## Promotion gates

G0 continuity passes
G1 capability audit complete
G2 schemas + PIT discipline tested
G3 baseline ladder implemented
G4 counterfactual tests pass
G5 outcome binding works
G6 calibration dataset reaches minimum useful size
G7 OOS decision-value benchmark beats baseline
G8 red-team/model-risk review passes
G9 explicit human approval to assign non-zero decision weight

Until G9:

`WORLD_MODEL_DECISION_WEIGHT = 0`

## Research watchlist

Track advances in:

- action-conditioned world models
- causal/counterfactual world models
- model-based RL
- learned simulators
- agent world models for software/research environments
- uncertainty-aware planning
- calibration and conformal prediction
- model predictive control
- digital twins
- simulation-to-real / simulation-to-decision transfer

External research informs design but never becomes canon merely because it is fashionable.

## North-star acceptance question

**Does adding World Model Ω cause ATLAS to make measurably better decisions, using only information available at decision time, after accounting for uncertainty, model error, execution cost and simpler baselines?**

If the answer is not empirically yes, World Model Ω remains a research capability with decision weight zero.