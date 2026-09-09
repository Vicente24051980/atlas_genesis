import {
  evaluateReverseScreenerDiscovery,
  rankReverseScreenerDiscovery,
} from './reverse-screener-discovery-omega';

describe('REVERSE SCREENER DISCOVERY Ω v1.1', () => {
  const base = {
    ticker: 'TEST', usListed: true, marketCapUsdBn: 10,
    revenueGrowthPct: 18, epsGrowthPct: 22, ebitdaGrowthPct: 20,
    fcfGrowthPct: 19, forwardEpsRevisionPct: 3,
    fcfPositive: true, netDebtToEbitda: 1.2, netDebtToEbitdaSectorPercentile: 25,
    operatingMarginSectorPercentile: 70,
    roicPct: 18, estimatedWaccPct: 9, roicTwoYearsAgoPct: 12, roicOneYearAgoPct: 15,
    forwardPeSectorPercentile: 35, evToEbitdaSectorPercentile: 40, fcfYieldPct: 5,
    priceAboveMa200: true, rsVsSector3mPp: 6, rsVsSector6mPp: 4,
    dseZRecent20: 0.5,
    evidenceTraceable: true, evidenceIds: ['E1', 'E2'],
  } as const;

  it('passes a traceable candidate satisfying all v1.1 gates', () => {
    const result = evaluateReverseScreenerDiscovery(base);
    expect(result.passed).toBe(true);
    expect(result.capitalDecisionAuthority).toBe('NONE');
  });

  it('does not pass acceleration with Tier A alone', () => {
    const result = evaluateReverseScreenerDiscovery({
      ...base, fcfGrowthPct: 0, forwardEpsRevisionPct: 0,
    });
    expect(result.gates.acceleration).toBe(false);
  });

  it('does not pass acceleration with Tier B alone', () => {
    const result = evaluateReverseScreenerDiscovery({
      ...base, revenueGrowthPct: 0, epsGrowthPct: 0, ebitdaGrowthPct: 0,
      fcfGrowthPct: 20, forwardEpsRevisionPct: 2,
    });
    expect(result.gates.acceleration).toBe(false);
  });

  it('requires two of three valuation conditions', () => {
    const oneHit = evaluateReverseScreenerDiscovery({
      ...base, forwardPeSectorPercentile: 70, evToEbitdaSectorPercentile: 70, fcfYieldPct: 5,
    });
    expect(oneHit.gates.valuation).toBe(false);

    const twoHits = evaluateReverseScreenerDiscovery({
      ...base, forwardPeSectorPercentile: 35, evToEbitdaSectorPercentile: 70, fcfYieldPct: 5,
    });
    expect(twoHits.gates.valuation).toBe(true);
  });

  it('rejects negative relative strength despite price above MA200', () => {
    const result = evaluateReverseScreenerDiscovery({
      ...base, priceAboveMa200: true, rsVsSector3mPp: -1,
    });
    expect(result.gates.momentum).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('treats Net Debt/EBITDA >4x as a veto', () => {
    const result = evaluateReverseScreenerDiscovery({ ...base, netDebtToEbitda: 4.1 });
    expect(result.gates.leverageVeto).toBe(true);
    expect(result.gates.quality).toBe(false);
    expect(result.passed).toBe(false);
  });

  it('activates DSE review at Z >= 2.0 without granting capital authority', () => {
    const result = evaluateReverseScreenerDiscovery({ ...base, dseZRecent20: 2.2 });
    expect(result.dseActive).toBe(true);
    expect(result.warnings).toContain('DSE_DECOUPLING_ACTIVE_P3_P5_REVIEW');
    expect(result.capitalDecisionAuthority).toBe('NONE');
  });

  it('applies operational penalties deterministically', () => {
    const clean = evaluateReverseScreenerDiscovery(base);
    const penalized = evaluateReverseScreenerDiscovery({
      ...base, customerConcentrationPct: 35, gaapNonGaapGapPct: 30, regulatoryRevenuePct: 60,
    });
    expect(penalized.score).toBeLessThan(clean.score);
    expect(penalized.warnings).toContain('CUSTOMER_CONCENTRATION_GT_30');
    expect(penalized.warnings).toContain('GAAP_NON_GAAP_GAP_GT_25');
    expect(penalized.warnings).toContain('REGULATORY_REVENUE_GT_50');
  });

  it('ranks only passing names by score descending', () => {
    const ranked = rankReverseScreenerDiscovery([
      { ...base, ticker: 'A' },
      { ...base, ticker: 'B', dseZRecent20: 2.5 },
      { ...base, ticker: 'FAIL', rsVsSector3mPp: -2 },
    ]);
    expect(ranked.map((x) => x.ticker)).toEqual(['B', 'A']);
  });
});
