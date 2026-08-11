# ATLAS Ω — ProPicks Global AI Selection / Korea Alpha

**Date:** 2026-08-11
**Source:** Investing.com material supplied by user
**Evidence class:** Vendor-reported / discovery evidence; requires independent validation

## Claims reported by Investing.com

### Korea
- KOSPI: approximately -3.6% in August at the stated cutoff.
- Three Korean AI strategies: reported average +13.7%.
- Claimed relative advantage: >17 percentage points.
- Claimed average hit rate: 92%.

### Global ProPicks universe
- 88 AI strategies referenced.
- 858 stocks reportedly positive, average return +5.77%.
- Reported hit rate: 61.55%.
- 70 strategies reportedly positive.
- 147 stocks reportedly >+10%, average +16.39%.
- 33 stocks reportedly >+20%, average +26.32%.
- Best strategy reportedly +22.47% month-to-date.

The source itself correctly notes that only roughly one week of August has elapsed, so these are short-window snapshots rather than full-month evidence.

## ATLAS Ω interpretation

The important hypothesis is not "AI beats the market". The potentially useful observation is:

**cross-sectional stock selection can generate alpha even when the broad local index is flat or falling.**

This supports ATLAS's ticker-first/global-discovery architecture and argues against using index direction as a hard gate for individual-company discovery.

### Candidate module: CROSS-SECTIONAL ALPHA Ω

Measure whether selected securities are outperforming their local benchmark despite weak/neutral benchmark returns.

Suggested variables:
- security return vs local benchmark;
- sector-neutral relative strength;
- breadth among selected names;
- hit rate;
- median return rather than only mean return;
- contribution concentration (top 1/top 3 names);
- downside dispersion;
- persistence across 1M/3M/6M/1Y;
- turnover and transaction-cost drag;
- survivorship/rebalancing effects.

This module must remain independent from GREEN CONTINUITY Ω and Business Quality Ω. Relative alpha is a discovery/confirmation signal, not sufficient evidence for BUY.

## Evidence-integrity warning

All performance statistics above are reported by the product vendor marketing the strategies. Before using them as proof of persistent alpha, ATLAS must validate:

1. exact portfolio constituents and rebalance dates;
2. benchmark choice;
3. whether returns include transaction costs/taxes;
4. treatment of removed positions;
5. survivorship/look-ahead bias;
6. arithmetic vs time-weighted returns;
7. median and distribution, not only aggregate averages;
8. full history including losing strategies;
9. out-of-sample persistence.

Therefore classification is **INTERESTING SIGNAL / NOT YET VERIFIED ALPHA**.

## Macro context supplied

The source also frames the period around renewed oil strength linked to Hormuz, inflation concerns ahead of US CPI and pressure on technology stocks. This belongs to MACRO REGIME Ω / ENERGY ROTATION Ω and should not be mixed mechanically with the ProPicks performance claim.

## Operational consequence

Continue global ticker-first discovery, especially markets where benchmark weakness masks strong individual securities. Korea is a priority discovery region if independent price/fundamental data confirm the reported dispersion. Do not copy ProPicks selections blindly; identify the actual tickers and run the complete ATLAS pipeline:

GLOBAL DISCOVERY → DATA INTEGRITY → QUALITY Ω → GREEN CONTINUITY Ω → VALUATION / IMPLIED RETURN Ω → ENTRY TIMING Ω → DECISION SAFETY GATE.
