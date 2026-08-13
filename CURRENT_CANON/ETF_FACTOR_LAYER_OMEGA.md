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

## 3. Arquitectura inicial validada para estudio

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

## 4. Resultado cuantitativo de validación

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

## 5. Sizing

`90/6/4` es por ahora un **escenario de investigación validado**, no una asignación de capital definitiva.

No queda autorizado ningún BUY automático por este documento.

## 6. Gate de ejecución

Para cualquier ETF de esta capa deben validarse antes de comprar:
1. ISIN exacto.
2. Broker y mercado disponible.
3. Tipo de instrumento real, evitando CFD cuando se busca propiedad del ETF.
4. Divisa de cotización y riesgo económico real de divisa.
5. TER y estructura de réplica.
6. AUM/liquidez.
7. Bid-ask spread efectivo.
8. Comisión/custodia/fiscalidad aplicable.
9. ENTRY TIMING Ω / NO-CHASE.
10. Solapamiento agregado con TOP35 y otras capas.

## 7. Relación con la política histórica de 2 ETFs

Este canon **supersede únicamente la arquitectura estructural** descrita en `docs/atlas/research/2026-08-11_ETF_TWO_SLOT_POLICY_XSWC_SPYX.md` según la cual los ETFs consumían plazas del TOP35.

No implica por sí mismo ninguna compra o venta de XSWC, SPYX ni de cualquier posición existente. Cualquier cambio de tenencia requiere decisión y registro de ejecución independientes.

## 8. Persistencia

Este módulo queda sujeto a `DUAL PERSISTENCE LAW Ω`:
- GitHub = fuente técnica/versionada.
- Notion = espejo operativo/documental.
