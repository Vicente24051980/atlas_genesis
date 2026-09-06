# CROSS-SIGNAL CONVERGENCE Ω — Preregistration v0.1

**Date:** 2026-09-06  
**Parent:** PUBLIC CAPITAL SIGNALS Ω  
**State:** `A0_UNTESTED`  
**Returns access:** `LOCKED`

## Purpose
Test whether two or more already-public capital signals contain **incremental** information when they converge on the same issuer.

Convergence is not a score and not a vote count. A combination can graduate only if it outperforms its strongest component **after** controlling for timing, shared causes and overlapping observations.

## Core law
`MULTIPLE OBSERVATIONS != MULTIPLE INDEPENDENT SIGNALS`

The unit of evidence is an independent public information channel, not the number of filings, rows, actors, transactions or labels.

## Public-time law
For a component set C:

`CONVERGENCE_T0 = max(PUBLICATION_TIMESTAMP_i for i in C)`

The convergence event does not exist before the last required component is public.

Every component-only comparator must be re-anchored to the same `CONVERGENCE_T0`. No return earned before the final component became public may be attributed to convergence.

If `CONVERGENCE_T0` occurs after regular-session close, executable t0 is the next regular-session open.

## Component families initially eligible
Only components with their own frozen event definitions may enter:

- `S1_INSIDER_PURCHASE`
- `S2_ACTIVIST_13D`
- `S3_CAPITAL_ALLOCATION_EXECUTION`
- `S4_ALLOCATOR_OWNERSHIP`
- `S5_INDEPENDENT_CONSENSUS`
- `S6_POSITION_ESCALATION_PERSISTENCE`

A family does not need validated alpha to be studied descriptively, but no convergence claim can graduate above the weakest required data-integrity state. Persistent research priority requires component and convergence validation.

## Independence taxonomy
Each candidate pair/set receives one of these states before returns are opened:

### `I0_DUPLICATE`
Same underlying observation expressed more than once. Counts as one signal.
Examples:
- buyback dollars + net share shrinkage from the same repurchase program;
- 13F NEW + top-10 visible weight caused by the same disclosed position;
- original filing + amendment that merely corrects/classifies the same exposure;
- multiple transactions by the same insider split across rows/orders.

### `I1_COMMON_CAUSE_LIKELY`
Distinct observations but evidence suggests one may arise from privileged knowledge of the other event or from the same causal process. Not treated as independent confirmation in the base test.
Examples:
- insider purchases before a later activist 13D when the insider could have known of activist attention;
- board settlement/outcome following the same 13D campaign;
- multiple affiliated managers reporting the same centralized investment decision.

### `I2_DEPENDENCE_UNKNOWN`
Different actors/channels, but shared information cannot be ruled out. Included only in a sensitivity stratum, never the clean base stratum.

### `I3_DISTINCT_PUBLIC_CHANNELS`
Different decision-makers and economic channels with no identified direct information link. Eligible for the base convergence test.
Examples to test, not assume positive:
- public insider open-market purchase + subsequently disclosed issuer net share shrinkage;
- validated independent allocator accumulation + issuer deleveraging execution;
- activist 13D + later independent open-market insider purchase occurring only after the 13D was already public.

### `I4_ORTHOGONAL_AND_REPLICATED`
Reserved for combinations whose independence and incremental value have survived out-of-sample replication. This state cannot be assigned in the discovery sample.

## Hard de-duplication rules
1. Multiple insiders in one issuer/time cluster are one `INSIDER_CLUSTER` family event, not N independent signals.
2. Multiple affiliated funds/managers under common control are one economic actor unless decision independence is documented.
3. `BUYBACK_EXECUTED`, `NET_SHARE_SHRINKAGE` and `SBC_OFFSET` are features of S3, not automatically three confirmations.
4. `NEW`, `ADD25`, `ADD50`, `PERSIST3Q` from one allocator are a sequence in S4/S6, not independent channels.
5. 13D amendments and campaign outcomes remain part of the original activist causal chain unless a new independent actor/channel enters.
6. Price momentum, analyst revisions and media attention are controls/context unless separately preregistered as signal families.

## Window definitions
Base coincidence windows are tested separately, never pooled ex post:
- `W30`: <=30 calendar days between public component timestamps
- `W90`: <=90 calendar days
- `W180`: <=180 calendar days

Primary window: `W90`.
Sensitivity: W30 and W180.

The direction/order of components is retained. `INSIDER -> BUYBACK_DISCLOSURE` and `BUYBACK_DISCLOSURE -> INSIDER` are different sequences.

## Candidate combinations frozen for first-pass testing
### C1 — `INSIDER_P + NET_SHARE_SHRINKAGE`
Rationale: management personally buying while the issuer is also reducing the economic share base may be stronger than either observation alone. Must pass SBC and balance-sheet gates.

### C2 — `INSIDER_P + ACTIVIST_13D`
Base clean stratum only when the insider purchase is first public **after** the 13D is public. Pre-13D insider buying is `I1_COMMON_CAUSE_LIKELY` and quarantined from the clean convergence claim.

### C3 — `VALIDATED_ALLOCATOR_ACCUMULATION + INSIDER_P`
Requires allocator-specific validation and actor-independence checks. Famous allocator status provides no prior.

### C4 — `VALIDATED_ALLOCATOR_ACCUMULATION + NET_SHARE_SHRINKAGE`
Tests external capital accumulation plus issuer capital-allocation execution.

### C5 — `ACTIVIST_13D + NET_SHARE_SHRINKAGE/DELEVERAGING`
Must distinguish whether capital allocation is merely the activist campaign outcome. If the issuer action is directly demanded/caused by the 13D, classify `I1_COMMON_CAUSE_LIKELY`; study as campaign execution, not independent convergence.

### C6 — `INDEPENDENT_ALLOCATOR_CONSENSUS + INSIDER_P`
Consensus itself must already pass affiliation/source de-duplication.

No three-way combination is tested until its constituent pairwise combinations have sufficient sample and frozen results. This prevents combinatorial p-hacking.

## Minimum event record
- issuer / CIK
- component IDs and families
- component actor IDs
- component public timestamps
- component source/accession
- direction/order
- window class
- independence state I0-I4
- documented dependence rationale
- convergence_t0
- executable_t0
- strongest_component_predeclared
- benchmark
- sector / size / value / momentum controls
- overlapping-event cluster ID
- corporate-action state
- outcome availability flags

## Primary estimand
For each pair AB:

`INCREMENTAL_ALPHA_AB(h) = ALPHA_AB_from_common_t0(h) - ALPHA_STRONGEST_COMPONENT_from_same_t0(h)`

The strongest component is selected by a frozen training/validation rule, not by the realized return of the individual event.

Primary horizons: 3M, 6M, 12M. 1M is diagnostic; 24M only where sample/history supports it.

## Statistical tests
1. **Common-t0 event comparison:** AB vs strongest component re-anchored to AB t0.
2. **Interaction model:** component A + component B + A×B with predefined controls.
3. **Matched comparison:** AB events vs same-family single-signal events matched on date, sector, size and pre-event momentum/valuation where data permits.
4. **Leave-one-issuer-out:** detect issuer concentration.
5. **Leave-one-year/regime-out:** detect regime dependence.
6. **Clustered inference:** cluster by issuer and calendar time where appropriate; long horizons require overlap correction.
7. **Multiple-testing control:** pair families/windows/horizons are a defined family of hypotheses; report adjusted as well as raw significance.

## Anti-leakage / anti-hindsight gates
- No return data before event/independence labels are frozen.
- No creating a new pair because a famous historical winner had that combination.
- No deleting failed second signals.
- Delisted/acquired/bankrupt names remain with proper terminal returns.
- Acquisitions are reported separately so M&A-driven returns cannot masquerade as generic convergence alpha.
- Public availability must be verified per component.

## Mandatory falsifiers
Convergence fails if any of the following holds:
1. AB does not add incremental alpha versus the strongest component from the **same t0**.
2. The effect disappears in `I3_DISTINCT_PUBLIC_CHANNELS` after removing I1/I2 cases.
3. Results depend on one issuer, one year, one sector or takeover outcomes.
4. W30/W90/W180 direction reverses materially without a defensible economic timing mechanism.
5. The interaction term is unstable/out-of-sample negative after controls.
6. Transaction costs/publication latency erase the effect.
7. Multiple-testing adjustment eliminates the apparent finding.

## Evidence rationale frozen before testing
Academic evidence supports testing interaction rather than naive vote-counting. US evidence on actual repurchases finds materially stronger subsequent abnormal returns when insiders are net buyers and negligible long-run abnormal returns when insiders are net sellers, indicating that one public capital signal can validate or weaken another. Separate 2025 evidence finds abnormal insider buying before hedge-fund 13D filings, implying that insider+13D observations can share a causal information source and therefore must not automatically be counted as independent confirmations.

## Decision states
- `C0_UNTESTED`
- `C1_DATASET_INCOMPLETE`
- `C2_LABELS_FROZEN_RETURNS_LOCKED`
- `C3_NO_INCREMENTAL_ALPHA`
- `C4_WEAK_OR_DEPENDENCE_SENSITIVE`
- `C5_ROBUST_INCREMENTAL_ALPHA`
- `C6_OUT_OF_SAMPLE_REPLICATED`

Only C5/C6 may influence persistent research priority. No state creates an automatic BUY.

## Current state
`CROSS_SIGNAL_CONVERGENCE_STATE = C0_UNTESTED`

`RETURNS_ACCESS = LOCKED`

Next action: construct the component-event registry and independence labels without opening forward returns.