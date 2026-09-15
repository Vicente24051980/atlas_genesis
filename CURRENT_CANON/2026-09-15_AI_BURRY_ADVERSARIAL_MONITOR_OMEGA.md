# AI BURRY ADVERSARIAL MONITOR Ω v1.0

**Status:** CURRENT_CANON / ACTIVE / E5 CONTROL + E6 ASSURANCE  
**Effective:** 2026-09-15  
**Implementation:** `src/atlas/algorithm/ai-burry-adversarial-monitor-omega.ts`  
**Tests:** `src/atlas/algorithm/ai-burry-adversarial-monitor-omega.test.ts`

## 0. Purpose

Turn Michael Burry's AI-capital critique into a falsifiable adversarial monitor without promoting an external narrative into thesis truth.

The module tests whether AI infrastructure is showing simultaneous deterioration in asset economics, utilization, investment appetite, funding quality and monetization. It cannot trade automatically and has zero direct structural-score weight.

## 1. Governance

Canonical distinction:

`TRIGGER ≠ FALSIFIER`

One negative datapoint, one bearish investor, one accounting estimate, one GPU rental quote or one market drawdown cannot change the structural AI thesis by itself.

The structural AI thesis remains `ACTIVE` unless the composite rule below is satisfied with traceable evidence.

This monitor may emit only:
- `ACTIVE`
- `REVIEW_EXTRAORDINARY`

It cannot directly emit `MODIFIED` or `RETIRED`; those require a thesis audit and human judgment under Atlas governance.

## 2. Eight monitored signals

1. `GPU_RENTAL_PRICE`
   - GREEN: verified broad/channel-normalized price change above -20%.
   - AMBER: verified broad decline of at least 20%.
   - RED: verified broad decline of at least 40%.
   - A single marketplace/vendor quote is `UNKNOWN`, not industry evidence.

2. `GPU_UTILIZATION`
   - GREEN: stable/rising.
   - AMBER: mild decline.
   - RED: persistent decline.

3. `ENERGY_BACKLOG`
   - GREEN: growing.
   - AMBER: flat/slowing.
   - RED: cancellations or absolute decline.

4. `HYPERSCALER_CAPEX`
   - GREEN: growing and fundable.
   - AMBER: downward revisions.
   - RED: generalized cuts.

5. `FCF_CAPEX_FUNDING`
   - GREEN: predominantly self-funded.
   - AMBER: deteriorating funding quality.
   - RED: debt-dependent expansion.

6. `ROI_MONETIZATION`
   - Reuses `AI_CAPITAL_EFFICIENCY_GATE_OMEGA` rather than inventing a duplicate ROIC engine.
   - GREEN requires `VALUE_CREATION` plus monetization where demand expansion outruns price compression.
   - AMBER covers neutral/mixed economics.
   - RED if existing capital-efficiency evidence shows `VALUE_DESTRUCTION` or AI monetization is deteriorating.

7. `GPU_ECONOMIC_LIFE`
   - GREEN: verified economic life >= 5 years.
   - AMBER: >3 and <5 years.
   - RED: <=3 years.
   - Accounting useful life is not accepted as proof of economic life.

8. `IMPAIRMENTS`
   - GREEN: normal/non-abnormal.
   - AMBER: isolated.
   - RED: generalized acceleration.

## 3. Composite falsifier rule

Open `REVIEW_EXTRAORDINARY` only when all conditions are true:

- at least **3 RED signals**;
- at least **1 RED core signal** among:
  - `GPU_UTILIZATION`
  - `HYPERSCALER_CAPEX`
  - `ROI_MONETIZATION`
- persistence for at least **2 quarters**;
- traceable evidence is available.

If three RED signals exist but none is core, remain `ACTIVE` and open RF2 monitoring.

If the breadth condition is met for less than two quarters, remain `ACTIVE` and open RF2 monitoring.

No automatic BUY or SELL is permitted.

## 4. Why the core-signal gate exists

The purpose is to prevent false positives from second-order symptoms.

Examples:
- GPU rental prices can fall because performance-per-dollar improves while demand grows.
- Energy-equipment backlog can slow because supply capacity expands rather than AI demand collapsing.
- Isolated impairments can reflect company-specific execution.

A structural thesis review therefore requires deterioration in demand/utilization, forward CAPEX or realized economic return.

## 5. Macro funding stress is separate

`MACRO_AI_FUNDING_STRESS_OMEGA_V1` is implemented in the same code module but is logically separate from AI structural falsification.

It monitors:
- U.S. Treasury 10Y yield;
- corporate-spread direction;
- debt dependence of AI infrastructure;
- energy-cost stress;
- FCF deterioration.

`SEVERE` requires:

`UST10Y >= 5% + at least two severe companion stress channels`.

This state means financing conditions are hostile. It does **not** prove that the AI demand thesis is broken.

## 6. Relationship to existing engines

This module is an adversarial overlay, not a replacement for existing engines.

It should consume or cross-check:
- `AI_CAPITAL_EFFICIENCY_GATE_OMEGA`
- `AI_CAPEX_MARGINAL_DEMAND_DETECTOR_OMEGA`
- AI demand/monetization proof
- grid/power bottleneck evidence
- Economic Proof versus Equity Monetization

Avoid double counting the same observation across several RED categories.

## 7. Evidence protocol

Every evaluation must persist:
- timestamp and reporting period;
- evidence IDs and source provenance;
- normalized measurement definition;
- signal state for all eight signals;
- RED/AMBER counts;
- core RED count;
- persistence quarters;
- thesis state;
- review action;
- subsequent evidence that confirmed or refuted the signal.

Unknown or undisclosed data remains `UNKNOWN`. It must not be converted into negative evidence.

## 8. Current state at registration

`TESIS IA: ACTIVE`  
`BURRY: ADVERSARIAL HYPOTHESIS ACTIVE`  
`FALSIFICATION: NOT ESTABLISHED`  
`PORTFOLIO ACTION FROM THIS MODULE: NONE`  

Registration itself does not assert that any monitored signal is currently RED. Current-state promotion requires a fresh evidence evaluation through the engine.

## 9. Invariants

`TRIGGER_IS_NOT_FALSIFIER`  
`ONE_RED_SIGNAL_CANNOT_FALSIFY_AI_THESIS`  
`PRICE_DECLINE_WITHOUT_BREADTH_IS_NOT_INDUSTRY_PROOF`  
`LOWER_COST_PER_TOKEN_IS_NOT_BEARISH_IF_DEMAND_AND_ECONOMIC_VALUE_EXPAND`  
`BACKLOG_IS_NOT_PROFIT_PROOF`  
`ACCOUNTING_USEFUL_LIFE_IS_NOT_ECONOMIC_LIFE_PROOF`  
`IMPAIRMENT_ALLEGATION_IS_NOT_IMPAIRMENT_EVIDENCE`  
`MACRO_FUNDING_STRESS ≠ STRUCTURAL_AI_FALSIFICATION`  
`NO_AUTOMATIC_BUY_OR_SELL`
