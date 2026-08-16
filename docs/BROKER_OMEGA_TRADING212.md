# Broker Ω — Trading 212

ATLAS Ω keeps broker credentials server-side. The Android APK never contains the Trading 212 API key or secret.

## Current implementation — 16 Aug 2026

The clean mobile runtime now exposes an isolated Trading 212 bridge under:

- `/v1/mobile/broker/*`

The legacy `/v1/broker/*` routes remain available for compatibility, but new APK work should use the isolated mobile contract.

The implementation follows the Trading 212 Public API v0 beta contract:

- Demo: `https://demo.trading212.com/api/v0`
- Live: `https://live.trading212.com/api/v0`
- HTTP Basic authentication from `API_KEY:API_SECRET`.
- Invest / Stocks ISA only.
- Orders are quantity-based and execute only in the primary account currency.
- Positive quantity = buy; negative quantity = sell.
- Historical list endpoints use cursor pagination and the upstream `nextPagePath` contract.
- Pies are intentionally not integrated because the current Pies API is deprecated.

## Default mode

The repository defaults to Trading 212 **demo/paper**:

- `TRADING212_ENV=demo`
- `TRADING212_LIVE_TRADING_ENABLED=false`

Live execution is therefore fail-closed.

## Required Render secrets

Configure these as server-side secrets in Render:

- `FINANCIALDATANET_API_KEY` — market/fundamental data provider used by the mobile app.
- `TRADING212_API_KEY` — Trading 212 API key.
- `TRADING212_API_SECRET` — Trading 212 API secret.
- `ATLAS_BROKER_CONTROL_TOKEN` — a long random token used to authorize private broker calls.

`render.yaml` declares all of these as `sync: false`; their values must never be committed to Git or embedded in Expo public variables.

## Read-only broker contract

Public status only:

- `GET /v1/mobile/broker/status`

Control-token protected (`X-Atlas-Broker-Token`):

- `GET /v1/mobile/broker/account`
- `GET /v1/mobile/broker/positions?ticker=...`
- `GET /v1/mobile/broker/orders`
- `GET /v1/mobile/broker/orders/{id}`
- `GET /v1/mobile/broker/metadata/exchanges`
- `GET /v1/mobile/broker/metadata/instruments`
- `GET /v1/mobile/broker/metadata/instruments/search?q=...`
- `GET /v1/mobile/broker/history/orders?limit=...&cursor=...&ticker=...`
- `GET /v1/mobile/broker/history/dividends?limit=...&cursor=...&ticker=...`
- `GET /v1/mobile/broker/history/transactions?limit=...&cursor=...&time=...`
- `GET /v1/mobile/broker/history/next?nextPagePath=...`

`history/next` only accepts relative paths under `/api/v0/equity/history/`; arbitrary hosts and non-history paths are rejected.

The upstream Trading 212 rate-limit headers are returned to the client as `rateLimit.limit`, `period`, `remaining`, `reset`, and `used`.

## Order contract — prepared, not live-enabled

All order routes are protected by the broker control token and require an explicit environment confirmation.

- `POST /v1/mobile/broker/orders/market`
- `POST /v1/mobile/broker/orders/limit`
- `POST /v1/mobile/broker/orders/stop`
- `POST /v1/mobile/broker/orders/stop_limit`
- `DELETE /v1/mobile/broker/orders/{id}`

Order requests require:

- exact Trading 212 instrument ticker, e.g. `AAPL_US_EQ`;
- non-zero quantity;
- `EXECUTE_DEMO` in demo or `EXECUTE_LIVE` in live;
- a unique `clientRequestId`.

Trading 212 states that its beta order endpoints are not idempotent. ATLAS hashes and holds recent `clientRequestId` values for five minutes and returns HTTP 409 for a duplicate request, reducing accidental double submission caused by repeated taps/retries.

This local guard is an additional safety layer, not a substitute for server-side order reconciliation.

## Paper activation

1. Create Trading 212 demo API credentials with the minimum permissions needed.
2. Set `TRADING212_API_KEY`, `TRADING212_API_SECRET`, and `ATLAS_BROKER_CONTROL_TOKEN` in Render.
3. Keep `TRADING212_ENV=demo` and `TRADING212_LIVE_TRADING_ENABLED=false`.
4. Deploy the API.
5. Confirm `/v1/mobile/broker/status` reports `readReady=true` and `mode=PAPER`.
6. Sync account / positions / orders.
7. Resolve every security through Trading 212 instrument metadata rather than assuming ticker formatting.
8. Validate paper orders and cancellation before any consideration of live enablement.

## Live activation

Only after paper validation:

1. Replace server credentials with live Trading 212 credentials.
2. Set `TRADING212_ENV=live`.
3. Keep `TRADING212_LIVE_TRADING_ENABLED=false` and validate read-only account/positions first.
4. Deliberately set `TRADING212_LIVE_TRADING_ENABLED=true` only when real execution is intended.
5. Every order still requires `EXECUTE_LIVE` and a fresh `clientRequestId`.

## 24/5 prices and extended-hours discipline

Canonical portfolio execution policy:

- Trading 212 `Precios 24/5`: OFF by default.
- 24/5 prices are radar information, not a decision engine.
- Structural portfolio construction should be executed primarily during regular market hours.
- Extended-hours movement is not sufficient evidence for BUY or SELL.
- Market orders during thin liquidity should be avoided; if an exceptional off-hours action is ever required, use explicit limit-price discipline and verify the catalyst/spread.

## APK integration

The mobile Settings screen calls only the public broker status route. It displays:

- demo/live environment;
- credential readiness;
- control-token readiness;
- read readiness;
- live-order lock state.

The APK contains neither FinancialData.Net nor Trading 212 upstream URLs or provider credentials. CI unpacks the release bundle and fails the build if direct FinancialData.Net or Trading 212 API endpoints leak into the APK.

## Guardrails

- Provider credentials remain server-side.
- Demo is the default environment.
- Live execution has an independent server-side kill switch.
- Read endpoints carrying private portfolio/account information require the ATLAS control token.
- Trading 212 rate-limit state is surfaced to the caller.
- Upstream errors are surfaced rather than silently retried.
- Order POSTs are never blindly retried.
- Duplicate `clientRequestId` values are blocked locally for five minutes.
- Pies are not built into new ATLAS code because Trading 212 marks that API deprecated.
