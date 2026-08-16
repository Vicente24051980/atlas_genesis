# ATLAS Ω — FinancialData.Net Integration Spec

Date: 2026-08-16
Status: SOURCE CANDIDATE — VALIDATE BEFORE CANONICAL
Provider: FinancialData.Net
Python SDK: `fdnpy`

## Decision
FinancialData.Net is approved for ATLAS Ω as a candidate/complementary quantitative provider, not as a sole source of truth. No API-derived value may bypass Evidence Integrity, Source Authenticity, Quantitative Integrity, Temporal Normalization, or Cross-Source Reconciliation.

## High-value endpoint families

### 1. Global Discovery / market layer
- stock-symbols
- international-stock-symbols
- stock-quotes / stock-prices / latest-prices
- international-stock-prices
- index-symbols / index-prices / index-constituents
- commodity-prices
- futures-prices
- forex-prices

Use: ticker-first discovery, price history, breadth/context, macro regime. Price is never fundamental evidence.

### 2. Fundamental / Quality Ω
- company-information / international-company-information
- key-metrics / international-key-metrics
- income-statements
- balance-sheet-statements
- cash-flow-statements
- international financial statements
- liquidity-ratios
- solvency-ratios
- efficiency-ratios
- profitability-ratios
- valuation-ratios
- employee-count
- executive-compensation

Use: Quality, Growth, Financial Quality, valuation, FCF/ROIC reconstruction and CAPEX Productivity inputs. Material figures should be reconciled against issuer filings/IR or primary regulatory sources when they drive a decision.

### 3. Ownership / Institutional evidence
- institutional-investors
- institutional-holdings
- institutional-portfolio-statistics
- insider-transactions
- proposed-sales
- senate-trading
- house-trading

Use: ownership-change evidence and institutional positioning. 13F-style holdings are delayed disclosures and MUST NOT be represented as real-time capital flows.

### 4. Macro / regime
- economic-indicators
- economic-indicator-values
- economic-calendar
- Fed press releases
- commodity/futures/forex series

Use: Macro Regime, GOLD–BTC, rates/USD/energy context and Historical Dislocation context.

### 5. Events
- earnings-calendar
- IPO calendar
- splits calendar
- dividends calendar
- press releases / SEC press releases

Use: temporal normalization, catalyst/event layer. Events are triggers/context, not falsifiers by themselves.

### 6. Derivatives
- option-chain
- option-prices
- option-greeks

Use: optional market-implied risk/sentiment layer. Never substitute derivatives positioning for fundamental evidence.

## Non-negotiable semantic safeguards

1. `MARKET_CAP_CHANGE != CAPITAL_FLOW`.
2. Price movement is not evidence of a fundamental thesis change.
3. Institutional holdings are disclosure-based ownership snapshots; do not call them live institutional flows.
4. Provider-calculated ratios are secondary quantitative evidence until reconciled where material.
5. Preserve raw provider payload, endpoint, query identifier, retrieval timestamp, reported period and provider attribution in EvidenceRecord/provenance.
6. Distinguish reported-period date from retrieval date and market-price date.
7. Never silently mix US and international accounting fields without schema normalization.
8. Missing/null data must remain missing; no zero-fill unless the metric definition explicitly permits it.
9. Corporate actions and currency/unit normalization must occur before cross-company comparisons.
10. API failure/staleness must reduce confidence, not silently fall back to an invented value.

## Engine mapping

| ATLAS engine/module | FinancialData.Net role |
|---|---|
| Principal Ω | fundamentals, ratios, price history, valuation inputs |
| Good Companies Cheap Ω | historical/current valuation + fundamentals |
| Historical Dislocation Ω | price/valuation history + macro + fundamentals |
| Money Rotation Ω | contextual market/ownership evidence only; holdings ≠ live flow |
| CAPEX Productivity Ω | cash flow + income/balance-sheet reconstruction |
| Implied Return Ω | standardized DCF inputs; calculations remain ATLAS-owned |
| Discovery Ω | global/international symbols + quantitative pre-screen |
| Macro Regime Ω | economic, commodity, futures, FX and index series |
| Evidence Integrity Ω | provider provenance + reconciliation target |

## SDK audit
The current `fdnpy` client is a thin Requests wrapper over `https://financialdata.net/api/v1/`, with automatic offset pagination and exponential backoff for selected HTTP failures. It exposes US/international symbols and prices, fundamentals, statements, ratios, derivatives, crypto/FX, news/events and economic data.

ATLAS should wrap the SDK behind its own provider adapter rather than allowing engines to call `FinancialDataClient` directly. This prevents vendor lock-in and keeps normalization/evidence policy centralized.

Suggested boundary:

`FinancialDataNetAdapter -> RawProviderRecord -> ATLAS Normalizer -> EvidenceRecord -> Reconciliation -> Engine Inputs`

API keys must be injected via environment/secret storage and never committed to GitHub.

## MCP assessment
FinancialData.Net also advertises an MCP server mapping API endpoints to tools. Access currently requires a Professional or Enterprise subscription. MCP is strategically useful for agentic ATLAS Auditor workflows, but the canonical quantitative pipeline should retain a deterministic SDK/REST adapter for reproducibility, caching, provenance and testing.

Recommended architecture: REST/SDK for canonical ingestion + MCP as an optional interactive/agent layer.

## Validation gate before production
- Verify actual coverage for the frozen ATLAS universe, including European/international tickers.
- Compare a representative sample against SEC/issuer IR/regulatory primary data.
- Verify fiscal-period mapping, TTM handling, units and currencies.
- Test splits/corporate actions and international ticker mapping.
- Measure data latency and update cadence.
- Test pagination/rate limits/retry behavior.
- Identify plan-gated endpoints and total subscription cost.
- Create automated reconciliation tests before raising source status.

## Current verdict
`CANDIDATE / COMPLEMENTARY PROVIDER`.

Do not promote to canonical quantitative source until validation tests pass. If validated, use it primarily to accelerate structured ingestion and screening while preserving primary-source verification for thesis-critical claims.
