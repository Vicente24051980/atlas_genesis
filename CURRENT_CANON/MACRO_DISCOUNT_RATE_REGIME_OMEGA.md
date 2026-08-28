# MACRO DISCOUNT RATE REGIME OMEGA

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective:** 2026-08-29  
**Parent:** ATLAS Omega v4.0  

## Purpose

Convert persistent changes in the cost of capital into a portfolio-entry and valuation overlay without confusing a one-session yield shock with a structural risk-off regime.

## Core law

`HIGHER YIELDS != AUTOMATIC SELL`

ATLAS must distinguish:

`POLICY_REPRICING -> VALUATION PRESSURE`

from

`LONG_END_DISLOCATION -> SYSTEMIC_DURATION_STRESS`

and from

`ECONOMIC_DETERIORATION -> EARNINGS/CREDIT DAMAGE`.

## Regime states

- `DR0_BENIGN`
- `DR1_NEUTRAL`
- `DR2_NEUTRAL_DEFENSIVE`
- `DR3_DURATION_COMPRESSION`
- `DR4_SYSTEMIC_RISK_OFF`

Default after 28-Aug-2026 evidence: `DR2_NEUTRAL_DEFENSIVE` unless subsequently falsified or escalated by persistence.

## Mandatory inputs

`UST_2Y -> UST_10Y -> UST_30Y -> REAL_YIELDS -> FED_PATH -> INFLATION -> DXY -> CREDIT_SPREADS -> EQUITY_BREADTH -> EARNINGS_REVISIONS -> LIQUIDITY -> ENERGY_PASS_THROUGH -> JAPAN_REPATRIATION -> AI_ECONOMIC_PROOF -> AI_EQUITY_MONETIZATION`

## Persistence Gate

ATLAS must not promote to `DR3_DURATION_COMPRESSION` from one session alone.

Escalation requires multi-session persistence or equivalent high-conviction evidence across several channels:

1. 10Y and/or 30Y remain elevated or continue rising across multiple regular closes;
2. inflation remains sticky or re-accelerates;
3. equity breadth/relative strength of long-duration growth deteriorates persistently;
4. credit/liquidity conditions worsen; and/or
5. earnings revisions begin to deteriorate.

The more channels confirm simultaneously, the higher the escalation confidence.

`YIELD_SPIKE_ONE_DAY != REGIME_CHANGE`

## Long-end Panic distinction

Classify independently:

- `POLICY_RATE_SHOCK`: front end reprices materially higher;
- `LONG_END_STRESS`: 10Y/30Y rise materially and persistently;
- `LONG_END_PANIC`: disorderly long-end repricing plus liquidity/credit confirmation.

A bear flattening driven mostly by 2Y repricing is less dangerous for six-year equity value than a simultaneous 2Y/10Y/30Y disorderly selloff.

## Inflation / Energy pass-through

Crude relief does not close the energy-inflation channel when refined products remain stressed.

Track separately:

`CRUDE -> DIESEL_CRACK -> DISTILLATE_INVENTORIES -> TRANSPORT_COST -> AGRICULTURE_COST -> LOGISTICS_COST -> CORE_PASS_THROUGH`

Do not infer economy-wide inflation from one energy price alone.

## Japan Repatriation Gate

Track:

`JGB_YIELDS -> BOJ_PATH -> FX_HEDGE_COST -> UST_JGB_SPREAD -> TIC_HOLDINGS -> VERIFIED_CURRENT_FLOWS`

Past TIC reductions or stronger domestic JGB economics support `WATCH`, but do not establish current Japanese Treasury selling without direct evidence.

## Treasury Liquidity rule

Treasury buybacks for liquidity/debt-management purposes are not QE.

`TREASURY_BUYBACK != FED_BALANCE_SHEET_EXPANSION`

TGA changes must be interpreted jointly with Treasury issuance, bank reserves and Fed balance-sheet data.

## Portfolio Entry Overlay

When regime is `DR2_NEUTRAL_DEFENSIVE`, increase the hurdle rate for:

- long-duration cash flows;
- high multiple dependence;
- high leverage/refinancing dependence;
- negative or distant FCF;
- narrative-heavy growth with weak Economic Proof.

Increase relative attractiveness of:

- current FCF;
- high and durable ROIC;
- pricing power;
- strong balance sheets;
- earnings-driven rather than multiple-driven return;
- recurring revenue with low capital intensity.

## Entry Objective Adjustment

Base portfolio objective remains Expected Return + risk control.

Apply regime penalty:

`ADJUSTED_EXPECTED_RETURN = BASE_EXPECTED_RETURN - DURATION_PENALTY - MULTIPLE_DEPENDENCE_PENALTY - LEVERAGE_PENALTY - DISTANT_FCF_PENALTY`

and resilience credit:

`RESILIENCE_CREDIT = CURRENT_FCF + ROIC + PRICING_POWER + BALANCE_SHEET + EARNINGS_VISIBILITY`

Weights must be calibrated empirically; no arbitrary universal percentage is canonical until validated.

## AI interaction

`AI_ECONOMIC_PROOF` and `AI_EQUITY_MONETIZATION` remain separate.

A rising discount rate can reduce Equity Monetization while Economic Proof remains intact.

Required distinction:

`AI_DEMAND_STRONG + WACC_UP -> VALUATION_PRESSURE`

is not equivalent to:

`AI_DEMAND_DOWN -> FUNDAMENTAL_DETERIORATION`.

## Portfolio action authority

`DR2_NEUTRAL_DEFENSIVE` does NOT by itself authorize structural sells.

Default action:

`NO_SELL / NO_CHASE / HIGHER_ENTRY_HURDLE / REWEIGHT_ONLY_IF_PERSISTENCE`

`DR3_DURATION_COMPRESSION` activates portfolio re-optimization review, not automatic liquidation.

`DR4_SYSTEMIC_RISK_OFF` requires separate confirmation from credit, liquidity, breadth, earnings and systemic engines before defensive structural action.

## Required output

`REGIME_STATE -> POLICY_REPRICING -> LONG_END_STATE -> INFLATION -> ENERGY_PASS_THROUGH -> JAPAN_GATE -> LIQUIDITY -> CREDIT -> BREADTH -> EARNINGS_REVISIONS -> AI_PROOF -> AI_MONETIZATION -> ENTRY_OVERLAY -> PORTFOLIO_ACTION`
