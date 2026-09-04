import {
  evaluateCapexAsymmetry,
  scoreCapexElasticity,
  scoreMarketCapSaturation,
  scoreMultipleExpansionDebt,
  type CapexAsymmetryInput,
} from './capex-asymmetry-omega';

const baseCase: CapexAsymmetryInput = {
  ticker: 'P0_CASE',
  evidenceTraceable: true,
  evidenceIds: ['orders', 'revenue', 'fcf'],
  capexCaptureScore: 90,
  remainingCapexScore: 88,
  revenueElasticity: 0.8,
  grossProfitElasticity: 1.0,
  fcfElasticity: 1.2,
  priceCagr3yPct: 35,
  benchmarkPriceCagr3yPct: 18,
  fundamentalCagr3yPct: 40,
  startValuationMultiple: 22,
  currentValuationMultiple: 24,
};

describe('CAPEX Asymmetry / P0 Adjusted Omega v1', () => {
  it('rewards high structural capture when fundamentals keep pace with price', () => {
    const result = evaluateCapexAsymmetry(baseCase);
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(result.fundamentalSupportScore).toBe(100);
    expect(result.expectationsDebtScore).toBeLessThan(25);
    expect(result.p0AdjustedScore).toBeGreaterThanOrEqual(80);
    expect(['P0_ELITE', 'P0_STRONG']).toContain(result.state);
  });

  it('does not punish raw run-up by itself when per-share fundamentals outrun the stock', () => {
    const result = evaluateCapexAsymmetry({
      ...baseCase,
      priceCagr3yPct: 70,
      benchmarkPriceCagr3yPct: 15,
      fundamentalCagr3yPct: 80,
      startValuationMultiple: 30,
      currentValuationMultiple: 30,
    });
    expect(result.runUpDebtScore).toBe(100);
    expect(result.fundamentalSupportScore).toBe(100);
    expect(result.multipleExpansionDebtScore).toBe(0);
    expect(result.expectationsDebtScore).toBe(0);
  });

  it('penalizes price growth that materially outruns fundamentals and multiple expansion', () => {
    const result = evaluateCapexAsymmetry({
      ...baseCase,
      priceCagr3yPct: 75,
      fundamentalCagr3yPct: 20,
      startValuationMultiple: 20,
      currentValuationMultiple: 40,
    });
    expect(result.fundamentalSupportScore).toBe(0);
    expect(result.multipleExpansionDebtScore).toBe(100);
    expect(result.expectationsDebtScore).toBe(100);
    expect(result.valuationOpportunityScore).toBe(0);
  });

  it('weights FCF elasticity more heavily than revenue elasticity', () => {
    const weakFcf = scoreCapexElasticity({ revenueElasticity: 1.2, grossProfitElasticity: 1.0, fcfElasticity: 0.1 });
    const strongFcf = scoreCapexElasticity({ revenueElasticity: 0.6, grossProfitElasticity: 0.8, fcfElasticity: 1.2 });
    expect(strongFcf).toBeGreaterThan(weakFcf);
  });

  it('scores one valuation-multiple doubling as maximum multiple debt', () => {
    expect(scoreMultipleExpansionDebt(20, 40)).toBe(100);
    expect(scoreMultipleExpansionDebt(40, 30)).toBe(0);
  });

  it('does not invent market-cap saturation when no mature value is supplied', () => {
    expect(scoreMarketCapSaturation()).toBeNull();
    const result = evaluateCapexAsymmetry(baseCase);
    expect(result.saturationPenaltyScore).toBeNull();
  });

  it('applies saturation only when a defensible mature equity value is explicitly supplied', () => {
    expect(scoreMarketCapSaturation(50, 100)).toBeGreaterThan(40);
    expect(scoreMarketCapSaturation(5, 100)).toBe(0);
  });

  it('blocks confirmed ranking when evidence is not traceable enough', () => {
    const result = evaluateCapexAsymmetry({ ...baseCase, evidenceIds: ['single-source'] });
    expect(result.evidenceGate).toBe('PROVISIONAL');
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.action).toBe('EVIDENCE_REQUIRED');
  });
});
