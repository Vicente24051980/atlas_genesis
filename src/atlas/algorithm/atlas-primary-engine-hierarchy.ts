// HISTORICAL COMPATIBILITY TOMBSTONE — 2026-09-07
//
// The former v4.18 "primary engine hierarchy" encoded a pre-consolidation
// architecture with named primary/refinement engines and incumbent-protection
// rules. It is superseded by the E1–E6 kernel contract registry and MUST NOT be
// used as current selection, ranking, replacement or execution authority.
//
// Kept as a minimal compatibility surface so stale imports fail semantically
// closed instead of silently reactivating the old architecture.

export const ATLAS_PRIMARY_ENGINE_HIERARCHY = {
  version: 'SUPERSEDED_2026-09-07',
  status: 'HISTORICAL_COMPATIBILITY_ONLY',
  currentAuthority: 'ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA',
  canonicalEngineCount: 6,
  cleanSelectionAuthority: false,
  incumbentPreferenceAuthority: false,
  fixedCardinalityAuthority: false,
  buySellAuthority: false,
} as const;

export const ATLAS_CANONICAL_DECISION_SEQUENCE = [
  'SUPERSEDED_USE_ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA',
] as const;
