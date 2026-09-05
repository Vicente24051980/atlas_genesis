# ATLAS Ω — Γ/Κ production genesis checkpoint

**Date:** 2026-09-05  
**Supabase project:** `Atlas_omega` / `vzrtzianyzaxwmpltlrs`  
**Purpose:** external anchor of the empty production ledger after migration, hardening and adversarial cleanup.

No real Γ falsifier and no real Κ calibration case had been imported at this checkpoint.

| Stream | head_seq | head_hash |
|---|---:|---|
| GAMMA | 0 | `0000000000000000000000000000000000000000000000000000000000000000` |
| KAPPA | 0 | `0000000000000000000000000000000000000000000000000000000000000000` |

Production verification immediately before this checkpoint:
- both ledgers empty after test cleanup;
- `atlas_verify_gamma_chain()` = OK;
- Kappa test chain previously verified OK before cleanup;
- privileged retained-record tampering produced `RECORD_HASH_MISMATCH`;
- valid-tail deletion left the shortened internal chain valid but produced `ANCHOR_SEQ_MISMATCH` against the captured external head.

This genesis checkpoint proves the external-anchor mechanism starts from a known empty state. The first real canonical sealing batch MUST create a new checkpoint with its actual head sequence/hash and must pass anchored verification before that batch is treated as canonical production evidence.
