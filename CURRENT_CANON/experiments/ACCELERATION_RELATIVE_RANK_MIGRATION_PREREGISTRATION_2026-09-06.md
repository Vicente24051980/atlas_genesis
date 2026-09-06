# ACCELERATION × RELATIVE RANK MIGRATION Ω — Preregistration

**Experiment ID:** `ARRM_OMEGA_V1_2026-09-06`  
**Status:** FROZEN BEFORE OUTCOME INSPECTION  
**Authority:** RESEARCH ONLY · structural score 0 · BUY authority 0  
**Created:** 2026-09-06

## Question

Does upward migration in a company's point-in-time market-cap rank contain incremental forward-return information after controlling for ordinary momentum and size, or is the apparent NVIDIA-style pattern merely momentum/selection bias?

The advertising observation that motivated the test is not evidence. NVIDIA 2021–2022 is treated as an anecdote only and is not used to choose thresholds after execution.

## Sequential design

This is deliberately a **Stage-A falsifier**. We first test whether relative-rank migration itself adds information beyond conventional momentum/size. Only if Stage A survives may a separately preregistered Stage B add point-in-time fundamental acceleration from SEC filings.

This order prevents us from building a complicated fundamental model around a market-rank feature that may have no incremental value.

## Economic mechanism prior

Candidate mechanism: persistent fundamental/competitive improvement may be incorporated into prices gradually; a company that climbs the capitalization hierarchy faster than same-size, same-momentum peers may be undergoing a durable regime change rather than a one-off price move.

Rival hypothesis: rank migration is only a nonlinear transformation of momentum and size. If matched controls or null permutations reproduce the result, the feature has no demonstrated incremental edge.

## Point-in-time universe

- Historical S&P 500 membership, not today's constituents backfilled.
- Source dataset: `hanshof/sp500_constituents`, `sp_500_historical_components.csv`.
- Rebalance frequency: calendar quarter-end snapshots.
- Research window: 2018Q1–2025Q4 where data permit.
- No security may enter a quarter unless it is present in the historical constituent set for that date.
- Missing/delisted price/share histories remain missing; no zero-return or winner imputation.

## Market-cap construction

For each historical constituent at each quarter-end:

`market_cap_proxy = split-consistent historical close × historical shares outstanding`

Historical shares are requested from Yahoo/yfinance `get_shares_full`. The runner records coverage. If point-in-time market-cap coverage is <70% for the eligible quarter observations, the experiment returns `SAMPLE_INCOMPLETE` rather than an alpha verdict.

This is called a market-cap **proxy** because Yahoo's historical shares series is not an audited CRSP/Compustat security-master dataset. A positive result would require later replication on an institutional point-in-time dataset before promotion.

## Frozen features

At quarter `t`:

- `SIZE_PCT_t`: cross-sectional percentile of market-cap proxy among available historical S&P 500 members; larger = higher percentile.
- `RANK_MIGRATION_12M = SIZE_PCT_t - SIZE_PCT_t-4Q`.
- `MOM_12M = adjusted_price_t / adjusted_price_t-4Q - 1`.
- `MOM_6M = adjusted_price_t / adjusted_price_t-2Q - 1`.
- `PRIOR_MOM_6M = adjusted_price_t-2Q / adjusted_price_t-4Q - 1`.
- `PRICE_ACCEL_6M = MOM_6M - PRIOR_MOM_6M`.

No threshold may be changed after results are observed within V1.

## Primary hypothesis H1

`RANK_MIGRATION_12M` has positive incremental 6M and 12M forward excess-return information after matching on quarter, market-cap quintile and 12M-momentum quintile.

### Primary treatment

Within each rebalance quarter, `TOP_RANK_MIGRATION` = top 20% of non-missing `RANK_MIGRATION_12M`.

For each treatment observation, controls are all non-treatment observations in the same:

- quarter;
- market-cap quintile;
- 12M momentum quintile.

Primary statistic per quarter = equal-weight mean of treatment forward excess return minus its matched-control mean. Primary inference unit is the **quarter**, not the stock-event row.

## Secondary hypothesis H2

`TOP_RANK_MIGRATION` observations with `PRICE_ACCEL_6M > 0` outperform their same-quarter / size-quintile / momentum-quintile controls.

H2 cannot rescue H1. If H1 fails, H2 is descriptive only and Stage B remains blocked.

## Outcomes

- Primary horizon: 6 months (approximately 2 quarterly steps).
- Secondary horizon: 12 months (approximately 4 quarterly steps).
- Benchmark: SPY total-return proxy from adjusted close.
- `EXCESS = stock forward adjusted return - SPY forward adjusted return`.

## Temporal split

- Development/train description only: 2018Q1–2021Q4.
- Validation: 2022Q1–2023Q4.
- Sealed OOS: 2024Q1–2025Q4 for horizons that are fully observable by 2026-09-06.

No model coefficients are fitted. The split exists to prevent a full-period-only narrative and to require a separate OOS report.

## Null arms — mandatory

The identical pipeline is run with 1,000 seeded null replications:

1. `PERMUTED_RANK_WITHIN_QUARTER`: permute `RANK_MIGRATION_12M` within each quarter while preserving size, momentum, returns and membership.
2. `RANDOM_TREATMENT_MATCHED_COUNT`: choose the same treatment count randomly within quarter.

Benchmark arm:

3. `MOMENTUM_ONLY`: top 20% 12M momentum, reported separately. It is not a null; it tests whether a simpler conventional signal already explains the economics.

Seed: `20260906`.

## Frozen pass/fail rule

Stage A is `SURVIVES_STAGE_A` only if **all** are true in sealed OOS at 6M:

1. OOS treatment-control quarter-spread mean > 0;
2. OOS treatment-control quarter-spread median > 0;
3. at least 55% of eligible OOS quarters have positive spread;
4. one-sided empirical p-value versus `PERMUTED_RANK_WITHIN_QUARTER` <= 0.05;
5. market-cap proxy coverage >=70%;
6. at least 6 eligible OOS quarters.

Otherwise:

- coverage/sample failure → `SAMPLE_INCOMPLETE`, or
- sufficient sample but rule failure → `FAIL_INCREMENTAL_RANK_EDGE`.

H2, 12M results, full-period results and the momentum-only arm cannot override the primary OOS gate.

## Consequence law

If `FAIL_INCREMENTAL_RANK_EDGE`:

- kill `MARKET-CAP VELOCITY Ω` as demonstrated alpha;
- do not add it to ATLAS company score, timing, sizing or BUY authority;
- do not proceed to Stage-B fundamental acceleration merely to rescue the hypothesis.

If `SURVIVES_STAGE_A`:

- still no portfolio authority;
- create a new preregistration for Stage B using point-in-time SEC revenue/EPS/margin acceleration;
- require an independent data-source replication before promotion.

## Anti-cherry-picking

NVIDIA, Broadcom, Tesla, Apple, Microsoft or any other known winner receives no special treatment. Complete historical cohorts and failed examples remain in the ledger.
