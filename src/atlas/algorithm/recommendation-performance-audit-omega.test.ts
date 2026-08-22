import { describe, expect, it } from 'vitest';
import {
  attributeRecommendationDeviation,
  auditRecommendationPerformance,
  classifyLiveMarketValidation,
  createImmutableRecommendationSnapshot,
  createModelChangeRecord,
  evaluateLiveMarketValidation,
  evaluateRecalibrationGate,
  summarizeExpectedReturnCalibration,
  type RecommendationSnapshot,
} from './recommendation-performance-audit-omega';

const baseSnapshot: RecommendationSnapshot = {
  recommendationId: 'REC-001',
  ticker: 'TEST',
  company: 'Test Co',
  timestamp: '2026-08-22T20:00:00Z',
  evidenceCutoffTimestamp: '2026-08-22T19:59:00Z',
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
  it('creates a deep immutable T0 snapshot and blocks hindsight evidence', () => {
    const frozen = createImmutableRecommendationSnapshot(baseSnapshot);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.expectedReturn)).toBe(true);
    expect(Object.isFrozen(frozen.evidenceAvailableAtT0)).toBe(true);
    expect(() => createImmutableRecommendationSnapshot({
      ...baseSnapshot,
      recommendationId: 'REC-HINDSIGHT',
      evidenceAvailableAtT0: [{ id: 'future-news', availableAt: '2026-08-23T00:00:00Z' }],
    })).toThrow('ANTI_HINDSIGHT_VIOLATION');
  });

  it('blocks evidence that arrived after the explicit evidence cutoff even if it predates T0', () => {
    expect(() => createImmutableRecommendationSnapshot({
      ...baseSnapshot,
      recommendationId: 'REC-CUTOFF',
      evidenceAvailableAtT0: [{ id: 'late-input', availableAt: '2026-08-22T19:59:30Z' }],
    })).toThrow('EVIDENCE_AFTER_CUTOFF');
  });

  it('requires traceable T0 evidence', () => {
    expect(() => createImmutableRecommendationSnapshot({ ...baseSnapshot, evidenceAvailableAtT0: [] })).toThrow('T0_EVIDENCE_REQUIRED');
  });

  it('calculates Recommendation Alpha and Selection Alpha separately', () => {
    const result = auditRecommendationPerformance(baseSnapshot, {
      window: '1M',
      price: 120,
      benchmarkReturnPct: 8,
      relevantDiscardedAlternativeReturnsPct: { ALT1: 25, ALT2: 40 },
      realizedAt: '2026-09-22T20:00:00Z',
    });
    expect(result.absoluteReturnPct).toBeCloseTo(20);
    expect(result.recommendationAlphaPct).toBeCloseTo(12);
    expect(result.bestRelevantDiscardedAlternative).toBe('ALT1');
    expect(result.selectionAlphaPct).toBeCloseTo(-5);
    expect(result.positiveReturn).toBe(true);
    expect(result.beatBenchmark).toBe(true);
    expect(result.beatBestRelevantDiscardedAlternative).toBe(false);
    expect(result.decisionQualityInferredFromOutcome).toBe(false);
  });

  it('does not call a small sample calibrated and still records ER buckets', () => {
    const summary = summarizeExpectedReturnCalibration([
      { expectedReturnPct: 10, realizedReturnPct: 12, horizonYears: 1 },
      { expectedReturnPct: 25, realizedReturnPct: 8, horizonYears: 1 },
    ]);
    expect(summary.status).toBe('INSUFFICIENT_SAMPLE');
    expect(summary.bucketCounts['10-15%']).toBe(1);
    expect(summary.bucketCounts['20-30%']).toBe(1);
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

  it('does not infer institutional flow from a rising price', () => {
    const result = evaluateLiveMarketValidation({
      ticker: 'TEST',
      previousAuditTimestamp: '2026-08-01T20:00:00Z',
      currentAuditTimestamp: '2026-08-22T20:00:00Z',
      previousPrice: 100,
      currentPrice: 120,
      previousExpectedCagrPct: 18,
      currentExpectedCagrPct: 14,
      fundamentalsDelta: 'FLAT',
      revisionsDelta: 'UNVERIFIED',
      valuationDelta: 'RICHER',
      relativeStrengthDelta: 'IMPROVING',
      flowDelta: 'UNVERIFIED',
      economicProofDelta: 'FLAT',
      thesisState: 'ON_TRACK',
      marketEvidenceIds: ['price-tape'],
      fundamentalEvidenceIds: ['filing'],
    });
    expect(result.flowInferredFromPrice).toBe(false);
    expect(result.reasons.join(' ')).toMatch(/PRICE UP != VERIFIED FLOW/);
    expect(result.expectedReturnDeltaPct).toBe(-4);
  });

  it('can strengthen on falling price when fundamentals and Expected Return improve', () => {
    const result = evaluateLiveMarketValidation({
      ticker: 'TEST',
      previousAuditTimestamp: '2026-08-01T20:00:00Z',
      currentAuditTimestamp: '2026-08-22T20:00:00Z',
      previousPrice: 100,
      currentPrice: 90,
      previousExpectedCagrPct: 18,
      currentExpectedCagrPct: 24,
      fundamentalsDelta: 'IMPROVING',
      revisionsDelta: 'IMPROVING',
      valuationDelta: 'CHEAPER',
      relativeStrengthDelta: 'DETERIORATING',
      flowDelta: 'UNVERIFIED',
      economicProofDelta: 'IMPROVING',
      thesisState: 'ON_TRACK',
      marketEvidenceIds: ['price-tape', 'rs-data'],
      fundamentalEvidenceIds: ['filing', 'guidance'],
    });
    expect(result.state).toBe('STRENGTHENING');
    expect(result.fundamentalValidation).toBe('POSITIVE');
    expect(result.priceReturnPct).toBeCloseTo(-10);
    expect(result.reasons.join(' ')).toMatch(/MARKET VALIDATION != FUNDAMENTAL VALIDATION/);
  });

  it('returns FALSIFIED only from a confirmed material falsifier', () => {
    const result = evaluateLiveMarketValidation({
      ticker: 'TEST',
      previousAuditTimestamp: '2026-08-01T20:00:00Z',
      currentAuditTimestamp: '2026-08-22T20:00:00Z',
      previousPrice: 100,
      currentPrice: 150,
      previousExpectedCagrPct: 18,
      currentExpectedCagrPct: 30,
      fundamentalsDelta: 'IMPROVING',
      revisionsDelta: 'IMPROVING',
      valuationDelta: 'CHEAPER',
      relativeStrengthDelta: 'IMPROVING',
      flowDelta: 'IMPROVING',
      economicProofDelta: 'IMPROVING',
      confirmedFalsifierReasons: ['Accounting restatement invalidates the thesis.'],
      marketEvidenceIds: ['market'],
      fundamentalEvidenceIds: ['filing'],
    });
    expect(result.state).toBe('FALSIFIED');
  });

  it('fails closed on non-chronological LAST AUDIT -> NOW data', () => {
    const result = evaluateLiveMarketValidation({
      ticker: 'TEST',
      previousAuditTimestamp: '2026-08-22T20:00:00Z',
      currentAuditTimestamp: '2026-08-01T20:00:00Z',
      previousPrice: 100,
      currentPrice: 90,
      previousExpectedCagrPct: 18,
      currentExpectedCagrPct: 20,
      fundamentalsDelta: 'FLAT',
      valuationDelta: 'FLAT',
      economicProofDelta: 'FLAT',
      marketEvidenceIds: ['market'],
      fundamentalEvidenceIds: ['filing'],
    });
    expect(result.valid).toBe(false);
    expect(result.state).toBe('DATA_INTEGRITY_REJECT');
  });

  it('does not guess attribution without traceable evidence', () => {
    const result = attributeRecommendationDeviation({
      causes: { VALUATION_ERROR: true },
      evidenceIds: [],
    });
    expect(result.attributionVerified).toBe(false);
    expect(result.causes).toEqual([]);
  });

  it('retains multiple supported attribution causes without false precision', () => {
    const result = attributeRecommendationDeviation({
      causes: { VALUATION_ERROR: true, TIMING_ERROR: true },
      evidenceIds: ['audit-ledger'],
    });
    expect(result.attributionVerified).toBe(true);
    expect(result.causes).toEqual(['VALUATION_ERROR', 'TIMING_ERROR']);
    expect(result.primaryCause).toBeNull();
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

  it('only creates a versioned model change record after the recalibration gate passes', () => {
    const blocked = evaluateRecalibrationGate({
      sampleSize: 3,
      repeatedPatternCount: 3,
      meanAbsoluteErrorPct: 20,
      economicallyMaterial: true,
      statisticallySupportedWhenPossible: true,
      outOfSampleImprovementExpected: true,
      crossSectorConsistency: true,
      temporalStability: true,
    });
    expect(() => createModelChangeRecord({
      detectedProblem: 'ER optimism',
      sampleDescription: '3 observations',
      evidenceIds: ['audit-ledger'],
      hypothesis: 'Valuation weight is too low',
      changeMade: 'Increase valuation penalty',
      expectedImpact: 'Lower optimistic ER bias',
      possibleSideEffects: ['May under-rank early growth'],
      previousVersion: 'v1',
      newVersion: 'v2',
      changeDate: '2026-08-22T21:00:00Z',
    }, blocked)).toThrow('RECALIBRATION_GATE_BLOCKED');
  });
});
