# ATLAS Hub — Canonical Core Ω

**Estado:** implementación inicial en `main`  
**Versión:** `ATLAS-HUB-CANONICAL-CORE-OMEGA-v0.1.0`  
**Fecha:** 2026-08-20  
**Alcance:** núcleo ontológico broker-agnostic para ATLAS Hub.  

## Veredicto

La implementación previa del **ATLAS Hub / Canonical Core / Knowledge Graph** no estaba materializada como módulo de código en `src/atlas`. Quedaba como diseño. Esta entrega crea la primera implementación aislada, sin tocar screener ni UI.

## Archivos añadidos

- `src/atlas/canonical-core/canonical-core-omega.ts`
- `src/atlas/canonical-core/index.ts`

## Qué implementa

1. **Canonical Registry Ω**
   - Entidades universales: company, ETF, index, country, currency, commodity, person, organization, technology, product, macro indicator y supply-chain node.
   - IDs canónicos estables (`msft-us`, `nvda-us`, `fed-org`, `hbm-tech`, etc.).
   - Alias resueltos de forma broker-agnostic.
   - Provenance obligatorio por entidad.

2. **Relation Registry Ω**
   - Relaciones tipadas: `SUPPLIES`, `CUSTOMER_OF`, `COMPETES_WITH`, `PARTNER_OF`, `OWNS`, `REGULATES`, `DEPENDS_ON`, `USES`, `MANUFACTURES`, `EXPOSED_TO`, `AFFECTS`.
   - Validez temporal (`validFromUtc`, `validToUtc`).
   - Peso de influencia y factor de propagación.
   - Provenance obligatorio por relación.

3. **Event Registry Ω**
   - Eventos normalizados: earnings, guidance, rate decision, export control, war escalation, cyber attack, acquisition, product launch, supply disruption, capex announcement, macro release y regulatory action.
   - Validación constitucional: entidad primaria, tipo de evento, timestamp, entidades relacionadas, horizonte temporal, magnitud y provenance.

4. **Time Ω**
   - Toda relación tiene ventana temporal explícita.
   - El grafo evita relaciones fósiles mediante `validToUtc`.

5. **Influence Ω**
   - Peso causal `0.0–1.0`.
   - `propagationFactor` para Cascade Engine Ω.
   - Método explícito: `MANUAL_SEED`, `PRIMARY_EVIDENCE`, `BACKTEST_LEARNED`, `PENDING_VALIDATION`.

6. **Cascade Engine Ω v0**
   - Función pura `computeCascadeImpacts()`.
   - Recorre relaciones activas hasta profundidad configurable.
   - Evita ciclos.
   - Devuelve impactos acumulados, path y profundidad.

7. **Constitutional Validators**
   - `validateEntity()`
   - `validateRelation()`
   - `validateEvent()`
   - `assertCanonicalSeedIntegrity()`

## Restricciones cumplidas

- No se modifica screener.
- No se modifica UI.
- No se modifica app runtime.
- No se toca cartera, watchlists existentes ni motores de scoring.
- Implementación aislada bajo `src/atlas/canonical-core`.
- Seed marcado como `PENDING_PRIMARY_VALIDATION`, no como evidencia primaria.

## Regla constitucional añadida

> **CANON-014 — No Knowledge Without Provenance**  
> Ninguna entidad, relación o evento puede entrar en el núcleo ontológico de ATLAS Hub sin provenance mínimo: fuente, fecha de creación, confianza, evidencia o estado de validación y revisión futura cuando aplique.

## Ley de normalización

Toda información que entre en ATLAS Hub debe poder responder cuatro preguntas antes de almacenarse:

1. ¿Qué entidad representa?
2. ¿Qué evento describe?
3. ¿Con qué otras entidades está relacionada?
4. ¿Cuál es el horizonte temporal de esa relación/evento?

Si no puede responderlas, no entra al núcleo: queda fuera como input no normalizado.

## Próximo paso técnico

No construir Wave Engine todavía. El siguiente paso correcto es ampliar el Canonical Registry con 300–500 entidades y validar relaciones con fuente primaria. El Cascade Engine ya existe como función pura mínima, pero no debe usarse para alertas hasta que el registry esté suficientemente poblado y auditado.
