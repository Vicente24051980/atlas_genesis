# ATLAS Ω — RED RECOVERING / RECOVERY INFLECTION

Fecha de incorporación: 2026-08-11
Estado: CANÓNICO / motor complementario de entrada temprana

## Objetivo

Evitar que GREEN CONTINUITY Ω trate de la misma forma un horizonte rojo que continúa deteriorándose y un horizonte rojo cuyo precio ya ha formado suelo y está recuperándose.

## Regla fundamental

**RED FALLING ≠ RED RECOVERING.**

Un retorno de 3 meses negativo puede permanecer rojo por efecto del punto inicial de comparación, aunque el comportamiento reciente del precio ya haya cambiado de dirección.

### RED FALLING

Penaliza la entrada cuando persisten máximos/mínimos decrecientes, debilidad 1S/1M, presión vendedora, deterioro de tendencia o deterioro fundamental.

### RED RECOVERING

Puede activar RECOVERY INFLECTION Ω antes de que GREEN CONTINUITY alcance 5/5 cuando concurran:

1. Empresa de calidad y tesis fundamental intacta.
2. Drawdown material previo, normalmente 20–60% según volatilidad histórica del activo.
3. Evidencia de estabilización/suelo: deja de marcar mínimos o forma mínimo creciente.
4. 1S y/o 1M giran a verde y muestran aceleración positiva.
5. El horizonte todavía rojo (por ejemplo 3M) mejora progresivamente aunque su retorno acumulado siga siendo negativo.
6. Volumen vendedor/capitulación se agota o la recuperación presenta mejor estructura.
7. Recuperación de niveles técnicos/tendencia (MM50 u otras referencias) añade confirmación, pero no debe utilizarse aisladamente.
8. No existe falsificador fundamental.

## Estados operativos

- RED_FALLING: rojo y deteriorándose.
- RED_STABILIZING: rojo pero deja de deteriorarse.
- RED_RECOVERING: rojo con pendiente/estructura de recuperación confirmable.
- GREEN_CONFIRMED: horizonte ya positivo.

GREEN CONTINUITY Ω sigue siendo el motor principal de selección/mantenimiento. RECOVERY INFLECTION Ω funciona como motor independiente de entrada anticipada. El objetivo es capturar parte del rebote antes de que una confirmación mecánica 5/5 llegue demasiado tarde.

## Relación con ENTRY TIMING Ω / NO-CHASE

Una señal RED_RECOVERING no implica comprar a cualquier precio. ENTRY TIMING Ω debe comprobar distancia desde el mínimo, aceleración reciente, volatilidad histórica, drawdown normal, medias/tendencia y calidad de consolidación. Si el rebote ya está excesivamente extendido, NO-CHASE puede bloquear la entrada aunque RECOVERY INFLECTION sea positivo.

## Caso de validación — Halma (HLMA), 11-ago-2026

Precio observado por el usuario: ~3.718–3.720p; entrada exploratoria ~3.711p.

Capturas Trading 212 aportadas:
- 1S: +4,79%.
- 1M: +2,15%.
- 3M: -19,05%.
- 1A: +13,42%.
- MAX: +816,56%.
- Rango 52 semanas mostrado: 3.194,1–4.896,3p.

Lectura ATLAS: el 3M sigue matemáticamente rojo porque el punto de comparación estaba cerca de niveles mucho más altos, pero la estructura reciente muestra recuperación desde la zona de mínimos. Clasificación: **3M RED_RECOVERING**, no RED_FALLING.

Validación fundamental pública FY2026: Halma reportó ingresos de £2,58bn (+15%), EBIT ajustado £594,5m (+22%), crecimiento de EPS ajustado del 21%, y mantuvo una perspectiva de crecimiento orgánico low-double-digit para FY2027 con margen ajustado aproximadamente estable. La caída posterior a resultados fue principalmente una reacción a la desaceleración esperada frente al crecimiento excepcional previo, no una evidencia automática de ruptura de tesis.

## Salida estándar del radar

Para cada horizonte mostrar tanto el signo como el estado dinámico:

`3M: -19.05% | RED_RECOVERING | slope ↑ | bottom_distance | recovery_score`

Nunca reducir la información a VERDE/ROJO cuando exista evidencia suficiente para determinar dirección interna del horizonte.

## Regla de decisión

- GREEN 5/5 + Quality PASS + Entry Timing PASS → candidato de entrada principal.
- RED_RECOVERING + Quality PASS + Thesis intact + Recovery Inflection PASS + Entry Timing PASS → **RECOVERY ENTRY**, inicialmente dimensionada de forma prudente.
- RED_FALLING → no anticipar suelo.
- Falsificador fundamental → Recovery Inflection queda invalidado aunque el precio rebote.

## Principio

**El color mide dónde está el precio respecto al pasado; la pendiente de recuperación mide hacia dónde se está moviendo ahora. ATLAS Ω debe medir ambos.**
