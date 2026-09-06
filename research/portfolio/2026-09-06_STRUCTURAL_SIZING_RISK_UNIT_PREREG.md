# ATLAS Ω — Structural Sizing + Risk Unit Calibration — PREREG

Date: 2026-09-06
Status: PREREGISTERED_RESEARCH / ZERO_PORTFOLIO_AUTHORITY

## Objective

Close the two remaining mathematical blockers that prevent ATLAS from publishing a reproducible structural MAX RETURN / LOW VOL portfolio:

1. risk terms in Endogenous Portfolio Engine v2 lack an explicit common unit contract;
2. no validated covariance-aware structural sizing engine exists.

This research must not use the current portfolio as a target and must be able to reject the proposed sizing method.

## Observed implementation mismatch

`PortfolioCandidateV2.expectedReturn` is a bridge whose components are summed as percentage-point Expected Return. The v2 risk fields `permanentLossRisk`, `tailRisk`, `volatilityRisk`, `fragility`, and `convexity` are plain numeric fields without an encoded unit/normalization contract.

An older Capital-Blind implementation uses explicitly named `expectedCompoundReturnPct`, `permanentLossRiskPct`, and `fragilityPenaltyPct`. This is evidence of a possible percentage-equivalent design lineage, but it is **not proof** that v2 current numeric fields already share those units.

Therefore no silent migration is allowed.

## Hypotheses

H1 — A deterministic normalization can map heterogeneous raw risk evidence into a stable common economic penalty unit without materially depending on arbitrary source score scales.

H2 — A covariance-aware sizing rule can improve prospective portfolio return/risk utility versus equal-weight and inverse-volatility baselines after turnover/slippage costs.

H3 — The chosen method remains stable across reasonable covariance windows, shrinkage assumptions, ER perturbations and market regimes.

H4 — Any concentration control that survives is justified by modeled ruin/liquidity/tail risk, not sector/geography aesthetics.

## Falsifiers

Reject activation if any of the following occurs:

- Equivalent raw risks expressed on different source scales produce materially different normalized outputs.
- Small parameter changes produce large arbitrary weight or membership changes.
- Performance advantage disappears OOS/walk-forward after costs.
- Results are dominated by one historical episode or one security.
- Covariance estimation is unstable enough that weights flip materially under reasonable windows/shrinkage.
- The optimizer requires sector/geography quotas to remain numerically stable.
- Expected Return perturbations within evidence uncertainty produce implausibly concentrated or discontinuous weights without an economic risk explanation.
- Missing/stale observations are silently imputed in a way that changes selection or sizing.

## Phase A — unit contract

For every structural input declare:

- raw source field;
- raw unit;
- transformation;
- output unit;
- admissible range;
- PIT timestamp;
- evidence confidence;
- missing-data behavior;
- clipping/winsorization behavior, if any;
- falsifier.

Required terms:

- Expected Return;
- Permanent Loss risk;
- Tail risk;
- Volatility risk;
- Fragility;
- Convexity/offset benefit;
- financing/common-fragility term;
- covariance / correlation.

Candidate transforms may be studied but none is canonical ex ante:

A. percentage-point expected loss / penalty equivalents;
B. cross-sectional robust z-scores converted to a fixed utility penalty scale;
C. scenario-derived expected shortfall equivalents;
D. hybrid fundamental-loss + market-risk representation.

The winning transform must be selected by preregistered stability/OOS criteria, not by similarity to the current holdings.

## Phase B — covariance evidence

Covariance input must persist:

- price/return provider;
- adjusted-price definition;
- requested and effective dates;
- observation count per security;
- aligned sample count;
- return frequency;
- covariance estimator;
- shrinkage method/parameter;
- PSD repair method and tolerance;
- missing-data policy;
- covariance matrix hash;
- code version.

At minimum compare rolling windows such as 1Y / 2Y / 3Y when data availability permits, plus a shrinkage estimator. These windows are research arms, not chosen retrospectively by best performance.

## Phase C — sizing arms

Use the **same selected membership and same PIT ER/risk snapshot** for each sizing arm.

Null / baseline arms:

1. Equal weight — experimental baseline only.
2. Inverse volatility.
3. Minimum variance long-only.

Research arms:

4. Return-tilted minimum variance.
5. Utility maximization using calibrated forward ER and calibrated structural risk penalties.
6. Risk-budget variant only if risk-budget constraints are economically derived rather than aesthetic.

No sector, geography, style, market-cap or narrative quotas.

## Phase D — constraints

Default research domain:

- long-only;
- weights sum to 1;
- no leverage unless separately preregistered;
- no arbitrary minimum position count;
- no arbitrary maximum position count;
- no per-name cap solely for visual diversification.

A maximum weight may be introduced only if derived from a declared liquidity, permanent-loss, tail/ruin or execution constraint. If so, its calibration and sensitivity must be reported.

## Phase E — validation

Required before canonical activation:

- deterministic repeated execution;
- source-scale invariance tests;
- covariance matrix validation;
- parameter perturbation grid;
- ER uncertainty perturbation;
- rolling / walk-forward OOS;
- multiple market regimes;
- turnover and implementation costs;
- comparison with equal-weight / inverse-vol / min-var nulls;
- concentration diagnostics without concentration penalties;
- max drawdown / volatility / downside / expected shortfall diagnostics;
- attribution of utility improvement by ticker and by risk mechanism.

## Activation threshold

No fixed performance uplift is asserted today. A threshold must be frozen before the final validation run after exploratory diagnostics establish realistic measurement noise.

Until that preregistered threshold and OOS test are completed:

`STRUCTURAL_SIZING_AUTHORITY.canonicalReady = false`

and structural portfolio publication remains blocked.

## Required production output

When/if activated, every sizing run must emit:

- `sizingEngineVersion`
- `sizingPolicyHash`
- `sizingEvidenceHash`
- `portfolioVolatilityModelHash`
- covariance metadata/hash
- normalized risk-unit contract version
- selected tickers
- exact weights
- portfolio expected return
- predicted volatility
- permanent-loss/tail/fragility diagnostics
- marginal risk contribution
- sensitivity summary
- OOS validation reference
- `validationState=VALIDATED`

## Governance

Research result != portfolio command.

Historical fit != Expected Return.

Covariance-aware label != validated sizing.

Current holding != target.

`ADMITTED != SELECTED != SIZED != TRADE`.
