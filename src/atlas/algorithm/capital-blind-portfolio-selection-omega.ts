export const CAPITAL_BLIND_PORTFOLIO_SELECTION_OMEGA_VERSION = '2026-09-07-v2.1.0' as const;

// Legacy compatibility exports only. They are deliberately non-binding.
// Canonical selection has no ex-ante cardinality floor or ceiling.
export const MIN_PORTFOLIO_POSITIONS = 0 as const;
export const MAX_PORTFOLIO_POSITIONS = Number.POSITIVE_INFINITY;

export type CapitalBlindCandidate = {
  ticker: string;
  canonicalEntityId?: string;
  hardGatesPassed: boolean;
  expectedCompoundReturnPct: number;
  permanentLossRiskPct: number;
  fragilityPenaltyPct: number;
  robustnessBenefitPct?: number;

  /**
   * @deprecated Diagnostic/provenance field only. Point Zero forbids granting
   * selection utility merely because a candidate adds causal-driver variety.
   */
  causalDiversificationBenefitPct?: number;

  complexityPenaltyPct?: number;

  /** Diagnostic exposure labels only; shared labels are not risk proof. */
  causalDrivers?: string[];

  // Explicitly non-authoritative personal-state fields. They are accepted only
  // to prove that the selector is invariant to current ownership/capital state.
  currentInvestedEur?: number;
  currentPositionWeight?: number;
  personalPnLPct?: number;
  personalAverageCost?: number;
  isCurrentlyHeld?: boolean;
};

export type CapitalBlindSelectionPolicy = {
  /** @deprecated Fixed-N bounds are forbidden by the 2026-09-06 master canon. */
  minPositions?: number;
  /** @deprecated Fixed-N bounds are forbidden by the 2026-09-06 master canon. */
  maxPositions?: number;
  marginalUtilityThreshold?: number;

  /**
   * @deprecated Forbidden as clean-selection authority. Generic redundancy or
   * causal-driver overlap is not a measured correlated-risk estimate. Real
   * correlated risk must be modeled in validated risk inputs / portfolio risk
   * machinery with provenance, not injected as an unlabeled pair penalty.
   */
  pairwiseRedundancyPenaltyPct?: Record<string, number>;
};

export type CapitalBlindSelectionResult = {
  status: 'SELECTED' | 'INSUFFICIENT_ELIGIBLE_CANDIDATES' | 'EVIDENCE_PENDING';
  selectedTickers: string[];
  /** Cardinality returned by this heuristic run. */
  selectedN: number | null;
  /**
   * Compatibility field. This module does not prove global combinatorial
   * optimality, so it must never publish an OPTIMAL_N claim.
   */
  optimalN: null;
  marginalUtilityByTicker: Record<string, number>;
  selectionMode: 'GREEDY_MARGINAL_HEURISTIC';
  globalOptimalityProven: false;
  ignoredPersonalStateFields: readonly [
    'currentInvestedEur',
    'currentPositionWeight',
    'personalPnLPct',
    'personalAverageCost',
    'isCurrentlyHeld'
  ];
  emitsTargetWeights: false;
  emitsEntryTiming: false;
};

const IGNORED_PERSONAL_STATE_FIELDS = [
  'currentInvestedEur',
  'currentPositionWeight',
  'personalPnLPct',
  'personalAverageCost',
  'isCurrentlyHeld',
] as const;

const SELECTION_MODE = 'GREEDY_MARGINAL_HEURISTIC' as const;

function finite(x: number | undefined): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

function optionalFinite(x: number | undefined): boolean {
  return x === undefined || finite(x);
}

function hasForbiddenPairwiseRedundancyAuthority(policy: CapitalBlindSelectionPolicy): boolean {
  return policy.pairwiseRedundancyPenaltyPct !== undefined;
}

function invalidResult(): CapitalBlindSelectionResult {
  return {
    status: 'EVIDENCE_PENDING',
    selectedTickers: [],
    selectedN: null,
    optimalN: null,
    marginalUtilityByTicker: {},
    selectionMode: SELECTION_MODE,
    globalOptimalityProven: false,
    ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
    emitsTargetWeights: false,
    emitsEntryTiming: false,
  };
}

function validateCandidate(c: CapitalBlindCandidate): boolean {
  return Boolean(c.ticker?.trim()) &&
    finite(c.expectedCompoundReturnPct) &&
    finite(c.permanentLossRiskPct) &&
    finite(c.fragilityPenaltyPct) &&
    optionalFinite(c.robustnessBenefitPct) &&
    optionalFinite(c.causalDiversificationBenefitPct) &&
    optionalFinite(c.complexityPenaltyPct);
}

function baseUtility(c: CapitalBlindCandidate): number {
  // INVIOLABLE POINT ZERO RULE:
  // - no causal-diversification bonus;
  // - no sector/driver/narrative variety bonus;
  // - no automatic penalty for shared causal labels.
  // Real correlated risk belongs in validated risk inputs / portfolio-risk
  // machinery, not in label overlap.
  return c.expectedCompoundReturnPct
    - c.permanentLossRiskPct
    - c.fragilityPenaltyPct
    + (c.robustnessBenefitPct ?? 0)
    - (c.complexityPenaltyPct ?? 0);
}

function entityKey(c: CapitalBlindCandidate): string {
  return (c.canonicalEntityId?.trim() || c.ticker.trim()).toUpperCase();
}

function deduplicateEntities(candidates: CapitalBlindCandidate[]): CapitalBlindCandidate[] | null {
  const byEntity = new Map<string, CapitalBlindCandidate>();

  for (const candidate of candidates) {
    const key = entityKey(candidate);
    const existing = byEntity.get(key);
    if (!existing) {
      byEntity.set(key, candidate);
      continue;
    }

    // Duplicate raw appearances must not create extra opportunities. If the
    // normalized evidence differs, fail closed rather than cherry-picking the
    // more favorable duplicate.
    const comparableExisting = JSON.stringify({
      hardGatesPassed: existing.hardGatesPassed,
      expectedCompoundReturnPct: existing.expectedCompoundReturnPct,
      permanentLossRiskPct: existing.permanentLossRiskPct,
      fragilityPenaltyPct: existing.fragilityPenaltyPct,
      robustnessBenefitPct: existing.robustnessBenefitPct ?? 0,
      causalDiversificationBenefitPct: existing.causalDiversificationBenefitPct ?? 0,
      complexityPenaltyPct: existing.complexityPenaltyPct ?? 0,
      causalDrivers: [...(existing.causalDrivers ?? [])].sort(),
    });
    const comparableCandidate = JSON.stringify({
      hardGatesPassed: candidate.hardGatesPassed,
      expectedCompoundReturnPct: candidate.expectedCompoundReturnPct,
      permanentLossRiskPct: candidate.permanentLossRiskPct,
      fragilityPenaltyPct: candidate.fragilityPenaltyPct,
      robustnessBenefitPct: candidate.robustnessBenefitPct ?? 0,
      causalDiversificationBenefitPct: candidate.causalDiversificationBenefitPct ?? 0,
      complexityPenaltyPct: candidate.complexityPenaltyPct ?? 0,
      causalDrivers: [...(candidate.causalDrivers ?? [])].sort(),
    });

    if (comparableExisting !== comparableCandidate) return null;
  }

  return [...byEntity.values()];
}

export function calculateMarginalPortfolioContribution(
  candidate: CapitalBlindCandidate,
  _selected: CapitalBlindCandidate[],
  policy: CapitalBlindSelectionPolicy = {},
): number {
  if (hasForbiddenPairwiseRedundancyAuthority(policy)) {
    throw new Error('PAIRWISE_REDUNDANCY_WITHOUT_MEASURED_RISK_FORBIDDEN');
  }
  return baseUtility(candidate);
}

export function selectCapitalBlindPortfolioOmega(
  candidates: CapitalBlindCandidate[],
  policy: CapitalBlindSelectionPolicy = {},
): CapitalBlindSelectionResult {
  // A caller may not smuggle a fixed cardinality target or unproven
  // diversification/redundancy authority into clean Point-Zero selection.
  if (
    policy.minPositions !== undefined ||
    policy.maxPositions !== undefined ||
    hasForbiddenPairwiseRedundancyAuthority(policy)
  ) {
    return invalidResult();
  }

  const marginalUtilityThreshold = policy.marginalUtilityThreshold ?? 0;
  if (!finite(marginalUtilityThreshold) || marginalUtilityThreshold < 0 ||
      candidates.some(c => !validateCandidate(c))) {
    return invalidResult();
  }

  const deduplicated = deduplicateEntities(candidates);
  if (!deduplicated) return invalidResult();

  const eligible = deduplicated.filter(c => c.hardGatesPassed);
  if (eligible.length === 0) {
    return {
      status: 'INSUFFICIENT_ELIGIBLE_CANDIDATES',
      selectedTickers: [],
      selectedN: 0,
      optimalN: null,
      marginalUtilityByTicker: {},
      selectionMode: SELECTION_MODE,
      globalOptimalityProven: false,
      ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
      emitsTargetWeights: false,
      emitsEntryTiming: false,
    };
  }

  const remaining = [...eligible];
  const selected: CapitalBlindCandidate[] = [];
  const marginalUtilityByTicker: Record<string, number> = {};

  // Point Zero: begin with an empty portfolio. This module is deliberately a
  // deterministic greedy marginal heuristic. It may produce a useful selected
  // set, but it cannot label that set or its cardinality globally optimal.
  while (remaining.length > 0) {
    const ranked = remaining
      .map(c => ({ c, marginal: calculateMarginalPortfolioContribution(c, selected, policy) }))
      .sort((a, b) => b.marginal - a.marginal || a.c.ticker.localeCompare(b.c.ticker));

    const best = ranked[0];
    if (!best || best.marginal <= marginalUtilityThreshold) break;

    selected.push(best.c);
    marginalUtilityByTicker[best.c.ticker] = best.marginal;
    const index = remaining.findIndex(c => entityKey(c) === entityKey(best.c));
    remaining.splice(index, 1);
  }

  return {
    status: 'SELECTED',
    selectedTickers: selected.map(c => c.ticker),
    selectedN: selected.length,
    optimalN: null,
    marginalUtilityByTicker,
    selectionMode: SELECTION_MODE,
    globalOptimalityProven: false,
    ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
    emitsTargetWeights: false,
    emitsEntryTiming: false,
  };
}
