export type NeocloudProofStage =
  | 'N0_CONTRACTED'
  | 'N1_CAPACITY_SECURED'
  | 'N2_HARDWARE_READY'
  | 'N3_DEPLOYED'
  | 'N4_CUSTOMER_ACCEPTED'
  | 'N5_REVENUE_RECOGNIZED'
  | 'N6_MARGIN_PROVEN'
  | 'N7_CASH_RETURN_PROVEN'
  | 'NX_EXECUTION_REVIEW';

export type AcceptanceStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'DISPUTED'
  | 'NOT_EVIDENCED';

export type AcceptanceGateOutcome = 'PASS' | 'PENDING' | 'NOT_EVIDENCED' | 'FAIL';

export type NeocloudEconomicProofCeiling =
  | 'E0_NARRATIVE'
  | 'E1_MANAGEMENT_CLAIM'
  | 'E2_ORDERS_CONTRACTS'
  | 'E3_REVENUE_MARGIN'
  | 'E4_FCF_ROIC_MULTI_PERIOD';

export type NeocloudCustomerAcceptanceInput = {
  ticker: string;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  contracted: boolean;
  capacitySecured: boolean;
  hardwareReady: boolean;
  deployed: boolean;
  acceptanceStatus: AcceptanceStatus;
  slaPassed: boolean | null;
  escrowReleased: boolean | null;
  revenueRecognizedFromAcceptedDeployment: boolean;
  marginProvenOnAcceptedDeployment: boolean;
  multiPeriodCashReturnProven: boolean;
  materialAcceptanceDelay: boolean;
  contractRenegotiatedOrCancelled: boolean;
};

export type NeocloudCustomerAcceptanceResult = {
  ticker: string;
  stage: NeocloudProofStage;
  acceptanceGate: AcceptanceGateOutcome;
  economicProofCeiling: NeocloudEconomicProofCeiling;
  canPromoteToE3: boolean;
  canPromoteToE4: boolean;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  reasons: string[];
  falsifiers: string[];
};

function validateSequence(input: NeocloudCustomerAcceptanceInput): void {
  if (input.capacitySecured && !input.contracted) throw new Error('neocloud_capacity_requires_contract');
  if (input.hardwareReady && !input.capacitySecured) throw new Error('neocloud_hardware_requires_capacity');
  if (input.deployed && !input.hardwareReady) throw new Error('neocloud_deployment_requires_hardware');

  const accepted = input.acceptanceStatus === 'ACCEPTED';
  if (accepted && !input.deployed) throw new Error('neocloud_acceptance_requires_deployment');
  if (input.revenueRecognizedFromAcceptedDeployment && !accepted) {
    throw new Error('neocloud_revenue_requires_customer_acceptance');
  }
  if (input.marginProvenOnAcceptedDeployment && !input.revenueRecognizedFromAcceptedDeployment) {
    throw new Error('neocloud_margin_requires_recognized_revenue');
  }
  if (input.multiPeriodCashReturnProven && !input.marginProvenOnAcceptedDeployment) {
    throw new Error('neocloud_cash_return_requires_margin_proof');
  }
}

function acceptanceOutcome(input: NeocloudCustomerAcceptanceInput): AcceptanceGateOutcome {
  if (
    input.acceptanceStatus === 'REJECTED' ||
    input.acceptanceStatus === 'DISPUTED' ||
    input.materialAcceptanceDelay ||
    input.contractRenegotiatedOrCancelled ||
    input.slaPassed === false
  ) {
    return 'FAIL';
  }
  if (input.acceptanceStatus === 'ACCEPTED') return 'PASS';
  if (input.acceptanceStatus === 'NOT_EVIDENCED') return 'NOT_EVIDENCED';
  return 'PENDING';
}

function determineStage(
  input: NeocloudCustomerAcceptanceInput,
  gate: AcceptanceGateOutcome,
): NeocloudProofStage {
  if (gate === 'FAIL') return 'NX_EXECUTION_REVIEW';
  if (input.multiPeriodCashReturnProven) return 'N7_CASH_RETURN_PROVEN';
  if (input.marginProvenOnAcceptedDeployment) return 'N6_MARGIN_PROVEN';
  if (input.revenueRecognizedFromAcceptedDeployment) return 'N5_REVENUE_RECOGNIZED';
  if (gate === 'PASS') return 'N4_CUSTOMER_ACCEPTED';
  if (input.deployed) return 'N3_DEPLOYED';
  if (input.hardwareReady) return 'N2_HARDWARE_READY';
  if (input.capacitySecured) return 'N1_CAPACITY_SECURED';
  return 'N0_CONTRACTED';
}

function economicProofCeiling(
  input: NeocloudCustomerAcceptanceInput,
  stage: NeocloudProofStage,
): NeocloudEconomicProofCeiling {
  if (stage === 'NX_EXECUTION_REVIEW') return 'E2_ORDERS_CONTRACTS';
  if (stage === 'N7_CASH_RETURN_PROVEN') return 'E4_FCF_ROIC_MULTI_PERIOD';
  if (stage === 'N6_MARGIN_PROVEN') return 'E3_REVENUE_MARGIN';
  if (input.contracted) return 'E2_ORDERS_CONTRACTS';
  return input.evidenceTraceable ? 'E1_MANAGEMENT_CLAIM' : 'E0_NARRATIVE';
}

export function evaluateNeocloudCustomerAcceptanceGate(
  input: NeocloudCustomerAcceptanceInput,
): NeocloudCustomerAcceptanceResult {
  validateSequence(input);

  const gate = acceptanceOutcome(input);
  const stage = determineStage(input, gate);
  const proofCeiling = economicProofCeiling(input, stage);
  const canPromoteToE3 =
    gate === 'PASS' &&
    input.revenueRecognizedFromAcceptedDeployment &&
    input.marginProvenOnAcceptedDeployment;
  const canPromoteToE4 = canPromoteToE3 && input.multiPeriodCashReturnProven;

  const evidenceCountAdequate = input.evidenceIds.length >= 2;
  const evidenceGate: NeocloudCustomerAcceptanceResult['evidenceGate'] =
    input.evidenceTraceable && evidenceCountAdequate
      ? 'CONFIRMED'
      : input.evidenceTraceable
        ? 'PROVISIONAL'
        : 'BLOCKED';

  const reasons: string[] = [];
  const falsifiers = [
    'customer_rejects_or_disputes_deployment',
    'acceptance_or_sla_validation_is_materially_delayed',
    'accepted_capacity_is_below_contracted_capacity',
    'accepted_deployment_fails_to_convert_to_recognized_revenue',
    'recognized_revenue_fails_to_convert_to_margin',
    'contract_is_renegotiated_cancelled_or_minimum_commitment_weakens',
    'financing_or_dilution_rises_faster_than_economically_accepted_capacity',
    'hardware_obsolescence_shortens_payback_before_cash_recovery',
  ];

  if (stage === 'N3_DEPLOYED') {
    reasons.push('Physical deployment is execution evidence but remains E2 until customer acceptance is evidenced.');
  }
  if (stage === 'N4_CUSTOMER_ACCEPTED') {
    reasons.push('Customer acceptance strengthens execution proof but does not equal revenue recognition or margin proof.');
  }
  if (input.escrowReleased === true) {
    reasons.push('Escrow release corroborates acceptance/execution but cannot independently promote Economic Proof beyond E2.');
  }
  if (stage === 'N5_REVENUE_RECOGNIZED') {
    reasons.push('Revenue is recognized from the accepted deployment, but E3 remains blocked until credible margin is proven.');
  }
  if (canPromoteToE3) {
    reasons.push('Accepted deployment has converted into attributable recognized revenue and margin; E3 promotion is permitted.');
  }
  if (canPromoteToE4) {
    reasons.push('Multi-period cash return is proven after accepted revenue and margin; E4 promotion is permitted.');
  }
  if (gate === 'FAIL') {
    reasons.push('Acceptance/execution failure requires NX_EXECUTION_REVIEW and blocks monetization promotion.');
  }
  if (evidenceGate !== 'CONFIRMED') {
    reasons.push('Acceptance stage is provisional until at least two traceable evidence records are present.');
  }

  return {
    ticker: input.ticker,
    stage,
    acceptanceGate: gate,
    economicProofCeiling: proofCeiling,
    canPromoteToE3,
    canPromoteToE4,
    evidenceGate,
    reasons,
    falsifiers,
  };
}

export const NEOCLOUD_CUSTOMER_ACCEPTANCE_GATE_OMEGA_V1 = {
  id: 'NEOCLOUD_CUSTOMER_ACCEPTANCE_GATE_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'separate contracted and deployed neocloud capacity from customer-accepted, revenue-producing and cash-returning economic proof',
  emitsAutomaticTrade: false,
  canonicalChain: [
    'CONTRACT',
    'CAPACITY_FINANCING',
    'HARDWARE_READY',
    'DEPLOYMENT_COMMISSIONING',
    'CUSTOMER_ACCEPTANCE',
    'REVENUE_RECOGNITION',
    'GROSS_MARGIN',
    'OCF_FCF',
    'ROIC',
  ] as const,
  rules: [
    'CONTRACT != DEPLOYMENT != CUSTOMER ACCEPTANCE != REVENUE != OWNER ECONOMICS.',
    'Deployment alone cannot promote a neocloud from E2 to E3 Economic Proof.',
    'Customer acceptance without realized revenue remains capped at E2.',
    'E3 requires accepted deployment plus attributable recognized revenue and credible margin.',
    'E4 requires multi-period cash conversion or ROIC after E3 has been established.',
    'Escrow release strengthens execution evidence but is not revenue recognition.',
    'Take-or-pay improves contracted-demand quality but bypasses none of the acceptance, revenue, margin or cash gates.',
    'Never emit an automatic BUY or SELL.',
  ] as const,
} as const;
