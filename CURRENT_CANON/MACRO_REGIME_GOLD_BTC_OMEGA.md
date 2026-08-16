# MACRO REGIME — GOLD / BTC Ω v2.0

**Status:** CURRENT_CANON higher-layer macro sensor  
**Effective date:** 2026-08-16  
**Scope:** ATLAS Ω v3.1

## Mission
Use gold and Bitcoin as different macro sensors rather than assuming they express the same monetary regime.

## Core separation

### Gold Monetary Demand Ω
Primary roles:
- central-bank reserve diversification;
- fiscal/monetary-confidence hedge;
- geopolitical hedge;
- inflation/real-rate sensitivity;
- physical/ETF demand.

Inputs:
- central-bank purchases/reserve surveys;
- gold ETF flows;
- physical demand/inventories where reliable;
- real yields;
- DXY;
- oil/inflation breakevens;
- sovereign/fiscal stress;
- gold in EUR/JPY and other reserve currencies.

States:
- `GOLD_NEUTRAL`
- `MONETARY_HEDGE`
- `FISCAL_GEOPOLITICAL_HEDGE`
- `CONFIRMED_RECEIVER`
- `CROWDED/EXTENDED`

### BTC Speculative Liquidity Ω
Primary roles:
- marginal risk-liquidity sensor;
- digital scarcity/monetary optionality;
- institutional/ETF flow destination;
- speculative-risk appetite.

Inputs:
- BTC trend and relative strength;
- stablecoin liquidity;
- ETF flows;
- real yields;
- DXY;
- HY spreads;
- global liquidity momentum;
- Nasdaq/equity breadth.

States:
- `LIQUIDITY_HEALTHY`
- `DIVERGENCE_WATCH`
- `LIQUIDITY_STRESS`
- `CASCADE_CONFIRMATION_ONLY_WITH_CROSS_ASSET_EVIDENCE`

## Inviolable laws
- GOLD_UP != DOLLAR_COLLAPSE.
- BTC_DOWN != EQUITY_CRASH.
- GOLD_AND_BTC_MAY_DIVERGE_FOR_LONG_PERIODS.
- CENTRAL_BANK_GOLD_BUYING != CENTRAL_BANK_BITCOIN_BUYING.
- PRICE != FLOW.

## Regime matrix
1. **BROAD_LIQUIDITY_RISK_ON:** BTC/liquidity/breadth improve; credit calm; gold may also rise.
2. **FLIGHT_TO_SAFETY:** gold strong; BTC weak/mixed; credit/breadth deteriorate.
3. **INFLATION_GEOPOLITICAL_HEDGE:** gold strong with oil/breakevens/fiscal stress; real yields need not fall.
4. **MONETARY_UNCERTAINTY_MIXED:** gold/BTC diverge without confirming credit/breadth.

## Integration
Feeds:
- Global Liquidity Transmission Ω
- Speculative Liquidity Canary Ω
- Sovereign Liquidity Plumbing Ω
- European Fragmentation Ω
- Money Rotation Ω
- Market Top Risk Ω
- Historical Dislocation Ω
- Entry Timing Ω

## Actions allowed
- alter research priority;
- adjust NO_CHASE/Entry Timing thresholds;
- flag cross-asset divergences;
- raise Cascade Gate sensitivity when credit/sovereign stress confirms.

## Actions forbidden
- automatic portfolio SELL from gold/BTC divergence;
- automatic BUY because either breaks a price level;
- declaring fiscal/monetary collapse from metal/crypto price alone.

## Current initialization — 2026-08-16
`GOLD = STRUCTURAL MONETARY/FISCAL HEDGE, POSITIVE RECEIVER CONTEXT`.

`BTC = LIQUIDITY DIVERGENCE WATCH`.

No systemic state is confirmed by either asset alone.
