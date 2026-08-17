export type LiquiditySurvivalState = 'ROBUST' | 'MANAGEABLE' | 'FRAGILE' | 'FORCED_SELL_RISK' | 'EVIDENCE_PENDING';
export type CrowdingState = 'UNCROWDED' | 'BUILDING' | 'CROWDED' | 'EXTREME' | 'UNKNOWN';
export type ForcedLiquidationState = 'NO_SIGNAL' | 'POSSIBLE_FORCED_LIQUIDATION' | 'CONFIRMED_DISLOCATION' | 'FUNDAMENTAL_BREAK';

export type LiquiditySurvivalInput = {
  id: string;
  evidenceTraceable: boolean;
  leverageScore: number; // 100 = unlevered/robust
  marginFundingResilienceScore: number;
  liquidityDepthScore: number;
  concentrationResilienceScore: number;
  factorDiversificationScore: number;
  collateralStabilityScore: number;
  maturityFundingMatchScore: number;
  drawdownToleranceScore: number;
};

export type CrowdingRiskInput = {
  id: string;
  ownershipConcentrationScore: number;
  factorConsensusScore: number;
  valuationStretchScore: number;
  momentumExtensionScore: number;
  derivativesPositioningScore: number;
  liquidityFragilityScore: number;
};

export type ForcedLiquidationInput = {
  ticker: string;
  priceShockScore: number;
  abnormalVolumeScore: number;
  correlationSpikeScore: number;
  leverageUnwindEvidenceScore: number;
  fundamentalDeteriorationScore: number;
  buyerAbsorptionScore: number;
  postLiquidationReversalScore: number;
};

const clamp = (x: number): number => Math.max(0, Math.min(100, x));
const round1 = (x: number): number => Math.round(x * 10) / 10;
const valid = (arr: readonly number[], err: string): void => { if (arr.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) throw new Error(err); };

export function evaluateLiquiditySurvival(input: LiquiditySurvivalInput) {
  const scores = [input.leverageScore, input.marginFundingResilienceScore, input.liquidityDepthScore, input.concentrationResilienceScore, input.factorDiversificationScore, input.collateralStabilityScore, input.maturityFundingMatchScore, input.drawdownToleranceScore];
  valid(scores, 'liquidity_survival_scores_must_be_between_0_and_100');
  const survivalScore = round1(
    clamp(input.leverageScore) * 0.18 +
    clamp(input.marginFundingResilienceScore) * 0.16 +
    clamp(input.liquidityDepthScore) * 0.12 +
    clamp(input.concentrationResilienceScore) * 0.14 +
    clamp(input.factorDiversificationScore) * 0.12 +
    clamp(input.collateralStabilityScore) * 0.10 +
    clamp(input.maturityFundingMatchScore) * 0.08 +
    clamp(input.drawdownToleranceScore) * 0.10,
  );
  const evidenceGate = input.evidenceTraceable ? 'CONFIRMED' : 'PROVISIONAL';
  let state: LiquiditySurvivalState;
  if (!input.evidenceTraceable) state = 'EVIDENCE_PENDING';
  else if (survivalScore >= 80) state = 'ROBUST';
  else if (survivalScore >= 65) state = 'MANAGEABLE';
  else if (survivalScore >= 45) state = 'FRAGILE';
  else state = 'FORCED_SELL_RISK';
  return {
    id: input.id,
    survivalScore,
    evidenceGate,
    state,
    thesisSurvivalTime: survivalScore >= 80 ? 'LONG' : survivalScore >= 65 ? 'ADEQUATE' : survivalScore >= 45 ? 'SHORT' : 'VERY_SHORT',
    falsifiers: ['leverage_or_margin_requirements_increase', 'liquidity_depth_collapses', 'factor_correlations_jump_toward_one', 'collateral_haircuts_rise', 'funding_maturity_shortens_or_refinancing_closes'],
  } as const;
}

export function evaluateCrowdingRisk(input: CrowdingRiskInput) {
  const scores = [input.ownershipConcentrationScore, input.factorConsensusScore, input.valuationStretchScore, input.momentumExtensionScore, input.derivativesPositioningScore, input.liquidityFragilityScore];
  valid(scores, 'crowding_scores_must_be_between_0_and_100');
  const crowdingRiskScore = round1(
    clamp(input.ownershipConcentrationScore) * 0.20 +
    clamp(input.factorConsensusScore) * 0.20 +
    clamp(input.valuationStretchScore) * 0.15 +
    clamp(input.momentumExtensionScore) * 0.15 +
    clamp(input.derivativesPositioningScore) * 0.15 +
    clamp(input.liquidityFragilityScore) * 0.15,
  );
  const state: CrowdingState = crowdingRiskScore >= 85 ? 'EXTREME' : crowdingRiskScore >= 70 ? 'CROWDED' : crowdingRiskScore >= 50 ? 'BUILDING' : 'UNCROWDED';
  return {
    id: input.id,
    crowdingRiskScore,
    state,
    timingOverlay: state === 'EXTREME' ? 'NO_CHASE_OR_REDUCED_SIZE' : state === 'CROWDED' ? 'ENTRY_DISCIPLINE' : 'NORMAL',
    rule: 'CROWDING_IS_NOT_A_FUNDAMENTAL_FALSIFIER',
  } as const;
}

export function detectForcedLiquidationDislocation(input: ForcedLiquidationInput) {
  const scores = [input.priceShockScore, input.abnormalVolumeScore, input.correlationSpikeScore, input.leverageUnwindEvidenceScore, input.fundamentalDeteriorationScore, input.buyerAbsorptionScore, input.postLiquidationReversalScore];
  valid(scores, 'forced_liquidation_scores_must_be_between_0_and_100');

  const technicalUnwindScore = round1(
    input.priceShockScore * 0.20 +
    input.abnormalVolumeScore * 0.18 +
    input.correlationSpikeScore * 0.14 +
    input.leverageUnwindEvidenceScore * 0.25 +
    input.buyerAbsorptionScore * 0.13 +
    input.postLiquidationReversalScore * 0.10,
  );
  let state: ForcedLiquidationState;
  if (input.fundamentalDeteriorationScore >= 70) state = 'FUNDAMENTAL_BREAK';
  else if (technicalUnwindScore >= 78 && input.fundamentalDeteriorationScore <= 45) state = 'CONFIRMED_DISLOCATION';
  else if (technicalUnwindScore >= 58 && input.fundamentalDeteriorationScore <= 60) state = 'POSSIBLE_FORCED_LIQUIDATION';
  else state = 'NO_SIGNAL';

  return {
    ticker: input.ticker,
    technicalUnwindScore,
    state,
    action: state === 'CONFIRMED_DISLOCATION' ? 'SEND_TO_HISTORICAL_DISLOCATION_AND_PRINCIPAL_RECHECK' : state === 'POSSIBLE_FORCED_LIQUIDATION' ? 'WATCH' : state === 'FUNDAMENTAL_BREAK' ? 'DO_NOT_LABEL_TECHNICAL' : 'NO_ACTION',
    rule: 'PRICE_SHOCK_PLUS_MARGIN_CALLS_DOES_NOT_PROVE_FUNDAMENTALS_BROKE',
  } as const;
}

export const LIQUIDITY_SURVIVAL_OMEGA = { id: 'LIQUIDITY_SURVIVAL_OMEGA_V1', name: 'Liquidity Survival Ω v1.0', objective: 'maximize_survivable_expected_return_not_theoretical_return' } as const;
export const CROWDING_RISK_OMEGA = { id: 'CROWDING_RISK_OMEGA_V1', name: 'Crowding Risk Ω v1.0' } as const;
export const FORCED_LIQUIDATION_DISLOCATION_OMEGA = { id: 'FORCED_LIQUIDATION_DISLOCATION_OMEGA_V1', name: 'Forced Liquidation Dislocation Ω v1.0' } as const;
