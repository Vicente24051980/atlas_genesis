# Atlas Cognitive Kernel (ACK) v1.0
**Motor de razonamiento auditado de Atlas OS**

---

## Propósito

El ACK no es un modelo de IA. Es una **secuencia fija de razonamiento** que toda entrada debe recorrer antes de generar output. Fuerza transparencia, auditoría y trazabilidad en cada análisis.

```
INPUT
  │
  ▼
┌─────────────────────────────────┐
│ Fase 0: Ingesta y Clasificación │
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│ Fase 1: Extracción de Hechos    │
│ (Verificables vs Hipótesis)     │
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│ Fase 2: Evaluación de Evidencia │
│ (Calidad + Confiabilidad)       │
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│ Fase 3: Hipótesis Primaria      │
│ (Narrativa más probable)        │
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│ Fase 4: Hipótesis Alternativas  │
│ (Mínimo 3 escenarios diferentes)│
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│ Fase 5: Intento de Refutación   │
│ (Buscar evidencia en contra)    │
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│ Fase 6: Cálculo de Confianza    │
│ (CRC Score + probabilidades)    │
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│ Fase 7: Impacto sobre Atlas     │
│ (¿Cambia decisiones existentes?)│
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│ Fase 8: Registro en Memoria     │
│ (Archivo + Audit Trail)         │
└─────────────────────────────────┘
  │
  ▼
OUTPUT (Trazable, Auditable, Citado)
```

---

## Fase 0: Ingesta y Clasificación

### 0.1 Identificar Tipo de Input
- **Tipo A:** Noticia / Market Signal
- **Tipo B:** Documento Largo (10-K, research report)
- **Tipo C:** Pregunta Analítica
- **Tipo D:** Decision Request (inversión de capital)
- **Tipo E:** Feedback / Corrección

### 0.2 Extraer Metadata
- **Fuente:** ¿De dónde viene? URL, filing, conversación?
- **Fecha:** Cuándo se generó
- **Relevancia:** ¿Afecta a Cartera? ¿Watchlist? ¿Atlas general?
- **Urgencia:** ¿Acción requerida? ¿Cuándo?

### 0.3 Routing
- **Tipo A + Urgencia ALTA** → Phase 1 inmediata (noticia de earnings)
- **Tipo B + Tamaño GRANDE** → Divide en secciones, procesa paralelo
- **Tipo D + Impacto CAPITAL** → Escala a Vicente (no procede sin aprobación)
- **Tipo E** → Reparar documento y actualizar Fase 8

### 0.4 Checklist Ingesta
- [ ] Fuente validada (no misinformation)
- [ ] Metadata extraída
- [ ] Impacto inicial estimado
- [ ] Routing determinado
- [ ] Owner asignado (Researcher / Analyst / Scout)

---

## Fase 1: Extracción de Hechos

### 1.1 Separar Datos de Interpretaciones
**Dato verificable:**
- "TSMC reported 10-K: $70B revenue, $20B EBITDA"
- "Management guidance: 15–20% revenue growth FY2027"
- "SK Hynix shipped 2M units Q2 2026"

**Interpretación (no es hecho):**
- "TSMC is the best semiconductor company"
- "This guidance is conservative"
- "HBM demand will stay strong"

### 1.2 Marcar Nivel de Verificabilidad
```
[FACT]     - Dato verificable en fuente primaria
[CITATION] - Referencia con link a SEC filing / report
[CLAIMED]  - Aseveración que requiere verificación
[GUESS]    - Estimación del analista (marcar claramente)
[HYPOTHESIS] - Posibilidad, no certeza
```

### 1.3 Buscar Siempre Fuente Primaria
- Si claim viene de "según reportes", encuentra el reporte
- Si reporte cita un estudio, busca el estudio original
- Si no hay fuente primaria disponible, marca [UNVERIFIED]
- No pasar a Fase 2 con [UNVERIFIED] sin contar con contexto

### 1.4 Checklist Hechos
- [ ] Cada claim tiene marcador [FACT] / [HYPOTHESIS] / [GUESS]
- [ ] Fuentes primarias identificadas
- [ ] Datos vs interpretaciones separados claramente
- [ ] Números con unidades (% vs $, annual vs quarterly)
- [ ] Fechas exactas (no "reciente" o "hace poco")

---

## Fase 2: Evaluación de Evidencia

### 2.1 Calidad de Fuente
| Nivel | Fuente | Confiabilidad | Ejemplo |
|-------|--------|--------------|---------|
| **Oro** | SEC Filing, Audited Financial | 95–100% | 10-K, 10-Q |
| **Plata** | Earnings Call (CEO + CFO) | 80–90% | Transcript oficial |
| **Bronce** | Analyst Report, Bloomberg | 60–80% | Goldman, Morgan Stanley |
| **Cobre** | News Article, Social Media | 30–60% | Reuters, Twitter |
| **Plomo** | Rumor, Speculation, Blog | <30% | Reddit, casual blog |

### 2.2 Scoring CRC (Criticidad, Confiabilidad, Completitud)
**Criticidad (1–10):** ¿Cuán importante es este data point para la conclusión?
- 1–3: Nice-to-have, no afecta decisión
- 4–6: Importante pero no decisivo
- 7–9: Crítico para tesis
- 10: Blocker / game-changer

**Confiabilidad (1–10):** ¿Cuán seguros estamos del dato?
- Oro (SEC): 9–10
- Plata (Earnings): 7–9
- Bronce (Analyst): 5–7
- Cobre (News): 3–5
- Plomo (Rumor): 1–3

**Completitud (1–10):** ¿Tenemos data suficiente o falta contexto?
- 1–3: Parcial, contexto ausente
- 4–6: Aceptable, algunos gaps
- 7–9: Bueno, comprensivo
- 10: Exhaustivo

**CRC Score = (C + R + Completitud) / 3**

### 2.3 Conflicto de Evidencia
Si dos fuentes dicen cosas diferentes:
1. **Busca versión más reciente** (datos cambian)
2. **Verifica metodología** (¿Cómo calculó cada una?)
3. **Identifica incentivos** (¿Quién se beneficia de cada versión?)
4. **Marca como [CONFLICTING]** hasta resolución
5. **Investiga hasta convergencia**

### 2.4 Checklist Evidencia
- [ ] Cada fuente tiene score CRC
- [ ] Conflictos flagged e investigados
- [ ] Gaps de data explícitos (qué falta)
- [ ] Supuestos documentados (qué damos por hecho)
- [ ] Incertidumbre cuantificada

---

## Fase 3: Hipótesis Primaria

### 3.1 Narrativa Central
En máximo 3 párrafos, la tesis más probable dados los hechos:

**Estructura:**
1. **Función:** ¿Qué función económica?
2. **Peaje:** ¿Cuál es la renta fija?
3. **Poder:** ¿Quién la captura?
4. **Impacto:** ¿Por qué importa?

### 3.2 Probabilidad Asignada
- P(Hipótesis Primaria) = {%}
- Remaing probability distributed to alternativas

### 3.3 Timeline / Horizonte
- ¿Cuándo se realiza este escenario? (meses, años)
- ¿Cuáles son los checkpoints intermedios?

### 3.4 Checklist Hipótesis Primaria
- [ ] Basada en Fase 1 + Fase 2 (no especulación)
- [ ] Probabilidad asignada explícitamente
- [ ] Timeline claro
- [ ] Diferencia vs hipótesis anterior documentada (si hay cambio)

---

## Fase 4: Hipótesis Alternativas

### 4.1 Generar Mínimo 3
Incluso si una hipótesis parece obvia, generar alternativas:

**Hipótesis Alt 1:** Escenario contrario (bearish)
- Probabilidad: {%}
- Eventos clave: {LIST}

**Hipótesis Alt 2:** Caso neutral o diferente
- Probabilidad: {%}
- Eventos clave: {LIST}

**Hipótesis Alt 3:** Black swan o ruptura
- Probabilidad: {%}
- Eventos clave: {LIST}

### 4.2 ¿Por Cuál Cada Una?
Para cada alternativa:
- ¿Qué evidencia la favorecería?
- ¿Qué datos actualmente la contradicen?
- ¿Es implausible o improbable?

### 4.3 Test: ¿Cuál Cambiaria tu Opinión?
Si hipótesis Alt pasara a ser P > 50%, ¿qué harías?
- Cambiar decisión de inversión
- Aumentar monitoring
- Buscar más información
- Documentar contingency plan

### 4.4 Checklist Alternativas
- [ ] Mínimo 3 hipótesis generadas
- [ ] Cada una tiene P(%) asignada
- [ ] Evidencia a favor + en contra para cada una
- [ ] Test refutación explícito

---

## Fase 5: Intento de Refutación

### 5.1 Falsificadores Candidatos
Para cada hipótesis primaria, generar 3–5 escenarios que la reviertent:

**Falsificador 1:** {SCENARIO}
- Probabilidad: LOW / MED / HIGH
- Timeline: {MONTHS}
- Señales de alerta: {SIGNALS}
- ¿Detectable early? YES / NO
- Impacto si ocurre: —{REVENUE_%}

**Falsificador 2-5:** Misma estructura

### 5.2 Buscar Evidencia Contradictoria
- ¿Hay datos que contradicen la hipótesis primaria?
- ¿Están siendo ignorados o downweighted?
- ¿Hay conflicto entre hechos que no fue resuelto?

### 5.3 Devil's Advocate Session
Pregunta feroz:
- "¿Si tuvieras que vender esta posición hoy, cuál sería tu mejor argumento?"
- "¿Qué verías en los números que te diría 'me equivoqué'?"
- "¿Cuál es el escenario que más te asusta?"

### 5.4 Checklist Refutación
- [ ] 3–5 falsificadores identificados
- [ ] Cada uno con probabilidad + timeline
- [ ] Señales tempranas documentadas
- [ ] Contingency plans (qué hacer si falsificador se activa)
- [ ] No hay avestruz (no ignorar evidencia contradictoria)

---

## Fase 6: Cálculo de Confianza

### 6.1 CRC Score Consolidado
Promediar CRC de todas las fases anteriores.

**Interpretación:**
- 9–10: Muy confiado; decisión operacional
- 7–8: Confiado; inversión prudente
- 5–6: Aceptable; riesgo documentado
- 3–4: Bajo; acción solo si oportunidad única
- 1–2: Muy bajo; esperar más información

### 6.2 Probabilidades de Escenarios
```
Hipótesis Primaria:    P = X%
Hipótesis Alt 1:       P = Y%
Hipótesis Alt 2:       P = Z%
Hipótesis Alt 3:       P = W%
                    ─────────
                    Total = 100%
```

### 6.3 Upside / Downside
Si Hipótesis Primaria:
- Base case valuation: ${PRICE}
- Bull case (if Alt Hipótesis wins): ${PRICE}
- Bear case (if Falsificador occurs): ${PRICE}

Ratio favorabilidad = (Bull - Current) / (Current - Bear)
- >2:1 = Favorable
- 1.5–2:1 = Acceptable
- <1.5:1 = Unattractive

### 6.4 Checklist Confianza
- [ ] CRC score asignado (0–10)
- [ ] Probabilidades distribuyen a 100%
- [ ] Upside/downside ratio calculado
- [ ] Umbral de acción definido

---

## Fase 7: Impacto sobre Atlas

### 7.1 ¿Afecta Decisiones Existentes?
- **Cartera:** ¿Cambiar posición? ¿Aumentar/reducir?
- **Watchlist:** ¿Promocionar candidata? ¿Descartar?
- **Candidata Unicornio:** ¿Acelerar validación?

### 7.2 ¿Requiere Acción Inmediata?
- Si sí: ¿Qué acción? ¿Cuándo? ¿Quién aprueba?
- Si no: ¿Cuándo re-evaluar? (Meses / trimestres)

### 7.3 ¿Impacta Otro Dominio de Atlas?
- Atlas Puro (epistemología, sistemas complejos)
- Atlas Financiero (inversión)
- Atlas 9 (coordinación/decisión)
- Atlas 10 (inteligencia geopolítica)

### 7.4 Checklist Impacto
- [ ] Affected domains identificados
- [ ] Cambios propuestos documentados
- [ ] Aprobaciones requeridas identificadas
- [ ] Timeline de implementación (si cambio)

---

## Fase 8: Registro en Memoria

### 8.1 Archivo en Sistema
**Path:** `/02_Memory/{DOMAIN}/{COMPANY_OR_TOPIC}/{DATE_analysis}.md`

**Contenido:**
- Entrada original (resumen)
- Fases 1–7 (full kernel walk-through)
- Decisión final
- Action items
- Audit trail (quién, cuándo, qué cambió)

### 8.2 Indexación
- [ ] Añadir a memoria de {COMPANY} si aplica
- [ ] Actualizar 07_Financial/Scores si valuación cambió
- [ ] Crear bidireccional links (TSMC → HBM, SK Hynix, etc.)
- [ ] Taggear con categoría (earnings, competitive, regulatory, etc.)

### 8.3 Versionado
Cada análisis tiene versión:
- v1.0: Análisis inicial
- v1.1: Correcciones menores
- v2.0: Re-análisis posterior (nuevo data)

### 8.4 Audit Trail
```
[2026-07-12 17:40] Original analysis created by Claude
[2026-07-12 18:15] Vicente review: APPROVED
[2026-07-15 09:00] Updated with Q2 earnings; no change to thesis
[2026-07-20 14:30] [CORRECTED] Falsificador #2 probability HIGH→MED based on new guidance
```

### 8.5 Checklist Memoria
- [ ] Archivo creado en path correcto
- [ ] Kernel phases 1–7 incluidas
- [ ] Links creados a empresas relacionadas
- [ ] Decisión registrada
- [ ] Próxima revisión scheduled
- [ ] Audit trail iniciado

---

## Output del Kernel

### Formato Estándar
```markdown
# ACK Analysis: {TOPIC}
**Date:** {DATE}
**Owner:** {ANALYST}
**Status:** [DRAFT|APPROVED|IMPLEMENTED]

## Phase Summary
- Phase 1 (Facts): {CRC}
- Phase 2 (Evidence): {CRC}
- Phase 3 (Primary): P = {%}
- Phase 4 (Alternatives): P1={%}, P2={%}, P3={%}
- Phase 5 (Refutation): {N} Falsificadores
- Phase 6 (Confidence): CRC = {}/10
- Phase 7 (Impact): [CARTERA|WATCHLIST|INFORMATION]
- Phase 8 (Memory): Archived at {PATH}

## Decision
**Action:** {ACTION}
**Approval Required:** {YES|NO}
**Timeline:** {IMMEDIATE|{DAYS|MONTHS}}

## Audit Trail
[Full chain of review + edits]
```

---

## Garantías del Kernel

✅ **Transparencia:** Cada paso es visible y auditable  
✅ **Trazabilidad:** Conoces por qué se concluyó algo  
✅ **Rigor:** No hay cortocircuitos en el razonamiento  
✅ **Corrección:** Errores se detectan y se registran  
✅ **Aprendizaje:** Cada análisis alimenta memoria  
✅ **Escalabilidad:** Mismo proceso para análisis pequeño o grande  
✅ **Reproducibilidad:** Otra persona puede seguir el análisis y llegar a la misma conclusión  

---

