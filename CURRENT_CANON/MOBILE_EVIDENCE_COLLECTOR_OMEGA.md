# Mobile Evidence Collector Ω

**Status:** ACTIVE · CANONICAL
**Effective:** 2026-08-21
**Scope:** ATLAS Ω mobile evidence acquisition, GREEN verification and audit persistence.

## Objective

Make ATLAS Ω usable from mobile without requiring broker automation. The mobile client requests an audit; evidence acquisition runs server-side; results and provenance are returned to the phone and persisted to GitHub + Notion.

## Architecture

`Mobile UI → ATLAS API → Evidence Collector Ω → Provider adapters → Normalizer → Provider Quorum Ω → GREEN CONTINUITY Ω → remaining ATLAS engines → Evidence packet → Mobile UI → GitHub + Notion persistence`

## GREEN provider policy

Preferred independent provider pool:
1. TradingView
2. Yahoo Finance historical market data
3. Barchart
4. Investing.com

Firecrawl Interact/browser automation is an acquisition transport/fallback for dynamic pages. It is NEVER an evidence source. Provenance remains the underlying provider.

Trading 212 is optional broker-side evidence. ATLAS must not require or store T212 credentials. User screenshots may be attached as supplementary evidence for the exact horizons visible in the image.

## Mobile UX

Minimum screens:
- Dashboard: ticker search, GREEN status, audit state.
- Ticker Audit: 1W/1M/3M/1Y/MAX vector, provider quorum, GREEN Pulse 1D, contradictions, motor outputs, final committee state.
- Evidence: provider, exchange, currency, start/end dates, closes, capturedAt/asOf, normalization and reconciliation status.
- Screenshot Evidence: mobile upload/capture, ticker/horizon confirmation, supplementary T212 cross-check.
- Persistence: GitHub commit status + Notion page status; execution is incomplete until both required destinations succeed or a failure is explicitly surfaced.

## Security

- Firecrawl/API secrets remain server-side/GitHub Actions or secret store; never embedded in APK/mobile bundle.
- No Trading 212 username/password/session cookies are stored by ATLAS.
- Browser sessions used for public providers must be isolated and disposable unless an explicitly approved non-broker profile is required.
- Mobile receives normalized evidence and audit outputs, not provider credentials.

## GREEN contract

GREEN follows `CURRENT_CANON/GREEN_FIRST_ENGINE_FULL_AUDIT_OMEGA.md`.

Required horizons: `1W, 1M, 3M, 1Y, TOTAL/MAX`.

Minimum quorum: 3 independent eligible providers per horizon, synchronized to the same regular-market cut, split-adjusted/dividend-unadjusted price policy, sign agreement and <=0.25 percentage-point dispersion after normalized recomputation.

GREEN 5/5, 4/5 and 3/5 remain opportunity-eligible. GREEN 0–2/5 does not terminate the audit. QUARANTINE is a data-quality state, not an investment verdict.

## API contract

Suggested endpoints:
- `POST /api/audit/ticker` — enqueue/run ticker audit.
- `GET /api/audit/:id` — audit status/result.
- `GET /api/evidence/:ticker/green` — normalized GREEN evidence packet.
- `POST /api/evidence/screenshot` — attach supplementary broker screenshot evidence.
- `POST /api/persist/:auditId` — persist completed report to canonical destinations.

Every evidence observation must include: canonical ticker/id, exchange, currency, provider, horizon, startDate, endDate, startClose, endClose, corporateActionPolicy, calculationMethod, capturedAt, asOf, source locator and verification state.

## Persistence

Every completed canonical audit writes:
1. GitHub historical report in `Vicente24051980/atlas_genesis`.
2. Notion under `ATLAS OS / 13 — Proyectos · Atlas Genesis, App, Software y GitHub`.

Avoid duplicates using deterministic key: `<task>-<ticker>-<marketCut>`.

## Mobile-first rule

The phone is a control and review surface. Heavy browser interaction, provider reconciliation, calculations and persistence run remotely/server-side. This prevents mobile battery/session fragility and keeps secrets outside the APK.
