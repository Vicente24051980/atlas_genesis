# CAPITAL INTELLIGENCE Ω — Lingotto 2026Q2 signal-cohort preregistration v1

**Date:** 2026-09-06
**Status:** PREREGISTERED / OUTCOME-BLIND COHORT DEFINITIONS

## Purpose
Test whether public Lingotto 13F information contains incremental post-publication information without cherry-picking individual winners.

## Signal date
2026Q2 13F acceptance/publication: **2026-07-29 11:58:33 ET**.
Executable entry must be the first price observable after publication under the frozen execution convention. No quarter-end prices may be used as signal-entry prices.

## Frozen cohorts from Q1→Q2 2026 normalized share ledger

### ACCUMULATION
Common-equity positions with positive normalized share delta after corporate-action reconciliation:
- NVDA +8.684%
- TSM +11.368%
- RRC +53.538%
- NBIS +59.495%

### NEW_VISIBLE_POSITION
- MOH
- Enviri
- Fervo Energy
- Sunshine Silver
- Klarna

These remain a separate cohort because NEW and INCREASE may encode different information.

### UNCHANGED_SHARES / persistence control
- Aurora Innovation
- Cloudflare
- Duolingo
- MercadoLibre
- Moderna
- Paramount Skydance
- Tempus AI
- Tesla
- Harmony Gold

### DISTRIBUTION
Normalized common-equity decreases, excluding unresolved corporate actions/classes:
- CVNA -27.131% after 5:1 split normalization
- First Majestic -46.739%
- ISRG -62.199%
- Pony.ai -45.336%
- RRC excluded here because it is accumulation
- Recursion -62.483%
- SLB common -18.782%
- Sibanye -2.554%
- TEVA -27.240%
- VEON -12.858%
- Joby -35.744%
- Valaris -34.945%

NovaGold is excluded from cohort inference pending class/CUSIP reconciliation. Options are excluded from common-equity cohorts.

## Primary hypotheses
H0a: ACCUMULATION has no positive benchmark-adjusted return advantage over UNCHANGED after publication.
H0b: ACCUMULATION has no positive benchmark-adjusted return advantage over DISTRIBUTION after publication.
H0c: HIGH/EXTREME PERSISTENCE has no incremental information after controlling for fundamentals, valuation, revisions and risk.

## Horizons
1M / 3M / 6M / 12M. The 1M result is diagnostic only; promotion authority requires longer horizons and multiple filing cohorts.

## Metrics
- equal-weight cohort return
- median constituent return
- benchmark-adjusted return
- hit rate vs benchmark
- volatility and max drawdown where history permits
- bootstrap confidence interval when sample size permits

## Benchmark hierarchy
1. broad market benchmark
2. sector/industry benchmark where mapping is reliable
3. factor-aware control in the later MODEL_A vs MODEL_B test

## Capital Intelligence authority
No cohort result from a single filing may create direct ATLAS BUY/SELL authority.

`CAPITAL_INTELLIGENCE_DIRECT_SCORE = 0`

Promotion requires repeated out-of-sample incremental value of MODEL_B = fundamentals/valuation/revisions/risk + Capital Intelligence versus MODEL_A alone.

## Data limitation discovered 2026-09-06
The homogeneous Tiingo/Lona price source was successfully validated earlier for Innovation, but the current connector credit allowance was exhausted after an NVDA refresh during this continuation. Therefore this preregistration freezes cohorts before additional outcome inspection; no mixed-provider return panel is substituted merely to obtain a result today.

## Canonical interpretation
This document intentionally separates **signal definition** from **outcome observation**. Cohorts are frozen before the full return panel is inspected, reducing researcher degrees of freedom and preventing winner-led threshold selection.