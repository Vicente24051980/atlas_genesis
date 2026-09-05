# Governance Log Ω — 2026-09-05 Assurance Hardening

## GOV-2026-0905-01 — Γ falsifier-writing standard revision

**Historical-lineage correction:** the conversational standard explicitly ratified with Vicente began as the five-field schema `(ID, Condition, Window, Source, Weight)`. The repository already contained a richer `GAMMA_VIGENCIA_OMEGA_V1` contract requiring observability/causality/thesis relevance. This entry records the transition without pretending those were the same artifact.

**New standard:** Γ v1.2 requires exact metric, latest-published-period baseline, source, AMBER/RED operators and thresholds, window, weight, severity and observable/causal/thesis-relevant validation.

**Evidence:** the manual falsifier set showed a high defect rate when checked against current filings, including a Visa threshold already breached at seal time. Dominant failure mode: catastrophe thresholds instead of deterioration thresholds.

**Controls added:** `THRESHOLD_ALREADY_BREACHED`, `BASELINE_NON_STANDARD`, threshold-direction validation, immutable append-only ledger and chain verification.

**Procedure note:** the methodological basis is preserved, but canonical promotion of v1.2 is conditional on executable falsation tests + CI + database migration rather than verbal ratification alone.

**Rollback:** reverting software does not reactivate known-defective historical falsifiers. They remain historical evidence and require revalidation before reuse.

---

## GOV-2026-0905-03 — T0 Anti-Megacap Discovery Gate Ω v1.1

**Position:** constitutional first gate, before Φ and every downstream engine.

**Correction:** remove the unverifiable requirement that the evaluator must not know company size. Neutrality is instead audited through a prospective procedure using capitalization buckets and quotas before scoring.

**Buckets:** `<$1B`, `$1–10B`, `$10–100B`, `$100B–1T`, `>$1T`.

**Default current policy:** two candidates per bucket when the tranche is large enough for the full quota to apply. The policy is versioned and can only change through Governance.

**Invariants:** market cap, index membership, analyst coverage, brand familiarity and data availability contribute zero to discovery score and zero to final score. Bucket quotas change coverage only. A megacap may rank #1 after T0 if it wins on economic evidence.

**Prospective scope:** current/legacy holdings with unreconstructable discovery provenance are `LEGACY_PROVENANCE_UNKNOWN`; no retroactive certification is allowed.

**Downstream data-scarcity boundary:** sparse reporting is not a T0 quality penalty. A correctly identified company can later become Γ `VIGENCIA_NO_EVALUABLE`; Ω-NE manages uncertainty without substituting V=0 or V=1.

---

## GOV-2026-0905-04 — Γ / Κ Assurance Ledger + Ω-NE policy

**Action:** establish server-generated append-only ledgers for Γ and Κ and version Ω-NE as the policy for Γ `NO_EVALUABLE`.

### Ledger invariants
- clients never provide `prev_hash`, `record_hash` or authoritative seal timestamps;
- PostgreSQL computes them under a transactional advisory lock;
- UPDATE/DELETE is rejected;
- original Κ preregistrations are never updated;
- resolution/invalidation/reissue are new events;
- chain verification is executable;
- every canonical batch publishes an external GitHub Governance checkpoint of stream head `(seq, hash)`.

### Why external checkpointing exists
A hash chain stored only in an editable database detects ordinary/single-record tampering but cannot by itself prove history against a privileged actor who rewrites the complete chain and recomputes every hash. A Git commit containing the previous stream head creates an independent anchor.

### Ω-NE policy
For a verified entity with Γ `VIGENCIA_NO_EVALUABLE`:
- no quality penalty;
- no synthetic V_Ω;
- V_Ω excluded from Υ utility;
- maximum 2.0% of equity base;
- two consecutive opaque quarters => explicit Ξ escalation.

The 2.0% ceiling is a policy parameter, not a theorem.

`ENTITY_IDENTITY_NOT_VERIFIED` remains an earlier integrity failure and cannot be treated as Ω-NE.

### Δ historical correction
COHR first exercise is preserved only as `Δ_PROXY`: `D_Ω=NO_MEDIBLE`, shadow dispersion 0.149, no confidence modulation.

### Production verification performed before canonical promotion
Against Supabase project `Atlas_omega`, test-only data demonstrated:
- A1 rejection;
- A7 rejection;
- valid Γ chain verification;
- UPDATE/DELETE blocking;
- simulated privileged single-row tampering detected as `RECORD_HASH_MISMATCH`;
- Κ seal/resolution as separate events;
- second terminal outcome rejection;
- sealed probability mutation blocked.

All test rows were then removed. No historical Γ/Κ conversation records were silently migrated.
