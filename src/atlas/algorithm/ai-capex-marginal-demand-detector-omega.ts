export type EvidenceBoolean = boolean | null;

export type AiCapexMarginalDemandState =
  | 'CLEAR'
  | 'PRICE_REGIME_BREAK'
  | 'MARGINAL_FLOW_WARNING'
  | 'BACKLOG_LAG_MASK_WARNING'
  | 'MARGINAL_DEMAND_DETERIORATING'
  | 'FUNDAMENTAL_BREAK_CONFIRMED'
  | 'DATA_INSUFFICIENT';

export type AiCapexReviewAction = 'NONE' | 'RF2_OPEN' | 'THESIS_AUDIT_REQUIRED';

export interface AiCapexMarginalDemandInput {
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];

  /** Market sensor. One-day shocks cannot satisfy this gate. */
  priceBreakPersistenceWeeks: number;
  brokenChainLayers: number;
  negativeRelativeStrengthBreadthPct: number;

  /** Upstream buyer / allocator behaviour. null means not disclosed / unknown. */
  buyerForwardCapexDeteriorating: EvidenceBoolean;

  /** Supplier fresh-order flow. These are one category, not independent votes. */
  newOrdersDeteriorating: EvidenceBoolean;
  bookToBillBelowOne: EvidenceBoolean;
  bookingsGrowthBelowRevenueGrowth: EvidenceBoolean;

  /** Pipeline velocity. Absolute backlog is deliberately separated. */
  backlogAbsoluteStrong: EvidenceBoolean;
  backlogSequentialDeteriorating: EvidenceBoolean;
  cancellationsOrDeferralsRising: EvidenceBoolean;
  leadTimesCompressing: EvidenceBoolean;
  capacityReservationsReleasing: EvidenceBoolean;

  /** Downstream accounting / operating confirmation. */
  revenueGuidanceDeteriorating: EvidenceBoolean;
  marginConversionDeteriorating: EvidenceBoolean;
  fcfDeteriorating: EvidenceBoolean;
  utilizationDeteriorating: EvidenceBoolean;
}

export interface AiCapexMarginalDemandResult {
  state: AiCapexMarginalDemandState;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  marketRegimeBreak: boolean;
  buyerForwardCapexDeteriorating: boolean;
  supplierOrderFlowDeteriorating: boolean;
  pipelineVelocityDeteriorating: boolean;
  downstreamConfirmationCount: number;
  marginalDemandCategoryCount: number;
  backlogLagMask: boolean;
  reviewAction: AiCapexReviewAction;
  automaticSellAllowed: false;
  reasons: string[];
  constraints: string[];
}

const isTrue = (x: EvidenceBoolean): boolean => x === true;
const known = (x: EvidenceBoolean): boolean => x !== null;
const anyTrue = (xs: readonly EvidenceBoolean[]): boolean => xs.some(isTrue);
const countTrue = (xs: readonly EvidenceBoolean[]): number => xs.filter(isTrue).length;

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`ai_capex_marginal_demand_invalid_metric:${field}`);
}

/**
 * AI CAPEX MARGINAL DEMAND DETECTOR Ω v1.0
 *
 * Purpose: detect deterioration in the *marginal* AI-infrastructure demand impulse
 * before absolute backlog/revenue necessarily roll over.
 *
 * Core law:
 * prior CAPEX -> orders/contracts -> backlog stock -> revenue -> margin -> FCF
 * Therefore record backlog is not allowed to veto deterioration in fresh-flow signals.
 */
export function evaluateAiCapexMarginalDemand(
  input: AiCapexMarginalDemandInput,
): AiCapexMarginalDemandResult {
  assertFiniteNonNegative(input.priceBreakPersistenceWeeks, 'priceBreakPersistenceWeeks');
  assertFiniteNonNegative(input.brokenChainLayers, 'brokenChainLayers');
  assertFiniteNonNegative(input.negativeRelativeStrengthBreadthPct, 'negativeRelativeStrengthBreadthPct');
  if (input.negativeRelativeStrengthBreadthPct > 100) {
    throw new Error('ai_capex_marginal_demand_invalid_metric:negativeRelativeStrengthBreadthPct');
  }

  const evidenceGate: AiCapexMarginalDemandResult['evidenceGate'] =
    input.evidenceTraceable && input.evidenceIds.length >= 3
      ? 'CONFIRMED'
      : input.evidenceTraceable && input.evidenceIds.length > 0
        ? 'PROVISIONAL'
        : 'BLOCKED';

  const marketRegimeBreak =
    input.priceBreakPersistenceWeeks >= 8 &&
    input.brokenChainLayers >= 3 &&
    input.negativeRelativeStrengthBreadthPct >= 60;

  const buyer = isTrue(input.buyerForwardCapexDeteriorating);

  const supplierOrderSignals = [
    input.newOrdersDeteriorating,
    input.bookToBillBelowOne,
    input.bookingsGrowthBelowRevenueGrowth,
  ] as const;
  const supplier = anyTrue(supplierOrderSignals);

  const pipelineSignals = [
    input.backlogSequentialDeteriorating,
    input.cancellationsOrDeferralsRising,
    input.leadTimesCompressing,
    input.capacityReservationsReleasing,
  ] as const;
  const pipeline = anyTrue(pipelineSignals);

  const downstreamSignals = [
    input.revenueGuidanceDeteriorating,
    input.marginConversionDeteriorating,
    input.fcfDeteriorating,
    input.utilizationDeteriorating,
  ] as const;
  const downstreamConfirmationCount = countTrue(downstreamSignals);

  const marginalDemandCategoryCount = [buyer, supplier, pipeline].filter(Boolean).length;
  const backlogLagMask =
    input.backlogAbsoluteStrong === true &&
    marketRegimeBreak &&
    marginalDemandCategoryCount >= 2;

  const constraints = [
    'E5_CONTROL_E6_ASSURANCE_DETECTOR_NOT_NEW_PRIMARY_ENGINE',
    'DIRECT_STRUCTURAL_SCORE_WEIGHT_ZERO',
    'PRICE_IS_SIGNAL_NOT_FUNDAMENTAL_PROOF',
    'ABSOLUTE_BACKLOG_CANNOT_VETO_FRESH_FLOW_DETERIORATION',
    'SAME_FUNDING_POOL_MUST_NOT_BE_DOUBLE_COUNTED',
    'UNKNOWN_DISCLOSURE_IS_NOT_NEGATIVE_EVIDENCE',
    'NO_AUTOMATIC_SELL',
    'THRESHOLD_OPENS_REVIEW_NOT_EXECUTION',
  ];

  if (evidenceGate === 'BLOCKED') {
    return result('DATA_INSUFFICIENT', 'NONE', [
      'Traceable evidence is absent; the detector fails closed.',
    ]);
  }

  if (marginalDemandCategoryCount === 3 && downstreamConfirmationCount >= 2) {
    return result('FUNDAMENTAL_BREAK_CONFIRMED', 'THESIS_AUDIT_REQUIRED', [
      'Buyer CAPEX, supplier order flow and pipeline velocity are all deteriorating.',
      'At least two downstream operating/economic channels also deteriorate.',
      'The marginal-demand break has propagated beyond price and backlog timing effects.',
    ]);
  }

  if (marginalDemandCategoryCount === 3) {
    return result('MARGINAL_DEMAND_DETERIORATING', 'RF2_OPEN', [
      'Three independent marginal-demand categories deteriorate.',
      'Do not wait for absolute backlog or reported revenue to roll over before opening thesis review.',
    ]);
  }

  if (backlogLagMask) {
    return result('BACKLOG_LAG_MASK_WARNING', 'RF2_OPEN', [
      'Persistent cross-chain market break coexists with strong absolute backlog.',
      'At least two marginal-demand categories are already deteriorating.',
      'Historical contracted demand may be masking weaker fresh CAPEX/order flow.',
    ]);
  }

  if (marketRegimeBreak) {
    return result('PRICE_REGIME_BREAK', 'RF2_OPEN', [
      'The AI-CAPEX trade shows a persistent broad relative-strength break across multiple chain layers.',
      'Fresh-demand fundamentals are not yet sufficiently weak to call a fundamental break.',
    ]);
  }

  if (marginalDemandCategoryCount > 0 || downstreamConfirmationCount > 0) {
    return result('MARGINAL_FLOW_WARNING', 'RF2_OPEN', [
      'Some marginal-flow or downstream warnings exist, but independent-category confirmation is incomplete.',
    ]);
  }

  return result('CLEAR', 'NONE', [
    'No persistent market-regime break or material marginal-demand deterioration is currently established.',
  ]);

  function result(
    state: AiCapexMarginalDemandState,
    reviewAction: AiCapexReviewAction,
    reasons: string[],
  ): AiCapexMarginalDemandResult {
    return {
      state,
      evidenceGate,
      marketRegimeBreak,
      buyerForwardCapexDeteriorating: buyer,
      supplierOrderFlowDeteriorating: supplier,
      pipelineVelocityDeteriorating: pipeline,
      downstreamConfirmationCount,
      marginalDemandCategoryCount,
      backlogLagMask,
      reviewAction,
      automaticSellAllowed: false,
      reasons,
      constraints,
    };
  }
}

export const AI_CAPEX_MARGINAL_DEMAND_DETECTOR_OMEGA = {
  id: 'AI_CAPEX_MARGINAL_DEMAND_DETECTOR_OMEGA_V1',
  name: 'AI CAPEX Marginal Demand Detector Ω v1.0',
  kind: 'E5_CONTROL_E6_ASSURANCE_DETECTOR_NOT_NEW_PRIMARY_ENGINE',
  directStructuralScoreWeight: 0,
  marketBreakThresholds: {
    persistenceWeeks: 8,
    brokenIndependentChainLayers: 3,
    negativeRelativeStrengthBreadthPct: 60,
  },
  independentDemandCategories: [
    'BUYER_FORWARD_CAPEX',
    'SUPPLIER_ORDER_FLOW',
    'PIPELINE_VELOCITY',
  ],
  downstreamConfirmationChannels: [
    'REVENUE_GUIDANCE',
    'MARGIN_CONVERSION',
    'FCF',
    'UTILIZATION',
  ],
  laws: [
    'BACKLOG_STOCK_IS_LAGGING_VISIBILITY_NOT_FRESH_DEMAND_PROOF',
    'FLOW_INTO_BACKLOG_OUTRANKS_ABSOLUTE_BACKLOG_FOR_MARGINAL_DEMAND',
    'PRICE_BREAK_CAN_PRECEDE_ACCOUNTING_BREAK',
    'PRICE_BREAK_ALONE_CANNOT_CONFIRM_FUNDAMENTAL_FAILURE',
    'NO_AUTOMATIC_PORTFOLIO_ACTION',
  ],
} as const;
