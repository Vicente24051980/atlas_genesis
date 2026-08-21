import {
  assertMoneyRotationSemantics,
  type QuantMetricType,
  type QuantitativeObservation,
} from '../evidence-ingestion/integrity';
import {
  marketTapePasses,
  type UniversalMarketTapeIntegrityResult,
} from '../algorithm/universal-market-tape-integrity-omega';

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

export const MARKET_REGIME_FAMILIES = [
  'BREADTH',
  'MONEY_FLOWS',
  'VALUE_VS_GROWTH',
  'RATES_DOLLAR',
  'GOLD',
  'OIL_COMMODITIES',
  'CROWDING',
] as const;

export const R3_TO_R4_TRIGGER_OMEGA =
  'GOOD_NEWS_AFTER_DESTRUCTION_PLUS_POSITIVE_REACTION_AND_PERSISTENT_COMPARABLE_FLOWS' as const;

export type RotationScoreInput = Record<keyof typeof ROTATION_SCORE_WEIGHTS, number>;
export type MarketRegimeFamily = typeof MARKET_REGIME_FAMILIES[number];
export type FlowWindow = '1W' | '4W' | '13W' | 'MONTH' | 'YTD' | 'OTHER';

export type MarketTapeContext = {
  marketTapeSubject: string;
  marketTapeIntegrity?: UniversalMarketTapeIntegrityResult;
};

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

export type RotationGateInput = MarketTapeContext & {
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
  marketTapeVerified: boolean;
  reasons: string[];
};

export type RotationPhase =
  | 'R1_ABANDONED'
  | 'R2_CAPITULATION'
  | 'R3_FLOOR'
  | 'R4_EARLY_ACCUMULATION'
  | 'R5_ATLAS_DISCOVERY'
  | 'R6_CONSENSUS';

export type RotationLifecycleState =
  | RotationPhase
  | 'REJECT_STRUCTURAL_DAMAGE'
  | 'INSUFFICIENT_EVIDENCE';

export type RotationLifecycleInput = MarketTapeContext & {
  gateState: RotationGateState;
  structuralBusinessIntact: boolean;
  outflowsDominant: boolean;
  capitulationExtreme: boolean;
  mainAtlasDetected: boolean;
  crowdingExtreme: boolean;
};

export type RotationLifecycleResult = {
  phase: RotationLifecycleState;
  action: 'REJECT' | 'RESEARCH' | 'MONITOR' | 'HANDOFF_ATLAS_MAIN' | 'AVOID_CHASING';
  reason: string;
};

export type SignalStrength = 'WEAK' | 'NEUTRAL' | 'STRONG' | 'INSUFFICIENT_EVIDENCE';

export type GoldRegimeInput = MarketTapeContext & {
  structural: {
    centralBankDemand: number;
    reserveDiversification: number;
    physicalDemand: number;
    monetaryTrustStress: number;
    evidenceIds: string[];
  };
  tactical: {
    etfFlows: number;
    realYieldsSupport: number;
    dollarSupport: number;
    momentum: number;
    evidenceIds: string[];
  };
};

export type GoldRegimeResult = {
  structuralScore: number | null;
  tacticalScore: number | null;
  structural: SignalStrength;
  tactical: SignalStrength;
  marketTapeVerified: boolean;
};

export type Direction = 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN';

export type VerifiedDirectionInput = MarketTapeContext & {
  trend: Direction;
};

export type GoldOilRegime =
  | 'GEOPOLITICS_INFLATION'
  | 'RISK_DISINFLATION'
  | 'REFLATION_GROWTH'
  | 'DISINFLATION_RISK_ON'
  | 'MIXED_UNRESOLVED';

export type GoldOilRegimeResult = {
  regime: GoldOilRegime;
  investigate: readonly string[];
};

export type OilScenarioInput = MarketTapeContext & {
  priceTrend: Direction;
  supplyDemandBalance: 'DEFICIT' | 'BALANCED' | 'SURPLUS' | 'UNKNOWN';
  geopoliticalRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  primaryEvidenceIds: string[];
};

export type OilScenarioState =
  | 'UNVALIDATED'
  | 'CONDITIONAL_DISINFLATIONARY'
  | 'CONFIRMED_DISINFLATIONARY'
  | 'CONDITIONAL_INFLATIONARY'
  | 'CONFIRMED_INFLATIONARY'
  | 'MIXED';

function assertFiniteScore(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`rotation_score_out_of_range:${name}`);
  }
}

function meanScore(name: string, values: number[]): number {
  values.forEach((value, index) => assertFiniteScore(`${name}_${index}`, value));
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function strength(score: number): Exclude<SignalStrength, 'INSUFFICIENT_EVIDENCE'> {
  if (score >= 67) return 'STRONG';
  if (score <= 33) return 'WEAK';
  return 'NEUTRAL';
}

function marketContextVerified(input: MarketTapeContext): boolean {
  return Boolean(
    input.marketTapeSubject.trim() &&
    marketTapePasses(input.marketTapeIntegrity) &&
    input.marketTapeIntegrity?.selectedTicker === input.marketTapeSubject,
  );
}

export function calculateRotationScore(input: RotationScoreInput, market: MarketTapeContext): number {
  let score = 0;
  let includedWeight = 0;
  const tapeVerified = marketContextVerified(market);
  for (const key of Object.keys(ROTATION_SCORE_WEIGHTS) as Array<keyof RotationScoreInput>) {
    assertFiniteScore(key, input[key]);
    const marketDependent = key === 'relativeStrength' || key === 'newsReaction';
    if (marketDependent && !tapeVerified) continue;
    score += input[key] * ROTATION_SCORE_WEIGHTS[key];
    includedWeight += ROTATION_SCORE_WEIGHTS[key];
  }
  if (includedWeight <= 0) throw new Error('rotation_score_no_verified_dimensions');
  return Math.round((score / includedWeight) * 100) / 100;
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
  const blockingReasons: string[] = [];
  const reasons: string[] = [];
  const tapeVerified = marketContextVerified(input);
  const effectiveSignals = {
    ...input.signals,
    RELATIVE_STRENGTH_IMPROVING: tapeVerified ? input.signals.RELATIVE_STRENGTH_IMPROVING : false,
  };
  const positiveReactionToGoodNews = tapeVerified ? input.positiveReactionToGoodNews : false;
  const coreSignalCount = Object.values(effectiveSignals).filter(Boolean).length;

  if (!input.comparableFlowSeries) blockingReasons.push('rotation_requires_comparable_flow_series');
  if (input.primaryEvidenceIds.length === 0) blockingReasons.push('rotation_requires_primary_evidence');
  if (input.unreconciledConflicts > 0) blockingReasons.push('rotation_has_unreconciled_conflicts');

  if (!tapeVerified) {
    reasons.push('universal_market_tape_integrity_required_for_relative_strength_and_price_reaction');
    if (input.marketTapeIntegrity?.selectedTicker && input.marketTapeIntegrity.selectedTicker !== input.marketTapeSubject) {
      reasons.push('market_tape_subject_mismatch');
    }
    for (const violation of input.marketTapeIntegrity?.violations ?? []) reasons.push(`market_tape:${violation}`);
  }

  if (blockingReasons.length > 0) {
    return {
      state: 'PENDING_PRIMARY_VALIDATION',
      action: 'MONITOR',
      coreSignalCount,
      marketTapeVerified: tapeVerified,
      reasons: [...blockingReasons, ...reasons],
    };
  }

  if (coreSignalCount === 0) {
    return {
      state: 'NO_ROTATION_SIGNAL',
      action: 'IGNORE',
      coreSignalCount,
      marketTapeVerified: tapeVerified,
      reasons: ['no_core_rotation_signal', ...reasons],
    };
  }

  if (coreSignalCount < 3) {
    return {
      state: 'R3_CANDIDATE',
      action: 'MONITOR',
      coreSignalCount,
      marketTapeVerified: tapeVerified,
      reasons: ['r3_requires_three_of_five_core_signals', ...reasons],
    };
  }

  const r4Trigger =
    input.positiveFlowWindows >= 2 &&
    input.goodNewsAfterDestruction &&
    positiveReactionToGoodNews;

  if (!r4Trigger) {
    if (input.positiveFlowWindows < 2) reasons.push('r4_requires_persistent_positive_flows');
    if (!input.goodNewsAfterDestruction) reasons.push('r4_requires_good_news_after_destruction');
    if (!positiveReactionToGoodNews) {
      reasons.push(tapeVerified ? 'r4_requires_positive_news_reaction' : 'r4_requires_verified_positive_news_reaction');
    }
    return { state: 'R3_CONFIRMED', action: 'MONITOR', coreSignalCount, marketTapeVerified: tapeVerified, reasons };
  }

  return {
    state: 'R4_CONFIRMED',
    action: 'PROMOTE_TO_ATLAS_MAIN',
    coreSignalCount,
    marketTapeVerified: tapeVerified,
    reasons,
  };
}

export function classifyRotationLifecycle(input: RotationLifecycleInput): RotationLifecycleResult {
  const tapeVerified = marketContextVerified(input);
  if (!input.structuralBusinessIntact) {
    return {
      phase: 'REJECT_STRUCTURAL_DAMAGE',
      action: 'REJECT',
      reason: 'dislocation_is_not_investable_when_the_business_is_structurally_broken',
    };
  }
  if (input.crowdingExtreme && input.mainAtlasDetected) {
    return { phase: 'R6_CONSENSUS', action: 'AVOID_CHASING', reason: 'atlas_detected_and_crowding_extreme' };
  }
  if (input.mainAtlasDetected) {
    return { phase: 'R5_ATLAS_DISCOVERY', action: 'HANDOFF_ATLAS_MAIN', reason: 'main_atlas_has_detected_the_trend' };
  }
  if (input.gateState === 'R4_CONFIRMED') {
    return { phase: 'R4_EARLY_ACCUMULATION', action: 'HANDOFF_ATLAS_MAIN', reason: R3_TO_R4_TRIGGER_OMEGA };
  }
  if (input.gateState === 'R3_CANDIDATE' || input.gateState === 'R3_CONFIRMED') {
    return { phase: 'R3_FLOOR', action: 'MONITOR', reason: 'outflows_or_price_damage_are_stabilising_but_accumulation_is_not_confirmed' };
  }
  if (input.capitulationExtreme && tapeVerified) {
    return { phase: 'R2_CAPITULATION', action: 'RESEARCH', reason: 'extreme_destruction_with_business_still_intact' };
  }
  if (input.outflowsDominant) {
    return { phase: 'R1_ABANDONED', action: 'RESEARCH', reason: 'capital_is_still_leaving_but_structural_business_damage_is_not_confirmed' };
  }
  return {
    phase: 'INSUFFICIENT_EVIDENCE',
    action: 'MONITOR',
    reason: input.capitulationExtreme && !tapeVerified
      ? 'price_capitulation_unverified_without_universal_market_tape'
      : 'no_canonical_rotation_phase_can_be_proven',
  };
}

export function assessGoldRegime(input: GoldRegimeInput): GoldRegimeResult {
  const tapeVerified = marketContextVerified(input);
  const structuralScore = input.structural.evidenceIds.length === 0
    ? null
    : meanScore('gold_structural', [
      input.structural.centralBankDemand,
      input.structural.reserveDiversification,
      input.structural.physicalDemand,
      input.structural.monetaryTrustStress,
    ]);

  let tacticalScore: number | null = null;
  if (input.tactical.evidenceIds.length > 0) {
    const tacticalValues = [
      input.tactical.etfFlows,
      input.tactical.realYieldsSupport,
      input.tactical.dollarSupport,
    ];
    if (tapeVerified) tacticalValues.push(input.tactical.momentum);
    tacticalScore = meanScore('gold_tactical', tacticalValues);
  }

  return {
    structuralScore: structuralScore == null ? null : Math.round(structuralScore * 100) / 100,
    tacticalScore: tacticalScore == null ? null : Math.round(tacticalScore * 100) / 100,
    structural: structuralScore == null ? 'INSUFFICIENT_EVIDENCE' : strength(structuralScore),
    tactical: tacticalScore == null ? 'INSUFFICIENT_EVIDENCE' : strength(tacticalScore),
    marketTapeVerified: tapeVerified,
  };
}

export function inferGoldOilRegime(gold: VerifiedDirectionInput, oil: VerifiedDirectionInput): GoldOilRegimeResult {
  if (!marketContextVerified(gold) || !marketContextVerified(oil)) {
    return { regime: 'MIXED_UNRESOLVED', investigate: ['MARKET_TAPE_UNVERIFIED', 'NO_MECHANICAL_SECTOR_CALL'] };
  }
  if (gold.trend === 'UP' && oil.trend === 'UP') {
    return { regime: 'GEOPOLITICS_INFLATION', investigate: ['ENERGY', 'DEFENSE', 'MATERIALS', 'GROWTH_DURATION_RISK'] };
  }
  if (gold.trend === 'UP' && oil.trend === 'DOWN') {
    return { regime: 'RISK_DISINFLATION', investigate: ['QUALITY', 'HEALTHCARE', 'BONDS', 'DEFENSIVES'] };
  }
  if (gold.trend === 'DOWN' && oil.trend === 'UP') {
    return { regime: 'REFLATION_GROWTH', investigate: ['INDUSTRIALS', 'BANKS', 'ENERGY'] };
  }
  if (gold.trend === 'DOWN' && oil.trend === 'DOWN') {
    return { regime: 'DISINFLATION_RISK_ON', investigate: ['CONSUMER', 'QUALITY_GROWTH', 'SMALL_MID_CAPS'] };
  }
  return { regime: 'MIXED_UNRESOLVED', investigate: ['NO_MECHANICAL_SECTOR_CALL'] };
}

export function assessOilScenario(input: OilScenarioInput): OilScenarioState {
  if (input.primaryEvidenceIds.length === 0) return 'UNVALIDATED';
  if (!marketContextVerified(input)) return 'UNVALIDATED';

  if (input.priceTrend === 'DOWN' && input.supplyDemandBalance === 'SURPLUS') {
    return input.geopoliticalRisk === 'HIGH'
      ? 'CONDITIONAL_DISINFLATIONARY'
      : 'CONFIRMED_DISINFLATIONARY';
  }

  if (input.priceTrend === 'UP' && input.supplyDemandBalance === 'DEFICIT') {
    return input.geopoliticalRisk === 'HIGH'
      ? 'CONFIRMED_INFLATIONARY'
      : 'CONDITIONAL_INFLATIONARY';
  }

  if (input.priceTrend === 'DOWN' && input.geopoliticalRisk === 'HIGH') return 'CONDITIONAL_DISINFLATIONARY';
  if (input.priceTrend === 'UP' && input.geopoliticalRisk === 'HIGH') return 'CONDITIONAL_INFLATIONARY';
  return 'MIXED';
}
