# ATLAS Ω v3.1 — Auditoría del backtest PAYBACK_TEST de AMZN

Fecha: 17-ago-2026
Estado: AUDIT_CORRECTION. El backtest previo NO queda validado 3/3 tal como estaba escrito.

## Hallazgos críticos de datos
1. Cash CapEx 2023: Amazon reportó $48.1B neto de proceeds/incentives, no $52.7B. $52.729B son compras brutas de PP&E.
2. Cash CapEx 2024: $77.7B neto. La cifra $131.8B corresponde a compras brutas de PP&E de 2025, no a 2024 ni a una reclassificación 2024.
3. Cash CapEx 2025: $128.3B neto; compras brutas PP&E $131.819B.
4. OCF correcto: 2023 $84.946B; 2024 $115.877B; 2025 $139.514B. El backtest previo desplazaba/misfechaba OCF.
5. AWS revenue: 2023 $90.757B (+13%); 2024 $107.556B (+19%); 2025 ~$128.7B (+20%).
6. AWS operating income: 2023 $24.631B; 2024 $39.834B; 2025 $45.606B.
7. FCF Amazon (definición GAAP-like propia): 2024 $38.219B; 2025 $11.194B. La caída se debe principalmente al aumento de cash capex.

## Q2 2026
Reuters, citando resultados y call de Amazon: CAPEX FY26 elevado ~10% a ~$220B; AWS revenue +37% a $42.2B; AWS backlog $496B; FCF TTM -$7.6B; 'lion's share' de capacidad AWS 2027 ya reservada y parte de 2028 reservada. Amazon sigue capacity-constrained.

## Corrección metodológica
El backtest no puede declararse '3/3 aprobado' porque contiene errores de periodización y definición de CapEx/OCF. La conclusión cualitativa de CAPEX_CONTEXT_EVAL sigue siendo razonable, pero debe revalidarse con series consistentes.

### Serie canónica para AMZN PAYBACK_TEST
- Cash CapEx = purchases PP&E net of proceeds/sales/incentives (misma definición cada periodo).
- OCF = Net cash provided by operating activities.
- FCF = OCF - cash capex neto, según definición Amazon.
- Demand proof = AWS revenue growth + backlog/RPO/commitments + capacity constraints + utilization proxies.
- Payback proof = AWS operating income growth/margin + incremental OCF attributable proxy + FCF normalization after capacity commissioning.
- No dividir guidance anual de capex entre 4.

### Ratios históricos correctos
2023: Cash CapEx 48.1 / OCF 84.946 ≈ 0.57x.
2024: 77.7 / 115.877 ≈ 0.67x.
2025: 128.3 / 139.514 ≈ 0.92x.
Esto muestra deterioro claro de cobertura por OCF, pero no fragilidad por sí solo porque AWS growth y operating income también aceleraron.

## Reglas corregidas
CAPEX_INCREASE + STRONG_DEMAND_PROOF = PAYBACK_TEST, no GREEN automático.
PAYBACK_TEST debe permanecer AMBER mientras no exista evidencia suficiente de incremental ROIC/payback.
FCF_NEGATIVE no es falsificador aislado.
SYSTEMIC_PAYBACK_MONITOR no debe usar un umbral 2.5x sin backtest cross-company y definición consistente de capex/OCF. Ese threshold queda UNCALIBRATED.
'OCF incremental cubre >15% del capex trimestral' también queda UNCALIBRATED y no puede ser falsificador canónico todavía.

## Veredicto
AMZN: AMBER_REINFORCED / PAYBACK_TEST válido como estado, pero el backtest histórico previo se corrige a NOT_YET_VALIDATED_QUANTITATIVELY.
La arquitectura CAPEX_CONTEXT_EVAL se mantiene; sus umbrales numéricos quedan pendientes de calibración empírica robusta.

## Fuentes
- Amazon 2024 10-K, SEC: cash capex 2023/2024, OCF, AWS sales/op income.
- Amazon 2025 10-K, SEC: cash capex 2024/2025, OCF, FCF, AWS op income.
- Amazon shareholder letters 2024/2025, SEC.
- Reuters 30-31 Jul 2026: FY26 capex ~$220B, AWS +37%, backlog $496B, capacity constraints/reservations.
