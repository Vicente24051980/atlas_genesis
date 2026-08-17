export type CapitalDestination =
  | 'MEMORY_STORAGE'
  | 'SEMICONDUCTOR_EQUIPMENT'
  | 'COMPUTE_ACCELERATORS'
  | 'NETWORKING_OPTICS'
  | 'POWER_GENERATION'
  | 'GRID_ELECTRIFICATION'
  | 'COOLING_THERMAL'
  | 'DATA_CENTER_CONSTRUCTION'
  | 'BUILDING_MATERIALS'
  | 'TRANSPORT_LOGISTICS'
  | 'SOFTWARE'
  | 'HOME_BUILDERS'
  | 'DEFENSE_AEROSPACE'
  | 'HEALTHCARE'
  | 'FINANCIAL_RAILS_INSURANCE'
  | 'ENERGY_SECURITY'
  | 'GOLD_REAL_ASSETS'
  | 'EMERGING_MARKETS'
  | 'CONSUMER_DEFENSIVE'
  | 'US_EQUITIES'
  | 'EUROPE_EQUITIES'
  | 'ASIA_EQUITIES'
  | 'BONDS'
  | 'MONEY_MARKETS'
  | 'OTHER';

export type DestinationMode = 'REAL_ECONOMY' | 'ASSET_CLASS';

export type CapitalStage =
  | 'R1_EARLY_SIGNAL'
  | 'R2_ACCUMULATION'
  | 'R3_CONFIRMED_RECEIVER'
  | 'R4_ACCELERATING'
  | 'R5_CROWDED'
  | 'R6_DECELERATING_EXIT';

export type DestinationEvidenceType =
  | 'PUBLIC_FUND_FLOW'
  | 'PRIVATE_EQUITY_MA'
  | 'CORPORATE_CAPEX'
  | 'SOVEREIGN_FISCAL'
  | 'CREDIT_FINANCING'
  | 'ORDERS_BACKLOG_CONTRACTS'
  | 'REVENUE_MARGIN_FCF'
  | 'EARNINGS_REVISIONS'
  | 'PRICE_RELATIVE_STRENGTH';

export type DestinationInput = {
  destination: CapitalDestination;
  destinationMode: DestinationMode;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  evidenceTypes: readonly DestinationEvidenceType[];
  publicFlowScore: number;
  privateCapitalScore: number;
  corporateCapexScore: number;
  sovereignFiscalScore: number;
  creditFundingScore: number;
  ordersBacklogScore: number;
  fcfEconomicProofScore: number;
  revisionsScore: number;
  relativeStrengthScore: number;
  crowdingRiskScore: number;
  fundingFragilityScore: number;
  valuationExpectationRiskScore: number;
  flowAccelerationScore: number;
  fundamentalAccelerationScore: number;
};

export type DestinationResult = {
  destination: CapitalDestination;
  destinationMode: DestinationMode;
  structuralDestinationScore: number;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  stage: CapitalStage;
  capitalSourceDiversity: number;
  riskOverlay: {
    crowdingRiskScore: number;
    fundingFragilityScore: number;
    valuationExpectationRiskScore: number;
  };
  action: 'PRIORITIZE_RESEARCH' | 'TRACK' | 'WAIT_FOR_PROOF' | 'DEPRIORITIZE';
  reasons: string[];
  falsifiers: string[];
};

const clamp = (v: number): number => Math.max(0, Math.min(100, v));
const round1 = (v: number): number => Math.round(v * 10) / 10;

function validate(input: DestinationInput): void {
  const scores = [input.publicFlowScore,input.privateCapitalScore,input.corporateCapexScore,input.sovereignFiscalScore,input.creditFundingScore,input.ordersBacklogScore,input.fcfEconomicProofScore,input.revisionsScore,input.relativeStrengthScore,input.crowdingRiskScore,input.fundingFragilityScore,input.valuationExpectationRiskScore,input.flowAccelerationScore,input.fundamentalAccelerationScore];
  if (scores.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) throw new Error('destination_of_money_scores_must_be_between_0_and_100');
}

export function scoreDestination(input: DestinationInput): number {
  validate(input);
  if (input.destinationMode === 'ASSET_CLASS') {
    return round1(clamp(input.publicFlowScore) * 0.45 + clamp(input.creditFundingScore) * 0.15 + clamp(input.sovereignFiscalScore) * 0.10 + clamp(input.revisionsScore) * 0.10 + clamp(input.relativeStrengthScore) * 0.20);
  }
  return round1(clamp(input.publicFlowScore) * 0.14 + clamp(input.privateCapitalScore) * 0.08 + clamp(input.corporateCapexScore) * 0.16 + clamp(input.sovereignFiscalScore) * 0.08 + clamp(input.creditFundingScore) * 0.10 + clamp(input.ordersBacklogScore) * 0.16 + clamp(input.fcfEconomicProofScore) * 0.16 + clamp(input.revisionsScore) * 0.07 + clamp(input.relativeStrengthScore) * 0.05);
}

export function evaluateDestinationOfMoney(input: DestinationInput): DestinationResult {
  const structuralDestinationScore = scoreDestination(input);
  const capitalSourceDiversity = new Set(input.evidenceTypes).size;
  const hasEconomicProof = input.evidenceTypes.some((x) => ['CORPORATE_CAPEX','ORDERS_BACKLOG_CONTRACTS','REVENUE_MARGIN_FCF'].includes(x));
  const hasVerifiedFundFlow = input.evidenceTypes.includes('PUBLIC_FUND_FLOW');
  const confirmationRule = input.destinationMode === 'ASSET_CLASS' ? hasVerifiedFundFlow && input.evidenceIds.length >= 2 && capitalSourceDiversity >= 2 : hasEconomicProof && input.evidenceIds.length >= 3 && capitalSourceDiversity >= 3;
  const evidenceGate: DestinationResult['evidenceGate'] = input.evidenceTraceable && confirmationRule ? 'CONFIRMED' : input.evidenceTraceable && input.evidenceIds.length >= 1 ? 'PROVISIONAL' : 'BLOCKED';

  let stage: CapitalStage;
  if (input.flowAccelerationScore < 35 && input.fundamentalAccelerationScore < 45) stage = 'R6_DECELERATING_EXIT';
  else if (structuralDestinationScore >= 78 && input.crowdingRiskScore >= 75) stage = 'R5_CROWDED';
  else if (structuralDestinationScore >= 78 && input.flowAccelerationScore >= 60 && (input.destinationMode === 'ASSET_CLASS' || input.fundamentalAccelerationScore >= 65)) stage = 'R4_ACCELERATING';
  else if (structuralDestinationScore >= 65 && evidenceGate === 'CONFIRMED') stage = 'R3_CONFIRMED_RECEIVER';
  else if (structuralDestinationScore >= 50) stage = 'R2_ACCUMULATION';
  else stage = 'R1_EARLY_SIGNAL';

  let action: DestinationResult['action'];
  if (evidenceGate === 'BLOCKED') action = 'WAIT_FOR_PROOF';
  else if (stage === 'R4_ACCELERATING' || stage === 'R3_CONFIRMED_RECEIVER') action = 'PRIORITIZE_RESEARCH';
  else if (stage === 'R5_CROWDED') action = 'TRACK';
  else if (stage === 'R6_DECELERATING_EXIT') action = 'DEPRIORITIZE';
  else action = 'TRACK';

  const reasons: string[] = [];
  if (capitalSourceDiversity >= 4) reasons.push('Capital is arriving through multiple independent channels, reducing single-source narrative risk.');
  if (input.destinationMode === 'REAL_ECONOMY' && input.ordersBacklogScore >= 75 && input.fcfEconomicProofScore >= 70) reasons.push('Orders/backlog are converting into economic proof rather than remaining narrative CAPEX.');
  if (input.privateCapitalScore >= 70 && input.publicFlowScore < 50) reasons.push('Private capital is moving before broad public-market confirmation; treat as early migration, not confirmed public rotation.');
  if (input.destinationMode === 'REAL_ECONOMY' && input.publicFlowScore >= 70 && input.fcfEconomicProofScore < 55) reasons.push('Public flows are ahead of economic proof; momentum/crowding risk is elevated.');
  if (input.destinationMode === 'ASSET_CLASS' && hasVerifiedFundFlow) reasons.push('Asset-class destination is anchored to verified fund-flow evidence rather than inferred from price.');
  if (input.crowdingRiskScore >= 75) reasons.push('Crowding is high and remains a separate timing risk; destination quality does not imply NO-CHASE is false.');
  if (input.fundingFragilityScore >= 70) reasons.push('A large share of destination demand may depend on fragile external financing or reflexive capital structures.');

  return { destination: input.destination,destinationMode: input.destinationMode,structuralDestinationScore,evidenceGate,stage,capitalSourceDiversity,riskOverlay:{crowdingRiskScore:round1(input.crowdingRiskScore),fundingFragilityScore:round1(input.fundingFragilityScore),valuationExpectationRiskScore:round1(input.valuationExpectationRiskScore)},action,reasons,falsifiers:['public_and_private_capital_flows_reverse_without_replacement_source','orders_backlog_or_contract_duration_deteriorate','revenue_margin_and_fcf_fail_to_confirm_announced_capex','credit_financing_closes_or_refinancing_costs_break_project_economics','capacity_additions_destroy_scarcity_faster_than_demand_grows','earnings_revisions_turn_down_across_multiple_receivers','funding_pool_concentration_reveals_false_diversification'] };
}

export const DESTINATION_OF_MONEY_OMEGA = {
  id:'DESTINATION_OF_MONEY_OMEGA_V1',name:'Destination of Money Ω v1.0',role:'cross_asset_cross_sector_capital_routing_engine',principle:'FOLLOW_THE_DOLLAR_NOT_THE_SECTOR_LABEL',
  realEconomyScoreWeights:{publicFlows:0.14,privateCapital:0.08,corporateCapex:0.16,sovereignFiscal:0.08,creditFunding:0.10,ordersBacklog:0.16,fcfEconomicProof:0.16,revisions:0.07,relativeStrength:0.05},
  assetClassScoreWeights:{publicFlows:0.45,creditFunding:0.15,sovereignFiscal:0.10,revisions:0.10,relativeStrength:0.20},
  constitutionalRules:['MARKET_CAP_CHANGE_IS_NOT_CAPITAL_FLOW','PRICE_RELATIVE_STRENGTH_IS_CONFIRMATION_NOT_ECONOMIC_PROOF','PRIVATE_CAPITAL_SIGNAL_IS_NOT_PUBLIC_FLOW_CONFIRMATION','CAPEX_ANNOUNCEMENT_IS_NOT_REALIZED_DEMAND','ASSET_CLASS_CONFIRMATION_REQUIRES_VERIFIED_PUBLIC_FUND_FLOW','DESTINATION_SCORE_DOES_NOT_OVERRIDE_VALUATION_OR_PORTFOLIO_CONSTRUCTION','FUNDING_POOLS_MUST_BE_DEDUPLICATED'],
} as const;
