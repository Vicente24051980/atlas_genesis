import { evaluateCapitalScarcityLongEnd } from './capital-scarcity-long-end-yield-omega';

describe('Capital Scarcity / Long-End Yield Omega', () => {
  it('classifies fiscal/private crowding when public funding pressure and private CAPEX demand rise together', () => {
    const out = evaluateCapitalScarcityLongEnd({
      ust10yPct: 4.75,
      ust30yPct: 5.33,
      longYieldTrend: 'RISING',
      termPremiumTrend: 'RISING',
      sovereignFundingPressure: 'HIGH',
      privateCapexDemand: 'HIGH',
      creditSpreadTrend: 'STABLE',
      liquidityState: 'TIGHT',
      inflationImpulse: 'RISING',
      companyRefinancingDependency: 'MEDIUM',
      equityDuration: 'LONG',
      presentCashEconomics: 'STRONG',
      evidence: 'CONFIRMED',
    });

    expect(out.state).toBe('CS4_FISCAL_PRIVATE_CROWDING');
    expect(out.valuationHurdleAction).toBe('RAISE_HURDLE_MATERIALLY');
    expect(out.routes).toContain('VALUATION_IMPLIED_RETURN');
    expect(out.routes).toContain('CAPITAL_FUNDING_QUALITY');
  });

  it('does not confuse strong present fundamentals with immunity from discount-rate pressure', () => {
    const out = evaluateCapitalScarcityLongEnd({
      longYieldTrend: 'RISING',
      termPremiumTrend: 'STABLE',
      sovereignFundingPressure: 'MEDIUM',
      privateCapexDemand: 'MEDIUM',
      creditSpreadTrend: 'STABLE',
      liquidityState: 'NORMAL',
      companyRefinancingDependency: 'LOW',
      equityDuration: 'LONG',
      presentCashEconomics: 'STRONG',
      evidence: 'CONFIRMED',
    });

    expect(out.state).toBe('CS2_TIGHTENING');
    expect(out.valuationHurdleAction).toBe('RAISE_HURDLE');
    expect(out.reasons.some((x) => x.includes('multiple-compression'))).toBe(true);
  });

  it('allows an abundant-capital state only when long-end conditions ease with low funding pressure', () => {
    const out = evaluateCapitalScarcityLongEnd({
      longYieldTrend: 'FALLING',
      termPremiumTrend: 'FALLING',
      sovereignFundingPressure: 'LOW',
      privateCapexDemand: 'MEDIUM',
      creditSpreadTrend: 'TIGHTENING',
      liquidityState: 'EASY',
      companyRefinancingDependency: 'LOW',
      equityDuration: 'MEDIUM',
      presentCashEconomics: 'STRONG',
      evidence: 'CONFIRMED',
    });

    expect(out.state).toBe('CS0_ABUNDANT_CAPITAL');
    expect(out.valuationHurdleAction).toBe('LOWER_HURDLE_WITH_CAUTION');
  });
});
