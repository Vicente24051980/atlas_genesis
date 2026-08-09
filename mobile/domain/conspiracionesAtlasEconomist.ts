export type ConspiracionesEvidenceClass = 'FACT' | 'INTERPRETATION' | 'HYPOTHESIS' | 'SPECULATION';
export type EconomistCoverEffect = 'PREDICTIVE' | 'CONTRARIAN' | 'SATURATION' | 'NULL';
export type EconomistCoverClassificationStatus = 'PENDING_OUTCOME' | 'CLASSIFIED';

export interface NarrativeSaturationDimensions {
  trendMaturity: number;
  extremeness: number;
  narrativeIntensity: number;
  institutionalStress: number;
  crossAssetConfirmation: number;
  crowding?: number | null;
}

export interface ForwardCoverOutcome {
  observedAt: string;
  directionalContinuation: number;
  reversalStrength: number;
  regimeChange: number;
}

export interface EconomistCoverAssessmentInput {
  issueId: string;
  issueDate: string;
  asOf: string;
  metricsObservedAt: string;
  monetaryCover: boolean;
  dimensions: NarrativeSaturationDimensions;
  forwardOutcome?: ForwardCoverOutcome | null;
  evidenceRefs: string[];
}

export interface EconomistCoverAssessment {
  issueId: string;
  saturationScore: number;
  status: EconomistCoverClassificationStatus;
  effect: EconomistCoverEffect | null;
  flags: string[];
}

export const NARRATIVE_SATURATION_WEIGHTS = {
  trendMaturity: 25,
  extremeness: 20,
  narrativeIntensity: 15,
  institutionalStress: 15,
  crossAssetConfirmation: 15,
  crowding: 10,
} as const;

export const CONSPIRACIONES_ATLAS_HYPOTHESES = [
  'PREDICTIVE_ECONOMIST_EFFECT',
  'CONTRARIAN_COVER_EFFECT',
  'NARRATIVE_SATURATION_EFFECT',
  'NULL_RETROSPECTIVE_BIAS',
] as const;

export const MACRO_PROPAGATION_CHAIN = [
  'CURRENCY', 'COMMODITIES', 'INFLATION', 'RATES', 'MARGINS', 'EARNINGS', 'FLOWS', 'SECTORS',
] as const;

function clampScore(value: number): number {
  if (!Number.isFinite(value)) throw new Error('Conspiraciones Atlas Ω: score must be finite');
  return Math.max(0, Math.min(100, value));
}

function epoch(value: string, label: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`Conspiraciones Atlas Ω: invalid ${label}`);
  return parsed;
}

function assertNotAfter(observedAt: string, asOf: string, label: string): void {
  if (epoch(observedAt, label) > epoch(asOf, 'asOf')) {
    throw new Error(`Conspiraciones Atlas Ω anti-lookahead: ${label} is after asOf`);
  }
}

export function narrativeSaturationScore(dimensions: NarrativeSaturationDimensions): number {
  const entries: Array<[number, number]> = [
    [clampScore(dimensions.trendMaturity), NARRATIVE_SATURATION_WEIGHTS.trendMaturity],
    [clampScore(dimensions.extremeness), NARRATIVE_SATURATION_WEIGHTS.extremeness],
    [clampScore(dimensions.narrativeIntensity), NARRATIVE_SATURATION_WEIGHTS.narrativeIntensity],
    [clampScore(dimensions.institutionalStress), NARRATIVE_SATURATION_WEIGHTS.institutionalStress],
    [clampScore(dimensions.crossAssetConfirmation), NARRATIVE_SATURATION_WEIGHTS.crossAssetConfirmation],
  ];
  if (dimensions.crowding !== undefined && dimensions.crowding !== null) {
    entries.push([clampScore(dimensions.crowding), NARRATIVE_SATURATION_WEIGHTS.crowding]);
  }
  const weighted = entries.reduce((sum, [score, weight]) => sum + score * weight, 0);
  const weights = entries.reduce((sum, [, weight]) => sum + weight, 0);
  return Math.round(weighted / weights);
}

export function assessEconomistCover(input: EconomistCoverAssessmentInput): EconomistCoverAssessment {
  assertNotAfter(input.issueDate, input.asOf, 'issueDate');
  assertNotAfter(input.metricsObservedAt, input.asOf, 'metricsObservedAt');
  if (input.evidenceRefs.length === 0) throw new Error('Conspiraciones Atlas Ω: cover assessment requires traceable evidence');

  const saturationScore = narrativeSaturationScore(input.dimensions);
  const flags: string[] = [];
  if (!input.monetaryCover) flags.push('NON_MONETARY_CONTROL_CANDIDATE');
  if (input.dimensions.crowding === undefined || input.dimensions.crowding === null) {
    flags.push('CROWDING_NOT_AVAILABLE_WEIGHT_RENORMALIZED');
  }
  if (!input.forwardOutcome) {
    return { issueId: input.issueId, saturationScore, status: 'PENDING_OUTCOME', effect: null, flags };
  }

  assertNotAfter(input.forwardOutcome.observedAt, input.asOf, 'forwardOutcome.observedAt');
  const continuation = clampScore(input.forwardOutcome.directionalContinuation);
  const reversal = clampScore(input.forwardOutcome.reversalStrength);
  const regimeChange = clampScore(input.forwardOutcome.regimeChange);

  let effect: EconomistCoverEffect = 'NULL';
  if (saturationScore >= 65 && reversal >= 65) effect = 'CONTRARIAN';
  else if (continuation >= 65 && regimeChange >= 55) effect = 'PREDICTIVE';
  else if (saturationScore >= 65 && input.dimensions.trendMaturity >= 70) effect = 'SATURATION';

  return { issueId: input.issueId, saturationScore, status: 'CLASSIFIED', effect, flags };
}

export type CrossAssetRegime =
  | 'USD_STRENGTH_DISINFLATION'
  | 'REFLATION_COMMODITY'
  | 'SYSTEMIC_FEAR'
  | 'RESERVE_ARCHITECTURE_STRESS'
  | 'MIXED';

export interface CrossAssetSnapshot {
  observedAt: string;
  usdReturnPct: number;
  goldReturnPct: number;
  oilReturnPct: number;
  ust10yYieldChangeBps: number;
}

export function classifyCrossAssetRegime(snapshot: CrossAssetSnapshot): CrossAssetRegime {
  const usd = snapshot.usdReturnPct;
  const gold = snapshot.goldReturnPct;
  const oil = snapshot.oilReturnPct;
  const yields = snapshot.ust10yYieldChangeBps;
  if (usd < 0 && gold > 0 && yields > 0) return 'RESERVE_ARCHITECTURE_STRESS';
  if (usd < 0 && oil > 0 && gold > 0) return 'REFLATION_COMMODITY';
  if (usd > 0 && gold > 0) return 'SYSTEMIC_FEAR';
  if (usd > 0 && oil < 0) return 'USD_STRENGTH_DISINFLATION';
  return 'MIXED';
}

export function countReserveArchitectureStress(snapshots: CrossAssetSnapshot[], asOf: string): number {
  return snapshots.reduce((count, snapshot) => {
    assertNotAfter(snapshot.observedAt, asOf, 'crossAssetSnapshot.observedAt');
    return count + (classifyCrossAssetRegime(snapshot) === 'RESERVE_ARCHITECTURE_STRESS' ? 1 : 0);
  }, 0);
}

export type Phoenix2026SignalId =
  | 'RESERVE_STRESS_TRIAD_REPEATED'
  | 'USD_RESERVE_BELOW_55_REALLOCATION'
  | 'RMB_RESERVE_MATERIAL_GAIN'
  | 'CENTRAL_BANK_GOLD_BUYING_ELEVATED'
  | 'BRICS_COMMON_UNIT'
  | 'ENERGY_DEDOLLARIZATION'
  | 'EXTRAORDINARY_SDR_EXPANSION'
  | 'SDR_PRIVATE_RETAIL_USE'
  | 'TRANSNATIONAL_COMMERCIAL_UNIT'
  | 'BRICS_LOCAL_RAILS_ONLY'
  | 'AUG12_ECLIPSE_ONLY';

export interface Phoenix2026SignalObservation {
  id: Phoenix2026SignalId;
  active: boolean;
  observedAt: string;
  evidenceClass: ConspiracionesEvidenceClass;
  evidenceRefs: string[];
  note?: string | null;
}

export type Phoenix2026State =
  | 'NO_MATERIAL_BREAK'
  | 'FRAGMENTATION_ACCELERATING'
  | 'RESERVE_ARCHITECTURE_STRESS'
  | 'STRUCTURAL_MONETARY_BREAK';

export interface Phoenix2026Assessment {
  asOf: string;
  regimeStressScore: number;
  state: Phoenix2026State;
  scoredSignals: Phoenix2026SignalId[];
  contextSignals: Phoenix2026SignalId[];
  excludedSignals: Phoenix2026SignalId[];
  flags: string[];
}

export const PHOENIX_2026_BASELINE = {
  caseId: 'ECONOMIST_GLOBAL_CURRENCY_BEEF_2026',
  coverDate: '2026-08-08T00:00:00Z',
  frozenAt: '2026-08-09T00:00:00Z',
  title: 'The Global Currency Beef',
  experiment: 'OUT_OF_SAMPLE',
  rule: 'No retrospective reinterpretation and no moving goalposts.',
  eclipseRule: 'The 2026-08-12 eclipse is known in advance and never counts as monetary confirmation.',
} as const;

export const PHOENIX_2026_SIGNAL_WEIGHTS: Record<Phoenix2026SignalId, number> = {
  RESERVE_STRESS_TRIAD_REPEATED: 30,
  USD_RESERVE_BELOW_55_REALLOCATION: 15,
  RMB_RESERVE_MATERIAL_GAIN: 10,
  CENTRAL_BANK_GOLD_BUYING_ELEVATED: 10,
  BRICS_COMMON_UNIT: 10,
  ENERGY_DEDOLLARIZATION: 10,
  EXTRAORDINARY_SDR_EXPANSION: 5,
  SDR_PRIVATE_RETAIL_USE: 5,
  TRANSNATIONAL_COMMERCIAL_UNIT: 5,
  BRICS_LOCAL_RAILS_ONLY: 0,
  AUG12_ECLIPSE_ONLY: 0,
};

const HARD_BREAK_SIGNALS = new Set<Phoenix2026SignalId>(['SDR_PRIVATE_RETAIL_USE', 'TRANSNATIONAL_COMMERCIAL_UNIT']);

function qualifyingFact(items: Phoenix2026SignalObservation[]): Phoenix2026SignalObservation | undefined {
  return items.find((item) => item.active && item.evidenceClass === 'FACT' && item.evidenceRefs.length > 0);
}

export function buildRepeatedReserveStressSignal(
  snapshots: CrossAssetSnapshot[],
  evidenceRefs: string[],
  asOf: string,
): Phoenix2026SignalObservation {
  const occurrences = countReserveArchitectureStress(snapshots, asOf);
  return {
    id: 'RESERVE_STRESS_TRIAD_REPEATED',
    active: occurrences >= 2,
    observedAt: asOf,
    evidenceClass: evidenceRefs.length > 0 ? 'FACT' : 'HYPOTHESIS',
    evidenceRefs,
    note: `${occurrences} independent reserve-architecture stress observations`,
  };
}

export function evaluatePhoenix2026(observations: Phoenix2026SignalObservation[], asOf: string): Phoenix2026Assessment {
  if (epoch(asOf, 'asOf') < epoch(PHOENIX_2026_BASELINE.frozenAt, 'frozenAt')) {
    throw new Error('Phoenix 2026 Ω: asOf precedes the frozen baseline');
  }

  const grouped = new Map<Phoenix2026SignalId, Phoenix2026SignalObservation[]>();
  for (const observation of observations) {
    assertNotAfter(observation.observedAt, asOf, 'phoenixSignal.observedAt');
    if (epoch(observation.observedAt, 'phoenixSignal.observedAt') < epoch(PHOENIX_2026_BASELINE.frozenAt, 'frozenAt')) {
      throw new Error('Phoenix 2026 Ω anti-retrofit: monitored signals must not predate the frozen baseline');
    }
    grouped.set(observation.id, [...(grouped.get(observation.id) ?? []), observation]);
  }

  const scoredSignals: Phoenix2026SignalId[] = [];
  const contextSignals: Phoenix2026SignalId[] = [];
  const excludedSignals: Phoenix2026SignalId[] = [];
  const flags: string[] = [];
  let regimeStressScore = 0;

  for (const [id, candidates] of grouped.entries()) {
    if (candidates.length > 1) flags.push(`DEDUPED_${id}`);
    if (!candidates.some((item) => item.active)) continue;

    if (id === 'AUG12_ECLIPSE_ONLY') {
      excludedSignals.push(id);
      flags.push('AUG12_ECLIPSE_EXCLUDED_BY_FROZEN_RULE');
      continue;
    }

    const fact = qualifyingFact(candidates);
    if (!fact) {
      flags.push(`NON_SCORING_UNCONFIRMED_${id}`);
      continue;
    }

    if (id === 'BRICS_LOCAL_RAILS_ONLY') {
      contextSignals.push(id);
      flags.push('BRICS_LOCAL_RAILS_FRAGMENTATION_NOT_PHOENIX');
      continue;
    }

    scoredSignals.push(id);
    regimeStressScore += PHOENIX_2026_SIGNAL_WEIGHTS[id];
  }

  regimeStressScore = clampScore(regimeStressScore);
  const uniqueScored = Array.from(new Set(scoredSignals));
  const hasHardBreak = uniqueScored.some((id) => HARD_BREAK_SIGNALS.has(id));
  const hasBricsUnit = uniqueScored.includes('BRICS_COMMON_UNIT');
  const hasReserveStress = uniqueScored.includes('RESERVE_STRESS_TRIAD_REPEATED');

  let state: Phoenix2026State = 'NO_MATERIAL_BREAK';
  if (hasHardBreak || (hasBricsUnit && regimeStressScore >= 50)) state = 'STRUCTURAL_MONETARY_BREAK';
  else if (hasReserveStress || regimeStressScore >= 40) state = 'RESERVE_ARCHITECTURE_STRESS';
  else if (regimeStressScore >= 20 || contextSignals.length > 0) state = 'FRAGMENTATION_ACCELERATING';

  return {
    asOf,
    regimeStressScore,
    state,
    scoredSignals: uniqueScored,
    contextSignals: Array.from(new Set(contextSignals)),
    excludedSignals: Array.from(new Set(excludedSignals)),
    flags,
  };
}

export interface EconomistIssueDatasetRow {
  issueId: string;
  issueDate: string;
  coverText: string;
  symbolTags: string[];
  monetaryCover: boolean;
  blindLabelsFrozenAt: string;
  evidenceClass: ConspiracionesEvidenceClass;
  evidenceRefs: string[];
  usd?: number | null;
  gold?: number | null;
  oil?: number | null;
  yield2y?: number | null;
  yield10y?: number | null;
  credit?: number | null;
  inflation?: number | null;
  sp500?: number | null;
  worldEquities?: number | null;
  emergingMarkets?: number | null;
  sectors?: Record<string, number> | null;
  institutionalCrisisTags: string[];
  sdrTags: string[];
  euroTags: string[];
  chinaTags: string[];
  bricsTags: string[];
  preReturns: { m12?: number; m6?: number; m3?: number };
  postReturns: { m1?: number; m3?: number; m6?: number; m12?: number; m36?: number };
  predictionSpecificity: number;
  falsePositive?: boolean | null;
}

export interface MatchedCoverOutcome {
  treatmentIssueId: string;
  treatmentOutcome: number;
  controlIssueId: string;
  controlOutcome: number;
}

export interface MatchedCoverStudySummary {
  pairs: number;
  meanTreatmentOutcome: number;
  meanControlOutcome: number;
  meanMatchedDifference: number;
}

export function summarizeMatchedCoverStudy(pairs: MatchedCoverOutcome[]): MatchedCoverStudySummary {
  if (pairs.length === 0) return { pairs: 0, meanTreatmentOutcome: 0, meanControlOutcome: 0, meanMatchedDifference: 0 };
  const treatment = pairs.reduce((sum, pair) => sum + pair.treatmentOutcome, 0) / pairs.length;
  const control = pairs.reduce((sum, pair) => sum + pair.controlOutcome, 0) / pairs.length;
  return { pairs: pairs.length, meanTreatmentOutcome: treatment, meanControlOutcome: control, meanMatchedDifference: treatment - control };
}

export function conspiracionesAtlasEconomistContractCheck(): void {
  const historical = assessEconomistCover({
    issueId: 'historical-contrarian-test',
    issueDate: '2004-02-07T00:00:00Z',
    metricsObservedAt: '2004-02-07T00:00:00Z',
    asOf: '2005-12-31T00:00:00Z',
    monetaryCover: true,
    evidenceRefs: ['cover', 'market-data'],
    dimensions: { trendMaturity: 90, extremeness: 85, narrativeIntensity: 90, institutionalStress: 70, crossAssetConfirmation: 80, crowding: 85 },
    forwardOutcome: { observedAt: '2005-12-31T00:00:00Z', directionalContinuation: 20, reversalStrength: 85, regimeChange: 70 },
  });
  if (historical.effect !== 'CONTRARIAN') throw new Error('Conspiraciones Atlas Ω contract: saturated reversal must classify CONTRARIAN');

  const reserveStress = classifyCrossAssetRegime({
    observedAt: '2026-08-10T00:00:00Z', usdReturnPct: -1, goldReturnPct: 2, oilReturnPct: 0, ust10yYieldChangeBps: 12,
  });
  if (reserveStress !== 'RESERVE_ARCHITECTURE_STRESS') throw new Error('Phoenix 2026 Ω contract: reserve stress triad must classify correctly');

  const unsupportedContext = evaluatePhoenix2026([{
    id: 'BRICS_LOCAL_RAILS_ONLY', active: true, observedAt: '2026-08-10T00:00:00Z', evidenceClass: 'HYPOTHESIS', evidenceRefs: [],
  }], '2026-08-10T01:00:00Z');
  if (unsupportedContext.state !== 'NO_MATERIAL_BREAK') throw new Error('Phoenix 2026 Ω contract: unconfirmed context cannot escalate state');

  const eclipseOnly = evaluatePhoenix2026([{
    id: 'AUG12_ECLIPSE_ONLY', active: true, observedAt: '2026-08-12T18:00:00Z', evidenceClass: 'FACT', evidenceRefs: ['astronomy-calendar'],
  }], '2026-08-12T23:00:00Z');
  if (eclipseOnly.regimeStressScore !== 0 || eclipseOnly.state !== 'NO_MATERIAL_BREAK') {
    throw new Error('Phoenix 2026 Ω contract: eclipse must never score as monetary evidence');
  }

  const structural = evaluatePhoenix2026([
    { id: 'RESERVE_STRESS_TRIAD_REPEATED', active: true, observedAt: '2026-09-01T00:00:00Z', evidenceClass: 'FACT', evidenceRefs: ['macro-primary-1'] },
    { id: 'RESERVE_STRESS_TRIAD_REPEATED', active: true, observedAt: '2026-09-02T00:00:00Z', evidenceClass: 'FACT', evidenceRefs: ['macro-primary-2'] },
    { id: 'TRANSNATIONAL_COMMERCIAL_UNIT', active: true, observedAt: '2026-09-03T00:00:00Z', evidenceClass: 'FACT', evidenceRefs: ['institution-primary'] },
  ], '2026-09-04T00:00:00Z');
  if (structural.regimeStressScore !== 35) throw new Error('Phoenix 2026 Ω contract: duplicate signals must not double count');
  if (structural.state !== 'STRUCTURAL_MONETARY_BREAK') throw new Error('Phoenix 2026 Ω contract: hard break signal must escalate state');
}
