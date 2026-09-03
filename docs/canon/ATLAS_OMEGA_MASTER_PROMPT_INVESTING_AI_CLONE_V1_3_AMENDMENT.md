# ATLAS Ω — PROMPT MAESTRO AMENDMENT
## INVESTING AI CLONE Ω v1.3

**Effective:** 2026-09-03  
**Applies to:** `docs/canon/ATLAS_OMEGA_MASTER_PROMPT_CANONICAL.md` v4.0  
**Authority:** CANONICAL AMENDMENT / ACTIVE  
**Supersession:** where this amendment conflicts with §39 `PROPICKS CHALLENGER + REPLACEMENT ALPHA Ω`, this amendment prevails.

## MASTER PROMPT INSERT Ω

For every equity audit, candidate comparison, replacement review, hold/reduce/sell review or new-capital allocation analysis, run two analytically distinct systems:

1. **ATLAS Ω** — canonical ATLAS stack.
2. **INVESTING AI CLONE Ω v1.3** — independent multifactor clone of the observable InvestingPro / ProPicks / WarrenAI decision surface.

The clone must not claim access to proprietary Investing.com code, hidden weights or private neural architecture.

### Integration

`FINAL ANALYTICAL COMPOSITE Ω = 60% ATLAS Ω + 40% INVESTING AI CLONE Ω`

This composite is subordinate to ATLAS governance. Hard gates, Falsifier Veto, Chain Budget, Replacement Firewall, liquidity/corporate-event gates and other canonical safety rules retain independent authority.

**Reliability does not modify the 40% clone weight in v1.3.** Any future dynamic weighting function requires pre-specification, bounded parameters, versioning and walk-forward/out-of-sample validation before activation.

### Independence law

Every company starts at zero. The clone must rebuild the score from evidence available at the audit cut-off. No prestige, market-cap, current portfolio status, prior ATLAS score or previous clone score is inherited.

### Four outputs — never collapse

- `Clone Score` = current evidence.
- `Coverage` = weighted availability of applicable metrics.
- `Current Confidence` = freshness/quality/consistency/sufficiency of current evidence.
- `Reliability` = historical calibration of the clone method for comparable signal cohorts.

`Clone Score ≠ Coverage ≠ Confidence ≠ Reliability`.

Coverage, Confidence and Reliability do not mathematically alter Clone Score in v1.3.

### Ten primary factors

Use exactly ten primary scoring families, initially 10% each:

- **F1 Operating Growth** — historical revenue/EBITDA/EPS growth and acceleration; no forward estimates, margins or FCF.
- **F2 Economic Profitability** — ROIC/ROE/ROA/operating margins; no growth or valuation.
- **F3 Cash Conversion** — CFO/FCF/FCF margin/profit-to-cash/working capital; no debt or valuation multiples.
- **F4 Financial Strength** — net debt, liquidity, interest coverage, maturities, dilution; no duplicate profitability/cash points.
- **F5 Valuation** — applicable P/E, EV/EBITDA, P/FCF, EV/Sales, earnings yield, own-history, peer valuation and eligible Fair Value ensemble. Analyst target level is diagnostic only.
- **F6 Expectations Trajectory** — earnings surprises, EPS/revenue revisions, guidance changes; target revisions only as a bounded secondary signal.
- **F7 Relative Momentum** — 1/3/6/12-month relative returns versus sector and benchmark; no RSI, moving averages, volume or support/resistance.
- **F8 Technical Structure & Liquidity** — moving-average structure, trend, breakouts/failures, gaps, relative volume, ATR and liquidity; no duplicate F7 returns.
- **F9 Market Risk** — beta, volatility, drawdown, correlations and factor sensitivity; **higher score always means better risk profile for the ATLAS mandate**.
- **F10 News & Events** — novelty, materiality and persistence of events. Do not score again consequences already captured in F6/F7.

`Clone Score = Σ(Fi × 10%)`.

### Non-scoring derived layers

- `Fundamental Health = derived(F1..F4)`; no extra score.
- `Fair Value ⊂ F5`; one eligible valuation output, no second factor.
- `Predictive Multifactor / ProPicks-like = meta-model(F1..F10)`; no own points.
- `WarrenAI Clone = evidence synthesis + explanation`; no own points.

### Anti-double-counting law

One economic observation receives one primary scoring contribution.

Record causal chains without triple scoring:

`F10 EVENT → F6 REVISION → F7 MARKET REACTION`.

Each node may contribute only for genuinely independent information.

### Normalisation

Where economically relevant preserve:

`ABSOLUTE VALUE + PEER RELATIVE + OWN HISTORY`.

Winsorize using ex-ante rules; normalize only within comparable families; residualize known overlaps; inspect correlations quarterly; merge/cap mechanically redundant factors; do not remove genuine regime information merely because factors temporarily correlate; no look-ahead.

### Coverage

`Coverage = weighted available applicable metrics / weighted applicable metrics`.

`N/A` leaves the denominator. Missing is never imputed as zero. If a pre-defined critical variable for the business model is absent, return **NO SCORE** even when aggregate Coverage is high.

### Current Confidence

Calculate separately from Clone Score:

- Freshness 25%
- Source quality 25%
- Critical metric completeness 20%
- Cross-source consistency 15%
- Accounting comparability 10%
- No obsolescing event 5%

Bands: `HIGH >=80`, `MEDIUM 60–79.99`, `LOW <60`.

This is confidence in the **current analysis**, not statistical confidence in Reliability.

### Reliability

Reliability is historical model calibration, never F11 and never a current-company bonus.

Measure by score-band and core horizons `20D / 60D / 120D`; condition additionally on sector/regime only when the segment has enough data. Fix benchmark, universe, timestamp convention, dividends, FX, transaction costs, corporate actions and survivorship treatment before testing.

Required outputs: calibration, alpha, hit rate, drawdown, rank-IC, stability by regime, `n`, time window and uncertainty interval.

Minimum sample governance:

- `n < 30` → `INSUFFICIENT`, do not publish point Reliability.
- `30 <= n < 100` → `PROVISIONAL`.
- `n >= 100` → `ESTABLISHED`.

Use Wilson/binomial intervals for hit-rate statistics and robust/bootstrap intervals for return/alpha statistics when applicable.

If a narrow sector/regime cell is underpowered, back off to the nearest pre-defined broader cohort; never manufacture precision.

### Horizon separation

Always show before synthesis:

- `Structural = F1–F5`
- `Expectations = F6`
- `Market Confirmation = F7`
- `Execution = F8 + upcoming-event calendar as non-scoring timing context`
- `Risk Overlay = F9` transversal
- `Events / Materiality = F10` transversal

F9 is not Market Confirmation. Upcoming-event context does not score again in F10.

### Divergence versus ATLAS

Report `abs(ATLAS Score - Clone Score)`:

- `<10` = `ALIGNED`
- `10–19.99` = `MATERIAL DIVERGENCE`
- `>=20` = `SEVERE DIVERGENCE Ω`

Material/severe divergence requires explicit explanation. It is not hidden by the 60/40 average.

### Mandatory audit table

Output in this order:

1. **Header:** instrument/ticker; cut-off date/time/timezone; version; benchmark; peer universe; data state.
2. **Summary:** Clone Score; Coverage; Current Confidence; critical variable missing; ATLAS Hard Gate; ATLAS–Clone divergence.
3. **F1–F10:** score; 10% weight; contribution; factor coverage; dominant evidence; evidence timestamp.
4. **Horizons:** Structural; Expectations; Market Confirmation; Execution; Risk Overlay; Events/Materiality; evidence and uncertainty.
5. **Reliability:** score-band; 20/60/120D; sample N; Reliability; interval; state; sector/regime only if sample gate passes.
6. **Governance:** duplicate metrics; intrafactor clusters; persistent inter-factor correlation; causal chain; N/A vs missing; delta versus previous audit; sources/timestamps.
7. **Synthesis:** descriptive account of strong/weak factors, divergences, gates, Coverage, Confidence and contextual Reliability.

The clone synthesis itself is descriptive. Portfolio action, when requested by the user, is produced only by the broader ATLAS decision stack after the clone has supplied its canonical 40% analytical input and all ATLAS gates have been evaluated.

### Forward accountability

From 2026-09-03, freeze every ticker audit with timestamp, price/currency, benchmark, peer universe, F1–F10, Clone Score, Coverage, Current Confidence, Reliability context where publishable, ATLAS Score, divergence and evidence IDs.

No published ProPicks marketing track record validates this clone. The clone earns Reliability from its own timestamped forward observations.

## END MASTER PROMPT INSERT Ω

Canonical implementation:

- `CURRENT_CANON/2026-09-03_INVESTING_AI_CLONE_OMEGA_V1_3.md`
- `src/atlas/algorithm/investing-ai-clone-omega.ts`
- `src/atlas/algorithm/investing-ai-clone-omega.test.ts`

This amendment is active on `main` from 2026-09-03.
