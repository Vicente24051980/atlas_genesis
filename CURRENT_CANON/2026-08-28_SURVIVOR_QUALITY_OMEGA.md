# ATLAS Ω v4.0 — SURVIVOR QUALITY Ω

**Fecha:** 2026-08-28
**Estado:** RESEARCH MODULE / SHADOW SCORE
**Portfolio impact:** NONE
**Gobernanza:** no modifica Composite Ω ni autoriza operaciones hasta superar Model Governance Ω.

## 1. Misión
Detectar compañías capaces de mantener y aumentar creación de valor durante 3–10 años antes de que esa durabilidad sea plenamente reconocida. Separar supervivencia empresarial de atractividad bursátil.

**BUSINESS QUALITY ≠ STOCK QUALITY.**
**SURVIVOR QUALITY ≠ BUY.**

## 2. Survivor Quality Score
Componentes 0–100:

SQΩ = 0.20 Rp + 0.15 Ri + 0.15 F + 0.10 M + 0.10 B + 0.10 A + 0.10 D + 0.10 G

- Rp — ROIC Persistence: mediana ROIC 5–10Y, dispersión y años > WACC.
- Ri — Incremental ROIC: ΔNOPAT / ΔInvested Capital, normalizado.
- F — FCF/share: CAGR, persistencia y conversión 5–10Y.
- M — Margin Durability: margen operativo/FCF normalizado, estabilidad y through-cycle.
- B — Balance Sheet: net debt/EBITDA, net debt/FCF, interest/fixed-charge coverage, vencimientos.
- A — Capital Allocation: buybacks netos, SBC/dilución, M&A, dividendos, reinversión.
- D — Durability: moat, pricing power, recurrencia, switching costs, customer captivity, disruption/tail risk.
- G — Reinvestment Runway: crecimiento orgánico rentable, TAM/cuota y capacidad de reinvertir a retornos altos.

Clases preliminares:
- S / SURVIVOR ELITE: >=85
- A / SURVIVOR: 75–84
- B / QUALITY CANDIDATE: 65–74
- C / ORDINARY: 50–64
- FAIL: <50 o hard gate incumplido.

## 3. Hard Gates
- FCF estructuralmente positivo, salvo modelo económico donde una excepción esté explícitamente normalizada.
- ROIC mediano 5Y > WACC + 5 pp, después de ROIC Integrity Gate.
- Sin deterioro estructural de FCF/share.
- Evidencia insuficiente => UNKNOWN, nunca imputar score favorable.

## 4. ROIC INTEGRITY GATE Ω
Antes de puntuar Rp/Ri, reconstruir y auditar NOPAT e Invested Capital.

Comprobar obligatoriamente:
- recompras masivas / treasury stock / patrimonio negativo;
- goodwill y purchase accounting;
- adquisiciones/desinversiones;
- spin-offs;
- impairments;
- extraordinarios fiscales/contables;
- capitalización de costes;
- leases cuando sean económicamente materiales;
- cambios de perímetro y moneda.

Si el denominador está materialmente distorsionado: `RAW_ROIC = NON_DECISION_GRADE`.
Usar triangulación con Normalized ROIC, Incremental ROIC, ROCE cuando proceda, FCF/EV, FCF/share y economics unitarios/model-specific.

Especial vigilancia en serial repurchasers con book equity bajo/negativo (p.ej. FICO, ORLY, BKNG, AZO). Debt/Equity y P/B pueden ser económicamente poco informativos; priorizar leverage y coverage basados en cash flow.

## 5. Opportunity Ω — capa separada
Sólo después de SQΩ:

OpportunityΩ = 0.40 SQ + 0.30 Expected Return + 0.15 Valuation + 0.10 Resilience + 0.05 Entry Timing

Expected Return debe proceder del motor canónico de escenarios/Expected CAGR. Analyst targets/ratings no sustituyen Expected Return.

Un SQ alto puede terminar WAIT/NO_CHASE si las expectativas incorporadas son excesivas.

## 6. Persistencia temporal
Evaluar tres capas:
1. Historical Persistence: ROIC/FCF-share/márgenes/leverage 5–10Y.
2. Resilience: recesión, inflación, tipos, shocks sectoriales y tecnológicos.
3. Forward Persistence: moat, pricing, reinvestment runway, incremental ROIC y disruption risk.

## 7. EMERGING SURVIVOR Ω
No buscar sólo nivel; medir trayectoria:
`Emerging Survivor = SQ level + ΔSQ`.

Señales: ROIC normalizado ascendente, incremental ROIC ascendente, FCF/share acelerando, margen expandiendo, deuda bajando, crecimiento orgánico persistente y moat fortaleciéndose.

Mantener dos radares separados:
- SURVIVOR ELITE Ω — compounders demostrados.
- EMERGING SURVIVOR Ω — compañías adquiriendo esas características.

## 8. INDEX CASTOFF RADAR Ω
La evidencia histórica sobre eliminaciones de índices es sólo Discovery. Pipeline:
`index deletion -> forced/technical selling evidence -> valuation compression -> thesis intact? -> normalized FCF/ROIC -> Expected CAGR -> Competition for Capital`.

Una expulsión nunca genera BUY automático.

## 9. Earnings Reaction / Dislocation Gate
Separar resultado empresarial de reacción bursátil:
`earnings evidence -> revisions -> FCF/ROIC impact -> price reaction -> expectations gap`.

Precio débil con tesis intacta puede mejorar Expected Return; precio fuerte no valida fundamentales. Analyst ratings/targets son evidencia secundaria.

## 10. Substitution Bank / Competition for Capital
Survivor Quality no aumenta automáticamente el número de posiciones. Cada candidato debe desplazar un asiento concreto mediante Competition for Capital.

Hurdle:
`Δ Expected CAGR > uncertainty + concentration penalty + valuation risk + turnover cost + event/model error`.
Si no supera el margen de error: NO CHANGE.

## 11. Universo inicial de investigación
Software/plataformas: MSFT, GOOGL, META, ADBE, INTU, CRM, NOW, ORCL, ADP, FICO, ROP, VEEV, ADSK.
Semis/tech física: NVDA, TSM, AVGO, ASML, LRCX, KLAC, AMAT, ADI, QCOM, TXN, MCHP.
Pagos/exchanges/info: V, MA, CME, ICE, SPGI, MCO, MSCI, IBKR.
Industriales: CTAS, FIX, PH, ETN, HUBB, TDG, HEI, NDSN, MSA, FAST, GWW.
Consumo/distribución: ORLY, AZO, WSM, CMG, COST, TJX, BKNG.
Healthcare/life science: IDXX, MCK, LLY, REGN, ALNY, VRTX, DHR.
Cyber: FTNT, PANW, CRWD, RBRK.

Esto es un universo de investigación, no cartera ni autorización.

## 12. RBRK — incorporación al banco de sustitución
Estado: HIGH PRIORITY / AUDIT REQUIRED.
Función: cyber resilience / data protection.
Competidores de capital: FTNT, PANW, CRWD y otros asientos cyber/data protection.
Gates obligatorios: valuation, SBC/dilution, GAAP-to-FCF reconciliation, ARR quality, net-new ARR normalization, AI-specific Economic Proof, Competition for Capital.
No atribuir crecimiento corporativo a IA sin evidencia específica.

## 13. Evidencia y anti-narrativa incorporadas del hilo
- Un trimestre, un ROIC puntual o un margen extraordinario no prueban durabilidad.
- Empresas cíclicas requieren through-cycle normalization.
- Margen neto no sustituye owner economics.
- Rating Strong Buy/Neutral y price target no son señales de compra.
- Post-earnings drawdown puede ser dislocación sólo si tesis/FCF/ROIC permanecen intactos.
- `great company`, FOMO, momentum o “never lets you down” son NOISE para autorización.

## 14. AI / NVIDIA evidence discipline reforzada
Para financiación de infraestructura IA separar estrictamente:
Organic Demand / Financed Demand / Vendor-supported Demand / Circular-Ecosystem Demand.
Capital de terceros movilizable no equivale a pedidos, ingresos, cash flow ni demanda final garantizada.
Adquisiciones/rumores no verificados permanecen DISCOVERY/HYPOTHESIS/UNKNOWN hasta fuente decision-grade.
Custom silicon y stack control siguen como riesgos/hipótesis estructurales, no falsificadores automáticos.

## 15. C10 Memory/Storage discipline
Mantener canon:
- C10A HBM/DRAM
- C10B NAND/Storage
No extrapolar automáticamente tightness HBM a NAND/Storage. SNDK se analiza primariamente C10B; MU cruza HBM/DRAM/NAND.

## 16. Macro event / fishing-in-dislocations discipline
Una caída macro puede mejorar valoración sólo si no deteriora los cash flows o el múltiplo justificable estructural.
Pipeline:
`macro shock -> yield curve/term premium -> cost of capital -> justified multiple -> fundamentals -> Expected CAGR -> Entry Timing`.
No comprar la primera vela sólo por porcentaje de caída.

## 17. Prediction-market evidence firewall
Mercados predictivos se tratan como información de probabilidades/precios, no como señal de cartera. Verificar siempre resolución, fuente de fixing, timestamp, mutually-exclusive outcomes, costes y precios actuales. Narrativa geopolítica no prueba edge; edge exige probabilidad propia > break-even con margen de error.

## 18. Model Governance
Este módulo permanece SHADOW hasta:
- >=20 observaciones comparables;
- >=5 patrones repetidos;
- materialidad económica;
- estabilidad temporal/cross-sector;
- evidencia de mejora out-of-sample sobre Quality Ω existente.

Si supera gobernanza, crear MCR separado antes de integrarlo en Composite Ω.

**VERDICT:** RESEARCH IMPLEMENTED. PORTFOLIO IMPACT = NONE.