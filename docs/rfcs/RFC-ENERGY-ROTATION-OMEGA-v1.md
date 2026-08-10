# RFC-ENERGY-ROTATION-OMEGA-v1

## Estado

CANDIDATO CANONICO ATLAS OMEGA.

Fecha: 2026-08-10
Ambito: ATLAS Omega / Money Rotation / Capex Productivity / Historical Dislocation

## Mision

ENERGY ROTATION OMEGA identifica si el capital, los fundamentales y el regimen del commodity justifican una oportunidad temprana, madura o tardia dentro de energia. No persigue el ETF sectorial por rendimiento pasado; busca empresas capaces de seguir creando FCF por accion y ROIC cuando el commodity se normaliza.

## Regla constitucional

> En commodities, ATLAS Omega no debe buscar la empresa que mas gana con el precio actual, sino la que continua creando valor por accion cuando el commodity se normaliza.

## Separacion semantica obligatoria

Nunca mezclar ni sumar como si fueran equivalentes:

- precio del petroleo;
- rendimiento de acciones/ETF;
- variacion de market cap;
- ETF/fund flows;
- CAPEX del sector;
- beneficios empresariales;
- gasto publico;
- AUM.

MARKET_CAP_CHANGE != CAPITAL_FLOW.
PRICE_RETURN != CAPITAL_FLOW.
COMMODITY_PRICE_CHANGE != CAPITAL_FLOW.

## Fases R1-R6

R1 abandonado
R2 capitulacion
R3 suelo
R4 primeras entradas
R5 detectado por algoritmo principal / liderazgo visible
R6 consenso, crowded o madurez

La fase se asigna al sector y tambien por subsector/empresa. Una fase sectorial nunca se hereda automaticamente a una compania concreta.

## Estado base de referencia 2026-08-09

ENERGIA agregado: R5, con segmentos aproximandose a R6.

Lectura operativa:
- flujos recientes debilitandose;
- momentum de precio fuerte YTD pero enfriandose;
- fundamentales todavia fuertes;
- riesgo de normalizacion del crudo;
- crowding creciente;
- no perseguir XLE por momentum;
- buscar ganadores idiosincraticos.

Este snapshot caduca y debe recalcularse con datos nuevos.

## Subcapas

1. Integrated majors: XOM, CVX
2. E&P shale: COP, EOG, FANG, OXY
3. Oil services: SLB, HAL
4. Midstream / LNG / transporte: analizar por separado

## Stress test obligatorio

Para upstream e integrated majors, calcular al menos escenarios Brent:

- 65 USD/bbl
- 70 USD/bbl
- 75 USD/bbl

En cada escenario evaluar:
- FCF/share;
- ROIC;
- breakeven;
- CAPEX requerido;
- deuda/net debt;
- dividendos;
- recompras;
- inventario Tier-1;
- productividad por pozo o activos;
- margen de seguridad de valoracion.

## Drivers de score

- Flow Score
- Price Momentum
- Fundamental Momentum
- Earnings Revisions
- Commodity Regime
- Crowding Risk
- Balance Quality
- Breakeven Quality
- CAPEX Productivity
- FCF/share Resilience
- ROIC Resilience
- Capital Returns
- Valuation

## Triggers

### R5 -> R6
Precio fuerte + deterioro persistente de flujos + revisiones EPS descendentes + perdida de breadth.

### Reentrada R4/R5
Estabilizacion del crudo + reanudacion de flujos 4w/13w + revisiones EPS positivas + reaccion favorable a resultados.

## Decision rules

- No BUY sectorial solo por subida del crudo.
- No BUY solo por beneficios extraordinarios de un trimestre.
- No considerar CAPEX alto como falsificador sin deterioro de retorno incremental.
- No elevar energia a top rotation si flujos no estan confirmados multiventana.
- Priorizar calidad del negocio + disciplina de capital sobre beta al barril.

## Integracion ATLAS

Evidence Ingestion Omega
-> Evidence Integrity Omega
-> Money Rotation Omega
-> ENERGY ROTATION OMEGA
-> CAPEX PRODUCTIVITY OMEGA
-> VALUATION OMEGA
-> RISK OMEGA
-> DECISION SAFETY GATE OMEGA
-> FINAL SCORE OMEGA

## Candidatos iniciales para auditoria

XOM, CVX, COP, EOG, FANG, OXY.

Midstream/LNG se analiza en un bloque separado para evitar mezclar perfiles economicos distintos.
