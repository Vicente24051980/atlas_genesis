# ATLAS Ω — ETF Layer Ω · Matriz de solapamiento vs TOP 35

**Fecha:** 2026-08-13  
**Estado:** AUDITADO PRELIMINAR / DATA-DRIVEN  
**Objetivo:** determinar qué combinación de 1–3 ETFs complementa el TOP 35 sin convertir la capa ETF en una réplica redundante de la cartera activa.

## Base canónica utilizada

TOP 35 MASTER Ω vigente a 2026-08-12:
MSFT, CSU.TO, GOOGL, ASML, AVGO, TSM, APH, MA, V, SPGI, ANET, HEI, TMO, ISRG, MCO, ICE, BKNG, NOW, DHR, AME, SU.PA, PANW, LLY, IDXX, ETN, CTAS, HWM, SAF.PA, AXON, AMZN, SAP, ZTS, ABT, FAST, RTX.

### Perfil estructural aproximado por número de nombres
- Predominio muy alto de compañías estadounidenses/listadas en EE. UU.; la clasificación exacta por domicilio debe tratarse separadamente para grupos domiciliados fuera de EE. UU.
- Exposiciones no estadounidenses evidentes: CSU.TO, ASML, TSM, SU.PA, SAF.PA, SAP, además de emisores con domicilio jurídico distinto de su principal mercado operativo.
- Sesgos dominantes: tecnología/calidad/growth, industriales de calidad, healthcare y financial data/payments.
- Huecos estructurales relevantes: energía, materiales, utilities, staples y real estate prácticamente ausentes.

**Nota:** esta matriz mide solapamiento estructural y por nombres. No sustituye una matriz ponderada por capital porque el TOP 35 canónico no contiene pesos objetivo en esta versión.

## Corrección de ticker

El ETF BNP Paribas Easy MSCI World Equal Weight Select UCITS ETF que se venía identificando informalmente como “MWEQ” cotiza en Xetra con símbolo **ESAE** (ISIN IE0008D0AIU9). A partir de esta auditoría, **ESAE** es el identificador operativo canónico para Xetra.

## Matriz de solapamiento

| ETF | Función | Solapamiento directo ATLAS 35 | Riesgo de duplicación | Diversificación nueva | Veredicto |
|---|---|---|---|---|---|
| **IS3S.DE** | MSCI World Enhanced Value | No aparece ningún ATLAS 35 entre sus 10 mayores posiciones a 29-jul-2026; solapamiento exacto total pendiente de fichero completo de holdings | **MEDIO** por estilo/sector: IT ~30% y exposición a semis/hardware | **ALTA** por factor Value y múltiplos mucho más bajos que World | GREEN, pero redundante si ya se usa ESAE y solo queremos 2 ETFs |
| **EXUS.DE** | MSCI World ex USA | **Confirmado públicamente:** ASML = 2,56% del índice a 31-jul-2026. **Esperados por pertenencia al universo desarrollado ex-USA del TOP35:** CSU, Schneider, Safran y SAP; requieren reconfirmación uno a uno contra el fichero completo de holdings antes de declarar pesos exactos | **BAJO-MEDIO**: universo de 755 compañías | **MUY ALTA**: elimina EE. UU. y corrige el principal sesgo geográfico del TOP35 | **GREEN / PRIORIDAD #1** |
| **5MVL.DE / EMVL** | MSCI EM Enhanced Value | **TSM = 12,89%** del ETF a 29-jul-2026; es el solapamiento directo confirmado más importante | **ALTO EN UNA POSICIÓN** y alto temáticamente: semis 21,32% + hardware 17,13% | **MUY ALTA** geográficamente y por valoración EM | GREEN satélite; no núcleo |
| **ESAE.DE** | MSCI World Equal Weight Select | Solapamiento nominal probable con varios nombres desarrollados del TOP35, pero el índice público muestra pesos máximos individuales alrededor de 0,13–0,16%; overlap exacto pendiente de fichero completo | **BAJO POR PESO** aunque exista overlap nominal | **MUY ALTA** contra concentración mega-cap; redistribuye peso hacia compañías medianas/grandes | **GREEN / PRIORIDAD #2** |

## Datos clave auditados

### IS3S.DE — World Value
- 399 posiciones.
- TER 0,25%.
- P/E ~16,7x; P/B ~1,64x.
- Tecnología ~30%.
- Top holdings a 29-jul-2026: Micron 11,50%, Cisco 3,21%, Verizon 2,21%, Toyota 1,82%, AT&T 1,67%, Comcast 1,43%, Qualcomm 1,35%, GM 1,23%, BAT 1,22%, HPE 1,16%.
- Lectura: gran diversificación de **estilo**, pero no es un hedge puro contra tecnología.

### EXUS.DE — World ex USA
- 755 constituyentes a 31-jul-2026.
- TER 0,15%.
- P/E 19,08x; forward P/E 15,59x; P/B 2,40x.
- Top: ASML 2,56%, HSBC 1,46%, Roche 1,23%, RBC 1,17%, Novartis 1,14%, Nestlé 1,03%, AstraZeneca 1,03%, Shell 1,02%, Siemens 0,96%, MUFG 0,96%.
- Lectura: es el ETF que mejor corrige el predominio estadounidense del TOP35.

### 5MVL.DE / EMVL — Emerging Markets Value
- 159 posiciones.
- TER 0,40%.
- P/E ~11,6x; P/B ~1,33x.
- TSM = 12,89% a 29-jul-2026.
- Semiconductores 21,32% + technology hardware/storage/peripherals 17,13% a 7-ago-2026.
- Lectura: valoración y geografía muy diferentes, pero no debe interpretarse como diversificación anti-semiconductores.

### ESAE.DE — World Equal Weight Select
- 1.016 componentes del índice a 31-jul-2026.
- TER 0,20%.
- P/E 20,27x; forward P/E 16,25x; P/B 2,41x.
- Las mayores posiciones individuales están aproximadamente en 0,13–0,16%.
- Lectura: reduce de forma radical el riesgo de concentración individual de los índices cap-weighted. Incorpora filtros de actividad/ESG, por lo que no es un World Equal Weight puro sin exclusiones.

## Decisión de arquitectura

### Mejor combinación de 2 ETFs

**EXUS.DE + ESAE.DE**

Razón:
1. EXUS corrige el sesgo geográfico hacia EE. UU.
2. ESAE corrige la concentración por capitalización/mega-caps.
3. Atacan dos debilidades distintas; el solapamiento entre ambos es tolerable porque ESAE reparte pesos individualmente de forma muy baja.
4. Evitan añadir deliberadamente un nuevo gran sesgo a semiconductores.

### IS3S

**Mantener en reserva como alternativa a ESAE**, no añadir automáticamente junto a ESAE. Si el objetivo pasa de “diversificar concentración” a “inclinar la cartera hacia Value”, IS3S puede sustituir a ESAE.

### 5MVL / EMVL

**Satélite opcional**, no tercer ETF automático. El 12,89% en TSM y la elevada exposición a semiconductores/hardware chocan parcialmente con la concentración temática ya presente en ATLAS 35. Si se utiliza, debe tener un peso pequeño.

## Escenarios de asignación para simulación

### ETF Layer = 10% del patrimonio
**Opción preferida de 2 ETFs:**
- EXUS: 6% del patrimonio total.
- ESAE: 4% del patrimonio total.

Con EXUS al 6%, el peso indirecto adicional de ASML por su peso de 2,56% sería aproximadamente **0,154% del patrimonio total**. El solapamiento existe pero es pequeño.

### ETF Layer = 10% con tercer satélite EM Value
- EXUS: 5,0% total.
- ESAE: 3,5% total.
- 5MVL: 1,5% total.

Con 5MVL al 1,5% del patrimonio, TSM añadiría aproximadamente **0,193%** de exposición indirecta total. La exposición indirecta del bloque semiconductores + hardware de 5MVL sería ~**0,577%** del patrimonio total.

## Veredicto

**Cartera activa:** TOP 35 Ω permanece intacta y separada.  
**ETF Factor Layer Ω:** primera arquitectura preferida = **EXUS + ESAE**.  
**IS3S:** reserva / tilt Value.  
**5MVL:** satélite EM Value de riesgo superior, no núcleo.  

**Estado de ejecución:** NO BUY automático. Falta validar broker concreto, spread, fiscalidad/estructura de compra y definir el porcentaje definitivo de ETF Layer sobre patrimonio total.
