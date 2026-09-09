import {
  evaluateReverseScreenerDiscovery,
  rankReverseScreenerDiscovery,
} from './reverse-screener-discovery-omega';

describe('REVERSE SCREENER DISCOVERY Ω', () => {
  const base = {
    ticker: 'TEST',
    marketCapUsdBn: 10,
    revenueGrowthPct: 18,
    epsGrowthPct: 22,
    ebitdaGrowthPct: 20,
    fcfGrowthPct: 19,
    forwardEpsRevisionPct: 3,
    fcfPositive: true,
    netDebtToEbitda: 1,
    operatingMarginPct: 20,
    roicPct: 15,
    forwardPe: 22,
    evToEbitda: 14,
    fcfYieldPct: 4.5,
    priceAboveMa200: true,
    return3mPct: 8,
    return6mPct: 16,
    evidenceTraceable: true,
    evidenceIds: ['E1', 'E2'],
  } as const;

  it('passes a traceable quality-growth-momentum candidate', () => {
    const result = evaluateReverseScreenerDiscovery(base);
    expect(result.passed).toBe(true);
    expect(result.capitalDecisionAuthority).toBe('NONE');
  });

  it('requires at least two acceleration signals', () => {
    const result = evaluateReverseScreenerDiscovery({
      ...base,
      revenueGrowthPct: 11,
      epsGrowthPct: 5,
      ebitdaGrowthPct: 5,
      fcfGrowthPct: 5,
      forwardEpsRevisionPct: 0,
    });
    expect(result.gates.acceleration).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('flags cyclical peak earnings for normalization', () => {
    const result = evaluateReverseScreenerDiscovery({
      ...base,
      regime: 'CYCLICAL',
      commoditySensitive: true,
      earningsVsFiveYearNormPct: 80,
    });
    expect(result.cycleNormalizationRequired).toBe(true);
    expect(result.warnings).toContain('CYCLE_NORMALIZATION_REQUIRED');
  });

  it('does not allow momentum to repair failed quality', () => {
    const result = evaluateReverseScreenerDiscovery({
      ...base,
      fcfPositive: false,
      return3mPct: 50,
      return6mPct: 100,
    });
    expect(result.gates.momentum).toBe(true);
    expect(result.gates.quality).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('ranks only passing names by score descending', () => {
    const ranked = rankReverseScreenerDiscovery([
      { ...base, ticker: 'A' },
      { ...base, ticker: 'B', guidanceRaised: true, revenueAccelerating: true },
      { ...base, ticker: 'FAIL', priceAboveMa200: false },
    ]);
    expect(ranked.map((x) => x.ticker)).toEqual(['B', 'A']);
  });
});
