import type { CapexHunterProofLevel } from './capex-hunters-omega';

export type BottleneckLayer =
  | 'POWER_GENERATION'
  | 'GRID_ELECTRICAL'
  | 'COOLING'
  | 'ADVANCED_PACKAGING'
  | 'HBM_MEMORY'
  | 'FOUNDRY'
  | 'LITHOGRAPHY'
  | 'NETWORKING_OPTICS'
  | 'SERVER_ASSEMBLY'
  | 'MONETIZATION';

export interface BottleneckOwner {
  ticker: string;
  layer: BottleneckLayer;
  role: string;
  evidenceState: 'CONFIRMED' | 'WATCH';
}

export type BottleneckDestructionState =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL';

export type BottleneckOwnershipState =
  | 'ELITE_OWNER'
  | 'STRONG_OWNER'
  | 'EMERGING_OWNER'
  | 'WATCH'
  | 'BOTTLENECK_ONLY'
  | 'SCARCITY_AT_RISK'
  | 'INSUFFICIENT'
  | 'EVIDENCE_PENDING';

export type BottleneckOwnershipInput = {
  ticker: string;
  layer: BottleneckLayer;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  economicProofLevel: CapexHunterProofLevel;

  economicNecessityScore: number;
  scarcityScore: number;
  controlPointScore: number;
  pricingPowerScore: number;
  economicCaptureScore: number;
  fcfConversionScore: number;
  durationScore: number;

  capacityExpansionRiskScore: number;
  substitutionRiskScore: number;
  customerConcentrationRiskScore: number;
  cyclicalityRiskScore: number;

  valuationRiskScore?: number;
};

export type BottleneckOwnershipResult = {
  ticker: string;
  layer: BottleneckLayer;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  baseOwnershipScore: number;
  bottleneckDestructionRiskScore: number;
  bottleneckDestructionState: BottleneckDestructionState;
  adjustedOwnershipScore: number;
  valuationRiskScore: number | null;
  state: BottleneckOwnershipState;
  action: 'ADVANCE_DEEP_RESEARCH' | 'WATCH' | 'EVIDENCE_REQUIRED' | 'NO_STRUCTURAL_EDGE';
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

function validate(input: BottleneckOwnershipInput): void {
  const scores = [
    input.economicNecessityScore,
    input.scarcityScore,
    input.controlPointScore,
    input.pricingPowerScore,
    input.economicCaptureScore,
    input.fcfConversionScore,
    input.durationScore,
    input.capacityExpansionRiskScore,
    input.substitutionRiskScore,
    input.customerConcentrationRiskScore,
    input.cyclicalityRiskScore,
  ];

  if (input.valuationRiskScore != null) scores.push(input.valuationRiskScore);

  if (scores.some((score) => !Number.isFinite(score) || score < 0 || score > 100)) {
    throw new Error('bottleneck_ownership_scores_must_be_between_0_and_100');
  }
}

export function scoreBottleneckOwnership(input: BottleneckOwnershipInput): number {
  validate(input);
  return round1(
    clamp(input.economicNecessityScore) * 0.15 +
      clamp(input.scarcityScore) * 0.15 +
      clamp(input.controlPointScore) * 0.15 +
      clamp(input.pricingPowerScore) * 0.10 +
      clamp(input.economicCaptureScore) * 0.15 +
      clamp(input.fcfConversionScore) * 0.15 +
      clamp(input.durationScore) * 0.15,
  );
}

export function scoreBottleneckDestructionRisk(input: BottleneckOwnershipInput): number {
  validate(input);
  return round1(
    clamp(input.capacityExpansionRiskScore) * 0.30 +
      clamp(input.substitutionRiskScore) * 0.30 +
      clamp(input.customerConcentrationRiskScore) * 0.20 +
      clamp(input.cyclicalityRiskScore) * 0.20,
  );
}

export function classifyBottleneckDestructionRisk(score: number): BottleneckDestructionState {
  const value = clamp(score);
  if (value >= 75) return 'CRITICAL';
  if (value >= 55) return 'HIGH';
  if (value >= 30) return 'MODERATE';
  return 'LOW';
}

export function adjustedBottleneckOwnershipScore(baseScore: number, destructionRiskScore: number): number {
  return round1(clamp(baseScore) - clamp(destructionRiskScore) * 0.40);
}

export function evaluateBottleneckOwnership(input: BottleneckOwnershipInput): BottleneckOwnershipResult {
  validate(input);

  const baseOwnershipScore = scoreBottleneckOwnership(input);
  const bottleneckDestructionRiskScore = scoreBottleneckDestructionRisk(input);
  const bottleneckDestructionState = classifyBottleneckDestructionRisk(bottleneckDestructionRiskScore);
  const adjustedOwnershipScore = adjustedBottleneckOwnershipScore(
    baseOwnershipScore,
    bottleneckDestructionRiskScore,
  );
  const valuationRiskScore = input.valuationRiskScore == null ? null : round1(clamp(input.valuationRiskScore));

  const proof = proofRank[input.economicProofLevel];
  const evidenceCountAdequate = input.evidenceIds.length >= 2;
  const evidenceGate: BottleneckOwnershipResult['evidenceGate'] =
    input.evidenceTraceable && proof >= 2 && evidenceCountAdequate
      ? 'CONFIRMED'
      : input.evidenceTraceable && proof >= 1
        ? 'PROVISIONAL'
        : 'BLOCKED';

  const reasons: string[] = [];
  const falsifiers = [
    'usable_capacity_expands_faster_than_demand',
    'lead_times_and_realized_pricing_normalize_without_offsetting_volume_economics',
    'qualified_substitution_reduces_control_point_power',
    'customer_backlog_or_contracts_are_cancelled_or_deferred',
    'revenue_growth_fails_to_convert_to_margin_and_fcf',
    'customer_concentration_or_single_funding_pool_breaks_demand_durability',
    'technology_migration_moves_the_constraint_before_new_capacity_pays_back',
    'industry_capex_overshoot_destroys_scarcity_rents',
  ];

  if (evidenceGate !== 'CONFIRMED') {
    reasons.push('Confirmed bottleneck ownership requires traceable E2+ evidence and at least two evidence records.');
    return {
      ticker: input.ticker,
      layer: input.layer,
      evidenceGate,
      baseOwnershipScore,
      bottleneckDestructionRiskScore,
      bottleneckDestructionState,
      adjustedOwnershipScore,
      valuationRiskScore,
      state: 'EVIDENCE_PENDING',
      action: 'EVIDENCE_REQUIRED',
      reasons,
      falsifiers,
    };
  }

  let state: BottleneckOwnershipState;
  let action: BottleneckOwnershipResult['action'];

  if (input.economicCaptureScore < 50 || input.fcfConversionScore < 45) {
    state = 'BOTTLENECK_ONLY';
    action = 'WATCH';
    reasons.push('Physical scarcity is not yet translating into sufficient economic capture and free-cash-flow conversion.');
  } else if (bottleneckDestructionState === 'CRITICAL') {
    state = 'SCARCITY_AT_RISK';
    action = 'WATCH';
    reasons.push('The current bottleneck is economically relevant but faces critical destruction risk from capacity, substitution, concentration or cyclicality.');
  } else if (adjustedOwnershipScore >= 85 && bottleneckDestructionState !== 'HIGH') {
    state = 'ELITE_OWNER';
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('Scarcity, control point and economic conversion remain strong after explicit bottleneck-destruction penalties.');
  } else if (adjustedOwnershipScore >= 75) {
    state = 'STRONG_OWNER';
    action = 'ADVANCE_DEEP_RESEARCH';
    reasons.push('The company shows strong bottleneck ownership with evidence of economic capture, but residual durability risks remain.');
  } else if (adjustedOwnershipScore >= 65) {
    state = 'EMERGING_OWNER';
    action = 'WATCH';
    reasons.push('Bottleneck ownership is economically relevant but not yet durable enough for preferred research priority.');
  } else if (adjustedOwnershipScore >= 55) {
    state = 'WATCH';
    action = 'WATCH';
    reasons.push('A bottleneck may exist, but persistence or conversion quality is not strong enough for structural-owner status.');
  } else {
    state = 'INSUFFICIENT';
    action = 'NO_STRUCTURAL_EDGE';
    reasons.push('Current evidence does not support a sufficiently durable bottleneck-ownership edge.');
  }

  if (bottleneckDestructionState === 'HIGH') {
    reasons.push('High bottleneck-destruction risk caps conviction even when current scarcity is real.');
  }
  if (input.fcfConversionScore >= 70) {
    reasons.push('Economic capture is supported by strong free-cash-flow conversion rather than backlog alone.');
  }
  if (valuationRiskScore != null) {
    reasons.push('Valuation is reported separately and does not change the Bottleneck Ownership research score.');
  }

  return {
    ticker: input.ticker,
    layer: input.layer,
    evidenceGate,
    baseOwnershipScore,
    bottleneckDestructionRiskScore,
    bottleneckDestructionState,
    adjustedOwnershipScore,
    valuationRiskScore,
    state,
    action,
    reasons,
    falsifiers,
  };
}

export const BOTTLENECK_OWNERSHIP_OMEGA = {
  id: 'BOTTLENECK_OWNERSHIP_OMEGA_V2',
  version: '2026-09-17-v2.0',
  objective: 'Find listed companies controlling scarce nodes that constrain system-level economic throughput, prove conversion into cash economics, and detect when the bottleneck is being destroyed; ownership is not itself a BUY.',
  scoreDimensions: [
    'ECONOMIC_NECESSITY',
    'SCARCITY',
    'CONTROL_POINT',
    'PRICING_POWER',
    'ECONOMIC_CAPTURE',
    'FCF_CONVERSION',
    'DURATION',
  ],
  destructionRiskDimensions: [
    'CAPACITY_EXPANSION',
    'SUBSTITUTION',
    'CUSTOMER_CONCENTRATION',
    'CYCLICALITY',
  ],
  scoreWeights: {
    economicNecessity: 0.15,
    scarcity: 0.15,
    controlPoint: 0.15,
    pricingPower: 0.10,
    economicCapture: 0.15,
    fcfConversion: 0.15,
    duration: 0.15,
  },
  destructionRiskWeights: {
    capacityExpansion: 0.30,
    substitution: 0.30,
    customerConcentration: 0.20,
    cyclicality: 0.20,
  },
  rules: [
    'CAPACITY_ADDED_NEQ_THROUGHPUT_CREATED',
    'SCARCITY_NEQ_PERMANENT_MOAT',
    'BACKLOG_NEQ_REVENUE_NEQ_FCF',
    'BOTTLENECK_OWNER_NEQ_AUTOMATIC_BUY',
    'E2_PLUS_AND_TWO_EVIDENCE_RECORDS_REQUIRED_FOR_CONFIRMATION',
    'VALUATION_REMAINS_SEPARATE_FROM_BOTTLENECK_RESEARCH_SCORE',
    'FALSIFIER_VETO_REMAINS_ABSOLUTE',
  ],
  universe: [
    { ticker: 'GEV', layer: 'POWER_GENERATION', role: 'gas turbines/grid equipment', evidenceState: 'WATCH' },
    { ticker: 'ETN', layer: 'GRID_ELECTRICAL', role: 'switchgear/power distribution/data-center electrical architecture', evidenceState: 'CONFIRMED' },
    { ticker: 'PWR', layer: 'GRID_ELECTRICAL', role: 'transmission/grid construction', evidenceState: 'WATCH' },
    { ticker: 'HUBB', layer: 'GRID_ELECTRICAL', role: 'utility electrical components', evidenceState: 'WATCH' },
    { ticker: 'VRT', layer: 'COOLING', role: 'data-center power and liquid cooling', evidenceState: 'CONFIRMED' },
    { ticker: 'NVT', layer: 'COOLING', role: 'electrical/thermal infrastructure exposure', evidenceState: 'WATCH' },
    { ticker: 'TSM', layer: 'ADVANCED_PACKAGING', role: 'CoWoS advanced packaging and leading-edge foundry', evidenceState: 'CONFIRMED' },
    { ticker: 'AMKR', layer: 'ADVANCED_PACKAGING', role: 'outsourced semiconductor packaging/test', evidenceState: 'WATCH' },
    { ticker: 'ASX', layer: 'ADVANCED_PACKAGING', role: 'advanced packaging/test', evidenceState: 'WATCH' },
    { ticker: 'MU', layer: 'HBM_MEMORY', role: 'HBM supplier', evidenceState: 'WATCH' },
    { ticker: 'ASML', layer: 'LITHOGRAPHY', role: 'EUV lithography', evidenceState: 'CONFIRMED' },
    { ticker: 'AVGO', layer: 'NETWORKING_OPTICS', role: 'AI networking/custom accelerators', evidenceState: 'WATCH' },
    { ticker: 'ANET', layer: 'NETWORKING_OPTICS', role: 'high-speed datacenter networking', evidenceState: 'WATCH' },
    { ticker: 'COHR', layer: 'NETWORKING_OPTICS', role: 'optical components/lasers', evidenceState: 'WATCH' },
    { ticker: 'LITE', layer: 'NETWORKING_OPTICS', role: 'optical components/lasers', evidenceState: 'WATCH' },
    { ticker: 'CRDO', layer: 'NETWORKING_OPTICS', role: 'high-speed connectivity', evidenceState: 'WATCH' },
    { ticker: 'MRVL', layer: 'NETWORKING_OPTICS', role: 'datacenter interconnect/custom silicon', evidenceState: 'WATCH' },
    { ticker: '2317.TW', layer: 'SERVER_ASSEMBLY', role: 'Foxconn AI server/rack manufacturing', evidenceState: 'CONFIRMED' },
  ] satisfies BottleneckOwner[],
} as const;
