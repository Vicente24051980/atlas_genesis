export const OWNER_ECONOMICS_NORMALIZATION_OMEGA_VERSION = '2026-08-24-v1.0.0' as const;

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));
const finite = (...values: number[]): boolean => values.every(Number.isFinite);

export interface NormalizedOwnerEarningsInput {
  normalizedRevenue: number;
  normalizedOperatingMarginPct: number;
  cashTaxRatePct: number;
  maintenanceCapex: number;
  normalizedWorkingCapitalInvestment: number;
  netInterestExpense?: number;
  dilutedShares: number;
}

export function calculateNormalizedOwnerEarnings(input: NormalizedOwnerEarningsInput) {
  if (!finite(input.normalizedRevenue, input.normalizedOperatingMarginPct, input.cashTaxRatePct, input.maintenanceCapex, input.normalizedWorkingCapitalInvestment, input.dilutedShares) || input.dilutedShares <= 0) {
    return { normalizedOwnerEarnings: null, normalizedOwnerEarningsPerShare: null };
  }
  const operatingProfit = input.normalizedRevenue * input.normalizedOperatingMarginPct / 100;
  const afterTaxOperatingProfit = operatingProfit * (1 - input.cashTaxRatePct / 100);
  const normalizedOwnerEarnings = afterTaxOperatingProfit - input.maintenanceCapex - input.normalizedWorkingCapitalInvestment - (input.netInterestExpense ?? 0);
  return { normalizedOwnerEarnings, normalizedOwnerEarningsPerShare: normalizedOwnerEarnings / input.dilutedShares };
}

export interface EarningsQualityDecompositionInput {
  structural: number;
  cyclical: number;
  price: number;
  financial: number;
  accounting: number;
}

export function decomposeEarningsQuality(input: EarningsQualityDecompositionInput) {
  const components = [input.structural, input.cyclical, input.price, input.financial, input.accounting];
  if (!finite(...components)) return { totalChange: null, structuralEarningsRatioPct: null, cyclicalDependencePct: null };
  const totalChange = components.reduce((sum, value) => sum + value, 0);
  const absoluteTotal = components.reduce((sum, value) => sum + Math.abs(value), 0);
  return {
    totalChange,
    structuralEarningsRatioPct: absoluteTotal === 0 ? 0 : 100 * Math.abs(input.structural) / absoluteTotal,
    cyclicalDependencePct: absoluteTotal === 0 ? 0 : 100 * (Math.abs(input.cyclical) + Math.abs(input.price)) / absoluteTotal,
  };
}

export interface PeakEarningsProbabilityInput {
  marginZ: number;
  spreadZ: number;
  roicZ: number;
  fcfMarginZ: number;
  utilizationGapZ: number;
  commodityGapZ: number;
}

export function calculatePeakEarningsProbability(input: PeakEarningsProbabilityInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite)) return { score: null, state: 'EVIDENCE_PENDING' as const, disableSpotMultiples: false };
  const z = 0.22 * input.marginZ + 0.22 * input.spreadZ + 0.14 * input.roicZ + 0.14 * input.fcfMarginZ + 0.14 * input.utilizationGapZ + 0.14 * input.commodityGapZ;
  const score = clamp(50 + 20 * z);
  const state = score >= 75 ? 'PROBABLE_PEAK' : score >= 60 ? 'ELEVATED' : score >= 30 ? 'NORMAL_EXPANSIVE' : 'DEPRESSED_NORMAL';
  return { score, state, disableSpotMultiples: score >= 70 };
}

export interface CycleAdjustedValuationInput {
  marketCap: number;
  normalizedEarnings: number;
  normalizedFcf: number;
}

export function calculateCycleAdjustedValuation(input: CycleAdjustedValuationInput) {
  if (!finite(input.marketCap, input.normalizedEarnings, input.normalizedFcf) || input.marketCap <= 0) {
    return { cycleAdjustedPE: null, normalizedFcfYieldPct: null };
  }
  return {
    cycleAdjustedPE: input.normalizedEarnings > 0 ? input.marketCap / input.normalizedEarnings : null,
    normalizedFcfYieldPct: 100 * input.normalizedFcf / input.marketCap,
  };
}

export function calculateMeanReversionExposure(currentMetric: number, normalizedMetric: number, historicalStdDev: number) {
  if (!finite(currentMetric, normalizedMetric, historicalStdDev) || historicalStdDev <= 0) return null;
  return (currentMetric - normalizedMetric) / historicalStdDev;
}

export interface EarningsDurabilityInput {
  recurrence: number;
  switchingCosts: number;
  pricingPower: number;
  secularDemand: number;
  competitivePosition: number;
  cyclicality: number;
  disruptionRisk: number;
  customerConcentration: number;
}

export function calculateEarningsDurability(input: EarningsDurabilityInput) {
  const raw = Object.values(input);
  if (!raw.every(Number.isFinite)) return null;
  const positives = (clamp(input.recurrence) + clamp(input.switchingCosts) + clamp(input.pricingPower) + clamp(input.secularDemand) + clamp(input.competitivePosition)) / 5;
  const negatives = (clamp(input.cyclicality) + clamp(input.disruptionRisk) + clamp(input.customerConcentration)) / 3;
  return clamp(0.75 * positives + 0.25 * (100 - negatives));
}

export interface StructuralRegimePersistenceInput {
  supplyDestruction: number;
  demandPersistence: number;
  entryBarriers: number;
  capacityDiscipline: number;
  assetScarcity: number;
  newCapacityRisk: number;
  demandDestructionRisk: number;
}

export function calculateStructuralRegimePersistence(input: StructuralRegimePersistenceInput) {
  const raw = Object.values(input);
  if (!raw.every(Number.isFinite)) return null;
  const support = (clamp(input.supplyDestruction) + clamp(input.demandPersistence) + clamp(input.entryBarriers) + clamp(input.capacityDiscipline) + clamp(input.assetScarcity)) / 5;
  const reversal = (clamp(input.newCapacityRisk) + clamp(input.demandDestructionRisk)) / 2;
  return clamp(0.75 * support + 0.25 * (100 - reversal));
}

export function calculateRealExpectedReturn(nominalExpectedReturnPct: number, expectedInflationPct: number) {
  if (!finite(nominalExpectedReturnPct, expectedInflationPct) || expectedInflationPct <= -100) return null;
  return 100 * ((1 + nominalExpectedReturnPct / 100) / (1 + expectedInflationPct / 100) - 1);
}

export interface ProofAdjustedExpectedReturnInput {
  nominalExpectedReturnPct: number;
  economicProofScore: number;
  uncertaintyPenaltyPct: number;
}

export function calculateProofAdjustedExpectedReturn(input: ProofAdjustedExpectedReturnInput) {
  if (!finite(input.nominalExpectedReturnPct, input.economicProofScore, input.uncertaintyPenaltyPct)) return null;
  const proofCoefficient = clamp(input.economicProofScore) / 100;
  return input.nominalExpectedReturnPct * proofCoefficient - input.uncertaintyPenaltyPct;
}

export interface FactorDuplicationInput {
  positionWeightPct: number;
  commonFactorExposure: number;
  factorConcentrationScore: number;
}

export function calculateFactorDuplicationPenalty(input: FactorDuplicationInput) {
  if (!finite(input.positionWeightPct, input.commonFactorExposure, input.factorConcentrationScore)) return null;
  return Math.max(0, input.positionWeightPct) * clamp(input.commonFactorExposure, 0, 1) * clamp(input.factorConcentrationScore) / 100;
}

export interface MarginalPortfolioContributionInput {
  expectedReturnPct: number;
  proofScore: number;
  riskPenaltyPct: number;
  factorDuplicationPenaltyPct: number;
  diversificationBenefitPct: number;
  taxAndTurnoverFrictionPct?: number;
}

export function calculateMarginalPortfolioContribution(input: MarginalPortfolioContributionInput) {
  const required = [input.expectedReturnPct, input.proofScore, input.riskPenaltyPct, input.factorDuplicationPenaltyPct, input.diversificationBenefitPct];
  if (!required.every(Number.isFinite)) return null;
  return input.expectedReturnPct * clamp(input.proofScore) / 100 - input.riskPenaltyPct - input.factorDuplicationPenaltyPct + input.diversificationBenefitPct - (input.taxAndTurnoverFrictionPct ?? 0);
}
