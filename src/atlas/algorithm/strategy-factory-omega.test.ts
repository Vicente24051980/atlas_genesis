import { describe, expect, it } from 'vitest';

import {
  DEFAULT_STRATEGY_FACTORY_POLICY,
  STRATEGY_FACTORY_OMEGA,
  type StrategyFactoryCandidate,
  evaluateStrategyFactoryCandidate,
} from './strategy-factory-omega';

function validCandidate(): StrategyFactoryCandidate {
  return {
    candidateId: 'TEST-001',
    candidateVersion: 'v1',
    grammarVersion: 'g1',
    generationSeed: 42,
    universe: 'NASDAQ-100-PIT',
    timeframe: '1h',
    benchmark: 'QQQ',
    provenance: {
      source: 'ATLAS clean-room generator',
      generationMethod: 'bounded grammar search',
      trialsInFamily: 10000,
      parameterCombinationsTested: 25000,
      searchObjective: 'net risk-adjusted OOS return',
      dataPeriodVisibleToGenerator: '2012-2022',
      frozenAt: '2026-09-06T00:00:00Z',
    },
    dataIntegrity: {
      pointInTime: true,
      noLookAhead: true,
      survivorshipSafe: true,
      corporateActionsNormalized: true,
      timestampsConsistent: true,
      identityContinuity: true,
      reproducibleSnapshot: true,
    },
    costedBacktest: {
      spreadIncluded: true,
      feesIncluded: true,
      slippageIncluded: true,
      turnoverIncluded: true,
      financingOrBorrowHandled: true,
      netSharpe: 1.1,
      netMaxDrawdown: 0.18,
    },
    temporalValidation: {
      chronologicalSplit: true,
      purgingAppliedWhenNeeded: true,
      embargoAppliedWhenNeeded: true,
      sealedHoldoutUntouched: true,
      walkForwardPositiveShare: 0.75,
    },
    robustness: {
      monteCarloSurvivalShare: 0.9,
      parameterNeighborCount: 40,
      parameterNeighborPassRate: 0.72,
      regimePositiveShare: 0.7,
    },
    multipleTesting: {
      fdrAdjustedPValue: 0.02,
      deflatedSharpeProbability: 0.97,
      pbo: 0.12,
      realityCheck: 'PASS',
      spa: 'PASS',
    },
    sealedOos: {
      trades: 80,
      sharpe: 0.7,
      positiveNetAlphaAfterCosts: true,
    },
    portfolio: {
      maxCorrelationToExistingStrategy: 0.45,
      incrementalUtilityPositive: true,
    },
  };
}

describe('Strategy Factory Omega', () => {
  it('has zero structural score weight and no execution authority', () => {
    expect(STRATEGY_FACTORY_OMEGA.structuralScoreWeight).toBe(0);
    expect(STRATEGY_FACTORY_OMEGA.brokerExecutionAuthority).toBe(false);
  });

  it('rejects invalid data even with attractive performance', () => {
    const c = validCandidate();
    c.dataIntegrity.noLookAhead = false;
    c.costedBacktest.netSharpe = 4.0;

    const result = evaluateStrategyFactoryCandidate(c);
    expect(result.passed).toBe(false);
    expect(result.rejectCodes).toContain('REJECT_DATA_INVALID');
    expect(result.shadowEligible).toBe(false);
  });

  it('rejects a sharp parameter optimum', () => {
    const c = validCandidate();
    c.robustness.parameterNeighborPassRate = 0.1;

    const result = evaluateStrategyFactoryCandidate(c);
    expect(result.passed).toBe(false);
    expect(result.rejectCodes).toContain('REJECT_PARAMETER_SPIKE');
  });

  it('rejects failure after multiple-testing correction', () => {
    const c = validCandidate();
    c.multipleTesting.fdrAdjustedPValue = 0.2;

    const result = evaluateStrategyFactoryCandidate(c);
    expect(result.passed).toBe(false);
    expect(result.rejectCodes).toContain('REJECT_MULTIPLE_TESTING');
  });

  it('makes a robust sealed-OOS candidate shadow eligible but never executable', () => {
    const result = evaluateStrategyFactoryCandidate(validCandidate(), DEFAULT_STRATEGY_FACTORY_POLICY);

    expect(result.passed).toBe(true);
    expect(result.stage).toBe('PORTFOLIO_ELIGIBLE');
    expect(result.shadowEligible).toBe(true);
    expect(result.structuralScoreWeight).toBe(0);
    expect(result.brokerExecutionAuthority).toBe(false);
  });

  it('accepts valid pre-timestamped live shadow evidence without granting broker authority', () => {
    const c = validCandidate();
    c.liveShadow = {
      timestampedBeforeOutcome: true,
      hypotheticalFillRuleFrozen: true,
      observations: 60,
      positiveNetAlphaAfterCosts: true,
      driftState: 'STABLE',
    };

    const result = evaluateStrategyFactoryCandidate(c);
    expect(result.passed).toBe(true);
    expect(result.stage).toBe('LIVE_SHADOW');
    expect(result.brokerExecutionAuthority).toBe(false);
  });
});
