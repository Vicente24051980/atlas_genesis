# ATLAS Ω — Pre-Consensus PIT Dataset v1

Date: 2026-09-05
Status: ACTIVE_RESEARCH_DATA_PIPELINE

## Purpose
Populate Pre-Consensus Benchmark Ω with reproducible public point-in-time evidence rather than synthetic fixtures.

## Sources
- SEC Company Tickers + Companyfacts XBRL: issuer identity, financial facts and `filed` date. Only facts filed on or before a snapshot are admissible.
- Stooq historical daily prices: market-price observations at or before each snapshot.
- Wikimedia REST Pageviews: 90-day attention proxy. Attention is diagnostic only and can never rescue weak fundamentals.
- SEC 13F datasets: approved as a future institutional-recognition source, but excluded from v1 scoring until CUSIP/issuer/ticker mapping is explicitly validated.

## Pilot universe
30 US-listed equities across Technology, Communication, Consumer, Financials, Healthcare, Industrials, Utilities, Energy and Materials. The pilot is not claimed to be survivorship-free. It is an empirical data pipeline pilot, not yet promotion-grade alpha evidence.

## Point-in-time rule
For snapshot S, an XBRL fact is usable only if `filed <= S`. Restatements filed after S are not allowed to leak backward into S. Each row stores filing date, period end and source URL.

## Fail-closed rule
The builder exits non-zero when fewer than 70% of produced rows contain both a market price and at least one point-in-time filing. Missing attention data does not become zero attention; it remains missing.

## Governance boundary
This dataset can populate research diagnostics and benchmark fixtures. It does not by itself satisfy the benchmark's full survivorship-audit requirement, does not promote Pre-Consensus Discovery Ω, and has zero direct ATLAS score authority.
