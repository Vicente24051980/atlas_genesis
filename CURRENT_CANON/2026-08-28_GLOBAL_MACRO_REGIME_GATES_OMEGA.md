# ATLAS Ω — GLOBAL MACRO REGIME GATES Ω

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective date:** 2026-08-28  
**Authority:** ATLAS Ω v4.0  
**Scope:** market-regime detection, discount-rate transmission, sovereign-duration flows, Treasury plumbing, energy-inflation pass-through and real-asset signal interpretation.

## 1. Objective

Detect only **material** changes in market regime that can alter portfolio risk posture. This module is not a trading signal and cannot create BUY/SELL by itself.

Primary question:

> Has the macro regime changed enough — through rates, inflation, energy, liquidity, FX, sovereign flows, geopolitics or rotation — to materially change the expected-return/risk balance of the ATLAS portfolio?

## 2. Mandatory monitored variables

At every full regime check, ingest and timestamp:

- U.S. Treasury 10Y yield.
- U.S. Treasury 30Y yield.
- Japan Government Bond 10Y yield.
- Japan Government Bond 30Y yield.
- USDJPY.
- DXY.
- Brent.
- WTI.
- U.S. diesel / distillate prices when available.
- Diesel/gasoil crack spreads and other relevant refined-product cracks.
- Nasdaq-100 futures.
- S&P 500 futures.
- Headline and core PCE.
- Headline and core CPI.
- Inflation expectations / breakevens / wage and services inflation when material.
- Treasury General Account (TGA).
- Federal Reserve balance sheet / reserve conditions when material.
- Treasury debt buybacks, size, frequency and maturity buckets.
- Treasury issuance composition: bills vs coupons, maturity profile, auction size and refunding plans.
- Japan holdings of U.S. Treasuries from TIC or equivalent official evidence when available.
- Gold as a real-asset / fiscal / monetary-risk thermometer.
- Relevant geopolitical events with plausible transmission into energy, trade, rates, FX, credit or liquidity.
- Equity breadth, sector rotation and relative strength when needed to verify transmission into risk assets.

Every observation must include `SOURCE`, `AS_OF`, `FREQUENCY`, `PREVIOUS_COMPARABLE`, and `DATA_QUALITY`.

## 3. Evidence law

Mandatory:

- **CORRELATION ≠ CAUSATION.**
- **INTRADAY MOVE ≠ REGIME CHANGE.**
- **JGB YIELD UP ≠ JAPANESE UST SELLING.**
- **TREASURY BUYBACK ≠ QE.**
- **TGA CHANGE ≠ MONETARY EASING/TIGHTENING BY ITSELF.**
- **CRUDE DOWN ≠ REFINED-PRODUCT INFLATION CLEARED.**
- **GOLD UP ≠ BUY GOLD.**
- **HAWKISH RHETORIC ≠ REALIZED POLICY PATH until rates/market pricing/data confirm.**
- **FUTURES MOVE ≠ CASH-MARKET CONFIRMATION.**

ATLAS must fail closed when evidence is missing or non-comparable.

## 4. Regime state machine

Allowed top-level states:

- `RISK_ON_CLEAR`
- `RISK_ON_FRAGILE`
- `NEUTRAL`
- `NEUTRAL_DEFENSIVE`
- `RISK_OFF_WATCH`
- `RISK_OFF_CONFIRMED`
- `DATA_INCOMPLETE`

A state change requires **cross-confirmation** across independent transmission channels and sufficient persistence for the underlying variable. One isolated session is insufficient unless the event is mechanically regime-changing (e.g. emergency central-bank action, capital control, market closure, sovereign default, war shock with confirmed supply impairment).

## 5. JAPAN CAPITAL REPATRIATION GATE Ω

### Question

Are higher Japanese yields, FX changes and hedge economics reducing the incentive for Japanese investors to hold U.S. duration enough to create a material marginal demand shift for Treasuries?

### Mandatory inputs

`JGB10Y -> JGB30Y -> UST10Y -> UST30Y -> USDJPY -> FX_HEDGE_COST -> HEDGED_UST_YIELD -> UNHEDGED_UST_YIELD -> HEDGED_JGB_RELATIVE_RETURN -> JAPAN_UST_HOLDINGS -> JAPAN_FLOW_EVIDENCE`

### Required analysis

1. Compare UST vs JGB on both unhedged and hedged economics.
2. Explicitly model whether FX-hedging cost materially erodes the UST yield advantage.
3. Track direction and persistence of USDJPY; do not infer investor action from FX alone.
4. Use TIC / official holdings data when available.
5. Distinguish stock of holdings from actual monthly/weekly flow.
6. Separate banks, insurers, pensions and other investor classes when reliable evidence exists.
7. Never claim repatriation or Treasury selling without observed flow/holding evidence.

### States

- `JCR0_NO_SIGNAL`
- `JCR1_ECONOMIC_INCENTIVE_SHIFT`
- `JCR2_FLOW_WATCH`
- `JCR3_CONFIRMED_REPATRIATION_PRESSURE`
- `JCR4_SYSTEMIC_DURATION_DEMAND_SHOCK`
- `JCR_DATA_INCOMPLETE`

`JCR1` may be reached from yield/hedge economics alone. `JCR3+` requires direct flow/holdings evidence plus market-consistent transmission.

## 6. TREASURY LIQUIDITY / MANAGEMENT GATE Ω

### Question

Are Treasury funding operations changing market liquidity, duration supply or reserve conditions in a way that materially changes risk-asset discount rates?

### Mandatory inputs

`BUYBACK_SIZE -> BUYBACK_FREQUENCY -> BUYBACK_MATURITY_BUCKET -> AUCTION_CALENDAR -> BILL_SHARE -> COUPON_SHARE -> WAM -> REFUNDING_SIZE -> NET_MARKETABLE_BORROWING -> TGA -> FED_BALANCE_SHEET -> RESERVES -> RRP -> AUCTION_TAILS / BID_TO_COVER when material`

### Core distinction

- Treasury buybacks are **debt/liquidity management**.
- Federal Reserve asset purchases are **monetary balance-sheet operations**.
- Treasury buybacks must never be labelled QE unless the Fed itself is expanding assets/reserves through monetary operations.

### Interpretation

Assess separately:

1. **Liquidity support:** removal of illiquid/off-the-run securities.
2. **Duration supply:** whether funding composition adds/removes net duration from private hands.
3. **Cash plumbing:** TGA draw/build and reserve impact.
4. **Monetary plumbing:** Fed balance sheet, reserves and RRP.
5. **Auction stress:** weak demand, tails, dealer absorption, concession.

### States

- `TLM0_NEUTRAL_MANAGEMENT`
- `TLM1_LIQUIDITY_SUPPORT`
- `TLM2_DURATION_SUPPLY_PRESSURE`
- `TLM3_RESERVE_DRAIN_PRESSURE`
- `TLM4_COMBINED_TREASURY_STRESS`
- `TLM_DATA_INCOMPLETE`

No state is an equity BUY/SELL signal by itself.

## 7. MACRO DISCOUNT-RATE GATE Ω

### Question

Do rates, inflation, FX and energy imply material pressure or relief on valuation multiples of growth/AI and other long-duration assets?

### Mandatory chain

`UST10Y/30Y -> JGB10Y/30Y -> REAL_YIELDS -> INFLATION -> FED_PATH -> DXY/USDJPY -> ENERGY -> WACC -> EQUITY_RISK_PREMIUM -> DURATION_SENSITIVITY -> MULTIPLE_PRESSURE/RELIEF`

### Interpretation law

Fundamentals and valuation must remain separate:

`AI ECONOMIC PROOF can be GREEN while MACRO DISCOUNT RATE is RED.`

The gate must explicitly identify which channel is active:

- nominal-rate pressure,
- real-rate pressure,
- inflation persistence,
- energy reacceleration,
- dollar tightening,
- foreign-duration-demand deterioration,
- or liquidity relief.

### States

- `MDR0_NEUTRAL`
- `MDR1_RELIEF`
- `MDR2_PRESSURE`
- `MDR3_MATERIAL_COMPRESSION_RISK`
- `MDR4_SYSTEMIC_DURATION_SHOCK`
- `MDR_DATA_INCOMPLETE`

`MDR3+` requires more than a one-session yield move: persistence and/or confirmation through policy pricing, inflation, FX, breadth or valuation-sensitive equity behavior.

## 8. ENERGY-INFLATION PASS-THROUGH Ω

### Question

Is energy creating a persistent inflation impulse that can feed transport, logistics, agriculture, industry, services or inflation expectations?

### Mandatory separation

Never collapse the energy complex into one crude price.

Track independently:

- Brent.
- WTI.
- Diesel / distillates.
- Gasoil where relevant.
- Gasoline.
- Relevant crack spreads.
- Refinery outages/capacity.
- Inventories.
- Freight/logistics transmission.

### Causal ladder

`CRUDE/PRODUCT SUPPLY SHOCK -> REFINED PRODUCT PRICE -> TRANSPORT/LOGISTICS COST -> PRODUCER COST -> MARGIN/PRICE RESPONSE -> CPI/PCE/WAGE SECOND ROUND`

A high diesel crack with stable/falling crude is a valid inflation warning because refinery/product scarcity can transmit independently from headline oil.

### States

- `EIP0_NEUTRAL`
- `EIP1_CRUDE_PRESSURE`
- `EIP2_REFINED_PRODUCT_PRESSURE`
- `EIP3_CONFIRMED_PASS_THROUGH_RISK`
- `EIP4_BROAD_INFLATION_REACCELERATION`
- `EIP_DATA_INCOMPLETE`

## 9. GOLD / REAL-ASSET SIGNAL Ω

Gold is a **thermometer**, not an automatic allocation signal.

Interpret gold jointly with:

- real yields,
- DXY,
- sovereign debt/fiscal risk,
- inflation expectations,
- geopolitical risk,
- central-bank reserve demand,
- ETF/physical flows when reliable.

Possible states:

- `GRA0_NEUTRAL`
- `GRA1_MONETARY_FISCAL_RISK_PREMIUM`
- `GRA2_INFLATION_HEDGE_DEMAND`
- `GRA3_GEOPOLITICAL_SAFE_HAVEN`
- `GRA4_CENTRAL_BANK_ACCUMULATION_SIGNAL`
- `GRA_MIXED`
- `GRA_DATA_INCOMPLETE`

Multiple causes may coexist. Do not force a single-cause explanation.

## 10. Rotation / equity confirmation

Use equity behavior only as a transmission/confirmation layer, not as primary macro evidence.

Required when relevant:

`SPX -> NDX -> equal-weight -> 11 GICS -> breadth -> semis/software/financials/energy/defensives -> credit spreads -> VIX/rates vol where available`

Distinguish:

- index gain driven by a few mega-caps,
- broad risk-on,
- defensive rotation,
- value/cyclicals rotation,
- duration compression,
- technical rebound.

## 11. Notification Gate Ω

The system must notify the user **only** when there is sufficient evidence of one of:

1. `MATERIAL_REGIME_CHANGE`
2. `MATERIAL_DETERIORATION`
3. `CLEAR_RELIEF`

Otherwise output internally:

`NO_MATERIAL_CHANGE / NO_NOTIFICATION`.

### Minimum notification standard

A notification must contain:

- Variables that changed.
- Direction and magnitude/persistence.
- Probable causal chain.
- Alternative explanations.
- Evidence grade: `HIGH / MEDIUM / LOW`.
- Which gates changed state.
- Portfolio transmission.
- Whether portfolio action is `NONE`, `NO_CHASE`, `ENTRY_BIAS_CHANGE`, `RISK_BUDGET_REVIEW`, or `STRUCTURAL_REVIEW`.

No notification may claim causal certainty when evidence only supports association.

## 12. Portfolio transmission

Map macro changes into ATLAS exposure buckets:

### High duration / valuation-sensitive
AI compute, semiconductors, EDA, premium software, high-growth internet, long-duration compounders.

### Moderate duration / quality growth
Mega-cap platforms, data/analytics, high-quality industrial compounders.

### Lower duration / cash-flow defensive
Payments, exchanges, insurance brokers, payroll/data franchises, selected healthcare/defensives.

### Real-asset/cyclical
Energy, materials, selected industrials.

Required output:

`GATE_STATE -> TRANSMISSION_CHANNEL -> AFFECTED_BUCKETS -> EXPECTED_DIRECTION -> CONFIDENCE -> ACTION_THRESHOLD`.

A macro deterioration alone does **not** falsify a company thesis. It modifies discount rate, position sizing, entry discipline and expected-return hurdle unless company fundamentals themselves deteriorate.

## 13. Evidence grading

- `HIGH`: official data / primary source + independent market confirmation.
- `MEDIUM`: strong market evidence or multiple reputable secondary sources, but incomplete causal proof.
- `LOW`: narrative, isolated price action, single-source speculation, unverified flow claims.

Any `LOW`-only thesis cannot trigger a material regime notification.

## 14. Canonical output contract

```text
ATLAS_MACRO_REGIME_CHECK
AS_OF:
TOP_LEVEL_REGIME:
MATERIAL_CHANGE: YES/NO
CHANGE_TYPE: MATERIAL_REGIME_CHANGE | MATERIAL_DETERIORATION | CLEAR_RELIEF | NONE

UST10Y:
UST30Y:
JGB10Y:
JGB30Y:
USDJPY:
DXY:
BRENT:
WTI:
DIESEL:
CRACK_SPREADS:
NQ_FUTURES:
ES_FUTURES:
PCE:
CPI:
TGA:
TREASURY_BUYBACKS:
ISSUANCE_COMPOSITION:
FED_BALANCE_SHEET:
JAPAN_UST_HOLDINGS:
GOLD:

JAPAN_CAPITAL_REPATRIATION_GATE:
TREASURY_LIQUIDITY_MANAGEMENT_GATE:
MACRO_DISCOUNT_RATE_GATE:
ENERGY_INFLATION_PASS_THROUGH_GATE:
GOLD_REAL_ASSET_SIGNAL:
ROTATION_CONFIRMATION:

CAUSALITY_ASSESSMENT:
ALTERNATIVE_EXPLANATIONS:
EVIDENCE_GRADE:
PORTFOLIO_EFFECT:
PORTFOLIO_ACTION:
FALSIFIERS:
NEXT_CONFIRMATION_REQUIRED:
```

## 15. Hard prohibitions

ATLAS must never:

- infer Japanese Treasury sales from JGB yields alone;
- call Treasury buybacks QE;
- infer liquidity from TGA alone;
- infer inflation relief from crude alone when refined products remain stressed;
- treat gold as a BUY signal;
- treat a one-day equity/rates move as a regime change;
- override company-level Economic Proof solely because of macro price action;
- change the portfolio without Competition for Capital + valuation + falsifier review.

## 16. Integration point

Insert into the active pipeline after `Sovereign Liquidity Plumbing Ω / Global Liquidity Transmission Ω` and before final `Cross-Engine Synthesis Ω`:

`Macro Raw Data -> Evidence Integrity -> JAPAN CAPITAL REPATRIATION -> TREASURY LIQUIDITY/MANAGEMENT -> ENERGY-INFLATION PASS-THROUGH -> GOLD/REAL-ASSET -> MACRO DISCOUNT-RATE -> ROTATION CONFIRMATION -> REGIME SYNTHESIS -> PORTFOLIO TRANSMISSION -> NOTIFICATION GATE`.

**Canonical rule:** the module changes posture only when evidence is sufficient; otherwise it remains silent.