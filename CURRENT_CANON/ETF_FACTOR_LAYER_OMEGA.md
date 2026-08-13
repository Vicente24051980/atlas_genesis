# ATLAS Ω — ETF FACTOR LAYER Ω

**Estado:** CANON ACTIVO  
**Fecha:** 2026-08-13

## 1. Definición

`ETF FACTOR LAYER Ω` es una capa de cartera **separada del TOP 35 de acciones**.

Su función es incorporar exposiciones sistemáticas difíciles o ineficientes de replicar mediante selección individual de compañías: geografía, ponderación alternativa, factores y diversificación estructural.

## 2. Separación inviolable

- `TOP 35 Ω` = stock picking activo, tesis individual, Quality Ω, valoración, falsificadores y seguimiento empresa por empresa.
- `ETF FACTOR LAYER Ω` = exposición sistemática de diversificación.
- Un ETF de esta capa **no ocupa una de las 35 plazas**.
- El rendimiento de ambas capas debe medirse por separado y también de forma consolidada.
- Un solapamiento de un ETF con una compañía del TOP35 **no provoca automáticamente la venta** de esa compañía.

## 3. Broker canónico

**Trading 212 Invest es el único broker autorizado para ETF FACTOR LAYER Ω.**

- No abrir nuevas cuentas/brokers para ejecutar esta capa.
- DEGIRO, eToro y Quantfury quedan fuera de la arquitectura operativa de esta capa salvo cambio explícito futuro del usuario.
- La ejecución debe realizarse sobre el ETF/ETP real disponible en **Trading 212 Invest**, evitando CFD.

## 4. Sizing canónico

**ETF FACTOR LAYER Ω = 10% del patrimonio total objetivo.**

- El 90% restante corresponde a la arquitectura principal fuera de esta capa, con TOP35 Ω como núcleo de selección activa.
- El 10% es un límite/objetivo de capa, no una obligación de invertirlo de una sola vez.
- La distribución interna entre ETFs se decide por auditoría y ENTRY TIMING Ω.

### Split de trabajo actual

El backtest validó como escenario de referencia:

`6% EXUS + 4% MWEQ = 10% total`

**Estado del 6/4:** referencia preferida de investigación, todavía no canonizada como split definitivo de ejecución hasta validar disponibilidad exacta, spread y timing en Trading 212 Invest.

## 5. Arquitectura inicial validada para estudio

### Prioridad 1 — EXUS
**Xtrackers MSCI World ex USA UCITS ETF 1C**  
ISIN: `IE0006WW1TQ4`  
Función: mercados desarrollados ex-USA / reducción de concentración geográfica estadounidense.

### Prioridad 2 — MWEQ
**Invesco MSCI World Equal Weight UCITS ETF Acc**  
ISIN: `IE000OEF25S1`  
Función: MSCI World equiponderado / reducción de concentración mega-cap.

### Alternativas
- **ESAE**: alternativa World Equal Weight con filtros screened/select; no es sinónimo de MWEQ.
- **IS3S**: alternativa para un tilt Value explícito, no complemento automático de MWEQ.
- **5MVL / EMVL**: satélite Emerging Markets Value; riesgo de duplicación TSM/semiconductores, no núcleo automático.
- **IS3R**: Momentum satellite, separado del núcleo de diversificación.
- **VAGF**: renta fija; pertenece a función defensiva, no al bloque equity-factor puro.

## 6. Resultado cuantitativo de validación

Stress test del TOP35 canónico actual, equiponderado y con rebalanceo mensual, frente a escenario:

`90% TOP35 + 6% EXUS + 4% MWEQ`

Ventana exacta observable de ambos ETFs: `2024-09-09 -> 2026-08-11`.

Resultado del escenario ETF Layer frente al TOP35 solo:
- Volatilidad anualizada: **-7,37% relativa**.
- Downside volatility: **-7,73% relativa**.
- Max drawdown: mejora aproximada de **1,17 puntos porcentuales**.
- HHI sectorial simple: reducción aproximada de **10,9%**.
- Exposición USA por domicilio, modelo simple: reducción aproximada de **6,19 pp**.
- CAGR de precio: aproximadamente **0,91 pp menor** en la ventana.

Conclusión: la capa demuestra utilidad como **diversificador**, no como motor de alfa.

Informe: `docs/atlas/research/2026-08-13_ETF_LAYER_BACKTEST_ATLAS35_REAL_DATA.md`.

## 7. Gate de ejecución

Para cualquier ETF de esta capa deben validarse antes de comprar:
1. ISIN exacto.
2. Disponibilidad en Trading 212 Invest.
3. Tipo de instrumento real, evitando CFD.
4. Mercado/listing disponible en T212.
5. Divisa de cotización y riesgo económico real de divisa.
6. TER y estructura de réplica.
7. AUM/liquidez.
8. Bid-ask spread efectivo.
9. Comisión/costes/fiscalidad aplicable.
10. ENTRY TIMING Ω / NO-CHASE.
11. Solapamiento agregado con TOP35 y otras capas.

## 8. Relación con la política histórica de 2 ETFs

Este canon **supersede la arquitectura estructural** descrita en `docs/atlas/research/2026-08-11_ETF_TWO_SLOT_POLICY_XSWC_SPYX.md` según la cual los ETFs consumían plazas del TOP35.

También supersede cualquier planificación de ejecución de ETF Factor Layer Ω mediante brokers distintos de Trading 212.

No implica por sí mismo ninguna compra o venta de XSWC, SPYX ni de cualquier posición existente. Cualquier cambio de tenencia requiere decisión y registro de ejecución independientes.

## 9. Persistencia

Este módulo queda sujeto a `DUAL PERSISTENCE LAW Ω`:
- GitHub = fuente técnica/versionada.
- Notion = espejo operativo/documental.
