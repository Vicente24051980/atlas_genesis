# YAHOO FINANCE SOURCE POLICY Ω

Status: CANONICAL
Effective: 2026-08-11
Scope: ATLAS Ω financial analysis, market-data checks, GREEN CONTINUITY Ω, ENTRY TIMING Ω, MARKET BOTTOM Ω and MONEY ROTATION Ω.

## 1. Role
Yahoo Finance is incorporated as a SECONDARY / CROSS-CHECK market-data source for:
- price and historical prices;
- multi-horizon returns;
- volume;
- market-performance cross-checks;
- continuity/timing calculations when available.

Yahoo Finance is NOT a primary corporate/fundamental evidence source and does not replace:
- SEC/EDGAR or equivalent regulator filings;
- 10-K, 10-Q, 20-F, 6-K and official filings;
- company IR releases and earnings materials;
- official guidance and management disclosures.

## 2. API status guardrail
Yahoo currently does not expose a public official Yahoo Finance API in the Yahoo Developer Network catalogue. Any Yahoo Finance programmatic integration must therefore be labelled UNOFFICIAL / SECONDARY, treated as potentially unstable, and never become a single point of failure.

## 3. ATLAS Ω source hierarchy
1. Primary corporate/regulatory evidence for fundamentals, thesis and falsifiers.
2. Main available market-data provider for price/history.
3. Yahoo Finance as secondary market-data cross-check.
4. Stooq, Finnhub or another independent provider for additional verification when a signal is decision-critical, timing-sensitive or disputed.

## 4. Data-conflict protocol
Every market-derived ATLAS output should carry, when technically available:
- source/provider;
- as-of date/time;
- delayed/realtime flag;
- calculation window;
- conflict/confidence status.

If materially different providers disagree, set:
`DATA CONFLICT / VERIFY`

A data conflict must not create an automatic BUY or SELL. The disputed input must be resolved or explicitly caveated first.

## 5. GREEN CONTINUITY Ω
For 1S / 1M / 3M / 1A / Total calculations:
- use the same close-price convention across windows;
- preserve the provider timestamp;
- cross-check a decisive 5/5 or 4/5 boundary when provider differences could change the gate;
- never mix adjusted and unadjusted series silently.

## 6. Mobile/backend architecture
ATLAS mobile must not store provider secrets or depend directly on undocumented Yahoo endpoints. Provider access belongs in the backend/provider layer. The mobile contract should expose normalized market data plus metadata such as `source`, `asOf`, `delayed` and `dataConflict`.

Provider abstraction target:
`PRIMARY MARKET FEED -> YAHOO SECONDARY -> INDEPENDENT FALLBACK / VERIFY`

## 7. Evidence rule
Yahoo Finance data may support market-state observations. It must not be used alone to assert a fundamental fact that has a primary source.

Evidence > narrative. Source provenance is mandatory for decision-critical data.
