# ATLAS Ω — AI DATA CENTER RISK TRANSFER Ω — EVIDENCE BASELINE v1

**Cut:** 2026-09-12  
**Status:** ACTIVE / POINT-IN-TIME E1 EVIDENCE LEDGER  
**Parent:** `CURRENT_CANON/AI_DATA_CENTER_RISK_TRANSFER_OMEGA.md`  
**Scope authority:** this ledger supersedes only the operational seed-state snapshot in Section 9 of the parent canon when later evidence is stronger. It does not change module architecture, scoring ownership, FRU-MATH, portfolio authority or the six-engine kernel.

## 1 — System-level state at this cut

- `DCRT_MARKET_STAGE = M2_DEDICATED_CAPACITY_FORMING`
- `M3_REINSURANCE_TRANSFER_ACTIVE = NOT_YET_PROVEN_TO_CANONICAL_STANDARD`
- `M4_ALTERNATIVE_CAPITAL_ACTIVE = NOT_YET_PROVEN_TO_CANONICAL_STANDARD`
- `DEDICATED_DATA_CENTER_CAT_BOND = NOT_IDENTIFIED`
- `PORTFOLIO_ACTION = NONE`
- `T5_AUTHORIZED_SEEDS = NONE`

Reason: dedicated data-centre insurance capacity/program infrastructure is directly evidenced, but ATLAS has not yet identified and traced a dedicated data-centre reinsurance transaction sufficient for M3 or an executed dedicated CAT bond/ILS/sidecar sufficient for M4. Company-level attributable revenue/margin evidence (`C3/E3`) is also absent from the seed evidence below, so the existing T5 CRTA contract remains unauthorized for every seed at this cut.

## 2 — Primary / high-quality market evidence

### EV-DC-20260912-01 — Swiss Re Institute

Source: https://www.swissre.com/institute/research/sigma-research/sigma-insights-07-2026-insuring-ai-data-centre-risks.html

Observed / published:
- global data-centre insurance premiums expected to rise from approximately **USD 10.6bn to USD 24.2bn by 2030**;
- data-centre projects can reach roughly **USD 20bn** scale, creating material accumulation and re/insurance complexity.

Classification: `PRIMARY / PUBLISHED MODEL ESTIMATE`.

Use: establishes protection-gap / accumulation relevance. Forecasted premium growth is not realized company revenue.

### EV-DC-20260912-02 — Swiss Re Institute lifecycle demand

Source: https://www.swissre.com/institute/research/sigma-research/sigma-2026-03-time-to-build/03-2026-Insurance-demand-across-lines-and-lifecycle.html

Observed / published:
- approximately **USD 91bn cumulative 2026–2030 insurance premiums** forecast from AI data centres.

Classification: `PRIMARY / PUBLISHED MODEL ESTIMATE`.

Use: market opportunity only; no company attribution.

### EV-DC-20260912-03 — Aon DCLP

Sources:
- https://www.aon.com/en/insights/articles/data-center-accumulation-risk-management
- https://ir.aon.com/

Observed / published:
- Aon Data Center Lifecycle Insurance Program consolidates construction, cyber, cargo and operational cover;
- current announced program capacity: **USD 5bn**;
- prior **USD 3.5bn** capacity is historical, not the current baseline.

Classification: `PRIMARY COMPANY EVIDENCE`.

Use: confirms system `M2`; AON `C1_COMPANY_POSITIONING`. Announced capacity does not prove utilization, fee revenue or margin.

### EV-DC-20260912-04 — Marsh Stratus

Source: https://www.marsh.com/en/about/media/marsh-launches-stratus-ten-billion-property-insurance-exchange.html

Observed / published:
- Stratus launched 26-Aug-2026 for operational digital infrastructure risks;
- access to up to **USD 10bn property insurance capacity on a single-placement basis**;
- **30 traditional and alternative capital providers** evaluate each risk individually.

Classification: `PRIMARY COMPANY EVIDENCE`.

Use: confirms system `M2`; MRSH `C1_COMPANY_POSITIONING`. Exchange capacity and alternative-capital participation do not prove an executed dedicated ILS/CAT bond transaction.

### EV-DC-20260912-05 — Munich Re data-centre LD cover

Source: https://www.munichre.com/en/solutions/for-industry-clients/liquidated-damage-cover-data-centers.html

Observed / published:
- Munich Re offers a dedicated Liquidated Damages cover for data-centre projects to insure part of the SLA-vs-construction-contract LD gap after contractor delay;
- product requires project/contract due diligence and addresses developer/owner balance-sheet exposure.

Classification: `PRIMARY COMPANY EVIDENCE`.

Use: MUV2/Munich Re is promoted from launch seed `C0` to `C1_COMPANY_POSITIONING`. Product existence does not prove material attributable premiums, margin or FCF.

### EV-DC-20260912-06 — Verisk U.S. Data Center Exposure Database

Source: https://www.globenewswire.com/news-release/2026/09/03/3355672/0/en/amid-ai-boom-verisk-launches-new-view-of-u-s-data-center-exposure-helping-insurers-assess-growing-concentrations-of-risk.html

Observed / published by Verisk:
- launched 03-Sep-2026;
- building-level information for **more than 2,500 U.S. data-centre facilities**;
- available to insurers, reinsurers, brokers and other risk-management organizations through Verisk catastrophe-modeling workflows including Synergy Studio and Touchstone.

Classification: `PRIMARY-COMPANY RELEASE / PRODUCT EVIDENCE`.

Use: adds **VRSK** as `MODELING_ANALYTICS`, `H6_SECOND_ORDER_CAPTOR`, `C1_COMPANY_POSITIONING`. It is a potentially capital-light risk-transfer enabler, but product launch does not prove incremental data-centre revenue/margin or FCF.

## 3 — Company seed ledger

| Company | Role | H-class | Company proof | T5 CRTA | Current evidence conclusion |
|---|---|---|---|---|---|
| AON | Broker / reinsurance / structuring | H6 | `C1` | `NOT_AUTHORIZED` | Dedicated USD 5bn DCLP exists; utilization and attributable economics unresolved. |
| MRSH | Broker / reinsurance / capital-market exchange | H6 | `C1` | `NOT_AUTHORIZED` | Stratus up to USD 10bn capacity exists; placement economics unresolved. |
| MUV2 / Munich Re | Reinsurer / specialty underwriter | H6 | `C1` | `NOT_AUTHORIZED` | Dedicated data-centre LD cover exists; attributable economics unresolved. |
| VRSK | Modeling / exposure analytics | H6 | `C1` | `NOT_AUTHORIZED` | Dedicated data-centre exposure product exists; monetization materiality unresolved. |
| AJG | Broker / reinsurance / ILS structuring adjacency | H6 | `C1` | `NOT_AUTHORIZED` | Industry positioning exists; no qualifying attributable transaction in this ledger. |
| SREN / Swiss Re | Reinsurer / sector knowledge / capital-market adjacency | H6 | `C1` | `NOT_AUTHORIZED` | Strong sector evidence; no seed-level attributable C2/C3 economics established here. |
| HNR1 | Reinsurer | H6 | `C0` | `NOT_AUTHORIZED` | Company-specific qualifying evidence still required. |
| RNR | Reinsurer / ILS adjacency | H6 | `C0` | `NOT_AUTHORIZED` | Company-specific qualifying evidence still required. |
| ACGL | Insurer/reinsurer | H6 | `C0` | `NOT_AUTHORIZED` | Company-specific qualifying evidence still required. |
| BRO | Broker | H6 | `C0` | `NOT_AUTHORIZED` | Company-specific qualifying evidence still required. |

`C1` is not superior to `C0` economically; it only indicates traceable company positioning/product evidence. No seed is promoted to `C2` without a company-attributable transaction.

## 4 — Research priority, not investment ranking

### Priority A — monetize without retaining the full catastrophe tail

- **VRSK** — modeling / exposure data: test incremental revenue, cross-sell, pricing, renewal economics and whether data-centre concentration becomes a material product line.
- **AON / MRSH / AJG** — brokerage / placement / structuring: test fee capture per unit of placed capacity, utilization, repeat business and whether alternative-capital participation expands fee pools without proportional own-capital risk.

### Priority B — underwriting economics with tail risk

- **MUV2 / SREN / HNR1 / RNR / ACGL** — test premium capture, attachment points, exclusions, model uncertainty, aggregate limits, retrocession, loss experience and normalized underwriting ROIC.

This priority split is structural. It is not a BUY list and carries no valuation conclusion.

## 5 — Promotion requirements from this baseline

`C1 → C2` requires an identifiable company-attributable transaction, placement, contract, quota share, sidecar, ILS mandate or comparable event.

`C2 → C3` requires attributable reported or defensibly isolated revenue + margin economics.

`C3/C4 → T5` authorizes the existing `T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1`, which alone owns:

`CRTA = FCF captured / own capital at risk`

Invalid/zero capital-at-risk denominator remains `NO_CALCULABLE`.

## 6 — Mandatory unknowns

At this cut, do not impute:

- dedicated data-centre capacity utilization;
- company-specific premium/fee pool attributable to data centres;
- company-specific data-centre revenue or margin;
- company-specific FCF captured;
- own capital at risk attributable to the data-centre book;
- loss ratio / combined ratio for a dedicated data-centre book;
- dedicated data-centre ILS issuance volume;
- dedicated data-centre CAT bond spread;
- Trading 212 execution availability.

All remain `UNKNOWN` until evidenced.

## Final state

**Market formation is proven to M2. Company monetization is not yet proven beyond C1 for the leading seeds. Therefore discovery is active, but T5, FRU-MATH promotion and portfolio action remain blocked pending attributable economics.**
