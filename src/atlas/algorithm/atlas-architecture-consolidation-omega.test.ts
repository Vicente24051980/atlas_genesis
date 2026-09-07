import { describe, expect, it } from 'vitest';
import { ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA } from './atlas-kernel-contract-registry-omega';
import { FACTOR_OWNERSHIP_HARD_RULES } from './factor-ownership-ledger-omega';

describe('ATLAS architecture consolidation Ω', () => {
  const r = ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA;

  it('has exactly six canonical engines and one research substrate', () => {
    const engines = Object.values(r.canonicalArchitecture).filter((x) => x.kind === 'CANONICAL_ENGINE');
    expect(engines).toHaveLength(6);
    expect(r.canonicalArchitecture.R0.kind).toBe('RESEARCH_SUBSTRATE');
  });

  it('keeps the factor ownership ledger inside E2 rather than creating a seventh engine', () => {
    expect(FACTOR_OWNERSHIP_HARD_RULES.canonicalEngine).toBe('E2_ASSESSMENT_OMEGA');
    expect(FACTOR_OWNERSHIP_HARD_RULES.createsNewEngine).toBe(false);
    expect(FACTOR_OWNERSHIP_HARD_RULES.oneDirectScoreClaimPerFactor).toBe(true);
  });

  it('keeps research, signals, score, gates, selection and execution as distinct planes', () => {
    expect(r.hardPlaneSeparation).toEqual([
      'RESEARCH', 'SIGNAL', 'SCORE', 'GATE', 'PORTFOLIO_SELECTION', 'EXECUTION',
    ]);
  });

  it('ratifies 3-6y, breadth 0%, learning as hypothesis generator, and criticality as separate axis', () => {
    expect(r.ratifiedDecisions.officialInvestmentHorizon).toBe('3-6_YEARS');
    expect(r.ratifiedDecisions.breadthRotationWeight).toBe(0);
    expect(r.ratifiedDecisions.learningOmegaAuthority).toBe('HYPOTHESIS_GENERATOR_ONLY');
    expect(r.ratifiedDecisions.strategicCriticality).toContain('SEPARATE_REPORTED_AXIS');
  });

  it('prevents the four prohibited architectural leaks', () => {
    expect(r.boundaries.researchCannotScoreDirectly).toBe(true);
    expect(r.boundaries.gateCannotBecomeBonus).toBe(true);
    expect(r.boundaries.stressTestCannotBePublishedAsForecast).toBe(true);
    expect(r.boundaries.syntheticCasesCannotCountAsRealEvaluationEvidence).toBe(true);
  });

  it('denies automatic canon modification and permission expansion by predictive accuracy', () => {
    expect(r.permissionModel.automaticModifyCanonAllowed).toBe(false);
    expect(r.permissionModel.predictiveAccuracyCannotExpandPermissions).toBe(true);
    expect(r.permissionModel.noPermissionIsImpliedByAnother).toBe(true);
  });

  it('requires world-state refresh and human approval downstream of clean selection', () => {
    expect(r.executionOnlySequence).toContain('WORLD_STATE_REFRESH');
    expect(r.executionOnlySequence).toContain('REAL_BROKER_RECONCILIATION');
    expect(r.executionOnlySequence).toContain('HUMAN_APPROVAL_FOR_MATERIAL_ACTION');
  });
});
