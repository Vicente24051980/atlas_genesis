export const CAPITAL_BLIND_PORTFOLIO_SELECTION_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;
export const MIN_PORTFOLIO_POSITIONS = 20 as const;
export const MAX_PORTFOLIO_POSITIONS = 35 as const;

export type CapitalBlindCandidate = {
  ticker: string;
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
  minPositions?: number;
  maxPositions?: number;
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
  const minPositions = policy.minPositions ?? MIN_PORTFOLIO_POSITIONS;
  const maxPositions = policy.maxPositions ?? MAX_PORTFOLIO_POSITIONS;

  if (!Number.isInteger(minPositions) || !Number.isInteger(maxPositions) ||
      minPositions < MIN_PORTFOLIO_POSITIONS || maxPositions > MAX_PORTFOLIO_POSITIONS ||
      minPositions > maxPositions) {
    return {
      status: 'EVIDENCE_PENDING', selectedTickers: [], optimalN: null,
      marginalUtilityByTicker: {}, ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
      emitsTargetWeights: false, emitsEntryTiming: false,
    };
  }

  if (candidates.some(c => !validateCandidate(c))) {
    return {
      status: 'EVIDENCE_PENDING', selectedTickers: [], optimalN: null,
      marginalUtilityByTicker: {}, ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
      emitsTargetWeights: false, emitsEntryTiming: false,
    };
  }

  const eligible = candidates.filter(c => c.hardGatesPassed);
  if (eligible.length < minPositions) {
    return {
      status: 'INSUFFICIENT_ELIGIBLE_CANDIDATES', selectedTickers: [], optimalN: null,
      marginalUtilityByTicker: {}, ignoredPersonalStateFields: IGNORED_PERSONAL_STATE_FIELDS,
      emitsTargetWeights: false, emitsEntryTiming: false,
    };
  }

  const remaining = [...eligible];
  const selected: CapitalBlindCandidate[] = [];
  const marginalUtilityByTicker: Record<string, number> = {};

  while (selected.length < maxPositions && remaining.length > 0) {
    const ranked = remaining
      .map(c => ({ c, marginal: calculateMarginalPortfolioContribution(c, selected, policy) }))
      .sort((a, b) => b.marginal - a.marginal || a.c.ticker.localeCompare(b.c.ticker));

    const best = ranked[0];
    if (!best) break;

    // The cardinality floor is a portfolio-design constraint. Above the floor,
    // an additional ticker must improve the portfolio on a marginal basis.
    if (selected.length >= minPositions && best.marginal <= 0) break;

    selected.push(best.c);
    marginalUtilityByTicker[best.c.ticker] = best.marginal;
    const index = remaining.findIndex(c => c.ticker === best.c.ticker);
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
