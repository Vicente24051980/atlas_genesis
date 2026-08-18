export const GURUS_FUNDS_SCORE_WEIGHTS = {
  conviction: 0.25,
  accumulation: 0.20,
  convergence: 0.15,
  persistence: 0.10,
  exceptionality: 0.10,
  contrarian: 0.10,
  evidenceFreshness: 0.10,
} as const;

export type GuruStyle =
  | 'QUALITY_VALUE'
  | 'DEEP_VALUE'
  | 'MACRO_INFLECTION'
  | 'CONCENTRATED_QUALITY'
  | 'CONTRARIAN'
  | 'TECH_PUBLIC'
  | 'CREDIT_CYCLE'
  | 'MULTISTRATEGY'
  | 'OTHER';

export type GuruAction = 'NEW' | 'INCREASE' | 'HOLD' | 'REDUCE' | 'EXIT' | 'UNKNOWN';

export type GuruPositionObservation = {
  manager: string;
  style: GuruStyle;
  action: GuruAction;
  portfolioWeightPct?: number | null;
  positionChangePct?: number | null;
  quartersHeld?: number | null;
  sourceQuality: number;
  ageDays: number;
  evidenceId: string;
};

export type GurusFundsCandidateInput = {
  ticker: string;
  observations: GuruPositionObservation[];
  contrarianScore?: number;
  exceptionalityOverride?: number;
};

export type GurusFundsFactorScores = Record<keyof typeof GURUS_FUNDS_SCORE_WEIGHTS, number>;

export type GuruSignalState =
  | 'WEAK_SIGNAL'
  | 'NEUTRAL'
  | 'DISCOVERY'
  | 'ACCUMULATION'
  | 'SMART_MONEY_CONVERGENCE'
  | 'STRONG_GURU_CONVICTION';

export type GurusFundsResult = {
  ticker: string;
  score: number;
  rawState: GuruSignalState;
  state: GuruSignalState;
  factors: GurusFundsFactorScores;
  managerCount: number;
  styleCount: number;
  accumulators: number;
  distributors: number;
  newPositions: number;
  exits: number;
  divergence: boolean;
  evidenceIds: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  outputs: Array<
    | 'GURU_CONVICTION_OMEGA'
    | 'SMART_MONEY_CONVERGENCE_OMEGA'
    | 'NEW_POSITION_OMEGA'
    | 'ACCUMULATION_OMEGA'
    | 'DISTRIBUTION_OMEGA'
    | 'CONTRARIAN_OMEGA'
  >;
  reasons: string[];
  action: 'IGNORE' | 'MONITOR' | 'RESEARCH' | 'HANDOFF_TO_ATLAS_GATES';
};

export const GURUS_FUNDS_OMEGA_MANIFEST = {
  id: 'GURUS_FUNDS_OMEGA_V1_0',
  version: '1.0.0',
  status: 'canonical',
  deterministic: true,
  pure: true,
  idempotent: true,
  mission:
    'Detect high-information capital allocation by differentiated elite investors and funds, emphasizing conviction, new positions, accumulation, cross-style convergence and divergence without treating guru ownership as a BUY signal.',
  invariants: [
    'GURU_SIGNAL_IS_NOT_BUY',
    'THIRTEEN_F_IS_DELAYED_AND_INCOMPLETE',
    'CONCENTRATION_MATTERS_MORE_THAN_RAW_HOLDER_COUNT',
    'CROSS_STYLE_CONVERGENCE_MATTERS_MORE_THAN_CORRELATED_MANAGER_COUNT',
    'DIVERGENCE_MUST_REMAIN_VISIBLE',
    'ESTIMATED_ENTRY_PRICE_IS_NOT_EXACT_COST_BASIS',
    'NO_PORTFOLIO_ORDER_EMITTED_BY_ENGINE',
    'CANDIDATES_REQUIRE_ECONOMIC_PROOF_QUALITY_VALUATION_EXPECTED_RETURN_AND_FALSIFIERS',
    'PRINCIPAL_GOOD_COMPANIES_CHEAP_HISTORICAL_DISLOCATION_AND_MONEY_ROTATION_REMAIN_INDEPENDENT',
  ] as const,
} as const;

function assertScore(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`gurus_funds_score_out_of_range:${name}`);
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function average(values: number[], fallback = 50): number {
  if (values.length === 0) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function convictionFromWeight(weightPct?: number | null): number | null {
  if (weightPct == null || !Number.isFinite(weightPct) || weightPct < 0) return null;
  return Math.min(100, (weightPct / 15) * 100);
}

function accumulationFromObservation(observation: GuruPositionObservation): number {
  const change = observation.positionChangePct ?? 0;
  switch (observation.action) {
    case 'NEW':
      return 100;
    case 'INCREASE':
      return Math.min(100, 60 + Math.max(0, change) * 0.4);
    case 'HOLD':
      return 45;
    case 'REDUCE':
      return Math.max(0, 25 - Math.abs(Math.min(0, change)) * 0.2);
    case 'EXIT':
      return 0;
    default:
      return 35;
  }
}

function persistenceFromQuarters(quarters?: number | null): number | null {
  if (quarters == null || !Number.isFinite(quarters) || quarters < 0) return null;
  return Math.min(100, (quarters / 8) * 100);
}

function freshnessEvidence(observation: GuruPositionObservation): number {
  assertScore('sourceQuality', observation.sourceQuality);
  if (!Number.isFinite(observation.ageDays) || observation.ageDays < 0) {
    throw new Error('gurus_funds_invalid_age_days');
  }
  const freshness = Math.max(0, 100 - observation.ageDays * 1.5);
  return (freshness * observation.sourceQuality) / 100;
}

function deriveExceptionality(observations: GuruPositionObservation[]): number {
  if (observations.length === 0) return 0;
  const scores = observations.map((observation) => {
    const weight = observation.portfolioWeightPct ?? 0;
    const change = observation.positionChangePct ?? 0;
    if (observation.action === 'NEW' && weight >= 10) return 100;
    if (observation.action === 'NEW' && weight >= 4) return 90;
    if (observation.action === 'NEW') return 75;
    if (observation.action === 'INCREASE' && change >= 100) return 100;
    if (observation.action === 'INCREASE' && change >= 50) return 90;
    if (observation.action === 'INCREASE' && change >= 20) return 75;
    if (observation.action === 'INCREASE') return 60;
    if (observation.action === 'REDUCE' || observation.action === 'EXIT') return 10;
    return 40;
  });
  return Math.max(...scores);
}

function deriveConvergence(managerCount: number, styleCount: number): number {
  if (managerCount <= 0) return 0;
  return Math.min(100, managerCount * 12 + styleCount * 16);
}

export function calculateGurusFundsScore(factors: GurusFundsFactorScores): number {
  let score = 0;
  for (const key of Object.keys(GURUS_FUNDS_SCORE_WEIGHTS) as Array<keyof GurusFundsFactorScores>) {
    assertScore(key, factors[key]);
    score += factors[key] * GURUS_FUNDS_SCORE_WEIGHTS[key];
  }
  return round2(score);
}

export function classifyGuruSignalState(score: number): GuruSignalState {
  assertScore('composite', score);
  if (score >= 85) return 'STRONG_GURU_CONVICTION';
  if (score >= 75) return 'SMART_MONEY_CONVERGENCE';
  if (score >= 65) return 'ACCUMULATION';
  if (score >= 55) return 'DISCOVERY';
  if (score >= 40) return 'NEUTRAL';
  return 'WEAK_SIGNAL';
}

function stateRank(state: GuruSignalState): number {
  return {
    WEAK_SIGNAL: 0,
    NEUTRAL: 1,
    DISCOVERY: 2,
    ACCUMULATION: 3,
    SMART_MONEY_CONVERGENCE: 4,
    STRONG_GURU_CONVICTION: 5,
  }[state];
}

export function assessGurusFundsCandidate(input: GurusFundsCandidateInput): GurusFundsResult {
  if (!input.ticker.trim()) throw new Error('gurus_funds_ticker_required');
  if (input.observations.length === 0) throw new Error('gurus_funds_observation_required');

  const managers = new Set(input.observations.map((observation) => observation.manager));
  const styles = new Set(input.observations.map((observation) => observation.style));
  const evidenceIds = Array.from(new Set(input.observations.map((observation) => observation.evidenceId).filter(Boolean)));

  const accumulators = input.observations.filter((observation) => observation.action === 'NEW' || observation.action === 'INCREASE').length;
  const distributors = input.observations.filter((observation) => observation.action === 'REDUCE' || observation.action === 'EXIT').length;
  const newPositions = input.observations.filter((observation) => observation.action === 'NEW').length;
  const exits = input.observations.filter((observation) => observation.action === 'EXIT').length;

  const convictionValues = input.observations
    .map((observation) => convictionFromWeight(observation.portfolioWeightPct))
    .filter((value): value is number => value != null)
    .sort((a, b) => b - a)
    .slice(0, 3);

  const persistenceValues = input.observations
    .map((observation) => persistenceFromQuarters(observation.quartersHeld))
    .filter((value): value is number => value != null);

  const contrarian = input.contrarianScore ?? 50;
  const exceptionality = input.exceptionalityOverride ?? deriveExceptionality(input.observations);
  assertScore('contrarian', contrarian);
  assertScore('exceptionalityOverride', exceptionality);

  const factors: GurusFundsFactorScores = {
    conviction: round2(average(convictionValues, 40)),
    accumulation: round2(average(input.observations.map(accumulationFromObservation), 0)),
    convergence: round2(deriveConvergence(managers.size, styles.size)),
    persistence: round2(average(persistenceValues, 50)),
    exceptionality: round2(exceptionality),
    contrarian: round2(contrarian),
    evidenceFreshness: round2(average(input.observations.map(freshnessEvidence), 0)),
  };

  const score = calculateGurusFundsScore(factors);
  const rawState = classifyGuruSignalState(score);
  const reasons: string[] = [];
  const divergence = accumulators > 0 && distributors > 0;
  let state = rawState;

  if (evidenceIds.length < managers.size) {
    reasons.push('not_every_manager_has_unique_traceable_evidence');
  }

  const distributionShare = distributors / input.observations.length;
  if (distributionShare >= 0.4 && stateRank(state) > stateRank('ACCUMULATION')) {
    state = 'ACCUMULATION';
    reasons.push('state_capped_by_material_cross_manager_distribution');
  }

  if (divergence) reasons.push('cross_manager_divergence_visible');
  if (styles.size >= 3 && managers.size >= 3) reasons.push('independent_cross_style_convergence');
  if (newPositions >= 2) reasons.push('multiple_independent_new_positions');
  if (accumulators >= 3) reasons.push('broad_guru_accumulation');
  if (distributors >= 2) reasons.push('material_distribution_requires_review');

  const avgSourceQuality = average(input.observations.map((observation) => observation.sourceQuality), 0);
  const confidence: GurusFundsResult['confidence'] =
    evidenceIds.length >= 3 && managers.size >= 3 && avgSourceQuality >= 80
      ? 'HIGH'
      : evidenceIds.length >= 2 && managers.size >= 2 && avgSourceQuality >= 65
        ? 'MEDIUM'
        : 'LOW';

  const outputs: GurusFundsResult['outputs'] = [];
  if (factors.conviction >= 70) outputs.push('GURU_CONVICTION_OMEGA');
  if (factors.convergence >= 70) outputs.push('SMART_MONEY_CONVERGENCE_OMEGA');
  if (newPositions > 0) outputs.push('NEW_POSITION_OMEGA');
  if (accumulators > distributors) outputs.push('ACCUMULATION_OMEGA');
  if (distributors > 0) outputs.push('DISTRIBUTION_OMEGA');
  if (contrarian >= 70) outputs.push('CONTRARIAN_OMEGA');

  let action: GurusFundsResult['action'] = 'MONITOR';
  if (state === 'WEAK_SIGNAL') action = 'IGNORE';
  else if (state === 'DISCOVERY' || state === 'ACCUMULATION') action = 'RESEARCH';
  else if (state === 'SMART_MONEY_CONVERGENCE' || state === 'STRONG_GURU_CONVICTION') action = 'HANDOFF_TO_ATLAS_GATES';

  reasons.push('guru_signal_requires_economic_proof_quality_valuation_expected_return_and_falsifiers_before_portfolio_action');

  return {
    ticker: input.ticker.toUpperCase(),
    score,
    rawState,
    state,
    factors,
    managerCount: managers.size,
    styleCount: styles.size,
    accumulators,
    distributors,
    newPositions,
    exits,
    divergence,
    evidenceIds,
    confidence,
    outputs,
    reasons,
    action,
  };
}

export function rankGurusFundsCandidates(inputs: GurusFundsCandidateInput[]): GurusFundsResult[] {
  return inputs
    .map(assessGurusFundsCandidate)
    .sort((a, b) => b.score - a.score || b.managerCount - a.managerCount || a.ticker.localeCompare(b.ticker));
}
