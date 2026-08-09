# ATLAS Ω Mobile v1 — Acceptance Contract

A release may be called **definitive v1** only when every item below is true.

## UX
- Android/mobile-first.
- Persistent bottom navigation: Inicio / Cartera / Watchlist / Radar Ω / Más.
- Home is an investment command center, not a list of duplicate module cards.
- Search accepts ticker/company and opens one rich ticker terminal.
- Ticker terminal has separate Resumen / ATLAS Ω / Financiero / Noticias views and market history.
- Dedicated engine screens must show engine-specific inputs/output; they may not all render the same generic metrics table.
- No user-entered financial metrics are required anywhere.
- Evidence Ω is ticker-first primary-source ingestion, not a manual evidence form.
- Broker Ω never asks the user to paste private API/control tokens into the mobile UI.

## Decision system
- Candidate/Watchlist actions: COMPRAR / ESPERAR / NO COMPRAR.
- Portfolio actions: AÑADIR / MANTENER / ESPERAR / REVISAR.
- Portfolio monitor never emits SELL/EXIT from price or quantitative deterioration alone.
- EXIT remains downstream of a confirmed canonical thesis falsifier.
- Decision Log Ω persists baseline and subsequent action changes locally.
- Every score exposes coverage/engine state; missing evidence remains missing.

## Engines / surfaces
- Business Quality Ω.
- Growth Ω.
- CAPEX Productivity Ω with explicit incomplete-state handling.
- Valuation Ω.
- Risk Ω.
- Money Rotation Ω.
- Historical Dislocation Ω.
- Agentic Security Discovery Ω research queue.
- Evidence Ingestion Ω.
- Market-regime context includes gold, oil, dollar, duration and credit proxies.

## Portfolio / Watchlist
- Loaded from a server-side versioned tracked-universe snapshot so corrections do not require APK UI changes.
- No duplicates within Watchlist Ω.
- No overlap between active Portfolio Ω and Watchlist Ω.
- Exact user-confirmed lists are required before snapshot status can be `CONFIRMED`.
- Broker quantities/cost basis/P&L, when added, must remain authenticated/private and must not be exposed by an unauthenticated public portfolio endpoint.

## Broker Ω
- Trading 212 credentials remain server-side only.
- PAPER/demo is default.
- LIVE requires explicit server-side enablement and per-order confirmation.
- No algorithm output auto-executes an order.

## Data / evidence
- Market fallback data is labelled reference/delayed and never presented as execution price.
- News and analyst consensus remain sensors.
- SEC filing observation is primary evidence of the filing, not automatic proof of a thesis falsifier.
- Missing/unsupported data is never fabricated.

## Release gates
- Python compile/API contract gate: PASS.
- TypeScript: PASS.
- Android release Gradle build: PASS.
- Android emulator navigation/legacy-form gate: PASS.
- Final exact Portfolio/Watchlist snapshot: CONFIRMED.
- Functional APK artifact generated from the exact merged head.
