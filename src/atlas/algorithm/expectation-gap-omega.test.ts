import {
  evaluateExpectationGap,
  presentValueFromGrowth,
  solveImpliedGrowthPct,
} from './expectation-gap-omega';

describe('Expectation Gap Ω', () => {
  it('recovers a known implied growth rate from a constructed reverse DCF', () => {
    const target = presentValueFromGrowth(100, 8, 10, 3, 10);
    expect(target).not.toBeNull();
    const implied = solveImpliedGrowthPct(target as number, 100, 10, 3, 10);
    expect(implied).toBe(8);
  });

  it('rejects EV/FCFF paired with cost of equity', () => {
    const result = evaluateExpectationGap({
      evidenceTraceable: true,
      evidenceIds: ['10-k', 'market-data'],
      valuationBasis: 'EV_FCFF',
      discountRateKind: 'COST_OF_EQUITY',
      equityOrEnterpriseValue: 1000,
      startingCashFlow: 50,
      discountRatePct: 9,
      terminalGrowthPct: 2.5,
      horizonYears: 10,
      reasonableGrowthPct: 8,
      reasonableGrowthSource: 'ANALYST_BASE_CASE',
      normalizationMethod: 'REPORTED_FCF',
      capitalIntensity: 'LOW',
    });
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.directAtlasScoreDelta).toBe(0);
  });

  it('rejects market-cap/FCFE paired with WACC', () => {
    const result = evaluateExpectationGap({
      evidenceTraceable: true,
      evidenceIds: ['10-k', 'market-data'],
      valuationBasis: 'MARKET_CAP_FCFE',
      discountRateKind: 'WACC',
      equityOrEnterpriseValue: 1000,
      startingCashFlow: 50,
      discountRatePct: 9,
      terminalGrowthPct: 2.5,
      horizonYears: 10,
      reasonableGrowthPct: 8,
      reasonableGrowthSource: 'ANALYST_BASE_CASE',
      normalizationMethod: 'REPORTED_FCF',
      capitalIntensity: 'LOW',
    });
    expect(result.state).toBe('EVIDENCE_PENDING');
  });

  it('keeps D&A maintenance-capex proxy low confidence for capital-intensive firms', () => {
    const target = presentValueFromGrowth(100, 7, 10, 3, 10) as number;
    const result = evaluateExpectationGap({
      evidenceTraceable: true,
      evidenceIds: ['20-f', 'market-data'],
      valuationBasis: 'EV_FCFF',
      discountRateKind: 'WACC',
      equityOrEnterpriseValue: target,
      startingCashFlow: 100,
      discountRatePct: 10,
      terminalGrowthPct: 3,
      horizonYears: 10,
      reasonableGrowthPct: 10,
      reasonableGrowthSource: 'MANAGEMENT_ANALYST_BRIDGE',
      normalizationMethod: 'D_AND_A_PROXY',
      capitalIntensity: 'HIGH',
    });
    expect(result.impliedGrowthPct).toBe(7);
    expect(result.expectationGapPct).toBe(3);
    expect(result.confidence).toBe('LOW');
    expect(result.directAtlasScoreDelta).toBe(0);
  });

  it('does not allow historical CAGR alone to become a high-confidence forward assumption', () => {
    const target = presentValueFromGrowth(100, 5, 9, 2.5, 10) as number;
    const result = evaluateExpectationGap({
      evidenceTraceable: true,
      evidenceIds: ['10-k', 'market-data'],
      valuationBasis: 'MARKET_CAP_FCFE',
      discountRateKind: 'COST_OF_EQUITY',
      equityOrEnterpriseValue: target,
      startingCashFlow: 100,
      discountRatePct: 9,
      terminalGrowthPct: 2.5,
      horizonYears: 10,
      reasonableGrowthPct: 12,
      reasonableGrowthSource: 'HISTORICAL_ONLY',
      normalizationMethod: 'REPORTED_FCF',
      capitalIntensity: 'LOW',
    });
    expect(result.expectationGapPct).toBe(7);
    expect(result.confidence).toBe('LOW');
    expect(result.directAtlasScoreDelta).toBe(0);
  });
});
