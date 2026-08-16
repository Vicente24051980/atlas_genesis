export type EvidenceState = 'CONFIRMED' | 'PARTIAL' | 'UNVERIFIED' | 'CONTRADICTED';

export type CapitalFundingQualityState =
  | 'CFQ0_SELF_FUNDED'
  | 'CFQ1_AUGMENTED_ROBUST'
  | 'CFQ2_DEPENDENT'
  | 'CFQ3_FRAGILE'
  | 'CFQ4_REFLEXIVE_CASCADE';

export type FinancedDemandState =
  | 'FD0_ORGANIC'
  | 'FD1_SUPPORTED'
  | 'FD2_INTERDEPENDENT'
  | 'FD3_REFLEXIVE'
  | 'FD4_SYNTHETIC_FRAGILITY';

export interface FundingSourceOmega {
  source: string;
  amount?: number;
  currency?: string;
  tenorMonths?: number;
  recourse?: 'NONE' | 'LIMITED' | 'FULL' | 'UNKNOWN';
  costPct?: number;
  collateral?: string;
  counterparty?: string;
  purpose?: string;
  maturity?: string;
  evidence: EvidenceState;
  sourceDate?: string;
}

export interface FinancedDemandLinkOmega {
  party: string;
  roles: Array<'INVESTOR' | 'SUPPLIER' | 'DISTRIBUTOR' | 'CUSTOMER' | 'FINANCIER' | 'GUARANTOR'>;
  mechanism:
    | 'NONE'
    | 'VENDOR_FINANCE'
    | 'BUYER_FINANCE'
    | 'CLOUD_CREDITS'
    | 'PREPAYMENT'
    | 'TAKE_OR_PAY'
    | 'MINIMUM_SPEND'
    | 'EQUITY_INVESTMENT'
    | 'GUARANTEE_BACKSTOP'
    | 'RECIPROCAL_PROCUREMENT'
    | 'OTHER';
  economicallyBinding?: boolean;
  evidence: EvidenceState;
  note?: string;
}

export interface CapitalFundingQualityInput {
  tickerOrCompany: string;
  ocf?: number;
  fcf?: number;
  cash?: number;
  grossDebt?: number;
  netDebt?: number;
  financeLeases?: number;
  purchaseCommitments?: number;
  equityIssuance?: number;
  shareCountGrowthPct?: number;
  customerPrepayments?: number;
  fundingSources: FundingSourceOmega[];
  refinancingDependency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  dilutionDependency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  guaranteeBackstopDependency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  demandProof?: 'STRONG' | 'MIXED' | 'WEAK' | 'UNKNOWN';
  payback?: 'STRONG' | 'MIXED' | 'WEAK' | 'UNKNOWN';
  evidence: EvidenceState;
}

export interface FinancedDemandInput {
  tickerOrCompany: string;
  customerConcentration?: number;
  usageGrowthPct?: number;
  priceGrowthPct?: number;
  renewalTrend?: 'IMPROVING' | 'STABLE' | 'DETERIORATING' | 'UNKNOWN';
  backlogQuality?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  relatedPartyRevenueMaterial?: boolean;
  links: FinancedDemandLinkOmega[];
  evidence: EvidenceState;
}

export interface CapitalFundingQualityOutput {
  state: CapitalFundingQualityState;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
  falsifiers: string[];
}

export interface FinancedDemandOutput {
  state: FinancedDemandState;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
  falsifiers: string[];
}

/**
 * Deliberately non-parametric until ATLAS has a calibrated cross-sectional dataset.
 * The engine does not use universal leverage, CAPEX/OCF, or commitment thresholds.
 */
export function evaluateCapitalFundingQuality(
  input: CapitalFundingQualityInput
): CapitalFundingQualityOutput {
  const reasons: string[] = [];

  const externalFundingMaterial = input.fundingSources.length > 0;
  const weakEconomics = input.demandProof === 'WEAK' || input.payback === 'WEAK';
  const highFundingDependency =
    input.refinancingDependency === 'HIGH' ||
    input.dilutionDependency === 'HIGH' ||
    input.guaranteeBackstopDependency === 'HIGH';

  if (!externalFundingMaterial && input.payback === 'STRONG') {
    reasons.push('Growth is primarily self-funded and payback evidence is strong.');
    return { state: 'CFQ0_SELF_FUNDED', confidence: confidenceFromEvidence(input.evidence), reasons, falsifiers: defaultFundingFalsifiers() };
  }

  if (highFundingDependency && weakEconomics) {
    reasons.push('Funding dependency is high while demand/payback evidence is weakening.');
    return { state: 'CFQ3_FRAGILE', confidence: confidenceFromEvidence(input.evidence), reasons, falsifiers: defaultFundingFalsifiers() };
  }

  if (highFundingDependency) {
    reasons.push('Continued growth is materially dependent on external capital, refinancing, dilution or backstops.');
    return { state: 'CFQ2_DEPENDENT', confidence: confidenceFromEvidence(input.evidence), reasons, falsifiers: defaultFundingFalsifiers() };
  }

  if (externalFundingMaterial) {
    reasons.push('External capital augments growth but no calibrated evidence currently supports a fragility classification.');
    return { state: 'CFQ1_AUGMENTED_ROBUST', confidence: confidenceFromEvidence(input.evidence), reasons, falsifiers: defaultFundingFalsifiers() };
  }

  reasons.push('Insufficient evidence for a stronger funding classification.');
  return { state: 'CFQ2_DEPENDENT', confidence: 'LOW', reasons, falsifiers: defaultFundingFalsifiers() };
}

export function evaluateFinancedDemand(input: FinancedDemandInput): FinancedDemandOutput {
  const overlapping = input.links.filter((x) => new Set(x.roles).size >= 2);
  const reflexive = input.links.some((x) =>
    ['VENDOR_FINANCE', 'BUYER_FINANCE', 'GUARANTEE_BACKSTOP', 'RECIPROCAL_PROCUREMENT'].includes(x.mechanism)
  );

  const reasons: string[] = [];

  if (input.links.length === 0 && !input.relatedPartyRevenueMaterial) {
    reasons.push('No material financing or reciprocal-demand links identified.');
    return { state: 'FD0_ORGANIC', confidence: confidenceFromEvidence(input.evidence), reasons, falsifiers: defaultDemandFalsifiers() };
  }

  if (reflexive && overlapping.length > 0 && input.backlogQuality === 'LOW') {
    reasons.push('Demand is materially linked to financing/reciprocal counterparties and backlog quality is weak.');
    return { state: 'FD3_REFLEXIVE', confidence: confidenceFromEvidence(input.evidence), reasons, falsifiers: defaultDemandFalsifiers() };
  }

  if (overlapping.length > 0) {
    reasons.push('At least one counterparty occupies multiple economic roles (investor/supplier/distributor/customer/financier).');
    return { state: 'FD2_INTERDEPENDENT', confidence: confidenceFromEvidence(input.evidence), reasons, falsifiers: defaultDemandFalsifiers() };
  }

  reasons.push('Demand receives ecosystem support, while independent usage/cash evidence remains material.');
  return { state: 'FD1_SUPPORTED', confidence: confidenceFromEvidence(input.evidence), reasons, falsifiers: defaultDemandFalsifiers() };
}

function confidenceFromEvidence(evidence: EvidenceState): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (evidence === 'CONFIRMED') return 'HIGH';
  if (evidence === 'PARTIAL') return 'MEDIUM';
  return 'LOW';
}

function defaultFundingFalsifiers(): string[] {
  return [
    'Funding cost rises while payback deteriorates.',
    'Refinancing or guarantee dependence becomes necessary to sustain existing capacity.',
    'Dilution or asset sales become the primary funding source for ongoing operations.',
    'Counterparty withdrawal forces material CAPEX or capacity cuts.'
  ];
}

function defaultDemandFalsifiers(): string[] {
  return [
    'Usage/renewals fall after financial support or incentives expire.',
    'Backlog fails to convert into revenue and cash collection.',
    'Strategic counterparties reduce financing and orders simultaneously.',
    'Related-party or reciprocal transactions become a material share of reported growth.'
  ];
}
