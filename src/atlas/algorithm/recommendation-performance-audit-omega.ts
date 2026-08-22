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
export type ValidationDimensionState = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'NOT_VERIFIED';

export interface RecommendationSnapshot {
  recommendationId: string;
  ticker: string;
  company: string;
  timestamp: string;
  evidenceCutoffTimestamp?: string;
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
  positiveReturn: boolean;
  beatBenchmark: boolean;
  beatBestRelevantDiscardedAlternative: boolean | null;
  decisionQualityInferredFromOutcome: false;
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
  bucketCounts: Record<string, number>;
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

export interface LiveMarketValidationEvidenceInput {
  ticker: string;
  previousAuditTimestamp: string;
  currentAuditTimestamp: string;
  previousPrice: number;
  currentPrice: number;
  previousExpectedCagrPct: number;
  currentExpectedCagrPct: number;
  fundamentalsDelta: LiveMarketDelta['fundamentalsDelta'];
  revisionsDelta?: LiveMarketDelta['revisionsDelta'];
  valuationDelta: LiveMarketDelta['valuationDelta'];
  relativeStrengthDelta?: LiveMarketDelta['relativeStrengthDelta'];
  flowDelta?: LiveMarketDelta['flowDelta'];
  economicProofDelta: LiveMarketDelta['economicProofDelta'];
  catalystState?: LiveMarketDelta['catalystState'];
  thesisState?: 'AHEAD' | 'ON_TRACK' | 'DELAYED' | 'BROKEN' | 'UNVERIFIED';
  confirmedFalsifierReasons?: string[];
  marketEvidenceIds: string[];
  fundamentalEvidenceIds: string[];
}

export interface LiveMarketValidationResult {
  ticker: string;
  valid: boolean;
  state: LiveValidationState | 'DATA_INTEGRITY_REJECT';
  priceReturnPct: number | null;
  expectedReturnDeltaPct: number | null;
  marketValidation: ValidationDimensionState;
  fundamentalValidation: ValidationDimensionState;
  flowInferredFromPrice: false;
  reasons: string[];
}

export interface AttributionEvidence {
  causes: Partial<Record<AttributionCause, boolean>>;
  evidenceIds: string[];
}

export interface AttributionResult {
  attributionVerified: boolean;
  causes: AttributionCause[];
  primaryCause: AttributionCause | null;
  reasons: string[];
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

export interface ModelChangeRecordInput {
  detectedProblem: string;
  sampleDescription: string;
  evidenceIds: string[];
  hypothesis: string;
  changeMade: string;
  expectedImpact: string;
  possibleSideEffects: string[];
  previousVersion: string;
  newVersion: string;
  changeDate: string;
  oldVsNewComparison?: string;
}

export interface ModelChangeRecord extends ModelChangeRecordInput {
  governanceState: 'VERSIONED_RECALIBRATION';
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value as Readonly<T>;
}

function validIso(value: string | undefined): boolean {
  return Boolean(value?.trim()) && Number.isFinite(Date.parse(value as string));
}

function nonBlank(values: string[]): boolean {
  return Array.isArray(values) && values.every((value) => Boolean(value?.trim()));
}

function finiteOptional(value: number | null | undefined): boolean {
  return value == null || Number.isFinite(value);
}

function bucketForExpectedReturn(value: number): string {
  if (value < 5) return '<5%';
  if (value < 10) return '5-10%';
  if (value < 15) return '10-15%';
  if (value < 20) return '15-20%';
  if (value < 30) return '20-30%';
  return '>=30%';
}

export function createImmutableRecommendationSnapshot(input: RecommendationSnapshot): Readonly<RecommendationSnapshot> {
  if (!input.recommendationId.trim() || !input.ticker.trim() || !input.company.trim() || !input.timestamp.trim()) throw new Error('SNAPSHOT_IDENTITY_REQUIRED');
  if (!(Number.isFinite(input.p0) && input.p0 > 0)) throw new Error('P0_REQUIRED');
  if (!(Number.isFinite(input.horizonYears) && input.horizonYears > 0)) throw new Error('HORIZON_REQUIRED');
  if (!input.listing.trim() || !input.currency.trim() || !input.benchmark.trim()) throw new Error('MARKET_IDENTITY_REQUIRED');
  if (!finiteOptional(input.marketCap) || !finiteOptional(input.enterpriseValue)) throw new Error('CAPITAL_STRUCTURE_INVALID');
  if (input.marketCap != null && input.marketCap < 0) throw new Error('MARKET_CAP_INVALID');
  const t0 = Date.parse(input.timestamp);
  if (!Number.isFinite(t0)) throw new Error('INVALID_T0_TIMESTAMP');
  if (input.evidenceCutoffTimestamp != null) {
    if (!validIso(input.evidenceCutoffTimestamp)) throw new Error('INVALID_EVIDENCE_CUTOFF');
    if (Date.parse(input.evidenceCutoffTimestamp) > t0) throw new Error('ANTI_HINDSIGHT_VIOLATION');
  }
  if (!input.evidenceAvailableAtT0.length) throw new Error('T0_EVIDENCE_REQUIRED');
  for (const evidence of input.evidenceAvailableAtT0) {
    const available = Date.parse(evidence.availableAt);
    if (!evidence.id.trim() || !Number.isFinite(available) || available > t0) throw new Error('ANTI_HINDSIGHT_VIOLATION');
    if (input.evidenceCutoffTimestamp && available > Date.parse(input.evidenceCutoffTimestamp)) throw new Error('EVIDENCE_AFTER_CUTOFF');
  }
  if (!nonBlank(input.alternativesConsidered) || !nonBlank(input.alternativesDiscarded)
    || !nonBlank(input.thesis) || !nonBlank(input.catalysts) || !nonBlank(input.falsifiers) || !nonBlank(input.knownRisks)) {
    throw new Error('SNAPSHOT_TEXT_ARRAY_INVALID');
  }
  const er = input.expectedReturn;
  if (![er.bearPct, er.basePct, er.bullPct, er.expectedCagrPct].every(Number.isFinite)) throw new Error('EXPECTED_RETURN_INVALID');
  if ([er.bearPct, er.basePct, er.bullPct].some((value) => value < -100)) throw new Error('EXPECTED_RETURN_BELOW_FLOOR');
  if (!er.probabilities.every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) throw new Error('SCENARIO_PROBABILITIES_INVALID');
  const pSum = er.probabilities.reduce((a, b) => a + b, 0);
  if (Math.abs(pSum - 1) > 1e-6) throw new Error('SCENARIO_PROBABILITIES_MUST_SUM_TO_1');
  return deepFreeze(structuredClone(input));
}

export function auditRecommendationPerformance(snapshot: RecommendationSnapshot, observation: PerformanceObservation): RecommendationPerformanceResult {
  if (!(Number.isFinite(observation.price) && observation.price > 0)) throw new Error('OBSERVED_PRICE_REQUIRED');
  if (!Number.isFinite(observation.benchmarkReturnPct)) throw new Error('BENCHMARK_RETURN_REQUIRED');
  if (!validIso(observation.realizedAt) || Date.parse(observation.realizedAt) <= Date.parse(snapshot.timestamp)) throw new Error('OUTCOME_MUST_FOLLOW_T0');
  const absoluteReturnPct = (observation.price / snapshot.p0 - 1) * 100;
  const recommendationAlphaPct = absoluteReturnPct - observation.benchmarkReturnPct;
  const discarded = new Set(snapshot.alternativesDiscarded);
  const alternatives = Object.entries(observation.relevantDiscardedAlternativeReturnsPct ?? {})
    .filter(([ticker, value]) => discarded.has(ticker) && Number.isFinite(value));
  alternatives.sort((a, b) => b[1] - a[1]);
  const best = alternatives[0];
  const selectionAlphaPct = best ? absoluteReturnPct - best[1] : undefined;
  return {
    recommendationId: snapshot.recommendationId,
    ticker: snapshot.ticker,
    window: observation.window,
    absoluteReturnPct,
    benchmarkReturnPct: observation.benchmarkReturnPct,
    recommendationAlphaPct,
    bestRelevantDiscardedAlternative: best?.[0],
    bestRelevantDiscardedAlternativeReturnPct: best?.[1],
    selectionAlphaPct,
    maxDrawdownPct: observation.maxDrawdownPct,
    volatilityPct: observation.volatilityPct,
    timeToMaxDays: observation.timeToMaxDays,
    timeToThesisDays: observation.timeToThesisDays,
    riskAdjustedReturn: observation.riskAdjustedReturn,
    positiveReturn: absoluteReturnPct > 0,
    beatBenchmark: recommendationAlphaPct > 0,
    beatBestRelevantDiscardedAlternative: selectionAlphaPct == null ? null : selectionAlphaPct > 0,
    decisionQualityInferredFromOutcome: false,
  };
}

export function summarizeExpectedReturnCalibration(points: CalibrationPoint[], minimumSample = 10): CalibrationSummary {
  const valid = points.filter((p) => Number.isFinite(p.expectedReturnPct) && Number.isFinite(p.realizedReturnPct) && p.horizonYears > 0);
  const bucketCounts: Record<string, number> = {};
  for (const point of valid) {
    const bucket = bucketForExpectedReturn(point.expectedReturnPct);
    bucketCounts[bucket] = (bucketCounts[bucket] ?? 0) + 1;
  }
  if (valid.length < minimumSample) {
    return { sampleSize: valid.length, meanErrorPct: null, meanAbsoluteErrorPct: null, optimisticBiasPct: null, pessimisticBiasPct: null, hitRatePct: null, dispersionPct: null, status: 'INSUFFICIENT_SAMPLE', bucketCounts };
  }
  const errors = valid.map((p) => p.realizedReturnPct - p.expectedReturnPct);
  const meanErrorPct = errors.reduce((a, b) => a + b, 0) / errors.length;
  const meanAbsoluteErrorPct = errors.reduce((a, b) => a + Math.abs(b), 0) / errors.length;
  const optimistic = errors.filter((e) => e < 0);
  const pessimistic = errors.filter((e) => e > 0);
  const dispersionPct = Math.sqrt(errors.reduce((s, e) => s + Math.pow(e - meanErrorPct, 2), 0) / errors.length);
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
    bucketCounts,
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

function validationDimension(directions: Array<string | undefined>): ValidationDimensionState {
  const verified = directions.filter((value) => value && value !== 'UNVERIFIED');
  if (!verified.length) return 'NOT_VERIFIED';
  const positive = verified.filter((value) => value === 'IMPROVING' || value === 'CHEAPER').length;
  const negative = verified.filter((value) => value === 'DETERIORATING' || value === 'RICHER').length;
  if (positive > negative) return 'POSITIVE';
  if (negative > positive) return 'NEGATIVE';
  return 'NEUTRAL';
}

export function evaluateLiveMarketValidation(input: LiveMarketValidationEvidenceInput): LiveMarketValidationResult {
  const reasons: string[] = [];
  const chronological = validIso(input.previousAuditTimestamp) && validIso(input.currentAuditTimestamp)
    && Date.parse(input.currentAuditTimestamp) >= Date.parse(input.previousAuditTimestamp);
  const numeric = Number.isFinite(input.previousPrice) && input.previousPrice > 0
    && Number.isFinite(input.currentPrice) && input.currentPrice > 0
    && Number.isFinite(input.previousExpectedCagrPct) && Number.isFinite(input.currentExpectedCagrPct);
  if (!input.ticker.trim() || !chronological || !numeric) {
    if (!input.ticker.trim()) reasons.push('Ticker is required.');
    if (!chronological) reasons.push('LAST AUDIT -> NOW timestamps are invalid or non-chronological.');
    if (!numeric) reasons.push('Price and Expected CAGR inputs must be finite; prices must be positive.');
    return { ticker: input.ticker, valid: false, state: 'DATA_INTEGRITY_REJECT', priceReturnPct: null, expectedReturnDeltaPct: null, marketValidation: 'NOT_VERIFIED', fundamentalValidation: 'NOT_VERIFIED', flowInferredFromPrice: false, reasons };
  }

  const priceReturnPct = (input.currentPrice / input.previousPrice - 1) * 100;
  const expectedReturnDeltaPct = input.currentExpectedCagrPct - input.previousExpectedCagrPct;
  const marketEvidenceVerified = input.marketEvidenceIds.length > 0 && nonBlank(input.marketEvidenceIds);
  const fundamentalEvidenceVerified = input.fundamentalEvidenceIds.length > 0 && nonBlank(input.fundamentalEvidenceIds);
  const marketValidation = marketEvidenceVerified
    ? validationDimension([input.relativeStrengthDelta, input.flowDelta])
    : 'NOT_VERIFIED';
  let fundamentalValidation: ValidationDimensionState = fundamentalEvidenceVerified
    ? validationDimension([input.fundamentalsDelta, input.revisionsDelta, input.economicProofDelta])
    : 'NOT_VERIFIED';
  if (fundamentalEvidenceVerified && input.thesisState === 'AHEAD' && fundamentalValidation === 'NEUTRAL') fundamentalValidation = 'POSITIVE';
  if (fundamentalEvidenceVerified && (input.thesisState === 'DELAYED' || input.thesisState === 'BROKEN') && fundamentalValidation !== 'POSITIVE') fundamentalValidation = 'NEGATIVE';

  const confirmedFalsifierReasons = (input.confirmedFalsifierReasons ?? []).filter((reason) => reason.trim());
  if (confirmedFalsifierReasons.length) {
    reasons.push(...confirmedFalsifierReasons.map((reason) => `CONFIRMED_FALSIFIER: ${reason}`));
    reasons.push('Confirmed material falsifiers retain absolute veto authority.');
    return { ticker: input.ticker, valid: true, state: 'FALSIFIED', priceReturnPct, expectedReturnDeltaPct, marketValidation, fundamentalValidation, flowInferredFromPrice: false, reasons };
  }

  const delta: LiveMarketDelta = {
    priceReturnPct,
    expectedReturnDeltaPct,
    fundamentalsDelta: input.fundamentalsDelta,
    revisionsDelta: input.revisionsDelta,
    valuationDelta: input.valuationDelta,
    relativeStrengthDelta: input.relativeStrengthDelta,
    flowDelta: input.flowDelta,
    economicProofDelta: input.economicProofDelta,
    catalystState: input.catalystState,
    falsifierConfirmed: false,
  };
  let state = classifyLiveMarketValidation(delta);
  if (input.thesisState === 'BROKEN' && state !== 'FALSIFIED') state = 'WEAKENING';
  if (input.thesisState === 'DELAYED' && state === 'UNCHANGED') state = 'WEAKENING';
  if (input.thesisState === 'ON_TRACK' && state === 'UNCHANGED' && fundamentalValidation !== 'NEGATIVE') state = 'VALIDATED';

  if (priceReturnPct > 0 && (input.flowDelta == null || input.flowDelta === 'UNVERIFIED')) reasons.push('PRICE UP != VERIFIED FLOW: rising price alone cannot establish institutional flow.');
  if (priceReturnPct < 0 && fundamentalValidation === 'POSITIVE' && expectedReturnDeltaPct > 0) reasons.push('MARKET VALIDATION != FUNDAMENTAL VALIDATION: price weakness coexists with improving fundamentals and higher Expected Return.');
  if (priceReturnPct > 0 && expectedReturnDeltaPct < 0) reasons.push('Price appreciation consumed part of the forward Expected Return.');
  if (!marketEvidenceVerified) reasons.push('Market validation is NOT_VERIFIED because traceable market evidence is incomplete.');
  if (!fundamentalEvidenceVerified) reasons.push('Fundamental validation is NOT_VERIFIED because traceable fundamental evidence is incomplete.');

  return { ticker: input.ticker, valid: true, state, priceReturnPct, expectedReturnDeltaPct, marketValidation, fundamentalValidation, flowInferredFromPrice: false, reasons };
}

export function attributeRecommendationDeviation(evidence: AttributionEvidence): AttributionResult {
  const validCauses = (Object.entries(evidence.causes) as Array<[AttributionCause, boolean | undefined]>)
    .filter(([, supported]) => supported === true)
    .map(([cause]) => cause);
  const traceable = evidence.evidenceIds.length > 0 && nonBlank(evidence.evidenceIds);
  const attributionVerified = traceable && validCauses.length > 0;
  const reasons: string[] = [];
  if (!traceable) reasons.push('Attribution requires traceable evidence; outcome alone cannot assign a cause.');
  if (!validCauses.length) reasons.push('Deviation remains UNATTRIBUTED because no supported cause was provided.');
  if (validCauses.length > 1) reasons.push('Multiple supported causes are retained; no false single-cause precision is imposed.');
  return { attributionVerified, causes: attributionVerified ? validCauses : [], primaryCause: attributionVerified && validCauses.length === 1 ? validCauses[0] : null, reasons };
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

export function createModelChangeRecord(input: ModelChangeRecordInput, gate: RecalibrationGateResult): Readonly<ModelChangeRecord> {
  if (!gate.allowed) throw new Error('RECALIBRATION_GATE_BLOCKED');
  if (!input.detectedProblem.trim() || !input.sampleDescription.trim() || !input.hypothesis.trim() || !input.changeMade.trim() || !input.expectedImpact.trim()) throw new Error('MODEL_CHANGE_RECORD_INCOMPLETE');
  if (!input.evidenceIds.length || !nonBlank(input.evidenceIds)) throw new Error('MODEL_CHANGE_EVIDENCE_REQUIRED');
  if (!input.previousVersion.trim() || !input.newVersion.trim() || input.previousVersion === input.newVersion) throw new Error('MODEL_VERSION_CHANGE_REQUIRED');
  if (!validIso(input.changeDate)) throw new Error('MODEL_CHANGE_DATE_INVALID');
  return deepFreeze({ ...structuredClone(input), governanceState: 'VERSIONED_RECALIBRATION' as const });
}

export function validateAttributionCause(cause: AttributionCause): AttributionCause {
  return cause;
}
