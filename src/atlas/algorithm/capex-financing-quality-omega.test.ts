import { evaluateCapexFinancingQuality } from './capex-financing-quality-omega';

const resilient = {
  ticker: 'TEST',
  evidenceTraceable: true,
  evidenceIds: ['10-K', 'earnings', 'debt-schedule'],
  internalFundingShare: 0.70,
  debtFundingShare: 0.25,
  equityFundingShare: 0.05,
  incrementalCapex: 100,
  incrementalFcf: 35,
  marginalCostOfCapitalPct: 6,
  projectIrrPct: 14,
  netDebtToEbitda: 0.8,
  interestCoverage: 10,
  debtMaturityYears: 12,
  assetLifeYears: 20,
  counterpartyQualityScore: 92,
  timeToCashYears: 1,
} as const;

describe('CAPEX Financing Quality Omega v1', () => {
  it('rewards self-funded CAPEX that survives the mandatory long-rate shock', () => {
    const result = evaluateCapexFinancingQuality(resilient);
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(result.hardGatePass).toBe(true);
    expect(result.financingQualityScore).toBeGreaterThanOrEqual(85);
    expect(result.state).toBe('ELITE_SELF_FUNDED');
  });

  it('hard-fails a debt-heavy project whose IRR does not clear stressed capital cost', () => {
    const result = evaluateCapexFinancingQuality({
      ...resilient,
      internalFundingShare: 0.10,
      debtFundingShare: 0.80,
      equityFundingShare: 0.10,
      incrementalFcf: 18,
      marginalCostOfCapitalPct: 8.5,
      projectIrrPct: 9.5,
      netDebtToEbitda: 4.7,
      interestCoverage: 1.7,
      debtMaturityYears: 3,
      assetLifeYears: 25,
      counterpartyQualityScore: 55,
      timeToCashYears: 6,
    });
    expect(result.stressedCostOfCapitalPct).toBe(10.3);
    expect(result.hardGatePass).toBe(false);
    expect(result.state).toBe('HARD_FAIL');
    expect(result.reasons).toContain('Project IRR does not clear the stressed marginal cost of capital.');
  });

  it('does not allow strong AI demand or counterparty quality to bypass leverage hard gates', () => {
    const result = evaluateCapexFinancingQuality({
      ...resilient,
      internalFundingShare: 0.20,
      debtFundingShare: 0.75,
      equityFundingShare: 0.05,
      netDebtToEbitda: 5.2,
      interestCoverage: 9,
      counterpartyQualityScore: 100,
      projectIrrPct: 30,
    });
    expect(result.hardGatePass).toBe(false);
    expect(result.state).toBe('HARD_FAIL');
  });

  it('blocks ranking when financing evidence is not sufficiently traceable', () => {
    const result = evaluateCapexFinancingQuality({
      ...resilient,
      evidenceIds: ['management-slide'],
    });
    expect(result.evidenceGate).toBe('PROVISIONAL');
    expect(result.hardGatePass).toBe(false);
    expect(result.state).toBe('EVIDENCE_PENDING');
  });

  it('is size-blind: market capitalization is not part of the input or score', () => {
    const a = evaluateCapexFinancingQuality({ ...resilient, ticker: 'SMALL' });
    const b = evaluateCapexFinancingQuality({ ...resilient, ticker: 'MEGA' });
    expect(a.financingQualityScore).toBe(b.financingQualityScore);
    expect(a.hardGatePass).toBe(b.hardGatePass);
  });

  it('validates that the funding mix sums to one', () => {
    expect(() => evaluateCapexFinancingQuality({
      ...resilient,
      internalFundingShare: 0.7,
      debtFundingShare: 0.7,
      equityFundingShare: 0.1,
    })).toThrow('funding_mix_must_sum_to_one');
  });
});
