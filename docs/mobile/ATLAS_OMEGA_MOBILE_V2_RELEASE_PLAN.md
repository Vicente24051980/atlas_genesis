# ATLAS Ω Mobile v2 — Definitive Release Plan

Status: implementation branch
Cut: 2026-08-09

## Product contract

ATLAS Ω Mobile is not a collection of repeated metric screens. It is a mobile investment operating system with five primary jobs:

1. Discover what is moving and why.
2. Analyze any ticker with the canonical ATLAS Ω engines.
3. Monitor Portfolio Ω and Watchlist Ω continuously with context-aware actions.
4. Preserve evidence, uncertainty, thesis state, falsifiers and decision history.
5. Keep Broker Ω separate, guarded and fail-closed.

## Primary navigation

- Inicio / Market Scanner
- Mi Cartera Ω
- Watchlist Ω
- Radar Ω
- Más / Engine Room / Evidence / Broker

## Ticker detail

Every ticker detail must expose genuinely different modules rather than reusing one generic metric list:

- Resumen / market state
- ATLAS Ω decision
- Business Quality Ω
- Growth Ω
- CAPEX Productivity Ω
- Valuation Ω
- Risk Ω
- Catalysts Ω
- News Ω
- Evidence / thesis state when available

## Actions

Candidate/watchlist actions: COMPRAR / ESPERAR / NO COMPRAR.
Portfolio actions: AÑADIR / MANTENER / ESPERAR / REVISAR.
REDUCIR / VENDER are never emitted from price, momentum, insider activity, CAPEX, rotation or secondary news alone. They require the canonical Decision Safety Gate Ω and a confirmed thesis falsifier with traceable primary evidence.

## Data rules

- Price is a market sensor, not thesis evidence.
- Missing data stays missing.
- Market-cap change is not capital flow.
- Scanner/discovery never becomes BUY by itself.
- Money Rotation R3/R4 is a discovery/monitor signal and does not directly place portfolio orders.
- Trading 212 credentials never ship in the APK.

## UX reference patterns

The release uses established mobile investment patterns: persistent ticker search, portfolio/watchlist-first navigation, compact market cards, security drill-down, alerts/decision changes, and portfolio-level summary before detail. ATLAS-specific evidence and decision safety remain the differentiator.

## Release gate

No release APK is final until all of the following pass on the final head commit:

- Python/API compile and contract tests
- TypeScript typecheck
- SQLite/runtime functional gate
- Android release APK build
- Android emulator navigation gate
- Portfolio/Watchlist universe integrity checks
- API route check for health, market, ticker analysis, portfolio/watchlist monitor and Broker status
