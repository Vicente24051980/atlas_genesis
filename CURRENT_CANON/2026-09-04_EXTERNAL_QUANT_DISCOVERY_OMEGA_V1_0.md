# ATLAS Ω — External Quant Discovery Ω v1.0

**Effective:** 2026-09-04  
**Status:** CANONICAL / ACTIVE / DISCOVERY-ONLY  
**Authority:** additive module under ATLAS Ω + INVESTING AI CLONE Ω v1.3

## 0. Mission

Use external quantitative/model portfolios (including InvestingPro / ProPicks) as **adversarial discovery and calibration inputs**, never as borrowed conviction and never as a scoring shortcut.

The purpose is to detect names, factor combinations, regime changes and search-space blind spots that ATLAS may have missed.

## 1. Non-negotiable firewall

An external recommendation contributes **0 points** to ATLAS Score, Clone Score, FINAL Ω and Replacement Alpha.

Every externally discovered ticker must restart at **Point Zero** and pass the same evidence, valuation, risk, hard-gate and falsifier rules as any other company.

`EXTERNAL SIGNAL -> DISCOVERY CANDIDATE -> POINT ZERO -> ATLAS AUDIT -> CLONE AUDIT -> GOVERNANCE -> DECISION`

No external model may bypass Hard Gates, Chain Budget, Replacement Firewall, prior-decision verification, valuation discipline or portfolio constraints.

## 2. External signal record

For each signal store:

- provider / strategy;
- ticker / exchange / currency;
- event type: NEW_ENTRY / REMOVED / RETAINED / RANK_UP / RANK_DOWN / PERFORMANCE_CASE;
- publication timestamp;
- claimed rationale;
- claimed valuation metrics;
- claimed momentum / performance;
- claimed benchmark and horizon;
- source URL/evidence ID;
- whether the claim is independently verified;
- whether complete trade history is available.

## 3. Discovery hypotheses

External signals may generate hypotheses only. Candidate explanatory families:

1. Operating growth acceleration.
2. Earnings/revenue revisions.
3. Relative momentum.
4. Valuation discount vs peers/history.
5. Profitability / capital efficiency.
6. Balance-sheet quality.
7. Cash conversion.
8. Small/mid-cap rotation.
9. Sector/regime leadership.
10. Catalyst/event persistence.

Hypotheses must be tested independently against current data.

## 4. Reverse-engineering protocol

For every disclosed ProPicks addition/removal, freeze a pre-decision feature snapshot using the exact information that would have been available immediately before the published rebalance.

Build paired datasets:

`SELECTED` vs `ELIGIBLE-NOT-SELECTED` and, when possible, `ADDED` vs `REMOVED`.

Measure candidate feature importance using rank separation, conditional hit rates, logistic/ranking models and walk-forward validation. Do not infer proprietary code or claim model equivalence from correlation alone.

The objective is to approximate the **observable decision surface**, not hidden weights.

## 5. Benchmark adversarial test

For each external candidate:

- run ATLAS Ω from zero;
- obtain an independently produced Investing AI Clone Ω score when available;
- record divergence;
- track 20/60/120-day forward returns vs benchmark;
- track drawdown, volatility and rank persistence;
- record whether ATLAS discovered the name before the external signal.

Classify outcome:

- `ATLAS_EARLY` — ATLAS found it before the external model;
- `EXTERNAL_DISCOVERY_WIN` — external model surfaced a valid high-quality name ATLAS had missed;
- `ATLAS_REJECT_CORRECT` — ATLAS rejected and subsequent evidence supports rejection;
- `ATLAS_FALSE_NEGATIVE` — ATLAS rejected/missed and candidate later validates strongly;
- `INCONCLUSIVE` — insufficient horizon/evidence.

## 6. Promotional-performance firewall

Published strategy returns, selected winners and marketing case studies are **EXTERNAL_CALIBRATION_CASES**, not proof of persistent alpha.

No persistence claim is accepted without, at minimum:

- complete historical recommendations or trades;
- entry/exit timestamps and prices;
- benchmark definition;
- treatment of delisted/failed names;
- turnover and transaction-cost assumptions;
- drawdown and volatility;
- survivorship and selection-bias controls;
- out-of-sample / walk-forward evidence.

## 7. Current September 2026 seed cases

Seed candidates from the 2026-09-04 Investing/ProPicks material:

- `EFOR` — NEW_ENTRY hypothesis: high momentum + relative valuation discount.
- `TER` — valuation/AI-memory-cycle case; no automatic buy after drawdown.
- `METC` — small-cap momentum/catalyst case for independent audit.

These are **DISCOVERY CANDIDATES ONLY**. External inclusion/performance gives zero score.

## 8. Interaction with Investing AI Clone Ω v1.3

This module does not change the frozen F1–F10 weights of Clone v1.3.

External ProPicks information may identify which companies to audit and may supply testable public claims, but the Clone Score must be independently produced from current evidence.

`FINAL Ω = 60% ATLAS Ω + 40% independently produced Clone Score`

If the independent Clone Score is unavailable, mark `Clone Score = NO DISPONIBLE` and do not calculate FINAL Ω.

## 9. Output

Mandatory fields for each external-discovery audit:

`Ticker | Provider | Strategy | Signal date | Signal type | External rationale | Verified? | ATLAS Point-Zero score | Clone Score | FINAL Ω if valid | Hard Gate | Expectation Gap | Valuation state | 20/60/120d tracking | Discovery outcome`

## 10. Governance rule

The module is successful only if it improves ATLAS discovery recall or falsification quality out of sample. If it merely chases externally published winners, disable it.
