export const AI_DEMAND_PROVENANCE_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export const AI_DEMAND_PROVENANCE_SEQUENCE = [
  'T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1_1',
  'T1_FUNDAMENTAL_HARD_GATES',
  'T2_FINANCING_QUALITY_GATE_OMEGA_V1',
  'T3_CIRCULAR_DEMAND_GATE_OMEGA_V1',
  'T4_QUALITY_ADJUSTED_BACKLOG_OMEGA_V1',
  'T5_CAPITAL_RISK_TRANSFER_ADVANTAGE_OMEGA_V1',
  'ATLAS_FUNDAMENTAL_SCORE',
  'EXPECTATION_GAP_OMEGA',
  'CAPEX_ASYMMETRY_P0_ADJUSTED_OMEGA',
  'ENTRY_TIMING_OMEGA',
] as const;

export type FinancingQualityState =
  | 'PASS_HIGH_QUALITY'
  | 'PASS_INDEPENDENT_FINANCED'
  | 'REVIEW_SUPPORTED'
  | 'HARD_REVIEW_REFLEXIVE'
  | 'FAIL_CIRCULARITY_CRITICAL'
  | 'EVIDENCE_PENDING';

export interface FinancingQualityEvidence {
  fundingSourceIdentified: boolean;
  buyerIndependentFromVendor: boolean | null;
  repaymentFromExternalBusinessCashFlow: boolean | null;
  buyerBalanceSheetSupport: boolean | null;
  debtTermsSustainable: boolean | null;
  leaseDependencyMaterial: boolean | null;
  vendorFundingMaterial: boolean | null;
  guaranteesBackstopsMaterial: boolean | null;
  customerConcentrationMaterial: boolean | null;
  terminationPrepaymentProtectionAdequate: boolean | null;
  residualRiskRetainedByVendor: boolean | null;
}

export interface FinancingQualityGateResult {
  state: FinancingQualityState;
  completedChecks: number;
  totalChecks: 10;
  downstreamFundamentalScoreAuthorized: boolean;
  reasons: string[];
}

export function evaluateFinancingQualityGate(e: FinancingQualityEvidence): FinancingQualityGateResult {
  if (!e.fundingSourceIdentified) {
    return { state: 'EVIDENCE_PENDING', completedChecks: 0, totalChecks: 10, downstreamFundamentalScoreAuthorized: false,
      reasons: ['Follow the money backwards: funding origin must be identified before AI-CAPEX demand is capitalized.'] };
  }
  const checks = [
    e.buyerIndependentFromVendor,
    e.repaymentFromExternalBusinessCashFlow,
    e.buyerBalanceSheetSupport,
    e.debtTermsSustainable,
    e.leaseDependencyMaterial == null ? null : !e.leaseDependencyMaterial,
    e.vendorFundingMaterial == null ? null : !e.vendorFundingMaterial,
    e.guaranteesBackstopsMaterial == null ? null : !e.guaranteesBackstopsMaterial,
    e.customerConcentrationMaterial == null ? null : !e.customerConcentrationMaterial,
    e.terminationPrepaymentProtectionAdequate,
    e.residualRiskRetainedByVendor == null ? null : !e.residualRiskRetainedByVendor,
  ] as const;
  const known = checks.filter((x): x is boolean => x != null);
  if (known.length < 10) return { state: 'EVIDENCE_PENDING', completedChecks: known.length, totalChecks: 10, downstreamFundamentalScoreAuthorized: false,
    reasons: ['All ten FQ checks must be resolved; missing financing evidence is not treated as organic demand.'] };
  const positives = known.filter(Boolean).length;
  const severeReflexive = e.vendorFundingMaterial === true && (e.guaranteesBackstopsMaterial === true || e.residualRiskRetainedByVendor === true);
  const state: FinancingQualityState = severeReflexive ? 'HARD_REVIEW_REFLEXIVE'
    : positives >= 9 ? 'PASS_HIGH_QUALITY'
      : positives >= 7 ? 'PASS_INDEPENDENT_FINANCED'
        : positives >= 5 ? 'REVIEW_SUPPORTED'
          : 'HARD_REVIEW_REFLEXIVE';
  return {
    state,
    completedChecks: 10,
    totalChecks: 10,
    downstreamFundamentalScoreAuthorized: state === 'PASS_HIGH_QUALITY' || state === 'PASS_INDEPENDENT_FINANCED' || state === 'REVIEW_SUPPORTED',
    reasons: ['FQ is a demand-provenance hard gate, not a structural-quality score. Business quality and marginal demand quality remain separate.'],
  };
}

export interface CircularDemandHaircuts {
  circularCapital: number;      // C max 25
  vendorFinancing: number;      // V max 20
  guaranteesBackstops: number;  // G max 20
  leaseDependency: number;      // L max 15
  reflexiveRevenueFunding: number; // R max 20
}

export interface CircularDemandInput {
  materialEconomicNexus: boolean;
  haircuts: CircularDemandHaircuts;
  evidenceComplete: boolean;
}

export interface CircularDemandResult {
  state: FinancingQualityState;
  odq: number | null;
  odqMultiplier: number | null;
  fundamentalScoreAuthorized: boolean;
  reasons: string[];
}

const MAX = { circularCapital: 25, vendorFinancing: 20, guaranteesBackstops: 20, leaseDependency: 15, reflexiveRevenueFunding: 20 } as const;

export function evaluateCircularDemand(input: CircularDemandInput): CircularDemandResult {
  if (!input.evidenceComplete) return { state: 'EVIDENCE_PENDING', odq: null, odqMultiplier: null, fundamentalScoreAuthorized: false,
    reasons: ['Circular-demand evidence incomplete; unknown is not organic.'] };
  const values = Object.entries(input.haircuts) as [keyof CircularDemandHaircuts, number][];
  if (values.some(([k,v]) => !Number.isFinite(v) || v < 0 || v > MAX[k])) {
    return { state: 'EVIDENCE_PENDING', odq: null, odqMultiplier: null, fundamentalScoreAuthorized: false,
      reasons: ['Haircut outside canonical maximum or invalid numeric input.'] };
  }
  if (!input.materialEconomicNexus) {
    return { state: 'PASS_HIGH_QUALITY', odq: 100, odqMultiplier: 1, fundamentalScoreAuthorized: true,
      reasons: ['Mere ownership, investment or commercial proximity without a material financing-demand nexus earns zero circularity haircut.'] };
  }
  const total = values.reduce((s,[,v]) => s + v, 0);
  const odq = Math.max(0, 100 - total);
  const state: FinancingQualityState = odq >= 90 ? 'PASS_HIGH_QUALITY'
    : odq >= 75 ? 'PASS_INDEPENDENT_FINANCED'
      : odq >= 60 ? 'REVIEW_SUPPORTED'
        : odq >= 40 ? 'HARD_REVIEW_REFLEXIVE'
          : 'FAIL_CIRCULARITY_CRITICAL';
  return {
    state,
    odq,
    odqMultiplier: odq / 100,
    fundamentalScoreAuthorized: odq >= 60,
    reasons: [
      'ODQ discounts independence of marginal demand; it does not allege fraud.',
      'ODQ is applied only where a material economic nexus between financing/support and demand is evidenced.',
    ],
  };
}

export interface QualityAdjustedBacklogInput {
  reportedBacklog: number;
  odq: number | null;
  contractQuality: number;
  fundingProbability: number;
}

export interface QualityAdjustedBacklogResult {
  state: 'AVAILABLE' | 'EVIDENCE_PENDING';
  qualityAdjustedBacklog: number | null;
}

export function qualityAdjustedBacklog(x: QualityAdjustedBacklogInput): QualityAdjustedBacklogResult {
  const valid = Number.isFinite(x.reportedBacklog) && x.reportedBacklog >= 0 && x.odq != null && x.odq >= 0 && x.odq <= 100
    && Number.isFinite(x.contractQuality) && x.contractQuality >= 0 && x.contractQuality <= 1
    && Number.isFinite(x.fundingProbability) && x.fundingProbability >= 0 && x.fundingProbability <= 1;
  if (!valid) return { state: 'EVIDENCE_PENDING', qualityAdjustedBacklog: null };
  return { state: 'AVAILABLE', qualityAdjustedBacklog: x.reportedBacklog * (x.odq / 100) * x.contractQuality * x.fundingProbability };
}

export interface RatioDiagnostic { state: 'AVAILABLE' | 'NO_CALCULABLE'; value: number | null; }
function ratio(n: number, d: number): RatioDiagnostic {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) return { state: 'NO_CALCULABLE', value: null };
  return { state: 'AVAILABLE', value: n / d };
}

export function capitalRiskTransferAdvantage(fcfCaptured: number, ownCapitalAtRisk: number): RatioDiagnostic {
  return ratio(fcfCaptured, ownCapitalAtRisk);
}
export function aiOrderCashQuality(cashCollected: number, aiRevenue: number): RatioDiagnostic {
  return ratio(cashCollected, aiRevenue);
}
export function workingCapitalIntensity(deltaAR: number, deltaInventory: number, deltaAP: number, deltaRevenue: number): RatioDiagnostic {
  return ratio(deltaAR + deltaInventory - deltaAP, deltaRevenue);
}

export const AI_CAPEX_PAYBACK_MONEY_BACKWARDS_RULE =
  'Follow the money backwards. El backlog sólo vale tanto como el flujo de caja independiente que existe al final de la cadena para pagarlo.' as const;
