# ATLAS Ω — Capital-Blind Portfolio Selection Ω v1.0

Date: 2026-09-05
Governance basis: explicit user ratification that portfolio selection must ignore current invested capital and must choose an endogenous number of positions between 20 and 35.

## Constitutional rule

ATLAS never asks how much money is currently invested in a ticker to determine whether that ticker deserves portfolio membership.

The following inputs have zero selection authority:

- current invested euros;
- current position weight;
- personal unrealized/realized P&L;
- personal average cost;
- current total portfolio capital base;
- incumbent/held status.

The same company must receive the same portfolio-selection result whether the user owns EUR 0, EUR 1, EUR 1,000 or EUR 100,000 of it.

## Objective

Portfolio_Omega* = argmax over 20 <= N <= 35 of:

Expected Compound Return
- Permanent-Loss Risk
- Fragility
- Portfolio Redundancy
- Complexity
+ Causal Diversification Benefit
+ Robustness Benefit

subject to all applicable Hard Gates and T0 discovery integrity.

## Cardinality

- MIN_POSITIONS = 20.
- MAX_POSITIONS = 35.
- OPTIMAL_N is endogenous.
- 25, 30 and 35 are not targets.
- Above the 20-position floor, a new ticker enters only if marginal portfolio contribution is positive.
- ATLAS never fills to 35 merely because capacity exists.
- ATLAS never ejects a positive marginal contributor merely to force N=25 or N=30.

## Separation of concerns

Selection Omega decides membership only.

It does not emit target weights.
It does not emit entry timing.
It does not use current cost basis.

Canonical flow:

T0 Size-Blind Discovery
-> Hard Gates / Fundamental Quality
-> Growth / FCF / ROIC
-> Revisions / Inflection
-> Financing Quality / Circular Demand when applicable
-> Expectation Gap
-> Valuation / Expected Return 3-6Y
-> Permanent-Loss Risk
-> Falsifiers / Drivers / Chain Budget
-> Competition for Capital
-> Capital-Blind Portfolio Selection Omega
-> Replacement Firewall for executable transitions
-> Position Sizing / Upsilon
-> Entry Timing
-> Capital execution

## Important distinction

Capital-Blind is not Price-Blind.

Valuation and Expected Return are legitimate economic inputs because they affect future return from today's price. Personal average cost is not.

## Incumbency

Current holdings receive zero membership bonus. A current holding and a zero-position challenger compete on the same evidence standard after T0.

Replacement Firewall remains downstream because execution friction and anti-churn govern whether and how a transition is implemented; they do not rewrite the clean portfolio-selection ranking.

## T0 inheritance

This law does not weaken T0. Discovery remains size-blind and auditable across capitalization buckets before score or portfolio membership is considered.

## Implementation

Primary module:
`src/atlas/algorithm/capital-blind-portfolio-selection-omega.ts`

Canonical registry:
`src/atlas/algorithm/portfolio-selection-canon-omega.ts`

Hierarchy rollup target:
`2026-09-05-v4.19.0`
