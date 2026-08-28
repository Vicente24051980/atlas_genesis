export type AiValueProofState =
  | 'T0_NARRATIVE'
  | 'T1_ADOPTION'
  | 'T2_REVENUE_LINKAGE'
  | 'T3_MARGIN_LINKAGE'
  | 'T4_FCF_PROOF'
  | 'T5_DURABLE_ROIC';

export type AiReceiverState =
  | 'DISCOVERY'
  | 'WATCH'
  | 'RECEIVER_CANDIDATE'
  | 'ECONOMIC_RECEIVER_CONFIRMED'
  | 'DURABLE_VALUE_RECEIVER';

export type AiReceiverLayer =
  | 'CLOUD_PLATFORM'
  | 'WORKFLOW_ORCHESTRATION'
  | 'SYSTEM_OF_RECORD'
  | 'TRUSTED_DATA'
  | 'APPLICATIONS'
  | 'DEVICE_OS_DISTRIBUTION'
  | 'VERTICAL_SOFTWARE'
  | 'END_OUTPUT';

export type AiValueMigrationState =
  | 'NO_MIGRATION_SIGNAL'
  | 'MIGRATION_WATCH'
  | 'MIGRATION_CANDIDATE'
  | 'MIGRATION_CONFIRMED';

export interface AiValueReceiverInput {
  ticker: string;
  layer: AiReceiverLayer;
  verifiedPrimaryOrReconciledEvidence: boolean;
  adoptionVerified: boolean;
  recurrentUsageVerified: boolean;
  customerAcceptanceVerified: boolean;
  paidExpansionVerified: boolean;
  attributableAiRevenueVerified: boolean;
  marginLinkageVerified: boolean;
  fcfPerShareLinkageVerified: boolean;
  durableIncrementalRoicVerified: boolean;
  workflowControl?: boolean;
  systemOfRecordControl?: boolean;
  trustedDataControl?: boolean;
  distributionControl?: boolean;
  switchingCosts?: boolean;
  capexHeavy?: boolean;
  fundingFragility?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  valuationExpectationRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' | 'UNKNOWN';
}

export interface AiValueReceiverOutput {
  ticker: string;
  layer: AiReceiverLayer;
  proofState: AiValueProofState;
  receiverState: AiReceiverState;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  controlFlags: string[];
  riskFlags: string[];
  missingProof: string[];
  allowedAction: 'DISCOVERY_ONLY' | 'WATCH' | 'COMPETITION_FOR_CAPITAL_REVIEW';
}

export interface AiValueMigrationCohortInput {
  receivers: AiValueReceiverOutput[];
  economicallyImprovingReceivers: number;
  receiverUniverseSize: number;
  marketPersistenceRegularCloses?: number;
  marketBreadthPct?: number;
  sourceLayerFundamentalsBroken?: boolean;
  causalFlowEvidenceVerified?: boolean;
}

export interface AiValueMigrationCohortOutput {
  state: AiValueMigrationState;
  reasons: string[];
  constraints: string[];
}

/**
 * Economic receiver gate.
 *
 * Price is intentionally absent from the single-company proof ladder. Market
 * response can only be used later as secondary cohort confirmation and never
 * upgrades the company's economic proof state.
 */
export function evaluateAiValueReceiver(input: AiValueReceiverInput): AiValueReceiverOutput {
  const proofState = inferProofState(input);
  const receiverState = inferReceiverState(input, proofState);
  const missingProof = getMissingProof(input);
  const controlFlags = getControlFlags(input);
  const riskFlags = getRiskFlags(input);

  const confidence: AiValueReceiverOutput['confidence'] = !input.verifiedPrimaryOrReconciledEvidence
    ? 'LOW'
    : proofState === 'T0_NARRATIVE'
      ? 'LOW'
      : missingProof.length <= 2
        ? 'HIGH'
        : 'MEDIUM';

  const allowedAction: AiValueReceiverOutput['allowedAction'] =
    receiverState === 'DISCOVERY'
      ? 'DISCOVERY_ONLY'
      : receiverState === 'WATCH'
        ? 'WATCH'
        : 'COMPETITION_FOR_CAPITAL_REVIEW';

  return {
    ticker: input.ticker,
    layer: input.layer,
    proofState,
    receiverState,
    confidence,
    controlFlags,
    riskFlags,
    missingProof,
    allowedAction
  };
}

/**
 * Cohort migration gate.
 *
 * This is deliberately stricter than observing a few outperforming stocks.
 * A single NVDA-down/software-up session can never return MIGRATION_CONFIRMED.
 */
export function evaluateAiValueMigrationCohort(input: AiValueMigrationCohortInput): AiValueMigrationCohortOutput {
  const reasons: string[] = [];
  const constraints: string[] = [
    'PRICE_RESPONSE_IS_NOT_FUNDAMENTAL_PROOF',
    'RELATIVE_STRENGTH_IS_NOT_VERIFIED_CAPITAL_FLOW',
    'SOURCE_LAYER_WEAKNESS_IS_NOT_CAUSAL_VALUE_TRANSFER',
    'C1_C19_HARD_LAYER_JUMP_DENOMINATORS_MUST_NOT_BE_REUSED'
  ];

  const t2Plus = input.receivers.filter((r) => proofRank(r.proofState) >= proofRank('T2_REVENUE_LINKAGE')).length;
  const improvingShare = input.receiverUniverseSize > 0
    ? input.economicallyImprovingReceivers / input.receiverUniverseSize
    : 0;

  if (t2Plus === 0 && input.economicallyImprovingReceivers === 0) {
    reasons.push('No verified receiver cohort has reached attributable revenue linkage.');
    return { state: 'NO_MIGRATION_SIGNAL', reasons, constraints };
  }

  if (t2Plus < 3) {
    reasons.push('Fewer than three independent receivers have T2+ economic proof.');
    return { state: 'MIGRATION_WATCH', reasons, constraints };
  }

  if (improvingShare < 0.6) {
    reasons.push('Economic improvement is not broad enough across the predeclared receiver cohort.');
    return { state: 'MIGRATION_WATCH', reasons, constraints };
  }

  const closes = input.marketPersistenceRegularCloses ?? 0;
  const breadth = input.marketBreadthPct ?? 0;

  if (closes < 3 || breadth < 60) {
    reasons.push('Economic receiver evidence exists, but secondary market confirmation lacks three regular closes and/or 60% breadth.');
    return { state: 'MIGRATION_CANDIDATE', reasons, constraints };
  }

  if (!input.causalFlowEvidenceVerified) {
    reasons.push('Market persistence exists but verified causal capital-flow evidence is absent.');
    return { state: 'MIGRATION_CANDIDATE', reasons, constraints };
  }

  reasons.push('Independent T2+ receivers, broad economic improvement, persistent market confirmation and verified causal flow evidence align.');
  if (input.sourceLayerFundamentalsBroken === false) {
    reasons.push('Migration can coexist with healthy source-layer fundamentals; this is profit-pool redistribution, not source-layer falsification.');
  }

  return { state: 'MIGRATION_CONFIRMED', reasons, constraints };
}

function inferProofState(input: AiValueReceiverInput): AiValueProofState {
  if (!input.verifiedPrimaryOrReconciledEvidence) return 'T0_NARRATIVE';
  if (input.durableIncrementalRoicVerified) return 'T5_DURABLE_ROIC';
  if (input.fcfPerShareLinkageVerified) return 'T4_FCF_PROOF';
  if (input.marginLinkageVerified) return 'T3_MARGIN_LINKAGE';
  if (input.attributableAiRevenueVerified) return 'T2_REVENUE_LINKAGE';
  if (
    input.adoptionVerified ||
    input.recurrentUsageVerified ||
    input.customerAcceptanceVerified ||
    input.paidExpansionVerified
  ) return 'T1_ADOPTION';
  return 'T0_NARRATIVE';
}

function inferReceiverState(input: AiValueReceiverInput, proofState: AiValueProofState): AiReceiverState {
  if (!input.verifiedPrimaryOrReconciledEvidence || proofState === 'T0_NARRATIVE') return 'DISCOVERY';
  if (proofState === 'T1_ADOPTION') return 'WATCH';
  if (proofState === 'T2_REVENUE_LINKAGE' || proofState === 'T3_MARGIN_LINKAGE') return 'RECEIVER_CANDIDATE';
  if (proofState === 'T4_FCF_PROOF') return 'ECONOMIC_RECEIVER_CONFIRMED';
  return 'DURABLE_VALUE_RECEIVER';
}

function getMissingProof(input: AiValueReceiverInput): string[] {
  const missing: string[] = [];
  if (!input.adoptionVerified) missing.push('adoption');
  if (!input.recurrentUsageVerified) missing.push('recurrent_usage');
  if (!input.customerAcceptanceVerified) missing.push('customer_acceptance');
  if (!input.paidExpansionVerified) missing.push('paid_expansion');
  if (!input.attributableAiRevenueVerified) missing.push('attributable_ai_revenue');
  if (!input.marginLinkageVerified) missing.push('margin_linkage');
  if (!input.fcfPerShareLinkageVerified) missing.push('fcf_per_share_linkage');
  if (!input.durableIncrementalRoicVerified) missing.push('durable_incremental_roic');
  return missing;
}

function getControlFlags(input: AiValueReceiverInput): string[] {
  const flags: string[] = [];
  if (input.workflowControl) flags.push('WORKFLOW_CONTROL');
  if (input.systemOfRecordControl) flags.push('SYSTEM_OF_RECORD_CONTROL');
  if (input.trustedDataControl) flags.push('TRUSTED_DATA_CONTROL');
  if (input.distributionControl) flags.push('DISTRIBUTION_CONTROL');
  if (input.switchingCosts) flags.push('SWITCHING_COSTS');
  return flags;
}

function getRiskFlags(input: AiValueReceiverInput): string[] {
  const flags: string[] = [];
  if (input.capexHeavy) flags.push('CAPEX_HEAVY');
  if (input.fundingFragility === 'HIGH') flags.push('FUNDING_FRAGILITY_HIGH');
  if (input.valuationExpectationRisk === 'HIGH') flags.push('VALUATION_EXPECTATION_HIGH');
  if (input.valuationExpectationRisk === 'EXTREME') flags.push('VALUATION_EXPECTATION_EXTREME');
  if (
    !input.workflowControl &&
    !input.systemOfRecordControl &&
    !input.trustedDataControl &&
    !input.distributionControl
  ) flags.push('NO_VERIFIED_CONTROL_POINT');
  return flags;
}

function proofRank(state: AiValueProofState): number {
  const rank: Record<AiValueProofState, number> = {
    T0_NARRATIVE: 0,
    T1_ADOPTION: 1,
    T2_REVENUE_LINKAGE: 2,
    T3_MARGIN_LINKAGE: 3,
    T4_FCF_PROOF: 4,
    T5_DURABLE_ROIC: 5
  };
  return rank[state];
}
