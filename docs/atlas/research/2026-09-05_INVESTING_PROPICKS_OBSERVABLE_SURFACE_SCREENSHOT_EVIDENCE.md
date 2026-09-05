# Investing / ProPicks observable-surface evidence — screenshots 2026-09-05

**Status:** RESEARCH EVIDENCE / NON-CANONICAL INPUT  
**Captured from:** user-provided Investing.com app screenshots, 2026-09-05 12:44 local time  
**Parent canon:** `CURRENT_CANON/2026-09-03_INVESTING_AI_CLONE_OMEGA_V1_3.md`  
**Purpose:** enrich reverse engineering of the *observable decision surface* without claiming access to proprietary code, model weights, ranking rules, or hidden features.

## 1. High-value observable signals

### 1.1 Strategy-history / realized-selection surface
The app exposes a historical strategy-result card for an energy-leaders selection:
- Strategy/card period shown: 2015–2026.
- Total return shown for the strategy/card: **+653.9%**.
- Comparison shown for **S&P 500 Energy: +65.9%**.
- App headline states outperformance of **+588.0%**.
- Prior winner examples visible:
  - **CNX Resources (CNX): +81.2%** from price **9.05** on **2016-03-01** to price **16.40** on **2016-07-01**.
  - **Devon Energy (DVN): +117.5%**.
  - **Ovintiv (OVV): +162.5%**.

**Reverse-engineering value:** the surface proves that Investing can expose entry/exit dates, entry/exit prices, realized return, strategy aggregate return, and a benchmark comparison. These fields are suitable as `EXTERNAL_CALIBRATION_CASE` evidence, but not as proof of persistent alpha because full trade history, turnover, transaction costs, benchmark construction, survivorship treatment and all losers are not visible.

### 1.2 Fair-value / risk / estimates / analyst-consensus surface
Visible Tesla card:
- **TSLA price:** 354.08.
- InvestingPro fair value shown: **260.49**, **-25.97%** implied downside, labelled **overvalued**.
- Risk label: **MEDIUM**.
- Next results date shown: **2026-10-28**.
- Revenue estimate: **27.66B**.
- EPS forecast: **0.45**.
- Analyst target: **390.09**.
- Analyst distribution: **21 Buy / 20 Hold / 5 Sell**.

**Clone mapping:**
- Fair value → **F5 Valuation** submodel only.
- EPS/revenue forecasts and revisions → **F6 Expectations Trajectory**.
- Analyst target/distribution → diagnostic / bounded F6 secondary signal, not intrinsic value.
- Risk label → potential external proxy for **F9 Market Risk**, never imported directly into score without independent reconstruction.

### 1.3 New-coverage / target-upside surface
Visible new analyst coverage entries:
- **AVGO** — Rosenblatt, Buy, target **600.00**, displayed upside **67.64%**.
- **TEM** — Cantor Fitzgerald, Buy, target **80.00**, displayed upside **23.80%**.
- **XTNT** — Lucid Capital, Buy, target **1.000**, displayed upside **166.67%**.
- **CDNA** — Canaccord, Buy, target **65.00**, displayed upside **27.75%**.
- **BLLN** — Canaccord, Buy, target **120.00**, displayed upside **20.74%**.

**Reverse-engineering value:** confirms the product surface tracks analyst initiation event, broker, rating, target and target-implied upside. This supports a timestamped **F6 expectations/event** feature family. It must not be double-counted with the same target change in F10 or with subsequent price response in F7.

### 1.4 Popular-screen / factor-score surface
Visible `Expansión rentable` screen:
- Three-month return displayed for the screen: **5.3%**.
- Companies and visible `Crecimiento de la salud` values:
  - VYT: **4.57**
  - INDXA: **4.46**
  - YCPS: **4.08**
  - ISUR: **3.83**
  - RLIA: **3.83**

**Reverse-engineering value:** provides evidence that Investing surfaces named factor/screener concepts with numerical health/growth-style values and screen-level forward/recent performance. The exact calculation is unknown and must remain a latent external label, not copied as a clone factor.

### 1.5 Most-undervalued surface
Visible ranking entries:
- **Adobe (ADBE)** — price **266.51**, displayed **69.26% undervalued**.
- **Charter Communications (CHTR)** — **151.99**, **68.54% undervalued**.
- **Fiserv (FI)** — **53.00**, **67.86% undervalued**.
- **EPAM Systems (EPAM)** — **117.04**, **69.62% undervalued**.
- **Fidelity National Information Services (FIS)** — **41.89**, **62.33% undervalued**.

**Clone mapping:** candidate observations for **F5 Valuation** calibration only. Do not infer Investing's fair-value formula from one point-in-time cross-section.

### 1.6 Movers / market-confirmation surface
Visible active/mover names include:
- MU **+6.10%**
- NVDA **+0.84%**
- SNDK **+11.90%**
- TSLA **-5.92%**
- AAPL **-2.51%**

Visible 52-week-high panel includes:
- DELL **524.14**, daily **+1.50%**
- MTW **+4.69%**
- UNM **-0.75%**
- HPQ **+2.22%**
- NMR **+0.28%**

Visible 52-week-low panel includes MCD, SITC, LHX, ADTN and EGAN.

Visible premarket leaderboard includes BAOS, IMRN, OFAL, PLAG and ADBT, with very large percentage moves in several microcaps.

**Clone mapping:**
- relative return / persistence → **F7 Relative Momentum**;
- 52-week high/low, gap, premarket move and liquidity context → **F8 Technical Structure & Liquidity**;
- microcap premarket lists are discovery/noise candidates, never standalone quality evidence.

## 2. What this evidence adds to the reverse engineering

The screenshots materially strengthen the hypothesis that the observable Investing/ProPicks environment combines at least these public decision surfaces:

`valuation + fundamental/health screens + analyst expectations + risk labels + momentum/technical state + event calendar + historical strategy outcomes`.

This is strongly consistent with the current ten-factor clone architecture, but it does **not** identify proprietary weights or prove that every displayed Investing.com module is an input to ProPicks itself.

## 3. New data schema to retain

For future screenshot or page captures, retain timestamped observations with:

`provider | surface | strategy/card | ticker | sector | timestamp | price | entry_date | entry_price | exit_date | exit_price | realized_return | benchmark | benchmark_return | fair_value | fair_value_gap_pct | risk_label | revenue_estimate | eps_estimate | estimate_revision | analyst_rating | analyst_target | target_upside_pct | buy_count | hold_count | sell_count | screen_name | external_factor_label | external_factor_value | daily_return | premarket_return | high_52w_flag | low_52w_flag | source_evidence_id`.

## 4. Reverse-engineering constraints

1. **Observable surface ≠ hidden algorithm.**
2. **InvestingPro general app modules ≠ proven ProPicks model features.**
3. Promotional winners and aggregate strategy cards are **external calibration cases**, not validation.
4. One economic observation may contribute to only one primary factor in the clone.
5. External fair value, risk and factor scores are labels to reproduce independently, not imported answers.
6. Screenshot point-in-time observations must be stored with capture timestamp to avoid look-ahead.
7. A useful next step is repeated captures over time to estimate transition probabilities: new entry, retained, removed, rank movement, fair-value changes, analyst revisions and subsequent 20/60/120-day outcomes.

## 5. Research conclusion

**YES — these screenshots add usable reverse-engineering data.** Their highest-value contribution is not today's ticker list; it is the discovery of additional **observable fields, labels, ranking surfaces and historical entry/exit metadata** that can be recorded longitudinally and tested against the clone. No canonical factor weights are changed from this single evidence batch.
