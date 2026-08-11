# ATLAS Ω — Repair matrix from the working ONLINE APK

Date: 2026-08-11
Baseline: keep the currently working ONLINE APK/main unchanged until this matrix is green on the feature branch.

## Observed on-device symptoms and planned repair

| Symptom observed | Root cause / current constraint | Repair prepared | Acceptance criterion |
|---|---|---|---|
| `Finnhub rate limit reached` and `No data returned` across portfolio cards | Free-provider capacity plus fan-out across many tickers/endpoints | Central `FinnhubResilientClient`: per-key in-flight dedupe, endpoint TTL cache, <30 calls/s cap, 429 cooldown, stale-last-good | Load full portfolio + watchlist repeatedly without valid cached data disappearing on 429 |
| A ticker can show quote but ATLAS score/metrics are empty | Quote succeeded while fundamental endpoints were unavailable/limited | Fundamental calls share the resilient adapter and preserve last-good values independently | Quote remains visible; previous valid analysis remains visible with stale/source status instead of fake zero/blank |
| `Histórico no disponible` in ticker detail | Certified public v0.4 backend does not expose the newer multi-period history route | Prepared mobile premium sync client calls `/v1/market/history/{symbol}` after new backend deploy | 1M/3M/6M/1Y render actual delayed/reference history when backend candidate is active |
| Money Rotation Ω shows no early proxies because multi-period data is unavailable | Public v0.4 compatibility layer intentionally returned empty rotation | Prepared client calls `/v1/market/rotation` on the new backend | Rotation sensor returns computed multi-period proxy rows without inventing canonical R3/R4 evidence |
| Historical Dislocation Ω shows zero because deployed backend lacks history | Same old-backend contract limitation | Prepared client calls `/v1/market/dislocation` | Dislocation produces candidates when data meets the deterministic historical rule; zero is valid only when no candidates qualify |
| Trading 212 shows `NO CONFIGURADO` | No LIVE read-only API credentials configured yet | GET-only T212 adapter plus `/v1/mobile/universe` | T212 LIVE positions become authoritative for held positions, with correct count/quantity/avg price/current price |
| Portfolio identities are bootstrap/static | T212 was not connected | `/v1/mobile/universe` automatically uses T212 when configured and falls back only on broker outage/unconfigured state | `portfolioMeta.provider=Trading212` in normal production; fallback is explicit and visible |
| Watchlist must remain independent of broker holdings | Watchlist is research state, not a broker position list | `/v1/mobile/universe` keeps ATLAS watchlist identity; `/v1/mobile/monitor/watchlist` analyzes it through the same paid/resilient provider layer | Adding/removing watchlist symbols does not mutate T212 holdings; every watchlist ticker can be analyzed through premium data |
| Provider outage should not mark entire app OFFLINE | Connectivity and provider completeness were previously conflated | Separate ATLAS API health, T212 portfolio source status, and Finnhub per-endpoint source status | Backend reachable = ONLINE even if one upstream provider is limited; individual cards show stale/unavailable states |

## Provider wiring target

```text
Trading 212 LIVE read-only
  -> /v1/portfolio/*
  -> /v1/mobile/universe (authoritative portfolio)

ATLAS editable watchlist
  -> /v1/mobile/universe (research identity)

Portfolio + Watchlist symbols
  -> /v1/mobile/monitor/{kind}
  -> ATLAS analyze_symbol
  -> Finnhub paid credentials
  -> FinnhubResilientClient
  -> cache/dedupe/cooldown/stale-last-good

Historical/Radar
  -> /v1/market/history
  -> /v1/market/rotation
  -> /v1/market/dislocation
```

## Credentials to configure later — server only

- `FINNHUB_TOKEN`: paid-plan token selected after endpoint/market coverage check.
- `FINNHUB_MAX_CALLS_PER_SECOND=20`: intentionally below the provider global ceiling.
- `TRADING212_ENV=live`.
- `TRADING212_API_KEY`: LIVE key generated with read-only account/portfolio access.
- `TRADING212_API_SECRET`: matching secret.
- `TRADING212_LIVE_TRADING_ENABLED=false`.

Do not put any of those secrets in the APK, GitHub source files, screenshots or chat messages.

## Promotion gates

1. Provider-safety Python tests green.
2. Mobile TypeScript green.
3. New backend candidate serves `/v1/mobile/universe`, `/v1/mobile/monitor/*` and `/v1/market/history/*`.
4. Real T212 position count and spot-check values match the account.
5. T212 key has no order permission; new portfolio/mobile routers expose GET only.
6. Full portfolio and watchlist analysis does not blank valid data under synthetic/real 429.
7. Historical chart, Rotation and Dislocation no longer use the v0.4 empty compatibility placeholders.
8. Candidate APK remains ONLINE in Android emulator and contains no provider credentials.
9. Only after all checks: merge PR #45 and build replacement APK.
