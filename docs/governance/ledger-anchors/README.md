# ATLAS Ω — External Ledger Anchor Protocol

This directory stores **external checkpoints** for the Γ and Κ append-only ledgers hosted in Supabase/PostgreSQL.

## Why this exists

An internal hash chain detects mutation of retained records and accidental forks, but a privileged actor could delete a valid tail, truncate the table, or rewrite all rows and recompute every in-database hash. A checkpoint committed outside Supabase makes that class of history shortening/rewrite detectable as long as GitHub governance history remains trustworthy.

## Checkpoint schema

Each production checkpoint MUST be a new JSON file; previous checkpoint files are never edited or deleted as part of normal operation.

Required fields:

```json
{
  "schema_version": "ATLAS_LEDGER_ANCHOR_V1",
  "environment": "production",
  "project_label": "non-secret Supabase project label",
  "checkpointed_at": "RFC3339 UTC timestamp",
  "gamma": { "head_seq": 0, "head_hash": "64 hex chars" },
  "kappa": { "head_seq": 0, "head_hash": "64 hex chars" },
  "source": "atlas_ledger_heads()",
  "governance_issue": 104
}
```

The file itself MUST NOT contain database passwords, Supabase service-role keys, connection strings or other secrets.

## Production sealing protocol

1. Apply/verify all approved Γ/Κ migrations.
2. Seal the intended Γ/Κ batch through the approved database functions only.
3. Run internal chain verification for both streams.
4. Read heads with `atlas_ledger_heads()`.
5. Create a new immutable checkpoint file in this directory, named with UTC timestamp, e.g. `2026-09-05T063000Z.json`.
6. Commit the checkpoint through the normal GitHub governance workflow.
7. Re-run `atlas_verify_gamma_against_anchor()` and `atlas_verify_kappa_against_anchor()` using the values in the committed checkpoint.
8. Record the checkpoint Git commit SHA in the operational audit report.

## Audit protocol

At every material Γ/Κ audit:
- verify each internal chain;
- load the latest trusted GitHub checkpoint;
- compare live heads with the checkpoint appropriate to the audit boundary;
- treat sequence/hash mismatch as `LEDGER_TAMPERED` until explained through an authorized append-only event history.

A live head may legitimately be **ahead** of an older checkpoint because new events were appended. In that case the verifier for the exact old head should be run against a historical-prefix verification procedure before a new checkpoint is accepted. Never simply overwrite the old checkpoint.

## Threat-model boundary

This two-system design does not claim safety against a coordinated compromise of both the Supabase database/history and the GitHub governance repository/credentials. A stronger requirement would need an independent signed/transparency-log anchor administered separately.

## No fabricated genesis

Do not add a production checkpoint until the real Supabase project has been migrated and queried. Repository test heads are not production evidence.
