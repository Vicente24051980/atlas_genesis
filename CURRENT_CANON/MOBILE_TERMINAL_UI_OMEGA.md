# ATLAS Ω MOBILE TERMINAL UI

Status: ACTIVE DESIGN CANON
Date: 2026-08-20

## Objective

Rebuild the ATLAS Ω application surface as a dense professional investment terminal rather than a card-first consumer finance app.

OpenTerminalUI is the primary UX reference for terminal-shell behavior: persistent navigation, GO/command search, workspaces, market/research/portfolio/risk separation, compact information density and responsive desktop/mobile framing.

OpenTerminalUI is MIT licensed. ATLAS does not vendor or copy upstream source code in this implementation; the current mobile shell is an original React Native implementation informed by the interaction model and adapted to ATLAS governance.

## Terminal shell

Persistent chrome:

- ATLAS Ω brand / Investment OS identity.
- GO Bar for ticker and function routing.
- evidence/safety pulse tape.
- horizontal function strip on mobile.
- left function rail on wide screens.
- bottom navigation on mobile.
- responsive workspace frame.

Core functions:

- HOME / Cockpit
- MKT / Markets
- PORT / Portfolio
- WL / Watchlists
- Ω / ATLAS
- SCR / Screener
- RSR / Research
- ORD / Orders
- RSK / Risk
- SEC / Security Hub
- T212 / Broker Ω
- SYS / System

## GO Bar

The GO Bar is the primary navigation accelerator.

It must support:

1. function/module discovery;
2. direct ticker entry;
3. routing a ticker into Security Hub;
4. future natural-language ATLAS commands only when those commands are backed by explicit contracts.

A typed ticker never creates market data locally. It only routes to the existing evidence-backed company analysis path.

## Workspaces

### Markets

Market Pulse, Money Rotation Ω, movers, sectors and Macro Regime. Live figures remain behind provider certification.

### Portfolio

Positions, exposure, contribution, P&L and portfolio risk. Existing portfolio runtime is preserved.

### Watchlists

Master Universe, candidate lists, heatmaps, alerts and saved views. Algorithm outputs remain separate.

### ATLAS Ω

Investment Committee Ω, Evidence Director, specialist engine grid, contradictions and Falsifiers Ω.

### Screener

Universe construction, GREEN Ω, Return Ω, rankings and filters. Passing a screener is never equivalent to BUY.

### Research

Firecrawl Search Ω, primary-source evidence, Clinical Evidence Shock Ω, CAPEX Chain Ω and thesis state.

### Orders

Trading 212 order monitor/ticket/history with execution-safety gates. Demo/paper remains the default and live execution remains fail-closed.

### Risk

Sector/factor/currency/region exposure, concentration, drawdown, correlation and regime stress when validated feeds are available.

### Security Hub

Ticker-first company analysis using the current provider and CAPEX-chain APIs without fabricated scores.

## Data rendering rule

A complete UI surface may exist before its data source is certified. In that case the surface MUST display an explicit state such as `DATA GATE`, `BROKER GATE`, `INGESTION_INCOMPLETE` or equivalent.

It is forbidden to populate a professional-looking terminal widget with fabricated placeholder market values that could be mistaken for live evidence.

## Separation of concerns

The UI is not a decision engine.

Terminal shell -> data/evidence adapters -> Evidence Director Ω -> specialist engines -> Falsifiers Ω -> decision.

Changing the visual system must not alter investment-engine contracts, broker safety gates, evidence hierarchy or API credential handling.

## Implementation status

Phase 1 implemented on branch `atlas/openterminal-mobile-shell`:

- persistent responsive terminal shell;
- GO Bar / command palette;
- mobile bottom navigation;
- wide-screen function rail;
- module strip;
- Cockpit redesign;
- Markets, Watchlists, ATLAS, Screener, Research, Orders and Risk workspace surfaces;
- existing Analyze, Portfolio, Broker and Settings routes preserved inside the shell.

Future phases should wire each DATA GATE only after its backing API/provider passes the appropriate certification gate.
