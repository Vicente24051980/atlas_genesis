# Broker Ω — Trading 212

ATLAS Ω keeps broker credentials server-side. The Android APK never contains the Trading 212 API key or secret.

## Canonical architecture — 16 Aug 2026

The isolated mobile runtime is:

`Trading212Adapter -> Account + Instruments + Positions + Orders + History`

`Portfolio Reconciler -> canonical tickers <-> Trading 212 ticker IDs -> holdings -> P/L -> weights`

`Execution Service -> Preview -> Demo -> Live`

Analysis and execution are deliberately separated. No ATLAS signal, score, recommendation, rotation engine or portfolio optimizer is allowed to call an order endpoint directly.

The mobile broker bridge lives under `/v1/mobile/broker/*`. Legacy `/v1/broker/*` routes remain only for compatibility; new APK work must use the isolated mobile contract.

## Upstream contract

Current Trading 212 Public API v0 beta integration uses:

- Demo: `https://demo.trading212.com/api/v0`
- Live: `https://live.trading212.com/api/v0`
- HTTP Basic authentication from `API_KEY:API_SECRET`.
- `GET /equity/account/summary` for account state.
- `GET /equity/positions` for current positions.
- `GET /equity/metadata/instruments` and exchanges for instrument resolution.
- Orders under `/equity/orders/*`.
- History under `/equity/history/*`.
- Positive quantity = buy; negative quantity = sell.
- Orders execute only in the primary account currency; API multi-currency execution is not assumed.

### Portfolio endpoint compatibility

An older official Trading 212 reference exposed a `Personal Portfolio` block under `/equity/portfolio`. The newer reference exposes `/equity/positions` as the current positions surface. ATLAS therefore does **not** make the core reconciler depend on the older Personal Portfolio contract.

If Trading 212 later re-certifies `/equity/portfolio` in the current OpenAPI schema, it can be added behind a compatibility adapter without changing the app-level reconciler contract.

### Pies

Pies are not part of the canonical integration. Trading 212 marks the Pies API deprecated. Any future compatibility support must live behind an isolated `LegacyPiesAdapter` and must never become a dependency of portfolio reconciliation or execution.

## Default mode and live fail-closed policy

Repository defaults:

- `TRADING212_ENV=demo`
- `TRADING212_LIVE_TRADING_ENABLED=false`

Live execution therefore fails closed.

Trading 212 beta documentation has shown inconsistent wording across revisions regarding non-market live orders. ATLAS consequently blocks limit, stop and stop-limit orders in live until the current live OpenAPI contract is explicitly re-certified. Demo can exercise all exposed order shapes.

## Required Render secrets

Configure server-side only:

- `FINANCIALDATANET_API_KEY`
- `TRADING212_API_KEY`
- `TRADING212_API_SECRET`
- `ATLAS_BROKER_CONTROL_TOKEN`

`render.yaml` declares secrets as `sync: false`. Never commit their values or expose them through Expo public variables.

## Read-only broker contract

Public status:

- `GET /v1/mobile/broker/status`

Control-token protected:

- `GET /v1/mobile/broker/account`
- `GET /v1/mobile/broker/positions?ticker=...`
- `POST /v1/mobile/broker/portfolio/reconcile`
- `GET /v1/mobile/broker/orders`
- `GET /v1/mobile/broker/orders/{id}`
- `GET /v1/mobile/broker/metadata/exchanges`
- `GET /v1/mobile/broker/metadata/instruments`
- `GET /v1/mobile/broker/metadata/instruments/search?q=...`
- `GET /v1/mobile/broker/history/orders?limit=...&cursor=...&ticker=...`
- `GET /v1/mobile/broker/history/dividends?limit=...&cursor=...&ticker=...`
- `GET /v1/mobile/broker/history/transactions?limit=...&cursor=...&time=...`
- `GET /v1/mobile/broker/history/next?nextPagePath=...`

`portfolio/reconcile` is read-only. It combines current positions and account summary, preserves Trading 212 internal tickers, derives canonical symbols, surfaces quantity/current price/P&L fields where available, computes account-currency weights only when the upstream wallet-impact data makes them safe, and reports `missingExpected` / `unexpectedHeld` against a supplied canonical ticker list.

## Pagination rule

For historical collections ATLAS follows Trading 212's `nextPagePath` literally. The bridge validates that it is a relative `/api/v0/equity/history/...` path and then forwards the complete returned query string without reconstructing the cursor.

## Rate-limit discipline

Trading 212 applies rate limits per account. ATLAS reads and returns:

- `x-ratelimit-limit`
- `x-ratelimit-period`
- `x-ratelimit-remaining`
- `x-ratelimit-reset`
- `x-ratelimit-used`

The backend also records endpoint cooldowns. If a reset is only a few seconds away it waits automatically; longer cooldowns fail fast with HTTP 429 and a retry-after value instead of consuming the mobile request timeout. Order POSTs are never blindly retried.

## Execution contract

### Preview

`POST /v1/mobile/broker/orders/preview`

Preview resolves the instrument against Trading 212 metadata and returns the exact proposed upstream payload, BUY/SELL direction, environment and compatibility state. It **never calls a Trading 212 order POST**.

### Demo and Live execution

Execution routes:

- `POST /v1/mobile/broker/orders/market`
- `POST /v1/mobile/broker/orders/limit`
- `POST /v1/mobile/broker/orders/stop`
- `POST /v1/mobile/broker/orders/stop_limit`
- `DELETE /v1/mobile/broker/orders/{id}`

Every order requires:

- exact Trading 212 instrument ticker;
- non-zero quantity;
- negative quantity for sells;
- `EXECUTE_DEMO` in demo or `EXECUTE_LIVE` in live;
- a fresh `clientRequestId`;
- valid ATLAS broker control token.

Live additionally requires `TRADING212_LIVE_TRADING_ENABLED=true`. The server kill-switch and per-request confirmation are independent gates.

ATLAS hashes recent `clientRequestId` values and rejects duplicates for five minutes to reduce accidental repeated submission.

## Tomorrow connection procedure — 17 Aug 2026

When the real portfolio is ready:

1. Keep Render in `TRADING212_ENV=demo` and `TRADING212_LIVE_TRADING_ENABLED=false`.
2. Add the Trading 212 **demo** `API Key` and `API Secret` plus an `ATLAS_BROKER_CONTROL_TOKEN` in Render.
3. Deploy and verify `/v1/mobile/broker/status` returns `readReady=true`, `mode=PAPER`, and `liveTradingEnabled=false`.
4. Fetch account and positions.
5. Send the final canonical ticker list to `/portfolio/reconcile` and inspect ticker mapping, missing holdings, P/L and weights.
6. Resolve every ambiguous security through metadata; never guess Trading 212 ticker IDs.
7. Run order **preview** only.
8. Place a deliberately small demo order with `EXECUTE_DEMO`, then reconcile orders/history/positions.
9. Validate cancellation and duplicate-request protection.
10. Leave live disabled until the full demo path is clean.

Only after that validation should live credentials be installed. First validate live in read-only mode with the kill-switch still `false`; real execution is enabled deliberately and separately.

## 24/5 and extended-hours discipline

- Trading 212 24/5 prices are radar information, not an ATLAS decision engine.
- Structural portfolio construction should normally execute during regular market hours.
- Extended-hours movement alone is never sufficient evidence for BUY or SELL.
- Thin-liquidity market orders should be avoided.

## Guardrails

- Provider credentials stay server-side.
- Demo is default.
- Live has an independent server kill-switch.
- Private broker data requires the ATLAS control token.
- Portfolio reconciliation cannot execute orders.
- Preview cannot execute orders.
- Analysis engines cannot execute orders.
- History pagination follows upstream `nextPagePath` literally.
- Rate-limit state is surfaced and respected.
- Order POSTs are never automatically retried.
- Duplicate `clientRequestId` values are blocked locally.
- Pies remain outside the canonical path.
