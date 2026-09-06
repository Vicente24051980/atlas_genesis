# INSIDER PURCHASE Ω — Preregistration v0.1

**Date:** 2026-09-06
**Status:** PREREGISTERED / RETURNS LOCKED

## Purpose
Test whether public Form 4 insider purchases contain reproducible post-publication information without cherry-picking winners.

## Core law
`FORM4_EVENT != BUY_SIGNAL`.
Only events satisfying the frozen taxonomy enter the research sample.

## Eligible base event
- SEC Form 4 publicly filed.
- Transaction code `P` (open-market or private purchase) in common equity or economically equivalent ordinary shares.
- Exclude gifts, grants, option exercises, automatic vesting, tax withholding, dispositions and non-purchase codes from the base arm.
- Keep 10b5-1 / Rule 10b5-1 plan indicator as a separate field and stratification variable.

## Timestamp law
Backtest clock starts at `PUBLICATION_TIMESTAMP`, not transaction date.
If after-hours, record first tradable session separately.

## Frozen fields
`ISSUER_CIK | TICKER | INSIDER_NAME | ROLE | OWNER_TYPE | TRANSACTION_DATE | PUBLICATION_TIMESTAMP | CODE | SHARES | PRICE | VALUE | DIRECT_INDIRECT | POST_TXN_HOLDINGS | OWNERSHIP_DELTA_PCT | PURCHASE_VALUE_TO_PRIOR_HOLDING_VALUE | TEN_B5_1_FLAG | CLUSTER_ID | MARKET_CAP | SECTOR | OPTIONS_LIQUIDITY_BUCKET | SOURCE_ACCESSION`

## Pre-registered strata
- CEO
- CFO
- founder/chair
- other officer
- director
- 10% owner
- single purchase vs multi-insider cluster
- purchase-value / pre-existing holding-value buckets
- options-liquidity buckets
- micro/small/mid/large-cap buckets

No stratum receives a priori points.

## Cluster definition
A cluster is a company-level window with >=2 distinct insiders making eligible `P` purchases within 30 calendar days. Sensitivity grid: 15/30/60 days, fully disclosed to control multiple testing.

## Falsifiers
- Alpha disappears after publication timestamp rather than transaction date.
- Alpha is explained by size/value/momentum/sector exposures.
- Results vanish after excluding overlapping clustered events.
- Results are confined to illiquid microcaps.
- Results disappear in the high-options-liquidity stratum.
- Results depend on a handful of extreme winners.

## Outputs after freeze
1M / 3M / 6M / 12M absolute and benchmark-adjusted returns; median/mean; hit rate; MFE/MAE; drawdown; bootstrap CI; equal-event and issuer-clustered inference.

## Literature priors — not evidence of ATLAS alpha
Recent research indicates substantial heterogeneity in insider-purchase informativeness. Purchases judged more credible by the insider's increased wealth exposure have shown stronger subsequent abnormal returns in prior research, while a 2024 Journal of Corporate Finance paper finds negligible abnormal returns where options trading is active and stronger post-purchase returns where options markets are less active. These are hypotheses to stratify, not weights.

## State
`INSIDER_PURCHASE_STATE = A0_UNTESTED`
`RETURNS_ACCESS = LOCKED`
