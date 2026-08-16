# ATLAS Ω v3.1 — FINAL GATE: Reverse Expectations / Implied Return / Valuation / Entry Timing

Fecha: 16-ago-2026
Horizonte: 3–6 años; modelo central 5 años.
Estado: investigación final sobre los 12 ganadores del Head-to-Head. **No modifica la cartera.**

## Metodología
Este gate NO pretende fingir precisión DCF cuando la comparabilidad de FCF es baja (AI capex en MSFT/GOOGL, anticipos/working capital en GEV, customer funds en WISE). Se usa un **Reverse Expectations Model Ω** como proxy de reverse DCF:

`CAGR_5Y ≈ (1 + crecimiento por acción) × (múltiplo terminal / múltiplo actual)^(1/5) - 1`

El objetivo es medir qué crecimiento necesita el precio actual para producir un retorno razonable y detectar Expectations Gap. Los múltiplos son snapshots verificables recientes; para GEV se usa P/FCF normalizado como métrica primaria por la distorsión del EPS. Dividendos y recompras no se suman explícitamente al CAGR, por lo que el modelo es conservador en compañías con shareholder yield positivo. Los escenarios no son pronósticos deterministas.

## Inputs verificables clave
- CRDO: 39.68x forward P/E; 113.25x P/FCF; ROIC 73.1%; consenso 3Y revenue +52.68% y EPS +47.63%; acciones +3.91% YoY.
- VRT: 35.06x forward P/E; 35.87x P/FCF; ROIC 37.58%; consenso 3Y revenue +28.98% y EPS +40.12%.
- GEV: snapshot 10-ago 46.53x forward P/E y 21.29x P/FCF a $991.45; cierre 14-ago $1,063.25 implica ~22.8x P/FCF si fundamentals no cambian. Q2 FCF $5.1B y guidance FY26 $11.5–12.5B, pero se normaliza por anticipos/working capital.
- NXT: 21.52x forward P/E; 28.67x P/FCF; ROIC 44.04%; net cash ~$1.18B; consenso 3Y revenue +18.34%, EPS +14.80%.
- ADYEN: 23.45x forward P/E a €893.2 antes de H1; tras rally a ~€995.2, proxy ~26.1x; H1 net revenue +21% CC, EBITDA margin 49%, guidance 2026 +21–23%.
- WISE: 20.47x forward P/E; active customers +21%, cross-border volume +26%, net revenue +25%. P/FCF NO se usa porque customer funds distorsionan cash flow.
- RR.L: 33.84x forward P/E a 1,463p; cierre 14-ago 1,541p implica proxy ~35.6x. H1 op profit +46%, ROIC 22%, FCF £1.964B.
- SAF.PA: 29.44x forward P/E; 26.4x P/FCF; H1 revenue +19%, recurring op income +29%, FCF €2.616B.
- HALO: 10.48x forward P/E; 14.43x P/FCF; FCF margin 48.46%; ROIC 32.13%; deuda $2.18B vs cash $231M; acciones -4.21% YoY.
- ARGX: 25.13x forward P/E; net cash $5.14B; ROIC 50.65%; acciones -4.24% YoY; consenso 3Y revenue +28.26% y EPS +33.56%.
- MSFT: 25.41x forward P/E a $505.98 el 10-ago; cierre 14-ago $495.40 → proxy ~24.9x. ROIC 26.18%; consenso 3Y revenue +19.24%, EPS +18.0%. AI capex deprime FCF actual.
- GOOGL: 26.67x forward P/E a $357.53 el 10-ago; cierre 14-ago $345.90 → proxy ~25.8x. ROIC 24.93%; consenso 3Y revenue +21.42%, EPS +16.95%. FCF actual muy deprimido por capex.

## Reverse Expectations / 5Y Scenario CAGR
Los siguientes CAGRs son salidas del modelo, no hechos de mercado.

| Ticker | Métrica | Bear | Base | Bull | Hurdle de crecimiento para ~10% CAGR | Veredicto valoración |
|---|---|---:|---:|---:|---:|---|
| ARGX | P/E 25.1x | 4.8% | **19.9%** | 34.3% | ~10.1% | ATRACTIVA |
| HALO | P/E 10.5x | -1.5% | **18.7%** | 31.5% | ~3.8% | MUY ATRACTIVA, riesgo específico |
| WISE | P/E 20.5x | 3.4% | **17.7%** | 26.9% | ~8.4% | ATRACTIVA |
| ADYEN | P/E ~26.1x | 6.2% | **17.0%** | 26.4% | ~11.0% | ATRACTIVA |
| CRDO | P/E 39.7x | 2.2% | **16.6%** | 31.7% | ~17.9% | ATRACTIVA SI crecimiento >18%; cash multiple caro |
| MSFT | P/E ~24.9x | 6.4% | **15.9%** | 25.1% | ~8.2% | ATRACTIVA |
| NXT | P/E 21.5x | 1.8% | **15.5%** | 24.6% | ~9.5% | ATRACTIVA |
| VRT | P/E 35.1x | 0.1% | **12.2%** | 24.1% | ~17.7% | FAIR/SELECTIVA |
| GOOGL | P/E ~25.8x | 0.5% | **11.4%** | 21.6% | ~11.6% | FAIR+; FCF normalization upside |
| SAF.PA | P/E 29.4x | ~0% | **10.3%** | 19.5% | ~13.7% | FAIR |
| RR.L | P/E ~35.6x | ~0% | **9.0%** | 17.9% | ~18.1% | RICA / NO_CHASE |
| GEV | P/FCF ~22.8x | -4.1% | **7.1%** | 17.2% | ~13.0% FCF/share | RICA tras gran rerating; FCF headline debe normalizarse |

### Supuestos base de crecimiento por acción / múltiplo terminal
CRDO 25% / 28x; VRT 20% / 25x; GEV FCF/share 10% / 20x P/FCF; NXT 15% / 22x; ADYEN 18% / 25x; WISE 16% / 22x; RR.L 17% / 25x; SAF 14% / 25x; HALO 12% / 14x; ARGX 20% / 25x; MSFT 14% / 27x; GOOGL 13% / 24x.

## Expectations Gap Ω
### Positive Gap — price exige menos de lo que el business case base puede entregar
- **ARGX**: el precio exige ~10% de crecimiento para 10% CAGR frente a consenso 3Y >30% EPS; balance net cash y recompras reducen fragilidad.
- **ADYEN**: incluso tras el gap alcista, el hurdle ~11% queda bastante por debajo de guidance de revenue 21–23%; el riesgo es desaceleración/merchant mix y nuevo CFO.
- **WISE**: hurdle ~8% frente a net revenue +25% en Q1 FY27; riesgo de take-rate/interest/regulación.
- **MSFT**: hurdle ~8% frente a forecast EPS ~18% 3Y y Azure/AI payback; principal riesgo es que capex mantenga FCF deprimido más tiempo.
- **NXT**: hurdle ~9.5% frente a crecimiento forecast mid/high teens; riesgo policy/solar cycle y dilución.
- **HALO**: hurdle muy bajo por múltiplo ~10.5x; el descuento compensa mucho crecimiento, pero patent/platform concentration y deuda son falsificadores reales.

### Narrow/Execution Gap
- **CRDO**: hurdle ~18% sigue por debajo de forecasts muy altos, pero P/FCF >100x, beta alta y +3.9% de acciones hacen que el error de ejecución sea caro. Gran Successor, no position-size de compounder maduro.
- **VRT**: el precio ya exige ~18% de crecimiento para 10% CAGR; business momentum lo soporta, pero el margen de seguridad es mucho menor que NXT.
- **GOOGL**: near-fair bajo EPS, pero capex/FCF compression es el centro de la tesis. Si AI monetization normaliza FCF, el modelo infravalora upside; si no, el multiple no está barato.

### Negative Gap / Price leads fundamentals
- **SAF.PA**: calidad sobresaliente, pero ~29x forward ya descuenta buena parte del aftermarket/civil recovery.
- **RR.L**: transformación real, pero a ~35–36x forward y cerca de máximos el market already knows it.
- **GEV**: demanda, backlog y cash son reales, pero el rerating ha sido tan fuerte que el capital nuevo depende mucho más de ejecución 2027–30. Mantener Winner Preservation si ya se posee; no perseguir con capital marginal.

## Final Risk-Adjusted Ranking Ω
1. **ARGX — FINAL PRIMARY**
2. **ADYEN — FINAL PRIMARY**
3. **WISE — FINAL PRIMARY / SUCCESSOR**
4. **MSFT — FINAL PRIMARY / AI PAYBACK LEADER**
5. **HALO — FINAL PRIMARY_CONDITIONAL**
6. **NXT — FINAL PRIMARY_CONDITIONAL**
7. **CRDO — FINAL SUCCESSOR_CONDITIONAL**
8. **VRT — FINAL ADVANCE / FAIR VALUE**
9. **GOOGL — FINAL ADVANCE / FCF_NORMALIZATION**
10. **SAF.PA — FINAL HOLD/BUY_ON_WEAKNESS**
11. **RR.L — FINAL WINNER_PRESERVATION / NO_CHASE**
12. **GEV — FINAL STRUCTURAL_WINNER / ENTRY_FAIL_AT_CURRENT_EXPECTATIONS**

La jerarquía no dice que #1 sea una empresa “mejor” que #12: clasifica **retorno marginal esperado por unidad de riesgo al precio/expectativas actuales**.

## Entry Timing Ω
### Green — capital marginal permitido si el resto del portfolio gate lo permite
- ARGX: valoración permite entrada escalonada; no chase en gap diario.
- WISE: múltiplo moderado y crecimiento superior; entrada escalonada.
- MSFT: valoración ~25x forward razonable para calidad/payback; entrada escalonada.
- NXT: ~21.5x forward y net cash; entrada escalonada, con stop fundamental en policy/order deterioration.

### Yellow — atractivo, pero esperar absorción de gap / tamaño inicial menor
- ADYEN: resultados provocaron +~11%; fundamentals justifican pase, timing no justifica perseguir gap.
- HALO: tras +20% post-resultados y RSI muy alto en el snapshot, usar starter pequeño o pullback; valoración sigue baja.
- CRDO: crecimiento justifica múltiplo sólo si mantiene >~18% CAGR por acción; starter/satellite, no full size.
- VRT: a ~35x forward el base case apenas supera hurdle 12%; mejor en debilidad.
- GOOGL: cerca de fair por EPS; aumentar sólo con price discipline o evidencia de FCF normalization.

### Red-for-new-capital / Winner Preservation only
- SAF.PA: preferible tras ~5–10% de mejora de precio o nuevas revisiones al alza.
- RR.L: preferible ~10–15% por debajo del nivel actual o nueva subida de earnings/FCF que cierre el multiple gap.
- GEV: no vender por valuation si thesis/winner preservation sigue intacta; para capital nuevo exigir corrección relevante o que 2027–28 owner earnings alcancen el precio. Headline FCF 2026 no se extrapola mecánicamente.

## Resultado final de la criba de 62
### Final 9 que superan todos los gates para seguir como candidatos de capital marginal
**ARGX, ADYEN, WISE, MSFT, HALO, NXT, CRDO, VRT, GOOGL.**

### 3 que superan fundamentals pero NO el último gate de precio/expectations para capital nuevo hoy
**SAF.PA, RR.L, GEV.**

Esto NO saca a SAF/RR/GEV de ATLAS y NO altera posiciones existentes: son `WINNER_PRESERVATION / BUY_ON_WEAKNESS / ENTRY_FAIL`, no `THESIS_BROKEN`.

## Falsifiers prioritarios
- ARGX: desaceleración Vyvgart / fallos clínicos o comerciales que reduzcan runway; deterioro de margen/FCF.
- ADYEN: crecimiento net revenue < mid-teens sostenido, margin path a >55% roto, integración M&A problemática.
- WISE: net revenue < mid-teens, take-rate erosion sin compensación en volumen, regulación/customer-funds economics deteriorados.
- MSFT: Azure/AI monetization desacelera mientras capex mantiene FCF/share deprimido; ROIC incremental cae persistentemente.
- HALO: pérdida material de royalties/patentes/plataforma, leverage sube sin FCF, concentración empeora.
- NXT: orders/backlog y margen se deterioran por policy/cycle, net cash se consume sin retorno.
- CRDO: revenue/EPS CAGR cae por debajo de ~18% mientras P/FCF sigue >50–60x; concentración cliente/AI crece; dilución persiste.
- VRT: organic growth cae por debajo de mid-teens sin compresión de múltiplo; FCF conversion o margen se revierten.
- GOOGL: capex no se traduce en Cloud/AI cash earnings; FCF/share no normaliza en 4–6 trimestres.
- SAF/RR/GEV: no thesis break por precio; reabrir sólo si earnings/FCF revisions fallan de forma estructural o valoración se corrige.

## Fuentes
Principalmente Investor Relations / filings de las compañías; S&P Global Market Intelligence vía StockAnalysis para ratios/forecasts; Reuters/WSJ/MarketWatch para conciliación de resultados, guidance y precios post-evento. Datos de valoración son snapshots recientes y deben actualizarse antes de ejecución.

## Decisión de gobernanza
**Research COMPLETE. Portfolio UNCHANGED.** El análisis termina aquí hasta que haya nueva evidencia, resultados/eventos o una instrucción explícita de reapertura de cartera.