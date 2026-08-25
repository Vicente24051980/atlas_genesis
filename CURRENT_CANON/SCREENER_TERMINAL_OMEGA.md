# ATLAS Ω Screener Terminal

Status: ACTIVE CANON CANDIDATE
Version: v1.0
Date: 2026-08-22

## Objective

Implement an Investing-style discovery workflow inside the ATLAS terminal without importing Investing.com as decision authority and without allowing a screener result to become an investment recommendation.

The screener has two independent layers:

1. **Screener Engine Ω** — universe, filters, sorting, missing-data behavior and provider provenance.
2. **Screener Terminal UI Ω** — dense filter controls, presets, sortable results, expandable rows and direct routes to AUD / Security Hub.

## Discovery chain

Universe → provider observations → normalized fields → active filters → sortable survivors → AUD / Security Hub → Evidence Director → GREEN first → all applicable engines → contradictions → Falsifiers Ω → Investment Committee Ω.

Hard law:

`SCREENER PASS != BUY`

`FILTER MATCH != ECONOMIC PROOF`

`MISSING DATA != PASS`

## Initial provider contract

Technical history:
- Stooq daily observations through the ATLAS backend.
- Price, daily return, 200DMA, 1Y and 2Y are computed from observed history.

Fundamentals:
- Finnhub `stock/metric` through the ATLAS backend.
- Market capitalization is normalized to USD billions.
- P/E and beta are displayed only when supplied.
- ROIC is accepted only from an explicit ROIC field. ROI must never be silently substituted for ROIC.

If an active filter requires a field that is unavailable, that security cannot pass that filter and the UI exposes a DATA GATE.

## Built-in filter family

General / fundamentals:
- Market Cap ≥ $10B / $50B.
- P/E ≤ 25 / 40.
- Beta ≤ 1.2.
- ROIC ≥ 20% when exact ROIC exists.

Technical / performance:
- latest regular daily observation > 0.
- price > 200DMA.
- 1Y > 0.
- 2Y > 0.

Presets are convenience views only. They are not canonical investment models.

## Interface contract

The screener uses the same terminal language as every ATLAS route:
- persistent ATLAS header;
- GO command palette;
- live index tape;
- route context bar;
- grouped functions menu;
- mobile module strip;
- bottom navigation;
- square evidence panels;
- monospace status codes;
- explicit DATA GATE rather than placeholders.

A result row exposes only discovery actions:
- `AUD` → full audit;
- `SEC` → Security Hub.

No direct BUY/SELL/order button is allowed on the screener surface.

## Full-app UI rule

The Ainvest/OpenTerminalUI competitive lesson applies to the entire application, not just Cockpit.

Every route — HOME, MKT, PORT, AUD, WL, RES, OPP, Ω, SCR, RSR, CAL, NEWS, ORD, RSK, SEC, T212 and SYS — inherits the same terminal chrome, grouped menus, command search, live tape, current-workspace context and cross-workspace quick navigation.

A route may specialize its content, but it must not regress to an isolated consumer-app visual language.

## External repository rule

Public projects such as `Sagleft/goinvest` may be studied for API/filter mechanics under their licenses, but ATLAS does not depend on an unofficial Investing.com endpoint as a production source of truth. Provider adapters must remain replaceable and independently gated.

## Release rule

Screener Terminal Ω is not production-certified until:
1. Python/API tests pass.
2. TypeScript passes.
3. Android release build passes.
4. compiled APK passes backend/security contract checks.
5. feature changes are merged to `main` and the mobile CI passes again on `main`.
