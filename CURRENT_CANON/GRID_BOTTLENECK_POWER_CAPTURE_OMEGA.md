# GRID BOTTLENECK & POWER CAPTURE Ω v1.0

**Status:** CANONICAL SPECIALIZED ENGINE  
**Date:** 2026-08-18  
**Scope:** ATLAS Ω ENTERPRISE v3.1+

## Mission
Measure whether power/grid scarcity is a real, persistent bottleneck for AI/data-center growth and identify where economic value is actually captured across equipment, EPC/installers, generation and utilities.

This engine is deliberately separate from Global CAPEX Chain Ω and Power Owners / AI Campus Conversion Ω:
- Global CAPEX Chain Ω maps the broad physical CAPEX chain and bottlenecks.
- Power Owners Ω audits companies converting scarce powered sites into AI/HPC cash flows.
- Grid Bottleneck & Power Capture Ω tests the grid shortage itself and ranks the economic capture points created by it.

## Canonical chain
`AI/data-center load request → interconnection study → deposit/security → signed interconnection/power agreement → equipment order → construction → energization → billed load → capacity/power revenue → FCF/ROIC capture`

## Core laws
- QUEUED MW != COMMITTED MW != ENERGIZED MW.
- INTERCONNECTION QUEUE SIZE != FINAL DEMAND.
- TRANSFORMER LEAD TIME != PROFITS unless backlog, pricing and margin conversion are demonstrated.
- HIGH CAPACITY PRICE != DURABLE UTILITY VALUE automatically.
- BOTTLENECK CONFIRMED != BUY SIGNAL.
- Secondary articles/newsletters can trigger research; primary grid-operator, regulator, utility, company filing/order-book and government data are required for state promotion.

## Required inputs
### Grid demand quality
1. Gross interconnection queue MW.
2. Data-center/AI share of queue where supportable.
3. Projects with study completed.
4. Deposits/security posted.
5. Signed interconnection agreements.
6. Signed PPAs/load agreements.
7. Construction-started MW.
8. Energized/billed MW.
9. Queue withdrawals/cancellations.

### Scarcity / reliability
10. Reserve margin / reliability requirement.
11. Capacity auction clearing price and procured MW.
12. Reliability shortfall or emergency conditions.
13. Transmission congestion / curtailment indicators.
14. Regional power price / basis where relevant.

### Equipment chokepoints
15. Transformer/switchgear lead times.
16. Backlog and book-to-bill of equipment suppliers.
17. Factory capacity expansion and expected commissioning.
18. Import dependence / critical component concentration.
19. Pricing and gross/operating margin conversion.

### Capture layer
20. Equipment supplier revenue/backlog/FCF conversion.
21. EPC contractor backlog, award quality, margin and FCF.
22. Generator/IPP contracted MW, capacity payments, power contracts and fuel risk.
23. Utility rate-base additions, allowed returns, financing needs and regulatory lag.
24. CAPEX required per incremental dollar of revenue/FCF.
25. Valuation / implied return and concentration risk.

## Queue Quality Funnel Ω
Every MW claim is classified into one stage:
- `Q0_REQUESTED`
- `Q1_STUDY`
- `Q2_SECURITY_POSTED`
- `Q3_AGREEMENT_SIGNED`
- `Q4_EQUIPMENT_ORDERED / CONSTRUCTION`
- `Q5_ENERGIZED`
- `Q6_BILLED`

Core metric:
`Firm Load Ratio = (Q3 + Q4 + Q5 + Q6 MW, de-duplicated) / Q0 gross requested MW`

Where stages overlap, do not sum the same MW twice. The purpose is to discount speculative queues before treating them as demand proof.

## Bottleneck Persistence Ω
Score persistence from:
- equipment lead-time duration and direction;
- backlog growth and cancellation rate;
- reserve/reliability deficit;
- capacity-price persistence;
- transmission/interconnection constraints;
- time required for new manufacturing/grid capacity to enter service;
- regulatory/permitting delays;
- import/supply-chain concentration.

## Economic Capture Map Ω
Rank four distinct capture layers:

### E — Equipment
Transformers, switchgear, electrical distribution, cables and cooling/power-control equipment.
Candidate universe includes ETN, Schneider Electric, ABB, Prysmian and other verified suppliers.

### C — Construction / EPC
Transmission, substations, grid upgrades, power infrastructure and data-center electrical buildout.
Candidate universe includes PWR and other verified EPC leaders.

### G — Generation / IPP
Companies selling incremental reliable electricity/capacity or signing high-quality data-center contracts.
Candidate universe includes CEG, VST and other verified generators.

### U — Regulated Utilities
Rate-base beneficiaries and network owners. Must separately model regulatory lag, financing burden, allowed ROE and duration sensitivity.

No layer receives a BUY signal merely because the bottleneck exists.

## Score 0–100
- Firm load / queue quality: 20
- Reliability / capacity scarcity: 15
- Equipment lead times / backlog: 20
- Bottleneck persistence: 15
- Pricing power / margin conversion: 10
- FCF / ROIC capture: 10
- Supply response / normalization risk: 5
- Regulatory / financing / concentration quality: 5

## States
### G0 — NORMAL
Adequate capacity and equipment availability; no structural bottleneck.

### G1 — TIGHTENING
Lead times, queues or capacity prices rise but evidence remains regional/temporary or speculative.

### G2 — BOTTLENECK CONFIRMED
Multiple primary indicators confirm a real constraint in power, interconnection, equipment or reliability.

### G3 — CAPTURE CONFIRMED
The bottleneck is converting into backlog, pricing, margins, contracted revenue and/or FCF for identifiable beneficiaries.

### G4 — CRITICAL SCARCITY
Persistent shortages materially delay load growth, reliability targets are missed and supply response remains too slow; economic capture may be high but policy/regulatory intervention risk also rises.

### GN — NORMALIZATION
Lead times/backlogs/capacity prices and firm-demand indicators are easing enough to reduce scarcity economics.

## Initial evidence checkpoint — 2026-08-18
**Provisional state: G2_BOTTLENECK_CONFIRMED; G3 candidates require company-level primary proof.**

Trigger evidence supplied for research includes very large Texas/PJM data-center interconnection queues, sharply higher PJM capacity pricing/reliability pressure and multi-year transformer lead times. The gross queue is explicitly discounted because low-cost queue entry can create phantom demand.

State promotion to G3 requires company-level proof that scarcity is converting into backlog/revenue/margin/FCF/ROIC rather than merely higher narrative exposure.

## Priority audit universe
### Equipment
ETN, SU.PA / Schneider Electric, ABB, Prysmian and other verified transformer/switchgear/cable suppliers.

### EPC / installation
PWR and other transmission/substation/data-center electrical contractors.

### Generation / power sellers
CEG, VST and other companies with credible data-center/capacity contracts.

### Utilities
Regional utilities only after regulatory, balance-sheet and valuation gates.

## Cross-engine integration
- Feeds **Global CAPEX Chain Ω**: CAPEX Position, Bottleneck Persistence and CAPEX Convergence.
- Feeds **Power Owners / AI Campus Conversion Ω** with external grid scarcity and energization evidence.
- Feeds **AI CAPEX Payback Ω** as a constraint/cost/timing input, not as end-demand proof.
- Feeds **Institutional Rotation Ω** only after separating price leadership from real order/backlog/flow evidence.
- Feeds **Valuation / Expected Return Ω** after capture is demonstrated.
- Does not issue automatic portfolio changes.

## Standard output
`Region → gross queue MW → firm-load funnel → reserve/reliability → capacity price → transformer/switchgear lead time → supplier backlog → EPC awards → generation contracts → FCF/ROIC capture → BOTTLENECK STATE → capture layer E/C/G/U → normalization risks → falsifiers`

## Falsifiers / normalization triggers
- high queue cancellation/withdrawal rates materially reduce firm load;
- transformer/switchgear lead times normalize rapidly;
- factory/grid capacity additions outpace firm demand;
- capacity auction prices normalize without reliability deterioration;
- hyperscaler/data-center projects are delayed/cancelled at scale;
- supplier backlog rises but margins/FCF fail to convert;
- regulatory intervention caps economic capture materially;
- financing costs overwhelm utility/generator/EPC returns.

## Decision authority
This engine can promote or demote grid/power bottleneck conviction and rank capture layers. It cannot issue an automatic trade. Principal Ω, valuation, risk and Falsifiers Ω retain final authority.