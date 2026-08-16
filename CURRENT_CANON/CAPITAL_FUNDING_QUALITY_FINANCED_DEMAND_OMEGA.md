# ATLAS Ω — CAPITAL FUNDING QUALITY Ω + FINANCED DEMAND Ω

**Status:** CANONICAL_COMPATIBLE / ACTIVE  
**Effective date:** 2026-08-17  
**Compatibility:** ATLAS Ω ENTERPRISE v3.1 / v3.1.1 calibration layer  
**Portfolio effect:** NONE by itself

## 1. Mission

ATLAS must distinguish three independent questions:

1. **Demand Proof Ω:** is end demand real and economically observable?
2. **Payback Ω:** does deployed capital convert into revenue, operating profit, OCF, FCF/share and incremental ROIC?
3. **Funding Sustainability Ω:** can the company fund that growth without creating refinancing, dilution, guarantee, collateral or counterparty fragility?

Canonical law:

**DEMAND PROOF ≠ ECONOMIC PAYBACK ≠ FUNDING SUSTAINABILITY.**

A company can have strong demand and poor payback. It can have strong demand and acceptable payback but fragile funding. Conversely, external financing is not bearish by itself when contractual demand and unit economics support it.

---

# 2. CAPITAL FUNDING QUALITY Ω

## 2.1 Objective

Measure the quality, durability, recourse and reflexivity of the capital stack funding growth/CAPEX.

## 2.2 Mandatory inputs

- OCF / FCF / FCF per share
- cash and marketable securities
- gross debt / net debt
- debt maturities and refinancing windows
- interest expense and effective funding cost
- finance leases / operating leases
- purchase commitments / minimum-spend commitments
- project finance / JV / SPV financing
- equity issuance / secondary capital / dilution
- SBC and share-count growth
- customer prepayments / deferred revenue
- vendor financing
- supplier financing
- guarantees / backstops / parent support
- pledged collateral / LTV where applicable
- off-balance-sheet commitments
- related-party funding
- government support/subsidies where material
- cash conversion and working-capital dependency

## 2.3 Funding map

`Operating cash → retained cash → equity → debt → leases → project finance/SPV → vendor finance → customer prepayment → guarantees/backstops → collateral → refinancing`

Every material source must record:

`SOURCE | AMOUNT | TENOR | RECOURSE | COST | COLLATERAL | COUNTERPARTY | PURPOSE | MATURITY | FRESHNESS`

## 2.4 States

- **CFQ0 SELF_FUNDED:** operating cash comfortably finances reinvestment; external capital optional.
- **CFQ1 AUGMENTED_ROBUST:** external funding accelerates growth but business economics can support it; diversified funding and no material refinancing dependency.
- **CFQ2 DEPENDENT:** growth requires continued external funding, commitments or partner capital; still viable but funding availability is economically material.
- **CFQ3 FRAGILE:** refinancing, collateral, dilution, guarantees or concentrated counterparties become necessary to preserve growth.
- **CFQ4 REFLEXIVE_CASCADE:** weaker economics reduce funding availability, which forces CAPEX cuts, dilution, asset sales or customer/supplier stress.

No universal numerical threshold is canonical until empirically calibrated. Normalize versus company history, peers and contractual structure.

## 2.5 Escalation logic

External capital alone never triggers fragility.

Escalate only when multiple independent signals deteriorate, e.g.:

`CAPEX/OCF ↑ + FCF/share ↓ + debt/leases/commitments ↑ + funding cost ↑ + maturities shorten + collateral/guarantee reliance ↑ + demand/payback weakens`.

---

# 3. FINANCED DEMAND Ω

## 3.1 Objective

Separate independent end demand from demand whose apparent strength is materially supported by financing, reciprocal relationships, strategic investment, cloud credits, guarantees or vendor/customer capital.

Canonical laws:

**FINANCED DEMAND ≠ FAKE DEMAND.**  
**STRATEGIC INVESTOR/SUPPLIER ≠ INDEPENDENT END DEMAND.**  
**BACKLOG ≠ CASH FLOW unless contract economics, cancellation rights and funding are understood.**

## 3.2 Mandatory inputs

- end-customer count and concentration
- units/usage/volume growth
- price/ARPU/ASP
- renewals / retention / churn
- backlog/RPO and cancellation terms
- customer prepayments
- take-or-pay / minimum spend
- vendor financing
- buyer financing
- cloud credits/subsidies
- equity investments between supplier and customer
- supplier/customer guarantees or backstops
- reciprocal procurement agreements
- related-party revenue
- distribution dependence on strategic investors
- financed capacity reservations
- customer credit quality
- monetization after promotional support ends

## 3.3 Causal graph

`Investor → supplier/cloud/financier → company → capacity/product → customer → usage → cash collection`

ATLAS records economic roles separately. A party may simultaneously be investor, supplier, distributor and customer; that overlap increases interdependence but does not automatically invalidate demand.

## 3.4 States

- **FD0 ORGANIC:** demand and cash collection are broadly independent of supplier/investor financing.
- **FD1 SUPPORTED:** financing/distribution support exists but end usage and economics are independently demonstrated.
- **FD2 INTERDEPENDENT:** major suppliers/investors/distributors materially enable demand or capacity; economics remain real but circularity must be monitored.
- **FD3 REFLEXIVE:** revenue/order growth increasingly depends on financing/backstops/reciprocal capital from ecosystem counterparties.
- **FD4 SYNTHETIC_FRAGILITY:** withdrawal of financing or reciprocal support would likely cause material demand/order contraction.

## 3.5 Tests

For every material customer ecosystem ask:

1. Would the customer still buy if financing/support disappeared?
2. Is usage growing after deployment?
3. Is cash collected independently of supplier funding?
4. Are renewals and prices improving without incentives?
5. Is the investor also the supplier/distributor/customer?
6. Does backlog convert to revenue and OCF?
7. Are guarantees or minimum-spend contracts economically binding?

---

# 4. Integration with existing engines

## AI CAPEX Payback Ω

`CAPEX → commissioned capacity → utilization → price → revenue → operating profit → OCF → FCF/share → incremental ROIC`

Add two mandatory side gates:

`Funding Sustainability Ω` and `Financed Demand Ω`.

## AI Financial Fragility Ω

Capital Funding Quality is an upstream diagnostic. CFQ2+ does **not** equal F3/F4. Fragility requires deteriorating economics plus funding stress.

## AI Credit Transmission Ω

CFQ and FD provide the company-level nodes for:

`buyer → financier → vehicle → collateral → guarantee → debt service → refinance`.

## Systemic Cascade Ω

New cascade path:

`financed demand ↑ → external funding dependency ↑ → funding cost/refinancing shock → capacity/order cuts → supplier revenue revisions → collateral repricing → credit transmission`.

## Global CAPEX Chain Ω

For EDD-0/1 companies add:

`Funding Pool Independence Ω` and `End-Demand Independence Ω`.

---

# 5. Mandatory output fields

For capital-intensive or AI-linked companies ATLAS must output:

`DEMAND_PROOF_STATE`  
`PAYBACK_STATE`  
`CFQ_STATE`  
`FD_STATE`  
`FUNDING_SOURCES`  
`FUNDING_RECOURSE`  
`FINANCED_DEMAND_LINKS`  
`RELATED_PARTY_OVERLAP`  
`BACKLOG_QUALITY`  
`REFINANCING_DEPENDENCY`  
`DILUTION_DEPENDENCY`  
`GUARANTEE_BACKSTOP_DEPENDENCY`  
`FALSIFIERS`  
`CONFIDENCE`

---

# 6. Decision safety

No BUY/SELL may be generated solely because:

- CAPEX is large;
- FCF is temporarily negative;
- a strategic investor is also a supplier;
- a company uses debt/project finance;
- backlog is large;
- a famous financier participates.

Escalation requires economically connected evidence.

**Final law:**

**REAL DEMAND can coexist with BAD CAPITAL ALLOCATION. GOOD PAYBACK can coexist with FRAGILE FUNDING. EXTERNAL FUNDING can coexist with EXCELLENT ECONOMICS. ATLAS must identify which combination actually exists.**
