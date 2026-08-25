export const SPECIALIZED_ECONOMICS_OMEGA_VERSION = '2026-08-24-v1.0.0' as const;

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));
const finite = (...values: number[]): boolean => values.every(Number.isFinite);

export interface RefiningNormalizationInput {
  throughputBarrels: number;
  normalizedBenchmarkCrackPerBarrel: number;
  captureRate: number;
  operatingCostPerBarrel: number;
  turnaroundCost: number;
  cashTaxes: number;
  interestExpense: number;
  maintenanceCapex: number;
  workingCapitalInvestment: number;
  marketCap: number;
}

export function calculateRefiningNormalization(input: RefiningNormalizationInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite) || input.marketCap <= 0) return { normalizedEbitda: null, normalizedFcf: null, normalizedFcfYieldPct: null };
  const capturedMarginPerBarrel = input.normalizedBenchmarkCrackPerBarrel * input.captureRate;
  const normalizedEbitda = input.throughputBarrels * (capturedMarginPerBarrel - input.operatingCostPerBarrel) - input.turnaroundCost;
  const normalizedFcf = normalizedEbitda - input.cashTaxes - input.interestExpense - input.maintenanceCapex - input.workingCapitalInvestment;
  return { normalizedEbitda, normalizedFcf, normalizedFcfYieldPct: 100 * normalizedFcf / input.marketCap };
}

export function calculateRefiningCaptureEfficiency(realizedMarginPerBarrel: number, benchmarkCrackPerBarrel: number) {
  if (!finite(realizedMarginPerBarrel, benchmarkCrackPerBarrel) || benchmarkCrackPerBarrel === 0) return null;
  return realizedMarginPerBarrel / benchmarkCrackPerBarrel;
}

export interface GoldToMinerTransmissionInput {
  realizedGoldPricePerOz: number;
  productionOz: number;
  aiscPerOz: number;
  sustainingCapex: number;
  growthCapex: number;
  cashTaxesAndRoyalties: number;
  dilutedShares: number;
}

export function calculateGoldToMinerTransmission(input: GoldToMinerTransmissionInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite) || input.dilutedShares <= 0) return { unitMargin: null, estimatedFcf: null, estimatedFcfPerShare: null };
  const unitMargin = input.realizedGoldPricePerOz - input.aiscPerOz;
  const estimatedFcf = unitMargin * input.productionOz - input.sustainingCapex - input.growthCapex - input.cashTaxesAndRoyalties;
  return { unitMargin, estimatedFcf, estimatedFcfPerShare: estimatedFcf / input.dilutedShares };
}

export function calculateGoldTorque(oldGoldPrice: number, newGoldPrice: number, aisc: number) {
  if (!finite(oldGoldPrice, newGoldPrice, aisc) || oldGoldPrice <= aisc || oldGoldPrice <= 0 || newGoldPrice <= 0) return null;
  const goldReturn = newGoldPrice / oldGoldPrice - 1;
  if (goldReturn === 0) return null;
  const oldMargin = oldGoldPrice - aisc;
  const newMargin = newGoldPrice - aisc;
  return (newMargin / oldMargin - 1) / goldReturn;
}

export interface AiFundingQualityInput {
  incrementalAiFcf: number;
  incrementalAiCapex: number;
  incrementalInterest: number;
  economicDilutionCost: number;
  incrementalAiNopat: number;
  incrementalAiInvestedCapital: number;
  marginalWaccPct: number;
}

export function calculateAiFundingQuality(input: AiFundingQualityInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite) || input.incrementalAiInvestedCapital <= 0) {
    return { fundingEfficiency: null, incrementalAiRoicPct: null, aiEconomicSpreadPct: null };
  }
  const fundingBase = input.incrementalAiCapex + input.incrementalInterest + input.economicDilutionCost;
  const fundingEfficiency = fundingBase > 0 ? input.incrementalAiFcf / fundingBase : null;
  const incrementalAiRoicPct = 100 * input.incrementalAiNopat / input.incrementalAiInvestedCapital;
  return { fundingEfficiency, incrementalAiRoicPct, aiEconomicSpreadPct: incrementalAiRoicPct - input.marginalWaccPct };
}

export function calculateAiTimeToMonetization(cumulativeAiInvestment: number, incrementalAnnualizedAiFcf: number) {
  if (!finite(cumulativeAiInvestment, incrementalAnnualizedAiFcf) || cumulativeAiInvestment < 0 || incrementalAnnualizedAiFcf <= 0) return null;
  return cumulativeAiInvestment / incrementalAnnualizedAiFcf;
}

export function calculateAiDurationMismatch(debtDurationYears: number, computeEconomicLifeYears: number) {
  if (!finite(debtDurationYears, computeEconomicLifeYears) || debtDurationYears < 0 || computeEconomicLifeYears <= 0) return null;
  return debtDurationYears - computeEconomicLifeYears;
}

export interface OperationalAiProofInput {
  deploymentScore: number;
  measuredProductivityScore: number;
  unitCostImprovementScore: number;
  marginAttributionScore: number;
  fcfPerShareAttributionScore: number;
}

export function calculateOperationalAiProof(input: OperationalAiProofInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite)) return null;
  return 0.15 * clamp(input.deploymentScore) + 0.25 * clamp(input.measuredProductivityScore) + 0.20 * clamp(input.unitCostImprovementScore) + 0.20 * clamp(input.marginAttributionScore) + 0.20 * clamp(input.fcfPerShareAttributionScore);
}

export interface FrontierCyberInput {
  offensiveCapabilityScore: number;
  urgencyScore: number;
  contractConversionScore: number;
  arrConversionScore: number;
  marginConversionScore: number;
  fcfPerShareConversionScore: number;
}

export function calculateFrontierCyberProof(input: FrontierCyberInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite)) return null;
  return 0.10 * clamp(input.offensiveCapabilityScore) + 0.10 * clamp(input.urgencyScore) + 0.20 * clamp(input.contractConversionScore) + 0.20 * clamp(input.arrConversionScore) + 0.20 * clamp(input.marginConversionScore) + 0.20 * clamp(input.fcfPerShareConversionScore);
}

export interface OptionalityValidationInput {
  externalValuation: number;
  ownershipPct: number;
  probabilityScore: number;
  strategicInvestorQualityScore: number;
  commercialProgressScore: number;
}

export function calculateValidatedOptionalityValue(input: OptionalityValidationInput) {
  const values = Object.values(input);
  if (!values.every(Number.isFinite) || input.externalValuation < 0) return null;
  const qualityMultiplier = (clamp(input.strategicInvestorQualityScore) + clamp(input.commercialProgressScore)) / 200;
  return input.externalValuation * clamp(input.ownershipPct, 0, 100) / 100 * clamp(input.probabilityScore) / 100 * qualityMultiplier;
}
