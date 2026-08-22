export type PerformanceWindow = '1D' | '1W' | '1M' | '3M' | '6M' | '12M' | 'ORIGINAL_HORIZON';
export type AttributionCause =
  | 'DATA_ERROR'
  | 'FUNDAMENTAL_ERROR'
  | 'VALUATION_ERROR'
  | 'TIMING_ERROR'
  | 'CATALYST_ERROR'
  | 'MACRO_ERROR'
  | 'RISK_ERROR'
  | 'UNKNOWN_SHOCK'
  | 'MODEL_SELECTION_ERROR';

export type LiveValidationState = 'STRENGTHENING' | 'VALIDATED' | 'UNCHANGED' | 'WEAKENING' | 'FALSIFIED';

export interface RecommendationSnapshot {
  recommendationId: string;
  ticker: string;
  company: string;
  timestamp: string;
  p0: number;
  listing: string;
  currency: string;
  marketCap: number | null;
  enterpriseValue: number | null;
  economicProof: number | string;
  businessQuality: number | string;
  expectedReturn: { bearPct: number; basePct: number; bullPct: number; probabilities: [number, number, number]; expectedCagrPct: number };
  horizonYears: number;
  entryScore: number | null;
  waveScore: number | null;
  verdict: string;
  benchmark: string;
  alternativesConsidered: string[];
  alternativesDiscarded: string[];
  thesis: string[];
  catalysts: string[];
  falsifiers: string[];
  knownRisks: string[];
  evidenceAvailableAtT0: { id: string; availableAt: string }[];
}

export interface PerformanceObservation {
  window: PerformanceWindow;
  price: number;
  benchmarkReturnPct: number;
  relevantDiscardedAlternativeReturnsPct?: Record<string, number>;
  maxDrawdownPct?: number;
  volatilityPct?: number;
  timeToMaxDays?: number;
  timeToThesisDays?: number;
  riskAdjustedReturn?: number;
  realizedAt: string;
}

export interface RecommendationPerformanceResult {
  recommendationId: string;
  ticker: string;
  window: PerformanceWindow;
  absoluteReturnPct: number;
  benchmarkReturnPct: number;
  recommendationAlphaPct: number;
  bestRelevantDiscardedAlternative?: string;
  bestRelevantDiscardedAlternativeReturnPct?: number;
  selectionAlphaPct?: number;
  maxDrawdownPct?: number;
  volatilityPct?: number;
  timeToMaxDays?: number;
  timeToThesisDays?: number;
  riskAdjustedReturn?: number;
}

export interface CalibrationPoint {
  expectedReturnPct: number;
  realizedReturnPct: number;
  horizonYears: number;
  bearPct?: number;
  basePct?: number;
  bullPct?: number;
}

export interface CalibrationSummary {
  sampleSize: number;
  meanErrorPct: number | null;
  meanAbsoluteErrorPct: number | null;
  optimisticBiasPct: number | null;
  pessimisticBiasPct: number | null;
  hitRatePct: number | null;
  dispersionPct: number | null;
  status: 'INSUFFICIENT_SAMPLE' | 'CALIBRATED';
}

export interface LiveMarketDelta {
  priceReturnPct: number;
  expectedReturnDeltaPct: number;
  fundamentalsDelta: 'IMPROVING' | 'FLAT' | 'DETERIORATING';
  revisionsDelta?: 'IMPROVING' | 'FLAT' | 'DETERIORATING' | 'UNVERIFIED';
  valuationDelta: 'CHEAPER' | 'FLAT' | 'RICHER';
  relativeStrengthDelta?: 'IMPROVING' | 'FLAT' | 'DETERIORATING' | 'UNVERIFIED';
  flowDelta?: 'IMPROVING' | 'FLAT' | 'DETERIORATING' | 'UNVERIFIED';
  economicProofDelta: 'IMPROVING' | 'FLAT' | 'DETERIORATING';
  catalystState?: 'OCCURRED' | 'DELAYED' | 'UNCHANGED' | 'UNVERIFIED';
  falsifierConfirmed: boolean;
  riskRemoved?: boolean;
}

export interface RecalibrationEvidence {
  sampleSize: number;
  repeatedPatternCount: number;
  meanAbsoluteErrorPct: number;
  economicallyMaterial: boolean;
  statisticallySupportedWhenPossible: boolean;
  outOfSampleImprovementExpected: boolean;
  crossSectorConsistency: boolean;
  temporalStability: boolean;
  isolatedExtraordinaryShock?: boolean;
}

export interface RecalibrationGateResult {
  allowed: boolean;
  reasons: string[];
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value as Readonly<T>;
}

export function createImmutableRecommendationSnapshot(input: RecommendationSnapshot): Readonly<RecommendationSnapshot> {
  if (!input.recommendationId.trim() || !input.ticker.trim() || !input.timestamp.trim()) throw new Error('SNAPSHOT_IDENTITY_REQUIRED');
  if (!(Number.isFinite(input.p0) && input.p0 > 0)) throw new Error('P0_REQUIRED');
  if (!(Number.isFinite(input.horizonYears) && input.horizonYears > 0)) throw new Error('HORIZON_REQUIRED');
  if (!input.listing.trim() || !input.currency.trim() || !input.benchmark.trim()) throw new Error('MARKET_IDENTITY_REQUIRED');
  const t0 = Date.parse(input.timestamp);
  if (!Number.isFinite(t0)) throw new Error('INVALID_T0_TIMESTAMP');
  for (const evidence of input.evidenceAvailableAtT0) {
    const available = Date.parse(evidence.availableAt);
    if (!evidence.id.trim() || !Number.isFinite(available) || available > t0) throw new Error('ANTI_HINDSIGHT_VIOLATION');
  }
  const pSum = input.expectedReturn.probabilities.reduce((a, b) => a + b, 0);
  if (Math.abs(pSum - 1) > 1e-6) throw new Error('SCENARIO_PROBABILITIES_MUST_SUM_TO_1');
  return deepFreeze(structuredClone(input));
}

export function auditRecommendationPerformance(snapshot: RecommendationSnapshot, observation: PerformanceObservation): RecommendationPerformanceResult {
  if (!(Number.isFinite(observation.price) && observation.price > 0)) throw new Error('OBSERVED_PRICE_REQUIRED');
  if (Date.parse(observation.realizedAt) <= Date.parse(snapshot.timestamp)) throw new Error('OUTCOME_MUST_FOLLOW_T0');
  const absoluteReturnPct = (observation.price / snapshot.p0 - 1) * 100;
  const recommendationAlphaPct = absoluteReturnPct - observation.benchmarkReturnPct;
  const alternatives = Object.entries(observation.relevantDiscardedAlternativeReturnsPct ?? {});
  alternatives.sort((a, b) => b[1] - a[1]);
  const best = alternatives[0];
  return {
    recommendationId: snapshot.recommendationId,
    ticker: snapshot.ticker,
    window: observation.window,
    absoluteReturnPct,
    benchmarkReturnPct: observation.benchmarkReturnPct,
    recommendationAlphaPct,
    bestRelevantDiscardedAlternative: best?.[0],
    bestRelevantDiscardedAlternativeReturnPct: best?.[1],
    selectionAlphaPct: best ? absoluteReturnPct - best[1] : undefined,
    maxDrawdownPct: observation.maxDrawdownPct,
    volatilityPct: observation.volatilityPct,
    timeToMaxDays: observation.timeToMaxDays,
    timeToThesisDays: observation.timeToThesisDays,
    riskAdjustedReturn: observation.riskAdjustedReturn,
  };
}

export function summarizeExpectedReturnCalibration(points: CalibrationPoint[], minimumSample = 10): CalibrationSummary {
  const valid = points.filter((p) => Number.isFinite(p.expectedReturnPct) && Number.isFinite(p.realizedReturnPct) && p.horizonYears > 0);
  if (valid.length < minimumSample) {
    return { sampleSize: valid.length, meanErrorPct: null, meanAbsoluteErrorPct: null, optimisticBiasPct: null, pessimisticBiasPct: null, hitRatePct: null, dispersionPct: null, status: 'INSUFFICIENT_SAMPLE' };
  }
  const errors = valid.map((p) => p.realizedReturnPct - p.expectedReturnPct);
  const meanErrorPct = errors.reduce((a, b) => a + b, 0) / errors.length;
  const meanAbsoluteErrorPct = errors.reduce((a, b) => a + Math.abs(b), 0) / errors.length;
  const optimistic = errors.filter((e) => e < 0);
  const pessimistic = errors.filter((e) => e > 0);
  const mean = meanErrorPct;
  const dispersionPct = Math.sqrt(errors.reduce((s, e) => s + Math.pow(e - mean, 2), 0) / errors.length);
  const hitRatePct = valid.filter((p) => (p.expectedReturnPct >= 0) === (p.realizedReturnPct >= 0)).length / valid.length * 100;
  return {
    sampleSize: valid.length,
    meanErrorPct,
    meanAbsoluteErrorPct,
    optimisticBiasPct: optimistic.length ? Math.abs(optimistic.reduce((a, b) => a + b, 0) / optimistic.length) : 0,
    pessimisticBiasPct: pessimistic.length ? pessimistic.reduce((a, b) => a + b, 0) / pessimistic.length : 0,
    hitRatePct,
    dispersionPct,
    status: 'CALIBRATED',
  };
}

export function classifyLiveMarketValidation(delta: LiveMarketDelta): LiveValidationState {
  if (delta.falsifierConfirmed) return 'FALSIFIED';
  const improving = [delta.fundamentalsDelta, delta.economicProofDelta, delta.revisionsDelta, delta.relativeStrengthDelta, delta.flowDelta].filter((x) => x === 'IMPROVING').length;
  const deteriorating = [delta.fundamentalsDelta, delta.economicProofDelta, delta.revisionsDelta, delta.relativeStrengthDelta, delta.flowDelta].filter((x) => x === 'DETERIORATING').length;
  if (delta.economicProofDelta === 'DETERIORATING' || delta.fundamentalsDelta === 'DETERIORATING' || deteriorating >= 2) return 'WEAKENING';
  if (improving >= 2 || (delta.expectedReturnDeltaPct > 0 && delta.valuationDelta === 'CHEAPER' && improving >= 1)) return 'STRENGTHENING';
  if (delta.catalystState === 'OCCURRED' || (delta.fundamentalsDelta === 'IMPROVING' && delta.economicProofDelta !== 'DETERIORATING')) return 'VALIDATED';
  return 'UNCHANGED';
}

export function evaluateRecalibrationGate(evidence: RecalibrationEvidence): RecalibrationGateResult {
  const reasons: string[] = [];
  if (evidence.sampleSize < 20) reasons.push('Sample below canonical minimum of 20 comparable observations.');
  if (evidence.repeatedPatternCount < 5) reasons.push('No repeated systematic error pattern.');
  if (!evidence.economicallyMaterial) reasons.push('Observed error is not economically material.');
  if (!evidence.statisticallySupportedWhenPossible) reasons.push('Statistical support is absent where it is reasonably measurable.');
  if (!evidence.outOfSampleImprovementExpected) reasons.push('No evidence of expected out-of-sample improvement.');
  if (!evidence.crossSectorConsistency) reasons.push('Pattern is not sufficiently consistent across sectors.');
  if (!evidence.temporalStability) reasons.push('Pattern is not temporally stable.');
  if (evidence.isolatedExtraordinaryShock) reasons.push('Observed miss is dominated by an extraordinary non-modelable shock.');
  return { allowed: reasons.length === 0, reasons };
}

export function validateAttributionCause(cause: AttributionCause): AttributionCause {
  return cause;
}
