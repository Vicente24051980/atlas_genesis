export const GREEK_CONTRACTS_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export const GREEK_CONTRACTS_OMEGA_GOVERNANCE = {
  status: 'ACTIVE_CANONICAL',
  issue: 100,
  directStructuralScoreWeight: 0,
  contracts: {
    delta: 'DELTA_DIVERGENCE_OMEGA_V1',
    kappa: 'KAPPA_CALIBRATION_OMEGA_V1',
    gamma: 'GAMMA_VIGENCIA_OMEGA_V1',
    upsilon: 'UPSILON_ALLOCATION_OMEGA_V1',
  },
  boundaries: {
    deltaCannotConclude: true,
    kappaCannotChangeMethodology: true,
    gammaCannotBuySell: true,
    upsilonCannotAdmitExclude: true,
    falsifierVetoRemainsIndependent: true,
    decisionSafetyGateRemainsIndependent: true,
    brokerExecutionRemainsIndependent: true,
  },
} as const;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function finite(values: readonly number[]): boolean {
  return values.every(Number.isFinite);
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function populationStd(values: readonly number[]): number {
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - m) ** 2, 0) / values.length);
}

function quantile(sorted: readonly number[], q: number): number {
  if (!sorted.length) return NaN;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  const weight = pos - lo;
  return sorted[lo] * (1 - weight) + sorted[hi] * weight;
}

// -----------------------------------------------------------------------------
// Δ — DIVERGENCE Ω
// Question: how much do independent evaluations of the same phenomenon disagree?
// It never decides what the conclusion should be.
// -----------------------------------------------------------------------------

export interface DeltaEvaluatorPass {
  evaluatorId: string;
  alignedEvidenceGraphId: string;
  independent: boolean;
  probability: number;
  confidence: number;
  dimensionProbabilities?: Record<string, number>;
}

export interface DeltaDimensionDisagreement {
  dimension: string;
  observations: number;
  meanProbability: number;
  sigma: number;
  iqr: number;
}

export interface DeltaDivergenceResult {
  state: 'MEDIBLE' | 'NO_MEDIBLE';
  dOmega: number | null;
  normalizedDOmega: number | null;
  iqr: number | null;
  meanProbability: number | null;
  dimensionDisagreement: DeltaDimensionDisagreement[];
  strongestDisagreementAxis: string | null;
  directAtlasScoreDelta: 0;
  canConclude: false;
  reasons: string[];
}

export function evaluateDeltaDivergence(passes: readonly DeltaEvaluatorPass[]): DeltaDivergenceResult {
  const ids = new Set(passes.map((p) => p.evaluatorId));
  const graphIds = new Set(passes.map((p) => p.alignedEvidenceGraphId));
  const probabilities = passes.map((p) => p.probability);
  const confidences = passes.map((p) => p.confidence);
  const independenceValid = passes.length >= 3 && passes.every((p) => p.independent) && ids.size === passes.length;
  const sameGraph = graphIds.size === 1 && !graphIds.has('');
  const valuesValid = finite([...probabilities, ...confidences]) && probabilities.every((p) => p >= 0 && p <= 1) && confidences.every((c) => c >= 0 && c <= 1);

  if (!independenceValid || !sameGraph || !valuesValid) {
    return {
      state: 'NO_MEDIBLE', dOmega: null, normalizedDOmega: null, iqr: null, meanProbability: null,
      dimensionDisagreement: [], strongestDisagreementAxis: null, directAtlasScoreDelta: 0, canConclude: false,
      reasons: [
        'Δ requires at least three genuinely independent evaluator passes on the same Aligned Evidence Graph.',
        'If independence or common evidence alignment is doubtful, divergence is NO_MEDIBLE rather than optimistically low.',
      ],
    };
  }

  const m = mean(probabilities);
  const sigma = populationStd(probabilities);
  const sorted = [...probabilities].sort((a, b) => a - b);
  const iqr = quantile(sorted, 0.75) - quantile(sorted, 0.25);
  const denominator = Math.sqrt(Math.max(m * (1 - m), 1e-12));
  const normalized = sigma / denominator;

  const dimensionNames = new Set<string>();
  for (const pass of passes) for (const key of Object.keys(pass.dimensionProbabilities ?? {})) dimensionNames.add(key);
  const dimensionDisagreement: DeltaDimensionDisagreement[] = [];
  for (const dimension of dimensionNames) {
    const vals = passes
      .map((p) => p.dimensionProbabilities?.[dimension])
      .filter((v): v is number => v != null && Number.isFinite(v) && v >= 0 && v <= 1);
    if (vals.length < 3) continue;
    const s = [...vals].sort((a, b) => a - b);
    dimensionDisagreement.push({
      dimension,
      observations: vals.length,
      meanProbability: mean(vals),
      sigma: populationStd(vals),
      iqr: quantile(s, 0.75) - quantile(s, 0.25),
    });
  }
  dimensionDisagreement.sort((a, b) => b.sigma - a.sigma);

  return {
    state: 'MEDIBLE',
    dOmega: sigma,
    normalizedDOmega: normalized,
    iqr,
    meanProbability: m,
    dimensionDisagreement,
    strongestDisagreementAxis: dimensionDisagreement[0]?.dimension ?? null,
    directAtlasScoreDelta: 0,
    canConclude: false,
    reasons: [
      'Δ measures dispersion only; the sign and level of the mean do not change D_Ω.',
      'High mean conviction with high D_Ω is never relabeled as consensus.',
      'Per-dimension disagreement is a first-class output because equal global sigma can hide different economic conflicts.',
    ],
  };
}

export interface CoreConfidencePolicy {
  divergencePenaltyK: number;
  policyId: string;
}

export interface CoreConfidenceResult {
  state: 'AVAILABLE' | 'NO_MEDIBLE';
  meanIndividualConfidence: number | null;
  effectiveConfidence: number | null;
  policyId: string;
  divergencePenaltyK: number;
  formulaOwner: 'CORE_OMEGA';
}

export function calculateCoreConfidenceFromDelta(
  individualConfidences: readonly number[],
  delta: DeltaDivergenceResult,
  policy: CoreConfidencePolicy,
): CoreConfidenceResult {
  const valid = individualConfidences.length >= 3 && finite(individualConfidences) && individualConfidences.every((c) => c >= 0 && c <= 1)
    && Number.isFinite(policy.divergencePenaltyK) && policy.divergencePenaltyK >= 0 && policy.policyId.trim().length > 0;
  if (!valid || delta.state !== 'MEDIBLE' || delta.dOmega == null) {
    return { state: 'NO_MEDIBLE', meanIndividualConfidence: null, effectiveConfidence: null, policyId: policy.policyId,
      divergencePenaltyK: policy.divergencePenaltyK, formulaOwner: 'CORE_OMEGA' };
  }
  const avg = mean(individualConfidences);
  return {
    state: 'AVAILABLE',
    meanIndividualConfidence: avg,
    effectiveConfidence: clamp01(avg * Math.exp(-policy.divergencePenaltyK * delta.dOmega)),
    policyId: policy.policyId,
    divergencePenaltyK: policy.divergencePenaltyK,
    formulaOwner: 'CORE_OMEGA',
  };
}

// -----------------------------------------------------------------------------
// Κ — CALIBRATION Ω (Assurance Ω)
// Question: do issued probabilities match observed frequencies?
// Kappa judges the emitter, never the company and never the methodology directly.
// -----------------------------------------------------------------------------

export type BinaryOutcome = 0 | 1;

export interface KappaPreregisteredCase {
  id: string;
  sealedAt: string;
  claimType: string;
  horizonId: string;
  probability: number;
  criterion: string;
  resolutionSource: string;
  criterionHashAtSeal: string;
  criterionHashAtResolution?: string;
  status: 'OPEN' | 'RESOLVED' | 'INVALIDATED';
  outcome?: BinaryOutcome;
}

export interface KappaCalibrationBin {
  n: number;
  meanProbability: number;
  observedFrequency: number;
  minProbability: number;
  maxProbability: number;
}

export interface KappaSegmentMetrics {
  key: string;
  n: number;
  brierScore: number;
  logLoss: number;
  brierSkillScore: number | null;
  baseRate: number | null;
}

export interface KappaCalibrationResult {
  state: 'VERDICT_AVAILABLE' | 'ACCUMULATING' | 'NO_COMPUTABLE_CASES';
  resolvedValidCases: number;
  invalidatedCases: number;
  brierScore: number | null;
  logLoss: number | null;
  adaptiveCalibrationCurve: KappaCalibrationBin[];
  segments: KappaSegmentMetrics[];
  minimumResolvedCasesForVerdict: number;
  directAtlasScoreDelta: 0;
  canChangeMethodology: false;
  reasons: string[];
}

function validPreregisteredCase(item: KappaPreregisteredCase): boolean {
  const sealed = Number.isFinite(Date.parse(item.sealedAt));
  return item.id.trim().length > 0 && sealed && item.claimType.trim().length > 0 && item.horizonId.trim().length > 0
    && Number.isFinite(item.probability) && item.probability >= 0 && item.probability <= 1
    && item.criterion.trim().length > 0 && item.resolutionSource.trim().length > 0 && item.criterionHashAtSeal.trim().length > 0;
}

function kappaSegmentKey(item: KappaPreregisteredCase): string {
  return `${item.claimType}::${item.horizonId}`;
}

function brierScore(items: readonly KappaPreregisteredCase[]): number {
  return mean(items.map((item) => (item.probability - (item.outcome as BinaryOutcome)) ** 2));
}

function logLoss(items: readonly KappaPreregisteredCase[]): number {
  const eps = 1e-12;
  return mean(items.map((item) => {
    const p = Math.max(eps, Math.min(1 - eps, item.probability));
    const o = item.outcome as BinaryOutcome;
    return -(o * Math.log(p) + (1 - o) * Math.log(1 - p));
  }));
}

function adaptiveBins(items: readonly KappaPreregisteredCase[], minimumPerBin = 10): KappaCalibrationBin[] {
  if (items.length < minimumPerBin * 2) return [];
  const binCount = Math.min(10, Math.max(2, Math.floor(items.length / minimumPerBin)));
  const sorted = [...items].sort((a, b) => a.probability - b.probability);
  const bins: KappaCalibrationBin[] = [];
  for (let b = 0; b < binCount; b += 1) {
    const start = Math.floor((b * sorted.length) / binCount);
    const end = Math.floor(((b + 1) * sorted.length) / binCount);
    const slice = sorted.slice(start, end);
    if (!slice.length) continue;
    bins.push({
      n: slice.length,
      meanProbability: mean(slice.map((x) => x.probability)),
      observedFrequency: mean(slice.map((x) => x.outcome as BinaryOutcome)),
      minProbability: Math.min(...slice.map((x) => x.probability)),
      maxProbability: Math.max(...slice.map((x) => x.probability)),
    });
  }
  return bins;
}

export function evaluateKappaCalibration(
  cases: readonly KappaPreregisteredCase[],
  baseRatesBySegment: Readonly<Record<string, number>> = {},
  minimumResolvedCasesForVerdict = 50,
): KappaCalibrationResult {
  const invalidated = cases.filter((item) => item.status === 'INVALIDATED' || !validPreregisteredCase(item)
    || (item.status === 'RESOLVED' && item.criterionHashAtResolution !== item.criterionHashAtSeal));
  const validResolved = cases.filter((item) => validPreregisteredCase(item) && item.status === 'RESOLVED'
    && (item.outcome === 0 || item.outcome === 1) && item.criterionHashAtResolution === item.criterionHashAtSeal);

  if (!validResolved.length) {
    return {
      state: 'NO_COMPUTABLE_CASES', resolvedValidCases: 0, invalidatedCases: invalidated.length,
      brierScore: null, logLoss: null, adaptiveCalibrationCurve: [], segments: [], minimumResolvedCasesForVerdict,
      directAtlasScoreDelta: 0, canChangeMethodology: false,
      reasons: ['Κ requires timestamped preregistration, explicit probability, horizon, criterion and resolution source. Retrospectively changed criteria are invalidated.'],
    };
  }

  const segmentMap = new Map<string, KappaPreregisteredCase[]>();
  for (const item of validResolved) {
    const key = kappaSegmentKey(item);
    const arr = segmentMap.get(key) ?? [];
    arr.push(item);
    segmentMap.set(key, arr);
  }
  const segments: KappaSegmentMetrics[] = [];
  for (const [key, items] of segmentMap.entries()) {
    const bs = brierScore(items);
    const base = baseRatesBySegment[key];
    const validBase = Number.isFinite(base) && base >= 0 && base <= 1;
    const baseBs = validBase ? mean(items.map((item) => (base - (item.outcome as BinaryOutcome)) ** 2)) : null;
    segments.push({
      key,
      n: items.length,
      brierScore: bs,
      logLoss: logLoss(items),
      brierSkillScore: baseBs != null && baseBs > 0 ? 1 - bs / baseBs : null,
      baseRate: validBase ? base : null,
    });
  }

  return {
    state: validResolved.length >= minimumResolvedCasesForVerdict ? 'VERDICT_AVAILABLE' : 'ACCUMULATING',
    resolvedValidCases: validResolved.length,
    invalidatedCases: invalidated.length,
    brierScore: brierScore(validResolved),
    logLoss: logLoss(validResolved),
    adaptiveCalibrationCurve: adaptiveBins(validResolved),
    segments: segments.sort((a, b) => a.key.localeCompare(b.key)),
    minimumResolvedCasesForVerdict,
    directAtlasScoreDelta: 0,
    canChangeMethodology: false,
    reasons: [
      'Brier Skill Score is segmented by claim type and horizon; no single global base rate is treated as universal.',
      'Log loss is reported alongside Brier so extreme wrong probabilities are explicitly penalized.',
      'Fifty resolved cases unlock only a first calibration verdict; adaptive bins are used instead of sparse deciles.',
      'Κ can recommend that governance review calibration, but it cannot itself change a model, score or methodology.',
    ],
  };
}

// -----------------------------------------------------------------------------
// Γ — VIGENCIA Ω
// Question: are the conditions under which the thesis was issued still in force?
// Critical falsifiers, continuous condition integrity and freshness stay separate.
// -----------------------------------------------------------------------------

export type GammaSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type GammaObservedState = 'ACTIVATED' | 'NOT_ACTIVATED' | 'NOT_EVALUATED';

export interface GammaFalsifierDefinition {
  id: string;
  sealedAt: string;
  metric: string;
  operator: '<' | '<=' | '>' | '>=' | '==' | '!=';
  threshold: number;
  unit: string;
  window: string;
  resolutionSource: string;
  weight: number;
  severity: GammaSeverity;
  observable: boolean;
  causal: boolean;
  thesisRelevant: boolean;
}

export interface GammaFalsifierObservation {
  falsifierId: string;
  state: GammaObservedState;
  observedAt?: string;
  evidenceId?: string;
}

export interface GammaVigenciaResult {
  state: 'VIGENTE_MEDIBLE' | 'VIGENCIA_NO_EVALUABLE' | 'VIGENCIA_EVIDENCE_PENDING';
  vOmega: number | null;
  criticalActivated: string[];
  activatedNonCritical: string[];
  evaluationCoverage: number;
  centralEvidenceAgeDays: number | null;
  freshnessScore: number | null;
  freshnessHalfLifeDays: number | null;
  directAtlasScoreDelta: 0;
  canBuySell: false;
  reasons: string[];
}

export function validateGammaFalsifiers(definitions: readonly GammaFalsifierDefinition[]): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!definitions.length) reasons.push('No falsifiers are registered.');
  const ids = new Set<string>();
  let totalWeight = 0;
  for (const f of definitions) {
    if (!f.id.trim() || ids.has(f.id)) reasons.push(`Invalid or duplicate falsifier ID: ${f.id || '<blank>'}.`);
    ids.add(f.id);
    if (!Number.isFinite(Date.parse(f.sealedAt))) reasons.push(`${f.id}: invalid sealedAt timestamp.`);
    if (!f.metric.trim() || !Number.isFinite(f.threshold) || !f.unit.trim() || !f.window.trim() || !f.resolutionSource.trim()) reasons.push(`${f.id}: condition is not fully observable/resolveable.`);
    if (!f.observable || !f.causal || !f.thesisRelevant) reasons.push(`${f.id}: falsifier must be observable AND causal AND thesis-relevant.`);
    if (!Number.isFinite(f.weight) || f.weight <= 0 || f.weight > 1) reasons.push(`${f.id}: invalid weight.`);
    totalWeight += f.weight;
  }
  if (definitions.length && Math.abs(totalWeight - 1) > 1e-6) reasons.push(`Falsifier weights must sum to 1.00; received ${totalWeight}.`);
  return { valid: reasons.length === 0, reasons };
}

export function evaluateGammaVigencia(
  definitions: readonly GammaFalsifierDefinition[],
  observations: readonly GammaFalsifierObservation[],
  centralEvidenceAsOf?: string,
  nowIso?: string,
  freshnessHalfLifeDays = 180,
): GammaVigenciaResult {
  const validation = validateGammaFalsifiers(definitions);
  if (!validation.valid) {
    return {
      state: 'VIGENCIA_NO_EVALUABLE', vOmega: null, criticalActivated: [], activatedNonCritical: [], evaluationCoverage: 0,
      centralEvidenceAgeDays: null, freshnessScore: null, freshnessHalfLifeDays: null, directAtlasScoreDelta: 0, canBuySell: false,
      reasons: validation.reasons,
    };
  }

  const observationMap = new Map(observations.map((o) => [o.falsifierId, o]));
  const evaluated = definitions.filter((f) => {
    const state = observationMap.get(f.id)?.state;
    return state === 'ACTIVATED' || state === 'NOT_ACTIVATED';
  });
  const coverage = evaluated.reduce((sum, f) => sum + f.weight, 0);
  const pending = evaluated.length !== definitions.length;

  const criticalActivated = definitions
    .filter((f) => f.severity === 'CRITICAL' && observationMap.get(f.id)?.state === 'ACTIVATED')
    .map((f) => f.id);
  const nonCritical = definitions.filter((f) => f.severity !== 'CRITICAL');
  const nonCriticalTotal = nonCritical.reduce((sum, f) => sum + f.weight, 0);
  const activatedNonCriticalDefs = nonCritical.filter((f) => observationMap.get(f.id)?.state === 'ACTIVATED');
  const activatedNonCriticalWeight = activatedNonCriticalDefs.reduce((sum, f) => sum + f.weight, 0);
  const vOmega = pending || nonCriticalTotal <= 0 ? null : clamp01(1 - activatedNonCriticalWeight / nonCriticalTotal);

  let ageDays: number | null = null;
  let freshnessScore: number | null = null;
  const centralTs = centralEvidenceAsOf ? Date.parse(centralEvidenceAsOf) : NaN;
  const nowTs = nowIso ? Date.parse(nowIso) : Date.now();
  if (Number.isFinite(centralTs) && Number.isFinite(nowTs) && nowTs >= centralTs && Number.isFinite(freshnessHalfLifeDays) && freshnessHalfLifeDays > 0) {
    ageDays = (nowTs - centralTs) / 86_400_000;
    freshnessScore = Math.exp(-Math.log(2) * ageDays / freshnessHalfLifeDays);
  }

  return {
    state: pending ? 'VIGENCIA_EVIDENCE_PENDING' : 'VIGENTE_MEDIBLE',
    vOmega,
    criticalActivated,
    activatedNonCritical: activatedNonCriticalDefs.map((f) => f.id),
    evaluationCoverage: coverage,
    centralEvidenceAgeDays: ageDays,
    freshnessScore,
    freshnessHalfLifeDays: freshnessScore == null ? null : freshnessHalfLifeDays,
    directAtlasScoreDelta: 0,
    canBuySell: false,
    reasons: [
      'V_Ω measures only non-critical thesis-condition integrity; critical falsifiers are surfaced separately and cannot be diluted by averaging.',
      'Freshness is an independent output: absence of an activated falsifier is not proof that the thesis was recently re-verified.',
      'Γ never reinterprets a falsifier to rescue a thesis and never emits BUY or SELL.',
      'A critical activation is handed to the independent Falsifier Veto / Decision Engine; Γ itself has no veto authority.',
    ],
  };
}

// -----------------------------------------------------------------------------
// Υ — ALLOCATION Ω
// Question: among already admitted positions, how much capital does each deserve?
// Expected Return is explicit. Structural Score is trace metadata only.
// -----------------------------------------------------------------------------

export type UpsilonAdmissionState = 'ACTIVE_ADMITTED' | 'ADMITTED_RESERVE';

export interface UpsilonPositionInput {
  ticker: string;
  admissionState: UpsilonAdmissionState;
  structuralScore?: number;
  expectedReturnPct: number;
  effectiveConfidence: number;
  vOmega?: number;
  tailRiskPct: number;
  transactionCostPct: number;
  currentWeight: number;
  themeExposures: Record<string, number>;
}

export interface UpsilonPolicy {
  policyId: string;
  maxPositionWeight: number;
  minActiveWeight: number;
  themeCaps: Record<string, number>;
  lambdaTail: number;
  lambdaUncertainty: number;
  lambdaCost: number;
  lambdaTurnover: number;
}

export interface UpsilonTargetWeight {
  ticker: string;
  targetWeight: number;
  currentWeight: number;
  admissionState: UpsilonAdmissionState;
  riskAdjustedExpectedReturnPct: number;
  structuralScoreTrace: number | null;
}

export interface UpsilonAllocationResult {
  state: 'FEASIBLE_TARGET' | 'CONSTRAINT_INFEASIBLE' | 'EVIDENCE_PENDING';
  targets: UpsilonTargetWeight[];
  themeExposure: Record<string, number>;
  totalWeight: number;
  policyId: string;
  directAtlasScoreDelta: 0;
  canAdmitExclude: false;
  reasons: string[];
}

function validateUpsilonInputs(positions: readonly UpsilonPositionInput[], policy: UpsilonPolicy): string[] {
  const reasons: string[] = [];
  if (!positions.length) reasons.push('No admitted positions supplied.');
  const tickers = new Set<string>();
  for (const p of positions) {
    if (!p.ticker.trim() || tickers.has(p.ticker)) reasons.push(`Duplicate/invalid ticker: ${p.ticker || '<blank>'}.`);
    tickers.add(p.ticker);
    const nums = [p.expectedReturnPct, p.effectiveConfidence, p.tailRiskPct, p.transactionCostPct, p.currentWeight];
    if (!finite(nums)) reasons.push(`${p.ticker}: non-finite allocation input.`);
    if (p.effectiveConfidence < 0 || p.effectiveConfidence > 1 || p.currentWeight < 0 || p.currentWeight > 1) reasons.push(`${p.ticker}: confidence/weight out of range.`);
    if (p.vOmega != null && (!Number.isFinite(p.vOmega) || p.vOmega < 0 || p.vOmega > 1)) reasons.push(`${p.ticker}: V_Ω out of range.`);
    for (const [theme, exposure] of Object.entries(p.themeExposures)) if (!theme.trim() || !Number.isFinite(exposure) || exposure < 0 || exposure > 1) reasons.push(`${p.ticker}: invalid fractional theme exposure.`);
  }
  const pNums = [policy.maxPositionWeight, policy.minActiveWeight, policy.lambdaTail, policy.lambdaUncertainty, policy.lambdaCost, policy.lambdaTurnover];
  if (!finite(pNums) || policy.maxPositionWeight <= 0 || policy.maxPositionWeight > 1 || policy.minActiveWeight < 0 || policy.minActiveWeight > policy.maxPositionWeight) reasons.push('Invalid Υ policy parameters.');
  for (const [theme, cap] of Object.entries(policy.themeCaps)) if (!theme.trim() || !Number.isFinite(cap) || cap < 0 || cap > 1) reasons.push(`Invalid hard theme cap: ${theme}.`);
  return reasons;
}

function riskAdjustedExpectedReturn(p: UpsilonPositionInput, policy: UpsilonPolicy): number {
  const uncertainty = (1 - p.effectiveConfidence) * Math.max(Math.abs(p.expectedReturnPct), 1);
  const vigenciaMultiplier = p.vOmega == null ? 1 : p.vOmega;
  const expectedReturnAfterVigencia = p.expectedReturnPct * vigenciaMultiplier;
  return expectedReturnAfterVigencia
    - policy.lambdaTail * Math.max(0, p.tailRiskPct)
    - policy.lambdaUncertainty * uncertainty
    - policy.lambdaCost * Math.max(0, p.transactionCostPct);
}

function computeThemeExposure(positions: readonly UpsilonPositionInput[], weights: readonly number[]): Record<string, number> {
  const out: Record<string, number> = {};
  positions.forEach((p, i) => {
    for (const [theme, exposure] of Object.entries(p.themeExposures)) out[theme] = (out[theme] ?? 0) + weights[i] * exposure;
  });
  return out;
}

function constraintsSatisfied(positions: readonly UpsilonPositionInput[], weights: readonly number[], policy: UpsilonPolicy, tolerance = 1e-8): boolean {
  const total = weights.reduce((a, b) => a + b, 0);
  if (Math.abs(total - 1) > 1e-6) return false;
  for (let i = 0; i < positions.length; i += 1) {
    if (weights[i] < -tolerance || weights[i] > policy.maxPositionWeight + tolerance) return false;
    if (positions[i].admissionState === 'ACTIVE_ADMITTED' && weights[i] + tolerance < policy.minActiveWeight) return false;
  }
  const exposures = computeThemeExposure(positions, weights);
  return Object.entries(policy.themeCaps).every(([theme, cap]) => (exposures[theme] ?? 0) <= cap + tolerance);
}

export function evaluateUpsilonAllocation(
  positions: readonly UpsilonPositionInput[],
  policy: UpsilonPolicy,
): UpsilonAllocationResult {
  const validation = validateUpsilonInputs(positions, policy);
  if (validation.length) {
    return { state: 'EVIDENCE_PENDING', targets: [], themeExposure: {}, totalWeight: 0, policyId: policy.policyId,
      directAtlasScoreDelta: 0, canAdmitExclude: false, reasons: validation };
  }

  const activeCount = positions.filter((p) => p.admissionState === 'ACTIVE_ADMITTED').length;
  const minimumRequired = activeCount * policy.minActiveWeight;
  if (minimumRequired > 1 + 1e-9 || positions.length * policy.maxPositionWeight < 1 - 1e-9) {
    return { state: 'CONSTRAINT_INFEASIBLE', targets: [], themeExposure: {}, totalWeight: 0, policyId: policy.policyId,
      directAtlasScoreDelta: 0, canAdmitExclude: false,
      reasons: ['Hard minimum/maximum position constraints cannot sum to a fully invested portfolio. Υ does not relax them automatically.'] };
  }

  const utilities = positions.map((p) => riskAdjustedExpectedReturn(p, policy));
  const weights = positions.map((p) => p.admissionState === 'ACTIVE_ADMITTED' ? policy.minActiveWeight : 0);
  let remaining = 1 - weights.reduce((a, b) => a + b, 0);
  const quantum = 0.0005;
  let iterations = 0;
  const maxIterations = Math.ceil(1 / quantum) * 20;

  while (remaining > 1e-9 && iterations < maxIterations) {
    iterations += 1;
    let bestIndex = -1;
    let bestMarginal = -Infinity;
    for (let i = 0; i < positions.length; i += 1) {
      if (weights[i] >= policy.maxPositionWeight - 1e-12) continue;
      const step = Math.min(quantum, remaining, policy.maxPositionWeight - weights[i]);
      if (step <= 0) continue;
      const candidate = [...weights];
      candidate[i] += step;
      const exposures = computeThemeExposure(positions, candidate);
      const violatesTheme = Object.entries(policy.themeCaps).some(([theme, cap]) => (exposures[theme] ?? 0) > cap + 1e-12);
      if (violatesTheme) continue;
      const current = positions[i].currentWeight;
      const beforeTurnover = Math.abs(weights[i] - current);
      const afterTurnover = Math.abs(candidate[i] - current);
      const incrementalTurnover = Math.max(0, afterTurnover - beforeTurnover) * 100;
      const marginal = utilities[i] - policy.lambdaTurnover * incrementalTurnover;
      if (marginal > bestMarginal) {
        bestMarginal = marginal;
        bestIndex = i;
      }
    }
    if (bestIndex < 0) break;
    const step = Math.min(quantum, remaining, policy.maxPositionWeight - weights[bestIndex]);
    weights[bestIndex] += step;
    remaining -= step;
  }

  if (remaining > 1e-6 || !constraintsSatisfied(positions, weights, policy)) {
    return {
      state: 'CONSTRAINT_INFEASIBLE', targets: [], themeExposure: computeThemeExposure(positions, weights),
      totalWeight: weights.reduce((a, b) => a + b, 0), policyId: policy.policyId, directAtlasScoreDelta: 0, canAdmitExclude: false,
      reasons: [
        'No fully invested feasible vector was found without violating hard position/theme constraints.',
        'Υ never relaxes concentration caps, changes admission state or silently reclassifies thematic exposure.',
      ],
    };
  }

  const targets = positions.map((p, i) => ({
    ticker: p.ticker,
    targetWeight: weights[i],
    currentWeight: p.currentWeight,
    admissionState: p.admissionState,
    riskAdjustedExpectedReturnPct: utilities[i],
    structuralScoreTrace: p.structuralScore != null && Number.isFinite(p.structuralScore) ? p.structuralScore : null,
  }));

  return {
    state: 'FEASIBLE_TARGET',
    targets,
    themeExposure: computeThemeExposure(positions, weights),
    totalWeight: weights.reduce((a, b) => a + b, 0),
    policyId: policy.policyId,
    directAtlasScoreDelta: 0,
    canAdmitExclude: false,
    reasons: [
      'Υ consumes explicit Expected Return; Structural Score is trace metadata and is never multiplied by Confidence or V_Ω to manufacture a return forecast.',
      'Theme exposure is fractional: portfolio exposure = Σ(weight_i × themeExposure_i).',
      'Position and thematic caps are hard constraints, not score penalties.',
      'ACTIVE_ADMITTED positions preserve the configured minimum; ADMITTED_RESERVE may receive zero without being excluded by Υ.',
      'Final broker execution remains behind canonical execution-safety gates.',
    ],
  };
}

export const GREEK_CONTRACT_ENGINE_MANIFEST = [
  'DELTA_DIVERGENCE_OMEGA_V1',
  'CORE_CONFIDENCE_AGGREGATION_OMEGA_V1',
  'KAPPA_CALIBRATION_OMEGA_V1',
  'GAMMA_VIGENCIA_OMEGA_V1',
  'UPSILON_ALLOCATION_OMEGA_V1',
] as const;
