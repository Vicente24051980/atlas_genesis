export const OPEN_SOURCE_QUANT_AI_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export const OPEN_SOURCE_QUANT_AI_OMEGA_GOVERNANCE = {
  status: 'ACTIVE_SHADOW_OOS_REQUIRED',
  directAtlasScoreWeight: 0,
  canAuthorizeBuySell: false,
  canOverridePrincipalOmega: false,
  canOverrideFalsifierVeto: false,
  canOverrideDecisionSafetyGate: false,
  canAuthorizeBrokerExecution: false,
  externalObservationsAreEvidenceCandidatesOnly: true,
  promotionAuthority: 'MODEL_LEARNING_GOVERNANCE_OMEGA_V1',
  inspirations: [
    'MICROSOFT_QLIB_ALPHA158_ALPHA360',
    'MICROSOFT_RD_AGENT',
    'ALPHAFORGE',
    'KRONOS',
    'MASTER',
    'TRADINGAGENTS',
    'FINGPT_FINAGENT',
    'FINRL_X',
    'SKFOLIO_RISKFOLIO',
  ],
} as const;

export type ResearchEvidenceState = 'CONFIRMED' | 'EVIDENCE_PENDING';

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function finite(value: number): boolean {
  return Number.isFinite(value);
}

function finiteSeries(values: readonly number[], minimum = 2): boolean {
  return values.length >= minimum && values.every(finite);
}

export function mean(values: readonly number[]): number | null {
  if (!finiteSeries(values, 1)) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sampleStd(values: readonly number[]): number | null {
  if (!finiteSeries(values, 2)) return null;
  const m = mean(values) as number;
  const variance = values.reduce((sum, value) => sum + (value - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function rankWithTies(values: readonly number[]): number[] {
  const indexed = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i + 1;
    while (j < indexed.length && indexed[j].value === indexed[i].value) j += 1;
    const averageRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k += 1) ranks[indexed[k].index] = averageRank;
    i = j;
  }
  return ranks;
}

export function pearsonCorrelation(a: readonly number[], b: readonly number[]): number | null {
  if (a.length !== b.length || !finiteSeries(a, 3) || !finiteSeries(b, 3)) return null;
  const ma = mean(a) as number;
  const mb = mean(b) as number;
  let numerator = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i += 1) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    numerator += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const denominator = Math.sqrt(da * db);
  return denominator > 0 ? numerator / denominator : null;
}

export function spearmanCorrelation(a: readonly number[], b: readonly number[]): number | null {
  if (a.length !== b.length || !finiteSeries(a, 3) || !finiteSeries(b, 3)) return null;
  return pearsonCorrelation(rankWithTies(a), rankWithTies(b));
}

export function informationCoefficient(factorValues: readonly number[], forwardReturns: readonly number[]): number | null {
  return pearsonCorrelation(factorValues, forwardReturns);
}

export function rankInformationCoefficient(factorValues: readonly number[], forwardReturns: readonly number[]): number | null {
  return spearmanCorrelation(factorValues, forwardReturns);
}

export function informationCoefficientRatio(icHistory: readonly number[]): number | null {
  if (!finiteSeries(icHistory, 3)) return null;
  const m = mean(icHistory) as number;
  const sd = sampleStd(icHistory) as number;
  return sd > 0 ? m / sd : null;
}

export interface BenjaminiHochbergResult {
  alpha: number;
  adjustedPValues: number[];
  rejected: boolean[];
}

export function benjaminiHochbergFdr(pValues: readonly number[], alpha = 0.05): BenjaminiHochbergResult | null {
  if (!pValues.length || !pValues.every((p) => finite(p) && p >= 0 && p <= 1) || !finite(alpha) || alpha <= 0 || alpha >= 1) {
    return null;
  }
  const m = pValues.length;
  const sorted = pValues.map((p, index) => ({ p, index })).sort((a, b) => a.p - b.p);
  const adjustedSorted = new Array<number>(m);
  let runningMin = 1;
  for (let i = m - 1; i >= 0; i -= 1) {
    const rank = i + 1;
    const adjusted = Math.min(1, (sorted[i].p * m) / rank);
    runningMin = Math.min(runningMin, adjusted);
    adjustedSorted[i] = runningMin;
  }
  const adjustedPValues = new Array<number>(m);
  const rejected = new Array<boolean>(m);
  sorted.forEach((entry, i) => {
    adjustedPValues[entry.index] = adjustedSorted[i];
    rejected[entry.index] = adjustedSorted[i] <= alpha;
  });
  return { alpha, adjustedPValues, rejected };
}

export interface FactorAuditInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  factorValues: number[];
  forwardReturns: number[];
  icHistory?: number[];
  quantileForwardReturns?: number[];
  redundancyAbsCorrelation?: number;
  annualTurnover?: number;
}

export interface FactorAuditResult {
  evidence: ResearchEvidenceState;
  ic: number | null;
  rankIc: number | null;
  icir: number | null;
  monotonicity: number | null;
  redundancyAbsCorrelation: number | null;
  annualTurnover: number | null;
  directAtlasScoreDelta: 0;
  reasons: string[];
}

export function auditFactorCandidate(input: FactorAuditInput): FactorAuditResult {
  const evidenceOk = input.evidenceTraceable && input.evidenceIds.filter((id) => id.trim().length > 0).length >= 2;
  if (!evidenceOk || input.factorValues.length !== input.forwardReturns.length || !finiteSeries(input.factorValues, 20) || !finiteSeries(input.forwardReturns, 20)) {
    return {
      evidence: 'EVIDENCE_PENDING', ic: null, rankIc: null, icir: null, monotonicity: null,
      redundancyAbsCorrelation: null, annualTurnover: null, directAtlasScoreDelta: 0,
      reasons: ['Factor research requires traceable evidence and at least 20 aligned finite factor/forward-return observations.'],
    };
  }
  const ic = informationCoefficient(input.factorValues, input.forwardReturns);
  const rankIc = rankInformationCoefficient(input.factorValues, input.forwardReturns);
  const icir = input.icHistory && finiteSeries(input.icHistory, 3) ? informationCoefficientRatio(input.icHistory) : null;
  const monotonicity = input.quantileForwardReturns && finiteSeries(input.quantileForwardReturns, 3)
    ? spearmanCorrelation(input.quantileForwardReturns.map((_, i) => i + 1), input.quantileForwardReturns)
    : null;
  const redundancyAbsCorrelation = input.redundancyAbsCorrelation != null && finite(input.redundancyAbsCorrelation)
    ? clamp(Math.abs(input.redundancyAbsCorrelation))
    : null;
  const annualTurnover = input.annualTurnover != null && finite(input.annualTurnover) && input.annualTurnover >= 0 ? input.annualTurnover : null;
  return {
    evidence: 'CONFIRMED', ic, rankIc, icir, monotonicity, redundancyAbsCorrelation, annualTurnover,
    directAtlasScoreDelta: 0,
    reasons: [
      'IC and RankIC are diagnostics, never direct ATLAS structural-score points.',
      'A factor remains SHADOW until the Statistical Backtest Firewall and Model Learning Governance both pass it.',
      'Redundant factors may explain the same effect but cannot earn duplicate score authority.',
    ],
  };
}

export interface BacktestFirewallThresholds {
  minOosObservations: number;
  minOosRankIc: number;
  minOosIcir: number;
  maxAdjustedPValue: number;
  maxRedundancyAbsCorrelation: number;
  minRegimePositiveShare: number;
}

export const DEFAULT_BACKTEST_FIREWALL_THRESHOLDS: BacktestFirewallThresholds = {
  minOosObservations: 126,
  minOosRankIc: 0.02,
  minOosIcir: 0.25,
  maxAdjustedPValue: 0.05,
  maxRedundancyAbsCorrelation: 0.85,
  minRegimePositiveShare: 0.60,
};

export interface BacktestFirewallInput {
  oosObservations: number;
  oosRankIc: number;
  oosIcir: number;
  adjustedPValue: number;
  redundancyAbsCorrelation: number;
  regimePositiveShare: number;
  grossAnnualizedAlphaPct: number;
  estimatedAnnualCostsPct: number;
  purgedValidation: boolean;
  embargoApplied: boolean;
  walkForwardUsed: boolean;
  pointInTimeData: boolean;
  lookAheadAuditPassed: boolean;
  survivorshipAuditPassed: boolean;
  thresholds?: Partial<BacktestFirewallThresholds>;
}

export type BacktestFirewallState = 'PASS_SHADOW_ELIGIBLE' | 'WATCH' | 'REJECT' | 'EVIDENCE_PENDING';

export interface BacktestFirewallResult {
  state: BacktestFirewallState;
  netAnnualizedAlphaPct: number | null;
  hardFailures: string[];
  softWarnings: string[];
  thresholds: BacktestFirewallThresholds;
  directAtlasScoreDelta: 0;
}

export function evaluateStatisticalBacktestFirewall(input: BacktestFirewallInput): BacktestFirewallResult {
  const thresholds = { ...DEFAULT_BACKTEST_FIREWALL_THRESHOLDS, ...(input.thresholds ?? {}) };
  const numeric = [input.oosObservations, input.oosRankIc, input.oosIcir, input.adjustedPValue, input.redundancyAbsCorrelation,
    input.regimePositiveShare, input.grossAnnualizedAlphaPct, input.estimatedAnnualCostsPct];
  if (!numeric.every(finite) || input.oosObservations < 0 || input.adjustedPValue < 0 || input.adjustedPValue > 1 ||
      input.redundancyAbsCorrelation < 0 || input.redundancyAbsCorrelation > 1 || input.regimePositiveShare < 0 || input.regimePositiveShare > 1) {
    return { state: 'EVIDENCE_PENDING', netAnnualizedAlphaPct: null, hardFailures: ['Invalid or non-finite firewall inputs.'], softWarnings: [], thresholds, directAtlasScoreDelta: 0 };
  }
  const netAnnualizedAlphaPct = input.grossAnnualizedAlphaPct - Math.max(0, input.estimatedAnnualCostsPct);
  const hardFailures: string[] = [];
  const softWarnings: string[] = [];
  if (!input.pointInTimeData) hardFailures.push('Point-in-time data requirement failed.');
  if (!input.lookAheadAuditPassed) hardFailures.push('Look-ahead audit failed.');
  if (!input.survivorshipAuditPassed) hardFailures.push('Survivorship-bias audit failed.');
  if (!input.purgedValidation) hardFailures.push('Purged validation is absent.');
  if (!input.embargoApplied) hardFailures.push('Embargo is absent where labels can overlap.');
  if (!input.walkForwardUsed) hardFailures.push('Walk-forward validation is absent.');
  if (input.oosObservations < thresholds.minOosObservations) hardFailures.push('Insufficient out-of-sample observations.');
  if (input.adjustedPValue > thresholds.maxAdjustedPValue) hardFailures.push('Multiple-testing-adjusted significance failed.');
  if (netAnnualizedAlphaPct <= 0) hardFailures.push('Estimated costs erase gross alpha.');
  if (input.redundancyAbsCorrelation > thresholds.maxRedundancyAbsCorrelation) softWarnings.push('Factor is highly redundant with an existing signal.');
  if (input.oosRankIc < thresholds.minOosRankIc) softWarnings.push('Out-of-sample RankIC is below the research hurdle.');
  if (input.oosIcir < thresholds.minOosIcir) softWarnings.push('Out-of-sample ICIR is below the research hurdle.');
  if (input.regimePositiveShare < thresholds.minRegimePositiveShare) softWarnings.push('Signal is fragile across market regimes.');
  let state: BacktestFirewallState = 'PASS_SHADOW_ELIGIBLE';
  if (hardFailures.length) state = 'REJECT';
  else if (softWarnings.length) state = 'WATCH';
  return { state, netAnnualizedAlphaPct, hardFailures, softWarnings, thresholds, directAtlasScoreDelta: 0 };
}

export interface PredictiveModelVote {
  modelId: string;
  evidenceTraceable: boolean;
  evidenceIds: string[];
  observations: number;
  brierScore: number;
  icir: number;
  stability: number;
  regimeFit: number;
  probabilityPositive: number;
  probabilityBeatBenchmark: number;
  expectedReturnPct: number;
  q05ReturnPct?: number;
  q50ReturnPct?: number;
  q95ReturnPct?: number;
}

export interface PredictiveModelWeight {
  modelId: string;
  rawReliability: number;
  normalizedWeight: number;
  eligible: boolean;
  reason?: string;
}

function modelReliability(vote: PredictiveModelVote): number {
  const evidenceOk = vote.evidenceTraceable && vote.evidenceIds.some((id) => id.trim().length > 0);
  if (!evidenceOk || vote.observations < 30 || !finite(vote.brierScore) || vote.brierScore < 0 || vote.brierScore > 1 ||
      !finite(vote.icir) || !finite(vote.stability) || !finite(vote.regimeFit)) return 0;
  const stability = clamp(vote.stability);
  const regimeFit = clamp(vote.regimeFit);
  const sampleConfidence = Math.min(1, Math.sqrt(vote.observations / 252));
  return Math.exp(-2 * vote.brierScore) * Math.max(vote.icir, 0) * stability * regimeFit * sampleConfidence;
}

export function calculatePredictiveModelWeights(votes: readonly PredictiveModelVote[]): PredictiveModelWeight[] {
  const raw = votes.map((vote) => ({ modelId: vote.modelId, rawReliability: modelReliability(vote) }));
  const total = raw.reduce((sum, item) => sum + item.rawReliability, 0);
  return raw.map((item) => ({
    ...item,
    normalizedWeight: total > 0 ? item.rawReliability / total : 0,
    eligible: item.rawReliability > 0,
    reason: item.rawReliability > 0 ? undefined : 'No positive, traceable out-of-sample reliability.',
  }));
}

export interface PredictiveEnsembleResult {
  state: 'AVAILABLE_SHADOW' | 'NO_RELIABLE_MODELS';
  weights: PredictiveModelWeight[];
  probabilityPositive: number | null;
  probabilityBeatBenchmark: number | null;
  expectedReturnPct: number | null;
  q05ReturnPct: number | null;
  q50ReturnPct: number | null;
  q95ReturnPct: number | null;
  modelDisagreementStd: number | null;
  directAtlasScoreDelta: 0;
  reasons: string[];
}

function weightedAverage(values: Array<{ value: number; weight: number }>): number | null {
  const eligible = values.filter((item) => finite(item.value) && finite(item.weight) && item.weight > 0);
  const total = eligible.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return null;
  return eligible.reduce((sum, item) => sum + item.value * item.weight, 0) / total;
}

export function evaluatePredictiveEnsemble(votes: readonly PredictiveModelVote[]): PredictiveEnsembleResult {
  const weights = calculatePredictiveModelWeights(votes);
  const byId = new Map(weights.map((item) => [item.modelId, item.normalizedWeight]));
  const eligibleVotes = votes.filter((vote) => (byId.get(vote.modelId) ?? 0) > 0 &&
    [vote.probabilityPositive, vote.probabilityBeatBenchmark, vote.expectedReturnPct].every(finite));
  if (!eligibleVotes.length) {
    return { state: 'NO_RELIABLE_MODELS', weights, probabilityPositive: null, probabilityBeatBenchmark: null, expectedReturnPct: null,
      q05ReturnPct: null, q50ReturnPct: null, q95ReturnPct: null, modelDisagreementStd: null, directAtlasScoreDelta: 0,
      reasons: ['No model has traceable positive out-of-sample reliability. Predictive output is unavailable rather than backfilled.'] };
  }
  const w = (vote: PredictiveModelVote) => byId.get(vote.modelId) ?? 0;
  const probabilityPositive = weightedAverage(eligibleVotes.map((vote) => ({ value: clamp(vote.probabilityPositive), weight: w(vote) })));
  const probabilityBeatBenchmark = weightedAverage(eligibleVotes.map((vote) => ({ value: clamp(vote.probabilityBeatBenchmark), weight: w(vote) })));
  const expectedReturnPct = weightedAverage(eligibleVotes.map((vote) => ({ value: vote.expectedReturnPct, weight: w(vote) })));
  const q05ReturnPct = weightedAverage(eligibleVotes.filter((v) => v.q05ReturnPct != null).map((vote) => ({ value: vote.q05ReturnPct as number, weight: w(vote) })));
  const q50ReturnPct = weightedAverage(eligibleVotes.filter((v) => v.q50ReturnPct != null).map((vote) => ({ value: vote.q50ReturnPct as number, weight: w(vote) })));
  const q95ReturnPct = weightedAverage(eligibleVotes.filter((v) => v.q95ReturnPct != null).map((vote) => ({ value: vote.q95ReturnPct as number, weight: w(vote) })));
  const probs = eligibleVotes.map((vote) => clamp(vote.probabilityPositive));
  const modelDisagreementStd = probs.length >= 2 ? sampleStd(probs) : 0;
  return {
    state: 'AVAILABLE_SHADOW', weights, probabilityPositive, probabilityBeatBenchmark, expectedReturnPct,
    q05ReturnPct, q50ReturnPct, q95ReturnPct, modelDisagreementStd, directAtlasScoreDelta: 0,
    reasons: [
      'Model weights are earned from Brier calibration, ICIR, stability, regime fit and observation depth.',
      'Predictive Ensemble is orthogonal to structural quality and cannot override Falsifier Veto.',
      'Missing model outputs are not simulated, inferred or backfilled.',
    ],
  };
}

export interface DriftGuardInput {
  psi: number;
  ksPValue: number;
  normalizedWasserstein: number;
  baselineRankIc: number;
  currentRankIc: number;
  baselineBrier: number;
  currentBrier: number;
}

export type DriftGuardState = 'STABLE' | 'WATCH' | 'REDUCE_MODEL_WEIGHT' | 'SUSPEND_MODEL' | 'EVIDENCE_PENDING';

function psiSeverity(psi: number): number {
  if (psi <= 0.10) return 0;
  if (psi >= 0.25) return 1;
  return (psi - 0.10) / 0.15;
}

export function evaluateDriftGuard(input: DriftGuardInput): { state: DriftGuardState; severity: number | null; components: Record<string, number> | null; directAtlasScoreDelta: 0 } {
  const values = [input.psi, input.ksPValue, input.normalizedWasserstein, input.baselineRankIc, input.currentRankIc, input.baselineBrier, input.currentBrier];
  if (!values.every(finite) || input.psi < 0 || input.ksPValue < 0 || input.ksPValue > 1 || input.normalizedWasserstein < 0 || input.baselineBrier < 0 || input.currentBrier < 0) {
    return { state: 'EVIDENCE_PENDING', severity: null, components: null, directAtlasScoreDelta: 0 };
  }
  const ks = input.ksPValue >= 0.05 ? 0 : clamp((0.05 - input.ksPValue) / 0.05);
  const wasserstein = clamp(input.normalizedWasserstein);
  const rankIcDecay = input.baselineRankIc > 0 ? clamp((input.baselineRankIc - input.currentRankIc) / Math.abs(input.baselineRankIc)) : 0;
  const brierDeterioration = clamp((input.currentBrier - input.baselineBrier) / Math.max(input.baselineBrier, 0.01));
  const components = { psi: psiSeverity(input.psi), ks, wasserstein, rankIcDecay, brierDeterioration };
  const severity = (components.psi + components.ks + components.wasserstein + components.rankIcDecay + components.brierDeterioration) / 5;
  let state: DriftGuardState = 'STABLE';
  if (severity >= 0.70) state = 'SUSPEND_MODEL';
  else if (severity >= 0.50) state = 'REDUCE_MODEL_WEIGHT';
  else if (severity >= 0.25) state = 'WATCH';
  return { state, severity, components, directAtlasScoreDelta: 0 };
}

export interface AgentDisagreementResult {
  state: 'CONSENSUS' | 'MIXED' | 'HIGH_DISAGREEMENT' | 'EVIDENCE_PENDING';
  meanProbability: number | null;
  standardDeviation: number | null;
  range: number | null;
  confidenceMultiplier: number | null;
  directAtlasScoreDelta: 0;
}

export function evaluateAgentDisagreement(probabilities: readonly number[]): AgentDisagreementResult {
  if (!finiteSeries(probabilities, 2) || probabilities.some((p) => p < 0 || p > 1)) {
    return { state: 'EVIDENCE_PENDING', meanProbability: null, standardDeviation: null, range: null, confidenceMultiplier: null, directAtlasScoreDelta: 0 };
  }
  const m = mean(probabilities) as number;
  const sd = sampleStd(probabilities) as number;
  const range = Math.max(...probabilities) - Math.min(...probabilities);
  const confidenceMultiplier = clamp(1 - sd / 0.25);
  let state: AgentDisagreementResult['state'] = 'CONSENSUS';
  if (sd >= 0.15 || range >= 0.40) state = 'HIGH_DISAGREEMENT';
  else if (sd >= 0.08 || range >= 0.20) state = 'MIXED';
  return { state, meanProbability: m, standardDeviation: sd, range, confidenceMultiplier, directAtlasScoreDelta: 0 };
}

export interface RegimeModelPerformance {
  modelId: string;
  regime: string;
  oosRankIc: number;
  oosIcir: number;
  observations: number;
}

export function routeModelsForRegime(currentRegime: string, performance: readonly RegimeModelPerformance[]): Array<{ modelId: string; regimeFit: number }> {
  const relevant = performance.filter((item) => item.regime === currentRegime && item.observations >= 30 && finite(item.oosRankIc) && finite(item.oosIcir));
  if (!relevant.length) return [];
  const raw = relevant.map((item) => ({ modelId: item.modelId, value: Math.max(0, item.oosRankIc) * Math.max(0, item.oosIcir) * Math.min(1, Math.sqrt(item.observations / 252)) }));
  const max = Math.max(...raw.map((item) => item.value));
  return raw.map((item) => ({ modelId: item.modelId, regimeFit: max > 0 ? item.value / max : 0 }));
}

export const OPEN_SOURCE_QUANT_AI_ENGINE_MANIFEST = [
  'QLIB_FACTOR_LIBRARY_OMEGA_V1',
  'FACTOR_FORGE_OMEGA_V1',
  'STATISTICAL_BACKTEST_FIREWALL_OMEGA_V1',
  'PREDICTIVE_ENSEMBLE_OMEGA_V1',
  'MARKET_CONTEXT_ROUTER_OMEGA_V1',
  'DRIFT_GUARD_OMEGA_V1',
  'AGENT_DISAGREEMENT_CONFIDENCE_OMEGA_V1',
] as const;
