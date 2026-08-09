# RFC-EVIDENCE-INTEGRITY-OMEGA-v1.1

## Estado
CANDIDATO CANONICO. Requiere validacion antes de merge.

## Mision
Evitar que ATLAS convierta cambios de precio/capitalizacion en flujos, duplique señales causales, trate filings como informacion economica nueva por defecto o ejecute REDUCE/SELL sin falsificador primario confirmado.

## Reglas no negociables
1. MARKET_CAP_CHANGE != CAPITAL_FLOW.
2. PRICE_RETURN != CAPITAL_FLOW.
3. AUM_CHANGE no implica por si solo NET_FLOW.
4. Toda cifra de Money Rotation debe usar una metrica de flujo explicita y trazable.
5. Level 1 puede modificar canon; Level 2 solo WATCH; Level 3 WATCH/contexto; Level 4 RADAR/hipotesis.
6. Claims del mismo eventClusterId cuentan como una sola señal causal.
7. publishedAt/filedAt/eventAt/effectiveAt son conceptos separados.
8. isNewInformation debe ser verdadero para contar como señal temprana nueva.
9. Observaciones equivalentes con valores incompatibles quedan QUARANTINED hasta reconciliacion.
10. REDUCE/SELL exige falsificador de tesis confirmado y evidencia primaria trazable.

## Flujo
MOBILE INPUT -> EVIDENCE INGESTION -> SOURCE AUTHENTICITY -> CLAIM EXTRACTION -> QUANTITATIVE SEMANTICS -> TEMPORAL NORMALIZATION -> CROSS-SOURCE VERIFICATION -> EVENT DEDUP/SIGNAL INDEPENDENCE -> VALIDATION HARNESS -> EPISTEMIC CLASSIFICATION -> THESIS/FALSIFIER MAPPING -> ENGINES -> DECISION SAFETY GATE -> FINAL SCORE -> DECISION LOG.

## Caso de prueba obligatorio: Money Rotation
Un informe que sume perdida de capitalizacion de Magnificent 7 con ETF flows y lo denomine dinero rotado debe ser rechazado. Solo ETF_NET_FLOW, MUTUAL_FUND_NET_FLOW, ETF_CREATION_REDEMPTION, INSTITUTIONAL_POSITION_CHANGE o FUND_ALLOCATION pueden alimentar directamente una cifra de flujo.

## Caso de prueba obligatorio: alertas rojas
Dos cambios ejecutivos derivados de la misma reorganizacion no cuentan automaticamente como dos señales independientes. Un Form 144 o filing reciente que ejecute un plan preexistente no se considera nueva informacion economica sin comprobar eventAt/effectiveAt.

## Caso de prueba obligatorio: accion
Insider selling, caida de precio o CAPEX creciente no habilitan por si solos REDUCE/SELL. La accion destructiva queda degradada a WATCH si no existe falsificador confirmado con evidencia primaria.
