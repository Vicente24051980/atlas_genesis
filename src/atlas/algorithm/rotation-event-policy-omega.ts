export const ROTATION_EVENT_POLICY_OMEGA_VERSION = '2026-08-24-v1.0.0' as const;

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));
const finite = (...values: number[]): boolean => values.every(Number.isFinite);

export interface FundamentalFlowDivergenceInput {
  fundamentalScore: number;
  capitalFlowScore: number;
  valuationMarginOfSafetyScore: number;
  proofPersistenceScore: number;
}

export function evaluateFundamentalFlowDivergence(input: FundamentalFlowDivergenceInput) {
  if (!finite(input.fundamentalScore, input.capitalFlowScore, input.valuationMarginOfSafetyScore, input.proofPersistenceScore)) {
    return { divergence: null, state: 'EVIDENCE_PENDING' as const, opportunityScore: null };
  }
  const fundamental = clamp(input.fundamentalScore);
  const flow = clamp(input.capitalFlowScore);
  const divergence = fundamental - flow;
  const state = fundamental >= 60 && flow >= 60 ? 'CONFIRMED_COMPOUND' :
    fundamental >= 60 && flow < 50 ? 'PROOF_UP_FLOW_DOWN' :
    fundamental < 50 && flow >= 60 ? 'NARRATIVE_MOMENTUM_RISK' :
    fundamental < 50 && flow < 50 ? 'CONFIRMED_DETERIORATION' : 'MIXED';
  const opportunityScore = divergence > 0
    ? divergence * clamp(input.valuationMarginOfSafetyScore) / 100 * clamp(input.proofPersistenceScore) / 100
    : 0;
  return { divergence, state, opportunityScore };
}

export interface InstitutionalConsensusQualityInput {
  hedgeFundBreadth: number;
  mutualFundBreadth: number;
  persistenceScore: number;
  capitalScaleScore: number;
  fundamentalAlignmentScore: number;
  crowdingPenalty: number;
  valuationPenalty: number;
  observationLagDays: number;
  currentFlowIndependentlyVerified: boolean;
}

export function calculateInstitutionalConsensusQuality(input: InstitutionalConsensusQualityInput) {
  const raw = [input.hedgeFundBreadth, input.mutualFundBreadth, input.persistenceScore, input.capitalScaleScore, input.fundamentalAlignmentScore, input.crowdingPenalty, input.valuationPenalty, input.observationLagDays];
  if (!raw.every(Number.isFinite)) return { score: null, currentFlowConfirmed: false, lagPenalty: null };
  const crossOwnerBreadth = (clamp(input.hedgeFundBreadth) + clamp(input.mutualFundBreadth)) / 2;
  const lagPenalty = clamp(input.observationLagDays / 90 * 25, 0, 25);
  const rawScore = 0.25 * crossOwnerBreadth + 0.20 * clamp(input.persistenceScore) + 0.20 * clamp(input.capitalScaleScore) + 0.35 * clamp(input.fundamentalAlignmentScore);
  const score = clamp(rawScore - clamp(input.crowdingPenalty) * 0.15 - clamp(input.valuationPenalty) * 0.15 - lagPenalty);
  return { score, currentFlowConfirmed: input.currentFlowIndependentlyVerified, lagPenalty };
}

export interface PolicyReactionInput {
  interventionProbabilityPct: number;
  interventionSizeScore: number;
  initialMarketImpactScore: number;
  persistenceScore: number;
}

export function calculatePolicyPutStrength(input: PolicyReactionInput) {
  if (!finite(input.interventionProbabilityPct, input.interventionSizeScore, input.initialMarketImpactScore, input.persistenceScore)) return null;
  return clamp(input.interventionProbabilityPct) / 100 * clamp(input.interventionSizeScore) / 100 * clamp(input.initialMarketImpactScore) / 100 * clamp(input.persistenceScore);
}

export function calculatePolicyEffectivenessDecay(initialMarketImpact: number, residualMarketImpact: number) {
  if (!finite(initialMarketImpact, residualMarketImpact) || initialMarketImpact === 0) return null;
  return 100 * residualMarketImpact / initialMarketImpact;
}

export function calculateEventPremiumRatio(impliedMovePct: number, historicalAverageMovePct: number) {
  if (!finite(impliedMovePct, historicalAverageMovePct) || historicalAverageMovePct <= 0) return null;
  return impliedMovePct / historicalAverageMovePct;
}

export interface EventExpectationDensityInput {
  impliedMovePct: number;
  historicalAverageMovePct: number;
  fundamentalExpectationScore: number;
  crossAssetImportanceScore: number;
}

export function calculateEventExpectationDensity(input: EventExpectationDensityInput) {
  const ratio = calculateEventPremiumRatio(input.impliedMovePct, input.historicalAverageMovePct);
  if (ratio == null || !finite(input.fundamentalExpectationScore, input.crossAssetImportanceScore)) return null;
  return ratio * clamp(input.fundamentalExpectationScore) / 100 * clamp(input.crossAssetImportanceScore) / 100;
}

export interface MacroPressureVectorInput {
  oilShockZ: number;
  inflationSurpriseZ: number;
  realYieldShockZ: number;
  usdShockZ: number;
  creditSpreadShockZ: number;
}

export function calculateMacroPressureVector(input: MacroPressureVectorInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite)) return null;
  return 0.20 * input.oilShockZ + 0.25 * input.inflationSurpriseZ + 0.25 * input.realYieldShockZ + 0.10 * input.usdShockZ + 0.20 * input.creditSpreadShockZ;
}

export interface EventInteractionInput {
  nvidiaImpulse: number;
  inflationImpulse: number;
  oilImpulse: number;
  fedImpulse: number;
  geopoliticalImpulse: number;
  assetSensitivities: {
    nvidia: number;
    inflation: number;
    oil: number;
    fed: number;
    geopolitical: number;
  };
}

export function calculateNetEventImpulse(input: EventInteractionInput) {
  const values = [input.nvidiaImpulse, input.inflationImpulse, input.oilImpulse, input.fedImpulse, input.geopoliticalImpulse, ...Object.values(input.assetSensitivities)];
  if (!values.every(Number.isFinite)) return null;
  return input.nvidiaImpulse * input.assetSensitivities.nvidia +
    input.inflationImpulse * input.assetSensitivities.inflation +
    input.oilImpulse * input.assetSensitivities.oil +
    input.fedImpulse * input.assetSensitivities.fed +
    input.geopoliticalImpulse * input.assetSensitivities.geopolitical;
}

export interface StrategicCommodityBufferInput {
  nominalInventory: number;
  deliverabilityFactor: number;
  seasonalAvailabilityFactor: number;
  infrastructureReliabilityFactor: number;
  effectiveDrawdownRate: number;
  fillRate: number;
}

export function calculateStrategicCommodityBuffer(input: StrategicCommodityBufferInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite) || input.nominalInventory < 0 || input.fillRate <= 0) {
    return { bufferScoreUnits: null, replenishmentAsymmetry: null };
  }
  const bufferScoreUnits = input.nominalInventory * clamp(input.deliverabilityFactor, 0, 1) * clamp(input.seasonalAvailabilityFactor, 0, 1) * clamp(input.infrastructureReliabilityFactor, 0, 1);
  return { bufferScoreUnits, replenishmentAsymmetry: input.effectiveDrawdownRate / input.fillRate };
}
