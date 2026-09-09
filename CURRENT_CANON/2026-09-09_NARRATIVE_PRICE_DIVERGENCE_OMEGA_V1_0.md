# NARRATIVE–PRICE DIVERGENCE Ω v1.0

**Status:** ACTIVE · CANONICAL DIAGNOSTIC  
**Effective:** 2026-09-09  
**Implementation:** `src/atlas/algorithm/narrative-price-divergence-omega.ts`  
**Tests:** `src/atlas/algorithm/narrative-price-divergence-omega.test.ts`  
**Registry:** `src/atlas/algorithm/narrative-price-divergence-omega.registry.ts`  
**Decision authority:** NONE

## Purpose

Measure whether index price behavior is unusually resilient or unusually weak relative to an objectively elevated macro-stress regime. The module does not score headlines, media sentiment or political narratives. `macroStressScore` must come from traceable upstream market/macro evidence.

Core distinction:

`BAD NEWS ALREADY KNOWN != NEGATIVE SURPRISE`

A market can remain resilient while oil, yields, geopolitical risk or policy uncertainty are elevated. That resilience is informative only if market internals confirm it. Index-level strength by itself is insufficient.

## Architecture

This is not a seventh ATLAS engine and does not modify Six-Engine architecture.

Placement:

`MACRO / LIQUIDITY / MARKET DATA -> NARRATIVE–PRICE DIVERGENCE Ω -> MARKET RISK & SIGNAL INTERPRETATION -> DSE / WATCHLIST PRIORITIZATION -> E1…E6`

It complements `MACRO OPTIONS LIQUIDITY Ω` and DSE-Ω. It never transfers score directly into Reverse Screener Discovery Ω or portfolio sizing.

## Inputs

All bounded 0–100 unless stated otherwise:

- `macroStressScore`
- `indexDrawdownFromHighPct` — positive drawdown magnitude
- `indexAtNew20dLow`
- `breadthDeteriorationScore`
- `sectorRelativeStrengthConfirmationScore`
- `positiveDseSharePct`
- `negativeDseSharePct`
- `creditSpreadStressScore`
- `longEndYieldStressScore`
- `oilShockScore`

Evidence must be traceable. Missing traceability returns `EVIDENCE_PENDING`.

## State logic

### RESILIENCE base condition

Macro stress is elevated when:

`macroStressScore >= 60`

Price is resilient when macro stress is elevated AND:

- drawdown from high <= 3%;
- no fresh 20-day low.

This condition creates only a resilience candidate, not confirmation.

### Internal confirmation

Full confirmation requires all:

- breadth deterioration < 45;
- credit spread stress < 50;
- long-end yield stress < 60;
- sector RS confirmation >= 55;
- positive DSE share >= 30%;
- negative DSE share < 25%.

Then:

`RESILIENCE_CONFIRMED`

### Fragile resilience

If price resilience exists but one or more material internals deteriorate:

- breadth deterioration >= 55; OR
- credit stress >= 55; OR
- long-end yield stress >= 70; OR
- negative DSE share >= 30%;

then:

`FRAGILE_RESILIENCE`

Interpretation: the index is holding, but the strength may be narrow, hedging-driven, liquidity-driven or temporary. It is explicitly not broad confirmation.

### Breakdown confirmation

Breakdown requires BOTH price deterioration and internal confirmation.

Price leg:

- fresh 20-day low OR drawdown >= 5%.

Internal leg:

- breadth deterioration >= 60; AND
- at least one of:
  - credit stress >= 55;
  - long-end yield stress >= 70;
  - negative DSE share >= 35%.

Then:

`BREAKDOWN_CONFIRMING`

A macro shock alone cannot create this state.

## States

- `EVIDENCE_PENDING`
- `NO_DIVERGENCE`
- `RESILIENCE_UNCONFIRMED`
- `RESILIENCE_CONFIRMED`
- `FRAGILE_RESILIENCE`
- `BREAKDOWN_CONFIRMING`

## Oil and geopolitical shocks

`oilShockScore >= 70` creates a material macro-stress reason but never a standalone sell signal.

The module distinguishes:

`high oil price` from `new oil surprise`, and `known geopolitical risk` from `new market-dislocating transmission`.

The first belongs to regime context; the second must become visible through price, breadth, rates, credit, DSE or cross-asset evidence.

## Relationship with DSE-Ω

DSE is used as a breadth-of-decoupling confirmation sensor.

- `positiveDseSharePct`: share of monitored names/sectors with materially positive DSE signal.
- `negativeDseSharePct`: share with materially negative DSE signal.

DSE remains dynamic market evidence only. It does not become causal business-quality evidence and cannot override E1/E2 fundamentals.

## Relationship with Macro Options Liquidity Ω

This module does not duplicate the existing liquidity engine. The existing suite already monitors JPY carry, long-end yields, VIX/dispersion, OPEX, gamma, credit, breadth and cross-asset correlation.

Narrative–Price Divergence Ω asks a narrower question:

> Given the stress already visible upstream, is price absorbing it better or worse than expected, and do internals confirm the apparent resilience/breakdown?

No existing Macro Options Liquidity weights are changed by v1.0.

## Scenario interpretation

### Scenario A — Hedge-covering / genuine risk-on candidate

Index resilient + macro stress elevated.

Only upgrades to `RESILIENCE_CONFIRMED` when breadth, sector RS, DSE, credit and yields also confirm.

Without those confirmations it remains `RESILIENCE_UNCONFIRMED` or `FRAGILE_RESILIENCE`.

### Scenario B — Breakdown

Macro surprise becomes investable information only when price deterioration is confirmed by internals. This prevents headlines from mechanically driving portfolio actions.

### Scenario C — Lateral absorption / event window

When macro stress is elevated but neither resilience nor breakdown gates fully activate, remain `NO_DIVERGENCE` or `RESILIENCE_UNCONFIRMED` and defer directional interpretation to the existing OPEX/liquidity/event-window modules.

## Constitutional laws

`BAD_NEWS_LEVEL != NEGATIVE_SURPRISE`

`INDEX_RESILIENCE != BROAD_MARKET_STRENGTH`

`RESILIENCE_REQUIRES_INTERNAL_CONFIRMATION`

`MACRO_STRESS_ALONE_NEVER_SELLS`

`DSE_IS_CONFIRMATION_NOT_CAUSAL_BUSINESS_EVIDENCE`

`ONE_SESSION_NEVER_DEFINES_REGIME`

`NARRATIVE_PRICE_DIVERGENCE_HAS_ZERO_DIRECT_CAPITAL_AUTHORITY`

## Governance

This module adds a diagnostic layer only. It does not alter:

- Six-Engine architecture;
- existing core weights;
- AI exposure ceiling;
- portfolio N;
- Replacement Firewall;
- current holdings;
- existing Macro Options Liquidity Ω weights.

Threshold changes require documented calibration across multiple historical stress episodes before promotion to a new version.
