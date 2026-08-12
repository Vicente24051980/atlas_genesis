# ATLAS Ω — Provider key cutover checklist

Use only after the paid market-data plan and Trading 212 read-only key exist.

## Server variables

Configure on the backend environment only:

- `FINNHUB_TOKEN=<paid token>`
- `FINNHUB_MAX_CALLS_PER_SECOND=20`
- `TRADING212_ENV=live`
- `TRADING212_API_KEY=<read-only live key>`
- `TRADING212_API_SECRET=<matching secret>`
- `ATLAS_T212_SYMBOL_OVERRIDES={}` initially
- `TRADING212_LIVE_TRADING_ENABLED=false`

Do not configure `ATLAS_BROKER_CONTROL_TOKEN` for this read-only rollout.

## First live checks before any mobile promotion

1. `GET /health` -> backend online.
2. `GET /v1/portfolio/status` -> `environment=live`, `configured=true`, `readOnly=true`.
3. `GET /v1/portfolio/live` -> position count and values match Trading 212.
4. Record every `analysisSymbolStatus=NEEDS_VERIFIED_MAPPING` instrument.
5. Resolve those instruments using Trading 212 ticker + ISIN + exchange metadata; add only verified mappings to `ATLAS_T212_SYMBOL_OVERRIDES`.
6. `GET /v1/mobile/universe` -> `portfolioMeta.provider=Trading212` and watchlist remains independent.
7. Analyze portfolio in pages of at most eight via `/v1/mobile/monitor/portfolio`.
8. Analyze the phone's editable watchlist in pages of at most eight via `/v1/mobile/analyze-symbols?context=watchlist`.
9. Re-run pages to confirm Finnhub cache/dedupe prevents a request storm and valid data survives 429 as stale-last-good.
10. Verify `/v1/market/history/{symbol}`, `/v1/market/rotation`, and `/v1/market/dislocation` before enabling their new mobile client paths.

## Mobile promotion

Only after the backend checks pass:

- switch portfolio source to `AtlasPremiumSyncApi.universe()` / `monitor('portfolio')`;
- keep local SQLite watchlist identity and analyze current local symbols with `AtlasPremiumSyncApi.analyzeSymbols()`;
- switch historical chart and Radar to the premium sync methods;
- preserve old v0.4 fallback during staged rollout;
- build release APK;
- inspect compiled APK for provider credentials (must be none);
- run Android emulator ONLINE gate;
- compare portfolio count and representative values with Trading 212;
- merge PR #45 only after all gates pass.

## Rollback

If any mismatch, credential issue, wrong international mapping, provider blanking or OFFLINE regression appears, keep the certified existing APK/main and roll back the backend candidate. No portfolio mutation or order placement is part of this rollout.
