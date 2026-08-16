# GLOBAL LIQUIDITY TRANSMISSION Ω v2.0

**Status:** CANONICAL HIGHER-LAYER MACRO / ROTATION ENGINE  
**Date:** 2026-08-16

## Mission
Detect whether liquidity is expanding or contracting, identify who creates it, measure its momentum and determine where it actually travels before drawing conclusions for assets.

## Inviolable laws
- MONETARY_LIQUIDITY != MARKET_LIQUIDITY.
- MARKET_LIQUIDITY != ASSET_SPECIFIC_LIQUIDITY.
- GLOBAL_LIQUIDITY_GROWTH != UNIVERSAL_RISK_ASSET_INFLOW.
- LIQUIDITY_SOURCE != LIQUIDITY_DESTINATION.
- LIQUIDITY_STOCK != LIQUIDITY_MOMENTUM.
- PRICE_MOVE != LIQUIDITY_FLOW.

## Three compulsory dimensions

### 1. Liquidity Stock Ω
Absolute amount/capacity of monetary and credit liquidity available.

### 2. Liquidity Momentum Ω
Rate of change and acceleration/deceleration of liquidity. Markets can weaken while stock remains high if marginal growth deteriorates.

### 3. Liquidity Destination Ω
Where liquidity is actually transmitted: equities, bonds, gold, Bitcoin, commodities, private credit, real-economy CAPEX, bank reserves or Treasury collateral.

## Transmission channels
1. Central-bank liquidity: Fed/ECB/PBoC/BoJ balance sheets and reserve conditions.
2. Treasury/liquidity plumbing: TGA, reserves, RRP, issuance/refunding and FIMA/swap context.
3. Credit liquidity: bank credit, USD/EUR/JPY international credit, IG/HY, private credit.
4. Market liquidity: ETF/fund flows, breadth, volatility, positioning, market depth.
5. Destination Ω: asset and real-economy absorption.

## Speculative Liquidity Canary Ω
BTC is a marginal-risk-liquidity sensor, not a market oracle.

Required inputs:
- BTC trend/relative strength.
- Stablecoin liquidity.
- BTC ETF flows.
- Real yields.
- DXY.
- HY spreads.
- Global Liquidity Momentum Ω.
- Nasdaq/equity breadth.

### Canary states
- `RISK_LIQUIDITY_HEALTHY`: BTC/risk breadth improving, real yields/DXY supportive, HY calm.
- `DIVERGENCE_WATCH`: BTC weak but credit/breadth stable.
- `LIQUIDITY_STRESS`: BTC weak + liquidity momentum down + DXY/real yields up and/or HY widening.
- `CASCADE_CONFIRMATION`: canary stress plus independent Systemic Cascade evidence.

BTC alone cannot confirm any systemic state.

## Destination examples
- PBoC easing may transmit to domestic credit, industry or gold rather than Bitcoin.
- Fed liquidity can remain in reserves/Treasury plumbing rather than equities.
- Private capital can fund AI infrastructure rather than listed equities.
- Strong equity inflows can coexist with money-market and gold inflows.

## Integration
Feeds:
- Macro Regime / Gold Ω
- Speculative Liquidity Canary Ω
- Sovereign Liquidity Plumbing Ω
- Institutional Capital Rotation Ω
- Money Rotation Ω
- Market Top Risk Ω
- Entry Timing Ω
- Systemic Cascade Ω

## Decision law
This engine cannot emit an automatic portfolio BUY/SELL. It changes regime context, research priority, NO_CHASE/entry thresholds and Cascade Gate sensitivity only.

## Current initialization — 16 Aug 2026
Working state: `LIQUIDITY_MOMENTUM = MIXED/DECELERATING; DESTINATION = SELECTIVE`. This is a research state, not a portfolio action.
