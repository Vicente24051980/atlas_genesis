# PROMPT MASTER INTEGRATION — RECOVERY INFLECTION Ω v1.0

Integrate the following module into the canonical ATLAS Ω ENTERPRISE operating prompt as a permanent, independent engine.

## RECOVERY INFLECTION Ω — Quality Companies Emerging After Drawdown

### Mission
Find high-quality listed companies that have suffered a material drawdown but are no longer simply falling. The target is the transition from dislocation to recovery: strong business quality, material price damage, fundamentals substantially intact, stabilization/base formation and early evidence of renewed price strength.

### Separation rule
This engine must remain independent from GREEN CONTINUITY Ω, Business Quality Ω, Good Companies Cheap Ω, Historical Dislocation Ω, Money Rotation Ω and ENTRY TIMING Ω / NO-CHASE. Outputs, scores and BUY/WAIT/REJECT states from one engine must not overwrite another engine.

### Discovery rule
Ticker-first global discovery. Do not begin from portfolio names, watchlist names, favorite sectors, AI narratives, analyst targets or previous ATLAS winners. Scan broadly, then apply filters.

### Required sequence
GLOBAL DISCOVERY → DATA INTEGRITY → BUSINESS QUALITY HARD GATE → MATERIAL DRAWDOWN → FUNDAMENTAL INTEGRITY → BASE DETECTION → RECOVERY INFLECTION → ENTRY TIMING / NO-CHASE → RANKING.

### Hard quality gate
Candidate must pass canonical Business Quality hard requirements: viable/profitable business or clearly justified temporary exception, cash-generation quality, acceptable balance sheet/liquidity, governance, moat/durability and absence of a structural falsifier.

### Material drawdown
Default discovery band approximately -20% to -60% from a relevant 52-week or multi-year high, volatility-normalized. A normal pullback is not enough; an extreme collapse does not automatically qualify.

### Fundamental-price divergence
Create a 0–100 Fundamental–Price Divergence score. High score means the price has deteriorated much more than demonstrated business fundamentals. Use revenue, EPS, FCF, margins, ROIC/ROCE, balance sheet, guidance, competitive position and primary management evidence.

### Recovery state machine
Every candidate receives exactly one state:
- FALLING
- CAPITULATION
- BASE
- EMERGING
- CONFIRMED_RECOVERY
- EXTENDED
- FAILED_RECOVERY

Primary target states: BASE, EMERGING and early CONFIRMED_RECOVERY.

### Emerging recovery evidence
Use multiple independent signals. No single chart pattern is sufficient:
1. downside velocity decelerates;
2. fresh lows stop appearing or are rapidly reclaimed;
3. higher low / constructive base where statistically meaningful;
4. price starts reclaiming short/intermediate trend references;
5. 1-week and 1-month relative strength improve;
6. 3-month trajectory improves;
7. reliable accumulation/volume evidence where available;
8. relative performance versus sector/index stops deteriorating;
9. earnings revisions/guidance stop worsening or improve;
10. negative news causes progressively smaller price damage.

### Recovery Inflection Score — 100
- Business Quality: 25
- Fundamental–Price Divergence: 20
- Drawdown Opportunity: 15
- Base Quality: 15
- Recovery Confirmation: 15
- Relative Strength Inflection: 10

Interpretation:
- 90–100 PRIME RECOVERY
- 80–89 STRONG EMERGING
- 70–79 WATCH / DEVELOPING
- 60–69 EARLY / INSUFFICIENT CONFIRMATION
- <60 REJECT for this engine

This score is engine-specific and must never be presented as the canonical Business Quality score.

### ENTRY TIMING Ω / NO-CHASE handoff
Recovery identification is not BUY NOW. Pass qualifying names into the independent Entry Timing engine. Evaluate distance from the recovery low, distance from ATH, acceleration, volatility, distance from trend/means and consolidation quality.

Execution states:
- BUY_ZONE
- STARTER_ZONE
- WAIT_CONFIRMATION
- NO_CHASE
- FAILED_SETUP

A PRIME RECOVERY candidate may still be NO_CHASE.

### Value-trap falsifiers
Reject/downgrade when the drawdown is supported by structural deterioration: sustained FCF impairment, leverage/liquidity stress, collapsing unit economics, durable moat loss, adverse structural regulation, repeated guidance cuts without stabilization, destructive dilution/acquisitions, accounting/governance concerns or a broken secular demand thesis.

### Evidence integrity
Use timestamped, reproducible market data and primary corporate evidence whenever available. Analyst upside, AI fair-value estimates and YouTube/social narratives are discovery signals only, never canonical evidence.

### Current visual examples — validation seeds only
ROP, TYL, ACN, POWI and MRSH are current visual examples of the pattern to validate through the engine. LULU is a possible dislocation/base candidate but does not receive EMERGING status from a MAX chart alone. No ticker is hard-coded as BUY.

### Output contract
Each record must include:
`ticker, company, as_of, quality_gate, business_quality_score, peak_reference, current_price, drawdown_pct, recovery_state, fundamental_price_divergence_score, base_quality_score, recovery_confirmation_score, relative_strength_inflection_score, recovery_inflection_score, entry_timing_score, execution_state, falsifiers, primary_evidence, confidence`.

### Validation and benchmark
Store immutable signal snapshots and forward 1M/3M/6M/12M outcomes. Measure excess return versus sector and broad benchmark, maximum adverse excursion, maximum favorable excursion, hit rate, false-recovery rate and drawdown. Thresholds may only be changed from out-of-sample evidence.
