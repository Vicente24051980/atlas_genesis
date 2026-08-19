# GREEN CONTINUITY Ω v1.1

Status: CANONICAL TRANSVERSAL DIAGNOSTIC ENGINE
Effective correction: 2026-08-19
Scope: all listed-equity tickers analyzed by ATLAS Ω

## Correction

The former v1.0 language that made GREEN CONTINUITY Ω the principal selector and a mandatory portfolio entry/exit gate is superseded.

GREEN CONTINUITY Ω remains mandatory to **run**, but its output is one independent evidence stream among the full ATLAS engine set. It does not own the final recommendation.

Final recommendation authority belongs only to **Investment Committee Ω** after the ticker has passed through all registered ATLAS engines. Falsifiers Ω retains its independent veto under the Investment Committee canon.

## Mission

Measure multi-horizon price continuity for every ticker without confusing price behavior with business quality, valuation, defensiveness, institutional flow or final portfolio action.

For every ticker with sufficient history, calculate:

- 1 week;
- 1 month;
- 3 months;
- 1 year;
- total / since inception.

All windows must use one synchronized regular-market cut.

## GREEN 5/5 rule

`GREEN_5OF5 = (1W > 0) AND (1M > 0) AND (3M > 0) AND (1Y > 0) AND (TOTAL > 0)`

A 5/5 result is **positive continuity evidence**.

It is **not**:

- an automatic BUY;
- a mandatory gate for a committee BUY;
- proof of business quality;
- proof of institutional accumulation;
- proof of attractive valuation;
- a reason to ignore a confirmed falsifier.

A ticker can fail GREEN 5/5 and still receive BUY from Investment Committee Ω if the complete evidence packet justifies it. A ticker can be GREEN 5/5 and still receive WATCH or REJECT because of valuation, economics, risk or a confirmed falsifier.

## State classification

### PASS_5OF5

All five windows are positive.

Committee impact: `POSITIVE`.

### SHORT_HORIZON_BREAK

3M, 1Y and TOTAL remain positive, but 1W or 1M is non-positive.

Committee impact: `CAUTION`.

This is a continuity warning. It is not a fundamental falsifier and does not trigger an automatic SELL.

Example canonical correction, 19-ago-2026:

- **ETN:** 1W = -6.22% from 12-ago close 459.96 to 18-ago close 431.33; therefore GREEN 5/5 → GREEN 4/5. Magnitude makes the price-continuity warning material, but no new corporate falsifier was identified in the evidence packet.
- **JCI:** 1W = -2.04% from 12-ago close 152.79 to 18-ago close 149.68; therefore GREEN 5/5 → GREEN 4/5. The continuity warning is milder and no new corporate falsifier was identified in the evidence packet.

The statement that the deterioration is “technical / regime-driven” must be stored as **INTERPRETATION**, not FACT, unless causal evidence is independently verified.

### STRUCTURAL_TREND_BREAK

Any of 3M, 1Y or TOTAL is non-positive.

Committee impact: `NEGATIVE`.

This is a structural **price-trend** warning for GREEN Ω only. It is passed to Investment Committee Ω; GREEN Ω does not issue the final SELL/REJECT.

### INSUFFICIENT_HISTORY

A full 1Y price history is unavailable. Other engines continue to run and record their outputs.

### QUARANTINE

The five windows are not aligned to the same market cut or provenance is insufficient.

### FALSIFIER_ALERT

A confirmed structural business falsifier is present in the evidence packet. GREEN Ω escalates it to Falsifiers Ω / Red Team. The independent veto belongs to Falsifiers Ω, not GREEN Ω.

## Ranking

The continuity strength score remains:

- 1W percentile: 10%;
- 1M percentile: 20%;
- 3M percentile: 30%;
- 1Y percentile: 35%;
- TOTAL percentile: 5%.

The score ranks price continuity only. It does not rank final investment attractiveness.

## Universal ticker rule

Every ticker analyzed by ATLAS must receive a recorded result from GREEN CONTINUITY Ω when the required price history exists.

The same ticker must also be passed independently through Quality, Economic Proof, Valuation / Implied Return, CAPEX Productivity, Moat, Institutional Rotation, Money Rotation, Defensive, Macro / Regime, specialized engines, Falsifiers and Evidence Director according to the current engine registry.

An engine with no meaningful signal must return `NO_SIGNAL`, `NOT_APPLICABLE` or the equivalent explicit state; it must not be silently skipped when the registry requires execution.

## Defensive and regime separation

GREEN CONTINUITY Ω does not become more permissive or restrictive because the market regime is defensive, risk-on, inflationary or otherwise.

Defensive Ω is a separate transversal score applied to every ticker. Macro / Regime Ω is a separate context engine. Neither rewrites GREEN returns.

## Final decision hierarchy

`TICKER → ALL ATLAS ENGINES → EVIDENCE + CONTRADICTIONS → FALSIFIERS Ω → INVESTMENT COMMITTEE Ω → BUY / HOLD / WATCH / REJECT / NO OPPORTUNITY → EXECUTION`

No individual engine is allowed to promote its local state into the final portfolio recommendation.

## Data integrity

Every 1W, 1M, 3M, 1Y and TOTAL value must record:

- ticker and canonical identifier;
- exchange;
- currency;
- start date;
- end date;
- regular-market close used;
- corporate-action adjustment policy;
- data source;
- capturedAt / asOf;
- calculation method.

Premarket and aftermarket do not replace the synchronized regular-session cut unless a separate intraday mode explicitly defines that behavior.

## Supersession

This v1.1 correction supersedes all v1.0 language that described GREEN CONTINUITY Ω as the principal ATLAS portfolio selector or as an automatic BUY/HOLD/SELL authority.
