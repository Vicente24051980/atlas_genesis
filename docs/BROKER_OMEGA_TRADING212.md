# Broker Ω — Trading 212

ATLAS Ω keeps broker credentials server-side. The Android APK never contains the Trading 212 API key or secret.

## Default mode

The repository defaults to Trading 212 **demo/paper**:

- `TRADING212_ENV=demo`
- `TRADING212_LIVE_TRADING_ENABLED=false`

Live execution is therefore fail-closed.

## Required Render secrets

Configure these as server-side secrets in Render:

- `TRADING212_API_KEY` — Trading 212 API key.
- `TRADING212_API_SECRET` — Trading 212 API secret.
- `ATLAS_BROKER_CONTROL_TOKEN` — a long random token used by the mobile Broker Ω screen to authorize private broker calls.

Do not put any of these values in Git, Expo public environment variables, screenshots, logs, or the APK.

## Paper activation

1. Create Trading 212 demo API credentials with the minimum permissions needed.
2. Set `TRADING212_API_KEY`, `TRADING212_API_SECRET`, and `ATLAS_BROKER_CONTROL_TOKEN` in Render.
3. Keep `TRADING212_ENV=demo` and `TRADING212_LIVE_TRADING_ENABLED=false`.
4. Deploy the API.
5. Open Broker Ω in the Android app.
6. Enter the control token and sync account/positions/orders.
7. Search the Trading 212 instrument metadata and select its exact T212 ticker, e.g. `AAPL_US_EQ`.
8. Test small paper orders only.

## Live activation

Do this only after paper validation:

1. Replace the server credentials with live Trading 212 credentials.
2. Set `TRADING212_ENV=live`.
3. Verify account and positions while `TRADING212_LIVE_TRADING_ENABLED=false`.
4. When deliberately ready to permit real execution, set `TRADING212_LIVE_TRADING_ENABLED=true` server-side.
5. The API still requires `EXECUTE_LIVE` confirmation on every market-order request.

## API endpoints

Public status only:

- `GET /v1/broker/status`

Control-token protected:

- `GET /v1/broker/account`
- `GET /v1/broker/positions`
- `GET /v1/broker/orders`
- `GET /v1/broker/instruments/search?q=...`
- `POST /v1/broker/orders/market`
- `DELETE /v1/broker/orders/{order_id}`

Protected calls require the `X-Atlas-Broker-Token` header.

## Guardrails

- Trading 212 credentials never travel to the mobile client.
- Demo is the repository default.
- Live is disabled independently of environment selection.
- A live market order is rejected unless both the server flag is enabled and the request confirms `EXECUTE_LIVE`.
- Zero-quantity orders are rejected.
- Trading 212 upstream errors and rate limits are surfaced rather than silently retried, reducing duplicate-order risk.
- Market orders are not idempotent in the Trading 212 beta API; callers must not blindly retry a failed POST.
