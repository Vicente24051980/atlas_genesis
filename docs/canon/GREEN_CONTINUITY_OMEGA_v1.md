# GREEN CONTINUITY Ω v1.3

Status: CANONICAL FIRST ANALYTICAL ENGINE
Effective correction: 2026-08-21
Scope: all listed-equity tickers analyzed by ATLAS Ω

## Ordering correction

GREEN CONTINUITY Ω is the **first analytical motor** for every listed ticker after evidence/source/quantitative/temporal integrity and ticker identity normalization.

Canonical order:

`INPUT → EVIDENCE/SOURCE/QUANT/TEMPORAL INTEGRITY → GLOBAL DISCOVERY/IDENTITY → GREEN CONTINUITY Ω → GREEN PULSE/BREADTH/RELATIVE GREEN → ALL OTHER APPLICABLE ATLAS ENGINES → CONTRADICTIONS → EXPECTED RETURN → FALSIFIERS Ω → INVESTMENT COMMITTEE Ω → ACTION`

GREEN must therefore run before Principal Ω, Successor Detection Ω, Business Quality Ω, Growth Ω, CAPEX Productivity Ω, Economic Proof Ω, Valuation Ω, Money Rotation Ω and specialized engines.

## Critical non-termination rule

Being below GREEN 4/5 **does not stop the audit**.

Every ticker continues through all registered/applicable ATLAS engines. GREEN remains visible as its own independent market-behavior evidence stream and cannot be rewritten by later engines.

- `GREEN 5/5` = strongest continuity class.
- `GREEN 4/5` = continuity-qualified class; failed horizon recorded explicitly.
- `GREEN 3/5` = weak/mixed continuity; full audit continues.
- `GREEN 0–2/5` = poor continuity; full audit continues.
- `INSUFFICIENT_HISTORY / QUARANTINE` = data-state warning; other engines continue where their own evidence is sufficient.

GREEN 4/5 or 5/5 is the preferred continuity condition for ranking/entry consideration, but it is not permission to skip the rest of ATLAS and it is not an early-termination switch for research.

## Mission

Measure multi-horizon price continuity for every ticker without confusing price behavior with business quality, valuation, defensiveness, institutional flow or final portfolio action.

For every ticker with sufficient history, calculate exactly:

- 1 week;
- 1 month;
- 3 months;
- 1 year;
- total / since inception (TOTAL/MAX).

`1D` is not one of the five GREEN CONTINUITY windows. It belongs to GREEN Pulse / short-horizon behavior, which runs immediately after GREEN CONTINUITY Ω.

All five continuity windows must use one synchronized regular-market cut.

## GREEN 5/5 rule

`GREEN_5OF5 = (1W > 0) AND (1M > 0) AND (3M > 0) AND (1Y > 0) AND (TOTAL/MAX > 0)`

A 5/5 result is **positive continuity evidence**.

It is **not**:

- an automatic BUY;
- proof of business quality;
- proof of institutional accumulation;
- proof of attractive valuation;
- a reason to ignore a confirmed falsifier.

A ticker can fail GREEN 5/5 and still reveal material Economic Proof, valuation, recovery, optionality, capital-rotation or falsifier evidence in later engines. A ticker can be GREEN 5/5 and still receive WATCH or REJECT because of valuation, economics, risk or a confirmed falsifier.

## State classification

### PASS_5OF5
All five windows are positive. Committee impact: `POSITIVE`.

### PASS_4OF5
Exactly four of five windows are positive. Committee impact: `POSITIVE_WITH_CAUTION`. The failed horizon must be recorded. If the failed horizon is 3M, 1Y or TOTAL, additionally preserve the structural-trend warning.

### MIXED_3OF5
Exactly three windows are positive. Committee impact: `CAUTION`. Full audit continues.

### WEAK_0_TO_2OF5
Zero, one or two windows are positive. Committee impact: `NEGATIVE`. Full audit continues.

### SHORT_HORIZON_BREAK
3M, 1Y and TOTAL remain positive, but 1W or 1M is non-positive. Committee impact: `CAUTION`.

### STRUCTURAL_TREND_BREAK
Any of 3M, 1Y or TOTAL is non-positive. Committee impact: `NEGATIVE` for GREEN Ω only.

### INSUFFICIENT_HISTORY
A full 1Y price history is unavailable. Other engines continue where independently supported.

### QUARANTINE
The five windows are not aligned to the exact same market cut, provenance is incomplete, `expectedMarketCut` is absent, or any required horizon cannot be reconciled to that expected regular-session cut. A quarantined result must not be ranked or promoted.

### FALSIFIER_ALERT
A confirmed structural business falsifier is present in the evidence packet. GREEN Ω escalates it to Falsifiers Ω / Red Team.

## Ranking

Continuity strength score:

- 1W percentile: 10%;
- 1M percentile: 20%;
- 3M percentile: 30%;
- 1Y percentile: 35%;
- TOTAL percentile: 5%.

Primary continuity preference is ordered first by GREEN count and then by strength score, while retaining explicit information about which horizon failed.

`QUARANTINE` and `INSUFFICIENT_HISTORY` are not eligible for GREEN ranking/promotion.

## Universal ticker rule

Every ticker analyzed by ATLAS must receive a recorded result from GREEN CONTINUITY Ω when the required price history exists.

After GREEN, the same ticker must continue independently through Quality, Economic Proof, Valuation / Implied Return, CAPEX Productivity, Moat, Institutional Rotation, Money Rotation, Defensive, Macro / Regime, specialized engines, Falsifiers and Evidence Director according to the current engine registry.

An engine with no meaningful signal must return `NO_SIGNAL`, `NOT_APPLICABLE` or the equivalent explicit state; it must not be silently skipped when the registry requires execution.

## Defensive and regime separation

GREEN CONTINUITY Ω does not become more permissive or restrictive because the market regime is defensive, risk-on, inflationary or otherwise.

Defensive Ω is a separate transversal score applied to every ticker. Macro / Regime Ω is a separate context engine. Neither rewrites GREEN returns.

## Data integrity — v1.3 mandatory provenance gate

Every 1W, 1M, 3M, 1Y and TOTAL/MAX value must record:

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

The engine must additionally receive `expectedMarketCut` (`YYYY-MM-DD`). Every horizon `endDate` must exactly equal that cut and all five must share ticker, exchange and currency identity.

Missing provenance, a stale/misaligned end date, an unreconciled external performance table, or a non-synchronized cut forces `QUARANTINE`.

Premarket and aftermarket do not replace the synchronized regular-session cut unless a separate intraday mode explicitly defines that behavior.

A screenshot or first-party observation verifies only the horizons it actually displays. Missing horizons are never inferred from another source whose market cut cannot be reconciled.

## Calibration case — ETN 2026-08-21

User-provided evidence showed ETN 1W negative. Therefore PASS_5OF5 was logically impossible. A generic external performance table had been used with an incompatible/stale temporal cut, producing an erroneous 5/5 interpretation.

Correct v1.3 behavior: preserve the observed 1W failure; if 1M/3M/1Y/TOTAL cannot all be verified on the same expected regular-session cut with full provenance, return `QUARANTINE`. Do not substitute or infer.

## Final decision hierarchy

`TICKER → GREEN CONTINUITY Ω FIRST → ALL OTHER ATLAS ENGINES → EVIDENCE + CONTRADICTIONS → FALSIFIERS Ω → INVESTMENT COMMITTEE Ω → BUY / HOLD / WATCH / REJECT / NO OPPORTUNITY → EXECUTION`

No individual engine is allowed to promote its local state into the final portfolio recommendation.

## Supersession

This v1.3 correction supersedes all earlier language that:

- placed GREEN after another analytical motor;
- made GREEN below 4/5 terminate the full audit;
- treated GREEN as fundamental proof, verified institutional flow, or final recommendation authority;
- allowed stale, incomplete, inferred or temporally unreconciled performance data to generate a GREEN classification.

Historical GREEN amendments remain preserved, but where they conflict with v1.3, v1.3 controls current operation.
