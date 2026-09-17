import { describe, expect, it } from 'vitest';
import {
  evaluateBottleneckOwnership,
  type BottleneckOwnershipInput,
} from './bottleneck-ownership-omega';

const strongCase: BottleneckOwnershipInput = {
  ticker: 'TEST',
  layer: 'COOLING',
  evidenceTraceable: true,
  evidenceIds: ['contract-q1', 'revenue-q2', 'fcf-q2'],
  economicProofLevel: 'E4_FCF_ROIC_MULTI_PERIOD',
  economicNecessityScore: 96,
  scarcityScore: 94,
  controlPointScore: 95,
  pricingPowerScore: 90,
  economicCaptureScore: 94,
  fcfConversionScore: 92,
  durationScore: 92,
  capacityExpansionRiskScore: 12,
  substitutionRiskScore: 10,
  customerConcentrationRiskScore: 18,
  cyclicalityRiskScore: 15,
  valuationRiskScore: 85,
};

describe('Bottleneck Ownership Omega v2', () => {
  it('advances a proven durable bottleneck owner without treating valuation as score input', () => {
    const result = evaluateBottleneckOwnership(strongCase);
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(result.state).toBe('ELITE_OWNER');
    expect(result.action).toBe('ADVANCE_DEEP_RESEARCH');
    expect(result.adjustedOwnershipScore).toBeGreaterThanOrEqual(85);
    expect(result.valuationRiskScore).toBe(85);
  });

  it('fails closed on narrative-only evidence even with excellent raw scores', () => {
    const result = evaluateBottleneckOwnership({
      ...strongCase,
      evidenceIds: ['management-slide'],
      economicProofLevel: 'E1_MANAGEMENT_CLAIM',
    });
    expect(result.evidenceGate).toBe('PROVISIONAL');
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.action).toBe('EVIDENCE_REQUIRED');
  });

  it('marks scarcity at risk when replication and substitution can destroy the bottleneck', () => {
    const result = evaluateBottleneckOwnership({
      ...strongCase,
      capacityExpansionRiskScore: 95,
      substitutionRiskScore: 90,
      customerConcentrationRiskScore: 80,
      cyclicalityRiskScore: 75,
    });
    expect(result.bottleneckDestructionState).toBe('CRITICAL');
    expect(result.state).toBe('SCARCITY_AT_RISK');
    expect(result.action).toBe('WATCH');
  });

  it('does not call physical scarcity an economic owner when FCF conversion fails', () => {
    const result = evaluateBottleneckOwnership({
      ...strongCase,
      fcfConversionScore: 35,
      economicCaptureScore: 72,
    });
    expect(result.state).toBe('BOTTLENECK_ONLY');
    expect(result.action).toBe('WATCH');
  });

  it('keeps valuation completely outside the ownership score and state', () => {
    const cheap = evaluateBottleneckOwnership({ ...strongCase, valuationRiskScore: 10 });
    const expensive = evaluateBottleneckOwnership({ ...strongCase, valuationRiskScore: 95 });
    expect(cheap.baseOwnershipScore).toBe(expensive.baseOwnershipScore);
    expect(cheap.adjustedOwnershipScore).toBe(expensive.adjustedOwnershipScore);
    expect(cheap.state).toBe(expensive.state);
    expect(cheap.valuationRiskScore).not.toBe(expensive.valuationRiskScore);
  });
});
