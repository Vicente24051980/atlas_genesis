# RFC-MONEY-ROTATION-INTEGRITY-OMEGA-v1.2

## Estado

CANDIDATO CANONICO. Mobile-first. No modifica CORE-00.

## Mision

Convertir MONEY ROTATION Ω / HISTORICAL DISLOCATION Ω en un motor cuantitativo capaz de detectar rotacion temprana sin confundir precio, capitalizacion, AUM, presupuestos, valoraciones privadas o demanda fisica con flujos de capital.

## Score Ω

- Flujos: 20%
- Fuerza relativa: 20%
- Revisiones de beneficios: 15%
- Breadth: 10%
- Volumen institucional: 10%
- Reaccion a noticias: 10%
- Regimen macro: 10%
- Crowding: 5%

Cada componente se puntua 0-100. En crowding, 100 significa amplio margen antes del consenso; no crowding extremo.

## Reglas de datos

1. Toda cifra de flujo debe usar una metrica de flujo explicita y una fuente trazable.
2. Una serie comparable mantiene proveedor, dataset, universo, periodo, ventana, divisa, unidad y metrica.
3. Solo se suman particiones demostrablemente no solapadas.
4. MARKET_CAP_CHANGE, PRICE_RETURN, AUM_CHANGE, GOVERNMENT_BUDGET, PRIVATE_COMPANY_VALUATION, COMMODITY_PHYSICAL_DEMAND y PRODUCTION_GROWTH no se agregan a un total de flujos.
5. Ventanas 1w, 4w, 13w y YTD se conservan separadas. No se suman.
6. Conflictos equivalentes no reconciliados producen PENDING_PRIMARY_VALIDATION.

## Gate de fases

Las cinco confirmaciones R3 son:

1. Dejo de salir dinero.
2. Fuerza relativa mejorando.
3. Revisiones de beneficios mejorando.
4. Breadth expandiendose.
5. Volumen institucional confirmando.

Estados:

- R3_CANDIDATE: una o dos confirmaciones; solo MONITOR.
- R3_CONFIRMED: al menos tres de cinco; solo MONITOR.
- R4_CONFIRMED: R3 confirmado, dos ventanas positivas comparables y buena noticia despues de destruccion con reaccion positiva.
- Solo R4_CONFIRMED se promociona al algoritmo principal ATLAS.

MONEY ROTATION Ω no emite BUY, REDUCE ni SELL por si solo.

## Caso de regresion 9-ago-2026

El informe Gran Rotacion 2026 queda REJECT_AS_DATASET_KEEP_AS_HYPOTHESIS. La señal valida es tactica, no estructural:

- Tecnologia ETF EE.UU.: +$44.760B H1, no -$450B.
- Salud ETF EE.UU.: +$1.018B H1, no +$65-80B.
- Semana al 5-ago: growth -$5.500B; value +$1.990B; salud +$0.866B; industriales +$0.875B.

Salud e industriales quedan como R3_CANDIDATE_MONITOR. Tecnologia no activa salida estructural. Bonos, oro y petroleo se mantienen como modulos cross-asset separados.
