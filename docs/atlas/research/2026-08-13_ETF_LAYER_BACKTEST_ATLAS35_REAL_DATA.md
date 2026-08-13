# ATLAS Ω — ETF Factor Layer Ω · Backtest / Stress Test con datos reales

**Fecha:** 2026-08-13  
**Estado:** AUDITADO / SECONDARY MARKET DATA  
**Objetivo:** comprobar si añadir una capa `EXUS + MWEQ` al TOP 35 reduce concentración, volatilidad y drawdown sin destruir el perfil de retorno.

## 1. Universo canónico

Fuente: `CURRENT_CANON/PORTFOLIO_35.md`.

TOP35 usado:
NVDA, MSFT, GOOGL, TSM, AVGO, ASML, META, AMZN, LLY, NOW, AXON, CSU.TO, APH, ANET, DDOG, PANW, UBER, NFLX, SPGI, MA, RELX, ISRG, BKNG, SU.PA, ETN, LRCX, AMAT, INTU, TMO, DHR, HEI, KLAC, SAF.PA, SAP, IDXX.

## 2. Metodología

- Datos diarios de cierre: Google Finance mediante `GOOGLEFINANCE`, clasificados como **SECONDARY / CROSS-CHECK MARKET DATA** conforme a `CURRENT_CANON/YAHOO_FINANCE_SOURCE_POLICY.md` y la jerarquía ATLAS Ω.
- Ventana principal: **2024-09-09 a 2026-08-11**, determinada por la disponibilidad histórica del ETF MWEQ observado.
- TOP35: equiponderación 1/35 y rebalanceo mensual.
- ETF Layer testada: **90% TOP35 + 6% EXUS + 4% MWEQ**, rebalanceo mensual.
- Moneda de análisis: EUR.
- Cotizaciones en USD/CAD convertidas con series históricas USD/EUR y CAD/EUR.
- EXUS: cotización LSE USD del Xtrackers MSCI World ex USA UCITS ETF 1C.
- MWEQ: cotización LSE USD del Invesco MSCI World Equal Weight UCITS ETF Acc.

### Limitaciones obligatorias

1. **LOOK-AHEAD / SELECTION BIAS:** el TOP35 fue seleccionado en 2026. Aplicarlo retrospectivamente a 2024 no prueba que ATLAS hubiera poseído estas mismas 35 compañías entonces. Este ejercicio es un **stress test estructural del conjunto actual**, no un backtest válido del proceso histórico de selección.
2. **PRICE RETURN:** la serie de acciones utiliza cierres de mercado y no reconstruye de forma independiente el total return por dividendos. Los ETFs de acumulación reinvierten distribuciones dentro de su NAV/precio. Por tanto, la comparación de retorno absoluto puede sesgar ligeramente a la baja el TOP35 frente a los ETFs. Las métricas de volatilidad/drawdown son más útiles para la decisión.
3. No se incluyen comisiones, spreads, impuestos ni fricciones de rebalanceo.
4. Sharpe mostrado usa 0% como tasa libre de riesgo y solo sirve como comparación interna.

## 3. Resultado principal — exact funds / misma ventana

Ventana: **09-sep-2024 -> 11-ago-2026**.

| Métrica | TOP35 solo | 90% TOP35 + 6% EXUS + 4% MWEQ | Cambio |
|---|---:|---:|---:|
| Retorno precio acumulado | **+59,04%** | **+56,87%** | -2,17 pp |
| CAGR precio | **27,35%** | **26,44%** | -0,91 pp |
| Volatilidad anualizada | **21,86%** | **20,25%** | **-1,61 pp / -7,37%** |
| Downside volatility | **16,48%** | **15,21%** | **-1,27 pp / -7,73%** |
| Max drawdown | **-25,79%** | **-24,62%** | **+1,17 pp / 4,54% menos profundo** |
| Sharpe 0% | **1,177** | **1,220** | **+3,65%** |

Drawdown principal de ambos modelos:
- Pico: **10-feb-2025**.
- Suelo: **08-abr-2025**.

### Lectura

La ETF Layer **no aumentó el retorno** en esta ventana. Su función fue otra: redujo volatilidad, downside volatility y profundidad del drawdown, con una pérdida relativamente pequeña de CAGR de precio.

Esto es coherente con la misión propuesta de la capa: **diversificar**, no generar alfa sobre el TOP35.

## 4. Robustez — proxy del mismo índice ex-USA

Para comprobar que el resultado no depende de una sola cotización de EXUS, se repitió desde 03-feb-2025 usando XUSE (iShares MSCI World ex-USA UCITS ETF) como implementación alternativa del **mismo MSCI World ex USA Index**, manteniendo MWEQ.

Ventana: **03-feb-2025 -> 11-ago-2026**.

| Métrica | TOP35 solo | 90% TOP35 + 6% XUSE + 4% MWEQ | Cambio |
|---|---:|---:|---:|
| Retorno precio acumulado | +29,50% | +29,37% | -0,13 pp |
| CAGR precio | +18,58% | +18,50% | -0,08 pp |
| Volatilidad anualizada | 22,95% | 21,25% | **-7,43% relativo** |
| Downside volatility | 17,35% | 16,03% | **-7,64% relativo** |
| Max drawdown | -25,81% | -24,64% | **1,17 pp menos profundo** |
| Sharpe 0% | 0,831 | 0,877 | **+5,55%** |

La señal de reducción de riesgo se mantiene.

## 5. Concentración estructural

### TOP35 por sector — conteo simple
- Information Technology: **45,71%**.
- Industrials: **20,00%**.
- Health Care: **14,29%**.
- Communication Services: **8,57%**.
- Consumer Discretionary: **5,71%**.
- Financials: **5,71%**.
- Staples / Materials / Energy / Utilities / Real Estate: **0% directo**.

### Escenario 90/6/4 — aproximación por exposiciones actuales
- Information Technology: **~42,19%**.
- Industrials: **~19,84%**.
- Health Care: **~13,78%**.
- Communication Services: **~8,11%**.
- Financials: **~7,55%**.
- Consumer Discretionary: **~6,03%**.
- Aparecen exposiciones indirectas a Staples, Materials, Energy, Utilities y Real Estate.

HHI sectorial simple:
- TOP35: **0,2833**.
- 90/6/4: **~0,2524**.
- Mejora: **~10,9% menos concentración sectorial**.

### Geografía por domicilio de emisor
Modelo simple por nombres:
- TOP35: ~**77,14% EE. UU.**.
- Con 6% EXUS (0% EE. UU. por diseño) y 4% MWEQ (peso USA observado ~38%): ~**70,95% EE. UU.**.
- Reducción: **~6,19 pp**.

No confundir domicilio con exposición de ingresos.

## 6. MWEQ vs ESAE — corrección

**MWEQ != ESAE.**

Para la función que buscamos, MWEQ es el candidato preferido porque replica el **MSCI World Equal Weighted Index** puro. ESAE replica una variante World Equal Weight con filtros business-involvement/screens.

El objetivo ATLAS en esta plaza es reducir concentración por tamaño, no introducir un filtro ESG adicional. Por eso:

`MWEQ > ESAE` para la función base de Equal Weight.

ESAE queda como alternativa si se desea explícitamente la versión screened.

## 7. Veredicto ATLAS Ω

### PASA
**EXUS + MWEQ** pasa la prueba estructural como primera combinación candidata para `ETF Factor Layer Ω`.

### Función
- EXUS = **diversificación geográfica ex-USA**.
- MWEQ = **desconcentración de mega-cap / equal weight**.

### Sizing de investigación
Mantener como escenario de simulación:
- TOP35: 90%.
- EXUS: 6%.
- MWEQ: 4%.

**Este 90/6/4 no es aún una asignación de capital canónica ni una orden de compra.**

### Gate de ejecución pendiente
Antes de ejecutar:
1. Validar disponibilidad exacta por broker.
2. Elegir bolsa/ticker con mejor liquidez y spread para cada ISIN.
3. Medir spread efectivo y comisión.
4. Revisar fiscalidad y custodia del broker.
5. Aplicar ENTRY TIMING Ω / NO-CHASE.

## 8. Conclusión

La evidencia disponible apoya mantener el TOP35 como motor de creación de valor y utilizar `EXUS + MWEQ` como **capa externa de diversificación**. En la ventana observable de los ETFs, el coste fue una pequeña reducción de retorno de precio a cambio de una mejora medible en volatilidad, downside, drawdown y concentración.

**Estado:** `ETF_LAYER_VALIDATED_FOR_ARCHITECTURE / NOT_YET_BUY`.