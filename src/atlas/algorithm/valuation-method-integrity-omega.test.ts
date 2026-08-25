import {
  evaluateValuationMethodIntegrity,
  type ValuationMethodIntegrityInput,
} from './valuation-method-integrity-omega';

const base: ValuationMethodIntegrityInput = {
  ticker: 'BASE',
  archetype: 'GENERIC_OPERATING',
  priceIntegrityPass: true,
  meaningfulRevenue: true,
  atlasFairValueGapPct: 15,
};

describe('Valuation Method Integrity Omega', () => {
  it('fails closed when price/listing/currency/unit integrity is not verified', () => {
    const result = evaluateValuationMethodIntegrity({ ...base, priceIntegrityPass: false });
    expect(result.status).toBe('FAIL_PRICE_INTEGRITY');
    expect(result.expectedReturnEligible).toBe(false);
    expect(result.externalCrossCheck.directScoreWeight).toBe(0);
  });

  it('uses bank-specific methods and forbids generic DCF/FCF yield', () => {
    const result = evaluateValuationMethodIntegrity({ ...base, ticker: 'BANK', archetype: 'BANK' });
    expect(result.allowedPrimaryMethods).toContain('P_TBV');
    expect(result.allowedPrimaryMethods).toContain('ROTCE_VS_COST_OF_EQUITY');
    expect(result.forbiddenMethods).toContain('GENERIC_DCF');
    expect(result.forbiddenMethods).toContain('GENERIC_FCF_YIELD');
  });

  it('keeps external fair value at zero direct score weight', () => {
    const result = evaluateValuationMethodIntegrity({
      ...base,
      externalValuations: [
        { source: 'vendor', asOf: '2026-08-21', fairValueGapPct: 35.9, uncertainty: 'MEDIUM' },
      ],
    });
    expect(result.externalCrossCheck.directScoreWeight).toBe(0);
    expect(result.externalCrossCheck.meanExternalGapPct).toBeCloseTo(35.9);
  });

  it('raises audit priority when ATLAS and external valuation materially disagree', () => {
    const result = evaluateValuationMethodIntegrity({
      ...base,
      atlasFairValueGapPct: -10,
      externalValuations: [
        { source: 'vendor', asOf: '2026-08-21', fairValueGapPct: 20, uncertainty: 'LOW' },
      ],
    });
    expect(result.externalCrossCheck.relation).toBe('MATERIAL_DIVERGENCE');
    expect(result.externalCrossCheck.auditPriority).toBe('HIGH');
  });

  it('disables intrinsic valuation for pre-proof companies', () => {
    const result = evaluateValuationMethodIntegrity({
      ...base,
      ticker: 'PRE',
      meaningfulRevenue: false,
      recurringOperatingLosses: true,
    });
    expect(result.status).toBe('PRE_PROOF_ONLY');
    expect(result.expectedReturnEligible).toBe(false);
    expect(result.allowedPrimaryMethods).toEqual(['OPTIONALITY_SCENARIO_ONLY']);
    expect(result.forbiddenMethods).toContain('INTRINSIC_VALUE_SCORE');
  });

  it('forces normalization for material one-offs and pathological ROIC', () => {
    const result = evaluateValuationMethodIntegrity({
      ...base,
      oneOffShareOfPretaxIncomePct: 25,
      reportedRoicPct: 250,
      investedCapitalPositive: true,
    });
    expect(result.status).toBe('PASS_WITH_NORMALIZATION');
    expect(result.normalizationFlags).toContain('MATERIAL_ONE_OFF_EARNINGS_NORMALIZATION_REQUIRED');
    expect(result.normalizationFlags).toContain('ROIC_NON_COMPARABLE');
  });

  it('detects a capital-intensity regime shift at 1.5x the three-year median', () => {
    const result = evaluateValuationMethodIntegrity({
      ...base,
      capexToRevenuePct: 30,
      capexToRevenueThreeYearMedianPct: 20,
    });
    expect(result.status).toBe('PASS_WITH_NORMALIZATION');
    expect(result.normalizationFlags).toContain('CASH_CONVERSION_REGIME_SHIFT');
  });
});
