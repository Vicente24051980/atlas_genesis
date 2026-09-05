# Governance Log Ω — Γ/Κ ledger hardening, T0 v1.1 and Ω-NE

**Date:** 2026-09-05  
**Issue:** #104  
**Status:** ENGINEERING CANDIDATE — repository verification is necessary but production remains non-operational until the real Supabase migration and external GitHub checkpoint are verified.

## GOV-2026-0905-01 — corrected transition record

The conversation-origin schema of five fields was the user-ratified starting point for the first falsifier batch. The repository already contained a richer `GAMMA_VIGENCIA_OMEGA_V1` contract. This entry records the actual transition without pretending the five-field schema was the only prior repository standard.

### Γ v1.2 Relative Threshold Standard

A falsifier seal contains at minimum:
- immutable ID and verified ticker/entity identity;
- exact reported metric;
- latest published baseline at seal time;
- baseline source and reporting period;
- AMBER operator + threshold;
- RED operator + threshold;
- window;
- weight;
- severity;
- observable / causal / thesis-relevant flags.

`AMBER` contributes factor `0.5`; `RED` contributes `1.0` for non-critical falsifiers. Critical states remain outside the continuous `V_Ω` average.

### Mandatory ingestion guards

- `THRESHOLD_ALREADY_BREACHED`: baseline already satisfies AMBER at seal time.
- `BASELINE_NON_STANDARD`: baseline is not the latest published period available at seal time.
- `THRESHOLD_DIRECTION_MISMATCH`: AMBER and RED point in incompatible directions.
- `RED_NOT_MORE_SEVERE_THAN_AMBER`: RED is not economically beyond AMBER in the same direction.
- `WEIGHTS_TAMPERED`: sealed definition fingerprint differs from the current definition.
- `LEDGER_TAMPERED`: retained database history cannot be recomputed against its hash chain or against the required external checkpoint.

Rollback never silently restores falsifiers already shown to be defective; they remain historical evidence only and require explicit revalidation.

## Γ falsation matrix

The matrix is executable rather than narrative. A1, A7 and A8 are tested in TypeScript and PostgreSQL. A5 is tested through mutation blocking, privileged retained-record corruption, external-checkpoint tail-deletion/truncation tests and concurrent sealing with a no-fork assertion.

Γ may only move from `LIQUID` to production `CANDIDATE` after the migration is applied to the real backend and the production head is externally checkpointed and verified. Passing repository CI proves the design/migration executes under the test threat model; it does not prove the production Supabase instance has been migrated.

## Κ — append-only event sourcing

Κ no longer relies on an editable row whose `status` is updated in place.

Events:
- `CASE_SEALED`
- `CASE_RESOLVED`
- `CASE_INVALIDATED`
- `CASE_REISSUED`

The seal contains claim type, horizon ID, horizon end, probability, claim, immutable resolution criteria, resolution source and issuer/model version. A resolution or invalidation is a new event linked to the original sealed event hash. The original preregistration is never updated.

## A5 infrastructure rule and threat model

Immutability is not based on trusting a client or a user interface.

Inside Supabase/PostgreSQL:
- `prev_hash`, `record_hash` and `sealed_at` are generated server-side;
- clients never supply chain hashes;
- an advisory transaction lock serializes each ledger stream;
- canonical event text is generated in the database;
- SHA-256 is calculated in the database using the actual pgcrypto extension schema;
- UPDATE/DELETE are blocked by triggers and ordinary-role privileges are revoked;
- same-database verification recomputes every retained event from genesis;
- concurrent sealing is tested to prevent forked heads.

### Why the database chain is not sufficient by itself

A privileged actor able to delete a valid tail or truncate the entire table can leave a shorter internally consistent chain. A fully privileged actor could also rewrite all events and recompute every internal hash. Therefore **same-database verification alone is not evidence of complete-history preservation**.

Production must externally anchor each canonical sealing batch by persisting outside Supabase:
- stream (`GAMMA` / `KAPPA`);
- `head_seq`;
- `head_hash`;
- checkpoint timestamp;
- production project/environment identifier that is non-secret;
- Git commit SHA containing the checkpoint.

Canonical external store: GitHub Governance under `docs/governance/ledger-anchors/`.

Functions `atlas_gamma_chain_head()`, `atlas_kappa_chain_head()` and `atlas_ledger_heads()` expose current heads. `atlas_verify_*_against_anchor(expected_seq, expected_hash)` proves the live database still matches a prior external checkpoint. The adversarial suite demonstrates that tail deletion and full truncation may pass an unanchored internal-chain check but fail the external-anchor check.

### Threat-model boundary

This design detects accidental or malicious changes to Supabase **provided the external GitHub checkpoint remains trustworthy**. It does not claim cryptographic protection against a coordinated compromise that can rewrite both Supabase history and the external GitHub history/credentials. Such a stronger threat model would require an additional independently administered anchor or signed transparency log.

## GOV-2026-0905-03 — T0 v1.1 auditable discovery

T0 remains constitutional and prospective.

The unverifiable field `entered_before_size_known` is removed. The system does not pretend an evaluator can unknow that a famous company is large.

### Buckets

- `<$1B`
- `$1B-$10B`
- `$10B-$100B`
- `$100B-$1T`
- `>$1T`

Canonical policy `T0_POLICY_V1_1` requires a minimum of two candidates per bucket whenever the first tranche is large enough for the quota to apply. This is a discovery-coverage rule only; it never alters a company score.

An index-only source universe is `DISCOVERY_BIAS_DETECTED` before downstream consumption. In CHALLENGER / NO_AI searches, the >$1T first-tranche share ceiling remains 20% under the current versioned policy.

Historical positions whose discovery channel cannot be reconstructed are `LEGACY_PROVENANCE_UNKNOWN`. No retroactive claim of size-neutral discovery is made.

## Ω-NE — NO_EVALUABLE allocation policy

`V_Ω = NO_EVALUABLE` is neither deterioration nor verified vigencia.

Versioned policy `OMEGA_NE_POLICY_V1`:
- no quality penalty;
- no substituted V value;
- V is excluded from the allocation utility for that position;
- hard maximum weight = 2.0% of equity base;
- after two consecutive quarters still `NO_EVALUABLE`, escalate to Ξ for an explicit opacity decision.

The 2.0% cap is a governance parameter, not a theorem derived from the axioms.

`ENTITY_IDENTITY_NOT_VERIFIED` is earlier and stronger than Ω-NE. An unidentified ticker/entity cannot be rescued by an opacity rule and cannot proceed to Γ/Υ.

## Δ COHR correction

The prior COHR run is preserved only as `Δ_PROXY`:
- `D_Ω = NO_MEDIBLE`
- `SHADOW_DISPERSION = 0.149`
- `Conf_Ω = NO_CALCULABLE`
- disagreement axis = `QUALITATIVE_HYPOTHESIS`

Reason: evidence was split across passes and evaluator independence was not proven. The shadow dispersion is descriptive only and cannot modulate canonical confidence.

## Ρ status

Ρ — Counterparty Exposure remains **PENDING_RATIFICATION** in this entry. This hardening change does not silently promote it to the Kernel.

## Production migration gate

No historical Γ falsifiers or Κ cases are imported until all conditions hold:
1. repository TypeScript, PostgreSQL, concurrency and external-anchor CI pass;
2. the complete ordered Supabase migration chain is applied to the real project;
3. `atlas_verify_gamma_chain()` and `atlas_verify_kappa_chain()` return OK;
4. one controlled Γ seal and one controlled Κ seal succeed;
5. current heads are exported and committed as the first external GitHub checkpoint;
6. `atlas_verify_gamma_against_anchor()` and `atlas_verify_kappa_against_anchor()` return OK against that committed checkpoint;
7. only then may historical data be migrated as append-only events with explicit provenance.
