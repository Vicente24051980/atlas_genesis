# ATLAS Ω — Structural Portfolio Blocker Ledger

Date: 2026-09-06
Status: ACTIVE_BLOCKER_LEDGER

No new structural portfolio may be labelled `ATLAS Ω MAX RETURN / LOW VOL — CANONICAL` while any blocking item below remains open.

## B0 — Current portfolio state

User-directed current state is recorded separately in:
`CURRENT_CANON/2026-09-06_CURRENT_PORTFOLIO_27_VRT.md`

It is operational state, not proof of optimizer output.

## B1 — Universe authority — CLOSED

Core: `ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06`.
Extension: `ATLAS_CORE_487_PLUS_VRT_ADMITTED_488_2026-09-06`.

Canonical publication resolves whitelist/count/hash internally. Caller-defined whitelist authority has been removed.

## B2 — External VRT admission — CLOSED FOR ELIGIBILITY / OPEN FOR COMPETITION

VRT is formally admitted into the 488 extension. Admission grants eligibility only.
It still must compete from Point Zero and can be removed by a future reproducible run.

## B3 — Historical hard-coded portfolio contamination — CLOSED

Known fixed-N31 research scripts are quarantined behind `ATLAS_ALLOW_LEGACY_FIXED_PORTFOLIO=1` and explicitly emit zero current portfolio authority. Constitutional guard CI prevents accidental removal of the quarantine.

## B4 — Complete homogeneous PIT matrix — OPEN / BLOCKING

Need one complete, same-schema, same-cutoff evidence row for every entity in the selected authority version:
- 487/487 for core; or
- 488/488 for core + VRT.

No partial candidate set may be presented as a whole-universe structural result.

## B5 — Risk-unit semantics — OPEN / BLOCKING

`PortfolioCandidateV2` currently combines Expected Return percentage points with several untyped numeric risk/fragility/convexity terms.

Authority:
`src/atlas/algorithm/structural-risk-unit-authority-omega.ts`

Status: `RESEARCH_PENDING` / `canonicalReady=false`.

Research protocol:
`research/portfolio/2026-09-06_STRUCTURAL_SIZING_RISK_UNIT_PREREG.md`

## B6 — Canonical covariance-aware sizing — OPEN / BLOCKING

No validated structural sizing engine/policy exists yet.

Authority:
`src/atlas/algorithm/structural-sizing-authority-omega.ts`

Status: `RESEARCH_PENDING` / `canonicalReady=false`.

A caller cannot self-certify by sending arbitrary weights labelled covariance-aware.

## B7 — Deterministic selection certification — READY AS GATE / OPEN FOR REAL SNAPSHOT

Publication gate supports order perturbation and default 100 reruns. The real 487/488 PIT matrix has not yet been passed through this certification.

Required output: identical selected names/N and portfolio hash for all reruns.

## B8 — Marginal ledger — READY AS CODE / OPEN FOR REAL SNAPSHOT

Publication gate emits `DeltaU_add` and best `DeltaU_swap` for eligible entities, but the real whole-universe ledger cannot exist until B4/B5 are closed.

## B9 — Global optimality — OPEN BY DESIGN

Current selector remains deterministic local search.

`globalOptimalityProven=false` is mandatory.

A result may eventually be labelled `DETERMINISTIC_LOCAL_OPTIMUM` / canonical implementation output after all gates, but not proven global combinatorial optimum unless a genuine global proof/solver is added.

## B10 — Current 27 versus future Point Zero — FIREWALLED

AXON, MELI, CRWD, LRCX, PWR, GEV, AVGO, PANW, SYK, MA, ANET, CDNS, ISRG, APH, HWM, VRT, TT, VRTX, BSX, INTU, TRGP, LLY, GE, ETN, ICE, V, BKNG have zero incumbency advantage in the rebuild.

The rebuild is allowed to reproduce all 27, none, or any subset if the evidence supports it.

## Publication rule

Canonical structural publication requires all of:

`VERSIONED_UNIVERSE_PASS`
+ `COMPLETE_PIT_MATRIX_PASS`
+ `RISK_UNIT_AUTHORITY_PASS`
+ `HARD_GATES/FALSIFIERS_PASS`
+ `DETERMINISTIC_SELECTION_PASS`
+ `MARGINAL_LEDGER_COMPLETE`
+ `VALIDATED_SIZING_AUTHORITY_PASS`
+ `100_RERUN_REPRODUCIBILITY_PASS`

Otherwise: **BLOCK, DO NOT NARRATE A PORTFOLIO INTO EXISTENCE.**
