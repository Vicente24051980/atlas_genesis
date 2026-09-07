import { describe, expect, it } from 'vitest';
import {
  classifyCut, dominanceAudit, incrementalRoic, multipleDependence, netDeltaUtility,
  paretoFrontier, replacementPassesFirewall, robustCore, validateDecisionRecord,
  validatePrediction, validateRevisionRecord,
} from './omega-governance-core';
import {
  availableAsOf, conservativeEstimate, convertLocalReturnToBase, originalAvailableValue,
  propagatedConfidence, publicationIsPitSafe,
} from './omega-data-integrity';

describe('Ω58–Ω102 governance primitives', () => {
  it('detects strict Pareto dominance', () => {
    const names = [
      { ticker: 'A', expectedReturn: 18, risk: 8, fragility: 5 },
      { ticker: 'B', expectedReturn: 19, risk: 7, fragility: 5 },
      { ticker: 'C', expectedReturn: 20, risk: 12, fragility: 3 },
    ];
    expect(dominanceAudit(names).some(x => x.incumbent === 'A' && x.challenger === 'B' && x.dominated)).toBe(true);
    expect(paretoFrontier(names).map(x => x.ticker).sort()).toEqual(['B', 'C']);
  });

  it('classifies ER dependence on terminal multiple', () => {
    expect(multipleDependence({ fundamentalCompounding: 15, capitalReturn: 2, multipleEffect: 1 })).toBe('FUNDAMENTAL_DRIVEN');
    expect(multipleDependence({ fundamentalCompounding: 7, capitalReturn: 1, multipleEffect: 8 })).toBe('MULTIPLE_DEPENDENT');
  });

  it('computes incremental ROIC and fails closed on zero incremental capital', () => {
    expect(incrementalRoic(20, 100)).toBeCloseTo(0.2);
    expect(incrementalRoic(20, 0)).toBeNull();
  });

  it('separates gross utility from after-cost replacement materiality', () => {
    const replacement = {
      deltaUtilityBeforeCosts: 2,
      transactionCosts: 0.3,
      spreads: 0.1,
      fxImpact: 0.1,
      taxEffects: 0.2,
      operationalComplexity: 0.1,
      deltaExpectedReturn: 1.5,
      deltaRisk: -0.5,
    };
    expect(netDeltaUtility(replacement)).toBeCloseTo(1.2);
    expect(replacementPassesFirewall(replacement, { minDeltaUtilityAfterCosts: 1, minDeltaExpectedReturn: 1, maxRiskIncrease: 0 })).toBe(true);
    expect(replacementPassesFirewall(replacement, { minDeltaUtilityAfterCosts: 1.5 })).toBe(false);
  });

  it('reports cut uncertainty and robust core from perturbation frequency', () => {
    expect(classifyCut(0.95)).toBe('HARD_IN');
    expect(classifyCut(0.52)).toBe('BORDERLINE');
    expect(robustCore({ AVGO: 0.98, MA: 0.94, X: 0.53 }, 0.8)).toEqual(['AVGO', 'MA']);
  });

  it('requires evidence, confidence and falsifier in the decision ledger', () => {
    expect(validateDecisionRecord({
      date: '2026-09-07T09:00:00+02:00', out: 'A', in: 'B', deltaExpectedReturn: 1,
      deltaRisk: -1, deltaFragility: -1, deltaUtility: 2, evidence: ['filing'], confidence: 0.8, falsifier: 'ER gap closes',
    })).toEqual([]);
    expect(validateDecisionRecord({
      date: 'bad', out: null, in: null, deltaExpectedReturn: NaN, deltaRisk: 0,
      deltaFragility: 0, deltaUtility: 0, evidence: [], confidence: 2, falsifier: '',
    }).length).toBeGreaterThan(0);
  });

  it('forbids silent rewrites by validating an explicit revision record', () => {
    expect(validateRevisionRecord({ field: 'ER', oldValue: 18, newValue: 15, reason: 'new filing', timestamp: '2026-09-07T09:00:00+02:00' })).toEqual([]);
  });

  it('requires prediction AS_OF not to be after prediction time', () => {
    expect(validatePrediction({ id: 'P1', predictionTimestamp: '2026-09-07T09:00:00Z', asOfTimestamp: '2026-09-07T08:00:00Z', target: 'ER', horizon: '1y', predictedValue: 0.15, confidence: 0.7 })).toEqual([]);
    expect(validatePrediction({ id: 'P2', predictionTimestamp: '2026-09-07T09:00:00Z', asOfTimestamp: '2026-09-07T10:00:00Z', target: 'ER', horizon: '1y', predictedValue: 0.15, confidence: 0.7 })).toContain('AS_OF_AFTER_PREDICTION');
  });
});

describe('Ω63–Ω72 point-in-time data integrity', () => {
  const history = [
    { value: 10, publicationTimestamp: '2025-07-15T12:00:00Z', source: 'filing', confidence: 1 },
    { value: 12, publicationTimestamp: '2025-09-01T12:00:00Z', source: 'restatement', confidence: 1 },
  ];

  it('does not expose future publications to an earlier AS_OF timestamp', () => {
    expect(availableAsOf(history, '2025-08-01T00:00:00Z').map(x => x.value)).toEqual([10]);
    expect(publicationIsPitSafe('2025-09-01T12:00:00Z', '2025-08-01T00:00:00Z')).toBe(false);
  });

  it('can recover the original value available before a later restatement', () => {
    expect(originalAvailableValue(history, '2025-12-01T00:00:00Z')?.value).toBe(10);
  });

  it('keeps FX contribution explicit rather than confusing it with local stock alpha', () => {
    expect(convertLocalReturnToBase(0.1, 1, 1.05)).toBeCloseTo(0.155);
  });

  it('propagates confidence and penalizes uncertainty in estimates', () => {
    expect(propagatedConfidence([0.81, 1])).toBeCloseTo(0.9);
    expect(conservativeEstimate({ mean: 18, standardDeviation: 15, confidence: 0.6 })).toBe(3);
  });
});
