# AI CAPEX PAYBACK Ω v2.0

**Status:** CANONICAL MODULE  
**Date:** 2026-08-16  
**Scope:** ATLAS Ω ENTERPRISE v3.1

## Mission
Measure whether extraordinary AI/infrastructure CAPEX is converted into sufficient economic returns. High CAPEX is not bearish by itself; the engine audits economic proof.

## Canonical chain
`AI CAPEX → installed capacity → utilization → pricing → AI revenue → gross profit → OCF → FCF/share → incremental ROIC → payback`

This engine is independent from AI Financial Fragility Ω and AI Credit Transmission Ω. Economic payback, financing fragility and credit transmission are related but not interchangeable.

## Required inputs
1. Total CAPEX and YoY growth.
2. AI/data-center CAPEX or disclosed proxy.
3. Installed capacity / deployment milestones.
4. Utilization / supply constraints / booked capacity where disclosed.
5. AI-related revenue or monetization proxy.
6. Pricing / unit economics / cost-per-inference or comparable efficiency metrics.
7. Gross profit/margin.
8. OCF and OCF margin.
9. FCF/share and FCF margin.
10. Incremental FCF / incremental CAPEX.
11. ROIC and incremental ROIC.
12. Backlog/RPO/TCV/contracted demand.
13. Depreciation, useful-life assumptions and maintenance CAPEX.
14. Net debt/cash, interest and financing needs.
15. SBC/dilution and buybacks net of SBC.
16. Purchase commitments / OCF.
17. Lease commitments / OCF.
18. Customer concentration.
19. Management guidance on CAPEX and monetization.

Never fabricate undisclosed AI-revenue splits or utilization.

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
- Commitments/OCF and leases/OCF.

## State machine
### GREEN — PRODUCTIVE
CAPEX rises with utilization, monetization, FCF/share and ROIC evidence.

### YELLOW — EARLY / PAYBACK WATCH
CAPEX leads monetization but contracted demand/utilization and economics remain credible.

### ORANGE — ECONOMIC PROOF WEAKENING
CAPEX/commitments continue rising while OCF/FCF/share, utilization or pricing fail to scale.

### RED — PAYBACK FAILURE / FALSIFIER CANDIDATE
Persistent monetization miss + deteriorating incremental ROIC/FCF + weak utilization/backlog or owner-economics destruction.

RED requires thesis audit; it does not mechanically execute SELL.

## Score 0–100
- Monetization vs CAPEX: 20
- Utilization/pricing validation: 15
- Incremental FCF conversion: 20
- Incremental ROIC: 20
- Demand/backlog/contract quality: 10
- Balance-sheet/owner economics: 10
- Maintenance/depreciation discipline: 5

## Cross-engine integration
`AI CAPEX PAYBACK Ω` → economic proof.

`AI FINANCIAL FRAGILITY Ω` → whether financing burden/commitments are stretching owner economics.

`AI CREDIT TRANSMISSION Ω` → how the investment is externally financed and collateralized.

`SYSTEMIC CASCADE Ω` → whether deterioration propagates across credit/sovereign channels.

Do not double-count the same evidence in multiple scores.

## Bubble-risk law
ATLAS never uses “AI bubble yes/no” as a trade signal. Separate technology validity, business profitability, payback, financing structure, security valuation and regime risk.

## Standard output
Ticker → CAPEX → capacity → utilization → pricing → monetization → OCF → FCF/share → incremental ROIC → payback → commitments/leases → PAYBACK STATE → milestones → falsifiers → cross-engine effects → allowed action.

## Canonical principle
The falsifier is not high CAPEX. It is sustained failure to convert committed capital into adequate incremental owner economics.
