export type MemoryScarcityState =
  | 'SCARCITY_CONFIRMED'
  | 'TIGHTENING'
  | 'BALANCED'
  | 'NORMALIZING'
  | 'OVERBUILD_RISK'
  | 'EVIDENCE_PENDING';

export type MemoryScarcityInput = {
  ticker: string;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  aiDemandElasticityScore: number;
  hbmDramNandPricingScore: number;
  capacityTightnessScore: number;
  contractDurationPrepaymentScore: number;
  serverMixShiftScore: number;
  inventoryHealthScore: number;
  fcfConversionScore: number;
  supplyResponseDisciplineScore: number;
  customerConcentrationRiskScore: number;
  technologySubstitutionRiskScore: number;
  crowdingRiskScore: number;
};

export type MemoryScarcityResult = {
  ticker: string;
  scarcityScore: number;
  state: MemoryScarcityState;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  action: 'ADVANCE_RESEARCH' | 'WATCH' | 'WAIT_FOR_PROOF' | 'OVERBUILD_REVIEW';
  reasons: string[];
  falsifiers: string[];
};

const clamp = (v: number): number => Math.max(0, Math.min(100, v));
const round1 = (v: number): number => Math.round(v * 10) / 10;

export function scoreMemoryScarcity(input: MemoryScarcityInput): number {
  return round1(
    clamp(input.aiDemandElasticityScore) * 0.15 +
      clamp(input.hbmDramNandPricingScore) * 0.15 +
      clamp(input.capacityTightnessScore) * 0.18 +
      clamp(input.contractDurationPrepaymentScore) * 0.10 +
      clamp(input.serverMixShiftScore) * 0.10 +
      clamp(input.inventoryHealthScore) * 0.08 +
      clamp(input.fcfConversionScore) * 0.14 +
      clamp(input.supplyResponseDisciplineScore) * 0.10,
  );
}

export function evaluateMemoryScarcity(input: MemoryScarcityInput): MemoryScarcityResult {
  const numeric = Object.entries(input)
    .filter(([k]) => k.endsWith('Score'))
    .map(([, v]) => v as number);
  if (numeric.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) {
    throw new Error('memory_scarcity_scores_must_be_between_0_and_100');
  }

  const scarcityScore = scoreMemoryScarcity(input);
  const evidenceGate: MemoryScarcityResult['evidenceGate'] =
    input.evidenceTraceable && input.evidenceIds.length >= 3
      ? 'CONFIRMED'
      : input.evidenceTraceable && input.evidenceIds.length >= 1
        ? 'PROVISIONAL'
        : 'BLOCKED';

  let state: MemoryScarcityState;
  let action: MemoryScarcityResult['action'];
  if (evidenceGate === 'BLOCKED') {
    state = 'EVIDENCE_PENDING';
    action = 'WAIT_FOR_PROOF';
  } else if (input.supplyResponseDisciplineScore < 35 && input.capacityTightnessScore < 50) {
    state = 'OVERBUILD_RISK';
    action = 'OVERBUILD_REVIEW';
  } else if (scarcityScore >= 80) {
    state = 'SCARCITY_CONFIRMED';
    action = input.crowdingRiskScore >= 75 ? 'WATCH' : 'ADVANCE_RESEARCH';
  } else if (scarcityScore >= 68) {
    state = 'TIGHTENING';
    action = 'ADVANCE_RESEARCH';
  } else if (scarcityScore >= 55) {
    state = 'BALANCED';
    action = 'WATCH';
  } else {
    state = 'NORMALIZING';
    action = 'WATCH';
  }

  const reasons: string[] = [];
  if (input.aiDemandElasticityScore >= 75) reasons.push('AI buyers appear relatively insensitive to memory price increases because capacity/security of supply dominates optimization.');
  if (input.contractDurationPrepaymentScore >= 70) reasons.push('Longer contracts, prepayments or reservation structures increase scarcity visibility and reduce spot-cycle noise.');
  if (input.fcfConversionScore >= 70) reasons.push('Pricing and mix are converting into cash flow rather than only accounting revenue growth.');
  if (input.crowdingRiskScore >= 75) reasons.push('Scarcity can be fundamentally real while the equity is crowded; timing must remain separate.');
  if (input.customerConcentrationRiskScore >= 70) reasons.push('Customer concentration creates a separate fragility overlay and can reverse apparent scarcity economics quickly.');

  return {
    ticker: input.ticker,
    scarcityScore,
    state,
    evidenceGate,
    action,
    reasons,
    falsifiers: [
      'memory_price_growth_reverses_while_supply_growth_accelerates',
      'inventory_days_rise_materially_across_producers_and_customers',
      'hyperscaler_or_ai_server_capex_revisions_turn_down',
      'long_term_agreements_or_prepayments_are_cancelled_or_renegotiated',
      'hbm_or_enterprise_nand_mix_stops_gaining_share',
      'new_capacity_qualifies_faster_than_demand_growth',
      'fcf_conversion_breaks_despite_high_pricing',
    ],
  };
}

export const MEMORY_SCARCITY_OMEGA = {
  id: 'MEMORY_SCARCITY_OMEGA_V1',
  name: 'Memory Scarcity Ω v1.0',
  role: 'memory_storage_supply_demand_and_cash_conversion_engine',
  scope: ['HBM', 'DRAM', 'NAND', 'ENTERPRISE_SSD', 'STORAGE'],
  rules: [
    'MEMORY_PRICE_INCREASE_IS_NOT_ENOUGH_WITHOUT_VOLUME_OR_FCF_PROOF',
    'SCARCITY_IS_NOT_PERMANENT_MOAT',
    'SUPPLY_RESPONSE_AND_CAPACITY_QUALIFICATION_ARE_MANDATORY',
    'CROWDING_IS_SEPARATE_FROM_SCARCITY',
    'NO_AUTOMATIC_BUY_FROM_MEMORY_CYCLE_STRENGTH',
  ],
} as const;
