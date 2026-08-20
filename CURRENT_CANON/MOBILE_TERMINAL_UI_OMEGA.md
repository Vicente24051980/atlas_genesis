# ATLAS Ω MOBILE TERMINAL UI

Status: ACTIVE DESIGN CANON
Date: 2026-08-20

## Objective

ATLAS Ω Mobile is a dense professional investment terminal rather than a card-first consumer finance app.

OpenTerminalUI remains the primary UX reference for terminal-shell behavior: persistent navigation, GO/command search, workspaces, compact information density and responsive desktop/mobile framing. ATLAS does not vendor or copy upstream source code; the implementation is original React Native code governed by ATLAS evidence and execution rules.

## Portfolio-first rule

The first useful surface after opening the application is the portfolio.

When Trading 212 read access and a locally stored ATLAS broker-control session are available, HOME automatically loads:

- account summary;
- invested capital;
- available cash;
- P/L when supplied upstream;
- current positions;
- broker mode and environment.

Portfolio polling is bounded and must respect upstream rate limits. The Trading 212 API key and secret remain server-side. Only the ATLAS broker-control token may be stored on-device, and it must use encrypted SecureStore rather than plain application storage.

If broker credentials/session are unavailable, HOME renders `BROKER GATE` / `LOCAL SESSION GATE`; it must never fabricate a portfolio.

## Global index tape

A world-index tape is persistent terminal chrome and is visible across workspaces.

Canonical curated universe:

- S&P 500
- Nasdaq 100
- Dow Jones
- Russell 2000
- Euro Stoxx 50
- DAX
- FTSE 100
- CAC 40
- IBEX 35
- Nikkei 225
- Hang Seng
- Shanghai Composite
- KOSPI
- ASX 200
- Sensex
- Bovespa
- TSX Composite

Primary contract: FinancialData.Net `index-quotes`, proxied server-side through `/v1/mobile/indices`. Client refresh hint: 15 seconds unless provider/rate-limit policy requires slower cadence.

Missing symbols remain `MISSING`; ATLAS must not synthesize an index from ETF/future proxies without an explicit separate contract.

## Persistent terminal shell

Chrome:

- ATLAS Ω brand / Investment Terminal identity;
- GO Bar for ticker and function routing;
- global index tape;
- horizontal function strip on mobile;
- left function rail on wide screens;
- bottom navigation on mobile;
- responsive workspace frame.

Canonical functions:

- HOME / Cockpit
- MKT / Markets
- PORT / Portfolio
- AUD / Auditar
- WL / Watchlist
- RES / Resultados
- OPP / Opportunities
- Ω / ATLAS
- SCR / Screener
- RSR / Research
- CAL / Catalysts
- NEWS / News
- ORD / Orders
- RSK / Risk
- SEC / Security Hub
- T212 / Broker Ω
- SYS / System

## AUD / Auditar

Dedicated ticker-first audit surface.

Current executable snapshot:

- company/quote quantitative bundle;
- Global CAPEX Chain Ω profile;
- provider/provenance;
- explicit engine gates for engines not yet callable from mobile.

Audit results can be saved to the local Result Journal. A saved snapshot is historical evidence of what was observed at that time; it is not retroactively rewritten because price later changed.

## WL / Watchlist

Persistent local candidate memory for:

- candidates;
- no-chase names;
- catalysts;
- re-audit queue;
- future alert linkage.

Adding to Watchlist never means BUY.

## RES / Result Journal

Persistent local journal of saved audit snapshots.

Each record stores at minimum:

- ticker;
- timestamp;
- provider;
- company/sector identity;
- observed price/valuation fields when available;
- CAPEX Ω state when available;
- explicit note that the snapshot is not the canonical thesis.

Local persistence is operational memory, not the canonical Evidence Store. Server-side durable evidence persistence remains a separate architecture concern.

## OPP / Opportunities

Ranks possible opportunities without collapsing distinct questions:

- Wave Detection Ω;
- Money Rotation Ω;
- Return / Valuation Ω;
- GREEN / no-chase / entry discipline.

A great company, a current capital receiver and an executable entry are separate states.

## CAL / Catalysts

Surface for earnings, guidance, clinical/FDA, macro events, investor days and thesis-changing dates. Calendar items remain `DATA GATE` until a certified event feed exists.

## NEWS / News

Firecrawl Search Ω is the acquisition layer. News passes source hierarchy, materiality and evidence classification before affecting any investment engine.

AI output and news headlines are never evidence by themselves.

## Remaining workspaces

### Markets

Global index tape, Money Rotation Ω, movers/breadth and Macro Regime.

### ATLAS Ω

Investment Committee Ω, Evidence Director, specialist engine grid, contradictions and Falsifiers Ω.

### Screener

Universe construction, GREEN Ω, Return Ω, rankings and filters. Passing a screener is never equivalent to BUY.

### Research

Firecrawl Search Ω, primary-source evidence, Clinical Evidence Shock Ω, CAPEX Chain Ω and thesis state.

### Orders

Trading 212 monitor/ticket/history with execution-safety gates. Demo/paper remains default and live execution remains fail-closed.

### Risk

Sector/factor/currency/region exposure, concentration, drawdown, correlation and regime stress when validated feeds exist.

### Security Hub

Ticker-first company analysis using current provider and CAPEX-chain APIs without fabricated scores.

## Data rendering rule

A complete UI surface may exist before its data source is certified. In that case the surface MUST display `DATA GATE`, `BROKER GATE`, `ENGINE GATE`, `INGESTION_INCOMPLETE` or an equivalent explicit state.

It is forbidden to populate professional-looking terminal widgets with fabricated values that could be mistaken for live evidence.

## Separation of concerns

The UI is not a decision engine.

Terminal shell -> data/evidence adapters -> Evidence Director Ω -> specialist engines -> Falsifiers Ω -> decision -> execution gate.

Changing the visual system must not alter investment-engine contracts, broker safety gates, evidence hierarchy or credential handling.

## Implementation status

Implemented on branch `atlas/openterminal-mobile-shell`:

- persistent responsive terminal shell;
- GO Bar / command palette;
- global live-index API + terminal tape;
- portfolio-first HOME with Trading 212 auto-read session;
- encrypted broker-control token storage;
- AUDIT surface;
- persistent WATCHLIST;
- persistent RESULT JOURNAL;
- Opportunities, Catalysts and News workspaces;
- Markets, ATLAS, Screener, Research, Orders and Risk workspaces;
- existing Analyze, Portfolio, Broker and Settings routes preserved.

Every live-data surface remains subject to provider credential/subscription and runtime certification gates.
