# ATLAS Ω v3.1.1 — PAYBACK_TEST cross-sectional calibration

Fecha: 17-ago-2026
Scope: AMZN, MSFT, GOOGL, META
Status: CALIBRATED_RELATIVE / ABSOLUTE_THRESHOLDS_NOT_CALIBRATED

## 1. Definiciones homogéneas

Para evitar mezclar accrual CapEx, cash CapEx, finance leases y vendor incentives, se adoptan dos métricas:

- `Cash_CapEx`: efectivo pagado por PP&E; en Amazon se usa PP&E neto de proceeds/incentives porque la propia compañía define así su FCF.
- `Infrastructure_Burden`: Cash_CapEx + principal de finance leases/financing obligations cuando la compañía lo reporta de forma material.
- `OCF`: net cash provided by operating activities.
- `Capital_Intensity_Ratio (CIR) = Cash_CapEx / OCF`.
- `Regime_Break = Current_CIR / max(CIR_2023,CIR_2024,CIR_2025)`.

No se usa un umbral universal de CIR entre compañías porque las definiciones y mix económico no son idénticos.

## 2. Series homogéneas

| Company | 2023 CIR | 2024 CIR | 2025 CIR | Current/TTM CIR | Current vs prior max |
|---|---:|---:|---:|---:|---:|
| AMZN | 0.567 | 0.670 | 0.920 | 1.047 | 1.138x |
| MSFT | 0.321 | 0.375 | 0.474 | 0.634 | 1.337x |
| GOOGL | 0.317 | 0.419 | 0.555 | 0.713 | 1.284x |
| META | 0.380 | 0.408 | 0.602 | 0.709 | 1.179x |

Aggregate four-company CIR:
- 2023: 0.392
- 2024: 0.470
- 2025: 0.636
- Current/TTM: 0.772

Interpretación: los cuatro hyperscalers están por encima de su máximo de intensidad de capital 2023-2025. Esto confirma un `SYSTEMIC_CAPITAL_INTENSITY_REGIME_BREAK`, pero no demuestra fragilidad porque todos mantienen evidencia de demanda.

## 3. Current demand proof

### AMZN
- AWS Q2 2026 revenue +37% YoY to $42.2B.
- AWS operating income $16.6B vs $10.2B.
- OCF TTM $161.4B.
- Cash CapEx net TTM ~ $169.0B, FCF -$7.6B.
- Status: `AMBER_REINFORCED / PAYBACK_TEST`.

### MSFT
- Azure +43% YoY in FY26 Q4.
- FY26 OCF $182.9B.
- FY26 cash additions to PP&E $115.95B.
- CIR 0.634 vs prior max 0.474.
- Status: `PAYBACK_TEST / STRONG_DEMAND_PROOF`.

### GOOGL
- Q2 2026 Google Cloud revenue +82% YoY to $24.77B.
- Cloud operating income $8.81B vs $2.83B.
- TTM OCF $185.7B; TTM CapEx $132.4B; FCF $53.3B.
- CIR 0.713 vs prior max 0.555.
- Status: `PAYBACK_TEST / STRONG_DEMAND_PROOF`.

### META
- Q2 revenue $60.8B, +28% YoY.
- Q2 OCF $31.86B; CapEx incl. finance lease principal $31.08B; FCF $0.784B.
- TTM reconstructed OCF ~ $130.3B; cash infrastructure burden ~ $92.4B; CIR ~0.709 vs prior max ~0.602.
- Demand proof exists in the core ads business, but margin/FCF absorption and legal costs are under stress.
- Status: `AMBER_HIGH / PAYBACK_AND_COST_ABSORPTION_WATCH`.

## 4. Calibrated logic

Absolute thresholds remain uncalibrated. The calibrated gate is company-relative:

```yaml
PAYBACK_TEST_v3_1_1:
  INPUTS:
    - current_CIR
    - prior_3Y_max_CIR
    - segment_revenue_growth
    - segment_operating_income_growth
    - OCF_trend
    - FCF_trend
    - backlog_or_capacity_constraint
    - financing_structure

  IF current_CIR <= prior_3Y_max_CIR:
      IF demand_proof == STRONG:
          STATUS = HEALTHY_PAYBACK
      ELSE:
          STATUS = NORMAL_WATCH

  IF current_CIR > prior_3Y_max_CIR:
      STATUS = CAPITAL_INTENSITY_REGIME_BREAK
      IF demand_proof == STRONG AND segment_op_income_trend == POSITIVE:
          STATUS = PAYBACK_TEST
      IF demand_proof == STRONG AND FCF_compression == SEVERE:
          STATUS = AMBER_PAYBACK
      IF demand_proof == WEAK_OR_DECELERATING AND FCF_ROIC_trend == DETERIORATING:
          STATUS = FRAGILITY_CANDIDATE

  RED_ALERT:
      requires:
        - >= 2 independent valid signals
        - economic materiality
        - primary-source confirmation
        - no one-off accounting explanation sufficient
```

## 5. Systemic Payback Monitor v3.1.1

No universal 2.5x threshold. Use breadth + direction:

- `Breadth_Regime_Break = count(companies with CIR > own prior-3Y max) / 4`
- Current = 4/4 = 100%.
- `Aggregate_CIR` = sum(Cash_CapEx) / sum(OCF).
- Aggregate CIR: 0.392 -> 0.470 -> 0.636 -> 0.772.

Systemic state:
- `AMBER_SYSTEMIC_PAYBACK_WATCH`, because capital intensity is at a new regime high across all four.
- Not `FRAGILITY_SIGNAL` because AMZN AWS +37%, MSFT Azure +43%, GOOGL Cloud +82%, META revenue +28% provide concurrent demand proof.

Escalation to systemic fragility requires at least two companies showing BOTH:
1. CIR remains above own historical max or continues rising,
2. demand growth decelerates materially,
3. segment operating income/margin deteriorates,
4. FCF/OCF conversion deteriorates further,
5. external financing/lease/off-balance-sheet commitments rise materially.

## 6. Current ranking by payback quality

1. MSFT — strongest demonstrated payback with high OCF coverage and Azure acceleration.
2. GOOGL — very strong Cloud economics; capital intensity rising fast but FCF remains positive.
3. AMZN — strongest demand proof but highest cash intensity; FCF negative, so AMBER_REINFORCED.
4. META — demand proof exists, but cost absorption, legal charges, FCF compression and financing complexity make it highest fragility watch of the four.

## 7. Canonical rules

- `CAPEX_INCREASE != NEGATIVE_SIGNAL`
- `FCF_NEGATIVE_ALONE != FALSIFIER`
- `CAPEX_INCREASE + STRONG_DEMAND_PROOF = PAYBACK_TEST`
- `CAPEX_REGIME_BREAK + WEAKENING_DEMAND + DETERIORATING_FCF_ROIC = FRAGILITY_CANDIDATE`
- `ABSOLUTE_CROSS_COMPANY_CAPEX_OCF_THRESHOLD = UNCALIBRATED`
- `COMPANY_RELATIVE_REGIME_BREAK = CALIBRATED`
- `SYSTEMIC_MONITOR = BREADTH + AGGREGATE_DIRECTION + DEMAND_PROOF`

## 8. Sources
Primary SEC/IR filings used: Amazon 2024/2025 10-K and Q2 2026 earnings release; Microsoft FY2023/FY2024/FY2025/FY2026 SEC filings; Alphabet 2024/2025 10-K and Q2 2026 release; Meta 2025 10-K and Q2 2026 release.
