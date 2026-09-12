# ATLAS Ω — SOFTWARE MOAT DECAY & AI REPLICABILITY CONTROL v1.1 HARDENED

**ESTADO:** CANDIDATE FOR RATIFICATION  
**SUSTITUYE:** v1.0 PROPOSED CANON  
**UBICACIÓN:** E5 CONTROL / E6 ASSURANCE  
**PESO DIRECTO NINE-SCORE:** 0%  
**PESO DIRECTO FRU-MATH:** 0%  
**NUEVO MOTOR:** NO  
**AUTORIDAD DE CAPITAL:** NULA  
**PORTFOLIO ACTION DIRECTA:** NONE

## 1. Principio central

La reducción del coste de producir software obliga a separar dos preguntas que no pueden compartir inputs:

`ART = ¿QUÉ TAN FÁCIL ES COPIAR EL PRODUCTO?`

`MDS = ¿QUÉ TAN DIFÍCIL ES COPIAR EL NEGOCIO?`

**Feature Replicability ≠ Business Replicability.**

Queda prohibido utilizar un mismo hecho económico para puntuar simultáneamente ART y MDS.

## 2. Responsabilidad epistémica

### ART

Mide exclusivamente `TECHNICAL PRODUCT REPLICABILITY`.

No mide distribución, switching costs, network effects, workflow lock-in, proprietary data moat ni customer embeddedness. Esos factores pertenecen exclusivamente a MDS.

### MDS

Mide exclusivamente `BUSINESS DEFENSIBILITY`.

No mide dificultad técnica de reconstruir features.

## 3. ART Ω — AI Replicability Test v1.1

`ART ∈ [0,100]`, donde 0 = muy difícil de reproducir y 100 = extremadamente fácil.

ART queda reducido a cinco dimensiones no solapadas con MDS:

### ART-1 — Feature Isolability (FI, 0–20)

¿Puede el valor principal del producto aislarse en un conjunto limitado de funciones reproducibles?

- 0: producto profundamente integrado o dependiente de arquitectura propietaria compleja.
- 10: parte material del valor reside en funciones discretas.
- 20: casi todo el valor percibido reside en features claramente aislables.

### ART-2 — Reconstruction Complexity (RC, 0–20)

Esfuerzo técnico actual requerido para reconstruir una alternativa funcionalmente suficiente con herramientas AI contemporáneas.

- 0: años/equipos especializados/capital elevado.
- 10: meses y equipo competente.
- 20: semanas o pocos desarrolladores asistidos por AI.

### ART-3 — Model/API Substitutability (MS, 0–20)

Cuánto del producto puede sustituirse mediante foundation models, APIs, open-source models, generic agents o code-generation systems.

- 0: dependencia mínima.
- 20: casi toda la funcionalidad central puede ensamblarse con infraestructura genérica.

### ART-4 — Interface Abstraction Risk (IA, 0–20)

Mide si agentes externos pueden consumir el valor del producto sin utilizar directamente su UI/UX.

- 0: interfaz y producto son inseparables del resultado.
- 10: parte del uso puede migrar a agentes/API.
- 20: un agente puede abstraer prácticamente toda la interacción del usuario.

IA mide facilidad técnica de abstraer la interfaz; el poder económico tras esa abstracción pertenece a MDS.

### ART-5 — Capital / Intangible Reconstruction Burden (CB, 0–20)

Mide cuánto capital, certificaciones, know-how técnico, IP o infraestructura especializada requiere recrear una alternativa funcional.

- 0: barreras elevadas.
- 20: barreras mínimas.

## 4. Fórmula ART

`ART = FI + RC + MS + IA + CB`

Rango `0 ≤ ART ≤ 100`. No existen pesos ocultos.

## 5. Bandas ART

- 0–20: VERY LOW TECHNICAL REPLICABILITY
- 21–40: LOW
- 41–60: MODERATE
- 61–80: HIGH
- 81–100: EXTREME

## 6. ART Vintage

Todo ART debe contener `ART_VINTAGE_DATE`.

Revisión obligatoria anual o inmediatamente tras un cambio tecnológico material.

## 7. MDS Ω — Moat Durability Score v1.1

`MDS = 0.20D + 0.20W + 0.15S + 0.15P + 0.15N + 0.15A`

- `D` — Distribution: control durable del acceso al cliente.
- `W` — Workflow / System-of-Record Authority: control operacional, legal o económico del registro de verdad.
- `S` — Switching Costs: fricción operacional, contractual, regulatoria, económica y organizativa.
- `P` — Proprietary Dynamic Data: datos privados, continuos y regenerativos.
- `N` — Network / Scale Effects: escala, grafos, marketplaces, telemetry o ecosystems.
- `A` — AI Adaptability & Monetization Resilience: capacidad demostrada de convertir AI en productividad, revenue, pricing power, retention o menores costes.

## 8. Proprietary Data Law

Para `P > 50` deben cumplirse ambas condiciones:

1. Private Continuous Generation.
2. Performance Feedback Loop.

`Historical Archive ≠ Proprietary Data Moat`, salvo evidencia adicional de exclusividad y feedback económico.

## 9. Seat Compression Test

`Billing Vulnerability = f(Seat Revenue, Consumption, Work, Outcome)`.

Debe estimarse `Human Seat Revenue Share`.

Cuando `Human Seat Revenue Share > 70%` y el workflow es materialmente automatizable, `A` no puede superar 60 salvo evidencia empírica de transición exitosa hacia pricing consumption/workload/outcome/transaction/AI-unit based.

La renovación del logo no invalida la amenaza: puede coexistir `Logo Retention ≈ 100%` con `ARR/customer ↓`.

## 10. Headless Disintermediation Test

M2/W debe distinguir `System of Record` frente a `System of Engagement`.

Si agentes externos utilizan el sistema como `Database/API backend`, se evaluará si la compañía conserva autoridad sobre el registro, control de permisos, execution rights, economic toll, transaction ownership y billing leverage.

Si no conserva ninguno, `W ↓`, aunque el backend siga técnicamente en uso.

## 11. MDS Bands

- MDS ≥80: STRUCTURAL MOAT
- 70–79: STRONG
- 50–69: ADEQUATE / MONITOR
- 35–49: WEAK
- <35: STRUCTURALLY VULNERABLE

## 12. ART × MDS → E5 State

| ART | MDS ≥70 | MDS 50–69 | MDS <50 |
|---|---|---|---|
| 0–40 | 🟢 INTACT | 🟡 WATCH | 🟠 DETERIORATING |
| 41–60 | 🟢 / 🟡 según AMCS | 🟡 WATCH | 🟠 DETERIORATING |
| 61–80 | 🟡 WATCH | 🟡 WATCH | 🟠 DETERIORATING |
| 81–100 | 🟡 WATCH | 🟠 DETERIORATING | 🟠 DETERIORATING |

Ninguna combinación ART/MDS produce automáticamente 🔴.

## 13. Requisito para 🔴 Material Thesis Defect

🔴 requiere evidencia empresarial observable. Debe existir al menos uno:

1. deterioro material de FCF normalizado;
2. pérdida estructural de pricing power;
3. caída material persistente de NRR/ARR por cliente;
4. pérdida estructural de cuota;
5. erosión material de gross margin atribuible al cambio competitivo;
6. colapso verificable de switching costs;
7. evidencia de que el producto ha dejado de ser económicamente necesario.

ART alto o MDS bajo por sí solos nunca son suficientes.

## 14. AMCS Ω v1.1 — Clustered Signal

Se elimina `3 métricas = ACTIVE` y se sustituyen señales por cinco clústeres causales:

### C1 — Price / Unit Economics

Net price realization negativa, descuentos crecientes, gross margin erosion, inference cost no trasladable.

### C2 — Retention / Expansion

NRR deteriorándose, seat contraction, ARR/customer cayendo, churn económico creciente.

### C3 — Sales Efficiency

CAC creciente, sales cycles más largos, declining sales efficiency, worsening payback.

### C4 — Competitive Position

Share loss, AI-native competitors, open-source displacement, organic growth diferencial negativo.

### C5 — Substitution / Disintermediation

Headless agent usage, bundling, reduced switching costs, interface abstraction, third-party agents capturando la relación con cliente.

## 15. Activación AMCS

`AMCS = ACTIVE` solo cuando al menos 3 clústeres están simultáneamente activos y además:

- persisten 2 trimestres consecutivos, o
- aparecen en 3 de los últimos 4 trimestres,

con al menos uno de `C1` o `C2`, o impacto financiero equivalente.

Un evento extraordinariamente material puede activar revisión inmediata mediante `MATERIAL EVENT OVERRIDE`, sin convertir automáticamente el activo en 🔴.

## 16. Falsification Test

Hipótesis: `High ART → higher probability of economic moat compression`.

Recalibrar si una cohorte `ART >60`, durante 8–12 trimestres, mantiene simultáneamente NRR, pricing power, gross margin, FCF conversion y market share estables, sin compresión sistemática de economics frente a comparables `ART ≤40`.

Resultado posible: recalibración de thresholds o retirada del módulo si no existe capacidad predictiva incremental.

## 17. Positive Disconfirmation Signals

Una empresa con ART elevado puede demostrar que el riesgo técnico no se transmite económicamente si aparecen:

1. pricing creciente pese a clones;
2. NRR estable/creciente;
3. AI-SKU expansion material;
4. market share estable o creciente;
5. expansión de FCF margins;
6. third-party agents consumiendo la plataforma pero aumentando monetización;
7. mayor wallet share pese a reducción de seats.

## 18. M6 — AI Adaptability Evidence Gate

`A` no puede puntuarse por roadmap, marketing, número de features AI o declaraciones “AI-native”.

Para `A ≥70` debe existir evidencia en al menos dos categorías: incremental revenue, incremental ARPU, improved retention, cost reduction, improved gross margin o measurable productivity monetization. Al menos una debe aparecer en resultados operativos o disclosures verificables.

## 19. Cybersecurity Exception Gate

No existe excepción automática para cybersecurity. Para considerar AI como reforzador neto del moat debe verificarse telemetry propietaria, closed-loop threat intelligence, monetización AI, expansion revenue, improved efficacy o installed-base leverage.

Sin evidencia: `AI benefit = UNPROVEN`.

## 20. Megaplatform Exception Gate

Distribución masiva no basta. Para concluir que commoditización favorece a una megaplataforma debe observarse al menos uno: ARPU ↑, attach rate ↑, retention ↑, incremental revenue ↑, cost-to-serve ↓ material o ecosystem dependency ↑.

## 21. Verticality Tag

Todo activo debe clasificarse:

`VERTICALITY = HORIZONTAL / VERTICAL / HYBRID`

El tag no altera automáticamente MDS. Sirve para interpretar regulatory embeddedness, workflow specificity, data advantage y switching costs.

## 22. Perímetro de aplicación

Se aplica cuando `Software Economics` representa una parte material de la tesis de inversión. Puede incluir SaaS, cybersecurity, data platforms, exchanges/software hybrids, vertical software, marketplaces con importante software layer y semiconductores solo si software es parte material del moat underwritten.

No se aplica por etiqueta sectorial, sino por `ECONOMIC DEPENDENCY`.

## 23. LC Router Interaction

Se elimina la regla mecánica `ART>60 ⇒ -30% Confidence(LC)` por arbitraria y potencialmente doble-contabilizable.

Se sustituye por `LC RE-UNDERWRITING GATE`: si `ART>60` o `AMCS=ACTIVE`, se obliga a revisar los supuestos que justificaron la clasificación LC. LC solo cambia si dejan de cumplirse sus condiciones económicas.

## 24. G1 Protection Rule

Si un G1 Structural Compounder entra en revisión, reevaluar RONIC durability, reinvestment runway, terminal growth, margin durability, pricing y retention. Si deja de satisfacer G1, el router se ejecuta de nuevo.

Queda prohibido forzar `G1 → G4/G5` solo por ART elevado.

## 25. Transmisión a FRU-MATH

Cadena:

`ART/MDS/AMCS → E5 Review → E2 Re-underwriting → FRU Inputs`

Puede afectar revenue growth, NRR, seat count, ARPU, gross margin, operating leverage, reinvestment rate, RONIC, terminal multiple y scenario probabilities.

Nunca se añade `ART penalty` al IRR final.

## 26. PREU / Anti-Double-Counting Law

- ART = replicabilidad técnica.
- MDS = defensibilidad económica.
- AMCS = evidencia de transmisión.
- FRU = cuantificación financiera.

`ONE FACT → ONE PRIMARY FUNCTION`.

Un mismo deterioro no puede reducir MDS, activar múltiples AMCS clusters y reducir varias variables FRU sin documentar canales económicos independientes.

## 27. Miro Precedent

Miro queda clasificado como `ANALOGY / NON-CAUSAL`.

Función permitida: demostrar `Business Survival ≠ Valuation Preservation`.

No puede utilizarse como prueba causal AI, falsificador, confirmación del mecanismo ART ni calibrador directo de múltiplos públicos.

## 28. Runbook E5/E6

`Candidate → LC Applicability → ART → MDS → AMCS → ART×MDS → E5 State → E2 Re-underwriting → FRU rerun → E6 Assurance → E4 Decision`

## 29. Capital Firewall

Este módulo no puede comprar, vender, aumentar, reducir, dimensionar ni sustituir posiciones.

Solo puede: `Detect → Classify → Escalate → Re-underwrite`.

## 30. Replacement Firewall

Una sustitución exige `Material Thesis Defect` o `Superior Replacement Gate = PASS`.

ART elevado o AMCS ACTIVE no satisfacen por sí solos ninguna condición.

## 31. Estados canónicos

- 🟢 INTACT — moat económico resistente.
- 🟡 WATCH — riesgo técnico/económico plausible; transmisión no demostrada.
- 🟠 DETERIORATING — defensa económica insuficiente y/o transmisión observable.
- 🔴 MATERIAL THESIS DEFECT — deterioro económico confirmado que invalida un elemento material del underwriting.

## 32. Ley final

> **IF AI CAN COPY THE PRODUCT, CHECK WHETHER AI CAN COPY THE BUSINESS.**
>
> **IF AI CAN COPY THE BUSINESS, CHECK WHETHER CUSTOMERS ARE ACTUALLY LEAVING OR PAYING LESS.**

Solo cuando la amenaza técnica se transmite a economics debe modificar FRU.

## 33. Certificación propuesta

La v1.1 corrige B1–B4 de v1.0:

1. ART dispone de fórmula reproducible.
2. ART y MDS quedan epistemológicamente separados.
3. AMCS usa clústeres causales y persistencia temporal.
4. ART × MDS produce estados E5 deterministas.

También incorpora falsificador, positive disconfirmation, seat compression, headless disintermediation, dynamic-data law, evidence gates, verticality, vintage dating, LC routing, Miro como analogía no causal, PREU y firewalls de capital/sustitución.

**STATUS PROPUESTO:**

`SOFTWARE MOAT DECAY & AI REPLICABILITY CONTROL v1.1 = RATIFICATION READY`

No marcar `CANONICAL_CLOSED` hasta superar una última auditoría de consistencia matemática y dos pruebas de caso adversariales.
