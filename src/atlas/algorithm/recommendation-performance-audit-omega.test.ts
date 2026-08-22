import {
  auditRecommendationPerformance,
  classifyLiveMarketValidation,
  createImmutableRecommendationSnapshot,
  evaluateRecalibrationGate,
  summarizeExpectedReturnCalibration,
  type RecommendationSnapshot,
} from './recommendation-performance-audit-omega';

const baseSnapshot: RecommendationSnapshot = {
  recommendationId: 'REC-001',
  ticker: 'TEST',
  company: 'Test Co',
  timestamp: '2026-08-22T20:00:00Z',
  p0: 100,
  listing: 'NASDAQ',
  currency: 'USD',
  marketCap: 10_000,
  enterpriseValue: 11_000,
  economicProof: '5/5',
  businessQuality: '4/5',
  expectedReturn: { bearPct: -20, basePct: 30, bullPct: 80, probabilities: [0.2, 0.6, 0.2], expectedCagrPct: 9 },
  horizonYears: 3,
  entryScore: 80,
  waveScore: 72,
  verdict: 'BUY',
  benchmark: 'SPY',
  alternativesConsidered: ['ALT1', 'ALT2'],
  alternativesDiscarded: ['ALT1'],
  thesis: ['FCF grows'],
  catalysts: ['Capacity ramp'],
  falsifiers: ['FCF contraction'],
  knownRisks: ['Macro'],
  evidenceAvailableAtT0: [{ id: 'filing-q2', availableAt: '2026-08-22T18:00:00Z' }],
};

describe('Recommendation Performance Audit Omega', () => {
  it('creates an immutable T0 snapshot and blocks hindsight evidence', () => {
    const frozen = createImmutableRecommendationSnapshot(baseSnapshot);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(() => createImmutableRecommendationSnapshot({
      ...baseSnapshot,
      recommendationId: 'REC-HINDSIGHT',
      evidenceAvailableAtT0: [{ id: 'future-news', availableAt: '2026-08-23T00:00:00Z' }],
    })).toThrow('ANTI_HINDSIGHT_VIOLATION');
  });

  it('calculates Recommendation Alpha and Selection Alpha separately', () => {
    const result = auditRecommendationPerformance(baseSnapshot, {
      window: '1M',
      price: 120,
      benchmarkReturnPct: 8,
      relevantDiscardedAlternativeReturnsPct: { ALT1: 25, ALT2: 10 },
      realizedAt: '2026-09-22T20:00:00Z',
    });
    expect(result.absoluteReturnPct).toBeCloseTo(20);
    expect(result.recommendationAlphaPct).toBeCloseTo(12);
    expect(result.bestRelevantDiscardedAlternative).toBe('ALT1');
    expect(result.selectionAlphaPct).toBeCloseTo(-5);
  });

  it('does not call a small sample calibrated', () => {
    const summary = summarizeExpectedReturnCalibration([
      { expectedReturnPct: 10, realizedReturnPct: 12, horizonYears: 1 },
      { expectedReturnPct: 15, realizedReturnPct: 8, horizonYears: 1 },
    ]);
    expect(summary.status).toBe('INSUFFICIENT_SAMPLE');
  });

  it('keeps MARKET VALIDATION separate from price direction', () => {
    expect(classifyLiveMarketValidation({
      priceReturnPct: -12,
      expectedReturnDeltaPct: 5,
      fundamentalsDelta: 'IMPROVING',
      revisionsDelta: 'IMPROVING',
      valuationDelta: 'CHEAPER',
      relativeStrengthDelta: 'DETERIORATING',
      flowDelta: 'UNVERIFIED',
      economicProofDelta: 'IMPROVING',
      falsifierConfirmed: false,
    })).toBe('STRENGTHENING');
  });

  it('returns FALSIFIED only from a confirmed material falsifier', () => {
    expect(classifyLiveMarketValidation({
      priceReturnPct: 25,
      expectedReturnDeltaPct: -10,
      fundamentalsDelta: 'FLAT',
      valuationDelta: 'RICHER',
      economicProofDelta: 'FLAT',
      falsifierConfirmed: true,
    })).toBe('FALSIFIED');
  });

  it('blocks recalibration from a handful of recent misses', () => {
    const gate = evaluateRecalibrationGate({
      sampleSize: 5,
      repeatedPatternCount: 3,
      meanAbsoluteErrorPct: 15,
      economicallyMaterial: true,
      statisticallySupportedWhenPossible: false,
      outOfSampleImprovementExpected: false,
      crossSectorConsistency: false,
      temporalStability: false,
    });
    expect(gate.allowed).toBe(false);
  });

  it('allows recalibration only when systematic evidence is broad and stable', () => {
    const gate = evaluateRecalibrationGate({
      sampleSize: 60,
      repeatedPatternCount: 18,
      meanAbsoluteErrorPct: 9,
      economicallyMaterial: true,
      statisticallySupportedWhenPossible: true,
      outOfSampleImprovementExpected: true,
      crossSectorConsistency: true,
      temporalStability: true,
    });
    expect(gate.allowed).toBe(true);
  });
});
