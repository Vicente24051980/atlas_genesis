# ATLAS Ω — REVIEW SOFTWARE MOAT DECAY & AI REPLICABILITY CONTROL v1.0

**FECHA:** 12-SEP-2026  
**ESTADO:** PROPOSED CANON → VALIDATED AS E5/E6 CONTROL, BUT NOT RATIFIED  
**DICTAMEN:** APROBADO CON ENMIENDAS MENORES DE OPERACIONALIZACIÓN / BLOQUEANTES B1–B4

## 1. Verificación formal

- MDS: `0.20+0.20+0.15+0.15+0.15+0.15 = 1.00` ✓
- Autoridad de capital correctamente nula: no compra, no vende, no dimensiona, no rota ✓
- Replacement Firewall respetado: ART↑ solo nunca justifica salida ✓
- ART alto solo nunca produce 🔴 ✓
- Peso directo 0% en Fundamental Score y FRU-MATH ✓

La arquitectura de fondo es sólida y la distinción central — **feature replicability ≠ business replicability** — es correcta. El problema no es la tesis, sino cuatro defectos de construcción que impiden reproducibilidad.

## 2. Defectos bloqueantes

### B1 — ART no tiene fórmula de agregación

MDS tiene pesos explícitos; ART lista 10 dimensiones sin método de composición. Un score `[0,100]` que activa gates obligatorios no puede depender de juicio no especificado.

**Corrección requerida:** fórmula explícita, auditable y reproducible.

### B2 — ART y MDS comparten inputs y violan PREU

Cinco inputs de ART duplican variables de MDS: datos exclusivos, workflows, distribución, switching costs y network effects. Esto correlaciona los scores por construcción y destruye el caso analítico `HIGH MDS + HIGH ART`.

**Corrección requerida:** ART debe medir exclusivamente replicabilidad técnica del producto. Toda protección estructural debe vivir en MDS.

### B3 — AMCS ≥3 métricas permite doble conteo causal

NRR/churn, pricing/gross margin y switching/bundling pueden ser manifestaciones del mismo deterioro.

**Corrección requerida:** agrupar señales en clústeres causales y exigir activación en al menos 3 clústeres distintos.

### B4 — Falta matriz ART × MDS → E5

Las bandas de ART y MDS existen, pero no hay mapeo determinista a estados E5.

**Corrección requerida:** tabla de composición explícita que impida discrecionalidad.

## 3. Observaciones no bloqueantes

### O1 — Falsificador ausente

Debe existir un test de falsificación: si una cohorte con ART alto mantiene durante 8–12 trimestres NRR, pricing, gross margin, FCF y múltiplos relativos sin deterioro frente a ART bajo, recalibrar o retirar el módulo.

### O2 — Miro debe ser analogía no causal

Miro es privada. Su compresión de valoración demuestra `Business survival ≠ Valuation preservation`, pero no prueba causalidad AI ni puede calibrar múltiplos públicos.

### O3 — Excepciones cyber y megaplataformas necesitan evidence gates

No pueden actuar como indultos discrecionales. Cyber debe demostrar monetización/telemetry/retention; megaplataformas deben demostrar ARPU, attach rate, retention, revenue o menor cost-to-serve.

### O4 — Perímetro de aplicación indefinido

Debe depender de la materialidad de `Software Economics` dentro del arquetipo LC, no de una etiqueta sectorial.

## 4. Enmiendas adicionales de blindaje

### Seat Compression Trap

Una empresa puede mantener 100% de logos y perder ARR si la productividad AI reduce el número de seats humanos.

`Billing Vulnerability = f(% Human Seat Revenue, % Consumption/Work/Outcome Revenue)`

Si `Human Seat Revenue Share >70%` en workflows automatizables, debe penalizarse AI Adaptability salvo transición demostrada de pricing.

### Headless Disintermediation Threat

Distinguir `System of Record` de `System of Engagement`. El uso persistente del backend no implica moat si agentes terceros capturan la relación con cliente y el software queda como database/API pipe sin control económico.

### LC Router Interaction

Un deterioro de moat debe forzar re-underwriting del LC, pero no una reclasificación arbitraria por constante fija.

### Proprietary Data Law

`ACCUMULATED HISTORICAL CONTENT ≠ DEFENSIVE PROPRIETARY DATA`.

Para puntuar alto, los datos deben ser privados, continuos y mejorar el rendimiento mediante feedback loop.

## 5. Reglas que permanecen válidas

- `NEW_ENGINE = NO`
- `DIRECT_WEIGHT = 0%`
- `FRU_DIRECT = 0%`
- `PORTFOLIO_ACTION = NONE`
- `ART_ALONE → 🔴 = BLOCKED`
- `REPLACEMENT_FIREWALL = ENFORCED`
- `TRANSMISSION = DETECT → CLASSIFY → ESCALATE → REASSESS → FRU INPUTS REVIEW`

## 6. Veredicto

**NO RATIFICAR v1.0 como está.**

La tesis estructural se aprueba, pero la especificación ejecutable exige corregir B1–B4 antes de elevarse a canon operativo.

### Ley canónica preservada

> **IF AI CAN COPY THE PRODUCT, CHECK WHETHER IT CAN COPY THE BUSINESS.**
>
> Si puede copiar ambos, no existe moat suficiente. Si solo puede copiar el producto, el moat puede permanecer intacto.
