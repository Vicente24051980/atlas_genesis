# ATLAS Ω — AI DATA CENTER RISK TRANSFER Ω — T5 HANDOFF AMENDMENT

**Effective date:** 2026-09-12  
**Status:** ACTIVE / PRECEDENCE AMENDMENT  
**Applies to:** `CURRENT_CANON/AI_DATA_CENTER_RISK_TRANSFER_OMEGA.md`  
**Reason:** eliminate any semantic route that could bypass the pre-existing `T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1` contract.

## Supersession

Any older wording in the parent document that states or implies:

`DCRT C3/C4 → direct E2 / FRU-MATH handoff`

is superseded by:

`DCRT C3/C4 → existing T5 Capital Risk Transfer Advantage Ω → standard ATLAS assessment stack → FRU-MATH`

## Ownership

- DCRT owns data-centre risk-transfer market evidence, company attribution proof and fragility diagnostics.
- T5 remains the sole owner of `CRTA = FCF captured / own capital at risk`.
- A zero or invalid capital-at-risk denominator remains `NO_CALCULABLE`, never infinity.
- DCRT market-opportunity and company-capture scores have **0% direct weight** in Fundamental Score and FRU-MATH.
- T5 cannot be invoked from `C0`, `C1` or `C2` under the default DCRT path. Default authorization requires traceable `C3/E3` or `C4/E4` company economics.
- No DCRT output has BUY/SELL, sizing, timing or execution authority.

## Implemented code path

- `src/atlas/algorithm/ai-data-center-risk-transfer-omega.ts` emits `HANDOFF_TO_T5` at C3/C4.
- `src/atlas/algorithm/ai-data-center-risk-transfer-t5-adapter.ts` invokes the existing T5 CRTA function only after the authorization conditions are met.
- Unit-test specifications assert both the handoff and the zero-denominator `NO_CALCULABLE` law.

## Final law

**No data-centre insurance/reinsurance/ILS discovery signal may jump from thematic or attributable evidence directly into FRU-MATH. T5 is the mandatory capital-risk-transfer bridge once C3/C4 economics exist.**
