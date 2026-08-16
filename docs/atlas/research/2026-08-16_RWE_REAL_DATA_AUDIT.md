# ATLAS Ω — RWE real-data audit

Fecha: 16-ago-2026
Ticker operativo Trading 212: RWEd_EQ / RWE.DE

## Veredicto de integridad
- Fecha 11-nov-2026: VERIFICADA por calendario oficial de RWE.
- Naturaleza del evento: "Interim statement on the first three quarters 2026"; reporte acumulado 9M hasta 30-sep-2026, no un Q3 standalone puro.
- "Antes de apertura": NO VERIFICADO todavía por RWE. El calendario oficial actual no publica hora. H1 se publicó alrededor de las 07:00 CEST, pero no extrapolar al 11-nov sin confirmación.
- EPS consenso €0,63: existe en proveedor secundario para trimestre terminado 30-sep-2026, pero basado en 1 analista. QUALITY=LOW/MEDIUM; PROVIDER_REPORTED.
- Revenue consenso €8,47B: NO VALIDADO como consenso actual de Q3. La cifra exacta €8,47B aparece asociada al consenso de ingresos de Q1 2026 en TipRanks, no al próximo reporte. Finanzen.net no muestra estimación trimestral de ingresos para 30-sep-2026. Tratar €8,47B como STALE_OR_MISASSIGNED hasta fuente contemporánea verificable.

## Últimos datos reales verificables
RWE Q1 2026 oficial: adjusted EBITDA €1,6B; adjusted net income €0,6B; adjusted EPS €0,85; +25% YoY en adjusted EPS. Incluyó efecto positivo one-off de €332M en Flexible Generation.

RWE H1 2026 (preliminar oficial 28-jul, luego resultados finales publicados 13-ago): adjusted EBITDA €3.011M; adjusted net income €1.257M; adjusted EPS €1,77. RWE declaró que H1 superó expectativas de mercado.

Guidance FY2026 elevado: adjusted EBITDA €5,75–6,35B; adjusted net income €1,95–2,45B; adjusted EPS €2,60–3,30, midpoint €2,95. Dividend target €1,32/share.

## Data-quality finding
Los proveedores mezclan distintas definiciones de EPS. Ejemplo: RWE reportó adjusted EPS Q1 2026 de €0,85; Finanzen.net registra para Q1 un actual de €0,03 frente a €0,32 estimado, mientras TipRanks usa ~€0,85 actual frente a ~€0,52 estimado. Por tanto, nunca comparar automáticamente el consenso de €0,63 con el guidance de adjusted EPS de RWE sin reconciliar definición contable.

## ATLAS rule
Para 11-nov usar como benchmark principal: 9M adjusted EBITDA, adjusted net income, adjusted EPS, segment EBITDA, FCF/capex, net debt/leverage, Amprion contribution, Flexible Generation normalization, Offshore/Onshore execution, Supply & Trading y guidance FY26/FY27. Revenue y provider EPS sólo como secundarios hasta reconciliación.

Estado: AUDIT_COMPLETE; DATA_CONSENSUS_PARTIALLY_REJECTED.
