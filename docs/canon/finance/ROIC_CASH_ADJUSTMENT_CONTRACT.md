# ROIC Cash Adjustment Contract Ω

**Status:** CURRENT / CANONICAL  
**Date:** 2026-08-09  
**Depends on:** `RESTRICTED_CASH_EXCESS_CASH_RULE.md`

This contract turns the restricted-cash / ExcessCash rule into an implementation-ready deterministic interface.

## Canonical enums

```ts
export type Provenance = "DIRECT" | "DERIVED" | "MISSING";

export type RoicVariantSelected =
  | "FINANCED_CAPITAL"
  | "ADJUSTED_CAPITAL";

export type RoicSelectionReason =
  | "ADJUSTED_CAPITAL_ELIGIBLE"
  | "OPERATING_CASH_MINIMUM_MISSING"
  | "EXCESS_CASH_MISSING"
  | "REQUIRED_ADJUSTMENT_INPUT_MISSING"
  | "FINANCED_CAPITAL_FORCED_BY_POLICY";

export type CashAdjustmentReason =
  | "RESTRICTED_CASH_SUBTRACTED"
  | "RESTRICTED_CASH_ZERO_DIRECT"
  | "RESTRICTED_CASH_MISSING_NO_ADJUSTMENT"
  | "NO_RESTRICTED_CASH_COMPONENT_PRESENT";
```

## Canonical persisted shape per period

```ts
export interface SourcedAmount {
  value: number | null;
  provenance: Provenance;
  inputs?: string[];
  sourceNoteRef?: string | null;
}

export interface CashAdjustmentAuditRecord {
  period: string;

  cashAvailable: SourcedAmount;
  restrictedCash: SourcedAmount;
  unrestrictedCash: SourcedAmount & {
    cashAdjustmentReason: CashAdjustmentReason;
  };
  operatingCashMinimum: SourcedAmount;
  excessCash: SourcedAmount;

  roicVariantSelected: RoicVariantSelected;
  selectionReason: RoicSelectionReason;
}
```

## Deterministic resolution

### CashAvailable

If separate direct lines exist:

```text
CashAvailable = CashAndCashEquivalents + ShortTermInvestments
provenance = DERIVED
```

If a combined reported line exists:

```text
CashAvailable = CashAndShortTermInvestments
provenance = DIRECT
```

Otherwise:

```text
CashAvailable = MISSING
```

### RestrictedCash

Only accept a quantified explicit disclosure such as restricted cash, restricted cash equivalents, restricted deposits, or an equivalent quantified note.

No quantified disclosure:

```text
RestrictedCash.provenance = MISSING
RestrictedCash.value = null
```

Never impute a percentage.

### UnrestrictedCash

If RestrictedCash is DIRECT or DERIVED:

```text
UnrestrictedCash = CashAvailable - RestrictedCash
cashAdjustmentReason = RESTRICTED_CASH_SUBTRACTED
```

If RestrictedCash is explicitly zero:

```text
UnrestrictedCash = CashAvailable
cashAdjustmentReason = RESTRICTED_CASH_ZERO_DIRECT
```

If RestrictedCash is MISSING:

```text
UnrestrictedCash = CashAvailable
cashAdjustmentReason = RESTRICTED_CASH_MISSING_NO_ADJUSTMENT
```

Important: `MISSING` does not become zero. The value flow may equal CashAvailable, but the audit trail must state that no restricted-cash adjustment was available.

### ExcessCash

Only compute when OperatingCashMinimum is DIRECT or valid DERIVED:

```text
ExcessCash = max(0, UnrestrictedCash - OperatingCashMinimum)
```

If OperatingCashMinimum is MISSING:

```text
ExcessCash.value = null
ExcessCash.provenance = MISSING
```

### ROIC variant selection

```text
if OperatingCashMinimum == MISSING:
    roicVariantSelected = FINANCED_CAPITAL
    selectionReason = OPERATING_CASH_MINIMUM_MISSING

else if ExcessCash == MISSING:
    roicVariantSelected = FINANCED_CAPITAL
    selectionReason = EXCESS_CASH_MISSING

else if any other adjusted-capital required input is missing:
    roicVariantSelected = FINANCED_CAPITAL
    selectionReason = REQUIRED_ADJUSTMENT_INPUT_MISSING

else:
    roicVariantSelected = ADJUSTED_CAPITAL
    selectionReason = ADJUSTED_CAPITAL_ELIGIBLE
```

`cashAdjustmentReason` must never be used as the reason for ROIC variant selection. The two enums describe different causal layers.

## Audit invariants

1. `RestrictedCash = MISSING` is not equivalent to `RestrictedCash = 0`.
2. No heuristic restricted-cash percentage is allowed.
3. No heuristic OperatingCashMinimum is allowed merely to unlock adjusted ROIC.
4. `ExcessCash` cannot be calculated when OperatingCashMinimum is MISSING.
5. `ADJUSTED_CAPITAL` cannot be selected unless every required adjusted-capital input is eligible under provenance rules.
6. Every period must persist both `cashAdjustmentReason` and `selectionReason`.
7. Values and provenance must be independently auditable back to reported lines/notes or explicit derivations.

## Coca-Cola working implication

If KO has a DIRECT `Cash & short-term investments` line but no quantified eligible OperatingCashMinimum:

```text
cashAvailable = DIRECT
restrictedCash = DIRECT/DERIVED only if explicitly quantified; otherwise MISSING
unrestrictedCash = cashAvailable minus restrictedCash when available; otherwise cashAvailable with audit marker
operatingCashMinimum = MISSING
excessCash = MISSING
roicVariantSelected = FINANCED_CAPITAL
selectionReason = OPERATING_CASH_MINIMUM_MISSING
```

This behavior is canonical and deterministic.
