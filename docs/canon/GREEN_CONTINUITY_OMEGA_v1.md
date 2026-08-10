# GREEN CONTINUITY Ω v1.0

Status: CANONICAL PRIMARY ENGINE
Date: 2026-08-10
Scope: ATLAS Ω ENTERPRISE — selection and portfolio maintenance

## Canonical change

GREEN CONTINUITY Ω becomes the principal ATLAS Ω engine for discovering, selecting and maintaining listed equities.

The former principal Business Quality / Growth / Moat / Financial Quality / Management / Valuation stack remains active, but its role changes to refinement, validation, ranking, conviction, valuation and risk control after the primary trend filter.

Good Companies Cheap Ω, Historical Dislocation / Burry Ω, Money Rotation Ω, Energy Rotation Ω and specialized engines remain independent refinement/context engines and must not overwrite one another.

## Mission

Find companies whose market trend is positive continuously across short, medium and long horizons, then use the rest of ATLAS Ω to determine which of those trends are supported by durable businesses, acceptable valuation, productive capital allocation and intact theses.

The engine is designed to keep winners while their multi-horizon trend remains intact instead of pruning them because of portfolio count, sector overlap or subjective diversification targets.

## Mandatory discovery order

1. GLOBAL DISCOVERY — ticker-first, broad and sector-agnostic.
2. Synchronize all price returns to the same regular-market cut.
3. Calculate 1 week, 1 month, 3 months, 1 year and total/since-inception returns.
4. Apply the GREEN CONTINUITY hard gate.
5. Rank surviving 5/5 GREEN securities by relative strength.
6. Apply Business Quality, Growth, CAPEX Productivity, Valuation, Risk, Money Rotation and specialized refinement layers.
7. Apply Decision Safety Gate and confirmed structural falsifiers.
8. Record the final decision in Decision Log Ω.

No quality, narrative, portfolio, sector-preference or watchlist filter may be used before ticker discovery and the primary trend calculation.

## Hard entry rule — 5/5 GREEN

A new listed-equity candidate passes GREEN CONTINUITY Ω only when all five windows are positive on the same synchronized market cut:

- 1 week > 0%
- 1 month > 0%
- 3 months > 0%
- 1 year > 0%
- total / since inception > 0%

Formula:

`PASS = (1W > 0) AND (1M > 0) AND (3M > 0) AND (1Y > 0) AND (TOTAL > 0)`

Any candidate with fewer than five positive windows is not a new BUY from this engine.

If a security lacks a complete 1-year listed history, classify `INSUFFICIENT_HISTORY` for GREEN CONTINUITY Ω. It may still be studied by another independent specialized engine.

## Ranking among 5/5 GREEN survivors

The hard gate is binary. Ranking is separate.

GREEN CONTINUITY strength score:

- 1 week relative-strength percentile: 10%
- 1 month relative-strength percentile: 20%
- 3 months relative-strength percentile: 30%
- 1 year relative-strength percentile: 35%
- total/since-inception relative-strength percentile: 5%

The score compares securities with the current discovery universe. Raw percentage returns are retained as evidence, but percentile ranking avoids allowing one extreme long-term return to dominate every other horizon.

3M + 1Y receive 65% of ranking weight because they represent the core persistent trend. 1W and 1M measure acceleration and recent continuity.

## Portfolio maintenance rule

For an existing position purchased or maintained by GREEN CONTINUITY Ω:

### HOLD — 5/5 GREEN

If all five horizons remain positive:

`HOLD`

A 5/5 GREEN position cannot become SELL because of:

- portfolio-size targets;
- arbitrary pruning;
- sector overlap;
- another company being similar;
- diversification preferences;
- a single red daily session;
- subjective belief that the position has already risen too much.

This is a constitutional rule.

### WATCH — short-horizon break only

If 3M, 1Y and TOTAL remain positive but 1W or 1M turns negative:

`WATCH`

Short-horizon noise does not automatically liquidate a structurally positive trend.

### SELL — structural trend failure

GREEN CONTINUITY Ω emits SELL when an existing position fails any structural trend horizon:

- 3M <= 0%; or
- 1Y <= 0%; or
- TOTAL <= 0%;

A confirmed structural business falsifier may also force SELL even if price continuity remains green.

## Structural falsifier override

GREEN CONTINUITY Ω is the principal selector, not a license to ignore business collapse.

A confirmed structural falsifier supported by sufficient evidence overrides price strength. Examples include:

- fraud;
- permanent moat destruction;
- persistent ROIC destruction;
- structural FCF impairment;
- materially destructive capital allocation;
- structural regulatory impairment;
- demonstrated loss of the economic engine supporting the thesis.

Ordinary volatility, valuation discomfort, headlines, isolated guidance misses or sector overlap are not structural falsifiers by themselves.

## Role of the other ATLAS engines

### Business Quality Ω
Refines whether the 5/5 GREEN company is economically durable and deserves higher conviction.

### Growth Ω
Tests whether market strength is supported by sustainable operating growth.

### CAPEX Productivity Ω
Tests whether reinvestment is creating economic value rather than merely increasing scale.

### Valuation Ω
Refines entry priority, sizing and expected return. It does not mechanically turn a 5/5 GREEN holding into SELL without a valid exit condition.

### Risk Ω
Measures balance-sheet, regulatory, concentration, geopolitical and thesis-specific risk.

### Money Rotation Ω / Energy Rotation Ω
Provide regime, flows and capital-rotation context and help explain where leadership is emerging or weakening.

### Good Companies Cheap Ω
Independent engine for quality companies trading at depressed valuations. It can hold names that fail GREEN CONTINUITY because its mission is different.

### Historical Dislocation / Burry Ω
Independent contrarian engine for deeply dislocated but structurally intact businesses. It can deliberately study securities that are red in GREEN CONTINUITY.

### Specialized engines
Refine sector- or thesis-specific evidence. They cannot erase engine provenance.

## Engine independence

Every portfolio position must retain the engine or engines that justify it.

A security can simultaneously be:

- PASS in GREEN CONTINUITY Ω;
- strong in Business Quality Ω;
- R5 in Money Rotation Ω;
- expensive in Valuation Ω.

These are separate observations, not one averaged narrative.

A security can fail GREEN CONTINUITY Ω and remain valid in Historical Dislocation Ω. The failure of one independent engine does not rewrite the output of another.

## Decision hierarchy

For normal listed-equity discovery:

`GLOBAL DISCOVERY -> GREEN CONTINUITY Ω -> REFINEMENT ENGINES -> DECISION SAFETY -> DECISION LOG`

GREEN CONTINUITY Ω owns the primary trend state.

Refinement engines may:

- rank;
- raise or lower conviction;
- alter sizing;
- identify valuation risk;
- detect business falsifiers;
- add regime context;
- route a security to another independent engine.

Refinement engines may not generate an arbitrary SELL solely to reduce position count or eliminate sector overlap.

## Data integrity

Every 1W, 1M, 3M, 1Y and TOTAL value used in a decision must record:

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

All five windows must use the same market cut.

Premarket and aftermarket prices do not replace a regular-session close unless the engine explicitly introduces a separate intraday mode in a later version.

## Mobile-first output

The mobile card for each candidate should expose at minimum:

`TICKER | 1W | 1M | 3M | 1Y | TOTAL | GREEN COUNT | SCORE | DECISION | REFINEMENT FLAGS`

Visual priority:

- 5/5 GREEN badge;
- strength score;
- BUY/HOLD/WATCH/SELL state;
- structural falsifier flag;
- refinement-engine badges.

## Canonical examples

ROST, FAST and RTX are visual examples of the type of multi-horizon positive continuity this engine is designed to detect. They are examples of pattern shape, not permanent automatic BUY declarations; all live decisions require current synchronized data.

## Supersession

This document supersedes the earlier research-only three-horizon momentum note as the canonical primary listed-equity trend engine.

The earlier `Día > 0 + 3M > 0 + 1A > 0` screener remains historical research context and may still be used as a narrower diagnostic, but it no longer defines the principal ATLAS Ω selection architecture.
