# GitHub Operating Context — 2026-08-10

## Purpose

Information-only operational record for ATLAS Ω development. This document does not alter investment logic, scoring, portfolio rules, Broker Ω guardrails, or production behavior.

## Repository

- Canonical repository: `Vicente24051980/atlas_genesis`
- Default branch: `main`
- GitHub connector access is available in the active ChatGPT environment.
- Verified repository permissions include push/admin access.

## Working rule

For repository work, inspect GitHub directly first. Do not ask the user to paste workflows, source files, PR code, or logs manually when the connected GitHub tools can retrieve the required repository context.

Manual copy/paste should only be requested when a required artifact or log is genuinely unavailable through the connected tooling.

## Mobile-first constraint

ATLAS Ω is intended for mobile use. App, scanner, portfolio, watchlist, Broker Ω, alerts, evidence views, and decision workflows should remain designed and validated with mobile operation as the primary surface.

## Current relevant pull requests observed on 2026-08-10

### PR #19 — Mobile Market Scanner Ω v1

- State: open
- Draft: yes
- Mergeable: yes at last check
- Branch: `feat/mobile-market-scanner-v1`
- Purpose: scanner-first mobile home, market search, ticker detail, market-data fallback labeling, additive `/v1/market/*` backend routes, and updated functional Android emulator gate.
- Methodological guardrail: scanner is discovery UI only and must not emit BUY/SELL decisions.

### PR #17 — Agentic Security Ω discovery engine

- State: open
- Draft: yes
- Mergeable: yes at last check
- Branch: `feat/agentic-security-discovery-v1`
- Purpose: independent Agentic Security Discovery Ω engine with PRIMARY-evidence gating and DISCOVER/WATCH/REJECT/INSUFFICIENT_EVIDENCE states.
- Guardrail: the engine routes qualified candidates into the full ATLAS scorer and never emits BUY/SELL itself.

### PR #16 — ATLAS Ω Mobile v1.0.0

- State: open
- Draft: no
- Branch: `fix/current-ui-emulator-gate`
- Purpose: decision-first mobile release including ticker-only analysis, portfolio monitoring, Watchlist Ω, Broker Ω separation, and CI/runtime gates.

### PR #10 — automated mobile data pipeline

- State: open
- Mergeable status was false at last observed listing.
- Branch: `feat/automated-data-pipeline-v1`
- Purpose: Trading 212 read-only portfolio integration, market-data automation, discovery-first pipeline, evidence intake, background sync, and removal of manual forms from automated surfaces.

### PR #7 — functional APK checkpoint

- State: open
- Branch: `ci/mobile-functional-apk-20260808`
- Purpose: build-only checkpoint for Mobile CI and APK artifact generation.

## CI state observed on 2026-08-10

For PR #19 head `9fbbe64641be4db237a22b4c0346085ed2742b61`:

- Workflow: `Mobile CI & EAS APK Build`
- Run number: `210`
- Run id: `31336589608`
- Status at observation: `in_progress`

This status is time-sensitive and must be rechecked before any conclusion about release readiness or APK availability.

## Release discipline

Do not describe an APK or release as final merely because a PR exists or a build started. Recheck the relevant CI head and required runtime gates first. Preserve separation between:

- discovery/scanner functions;
- ATLAS Ω investment scoring and decisions;
- portfolio/watchlist monitoring;
- Broker Ω execution controls;
- information-only documentation.

## Provenance

This file records repository state and operating instructions established through direct GitHub connector inspection on 2026-08-10. It is documentation only and should not be treated as canonical market evidence or investment evidence.
