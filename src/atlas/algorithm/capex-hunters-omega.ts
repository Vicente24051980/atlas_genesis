export type CapexHunterClass =
  | 'H1_PICKS_AND_SHOVELS'
  | 'H2_BOTTLENECK_OWNER'
  | 'H3_BUILDOUT_ENABLER'
  | 'H4_POWER_ENABLER'
  | 'H5_CONTRACTUAL_CAPTOR'
  | 'H6_SECOND_ORDER_CAPTOR'
  | 'H7_SOVEREIGN_CAPEX_CAPTOR';

export type CapexHunterProofLevel =
  | 'E0_NARRATIVE'
  | 'E1_MANAGEMENT_CLAIM'
  | 'E2_ORDERS_CONTRACTS'
  | 'E3_REVENUE_MARGIN'
  | 'E4_FCF_ROIC_MULTI_PERIOD';

export type BuildabilityState =
  | 'B0_CLEAR'
  | 'B1_MANAGEABLE'
  | 'B2_MATERIAL_FRICTION'
  | 'B3_BOTTLENECK'
  | 'B4_THESIS_THREATENING';

export type CapexHunterTiming = 'EARLY' | 'CONFIRMED' | 'CROWDED' | 'NO_CHASE' | 'DECELERATING';

export type CapexHunterState =
  | 'ELITE_CAPTOR'
  | 'STRONG_CAPTOR'
  | 'EMERGING_CAPTOR'
  | 'WATCH'
  | 'INSUFFICIENT'
  | 'EVIDENCE_PENDING';

export type CaptureEfficiencyState =
  | 'CAPITAL_LIGHT_CAPTURE'
  | 'BALANCED_CAPTURE'
  | 'CAPITAL_INTENSIVE_CAPTURE'
  | 'FRAGILE_ALLOCATOR_RISK'
  | 'INSUFFICIENT_DATA';

export type CapexHunterInput = {
  ticker: string;
  motorOrigin: string;
  hunterClasses: readonly CapexHunterClass[];
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  economicProofLevel: CapexHunterProofLevel;
  buildabilityState: BuildabilityState;
  timing: CapexHunterTiming;
  necessityDirectnessScore: number;
  contractProofScore: number;
  marginFcfConversionScore: number;
  roicQualityScore: number;
  bottleneckPersistenceScore: number;
  pricingPowerScore: number;
  fundingQualityScore: number;
  buildabilityQualityScore: number;
  capturedDemandGrowthPct?: number;
  ownCapexGrowthPct?: number;
};

export type CapexHunterResult = {
  ticker: string;
  motorOrigin: string;
  hunterClasses: readonly CapexHunterClass[];
  captureScore: number;
  economicProofLevel: CapexHunterProofLevel;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  buildabilityState: BuildabilityState;
  timing: CapexHunterTiming;
  state: CapexHunterState;
  captureEfficiencyState: CaptureEfficiencyState;
  action: 'ADVANCE_DEEP_RESEARCH' | 'WATCH' | 'EVIDENCE_REQUIRED' | 'NO_CAPEX_EDGE';
  reasons: string[];
  falsifiers: string[];
};

const clamp = (value: number): number => Math.max(0, Math.min(100, value));
const round1 = (value: number): number => Math.round(value * 10) / 10;

const proofRank: Record<CapexHunterProofLevel, number> = {
  E0_NARRATIVE: 0,
  E1_MANAGEMENT_CLAIM: 1,
  E2_ORDERS_CONTRACTS: 2,
  E3_REVENUE_MARGIN: 3,
  E4_FCF_ROIC_MULTI_PERIOD: 4,
};

function validate(input: CapexHunterInput): void {
  const scores = [
    input.necessityDirectnessScore,
    input.contractProofScore,
    input.marginFcfConversionScore,
    input.roicQualityScore,
    input.bottleneckPersistenceScore,
    input.pricingPowerScore,
    input.fundingQualityScore,
    input.buildabilityQualityScore,
  ];

  if (scores.some((score) => !Number.isFinite(score) || score < 0 || score > 100)) {
    throw new Error('capex_hunters_scores_must_be_between_0_and_100');
  }
  if (input.hunterClasses.length === 0) {
    throw new Error('capex_hunters_requires_at_least_one_hunter_class');
  }
}

export function scoreCapexCapture(input: CapexHunterInput): number {
  validate(input);
  return round1(
    clamp(input.necessityDirectnessScore) * 0.20 +
      clamp(input.contractProofScore) * 0.20 +
      clamp(input.marginFcfConversionScore) * 0.15 +
      clamp(input.roicQualityScore) * 0.15 +
      clamp(input.bottleneckPersistenceScore) * 0.10 +
      clamp(input.pricingPowerScore) * 0.10 +
      clamp(input.fundingQualityScore) * 0.05 +
      clamp(input.buildabilityQualityScore) * 0.05,
  );
}

export function classifyCaptureEfficiency(input: Pick<CapexHunterInput, 'capturedDemandGrowthPct' | 'ownCapexGrowthPct'>): CaptureEfficiencyState {
  const demand = input.capturedDemandGrowthPct;
  const ownCapex = input.ownCapexGrowthPct;
  if (demand == null || ownCapex == null || !Number.isFinite(demand) || !Number.isFinite(ownCapex)) {
    return 'INSUFFICIENT_DATA';
  }

  const spread = demand - ownCapex;
  if (demand > 0 && spread >= 20) return 'CAPITAL_LIGHT_CAPTURE';
  if (demand > 0 && spread >= 0) return 'BALANCED_CAPTURE';
  if (demand > 0 && ownCapex <= demand + 20) return 'CAPITAL_INTENSIVE_CAPTURE';
  return 'FRAGILE_ALLOCATOR_RISK';
}

export function evaluateCapexHunter(input: CapexHunterInput): CapexHunterResult {
  const captureScore = scoreCapexCapture(input);
  const proof = proofRank[input.economicProofLevel];
  const evidenceCountAdequate = input.evidenceIds.length >= 2;
  const evidenceGate: CapexHunterResult['evidenceGate'] =
    input.evidenceTraceable && proof >= 2 && evidenceCountAdequate
      ? 'CONFIRMED'
      : input.evidenceTraceable && proof >= 1
        ? 'PROVISIONAL'
        : 'BLOCKED';

  const captureEfficiencyState = classifyCaptureEfficiency(input);
  const reasons: string[] = [];
  const falsifiers: string[] = [
    'orders_or_book_to_bill_decelerate_before_revenue_conversion',
    'backlog_quality_deteriorates_or_cancellations_rise',
    'revenue_growth_fails_to_convert_to_margin_or_fcf',
    'own_capex_debt_or_dilution_outgrows_economic_capture',
    'customer_or_funding_pool_concentration_becomes_structurally_dangerous',
    'bottleneck_capacity_is_replicated_or_substituted_faster_than_expected',
    'permitting_grid_water_or_social_license_breaks_project_delivery',
    'valuation_requires_implausible_future_capture',
  ];

  if (evidenceGate !== 'CONFIRMED') {
    reasons.push('Confirmed CAPEX captor status requires traceable E2+ evidence and at least two evidence records.');
    return {
      ticker: input.ticker,
      motorOrigin: input.motorOrigin,
      hunterClasses: input.hunterClasses,
      captureScore,
      economicProofLevel: input.economicProofLevel,
      evidenceGate,
      buildabilityState: input.buildabilityState,
      timing: input.timing,
      state: 'EVIDENCE_PENDING',
      captureEfficiencyState,
      action: 'EVIDENCE_REQUIRED',
      reasons,
      falsifiers,
    };
  }

  let state: CapexHunterState;
  let action: CapexHunterResult['action'];
  if (captureScore >= 90) {
    state = 'ELITE_CAPTOR';
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Economic transmission is unusually strong across necessity, proof, cash conversion and bottleneck persistence.');
  } else if (captureScore >= 80) {
    state = 'STRONG_CAPTOR';
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Strong evidence that the company captures funded CAPEX with durable economics.');
  } else if (captureScore >= 70) {
    state = 'EMERGING_CAPTOR';
    action = 'WATCH';
    reasons.push('CAPEX capture is economically relevant but at least one major dimension remains below strong-captor quality.');
  } else if (captureScore >= 60) {
    state = 'WATCH';
    action = 'WATCH';
    reasons.push('CAPEX exposure is confirmed but not yet strong enough to qualify as a preferred captor.');
  } else {
    state = 'INSUFFICIENT';
    action = 'NO_CAPEX_EDGE';
    reasons.push('The company does not currently show a sufficiently strong CAPEX-capture edge.');
  }

  if (input.buildabilityState === 'B3_BOTTLENECK' || input.buildabilityState === 'B4_THESIS_THREATENING') {
    reasons.push('Buildability risk is material and must be reviewed separately; it does not silently erase structural capture evidence.');
  }
  if (captureEfficiencyState === 'CAPITAL_LIGHT_CAPTURE') {
    reasons.push('Captured demand is growing materially faster than the company\'s own CAPEX burden.');
  }
  if (captureEfficiencyState === 'FRAGILE_ALLOCATOR_RISK') {
    reasons.push('Own CAPEX burden is outrunning captured demand; allocator fragility review is required.');
  }
  if (input.timing === 'CROWDED' || input.timing === 'NO_CHASE') {
    reasons.push('Timing/expectations are separate from structural capture quality; no automatic BUY is permitted.');
  }

  return {
    ticker: input.ticker,
    motorOrigin: input.motorOrigin,
    hunterClasses: input.hunterClasses,
    captureScore,
    economicProofLevel: input.economicProofLevel,
    evidenceGate,
    buildabilityState: input.buildabilityState,
    timing: input.timing,
    state,
    captureEfficiencyState,
    action,
    reasons,
    falsifiers,
  };
}

export const CAPEX_HUNTERS_OMEGA = {
  id: 'CAPEX_HUNTERS_OMEGA_V1',
  name: 'CAPEX Hunters Ω v1.0',
  role: 'transversal_capex_capture_discovery_module',
  parentEngine: 'GLOBAL_CAPEX_CHAIN_OMEGA_V1',
  hunterClasses: [
    'H1_PICKS_AND_SHOVELS',
    'H2_BOTTLENECK_OWNER',
    'H3_BUILDOUT_ENABLER',
    'H4_POWER_ENABLER',
    'H5_CONTRACTUAL_CAPTOR',
    'H6_SECOND_ORDER_CAPTOR',
    'H7_SOVEREIGN_CAPEX_CAPTOR',
  ] as const,
  constitutionalRules: [
    'CAPEX_SPENDER_IS_NOT_CAPEX_CAPTOR',
    'CAPEX_ANNOUNCEMENT_IS_NOT_REALIZED_DEMAND',
    'BACKLOG_IS_NOT_REVENUE_IS_NOT_FCF',
    'E2_PLUS_AND_TWO_EVIDENCE_RECORDS_REQUIRED_FOR_CONFIRMATION',
    'STRUCTURAL_CAPTURE_DOES_NOT_OVERRIDE_VALUATION_OR_PRINCIPAL_OMEGA',
    'BUILDABILITY_RISK_REMAINS_SEPARATE_FROM_ECONOMIC_PROOF',
  ],
  scoreWeights: {
    necessityDirectness: 0.20,
    contractProof: 0.20,
    marginFcfConversion: 0.15,
    roicQuality: 0.15,
    bottleneckPersistence: 0.10,
    pricingPower: 0.10,
    fundingQuality: 0.05,
    buildabilityQuality: 0.05,
  },
} as const;
