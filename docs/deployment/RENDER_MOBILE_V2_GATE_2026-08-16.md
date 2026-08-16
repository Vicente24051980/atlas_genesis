# ATLAS Ω — Render Mobile v2 Deployment Gate — 2026-08-16

## Status

`CODE_READY / APK_PIPELINE_ACTIVE / PRODUCTION_DEPLOYMENT_DRIFT`

The mobile-v2 backend, FinancialData.Net adapter, Trading 212 bridge and Global CAPEX Chain mobile bridge are implemented on `main` and covered by CI. Production certification is intentionally **not** marked PASS until the deployed Render service exposes the mobile-v2 routes.

## Production facts observed by CI

Resolved live hostname:

- `https://atlas-genesis.onrender.com`

The legacy `/health` endpoint is reachable, but `/v1/mobile/health` remained unavailable during live smoke run `31963375984`, so the run failed by design.

The live `/health` payload identified a deployed `atlas-omega-api` version `0.4.0`, while the repository's current runtime contract is the mobile-v2 stack. This is deployment drift: the running Render artifact/configuration does not yet match current `main`.

## Repository deployment contract

`render.yaml` declares:

- start command: `uvicorn api.app:app --host 0.0.0.0 --port $PORT`
- `FINANCIALDATANET_API_KEY` as `sync: false`
- `FINNHUB_TOKEN` as `sync: false`
- `TRADING212_ENV=demo`
- `TRADING212_API_KEY` as `sync: false`
- `TRADING212_API_SECRET` as `sync: false`
- `ATLAS_BROKER_CONTROL_TOKEN` as `sync: false`
- `TRADING212_LIVE_TRADING_ENABLED=false`

`api.main` also mounts the isolated mobile-v2, Trading 212 and Global CAPEX Chain routers so the current code remains compatible if the Render dashboard still uses `api.main:app` as a legacy start command.

## Recovery gate

In the Render dashboard for the service that owns `atlas-genesis.onrender.com`:

1. Confirm the Git source is `Vicente24051980/atlas_genesis` and the deployment branch is `main`.
2. Confirm the start command is `uvicorn api.app:app --host 0.0.0.0 --port $PORT` (legacy `api.main:app` is also code-compatible, but `api.app:app` is canonical).
3. Set `FINANCIALDATANET_API_KEY` as a private environment value.
4. Keep Trading 212 in paper mode until its API key pair is supplied and validated:
   - `TRADING212_ENV=demo`
   - `TRADING212_LIVE_TRADING_ENABLED=false`
5. When Trading 212 credentials are available, set them privately along with a long random `ATLAS_BROKER_CONTROL_TOKEN`.
6. Deploy current `main`.
7. Rerun `ATLAS Mobile Live Backend Smoke`.

## Required PASS conditions

The live smoke must confirm:

- `/v1/mobile/health` => `service=atlas-mobile-v2`
- portfolio count = 36
- `/v1/mobile/company/MSFT` returns `FinancialData.Net` when the FinancialData.Net key is configured, otherwise explicit Finnhub fallback
- `/v1/mobile/capex-chain/MSFT` => `EDD-0 / PAYBACK`, with numeric structural scores still null until E2+ evidence is ingested
- `/v1/mobile/broker/status` => no secrets exposed and live execution locked unless explicitly enabled

Only after those checks pass is production deployment `CERTIFIED`.

## Security rule

Provider/broker credentials are deliberately not committed to Git, Notion, Expo public variables, or the APK. CI inspects the generated Android bundle and fails if direct FinancialData.Net or Trading 212 upstream API URLs leak into the APK.
