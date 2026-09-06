export const CAPITAL_BLIND_PORTFOLIO_SELECTION_OMEGA_VERSION = '2026-09-06-v2.0.0' as const;

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
  causalDiversificationBenefitPct?: number;
  complexityPenaltyPct?: number;
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
  pairwiseRedundancyPenaltyPct?: Record<string, number>;
};

export type CapitalBlindSelectionResult = {
  status: 'SELECTED' | 'INSUFFICIENT_ELIGIBLE_CANDIDATES' | 'EVIDENCE_PENDING';
  selectedTickers: string[];
  optimalN: number | null;
  marginalUtilityByTicker: Record<string, number>;
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

function finite(x: number | undefined): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

function optionalFinite(x: number | undefined): boolean {
  return x === undefined || finite(x);
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
  return c.expectedCompoundReturnPct
    - c.permanentLossRiskPct
    - c.fragilityPenaltyPct
    + (c.robustnessBenefitPct ?? 0)
    + (c.causalDiversificationBenefitPct ?? 0)
    - (c.complexityPenaltyPct ?? 0);
}

function pairKey(a: string, b: string): string {
  return [a.toUpperCase(), b.toUpperCase()].sort().join('::');
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

function redundancyPenalty(
  candidate: CapitalBlindCandidate,
  selected: CapitalBlindCandidate[],
  policy: CapitalBlindSelectionPolicy,
): number {
  const explicit = policy.pairwiseRedundancyPenaltyPct ?? {};
  let penalty = 0;
  for (const existing of selected) {
    const configured = explicit[pairKey(candidate.ticker, existing.ticker)];
    if (finite(configured)) penalty += configured;

    const a = new Set((candidate.causalDrivers ?? []).map(x => x.toLowerCase()));
    const b = new Set((existing.causalDrivers ?? []).map(x => x.toLowerCase()));
    const overlap = [...a].filter(x => b.has(x)).length;
    const denom = Math.max(1, Math.min(a.size || 1, b.size || 1));
    penalty += overlap / denom;
  }
  return penalty;
}

export function calculateMarginalPortfolioContribution(
  candidate: CapitalBlindCandidate,
  selected: CapitalBlindCandidate[],
  policy: CapitalBlindSelectionPolicy = {},
): number {
  return baseUtility(candidate) - redundancyPenalty(candidate, selected, policy);
}

export function selectCapitalBlindPortfolioOmega(
  candidates: CapitalBlindCandidate[],
  policy: CapitalBlindSelectionPolicy = {},
): CapitalBlindSelectionResult {
  // A caller may not smuggle a fixed cardinality target into clean selection.
  if (policy.minPositions !== undefined || policy.maxPositions !== undefined) {
    return {
      status: 'EVIDENCE_PENDING', selectedTickers: [], optimalN: null,
      marginalUtilityByTicker: {}, ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
      emitsTargetWeights: false, emitsEntryTiming: false,
    };
  }

  const marginalUtilityThreshold = policy.marginalUtilityThreshold ?? 0;
  if (!finite(marginalUtilityThreshold) || marginalUtilityThreshold < 0 ||
      candidates.some(c => !validateCandidate(c))) {
    return {
      status: 'EVIDENCE_PENDING', selectedTickers: [], optimalN: null,
      marginalUtilityByTicker: {}, ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
      emitsTargetWeights: false, emitsEntryTiming: false,
    };
  }

  const deduplicated = deduplicateEntities(candidates);
  if (!deduplicated) {
    return {
      status: 'EVIDENCE_PENDING', selectedTickers: [], optimalN: null,
      marginalUtilityByTicker: {}, ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
      emitsTargetWeights: false, emitsEntryTiming: false,
    };
  }

  const eligible = deduplicated.filter(c => c.hardGatesPassed);
  if (eligible.length === 0) {
    return {
      status: 'INSUFFICIENT_ELIGIBLE_CANDIDATES', selectedTickers: [], optimalN: 0,
      marginalUtilityByTicker: {}, ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
      emitsTargetWeights: false, emitsEntryTiming: false,
    };
  }

  const remaining = [...eligible];
  const selected: CapitalBlindCandidate[] = [];
  const marginalUtilityByTicker: Record<string, number> = {};

  // Point Zero: begin with an empty portfolio. At every step all remaining
  // entities compete for the next scarce slot. Expansion stops immediately
  // when even the best available addition fails the marginal-utility test.
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
    optimalN: selected.length,
    marginalUtilityByTicker,
    ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
    emitsTargetWeights: false,
    emitsEntryTiming: false,
  };
}