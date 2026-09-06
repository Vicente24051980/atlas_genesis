# TRADER INTELLIGENCE Ω — POINT-IN-TIME BACKTEST PROTOCOL

**Date:** 2026-09-06  
**Status:** PREREGISTERED / ACTIVE  
**Parent canon:** `CURRENT_CANON/TRADER_INTELLIGENCE_OMEGA.md`

## 1. Research question
Can publicly observable signals from historically successful traders add implementable information after publication latency, risk, factor, benchmark and regime controls?

The protocol is designed to reject both guru worship and reflexive inverse-guru trading.

## 2. Hypotheses
### Primary null
`H0`: after publication, trader identity/direction adds no persistent risk-adjusted alpha beyond controls.

### Alternatives
- `H1_FOLLOW`: same-direction replication adds persistent alpha.
- `H1_REVERSE`: opposite-direction replication adds persistent alpha.
- `H1_ATLAS_BLIND`: identity-blind ATLAS filtering adds more value than either mechanical follow or reverse.

No alternative is privileged ex ante.

## 3. Unit of observation
One **publicly observable trader-signal event**.

Required fields:
- `signal_id`
- `trader_id`
- `strategy_domain`
- `security_or_macro_object`
- `ticker_or_identifier`
- `instrument`
- `direction`
- `position_date`
- `publication_timestamp`
- `source_url`
- `source_grade`
- `shares_or_contracts`
- `reported_value`
- `reported_value_semantics`
- `strike`
- `expiry`
- `premium`
- `hedge_visibility`
- `denominator_state`
- `implementability_state`
- `domain_match`
- `notes`

Unknown fields remain `UNKNOWN`; they are never imputed from narrative.

## 4. Point-in-time rule
The backtest clock starts at the first timestamp at which an ordinary market participant could observe the signal.

For 13F:
`T0 = SEC acceptance/publication timestamp`, not quarter-end.

For newsletter/public post:
`T0 = first public publication timestamp`.

For interviews:
`T0 = public broadcast/publication time`, not recording date if earlier and non-public.

## 5. Event taxonomy
- `NEW_LONG`
- `ADD_LONG`
- `PERSIST_LONG`
- `TRIM_LONG`
- `EXIT_LONG`
- `NEW_SHORT`
- `ADD_SHORT`
- `COVER_SHORT`
- `PUT_BEARISH`
- `CALL_BULLISH`
- `MACRO_LONG`
- `MACRO_SHORT`
- `THESIS_ONLY`
- `AMBIGUOUS`

`AMBIGUOUS` and `THESIS_ONLY` may be studied narratively but cannot enter directional return tests unless a replicable rule is defined ex ante.

## 6. Three-portfolio design
For every eligible event build simultaneous synthetic observations:

### FOLLOW
Trade in the disclosed direction using an implementable proxy available at T0.

### REVERSE
Trade the opposite direction using the same proxy and timing conventions.

### ATLAS-BLIND
Strip trader identity and route the object through normal ATLAS evidence, economics, valuation, risk and falsifier gates. Record only the verdict available at T0.

No hindsight changes to ATLAS-BLIND are permitted.

## 7. Options gate
A filing that reports a put/call is not enough to reconstruct actual option P&L unless strike, expiry and premium are known.

Permitted variants:
1. `DIRECTIONAL_UNDERLYING_PROXY` — tests whether the directional thesis was informative.
2. `OPTION_PAYOFF` — only when option economics are fully reconstructible.

Never equate reported 13F option notional with premium or capital at risk.

## 8. Horizons
For ordinary public-equity signals:
- 1D
- 5D
- 1M
- 3M
- 6M
- 12M
- 24M when the thesis is explicitly slow/turnaround/value.

Primary inference horizons: **6M and 12M**.
Short windows are diagnostics, not proof of skill.

## 9. Benchmarks
At minimum:
- broad market benchmark;
- sector/industry benchmark when available;
- style/factor comparator when economically relevant.

For non-equity macro signals, use instrument-specific benchmarks and do not mix them mechanically with stock-picking results.

## 10. Metrics
- absolute return;
- benchmark excess return;
- sector/style excess return;
- volatility;
- maximum drawdown;
- MAE;
- MFE;
- hit rate;
- median event alpha;
- mean event alpha;
- downside deviation;
- information ratio / Sharpe only when data structure supports them;
- turnover and estimated trading costs.

## 11. Dependence controls
Events from the same trader/security that overlap in time are not independent observations.

Required treatment:
- cluster by trader;
- cluster by security where needed;
- flag overlapping holding windows;
- separate repeated reaffirmations from genuinely new information;
- do not count the same thesis twice because it appears in a filing, interview and article sourced from the same disclosure.

## 12. Regime controls
Tag each event with observable regime variables at T0, including where relevant:
- equity trend;
- rates direction;
- inflation direction;
- credit spreads;
- volatility regime;
- liquidity regime;
- recession/expansion state;
- commodity cycle;
- sector trend.

A trader may be T4 in one domain/regime and T2 elsewhere. Global skill labels are prohibited unless evidence supports them.

## 13. Bias controls
Mandatory:
- no look-ahead;
- no survivorship-only sample;
- include losing and abandoned theses where reconstructible;
- no cherry-picked famous trades;
- no retrospective threshold tuning;
- preserve delisted securities when possible;
- publication lag;
- transaction costs;
- multiple comparisons;
- source duplication controls;
- instrument mismatch controls.

## 14. Complete-cohort principle
Historical case studies are not validation. Each trader must be evaluated on the most complete reconstructible event cohort available for the selected period.

If the cohort is materially incomplete, state = `T1_SAMPLE_INCOMPLETE`.

## 15. Validation ladder
- `T0_UNTESTED`
- `T1_SAMPLE_INCOMPLETE`
- `T2_NO_POST_PUBLICATION_ALPHA`
- `T3_WEAK_OR_REGIME_DEPENDENT`
- `T4_PERSISTENT_OUT_OF_SAMPLE`
- `T5_REPLICATED`

Promotion to T4 requires:
- ex-ante event definition;
- point-in-time execution;
- sufficient sample;
- positive result after reasonable costs;
- benchmark/regime robustness;
- holdout/out-of-sample survival.

T5 additionally requires replication across an independent period, source set, or methodology implementation.

## 16. Trader cohort — initial
### Priority A
1. Jim Simons / Renaissance
2. Stanley Druckenmiller / Duquesne
3. Edward Thorp / Princeton-Newport
4. George Soros / Quantum
5. Paul Tudor Jones / Tudor
6. Louis Bacon / Moore
7. David Tepper / Appaloosa
8. Michael Burry / Scion + verified self-disclosures
9. Steven Cohen / SAC/Point72
10. Richard Dennis / Turtle methodology
11. Mark Minervini

### Priority B
12. Bruce Kovner
13. Bill Lipschutz
14. Michael Marcus
15. additional managers only after evidence-quality review.

## 17. Method extraction matrix
Each trader may contribute candidate rules, not authority.

| Trader | Candidate mechanism | Primary falsifier |
|---|---|---|
| Simons | many weak independent signals + systematic updating | edge disappears out of sample / after costs |
| Thorp | statistical edge + hedge + sizing | no positive expected value after realistic frictions |
| Soros | reflexive imbalance + regime break | thesis fails without price/liquidity feedback |
| Druckenmiller | macro liquidity + fundamentals + trend + concentration | concentrated conviction does not improve payoff asymmetry |
| Tudor Jones | trend/regime + capital preservation | stop/price discipline worsens risk-adjusted outcomes |
| Bacon | macro theme + rapid risk reduction | trading around thesis adds cost without drawdown benefit |
| Tepper | distressed survival + asymmetric normalization | balance-sheet survival does not translate to excess return |
| Burry | deep contrarian dislocation | cheapness/dissent fails after quality/solvency controls |
| Cohen | catalyst + rapid updating | speed/catalyst labels add no information after public news |
| Dennis | explicit trend rules | rules fail after costs/out of sample |
| Minervini | earnings/price leadership + loss containment | relative-strength/earnings screen fails after factor controls |

## 18. Research output
The project must eventually produce:
- event-level raw register;
- source provenance register;
- complete-cohort status by trader;
- FOLLOW vs REVERSE vs ATLAS-BLIND comparison;
- domain/regime breakdown;
- falsified rules list;
- surviving rules list;
- explicit `NO EDGE` findings where appropriate.

A negative result is a successful outcome of the protocol.
