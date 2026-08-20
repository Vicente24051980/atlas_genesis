# ATLAS Ω — TREASURY DURATION INTERVENTION OVERLAY v1.0

**Effective date:** 2026-08-20  
**Status:** ACTIVE / CANONICAL COMPATIBLE under ATLAS Ω v3.1  
**Type:** Overlay — NOT a standalone engine  
**Parents:** Macro/Regime Ω + Money Rotation Ω + Macro Options Liquidity Ω + AI Financial Fragility Ω

## Mission
Measure whether Treasury debt-management operations are actually relieving long-duration financial conditions, and distinguish temporary plumbing relief from genuine macro regime improvement.

## Canonical chain
`fiscal deficit + sovereign issuance + AI/corporate issuance → duration supply → long-end yields/term premium ↑ → valuation & refinancing pressure → Treasury buybacks / issuance-mix response → duration relief? → cross-asset transmission`.

## Mandatory inputs
- UST 10Y yield and change
- UST 30Y yield and change
- 10s30s / curve shape where useful
- MOVE index
- DXY
- Treasury buyback announced and executed size
- buyback maturity bucket / off-the-run concentration
- bills vs coupon issuance mix
- auction tails / bid-to-cover / indirect-direct-primary-dealer allocation
- primary-dealer take-down
- investment-grade and high-yield credit spreads
- S&P 500 breadth / RSP vs cap-weighted index
- sector relative strength
- gold / BTC / long-duration Treasury reaction

## State machine
`T0_NO_SIGNAL → T1_ANNOUNCED → T2_PLUMBING_RELIEF → T3_FINANCIAL_CONDITIONS_RELIEF → T4_RISK_ASSET_CONFIRMATION`

Adverse states:
`F1_RELIEF_FAILS → F2_TERM_PREMIUM_REACCELERATION → F3_CREDIT_TRANSMISSION → F4_SYSTEMIC_STRESS`.

## Gates
### T1 — Announced
A policy announcement alone. No bullish inference.

### T2 — Plumbing relief
Requires observable improvement in long-end market functioning and/or yields/MOVE after implementation.

### T3 — Financial-conditions relief
Requires sustained long-end relief plus no deterioration in credit spreads or USD funding stress.

### T4 — Risk-asset confirmation
Requires breadth improvement and persistent risk-asset participation. Index price alone is insufficient.

## Hard laws
1. **TREASURY BUYBACK ≠ QE.** Do not classify debt-management buybacks as Fed reserve creation.
2. **BUYBACK ≠ YIELD-CURVE CONTROL.** Treasury operations do not create a guaranteed ceiling for 10Y/30Y yields.
3. **ANNOUNCEMENT ≠ EFFECT.** Score the realized market response, not political intent.
4. **YIELD RELIEF ≠ AI ECONOMIC PROOF.** Lower financing costs never waive AI CAPEX Payback Ω.
5. **INDEX RALLY ≠ BROAD RELIEF.** Require breadth/credit confirmation.
6. **TEMPORARY RELIEF ≠ STRUCTURAL FISCAL REPAIR.** Fiscal sustainability remains independently assessed.

## Key falsifiers / escalation
- 10Y > 4.80% with rising MOVE after intervention: relief failure warning.
- 10Y > 5.00% with rising MOVE: material term-premium escalation.
- 10Y > 5.20% with widening credit spreads / deteriorating breadth: high-severity transmission signal.
- 30Y making new yield highs despite executed buybacks: long-duration absorption failure.
- falling equities + widening credit + rising cross-asset correlation: route to Macro Options Liquidity Ω systemic escalation.

Thresholds are monitoring levels calibrated to the August-2026 regime, not timeless constants; future regimes require recalibration.

## Money Rotation Ω integration
When T2/T3 is confirmed, test actual recipients rather than assuming winners:
`software / financials / industrials / homebuilders / long-duration equities / gold / BTC / Treasuries`.

A recipient must still show observable flow, volume/relative-strength persistence and its normal ATLAS evidence gates.

## AI Financial Fragility Ω integration
For hyperscalers, datacenter operators, private-credit-linked infrastructure and highly levered AI beneficiaries, track:
`long-end yield → refinancing spread → debt-service burden → project IRR hurdle → CAPEX commitment durability → FCF → counterparty/credit transmission`.

Treasury relief reduces one financing-pressure input only. It does not convert financed demand into economic proof.

## Decision output
Return:
- overlay state,
- evidence timestamp,
- 10Y/30Y/MOVE/DXY/credit/breadth vector,
- policy action vs realized effect,
- affected funding pools,
- beneficiaries actually receiving capital,
- falsifiers,
- confidence,
- required next observation.

## Canonical conclusion
Use Treasury intervention as a **measured macro/liquidity overlay**, never as an automatic risk-on signal and never as a new standalone ATLAS engine.
