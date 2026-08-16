# AI FINANCIAL FRAGILITY Ω v1.0

**Status:** CANONICAL SPECIALIZED ENGINE  
**Date:** 2026-08-16

## Mission
Measure whether AI investment remains economically self-funding or is becoming increasingly dependent on commitments, leases, credit, collateral and external financing.

## Core chain
`AI CAPEX → capacity → utilization → pricing → AI revenue → OCF → FCF/share → incremental ROIC → payback`

## Fragility variables
- CAPEX / OCF and change;
- CAPEX growth vs OCF growth;
- FCF/share trajectory;
- purchase commitments / OCF;
- lease commitments / OCF;
- utilization and pricing;
- customer concentration;
- vendor financing/private-credit dependence;
- debt/interest burden;
- dilution/SBC;
- refinancing need.

## State machine
### F0 HEALTHY
CAPEX rises with monetization, OCF/FCF, utilization and ROIC.

### F1 EXPANSION
CAPEX grows faster than OCF but payback/economics remain credible.

### F2 STRETCHED
Commitments/leases/CAPEX rise materially while FCF/share or ROIC is pressured.

### F3 FRAGILE
Revenue revisions/utilization weaken while concentration and financing dependence rise.

### F4 CASCADE RISK
CAPEX cuts/cancellations, pricing/collateral deterioration, spread widening or forced deleveraging appear together.

## Laws
- HIGH CAPEX != F2/F3 automatically.
- CAPEX CUT != AI BUST automatically.
- Financing structure and economic proof are separate from technology quality.
- F4 requires multi-source, multi-variable confirmation.

## Integration
Feeds AI CAPEX Payback Ω, AI Credit Transmission Ω, Systemic Cascade Ω, Market Top Risk Ω, Successor Detection Ω and Portfolio Risk Ω.

## Decision authority
No automatic BUY/SELL. It can tighten entry thresholds, increase falsifier priority and reduce allowed sizing for financially reflexive candidates.