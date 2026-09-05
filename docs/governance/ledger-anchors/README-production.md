# Production checkpoint procedure

1. Seal only verified canonical Γ/Κ events through sanctioned server-side functions.
2. Read current stream heads from Supabase.
3. Verify each internal chain.
4. Commit `(stream, head_seq, head_hash, environment, timestamp)` here in GitHub Governance.
5. Verify Supabase against the committed external anchor.
6. Only then mark the sealing batch canonical.

Never overwrite an existing checkpoint file. Corrections are new checkpoint/governance records.
