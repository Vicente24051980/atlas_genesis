# ATLAS Ω — Premium data + Trading 212 rollout

Date: 2026-08-11
Feature branch: `feat/premium-data-t212-live-20260811`

## Non-negotiable baseline

The Android build certified on 2026-08-10 remains the rollback point. Do not change the currently working production APK or merge this branch until every gate below is green.

Known working production API base used by the certified APK: `https://atlas-genesis.onrender.com`.

Known issue after the ONLINE repair: Finnhub can return HTTP 429 under portfolio-wide fan-out. The application is online; the remaining problem is provider capacity/request architecture, not APK connectivity.

## Architecture target

```text
Trading 212 LIVE (read-only key)
        |
        v
ATLAS backend / portfolio adapter ----> portfolio state, quantities, avg cost, broker price/P&L
        |
        +----> symbol/instrument resolver
        |
Finnhub paid plan / resilient adapter --> quotes/fundamentals/news/recommendations
        |
        v
ATLAS engines / decisions
        |
        v
Mobile APK (no provider secrets)
```

Provider credentials stay on the backend. The APK receives only ATLAS API responses.

## Phase A — freeze and safety

- [x] Create isolated feature branch from `main`.
- [x] Keep the working APK/main untouched while preparation occurs.
- [x] Add a server-side read-only Trading 212 connector with no order methods.
- [x] Add a resilient Finnhub client scaffold with deduplication, endpoint TTLs, stale-last-good fallback and 429 cooldown.
- [ ] Before merge, record final stable APK SHA-256 and production smoke result in this document.

## Phase B — Finnhub paid data

Before buying a plan, confirm that the chosen Finnhub plan covers all ATLAS endpoints actually required:

- `/quote`
- `/stock/profile2`
- `/stock/metric`
- `/stock/recommendation`
- `/company-news`
- any historical endpoint selected for charts
- required international-market coverage

Implementation rules:

1. Centralize all Finnhub traffic through `api/providers/finnhub_resilient.py`.
2. Never let 34 portfolio cards independently create duplicate upstream calls.
3. One unique endpoint+symbol request may be in flight at a time; concurrent consumers share the result.
4. Cache TTL depends on data volatility: quotes seconds, news minutes, recommendations hours, fundamentals/profile much longer.
5. Stay below Finnhub's global 30 calls/second ceiling even if the paid minute quota is higher.
6. HTTP 429 triggers cooldown/backoff. When a valid cached value exists, return it as stale rather than blanking the UI.
7. Keep last-good data long enough to survive temporary provider outages; expose source freshness/status explicitly.
8. No synthetic fundamental values.

## Phase C — Trading 212 read-only LIVE portfolio

Create a Trading 212 API key with **read-only account/portfolio permissions**. Do not grant order permissions for this phase.

Backend variables (server only):

- `TRADING212_ENV=live`
- `TRADING212_API_KEY=<secret>`
- `TRADING212_API_SECRET=<secret>`
- `TRADING212_LIVE_TRADING_ENABLED=false`

The new `/v1/portfolio/*` adapter is intentionally GET-only:

- `/v1/portfolio/status`
- `/v1/portfolio/live`
- `/v1/portfolio/account`
- `/v1/portfolio/instruments?q=...`

Rate-limit policy follows Trading 212 response headers and caches endpoints conservatively. Positions are refreshed on a short interval; account summary less often; instrument metadata is long-lived.

The existing broker/order guardrails remain separate. A read-only key means an accidental order call must fail at the provider even if legacy order routes exist elsewhere.

## Phase D — portfolio becomes broker-authoritative

`Mi Cartera Ω` will stop treating the hard-coded/bootstrap list as the live truth when Trading 212 is configured.

Required normalized position fields:

- broker ticker
- ATLAS analysis symbol
- instrument name / ISIN / currency
- quantity
- quantity available for trading
- quantity in pies
- average price paid
- current broker price
- wallet/P&L impact
- opened-at timestamp

The hard-coded portfolio remains only as an offline/bootstrap fallback until the migration is proven.

## Phase E — symbol resolver

Trading 212 symbols and Finnhub symbols are not assumed to be identical. Resolve them using broker instrument metadata, ISIN and exchange information where available.

Rules:

- preserve the original T212 ticker permanently;
- store the derived ATLAS/Finnhub symbol separately;
- never silently map an ambiguous international instrument;
- unresolved instruments stay visible in the portfolio but show analysis as unavailable until mapped;
- cache instrument metadata because the upstream list is slow-changing and tightly rate-limited.

## Phase F — mobile resilience

The mobile app must not erase valid information just because one provider is temporarily limited.

Desired states:

- `LIVE`: fresh provider response;
- `CACHE:FRESH`: fresh server cache;
- `CACHE:STALE:*`: last-good value retained during 429/outage;
- `UNAVAILABLE:*`: no valid value has ever been obtained.

When Finnhub is limited but Trading 212 remains available, the portfolio must still show broker quantity/current price/P&L. ATLAS analytical fields may show last-good timestamp rather than `No data returned`.

## Phase G — certification before merge

No merge to `main` and no replacement APK until all of these pass:

- [ ] Python compile/tests.
- [ ] Mobile TypeScript check.
- [ ] Finnhub paid key configured only on backend.
- [ ] Trading 212 read-only LIVE key configured only on backend.
- [ ] No provider secret appears in repository or compiled APK.
- [ ] `/v1/portfolio/live` count matches the real Trading 212 account.
- [ ] Quantities, average prices and current values spot-check correctly against T212.
- [ ] Portfolio refresh does not exceed documented T212 limits.
- [ ] 34+ tickers can load without a request storm.
- [ ] Simulated Finnhub 429 keeps last-good data and does not mark the whole app offline.
- [ ] Android release APK contains only the ATLAS public backend URL.
- [ ] Android emulator physically reaches ONLINE against production.
- [ ] Home, Cartera, Watchlist, Radar, ticker detail and ATLAS decision routes work.
- [ ] Live order execution remains disabled.
- [ ] Rollback to the 2026-08-10 certified APK remains possible.

## Deployment order

1. Validate providers in feature-branch CI with mocked credentials/responses.
2. Add real paid Finnhub and read-only T212 secrets to the backend environment manually; never commit them.
3. Deploy backend candidate and verify `/health`, `/v1/portfolio/status`, `/v1/portfolio/live` and representative ATLAS analysis calls.
4. Only then point/build the candidate APK against that backend.
5. Run physical Android emulator gate.
6. Compare with the currently working APK.
7. Merge only after all gates are green.

## Stop conditions

Stop rollout and keep the current APK if any of the following occurs:

- portfolio count/positions disagree materially with Trading 212;
- credentials leak into logs, repository or APK;
- a route can place a live order with the planned read-only key;
- rate-limit handling causes data loss instead of stale fallback;
- the new APK loses ONLINE status against the verified backend;
- Render is still deploying a different branch/service contract than the code being certified.
