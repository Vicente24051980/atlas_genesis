# GLOBAL CAPEX CHAIN Ω v1.0

**Status:** ACTIVE / TRANSVERSAL STRUCTURAL DISCOVERY ENGINE  
**Effective date:** 2026-08-16  
**Horizon:** 3–6 years  
**Authority:** compatible canonical module under ATLAS Ω ENTERPRISE v3.1; does not overwrite Principal Ω, valuation, Money Rotation Ω or portfolio construction.

## Mission

Measure where each company sits in the economic transmission chain of the next global CAPEX cycle and identify the economic toll roads, persistent bottlenecks and multi-cycle beneficiaries through which a disproportionate share of investment must pass.

The engine asks:

**Where does the CAPEX originate → through which company must it pass → how scarce is that position → how long can the bottleneck persist → does the spending become revenue/margin/FCF/ROIC → how many independent CAPEX pools converge on the same company?**

## Constitutional laws

1. **GLOBAL CAPEX EXPOSURE ≠ BUY SIGNAL.**
2. **CAPEX POSITION ≠ VALUATION.** Valuation remains external to this engine.
3. **CAPEX POSITION ≠ CAPEX FRAGILITY.** Structural opportunity and risk are reported separately.
4. **EDD-0 PAYBACK ≠ SUPPLIER CAPTURE.** Allocators/payers are not ranked directly against suppliers.
5. **NARRATIVE ≠ ECONOMIC PROOF.** E2 or higher is required for confirmed beneficiary status.
6. **CAPEX CONVERGENCE counts independent funding pools, not repeated labels funded by the same buyer pool.**
7. **A bottleneck is valuable only while it remains difficult to replicate, qualify, permit or substitute.**
8. No output from this engine can silently overwrite another ATLAS Ω engine.
9. **T212 ACCESSIBILITY ≠ ECONOMIC QUALITY.** Trading 212 availability is an execution gate, not a fundamental score. A company unavailable in T212 may remain a structural read-through signal, but must not be presented as a directly executable ticker.

## Economic Dependency Distance Ω — EDD

- **EDD-0 — Allocator/Payer:** decides and finances CAPEX. Examples: hyperscalers and large infrastructure allocators. Economic mode = `PAYBACK`.
- **EDD-1 — Direct Compute/Connectivity:** receives direct spend in compute, memory, networking or optical connectivity.
- **EDD-2 — Manufacturing Chokepoint:** enables fabrication, process control, packaging, test or other scarce manufacturing steps.
- **EDD-3 — Physical Infrastructure:** data-center power/cooling, electrical equipment, engineering, construction and grid interconnection.
- **EDD-4 — Power/Fuel/Resources:** generation, fuel, energy security and physical resource supply.
- **EDD-5 — Industrial/Logistics/Finance:** enables deployment through equipment, logistics, financing or adjacent industrial capacity.
- **EDD-6 — Downstream/Productivity:** benefits later from productivity or economic expansion rather than receiving direct CAPEX.

EDD is a location variable, not a quality score. Lower EDD is not automatically better.

## Economic modes

### PAYBACK — EDD-0

**CAPEX → installed capacity → utilization → pricing → revenue → margin → OCF → FCF/share → incremental ROIC → payback.**

### CAPTURE — EDD-1 to EDD-5

**Customer CAPEX → orders/contracts → backlog/RPO → revenue → margin → OCF/FCF → incremental ROIC.**

### DOWNSTREAM PRODUCTIVITY — EDD-6

**Upstream investment → productivity/volume/market expansion → revenue → margin → FCF/share.**

These cohorts remain economically separate.

## CAPEX Position Ω — 0 to 100

Weighted score:

- Causal Directness: **25%**
- Bottleneck / Scarcity Power: **20%**
- Backlog & Visibility: **15%**
- Revenue Translation: **15%**
- Economic Capture: **10%**
- Customer Diversification: **10%**
- Duration: **5%**

This score measures the company's position in the spending chain before valuation.

## Economic Proof Gate Ω

- **E0 NARRATIVE:** theme association only.
- **E1 MANAGEMENT CLAIM:** management describes the opportunity, but no hard economic transmission is demonstrated.
- **E2 ORDERS/CONTRACTS:** orders, contracts, backlog, customer commitments or other traceable commercial evidence.
- **E3 REVENUE/MARGIN:** orders/usage visibly convert into reported revenue and margin.
- **E4 FCF/ROIC MULTI-PERIOD:** revenue converts into FCF/share or incremental ROIC across multiple periods and preferably multiple customers.

Confirmed Global CAPEX Chain status requires **traceable E2+ evidence and at least two evidence records**. E0/E1 remains `EVIDENCE_PENDING` regardless of narrative attractiveness.

## CAPEX Convergence Ω

Measures whether several **independently financed** CAPEX rivers converge on the same company.

Canonical funding pools include:

- Hyperscaler AI
- Semiconductor fab CAPEX
- Utility/grid
- Power generation
- Industrial reshoring
- Defense budgets
- Aerospace build-rate
- Energy security
- Healthcare CAPEX
- Transport infrastructure

Multiple products sold to one hyperscaler CAPEX pool do not equal true convergence. The engine de-duplicates by funding pool and uses only E2+ river evidence.

Interpretation:

- Low: single-cycle/single-pool dependency.
- Medium: two material independent pools.
- High: three or more material independent pools.
- Exceptional: multiple material pools with different macro/funding drivers.

## Bottleneck Persistence Ω

Deterministic components:

- replication lead time: 25%
- market structure: 20%
- qualification/switching cost: 20%
- capacity-expansion difficulty: 15%
- regulatory/permitting barrier: 10%
- resistance to technological substitution: 10%

A high current bottleneck with low persistence must not receive the same structural status as a bottleneck that takes years to replicate.

## CAPEX Fragility Ω — separate risk vector

Fragility is deliberately **not deducted from Structural Opportunity Ω**. It is reported independently so ATLAS can distinguish a huge opportunity with dangerous risk from a modest but robust opportunity.

Components:

- customer concentration: 20%
- cyclicality/overbuild: 15%
- technology obsolescence: 15%
- own-CAPEX burden: 15%
- geopolitical/regulatory: 15%
- execution/supply chain: 10%
- financing dependence: 10%

High fragility triggers separate review by AI Financial Fragility Ω, AI Credit Transmission Ω, Systemic Cascade Ω, Energy Rotation Ω or another relevant engine. It does not erase the structural CAPEX map.

## Structural Opportunity Ω

`70% CAPEX Position + 15% CAPEX Convergence + 15% Bottleneck Persistence`

This is a research-priority score, not an investment recommendation.

States:

- **CRITICAL_TOLL_ROAD:** score ≥85 and Bottleneck Persistence ≥70.
- **PRIVILEGED_CHOKEPOINT:** score ≥75.
- **DIRECT_BENEFICIARY:** score ≥60.
- **INDIRECT_BENEFICIARY:** score ≥45.
- **LOW_CAPEX_LEVERAGE:** score <45.
- **EVIDENCE_PENDING:** Economic Proof Gate not satisfied.

## Global CAPEX rivers to map

The engine is global and multi-cycle. At minimum map:

1. AI compute
2. Semiconductor fabs
3. Advanced packaging / HBM / memory
4. Networking / optics
5. Data-center physical infrastructure
6. Power equipment
7. Grid transmission/distribution
8. Generation
9. Fuel / energy security
10. Electrification
11. Reshoring / automation
12. Defense
13. Aerospace
14. Healthcare capacity
15. Transport/logistics

A company can belong to several rivers simultaneously.

## Trading 212 Accessibility Gate Ω

Execution universe must be separated from discovery universe.

For every company surfaced by Global CAPEX Chain Ω:

1. Verify whether the direct security is available in Trading 212.
2. If unavailable, search for a legitimate ADR, OTC security or alternative primary/secondary listing that is actually available in Trading 212.
3. Never invent or infer T212 availability from the existence of a public ticker.
4. If no executable T212 instrument is verified, classify the company as `READ_THROUGH_ONLY`.
5. `READ_THROUGH_ONLY` companies remain valid evidence for supply-chain mapping and can trigger discovery of economically adjacent T212-accessible beneficiaries.
6. Sell-side recommendations do not bypass this gate and do not constitute an ATLAS BUY.

Required accessibility field: `T212_DIRECT`, `T212_ALTERNATIVE`, `READ_THROUGH_ONLY`, or `T212_UNVERIFIED`.

### Japan AI Components read-through — 19 Aug 2026

Sell-side source universe: Ibiden, Murata Manufacturing, Taiyo Yuden, Renesas Electronics, Rohm, TDK, Kyocera, MinebeaMitsumi and Nidec.

Research priority from the supplied operating signals: **Ibiden, Taiyo Yuden, Murata, Renesas and TDK**. These names enter the structural research universe because of evidence/signals around AI/data-center demand, book-to-bill, utilization, pricing, capacity and/or margin expansion. They do **not** enter the executable portfolio universe until the Trading 212 Accessibility Gate is passed.

If inaccessible, use them as read-through nodes for:

**AI accelerators / CPUs → substrates + MLCC + power management + UPS/batteries → revenue/margin/FCF capture → accessible listed beneficiaries.**

## Required company output

For every audited ticker:

- Ticker
- T212 accessibility state
- EDD
- Role
- Economic mode
- CAPEX rivers
- Independent funding pools
- CAPEX Position Ω
- Economic Proof E0–E4
- CAPEX Convergence Ω
- Bottleneck Persistence Ω
- Structural Opportunity Ω
- CAPEX Fragility Ω
- State Ω
- evidence IDs / dates
- primary falsifiers
- next research action

## Falsifiers

At minimum test:

1. orders/backlog stop converting to revenue;
2. revenue growth stops converting to margin/FCF;
3. bottleneck replicates materially faster than expected;
4. customer/funding-pool concentration rises materially;
5. capacity additions create structural overbuild;
6. substitution destroys scarcity/pricing power;
7. permitting/regulation/geopolitics break the transmission chain;
8. customer CAPEX is cancelled/delayed;
9. financing dependence makes the supplier unable to fund required capacity.

## Integration with existing ATLAS Ω engines

- **Global Discovery Ω:** uses Global CAPEX Chain Ω to discover adjacent beneficiaries and toll roads before consensus.
- **Successor Detection Ω:** CAPEX Convergence and Bottleneck Persistence can elevate research priority, never conviction without evidence.
- **Principal Ω:** consumes the structural map but performs its own quality/valuation decision.
- **AI CAPEX Payback Ω:** owns EDD-0 AI allocator economics.
- **AI Financial Fragility / Credit Transmission / Systemic Cascade:** own financing and cascade risk.
- **Money Rotation / Institutional Capital Rotation:** measure capital movement, not structural CAPEX position.
- **Valuation Ω:** remains independent and can veto attractive CAPEX exposure at an unacceptable price.
- **Portfolio Construction Ω:** uses economic-driver diversification after all engines have reported independently.

## Implementation

Canonical implementation:

- `src/atlas/algorithm/global-capex-chain-omega.ts`
- `src/atlas/algorithm/global-capex-chain-omega.test.ts`

## Final law

**ATLAS must identify not only who is growing, but which economic toll roads the next unit of world investment must cross.**

**CAPEX origin → EDD → bottleneck → convergence → economic proof → T212 accessibility → FCF/ROIC → fragility → valuation → falsification.**
