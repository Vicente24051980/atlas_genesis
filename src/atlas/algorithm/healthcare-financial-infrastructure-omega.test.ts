import { describe, expect, it } from 'vitest';
import { evaluateHealthcareFinancialInfrastructure } from './healthcare-financial-infrastructure-omega';

const base = {
  ticker: 'WAY', workflowControl: true, recurringOrVolumeRevenue: true,
  positiveFreeCashFlow: true, aiEconomicCaptureVerified: true,
  moatPersistence: true, falsifier: false, sourceState: 'FACT' as const,
};

describe('Healthcare Financial Infrastructure Ω', () => {
  it('passes verified economic proof without mixing GREEN or return ranking', () => {
    const r = evaluateHealthcareFinancialInfrastructure(base);
    expect(r.economicProofPassed).toBe(true);
    expect(r.aiCapturePassed).toBe(true);
    expect(r.eligibleForExpectedReturnAudit).toBe(true);
  });

  it('does not promote newsletter hypotheses', () => {
    const r = evaluateHealthcareFinancialInfrastructure({...base, sourceState: 'HYPOTHESIS' as const});
    expect(r.economicProofPassed).toBe(false);
  });

  it('keeps AI capture orthogonal to core economic proof', () => {
    const r = evaluateHealthcareFinancialInfrastructure({...base, aiEconomicCaptureVerified: false});
    expect(r.economicProofPassed).toBe(true);
    expect(r.aiCapturePassed).toBe(false);
  });

  it('honors Falsifiers Ω absolute veto', () => {
    const r = evaluateHealthcareFinancialInfrastructure({...base, falsifier: true});
    expect(r.economicProofPassed).toBe(false);
    expect(r.eligibleForExpectedReturnAudit).toBe(false);
  });
});
