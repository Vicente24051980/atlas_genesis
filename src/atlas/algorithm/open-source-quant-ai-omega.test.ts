import {
  auditFactorCandidate,
  benjaminiHochbergFdr,
  calculatePredictiveModelWeights,
  evaluateAgentDisagreement,
  evaluateDriftGuard,
  evaluatePredictiveEnsemble,
  evaluateStatisticalBacktestFirewall,
  informationCoefficient,
  rankInformationCoefficient,
  type PredictiveModelVote,
} from './open-source-quant-ai-omega';
import {
  conditionalValueAtRisk,
  evaluateTailRiskDiagnostics,
  maximumDrawdown,
  tailRatio,
} from './tail-risk-diagnostics-omega';

describe('Open Source Quant AI Omega v1', () => {
  it('computes IC and RankIC without converting them into structural score points', () => {
    const factor = Array.from({ length: 20 }, (_, i) => i + 1);
    const returns = factor.map((v) => v * 0.001);
    expect(informationCoefficient(factor, returns)).toBeCloseTo(1, 10);
    expect(rankInformationCoefficient(factor, [...returns].reverse())).toBeCloseTo(-1, 10);

    const audit = auditFactorCandidate({
      evidenceTraceable: true,
      evidenceIds: ['price:pit', 'returns:pit'],
      factorValues: factor,
      forwardReturns: returns,
      icHistory: [0.03, 0.04, 0.05, 0.02, 0.04],
      quantileForwardReturns: [-0.02, -0.01, 0, 0.01, 0.03],
      redundancyAbsCorrelation: 0.4,
      annualTurnover: 2.2,
    });
    expect(audit.evidence).toBe('CONFIRMED');
    expect(audit.ic).toBeCloseTo(1, 10);
    expect(audit.monotonicity).toBeCloseTo(1, 10);
    expect(audit.directAtlasScoreDelta).toBe(0);
  });

  it('controls factor-mining false discoveries with Benjamini-Hochberg FDR', () => {
    const result = benjaminiHochbergFdr([0.001, 0.01, 0.04, 0.2], 0.05);
    expect(result).not.toBeNull();
    expect(result?.rejected).toEqual([true, true, false, false]);
    expect(result?.adjustedPValues[0]).toBeCloseTo(0.004, 6);
    expect(result?.adjustedPValues[1]).toBeCloseTo(0.02, 6);
  });

  it('fails closed when backtest hygiene is missing and only passes as SHADOW when all hard gates survive', () => {
    const base = {
      oosObservations: 400,
      oosRankIc: 0.04,
      oosIcir: 0.55,
      adjustedPValue: 0.01,
      redundancyAbsCorrelation: 0.40,
      regimePositiveShare: 0.75,
      grossAnnualizedAlphaPct: 8,
      estimatedAnnualCostsPct: 2,
      purgedValidation: true,
      embargoApplied: true,
      walkForwardUsed: true,
      pointInTimeData: true,
      lookAheadAuditPassed: true,
      survivorshipAuditPassed: true,
    };
    expect(evaluateStatisticalBacktestFirewall(base).state).toBe('PASS_SHADOW_ELIGIBLE');
    expect(evaluateStatisticalBacktestFirewall({ ...base, pointInTimeData: false }).state).toBe('REJECT');
    expect(evaluateStatisticalBacktestFirewall({ ...base, estimatedAnnualCostsPct: 9 }).state).toBe('REJECT');
    expect(evaluateStatisticalBacktestFirewall({ ...base, redundancyAbsCorrelation: 0.95 }).state).toBe('WATCH');
  });

  const votes: PredictiveModelVote[] = [
    {
      modelId: 'QLIB_LIGHTGBM', evidenceTraceable: true, evidenceIds: ['oos:q1'], observations: 504,
      brierScore: 0.15, icir: 0.65, stability: 0.90, regimeFit: 0.85,
      probabilityPositive: 0.72, probabilityBeatBenchmark: 0.64, expectedReturnPct: 8,
      q05ReturnPct: -9, q50ReturnPct: 6, q95ReturnPct: 22,
    },
    {
      modelId: 'KRONOS', evidenceTraceable: true, evidenceIds: ['oos:q2'], observations: 252,
      brierScore: 0.28, icir: 0.20, stability: 0.60, regimeFit: 0.70,
      probabilityPositive: 0.55, probabilityBeatBenchmark: 0.51, expectedReturnPct: 3,
      q05ReturnPct: -14, q50ReturnPct: 2, q95ReturnPct: 18,
    },
  ];

  it('weights predictive models by earned OOS reliability instead of reputation', () => {
    const weights = calculatePredictiveModelWeights(votes);
    expect(weights[0].normalizedWeight).toBeGreaterThan(weights[1].normalizedWeight);
    expect(weights.reduce((sum, item) => sum + item.normalizedWeight, 0)).toBeCloseTo(1, 10);

    const ensemble = evaluatePredictiveEnsemble(votes);
    expect(ensemble.state).toBe('AVAILABLE_SHADOW');
    expect(ensemble.probabilityPositive).toBeGreaterThan(0.55);
    expect(ensemble.probabilityPositive).toBeLessThan(0.72);
    expect(ensemble.directAtlasScoreDelta).toBe(0);
  });

  it('does not backfill an unavailable model into a fake ensemble', () => {
    const ensemble = evaluatePredictiveEnsemble([{ ...votes[0], evidenceTraceable: false, evidenceIds: [] }]);
    expect(ensemble.state).toBe('NO_RELIABLE_MODELS');
    expect(ensemble.expectedReturnPct).toBeNull();
  });

  it('detects concept drift and can suspend a deteriorating model', () => {
    expect(evaluateDriftGuard({
      psi: 0.05, ksPValue: 0.50, normalizedWasserstein: 0.05,
      baselineRankIc: 0.05, currentRankIc: 0.049, baselineBrier: 0.18, currentBrier: 0.18,
    }).state).toBe('STABLE');

    expect(evaluateDriftGuard({
      psi: 0.40, ksPValue: 0.001, normalizedWasserstein: 0.90,
      baselineRankIc: 0.05, currentRankIc: 0, baselineBrier: 0.15, currentBrier: 0.35,
    }).state).toBe('SUSPEND_MODEL');
  });

  it('turns agent disagreement into lower confidence rather than averaging away conflict', () => {
    const consensus = evaluateAgentDisagreement([0.70, 0.72, 0.68, 0.71]);
    const conflict = evaluateAgentDisagreement([0.90, 0.50, 0.20, 0.80]);
    expect(consensus.state).toBe('CONSENSUS');
    expect(conflict.state).toBe('HIGH_DISAGREEMENT');
    expect(conflict.confidenceMultiplier as number).toBeLessThan(consensus.confidenceMultiplier as number);
  });
});

describe('Tail Risk Diagnostics Omega v1', () => {
  const returns = [-0.20, -0.10, -0.04, -0.02, -0.01, 0.00, 0.005, 0.006, 0.007, 0.008,
    0.009, 0.01, 0.011, 0.012, 0.013, 0.014, 0.015, 0.02, 0.03, 0.08];

  it('measures loss tails and drawdowns without creating score authority', () => {
    expect(conditionalValueAtRisk(returns, 0.95)).toBeCloseTo(0.20, 10);
    expect(maximumDrawdown(returns) as number).toBeGreaterThan(0.20);
    expect(tailRatio(returns) as number).toBeGreaterThan(0);

    const out = evaluateTailRiskDiagnostics({
      returns,
      evidenceTraceable: true,
      evidenceIds: ['returns:pit'],
    });
    expect(out.state).toBe('AVAILABLE');
    expect(out.cvar).toBeCloseTo(0.20, 10);
    expect(out.directAtlasScoreDelta).toBe(0);
  });

  it('fails closed on short or untraceable return histories', () => {
    expect(evaluateTailRiskDiagnostics({ returns: [0.01, -0.01], evidenceTraceable: true, evidenceIds: ['x'] }).state).toBe('EVIDENCE_PENDING');
    expect(evaluateTailRiskDiagnostics({ returns, evidenceTraceable: false, evidenceIds: [] }).state).toBe('EVIDENCE_PENDING');
  });
});
