import { describe, expect, it } from 'vitest';
import {
  ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA,
  ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA_VERSION,
} from './atlas-kernel-contract-registry-omega';

describe('ATLAS Kernel Contract Registry Ω', () => {
  it('recognizes exactly six canonical engines plus R0 as substrate', () => {
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA_VERSION).toBe('2026-09-07-v4.1.0');
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.architectureConsolidation.canonicalEngineCount).toBe(6);
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.canonicalArchitecture.R0.kind).toBe('RESEARCH_SUBSTRATE');
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.canonicalArchitecture.R0.rankingAuthority).toBe(false);
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.canonicalArchitecture.R0.canonWriteAuthority).toBe(false);
  });

  it('keeps E5 as control rather than a decision or execution engine', () => {
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.canonicalArchitecture.E5.id).toBe('CONTROL_OMEGA');
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.canonicalArchitecture.E5.question).toBe(
      'WHO_MAY_DO_WHAT_UNDER_WHICH_REVOCABLE_CONDITIONS',
    );
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.canonicalArchitecture.E5.question).not.toContain('WHAT_SHOULD_BE_DONE');
  });

  it('keeps E6 as independent assurance with no selection or execution stage authority', () => {
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.canonicalArchitecture.E6.id).toBe('ASSURANCE_OMEGA');
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.canonicalArchitecture.E6.question).toBe(
      'DOES_ATLAS_DO_WHAT_IT_CLAIMS_AGAINST_INDEPENDENT_TRUTH',
    );
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.mainSelectionSequence).not.toContain('ASSURANCE_OMEGA');
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.executionOnlySequence).not.toContain('ASSURANCE_OMEGA');
  });

  it('treats research-signal-score-gate-selection-execution as type separation, not extra engines', () => {
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.hardPlaneSeparation).toEqual([
      'RESEARCH',
      'SIGNAL',
      'SCORE',
      'GATE',
      'PORTFOLIO_SELECTION',
      'EXECUTION',
    ]);
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.hardPlaneSeparation).not.toContain('ASSURANCE');
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.hardPlaneSeparation).not.toContain('CONTROL');
  });

  it('keeps automatic canon modification forbidden and human authority final', () => {
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.permissionModel.automaticModifyCanonAllowed).toBe(false);
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.permissionModel.humanAuthority).toBe('FULL_AND_FINAL');
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.permissionModel.predictiveAccuracyCannotExpandPermissions).toBe(true);
  });

  it('encodes the 30% AI core base ceiling as sizing control rather than Point Zero quota', () => {
    const ai = ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.contracts.aiExposureControl;

    expect(ai.aiCoreBaseCeiling).toBe(0.30);
    expect(ai.runtimeAuthority).toBe('PORTFOLIO_SIZING_AND_CORRELATED_RISK_CONTROL_ONLY');
    expect(ai.pointZeroRankingPenaltyAuthority).toBe(false);
    expect(ai.nonAiDiversificationBonusAuthority).toBe(false);
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.boundaries.aiBaseCeilingCannotCreatePointZeroRankingPenalty).toBe(true);
  });

  it('allows AI exposure above 30% only through the full conditional momentum override', () => {
    const ai = ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.contracts.aiExposureControl;

    expect(ai.overrideStatus).toBe('AI_MOMENTUM_OVERRIDE');
    expect(ai.momentumAloneSufficient).toBe(false);
    expect(ai.requiredOverrideEvidence).toContain('PERSISTENT_TAPE_RS_MOMENTUM');
    expect(ai.requiredOverrideEvidence).toContain('FUNDAMENTALS_HEALTHY');
    expect(ai.requiredOverrideEvidence).toContain('VALUATION_AND_EXPECTED_RETURN_PASS');
    expect(ai.requiredOverrideEvidence).toContain('CORRELATED_RISK_STRESS_ACCEPTABLE');
    expect(ai.requiredOverrideEvidence).toContain('HUMAN_APPROVAL_FOR_DELIBERATE_OVER_30_INCREASE');
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.boundaries.aiPassiveDriftAbove30CannotAutoSell).toBe(true);
  });
});
