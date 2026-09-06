# PUBLIC CAPITAL SIGNALS Ω — Canon v0.2

**Date:** 2026-09-06
**Supersedes:** `2026-09-06_PUBLIC_CAPITAL_SIGNALS_OMEGA_v0_1.md`
**Status:** `RESEARCH ONLY / RETURNS LOCKED`

## Purpose
Build a point-in-time, primary-source research system for public capital signals without prestige transfer, hindsight, actor duplication or form-based identity errors.

## Universal laws
1. `PUBLICATION_TIME_ONLY` — the event clock starts when information is public and usable.
2. `NO_PRESTIGE_TRANSFER` — fame, wealth, dynasty, fund brand or board status creates no automatic prior.
3. `NO_HINDSIGHT` — labels, thresholds and gates freeze before forward returns.
4. `NEGATIVES_INCLUDED` — failures, reductions, nulls and excluded false positives stay in the research denominator.
5. `PUBLIC_DATA_ONLY` — no attempt to infer or exploit material non-public information.
6. `SIGNAL != ALPHA != BUY` — sourcing, validated information content and portfolio action are separate states.
7. `INDEPENDENCE_GATE` — repeated manifestations of one actor/cause count once.
8. `FORM_TYPE != ECONOMIC_IDENTITY` — a filing form does not define the actor or economic mechanism.
9. `FILER_NAME_MISMATCH != ECONOMIC_ACTOR_INDEPENDENCE` — string differences never prove orthogonality.
10. `RETURNS_ACCESS = LOCKED` until the relevant event registry is frozen.

## Signal families
### S1 — INSIDER PURCHASE Ω v0.2
Active preregistration: `2026-09-06_INSIDER_PURCHASE_OMEGA_PREREG_v0_2.md`.

Key law: `CODE_P = NECESSARY_BUT_NOT_SUFFICIENT`.

Every code-P Form 4 requires footnote/remarks/economic-substance review:
- `P_CASH_AT_RISK_CONFIRMED`
- `P_ECONOMIC_SUBSTANCE_AMBIGUOUS`
- `P_COMPENSATORY_OR_SERVICE_PAYMENT`
- `P_AFFILIATED_VEHICLE_PURCHASE`

Compensation/services/plan-driven acquisitions do not enter the base insider-purchase arm merely because Table I displays `P`.

Primary control: Comstock director Leo M. Drozdoff displayed code P but filing remarks identified the stock as payment for director services. The case is excluded from base S1 and retained as a semantic false-positive control.

### S2 — ACTIVIST / BLOCKHOLDER Ω v0.2
Active preregistration: `2026-09-06_ACTIVIST_13D_OMEGA_PREREG_v0_2.md`.

Key law: `SCHEDULE_13D != EXTERNAL_ACTIVIST`.

Every 13D first passes `ACTIVIST_IDENTITY_GATE`:
- `13D_EXTERNAL_ACTIVIST`
- `13D_EXTERNAL_BLOCKHOLDER_NONACTIVIST`
- `13D_ISSUER_AFFILIATED_INSIDER`
- `13D_FOUNDER_FAMILY_CONTROL_HOLDER`
- `13D_FORMER_INSIDER_WITH_CONTINUING_TIES`
- `13D_TRANSACTIONAL_RESTRUCTURING`
- `13D_RELATIONSHIP_AMBIGUOUS`

Only `13D_EXTERNAL_ACTIVIST` enters the clean activist base test. Item 4 objective classification occurs after identity classification.

`ACTOR_NETWORK_GATE` resolves current/former board and management roles, family/control links, fund complexes, cooperation/settlement agreements, shareholder covenants, issuer transactions, nomination/information rights and other formal ties.

Primary falsification controls:
- CBK Robertson 13D: issuer board/family/control network + transactional distribution, not outside activism.
- SVRN Abra/Zafirakis and Tuscany/Paliou: issuer governance/transaction networks and continuing insider ties, not clean outside activism.
- WGS GeneDx: Eli Casdin is explicitly a 13D reporting person and later Form 4 buyer through the same Casdin network; same actor, not independent convergence.

### S3 — CAPITAL ALLOCATION EXECUTION Ω
Active preregistration: `2026-09-06_CAPITAL_ALLOCATION_EXECUTION_OMEGA_PREREG_v0_1.md`.

Key law: `ANNOUNCEMENT != EXECUTION != VALUE_CREATION`.

Separate:
- `BUYBACK_EXECUTED`
- `NET_SHARE_SHRINKAGE`
- `SBC_OFFSET_TEST`
- `DEBT_REDUCTION`
- `SPECIAL_DISTRIBUTION`
- `M&A_DISCIPLINE`

Execution becomes an event only when publicly observable. Buyback authorization alone = no execution signal.

### S4 — ALLOCATOR OWNERSHIP Ω
13F/13D-G ownership sourcing. Existing Lingotto laws remain active:
- visible 13F book != total portfolio;
- publication date, not quarter end;
- CUSIP + class + put/call identity;
- corporate-action normalization before share deltas;
- amendment semantics preserved;
- allocator provenance cannot create company-quality points.

### S5 — INDEPENDENT CONSENSUS Ω
Two or more independently validated actors changing exposure to one issuer inside a frozen window. Affiliated managers, same-control vehicles and repeated-source derivatives count as one actor.

### S6 — POSITION ESCALATION / PERSISTENCE Ω
Sequences such as NEW→ADD25, NEW→ADD50, ADD→ADD, PERSIST3Q, CUT25, CUT50 and EXIT. These are within-actor sequences, not independent channels.

### S7 — CROSS-SIGNAL CONVERGENCE Ω
Active preregistration: `2026-09-06_CROSS_SIGNAL_CONVERGENCE_OMEGA_PREREG_v0_1.md`.

Central law: `MULTIPLE_OBSERVATIONS != MULTIPLE_INDEPENDENT_SIGNALS`.

`CONVERGENCE_T0 = max(component_publication_timestamps)`.

Independence states:
- `I0_DUPLICATE`
- `I1_COMMON_CAUSE_LIKELY`
- `I2_DEPENDENCE_UNKNOWN`
- `I3_DISTINCT_PUBLIC_CHANNELS`
- `I4_ORTHOGONAL_AND_REPLICATED` only after out-of-sample replication.

Only I3 can enter the discovery base test. I4 cannot be assigned in discovery.

## Registry state
Schema: `2026-09-06_CONVERGENCE_COMPONENT_EVENT_REGISTRY_SCHEMA_v0_1.md`.

Data files:
- seed v0.1: 10 components;
- delta v0.2: +4 components;
- delta v0.3: +7 components.

Current cumulative registry:
`COMPONENT_ROWS = 21`
`PAIR_OR_SCREEN_ROWS = 10`
`I3_BASE_ELIGIBLE = 0`
`RETURNS_ACCESS = LOCKED`

The zero-I3 result is preserved. It is evidence that clean orthogonal convergence is materially rarer than naive form/date/name matching suggests. The gate is not relaxed.

## Validation scale
- `A0_UNTESTED`
- `A1_DATASET_INCOMPLETE`
- `A2_TESTABLE_FROZEN`
- `A3_NO_ROBUST_ALPHA`
- `A4_WEAK_OR_REGIME_DEPENDENT`
- `A5_PERSISTENT_POST_PUBLICATION_ALPHA`
- `A6_OUT_OF_SAMPLE_REPLICATED`

Only A5/A6 may receive persistent research priority. No state generates an automatic BUY.

## Current family states
`INSIDER_PURCHASE = A0_UNTESTED`
`ACTIVIST_13D = A0_UNTESTED`
`CAPITAL_ALLOCATION_EXECUTION = A0_UNTESTED`
`ALLOCATOR_OWNERSHIP = DATASET_IN_PROGRESS`
`INDEPENDENT_CONSENSUS = A0_UNTESTED`
`POSITION_ESCALATION = A0_UNTESTED`
`CROSS_SIGNAL_CONVERGENCE = C0_UNTESTED`
`RETURNS_ACCESS = LOCKED`

## Next gate
Continue primary-source population until each individual family has a frozen, sufficiently broad event dataset. Do **not** open convergence returns merely because an I3 is eventually found; component-family validation remains a prerequisite for any persistent cross-signal claim.
