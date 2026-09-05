# ATLAS Ω — Pre-Consensus PIT Dataset v1

Date: 2026-09-05
Status: ACTIVE_RESEARCH_DATASET

## Purpose
Populate Pre-Consensus Benchmark Ω with reproducible public point-in-time evidence rather than synthetic fixtures.

## Certified v1 financial panel
- Universe: 30 US-listed equities across nine sectors.
- Snapshots: 22 quarterly dates from 2021-03-31 through 2026-06-30.
- Rows: 660.
- PIT-valid rows: 655.
- PIT coverage: 99.24%.
- Persisted dataset: `data/pre_consensus/generated/pit_panel.csv`.
- CI certification: both the five-name smoke and full 30-name build must reproduce >=70% PIT coverage and prohibit any `filed > snapshot_date` observation.

## Sources and fallbacks
- Fundamentals / issuer identity: official SEC Company Tickers + Companyfacts are attempted first. GitHub-hosted Actions currently receives HTTP 403 from SEC, so the certified CI dataset uses the public `deeleeramone/sec-company-facts` Parquet mirror, which is built from SEC Company Facts and preserves CIK, XBRL tag, form, period end and `filed` date. The mirror is partitioned by `CIK % 64`; only relevant shards are downloaded.
- Prices: Stooq is attempted first. Its CSV endpoint returned empty histories in the certified CI environment, so v1 uses Yahoo Finance Chart historical daily closes as the traced fallback. Every row records provider, price date and source URL.
- Attention: Wikimedia Pageviews remains an approved diagnostic source but is intentionally absent from the certified financial-core panel because the API returned HTTP 429 during CI. Missing attention is stored as missing, never as zero or low attention.
- SEC 13F: approved for future Institutional Recognition Gap, but excluded until CUSIP/issuer/ticker mapping is independently validated.

## Point-in-time rule
For snapshot S, an XBRL fact is usable only if `filed <= S`. Restatements or facts filed after S are not allowed to leak backward into S. Each observation records filing date, period end, provider and source URL.

## Financial fields currently populated
Revenue, gross profit, net income, operating cash flow, CAPEX, equity, cash, assets, liabilities, debt, shares and diluted EPS, plus historical close and full provenance fields.

## Fail-closed rule
The builder exits non-zero when fewer than 70% of produced rows contain both a market price and at least one point-in-time filing. Source failure is never converted into a neutral value. Missing attention remains missing.

## Governance boundary
The financial panel is empirical and point-in-time at the observation level, but the 30-name pilot universe is not claimed to be historically survivorship-free. Therefore it can populate diagnostics, factor construction and shadow benchmark experiments, but it cannot satisfy the benchmark's `survivorshipAuditPassed=true` requirement or promote Pre-Consensus Discovery Ω to score authority. Direct ATLAS score weight remains zero until a broader survivorship-clean OOS dataset passes Statistical Backtest Firewall + Model Learning Governance.
