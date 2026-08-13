# ATLAS Ω — ETF Factor Layer Ω · Matriz de solapamiento vs TOP 35

**Fecha:** 2026-08-13  
**Estado:** AUDITADO / CORRECCIÓN DE INTEGRIDAD DE DATOS  
**Fuente del universo:** `CURRENT_CANON/PORTFOLIO_35.md`, último corte vigente 2026-08-12.

## Corrección canónica

La versión anterior de este informe usó por error una instantánea antigua de Notion. Se corrige contra la fuente técnica vigente en GitHub.

TOP 35 utilizado desde esta revisión:
NVDA, MSFT, GOOGL, TSM, AVGO, ASML, META, AMZN, LLY, NOW, AXON, CSU.TO, APH, ANET, DDOG, PANW, UBER, NFLX, SPGI, MA, RELX, ISRG, BKNG, SU.PA, ETN, LRCX, AMAT, INTU, TMO, DHR, HEI, KLAC, SAF.PA, SAP, IDXX.

Segunda corrección: **MWEQ y ESAE no son el mismo ETF**.

- **MWEQ** — Invesco MSCI World Equal Weight UCITS ETF Acc; replica el **MSCI World Equal Weighted Index** sin filtro ESG estructural añadido.
- **ESAE** — BNP Paribas Easy MSCI World Equal Weight Select UCITS ETF; replica una variante **screened/select** del MSCI World Equal Weight.

Por tanto, queda anulada la identificación previa `MWEQ = ESAE`.

## Perfil estructural del TOP 35

Modelo simple por número de posiciones, no por pesos objetivo:

- Information Technology: 16/35 = **45,71%**.
- Industrials: 7/35 = **20,00%**.
- Health Care: 5/35 = **14,29%**.
- Communication Services: 3/35 = **8,57%**.
- Consumer Discretionary: 2/35 = **5,71%**.
- Financials: 2/35 = **5,71%**.
- Consumer Staples / Materials / Energy / Utilities / Real Estate: **0 posiciones directas**.

Por domicilio de emisor, aproximación simple: **27/35 EE. UU. = 77,14%** y 8/35 no EE. UU. Esta métrica no representa exposición por ingresos.

## Matriz corregida

| ETF | Función | Solapamiento | Diversificación | Estado |
|---|---|---|---|---|
| **EXUS** | MSCI World ex USA | Bajo-medio; excluye EE. UU. por diseño, pero puede duplicar ASML, SAP, Schneider, Safran, CSU, etc. | **Muy alta geográfica** | **PRIORIDAD #1** |
| **MWEQ** | MSCI World Equal Weighted | Solapamiento nominal amplio, pero peso por compañía extremadamente bajo | **Muy alta por concentración/capitalización** | **PRIORIDAD #2** |
| **ESAE** | World Equal Weight screened/select | Similar función a MWEQ con exclusiones adicionales | Alta | Alternativa screened |
| **IS3S** | World Enhanced Value | Solapamiento temático moderado; puede mantener tecnología/semis | Alta por factor Value | Reserva / tilt Value |
| **5MVL / EMVL** | Emerging Markets Value | TSM y semiconductores pueden crear duplicación relevante | Muy alta geográfica + Value, riesgo superior | Satélite opcional |

## Evidencia del par preferido

### EXUS
- Xtrackers MSCI World ex USA UCITS ETF 1C.
- ISIN: IE0006WW1TQ4.
- TER: **0,15%**.
- Acumulación.
- Objetivo: large/mid caps de mercados desarrollados **excluyendo EE. UU.**.
- El índice MSCI World ex USA tiene cientos de constituyentes y reduce de forma directa el principal sesgo geográfico del TOP 35.

### MWEQ
- Invesco MSCI World Equal Weight UCITS ETF Acc.
- ISIN: IE000OEF25S1.
- TER: **0,20%**.
- Acumulación.
- Replica el MSCI World Equal Weighted Index.
- Todos los constituyentes del MSCI World se igualan en cada rebalanceo trimestral; elimina la dominancia estructural de mega-caps.
- El índice tenía aproximadamente 1.283 constituyentes a 30-jun-2026 y sus mayores pesos individuales estaban alrededor de 0,1–0,2%.

## Efecto estructural de un escenario 90/6/4

Escenario de investigación, no asignación aprobada:
- 90% TOP 35.
- 6% EXUS.
- 4% MWEQ.

### Concentración geográfica
Usando domicilio de emisor para el TOP 35 y el peso estadounidense observado de MWEQ (~38% en mayo-2026):
- TOP35 solo: **~77,14% EE. UU.**.
- 90/6/4: **~70,95% EE. UU.**.
- Reducción aproximada: **6,19 puntos porcentuales**.

### Concentración sectorial
Con pesos sectoriales actuales/proxy del mismo índice para EXUS y composición observada de MWEQ:
- IT: **45,71% -> ~42,19%**.
- Financials: **5,71% -> ~7,55%**.
- Staples, Materials, Energy, Utilities y Real Estate pasan de 0 posiciones directas a exposición indirecta positiva.
- HHI sectorial simple: **0,2833 -> ~0,2524**, reducción aproximada **10,9%**.

### Concentración por nombre
En un TOP35 equiponderado cada acción pesa 2,857%. Con 90% asignado al bloque activo, cada posición directa parte de 2,571%. Los pesos individuales de MWEQ son de décimas de punto dentro del ETF, por lo que el 4% asignado a MWEQ añade solo centésimas de punto por compañía.

## Decisión

**Par preferido para la ETF Factor Layer Ω: EXUS + MWEQ.**

Motivo:
1. EXUS corrige geografía.
2. MWEQ corrige concentración por capitalización.
3. Son funciones distintas y complementarias.
4. MWEQ es conceptualmente más puro para esta función que ESAE porque sigue el MSCI World Equal Weighted sin la capa screened/select adicional.
5. IS3S queda como alternativa si el objetivo cambia de diversificación a un tilt Value explícito.
6. 5MVL/EMVL queda como satélite EM Value, no núcleo automático.

**NO BUY automático.** La ejecución requiere validación del broker concreto, spread, costes efectivos, fiscalidad y sizing definitivo.