# CONSPIRACIONES ATLAS Ω — ECONOMIST / PHOENIX / NARRATIVE SATURATION v1.0

Status: candidate canonical research motor
Frozen baseline: 2026-08-09
Out-of-sample case: The Economist, 2026-08-08, “The Global Currency Beef”
Scope: research/regime intelligence only. This motor never emits BUY/SELL.

## Mission

Test, rather than assume, whether monetary covers from The Economist behave as predictive signals, contrarian signals, narrative-saturation markers, or retrospective pattern-matching noise. The motor must separate FACT, INTERPRETATION, HYPOTHESIS and SPECULATION and must preserve the original hypothesis before later outcomes are known.

The primary historical research universe is every weekly Economist issue from 1986 through 2026, approximately 2,080 issues, not only famous covers selected after the fact.

## Competing hypotheses

1. PREDICTIVE ECONOMIST EFFECT — covers precede material continuation/regime changes.
2. CONTRARIAN COVER EFFECT — covers tend to appear after an extreme move and near a later reversal.
3. NARRATIVE SATURATION EFFECT — covers are best interpreted as sensors that a narrative has become systemic/consensus.
4. NULL / RETROSPECTIVE BIAS — apparent hits disappear when all covers, false positives and matched controls are included.

No hypothesis is canonical truth until it survives the complete dataset and matched-control test.

## Narrative Saturation Ω

Question: “How much of this has ALREADY happened before publication?”

Score 0–100, renormalized if independent positioning/crowding data is unavailable:
- prior-trend maturity: 25%
- extremeness: 20%
- narrative intensity: 15%
- institutional stress: 15%
- cross-asset confirmation: 15%
- crowding/positioning: 10% when independently measurable

Outcome classification is deliberately separated from the publication-time score:
- CONTRARIAN: high pre-cover saturation plus a strong later reversal.
- PREDICTIVE: strong later directional continuation plus material regime change.
- SATURATION: high pre-cover saturation/trend maturity without meeting predictive or contrarian thresholds.
- NULL: no sufficient effect.

A cover without a completed forward window remains PENDING_OUTCOME. No future data may enter a historical as-of assessment.

## Macro propagation chain

CURRENCY → COMMODITIES → INFLATION → RATES → MARGINS → EARNINGS → FLOWS → SECTORS.

The motor is connected analytically to MONEY ROTATION Ω and HISTORICAL DISLOCATION Ω, but it cannot create a trade decision by itself.

## Cross-asset regime map

- USD↑ + oil↓ → USD_STRENGTH_DISINFLATION.
- USD↓ + oil↑ + gold↑ → REFLATION_COMMODITY.
- USD↑ + gold↑ → SYSTEMIC_FEAR.
- USD↓ + gold↑ + UST yields↑ → RESERVE_ARCHITECTURE_STRESS.

The fourth regime has the highest monitoring significance because repeated episodes may indicate that investors are demanding a higher risk premium from US reserve assets rather than merely fleeing to them.

“Repeated” is not one observation. At least two independent observation periods must be established before activating the repeated-triad Phoenix signal.

## Phoenix 2026 — frozen prospective experiment

Case ID: ECONOMIST_GLOBAL_CURRENCY_BEEF_2026.
Cover date: 2026-08-08.
Baseline frozen: 2026-08-09.
Rule: no moving goalposts and no retrospective reinterpretation.

Signals and maximum regime-stress weights:
- repeated USD↓ + UST yields↑ + gold↑: 30
- USD reserve share persistently below 55% due to real reallocation, not valuation alone: 15
- RMB reserve share materially above the ~2% baseline: 10
- persistently elevated central-bank gold buying: 10
- formal BRICS common monetary unit/currency: 10
- major energy-contract migration away from USD: 10
- extraordinary SDR expansion: 5
- private/retail SDR use: 5
- transnational commercial monetary unit: 5

Context but not Phoenix confirmation:
- BRICS local-currency/payment-rail expansion alone. This is fragmentation/interoperability, not a common world currency.

Explicit exclusion:
- the 2026-08-12 eclipse, or the date alone, scores exactly zero. It was known in advance and is not monetary evidence. Social-media hashtags do not modify the frozen cover interpretation.

Only active FACT observations with at least one traceable evidence reference score. Interpretations, hypotheses, unsupported claims and duplicate observations cannot manufacture a higher score.

## Phoenix state machine

- NO_MATERIAL_BREAK
- FRAGMENTATION_ACCELERATING
- RESERVE_ARCHITECTURE_STRESS
- STRUCTURAL_MONETARY_BREAK

A score alone does not mean a literal “Phoenix” world currency exists. STRUCTURAL_MONETARY_BREAK requires a hard institutional signal such as private/retail SDR use, a transnational commercial monetary unit, or a sufficiently broad break that includes a formal BRICS unit plus other material signals.

## Evidence discipline

Primary sources dominate changes in conviction: IMF, BIS, central banks, US Treasury/Federal Reserve, ECB, PBoC, official BRICS communiqués, IEA/EIA for energy, and equivalent institutional primary sources.

Secondary reporting can discover or contextualize a claim but cannot by itself turn a speculative Phoenix signal into FACT.

Every record must preserve:
- event/publication/observation time;
- as-of cutoff;
- evidence references;
- epistemic class;
- whether it was known at the frozen baseline;
- whether it is independent or a duplicate of the same causal event.

## 1986–2026 dataset contract

For each weekly issue store at minimum:
1. exact issue date;
2. cover text;
3. image/symbol tags;
4. monetary-cover boolean;
5. USD;
6. gold;
7. oil;
8. 2Y/10Y yields;
9. credit;
10. inflation;
11. S&P / World / EM;
12. sector data;
13. institutional-crisis tags;
14. SDR tags;
15. euro tags;
16. China tags;
17. BRICS tags;
18. -12/-6/-3 month pre-cover returns;
19. +1/+3/+6/+12/+36 month post-cover returns;
20. prediction specificity;
21. false-positive flag;
22. blind-label frozen timestamp;
23. evidence class and references.

Historical labels must be frozen without looking at future outcomes. The treatment sample must be compared with matched non-monetary-cover weeks rather than only with selected famous covers.

## Event-study requirements

The complete study must report:
- treatment and matched-control outcomes;
- mean matched difference;
- predictive/contrarian/saturation/null rates;
- false-positive rate;
- sensitivity to publication-window definitions;
- sensitivity to alternative market variables;
- results with and without weak/secondary evidence;
- survivorship and selection-bias limitations.

If the effect disappears after controls, the null hypothesis wins. The engine must be able to destroy the conspiracy hypothesis rather than protect it.

## Anti-lookahead / anti-retrofit rules

- No metric observed after `asOf` may be used.
- Phoenix monitored signals cannot predate the frozen 2026-08-09 baseline.
- Duplicate signal IDs count once.
- FACT without traceable evidence does not score.
- INTERPRETATION/HYPOTHESIS/SPECULATION do not score as Phoenix confirmation.
- The eclipse cannot be promoted later into evidence.
- A later event may be linked to the cover only under the criteria frozen before that event.
- Lack of qualifying future signals is a valid negative result.

## Implementation

Mobile-first deterministic engine:
`mobile/domain/conspiracionesAtlasEconomist.ts`

Exports include:
- `narrativeSaturationScore()`
- `assessEconomistCover()`
- `classifyCrossAssetRegime()`
- `countReserveArchitectureStress()`
- `evaluatePhoenix2026()`
- `summarizeMatchedCoverStudy()`
- `conspiracionesAtlasEconomistContractCheck()`
- frozen `PHOENIX_2026_BASELINE` and signal weights

ATLAS integration:
- Evidence ingestion routes Economist/Phoenix/monetary-system evidence to CONSPIRACIONES_ATLAS, NARRATIVE_SATURATION_OMEGA and PHOENIX_2026_MONITOR_OMEGA where appropriate.
- MONEY_ROTATION_OMEGA and HISTORICAL_DISLOCATION_OMEGA remain the investment/macro-rotation consumers.
- No direct BUY/SELL path exists from this motor.
