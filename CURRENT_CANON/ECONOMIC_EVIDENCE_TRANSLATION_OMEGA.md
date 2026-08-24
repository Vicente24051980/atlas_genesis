# ATLAS Ω — ECONOMIC EVIDENCE TRANSLATION Ω v1.0

**Status:** ACTIVE CANON / TRANSVERSAL NORMALIZATION LAYER  
**Effective date:** 2026-08-24  
**Implementation:** `src/atlas/algorithm/economic-evidence-translation-omega.ts`  
**Tests:** `src/atlas/algorithm/economic-evidence-translation-omega.test.ts`  
**Decision authority:** NONE by itself

## Mission

Prevent economically different facts from being collapsed into the same variable before Economic Proof, valuation or Expected Return.

This module adds three deterministic translators:

1. **Contract / Economic Evidence Normalizer Ω**
2. **Organic Growth Decomposition Ω**
3. **Cross-Layer Price / Margin Pass-Through Ω**

It is additive to the existing canon. It does **not** duplicate Capital Funding Quality Ω, Financed Demand Ω, AI Credit Transmission Ω, AI Debt/SPV Financing Ω, Customer Acceptance Gate Ω or AI Layer Flow Confirmation Ω.

## Constitutional laws

**CONTRACT CEILING ≠ BACKLOG ≠ REVENUE ≠ FCF.**  
**MILESTONE VALUE ≠ CONTRACTED REVENUE.**  
**REPORTED GROWTH ≠ ORGANIC GROWTH.**  
**PRICE INCREASE ≠ PRICING POWER unless volume, gross margin and gross profit confirm.**  
**CUSTOMER ACCEPTANCE ≠ REVENUE.**  
**REVENUE GROWTH ≠ OWNER ECONOMICS.**

---

# 1. Contract / Economic Evidence Normalizer Ω

## 1.1 Problem

ATLAS receives commercial figures with very different economic meanings: TAM, framework agreements, maximum contract values, warrant milestones, RPO, backlog, purchase orders, shipments and recognized revenue. Treating them as interchangeable can contaminate revenue forecasts, DCFs and Expected Return.

## 1.2 Normalized evidence ladder

`TAM → Framework → Contract Ceiling → Milestone/Warrant Condition → RPO/Backlog → Purchase Order → Shipment → Customer Acceptance → Recognized Revenue → Gross Profit → OCF → FCF → ROIC`

### E0 — Narrative
Theme association or unsupported opportunity.

### E1 — Claim / scenario evidence
TAM and framework values. Useful for scenario construction only; never revenue base.

### E2 — Commercial evidence
Contract ceilings, milestone/warrant conditions, RPO, backlog, purchase orders, shipment and customer acceptance. E2 validates commercial activity but does not by itself enter recognized-revenue or FCF bases.

### E3 — Revenue + margin
Attributable recognized revenue plus credible margin evidence.

### E4 — Owner economics
Multi-period cash conversion plus ROIC/per-share evidence.

## 1.3 Mandatory metadata

- source and evidence IDs;
- economic evidence kind;
- amount and currency where applicable;
- cancellability/termination rights;
- committed versus optional quantity;
- customer acceptance requirement/state;
- recognized-revenue state;
- attributable margin state;
- OCF/FCF conversion;
- multi-period ROIC evidence.

## 1.4 Valuation treatment

- `DISCOVERY_ONLY`: TAM/framework.
- `SCENARIO_INPUT_ONLY`: ceiling/milestone/RPO/backlog/order/shipment/acceptance.
- `REVENUE_VISIBLE`: recognized revenue plus margin.
- `OWNER_ECONOMICS_VISIBLE`: multi-period FCF + ROIC.

No commercial ceiling is mechanically inserted into a DCF as contracted revenue.

### Calibration cases

- **MRVL / Google:** a milestone-linked maximum economic value is normalized as commercial/milestone evidence, not backlog or revenue.
- **CRM / public-sector contracts:** framework/ceiling values remain separate from funded task orders and recognized revenue.
- **DELL AI backlog:** backlog proves demand visibility but must still convert through delivery, margin, OCF and FCF.

---

# 2. Organic Growth Decomposition Ω

## 2.1 Mission

Separate the operating engine from acquisition, FX, divestiture and accounting effects before Growth Ω, Reinvestment Runway Ω and Expected Return consume a growth number.

Canonical bridge:

`Reported Growth = Organic Growth + M&A Contribution + FX Contribution + Divestiture Contribution + Accounting/Other`

Then, when disclosed:

`Organic Growth = Realized Price + Volume/Usage + Mix + Residual`

Contribution signs must preserve their contribution to reported growth.

## 2.2 Mandatory outputs

- reported growth;
- acquisition contribution in percentage points;
- FX contribution;
- divestiture contribution;
- accounting/other contribution;
- derived organic growth;
- price/volume/usage/mix bridge where disclosed;
- unreconciled residual;
- evidence confidence.

## 2.3 States

- `RECONCILED`
- `PARTIAL`
- `M_AND_A_MATERIAL`
- `EVIDENCE_PENDING`

`M_AND_A_MATERIAL` is descriptive, not bearish. It means reported growth cannot be presented as organic growth.

### Calibration cases

- **CRM:** Informatica contribution must be removed before judging underlying Salesforce growth and Agentforce-driven reacceleration.
- **MRVL:** acquired businesses and custom-silicon organic growth remain separate.
- **GWW:** FX/divestiture and organic daily-sales growth are kept distinct.
- **ADBE:** acquisition effects, when material, are separated before AI monetization is credited.

---

# 3. Cross-Layer Price / Margin Pass-Through Ω

## 3.1 Mission

Generalize the existing NVDA HBM/BoM pass-through protocol into a cross-sector engine that identifies who actually captures input-cost inflation.

Canonical chain:

`Input Cost Δ → Realized Price Δ → Volume Δ → Gross Margin Δ → Gross Profit Δ → OCF/FCF`

## 3.2 States

- `PRICING_POWER`: realized pricing exceeds input-cost inflation and margin/volume/gross profit confirm capture.
- `NEUTRAL_PASS_THROUGH`: price broadly offsets costs without material volume or margin damage.
- `ABSORPTION`: price lags cost and gross margin deteriorates.
- `DEMAND_DESTRUCTION`: aggressive pricing exceeds cost but volume/economic capture deteriorates materially.
- `MIXED`: evidence does not support a clean state.
- `EVIDENCE_PENDING`.

Implementation tolerances are configurable defaults and are **not immutable economic laws**. Any recalibration requires Model Learning & Governance Ω.

## 3.3 Initial cohorts

### AI hardware chain
`HBM / memory / BoM → NVDA accelerator pricing → DELL server ASP → customer price → volume → layer margins`

Apply in parallel to **NVDA, DELL, MRVL, AVGO** where price/cost/margin evidence exists.

### Industrial / tariff chain
`Tariff/input cost → DE/GWW realized price → volume → GM → GP → FCF`

Apply to **DE** and **GWW** where disclosures support the bridge.

## 3.4 Anti-contamination

A nominal revenue increase caused solely by higher prices is not automatically stronger Economic Proof. Gross-profit dollars, volume and FCF conversion remain mandatory.

---

# 4. Existing-engine ownership — no duplication

The following remain owned by existing canon:

- **Capital Funding Quality Ω / Financed Demand Ω:** source, recourse and sustainability of funding.
- **AI Debt / SPV Financing Ω:** structured funding, guarantees, maturities and recourse.
- **AI Credit Transmission Ω:** GPU/data-center collateral, residual value, LTV, DSCR, refinancing and circularity.
- **Neocloud Customer Acceptance Gate Ω:** acceptance before monetization promotion.
- **AI Demand & Monetization Proof Ω:** paying usage, retention, price-volume demand and cash conversion.
- **AI Layer Flow Confirmation Ω:** price/breadth/RS/persistence; never Economic Proof.

Therefore **GPU Collateral Quality Ω is not created as a duplicate standalone engine**. GPU collateral analysis remains inside AI Credit Transmission Ω, which already owns collateral/residual-value/LTV/refinancing diagnostics.

---

# 5. Canonical placement

Recommended sequence:

`INTEGRITY → TEMPORAL NORMALIZATION → CONTRACT/EVIDENCE NORMALIZER → ORGANIC GROWTH DECOMPOSITION → BUSINESS QUALITY/GROWTH → CAPEX PRODUCTIVITY → PRICE/MARGIN PASS-THROUGH → ECONOMIC THROUGHPUT → NARRATIVE-TO-NUMBERS → PER-SHARE/ROIC → VALUATION → EXPECTED RETURN → COMPETITION FOR CAPITAL`

When financing is material, existing CFQ/FD/AI Credit/AI Debt modules run in parallel without evidence double-counting.

## Required standard fields

`CONTRACT_EVIDENCE_KIND`  
`ECONOMIC_EVIDENCE_STAGE`  
`VALUATION_TREATMENT`  
`REPORTED_GROWTH`  
`ORGANIC_GROWTH`  
`M&A_CONTRIBUTION`  
`FX_CONTRIBUTION`  
`PRICE_VOLUME_MIX`  
`INPUT_COST_CHANGE`  
`REALIZED_PRICE_CHANGE`  
`VOLUME_CHANGE`  
`GROSS_MARGIN_CHANGE`  
`GROSS_PROFIT_CHANGE`  
`PASS_THROUGH_STATE`  
`EVIDENCE_IDS`  
`FALSIFIERS`

## Final law

**ATLAS must translate evidence before scoring it. A large number is not economically meaningful until ATLAS identifies what the number legally and financially represents, how much growth is truly organic, and who retains the incremental gross profit and cash flow.**
