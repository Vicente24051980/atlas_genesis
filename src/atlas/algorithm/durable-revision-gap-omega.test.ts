import { describe, expect, it } from 'vitest';
import { evaluateDurableRevisionGapOmega } from './durable-revision-gap-omega';

const base = {
  ticker: 'TEST',
  family: 'COMPOUNDER_ACCELERATION' as const,
  evidenceTraceable: true,
  evidenceIds: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'],
  survivabilityScore: 85,
  structuralRepeatabilityScore: 88,
  forwardFundamentalInflectionScore: 90,
  expectationGapScore: 92,
  inflectionDurabilityScore: 86,
  cashConversionScore: 90,
  revisionTorqueScore: 84,
  incrementalCapitalEfficiencyScore: 82,
  valuationSaturationScore: 25,
  balanceFragilityScore: 20,
  integrationDistanceScore: 15,
  driverConcentrationScore: 20,
};

describe('DURABLE_REVISION_GAP_OMEGA_V1', () => {
  it('promotes a durable revision opportunity when fundamentals outrun expectations', () => {
    const result = evaluateDurableRevisionGapOmega(base);
    expect(result.eligible).toBe(true);
    expect(result.state).toBe('CORE_REVISION_OPPORTUNITY');
    expect(result.durableRevisionGapScore).toBeGreaterThanOrEqual(78);
  });

  it('does not allow revealed-capital evidence to create direct score points', () => {
    const withoutElite = evaluateDurableRevisionGapOmega(base);
    const withElite = evaluateDurableRevisionGapOmega({
      ...base,
      eliteCapitalEvidence: {
        source: 'Progeny 3',
        signalDateIso: '2026-05-15',
        concentrationScore: 95,
        persistenceScore: 95,
        marginalDirection: 'ACCELERATING',
        informationProximity: 'P3_GOVERNANCE',
        copyabilityScore: 90,
      },
    });
    expect(withElite.durableRevisionGapScore).toBe(withoutElite.durableRevisionGapScore);
    expect(withElite.eliteCapitalDirectScoreContribution).toBe(0);
    expect(withElite.revealedCapitalConfidence).toBe('HIGH');
  });

  it('fails closed when survivability is weak', () => {
    const result = evaluateDurableRevisionGapOmega({ ...base, survivabilityScore: 25 });
    expect(result.state).toBe('FAIL_SURVIVABILITY');
    expect(result.durableRevisionGapScore).toBeLessThanOrEqual(39.9);
  });

  it('caps a saturated opportunity even with strong operating evidence', () => {
    const result = evaluateDurableRevisionGapOmega({ ...base, valuationSaturationScore: 92 });
    expect(result.state).toBe('SATURATED');
    expect(result.durableRevisionGapScore).toBeLessThanOrEqual(59.9);
  });

  it('blocks canonical use when evidence is insufficient', () => {
    const result = evaluateDurableRevisionGapOmega({ ...base, evidenceIds: ['e1', 'e2'] });
    expect(result.evidenceGate).toBe('PROVISIONAL');
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.eligible).toBe(false);
  });
});
