import {
  decomposeExpectedCagrDrivers,
  evaluateActiveVsIndexHurdle,
  evaluateBaseRateSurvivorship,
  evaluateCapitalAllocationQuality,
  evaluateConvexityRuinGuard,
  evaluateMoatMigration,
  evaluateNarrativeToNumbers,
  evaluatePerShareEconomics,
  evaluatePreMortemInversion,
  evaluateReinvestmentRunway,
  evaluateReplacementHurdle,
  evaluateValuationCompressionStress,
} from './investment-discipline-compounding-omega';

describe('Investment Discipline & Compounding Ω', () => {
  it('rejects survivor-only evidence even when the winners look compelling', () => {
    const result = evaluateBaseRateSurvivorship({
      evidenceTraceable: true,
      evidenceIds: ['cohort-source', 'failure-source'],
      comparableCohortSize: 40,
      survivorOnlyEvidence: true,
      documentedSuccessCount: 6,
      documentedFailureCount: 34,
    });
    expect(result.gate).toBe('FAIL');
    expect(result.observedSuccessRatePct).toBe(15);
  });

  it('does not promote a narrative beyond the first broken economic stage', () => {
    const result = evaluateNarrativeToNumbers({
      evidenceTraceable: true,
      evidenceIds: ['10q', 'customer-data'],
      stages: {
        TAM: true, CUSTOMERS: true, VOLUME_PRICE: true, REVENUE: true,
        MARGIN: false, OCF: true, FCF: true, ROIC: true, PER_SHARE: true,
      },
    });
    expect(result.furthestContinuousStage).toBe('REVENUE');
    expect(result.firstBrokenStage).toBe('MARGIN');
    expect(result.economicProofReached).toBe(false);
    expect(result.gate).toBe('FAIL');
  });

  it('recognizes a long runway only when incremental ROIC materially exceeds WACC', () => {
    const result = evaluateReinvestmentRunway({
      evidenceTraceable: true,
      evidenceIds: ['roic', 'tam'],
      runwayYears: 12,
      incrementalRoicPct: 24,
      waccPct: 9,
      reinvestmentRatePct: 55,
    });
    expect(result.state).toBe('ELITE');
    expect(result.roicSpreadPct).toBe(15);
  });

  it('flags enterprise growth that leaks through dilution before reaching owners', () => {
    const result = evaluatePerShareEconomics({
      evidenceTraceable: true,
      evidenceIds: ['cashflow', 'shares'],
      revenueGrowthPct: 30,
      fcfGrowthPct: 28,
      fcfPerShareGrowthPct: 15,
      epsPerShareGrowthPct: 14,
      dilutedShareCountGrowthPct: 6,
      sbcPctRevenue: 13,
    });
    expect(result.state).toBe('DILUTION_SEVERE');
    expect(result.fcfOwnershipLeakagePct).toBe(13);
  });

  it('treats moat as a migrating asset rather than a permanent label', () => {
    const result = evaluateMoatMigration({
      evidenceTraceable: true,
      evidenceIds: ['retention', 'product-telemetry'],
      currentMoatScore: 88,
      forwardMoatScore: 72,
      dataAdvantageScore: 70,
      workflowEmbeddednessScore: 65,
      regulatoryOrCertificationScore: 40,
      networkOrScaleScore: 72,
      aiSubstitutionRiskScore: 78,
    });
    expect(result.state).toBe('WEAKENING');
    expect(result.moatDelta).toBe(-16);
  });

  it('separates capital allocation from headline buybacks', () => {
    const result = evaluateCapitalAllocationQuality({
      evidenceTraceable: true,
      evidenceIds: ['capital-allocation', 'share-count'],
      incrementalRoicPct: 19,
      waccPct: 9,
      netShareCountChangePct: -2,
      dividendYieldPct: 1,
      acquisitionReturnSpreadPct: 4,
      netDebtChangePct: 5,
    });
    expect(result.state).toBe('VALUE_CREATING');
    expect(result.shareholderYieldFloorPct).toBe(3);
  });

  it('keeps Expected CAGR decomposition diagnostic and explicit about leakage', () => {
    const result = decomposeExpectedCagrDrivers({
      normalizedFcfGrowthPct: 12,
      shareholderYieldPct: 2,
      annualizedMultipleChangePct: -3,
      dilutionPct: 1,
      fragilityPenaltyPct: 1,
    });
    expect(result.expectedCagrApproxPct).toBe(9);
    expect(result.rule).toBe('DIAGNOSTIC_BRIDGE_NOT_SCENARIO_REPLACEMENT');
  });

  it('stress-tests a good business against valuation compression', () => {
    const result = evaluateValuationCompressionStress({
      expectedCagrPct: 18,
      horizonYears: 3,
      terminalMultipleCompressionPct: 30,
    });
    expect(result.stressedCagrPct).not.toBeNull();
    expect(result.stressedCagrPct as number).toBeLessThan(18);
    expect(result.survivesCompression).toBe(true);
  });

  it('vetoes attractive upside when permanent-loss or forced-financing risk is extreme', () => {
    const result = evaluateConvexityRuinGuard({
      evidenceTraceable: true,
      evidenceIds: ['debt', 'liquidity'],
      netDebtToEbitda: 5,
      interestCoverage: 1.2,
      refinancingWithin24mPctDebt: 55,
      forcedEquityRiskScore: 90,
      permanentLossRiskScore: 85,
      binaryEventDependencyScore: 70,
    });
    expect(result.state).toBe('VETO');
  });

  it('requires an active candidate to beat the benchmark by a real margin', () => {
    expect(evaluateActiveVsIndexHurdle({ candidateExpectedCagrPct: 14, benchmarkExpectedCagrPct: 11 }).gate).toBe('PASS');
    expect(evaluateActiveVsIndexHurdle({ candidateExpectedCagrPct: 12, benchmarkExpectedCagrPct: 11 }).gate).toBe('FAIL');
  });

  it('prevents churn when the challenger is only marginally better', () => {
    const result = evaluateReplacementHurdle({
      incumbentTicker: 'OLD',
      challengerTicker: 'NEW',
      evidenceTraceable: true,
      evidenceIds: ['old-audit', 'new-audit'],
      incumbentExpectedCagrPct: 14,
      challengerExpectedCagrPct: 15.5,
      incumbentScore: 88,
      challengerScore: 90,
      benchmarkExpectedCagrPct: 10,
      rotationFrictionPct: 0.5,
    });
    expect(result.verdict).toBe('KEEP_INCUMBENT');
    expect(result.netExpectedCagrAdvantagePct).toBe(1);
  });

  it('allows replacement when the challenger clears the hurdle after friction', () => {
    const result = evaluateReplacementHurdle({
      incumbentTicker: 'OLD',
      challengerTicker: 'NEW',
      evidenceTraceable: true,
      evidenceIds: ['old-audit', 'new-audit'],
      incumbentExpectedCagrPct: 11,
      challengerExpectedCagrPct: 16,
      incumbentScore: 84,
      challengerScore: 91,
      benchmarkExpectedCagrPct: 10,
      rotationFrictionPct: 1,
    });
    expect(result.verdict).toBe('REPLACE_ALLOWED');
    expect(result.netExpectedCagrAdvantagePct).toBe(4);
  });

  it('forces red-team review when an unmitigated failure mode dominates the thesis', () => {
    const result = evaluatePreMortemInversion({
      evidenceTraceable: true,
      evidenceIds: ['risk-map', 'debt-docs'],
      failureModes: [
        { id: 'customer-concentration', probabilityPct: 40, severityScore: 80, mitigated: false, evidenceId: 'risk-map' },
        { id: 'refinancing', probabilityPct: 20, severityScore: 70, mitigated: true, evidenceId: 'debt-docs' },
      ],
    });
    expect(result.state).toBe('RED_TEAM_REQUIRED');
    expect(result.dominantFailureMode).toBe('customer-concentration');
  });
});
