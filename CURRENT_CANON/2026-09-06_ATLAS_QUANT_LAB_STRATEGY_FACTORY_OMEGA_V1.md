# ATLAS Ω — QUANT LAB / STRATEGY FACTORY Ω v1.1

**Status:** FROZEN · SPECIFICATION / RESEARCH ONLY · NOT EMPIRICALLY VALIDATED  
**Effective:** 2026-09-06  
**Supersedes:** v1.0 ordering and promotion semantics  
**Structural ATLAS score weight:** 0  
**Broker execution authority:** NONE  
**Current promotion authority:** NONE until freeze-release conditions pass

## Correction record

v1.0 overstated implementation maturity. The repository contains a candidate evaluator and governance specification, but **not yet an end-to-end mass generator + backtester capable of producing and testing a complete strategy population**. Therefore Strategy Factory is not currently an empirically validated factory.

No candidate may be called `PORTFOLIO_ELIGIBLE`, `SHADOW_ELIGIBLE`, or operationally useful merely because it passes candidate-level metrics. The TypeScript evaluator is diagnostic only while this freeze is active.

## Mission

Quant Lab remains orthogonal to Structural ATLAS:

- **Stock Selection Ω:** what business deserves ownership?
- **Quant Lab Ω:** whether a predeclared timing/regime rule has incremental net value.
- **Portfolio Ω:** how much capital to allocate.
- **Execution Ω:** how to execute an already-authorized decision.

Technical evidence never creates fundamental quality.

## Stage 0 — mandatory before strategy search

### 0A. Economic Mechanism Prior Ω

No mechanism, no search. Every strategy family must be preregistered before candidate generation with:

- `MECHANISM`: e.g. risk premium, behavioral under/overreaction, liquidity provision, structural flow, rebalance friction;
- `COUNTERPARTY_OR_SOURCE`: who/what economically supplies the edge;
- `EXPECTED_REGIME`;
- `EXPECTED_DECAY`;
- `FALSIFIER`;
- `PREREGISTRATION_TIMESTAMP`;
- permitted observables and rule grammar.

A family consisting only of arbitrary indicator combinations has insufficient prior probability and cannot enter the search population.

### 0B. Friction Viability Ω

Before building a serious grammar, pin the actual instrument/broker cost model. Required inputs:

- round-trip spread;
- commissions/fees;
- slippage assumption;
- expected round trips/year;
- overnight financing rate and expected financed days;
- borrow/other costs where applicable;
- capital and leverage assumptions.

Minimum calculation:

`C_ann = round_trips_per_year × round_trip_execution_cost + financed_days × financing_cost_per_day + other_costs`

`gross_alpha_break_even = C_ann`

Approximate break-even gross Sharpe, under a declared annualized volatility assumption:

`Sharpe_gross_BE ≈ C_ann / sigma_ann`

For the proposed retail Nasdaq CFD use case, the numeric result is currently **NOT_COMPUTED** because the exact broker/instrument spread and overnight-financing inputs have not been pinned in the research record. ATLAS must not invent them. If realistic friction makes the required gross edge implausible, the project stops here.

### 0C. Search-Family Preregistration Ω

Before outcomes are inspected, freeze:

- family definition and economic mechanism;
- grammar version;
- parameter ranges;
- objective function;
- train/validation/OOS dates;
- benchmark;
- cost model;
- total intended search budget;
- random/evolutionary seeds where applicable;
- null-control protocol.

Adaptive redesign after seeing results creates a new experiment family and must remain in the multiplicity ledger.

## Correct statistical order

The former v1.0 cascade placed the Multiple-Testing Firewall after repeated survivor filtering. That ordering is superseded.

Canonical research flow is now:

`Economic Prior -> Friction Stage 0 -> Family Preregistration -> Strategy Grammar -> Complete Candidate Generation -> Complete Candidate Ledger -> Null Calibration on identical pipeline -> Full-Family Multiple-Testing / Data-Snooping Diagnostics -> Candidate-Level Integrity/Temporal/Robustness Tests -> Sealed OOS -> Portfolio Utility -> Paper -> Prospective Shadow -> Governance`

The multiplicity universe cannot silently shrink from all tried hypotheses to the final survivors.

## Full-family multiplicity law

White's Reality Check and Hansen SPA, when used, must be applied with the relevant **complete preregistered strategy family/search population** represented, not only the finalists surviving prior filters on the same data.

Benjamini-Hochberg/FDR accounting likewise belongs to the declared family/search scope. Survivor-only adjusted p-values do not certify control of the search process.

### Deflated Sharpe Ratio

DSR may be reported only when the effective number/distribution of trials is defensibly estimated and the method plus assumptions are recorded. Highly correlated parameter variants do not make the raw candidate count an independent-trial count.

If adaptive grammar decisions or correlation structure make effective trials non-identifiable, use:

`DSR = NOT_COMPUTED`

A missing/undefendable DSR cannot be converted into certification.

## Null-Arm Calibration Ω

Before any strategy family can earn promotion authority, the **same frozen pipeline** must be run on controls:

1. `PERMUTED_RETURNS` — destroys temporal signal.
2. `BLOCK_BOOTSTRAP_RETURNS` — preserves local dependence/volatility clustering according to a preregistered block procedure.
3. `CALIBRATED_GBM` — synthetic geometric Brownian motion calibrated to declared Nasdaq moments.

For real data and every null family, record:

- total generated candidates;
- survivor count at every stage;
- best and distributional performance statistics;
- family-wide Reality Check/SPA/FDR diagnostics where applicable;
- sealed-OOS survivor count;
- final survivor count.

Primary falsifier:

If the real-data pipeline does not materially discriminate itself from the null survivor distribution, mark `FAIL_NULL_DISCRIMINATION` and halt the strategy family.

A sophisticated pipeline that produces similar survivors on noise is a noise detector.

## Candidate-level validation after family calibration

Only after the family-level requirements above are satisfied may individual candidates proceed through:

`Data Integrity -> Costed Backtest -> Purged/Embargoed Temporal Validation -> Walk Forward -> Monte Carlo/Path Stress -> Parameter Stability -> Regime Stress -> Sealed OOS -> Portfolio Redundancy/Utility -> Paper -> Live Shadow`

### Parameter Stability Ω

Prefer broad performance plateaus to sharp optima. Record neighborhood definition, neighbor count, pass rate, median performance and center-to-neighborhood degradation. Isolated optima remain `REJECT_PARAMETER_SPIKE`.

### Sealed OOS

A sealed holdout is opened once per frozen candidate version. Any tuning after inspection creates a new version and the old holdout is no longer unseen.

## Overlay contract — exact current authority

Until incremental-return validation exists, **the overlay has no portfolio or execution authority**.

The first permitted research lever, once unfrozen, is deliberately narrow:

`ENTRY_TIMING_ONLY`

It may compare execution timing **only for a structural BUY/add that has already been independently approved**. It may not:

- create a BUY;
- cancel or force a structural SELL;
- change the structural target weight;
- change company score;
- send a broker order.

The entry window and maximum delay must be preregistered per experiment; no live numeric delay is canonized yet. The overlay must be benchmarked against `FIRST_ADMISSIBLE_EXECUTION` and judged on **incremental net return after costs**, drawdown and missed-opportunity cost. If it adds no robust OOS value, it is removed rather than retained as a dashboard.

No sizing band is authorized in v1.1.

## Current implementation state

Implemented:

- deterministic candidate evaluator;
- local failure diagnostics;
- explicit structural weight = 0;
- explicit broker authority = none;
- global empirical-calibration freeze;
- test suite encoding the freeze.

Not implemented / not executed:

- end-to-end strategy generator/backtester;
- complete search ledger;
- economic-mechanism contract enforcement;
- numeric retail-CFD friction viability;
- three-arm null calibration;
- valid full-family data-snooping correction;
- prospective live-shadow evidence.

Therefore the correct current empirical result is:

`STRATEGY_FACTORY_NULL_ARM = NOT_RUNNABLE`

This is a failed precondition, not evidence for or against the strategy concept.

## Freeze-release conditions

No grammar expansion, new strategy family, sizing authority or promotion work until all are true:

1. one fixed, mechanism-backed strategy family is preregistered;
2. actual broker/instrument friction Stage 0 is pinned and passes viability;
3. an end-to-end generator/backtester produces a complete reproducible ledger;
4. the exact pipeline runs on real + permuted + block-bootstrap + GBM controls;
5. real-data discrimination from null is reported before tuning;
6. full-family multiplicity/data-snooping diagnostics are correctly scoped;
7. focused CI executes and is green;
8. only then may sealed OOS/paper/shadow begin.

## Clean-room boundary

Public methodology and lawfully supplied strategy files may be studied. Proprietary source code is not copied, access controls are not bypassed and opaque binaries are not decompiled. `OBSERVED / INFERRED / RECONSTRUCTED` remains the required evidence separation.

## Priority freeze

ATLAS is under a construction freeze for this line of work. The next valuable output is not another framework. It is falsification evidence: first the Quant Lab preconditions/null arm when runnable, and separately the already-preregistered Elite Capital/Lingotto post-publication return experiment.
