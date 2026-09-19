# ATLAS Ω — METRIC EVIDENCE INTEGRITY Ω · v3.4 EXTENSION

**Fecha:** 19-SEP-2026  
**Estado:** ACTIVE / OFFICIAL v3.4 EXTENSION  
**Autoridad padre:** PROMPT MAESTRO ATLAS Ω v3.4 — SIMPLIFIED CORE  
**Rol:** guardrail transversal R0/E1 de integridad de evidencia métrica; soporte de E6 Assurance  
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

No selecciona activos, no asigna score, no crea señales de compra/venta, no reemplaza E3 y no crea un gate adicional.

## 2 · Contrato mínimo de una métrica

Para toda métrica cuantitativa material que pueda afectar assessment, estados, valoración, Expected Return, Conviction Ω, sizing o cartera, el mínimo canónico es:

```text
METRIC_VALUE + ACCOUNTING_BASIS + SOURCE + AVAILABLE_AT
```

Además debe conservar, cuando aplique:

- nombre de métrica;
- periodo económico;
- `observed_at`;
- `decision_as_of` / T0;
- definición/unidad/moneda necesarias para reconciliación.

`available_at` es el instante más temprano **verificable** en que el dato exacto estaba públicamente disponible. `observed_at` es cuándo ATLAS lo observó o recuperó.

Si la disponibilidad pública original no puede verificarse:

```text
available_at = observed_at
```

como cota conservadora. Nunca se retrofecha por conveniencia.

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

### 3.1 · Corrección temporal canónica

`observed_at > available_at` **no es una inconsistencia por sí misma**. Es normal recuperar hoy un dato publicado semanas antes. El código no puede bloquearlo si existe evidencia independiente de `available_at`.

Igualmente, `period_end > available_at` no implica look-ahead por sí solo: una estimación o consenso puede referirse a un periodo fiscal futuro y ser conocido en T0. La prueba de PIT se hace contra `available_at`, no contra `period_end`.

## 4 · Base contable y definicional

Una métrica sensible a convención contable/normalización con base `UNKNOWN` o no identificable se bloquea para uso canónico:

```text
ACCOUNTING_BASIS_AMBIGUOUS -> BLOCK / EVIDENCE_PENDING
```

Esto incluye, cuando aplique, EPS, revenue, net income, operating income, EBITDA/EBIT, gross profit, OCF, FCF, márgenes, ROIC y ROE.

Ejemplos válidos de basis explícita:

- `GAAP`;
- `IFRS`;
- `NON_GAAP`;
- `ADJUSTED`;
- `MANAGEMENT_DEFINED`;
- `CONSENSUS_NORMALIZED`;
- `NOT_APPLICABLE` cuando corresponda.

GAAP/IFRS y non-GAAP/adjusted son series separadas. No se sustituyen, promedian ni comparan silenciosamente como si su definición fuera idéntica.

## 5 · Non-GAAP

Una métrica non-GAAP **puede ser evidencia válida** si está identificada explícitamente y conserva fuente, definición, periodo y temporalidad. No se convierte silenciosamente en GAAP ni se compara como equivalente entre emisores si las definiciones difieren.

```text
NON_GAAP_EXPLICIT = ACCEPTABLE_EVIDENCE_CLASS
NON_GAAP_IMPLICIT_OR_MISLABELED = BLOCKED
```

## 6 · Fuente y valor

Una métrica crítica sin fuente trazable se bloquea:

```text
SOURCE_MISSING -> BLOCKED
```

Una métrica sin valor material presente también se bloquea:

```text
METRIC_VALUE_MISSING -> BLOCKED
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

## 8 · Leyes

```text
NUMERIC MATCH ≠ DEFINITIONAL MATCH
UNKNOWN ACCOUNTING BASIS ≠ VERIFIED METRIC
RETRIEVAL TIME ≠ PUBLIC AVAILABILITY
POST-T0 VALIDATION ≠ EX-ANTE EVIDENCE
```

## 9 · Casos de regresión obligatorios

La implementación debe conservar al menos estos casos:

1. `EPS` ambiguo sin base contable → **BLOCKED**.
2. `NON_GAAP EPS` explícito con fuente y temporalidad válida → **ACCEPTED**.
3. `GAAP EPS` explícito → **ACCEPTED**.
4. `observed_at > available_at`, con disponibilidad pública demostrada → **ACCEPTED**.
5. estimación de periodo futuro disponible antes de T0 → **ACCEPTED**.
6. `available_at > decision_as_of` → **BLOCKED / LOOK_AHEAD_BLOCKED**.
7. fuente ausente → **BLOCKED / SOURCE_MISSING**.
8. valor ausente → **BLOCKED / METRIC_VALUE_MISSING**.
9. `available_at` ausente → **BLOCKED / AVAILABLE_AT_MISSING**.

## 10 · Integración arquitectónica

```text
R0 / INGESTION
→ METRIC_EVIDENCE_INTEGRITY Ω
→ E1 EVIDENCE
→ E2 ASSESSMENT
→ E3 GATE
→ E4 DECISION
```

Es un guardrail de entrada y assurance, no un séptimo motor.

**Implementación:** `src/atlas/algorithm/metric-evidence-integrity-omega.ts`  
**Regresión:** `src/atlas/algorithm/metric-evidence-integrity-omega.test.ts`

## Ley final

> Ninguna cifra obtiene autoridad porque parezca precisa. Debe ser identificable, trazable, definicionalmente reconciliada y disponible en el momento correcto.
