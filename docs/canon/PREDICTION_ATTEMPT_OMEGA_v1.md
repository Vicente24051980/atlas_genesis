# PREDICTION ATTEMPT Ω v1.0

Status: canonical higher-layer forecasting discipline
Date: 2026-08-09
Scope: Conspiraciones Atlas Ω + MONEY ROTATION Ω + HISTORICAL_DISLOCATION Ω + RISK Ω + CATALYSTS Ω

## Mission

Attempt to forecast regime events, market rotations and narrative outcomes by converting frozen hypotheses into explicit scenarios, probabilities, horizons, confirmers and falsifiers.

This layer does not claim prophecy. It is a prospective probability engine designed to be audited after reality unfolds.

## Core Rule

ATLAS may attempt prediction only when the forecast is written before the outcome and includes:

1. A precise question.
2. A time horizon.
3. Mutually exclusive scenarios.
4. Probability weights that sum to 100%.
5. Observable confirmers and falsifiers.
6. Evidence links and source quality.
7. A scheduled review date.
8. A post-mortem score after the window closes.

## Canonical Sequence

`SIGNAL -> HYPOTHESIS -> SCENARIOS -> PROBABILITIES -> WATCH WINDOW -> CONFIRMERS/FALSIFIERS -> SCORECARD`

Prediction is permitted only as an auditable attempt. It must never be presented as certainty.

## Forecast Classes

| Class | Meaning | Example |
| --- | --- | --- |
| Event forecast | A discrete event occurs or does not occur | BRICS announces a monetary unit by date X |
| Regime forecast | A macro state changes persistently | USD reserve share trends below a threshold |
| Rotation forecast | Capital moves between assets/sectors | Value/healthcare/industrials gain flows vs growth |
| Narrative forecast | A public narrative saturates or reverses | Cover story marks late-stage consensus |
| Falsifier forecast | A thesis-breaking signal appears | Reserve stress fails to appear by review date |

## Required Output Shape

Every Prediction Attempt Ω record must include:

- `id`
- `question`
- `createdAt`
- `horizonStart`
- `horizonEnd`
- `baseRate`
- `scenarios`
- `probabilitySum`
- `confidence`
- `evidenceIds`
- `confirmers`
- `falsifiers`
- `forbiddenInterpretations`
- `reviewCadence`
- `postMortemStatus`

## Scoring Discipline

Post-window reviews use:

- Directional hit/miss.
- Calibration error.
- Evidence quality review.
- Miss reason: bad data, wrong base rate, narrative bias, timing error, exogenous shock or ambiguous outcome.
- Lesson retained for future forecasts.

## Safety Rules

Prediction Attempt Ω must never:

- produce BUY, SELL, REDUCE or portfolio action by itself;
- override Business Quality Ω, Valuation Ω or Thesis Falsifier Gate;
- convert symbolic interpretation into fact;
- retrofit probabilities after the outcome;
- hide failed forecasts;
- use a single cover, image, rumor or social post as enough evidence;
- treat low-probability scenarios as certainty because they are vivid.

## Phoenix 2026 Application

The Phoenix 2026 watch can now generate a formal prediction attempt only if the question is precise.

Allowed example:

"Between 2026-08-09 and 2026-12-31, does the 2026 Big Mac / currency cover coincide with at least two independent monetary-regime stress signals from the frozen confirmer list?"

Forbidden example:

"The Economist secretly predicted the exact future."

## Mobile-First Rule

The mobile app should expose this layer as a compact prediction card:

- question;
- scenarios;
- probability;
- horizon;
- active confirmers/falsifiers;
- next review date;
- final score once closed.

The UI should emphasize uncertainty, not spectacle.