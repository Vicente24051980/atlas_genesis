# INSTITUTIONAL CAPITAL ROTATION Ω — CURRENT CANON

**Status:** CANONICAL higher-layer engine  
**Version:** 1.0.0  
**Date:** 2026-08-15  
**Engine ID:** `INSTITUTIONAL_CAPITAL_ROTATION_OMEGA_V1_0`

This module is integrated into the ATLAS Ω refinement stack immediately after `MONEY_ROTATION_OMEGA` and before specialized sector rotation engines.

It does **not** modify or expand CORE-00. It is a higher-layer analytical engine governed by Evidence Integrity Ω and Decision Safety Gate Ω.

## Canonical purpose

Detect and measure genuine institutional capital migration across sectors, subsectors, factors and regions before consensus, while keeping the distinction:

`PRICE / MARKET CAP / MOMENTUM != CAPITAL FLOW`.

## Canonical score

`Institutional Flow Score Ω = 25% real flows + 15% breadth + 15% relative strength + 15% persistent volume + 10% leader accumulation + 5% positioning/options + 10% revisions/fundamentals + 5% macro compatibility`.

States:

- 0–39 `NO_FLOW`
- 40–54 `NEUTRAL`
- 55–64 `EARLY_ROTATION`
- 65–74 `INSTITUTIONAL_ACCUMULATION_PROBABLE`
- 75–84 `CONFIRMED_RECEIVER`
- 85–100 `STRONG_CAPITAL_ROTATION`

Hard evidence gate: `CONFIRMED_RECEIVER` cannot be reached from price/volume alone. It requires real fund/ETF flow evidence or independent institutional-positioning evidence.

## Early/late sensors

**Capital Flow Divergence Ω:** price flat/down while breadth and flows improve. Escalates research before obvious breakout.

**Distribution Warning Ω:** price still rising while breadth and flows deteriorate. Produces `AVOID_CHASING` / distribution audit.

## Engine separation

- `MONEY_ROTATION_OMEGA`: lifecycle/dislocation R1–R6.
- `INSTITUTIONAL_CAPITAL_ROTATION_OMEGA`: current direction and strength of independently evidenced capital migration.

Neither engine overwrites the other. Both outputs coexist in Decision Log Ω.

## Canonical implementation

- `src/atlas/institutional-rotation/engine.ts`
- `src/atlas/institutional-rotation/engine.test.ts`
- `src/atlas/algorithm/institutional-capital-rotation-omega.ts`
- `docs/rfcs/RFC-INSTITUTIONAL-CAPITAL-ROTATION-OMEGA-v1.0.md`

Integration points:

- `src/atlas/algorithm/atlas-primary-engine-hierarchy.ts`
- `src/atlas/algorithm/money-rotation-omega.ts`

## Operating cadence

Daily detection → 3-session persistence → weekly flow validation → monthly regime persistence → quarterly retrospective ownership confirmation.

Every run stores score, state, delta, transition, divergence/distribution flags, evidence IDs and detection latency.

## Portfolio law

This engine may prioritize research, identify sectors and 3–5 beneficiary tickers, calibrate NO_CHASE/entry timing and hand off candidates to other engines. It cannot autonomously alter the fixed portfolio or emit a BUY/SELL order.

## Persistence law

Daily reports must be persisted to both GitHub and Notion. GitHub + Notion = COMPLETE.
