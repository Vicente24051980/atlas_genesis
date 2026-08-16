# ATLAS Ω ENTERPRISE — Auditoría correctiva del informe diario

Fecha auditada: 16-ago-2026 18:00 UTC
Fecha de reconciliación: 17-ago-2026
Estado: CORRECTED / DO NOT EXECUTE ORIGINAL AMZN RED ALERT

## Veredicto ejecutivo
El informe original contiene varios hechos correctos, pero mezcla categorías contables y genera falsos positivos operativos.

### AMZN
- Q2 2026 net sales: $200.6B (+20% YoY).
- Operating income: $27.5B (+43% YoY).
- AWS sales: $42.2B (+37% YoY).
- AWS operating income: $16.6B vs $10.2B.
- Net income includes $53.4B of **non-operating pre-tax other income**, primarily from Anthropic investments.
- Ese $53.4B **no es revenue** y no deteriora la calidad de los $200.6B de ventas. Es una ganancia no operativa que infla GAAP net income y debe normalizarse al analizar EPS/beneficio neto.
- Q3 guidance oficial: net sales $197–202B (+9–12% YoY; ~+13–16% ex-Prime-Day comparable) y operating income $22.5–26.5B vs $17.4B en Q3 2025.
- No se encontró evidencia primaria de una “revisión silenciosa” de guía.
- Señal real a vigilar: TTM FCF -$7.6B por el aumento de $66.1B en compras de PP&E netas, principalmente AI capex.

**Estado corregido: AMZN = AMBER / AI_CAPEX_PAYBACK_WATCH; NO RED ALERT; NO reducción táctica automática.**

### MSFT
- Q4 FY26 revenue $90.0B (+18%), operating income $40.6B (+18%), net income $35.8B (+31%), diluted EPS $4.81 (+32%).
- More Personal Computing revenue $12.854B (-4% YoY) es correcto.
- MPC operating income $2.748B vs $3.190B YoY.
- MPC operating margin aproximado: 21.38% en Q4 FY26 vs 27.84% en Q3 FY26: caída ~646 bps QoQ.
- Por tanto, el umbral original de “>100 bps QoQ = red alert” ya se habría activado mecánicamente. Ese umbral es defectuoso porque no normaliza estacionalidad, mix ni cargos discretos.
- Microsoft indicó además que, ajustando elementos discretos, superó expectativas en revenue, operating income y EPS; Azure +43% y Microsoft Cloud +27%.

**Estado corregido: MSFT = GREEN/AMBER LOCALIZED; vigilar MPC, pero no usarlo como falsificador de la tesis global.**

### META
- Q2 2026 revenue $60.801B (+28%).
- Operating income $18.775B (-8%); operating margin 31% vs 43%.
- FCF $784M.
- Incluye $2.4B de cargos por procesos legales y $1.18B de severance.
- Tax rate outlook para los trimestres restantes sube de 13–16% a 15–17%.
- Meta mantiene riesgo legal/regulatorio y reconoce que varios asuntos podrían resultar en pérdida material.

**Estado corregido: META = AMBER HIGH; el riesgo es más serio de lo que reflejaba el informe original, pero debe separar cargos legales, capex y core ad economics.**

### GOOG
- Q2 2026 revenue $119.8B (+24%).
- Google Cloud $24.8B (+82%).
- Operating income $40.77B (+30%), margin 34% vs 32%.
- Other income $98.0B, principalmente unrealized gains on equity securities.

**Estado: GREEN fundamental, pero normalizar otras ganancias al analizar EPS/NI igual que con AMZN.**

### NVDA / fuentes
- El informe afirma “solo fuentes primarias” pero usa Fintel, StatMuse y MarketChameleon para short interest / put-call. No son fuentes primarias.
- Esos datos no deben elevarse a señal ATLAS sin FINRA/CBOE u otra fuente primaria directamente verificable.

### Catalizadores 17–23 ago
Las entradas “posible revisión de guías” para AMZN, “actualización MPC” para MSFT y “siguientes resultados Cloud AI” para GOOG no son catalizadores corporativos programados identificados en fuentes primarias. Deben eliminarse salvo evento IR/SEC confirmado.

## Reglas corregidas
1. Non-operating income ≠ revenue.
2. Unrealized investment gains/losses se normalizan al medir calidad operativa; no son por sí solos deterioro de revenue quality.
3. Una alerta roja exige >=2 señales **independientes y válidas**, no dos etiquetas derivadas del mismo error de clasificación.
4. Guidance drift debe probarse contra guidance anterior explícito; lenguaje estándar de riesgos no cuenta como revisión silenciosa.
5. Falsificadores de segmento no pueden extrapolarse al grupo sin materialidad y normalización por mix/seasonality/one-offs.
6. “Fuente primaria” significa SEC/IR/FINRA/CBOE directo; agregadores no cuentan como primarios.
7. Catalyst debe tener fecha/evento confirmado; “posible actualización” no es catalizador.

## Estado final de vigilancia
- AMZN: AMBER — AI capex / FCF payback watch. Red alert original invalidada.
- MSFT: GREEN/AMBER LOCALIZED — MPC débil, cloud/AI dominante y fuerte.
- META: AMBER HIGH — legal + margin compression + FCF compression + capex.
- GOOG: GREEN fundamental; normalizar unrealized gains al analizar NI/EPS.
- NVDA: tesis fundamental no alterada por los datos secundarios de short/put-call; señal de positioning = UNVERIFIED hasta fuente primaria.

## Fuentes primarias
SEC Amazon Q2 2026 EX-99.1; SEC Microsoft Q4 FY26 EX-99.1; Alphabet Q2 2026 EX-99.1; Meta Investor Relations Q2 2026.
