# RECOMMENDATION PERFORMANCE AUDIT + LIVE MARKET VALIDATION + MODEL LEARNING Ω

**Status:** ACTIVE · CANONICAL  
**Effective:** 2026-08-22  
**Implementation:** `src/atlas/algorithm/recommendation-performance-audit-omega.ts`

## Canonical placement
This block executes **after Competition for Capital Ω and before Final Ranking Ω**.

Canonical chain:

`Evidence → Integrity → GREEN FIRST → ALL APPLICABLE ENGINES → Economic Proof → Expected Return → Durability → Valuation → Risk/Falsifiers → Competition for Capital → Recommendation Performance Audit → Live Market Validation → Final Ranking → Recommendation → Immutable T0 Snapshot → Market Outcome → Attribution → Calibration Check → Model Recalibration if justified → Next Recommendation`

## 24. RECOMMENDATION PERFORMANCE AUDIT Ω
ATLAS Ω audits prior recommendations as rigorously as companies.

Before issuing a new verdict on a company, strategy or selection class, search for comparable historical recommendations and evaluate whether ATLAS selected, valued, calibrated Expected Return, timed entry and allocated capital correctly relative to alternatives available at T0.

### Immutable ex-ante snapshot
Every recommendation stores an immutable snapshot containing at minimum:
- ticker and company;
- timestamp T0;
- P0, listing and currency;
- market cap and EV;
- Economic Proof and Business Quality;
- Expected Return Bear/Base/Bull and assigned probabilities;
- Expected CAGR and horizon;
- Entry Score and Wave Score when applicable;
- verdict and benchmark;
- alternatives considered and discarded;
- thesis, catalysts, falsifiers and known risks;
- evidence actually available at T0.

The snapshot is append-only and cannot be retrospectively rewritten.

### Anti-hindsight law
A past decision is judged only against information available at T0. Future information may explain the realized outcome but may never be injected into the original decision packet to make the decision appear better or worse than it was.

### Performance windows
Where applicable measure `1D · 1W · 1M · 3M · 6M · 12M · original horizon`.

Record:
- absolute return;
- benchmark return;
- Recommendation Alpha = recommended return − benchmark return;
- maximum drawdown;
- volatility;
- time to maximum;
- time to thesis realization;
- risk-adjusted return;
- evolution of Expected Return.

### Alternative Opportunity Audit Ω
Positive return is insufficient. Compare the recommendation with sector benchmark, direct peers, candidates discarded at T0 and the next-best alternative in the original ranking.

`Selection Alpha = recommended return − return of best relevant discarded alternative`

A profitable recommendation may still be a poor allocation decision if Selection Alpha is materially negative.

### Expected Return Calibration Ω
Group historical recommendations by forecast Expected Return bands and compare forecast versus realized outcome.

Audit mean error, mean absolute error, optimistic bias, pessimistic bias, dispersion, hit rate and Bear/Base/Bull calibration. If higher forecast ER does not systematically outperform lower forecast ER over sufficient samples, investigate the Expected Return engine.

### Attribution Engine Ω
Every material forecast/result deviation must be classified as one or more of:
`DATA_ERROR · FUNDAMENTAL_ERROR · VALUATION_ERROR · TIMING_ERROR · CATALYST_ERROR · MACRO_ERROR · RISK_ERROR · UNKNOWN_SHOCK · MODEL_SELECTION_ERROR`.

### Outcome law
`OUTCOME ≠ DECISION QUALITY`

A good process can have a bad realized outcome and a bad process can have a favorable realized outcome. Audit process, evidence, calibration and result separately.

## 25. LIVE MARKET VALIDATION Ω
After fundamental audit and Expected Return, validate the thesis against the current market and current evidence.

Always perform `LAST AUDIT → NOW` delta analysis across:
- PRICE;
- EXPECTED RETURN;
- FUNDAMENTALS: revenue, EPS, EBITDA, FCF, margins, ROIC, guidance;
- REVISIONS: EPS, revenue, FCF and analyst targets as secondary information;
- VALUATION: relevant multiples, FCF yield, NAV discount/premium;
- RELATIVE STRENGTH versus index, sector, peers and ATLAS alternatives;
- FLOW when verifiable: relative volume, breadth, ETF flows, institutional positioning, systematic/CTA positioning, options/block activity;
- THESIS: Economic Proof, catalysts, falsifiers and risk removals.

Never infer institutional flow merely from a rising price.

### Live Validation State
Emit exactly one:
- `STRENGTHENING` — economic evidence and/or Expected Return is improving;
- `VALIDATED` — thesis is developing approximately as expected;
- `UNCHANGED` — no material new evidence;
- `WEAKENING` — evidence deteriorates but thesis survives;
- `FALSIFIED` — one or more confirmed material falsifiers invalidate the thesis.

### Critical law
`MARKET VALIDATION ≠ FUNDAMENTAL VALIDATION`

Price can fall while revisions, FCF, balance and Economic Proof improve; Expected Return may therefore rise. Price can rise while fundamentals remain flat and valuation expands; Expected Return may therefore fall.

## 26. MODEL LEARNING & GOVERNANCE Ω
ATLAS may not claim to learn merely because parameters were changed after observing outcomes.

Every model modification records:
- detected problem;
- sample used;
- evidence;
- hypothesis;
- change made;
- expected impact;
- possible side effects;
- previous version;
- new version;
- change date.

Maintain old-model versus new-model comparison when the sample is sufficient.

### Anti-overfitting Gate Ω
Do not modify the framework to fit one stock, three isolated observations, ordinary volatility or a singular extraordinary shock.

Recalibration requires evidence of a repeated, economically material systematic error, statistical support when reasonably measurable, temporal stability, cross-sector consistency when applicable and a credible expectation of improved out-of-sample behavior.

A change that improves a handful of retrospective cases but weakens generalization must be rejected.

## 27. FINAL RANKING Ω
Final ranking executes only after:

`Integrity → GREEN → all engines → Economic Proof → Expected Return → Durability → Risk → Competition for Capital → Recommendation Performance Audit → Live Market Validation`

For Expected Return expose:

`Rank | Ticker | Price | Economic Proof | Bear | Base | Bull | Expected CAGR | Selection Alpha Potential | Live Validation | Risk | Entry | Verdict`

Do not rank by fame, size, moat in isolation, historical return or business quality in isolation. Rank according to the objective explicitly requested.

## 28. UPDATED OUTPUT DISCIPLINE
For each company show:
- `PRICE INTEGRITY: PASS/FAIL`
- `GREEN: X/5`
- `ECONOMIC PROOF: X/5`
- `BUSINESS QUALITY: X/5`
- `DURABILITY: X/5`
- `DEFENSIVE Ω: X/5`
- `EXPECTED RETURN: Bear/Base/Bull`
- `EXPECTED CAGR: range`
- `WAVE SCORE: X/100` when applicable
- `ENTRY: attractive/reasonable/demanding/do not enter`
- `LIVE MARKET VALIDATION: strengthening/validated/unchanged/weakening/falsified`
- `PREVIOUS RECOMMENDATION` when one exists
- `RECOMMENDATION PERFORMANCE` when a valid sample exists
- `SELECTION ALPHA` when calculable
- explicit falsifiers
- `VERDICT: STRONG BUY / BUY / WATCH / HOLD / REJECT`

Then build the transversal ranking.

## New canonical laws
`RECOMMENDATION QUALITY ≠ BUSINESS QUALITY`  
`OUTCOME ≠ DECISION QUALITY`  
`MARKET VALIDATION ≠ FUNDAMENTAL VALIDATION`  
`POSITIVE RETURN ≠ GOOD CAPITAL ALLOCATION`  
`HISTORICAL ALPHA ≠ FUTURE ALPHA`  
`RECALIBRATION ≠ OVERFITTING`  
`A MODEL THAT IS NOT AUDITED CANNOT LEARN`

## Feedback Loop Ω
`Evidence → Integrity → Analysis → Economic Proof → Expected Return → Competition for Capital → Recommendation → Immutable T0 Snapshot → Market Outcome → Recommendation Performance Audit → Attribution → Live Market Validation → Calibration Check → Model Recalibration if justified → Next Recommendation`

ATLAS must attempt to demonstrate with accumulated evidence that its capital-allocation decisions improve over time without hindsight and without overfitting recent outcomes.
