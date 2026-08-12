# ATLAS Ω — 41 TICKERS · GITHUB ENGINES PREFLIGHT

Fecha: 2026-08-12
Estado histórico: RESEARCH / RUNTIME_PENDING · Reconciliado con auditoría actual de 40
Origen: lista única de 41 compañías suministrada por Vicente.

## Objetivo

Pasar el lote por la arquitectura real definida en GitHub sin inventar scores ni decisiones que requieran datos de mercado/fundamentales no ejecutados en el runtime.

## Motores y jerarquía realmente implementados

Secuencia canónica principal observada en `src/atlas/algorithm/atlas-primary-engine-hierarchy.ts`:

`EVIDENCE -> SOURCE AUTHENTICITY -> QUANTITATIVE INTEGRITY -> TEMPORAL NORMALIZATION -> GLOBAL DISCOVERY -> GREEN CONTINUITY -> BUSINESS QUALITY -> GROWTH -> CAPEX PRODUCTIVITY -> VALUATION -> RISK -> MONEY ROTATION -> ENERGY ROTATION cuando aplique -> GOOD COMPANIES CHEAP cuando aplique -> HISTORICAL DISLOCATION cuando aplique -> SPECIALIZED ENGINES -> EVENT PRICING cuando aplique -> AI CAPITAL EFFICIENCY cuando aplique -> DECISION SAFETY GATE -> DECISION LOG`.

Reglas relevantes:
- GREEN CONTINUITY Ω es el selector principal.
- Entrada nueva exige 5/5 GREEN: 1W > 0, 1M > 0, 3M > 0, 1Y > 0 y TOTAL > 0 en un corte sincronizado.
- El scorer cuantitativo móvil usa Business Quality 25% + Growth 20% + Moat proxy 15% + Financial Quality 15% + Management proxy 10% + Valuation 15%.
- Candidate BUY cuantitativo requiere cobertura suficiente y, en el scorer actual, `AtlasScore >= 72`, `Quality >= 65`, `Growth >= 45`, `Valuation >= 35` y `Risk <= 60`.
- CAPEX Productivity del endpoint móvil sigue siendo `PARTIAL_SENSOR`; no debe confundirse con el motor canónico completo.
- Money Rotation e Historical Dislocation son capas de investigación/contexto y no emiten una orden de cartera por sí mismas.

## Lista única recibida

1. ABN — ABN AMRO Bank
2. A — Agilent Technologies
3. NEE — NextEra Energy
4. AMD — Advanced Micro Devices
5. MRSH — Marsh
6. CEG — Constellation Energy
7. ROP — Roper Technologies
8. IQE — IQE
9. ICE — Intercontinental Exchange
10. META — Meta Platforms
11. MTE — Micron Technology
12. CTAS — Cintas
13. LLY — Eli Lilly & Co
14. ABT — Abbott Laboratories
15. HEI — HEICO
16. JPM — JPMorgan Chase & Co
17. BKNG — Booking Holdings
18. PANW — Palo Alto Networks
19. ACN — Accenture
20. HAG — Hensoldt
21. NOC — Northrop Grumman
22. MDT — Medtronic
23. ORC — Oracle
24. AXON — Axon Enterprise
25. CAT — Caterpillar
26. UBER — Uber Technologies
27. TMO — Thermo Fisher Scientific
28. ZTS — Zoetis
29. FAST — Fastenal
30. TKA — thyssenkrupp
31. SU — Schneider Electric
32. HLMA — Halma
33. INTU — Intuit
34. DHR — Danaher
35. ASML — ASML
36. IFX — Infineon Technologies
37. RHM — Rheinmetall
38. SAF — Safran
39. COR — Cencora
40. BSP — BAE Systems
41. NOW — ServiceNow

Total: 41, sin duplicados.

## Normalización de símbolos para el runtime

Mapeos ya reconciliados con el propio repositorio:
- MTE / Micron Technology -> `MU`.
- ORC / Oracle -> `ORCL`.
- SU / Schneider Electric -> `SU.PA` en el bootstrap ATLAS.
- SAF / Safran -> `SAF.PA`.
- MRSH se mantiene como `MRSH`.

Mapeos extranjeros que requieren resolución exacta por proveedor antes de ejecutar un score certificado:
- ABN — ABN AMRO.
- IQE — IQE.
- HAG — Hensoldt.
- TKA — thyssenkrupp.
- HLMA — Halma.
- IFX — Infineon.
- RHM — Rheinmetall.
- BSP — BAE Systems.

Nota BAE: el bootstrap histórico del repo contiene `BAE.L`, pero la identificación debe corregirse/reconciliarse antes de usarla como símbolo de mercado canónico. No se ejecuta DATA_FAIL como si fuera fallo del negocio.

## Enrutado por motores especializados

### GREEN CONTINUITY Ω
Aplica a las 41. No se certifica PASS/FAIL sin retornos 1W/1M/3M/1Y/TOTAL del mismo corte de mercado.

### ATLAS Core / Quality / Growth / Valuation / Risk
Aplica a las 41 una vez resuelto el símbolo del proveedor. No se fabrican scores ausentes.

### AI Capital Efficiency Gate Ω
El código actual monitoriza explícitamente, dentro de este lote:
- AMD
- META
- MU
- ORCL
- CEG
- NOW

El gate exige evidencia trazable de NOPAT incremental, capital incremental y WACC para poder emitir PASS/BLOCK; de lo contrario queda REVIEW/INSUFFICIENT_EVIDENCE.

### Agentic Security Discovery Ω
- PANW es el único ticker de este lote incluido explícitamente en la cola especializada de seguridad agéntica.
- La pertenencia al seed no equivale a BUY.

### Money Rotation Ω
Puede aplicarse como capa de régimen/rotación a las 41, especialmente para interpretar semis, utilities/power, industriales, defensa, salud y financieros. No reemplaza GREEN CONTINUITY ni Business Quality y no emite órdenes por sí solo.

### Energy Rotation Ω
El motor implementado está diseñado para integrated majors, E&P shale, oil services y midstream/LNG. NEE y CEG no deben forzarse dentro de ese motor por ser utilities/power; su lectura energética debe ir por Money Rotation / AI infrastructure / power-grid context cuando proceda.

### AI Infrastructure Rotation Ω
Puede estudiar nombres del lote solo si existe una tesis homogénea y al menos dos evidencias trazables por compañía. El motor prohíbe mezclar tesis en un ranking relativo y penaliza crowding/price discovery.

### Historical Dislocation / Good Companies Cheap
Son motores independientes de GREEN CONTINUITY. Un ticker puede fallar 5/5 GREEN y seguir siendo válido como candidato contrarian; no convertir esa condición en BUY automático.

## Estado de ejecución

No se ha podido invocar desde esta sesión el backend Render/Finnhub (`atlas-genesis-api.onrender.com`) por falta de conectividad DNS del entorno de ejecución. Por tanto:
- NO se publican AtlasScore numéricos como si hubieran sido calculados.
- NO se publican BUY/NO_BUY live como si fueran salida del runtime.
- NO se interpreta DATA_FAIL de símbolos extranjeros como deterioro fundamental.

Este documento es un preflight auditable de identificación + enrutado. El siguiente estado válido es `RUNTIME_EXECUTED` cuando las 41 compañías hayan recibido datos sincronizados y se hayan calculado GREEN CONTINUITY + Core/Quality/Growth/Valuation/Risk y los motores especializados aplicables.

## Guardrail

`No data -> no fabricated score.`

Este preflight no modifica cartera, watchlist ni canon de decisión. Es una entrada de investigación para ejecución posterior del runtime.

## Reconciliación ejecutada · 2026-08-12

Las capturas actuales contienen **40 emisores únicos**, no 41. `CAT` pertenecía al lote histórico anterior y no aparece en las capturas actuales; se conserva aquí como historial y se excluye de la auditoría vigente.

Resolución canónica cerrada:
- `MTE → MU`
- `ORC → ORCL`
- `BSP → BA.L` para BAE Systems
- `MRSH` se mantiene como ticker vigente de Marsh & McLennan
- Europa: `ABN.AS`, `IQE.L`, `HAG.DE`, `IFX.DE`, `RHM.DE`, `SAF.PA`, `TKA.DE`, `SU.PA`, `HLMA.L`

El runtime de investigación ya fue ejecutado con cierres ajustados sincronizados al 11-ago-2026 y métricas fundamentales/valoración observadas el 12-ago-2026:
- [Auditoría legible de 40 acciones](./2026-08-12_40_TICKER_ATLAS_ENGINE_AUDIT.md)
- [Dataset estructurado de 40 acciones](./2026-08-12_40_TICKER_ATLAS_ENGINE_AUDIT.json)

Resultado agregado: **15 GREEN 5/5**, **6 ADVANCE a diligencia primaria**, sin BUY/SELL automático ni mutación de cartera/canon.
