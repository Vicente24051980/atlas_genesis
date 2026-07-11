# GSD Protocol Atlas Ω v1.0
**Adaptación personalizada de Get Shit Done para el framework de inversión y desarrollo de Vicente**

---

## 1. Principios Rectores

### 1.1 Cartografía antes que narrativa
- **Ω-001:** No compramos empresas. Compramos funciones.
- **No seguimos narrativas. Cartografiamos la civilización.**
- Cada decisión de inversión = mapeo de función → peaje → poder → gobernanza

### 1.2 Peaje antes de métrica (MP-20)
1. **Identifica el peaje** (qué renta fija crea la función)
2. **Mide el poder** (quién captura ese peaje)
3. **Verifica la gobernanza** (qué riesgos socavan el peaje)
4. **Luego calcula múltiplos** (valuación)

### 1.3 Inevitabilidad precede profitabilidad (MP-19)
- No invertimos en "buenas ideas"
- Invertimos en funciones **inevitables** que pagan peajes
- La profitabilidad es consecuencia, no premisa

### 1.4 Un score prioriza atención; nunca sustituye juicio (Atlas 9)
- **Atlas Score Ω** = herramienta de priorización
- **Decisión final** = aprobación explícita de Vicente
- Anti-patrón: ELITE (automatización ciega)

---

## 2. Ciclo de Trabajo GSD Standard (Adaptado)

```
DISCOVER → PLAN → EXECUTE → VERIFY → CLOSE
```

### 2.1 DISCOVER Phase (Descubrimiento)
**Objetivo:** Cartografía preliminar de función / candidata

**Inputs:**
- Candidata nueva (Watchlist propuesta)
- Posición existente (auditoría trimestral)
- Señal táctica (earnings, competitive shift)

**Proceso:**
1. **Función mapping:** ¿Qué función cumple? (C1–C14, Meta0)
2. **Peaje identification:** ¿Cuál es la renta fija?
3. **Power analysis:** ¿Quién captura el peaje? Concentración.
4. **Falsificador scan:** ¿Qué puede romper esto?

**Deliverable:** Discovery memo (1–2pp)

**Decision Gate:** ¿Continúa a PLAN? (Yes/No/Escalate)

**Owner:** Vicente (decision) + Claude (analysis)

---

### 2.2 PLAN Phase (Planificación)
**Objetivo:** Definir auditoría detallada (AAP-001) y criterios

**Inputs:**
- Discovery memo
- Existing audit data (si existe)
- 12–24 month price history + financials

**Proceso:**
1. **AAP-001 Prep:** 8-level audit structure
   - Función → Peajes → Poder → Gobernanza → Concentración → Segunda derivada → Falsificadores → Asignación
2. **CRC scoring framework:** Cómo medimos criticidad/confiabilidad/completitud
3. **Data requirements:** Qué fuentes, qué nivel de granularidad
4. **Timeline:** Auditoría en 1 sprint o multi-sprint?
5. **Contingencies:** Qué bloqueadores potenciales

**Deliverable:** Audit plan (detailed checklist)

**Decision Gate:** ¿Proceder a EXECUTE? (Yes/No/Replan)

**Owner:** Vicente (approval) + Claude (planning)

---

### 2.3 EXECUTE Phase (Ejecución)
**Objetivo:** Correr la auditoría según plan

**Inputs:**
- Audit plan
- Data sources (SEC filings, earnings calls, industry reports, competitive intelligence)
- Prior audit results (benchmarking)

**Proceso:**
1. **Data gathering:** Recolectar contra checklist AAP-001
2. **Analysis:** 8-level scoring por dimensión
3. **CRC calculation:** Criticidad, confiabilidad, completitud (0–10)
4. **Falsificador testing:** ¿Qué condiciones revierten la tesis?
5. **Write draft report:** Resultados contra plan

**Deliverable:** Draft audit report (8-level structure, CRC score, narrative)

**Decision Gate:** ¿Listo para VERIFY? (Yes/Needs rework)

**Owner:** Claude (execution) + Vicente (spot checks)

---

### 2.4 VERIFY Phase (Verificación)
**Objetivo:** UAT (user acceptance testing) del análisis

**Inputs:**
- Draft audit report
- Supporting data
- Existing knowledge (prior audits, market context)

**Proceso:**
1. **Narrative check:** ¿La lógica fluye? ¿Hay gaps?
2. **Data validation:** Spot-check números clave
3. **Falsificador challenge:** ¿Son creíbles las mitigaciones?
4. **Peer consistency:** ¿Alinea con otros audits en el cluster?
5. **CRC confidence:** ¿La puntuación refleja la incertidumbre?

**Outcomes:**
- ✅ APPROVE → Publish / Archive
- 🔄 REVISE → Return to EXECUTE
- ❌ REJECT → Back to PLAN (redefine scope)

**Deliverable:** Final audit report (signed by Vicente)

**Owner:** Vicente (approval authority)

---

### 2.5 CLOSE Phase (Cierre)
**Objetivo:** Integrar resultado en sistema + gestionar acciones

**Inputs:**
- Final audit report
- CRC score
- Decisión de inversión (si aplica)

**Proceso:**
1. **Archive:** Storage en atlas-gsd/.planning/audits/{COMPANY}/{DATE}/
2. **Decision:** Cartera → Mantener / Aumentar / Reducir / Vender
3. **Watchlist → Cartera:** ¿Cumple L-GOV-003? ¿12+ meses validado?
4. **Action items:** Seguimiento, reauditoría schedule
5. **Integrate:** Update ROADMAP.md, STATE.md

**Deliverable:** Closed audit + decision log

**Owner:** Vicente (decision) + Claude (tracking)

---

## 3. Prompts Maestros para Claude Code

### 3.1 Discovery Prompt
```
Eres cartógrafo de funciones económicas para Atlas Ω.

INPUT:
- Candidata: {COMPANY}
- Sector: {INDUSTRY}
- Contexto: {CONTEXT}

MAPEO REQUERIDO:
1. Función primaria (HA v15.2 taxonomy: C1–C14, Meta0)
2. Peaje fundamental (qué renta fija genera)
3. Poder (quién captura el peaje, concentración)
4. Gobernanza (riesgos de ruptura)
5. Falsificadores candidatos (qué rompe la tesis)

CRITERIOS:
- Brevedad: 1 página máximo
- Precisión: cita fuentes específicas
- Escepticismo: ¿por qué no funciona?

OUTPUT:
Discovery memo (markdown, pronto para lectura).
```

### 3.2 Planning Prompt
```
Eres diseñador de auditorías para Atlas Score Ω.

INPUT:
- Discovery memo: {DISCOVERY}
- Datos históricos: {DATA}

PLAN AAP-001 (8 NIVELES):
1. Función: Definición operativa, criticidad civilizacional
2. Peajes: Qué renta fija, quién paga, magnitud
3. Poder: Concentración (Herfindahl, top-3 customer %)
4. Gobernanza: Board quality, management incentives, regulatory risk
5. Concentración: Customer, supplier, geographic, regulatory concentration scores
6. Segunda derivada: Trayectoria peaje/poder (creciente, decreciente, estable?)
7. Falsificadores: 3–5 escenarios que revierten la tesis (supply shock, regulation, competition)
8. Asignación: Valuación, cost of capital, upside/downside cases

CRC FRAMEWORK:
- Criticidad: ¿Cuán importante es esta dimensión? (1–10)
- Confiabilidad: ¿Cuán seguros estamos de los datos? (1–10)
- Completitud: ¿Tenemos data suficiente? (1–10)
- CRC Score = (Criticidad + Confiabilidad + Completitud) / 3

DATA CHECKLIST:
- SEC filings (10-K, 10-Q, proxy statements)
- Earnings call transcripts (últimas 8 trimestres)
- Industry reports (capital allocation, margins, ROIC)
- Competitive analysis (market share, pricing power)
- Management quality (tenure, incentives, succession)

OUTPUT:
Detailed audit plan (checklist executable).
```

### 3.3 Execute Audit Prompt
```
Eres auditor del Atlas Score Ω. Ejecuta la auditoría AAP-001.

INPUT:
- Audit plan: {PLAN}
- Candidata: {COMPANY}
- Data sources: {SOURCES}

EJECUCIÓN NIVEL POR NIVEL:

NIVEL 1: FUNCIÓN
- Definición operativa (cita)
- Criticidad civilizacional (HA v15.2)
- Scoring 1–10

NIVEL 2: PEAJES
- Tipo de peaje (Tipo A Conocimiento / Tipo B Regulatorio / Tipo C Coordinación)
- Magnitud (% EBITDA, % revenue, $ absolute)
- Sostenibilidad (commoditizable o defensible?)

NIVEL 3: PODER
- Top 3 customers / suppliers (% revenue)
- Switching costs (customer, supplier)
- Market share trend (3-year)
- Herfindahl index (concentration)

NIVEL 4: GOBERNANZA
- Board independence score (0–10)
- Management alignment (stock ownership, vesting)
- Regulatory risk (antitrust, license dependency)
- Key person risk

NIVEL 5: CONCENTRACIÓN
- Geographic (% revenue by region)
- Customer (top 10 % revenue)
- Supplier (single-source dependencies)
- Technology (patent concentration, R&D % revenue)

NIVEL 6: SEGUNDA DERIVADA
- Peaje trajectory (growing, stable, declining?)
- Market share momentum
- Margin expansion/compression (3-year CAGR)
- Capital intensity trend

NIVEL 7: FALSIFICADORES
- Escenario 1: {SCENARIO} → Impacto: {IMPACT}
- Escenario 2: {SCENARIO} → Impacto: {IMPACT}
- Escenario 3: {SCENARIO} → Impacto: {IMPACT}
- Probability/timing analysis

NIVEL 8: ASIGNACIÓN
- Current price vs intrinsic (sum-of-parts)
- Base/bull/bear cases (3-year target)
- Upside/downside ratio
- Capital allocation (buybacks, dividends, M&A history)

CRC SCORING:
- Dimension criticality (1–10)
- Data confidence (1–10)
- Completeness (1–10)
- Score = (C + R + C) / 3

OUTPUT:
Full audit report (markdown, 5–8pp, pronto para review).
```

### 3.4 Verification Prompt
```
Eres verificador crítico de auditorías Atlas Score Ω.

INPUT:
- Draft audit: {AUDIT}
- Supporting data: {DATA}
- Contexto existente: {CONTEXT}

VERIFICACIÓN:

1. LOGICAL FLOW
   - ¿La narrativa 8-level fluye?
   - ¿Hay gaps o contradicciones?

2. DATA VALIDATION (Spot-check)
   - Top 5 data points → Cross-check vs original sources
   - Busca errores numéricos, fuera-de-contexto

3. FALSIFICADOR CHALLENGE
   - ¿Son creíbles los falsificadores?
   - ¿Hay escenarios omitidos (competencia inesperada, regulación)?

4. CRC CONFIDENCE
   - ¿Refleja la puntuación la incertidumbre?
   - ¿Es conservadora o aventurada?

5. PEER CONSISTENCY
   - Comparar vs prior audits en cluster/sector
   - ¿Las metodologías son consistentes?

OUTCOMES:
✅ APROBACIÓN: Audit is audit-ready. Signature block.
🔄 REVISIÓN: Specific items need rework. Return to EXECUTE.
❌ RECHAZO: Scope insufficient or misaligned. Back to PLAN.

OUTPUT:
Review summary (decisión clara + justificación).
```

---

## 4. Comandos GSD Personalizados (Simular en chat)

### /gsd-discover {COMPANY}
Corre discovery phase para candidata nueva o posición existente.

```
Usage: /gsd-discover TSMC
Output: Discovery memo (1–2pp)
```

### /gsd-plan {COMPANY}
Diseña audit plan AAP-001 detallado.

```
Usage: /gsd-plan TSMC
Output: Audit plan (checklist, timeline, data requirements)
```

### /gsd-audit {COMPANY}
Ejecuta full audit (todos 8 niveles AAP-001).

```
Usage: /gsd-audit TSMC
Output: Full audit report (5–8pp, CRC scored)
```

### /gsd-verify {COMPANY}
Verifica audit draft antes de publish.

```
Usage: /gsd-verify TSMC
Output: Verification summary (approve/revise/reject)
```

### /gsd-close {COMPANY}
Cierra audit y registra decisión de inversión.

```
Usage: /gsd-close TSMC --decision hold --action quarterly-reaudit
Output: Decision log + archived audit
```

### /gsd-progress
Estado actual de todas las fases en ROADMAP y STATE.

```
Usage: /gsd-progress
Output: Phase status table + next actions
```

### /gsd-portfolio-audit
Auditoría trimestral completa (Cartera Ω 36 posiciones).

```
Usage: /gsd-portfolio-audit
Output: Summary by tier, CRC scores, anomalies
```

### /gsd-watchlist-cluster {CLUSTER}
Auditoría de cluster Watchlist Ω (e.g., C1 Semis, C6 Software).

```
Usage: /gsd-watchlist-cluster C1
Output: 13-company audit report + Candidata Unicornio nominations
```

---

## 5. Archivos de Soporte (Fichas Rápidas)

### HA v15.2 Taxonomy Reference
```
Meta0: Gobernanza
C1: Semiconductores (C1.7=HBM, C1.8=Packaging)
C2: Energía
C3: Materiales (C3.5=Reciclaje)
C4: Compute Física
C5: Construcción
C6: Hiperscalers
C7: Automatización
C8: Defensa
C9: Logística
C10: Agua
C11: Capital Humano
C12: Calidad Vida
C13: Orbital
C14: Wellness (14.1=Equip, 14.2=Op, 14.3=Nut, 14.4=Bebidas, 14.5=Lifestyle)
Meta0.13: Final Vida (Meta0 overlap)
CAPA-1: Realidad Física (energía, materiales, agua, acero, cemento, petroquímica)
```

### IC Reference Matrix (Criticidad Inversor)
```
ASML ≈ 95–100 (EUV monopolio)
TSMC ≈ 95 (foundry 55%)
Linde ≈ 90 (industrial gases)
MSFT ≈ 88
META ≈ 82
MU ≈ 78
TDY ≈ 72
Ferrari ≈ 18
```

**Scale:** 0–20=local, 20–40=importante, 40–60=estratégica, 60–80=backbone, 80–100=civilizacional

### Tipo de Peajes (Canonical)
- **Tipo A (Conocimiento):** Keyence-like (moat defensivo, primo de precio)
- **Tipo B (Regulatorio/Certificación):** TransDigm-like (regulatory capture, switching costs)
- **Tipo C (Coordinación):** Copart-like (platform, network effects, data moat)

---

## 6. Gobernanza Irrompible

### Ley Suprema: Ω-PEAJE-001
Toda auditoría Atlas Score Ω = 8 niveles sin excepción.

### Restricción Estratégica Nivel 1
MSFT, GOOGL, AMZN = pilares permanentes Cartera Ω.
Solo modificable por decisión explícita de Vicente.

### GOV-TIMING-IPO-001 (INVIOLABLE)
Mínimo 2–3 meses post-IPO antes de capital deployment.
NUNCA día 1 cotización. SPCX: 3 verificaciones bloqueantes.

### Ω-51 (Horizonte de Validación)
12 meses consecutivos capital real sin fallo constitucional → validado para divulgación pública.

### L-GOV-003 (Promoción Watchlist → Cartera)
- 12+ meses capital deployed
- Zero constitutional failures
- Ω-PEAJE-001 8-level revalidation

### Atlas Puro ≠ Atlas Financiero (SEPARACIÓN PERMANENTE)
- Ideas originate en Atlas Puro (investigación epistemológica)
- Flujo unidireccional: Atlas Puro → Atlas Financiero (after repeated validation)
- Never conflacionar

---

## 7. Integración con Atlas Financiero (PWA)

### Data Flow
```
GSD Audit Report → Decision → T212 CORE Execution → atlas-audit.functions Log
```

### Key Functions
- `persist_audit_atomic` (PostgreSQL RPC): Transactional audit atomicity
- `runAtlasFullAudit` (TypeScript): Full audit engine trigger
- `atlas-audit.functions.ts`: Audit state machine

### Audit Trail
Cada auditoría → stored en Supabase con:
- Audit metadata (company, date, auditor)
- 8-level scores (function through allocation)
- CRC score (criticality, reliability, completeness)
- Decision + rationale
- Data sources cited

---

## 8. Weekly Checkpoint & Review Cadence

| Frecuencia | Tarea | Owner |
|----------|-------|-------|
| Diaria | Lectura Biblioteca (22:00) | Vicente |
| Semanal (Fri 17:00) | Capital, IPO verification, PWA progress | Vicente + Claude |
| Bi-weekly (2/4 Wed) | Watchlist monitoring, Atlas 9/10 progress | Vicente + Claude |
| Mensual (1º día) | Milestone review, ROADMAP re-prioritization | Vicente |
| Trimestral | Full Cartera Ω audit (AAP-Ω) | Vicente + Claude |
| Semestral | Biblioteca audit + system redesign | Vicente |

---

## 9. Checklist: Audit Listo para Publicar

- [ ] 8-level structure complete (Función through Asignación)
- [ ] CRC scores assigned (all 3 dimensions: C, R, C)
- [ ] 3–5 falsificadores candidatos identified
- [ ] Data sources cited (SEC, earnings transcripts, industry reports)
- [ ] Narrative flows logically (no gaps or contradictions)
- [ ] Peer consistency verified (comparison to similar audits)
- [ ] Vicente reviewed and approved
- [ ] Archived in atlas-gsd/.planning/audits/{COMPANY}/{DATE}/
- [ ] Decision logged (Cartera action, Watchlist promotion, Candidata nomination)
- [ ] STATE.md updated

---

