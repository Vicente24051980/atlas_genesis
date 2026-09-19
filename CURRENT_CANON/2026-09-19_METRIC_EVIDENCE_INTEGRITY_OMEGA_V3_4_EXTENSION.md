# ATLAS Ω — METRIC EVIDENCE INTEGRITY Ω · v3.4 EXTENSION

**Fecha:** 19-SEP-2026  
**Estado:** ACTIVE / OFFICIAL v3.4 EXTENSION  
**Autoridad padre:** PROMPT MAESTRO ATLAS Ω v3.4 — SIMPLIFIED CORE  
**Rol:** guardrail transversal de integridad de evidencia métrica  
**Motores nuevos:** 0  
**Gates nuevos:** 0  
**Direct score weight:** 0  
**BUY/SELL authority:** FALSE

## 0 · Precedencia

Esta ampliación **no sustituye v3.4**. La extiende.

```text
PROMPT_MAESTRO_ATLAS_OMEGA_V3_4_SIMPLIFIED_CORE
    >
METRIC_EVIDENCE_INTEGRITY_OMEGA_V3_4_EXTENSION
    >
v3.3 y anteriores
```

Si una regla de esta ampliación contradijera v3.4, prevalece v3.4.

## 1 · Función

`METRIC_EVIDENCE_INTEGRITY Ω` opera antes de que una métrica pueda adquirir autoridad en E1/E2. Su función es impedir que valores numéricos correctos o plausibles entren con identidad contable, provenance o temporalidad ambiguas.

No selecciona activos, no asigna score, no crea señales de compra/venta y no reemplaza E3.

## 2 · Contrato mínimo de una métrica

Para que una métrica crítica pueda ser aceptada debe conservar, cuando aplique:

- nombre de métrica;
- valor;
- periodo económico;
- base contable explícita cuando la identidad pueda ser ambigua;
- `observed_at`;
- `available_at`;
- `decision_as_of`;
- fuente trazable.

`available_at` representa el momento más temprano en que la información estaba realmente disponible para ATLAS. La fecha de recuperación posterior no puede retroceder artificialmente ese instante.

## 3 · Point-in-time / look-ahead

Regla dura:

```text
available_at <= decision_as_of
```

Si `available_at > decision_as_of`:

```text
METRIC_EVIDENCE = BLOCKED
REASON = LOOK_AHEAD_BLOCKED
```

Datos posteriores pueden usarse para evaluación ex post en E6, nunca para reescribir una decisión ex ante.

## 4 · EPS y base contable

`EPS` sin base contable identificable es ambiguo y se bloquea.

Ejemplos válidos:

- `GAAP EPS`;
- `NON_GAAP EPS`;
- `IFRS EPS`;
- `EPS` con campo estructurado `accountingBasis`.

Ejemplo inválido:

- `EPS = 2.15` sin indicar si es GAAP, non-GAAP/adjusted, IFRS u otra base relevante.

Regla:

```text
EPS_AMBIGUOUS -> BLOCK
EPS_WITH_EXPLICIT_BASIS -> MAY_PASS_OTHER_GATES
```

## 5 · Non-GAAP

Una métrica non-GAAP **puede ser evidencia válida** si está identificada explícitamente y conserva su fuente y definición. No se convierte silenciosamente en GAAP ni se compara como equivalente entre emisores si las definiciones difieren.

```text
NON_GAAP_EXPLICIT = ACCEPTABLE_EVIDENCE_CLASS
NON_GAAP_IMPLICIT_OR_MISLABELED = BLOCKED
```

## 6 · Fuente

Una métrica crítica sin fuente trazable se bloquea.

```text
SOURCE_MISSING -> BLOCKED
```

Una narrativa, memoria o valor copiado sin provenance no adquiere autoridad por repetición.

## 7 · Fail-closed

Cuando falte un dato necesario para resolver identidad, temporalidad o provenance de una métrica crítica:

```text
UNKNOWN -> BLOCK / EVIDENCE_PENDING
```

Nunca:

```text
UNKNOWN -> ASSUMED_VALID
```

## 8 · Casos de regresión obligatorios

La implementación debe conservar al menos estos casos:

1. `EPS` ambiguo sin base contable → **BLOCKED**.
2. `NON_GAAP EPS` explícito con fuente y temporalidad válida → **ACCEPTED**.
3. `available_at > decision_as_of` → **BLOCKED / LOOK_AHEAD_BLOCKED**.
4. fuente ausente → **BLOCKED / SOURCE_MISSING**.

## 9 · Integración arquitectónica

```text
R0 / INGESTION
→ METRIC_EVIDENCE_INTEGRITY Ω
→ E1 EVIDENCE
→ E2 ASSESSMENT
→ E3 GATE
→ E4 DECISION
```

Es un guardrail de entrada y assurance, no un séptimo motor.

## Ley final

> Ninguna cifra obtiene autoridad porque parezca precisa. Debe ser identificable, trazable y disponible en el momento correcto.
