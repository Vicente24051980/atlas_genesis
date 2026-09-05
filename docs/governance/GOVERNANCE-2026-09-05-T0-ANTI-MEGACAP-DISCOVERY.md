# Governance Log Ω

| Campo | Valor |
|---|---|
| ID | GOV-2026-0905-T0 |
| Qué | Constitucionalización de T0 — Anti-Megacap Discovery Gate Ω |
| Quién | Vicente / ATLAS Ω |
| Cuándo | 2026-09-05 |
| Issue | #102 |
| Estado | APROBADO · pendiente de merge técnico al abrir esta entrada |

## Acción

Promover T0 de regla de neutralidad de tamaño a **gate constitucional de descubrimiento**, ejecutado antes de todos los motores analíticos, contratos griegos, ranking, allocation y ejecución.

## Problema corregido

Un sistema puede declarar `market cap contribution = 0` y seguir estando sesgado si el universo inicial fue construido a partir de índices, cobertura de analistas, familiaridad de marca o disponibilidad de datos. El sesgo de descubrimiento sucede antes del score.

## Nueva regla

1. Toda empresa parte de cero después de T0.
2. Market cap, pertenencia a índice, cobertura, familiaridad y comodidad de datos aportan 0 a descubrimiento y score.
3. T0 fuerza cobertura por buckets de capitalización.
4. En búsquedas `CHALLENGER` y `NO_AI`, la primera tanda no puede superar 20% de megacaps salvo justificación explícita basada en evidencia.
5. Los buckets se asignan después de congelar la prioridad de descubrimiento.
6. La cobertura por bucket jamás modifica el score final.
7. Una megacap puede quedar #1 si gana después por evidencia económica.
8. Saturación, runway, liquidez o ventajas de escala sólo pueden entrar por una cadena causal demostrada, no por tamaño en abstracto.

## Audit trail obligatorio

- source de descubrimiento;
- rank anterior a conocer tamaño;
- bucket posterior al freeze;
- si el tamaño era conocido antes de la entrada;
- razón de selección;
- contaminación por tamaño, índice, cobertura, marca o disponibilidad de datos.

## Rollback

Revertir T0 como gate constitucional devolvería el sistema a una neutralidad sólo post-selección y permitiría que un universo sesgado por megacaps llegara limpio al score. Los scores ya calculados no se reescriben automáticamente, pero futuras búsquedas perderían la garantía de descubrimiento size-blind.

Rollback permitido sólo mediante revisión metodológica registrada.
