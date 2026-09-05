# ATLAS Ω — Endogenous Portfolio Engine v2

Date: 2026-09-05
Status: ACTIVE_CANONICAL once merged.
Governance basis: explicit user ratification of Portfolio > Ticker, Capital-Blind Selection and endogenous N in [20,35].

## Constitutional objective

ATLAS selects the portfolio set, not a ranked list of isolated tickers.

U(S) = ER(S)
+ alpha * CausalDiversification(S)
+ beta * Robustness(S)
+ gamma * Convexity(S)
- lambda * PermanentLoss(S)
- phi * Fragility(S)
- rho * CausalRedundancy(S)
- eta * FinancingCorrelation(S)
- tau * TailRisk(S)
- kappa * Complexity(S)

subject to all Hard Gates, Falsifier Veto, T0 discovery integrity and 20 <= |S| <= 35.

## Capital-Blind law preserved

Current invested euros, current position weight, personal P/L, personal cost basis, current total capital and incumbent status have zero clean-selection authority.

Capital-Blind is not Price-Blind. Valuation and explicit Expected Return from today's price remain admissible because they affect future return.

## Individual ticker layer

Ticker evidence is evaluated independently before portfolio construction using quality, sustainable growth, FCF conversion, incremental ROIC, Expectation Gap, Financing Quality, forward revisions/inflexion, catalysts and permanent-loss risk.

The individual score does not decide membership by itself.

## Expected Return bridge

Expected Return is decomposed as:

Fundamental Growth + Cash Yield + Capital Returns + Multiple Normalization.

A low or high P/E alone is not an Expected Return estimate.

## Causal Redundancy Ω

Each company carries a causal-driver vector (AI CAPEX, rates, credit, consumer, health, industrial, commodity, power, China, regulation, FX, recession, etc.).

Redundancy is computed from shared causal dependence, not only GICS labels or historical market correlation.

## Financing Correlation Ω

Shared funding sources/counterparties are measured separately. Distinct tickers can share the same financed dollar and therefore the same economic fragility.

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

Each company supplies impact in [-5,+5]. Portfolio robustness records worst scenario, simultaneous affected count and offset capacity.

## Risk hierarchy

Default versioned policy:
- 65% Permanent Loss
- 20% Tail Risk
- 15% Volatility

This is a versioned policy parameter, not a universal mathematical truth.

## Neutral selection weights

During set comparison only:

w_test = 1/N.

These are not real target weights and never become Position Sizing. After membership selection, Sizing Ω operates independently.

## Endogenous N

The engine evaluates a best-known set for every N from 20 to 35. The implementation uses deterministic local search and therefore MUST NOT claim proof of the global combinatorial optimum.

N* is the first knee where delta utility to N+1 falls below the material threshold, unless the N+1 portfolio adds a structurally missing required driver and improves robustness materially.

Tiny positive improvements do not justify extra positions.

## Alpha vs robustness

Membership can be earned by:
- CORE_ALPHA: direct expected-return contribution;
- CORE_ROBUSTNESS: material improvement in structural robustness;
- COMPLEMENTARY_ALPHA: positive material contribution;
- BORDERLINE: near-zero marginal contribution;
- REDUNDANT: individually good but unnecessary in the set;
- REJECTED: hard-gate/falsifier failure.

Decorative diversification is prohibited.

## Anti-Dilution Gate Ω

An additional position is rejected when its incremental benefit does not compensate dilution of stronger ideas and it adds no material diversification or robustness.

## Replacement Firewall v2 semantics

Replacement is evaluated as:

ReplacementValue = U(P - incumbent + challenger) - U(P).

Ticker score difference alone is insufficient. A lower-score challenger may win if it removes a critical concentration; a higher-score challenger may lose if it duplicates existing drivers.

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
-> Causal Driver + Financing Source mapping
-> Scenario Matrix
-> Portfolio Set Optimization for N=20..35
-> Endogenous N knee selection
-> Replacement Firewall for executable transition
-> Position Sizing Ω / Υ
-> Entry Timing Ω
-> Capital execution

## Implementation boundary

Primary module:
`src/atlas/algorithm/endogenous-portfolio-engine-v2.ts`

Canonical registry:
`src/atlas/algorithm/endogenous-portfolio-engine-v2-canon.ts`

The historical v1 selector remains preserved for auditability and is superseded only for set-level optimization.

Hierarchy rollup target: `2026-09-05-v4.20.0`.
