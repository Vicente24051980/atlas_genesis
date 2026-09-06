# ATLAS Ω — Portfolio Reconciliation & Reproducibility Law

Date: 2026-09-06
Status: ACTIVE_CANONICAL / FAIL-CLOSED
Precedence: supersedes any ad-hoc portfolio list derived from FINAL23, 29-name reconstruction, 31-name test basket, or narrative seat-filling.

## Bug being fixed

ATLAS produced incompatible portfolio outputs from materially overlapping evidence because portfolio construction, experiment design and narrative challenger selection were allowed to drift between runs.

This is a reproducibility failure. It is not a legitimate plurality of portfolio answers.

## Constitutional separation

ATLAS must distinguish two modes:

1. `PORTFOLIO_MODE` — optimize MAX RETURN / LOW VOL with endogenous N and deterministic sizing.
2. `TEST_MODE` — evaluate a frozen basket under an experimental weighting rule such as equal weight.

`TEST_MODE` output MUST NOT overwrite, redefine, expand or shrink `PORTFOLIO_MODE` membership.

## Frozen reconciliation universe

The reconciliation universe is the union of the three incompatible outputs identified on 2026-09-06. It contains 41 unique tickers:

`000660.KS, 6501.T, 6861.T, 7011.T, 8035.T, ANET, APH, APP, ASML, AVGO, CEG, CLS, CME, CRDO, EHC, FIX, GEV, GLW, HWM, IBKR, ICE, ISRG, KLAC, LIN, LMB, MA, MCO, MELI, MU, NOW, NVDA, PWR, REGN, ROP, RRC, SPGI, TDG, TEVA, TSM, VEEV, VRTX`.

No ticker may be added or removed during a reconciliation run unless the snapshot version changes.

## Frozen decision path

`UNIVERSE -> ELIGIBILITY -> EXPECTED_RETURN -> RISK -> FRAGILITY -> SCENARIOS -> SET_UTILITY -> ENDOGENOUS_N -> SIZING`

Every candidate must use the same evidence cutoff, same normalization rules, same missing-data policy and same objective policy.

## Objective law

Portfolio membership is governed by whole-set utility under MAX RETURN / LOW VOL.

Risk policy remains:
- Permanent Loss: 40%
- Tail Risk: 20%
- Volatility: 40%

Diversification, sector, geography, style, market-cap bucket and visual balance have zero independent authority.

## Marginal decision outputs

Every run MUST emit, for every eligible ticker:

`DeltaAdd(t) = U(P + t) - U(P)`

and for every evaluated replacement:

`DeltaReplace(i -> j) = U(P - i + j) - U(P)`

The final report must include the complete marginal ranking, not only selected names.

## Endogenous N

N is not preselected. The engine evaluates the deterministic frontier and stops at the first material marginal-utility knee under the frozen policy.

No cardinality filling is allowed.

`NO_CARDINALITY_FILLING`: a ticker cannot be admitted merely to reach 25, 29, 31, 35 or any other target count.

## Determinism contract

For the same:
- snapshot ID,
- ticker universe,
- normalized candidate inputs,
- engine version,
- objective policy,
- sizing policy,

the system MUST produce the same:
- selected tickers,
- optimal N,
- marginal ranking,
- target weights.

Tie-break order is lexicographic ticker order after exact equality of numerical utility.

Any change in output with an unchanged snapshot is a BUG and must fail closed.

## Snapshot identity

Canonical reconciliation snapshot: `ATLAS-PORTFOLIO-RECON-2026-09-06-R1`.

The snapshot is not declared COMPLETE until all 41 names have normalized inputs from the same evidence cutoff. Until then, no resulting list may be labelled `ATLAS Ω MAX RETURN / LOW VOL FINAL`.

## Historical outputs

The following are demoted to research artifacts, not canonical portfolios:
- FINAL23 implementation candidate;
- 25-name FINAL23 + TEVA + RRC variant;
- 29-name reconstruction;
- 31-name equal-weight test baskets.

They remain useful as challenger provenance only.

## Final naming rule

Only an output generated from a COMPLETE frozen snapshot through this deterministic pipeline may be named:

`ATLAS Ω MAX RETURN / LOW VOL — CANONICAL PORTFOLIO`.
