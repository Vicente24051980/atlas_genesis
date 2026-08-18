# AI FINANCIAL FRAGILITY Ω v1.1

**Status:** CANONICAL SPECIALIZED ENGINE  
**Date:** 2026-08-18

## Mission
Measure whether AI investment remains economically self-funding or is becoming increasingly dependent on commitments, leases, credit, collateral and external financing.

## Core chain
`AI CAPEX → capacity → utilization → unit pricing → workload volume → AI revenue/gross profit → OCF → FCF/share → incremental ROIC → payback → financing burden`

## Obligation Classification Ω
Never label every future commitment as “debt”. Separate:

A. recognized financial debt;
B. recognized lease liabilities;
C. leases not yet commenced / not yet recognized;
D. non-cancellable purchase, capacity, power, server or infrastructure commitments;
E. guarantees, vendor financing, SPV/backstop and contingent exposures.

Rules:
- C/D/E can be economically material without being accounting debt.
- Track each bucket independently against OCF, FCF, cash/liquidity and deployment timing.
- Track when non-commenced leases become recognized balance-sheet liabilities.
- Do not double-count the same commitment across Financial Fragility Ω, CAPEX Payback Ω and Credit Transmission Ω.

## Fragility variables
- CAPEX / OCF and change;
- CAPEX growth vs OCF growth;
- FCF/share trajectory;
- purchase commitments / OCF;
- lease commitments / OCF, split recognized vs not commenced;
- obligation maturity / cash-outflow schedule;
- utilization and pricing;
- workload-volume elasticity vs price compression;
- customer concentration;
- vendor financing/private-credit dependence;
- debt/interest burden;
- dilution/SBC;
- refinancing need;
- guarantees/backstops/SPV exposure;
- gross-profit conversion from incremental AI capacity.

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

## Watch Overlay Ω
The watch overlay is independent of F0–F4 and can tighten surveillance without prematurely changing the structural state.

- `W0_NORMAL` — no unusual financing/payback concern.
- `W1_ELEVATED` — one material pressure vector; monitor.
- `W2_YELLOW_HIGH` — multiple early-warning vectors, but cash-flow/credit deterioration is not yet confirmed.
- `W3_RED_REVIEW` — evidence is sufficient to force an extraordinary thesis/falsifier review.

### W2 trigger examples
- extraordinary forward leases/purchase commitments + falling AI unit pricing;
- commitments/OCF rising sharply while monetization visibility is incomplete;
- financing dependence rising before FCF deterioration is fully visible;
- material price compression where volume elasticity and unit-cost offsets are still unproven.

W2 is **not** F3/F4 and is **not** a confirmed falsifier.

## Price–Volume–Cost Fragility Law
`token/API/workload price ↓` alone is not financial fragility.

Escalate only when price compression is not sufficiently offset by:
- workload/token volume growth;
- lower unit inference/training costs;
- improving utilization;
- indirect AI monetization;
- gross-profit and OCF/FCF conversion.

The relevant failure pattern is:
`commitments ↑↑ + price/unit ↓ + volume insufficient + unit-cost offset insufficient + gross profit/FCF ↓ + financing dependence ↑`.

## Current evidence checkpoint — 2026-08-18
**Watch Overlay: W2_YELLOW_HIGH.**

Rationale: hyperscaler infrastructure commitments and competitive AI pricing pressure justify elevated surveillance. The evidence currently supports a **watch escalation**, not a confirmed F3/F4 state and not a Falsifiers Ω veto.

Required evidence to escalate materially:
1. commitments/OCF or leases/OCF continue deteriorating;
2. OCF/FCF/share weakens persistently;
3. utilization or workload-volume growth fails to compensate for pricing pressure;
4. debt, vendor financing, guarantees or refinancing dependence rises;
5. incremental ROIC/payback weakens across more than one reporting period or is corroborated by primary disclosures.

Priority audit universe: GOOGL/GOOG, META, MSFT, ORCL, AMZN and material linked infrastructure financiers/providers.

## Laws
- HIGH CAPEX != F2/F3 automatically.
- CAPEX CUT != AI BUST automatically.
- Falling token prices != monetization failure automatically.
- Off-balance commitments != financial debt automatically.
- Financing structure and economic proof are separate from technology quality.
- F4 requires multi-source, multi-variable confirmation.
- Falsifiers Ω remains independent and retains absolute veto only on confirmed structural evidence.

## Integration
Feeds AI CAPEX Payback Ω, AI Credit Transmission Ω, Systemic Cascade Ω, Market Top Risk Ω, Successor Detection Ω and Portfolio Risk Ω.

## Decision authority
No automatic BUY/SELL. W2 or F2 can tighten entry thresholds, increase falsifier priority and reduce allowed sizing for financially reflexive candidates. F3/F4 require extraordinary audit; structural action still follows the canonical evidence and Falsifiers Ω gates.