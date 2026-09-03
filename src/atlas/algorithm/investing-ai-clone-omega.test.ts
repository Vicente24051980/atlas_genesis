import {
  FACTOR_KEYS,
  atlasCloneComposite,
  auditInvestingAiClone,
  calculateCloneScore,
  calculateCoverage,
  calculateConfidence,
  confidenceBand,
  divergenceState,
  reliabilityState,
  type FactorAuditMap,
} from './investing-ai-clone-omega';

const factors = Object.fromEntries(
  FACTOR_KEYS.map((key) => [
    key,
    {
      score: 80,
      coveragePct: 100,
      dominantEvidence: key,
      evidenceAsOf: '2026-09-03T23:17:00+02:00',
    },
  ]),
) as FactorAuditMap;

describe('INVESTING AI CLONE Ω v1.3', () => {
  it('uses ten equal 10% factors and nothing else in Clone Score', () => {
    expect(calculateCloneScore(factors).score).toBe(80);
  });

  it('keeps Coverage out of Clone Score', () => {
    expect(calculateCoverage([
      { applicable: true, available: true, importance: 3 },
      { applicable: true, available: false, importance: 1 },
      { applicable: false, available: false, importance: 100 },
    ])).toBe(75);
    expect(calculateCloneScore(factors).score).toBe(80);
  });

  it('calculates current-analysis Confidence separately', () => {
    const score = calculateConfidence({
      freshness: 100,
      sourceQuality: 100,
      criticalMetricCompleteness: 100,
      crossSourceConsistency: 100,
      accountingComparability: 100,
      noObsolescingEvent: 100,
    });
    expect(score).toBe(100);
    expect(confidenceBand(score)).toBe('HIGH');
  });

  it('fails closed with NO SCORE when a critical variable is missing', () => {
    const result = auditInvestingAiClone({
      factors,
      coverageMetrics: [{ applicable: true, available: true, importance: 1 }],
      confidence: {
        freshness: 100,
        sourceQuality: 100,
        criticalMetricCompleteness: 50,
        crossSourceConsistency: 100,
        accountingComparability: 100,
        noObsolescingEvent: 100,
      },
      criticalVariableMissing: 'cash-flow statement required for this issuer',
    });
    expect(result.cloneScore).toBeNull();
    expect(result.noScoreReason).toContain('Critical variable missing');
  });

  it('publishes Reliability only after the fixed sample-size gate', () => {
    expect(reliabilityState(29)).toBe('INSUFFICIENT');
    expect(reliabilityState(30)).toBe('PROVISIONAL');
    expect(reliabilityState(99)).toBe('PROVISIONAL');
    expect(reliabilityState(100)).toBe('ESTABLISHED');
  });

  it('uses the canonical ATLAS–Clone divergence bands', () => {
    expect(divergenceState(9.99)).toBe('ALIGNED');
    expect(divergenceState(10)).toBe('MATERIAL');
    expect(divergenceState(20)).toBe('SEVERE');
  });

  it('keeps Reliability outside the nominal 60/40 composite', () => {
    expect(atlasCloneComposite(90, 80)).toBe(86);
  });

  it('keeps F9 semantically oriented so higher means a better risk profile', () => {
    const altered: FactorAuditMap = {
      ...factors,
      F9_MARKET_RISK: { ...factors.F9_MARKET_RISK, score: 100 },
    };
    expect(calculateCloneScore(altered).score).toBe(82);
  });
});
