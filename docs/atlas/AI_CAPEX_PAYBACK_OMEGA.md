# AI CAPEX PAYBACK Ω v2.2

**Status:** CANONICAL MODULE  
**Date:** 2026-09-14  
**Scope:** ATLAS Ω ENTERPRISE v3.1

## Mission
Measure whether extraordinary AI/infrastructure CAPEX is converted into sufficient economic returns. High CAPEX is not bearish by itself; the engine audits economic proof.

## Canonical chain
`AI CAPEX → installed capacity → utilization → unit pricing → workload/token volume → unit cost → AI/Cloud revenue → gross profit → OCF → FCF/share → incremental ROIC → payback`

This engine is independent from AI Financial Fragility Ω and AI Credit Transmission Ω. Economic payback, financing fragility and credit transmission are related but not interchangeable.

## Required inputs
1. Total CAPEX and YoY growth.
2. AI/data-center CAPEX or disclosed proxy.
3. Installed capacity / deployment milestones.
4. Utilization / supply constraints / booked capacity where disclosed.
5. AI-related revenue or monetization proxy.
6. Pricing / unit economics / cost-per-inference or comparable efficiency metrics.
7. Workload/token/API volume or a defensible utilization proxy.
8. Gross profit/margin and contribution economics where disclosed.
9. OCF and OCF margin.
10. FCF/share and FCF margin.
11. Incremental FCF / incremental CAPEX.
12. ROIC and incremental ROIC.
13. Backlog/RPO/TCV/contracted demand.
14. Depreciation, useful-life assumptions and maintenance CAPEX.
15. Net debt/cash, interest and financing needs.
16. SBC/dilution and buybacks net of SBC.
17. Purchase commitments / OCF.
18. Lease commitments / OCF.
19. Customer concentration.
20. Management guidance on CAPEX and monetization.
21. Indirect AI monetization evidence: ads/recommendation uplift, cloud attach, productivity or conversion effects where supportable.
22. Fresh-demand flow: new orders, book-to-bill, bookings/RPO additions and sequential backlog velocity where disclosed.
23. Cancellations, deferrals, pushouts, lead-time compression and capacity-reservation release where disclosed.
24. Persistent cross-chain market-break evidence supplied by AI CAPEX Marginal Demand Detector Ω.

Never fabricate undisclosed AI-revenue splits, token volumes, utilization, order data or unit economics.

## Fresh Demand Flow Layer Ω — v2.2

AI CAPEX Payback must distinguish **stock variables** from **flow variables**.

Lag chain:

`prior CAPEX budget → order / contract → backlog/RPO stock → delivery → revenue → margin → OCF/FCF`

Therefore:

- absolute backlog = visibility of previously contracted/estimated work;
- new orders / book-to-bill / bookings additions = fresher demand-flow evidence;
- backlog velocity = change in the contracted-demand stock after deliveries/cancellations;
- revenue / FCF = downstream economic conversion.

Canonical law:

`record backlog != proof of fresh CAPEX acceleration`.

A record backlog may coexist with marginal-demand deterioration for multiple quarters.

Fresh-flow monitoring is delegated to **AI CAPEX Marginal Demand Detector Ω v1.0**, an E5 Control / E6 Assurance detector with zero direct structural-score weight. It does not replace Payback Ω and cannot execute portfolio actions.

### Demand timing hierarchy

For detection timing, prefer:

`forward buyer CAPEX → new orders/book-to-bill → pipeline velocity/cancellations → absolute backlog → revenue → margin → FCF`.

This ordering does **not** mean orders are economically superior to FCF. It means they are earlier in the causal chain for detecting a turning marginal demand impulse.

## Price–Volume–Cost Elasticity Layer Ω
A fall in AI/token/API price is not automatically a monetization failure.

Measure independently:
- change in realized price per token/workload/API unit;
- change in workload/token/API volume;
- change in cost per inference/workload;
- change in contribution profit per unit;
- change in total AI/Cloud gross profit;
- indirect monetization outside explicit token billing.

Core diagnostic:
`Economic AI Throughput Proxy = Volume × Net Revenue per Unit × Contribution Margin`

Supporting diagnostics:
- `Volume Elasticity = %Δ workload volume / |%Δ unit price|`
- `Unit Economic Offset = %Δ unit cost relative to %Δ unit price`
- `AI Gross-Profit Conversion = Δ AI/Cloud gross profit / Δ AI CAPEX` when supportable.

### Interpretation law
- `token price ↓` alone = NO FALSIFIER.
- `token price ↓ + unit cost ↓ + volume ↑ enough` can preserve or improve economics.
- `token price ↓ + volume insufficient + cost/unit sticky + gross profit/FCF weakening` = material deterioration.
- For advertising-led hyperscalers, do not equate token billing with total corporate revenue dependence; indirect AI monetization must be audited separately.

## Off-Balance Commitment Normalization Ω
Do not collapse all future commitments into “debt”. Classify every obligation before scoring:

A. recognized financial debt;
B. recognized lease liabilities;
C. leases not yet commenced / not yet recognized as lease liabilities;
D. non-cancellable purchase, capacity, power, server or infrastructure commitments;
E. guarantees, vendor financing, SPV/backstop or other contingent economic exposures.

Rules:
- C/D/E are real economic commitments when enforceable, but they are not automatically financial debt.
- Never add A+B+C+D+E and label the total “debt”.
- Normalize each bucket against OCF, FCF, liquidity and committed capacity.
- Track timing of cash outflows and the point at which non-commenced leases enter the balance sheet.
- Feed financing structure to AI Financial Fragility Ω / AI Credit Transmission Ω without double-counting it in Payback Ω.

## Derived metrics
- CAPEX growth.
- OCF growth / CAPEX growth.
- Incremental FCF conversion = ΔFCF / ΔCAPEX.
- Incremental gross-profit conversion.
- AI revenue/CAPEX proxy where supportable.
- Payback period = relevant invested capital / normalized incremental annual cash return.
- Incremental ROIC = normalized incremental NOPAT / incremental invested capital.
- Depreciation pressure.
- Maintenance-CAPEX burden.
- Commitments/OCF and leases/OCF by obligation bucket.
- Price-volume-cost elasticity diagnostics.
- New-order growth and sequential acceleration/deceleration.
- Book-to-bill where meaningful.
- Backlog velocity after deliveries/cancellations.
- Cancellation/deferral/pushout trend.

## State machine
### GREEN — PRODUCTIVE
CAPEX rises with utilization, monetization, FCF/share and ROIC evidence, while fresh-demand flow remains credible.

### YELLOW — EARLY / PAYBACK WATCH
CAPEX leads monetization but contracted demand/utilization and economics remain credible. A price-regime break or marginal-flow warning may keep this state under tighter evidence collection.

### ORANGE — ECONOMIC PROOF WEAKENING
CAPEX/commitments continue rising while OCF/FCF/share, utilization, gross-profit conversion or price-volume-cost economics fail to scale; or the Marginal Demand Detector establishes broad fresh-flow deterioration requiring payback re-audit.

### RED — PAYBACK FAILURE / FALSIFIER CANDIDATE
Persistent monetization miss + deteriorating incremental ROIC/FCF + weak utilization/fresh-demand flow or owner-economics destruction.

RED requires thesis audit; it does not mechanically execute SELL.

## Score 0–100
- Monetization vs CAPEX: 20
- Utilization + price-volume-cost validation: 15
- Incremental FCF conversion: 20
- Incremental ROIC: 20
- Demand/backlog/contract quality: 10
- Balance-sheet/owner economics: 10
- Maintenance/depreciation discipline: 5

The 10-point demand/backlog/contract-quality bucket must now distinguish **fresh-flow evidence** from absolute backlog level. The new detector does not create extra score weight and therefore cannot double-count this evidence.

## Current evidence checkpoint — 2026-09-14
**Watch overlay:** YELLOW-HIGH / MARGINAL-DEMAND AUDIT OPEN.

Reason: persistent cross-chain price weakness since June can no longer be treated as a one-session narrative shock. At the same time, absolute supplier backlog may still reflect previously contracted demand. The required question is now whether **new CAPEX/order formation** is decelerating before the backlog/revenue stock rolls over.

This checkpoint is not a confirmed fundamental break and is not an automatic portfolio action.

Priority evidence:
1. hyperscaler forward CAPEX revisions and project phasing;
2. supplier new orders and book-to-bill;
3. sequential backlog velocity after revenue conversion;
4. cancellations/deferrals/pushouts;
5. lead-time and capacity-reservation changes;
6. downstream revenue guidance, margin, utilization and FCF confirmation.

Priority audit universe: GOOGL/GOOG, META, MSFT, ORCL, AMZN and the linked semis/networking/power/cooling/EPC chain.

## Cross-engine integration
`AI CAPEX MARGINAL DEMAND DETECTOR Ω` → early marginal-demand / backlog-lag detection.

`AI CAPEX PAYBACK Ω` → economic proof and capital conversion.

`GLOBAL CAPEX CHAIN Ω` → funding-pool and receiver map.

`NEXT-GEN SEMIS Ω` → linked price/fundamental migration evidence.

`AI FINANCIAL FRAGILITY Ω` → whether financing burden/commitments are stretching owner economics.

`AI CREDIT TRANSMISSION Ω` → how the investment is externally financed and collateralized.

`SYSTEMIC CASCADE Ω` → whether deterioration propagates across credit/sovereign channels.

Do not double-count the same evidence in multiple scores.

## Bubble-risk law
ATLAS never uses “AI bubble yes/no” as a trade signal. Separate technology validity, business profitability, marginal demand, payback, financing structure, security valuation and regime risk.

## Standard output
Ticker / chain → forward CAPEX → new orders/book-to-bill → backlog velocity → absolute backlog → capacity → utilization → unit pricing → volume → unit cost → monetization → gross profit → OCF → FCF/share → incremental ROIC → payback → commitments/leases by bucket → MARGINAL DEMAND STATE → PAYBACK STATE → milestones → falsifiers → cross-engine effects → allowed action.

## Canonical principle
The falsifier is not high CAPEX, falling token prices or falling share prices alone. It is sustained failure of **fresh economic commitment and/or committed capital** to convert into adequate incremental owner economics after accounting for demand-flow timing, volume elasticity, unit-cost improvement and indirect monetization.
