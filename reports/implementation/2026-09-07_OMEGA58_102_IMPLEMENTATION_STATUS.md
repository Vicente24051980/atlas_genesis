# ASTRA Ω58–Ω102 — IMPLEMENTATION STATUS

Date: 2026-09-07
Branch: `astra/omega58-102-forensics-governance`

## Executive verdict

The annex is accepted as a governance/test specification. It is **not** accepted as 45 new scoring engines. Controls are consolidated into a small executable layer to avoid authority duplication.

Existing Point Zero selector already rejects fixed-N caller authority, ignores personal portfolio state, removes unmeasured causal-diversification authority and explicitly labels itself a greedy heuristic rather than claiming global `OPTIMAL_N`.

## Implemented now

| Ω | Control | State |
|---|---|---|
| 58 | static repository execution/import evidence + file classification | IMPLEMENTED, runtime tracing still required for dynamic paths |
| 59 | evidence vocabulary for dead/ghost/version/orphan states | CONTRACTED; automatic proof requires runtime/coverage data |
| 60 | constants/silent-resurrection scanner | IMPLEMENTED |
| 61 | hidden-prior vocabulary; selector invariance tests already exist in canonical selector | IMPLEMENTED + EXISTING TESTS |
| 62 | executable narrative-term review scanner + zero-authority law | IMPLEMENTED / REVIEW GATE |
| 63 | versioned `SecuritySnapshot` data contract | IMPLEMENTED |
| 64–66 | AS_OF, publication-time and original-value/restatement primitives | IMPLEMENTED |
| 67–70 | corporate-action vocabulary, security identity, FX and freshness primitives | IMPLEMENTED |
| 71–72 | confidence propagation and uncertainty separation primitives | IMPLEMENTED; model-specific propagation remains calibration work |
| 73 | ER calibration | BLOCKED_BY_DATA: requires prospective/PIT forecast history and realized outcomes |
| 74 | scenario probability law | CONTRACTED: precise probabilities require empirical calibration |
| 75 | ER fundamental/capital-return/multiple bridge | IMPLEMENTED |
| 76–84 | owner earnings, allocation, quality decompositions | DATA-CONTRACT TARGETS; company-level computation remains BLOCKED_BY_DATA where normalized histories do not exist |
| 85 | incremental ROIC primitive | IMPLEMENTED |
| 86–88 | competition-for-capital law, dominance and Pareto frontier | IMPLEMENTED |
| 89 | Shapley contribution | SHADOW / NOT IMPLEMENTED until portfolio utility is stable and computational value is demonstrated |
| 90–92 | adversarial search/local optimum/seed stability | REQUIRED; current canonical selector correctly disclaims global optimality. Full solver comparison remains pending |
| 93–95 | cut classes, selection frequency contract, robust core | IMPLEMENTED primitives; frequencies require perturbation runner/data |
| 96 | sizing uncertainty | CONTRACTED; sizing remains separate from selection |
| 97–99 | after-cost utility, replacement firewall, materiality | IMPLEMENTED primitives; thresholds deliberately not hard-coded as universal canon |
| 100 | decision-ledger validator | IMPLEMENTED |
| 101 | explicit revision-record validator / no silent rewrites | IMPLEMENTED |
| 102 | prediction-registry validator with AS_OF <= prediction time | IMPLEMENTED |

## Files added

- `CURRENT_CANON/2026-09-07_OMEGA58_102_EXECUTION_CONTRACT.md`
- `scripts/omega_repository_forensics.py`
- `src/atlas/governance/omega-data-integrity.ts`
- `src/atlas/governance/omega-governance-core.ts`
- `src/atlas/governance/omega-governance-core.test.ts`
- `.github/workflows/omega-governance-ci.yml`

## Architectural decisions

1. **No new scoring authority.** The Ω governance layer validates evidence and decisions; it does not add arbitrary points to ATLAS.
2. **No false `OPTIMAL_N`.** Greedy/local search cannot publish global-optimum language.
3. **No arbitrary materiality threshold.** Thresholds are policy inputs and must be economically justified/calibrated before canonization.
4. **No Shapley theatre.** Shapley stays shadow until utility is stable enough for the computation to mean something.
5. **No backtest theatre.** Ω73, perturbation frequencies and any prediction-quality claims remain blocked until timestamped PIT records exist.
6. **Append-only governance.** Decisions, revisions and predictions must carry evidence/timestamps rather than silently rewriting history.

## Remaining P0/P1 work after merge

P0: build a real timestamped `SecuritySnapshot` ingestion path and migrate engines away from arbitrary input objects.

P0: bind `AS_OF_TIMESTAMP` at the canonical rebuild entrypoint and fail closed if any provider cannot prove publication availability.

P1: persist Decision/Revision/Prediction registries as append-only JSONL or database tables.

P1: add an adversarial portfolio solver harness (multiple seeds, 1↔1, 2↔2, add/remove and alternative baselines) before any global optimality claim.

P1: create ER calibration once enough prospective predictions have matured. Historical reconstruction using today's estimates is forbidden.

## Acceptance rule

Merge only if Omega Governance CI passes. A green CI proves the new primitives compile/test and repository-forensics executes; it does **not** by itself prove empirical alpha, global portfolio optimality, PIT completeness of all historical data, or predictive calibration.
