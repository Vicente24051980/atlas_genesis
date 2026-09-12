# ATLAS Ω — AI DATA CENTER RISK TRANSFER Ω v1.1 HARDENED

**Status:** ACTIVE / SUPERSEDES v1.0 WHERE CONFLICT EXISTS  
**Effective date:** 2026-09-12  
**Scope:** R0 DISCOVERY → E1 EVIDENCE / H6 SECOND ORDER CAPTOR / EDD-5  
**Engine count:** 6 / unchanged  
**Direct weight:** 0% Fundamental Score / 0% FRU-MATH  
**Decision authority:** none  
**Kernel contract:** no new contract

## 1 — Constitutional placement

Canonical chain:

`AI/Data-Center CAPEX → insurable asset concentration → protection gap → primary insurance / brokerage / analytics → reinsurance / alternative capital → attributable transaction → attributable revenue & margin → FCF/ROIC → T5 applicability gate → standard ATLAS stack → FRU-MATH`

DCRT remains a derived second-order CAPEX branch. It does not create a second independent CAPEX funding river.

`DATA_CENTER_RISK_TRANSFER = DERIVED_DO_NOT_COUNT_AS_NEW_POOL`

## 2 — Two-axis architecture remains mandatory

### Axis A — Market maturity
- `M0_NARRATIVE`
- `M1_PROTECTION_GAP_PROVEN`
- `M2_DEDICATED_CAPACITY_FORMING`
- `M3_DEDICATED_REINSURANCE_TRANSFER_ACTIVE`
- `M4_DEDICATED_ALTERNATIVE_CAPITAL_ACTIVE`

### Axis B — Company economic proof
- `C0_NO_ATTRIBUTION → E0`
- `C1_COMPANY_POSITIONING → E1`
- `C2_ATTRIBUTABLE_TRANSACTION → E2`
- `C3_ATTRIBUTABLE_REVENUE_MARGIN → E3`
- `C4_MULTI_PERIOD_FCF_ROIC → E4`

No market-stage promotion can promote a company stage automatically.

## 3 — PATCH 1: Traceable Indirect Attribution Protocol

Capital-light brokers/modelers are not required to disclose a separate accounting segment called “AI data-center insurance revenue.” C2→C3 may be achieved without standalone segment reporting only when all three elements are present:

1. **Named facility/product:** a public, specific data-center structure/product exists.
2. **Identifiable attributable transaction:** at least one bound placement, institutional licence, consortium participation, contract, or equivalent C2 event is documented.
3. **Quantitative operating traction:** management/filing/earnings materials disclose a verifiable metric linked to the specialised activity, such as campus count, TIV managed/placed, premium/fee volume, utilisation, licence count, or differential organic growth of the specialised sub-group.

If item 3 is absent, state remains `C2`, not C3.

Management adjectives, TAM commentary, “strong demand,” and unquantified pipeline do not satisfy item 3.

## 4 — PATCH 2: M3 definition — dedicated reinsurance only

`STANDARD COMMERCIAL PROPERTY FACULTATIVE PLACEMENT ≠ M3`

M3 requires at least one of:

### A. Dedicated Treaty
A quota-share, excess-of-loss, aggregate, or equivalent treaty specifically covering a data-center / AI data-center portfolio.

### B. Dedicated Facility Backing
A formally committed reinsurance panel backing a named dedicated data-center facility/program.

Ordinary facultative excess layers on a single campus remain compatible with M2 and do not by themselves establish M3.

## 5 — PATCH 3: Parametric alternative capital included in M4

M4 may be established by:

`DEDICATED CAT BOND OR DEDICATED SIDECAR OR COLLATERALIZED REINSURANCE OR PARAMETRIC ALTERNATIVE-CAPITAL FACILITY`

A parametric structure qualifies only when:
- trigger is linked to data-center asset/operational risk;
- transaction is dedicated or demonstrably allocated to a data-center portfolio;
- risk-bearing capital is alternative capital / ILS or equivalent collateralised capital.

`GENERIC CLOUD PARAMETRIC ≠ DEDICATED DATA-CENTER ASSET RISK TRANSFER`

## 6 — PATCH 4: Primary vs reinsurer attachment asymmetry

Risk-transfer fragility remains:

`RTF = 0.35*MG + 0.35*TR + 0.30*GC`

but `TR` is now role-sensitive.

### Primary insurer
`TR_PRIMARY` must include:
- deductible adequacy;
- attritional retained-loss frequency;
- liquid-cooling escaped-liquid frequency/severity;
- BESS/electrical/fire attritional losses;
- share of losses below reinsurance attachment;
- retention/exhaustion structure.

### Reinsurer
`TR_REINSURER` must include:
- attachment point;
- aggregate exposure;
- tail severity;
- exhaustion probability;
- retrocession/collateral protection;
- correlated multi-campus loss potential.

No primary carrier may receive a low-fragility classification merely because catastrophic tail is ceded when material attritional losses remain retained.

## 7 — PATCH 5: CBI accumulation modelability penalty

`MG` must be penalised where policies materially cover Contingent Business Interruption arising from shared external infrastructure.

High-severity flags include:
- common grid/substation dependency;
- transmission corridor dependency;
- shared water/cooling utility dependency;
- geographic multi-campus clustering;
- insufficient distance sublimits;
- insufficient waiting periods;
- weak external-service interruption exclusions.

If material CBI is covered without strict distance/time/limit controls, `CBI_MODELABILITY_PENALTY = HIGH`.

## 8 — v1.1 additional hardening: lifecycle phase

Every exposure/transaction must carry:

`PHASE = CONSTRUCTION | COMMISSIONING | OPERATION | MIXED | UNKNOWN`

Construction and operational insurance cannot be pooled without reconciliation.

Examples:
- construction: CAR/EAR, builders risk, DSU/ALOP;
- operational: property damage, BI, service interruption, cyber/OT;
- commissioning: transition/acceptance and start-up risks.

A company may have different C-stage evidence by phase.

## 9 — v1.1 additional hardening: utilisation definition

`UTILIZED_CAPACITY` requires all of:

1. `LIMIT_BOUND = TRUE`
2. `PREMIUM_INVOICED_OR_ECONOMIC_EQUIVALENT = TRUE`
3. `POLICY_OR_CONTRACT_EFFECTIVE = TRUE`

LOI, submission, quote, available market line, announced panel limit, and non-binding indication are not utilisation.

`UTILIZATION_RATE = PLACED_OR_BOUND_LIMIT / ANNOUNCED_CAPACITY`

If denominator is announced capacity and numerator is unknown, utilisation remains `UNKNOWN`, never 0.

## 10 — v1.1 additional hardening: premium double-count firewall

The following may represent stages of the same underlying premium/risk transfer and must not be summed as independent economic pools:

`PRIMARY PREMIUM`
`REINSURANCE CEDED PREMIUM`
`RETROCESSION PREMIUM`
`ILS/COLLATERALIZED NOTIONAL OR PREMIUM`

Canonical state:

`PREMIUM_DOUBLE_COUNT = BLOCKED`

Only incremental economic value retained by each company may be attributed at the company level.

## 11 — v1.1 additional hardening: C2 materiality gate

A transaction qualifies for C2 only if:

- disclosed by company/IR/filing **or** corroborated by at least 2 independent traceable sources; and
- economically non-trivial.

Default research floor for non-disclosed deals:

`TIV >= USD 25m OR PREMIUM >= USD 1m OR FEE >= USD 250k OR MATERIALITY_OVERRIDE = TRUE`

`MATERIALITY_OVERRIDE` requires explicit evidence that the transaction is strategically significant despite lower absolute size, e.g. first dedicated product placement, first dedicated ILS structure, or regulatory/market precedent.

Thresholds are research-noise filters, not valuation thresholds.

## 12 — v1.1 additional hardening: capital-light T5 applicability

The v1.0 singularity protection remains correct, but capital-light businesses require an applicability branch.

### Risk-bearing route
If the company retains insurance/reinsurance tail risk:

`T5_CRTA = FCF_CAPTURED / OWN_CAPITAL_AT_RISK`

Invalid/zero denominator → `NO_CALCULABLE`.

### Capital-light route
For brokers, modelers and structurers that do not materially retain underwriting tail:

`T5_APPLICABILITY = CAPITAL_LIGHT_NON_RISK_BEARING`

Research diagnostic:

`CLE = ATTRIBUTABLE_FCF / OPERATING_CAPITAL_EMPLOYED_IN_PRODUCT`

CLE is **not a new kernel contract**, has 0% direct weight, and cannot be added to FRU. It is an applicability/efficiency diagnostic allowing the standard ATLAS stack to continue without fabricating CRTA infinity.

If Operating Capital Employed is unknown or <=0: `CLE = NO_CALCULABLE`.

No capital-light name may be promoted merely because its underwriting capital is zero.

## 13 — v1.1 additional hardening: modelability decomposition

`MG = 0.50*NATCAT_MODELABILITY_GAP + 0.50*NON_NATCAT_MODELABILITY_GAP`

### NATCAT component
Includes flood, wind, hail, tornado, earthquake, wildfire and other catastrophe models.

### NON-NATCAT component
Includes:
- grid/power interruption;
- water/escaped liquids;
- cooling failures;
- BI/CBI;
- BESS/electrical failures;
- cyber/OT where relevant.

If one component is UNKNOWN, MG remains `INCOMPLETE` and cannot be assigned a precision score by averaging only known components.

## 14 — v1.1 additional hardening: geographic concentration

`GC_HIGH` is mandatory when evidence shows a material portfolio concentration in a high-hazard cluster.

Reference warning thresholds for research:
- >40% TIV/capacity in a single materially correlated hazard/utility region; or
- company-disclosed concentration judged equivalent by E1.

This is a trigger for high concentration review, not an automatic underwriting failure.

## 15 — Expanded monitoring ledger

Mandatory fields:

`DATE | SOURCE | FACT_CLASS | COMPANY | TICKER | ROLE | PHASE | PRODUCT/FACILITY | TRANSACTION_ID | CAMPUS_COUNT | CONSTRUCTION_VALUE | TIV | PML | DEDUCTIBLE | ATTACHMENT | LIMIT_ANNOUNCED | LIMIT_BOUND | UTILIZATION_RATE | PREMIUM | RATE_ON_LINE | BROKERAGE_RATE_EVIDENCED | REINSURANCE_CEDED | ALT_CAPITAL_PLACED | POLICY_EFFECTIVE | REVENUE_ATTRIBUTED | MARGIN_ATTRIBUTED | FCF_ATTRIBUTED | OPERATING_CAPITAL_EMPLOYED | OWN_CAPITAL_AT_RISK | LOSS_FREQUENCY | LOSS_SEVERITY | NATCAT_MG | NON_NATCAT_MG | CBI_CONTROLS | GC | MARKET_STAGE | COMPANY_STAGE | T5_ROUTE | FALSIFIER`

Unknown = `UNKNOWN`. No silent imputation.

## 16 — Corrected company ledger at 12-Sep-2026

| Ticker | Company | Role | Stage | Evidence conclusion |
|---|---|---|---|---|
| VRSK | Verisk | Modeling / exposure analytics | C1 | Dedicated U.S. Data Center Exposure Database exists; monetisation not isolated. |
| AON | Aon | Brokerage / structuring | C1 | Dedicated Data Center Lifecycle Program; utilisation/economics not isolated. |
| MRSH | Marsh | Brokerage / reinsurance / capital | C1 | Stratus dedicated digital-infrastructure exchange; economics not isolated. |
| AJG | Gallagher | Brokerage / specialty / reinsurance | C1 | Dedicated Data Center Solutions practice and specialised program design are publicly documented; no C2 transaction proven in ledger. |
| MUV2 | Munich Re | Reinsurance / specialty | C1 | Dedicated data-center Liquidated Damages cover; attributable premium unresolved. |
| SREN | Swiss Re | Insurance/reinsurance / engineering | C1 | Swiss Re Corporate Solutions has specific Data Centre Builders Risk / risk-engineering offering; C2 transaction unresolved. |
| HNR1 | Hannover Re | Reinsurance | C0 | No qualifying dedicated company evidence in current ledger. |
| RNR | RenaissanceRe | Reinsurance / ILS | C0 | No dedicated data-center vehicle proven in current ledger. |
| ACGL | Arch Capital | Insurance/reinsurance | C0 | No dedicated data-center product/transaction proven in current ledger. |
| BRO | Brown & Brown | Brokerage | C0 | No dedicated data-center program proven in current ledger. |

`COMPANIES_C2_PLUS = 0`

## 17 — Ticker normalization correction

`MRSH` is the current NYSE ticker for Marsh. The historical ticker `MMC` changed to `MRSH` in January 2026.

Do not revert the ledger to MMC for current-date monitoring.

## 18 — Current baseline

`MARKET_STAGE = M2_CONFIRMED`
`M3 = NOT_PROVEN`
`M4 = NOT_PROVEN`
`DEDICATED_DATA_CENTER_CAT_BOND = NOT_IDENTIFIED`
`COMPANIES_C2_PLUS = 0`
`T5_RISK_BEARING_AUTHORIZED = NONE`
`T5_CAPITAL_LIGHT_APPLICABILITY_CONFIRMED = NONE`
`PORTFOLIO_ACTION = NONE`
`CAPEX_DOUBLE_COUNT = BLOCKED`
`PREMIUM_DOUBLE_COUNT = BLOCKED`
`T5_BYPASS = BLOCKED`

## 19 — Falsifiers / operational watch

Priority falsifiers:
1. dedicated facility utilisation remains <20% after two reported quarters **when utilisation is actually measurable**;
2. rate-on-line falls >15% YoY without commensurate loss improvement or capital relief;
3. no dedicated M4 transaction emerges over the expected monitoring horizon;
4. named brokers/modelers fail to produce any quantitative traction disclosure after dedicated product launch;
5. CBI/grid accumulation losses exceed modelled/retained economics;
6. attritional liquid-cooling/BESS/electrical losses erode primary underwriting economics below reinsurance attachment;
7. premium/fee growth fails to convert into attributable FCF.

No falsifier may be activated from an UNKNOWN denominator.

## 20 — Final law

**A giant insurance need is not an investment thesis. A dedicated product is not an attributable transaction. A transaction is not revenue. Revenue is not FCF. FCF is not attractive return until capital at risk, operating capital, loss economics and valuation are all reconciled through the existing ATLAS stack.**
