export type EconomicDependencyDistance = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type GlobalCapexRole =
  | 'ALLOCATOR_PAYER'
  | 'DIRECT_COMPUTE_CONNECTIVITY'
  | 'MANUFACTURING_CHOKEPOINT'
  | 'PHYSICAL_INFRASTRUCTURE'
  | 'POWER_FUEL_RESOURCES'
  | 'INDUSTRIAL_LOGISTICS_FINANCE'
  | 'DOWNSTREAM_PRODUCTIVITY';

export type GlobalCapexEconomicMode = 'PAYBACK' | 'CAPTURE' | 'DOWNSTREAM_PRODUCTIVITY';

export type EconomicProofLevel = 'E0_NARRATIVE' | 'E1_MANAGEMENT_CLAIM' | 'E2_ORDERS_CONTRACTS' | 'E3_REVENUE_MARGIN' | 'E4_FCF_ROIC_MULTI_PERIOD';

export type GlobalCapexRiver =
  | 'AI_COMPUTE'
  | 'SEMICONDUCTOR_FAB'
  | 'ADVANCED_PACKAGING_MEMORY'
  | 'NETWORKING_OPTICS'
  | 'DATA_CENTER_PHYSICAL'
  | 'POWER_EQUIPMENT'
  | 'GRID_TRANSMISSION'
  | 'GENERATION'
  | 'FUEL_ENERGY'
  | 'ELECTRIFICATION'
  | 'RESHORING_AUTOMATION'
  | 'DEFENSE'
  | 'AEROSPACE'
  | 'HEALTHCARE_CAPACITY'
  | 'TRANSPORT_LOGISTICS'
  | 'OTHER';

export type FundingPool =
  | 'HYPERSCALER_AI'
  | 'SEMICONDUCTOR_FAB_CAPEX'
  | 'UTILITY_GRID'
  | 'POWER_GENERATION'
  | 'INDUSTRIAL_RESHORING'
  | 'DEFENSE_BUDGET'
  | 'AEROSPACE_BUILD_RATE'
  | 'ENERGY_SECURITY'
  | 'HEALTHCARE_CAPEX'
  | 'TRANSPORT_INFRASTRUCTURE'
  | 'OTHER';

export type MarketStructure = 'MONOPOLY' | 'OLIGOPOLY' | 'CONCENTRATED' | 'COMPETITIVE';

export type CapexRiverExposure = {
  river: GlobalCapexRiver;
  fundingPool: FundingPool;
  materialityScore: number;
  proofLevel: EconomicProofLevel;
};

export type BottleneckPersistenceInput = {
  replicationLeadTimeMonths: number;
  marketStructure: MarketStructure;
  qualificationSwitchingCostScore: number;
  capacityExpansionDifficultyScore: number;
  regulatoryPermittingBarrierScore: number;
  technologySubstitutionRiskScore: number;
};

export type CapexFragilityInput = {
  customerConcentrationRisk: number;
  cyclicalityOverbuildRisk: number;
  technologyObsolescenceRisk: number;
  ownCapexBurdenRisk: number;
  geopoliticalRegulatoryRisk: number;
  executionSupplyChainRisk: number;
  financingDependenceRisk: number;
};

export type GlobalCapexChainInput = {
  ticker: string;
  edd: EconomicDependencyDistance;
  role: GlobalCapexRole;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  economicProofLevel: EconomicProofLevel;
  causalDirectnessScore: number;
  bottleneckScarcityScore: number;
  backlogVisibilityScore: number;
  revenueTranslationScore: number;
  economicCaptureScore: number;
  customerDiversificationScore: number;
  durationScore: number;
  riverExposures: readonly CapexRiverExposure[];
  bottleneckPersistence: BottleneckPersistenceInput;
  fragility: CapexFragilityInput;
};

export type GlobalCapexChainState =
  | 'CRITICAL_TOLL_ROAD'
  | 'PRIVILEGED_CHOKEPOINT'
  | 'DIRECT_BENEFICIARY'
  | 'INDIRECT_BENEFICIARY'
  | 'LOW_CAPEX_LEVERAGE'
  | 'EVIDENCE_PENDING';

export type GlobalCapexChainResult = {
  ticker: string;
  edd: EconomicDependencyDistance;
  role: GlobalCapexRole;
  economicMode: GlobalCapexEconomicMode;
  comparisonCohort: 'ALLOCATOR_PAYBACK' | 'SUPPLIER_CAPTURE' | 'DOWNSTREAM_PRODUCTIVITY';
  capexPositionScore: number;
  capexConvergenceScore: number;
  bottleneckPersistenceScore: number;
  structuralOpportunityScore: number;
  capexFragilityScore: number;
  economicProofLevel: EconomicProofLevel;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  state: GlobalCapexChainState;
  action: 'ADVANCE_DEEP_RESEARCH' | 'WATCH' | 'NO_CAPEX_EDGE' | 'EVIDENCE_REQUIRED';
  reasons: string[];
  falsifiers: string[];
};

const clamp = (value: number): number => Math.max(0, Math.min(100, value));
const round1 = (value: number): number => Math.round(value * 10) / 10;

const proofRank: Record<EconomicProofLevel, number> = {
  E0_NARRATIVE: 0,
  E1_MANAGEMENT_CLAIM: 1,
  E2_ORDERS_CONTRACTS: 2,
  E3_REVENUE_MARGIN: 3,
  E4_FCF_ROIC_MULTI_PERIOD: 4,
};

const marketStructureScore: Record<MarketStructure, number> = {
  MONOPOLY: 100,
  OLIGOPOLY: 85,
  CONCENTRATED: 65,
  COMPETITIVE: 35,
};

function validateInput(input: GlobalCapexChainInput): void {
  const scalarScores = [
    input.causalDirectnessScore,
    input.bottleneckScarcityScore,
    input.backlogVisibilityScore,
    input.revenueTranslationScore,
    input.economicCaptureScore,
    input.customerDiversificationScore,
    input.durationScore,
    input.bottleneckPersistence.qualificationSwitchingCostScore,
    input.bottleneckPersistence.capacityExpansionDifficultyScore,
    input.bottleneckPersistence.regulatoryPermittingBarrierScore,
    input.bottleneckPersistence.technologySubstitutionRiskScore,
    input.fragility.customerConcentrationRisk,
    input.fragility.cyclicalityOverbuildRisk,
    input.fragility.technologyObsolescenceRisk,
    input.fragility.ownCapexBurdenRisk,
    input.fragility.geopoliticalRegulatoryRisk,
    input.fragility.executionSupplyChainRisk,
    input.fragility.financingDependenceRisk,
    ...input.riverExposures.map((river) => river.materialityScore),
  ];

  if (scalarScores.some((score) => score < 0 || score > 100 || !Number.isFinite(score))) {
    throw new Error('global_capex_chain_scores_must_be_between_0_and_100');
  }
  if (input.bottleneckPersistence.replicationLeadTimeMonths < 0 || !Number.isFinite(input.bottleneckPersistence.replicationLeadTimeMonths)) {
    throw new Error('global_capex_chain_replication_lead_time_invalid');
  }
}

export function economicModeForEdd(edd: EconomicDependencyDistance): GlobalCapexEconomicMode {
  if (edd === 0) return 'PAYBACK';
  if (edd === 6) return 'DOWNSTREAM_PRODUCTIVITY';
  return 'CAPTURE';
}

export function scoreCapexPosition(input: GlobalCapexChainInput): number {
  return round1(
    clamp(input.causalDirectnessScore) * 0.25 +
      clamp(input.bottleneckScarcityScore) * 0.2 +
      clamp(input.backlogVisibilityScore) * 0.15 +
      clamp(input.revenueTranslationScore) * 0.15 +
      clamp(input.economicCaptureScore) * 0.1 +
      clamp(input.customerDiversificationScore) * 0.1 +
      clamp(input.durationScore) * 0.05,
  );
}

export function scoreCapexConvergence(exposures: readonly CapexRiverExposure[]): number {
  const bestByFundingPool = new Map<FundingPool, number>();
  for (const exposure of exposures) {
    if (proofRank[exposure.proofLevel] < 2) continue;
    const score = clamp(exposure.materialityScore);
    bestByFundingPool.set(exposure.fundingPool, Math.max(bestByFundingPool.get(exposure.fundingPool) ?? 0, score));
  }

  const independentPools = [...bestByFundingPool.values()].sort((a, b) => b - a);
  if (independentPools.length === 0) return 0;

  const weights = [0.45, 0.25, 0.15, 0.1, 0.05];
  const weightedMateriality = independentPools.slice(0, 5).reduce((sum, score, index) => sum + score * weights[index], 0);
  const breadthBonus = Math.min(20, Math.max(0, independentPools.length - 1) * 5);
  return round1(clamp(weightedMateriality + breadthBonus));
}

export function scoreBottleneckPersistence(input: BottleneckPersistenceInput): number {
  const leadTimeScore = clamp((input.replicationLeadTimeMonths / 48) * 100);
  const substitutionResistance = 100 - clamp(input.technologySubstitutionRiskScore);

  return round1(
    leadTimeScore * 0.25 +
      marketStructureScore[input.marketStructure] * 0.2 +
      clamp(input.qualificationSwitchingCostScore) * 0.2 +
      clamp(input.capacityExpansionDifficultyScore) * 0.15 +
      clamp(input.regulatoryPermittingBarrierScore) * 0.1 +
      substitutionResistance * 0.1,
  );
}

export function scoreCapexFragility(input: CapexFragilityInput): number {
  return round1(
    clamp(input.customerConcentrationRisk) * 0.2 +
      clamp(input.cyclicalityOverbuildRisk) * 0.15 +
      clamp(input.technologyObsolescenceRisk) * 0.15 +
      clamp(input.ownCapexBurdenRisk) * 0.15 +
      clamp(input.geopoliticalRegulatoryRisk) * 0.15 +
      clamp(input.executionSupplyChainRisk) * 0.1 +
      clamp(input.financingDependenceRisk) * 0.1,
  );
}

export function evaluateGlobalCapexChain(input: GlobalCapexChainInput): GlobalCapexChainResult {
  validateInput(input);

  const capexPositionScore = scoreCapexPosition(input);
  const capexConvergenceScore = scoreCapexConvergence(input.riverExposures);
  const bottleneckPersistenceScore = scoreBottleneckPersistence(input.bottleneckPersistence);
  const capexFragilityScore = scoreCapexFragility(input.fragility);
  const structuralOpportunityScore = round1(
    capexPositionScore * 0.7 + capexConvergenceScore * 0.15 + bottleneckPersistenceScore * 0.15,
  );

  const reasons: string[] = [];
  const falsifiers: string[] = [
    'orders_or_backlog_stop_converting_to_revenue',
    'revenue_growth_fails_to_convert_to_margin_or_fcf',
    'bottleneck_replicates_faster_than_expected',
    'customer_or_funding_pool_concentration_rises_materially',
    'capex_cycle_is_cancelled_delayed_or_overbuilt',
  ];

  const evidenceCountAdequate = input.evidenceIds.length >= 2;
  const proof = proofRank[input.economicProofLevel];
  const evidenceGate: GlobalCapexChainResult['evidenceGate'] =
    input.evidenceTraceable && evidenceCountAdequate && proof >= 2 ? 'CONFIRMED' : input.evidenceTraceable && proof >= 1 ? 'PROVISIONAL' : 'BLOCKED';

  const economicMode = economicModeForEdd(input.edd);
  const comparisonCohort: GlobalCapexChainResult['comparisonCohort'] =
    input.edd === 0 ? 'ALLOCATOR_PAYBACK' : input.edd === 6 ? 'DOWNSTREAM_PRODUCTIVITY' : 'SUPPLIER_CAPTURE';

  if (evidenceGate !== 'CONFIRMED') {
    reasons.push('Economic Proof Gate requires traceable E2+ evidence and at least two evidence records before structural confirmation.');
    return {
      ticker: input.ticker,
      edd: input.edd,
      role: input.role,
      economicMode,
      comparisonCohort,
      capexPositionScore,
      capexConvergenceScore,
      bottleneckPersistenceScore,
      structuralOpportunityScore,
      capexFragilityScore,
      economicProofLevel: input.economicProofLevel,
      evidenceGate,
      state: 'EVIDENCE_PENDING',
      action: 'EVIDENCE_REQUIRED',
      reasons,
      falsifiers,
    };
  }

  let state: GlobalCapexChainState;
  let action: GlobalCapexChainResult['action'];

  if (structuralOpportunityScore >= 85 && bottleneckPersistenceScore >= 70) {
    state = 'CRITICAL_TOLL_ROAD';
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Multiple CAPEX streams converge on a persistent bottleneck with strong economic capture.');
  } else if (structuralOpportunityScore >= 75) {
    state = 'PRIVILEGED_CHOKEPOINT';
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Structural CAPEX position is privileged, but at least one dimension is below critical-toll-road strength.');
  } else if (structuralOpportunityScore >= 60) {
    state = 'DIRECT_BENEFICIARY';
    action = 'WATCH';
    reasons.push('Direct CAPEX beneficiary with sufficient economic proof, but weaker convergence or bottleneck persistence.');
  } else if (structuralOpportunityScore >= 45) {
    state = 'INDIRECT_BENEFICIARY';
    action = 'WATCH';
    reasons.push('Exposure exists but the company is not a privileged conduit for incremental global CAPEX.');
  } else {
    state = 'LOW_CAPEX_LEVERAGE';
    action = 'NO_CAPEX_EDGE';
    reasons.push('Global CAPEX transmission is too indirect or economically weak to constitute an edge in this engine.');
  }

  if (input.edd === 0) {
    reasons.push('EDD-0 allocator: compare within PAYBACK cohort using CAPEX -> capacity -> utilization -> revenue -> FCF/share -> incremental ROIC, not against supplier capture names.');
  } else if (input.edd === 6) {
    reasons.push('EDD-6 downstream beneficiary: productivity capture is economically different from direct CAPEX capture and must remain a separate cohort.');
  }

  if (capexFragilityScore >= 70) {
    reasons.push('High CAPEX Fragility is active; it does not erase structural opportunity but requires a separate risk review.');
  }

  return {
    ticker: input.ticker,
    edd: input.edd,
    role: input.role,
    economicMode,
    comparisonCohort,
    capexPositionScore,
    capexConvergenceScore,
    bottleneckPersistenceScore,
    structuralOpportunityScore,
    capexFragilityScore,
    economicProofLevel: input.economicProofLevel,
    evidenceGate,
    state,
    action,
    reasons,
    falsifiers,
  };
}

export const GLOBAL_CAPEX_CHAIN_OMEGA = {
  id: 'GLOBAL_CAPEX_CHAIN_OMEGA_V1',
  name: 'Global CAPEX Chain Ω v1.0',
  role: 'transversal_structural_discovery_engine',
  horizonYears: [3, 6] as const,
  constitutionalRules: [
    'GLOBAL_CAPEX_EXPOSURE_IS_NOT_A_BUY_SIGNAL',
    'EDD_0_PAYBACK_MUST_NOT_BE_RANKED_AGAINST_SUPPLIER_CAPTURE',
    'CAPEX_POSITION_AND_CAPEX_FRAGILITY_MUST_REMAIN_SEPARATE',
    'E2_OR_HIGHER_IS_REQUIRED_FOR_CONFIRMED_CAPEX_BENEFICIARY_STATUS',
    'CONVERGENCE_COUNTS_ONLY_INDEPENDENT_CONFIRMED_FUNDING_POOLS',
    'VALUATION_REMAINS_OUTSIDE_THIS_ENGINE',
  ],
  scoreWeights: {
    capexPosition: {
      causalDirectness: 0.25,
      bottleneckScarcity: 0.2,
      backlogVisibility: 0.15,
      revenueTranslation: 0.15,
      economicCapture: 0.1,
      customerDiversification: 0.1,
      duration: 0.05,
    },
    structuralOpportunity: {
      capexPosition: 0.7,
      capexConvergence: 0.15,
      bottleneckPersistence: 0.15,
    },
  },
} as const;
