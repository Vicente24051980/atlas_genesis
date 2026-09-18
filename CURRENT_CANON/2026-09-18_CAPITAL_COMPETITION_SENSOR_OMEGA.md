# CAPITAL COMPETITION Ω — SENSOR v1.0

**Date:** 2026-09-18  
**Status:** IMPLEMENTED / CANON-COMPATIBLE SENSOR  
**Placement:** Capital Formation specialized module → E2 scenario inputs + E5 causal-factor map  
**Primary-engine status:** NOT A NEW PRIMARY ENGINE  
**Direct score weight:** 0  
**IRR bonus/penalty:** 0  
**Portfolio authority:** NONE  
**Selection authority:** NONE  
**Timing authority:** NONE by itself

## 0. Governance decision

Capital Competition Ω is implemented as a **sensor inside Capital Formation**, not as a new canonical layer and not as a new Level-1 AI CAPEX engine.

Rationale:

- ATLAS v3.3 remains closed around the six-engine architecture.
- Capital Formation already owns financing structure, funding quality and capital availability.
- E2 already owns scenario economics, including discount-rate/refinancing consequences.
- E5 already owns causal-factor concentration and common-factor exposure.
- AI CAPEX Conversion may consume the sensor output as context, but does not own or duplicate it.
- No new score, gate, quota or portfolio class is created.

Canonical routing:

```text
E1 evidence/provenance
      ↓
CAPITAL_COMPETITION · sensor
      ├──→ E2 scenarios: refinancing / WACC / dilution / FCF-after-financing
      └──→ E5 map: common financing factor / correlated exposure
```

## 1. Core distinction

```text
PRICE_OF_CAPITAL ↑  ≠  QUANTITY_RATIONING
```

Verified marginal concessions or wider spreads establish that capital is more expensive.

They do **not** establish that capital is unavailable.

Rationing requires observable quantity failure such as:

- withdrawn or failed issuance;
- bridge financing that cannot refinance;
- committed financing that cannot close;
- CAPEX cuts explicitly attributed to financing cost/availability;
- project cancellation or material downsizing explicitly attributed to financing constraints.

Until then:

`RATIONING = NOT_OBSERVED` or `EARLY_WARNING`, never silently `OBSERVED`.

## 2. Mandatory yield-confounder control

Long-end yield movement is never attributed to AI financing alone unless competing drivers have been excluded.

Mandatory causes to test:

- Fed path / policy-rate repricing;
- inflation and energy;
- fiscal / Treasury supply;
- term premium;
- mortgage / agency supply where material;
- corporate AI debt supply.

Output states:

`FED_PATH | TERM_PREMIUM_FISCAL | AI_CORPORATE_SUPPLY | MIXED | UNKNOWN`

If two or more causal drivers are active:

`YIELD_ATTRIBUTION = MIXED`

This prevents:

`10Y ↑ → AI financing caused it`

without evidence.

## 3. Structure segmentation

Capital pressure is not homogeneous.

| Structure | Default marginal-financing sensitivity | Reason |
|---|---:|---|
| Hyperscaler corporate | LOW | Large internal cash generation / very low post-issue leverage relative to project finance |
| Chip-backed ABS / collateralized chip loan | HIGH | Depends on collateral value, contract quality, advance rate and refinance market |
| SPV / JV project finance | HIGH | Project-level cash flow, covenant and refinancing dependence |
| Neocloud | HIGH | Greater dependence on external capital, customer concentration and asset residual-value assumptions |
| Other | CASE_SPECIFIC | Must be underwritten directly |

This is a starting risk classification only. Company-specific E2 evidence can override it.

## 4. Capital as parent causal factor

Capital is **not** the first item in a linear AI chain.

It is a parent cause financing multiple branches in parallel:

```text
                   CAPITAL
          ┌──────────┼───────────┬───────────┐
          ↓          ↓           ↓           ↓
        POWER       GRID       COMPUTE     NETWORK
          ↓          ↓           ↓           ↓
       capacity   capacity    capacity     capacity
          └──────────┴───────────┴───────────┘
                         ↓
                 revenue / margin / FCF
```

Therefore Capital Competition belongs in the Causal Factor Map.

## 5. Same-dollar law

The financing transaction and the asset purchase funded by that transaction are not independent capital pools.

Example pattern:

```text
LOAN/SPV FINANCING → TPU/GPU PURCHASE
```

is one economic dollar.

Canonical handling:

`DERIVED_DO_NOT_COUNT_AS_NEW_POOL`

This extends the existing DCRT double-count discipline.

## 6. State contract

```text
CAPITAL_COMPETITION · sensor

PRICE_PRESSURE
  DATA_INSUFFICIENT | BENIGN | ACTIVE | STRESSED

TREND
  UNKNOWN | FALLING | STABLE | RISING

RATIONING
  UNKNOWN | NOT_OBSERVED | EARLY_WARNING | OBSERVED

YIELD_ATTRIBUTION
  UNKNOWN | FED_PATH | TERM_PREMIUM_FISCAL |
  AI_CORPORATE_SUPPLY | MIXED

MOST_EXPOSED
  CHIP_ABS | SPV_JV | NEOCLOUD

AUTHORITY
  E2_SCENARIOS_PLUS_E5_CAUSAL_MAP

DIRECT_SCORE_WEIGHT = 0
IRR_BONUS_PENALTY = 0
BUY_SELL_AUTHORITY = FALSE
PORTFOLIO_QUOTA_AUTHORITY = FALSE
CORE_LABEL_AUTHORITY = FALSE
```

## 7. Baseline · 18-SEP-2026

This baseline records the evidence packet supplied and reviewed on 18-SEP-2026. It is not a permanent state.

```text
PRICE_PRESSURE    = ACTIVE
  confidence HIGH: documented marginal concessions

TREND             = RISING
  confidence MEDIUM: material Fed confounder remains

RATIONING         = NOT_OBSERVED

YIELD_ATTRIBUTION = MIXED

MOST_EXPOSED      = CHIP_ABS / SPV_JV / NEOCLOUD

AUTHORITY         = E2 scenarios + E5 causal map

IRR_BONUS/PENALTY = 0
```

### Evidence ledger

1. **Crux AI financing**
   - Classification: REPORTED FACT / secondary-source report citing anonymous sources.
   - Reuters/Bloomberg report: ten banks, USD 22bn loan, chip collateral/customer contracts, Blackstone equity contribution.
   - Important consequence: successful financing is evidence against current quantity rationing.
   - Refinance-to-IG possibility is a future path, not realized refinancing.

2. **AI corporate debt buyer fatigue**
   - Classification: VERIFIED MARKET EVIDENCE for marginal price pressure.
   - Concessions / extra yield needed for placement support `PRICE_PRESSURE = ACTIVE`.
   - Does not by itself support `RATIONING = OBSERVED`.

3. **Magnitude estimates**
   - Goldman, Vanguard and Morgan Stanley estimates use different perimeters.
   - They must remain separate series.
   - `$2.9T through 2028 / $1.5T financing gap` is an estimate from a prior model, not a 2026 observed total.

4. **Fed confounder**
   - The 16-SEP-2026 FOMC hike creates a simultaneous rate-path shock.
   - Therefore 2026 yield attribution is mixed unless decomposed with explicit evidence.

## 8. Escalation test

Promote from price pressure toward rationing only if at least one observable quantity failure appears and survives source validation.

High-information rationing observations:

- withdrawn corporate/ABS issuance;
- bridge debt unable to refinance;
- failed syndication;
- material increase in haircut/advance-rate requirements that reduces project size;
- CAPEX deferral explicitly attributed to financing conditions;
- equity raise forced primarily by inability to clear debt rather than voluntary capital structure optimization.

Absent those:

`CAPITAL_IS_MORE_EXPENSIVE`

may be true while:

`CAPITAL_IS_RATIONED`

remains false.

## 9. Company routing

Capital Competition does not classify a ticker as CORE/LAB/SELECT.

For any company:

```text
POINT ZERO
→ E1
→ E2
→ E3
→ E4 SELECT/WATCH/REJECT
→ E5 size/concentration
→ timing
```

No ticker receives a portfolio-class advantage from this sensor.

Specific implications:

- MU / MRVL: ordinary Point Zero candidates; no preallocated AI slots.
- BAC / RCL: no CORE label before E2/E3/E4.
- BAC / RCL / MU / MRVL: `BROKER_REALITY_UNKNOWN` relative to the last confirmed 17-SEP 21:15 portfolio capture until a newer broker capture reconciles them.
- GOOG / MSFT / ANET / COHR: common exposure to the same parent financing factor must be mapped in E5.
- Broker reality remains separate from analytical candidacy. A research candidate can never be treated as an executed holding without reconciliation.

## 10. Falsifiers

The `PRICE_PRESSURE = ACTIVE/RISING` thesis weakens if:

- financing concessions normalize despite sustained AI issuance;
- credit spreads tighten while issuance remains high;
- self-funding replaces external funding materially;
- project financing continues clearing without worsening terms;
- no quantity-rationing events emerge over repeated refinancing windows.

The `CAPITAL_AS_DOMINANT_BOTTLENECK` hypothesis is **not confirmed** unless quantity constraints appear.

## 11. Implementation

- `src/atlas/algorithm/capital-competition-sensor-omega.ts`
- `src/atlas/algorithm/capital-competition-sensor-omega.test.ts`

## Final law

> Capital can become expensive long before it becomes scarce. ATLAS must measure the price of capital, the quantity of capital and the causal attribution separately.
