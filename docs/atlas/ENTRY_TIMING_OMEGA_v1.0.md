# ENTRY TIMING Ω v1.0 — NO-CHASE GATE

Status: EXPERIMENTAL / PARALLEL TEST
Scope: ATLAS Ω ENTERPRISE
Horizon: 3–6 years

## Mission

Separate company selection from execution timing.

A company may qualify under Business Quality Ω and GREEN CONTINUITY Ω while still being a poor immediate entry because price is extended, near/at an all-time high after rapid acceleration, or offering an asymmetric short-term drawdown risk.

Canonical principle:

> SELECTION ≠ ENTRY.

GREEN CONTINUITY Ω identifies strength and confirms market sponsorship. It must not, by itself, produce BUY NOW.

## Architecture

ENTRY TIMING Ω is independent from:

- Business Quality Ω
- GREEN CONTINUITY Ω
- Good Companies Cheap Ω
- Historical Dislocation Ω / Burry Contrarian Engine
- Money Rotation Ω
- Specialized thematic engines

No score or state from ENTRY TIMING Ω may overwrite the thesis of another engine. It only controls execution timing for a candidate already eligible to be bought by the relevant engine.

## Required inputs

For each ticker, calculate at minimum:

1. Distance to all-time high (ATH).
2. Distance from relevant trend references / moving averages.
3. Recent acceleration: 1W, 1M, 3M velocity and slope.
4. Historical volatility.
5. Historical drawdown distribution.
6. Typical pullback size during intact uptrends.
7. Current drawdown from ATH.
8. Consolidation quality and duration.
9. Gap / event-driven extension where applicable.
10. Business thesis integrity and current falsifiers.

## Dynamic calibration — mandatory

Do not use one fixed correction threshold for every company.

A normal drawdown for AVGO may not be normal for CTAS, ABBV, WELL, MS or another lower-volatility compounder. Entry bands must be calibrated to the ticker's own historical behavior and, where useful, sector/regime context.

The engine should estimate:

- normal_pullback_pct
- elevated_pullback_pct
- stress_drawdown_pct
- extension_zscore
- ath_distance_pct
- trend_distance_zscore
- acceleration_percentile

## Core states

### BUY

Candidate passes the parent investment engine and current entry is not materially extended relative to its own history.

### WAIT / NO-CHASE

The company remains valid, but immediate entry is blocked because price is statistically or structurally extended.

Typical reasons:

- price at/near ATH after abnormal acceleration;
- distance from trend is excessive;
- recent return is in an extreme historical percentile;
- expected normal correction would create materially better asymmetry;
- vertical/parabolic move without adequate consolidation.

WAIT is not SELL and is not a thesis downgrade.

### BUY-THE-DIP / THESIS INTACT

A pullback has improved entry asymmetry while the business thesis and structural market trend remain intact.

A falling price is not sufficient. The candidate must still pass quality/thesis requirements and show no confirmed structural falsifier.

### REJECT ENTRY

Do not enter because the price move or drawdown is associated with deterioration that invalidates the parent thesis, or because evidence quality is insufficient.

## NO-CHASE logic

A 5/5 GREEN candidate can be classified WAIT / NO-CHASE when a combination of the following is true:

- ATH distance is very small;
- acceleration percentile is extreme;
- trend-distance z-score is extreme;
- current price is above the normal historical extension band;
- recent move lacks consolidation;
- downside to a statistically normal pullback materially exceeds near-term entry upside.

Do not use ATH proximity alone as a bearish signal. Strong companies can remain near ATH for long periods. The gate requires extension evidence, not simply a high price.

## Correction logic

A correction of approximately 5–20% can be normal depending on the ticker. The engine must not assume a universal 10% or 20% threshold.

When price corrects:

1. Re-check thesis/falsifiers.
2. Re-check GREEN CONTINUITY structural horizons.
3. Compare the drawdown with the ticker's historical pullback distribution.
4. Recalculate valuation and entry asymmetry.
5. Only then move WAIT → BUY-THE-DIP or BUY.

## Relationship with GREEN CONTINUITY Ω

GREEN CONTINUITY Ω remains a strength/selection engine.

5/5 GREEN means:

- market strength is confirmed across the defined horizons;
- the candidate remains eligible under that engine;
- it cannot be marked SELL merely for diversification, overlap or portfolio pruning while the canonical continuity rule remains satisfied.

But 5/5 GREEN does NOT mean automatic BUY NOW.

ENTRY TIMING Ω decides whether execution is:

- BUY now;
- WAIT / NO-CHASE;
- BUY-THE-DIP with thesis intact;
- REJECT entry.

## Experimental protocol — frozen 100 ticker universe

Before promotion to canonical production rule, run ENTRY TIMING Ω in parallel on the currently frozen ATLAS Ω 100-ticker universe.

For each observation record:

- ticker
- parent_engine
- parent_engine_state
- green_continuity_state
- price
- ath
- ath_distance_pct
- recent returns
- volatility
- historical pullback bands
- extension metrics
- entry_state
- entry_reason
- subsequent 1D / 1W / 1M maximum adverse excursion
- subsequent 1D / 1W / 1M maximum favorable excursion

Primary validation question:

> Does ENTRY TIMING Ω reduce avoidable drawdown from chasing extended leaders without materially reducing participation in durable winners?

Do not promote the gate solely from intuition or a few examples. Promote only after evidence from the frozen test universe.

## Decision hierarchy

Business Quality / parent engine: **Do I want to own this business?**

GREEN CONTINUITY Ω: **Is the market confirming the position?**

ENTRY TIMING Ω: **Is this a sufficiently asymmetric moment to execute?**

## Safety rules

- Never call a company cheap solely because it has fallen.
- Never call a company overvalued solely because it is at ATH.
- Never convert WAIT / NO-CHASE into SELL.
- Never let short-term timing override a confirmed long-term falsifier.
- Never let timing metrics overwrite business evidence.
- Evidence > narrative.
