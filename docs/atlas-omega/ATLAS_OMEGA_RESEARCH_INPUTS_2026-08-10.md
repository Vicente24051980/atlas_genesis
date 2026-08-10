# ATLAS Ω — Research Inputs / Engine Separation

Date: 2026-08-10
Status: INFORMATION / RESEARCH INPUT
Repository scope: mobile-first ATLAS Ω canonical repository

> This document stores research information and operating rules. It does not by itself change portfolio positions or overwrite the output of any investment engine.

## 1. Permanent rule — engines must remain independent

ATLAS Ω must keep each investment algorithm/motor strictly separated. A BUY, NO BUY, score, declaration, thesis or universe produced by one engine must never overwrite the state of another engine.

Each ticker should preserve at minimum:

- `ticker_canonical`
- `instrument_id`
- `exchange`
- `motor_origen`
- `motor_version`
- `score_motor`
- `decision_motor`
- `state_motor`
- `evidence_snapshot_at`
- `market_price_snapshot`
- `falsifiers`
- `convergencia_multi_motor`

Multi-engine convergence is informative, not a license to merge engine outputs.

### Engines currently separated

1. **Principal Ω**
   - Mission: identify the highest-quality companies for a 3–6 year horizon.
   - Core dimensions: Business Quality, Growth, Moat, Financial Quality, Management, Valuation, CAPEX Productivity.
   - A company selected by another engine is not automatically a BUY here.

2. **Good Companies Cheap / Quality at a Discount Ω**
   - Mission: find good, profitable companies trading at a meaningful discount or depressed valuation with re-rating / normalization potential.
   - Core principle: an investment can improve even if earnings estimates fall, if market price falls more than intrinsic/fundamental value.

3. **Historical Dislocation Ω / Burry Contrarian Engine**
   - Mission: identify deeply punished businesses/sectors where price and sentiment are broken but the underlying business may survive and normalize.
   - Typical horizon: 12–36 months, potentially longer if the company evolves into a compounder.
   - Must not be confused with ordinary value or quality screening.

4. **Money Rotation Ω**
   - Mission: detect early changes in capital flows and sector/asset leadership.
   - Suggested regime ladder: R1–R6.
   - Price movement alone is not proof of rotation; volume, breadth, relative strength and multi-day confirmation matter.

5. **Bottom Reversal Ω**
   - Mission: detect the end of a downtrend before consensus using technical evidence.
   - It is a technical engine and must remain separate from business quality and valuation.
   - State ladder:
     - BR0: downtrend intact
     - BR1: exhaustion
     - BR2: possible bottom
     - BR3: reversal structure forming
     - BR4: structural breakout confirmed
     - BR5: successful retest
     - BR6: new uptrend established
   - Useful evidence: capitulation, bullish divergence, failed breakdown, first higher low, break of structure, volume confirmation, reclaim of key moving averages, double/triple bottom, inverse H&S, falling wedge, rounding bottom, base + retest.
   - A single green candle or sharp bounce is not a confirmed bottom.

6. **Specialized / thematic engines Ω**
   - Examples: AI/Semiconductors, Data Center/Electrification, Cybersecurity/Digital Protection, Healthcare, Aerospace/Defense, Energy/Resources, Emerging Markets.
   - A specialized BUY does not automatically become a Principal Ω BUY.

7. **Tactical Quant Rotation Ω**
   - Mission: rank which stocks currently have the strongest combination of quantitative factors and probability of outperforming.
   - This engine is inspired by the useful concept behind monthly model-driven selection systems, but ATLAS Ω must not copy proprietary weights from external providers.
   - Candidate input blocks:
     - Earnings Momentum Ω: estimate revisions, revenue/EPS revisions, surprise, guidance.
     - Growth Acceleration Ω: revenue/EPS/FCF/margin acceleration or deceleration.
     - Market Momentum Ω: 1M/3M/6M/12M, relative strength vs sector/index, trend quality.
     - Valuation Relative Ω: valuation vs own history, peers and growth.
     - Quality Ω: ROIC, FCF, margins, balance sheet, dilution.
     - Capital Rotation Ω: volume, breadth, sector leadership, persistence.
     - Catalyst Ω: earnings, products, capex cycle, regulation, events.
     - Risk / Overextension Ω: distance from moving averages, volatility, concentration, reversal risk.
   - Do not freeze factor weights until backtest + walk-forward / out-of-sample validation.
   - Operational cadence proposal: update scores every 2 days, rebalance monthly, except for confirmed severe falsifiers/risk events.

## 2. Frozen 100-ticker research universe — one-week test

The research universe was expanded from 80 to 100 tickers and is to remain frozen during the one-week observation window except for objective identifier/data errors.

The same 100 tickers must pass independently through every engine.

Universe:

MSFT, GOOG, NVDA, TSM, ASML, AVGO, AMZN, META, AAPL, V, MA, COST, LLY, NVO, ISRG, IDXX, DHR, TMO, ABT, BSX, SYK, ZTS, UNH, MCK, SPGI, MCO, ICE, CME, MSCI, BRK.B, JPM, BLK, BX, SCHW, ADP, INTU, NOW, CRM, ADBE, PLTR, SNPS, CDNS, ANET, PANW, CRWD, FTNT, NET, ORCL, SAP, CSU, ROP, HEI, TDG, SAF, GE, RTX, LMT, NOC, ETN, VRT, TT, PH, ITW, FAST, CTAS, CPRT, BKNG, MELI, SE, TCEHY, BABA, JD, HDB, TCS, RELIANCE, LIN, SHW, ECL, XOM, SHEL, AMD, KLAC, LRCX, AMAT, QCOM, APH, CAT, ABBV, UBER, CPAY, AJG, PWR, CARR, URI, FANG, BHP, AEM, MU, MRVL, CRDO.

### Instrument normalization rule

Do not treat an API/ticker failure as an investment decision.

Examples already identified:

- Constellation Software: canonical listing `TSX: CSU`; API aliases such as `CSU.TO` may fail depending on provider.
- Safran: canonical listing `Euronext Paris: SAF`; aliases such as `SAF.PA` are provider-dependent.
- Tata Consultancy Services: canonical listing `NSE: TCS`.
- Reliance Industries: canonical listing `NSE: RELIANCE`.
- Reliance GDR on London market must be tracked separately from the Indian ordinary share; do not mix their price histories/returns.
- HDFC Bank ADR / ordinary-share corporate actions must be normalized for split/bonus effects before technical-dislocation analysis.

## 3. Two-day market observation cadence

For the one-week test, preserve a timestamped market snapshot and compare every two days.

Suggested record:

`Ticker | Engine | Price | Δ2D | ΔSinceStart | RelativeStrength | Volume/Rotation | EngineState | EvidenceTimestamp`

Rules:

- Use real market data at the observation timestamp.
- Distinguish premarket, regular-session, after-hours and local exchange session state.
- Do not infer confirmed Money Rotation Ω from premarket movement alone.
- Normalize splits, bonuses, ADR/GDR ratios and other corporate actions.
- Do not change the frozen universe because of short-term performance.

## 4. Research input — Inter Parfums (NASDAQ: IPAR)

Source context provided from Investing.com / TD Cowen rating update.

Reported information:

- TD Cowen downgraded IPAR from Buy to Hold while raising its price target from $110 to $120.
- At the cited time, IPAR closed around $122.97.
- The important interpretation is not the analyst declaration itself but the relationship between price and estimated value: the target rose while the rating fell because the market price had already advanced beyond the analyst's new target.

ATLAS Ω treatment:

- Analyst recommendations are secondary evidence, never an autonomous investment signal.
- Principal Ω: good business, but not automatically BUY.
- Good Companies Cheap Ω: not an obvious candidate at the cited price because the stock was not clearly depressed relative to its own recent range.
- Historical Dislocation / Burry Ω: no clear deep dislocation at that moment.
- Bottom Reversal Ω: not applicable as a bottoming setup if trading near the upper part of its range.
- Keep on External Radar Ω rather than changing the frozen 100-ticker test universe.

## 5. Research input — Persimmon Plc (LSE: PSN)

Source context provided from Investing.com / Deutsche Bank.

Reported information:

- Deutsche Bank upgraded Persimmon from Hold to Buy while slightly reducing price target from 1,419p to 1,403p.
- The upgrade was attributed to share-price weakness rather than a major increase in earnings estimates.
- H1 FY2026 reported operating margin above consensus, 5,189 home completions and 13% YoY volume growth.
- Cost inflation remains a headwind.
- Deutsche Bank reportedly cut 2026–2028 profit estimates while upgrading the shares.

ATLAS Ω interpretation:

- This is a reference case for **Good Companies Cheap Ω**.
- Core lesson: investment attractiveness can improve when price falls faster than fundamental value, even if future earnings estimates are revised down modestly.
- Principal Ω: lower priority because the housebuilding model is cyclical and dependent on rates, housing demand and construction costs.
- Good Companies Cheap Ω: strong research candidate.
- Historical Dislocation / Burry Ω: candidate, but not automatically a deep-dislocation case without stronger capitulation evidence.
- Bottom Reversal Ω: watch for higher low + break of structure + volume + successful retest.
- Do not add PSN to the frozen 100-ticker one-week universe; maintain as external candidate for the next universe refresh.

## 6. Research input — ProPicks / “Titanes Tecnológicos” concept

Source context provided from Investing.com.

Reported/provider-claimed information:

- The ProPicks “Titanes Tecnológicos” strategy reportedly more than doubled the S&P 500's performance since its November 2023 launch.
- The provider describes a monthly AI-driven selection process with names such as Microsoft, Amazon and Nvidia.
- August 2026 context included a strong rebound in AI-related equities after volatile conditions.

Evidence integrity rule:

- Performance figures published by the strategy provider must be labeled `PROVIDER_REPORTED` unless independently audited/verified.
- Do not import proprietary model weights or treat marketing claims as primary evidence.
- The useful idea is structural: combine fundamentals, estimate revisions, valuation, momentum and market regime in a separate tactical quant engine.

ATLAS Ω action:

- Store the concept as research input for **Tactical Quant Rotation Ω**.
- Keep the engine independent from Principal Ω, Good Companies Cheap Ω, Burry Ω and Money Rotation Ω.
- Use the frozen 100-ticker universe as a common test bed, with independent scores per engine.
- Require historical backtest, transaction-cost assumptions, survivorship-bias controls and walk-forward/out-of-sample validation before treating Tactical Quant Ω as production-grade.

## 7. Evidence hierarchy / analyst declarations

External analyst upgrades/downgrades, price targets and provider strategy claims are information inputs only.

They may trigger investigation, but they must not directly change:

- Principal Ω decision
- Good Companies Cheap Ω decision
- Burry Ω decision
- Money Rotation Ω state
- Bottom Reversal Ω state
- Portfolio holdings

without independent evidence appropriate to that engine.

Required epistemic labels where appropriate:

- `PRIMARY_VERIFIED`
- `SECONDARY_VERIFIED`
- `PROVIDER_REPORTED`
- `UNVERIFIED_CLAIM`
- `DATA_FAIL`
- `CORPORATE_ACTION_NORMALIZED`

## 8. Implementation direction for the mobile app

The mobile application should display engine outputs separately, preferably as independent tabs/cards or an engine matrix per ticker.

Minimum conceptual view:

`Ticker → Principal Ω | Good Cheap Ω | Burry Ω | Rotation Ω | Bottom Reversal Ω | Tactical Quant Ω | Specialized Ω`

A multi-engine convergence badge can be shown, but it must never collapse the underlying independent decisions.

This file is informational research input and should be converted into typed contracts / database schema / UI only through a separate implementation RFC or code change.