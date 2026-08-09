# RFC-MONEY-ROTATION-OMEGA-v1.3

## Estado

CANDIDATO CANÓNICO. Mobile-first. No modifica CORE-00 ni sustituye el score fundamental ATLAS Ω.

## Misión

Detectar rotación temprana de capital y dislocaciones históricas antes del consenso, separando estrictamente:

- datos de flujo real;
- señales de precio/market sensor;
- calidad y supervivencia del negocio;
- régimen macro;
- decisión fundamental ATLAS.

MONEY ROTATION Ω no emite BUY, REDUCE ni SELL por sí solo.

## Rotation Score Ω

- Flujos: 20%
- Fuerza relativa: 20%
- Revisiones de beneficios: 15%
- Breadth: 10%
- Volumen institucional: 10%
- Reacción a noticias/resultados: 10%
- Régimen macro: 10%
- Crowding: 5%

Cada componente se puntúa 0–100. En crowding, 100 significa amplio margen antes del consenso; no crowding extremo.

## MARKET REGIME & CAPITAL ROTATION Ω

Siete familias permanentes:

1. Breadth.
2. Money Flows.
3. Value vs Growth.
4. Rates + Dollar.
5. Gold.
6. Oil + Commodities.
7. Crowding.

Estas familias determinan qué investigar. No sustituyen la evidencia de empresa ni generan órdenes.

## Integridad de flujos

1. Toda cifra de flujo requiere una métrica de flujo explícita y fuente trazable.
2. Una serie comparable mantiene proveedor, dataset, universo, periodo, ventana, divisa, unidad y métrica.
3. Solo se suman particiones demostrablemente no solapadas.
4. MARKET_CAP_CHANGE, PRICE_RETURN, AUM_CHANGE, GOVERNMENT_BUDGET, PRIVATE_COMPANY_VALUATION, COMMODITY_PHYSICAL_DEMAND y PRODUCTION_GROWTH nunca forman un total de rotación.
5. Ventanas 1W, 4W, 13W, MONTH y YTD se conservan separadas.
6. Conflictos equivalentes no reconciliados producen PENDING_PRIMARY_VALIDATION.
7. Un sensor de precio nunca puede declarar por sí solo una fase R3 o R4 canónica.

## Escalera canónica R1–R6

### R1 — ABANDONED

El capital continúa saliendo, pero no existe evidencia confirmada de deterioro estructural del negocio. Estado de investigación, no de compra.

### R2 — CAPITULATION

Destrucción extrema de precio/sentimiento con negocio todavía estructuralmente intacto. Requiere demostrar supervivencia; si el negocio está roto se rechaza la dislocación.

### R3 — FLOOR

El deterioro deja de empeorar. Las cinco señales de confirmación son:

1. OUTFLOW_STOPPED.
2. RELATIVE_STRENGTH_IMPROVING.
3. EARNINGS_REVISIONS_IMPROVING.
4. BREADTH_EXPANDING.
5. INSTITUTIONAL_VOLUME_CONFIRMING.

- 1–2 señales: R3_CANDIDATE, solo MONITOR.
- 3 o más: R3_CONFIRMED, todavía solo MONITOR.

### R4 — EARLY ACCUMULATION

Requiere R3 confirmado más:

- al menos dos ventanas positivas comparables de flujo;
- buena noticia o resultado mejor tras una fase de destrucción;
- reacción positiva del mercado a esa noticia.

Trigger canónico:

`GOOD_NEWS_AFTER_DESTRUCTION_PLUS_POSITIVE_REACTION_AND_PERSISTENT_COMPARABLE_FLOWS`

Solo R4 confirmado se entrega al algoritmo principal.

### R5 — ATLAS DISCOVERY

La tendencia ya es detectable por el stack principal ATLAS Ω. La oportunidad deja de pertenecer exclusivamente al motor contrarian.

### R6 — CONSENSUS

La narrativa y el posicionamiento son ampliamente conocidos/crowded. No implica vender, pero el motor prohíbe perseguir mecánicamente el consenso.

## Gold Structural Ω vs Gold Tactical Ω

El oro se divide en dos canales independientes.

### Structural

- compras de bancos centrales;
- diversificación de reservas;
- demanda física;
- estrés/desconfianza monetaria.

### Tactical

- ETF flows;
- yields reales;
- dólar;
- momentum.

Una señal structural fuerte no convierte automáticamente la señal tactical en fuerte, y viceversa.

## Oil Regime Ω

El petróleo se interpreta mediante:

- tendencia de precio;
- balance oferta/demanda;
- riesgo geopolítico;
- evidencia primaria trazable.

Un escenario de caída de petróleo con superávit esperado permanece `CONDITIONAL_DISINFLATIONARY` mientras el riesgo geopolítico siga siendo alto. Sin evidencia primaria queda `UNVALIDATED`.

## Matriz Oro × Petróleo

- Oro ↑ / Petróleo ↑ → GEOPOLITICS_INFLATION → investigar energía, defensa, materiales y riesgo de duración en growth.
- Oro ↑ / Petróleo ↓ → RISK_DISINFLATION → investigar quality, healthcare, bonos y defensivos.
- Oro ↓ / Petróleo ↑ → REFLATION_GROWTH → investigar industriales, bancos y energía.
- Oro ↓ / Petróleo ↓ → DISINFLATION_RISK_ON → investigar consumo, quality growth y small/mid caps.

Esta matriz es un selector de investigación, nunca una orden automática.

## Historical Dislocation Ω

Regla esencial:

**precio roto + sentimiento roto + negocio intacto** puede abrir una investigación.

**precio roto + negocio roto** se rechaza.

La pregunta central del motor pasa a ser:

> ¿Dónde ha dejado de salir dinero aunque todavía no sea evidente que esté entrando?

Y el trigger de máximo interés:

> ¿Qué empresa recibe una buena noticia después de meses de destrucción y, por primera vez, el mercado decide creerla?

## Mobile-first

La app móvil puede mostrar price proxies para discovery, pero debe etiquetarlos como sensores. No puede presentar esos proxies como R3/R4 canónicos sin pasar el gate de evidencia de MONEY ROTATION Ω v1.3.

## Guardrail de decisión

La salida permitida del motor es:

- RESEARCH;
- MONITOR;
- HANDOFF_ATLAS_MAIN;
- AVOID_CHASING;
- REJECT.

Nunca una orden de cartera aislada.
