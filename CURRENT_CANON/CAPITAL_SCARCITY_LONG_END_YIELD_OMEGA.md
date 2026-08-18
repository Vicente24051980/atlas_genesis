# ATLAS Ω — CAPITAL SCARCITY / LONG-END YIELD Ω

**Status:** ACTIVE / CANONICAL COMPATIBLE MODULE  
**Version:** 1.0.0  
**Effective date:** 2026-08-18  
**Algorithm:** `src/atlas/algorithm/capital-scarcity-long-end-yield-omega.ts`

## Mission

Separate **business deterioration** from **valuation compression caused by a higher opportunity cost of capital**. The module asks whether a company can still compound and clear the required return hurdle when long sovereign yields, term premium and public/private financing demand rise together.

It is a cross-sectional overlay. It does not forecast bond yields and does not emit autonomous BUY/SELL orders.

## Core causal chain

`SOVEREIGN ISSUANCE → PRIVATE CAPEX DEMAND → TERM PREMIUM → LONG-END YIELD → WACC / DISCOUNT RATE → IMPLIED EXPECTATIONS → MULTIPLE COMPRESSION → EXPECTED EQUITY RETURN`

A second branch must be preserved simultaneously:

`PRIVATE CAPEX → ORDERS / BACKLOG → REVENUE / MARGIN / FCF FOR SUPPLIERS`

Therefore the same CAPEX boom can strengthen supplier fundamentals while raising the discount rate applied to those fundamentals.

## Non-negotiable laws

- **CAPEX BOOM ≠ EASY MONEY.**
- **CAPEX GROWTH ≠ STOCK-PRICE APPRECIATION.**
- **FUNDAMENTAL STRENGTH ≠ MULTIPLE IMMUNITY.**
- **HIGHER LONG-END YIELD ≠ FUNDAMENTAL FALSIFIER.**
- **HIGHER DISCOUNT RATE = LOWER PRESENT VALUE, ALL ELSE EQUAL.**
- **PRICE DECLINE + FUNDAMENTALS INTACT ≠ BUY.**
- **SOVEREIGN AND PRIVATE BORROWERS CAN COMPETE FOR THE SAME FINANCING POOL.**
- **A CAPEX RECEIVER CAN BE ECONOMICALLY STRONG AND STILL BE A POOR STOCK AT THE CURRENT PRICE.**

## Mandatory inputs

Record when available:

1. UST 10Y and 30Y yield level and trend.
2. Relevant domestic long sovereign yield for non-US exposures.
3. Real-yield trend.
4. Term-premium trend.
5. Sovereign issuance / fiscal funding pressure.
6. Private CAPEX financing demand.
7. Investment-grade and high-yield credit-spread trend.
8. Liquidity conditions.
9. Inflation impulse, including energy/oil where material.
10. Company refinancing dependence and maturity wall.
11. Company funding mix: internal FCF / debt / leases / equity / prepayments / project finance.
12. Equity-duration sensitivity: near-term cash generation versus distant terminal-value dependence.
13. Current valuation and implied growth expectations.

## State ladder

`CS0_ABUNDANT_CAPITAL` — long-end conditions easing and financing broadly available.  
`CS1_NORMAL` — no material capital-scarcity signal.  
`CS2_TIGHTENING` — long yields/term premium rising; valuation hurdle should be rechecked.  
`CS3_CAPITAL_SCARCITY` — materially higher opportunity cost plus meaningful funding pressure.  
`CS4_FISCAL_PRIVATE_CROWDING` — elevated sovereign funding pressure and elevated private CAPEX demand compete while the long end rises.  
`CS5_STRESS_CASCADE` — long-end shock is joined by widening credit spreads / stressed liquidity / refinancing impairment.

The state ladder is **non-parametric until calibrated**. No universal yield level mechanically triggers a state. Evaluate change, history, regime, spreads, liquidity and company exposure together.

## Company sensitivity

### Positive resilience

- high current FCF conversion
- high incremental ROIC
- internally funded growth
- low refinancing dependence
- pricing power
- strong balance sheet
- short/medium-duration cash flows
- CAPEX with demonstrated payback

### Negative sensitivity

- debt-funded CAPEX dependence
- large near-term refinancing needs
- weak or distant monetization
- low incremental ROIC
- high dilution dependence
- valuation requiring near-perfect long-duration growth
- customer demand dependent on external financing/backstops

## Rate-Hurdle Rule Ω

When the long end rises materially, ATLAS must re-run:

`Reverse DCF → Implied Return → Future Already Paid Ω → Capital Funding Quality Ω → Expected Return → Entry Timing Ω`

A lower stock price is an opportunity only if the **updated expected return still clears the updated opportunity-cost hurdle**.

## Interaction with AI / CAPEX

Do not classify technology as one duration bucket. Separate:

`compute → memory → semicap → EDA → networking → platforms/cloud → software → power/grid → cooling/physical infrastructure`

For CAPEX spenders, route through AI CAPEX Payback Ω / Capital Funding Quality Ω.  
For suppliers, route through Global CAPEX Chain Ω / CAPEX Capture Elasticity Ω.  
For both, apply Capital Scarcity Ω to valuation and funding resilience.

## Required downstream routes

`Valuation / Implied Return Ω`  
`Capital Funding Quality Ω`  
`Financed Demand Ω`  
`Market Top Risk Ω`  
`Entry Timing Ω`  
`Falsifiers Ω`

## Falsifiers / regime relief

A scarcity/stress state should be downgraded when evidence shows several of the following persistently:

- long sovereign yields reverse lower without inflation reacceleration;
- term premium falls;
- sovereign issuance is absorbed without worsening auction/spread conditions;
- credit spreads tighten;
- liquidity improves;
- refinancing costs stabilize;
- private CAPEX is increasingly funded from internally generated cash rather than fragile external structures.

## Output contract

Every run returns:

`CAPITAL_SCARCITY_STATE → CONFIDENCE → VALUATION_HURDLE_ACTION → FUNDING_RISK_ACTION → REASONS → FALSIFIERS → ROUTES`

Allowed hurdle actions:

`LOWER_HURDLE_WITH_CAUTION / KEEP_HURDLE / RAISE_HURDLE / RAISE_HURDLE_MATERIALLY`

## Final rule

Capital Scarcity Ω does not decide whether a company is good. It decides whether **the financing environment and opportunity cost require a more demanding price and expected return** for that company.