# ATLAS Ω — CURRENT-BRANCH AUDIT NOTE

Before modifying an existing canonical/runtime file, fetch its current branch content and SHA. Do not overwrite from stale references.

A SHA conflict indicates the branch changed and must trigger re-read, not forced overwrite.

This protects concurrent ATLAS work from accidental regression.
