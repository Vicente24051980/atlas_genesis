# ATLAS Ω — CONCURRENT WORK RULE

When another ATLAS process changes the branch during an audit:

- preserve successful independent commits;
- re-fetch changed shared files;
- reconcile semantics against the latest master authority;
- never force-write an older snapshot over newer work;
- record unresolved conflicts as OPEN rather than guessing.

Concurrency safety is part of provenance integrity.
