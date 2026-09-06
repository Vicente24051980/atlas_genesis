# ATLAS Ω — QUANT LAB / STRATEGY FACTORY Ω v1.0

**Status:** ACTIVE · RESEARCH / SHADOW ONLY  
**Effective:** 2026-09-06  
**Issue:** #151  
**Structural ATLAS score weight:** 0  
**Broker execution authority:** NONE  
**Promotion authority:** MODEL LEARNING GOVERNANCE Ω v1

## Mission

Build a reusable, clean-room strategy-discovery factory that answers a question orthogonal to Structural ATLAS:

- **Stock Selection Ω:** what business deserves ownership over 3–6 years?
- **Quant Lab / Strategy Factory Ω:** when, under which regime, and under which rule-set is exposure statistically better or worse?
- **Portfolio Ω:** how much capital should be allocated?
- **Execution Ω:** how should an approved decision be executed safely?

Strategy Factory never converts a technical rule into fundamental quality and never alters a structural BUY/HOLD/WATCH/REJECT by itself.

## Architectural rule

Strategy Factory is an upstream discovery layer for the quantitative validation stack already active in ATLAS. It must reuse rather than duplicate:

- `FACTOR_FORGE_OMEGA_V1`
- `STATISTICAL_BACKTEST_FIREWALL_OMEGA_V1`
- `MARKET_CONTEXT_ROUTER_OMEGA_V1`
- `DRIFT_GUARD_OMEGA_V1`
- `TAIL_RISK_DIAGNOSTICS_OMEGA_V1`
- `PORTFOLIO_RISK_UTILITY_RESEARCH_OMEGA_V1`
- `MODEL_LEARNING_GOVERNANCE_OMEGA_V1`

Canonical flow:

`Universe -> Strategy Grammar -> Candidate Generation -> Integrity Gate -> Costed Backtest -> Purged/Embargoed Validation -> Walk Forward -> Monte Carlo -> Parameter Stability -> Regime Stress -> Multiple-Testing Firewall -> Sealed OOS -> Portfolio Redundancy Test -> Paper -> Live Shadow -> Governance Review -> Optional Eligibility`

No stage may be skipped.

## Clean-room boundary

ATLAS may study the observable methodology of third-party quantitative systems, public documentation, lawfully supplied strategy files, and user-provided EAs as specimens. ATLAS must not copy proprietary source code, bypass access controls, reconstruct protected code from binaries, or treat vendor marketing results as evidence.

The reusable idea is the factory: generate many bounded rule candidates, falsify aggressively, preserve provenance, and retain only strategies that survive independent validation.

## Strategy grammar

Candidate generation must be bounded by an explicit, versioned grammar. Permitted families may include:

- trend / moving-average state;
- breakout / channel state;
- momentum / relative strength;
- mean reversion;
- volatility / ATR state;
- volume / liquidity state;
- breadth / market context;
- calendar / session filters;
- regime filters;
- stop, trailing-stop and time-stop policies;
- position-sizing hypotheses for research only.

Every generated candidate receives a deterministic `candidateId`, grammar version, parameter vector, source/provenance record, universe, timeframe, benchmark, cost model and generation seed.

Free-form strategies with unknown provenance are not promotable.

## Search discipline

Mass generation is allowed; mass significance is not.

A candidate cannot gain credibility because it was the best of a large search. Search breadth increases the multiple-testing burden.

Required search records:

- number of formulas/rules tested;
- number of parameter combinations tested;
- objective used during search;
- data period visible to the generator;
- random/evolutionary seed where applicable;
- rejected candidates and rejection reasons;
- family-level discovery count for false-discovery control.

## Data integrity gate

Hard fail unless all applicable checks pass:

- point-in-time inputs;
- no look-ahead leakage;
- survivorship-safe universe where cross-sectional claims are made;
- corporate-action normalization;
- timestamp/timezone consistency;
- same-instrument identity continuity;
- realistic tradability assumptions;
- reproducible data snapshot or version identifier.

A strategy with an excellent equity curve and failed data integrity is `REJECT_DATA_INVALID`.

## Costed backtest gate

Before a candidate is called profitable, results must include an explicit cost model appropriate to the instrument and horizon:

- spread;
- commissions/fees;
- slippage;
- turnover;
- financing/borrow where applicable;
- latency/execution assumptions where material.

Gross alpha is never net alpha.

## Temporal validation

Random train/test shuffles are prohibited when they violate time dependence.

Required where applicable:

- chronological train/validation/test separation;
- purging when labels or holding periods overlap;
- embargo around adjacent folds when leakage is possible;
- rolling or expanding walk-forward validation;
- sealed holdout not consulted during candidate generation or tuning.

The sealed OOS block can be opened once per frozen candidate version. A modified candidate receives a new version and cannot reuse the prior holdout as if unseen.

## Robustness stack

### Monte Carlo / path stress

Research must test whether the result depends on a lucky ordering or narrow execution path. Permitted stresses include trade-order reshuffling where logically valid, return/block bootstrap, slippage shocks, missed trades and start-date perturbation.

### Parameter Stability Ω

A candidate must be tested in a neighborhood around the selected parameter vector.

ATLAS prefers a **performance plateau** to a single sharp optimum. Required outputs include:

- neighbor parameter count;
- neighbor pass rate;
- median neighbor performance;
- degradation from center to neighborhood;
- fragility flag.

A strategy that works only at an isolated parameter point is `REJECT_PARAMETER_SPIKE`.

### Regime Stress Ω

At minimum, evaluate available evidence across materially different market states such as:

- bull / bear;
- high / low volatility;
- rising / falling rates or liquidity where relevant;
- high / low breadth;
- trend / chop.

A regime filter may legitimately specialize a strategy, but specialization must be declared ex ante and validated OOS. Failure outside an explicitly excluded regime is not hidden.

## Multiple-testing and overfitting firewall

Strategy Factory inherits the existing Benjamini-Hochberg FDR requirement and adds hooks for stronger diagnostics when statistically applicable:

- **Deflated Sharpe Ratio (DSR)**;
- **Probability of Backtest Overfitting (PBO)** using CSCV or a documented equivalent;
- **White's Reality Check** and/or **Hansen SPA** for data-snooping-aware benchmark comparison;
- family-level false-discovery accounting;
- effective number of trials when estimable.

These are evidence diagnostics, not decorative metrics. If a diagnostic is unavailable, the state is `NOT_COMPUTED`, never a fabricated pass.

## Portfolio construction gate

Surviving strategies are evaluated together, not only individually.

Required portfolio diagnostics include:

- return and drawdown correlation;
- signal/exposure overlap;
- common regime dependence;
- turnover interaction;
- concentration by instrument/factor/regime;
- marginal contribution to risk and expected utility.

Two near-identical strategies do not become diversification because they have different names or parameters.

QuantAnalyzer/portfolio-builder style diversification is adopted as a concept only: ATLAS implements its own portfolio logic and evidence rules.

## Promotion ladder

`IDEA -> GENERATED -> DATA_VALID -> COSTED_BACKTEST_PASS -> TEMPORAL_VALIDATION_PASS -> ROBUSTNESS_PASS -> MULTIPLE_TESTING_PASS -> SEALED_OOS_PASS -> PORTFOLIO_ELIGIBLE -> PAPER -> LIVE_SHADOW -> REPEATED_OOS -> MODEL_LEARNING_REVIEW -> OPTIONAL_ELIGIBLE`

Failure states are terminal for the frozen candidate version unless a new version is created with an explicit reason.

## Live shadow rule

`LIVE_SHADOW` means observe real-time signals and hypothetical fills without broker authority.

Required live-shadow record:

- timestamped signal before outcome;
- intended order type and price logic;
- observed spread/slippage proxy;
- hypothetical fill rule;
- realized forward result;
- divergence from backtest expectation;
- drift metrics.

No backfilled shadow trades are permitted.

## Overlay contract for the 37-stock portfolio

The current structural portfolio is not replaced or rescored by this module.

For a structurally eligible holding such as AVGO, Quant Lab may emit an overlay packet such as:

`trend=POSITIVE | momentum=POSITIVE | volatilityRegime=NEUTRAL | breadth=POSITIVE | entryQuality=82 | strategyEvidence=SHADOW_ONLY`

This packet may inform timing/research. It cannot create a structural BUY, force a SELL, or authorize an order.

## Anti-overfitting laws

1. Best-in-search is not evidence by itself.
2. In-sample alpha is never promotable.
3. Search count must be recorded.
4. A sealed holdout cannot be reused after tuning.
5. Costs and slippage are mandatory before calling alpha positive.
6. Parameter spikes are presumed fragile until falsified.
7. Multiple-testing correction is mandatory for generated families.
8. Regime specialization must be declared and validated, not discovered after failure.
9. Portfolio diversification must be measured, not inferred from strategy labels.
10. Live shadow observations must be timestamped before outcomes.
11. No third-party reputation, backtest screenshot or marketing claim has direct score weight.
12. Every candidate, rejection, promotion and retirement is versioned and reproducible.

## Decision authority

- Structural ATLAS remains supreme on what deserves ownership.
- Falsifier Veto remains independent and absolute.
- Strategy Factory structural score weight remains exactly zero.
- Strategy Factory has no broker execution authority.
- Entry Timing / Portfolio / Execution may consume only validated outputs allowed by their own gates.
- `NO ROBUST STRATEGY` is a valid and desirable output when evidence is insufficient.

## Implementation

- `src/atlas/algorithm/strategy-factory-omega.ts`
- `src/atlas/algorithm/strategy-factory-omega.test.ts`
- clean-room methodology note in `atlas-reverse-engineering`

## Result

ATLAS now formalizes automated strategy discovery as a **generator + falsifier**, not as a price-prediction oracle. The objective is not to find the prettiest historical equity curve; it is to discover rule families that remain economically and statistically credible after realistic friction, temporal separation, repeated perturbation, multiple-testing correction, sealed OOS and live shadow.