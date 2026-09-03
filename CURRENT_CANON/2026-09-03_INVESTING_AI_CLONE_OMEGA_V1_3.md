# INVESTING AI CLONE Ω v1.3 — CURRENT CANON

**Effective:** 2026-09-03  
**Status:** CANONICAL / ACTIVE / AUDITABLE  
**Branch:** `main`  
**Authority:** additive canonical amendment to `docs/canon/ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md`  
**Supersedes where contradictory:** §39 `PROPICKS CHALLENGER + REPLACEMENT ALPHA Ω` and prior INVESTING AI CLONE Ω v1.0–v1.2 drafts.

## 0. Mission

Reproduce functionally the observable decision surface of InvestingPro / ProPicks / WarrenAI without claiming access to proprietary code, hidden model weights or non-public neural architecture.

The clone is an **independent analytical engine**. It must start every ticker from zero evidence and earn every score from timestamped data.

ATLAS integration remains:

`FINAL Ω = 60% ATLAS Ω + 40% INVESTING AI CLONE Ω`

In v1.3, Reliability does **not** modify the nominal 40%. ATLAS hard gates retain veto authority outside the weighted score.

## 1. Four quantities that must never be collapsed

- **Clone Score:** current economic/market evidence only.
- **Coverage:** weighted share of applicable metrics available.
- **Confidence:** quality, freshness, consistency and economic sufficiency of current evidence.
- **Reliability:** historical behaviour of the method, contextual by score-band × horizon × sector × regime.

`Clone Score ≠ Coverage ≠ Confidence ≠ Reliability`.

Coverage and Confidence never change Clone Score mathematically.

## 2. Primary factors — no double counting

Initial weights are frozen at **10% each** until walk-forward/out-of-sample evidence justifies a versioned change.

1. **F1 Operating Growth** — historical revenue, EBITDA and EPS variation/acceleration. Excludes forward estimates, margins and FCF.
2. **F2 Economic Profitability** — ROIC, ROE, ROA, operating margins. Excludes growth and valuation.
3. **F3 Cash Conversion** — CFO, FCF, FCF margin, profit-to-cash conversion, working capital. Excludes debt and multiples.
4. **F4 Financial Strength** — net debt, liquidity, interest coverage, maturities, dilution. Excludes profitability and cash generation already scored elsewhere.
5. **F5 Valuation** — P/E, EV/EBITDA, P/FCF, EV/Sales where applicable, earnings yield, own-history and peer valuation. Fair Value is a submodel inside F5, not an extra factor. Analyst target level is diagnostic only, not intrinsic value.
6. **F6 Expectations Trajectory** — earnings surprises, EPS/revenue revisions, guidance changes; target revisions only as a bounded secondary signal.
7. **F7 Relative Momentum** — 1/3/6/12-month returns relative to sector and benchmark. Excludes RSI, volume, supports and moving averages.
8. **F8 Technical Structure & Liquidity** — distance to moving averages, trend, breakouts/failures, gaps, relative volume, ATR and liquidity. Excludes the return series already used in F7.
9. **F9 Market Risk** — beta, volatility, drawdown, correlations and factor sensitivity. **Higher score = better risk profile for the mandate**, not higher risk.
10. **F10 News & Events** — novelty, materiality and persistence of catalysts, litigation, regulation, M&A and corporate actions. Consequences already captured in F6 or F7 do not score again.

## 3. Derived/non-scoring layers

- **Fundamental Health** = panel derived from F1–F4; no additional points.
- **Fair Value** = submodel within F5; one valuation output after model-eligibility checks.
- **Predictive Multifactor / ProPicks-like** = meta-model aggregating F1–F10; no factor weight of its own.
- **WarrenAI Clone** = narrative/evidence interface explaining F1–F10; no independent score.
- Analyst target consensus = sanity-check/diagnostic; target revisions may enter F6 with bounded contribution.

## 4. Anti-double-counting law

**One economic observation receives one primary scoring contribution.**

A causal chain can be recorded as:

`F10 Event → F6 Revision → F7 Market Reaction`

Each stage may score only its genuinely independent observation. F10 cannot score again merely because the event generated an analyst revision or price move.

## 5. Normalisation and correlation firewall

For each applicable metric retain three views when economically meaningful:

- absolute economic value;
- peer-relative percentile (sector/industry/region/market-cap comparable);
- own-history percentile.

Rules:

1. Winsorize extremes with ex-ante rules.
2. Combine metrics only within the same economic family.
3. Residualize pre-identified overlaps where necessary.
4. Review the factor-correlation matrix quarterly.
5. Persistent mechanical overlap requires fusion or a cap on joint contribution.
6. Do not erase real regime signals merely because factors temporarily correlate.
7. Never use future information to set normalization parameters for a past timestamp.

## 6. Score

`Clone Score = Σ(Fi × 10%)`, i = 1..10.

Every factor is oriented so **100 = better** according to its economic meaning and ATLAS mandate.

Clone Score contains no Reliability bonus, Coverage penalty or Confidence multiplier.

## 7. Coverage

Coverage is quantitative:

`Coverage = Σ(weight_of_available_applicable_metrics) / Σ(weight_of_applicable_metrics)`.

- `N/A` is removed from denominator.
- `missing` remains missing.
- Missing values never become zero scores.
- Critical missing data can force `NO SCORE` even if aggregate Coverage is high.

## 8. Current-analysis Confidence

Confidence is separate from statistical confidence in Reliability.

Frozen v1.3 components:

- Freshness: 25%
- Source quality / hierarchy: 25%
- Critical-metric completeness: 20%
- Cross-source consistency: 15%
- Accounting comparability / definition stability: 10%
- No event rendering the dataset obsolete: 5%

Bands:

- **HIGH:** 80–100
- **MEDIUM:** 60–79.99
- **LOW:** <60

A critical-variable gate can override the band to `NO SCORE`.

## 9. Reliability

Reliability is a historical property of the method, not of the current company and not an 11th factor.

Measure by:

`score-band × 20/60/120-day horizon × sector × market regime`

with a benchmark, universe, entry timestamp, dividends, FX, corporate actions, costs and survivorship treatment fixed before the test.

Required diagnostics: calibration by score band, alpha, hit rate, drawdown, rank-IC and stability by regime.

Sample-size governance:

- `n < 30` → **INSUFFICIENT / do not publish point Reliability**
- `30 ≤ n < 100` → **PROVISIONAL**
- `n ≥ 100` → **ESTABLISHED**

Every published Reliability result must show `n`, window and uncertainty interval. Use Wilson/binomial intervals for hit-rate-like statistics and robust/bootstrap intervals for returns/alpha where applicable.

Sector/regime segmentation is shown only when its own minimum sample gate is satisfied; otherwise back off hierarchically to a broader valid cohort.

Reliability does not alter the clone's 40% in v1.3. Any future weight function must be pre-specified, bounded, versioned and validated walk-forward/out-of-sample before activation.

## 10. Horizons

Report independently before aggregation:

- **Structural:** F1–F5
- **Expectations:** F6
- **Market Confirmation:** F7
- **Execution:** F8 + calendar of upcoming events as non-scoring timing context
- **Risk Overlay:** F9, transversal
- **Events / Materiality:** F10, transversal

F9 is not Market Confirmation. Upcoming-event calendar is not a second F10 score.

## 11. ATLAS integration and divergence

Nominal composite while a valid Clone Score exists:

`Composite = 0.60 × ATLAS Score + 0.40 × Clone Score`.

The composite does not neutralize or override ATLAS governance.

Divergence:

- `|ATLAS − Clone| < 10` → **ALIGNED**
- `10–19.99` → **MATERIAL DIVERGENCE**
- `≥ 20` → **SEVERE DIVERGENCE Ω**

Severe divergence triggers explanation/research, not an automatic trade.

ATLAS hard gates remain absolute and outside Clone Score. Hard Gate is reported in the audit table but is not F11.

## 12. Canonical audit output

Order is mandatory:

`Header → Clone Score → Coverage → Current Confidence → Critical Data / Hard Gates → F1–F10 → Horizons → Contextual Reliability → Statistical Confidence / interval → Governance → ATLAS Divergence → Descriptive Synthesis`.

### Header

Instrument; cut-off timestamp with timezone; version; benchmark; comparison universe; data state.

### Main summary

Clone Score; Coverage; Confidence score + band; critical variable missing; Hard Gate active/inactive + evidence; ATLAS–Clone absolute divergence + explanation.

### Factor table

For every F1–F10 show: Score, Weight, Contribution, factor Coverage, dominant evidence, evidence date/timestamp.

### Reliability table

For score band and 20/60/120-day horizon show: sample N, Reliability, uncertainty interval, publication state; add sector/regime only when sample gate passes.

### Governance table

Duplicated metrics and treatment; intrafactor clusters; persistent inter-factor correlations; causal chain; N/A vs missing; changes from prior audit; sources and timestamps.

## 13. Conclusion policy

The clone conclusion is a **descriptive synthesis**, not an order by itself. It must state dominant factors, weak factors, divergences, gates, Coverage, Confidence and contextual Reliability without hiding uncertainty in one number.

ATLAS portfolio policy may subsequently use the clone as the canonical 40% analytical input, subject to hard gates, Chain Budget, Replacement Firewall, falsifiers and the rest of the active ATLAS governance.

## 14. Forward accountability

From 2026-09-03 forward, freeze every audited signal with:

`Ticker | Cut-off | Price | Currency | Benchmark | Universe | F1..F10 | Clone Score | Coverage | Confidence | Rank/percentile when available | ATLAS Score | Divergence | Hard Gate | Evidence IDs`.

Evaluate at 20/60/120 days as core Reliability horizons; 5/252 days may be stored as supplementary diagnostics but do not redefine v1.3 calibration ex post.

No published ProPicks performance claim is treated as validation of this clone. The clone earns its own Reliability through timestamped forward observations.

## 15. Technical implementation

- Engine: `src/atlas/algorithm/investing-ai-clone-omega.ts`
- Tests: `src/atlas/algorithm/investing-ai-clone-omega.test.ts`
- Prompt amendment: `docs/canon/ATLAS_OMEGA_MASTER_PROMPT_INVESTING_AI_CLONE_V1_3_AMENDMENT.md`

This file is the canonical v1.3 module in `CURRENT_CANON` and prevails over prior ProPicks-challenger rules wherever they conflict.
