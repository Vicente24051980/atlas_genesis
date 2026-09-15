import { describe, expect, it } from 'vitest';
import {
  GOV_CULTURE_001,
  evaluateHighPerformanceDecisionProtocol,
  explainableMindChangeSatisfied,
} from './high-performance-decision-protocol-omega';

describe('GOV-CULTURE-001', () => {
  it('is governance, not a financial engine, and cannot execute or write canon automatically', () => {
    expect(GOV_CULTURE_001.kind).toBe('TRANSVERSAL_GOVERNANCE_PROTOCOL_NOT_FINANCIAL_ENGINE');
    expect(GOV_CULTURE_001.directStructuralScoreWeight).toBe(0);
    expect(GOV_CULTURE_001.automaticExecutionAllowed).toBe(false);
    expect(GOV_CULTURE_001.automaticCanonWriteAllowed).toBe(false);
  });

  it('blocks a material decision without dissent and counterevidence', () => {
    const out = evaluateHighPerformanceDecisionProtocol({
      materiality: 'MATERIAL',
      evidenceTraceable: true,
      evidenceIds: ['E-1'],
      independentFirstPasses: 2,
      counterevidenceSearchCompleted: false,
      dissentRaised: false,
      unresolvedEvidenceConflict: false,
    });

    expect(out.state).toBe('BLOCKED_DISSENT');
    expect(out.mayProceedToHumanDecision).toBe(false);
  });

  it('allows a material decision to proceed only to human decision after gates pass', () => {
    const out = evaluateHighPerformanceDecisionProtocol({
      materiality: 'MATERIAL',
      evidenceTraceable: true,
      evidenceIds: ['E-1', 'E-2'],
      independentFirstPasses: 3,
      counterevidenceSearchCompleted: true,
      dissentRaised: true,
      unresolvedEvidenceConflict: false,
    });

    expect(out.state).toBe('READY_TO_DECIDE');
    expect(out.mayProceedToHumanDecision).toBe(true);
    expect(out.automaticExecutionAllowed).toBe(false);
  });

  it('blocks unresolved evidence conflicts', () => {
    const out = evaluateHighPerformanceDecisionProtocol({
      materiality: 'MATERIAL',
      evidenceTraceable: true,
      evidenceIds: ['E-1'],
      independentFirstPasses: 2,
      counterevidenceSearchCompleted: true,
      dissentRaised: true,
      unresolvedEvidenceConflict: true,
    });

    expect(out.state).toBe('BLOCKED_UNRESOLVED_CONFLICT');
  });

  it('requires a causal audit trail when a conclusion changes', () => {
    expect(explainableMindChangeSatisfied({
      previousConclusion: '82',
      nextConclusion: '73',
      newEvidenceIds: [],
      affectedVariables: ['FRU'],
      causalExplanation: 'new evidence changed forward economics',
    })).toBe(false);

    expect(explainableMindChangeSatisfied({
      previousConclusion: '82',
      nextConclusion: '73',
      newEvidenceIds: ['E-NEW'],
      affectedVariables: ['FRU'],
      causalExplanation: 'new evidence changed forward economics',
    })).toBe(true);
  });
});
