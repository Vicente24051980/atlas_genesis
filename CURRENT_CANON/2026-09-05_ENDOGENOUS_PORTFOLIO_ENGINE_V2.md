# ATLAS Ω — Endogenous Portfolio Engine v2.1

Date: 2026-09-06
Status: ACTIVE_CANONICAL.
Governance basis: explicit user ratification of Portfolio > Ticker, Capital-Blind Selection and the INVIOLABLE MAX RETURN / LOW VOL LAW.

## Constitutional objective

ATLAS selects the portfolio set, not a ranked list of isolated tickers.

**INVIOLABLE LAW:** maximize expected return subject to modeled volatility, permanent-loss risk, tail risk and fragility. Sector, geography, style, market-cap bucket and aesthetic balance have zero independent membership authority.

Canonical utility:

U(S) = ER(S)
+ beta * Robustness(S)
+ gamma * Convexity(S)
- lambda * WeightedRisk(S)
- phi * Fragility(S)
- eta * FinancingCorrelation(S)
- kappa * Complexity(S)
- UncertaintyCost(S)

where WeightedRisk combines Permanent Loss, Tail Risk and Volatility under a versioned policy.

**There is no standalone diversification reward and no standalone causal-redundancy penalty.** Causal diversification, redundancy and driver coverage remain diagnostics only. They can matter only through an independently measured effect on actual modeled risk.

## Sector / diversification neutrality

ATLAS MUST NOT:
- impose sector quotas;
- require geographic balance;
- require a missing causal driver;
- add a position because the portfolio looks concentrated;
- reject a position because too many winners share the same sector label;
- rescue a weaker candidate because it makes the portfolio look more diversified.

A portfolio can contain 15 financials and 15 healthcare names, or any other concentration, if those names dominate whole-portfolio expected-return/risk utility.

Diversification is purely instrumental: it has value only when it demonstrably reduces modeled risk enough to improve total utility after the expected-return trade-off.

## Capital-Blind law preserved

Current invested euros, current position weight, personal P/L, personal cost basis, current total capital and incumbent status have zero clean-selection authority.

Capital-Blind is not Price-Blind. Valuation and explicit Expected Return from today's price remain admissible because they affect future return.

## Individual ticker layer

Ticker evidence is evaluated independently before portfolio construction using quality, sustainable growth, FCF conversion, incremental ROIC, Expectation Gap, Financing Quality, forward revisions/inflexion, catalysts, expected return, volatility and permanent-loss risk.

The individual score does not decide membership by itself.

## Expected Return bridge

Expected Return is decomposed as:

Fundamental Growth + Cash Yield + Capital Returns + Multiple Normalization.

A low or high P/E alone is not an Expected Return estimate.

## Causal Redundancy Ω — diagnostic only

Each company carries a causal-driver vector (AI CAPEX, rates, credit, consumer, health, industrial, commodity, power, China, regulation, FX, recession, etc.).

Redundancy is computed from shared causal dependence for diagnosis and stress analysis, not to enforce diversification. Canonical utility assigns it zero standalone reward/penalty authority.

## Financing Correlation Ω — risk input

Shared funding sources/counterparties are measured separately. Distinct tickers can share the same financed dollar and therefore the same economic fragility.

Financing Correlation remains admissible because it is a common-fragility risk input, not a diversification aesthetic.

## Scenario Matrix Ω

Canonical first scenario family:
1. AI CAPEX -30%
2. Treasury 10Y +100bp
3. US recession
4. Credit crunch
5. Persistent inflation
6. AI monetization disappoints
7. Taiwan/China shock
8. Commodity shock
9. Healthcare/regulatory shock
10. USD +/-15%

Each company supplies impact in [-5,+5]. Portfolio robustness records worst scenario, simultaneous affected count and offset capacity. Robustness has authority only as risk measurement.

## Risk hierarchy

Canonical v2.1 operating policy:
- 40% Permanent Loss
- 20% Tail Risk
- 40% Volatility

These are versioned operating weights, not universal mathematical truths. They encode the current user objective: high expected return with low volatility and low permanent-loss risk.

## Neutral selection weights

During set comparison only:

w_test = 1/N.

These are not real target weights and never become Position Sizing. After membership selection, Sizing Ω operates independently.

## Endogenous N

The engine evaluates a best-known set for every N from 1 to the canonical default search ceiling of 50, capped by the number of eligible candidates. The ceiling is a computational/search bound, not a diversification target.

N* is the first knee where delta utility to N+1 falls below the material threshold.

**No missing-driver, sector-balance or diversification exception is allowed.** If only a small number of names clear the return/risk bar, ATLAS is allowed to select a small portfolio. If many names clear it, N can expand.

The implementation uses deterministic local search and therefore MUST NOT claim proof of the global combinatorial optimum.

## Alpha vs risk efficiency

Membership can be earned by:
- CORE_ALPHA: direct expected-return contribution;
- CORE_ROBUSTNESS: material modeled risk reduction that improves whole-portfolio utility;
- COMPLEMENTARY_ALPHA: positive material contribution;
- BORDERLINE: near-zero marginal contribution;
- REDUNDANT: individually good but unnecessary in the set;
- REJECTED: hard-gate/falsifier failure.

CORE_ROBUSTNESS is never granted because a sector or driver is missing.

## Anti-Dilution Gate Ω

An additional position is rejected when its incremental return/risk utility does not compensate dilution of stronger ideas.

No position is admitted merely for diversification, sector balance, geography, style balance or portfolio appearance.

## Replacement Firewall v2.1 semantics

Replacement is evaluated as:

ReplacementValue = U(P - incumbent + challenger) - U(P).

Ticker score difference alone is insufficient. A challenger wins only if it materially improves whole-portfolio return/risk utility under the applicable hysteresis threshold.

Sector balancing and missing-driver completion have zero replacement authority.

## Hysteresis Ω

GREEN incumbent: highest replacement threshold.
ORANGE incumbent: lower threshold.
RED incumbent: near-open firewall.

This prevents churn from decimal-level ranking changes.

## Confidence Ω

Confidence is separate from score and Expected Return. It reflects disclosure quality, forecast uncertainty, contradictory evidence, track record and contractual transparency. The engine may charge uncertainty cost but must not convert Score x Confidence into Expected Return.

## Canonical order

T0 Size-Blind Discovery
-> Hard Gates / Fundamental Evidence
-> Individual Opportunity Inputs
-> Expected Return + Volatility/Permanent-Loss/Tail/Fragility inputs
-> Causal Driver + Financing Source mapping for diagnostics/stress
-> Scenario Matrix
-> Portfolio Return/Risk Optimization for endogenous N
-> Endogenous N knee selection without diversification exceptions
-> Replacement Firewall for executable transition
-> Position Sizing Ω / Υ
-> Entry Timing Ω
-> Capital execution

## Implementation boundary

Primary module:
`src/atlas/algorithm/endogenous-portfolio-engine-v2.ts`

Canonical registry:
`src/atlas/algorithm/endogenous-portfolio-engine-v2-canon.ts`

Canonical enforcement tests:
`src/atlas/algorithm/endogenous-portfolio-engine-v2.test.ts`

The historical v1 selector remains preserved for auditability. Endogenous Portfolio Engine v2.0 (2026-09-05) is superseded where it granted independent authority to diversification, causal redundancy, required driver coverage, the N>=20 floor or missing-driver exceptions.

Hierarchy rollup target: `2026-09-06-v4.21.0`.
