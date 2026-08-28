# AI VALUE MIGRATION / RECEIVER GATE Ω

**Status:** CANONICAL / ACTIVE / TRANSVERSAL  
**Effective:** 2026-08-28  
**Parent:** `CURRENT_CANON/AI_VALUE_DISTRIBUTION_OMEGA.md`  
**Implementation:** `src/atlas/algorithm/ai-value-migration-receiver-omega.ts`  
**Research snapshot:** `docs/information/2026-08-28_AI_VALUE_MIGRATION_RECEIVER_RESEARCH.md`

## Objective

Detectar qué compañías pueden capturar el siguiente tramo del profit pool de IA cuando el valor económico migra desde compute/capex hacia cloud, datos, system of record, workflow, aplicaciones, distribución y output económico final.

Este gate **NO infiere flujos desde precio** y **NO declara rotación estructural por una sesión**. La dispersión bursátil puede crear una hipótesis de migración; la confirmación exige evidencia económica y persistencia independiente.

## Core distinction

`AI CAPEX WINNER != AI VALUE RECEIVER != BEST STOCK AT CURRENT PRICE`

El receptor económico debe superar la cadena:

`CAPABILITY -> ADOPTION -> RECURRENT USAGE -> CUSTOMER ACCEPTANCE -> PAID EXPANSION -> ATTRIBUTABLE AI REVENUE -> MARGIN LINKAGE -> FCF/SHARE -> DURABLE INCREMENTAL ROIC`

Los estados de prueba reutilizan AI Value Distribution Ω:

`T0_NARRATIVE -> T1_ADOPTION -> T2_REVENUE_LINKAGE -> T3_MARGIN_LINKAGE -> T4_FCF_PROOF -> T5_DURABLE_ROIC`

## Receiver control fields

Para cada candidato registrar:

- `WORKFLOW_CONTROL`
- `SYSTEM_OF_RECORD_CONTROL`
- `TRUSTED_DATA_CONTROL`
- `DISTRIBUTION_CONTROL`
- `SWITCHING_COSTS`
- `PAID_EXPANSION`
- `ATTRIBUTABLE_AI_REVENUE`
- `MARGIN_LINKAGE`
- `FCF_LINKAGE`
- `INCREMENTAL_ROIC`
- `CAPEX_INTENSITY`
- `FUNDING_FRAGILITY`
- `VALUATION_EXPECTATION_RISK`
- `FALSIFIERS`

## Receiver states

- `DISCOVERY`: narrativa, producto o partnership sin adopción verificable.
- `WATCH`: adopción/uso verificable, pero sin revenue linkage atribuible.
- `RECEIVER_CANDIDATE`: T2/T3; existe revenue linkage o margen relacionado, pero falta FCF/ROIC durable.
- `ECONOMIC_RECEIVER_CONFIRMED`: T4; FCF/share incremental atribuible suficientemente demostrado.
- `DURABLE_VALUE_RECEIVER`: T5; incremental ROIC durable y repetible.

## AI Value Migration signal

La migración del profit pool es un estado de **cohorte**, no de ticker aislado.

Estados:

- `NO_MIGRATION_SIGNAL`
- `MIGRATION_WATCH`
- `MIGRATION_CANDIDATE`
- `MIGRATION_CONFIRMED`

### Minimum confirmation discipline

`MIGRATION_CONFIRMED` requiere simultáneamente:

1. al menos 3 receptores independientes con `T2+` y evidencia primaria o reconciliada;
2. mejora verificable en adopción/revenue/margen/revisiones del cohort receptor;
3. persistencia de mercado multi-sesión cuando se utilice price response como confirmación secundaria;
4. no confundir debilidad del source layer con transferencia causal de valor;
5. el source layer puede seguir creciendo fundamentalmente mientras el receptor captura una proporción incremental del profit pool;
6. si se usa breadth de mercado, debe definirse ex ante el universo completo del cohort y no puede reciclar denominadores C1-C19 para declarar un Hard Layer Jump.

Una sola sesión de `NVDA down / software up`, aunque sea informativa, permanece como `MIGRATION_WATCH`.

## Orthogonality rules

- `PRICE RESPONSE != FUNDAMENTAL PROOF`.
- `RELATIVE STRENGTH != VERIFIED CAPITAL FLOW`.
- `AI ARR != AI FCF`.
- `AI FCF != DURABLE INCREMENTAL ROIC`.
- `SYSTEM OF RECORD != AGENT INTERFACE`; pueden coexistir o competir por el mismo profit pool.
- `CLOUD GROWTH != APPLICATION MONETIZATION`.
- `LOWER INFERENCE COST != HIGHER OWNER RETURN` sin volumen, precio, margen y FCF.
- `CAPEX HEAVY RECEIVER` debe pasar Capital Malinvestment Ω, Cash Reality Ω, Capital Funding Quality Ω y Financed Demand Ω.

## Portfolio transmission

Este gate no emite BUY/SELL ni modifica pesos por sí solo. Entrega candidatos a:

`Competition for Capital -> Valuation -> Risk -> Entry Timing -> Portfolio Construction -> Decision Safety Gate`

Para una cartera de baja volatilidad, ATLAS debe distinguir entre:

- `DEFENSIVE_RECEIVER`: trusted data / workflow / recurring revenue / low capex;
- `GROWTH_RECEIVER`: monetización fuerte pero mayor duration/valuation sensitivity;
- `CAPEX_HEAVY_RECEIVER`: monetización creciente con elevada reinversión física;
- `OPTIONALITY_RECEIVER`: distribución o workflow sin monetización demostrada todavía.

## Current 2026-08-28 stance

La combinación observada de resultados fuertes en enterprise software y data/workflow, junto con una respuesta bursátil divergente frente a parte del semiconductor cohort, se clasifica como:

`AI_VALUE_MIGRATION = MIGRATION_WATCH`

No se promueve a `MIGRATION_CONFIRMED` por una semana o una sesión. La investigación actual prioriza CRM, NOW, RELX, TRI, GOOG, MSFT, PLTR, SNOW, ADBE, WDAY, SPGI, MCO y SAP como receptores a verificar, con riesgos de valoración, CAPEX o volatilidad separados.

**Default:** `WATCH / WAIT FOR ECONOMIC PROOF / NO PORTFOLIO CHANGE`.
