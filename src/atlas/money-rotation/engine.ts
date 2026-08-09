import {
  assertMoneyRotationSemantics,
  type QuantMetricType,
  type QuantitativeObservation,
} from '../evidence-ingestion/integrity';

export const ROTATION_SCORE_WEIGHTS = {
  flows: 0.20,
  relativeStrength: 0.20,
  earningsRevisions: 0.15,
  breadth: 0.10,
  institutionalVolume: 0.10,
  newsReaction: 0.10,
  macroRegime: 0.10,
  crowding: 0.05,
} as const;

export type RotationScoreInput = Record<keyof typeof ROTATION_SCORE_WEIGHTS, number>;

export type FlowWindow = '1W' | '4W' | '13W' | 'MONTH' | 'YTD' | 'OTHER';

export type RotationFlowObservation = QuantitativeObservation & {
  provider: string;
  dataset: string;
  asset: string;
  window: FlowWindow;
  sourceLevel: 1 | 2 | 3 | 4;
  partitionKey?: string;
};

export type NonAdditiveContextMetric =
  | 'GOVERNMENT_BUDGET'
  | 'PRIVATE_COMPANY_VALUATION'
  | 'COMMODITY_PHYSICAL_DEMAND'
  | 'PRODUCTION_GROWTH';

export type RotationMagnitudeKind = QuantMetricType | NonAdditiveContextMetric;

const ADDITIVE_FLOW_METRICS = new Set<RotationMagnitudeKind>([
  'ETF_NET_FLOW',
  'MUTUAL_FUND_NET_FLOW',
  'ETF_CREATION_REDEMPTION',
  'INSTITUTIONAL_POSITION_CHANGE',
  'FUND_ALLOCATION',
]);

export type RotationCoreSignal =
  | 'OUTFLOW_STOPPED'
  | 'RELATIVE_STRENGTH_IMPROVING'
  | 'EARNINGS_REVISIONS_IMPROVING'
  | 'BREADTH_EXPANDING'
  | 'INSTITUTIONAL_VOLUME_CONFIRMING';

export type RotationGateInput = {
  signals: Record<RotationCoreSignal, boolean>;
  comparableFlowSeries: boolean;
  positiveFlowWindows: number;
  goodNewsAfterDestruction: boolean;
  positiveReactionToGoodNews: boolean;
  primaryEvidenceIds: string[];
  unreconciledConflicts: number;
};

export type RotationGateState =
  | 'PENDING_PRIMARY_VALIDATION'
  | 'NO_ROTATION_SIGNAL'
  | 'R3_CANDIDATE'
  | 'R3_CONFIRMED'
  | 'R4_CONFIRMED';

export type RotationGateResult = {
  state: RotationGateState;
  action: 'IGNORE' | 'MONITOR' | 'PROMOTE_TO_ATLAS_MAIN';
  coreSignalCount: number;
  reasons: string[];
};

function assertFiniteScore(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`rotation_score_out_of_range:${name}`);
  }
}

export function calculateRotationScore(input: RotationScoreInput): number {
  let score = 0;
  for (const key of Object.keys(ROTATION_SCORE_WEIGHTS) as Array<keyof RotationScoreInput>) {
    assertFiniteScore(key, input[key]);
    score += input[key] * ROTATION_SCORE_WEIGHTS[key];
  }
  return Math.round(score * 100) / 100;
}

export function assertTraceableFlowObservation(observation: RotationFlowObservation): void {
  assertMoneyRotationSemantics(observation);
  if (!observation.provider.trim()) throw new Error('money_rotation_missing_provider');
  if (!observation.dataset.trim()) throw new Error('money_rotation_missing_dataset');
  if (!observation.asset.trim()) throw new Error('money_rotation_missing_asset');
  if (!Number.isFinite(observation.value)) throw new Error('money_rotation_invalid_value');
  if (!observation.unit.trim()) throw new Error('money_rotation_missing_unit');
  if (!observation.currency) throw new Error('money_rotation_missing_currency');
  if (!observation.universe) throw new Error('money_rotation_missing_universe');
  if (!observation.periodStart || !observation.periodEnd) {
    throw new Error('money_rotation_missing_period');
  }
  if (observation.periodStart > observation.periodEnd) {
    throw new Error('money_rotation_invalid_period');
  }
}

export function comparableFlowSeriesKey(observation: RotationFlowObservation): string {
  assertTraceableFlowObservation(observation);
  return [
    observation.metric,
    observation.unit,
    observation.currency,
    observation.periodStart,
    observation.periodEnd,
    observation.window,
    observation.provider,
    observation.dataset,
    observation.universe,
  ].join('|');
}

export function assertComparableFlowSeries(observations: RotationFlowObservation[]): void {
  if (observations.length === 0) throw new Error('money_rotation_empty_series');
  const expected = comparableFlowSeriesKey(observations[0]);
  for (const observation of observations.slice(1)) {
    if (comparableFlowSeriesKey(observation) !== expected) {
      throw new Error('money_rotation_incomparable_series');
    }
  }
}

export function sumNonOverlappingFlows(observations: RotationFlowObservation[]): number {
  assertComparableFlowSeries(observations);
  const partitions = new Set<string>();
  for (const observation of observations) {
    if (!observation.partitionKey) throw new Error('money_rotation_missing_partition_key');
    if (partitions.has(observation.partitionKey)) {
      throw new Error(`money_rotation_overlapping_partition:${observation.partitionKey}`);
    }
    partitions.add(observation.partitionKey);
  }
  return observations.reduce((total, observation) => total + observation.value, 0);
}

export function assertFlowTotalUsesOnlyAdditiveMetrics(metrics: readonly RotationMagnitudeKind[]): void {
  for (const metric of metrics) {
    if (!ADDITIVE_FLOW_METRICS.has(metric)) {
      throw new Error(`money_rotation_non_additive_total:${metric}`);
    }
  }
}

export function assessRotationGate(input: RotationGateInput): RotationGateResult {
  const reasons: string[] = [];
  const coreSignalCount = Object.values(input.signals).filter(Boolean).length;

  if (!input.comparableFlowSeries) reasons.push('rotation_requires_comparable_flow_series');
  if (input.primaryEvidenceIds.length === 0) reasons.push('rotation_requires_primary_evidence');
  if (input.unreconciledConflicts > 0) reasons.push('rotation_has_unreconciled_conflicts');

  if (reasons.length > 0) {
    return { state: 'PENDING_PRIMARY_VALIDATION', action: 'MONITOR', coreSignalCount, reasons };
  }

  if (coreSignalCount === 0) {
    return { state: 'NO_ROTATION_SIGNAL', action: 'IGNORE', coreSignalCount, reasons: ['no_core_rotation_signal'] };
  }

  if (coreSignalCount < 3) {
    return {
      state: 'R3_CANDIDATE',
      action: 'MONITOR',
      coreSignalCount,
      reasons: ['r3_requires_three_of_five_core_signals'],
    };
  }

  const r4Trigger =
    input.positiveFlowWindows >= 2 &&
    input.goodNewsAfterDestruction &&
    input.positiveReactionToGoodNews;

  if (!r4Trigger) {
    if (input.positiveFlowWindows < 2) reasons.push('r4_requires_persistent_positive_flows');
    if (!input.goodNewsAfterDestruction) reasons.push('r4_requires_good_news_after_destruction');
    if (!input.positiveReactionToGoodNews) reasons.push('r4_requires_positive_news_reaction');
    return { state: 'R3_CONFIRMED', action: 'MONITOR', coreSignalCount, reasons };
  }

  return {
    state: 'R4_CONFIRMED',
    action: 'PROMOTE_TO_ATLAS_MAIN',
    coreSignalCount,
    reasons: [],
  };
}
