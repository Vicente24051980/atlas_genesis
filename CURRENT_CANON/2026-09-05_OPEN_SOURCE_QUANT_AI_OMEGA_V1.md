# ATLAS Ω — Open Source Quant AI Integration Ω v1.0

**Status:** ACTIVE · SHADOW / OOS REQUIRED  
**Effective:** 2026-09-05  
**Issue:** #98  
**Direct ATLAS structural score weight:** 0  
**Promotion authority:** MODEL LEARNING GOVERNANCE Ω v1

## Mission

Absorb only the strongest reusable ideas from open-source quantitative-AI systems while preserving ATLAS authority, evidence discipline, falsifier veto, anti-double-count rules and broker safety.

This module is inspired by public implementations and research patterns in Microsoft Qlib / RD-Agent, AlphaForge, Kronos, MASTER, TradingAgents, FinGPT / FinAgent, FinRL-X, skfolio and Riskfolio. External model outputs are evidence candidates, never canonical facts or automatic recommendations.

## Non-negotiable architecture

ATLAS remains separated into orthogonal questions:

1. **Structural ATLAS Ω:** what business deserves ownership over 3–6 years?
2. **Expectation Gap Ω:** what is already priced?
3. **Predictive Ensemble Ω:** what do validated models currently imply over a defined forecast horizon?
4. **Entry Timing Ω:** is the current entry attractive?
5. **Factor Forge Ω:** which candidate signals show incremental OOS information?
6. **Drift Guard Ω:** is a previously useful signal degrading?
7. **Tail Risk Ω:** what is the loss distribution and drawdown geometry?
8. **Competition for Capital Ω:** does the candidate improve the real portfolio after risk, duplication and friction?

No predictive output is allowed to overwrite Structural ATLAS, Expected Return 3–6Y, Falsifier Veto or Decision Safety Gate.

## Engine manifest

- `QLIB_FACTOR_LIBRARY_OMEGA_V1`
- `FACTOR_FORGE_OMEGA_V1`
- `STATISTICAL_BACKTEST_FIREWALL_OMEGA_V1`
- `PREDICTIVE_ENSEMBLE_OMEGA_V1`
- `MARKET_CONTEXT_ROUTER_OMEGA_V1`
- `DRIFT_GUARD_OMEGA_V1`
- `AGENT_DISAGREEMENT_CONFIDENCE_OMEGA_V1`
- `TAIL_RISK_DIAGNOSTICS_OMEGA_V1`
- `PORTFOLIO_RISK_UTILITY_RESEARCH_OMEGA_V1`

Technical implementation:

- `src/atlas/algorithm/open-source-quant-ai-omega.ts`
- `src/atlas/algorithm/tail-risk-diagnostics-omega.ts`
- `src/atlas/algorithm/open-source-quant-ai-omega.test.ts`

## Qlib factor-library adoption

ATLAS may research Qlib-style price/volume factors, including but not limited to:

- return / ROC families;
- moving-average distance;
- rolling standard deviation;
- linear-trend slope and R²;
- regression residual;
- rolling high/low and price-location measures;
- price/volume correlation;
- up/down-day breadth;
- gain/loss intensity;
- volume mean / volatility;
- normalized OHLCV sequences.

These are **candidate predictors**, not business-quality evidence. No technical factor may earn structural quality points by itself.

## Factor Research Ω

For factor `F` and forward return `R(h)`:

`IC = Pearson(F_t, R_{t+h})`

`RankIC = Spearman(F_t, R_{t+h})`

Across OOS windows:

`ICIR = mean(IC_t) / stdev(IC_t)`

Quantile monotonicity is measured by the rank relationship between factor quantile and realized forward return.

Required diagnostics include:

- IC;
- RankIC;
- ICIR;
- quantile monotonicity;
- turnover;
- redundancy / absolute correlation with existing signals;
- regime stability;
- multiple-testing-adjusted significance.

## Multiple-testing firewall

Candidate alphas generated through automated search are subject to Benjamini-Hochberg False Discovery Rate control before any promotion discussion.

A low raw p-value after testing thousands of formulas is not accepted as evidence of alpha.

## Statistical Backtest Firewall Ω

Default research hurdles are deliberately explicit and versioned, not universal truths:

- minimum OOS observations: 126;
- minimum OOS RankIC research hurdle: 0.02;
- minimum OOS ICIR research hurdle: 0.25;
- maximum adjusted p-value: 0.05;
- redundancy warning above absolute correlation 0.85;
- regime-positive-share research hurdle: 60%.

Hard requirements:

- point-in-time data;
- look-ahead audit passed;
- survivorship-bias audit passed;
- purged validation;
- embargo where labels overlap;
- walk-forward validation;
- positive alpha after estimated costs.

Passing this firewall means only `PASS_SHADOW_ELIGIBLE`. It does **not** authorize final scoring migration.

## Predictive Ensemble Ω

Each model `m` earns a reliability value from realized OOS performance:

`Reliability_m = exp(-2 * Brier_m) * max(ICIR_m, 0) * Stability_m * RegimeFit_m * SampleConfidence_m`

where:

`SampleConfidence = min(1, sqrt(N / 252))`

Weights are normalized only across models with positive traceable reliability:

`w_m = Reliability_m / sum(Reliability)`

The ensemble may aggregate:

- probability of positive return;
- probability of beating benchmark;
- expected return for the stated horizon;
- q05 / q50 / q95 forecast returns;
- disagreement dispersion.

No missing model is simulated, inferred or backfilled. If no reliable model is available, output is `NO_RELIABLE_MODELS`.

## Market Context Router Ω

Model performance must be stored by market regime. Current-regime routing may prefer models with stronger historical OOS RankIC / ICIR in the matching regime.

Regime fit changes a model's predictive weight; it never changes company fundamentals.

## Drift Guard Ω

Monitors degradation using five channels:

- PSI;
- KS p-value;
- normalized Wasserstein distance;
- RankIC decay;
- Brier deterioration.

States:

- `STABLE`
- `WATCH`
- `REDUCE_MODEL_WEIGHT`
- `SUSPEND_MODEL`
- `EVIDENCE_PENDING`

A model can therefore lose influence automatically even if its historical backtest remains impressive.

## Agent Disagreement Confidence Ω

For multiple agent/model probabilities, ATLAS records:

- mean probability;
- standard deviation;
- probability range;
- confidence multiplier.

Conflict is preserved rather than averaged away. High disagreement reduces confidence but cannot create a structural falsifier.

## Tail Risk Diagnostics Ω

Added diagnostics:

- Conditional Value at Risk / Expected Shortfall;
- downside deviation;
- maximum drawdown;
- Ulcer Index;
- skewness;
- excess kurtosis;
- tail ratio.

These metrics feed Risk Ω and Competition for Capital Ω. They carry zero standalone structural-score weight.

Research utility may be expressed with caller-defined risk aversion:

`Utility = E[R] - λ1*CVaR - λ2*MaxDD - λ3*Turnover - λ4*Costs - λ5*ConcentrationPenalty`

The lambda values are user/model-policy parameters and are never hard-coded as universal economic truths.

## Source-specific adaptations

### Microsoft Qlib
Adopt: reproducible factor expressions, Alpha158/Alpha360 concept, model benchmarking, IC/RankIC discipline.

Do not adopt: any benchmark result as proof that the same model will work on ATLAS universes.

### RD-Agent / AlphaForge
Adopt: autonomous candidate-factor generation followed by independent falsification and OOS promotion gates.

Do not adopt: automated factor discovery as automatic scoring authority.

### Kronos
Adopt: probabilistic OHLCV trajectory forecasts and horizon-specific q05/q50/q95 style outputs when a real Kronos result is available.

Do not invent a Kronos score if the model has not actually been executed.

### MASTER
Adopt: market-context conditioning and cross-sectional relationships.

Do not allow market context to rewrite fundamental evidence.

### TradingAgents / FinAgent
Adopt: specialist roles, bull/bear contradiction, explicit risk review and disagreement logging.

Do not allow LLM eloquence or majority vote to bypass evidence gates.

### FinGPT
Adopt: finance-specialized NLP candidates for earnings, filings and news.

All textual sentiment remains provenance-bound and time-stamped.

### FinRL-X
Adopt: conceptual separation between stock selection, timing, portfolio sizing and execution.

No RL policy may send broker orders outside existing execution-safety gates.

### skfolio / Riskfolio
Adopt: richer tail-risk diagnostics, portfolio validation and purged-validation concepts.

Portfolio optimization is subordinate to real holdings, constraints, Competition for Capital and Replacement Firewall.

## Anti-overfitting rules

1. In-sample alpha alone is never promotable.
2. A single ticker cannot validate a factor.
3. Three isolated observations cannot recalibrate the model.
4. Costs, spread and turnover must be included before alpha is called positive.
5. Point-in-time and survivorship-safe data are mandatory.
6. Multiple-testing correction is mandatory for generated factor families.
7. A factor strongly redundant with an existing factor cannot earn duplicate authority.
8. Performance must be examined across regimes and horizons.
9. Historical alpha does not imply future alpha.
10. Every promotion, reduction or retirement is versioned.

## Promotion ladder

`IDEA -> CANDIDATE -> IN_SAMPLE_ONLY -> OOS_TEST -> FIREWALL_PASS_SHADOW -> LIVE_SHADOW -> REPEATED_OOS -> MODEL_LEARNING_REVIEW -> OPTIONAL_CANONICAL_PROMOTION`

No stage may be skipped.

## Decision authority

- Structural BUY/HOLD/WATCH/REJECT authority remains with canonical ATLAS decision governance.
- Falsifier Veto remains absolute and independent.
- Predictive Ensemble cannot turn a structurally rejected company into a canonical BUY.
- Tail Risk Diagnostics cannot fabricate a fundamental falsifier.
- External project reputation, stars, papers or vendor labels have zero direct score weight.

## Result

ATLAS now has a formal path to discover, test, combine, down-weight and retire quantitative/AI signals without turning the system into an opaque mega-score.
