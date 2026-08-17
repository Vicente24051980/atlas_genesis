import {
  classifyCaptureEfficiency,
  evaluateCapexHunter,
  type CapexHunterInput,
} from './capex-hunters-omega';

const eliteCase: CapexHunterInput = {
  ticker: 'CAPTOR_CASE',
  motorOrigin: 'CAPEX_HUNTERS_OMEGA',
  hunterClasses: ['H2_BOTTLENECK_OWNER', 'H5_CONTRACTUAL_CAPTOR'],
  evidenceTraceable: true,
  evidenceIds: ['orders-q1', 'backlog-q2', 'cashflow-q2'],
  economicProofLevel: 'E4_FCF_ROIC_MULTI_PERIOD',
  buildabilityState: 'B1_MANAGEABLE',
  timing: 'CONFIRMED',
  necessityDirectnessScore: 96,
  contractProofScore: 96,
  marginFcfConversionScore: 92,
  roicQualityScore: 91,
  bottleneckPersistenceScore: 94,
  pricingPowerScore: 90,
  fundingQualityScore: 92,
  buildabilityQualityScore: 86,
  capturedDemandGrowthPct: 45,
  ownCapexGrowthPct: 12,
};

describe('CAPEX Hunters Omega v1', () => {
  it('classifies a proven high-quality toll road as ELITE_CAPTOR', () => {
    const result = evaluateCapexHunter(eliteCase);
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(result.state).toBe('ELITE_CAPTOR');
    expect(result.action).toBe('ADVANCE_DEEP_RESEARCH');
    expect(result.captureScore).toBeGreaterThanOrEqual(90);
    expect(result.captureEfficiencyState).toBe('CAPITAL_LIGHT_CAPTURE');
  });

  it('blocks narrative-only CAPEX exposure even with attractive raw scores', () => {
    const result = evaluateCapexHunter({
      ...eliteCase,
      ticker: 'NARRATIVE_CASE',
      evidenceIds: ['management-slide'],
      economicProofLevel: 'E1_MANAGEMENT_CLAIM',
    });
    expect(result.evidenceGate).toBe('PROVISIONAL');
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.action).toBe('EVIDENCE_REQUIRED');
  });

  it('requires at least two evidence records for structural confirmation', () => {
    const result = evaluateCapexHunter({
      ...eliteCase,
      ticker: 'ONE_SOURCE_CASE',
      evidenceIds: ['single-contract'],
      economicProofLevel: 'E3_REVENUE_MARGIN',
    });
    expect(result.evidenceGate).toBe('PROVISIONAL');
    expect(result.state).toBe('EVIDENCE_PENDING');
  });

  it('keeps buildability risk visible instead of silently erasing capture quality', () => {
    const result = evaluateCapexHunter({
      ...eliteCase,
      ticker: 'BUILDABILITY_CASE',
      buildabilityState: 'B3_BOTTLENECK',
      buildabilityQualityScore: 35,
    });
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('Buildability risk is material'),
    ]));
  });

  it('detects when the captor is becoming a fragile allocator', () => {
    expect(classifyCaptureEfficiency({ capturedDemandGrowthPct: 12, ownCapexGrowthPct: 48 }))
      .toBe('FRAGILE_ALLOCATOR_RISK');
  });

  it('does not convert NO_CHASE into a fundamental downgrade or automatic buy', () => {
    const result = evaluateCapexHunter({ ...eliteCase, timing: 'NO_CHASE' });
    expect(result.state).toBe('ELITE_CAPTOR');
    expect(result.action).toBe('ADVANCE_DEEP_RESEARCH');
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('no automatic BUY'),
    ]));
  });
});
