# INSTITUTIONAL CAPITAL ROTATION Ω — CURRENT CANON

**Status:** CANONICAL higher-layer engine  
**Version:** 1.1.0  
**Date:** 2026-08-16  
**Engine ID:** `INSTITUTIONAL_CAPITAL_ROTATION_OMEGA_V1_1`

## Canonical purpose
Detect genuine institutional capital migration across regions, sectors, industries, factors and tickers before consensus while preserving:

`PRICE / MARKET CAP / MOMENTUM != CAPITAL FLOW`.

## Institutional Flow Score Ω
`25% real flows + 15% breadth + 15% relative strength + 15% persistent volume + 10% leader accumulation + 5% positioning/options + 10% revisions/fundamentals + 5% macro compatibility`.

States:
- 0–39 `NO_FLOW`
- 40–54 `NEUTRAL`
- 55–64 `EARLY_ROTATION`
- 65–74 `INSTITUTIONAL_ACCUMULATION_PROBABLE`
- 75–84 `CONFIRMED_RECEIVER`
- 85–100 `STRONG_CAPITAL_ROTATION`

Hard gate: `CONFIRMED_RECEIVER` cannot be reached from price/volume alone. It requires real fund/ETF flow evidence or independent institutional positioning evidence.

## Institutional Convergence Ω — new sublayer
Purpose: detect independent sponsorship convergence among managers/13F/ownership disclosures without misclassifying it as current flow.

### Evidence inputs
- new position vs add vs trim vs exit;
- portfolio weight and change in weight;
- number of independent managers converging;
- manager-style diversity (quality/value/growth/activist/etc.);
- quarter-over-quarter persistence;
- company fundamentals/revisions during the same period.

### Laws
- `13F CHANGE = SPONSORSHIP EVIDENCE`.
- `13F HOLDING != REAL-TIME FLOW`.
- `MULTIPLE MANAGERS BOUGHT != BUY SIGNAL`.
- delayed filings require Temporal Normalization.
- overlapping managers/funds must not be double-counted as independent evidence.

### Convergence states
- `NO_CONVERGENCE`
- `EMERGING_SPONSORSHIP`
- `MULTI_MANAGER_CONVERGENCE`
- `CONVERGENCE_CONFIRMED`
- `CONVERGENCE_DECAY`

Convergence may raise Discovery/Successor audit priority and Evidence Confidence; it cannot by itself produce `CONFIRMED_RECEIVER` or a portfolio trade.

## Early/late sensors
**Capital Flow Divergence Ω:** flows/breadth improve before price.

**Distribution Warning Ω:** price rises while breadth/flows deteriorate.

## Engine separation
- Money Rotation Ω: R1–R6 lifecycle/dislocation.
- Institutional Capital Rotation Ω: current direction/strength of independently evidenced capital migration.
- Institutional Convergence Ω: delayed sponsorship/ownership pattern.

All outputs coexist; none overwrites another.

## Operating cadence
Daily detection → 3-session persistence → weekly flow validation → monthly regime persistence → quarterly ownership/convergence confirmation.

## Portfolio law
May prioritize research, identify beneficiary clusters and calibrate NO_CHASE/Entry Timing. Cannot autonomously alter portfolio or issue BUY/SELL.
