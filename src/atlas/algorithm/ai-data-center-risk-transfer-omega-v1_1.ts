export type DcrtPhase = 'CONSTRUCTION' | 'COMMISSIONING' | 'OPERATION' | 'MIXED' | 'UNKNOWN';
export type DcrtRole = 'BROKER' | 'MODELING_ANALYTICS' | 'PRIMARY_INSURER' | 'REINSURER' | 'ILS_STRUCTURER';
export type DcrtMarketStage = 'M0' | 'M1' | 'M2' | 'M3' | 'M4';
export type DcrtCompanyStage = 'C0' | 'C1' | 'C2' | 'C3' | 'C4';
export type DcrtT5Route = 'RISK_BEARING_CRTA' | 'CAPITAL_LIGHT_NON_RISK_BEARING' | 'NOT_AUTHORIZED';

export interface DcrtV11Input {
  phase: DcrtPhase;
  role: DcrtRole;
  namedProduct: boolean;
  protectionGapProven: boolean;
  dedicatedCapacityProgram: boolean;
  dedicatedTreaty: boolean;
  dedicatedFacilityReinsuranceBacking: boolean;
  dedicatedCatBond: boolean;
  dedicatedSidecar: boolean;
  dedicatedCollateralizedReinsurance: boolean;
  dedicatedParametricAlternativeCapital: boolean;
  genericFacultativeOnly: boolean;

  companyPositioning: boolean;
  attributableTransaction: boolean;
  attributableTransactionSourceCount: number;
  disclosedByCompanyOrFiling: boolean;
  transactionTivUsd?: number | null;
  transactionPremiumUsd?: number | null;
  transactionFeeUsd?: number | null;
  materialityOverride: boolean;
  quantitativeTractionMetric: boolean;
  attributableRevenueMargin: boolean;
  multiPeriodFcfRoic: boolean;

  announcedCapacityUsd?: number | null;
  boundLimitUsd?: number | null;
  premiumInvoicedOrEconomicEquivalent: boolean;
  policyOrContractEffective: boolean;

  attributableFcf?: number | null;
  ownCapitalAtRisk?: number | null;
  operatingCapitalEmployed?: number | null;

  natCatModelabilityGap?: number | null;
  nonNatCatModelabilityGap?: number | null;
  retainedTailRisk: number;
  geographicConcentrationRisk: number;
  cbiMaterial: boolean;
  cbiDistanceSublimitStrict: boolean;
  cbiWaitingPeriodStrict: boolean;
  cbiLimitStrict: boolean;
  primaryDeductibleAdequacy?: number | null;
  primaryAttritionalLossFrequency?: number | null;
  primaryBelowReinsuranceAttachmentShare?: number | null;
}

export interface DcrtV11Result {
  marketStage: DcrtMarketStage;
  companyStage: DcrtCompanyStage;
  t5Route: DcrtT5Route;
  crta: number | null;
  capitalLightEfficiency: number | null;
  utilizationRate: number | null;
  modelabilityGap: number | null;
  riskTransferFragility: number | null;
  premiumDoubleCount: 'BLOCKED';
  capexDoubleCount: 'BLOCKED';
  portfolioAction: 'NONE';
  reasons: string[];
}

const valid01to100 = (x: number | null | undefined): x is number =>
  x != null && Number.isFinite(x) && x >= 0 && x <= 100;

export function deriveDcrtMarketStageV11(x: DcrtV11Input): DcrtMarketStage {
  const m4 = x.dedicatedCatBond || x.dedicatedSidecar || x.dedicatedCollateralizedReinsurance || x.dedicatedParametricAlternativeCapital;
  if (m4) return 'M4';
  const m3 = x.dedicatedTreaty || x.dedicatedFacilityReinsuranceBacking;
  if (m3) return 'M3';
  if (x.dedicatedCapacityProgram) return 'M2';
  if (x.protectionGapProven) return 'M1';
  return 'M0';
}

function transactionMaterial(x: DcrtV11Input): boolean {
  if (x.materialityOverride) return true;
  return (x.transactionTivUsd ?? 0) >= 25_000_000 ||
    (x.transactionPremiumUsd ?? 0) >= 1_000_000 ||
    (x.transactionFeeUsd ?? 0) >= 250_000;
}

function transactionTraceable(x: DcrtV11Input): boolean {
  return x.disclosedByCompanyOrFiling || x.attributableTransactionSourceCount >= 2;
}

export function deriveDcrtCompanyStageV11(x: DcrtV11Input): DcrtCompanyStage {
  if (!x.companyPositioning || !x.namedProduct) return 'C0';
  const c2 = x.attributableTransaction && transactionTraceable(x) && transactionMaterial(x);
  if (!c2) return 'C1';
  const c3 = x.attributableRevenueMargin && x.quantitativeTractionMetric;
  if (!c3) return 'C2';
  if (!x.multiPeriodFcfRoic) return 'C3';
  return 'C4';
}

export function dcrtUtilizationRateV11(x: DcrtV11Input): number | null {
  const utilized = (x.boundLimitUsd ?? 0) > 0 && x.premiumInvoicedOrEconomicEquivalent && x.policyOrContractEffective;
  if (!utilized || !(x.announcedCapacityUsd && x.announcedCapacityUsd > 0)) return null;
  return Math.min(1, (x.boundLimitUsd ?? 0) / x.announcedCapacityUsd);
}

export function dcrtModelabilityGapV11(x: DcrtV11Input): number | null {
  if (!valid01to100(x.natCatModelabilityGap) || !valid01to100(x.nonNatCatModelabilityGap)) return null;
  let mg = 0.5 * x.natCatModelabilityGap + 0.5 * x.nonNatCatModelabilityGap;
  const weakCbiControls = x.cbiMaterial && (!x.cbiDistanceSublimitStrict || !x.cbiWaitingPeriodStrict || !x.cbiLimitStrict);
  if (weakCbiControls) mg = Math.max(mg, 75);
  return Math.min(100, mg);
}

function adjustedRetainedTailRisk(x: DcrtV11Input): number {
  let tr = Math.max(0, Math.min(100, x.retainedTailRisk));
  if (x.role === 'PRIMARY_INSURER') {
    const components = [x.primaryDeductibleAdequacy, x.primaryAttritionalLossFrequency, x.primaryBelowReinsuranceAttachmentShare]
      .filter(valid01to100);
    if (components.length === 3) {
      const deductibleInadequacy = 100 - (x.primaryDeductibleAdequacy as number);
      const primaryPenalty = (deductibleInadequacy + (x.primaryAttritionalLossFrequency as number) + (x.primaryBelowReinsuranceAttachmentShare as number)) / 3;
      tr = Math.max(tr, primaryPenalty);
    }
  }
  return tr;
}

export function evaluateDcrtV11(x: DcrtV11Input): DcrtV11Result {
  const marketStage = deriveDcrtMarketStageV11(x);
  const companyStage = deriveDcrtCompanyStageV11(x);
  const reasons: string[] = [];

  if (x.genericFacultativeOnly && marketStage === 'M2') {
    reasons.push('Ordinary commercial-property facultative reinsurance does not establish M3.');
  }

  const utilizationRate = dcrtUtilizationRateV11(x);
  const modelabilityGap = dcrtModelabilityGapV11(x);
  const tr = adjustedRetainedTailRisk(x);
  const gc = Math.max(0, Math.min(100, x.geographicConcentrationRisk));
  const riskTransferFragility = modelabilityGap == null ? null : 0.35 * modelabilityGap + 0.35 * tr + 0.30 * gc;

  let t5Route: DcrtT5Route = 'NOT_AUTHORIZED';
  let crta: number | null = null;
  let capitalLightEfficiency: number | null = null;
  const c3plus = companyStage === 'C3' || companyStage === 'C4';

  if (c3plus && (x.role === 'PRIMARY_INSURER' || x.role === 'REINSURER')) {
    t5Route = 'RISK_BEARING_CRTA';
    if (x.attributableFcf != null && x.ownCapitalAtRisk != null && x.ownCapitalAtRisk > 0) {
      crta = x.attributableFcf / x.ownCapitalAtRisk;
    } else {
      reasons.push('CRTA remains NO_CALCULABLE when own capital at risk is zero, invalid, or unknown.');
    }
  } else if (c3plus && (x.role === 'BROKER' || x.role === 'MODELING_ANALYTICS' || x.role === 'ILS_STRUCTURER')) {
    t5Route = 'CAPITAL_LIGHT_NON_RISK_BEARING';
    if (x.attributableFcf != null && x.operatingCapitalEmployed != null && x.operatingCapitalEmployed > 0) {
      capitalLightEfficiency = x.attributableFcf / x.operatingCapitalEmployed;
    } else {
      reasons.push('Capital-light efficiency remains NO_CALCULABLE when operating capital employed is zero, invalid, or unknown.');
    }
  }

  return {
    marketStage,
    companyStage,
    t5Route,
    crta,
    capitalLightEfficiency,
    utilizationRate,
    modelabilityGap,
    riskTransferFragility,
    premiumDoubleCount: 'BLOCKED',
    capexDoubleCount: 'BLOCKED',
    portfolioAction: 'NONE',
    reasons,
  };
}

export const DCRT_OMEGA_V1_1_HARDENED = {
  id: 'AI_DATA_CENTER_RISK_TRANSFER_OMEGA_V1_1_HARDENED',
  effectiveDate: '2026-09-12',
  supersedes: 'AI_DATA_CENTER_RISK_TRANSFER_OMEGA_V1 where conflicts exist',
  directFundamentalWeight: 0,
  directFruMathWeight: 0,
  createsNewEngine: false,
  createsNewKernelContract: false,
  rules: [
    'PREMIUM_DOUBLE_COUNT_BLOCKED',
    'CAPEX_DOUBLE_COUNT_BLOCKED',
    'STANDARD_FACULTATIVE_NOT_M3',
    'PARAMETRIC_ALT_CAPITAL_CAN_QUALIFY_M4_IF_DEDICATED',
    'C2_REQUIRES_TRACEABILITY_AND_MATERIALITY',
    'C3_REQUIRES_QUANTITATIVE_TRACTION',
    'PHASE_REQUIRED',
    'UTILIZED_REQUIRES_BOUND_PREMIUM_EFFECTIVE',
    'CAPITAL_LIGHT_ZERO_UNDERWRITING_CAPITAL_NEVER_IMPLIES_INFINITE_RETURN',
    'CBI_WEAK_CONTROLS_PENALIZE_MODELABILITY',
  ],
} as const;
