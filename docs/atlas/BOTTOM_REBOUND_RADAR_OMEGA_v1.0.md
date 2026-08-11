# ATLAS Ω — BOTTOM & REBOUND RADAR Ω v1.0

**Estado:** Especificación canónica preparada para implementación  
**Fecha:** 2026-08-11  
**Misión:** detectar capitulación, formación de suelo y comienzo de reversión con suficiente confirmación para capturar una parte temprana del rebote, sin intentar predecir el mínimo exacto.

## 1. Separación de motores

BOTTOM & REBOUND RADAR Ω es independiente de:
- GREEN CONTINUITY Ω: selección/mantenimiento por fuerza multihorizonte.
- ENTRY TIMING Ω / NO-CHASE GATE: riesgo de entrada extendida.
- Business Quality Ω y valoración.
- HISTORICAL DISLOCATION Ω / Burry Contrarian Engine.
- Money Rotation Ω.

Una acción puede fallar GREEN CONTINUITY (por ejemplo 3M/1A rojo) y simultáneamente ser candidata válida del Bottom Radar. Esto es intencionado: GREEN CONTINUITY confirma fuerza; Bottom Radar busca la transición antes de que todos los horizontes estén verdes.

## 2. Objetivo operativo

Secuencia buscada:

CAPITULACIÓN → SUELO → CATALIZADOR → REVERSIÓN → CONFIRMACIÓN

No se pretende comprar exactamente en el tick mínimo. Se pretende maximizar la relación entre entrada temprana y evidencia de que el mínimo probablemente ya se ha producido.

## 3. Universo de descubrimiento

Prioridad para acciones con:
- drawdown aproximado de 20–70% desde ATH/52W high;
- negocio viable o catalizador verificable;
- liquidez suficiente;
- caída que pueda representar dislocación y no destrucción permanente del negocio.

El radar puede examinar cartera, Watchlist y discovery global. Una caída grande por sí sola nunca es señal BUY.

## 4. Score 0–100

### A. Capitulation / Exhaustion — 20 puntos
- Drawdown vs ATH y 52W high.
- Velocidad/aceleración de la caída.
- ATR y expansión extrema de volatilidad.
- Volumen de capitulación.
- Gap bajista / selling climax.
- Distancia extrema a medias/tendencia.

### B. Bottom Formation — 20 puntos
- Deja de imprimir nuevos mínimos.
- Higher low.
- Doble suelo/base/retest válido.
- Contracción de volatilidad tras capitulación.
- Divergencia alcista precio/RSI u otros osciladores.
- Reducción del volumen vendedor.

### C. Reversal Confirmation — 20 puntos
- Recuperación VWAP.
- Recuperación MM20 y posteriormente MM50.
- Break de estructura bajista.
- Higher high.
- Volumen comprador superior al vendedor.
- Relative strength frente a índice/sector mejorando.

### D. Fundamental Survival — 20 puntos
- FCF/owner earnings y tendencia cuando sean aplicables.
- Balance, liquidez, deuda y riesgo de refinanciación.
- ROIC/retorno incremental.
- Márgenes y revisiones de estimaciones.
- Guidance y calidad de ingresos.
- Ausencia de falsificador estructural.

### E. Catalyst + Money Rotation — 15 puntos
- Resultados/guidance mejores de lo temido.
- Contratos/adjudicaciones relevantes.
- Revisiones positivas de estimaciones.
- Insider buying/recompras cuando sean materiales.
- M&A/producto/regulación/catalizador sectorial.
- Entrada de flujos/fortaleza relativa sectorial.

### F. Entry Efficiency — 5 puntos
- Distancia al mínimo reciente.
- Reward/risk hasta soporte e invalidación.
- Penalización por gap vertical o extensión excesiva.

## 5. Estados

- 0–39: NO TOUCH
- 40–59: CAPITULATION WATCH
- 60–74: BOTTOM FORMING
- 75–84: REBOUND CONFIRMED
- 85–100: HIGH-CONVICTION REVERSAL

Los umbrales deben calibrarse mediante backtesting; no son probabilidades de éxito.

## 6. Hard falsifiers / bloqueos

Bloquear BUY aunque el precio parezca formar suelo cuando exista evidencia material de:
- insolvencia/dilución destructiva no compensada;
- deterioro estructural del negocio;
- pérdida crítica de cliente/producto/moat;
- fraude/problema contable material;
- guidance/estimaciones colapsando sin estabilización;
- FCF y retorno incremental deteriorándose persistentemente;
- deuda/refinanciación incompatible con generación de caja;
- catalizador puramente narrativo sin evidencia.

## 7. NO-CHASE GATE

Después de detectar un suelo, impedir perseguir una reversión vertical.

Variables:
- % desde mínimo local;
- ATR desde mínimo;
- distancia a VWAP/MM20/MM50;
- gap acumulado;
- volumen/clímax comprador;
- existencia de consolidación/retest.

Estados:
- ENTRY WINDOW
- WAIT RETEST
- CHASE RISK
- NO CHASE

Una subida de 15–20% desde mínimos en muy poco tiempo sin consolidación debe elevar fuertemente CHASE RISK; no constituye una regla fija universal porque se normalizará por volatilidad/ATR.

## 8. Radar 24/7 — arquitectura prevista

### Data ingestion
- Precios intradía + OHLCV histórico.
- Premarket/after-hours cuando el proveedor lo permita.
- Corporate actions.
- Noticias y filings.
- Earnings, guidance y estimates revisions.
- Sector/ETF/index breadth y relative strength.

### Pipeline
1. Universe Scanner.
2. Drawdown Detector.
3. Capitulation Detector.
4. Fundamental Survival Gate.
5. Bottom Formation Engine.
6. Catalyst/Event Engine.
7. Reversal Confirmation Engine.
8. Entry Timing / NO-CHASE Gate.
9. Evidence Integrity Ω validation.
10. Alert Engine.

### Alertas
- LEVEL 1: CAPITULATION DETECTED.
- LEVEL 2: BOTTOM FORMING.
- LEVEL 3: REVERSAL TRIGGER.
- LEVEL 4: REBOUND CONFIRMED.
- INVALIDATION: THESIS/BOTTOM FAILED.
- NO-CHASE: MOVE TOO EXTENDED.

Cada alerta debe incluir ticker, timestamp, precio, score total, sub-scores, evidencias, catalizador, nivel de invalidación y estado NO-CHASE.

## 9. Persistencia / esquema mínimo

```text
BottomRadarSignal
- ticker
- timestamp
- price
- ath_drawdown_pct
- high52w_drawdown_pct
- local_low
- distance_from_local_low_pct
- atr
- volume_zscore
- rsi
- vwap_distance_pct
- ma20_distance_pct
- ma50_distance_pct
- capitulation_score
- bottom_score
- reversal_score
- fundamental_score
- catalyst_score
- entry_efficiency_score
- total_score
- radar_state
- no_chase_state
- invalidation_price
- catalyst_ids[]
- evidence_record_ids[]
- falsifiers[]
```

## 10. Evaluación y aprendizaje

Guardar cada señal para medir posteriormente:
- retorno +1D/+5D/+20D/+60D;
- maximum favorable excursion;
- maximum adverse excursion;
- falso suelo sí/no;
- tiempo hasta confirmación;
- porcentaje del rebote capturable;
- comportamiento por sector, volatilidad y régimen macro.

No modificar pesos automáticamente sin muestra suficiente y auditoría. Separar backtest, paper signals y señales live.

## 11. Relación con ATLAS Ω

Flujo recomendado:

BOTTOM RADAR descubre → Fundamental Survival valida → Catalyst confirma → Reversal confirma → ENTRY TIMING decide si ejecutar → GREEN CONTINUITY puede posteriormente convertir la posición en mantenimiento por momentum multihorizonte.

Regla central: **un suelo técnico no repara una tesis fundamental rota; una tesis fundamental intacta tampoco confirma por sí sola que el precio haya hecho suelo.**

## 12. Casos iniciales de validación

Usar RIOT y ONON como casos de estudio/backtest iniciales, sin codificar sus resultados como reglas. RIOT permite estudiar catalizador + reversión rápida; ONON permite estudiar gap bajista por resultados y distinguir sobrerreacción de deterioro real.

## 13. Criterio de éxito

El motor será útil si mejora frente a comprar una caída aleatoria y frente a esperar 5/5 GREEN, reduciendo falsos suelos y capturando una fracción material de reversiones válidas con drawdown posterior controlado.

**Principio Ω:** No acertar el mínimo. Detectar antes que el mercado que la relación evidencia/riesgo ha cambiado.