# ATLAS Ω — POINT ZERO RUNTIME REQUIREMENTS

Canonical runtime behavior must satisfy all of the following:

- input universe identity equals `ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06` or an explicitly versioned successor;
- entity deduplication occurs before scoring;
- all entities start with zero inherited advantage;
- current holdings and personal capital state are excluded from clean selection inputs;
- no fixed cardinality target/floor/ceiling constrains `OPTIMAL_N`;
- no incumbent wins ties in clean selection;
- no replacement hurdle is applied before clean membership is determined;
- no independent diversification reward creates membership value;
- correlated financing/factor/geopolitical risks may reduce portfolio utility only as modeled risks;
- falsifier veto and hard gates remain independent;
- missing material data is `UNKNOWN` and reduces confidence;
- selection output remains separate from sizing and entry timing;
- runtime emits enough frontier information to explain why N+1 was rejected.

Any runtime component violating these requirements is not canonical even if an older document labels it ACTIVE/CANONICAL.
