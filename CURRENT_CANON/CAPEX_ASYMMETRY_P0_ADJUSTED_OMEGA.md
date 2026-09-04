# CAPEX ASYMMETRY / P0 ADJUSTED Ω v1.0

**Status:** ACTIVE / CANONICAL COMPATIBLE MODULE  
**Effective date:** 2026-09-04  
**Parents:** CAPEX Hunters Ω v1.0 + CAPEX Capture Elasticity Ω v1.0  
**Authority:** discovery/ranking layer only. It does not override Principal Ω, valuation discipline, Replacement Firewall, portfolio construction or Hard Gates.

## Mission

Find companies that are not merely exposed to a large CAPEX wave, but still offer **economic asymmetry after discounting what the stock market has already paid for**.

The core distinction is:

> **CAPEX remaining ≠ stock upside remaining.**

and:

> **Price run-up alone is not a penalty. Price run-up unsupported by per-share economics or driven by multiple expansion is expectations debt.**

## Data hierarchy

Three-year fundamental CAGR must use the strongest per-share economic measure available:

1. FCF/share
2. EPS/share
3. gross profit/share
4. revenue/share

Do not compare share-price CAGR with aggregate revenue if material dilution exists.

## Formula 1 — Run-Up vs Benchmark Ω

`RUN_UP_VS_BENCHMARK_PP = PRICE_CAGR_3Y - BENCHMARK_CAGR_3Y`

`RUN_UP_DEBT_SCORE = clamp(max(0, RUN_UP_VS_BENCHMARK_PP) / 50pp * 100)`

This is descriptive only. It is not a direct penalty in P0 Adjusted because a stock can legitimately outperform if FCF/share or EPS/share has outgrown the price.

## Formula 2 — Excess Rerating Ω

`EXCESS_RERATING_PP = PRICE_CAGR_3Y - FUNDAMENTAL_PER_SHARE_CAGR_3Y`

`EXCESS_RERATING_DEBT = clamp(max(0, EXCESS_RERATING_PP) / 40pp * 100)`

`FUNDAMENTAL_SUPPORT_SCORE = 100 - EXCESS_RERATING_DEBT`

Interpretation:

- price CAGR <= fundamental/share CAGR → 100 support;
- +20pp annualized price/fundamental gap → ~50 support;
- +40pp or more → 0 support.

## Formula 3 — Multiple Expansion Debt Ω

Use the same valuation metric at both dates.

`MULTIPLE_EXPANSION_DEBT = clamp(log2(CURRENT_MULTIPLE / START_MULTIPLE) * 100)` when current > start; otherwise 0.

A full doubling of the comparable multiple maps to 100 debt.

Valid examples:

- forward P/E → forward P/E;
- EV/EBITDA → EV/EBITDA;
- EV/Sales → EV/Sales.

Never mix P/E with EV/Sales or trailing with forward without normalization.

## Formula 4 — Expectations Debt Ω

When comparable multiple history exists:

`EXPECTATIONS_DEBT = 65% EXCESS_RERATING_DEBT + 35% MULTIPLE_EXPANSION_DEBT`

When it does not:

`EXPECTATIONS_DEBT = EXCESS_RERATING_DEBT`

Then:

`VALUATION_OPPORTUNITY = 100 - EXPECTATIONS_DEBT`

This separates company quality from how much future growth is already capitalized in the stock.

## Formula 5 — CAPEX Capture Elasticity Score Ω

Consume CAPEX Capture Elasticity Ω ratios:

- FCF elasticity: 50%
- gross-profit elasticity: 30%
- revenue elasticity: 20%

Each ratio is capped such that `1.25x` or more maps to 100.

`ELASTICITY_COMPONENT = clamp(max(0, elasticity) / 1.25 * 100)`

Missing metrics redistribute weight among available metrics. If all are missing, use 50 neutral and mark evidence incomplete; never award a free positive score.

## Formula 6 — Remaining CAPEX Ω

Preferred direct formula when a credible funded-program total and cumulative realized spend exist:

`REMAINING_CAPEX_PCT = 1 - CUMULATIVE_REALIZED_CAPEX / CREDIBLE_PROGRAM_TOTAL`

`REMAINING_CAPEX_SCORE = REMAINING_CAPEX_PCT * 100`

If no defensible total exists, the 0–100 Remaining CAPEX Score must be evidence-scored from:

- funded hyperscaler/utility/government plans;
- contracted projects;
- build timelines;
- backlog/RPO;
- interconnection/generation/cooling/networking requirements;
- capacity still to be physically installed.

Do not use unfiltered TAM as remaining CAPEX.

## Formula 7 — Market-Cap Saturation Ω

Optional only when a defensible mature equity-value estimate exists.

`SATURATION_RATIO = CURRENT_MARKET_CAP / PLAUSIBLE_MATURE_MARKET_CAP`

- <=10% → penalty 0
- >=100% → penalty 100
- linear between those points.

**Do not invent mature market cap from TAM.** If no defensible estimate exists, saturation remains UNSCORED and contributes no penalty.

## Master Formula — P0 Adjusted Ω

`P0_ADJUSTED =`

`45% CAPEX_CAPTURE_SCORE`
`+ 20% REMAINING_CAPEX_SCORE`
`+ 15% CAPEX_ELASTICITY_SCORE`
`+ 20% VALUATION_OPPORTUNITY_SCORE`
`- 10% MARKET_CAP_SATURATION_PENALTY`

Clamp final result to 0–100.

### States

- **85–100 P0_ELITE**, provided Expectations Debt <=45.
- **75–84.9 P0_STRONG**.
- **65–74.9 P1_CONFIRMED**.
- **50–64.9 MATURE_CROWDED**.
- **<50 NO_ASYMMETRY_EDGE**.

Any ranking with fewer than three traceable evidence records is **EVIDENCE_PENDING** regardless of raw score.

## Why the formula is constructed this way

### Structural capture dominates

CAPEX Capture Score receives 45%. A cheap stock with no causal CAPEX capture is not a winner.

### Remaining CAPEX matters separately

A company can be an excellent captor whose relevant buildout is already mature. Remaining CAPEX therefore receives its own 20%.

### Economic elasticity matters

The preferred company converts customer/funding-pool CAPEX into gross profit and FCF faster than it must increase its own CAPEX.

### Valuation is independent

A stock is not penalized because it rose. It is penalized when price outruns per-share economics and/or the valuation multiple expands materially.

## Anti-error laws

- **PRICE RUN-UP ≠ EXPECTATIONS DEBT by itself.**
- **PRICE CAGR MUST BE COMPARED WITH PER-SHARE FUNDAMENTAL CAGR.**
- **AGGREGATE REVENUE GROWTH DOES NOT OFFSET DILUTION.**
- **MULTIPLE DELTA REQUIRES THE SAME MULTIPLE DEFINITION.**
- **TAM ≠ MATURE EQUITY VALUE.**
- **ANNOUNCED CAPEX ≠ FUNDED CAPEX.**
- **FUNDED CAPEX ≠ REALIZED ORDERS.**
- **BACKLOG ≠ REVENUE ≠ FCF.**
- **P0 ADJUSTED WINNER ≠ AUTOMATIC BUY.**

## Mandatory ticker output

For every candidate:

`Ticker | CAPEX Capture | Remaining CAPEX | Revenue Elasticity | GP Elasticity | FCF Elasticity | Price CAGR 3Y | Benchmark CAGR 3Y | Fundamental/share CAGR 3Y | Excess Rerating | Multiple Debt | Expectations Debt | Saturation | P0 Adjusted | Evidence Gate | State | Action`

## Current implementation

- `src/atlas/algorithm/capex-asymmetry-omega.ts`
- `src/atlas/algorithm/capex-asymmetry-omega.test.ts`

## Final law

**The target is not the company that has benefited most from the CAPEX wave. The target is the company that can still capture a disproportionate share of remaining CAPEX while its per-share economics have not yet been overcapitalized by the market.**
