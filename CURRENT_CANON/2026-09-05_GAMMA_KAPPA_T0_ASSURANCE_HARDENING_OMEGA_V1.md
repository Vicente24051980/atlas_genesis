# ATLAS Ω — Γ/Κ Assurance Hardening + T0 v1.1 + Ω-NE

**Date:** 2026-09-05  
**Status:** ENGINEERING CANDIDATE pending real Supabase migration. Repository implementation and CI can be canonical; production-ledger operational status cannot be claimed until the external database is migrated and verified.

## 1. Γ v1.2

Γ answers only whether registered thesis conditions have deteriorated relative to their sealed baseline.

It does not judge whether the baseline was good. A poor but stable baseline may correctly return `V_Ω = 1.00`.

### Relative states

- NORMAL -> factor 0
- AMBER -> factor 0.5
- RED -> factor 1
- NOT_EVALUATED -> excluded, never NORMAL

For non-critical evaluable falsifiers:

`V_Ω = 1 - Σ(weight × factor) / Σ(evaluable non-critical weight)`

Critical AMBER/RED states are reported separately and never diluted in V.

### Ingestion hard stops

- `THRESHOLD_ALREADY_BREACHED`
- `BASELINE_NON_STANDARD`
- `THRESHOLD_DIRECTION_MISMATCH`
- `RED_NOT_MORE_SEVERE_THAN_AMBER`
- `WEIGHTS_TAMPERED`
- invalid observable/causal/thesis-relevant definition

Database verification adds `LEDGER_TAMPERED` when the chain cannot be recomputed.

## 2. Γ falsation status

The ten-attack falsation matrix is encoded in `gamma-kappa-assurance-hardening-omega.ts` and the SQL adversarial suite.

Transition threshold: 90%.

Repository tests cover:
- A1 baseline already breached;
- A7 non-latest baseline;
- A8 sealed-definition mismatch;
- A3 poor but stable baseline;
- A4 critical separation;
- A10 NO_EVALUABLE.

PostgreSQL tests additionally cover:
- UPDATE/DELETE rejection;
- privileged tampering followed by hash verification failure;
- append-only Kappa resolution;
- duplicate terminal-event rejection;
- concurrent Gamma seals with no chain fork.

## 3. Append-only ledgers

Migration:

`supabase/migrations/20260905062500_gamma_kappa_append_only_ledgers.sql`

Tables:
- `atlas_gamma_ledger`
- `atlas_kappa_ledger`

The database owns:
- `sealed_at`
- `prev_hash`
- `record_hash`
- event sequence
- canonical event serialization
- SHA-256

Clients cannot supply chain hashes.

Each ledger is serialized with an advisory transaction lock. Verification recomputes every event from the genesis hash.

Physical mutation controls are defense in depth; cryptographic detectability is the core audit property.

## 4. Κ event model

A preregistration is never updated.

Events:
- CASE_SEALED
- CASE_RESOLVED
- CASE_INVALIDATED
- CASE_REISSUED

Seal payload includes:
- claim type
- horizon ID
- horizon end
- probability
- claim
- resolution criteria
- resolution source
- issuer/model version
- optional superseded case ID

Resolution/invalidation events reference the sealed event sequence and record hash.

Kappa scoring must be computed only from valid resolved cases whose original seal remains intact.

## 5. Ω-NE policy

`NO_EVALUABLE` is not a V value.

`OMEGA_NE_POLICY_V1`:
- quality penalty = 0
- V substitution = none
- exclude V from utility
- maximum equity-base weight = 2.0%
- escalate to Ξ after two consecutive quarters of non-evaluability

The 2.0% ceiling is a versioned policy parameter.

Identity verification remains prior to Γ. `ENTITY_IDENTITY_NOT_VERIFIED` blocks downstream and cannot be converted to Ω-NE.

## 6. T0 v1.1

T0 remains the constitutional first gate through the existing `T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1` compatibility registry entry; the implementation behind that alias is v1.1.

The unverifiable `entered_before_size_known` concept is removed.

Auditable buckets:
- < $1B
- $1B-$10B
- $10B-$100B
- $100B-$1T
- > $1T

`T0_POLICY_V1_1` requires two candidates per bucket when the first discovery tranche is large enough for the quota to apply.

Bucket balancing affects discovery coverage only, never final score.

Index-only discovery is rejected as upstream bias. Historical positions use `LEGACY_PROVENANCE_UNKNOWN`; their past discovery process is not reconstructed.

## 7. Δ correction

The COHR experiment is not a canonical Δ result.

- state: `Δ_PROXY`
- `D_Ω = NO_MEDIBLE`
- `SHADOW_DISPERSION = 0.149`
- `Conf_Ω = NO_CALCULABLE`
- disagreement axis: `QUALITATIVE_HYPOTHESIS`

No shadow dispersion may enter Core confidence.

## 8. Production activation gate

The following distinction is mandatory:

**Repository implementation verified** != **production ledger operational**.

Γ/Κ production ledger status becomes operational only after the migration is executed against the actual Supabase project and both verification functions return OK there.

No 40-falsifier migration and no Kappa historical import before that gate.
