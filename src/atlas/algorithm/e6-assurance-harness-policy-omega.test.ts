import { describe, expect, it } from 'vitest';
import { E6_ASSURANCE_HARNESS_POLICY_OMEGA } from './e6-assurance-harness-policy-omega';

describe('E6 Assurance Ω harness policy', () => {
  it('has zero decision, execution and canon-write authority', () => {
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.decisionAuthority).toBe(false);
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.executionAuthority).toBe(false);
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.canonWriteAuthority).toBe(false);
  });

  it('separates synthetic from real namespaces', () => {
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.namespaces.syntheticPrefix).toBe('SIM-');
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.namespaces.realPrefix).toBe('AI-');
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.namespaces.syntheticCountsTowardRealQualityGate).toBe(false);
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.namespaces.mixedSyntheticRealAggregateAllowed).toBe(false);
  });

  it('requires independent adversarial and frozen-history cases', () => {
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.noSelfDesignRule.D2D4D5MustBeIndependent).toBe(true);
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.noSelfDesignRule.evaluatedComponentMayDesignAllPrimaryTests).toBe(false);
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.noSelfDesignRule.selfProposedCasesExcludedFromPrimaryMetric).toBe(true);
  });

  it('keeps frozen cases and results immutable', () => {
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.caseImmutability.retrospectiveEditingAllowed).toBe(false);
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.caseImmutability.resultRewriteAllowed).toBe(false);
  });

  it('measures correct abstention explicitly', () => {
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.datasets.D3).toBe('AMBIGUOUS');
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.metrics).toContain('D3_CORRECT_ABSTENTION_RATE');
    expect(E6_ASSURANCE_HARNESS_POLICY_OMEGA.metrics).toContain('ABSTENTION_RATE');
  });
});
