# ATLAS Ω — Auditoría real de 40 acciones · Motores

Fecha: 2026-08-12  
Estado: **RESEARCH_GRADE / RUNTIME_EXECUTED**  
Corte de precio: **cierre regular completado del 2026-08-11**  
Universo: **40 emisores únicos; 0 duplicados**

## Veredicto ejecutivo

- **15/40** cumplen GREEN CONTINUITY Ω 5/5: `A`, `LLY`, `JPM`, `PANW`, `HAG.DE`, `NOC`, `MDT`, `DHR`, `ASML`, `SAF.PA`, `COR`, `BA.L`, `TMO`, `FAST`, `SU.PA`.
- **6/40** pasan a diligencia primaria prioritaria, no a BUY automático: `NOC`, `ASML`, `COR`, `UBER`, `ZTS`, `INTU`.
- El resto queda en WATCH/SECTOR REVIEW o bloqueado por valoración, caja, balance, extensión o deterioro.
- **No se modifica cartera, Top 35, watchlist ni canon de decisión.**
- CAT no aparece en las capturas actuales. Se conserva en el preflight histórico de 41, pero no se mezcla con este lote de 40.

## Corrección de símbolos

- `MTE` (broker) → `MU`.
- `ORC` (broker) → `ORCL`.
- `BSP` (broker) → `BA.L` para BAE Systems. **No** `BAE.L`.
- `MRSH` es el ticker bursátil vigente de Marsh & McLennan; no se fuerza a `MMC`.
- Europa: `ABN.AS`, `IQE.L`, `HAG.DE`, `IFX.DE`, `RHM.DE`, `SAF.PA`, `TKA.DE`, `SU.PA`, `HLMA.L`.
- `ASML` se audita como ADR estadounidense para mantener la serie usada por ATLAS.

## Método auditable

1. GREEN se calcula con cierres ajustados de Yahoo Finance, todos congelados en el mismo último cierre regular: 1W=5, 1M=20, 3M=60 y 1Y=252 sesiones; TOTAL desde el primer dato ajustado.
2. Valoración, FCF, deuda/EBITDA, ROIC, WACC, RSI y consenso proceden de las fichas estadísticas de StockAnalysis con atribución a S&P Global Market Intelligence, observadas el 12-ago-2026.
3. Es una auditoría **research-grade**. Antes de convertir un ADVANCE en decisión se exige 10-Q/10-K/annual report, conciliación de FCF, deuda y valoración histórica propia.
4. Bancos y utilities no se fuerzan dentro del filtro industrial de FCF/deuda.

## Resultado por emisor

| Broker → canónico | GREEN | fPE | FCF yield | Deuda/EBITDA | Upside consenso | Motor dominante | Veredicto |
|---|---:|---:|---:|---:|---:|---|---|
| ABN → ABN.AS | 4/5 | 12.50 | -110.87% | NV | -5.16% | Bank Quality / Money Rotation | **SECTOR_NO_CHASE** |
| A → A | 5/5 | 23.66 | 2.57% | 1.93 | 6.58% | GREEN / Quality | **NO_CHASE** |
| NEE → NEE | 2/5 | 20.85 | -9.26% | 6.97 | 14.92% | Power Grid / Utility | **SECTOR_REVIEW** |
| AMD → AMD | 3/5 | 42.71 | 1.09% | 0.45 | 29.20% | AI Infrastructure / Capex Payback | **NO_CHASE** |
| MRSH → MRSH | 3/5 | 17.43 | 5.22% | 3.09 | 7.46% | Insurance / Money Rotation | **WATCH_QUALITY** |
| CEG → CEG | 4/5 | 22.98 | 0.30% | 2.99 | 25.72% | AI Power / Resource Constraint | **WATCH_AI_POWER** |
| ROP → ROP | 4/5 | 16.99 | 6.64% | 3.48 | 10.20% | Quality / Historical Dislocation | **WATCH_RECOVERY** |
| IQE → IQE.L | 4/5 | NV | -0.22% | NV | 25.81% | Speculative Semis | **NO_PRIORITY** |
| ICE → ICE | 3/5 | 18.32 | 5.98% | 2.93 | 22.88% | Financial Rails / Money Rotation | **WATCH_RECOVERY** |
| META → META | 2/5 | 18.71 | 2.68% | 1.02 | 26.34% | AI Capex Payback | **WATCH_AI_CAPEX** |
| MTE → MU | 3/5 | 6.04 | 2.67% | 0.09 | 72.94% | Memory Cycle / AI Infrastructure | **NO_CHASE_CYCLICAL** |
| CTAS → CTAS | 4/5 | 37.40 | 2.29% | 0.87 | 4.92% | Quality Compounder | **NO_CHASE** |
| LLY → LLY | 5/5 | 29.67 | 1.68% | 1.54 | 6.96% | Healthcare Growth | **NO_CHASE** |
| ABT → ABT | 4/5 | 18.92 | 4.12% | 3.03 | 7.93% | Healthcare Rotation | **WATCH_NO_CHASE** |
| HEI → HEI | 4/5 | 57.85 | 1.81% | 1.90 | 5.34% | Aerospace Quality | **NO_CHASE** |
| JPM → JPM | 5/5 | 15 | -16.89% | NV | 3.27% | Bank Quality / Money Rotation | **SECTOR_HOLD_REVIEW** |
| BKNG → BKNG | 4/5 | 19.11 | 5.96% | 2.12 | 11.72% | Travel Quality / Recovery | **WATCH_RECOVERY_NO_CHASE** |
| PANW → PANW | 5/5 | 97.89 | 1.21% | 0.98 | -11.57% | Agentic Security / GREEN | **BLOCK_VALUATION** |
| ACN → ACN | 4/5 | 12.54 | 11.43% | 0.64 | -0.52% | Software Quality / AI Disruption | **WATCH_DISLOCATION** |
| HAG → HAG.DE | 5/5 | 41.99 | 4.24% | 3.89 | 0.51% | Defense Rotation | **NO_CHASE** |
| NOC → NOC | 5/5 | 19.70 | 4.46% | 2.79 | 11.74% | Defense Quality / GREEN | **ADVANCE_CONDITIONAL** |
| MDT → MDT | 5/5 | 15.24 | 4.67% | 3.09 | 8.56% | Healthcare Rotation | **WATCH_NO_CHASE** |
| ORC → ORCL | 2/5 | 18.07 | -5.65% | 5.60 | 69.90% | AI Credit & Capex Payback | **BLOCK_AI_CREDIT** |
| AXON → AXON | 4/5 | 70.82 | 0.26% | 13.90 | 8.97% | Defense Tech / Optionality | **BLOCK_VALUATION** |
| DHR → DHR | 5/5 | 23.44 | 3.75% | 3.64 | 9.89% | Bottom Reversal / Healthcare | **WATCH_REVERSAL** |
| ASML → ASML | 5/5 | 31.82 | 1.68% | 0.14 | 21.03% | AI Infrastructure / GREEN | **ADVANCE_CONDITIONAL** |
| IFX → IFX.DE | 2/5 | 24.82 | 2.02% | 1.92 | 31.47% | Semis / Auto Cycle | **WATCH_CYCLICAL** |
| RHM → RHM.DE | 3/5 | 25.20 | 0.73% | 1.20 | 43.60% | Defense / Historical Dislocation | **WATCH_DEFENSE** |
| SAF → SAF.PA | 5/5 | 31.12 | 3.49% | 0.83 | 3.05% | Aerospace Quality / GREEN | **NO_CHASE** |
| COR → COR | 5/5 | 17.34 | 6.37% | 3.52 | 11.59% | Healthcare Distribution / GREEN | **ADVANCE_CONDITIONAL** |
| BSP → BA.L | 5/5 | 24.85 | 7.44% | 2.23 | 3.15% | Defense Quality / GREEN | **NO_CHASE** |
| NOW → NOW | 4/5 | 28.15 | 3.47% | 2.47 | 9.97% | Software Quality / Bottom Reversal | **WATCH_RECOVERY** |
| UBER → UBER | 4/5 | 18.60 | 6.31% | 1.97 | 29.23% | Platform Quality / Bottom Reversal | **ADVANCE_REVERSAL** |
| TMO → TMO | 5/5 | 23.04 | 3.27% | 3.84 | 4.37% | Healthcare Rotation / GREEN | **NO_CHASE** |
| ZTS → ZTS | 3/5 | 11.82 | 7.44% | 2.35 | 33.96% | Historical Dislocation / Healthcare | **ADVANCE_DISLOCATION** |
| FAST → FAST | 5/5 | 39.24 | 1.92% | 0.23 | -8.23% | Industrial Quality / GREEN | **BLOCK_VALUATION** |
| TKA → TKA.DE | 4/5 | 15.42 | -11.95% | 0.98 | 8.43% | Cyclical Industrial | **NO_PRIORITY** |
| SU → SU.PA | 5/5 | 27.38 | 3.60% | 2.37 | 4.84% | Electrification / AI Infrastructure | **NO_CHASE** |
| HLMA → HLMA.L | 3/5 | 28.80 | 3.03% | 1.39 | 16.17% | Safety Compounder | **WATCH_QUALITY** |
| INTU → INTU | 3/5 | 12.57 | 8.43% | 1.05 | 35.35% | Software Quality / AI Disruption | **ADVANCE_DISLOCATION** |

## Prioridad de diligencia

### ADVANCE · núcleo / tendencia confirmada

- **NOC:** GREEN 5/5, valoración y caja razonables; confirmar deuda, backlog y margen de programas.
- **COR:** GREEN 5/5, FCF yield alto y ROIC fuerte; tratar deuda 3,52x con lectura sectorial.
- **ASML:** calidad excepcional y GREEN 5/5; entrada condicionada por FCF yield bajo y fuerte revalorización anual.

### ADVANCE · reversión / dislocación

- **UBER:** mejor combinación del lote entre valoración, FCF, balance y upside; aún 4/5 por retorno anual negativo.
- **ZTS:** dislocación viva con calidad/FCF; todavía 3/5, por lo que no confirma suelo completo.
- **INTU:** métricas de valor muy atractivas, pero 3/5 y riesgo de disrupción IA; requiere auditoría de crecimiento orgánico y margen.

## Bloqueos más claros

- **ORCL:** AI Credit & Capex Payback Ω bloquea por FCF negativo y deuda/EBITDA 5,60.
- **PANW, AXON y FAST:** tendencia fuerte, pero la valoración/FCF impide usar GREEN como orden de entrada.
- **IQE y TKA:** la subida reciente no compensa ROIC/FCF negativos.
- **AMD, MU, LLY, A, HAG, SAF, BA.L, TMO y SU:** NO-CHASE por combinación de extensión, rendimiento de caja o upside insuficiente.

## Reconciliaciones con canon

- **PANW:** el canon previo indica `BUY_ZONE`; este corte exige revisión porque GREEN 5/5 convive con fPE 97,89, FCF yield 1,21% y consenso -11,57%.
- **INTU:** el canon previo indica `BUY`; este corte mantiene el caso de dislocación, pero GREEN 3/5 impide tratarlo como entrada confirmada por continuidad.
- **ASML:** conserva calidad y GREEN 5/5, pero deja de ser una dislocación limpia tras +150,75% a 1 año.
- Estas discrepancias quedan **marcadas para reconciliación**, no sobrescritas silenciosamente.

## Fuentes y limitaciones

- Mercado: [Yahoo Finance chart API](https://query2.finance.yahoo.com/v8/finance/chart/A?period1=0&period2=1786492800&interval=1d&events=div%2Csplits&includeAdjustedClose=true).
- Fundamentales/valoración: [StockAnalysis — Agilent como ficha representativa](https://stockanalysis.com/stocks/a/statistics/) y la URL individual guardada por emisor en el JSON adjunto.
- Artefacto estructurado: [2026-08-12_40_TICKER_ATLAS_ENGINE_AUDIT.json](./2026-08-12_40_TICKER_ATLAS_ENGINE_AUDIT.json).
- El consenso de precio es evidencia secundaria, nunca señal autónoma.
- `NV` significa **no verificado/no aplicable**, no cero.

## Guardrail

> **GREEN confirma continuidad; no sustituye calidad, caja, valoración ni precio de entrada. ADVANCE abre diligencia, no una orden.**
