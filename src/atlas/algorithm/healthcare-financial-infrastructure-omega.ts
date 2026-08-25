export type EvidenceState = 'FACT' | 'HYPOTHESIS' | 'INTERPRETATION' | 'NOISE';

export interface HealthcareFinancialInfrastructureEvidence {
  ticker: string;
  workflowControl: boolean;
  recurringOrVolumeRevenue: boolean;
  positiveFreeCashFlow: boolean;
  aiEconomicCaptureVerified: boolean;
  moatPersistence: boolean;
  falsifier: boolean;
  sourceState: EvidenceState;
}

export interface HealthcareFinancialInfrastructureResult {
  ticker: string;
  economicProofPassed: boolean;
  aiCapturePassed: boolean;
  eligibleForExpectedReturnAudit: boolean;
  reasons: string[];
}

/**
 * Healthcare Financial Infrastructure Ω
 *
 * Vertical specialist for claims -> payment -> financial workflow control.
 * GREEN Continuity is intentionally absent: price/market evidence belongs to
 * GREEN modules and MUST NOT be inferred from business fundamentals.
 * Expected Return is intentionally absent: this module is a survival/economic
 * proof gate and MUST NOT add quality points to a pure return ranking.
 */
export function evaluateHealthcareFinancialInfrastructure(
  e: HealthcareFinancialInfrastructureEvidence,
): HealthcareFinancialInfrastructureResult {
  const reasons: string[] = [];

  if (e.sourceState !== 'FACT') reasons.push('Non-FACT evidence cannot promote a candidate');
  if (!e.workflowControl) reasons.push('No verified control of claims/payment workflow');
  if (!e.recurringOrVolumeRevenue) reasons.push('No verified recurring or volume-linked monetization');
  if (!e.positiveFreeCashFlow) reasons.push('Free-cash-flow gate failed');
  if (!e.moatPersistence) reasons.push('Persistence/moat gate failed');
  if (!e.aiEconomicCaptureVerified) reasons.push('AI economic capture remains unverified');
  if (e.falsifier) reasons.push('Falsifiers Ω veto');

  const economicProofPassed =
    e.sourceState === 'FACT' &&
    e.workflowControl &&
    e.recurringOrVolumeRevenue &&
    e.positiveFreeCashFlow &&
    e.moatPersistence &&
    !e.falsifier;

  const aiCapturePassed = economicProofPassed && e.aiEconomicCaptureVerified;

  return {
    ticker: e.ticker,
    economicProofPassed,
    aiCapturePassed,
    eligibleForExpectedReturnAudit: economicProofPassed && !e.falsifier,
    reasons,
  };
}
