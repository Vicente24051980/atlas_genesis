export type FutureIpoLifecycle =
  | 'F0_PRIVATE_DISCOVERY'
  | 'F1_CONFIDENTIAL_FILING_REPORTED'
  | 'F2_PUBLIC_S1_AVAILABLE'
  | 'F3_PRICED'
  | 'F4_LISTED_PRICE_DISCOVERY'
  | 'F5_LOCKUP_SUPPLY_DISCOVERY'
  | 'F6_NORMALIZED_PUBLIC_COMPANY';

export type FutureIpoGateState =
  | 'IPO_READY_PASS'
  | 'IPO_READY_CONDITIONAL'
  | 'IPO_DATA_INCOMPLETE'
  | 'IPO_EXPECTATION_DENSE'
  | 'IPO_SUPPLY_DISTORTED'
  | 'IPO_NO_PASS';

export interface FutureIpoGateInput {
  company: string;
  lifecycle: FutureIpoLifecycle;
  auditedFinancialsAvailable: boolean;
  publicS1Available: boolean;
  revenueQualityKnown: boolean;
  grossMarginKnown: boolean;
  ocfKnown: boolean;
  fcfKnown: boolean;
  capexCommitmentsKnown: boolean;
  fundingRecourseKnown: boolean;
  governanceRightsKnown: boolean;
  relatedPartyTransactionsKnown: boolean;
  dilutionKnown: boolean;
  lockupSupplyKnown: boolean;
  valuationState: 'ATTRACTIVE' | 'FAIR' | 'RICH' | 'EXTREME' | 'UNKNOWN';
  cfqState?:
    | 'CFQ0_SELF_FUNDED'
    | 'CFQ1_AUGMENTED_ROBUST'
    | 'CFQ2_DEPENDENT'
    | 'CFQ3_FRAGILE'
    | 'CFQ4_REFLEXIVE_CASCADE';
  fdState?:
    | 'FD0_ORGANIC'
    | 'FD1_SUPPORTED'
    | 'FD2_INTERDEPENDENT'
    | 'FD3_REFLEXIVE'
    | 'FD4_SYNTHETIC_FRAGILITY';
  supplyDistortionEvidence?: boolean;
  materialGovernanceDefect?: boolean;
  materialEconomicDefect?: boolean;
}

export interface FutureIpoGateOutput {
  state: FutureIpoGateState;
  lifecycle: FutureIpoLifecycle;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  missingEvidence: string[];
  reasons: string[];
  allowedAction:
    | 'RESEARCH_ONLY'
    | 'WATCH'
    | 'WAIT_FOR_PUBLIC_FILING'
    | 'WAIT_FOR_PRICE_DISCOVERY'
    | 'WAIT_FOR_LOCKUP_DISCOVERY'
    | 'ELIGIBLE_FOR_ENTRY_TIMING_REVIEW'
    | 'NO_ENTRY';
}

/**
 * Decision-safe IPO gate. It intentionally avoids universal P/S, float, lock-up,
 * leverage, or CAPEX thresholds until calibrated with a public historical set.
 */
export function evaluateFutureIpoGate(input: FutureIpoGateInput): FutureIpoGateOutput {
  const missingEvidence = getMissingEvidence(input);
  const reasons: string[] = [];

  if (input.materialEconomicDefect || input.materialGovernanceDefect) {
    reasons.push('A material economic or governance defect is confirmed.');
    return output('IPO_NO_PASS', input, missingEvidence, reasons, 'NO_ENTRY');
  }

  if (input.lifecycle === 'F0_PRIVATE_DISCOVERY' || input.lifecycle === 'F1_CONFIDENTIAL_FILING_REPORTED') {
    reasons.push('Private/confidential evidence is insufficient for a full Principal Ω entry verdict.');
    return output('IPO_DATA_INCOMPLETE', input, missingEvidence, reasons, 'WAIT_FOR_PUBLIC_FILING');
  }

  if (!input.publicS1Available && !input.auditedFinancialsAvailable) {
    reasons.push('No public audited filing is available.');
    return output('IPO_DATA_INCOMPLETE', input, missingEvidence, reasons, 'WAIT_FOR_PUBLIC_FILING');
  }

  if (input.valuationState === 'EXTREME') {
    reasons.push('Public/private expectations require unusually aggressive future economics.');
    return output('IPO_EXPECTATION_DENSE', input, missingEvidence, reasons, 'WAIT_FOR_PRICE_DISCOVERY');
  }

  if (input.supplyDistortionEvidence) {
    reasons.push('Float, lock-up or staged supply may dominate early price discovery.');
    return output('IPO_SUPPLY_DISTORTED', input, missingEvidence, reasons, 'WAIT_FOR_LOCKUP_DISCOVERY');
  }

  if (input.cfqState === 'CFQ3_FRAGILE' || input.cfqState === 'CFQ4_REFLEXIVE_CASCADE') {
    reasons.push('Funding structure is too fragile for an unconditional IPO pass.');
    return output('IPO_READY_CONDITIONAL', input, missingEvidence, reasons, 'WATCH');
  }

  if (input.fdState === 'FD3_REFLEXIVE' || input.fdState === 'FD4_SYNTHETIC_FRAGILITY') {
    reasons.push('Demand has material reflexive/financed-demand risk.');
    return output('IPO_READY_CONDITIONAL', input, missingEvidence, reasons, 'WATCH');
  }

  if (missingEvidence.length > 0 || input.valuationState === 'RICH' || input.cfqState === 'CFQ2_DEPENDENT' || input.fdState === 'FD2_INTERDEPENDENT') {
    reasons.push('Business may pass, but evidence, valuation, funding or interdependence still requires a gate.');
    return output('IPO_READY_CONDITIONAL', input, missingEvidence, reasons, 'WATCH');
  }

  reasons.push('Public evidence is sufficiently complete and no material funding, demand, governance or supply defect is identified.');
  return output('IPO_READY_PASS', input, missingEvidence, reasons, 'ELIGIBLE_FOR_ENTRY_TIMING_REVIEW');
}

function getMissingEvidence(input: FutureIpoGateInput): string[] {
  const checks: Array<[boolean, string]> = [
    [input.auditedFinancialsAvailable, 'audited_financials'],
    [input.revenueQualityKnown, 'revenue_quality'],
    [input.grossMarginKnown, 'gross_margin'],
    [input.ocfKnown, 'ocf'],
    [input.fcfKnown, 'fcf'],
    [input.capexCommitmentsKnown, 'capex_commitments'],
    [input.fundingRecourseKnown, 'funding_recourse'],
    [input.governanceRightsKnown, 'governance_rights'],
    [input.relatedPartyTransactionsKnown, 'related_party_transactions'],
    [input.dilutionKnown, 'dilution'],
    [input.lockupSupplyKnown, 'lockup_supply']
  ];
  return checks.filter(([ok]) => !ok).map(([, name]) => name);
}

function output(
  state: FutureIpoGateState,
  input: FutureIpoGateInput,
  missingEvidence: string[],
  reasons: string[],
  allowedAction: FutureIpoGateOutput['allowedAction']
): FutureIpoGateOutput {
  const confidence: FutureIpoGateOutput['confidence'] =
    missingEvidence.length === 0 ? 'HIGH' : missingEvidence.length <= 3 ? 'MEDIUM' : 'LOW';
  return { state, lifecycle: input.lifecycle, confidence, missingEvidence, reasons, allowedAction };
}
