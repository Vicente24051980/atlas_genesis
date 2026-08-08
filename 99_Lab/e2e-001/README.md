# E2E-001 — DEPRECATED

status: Deprecated
superseded_by: current Atlas Genesis architecture

This experimental benchmark was created from an obsolete architectural snapshot and MUST NOT be treated as canonical Atlas Genesis.

## Reason
The current Atlas corpus already defines formal module contracts, document lifecycle/governance, ontology/entity contracts, schemas, templates, glossary and validation/test gates. E2E-001 duplicated and simplified responsibilities that belong to those newer contracts.

## Rule
- Do not promote this laboratory implementation to `main`.
- Do not use its PASS / QUARANTINED / REJECT model as canonical unless a current specification explicitly adopts it.
- Rebuild future executable validation from the current canonical contracts and registries.
- CORE/frozen documents remain untouched.

Historical files are retained only for traceability until the branch/PR is closed or deleted.