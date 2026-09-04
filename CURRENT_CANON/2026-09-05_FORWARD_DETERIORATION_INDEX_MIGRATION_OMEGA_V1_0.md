# ATLAS Ω — Forward Deterioration + Index Migration Ω v1.0

**Fecha canónica:** 2026-09-05  
**Estado:** ACTIVE / CANONICAL AMENDMENT  
**Precedencia:** complementa ATLAS Ω Master Prompt v4.0, T0 — Anti-Megacap Discovery Gate Ω, Expectation Gap Ω v1.1, Replacement Firewall y Decision Safety Gate. Donde exista conflicto, prevalecen Evidence Integrity Ω, Hard Gates y Replacement Firewall.

## 1. Objetivo

Detectar deterioro fundamental forward antes de que una acción permanezca en cartera/radar por inercia y, separadamente, usar migraciones de índices como señal secundaria de descubrimiento institucional sin confundirlas con calidad empresarial ni con flujo fundamental.

Principios:

- **PRECIO ≠ EVIDENCIA FUNDAMENTAL.**
- **INDEX INCLUSION ≠ BUY.**
- **INDEX DELETION ≠ SELL.**
- **INDEX MIGRATION ≠ BUSINESS QUALITY.**
- **GUIDANCE / KPI DETERIORATION > PRICE VOLATILITY.**
- **SECTOR KPI FIT:** no forzar ARR/RPO/billings sobre empresas donde no correspondan.
- **LIKE-FOR-LIKE FIRST:** no comparar automáticamente crecimiento trimestral con guidance anual ni mezclar bases no normalizadas.

## 2. Forward Deterioration Gate Ω

Aplicar a todo el universo ATLAS: cartera real confirmada, challengers, radar, candidatos, watchlists y cualquier ticker explícitamente incorporado.

### 2.1 Inputs obligatorios

Prioridad de evidencia: IR/10-Q/10-K/20-F/8-K/regulador > Reuters/Bloomberg/LSEG/S&P > análisis secundario.

Revisar, según sector:

- Revenue / organic revenue / same-store sales / volumes / ASP.
- ARR / billings / RPO / cRPO / net-new ARR / NRR cuando aplique.
- Backlog / bookings / orders / book-to-bill para industriales e infraestructura.
- Gross margin / operating margin / incremental margin.
- OCF / FCF / FCF margin / FCF per share.
- EPS y revisiones de beneficio cuando sean informativas.
- Customer concentration, customer/contract loss, cancellations.
- Balance sheet, leverage, refinancing, liquidity.
- SBC/dilution/share count.
- Sector-specific KPI principal.

### 2.2 Normalización obligatoria

Antes de calcular el delta de crecimiento:

1. Igualar periodicidad: trimestre vs trimestre, FY vs FY, o convertir explícitamente a base comparable.
2. Normalizar adquisiciones/divestitures.
3. Normalizar FX cuando sea material.
4. Identificar efectos base extraordinarios.
5. Separar mix/ciclo cuando distorsione la comparación.
6. Si no es comparable, **NO calcular delta mecánico**.

Ejemplo canónico: crecimiento trimestral +88% frente a guidance FY +47% no implica automáticamente -41 pp de deterioro. Sin base comparable, el delta queda `SUPPRESSED_NON_COMPARABLE`.

### 2.3 Umbrales

- **🟡 YELLOW:** crecimiento guiado comparable cae **≥3 pp** frente al crecimiento actual comparable.
- **🟠 ORANGE / REAUDIT OBLIGATORIA:** cae **≥5 pp** o una KPI principal se deteriora materialmente.
- **🔴 RED / REPLACEMENT-EXCLUSION REVIEW:** cae **≥8 pp**, existe **recorte explícito de guidance**, o empeoran simultáneamente **≥2 KPI fundamentales**.

Problemas materiales de balance, dilución, pérdida de cliente/contrato o cambio adverso de tesis activan como mínimo reauditoría y pueden escalar a RED por juicio fundamental documentado.

### 2.4 Regla de notificación

ATLAS notifica solo si:

- existe señal material nueva;
- la evidencia es trazable;
- la señal está confirmada por fuente primaria o, cuando no exista, por evidencia institucional robusta;
- el movimiento de precio tiene explicación fundamental cuando se use como contraste.

No notificar por volatilidad de precio sin deterioro fundamental.

Output mínimo:

`ticker | evento | cifras exactas | comparación previa | severidad | impacto tesis | acción ATLAS | fuentes | fecha`

Acciones válidas: `MAINTAIN / REAUDIT / REDUCE_REVIEW / OPEN_CHALLENGER_DUEL / REPLACEMENT_REVIEW / EXCLUSION_REVIEW`.

## 3. Index Migration Signal Ω

Señal secundaria independiente para movimientos S&P 600 → 400 → 500 → 100 y descensos inversos.

### 3.1 Puntuación bounded

Máximo absoluto: **2 puntos**.

- Promoción simple 600→400: +1.
- Promoción a S&P 500 o S&P 100: hasta +2.
- Democión simple: -1.
- Democión desde S&P 500/100 o de dos escalones: hasta -2.

**Nunca modifica Business Quality Score directamente.** `BusinessQualityPoints = 0` siempre.

La señal puede elevar prioridad de auditoría/Discovery o funcionar como pequeño catalyst/sponsorship signal, pero:

- no supera Hard Gates;
- no neutraliza Forward Deterioration;
- no neutraliza Expectation Gap;
- no activa BUY/SELL por sí sola;
- no sustituye evidencia fundamental.

## 4. Index Promotion Discovery Ω

Toda promoción de índice entra automáticamente en Discovery con:

- `startingScore = 0`;
- `source = INDEX_PROMOTION`;
- T0 — Anti-Megacap Discovery Gate Ω obligatorio;
- Forward Deterioration Gate Ω obligatorio;
- Expectation Gap Ω obligatorio antes de BUY;
- clasificación por bucket de capitalización para impedir sesgo de familiaridad.

La inclusión en índice solo cambia **prioridad de búsqueda**, no la puntuación de calidad inicial.

## 5. Integración en pipeline

Pipeline actualizado:

`INPUT → Evidence Integrity → Source Authenticity → Quantitative Integrity → Temporal Normalization → Global Discovery → Index Promotion Discovery → T0 Anti-Megacap → Leadership Bias Control → Forward Deterioration Gate → motores independientes → Cross-Engine Synthesis → Expectation Gap → Portfolio Construction → Replacement Firewall → Decision Safety Gate → Execution → Monitoring/Falsification → Decision Log → GitHub + Notion`

## 6. Registro inicial del rebalanceo sep-2026

Este registro no concede BUY automático y no modifica por sí mismo la cartera real.

- **DELL:** promoción S&P 100; mantener tratamiento fundamental vigente. Index Signal positivo, sin puntos de calidad.
- **ANET:** promoción S&P 100; Challenger/priority audit.
- **PANW:** promoción S&P 100; Challenger/priority audit; vigilar conciliación GAAP/adjusted y adquisiciones/SBC.
- **SNDK:** promoción S&P 100; Radar prioritario; Expectation Gap obligatorio por ciclo NAND/storage y expansión de expectativas.
- **BE:** promoción S&P 500; Radar / NO CHASE hasta P0/Expectation Gap.
- **ILMN:** promoción S&P 500; Radar de rehabilitación, no BUY por índice.
- **P (Everpure):** promoción S&P 500; Challenger prioritario sujeto a auditoría completa.
- **CORT:** promoción S&P 400; Challenger prioritario; starting score 0 bajo T0.
- **EAT:** promoción S&P 400; Radar.
- **HUBS:** migración al S&P 400; reauditoría forward independiente de la migración.
- **TTD:** salida S&P 500; la salida del índice no causa RED, pero cualquier RED debe proceder de deterioro fundamental confirmado.
- **BLDR:** salida S&P 500; tratar como ciclo/turnaround si los fundamentales lo justifican, nunca como exclusión automática por índice.

## 7. Implementación técnica

Código canónico:

- `src/atlas/algorithm/forward-deterioration-index-migration-omega.ts`
- `src/atlas/algorithm/forward-deterioration-index-migration-omega.test.ts`

La implementación incluye:

- umbrales 3/5/8 pp;
- RED por guidance cut;
- RED por ≥2 KPI materiales simultáneas;
- ORANGE por una KPI material;
- supresión de comparaciones no comparables;
- notificación solo con evidencia confirmada;
- Index Migration bounded ±2;
- Business Quality = +0 por migración;
- Discovery de promociones desde score 0 bajo T0.

## 8. Gobernanza

Este módulo queda ACTIVO desde 2026-09-05. Cualquier cambio futuro de umbrales, pesos o taxonomía requiere nueva versión y Decision Log. Ninguna alerta basada solo en precio o pertenencia a índice puede activar sustitución.
