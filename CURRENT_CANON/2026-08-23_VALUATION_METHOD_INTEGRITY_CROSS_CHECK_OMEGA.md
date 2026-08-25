# VALUATION METHOD INTEGRITY + EXTERNAL FAIR VALUE CROSS-CHECK Ω

**Status:** ACTIVE · CANONICAL  
**Effective:** 2026-08-23  
**Implementation:** `src/atlas/algorithm/valuation-method-integrity-omega.ts`

## Why this calibration exists

A cross-provider audit performed against the 21-name InvestingPro watchlist snapshot for the week ended 2026-08-21 showed that a vendor fair-value label can be directionally useful while remaining structurally non-equivalent to ATLAS Expected Return.

InvestingPro Fair Value is a multi-model estimate. Its own methodology may combine DCF, comparable-company and dividend approaches, while excluding methods that are inappropriate for a given security. This is useful evidence about valuation assumptions, but it is not an ATLAS target price, not a forecast CAGR and not an investment verdict.

## Constitutional laws

`EXTERNAL FAIR VALUE != ATLAS FAIR VALUE != EXPECTED RETURN`

`BUSINESS QUALITY != EXPECTED RETURN`

`PRICE DECLINE != UNDERVALUATION`

`CHEAP MULTIPLE != ECONOMIC PROOF`

`MODEL FIT PRECEDES MODEL OUTPUT`

`NORMALIZED OWNER ECONOMICS > REPORTED OPTICAL EARNINGS`

## Placement

Canonical valuation sequence:

`PRICE/LISTING/CURRENCY/UNIT INTEGRITY -> ECONOMIC PROOF -> VALUATION METHOD INTEGRITY -> ATLAS VALUATION -> EXTERNAL FAIR VALUE CROSS-CHECK -> EXPECTED RETURN Bear/Base/Bull -> COMPETITION FOR CAPITAL`

The new module does not replace `VALUATION_OMEGA`. It determines whether the valuation method and accounting inputs are fit for use, and it uses external fair values only as a diagnostic cross-check.

## Gate V0 — Price identity prerequisite

Valuation cannot execute canonically unless primary listing, currency, quotation unit and current price have already passed the existing Universal Market Tape / Price Integrity controls.

If this gate fails:

`P0 FAIL -> VALUATION FAIL -> EXPECTED RETURN FAIL -> RANK DELETE`

No external provider label can repair a failed P0.

## Gate V1 — Business archetype determines valuation method

### Banks
Use primarily:
- P/TBV;
- ROTCE versus cost of equity;
- CET1 / capital return capacity;
- credit-cost normalization;
- NII sensitivity.

Do not use generic corporate DCF or generic FCF yield as primary valuation evidence.

### Insurers
Use primarily:
- P/BV or P/TBV where appropriate;
- BVPS/TBVPS compounding;
- combined ratio;
- premium growth;
- investment income;
- catastrophe-cycle normalization.

Generic FCF yield is not a primary insurer metric.

### Energy / MLP
Use primarily:
- mid-cycle commodity assumptions;
- normalized FCF / EV-EBITDA / NAV where appropriate;
- leverage;
- reserve or contract duration;
- distribution coverage for partnerships.

Spot-commodity P/E cannot be the base case by itself.

### SaaS / software
Use primarily:
- EV/FCF and FCF/share;
- ARR/revenue growth;
- RPO and NRR where available;
- SBC and net dilution;
- margin trajectory and cash conversion.

Reported FCF without an SBC/dilution check is incomplete owner-economics evidence.

### Consumer
Use normalized P/E/FCF together with:
- comparable sales / regional demand;
- gross margin;
- inventory;
- brand health and pricing power.

A low trailing P/E cannot override deteriorating demand and margins.

### Homebuilders
Use normalized P/E and P/B together with:
- orders;
- cancellations;
- incentives and gross margin;
- inventory/land;
- returns on capital through the housing cycle.

### Other operating companies
DCF, EV/FCF, EV/EBIT, normalized P/E and FCF/share may be used when economically appropriate and after the normalization gates below.

## Gate V2 — Pre-Proof veto

If meaningful revenue/economic proof is absent, ATLAS disables intrinsic-value scoring.

Allowed state:

`PRE_PROOF -> OPTIONALITY_SCENARIO_ONLY`

A pre-revenue or effectively pre-revenue company may be investigated as optionality/speculation, but cannot receive a canonical undervaluation score merely because a vendor model says "undervalued".

Canonical audit example: STKH reported no revenue for FY2025 and recurring losses. Its external undervaluation label therefore does not pass Economic Proof.

## Gate V3 — Earnings Quality normalization

If a non-recurring or non-operating item represents at least 10% of pretax income, or otherwise materially changes EPS/margins, trailing valuation metrics must be normalized before entering Expected Return.

Examples identified in the calibration sample include:
- PTC: material divestiture gain;
- CLS: material total-return-swap fair-value contribution to reported EPS;
- AAPL: material tariff-refund benefit to the reported quarter;
- GOOGL: material non-operating/unrealized investment gains affecting net income.

The exact adjustment must come from traceable evidence. ATLAS never fabricates an adjusted EPS.

## Gate V4 — ROIC sanity

If reported/calculated ROIC exceeds 100% or invested capital is non-positive / economically tiny, mark:

`ROIC_NON_COMPARABLE`

Do not award quality/return points mechanically from the raw percentage. Replace it with more meaningful evidence such as incremental returns, FCF/share, margins, reinvestment economics or business-specific return measures.

## Gate V5 — Cash-conversion regime shift

If current CAPEX/revenue is at least 1.5x the three-year median, mark:

`CASH_CONVERSION_REGIME_SHIFT`

Historical FCF conversion cannot be extrapolated mechanically. Expected Return must use explicit scenarios for whether the new capital intensity monetizes.

This is particularly relevant for hyperscalers and AI infrastructure where accounting earnings can remain strong while owner cash conversion changes sharply.

## Gate V6 — Dilution-aware owner economics

Track at minimum:
- diluted share count YoY and QoQ;
- SBC;
- buybacks;
- FCF/share;
- net share-count change.

Reported FCF is retained, but it cannot be interpreted as owner return without per-share dilution evidence.

ATLAS does not yet subtract SBC mechanically from FCF as a universal canonical formula. That would require a separate recalibration sample and must pass Model Learning & Governance Ω.

## Gate V7 — Economic momentum / reversion burden

A superficially cheap multiple cannot override a deteriorating operating trajectory.

When growth guidance is flat/negative or decelerating materially and gross/operating margin is simultaneously deteriorating materially, terminal growth/multiple assumptions must be capped until stabilization is demonstrated.

LULU is the calibration example: low valuation multiples coexist with weaker Americas demand, large gross-margin compression and materially lower operating profitability. The vendor's large upside estimate is therefore not accepted mechanically.

## External Fair Value Cross-Check Ω

External fair-value observations are stored with:
- provider;
- as-of date;
- verified current price used by the provider where recoverable;
- provider fair-value gap;
- uncertainty/confidence when supplied;
- evidence ID / source;
- methodology class when known.

### Direct score weight

`EXTERNAL FAIR VALUE DIRECT SCORE WEIGHT = 0`

It is never added to ATLAS points and is never averaged mechanically with ATLAS Fair Value.

### Agreement

Directional agreement may raise confidence in the need for further valuation work, but does not create a BUY.

### Divergence

Material divergence triggers an assumption audit across:
- revenue/ARR growth;
- margins;
- cash conversion;
- CAPEX;
- SBC/dilution;
- balance sheet;
- normalized cycle assumptions;
- terminal multiple/growth;
- sector-specific valuation method.

### Time horizon

A provider fair-value gap must not be annualized into ATLAS CAGR unless the provider explicitly supplies a compatible horizon and the conversion is independently justified.

## 2026-08-21 calibration sample — outcome classes

### Strongest convergence / deep-audit priority
- PTC — attractive normalized FCF economics; external magnitude requires haircut/normalization of divestiture gain.
- BILL — strong cash valuation and share shrink; SBC/GAAP/credit-quality checks remain mandatory.
- DXCM — improving margins/cash economics; external upside direction plausible, magnitude not automatically accepted.
- BAC — positive valuation signal, but only under a bank-specific model.
- ARLP — attractive distributable cash economics with commodity/terminal-risk normalization.
- OXY — improving balance sheet and cash economics, with commodity sensitivity retained.

### Fair / quality but price-dependent
- META;
- CLS;
- CVX;
- DHI;
- AXP;
- CB;
- GOOGL.

### Wait / demanding / reversion burden
- SNOW;
- TTAN;
- MANH;
- AAPL;
- KO;
- LULU.

### Economic Proof failure / turnaround proof pending
- STKH — PRE_PROOF; no intrinsic-value score.
- IQE — turnaround/proof pending; financing and operating recovery must be demonstrated.

These classes are calibration outputs, not immutable recommendations. They must be refreshed when price, fundamentals, guidance or valuation changes.

## Model Learning & Governance decision

This audit does **not** authorize a change to core ATLAS weights.

Reason: the sample contains 21 securities across multiple non-comparable archetypes and therefore does not satisfy the current fail-closed recalibration requirement of at least 20 comparable observations plus at least 5 repetitions of a stable error pattern.

Approved changes are structural integrity gates and normalization rules. Weight recalibration remains blocked until the canonical Recalibration Gate passes.

## Firecrawl evidence-acquisition calibration

For valuation/fundamental research, acquisition should follow:

`MAP targeted site discovery -> targeted SCRAPE/CRAWL -> structured JSON/EXTRACT -> Evidence Integrity -> ATLAS engines -> CHANGE TRACKING -> re-audit only on material changes`

Use Agent only when URLs are unknown or autonomous multi-source navigation is genuinely needed. Known primary URLs should prefer deterministic scrape/JSON extraction because they are cheaper and easier to audit.

Firecrawl remains acquisition infrastructure only. Agent/Search/Map rank, extracted JSON and change diffs are not investment evidence until source authority, period, units, freshness and contradictions pass Evidence Director Ω.

## Fail-closed invariants

- External valuation cannot repair failed price integrity.
- External fair value never contributes direct score points.
- A vendor "undervalued" label cannot override failed Economic Proof.
- Wrong archetype/model selection blocks canonical valuation.
- Material one-offs cannot enter trailing P/E/ROIC unadjusted.
- Pathological ROIC cannot earn automatic quality points.
- Capital-intensity regime shifts require explicit cash-conversion scenarios.
- Fair-value disagreement triggers investigation, not averaging.
- Insufficient comparable calibration sample means core weights remain unchanged.
