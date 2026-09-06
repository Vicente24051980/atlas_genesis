# ATLAS Ω — RANK SEMANTICS

Ranks are state-specific.

- `OPERATIONAL_RANK` describes the ordering of a supplied/current operational snapshot.
- `CLEAN_POINT_ZERO_RANK` exists only after a valid clean rebuild.
- `CHALLENGER_RANK` describes the post-selection cut frontier.

Ranks do not inherit across states.

Thus VRT operational rank ~#16 does not create a Point Zero #16 prior, and a historical rank cannot be quoted as current clean rank without a fresh canonical run.
