# RECOVERY INFLECTION Ω v1.0

**Status:** CANONICAL MODULE — ATLAS Ω MASTER ALPHA
**Date:** 2026-08-10

## Mission
Discover high-quality companies that have suffered a material price drawdown but are no longer simply falling: they are showing evidence of stabilization and an emerging recovery. The engine is designed to identify the transition from dislocation to recovery before the recovery becomes consensus.

This module is independent from Business Quality Ω, GREEN CONTINUITY Ω, Historical Dislocation Ω, Money Rotation Ω and Entry Timing Ω. Its output must never overwrite another engine's output.

## Core principle
**QUALITY + MATERIAL DRAWDOWN + FUNDAMENTALS INTACT + STABILIZATION + EMERGING PRICE CONFIRMATION.**

A large decline alone is not an opportunity. A rebound alone is not evidence of quality. Both sides must be independently validated.

## Pipeline
GLOBAL DISCOVERY → DATA INTEGRITY → QUALITY GATE → DRAWDOWN GATE → FUNDAMENTAL INTEGRITY → BASE DETECTION → RECOVERY CONFIRMATION → ENTRY TIMING / NO-CHASE → RANKING.

## 1. Quality Gate — mandatory
Candidate must pass the canonical ATLAS Ω Business Quality hard requirements. Evaluate moat, cash generation, balance sheet, capital allocation, sustainable growth, durability and governance using primary evidence where available.

Failure of a structural quality requirement means REJECT regardless of price behavior.

## 2. Material Drawdown Gate
Measure drawdown from relevant 52-week and multi-year highs. Default discovery band: approximately -20% to -60% from a relevant high. Values outside this band are not automatically rejected; thresholds must be normalized for the historical volatility of the asset.

The engine must distinguish normal volatility from genuine dislocation.

## 3. Fundamental Integrity
Test whether the business deteriorated less than the share price implies. Examine revenue, EPS, FCF, margins, ROIC/ROCE, balance sheet, guidance, competitive position and management commentary.

Create `fundamental_price_divergence_score` from 0–100. High score means price damage is materially greater than demonstrated business damage.

## 4. Recovery State Machine
Every candidate receives exactly one state:

- `FALLING` — persistent deterioration; no credible floor.
- `CAPITULATION` — extreme decline/volatility; possible exhaustion but unconfirmed.
- `BASE` — lower downside velocity, stabilization and repeated support.
- `EMERGING` — initial recovery evidence appears.
- `CONFIRMED_RECOVERY` — recovery has broader multi-horizon confirmation.
- `EXTENDED` — recovery is valid but entry is now vulnerable to chasing.
- `FAILED_RECOVERY` — attempted recovery broke down.

Primary target states are `BASE`, `EMERGING`, and early `CONFIRMED_RECOVERY`.

## 5. Emerging Recovery Evidence
Use several independent signals rather than one chart pattern:

1. downside velocity decelerates;
2. no fresh material low or rapid reclamation after a marginal low;
3. higher low / constructive base where statistically meaningful;
4. recovery above short/intermediate trend references;
5. improving 1-week and 1-month relative strength;
6. improving 3-month trajectory;
7. positive abnormal volume or accumulation evidence where reliable;
8. relative strength versus sector/index stops deteriorating;
9. fundamental revisions/guidance stop worsening or improve;
10. negative news produces progressively smaller price damage.

No single signal is sufficient.

## 6. Recovery Inflection Score — 100
- Business Quality: 25
- Fundamental/Price Divergence: 20
- Drawdown Opportunity: 15
- Base Quality: 15
- Recovery Confirmation: 15
- Relative Strength Inflection: 10

Interpretation:
- 90–100: PRIME RECOVERY
- 80–89: STRONG EMERGING
- 70–79: WATCH / DEVELOPING
- 60–69: EARLY / INSUFFICIENT CONFIRMATION
- <60: REJECT for this engine

The score is an engine-specific score and must not be represented as the canonical Business Quality score.

## 7. Entry Timing Ω / NO-CHASE integration
Recovery identification does not equal BUY NOW. Pass qualified candidates to Entry Timing Ω. Evaluate distance from recent low, distance from ATH, acceleration, volatility, distance from trend/means and consolidation quality.

Possible execution states:
- `BUY_ZONE`
- `STARTER_ZONE`
- `WAIT_CONFIRMATION`
- `NO_CHASE`
- `FAILED_SETUP`

A high Recovery Inflection Score can coexist with NO_CHASE.

## 8. Value-trap falsifiers
Reject or downgrade when price weakness is supported by structural deterioration, including persistent FCF impairment, balance-sheet stress, collapsing unit economics, durable moat loss, adverse structural regulation, repeated guidance deterioration without stabilization, destructive dilution/acquisitions, accounting/governance concerns, or a broken secular demand thesis.

## 9. Anti-bias rules
- Ticker-first global discovery.
- Do not seed discovery only from portfolio/watchlist or famous compounders.
- Do not use analyst upside as evidence of intrinsic value.
- Do not equate historical high price with fair value.
- Do not infer a bottom from a visually attractive MAX chart.
- Do not use AI-generated narrative as evidence.
- Require timestamped, reproducible market and fundamental inputs.

## 10. Output contract
Each candidate record must include:

```text
ticker
company
as_of
quality_gate
business_quality_score
peak_reference
current_price
drawdown_pct
recovery_state
fundamental_price_divergence_score
base_quality_score
recovery_confirmation_score
relative_strength_inflection_score
recovery_inflection_score
entry_timing_score
execution_state
falsifiers
primary_evidence
confidence
```

## 11. Current hypothesis set — NOT validated recommendations
The screenshots supplied on 2026-08-10 suggest ROP, TYL, ACN and POWI as visual examples worth validating through this engine. LULU is a potential dislocation candidate but the chart alone is insufficient to classify it as emerging recovery. These names are seeds for validation only and are not hard-coded discovery candidates.

## 12. Portfolio rule
The engine is a discovery/entry module. It does not create an automatic sell rule for existing ATLAS Ω positions. Portfolio maintenance remains governed by the canonical portfolio and falsifier rules.

## 13. Benchmarking
Store immutable snapshots of every signal so the engine can be tested without hindsight. Measure forward 1M/3M/6M/12M returns, excess return versus sector and benchmark, maximum adverse excursion, maximum favorable excursion, hit rate, drawdown and false-recovery rate.

The purpose is empirical: determine whether quality companies entering recovery after dislocation generate repeatable alpha, and modify thresholds only from out-of-sample evidence.