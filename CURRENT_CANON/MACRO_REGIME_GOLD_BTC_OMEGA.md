# MACRO REGIME GOLD–BTC Ω

Status: CURRENT_CANON higher-layer macro sensor
Effective date: 2026-08-14
Scope: Atlas Financiero Ω / Historical Dislocation Ω / Money Rotation Ω / Market Top Risk Ω / Entry Timing Ω
CORE-00 impact: NONE. This module does not create a sixth Core engine and does not modify the frozen 30/30 corpus.

## Mission

Detect whether changes in gold, Bitcoin and monetary conditions are expressing one of four regimes:

1. BROAD_LIQUIDITY_RISK_ON
2. FLIGHT_TO_SAFETY
3. INFLATION_GEOPOLITICAL_HEDGE
4. MONETARY_UNCERTAINTY / MIXED

The module is a regime classifier and portfolio sensitivity layer. It never emits an automatic BUY or SELL by itself.

## Required inputs

Primary market sensors:

- Gold spot / XAUUSD: level, 1D/1W/1M trend, breakout vs 20D/50D/100D highs, realized volatility.
- Bitcoin / BTCUSD: level, 1D/1W/1M trend, relative strength vs gold and equities.
- US 2Y and 10Y yields.
- US real yields when available.
- DXY / broad USD direction.
- Investment-grade and high-yield credit spreads.
- Brent/WTI direction.
- Equity breadth: advance/decline, percentage above 50DMA and 200DMA, equal-weight vs cap-weight indices.
- Fed-implied policy probability and recent change, when available.

Optional confirmation:

- Gold ETF flows.
- Bitcoin ETF flows.
- Central-bank gold demand.
- VIX / volatility term structure.
- Inflation breakevens.

## Normalized signals

Each input is transformed to {-2,-1,0,+1,+2} using percentile/z-score or threshold buckets over a rolling historical window.

### Gold Strength Score (GSS)

GSS = 0.30*gold_1M + 0.25*gold_breakout + 0.20*gold_vs_DXY + 0.15*gold_vs_real_yields + 0.10*gold_flow_confirmation

### Bitcoin Liquidity Score (BLS)

BLS = 0.30*btc_1M + 0.25*btc_vs_gold + 0.20*btc_vs_equities + 0.15*btc_flow_confirmation + 0.10*btc_volatility_adjusted_trend

### Monetary Ease Score (MES)

MES = 0.30*minus_2Y_yield_change + 0.20*minus_real_yield_change + 0.20*minus_DXY_change + 0.15*fed_dovish_repricing + 0.15*credit_easing

### Risk Transmission Score (RTS)

RTS = 0.30*breadth + 0.25*credit + 0.20*equal_weight_relative_strength + 0.15*VIX_structure + 0.10*cyclicals_vs_defensives

## Regime logic

### BROAD_LIQUIDITY_RISK_ON

Typical pattern:

- GSS positive.
- BLS positive and improving.
- MES positive.
- RTS positive.
- Credit not deteriorating.

Interpretation: easier liquidity is transmitting beyond havens into risk assets.

### FLIGHT_TO_SAFETY

Typical pattern:

- GSS strongly positive.
- BLS flat/negative.
- Credit spreads widening and/or breadth deteriorating.
- USD and/or volatility may strengthen.

Interpretation: gold is being preferred as a defensive reserve asset rather than as part of a broad liquidity trade.

### INFLATION_GEOPOLITICAL_HEDGE

Typical pattern:

- GSS strongly positive.
- Oil/inflation breakevens positive.
- Real yields not necessarily falling.
- BTC may be mixed.

Interpretation: gold strength is driven more by inflation/geopolitical hedging than monetary easing.

### MONETARY_UNCERTAINTY / MIXED

Typical pattern:

- Gold and BTC diverge without confirmation from credit/breadth.
- Fed probabilities move but dollar/real yields do not confirm.
- Signals conflict.

Interpretation: no portfolio-level regime conclusion yet.

## Confirmation and hysteresis

No regime becomes CONFIRMED from one session.

- WATCH: score pattern present for 1 session.
- CONFIRMED: same regime persists for at least 3 regular sessions OR receives independent confirmation from credit + breadth.
- STRONG: confirmed regime plus multi-asset agreement from rates, dollar, credit and breadth.
- INVALIDATED: two or more key confirming signals reverse.

This hysteresis prevents reacting to one-day macro headlines.

## Portfolio Sensitivity Map — PORTFOLIO_35

The map is a directional sensitivity prior, not a fundamental verdict.

### More positively exposed to BROAD_LIQUIDITY_RISK_ON

GOOGL, MSFT, TSM, ASML, KLAC, SNPS, PANW, ORCL, NOW, PWR, SU.PA, HWM, SAF.PA, CARR, ISRG, BSX, SPGI, ICE, NDAQ, BIRK.

Primary mechanisms: lower discount rates, stronger growth multiples, AI/cloud CAPEX transmission, industrial/capital-market activity and improving risk appetite.

### More resilient / relatively favored in FLIGHT_TO_SAFETY

WCN, COR, ABT, CCEP, MRSH, CTAS, LIN, ZTS, TJX.

Primary mechanisms: defensive demand, recurring revenue, essential services, insurance brokerage, healthcare distribution and lower economic sensitivity relative to high-duration growth.

### Most vulnerable to FLIGHT_TO_SAFETY / higher real yields / stronger USD

TSM, ASML, KLAC, SNPS, NOW, ORCL, GOOGL, MSFT, BIRK, MEDP, ISRG, BSX, PWR, SU.PA, HWM, SAF.PA, CARR.

Primary mechanisms: duration/multiple compression, cyclical CAPEX sensitivity, global FX translation and/or risk-premium expansion.

### Potential beneficiaries of INFLATION_GEOPOLITICAL_HEDGE

LIN, PWR, SU.PA, HWM, SAF.PA, CARR, ICE, NDAQ, SPGI.

Primary mechanisms: infrastructure pricing power, electrification/capital investment, aerospace/defense-linked demand, trading/hedging volumes and market-data activity.

### Potential pressure from INFLATION_GEOPOLITICAL_HEDGE

BIRK, TJX, CCEP, MEDP, ISRG, BSX, TMO, DHR.

Primary mechanisms: consumer/input-cost pressure, financing sensitivity and healthcare/life-sciences valuation compression if inflation keeps real rates elevated.

## Impact scoring per stock

For each portfolio company compute:

MacroImpact_i = 0.30*DurationSensitivity_i + 0.20*CycleSensitivity_i + 0.15*USD_FXSensitivity_i + 0.15*EnergyInputSensitivity_i + 0.10*CreditSensitivity_i + 0.10*DefensiveRevenue_i

All factors are signed so the result ranges from -100 to +100 for the current regime.

Output buckets:

- +40 to +100: TAILWIND
- +15 to +39: POSITIVE
- -14 to +14: NEUTRAL
- -15 to -39: PRESSURE
- -40 to -100: MATERIAL_HEADWIND

The score must be combined with Quality Ω and company-specific fundamentals. MacroImpact never overrides a thesis falsifier or creates one.

## Cross-engine integration

`MACRO REGIME GOLD–BTC Ω -> MONEY ROTATION Ω -> HISTORICAL DISLOCATION Ω -> MARKET TOP RISK Ω -> ENTRY TIMING Ω`

Cross-check with:

`QUALITY Ω × GREEN CONTINUITY Ω × AI CAPEX PAYBACK Ω × MARKET BOTTOM Ω × CREDIT/BREADTH`

### Actions allowed

- tighten or relax NO_CHASE / ENTRY TIMING thresholds;
- increase research priority for sectors favored by a confirmed regime;
- flag portfolio names with MATERIAL_HEADWIND for falsifier review;
- promote potential dislocations to Historical Dislocation Ω;
- adjust tactical sizing recommendations subject to portfolio concentration rules.

### Actions forbidden

- automatic portfolio SELL from gold/BTC divergence alone;
- automatic BUY because gold or BTC breaks a price level;
- treating Fed-implied probabilities as facts;
- declaring a regime from a single market variable;
- confusing macro price action with company fundamental evidence.

## Current initialization — 2026-08-14

Initial state: YELLOW / MONETARY_UNCERTAINTY-MIXED.

Observed pattern supplied/validated around this initialization: gold recently strong and attempting a breakout while Bitcoin has not shown equivalent relative strength. The module therefore starts in WATCH, not CONFIRMED FLIGHT_TO_SAFETY.

Upgrade to BROAD_LIQUIDITY_RISK_ON requires Bitcoin/risk assets, credit and breadth to confirm easier monetary conditions.

Upgrade to FLIGHT_TO_SAFETY requires persistent gold outperformance plus deterioration in credit and/or equity breadth.

## Governance

This module is a higher-layer market sensor. It does not alter the fixed PORTFOLIO_35 composition by itself. Any constituent change requires explicit user decision or a separate validated fundamental falsifier.
