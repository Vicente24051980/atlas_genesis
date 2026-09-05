# ATLAS Ω — Γ / Κ Assurance Hardening Ω v1.2

**Date:** 2026-09-05  
**Engineering state:** candidate implementation pending PR CI/merge.  
**Direct Structural ATLAS weight:** 0.

## 1. Γ — Vigencia Ω v1.2
Γ answers one question only: **has the sealed thesis condition deteriorated relative to its verified baseline?**

It does not judge whether the baseline itself was good, does not re-score quality, and does not issue BUY/SELL.

### Mandatory falsifier fields
- immutable ID + ticker
- exact published metric + unit
- verified baseline
- baseline source
- baseline period end = latest published period available at seal time
- AMBER operator + threshold
- RED operator + threshold
- window
- weight
- severity
- observable / causal / thesis-relevant flags

### Ingestion guards
- `THRESHOLD_ALREADY_BREACHED`
- `BASELINE_NON_STANDARD`
- `THRESHOLD_DIRECTION_MISMATCH`
- `RED_NOT_MORE_SEVERE_THAN_AMBER`
- invalid definitions are rejected.

### Evaluation
For non-critical evaluable falsifiers:
`V_Ω = 1 - Σ(weight × factor) / Σ(evaluable non-critical weight)`

- NORMAL = 0
- AMBER = 0.5
- RED = 1
- `CRITICAL` remains outside V_Ω and is surfaced separately.
- `NOT_EVALUATED` never becomes NORMAL.
- No evaluable current falsifier => `VIGENCIA_NO_EVALUABLE`, not V=0 and not V=1.

`V_Ω = 1` means **no observed deterioration relative to the sealed baseline**, not “thesis intact” or “high quality”.

## 2. Ω-NE — No-Evaluable uncertainty policy v1
If entity identity is verified but Γ is `VIGENCIA_NO_EVALUABLE`:
- quality penalty = 0
- no assumed V_Ω value
- V_Ω excluded from Υ utility
- hard maximum position = 2.0% of equity base
- after 2 consecutive opaque quarters, escalate to Ξ for explicit governance decision.

The 2.0% ceiling is a **versioned policy parameter**, not an empirical truth.

`ENTITY_IDENTITY_NOT_VERIFIED` is a pre-Γ integrity block. Ω-NE cannot rescue an unidentified entity.

## 3. Κ — Calibration Ω event ledger v1.1
Κ preregistration is event-sourced. Original cases are never updated.

Events:
- `CASE_SEALED`
- `CASE_RESOLVED`
- `CASE_INVALIDATED`
- `CASE_REISSUED`

The sealed event includes claim, claim type, probability, horizon, resolution criteria, resolution source and issuer/model version. Terminal outcomes are new events linked to the original seal.

## 4. Γ / Κ assurance ledger
Supabase tables:
- `public.atlas_gamma_ledger`
- `public.atlas_kappa_ledger`

Server-side guarantees:
- `sealed_at`, `prev_hash` and `record_hash` are generated inside PostgreSQL.
- callers never supply chain hashes.
- `pg_advisory_xact_lock` serializes each stream and prevents concurrent forks.
- UPDATE/DELETE triggers reject mutation.
- direct table writes are revoked from public/anon/authenticated.
- sanctioned mutation functions are service-role only.
- verification functions recompute each chain.

### External checkpoint
An internal hash chain cannot prove integrity against a privileged actor who rewrites **all** rows and recomputes the chain. Therefore every canonical sealing batch must also record the stream head `(seq, hash)` in GitHub Governance. Supabase exposes `atlas_ledger_heads()` for this purpose.

## 5. Γ falsation matrix
The ten attacks A1–A10 are now encoded in specification/tests. Production verification has already demonstrated:
- A1 threshold-already-breached rejection
- A7 non-latest baseline rejection
- A5 normal UPDATE/DELETE block
- A5 privileged single-record corruption detected as `RECORD_HASH_MISMATCH`
- Κ seal → resolve as two immutable events
- second terminal Κ outcome rejected

True simultaneous fork resistance is additionally exercised in CI using two parallel PostgreSQL sessions.

## 6. T0 v1.1 correction
T0 is prospective only. Historical discovery provenance is never reconstructed.

Auditable buckets:
- `<$1B`
- `$1–10B`
- `$10–100B`
- `$100B–1T`
- `>$1T`

Default current policy: two candidates per bucket when the discovery tranche is large enough for the quota to apply. Bucket quotas govern **coverage**, never score. Index-only discovery is rejected before consumption. Legacy holdings are marked `LEGACY_PROVENANCE_UNKNOWN` rather than retroactively certified size-neutral.

Data availability gives no T0 discovery bonus. Sparse reporting can later produce Γ `NO_EVALUABLE`; Ω-NE handles that uncertainty without undoing T0 through a quality penalty.

## 7. Δ COHR correction
The prior COHR exercise remains:
- `Δ_PROXY`
- `D_Ω = NO_MEDIBLE`
- `SHADOW_DISPERSION = 0.149`
- `Conf_Ω = NO_CALCULABLE`
- disagreement axis = `QUALITATIVE_HYPOTHESIS`

It cannot modulate Core Confidence because the same Aligned Evidence Graph / independence preconditions were not demonstrated.

## 8. Data migration rule
No historical Γ falsifier or Κ case is inserted merely because it appeared in conversation. It must first be transformed into the current schema and pass ingestion. The production ledgers remain empty until a verified canonical batch is available; after each batch its head is checkpointed externally.
