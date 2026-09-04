# ATLAS Ω — EXPECTATION GAP Ω STANDARDIZATION v1.1

**Effective:** 2026-09-04  
**Status:** ACTIVE / VALUATION SUBMODULE / DIRECT SCORE MIGRATION DEFERRED  
**Authority:** additive clarification under ATLAS Ω ENTERPRISE v4.0.  
**Implementation:** `src/atlas/algorithm/expectation-gap-omega.ts`

## Resolution

The 4-Sep methodological review is preserved, but the proposed wording is technically hardened before production use.

**Approved objective:** make Expectation Gap Ω explicit, reproducible and auditable.

**Not approved as-is:** a mechanical `-15 to +10` post-score adjustment based on a single fixed 8% WACC / 2.5% terminal-growth reverse DCF and D&A-as-maintenance-CAPEX proxy.

The reason is not philosophical. The current ATLAS canon already contains Expectation Gap Ω inside Leadership Bias Control and Valuation Ω already requires reverse DCF and asks what growth/economics are discounted in price. Business Quality Ω also already assigns 10% to Valuation. Therefore the correct change is **standardization of an existing valuation concept**, not creation of a new independent business-quality dimension.

## Corrections to the draft proposal

### 1. Existing-canon correction

It is incorrect to state that ATLAS lacks valuation-relative-to-expectations.

Current v4.0 already contains:

- `Expectation Gap Ω` in Leadership Bias Control.
- `Valuation Ω` with DCF, FCF Yield, EV/FCF, EV/EBITDA, PEG, historical/sector multiples and reverse DCF.
- `Implied Return Ω` and Expected Return 3–6Y.
- Business Quality Ω with a 10% Valuation component.

Accordingly, this amendment **does not add a seventh independent quality factor** and does not double count Valuation.

### 2. Valuation-basis integrity

Reverse DCF must match numerator, valuation base and discount rate:

- **EV / FCFF -> WACC**.
- **Market cap / FCFE -> cost of equity**.

Using market capitalization with FCFF and WACC is methodologically inconsistent and is blocked by the implementation.

### 3. No universal 8% WACC

`8%` can be a research sensitivity anchor, not a universal company discount rate.

Each production audit must document an economically coherent rate or scenario range appropriate to currency, leverage, business risk and valuation basis. Sensitivity must remain visible.

### 4. Terminal growth

`2.5%` may be a default sensitivity anchor when economically plausible, but it is not universal. Terminal growth must remain below the applicable discount rate and must be compatible with nominal currency/economic assumptions.

### 5. Maintenance CAPEX normalization

D&A is only a **proxy**, not maintenance CAPEX truth.

For capital-intensive businesses, `D_AND_A_PROXY` is explicitly low-confidence. Preferred hierarchy:

1. company-disclosed maintenance CAPEX when credible;
2. cycle-normalized maintenance CAPEX from asset economics;
3. reported FCF with explicit growth-CAPEX bridge;
4. D&A proxy only as a sensitivity / fallback.

No high-capital-intensity company may receive a production score adjustment solely from a D&A proxy.

### 6. Achievable growth is forward, not historical

Expectation Gap Ω is:

`Reasonably Achievable Forward FCF Growth - Implied FCF Growth`

Historical CAGR is evidence, not the answer. A historical-only growth assumption is automatically low-confidence.

### 7. Score mapping remains unvalidated

The proposed score range `-15 to +10` is preserved only as a **research band**. No direct ATLAS score delta is applied in v1.1 because the mapping from growth-gap percentage points to score points has not yet passed broad out-of-sample validation.

`directAtlasScoreDelta = 0` until Model Learning Governance Ω approves a calibrated mapping.

## Operational state

Expectation Gap Ω is now operational as a standardized Valuation Ω diagnostic.

Required fields:

- valuation basis: `EV_FCFF` or `MARKET_CAP_FCFE`;
- cash-flow basis: matching FCFF or FCFE;
- discount-rate kind: WACC or cost of equity;
- starting normalized cash flow;
- discount rate and terminal growth;
- horizon;
- implied growth solved by reverse DCF;
- reasonably achievable forward growth;
- growth-source class;
- normalization method;
- capital intensity;
- expectation gap;
- confidence;
- sensitivity / falsifiers.

States:

`POSITIVE_WIDE / POSITIVE / NEUTRAL / NEGATIVE / NEGATIVE_SEVERE / EVIDENCE_PENDING`.

## Relation to Dividendology Extraction Ω

Dividendology can corroborate the usefulness of reverse expectations, but it does not own the concept and receives no authority weight. `DIVIDENDOLOGY_EXTRACTION_OMEGA_V1` remains diagnostic and anti-double-count protected.

## Governance interpretation of the 4-Sep vote

Vicente's affirmative decision is recorded as approval of the **objective: standardize Expectation Gap Ω**.

The technical implementation is hardened by Valuation Method Integrity and Model Learning Governance before any permanent score migration.

If the committee has two formal voting members, `2/2` is unanimity of the constituted committee. It should not be described as `2/3` unless a third formal voting seat actually exists.

## Non-retroactivity

No historical published score is silently rewritten. Existing scores remain versioned artifacts. New audits may report the standardized Expectation Gap diagnostic immediately; a future direct score mapping, if approved, begins only from its own effective version/date.

## Out-of-sample gate for direct scoring

Before any non-zero score adjustment:

1. timestamped ex-ante dataset;
2. enough winners and failures;
3. survivorship control;
4. multiple sectors and capital-intensity regimes;
5. company-appropriate discount-rate methodology;
6. sensitivity tests;
7. incremental information beyond existing Valuation Ω / Expected Return Ω;
8. improved selection/risk outcomes out of sample;
9. calibration of score-point mapping;
10. Model Learning Governance approval.

## Decision authority

Expectation Gap Ω v1.1 can influence valuation interpretation, ranking discussion and audit priority, but **cannot by itself**:

- create BUY/SELL;
- override Falsifier Veto;
- override canonical Expected Return;
- create a second valuation weight;
- apply `-15/+10` to the production score;
- use a fixed universal WACC;
- use D&A proxy as unquestioned maintenance CAPEX.
