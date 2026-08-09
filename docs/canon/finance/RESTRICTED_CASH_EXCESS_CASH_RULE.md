# Canonical Rule — Restricted Cash and ExcessCash

**Status:** CURRENT / CANONICAL  
**Date:** 2026-08-09  
**Scope:** deterministic, audit-safe treatment of cash, restricted cash, ExcessCash and ROIC variant selection.

## 1. Base fields before calculating ExcessCash

Define two aggregates.

### 1.1 CashAvailable

If separate lines exist:

`CashAvailable = Cash & cash equivalents + Short-term investments`

If only a combined line exists:

`CashAvailable = Cash & short-term investments`

Provenance:

- `DIRECT` if sourced from an explicit reported line.
- `DERIVED` if calculated as the sum of two `DIRECT` lines.

### 1.2 RestrictedCash

`RestrictedCash` is `DIRECT` only if explicitly quantified in a reported line or note, including labels such as:

- Restricted cash
- Restricted cash equivalents
- Restricted deposits
- Equivalent note disclosure that quantifies the amount

If no quantified line/note exists:

`RestrictedCash = MISSING`

Never infer restricted cash from percentages, narrative assumptions or industry heuristics.

## 2. Exclusion rule before ExcessCash

Conceptually:

`UnrestrictedCash = CashAvailable - RestrictedCash`

Deterministic implementation:

- If `RestrictedCash` is `DIRECT` or `DERIVED`, calculate the subtraction.
- If `RestrictedCash = MISSING`, set `UnrestrictedCash = CashAvailable` and persist that no restricted-cash adjustment was made.
- Never assume an arbitrary percentage of cash is restricted.

Provenance for `UnrestrictedCash`:

- `DERIVED` when an explicit restricted-cash adjustment is performed.
- `DERIVED` from `CashAvailable` with an explicit `NO_RESTRICTED_CASH_ADJUSTMENT_AVAILABLE` treatment marker when `RestrictedCash = MISSING`.

## 3. ExcessCash calculation

`ExcessCash = max(0, UnrestrictedCash - OperatingCashMinimum)`

Eligibility gate:

- If `OperatingCashMinimum` is `DIRECT` or `DERIVED`, calculate `ExcessCash`.
- If `OperatingCashMinimum = MISSING`, then `ExcessCash = MISSING`.

No heuristic operating-cash minimum may be invented merely to enable adjusted ROIC.

## 4. ROIC variant selection

Allowed variants:

- `FINANCED_CAPITAL`
- `ADJUSTED_CAPITAL`

`ADJUSTED_CAPITAL` is eligible only when all required adjustment inputs are available under the canonical provenance rules, including a valid `OperatingCashMinimum` and therefore a computable `ExcessCash`.

If `OperatingCashMinimum = MISSING`:

- `ExcessCash = MISSING`
- select `FINANCED_CAPITAL`

## 5. Persistence / audit trail per period

Persist at minimum:

- `cashAvailable`
  - `value`
  - `provenance`
  - `inputs`
- `restrictedCash`
  - `value`
  - `provenance`
  - `sourceNoteRef` when available
- `unrestrictedCash`
  - `value`
  - `provenance`
  - `inputs`
  - `adjustmentReason`
- `operatingCashMinimum`
  - `value`
  - `provenance`
- `excessCash`
  - `value`
  - `provenance`
- `roicVariantSelected`
  - `FINANCED_CAPITAL | ADJUSTED_CAPITAL`
- `selectionReason`

## 6. Enum design — canonical recommendation

Do **not** overload `selectionReason` with cash-base transformation details. For audit safety, use two distinct enums:

### 6.1 `selectionReason`

Explains **why the ROIC variant was selected**.

Recommended values:

- `ADJUSTED_CAPITAL_ELIGIBLE`
- `OPERATING_CASH_MINIMUM_MISSING`
- `EXCESS_CASH_MISSING`
- `REQUIRED_ADJUSTMENT_INPUT_MISSING`
- `FINANCED_CAPITAL_FORCED_BY_POLICY`

### 6.2 `cashAdjustmentReason`

Explains **how CashAvailable became UnrestrictedCash**.

Recommended values:

- `RESTRICTED_CASH_SUBTRACTED`
- `RESTRICTED_CASH_ZERO_DIRECT`
- `RESTRICTED_CASH_MISSING_NO_ADJUSTMENT`
- `NO_RESTRICTED_CASH_COMPONENT_PRESENT`

This separation keeps the engine deterministic and prevents one enum from mixing two different causal layers.

## 7. Deterministic decision tree

```text
CashAvailable resolved?
  NO  -> downstream cash adjustments MISSING
  YES -> RestrictedCash quantified?
           YES -> UnrestrictedCash = CashAvailable - RestrictedCash
                  cashAdjustmentReason = RESTRICTED_CASH_SUBTRACTED
           NO  -> UnrestrictedCash = CashAvailable
                  cashAdjustmentReason = RESTRICTED_CASH_MISSING_NO_ADJUSTMENT

OperatingCashMinimum resolved?
  NO  -> ExcessCash = MISSING
         roicVariantSelected = FINANCED_CAPITAL
         selectionReason = OPERATING_CASH_MINIMUM_MISSING
  YES -> ExcessCash = max(0, UnrestrictedCash - OperatingCashMinimum)
         if all adjusted-capital inputs valid:
             roicVariantSelected = ADJUSTED_CAPITAL
             selectionReason = ADJUSTED_CAPITAL_ELIGIBLE
         else:
             roicVariantSelected = FINANCED_CAPITAL
             selectionReason = REQUIRED_ADJUSTMENT_INPUT_MISSING
```

## 8. Coca-Cola implication from the working example

If Coca-Cola has `Cash & short-term investments` as a `DIRECT` input but no quantified `OperatingCashMinimum` with `DIRECT` or `DERIVED` provenance:

- `CashAvailable` can be resolved.
- `RestrictedCash` is treated according to explicit disclosure only; if not quantified, it remains `MISSING` and no arbitrary deduction is made.
- `UnrestrictedCash = CashAvailable` with an explicit no-adjustment audit marker.
- `OperatingCashMinimum = MISSING`.
- `ExcessCash = MISSING`.
- `roicVariantSelected = FINANCED_CAPITAL`.
- `selectionReason = OPERATING_CASH_MINIMUM_MISSING`.

This is the required audit-safe behavior.

## 9. Non-inference law

The engine must never invent:

- a restricted-cash percentage;
- an operating-cash minimum;
- an excess-cash value;
- an adjusted-capital ROIC merely because the financed-capital variant appears economically less informative.

Missing data remains missing until supported by `DIRECT` or valid `DERIVED` evidence.
