import {
  calculateCoreConfidenceFromDelta,
  evaluateDeltaDivergence,
  evaluateGammaVigencia,
  evaluateKappaCalibration,
  evaluateUpsilonAllocation,
  validateGammaFalsifiers,
  type GammaFalsifierDefinition,
  type KappaPreregisteredCase,
  type UpsilonPositionInput,
} from './greek-contracts-omega';

describe('Δ — Divergence Ω', () => {
  const passes = [
    {
      evaluatorId: 'fundamental', alignedEvidenceGraphId: 'graph-msft-q3', independent: true,
      probability: 0.84, confidence: 0.78,
      dimensionProbabilities: { moat: 0.86, valuation: 0.48, expectations: 0.56 },
    },
    {
      evaluatorId: 'expectations', alignedEvidenceGraphId: 'graph-msft-q3', independent: true,
      probability: 0.61, confidence: 0.70,
      dimensionProbabilities: { moat: 0.81, valuation: 0.72, expectations: 0.61 },
    },
    {
      evaluatorId: 'bear-risk', alignedEvidenceGraphId: 'graph-msft-q3', independent: true,
      probability: 0.49, confidence: 0.74,
      dimensionProbabilities: { moat: 0.78, valuation: 0.31, expectations: 0.39 },
    },
  ];

  it('measures population sigma/IQR and surfaces the economic disagreement axis without concluding', () => {
    const out = evaluateDeltaDivergence(passes);
    expect(out.state).toBe('MEDIBLE');
    expect(out.dOmega).toBeCloseTo(0.1453, 3);
    expect(out.meanProbability).toBeCloseTo(0.6467, 3);
    expect(out.normalizedDOmega as number).toBeGreaterThan(out.dOmega as number);
    expect(out.strongestDisagreementAxis).toBe('valuation');
    expect(out.canConclude).toBe(false);
    expect(out.directAtlasScoreDelta).toBe(0);
  });

  it('fails closed when evaluator independence is doubtful', () => {
    const out = evaluateDeltaDivergence(passes.map((p, i) => ({ ...p, independent: i !== 1 })));
    expect(out.state).toBe('NO_MEDIBLE');
    expect(out.dOmega).toBeNull();
  });

  it('keeps confidence aggregation in Core Ω with an explicit versioned k policy', () => {
    const delta = evaluateDeltaDivergence(passes);
    const conf = calculateCoreConfidenceFromDelta([0.78, 0.70, 0.74], delta, { divergencePenaltyK: 2, policyId: 'CORE-CONF-v1-PROVISIONAL' });
    expect(conf.state).toBe('AVAILABLE');
    expect(conf.meanIndividualConfidence).toBeCloseTo(0.74, 8);
    expect(conf.effectiveConfidence).toBeCloseTo(0.553, 2);
    expect(conf.formulaOwner).toBe('CORE_OMEGA');
  });
});

describe('Κ — Calibration Ω', () => {
  const makeCase = (i: number, p: number, o: 0 | 1, type = 'growth', horizon = '4Q'): KappaPreregisteredCase => ({
    id: `K-${i}`, sealedAt: '2026-09-05T06:00:00Z', claimType: type, horizonId: horizon,
    probability: p, criterion: 'Revenue growth >= 10%', resolutionSource: '10-Q/10-K',
    criterionHashAtSeal: `hash-${i}`, criterionHashAtResolution: `hash-${i}`, status: 'RESOLVED', outcome: o,
  });

  it('computes Brier, log loss and segment-specific Brier Skill Score but withholds verdict below 50', () => {
    const cases = Array.from({ length: 40 }, (_, i) => makeCase(i, i % 2 ? 0.70 : 0.60, i % 3 ? 1 : 0));
    const out = evaluateKappaCalibration(cases, { 'growth::4Q': 0.55 });
    expect(out.state).toBe('ACCUMULATING');
    expect(out.resolvedValidCases).toBe(40);
    expect(out.brierScore as number).toBeGreaterThan(0);
    expect(out.logLoss as number).toBeGreaterThan(0);
    expect(out.segments[0].baseRate).toBe(0.55);
    expect(out.segments[0].brierSkillScore).not.toBeNull();
    expect(out.adaptiveCalibrationCurve.length).toBe(4);
    expect(out.canChangeMethodology).toBe(false);
  });

  it('unlocks only a first calibration verdict at 50 and uses adaptive bins instead of sparse deciles', () => {
    const cases = Array.from({ length: 50 }, (_, i) => makeCase(i, 0.50 + (i % 5) * 0.08, i % 2 as 0 | 1));
    const out = evaluateKappaCalibration(cases, { 'growth::4Q': 0.5 });
    expect(out.state).toBe('VERDICT_AVAILABLE');
    expect(out.adaptiveCalibrationCurve.length).toBe(5);
  });

  it('invalidates retrospective criterion changes rather than reinterpreting them', () => {
    const changed = makeCase(1, 0.7, 1);
    changed.criterionHashAtResolution = 'changed-after-the-fact';
    const out = evaluateKappaCalibration([changed]);
    expect(out.state).toBe('NO_COMPUTABLE_CASES');
    expect(out.invalidatedCases).toBe(1);
  });
});

describe('Γ — Vigencia Ω', () => {
  const defs: GammaFalsifierDefinition[] = [
    {
      id: 'F1', sealedAt: '2026-09-05T06:00:00Z', metric: 'Azure growth YoY', operator: '<', threshold: 20,
      unit: '%', window: '2 consecutive quarters', resolutionSource: '10-Q', weight: 0.30, severity: 'MAJOR',
      observable: true, causal: true, thesisRelevant: true,
    },
    {
      id: 'F2', sealedAt: '2026-09-05T06:00:00Z', metric: 'Operating margin', operator: '<', threshold: 40,
      unit: '%', window: '1 quarter', resolutionSource: '10-Q', weight: 0.20, severity: 'MINOR',
      observable: true, causal: true, thesisRelevant: true,
    },
    {
      id: 'F3', sealedAt: '2026-09-05T06:00:00Z', metric: 'Preferred partner status', operator: '==', threshold: 0,
      unit: 'binary', window: 'any quarter', resolutionSource: '10-K/8-K', weight: 0.50, severity: 'CRITICAL',
      observable: true, causal: true, thesisRelevant: true,
    },
  ];

  it('rejects a measurable-but-not-causal falsifier at ingestion', () => {
    const bad = defs.map((f) => ({ ...f }));
    bad[0].causal = false;
    expect(validateGammaFalsifiers(bad).valid).toBe(false);
    expect(evaluateGammaVigencia(bad, []).state).toBe('VIGENCIA_NO_EVALUABLE');
  });

  it('keeps continuous V_Ω, critical activation and freshness separate', () => {
    const out = evaluateGammaVigencia(defs, [
      { falsifierId: 'F1', state: 'ACTIVATED', observedAt: '2026-09-01', evidenceId: 'q3' },
      { falsifierId: 'F2', state: 'NOT_ACTIVATED', observedAt: '2026-09-01', evidenceId: 'q3' },
      { falsifierId: 'F3', state: 'ACTIVATED', observedAt: '2026-09-01', evidenceId: '8k' },
    ], '2026-08-01T00:00:00Z', '2026-09-05T00:00:00Z', 180);
    expect(out.state).toBe('VIGENTE_MEDIBLE');
    expect(out.vOmega).toBeCloseTo(0.40, 8); // 1 - 0.30/(0.30+0.20); critical 0.50 is not diluted into V
    expect(out.criticalActivated).toEqual(['F3']);
    expect(out.freshnessScore as number).toBeLessThan(1);
    expect(out.canBuySell).toBe(false);
  });

  it('does not treat missing observation as NOT_ACTIVATED', () => {
    const out = evaluateGammaVigencia(defs, [
      { falsifierId: 'F1', state: 'NOT_ACTIVATED' },
      { falsifierId: 'F2', state: 'NOT_ACTIVATED' },
    ]);
    expect(out.state).toBe('VIGENCIA_EVIDENCE_PENDING');
    expect(out.vOmega).toBeNull();
    expect(out.evaluationCoverage).toBeCloseTo(0.5, 8);
  });
});

describe('Υ — Allocation Ω', () => {
  const positions: UpsilonPositionInput[] = [
    {
      ticker: 'A', admissionState: 'ACTIVE_ADMITTED', structuralScore: 95, expectedReturnPct: 16,
      effectiveConfidence: 0.8, vOmega: 1, tailRiskPct: 8, transactionCostPct: 0.1, currentWeight: 0.40,
      themeExposures: { AI: 1.0 },
    },
    {
      ticker: 'B', admissionState: 'ACTIVE_ADMITTED', structuralScore: 70, expectedReturnPct: 12,
      effectiveConfidence: 0.75, vOmega: 0.9, tailRiskPct: 6, transactionCostPct: 0.1, currentWeight: 0.35,
      themeExposures: { AI: 0.25 },
    },
    {
      ticker: 'C', admissionState: 'ADMITTED_RESERVE', structuralScore: 60, expectedReturnPct: 4,
      effectiveConfidence: 0.55, vOmega: 0.8, tailRiskPct: 5, transactionCostPct: 0.2, currentWeight: 0.25,
      themeExposures: { AI: 0 },
    },
  ];

  const policy = {
    policyId: 'UPSILON-v1-test', maxPositionWeight: 0.70, minActiveWeight: 0.10,
    themeCaps: { AI: 0.50 }, lambdaTail: 0.15, lambdaUncertainty: 0.20, lambdaCost: 0.05, lambdaTurnover: 0.10,
  };

  it('allocates with explicit Expected Return and respects fractional hard theme caps', () => {
    const out = evaluateUpsilonAllocation(positions, policy);
    expect(out.state).toBe('FEASIBLE_TARGET');
    expect(out.totalWeight).toBeCloseTo(1, 6);
    expect(out.themeExposure.AI).toBeLessThanOrEqual(0.500001);
    expect(out.targets.find((x) => x.ticker === 'A')?.targetWeight as number).toBeGreaterThanOrEqual(0.10);
    expect(out.canAdmitExclude).toBe(false);
    expect(out.targets.find((x) => x.ticker === 'A')?.structuralScoreTrace).toBe(95);
  });

  it('does not require a reserve position to consume capital and does not interpret zero as exclusion', () => {
    const out = evaluateUpsilonAllocation(positions, policy);
    const reserve = out.targets.find((x) => x.ticker === 'C');
    expect(reserve?.admissionState).toBe('ADMITTED_RESERVE');
    expect((reserve?.targetWeight ?? -1)).toBeGreaterThanOrEqual(0);
  });

  it('fails rather than relaxing an impossible hard thematic cap', () => {
    const allAi = positions.map((p) => ({ ...p, themeExposures: { AI: 1 } }));
    const out = evaluateUpsilonAllocation(allAi, { ...policy, themeCaps: { AI: 0.40 } });
    expect(out.state).toBe('CONSTRAINT_INFEASIBLE');
  });

  it('requires Expected Return explicitly; score alone cannot manufacture a forecast', () => {
    const malformed = positions.map((p) => ({ ...p })) as any[];
    malformed[0].expectedReturnPct = Number.NaN;
    const out = evaluateUpsilonAllocation(malformed, policy);
    expect(out.state).toBe('EVIDENCE_PENDING');
  });
});
