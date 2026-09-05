# ATLAS Ω — Γ/Κ Assurance Hardening + T0 v1.1 + Ω-NE

**Date:** 2026-09-05  
**Repository state:** CANDIDATE implementation.  
**Production state:** NOT OPERATIONAL until the real Supabase project is migrated, a controlled seal is made, the live heads are externally checkpointed in GitHub, and anchored verification passes.

## 1. Γ v1.2

Γ answers only whether registered thesis conditions have deteriorated relative to their sealed baseline. It does not judge whether the baseline was good. A poor but stable baseline may correctly return `V_Ω = 1.00`.

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

Database verification adds `LEDGER_TAMPERED` when retained history fails recomputation or fails comparison with a required external checkpoint.

## 2. Γ falsation status

The ten-attack falsation matrix is encoded in `gamma-kappa-assurance-hardening-omega.ts` and the SQL adversarial suites. Transition threshold: 90%.

Repository tests cover A1, A3, A4, A7, A8 and A10 directly. PostgreSQL tests additionally cover mutation blocking, privileged retained-record corruption, append-only Kappa terminal events, duplicate terminal-event rejection, concurrent Gamma seals with no fork, and external-checkpoint detection of valid-tail deletion/truncation.

Passing repository CI validates the implementation against that test threat model; it does not prove the real Supabase project has been migrated.

## 3. Append-only Γ / Κ ledgers

Ordered migrations:
- `supabase/migrations/20260905062500_gamma_kappa_append_only_ledgers.sql`
- `supabase/migrations/20260905062600_gamma_kappa_permissions_hardening.sql`
- `supabase/migrations/20260905062700_gamma_kappa_external_anchor_verification.sql`
- `supabase/migrations/20260905064000_gamma_kappa_pgcrypto_schema_fix.sql`
- `supabase/migrations/20260905064500_gamma_kappa_external_checkpoint_heads.sql`

Tables:
- `atlas_gamma_ledger`
- `atlas_kappa_ledger`

The database owns event sequence, `sealed_at`, `prev_hash`, canonical serialization and `record_hash`. Clients cannot supply chain hashes. Each stream is serialized with a transactional advisory lock. The pgcrypto helper resolves the actual extension schema so the migration works both on Supabase-style and ordinary PostgreSQL installations.

UPDATE/DELETE blocking and role revocation are defense in depth. Same-database chain verification detects mutation of retained events and structural forks.

### External checkpoint is mandatory

A hash chain stored only in the same mutable database cannot prove that a privileged actor did not delete a valid tail, truncate the table, or rewrite the complete history and recompute it.

Therefore every canonical production sealing batch must export:
- stream (`GAMMA` or `KAPPA`)
- `head_seq`
- `head_hash`
- checkpoint timestamp
- non-secret environment/project label

and commit that checkpoint outside Supabase under GitHub Governance.

Current-head functions:
- `atlas_gamma_chain_head()`
- `atlas_kappa_chain_head()`
- `atlas_ledger_heads()`

Anchored verification:
- `atlas_verify_gamma_against_anchor(expected_seq, expected_hash)`
- `atlas_verify_kappa_against_anchor(expected_seq, expected_hash)`

The external anchor detects deletion/truncation that an internally consistent shortened chain cannot detect by itself.

Threat-model boundary: coordinated compromise of both Supabase history and the external GitHub governance history/credentials is outside this two-system design and would require a separately administered signed transparency anchor.

## 4. Κ v1.1 event model

A preregistration is never updated.

Events:
- CASE_SEALED
- CASE_RESOLVED
- CASE_INVALIDATED
- CASE_REISSUED

Seal payload includes claim type, horizon ID/end, probability, claim, resolution criteria, resolution source, issuer/model version and optional superseded-case ID. Resolution/invalidation events reference the sealed event sequence and record hash.

Kappa scoring consumes only valid resolved cases whose original seal and ledger chain remain intact.

## 5. Ω-NE policy

`NO_EVALUABLE` is not a V value.

`OMEGA_NE_POLICY_V1`:
- quality penalty = 0
- V substitution = none
- exclude V from utility
- maximum equity-base weight = 2.0%
- escalate to Ξ after two consecutive quarters of non-evaluability

The 2.0% ceiling is a versioned policy parameter, not a theorem.

Identity verification remains prior to Γ. `ENTITY_IDENTITY_NOT_VERIFIED` blocks downstream and cannot be converted to Ω-NE.

## 6. T0 v1.1

T0 is the constitutional first gate in hierarchy v4.18.0 as `T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1_1`.

The unverifiable `entered_before_size_known` concept is removed. Neutrality is tested prospectively through auditable discovery coverage.

Buckets:
- < $1B
- $1B-$10B
- $10B-$100B
- $100B-$1T
- > $1T

`T0_POLICY_V1_1` requires two candidates per bucket when the first discovery tranche is large enough for the quota to apply. Bucket balancing affects discovery coverage only, never final score. Index-only discovery is rejected as upstream bias. Historical positions use `LEGACY_PROVENANCE_UNKNOWN`; their past discovery process is not reconstructed.

A >$1T company can still finish #1 after T0 if it wins on evidence. Size itself supplies neither bonus nor penalty.

## 7. Δ correction

The COHR experiment is not a canonical Δ result:
- state: `Δ_PROXY`
- `D_Ω = NO_MEDIBLE`
- `SHADOW_DISPERSION = 0.149`
- `Conf_Ω = NO_CALCULABLE`
- disagreement axis: `QUALITATIVE_HYPOTHESIS`

No shadow dispersion may enter Core Confidence.

## 8. Ρ status

Ρ — Counterparty Exposure remains `PENDING_RATIFICATION`. This hardening package does not promote it implicitly.

## 9. Production activation gate

**Repository implementation verified != production ledger operational.**

No historical 40-falsifier migration and no Κ historical import until:
1. all repository CI passes;
2. the complete ordered migration chain is applied to the actual Supabase project;
3. internal Γ and Κ chain verification returns OK;
4. one controlled Γ seal and one controlled Κ seal succeed;
5. their heads are committed to the external GitHub ledger-anchor path;
6. anchored Γ and Κ verification returns OK against that checkpoint;
7. only then may historical records be imported as append-only events with explicit provenance.
