import { describe, expect, it } from 'vitest';
import { E5_CONTROL_POLICY_OMEGA } from './e5-control-policy-omega';

describe('E5 Control Ω policy', () => {
  it('forbids automatic canon modification everywhere', () => {
    for (const permissions of Object.values(E5_CONTROL_POLICY_OMEGA.componentPermissions)) {
      expect(permissions.MODIFY_CANON).toBe('DENY');
    }
  });

  it('does not let write imply persist or execute imply schedule', () => {
    expect(E5_CONTROL_POLICY_OMEGA.invariants.writeDoesNotImplyPersist).toBe(true);
    expect(E5_CONTROL_POLICY_OMEGA.invariants.executeDoesNotImplySchedule).toBe(true);
    expect(E5_CONTROL_POLICY_OMEGA.invariants.noPermissionImpliedByAnother).toBe(true);
  });

  it('does not let autonomy level expand component permissions', () => {
    expect(E5_CONTROL_POLICY_OMEGA.invariants.autonomyLevelCannotExpandComponentPermissions).toBe(true);
    expect(E5_CONTROL_POLICY_OMEGA.agenticAutonomy.status).toBe('CONTROL_POLICY_DOES_NOT_AUTO_PROMOTE_RUNTIME_AUTONOMY');
  });

  it('requires human approval for scheduling/delegation in E5', () => {
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E5_CONTROL.SCHEDULE).toBe('HUMAN_APPROVAL_REQUIRED');
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E5_CONTROL.DELEGATE).toBe('HUMAN_APPROVAL_REQUIRED');
  });

  it('keeps E4 decision from directly executing', () => {
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E4_DECISION.EXECUTE).toBe('DENY');
  });

  it('defines L0-L4 without granting automatic L4 authority', () => {
    expect(Object.keys(E5_CONTROL_POLICY_OMEGA.agenticAutonomy.levels)).toEqual([
      'L0_READ_ONLY',
      'L1_PROPOSE',
      'L2_SAFE_WRITE',
      'L3_CONTROLLED_EXECUTION',
      'L4_HUMAN_APPROVAL_REQUIRED',
    ]);
    expect(E5_CONTROL_POLICY_OMEGA.agenticAutonomy.levels.L4_HUMAN_APPROVAL_REQUIRED.humanApproval).toBe(true);
    expect(E5_CONTROL_POLICY_OMEGA.agenticAutonomy.mandatoryL4Domains).toContain('FINANCIAL');
    expect(E5_CONTROL_POLICY_OMEGA.agenticAutonomy.mandatoryL4Domains).toContain('LEGAL');
    expect(E5_CONTROL_POLICY_OMEGA.agenticAutonomy.mandatoryL4Domains).toContain('MEDICAL');
  });

  it('never accepts agent narrative as proof of external completion', () => {
    const verification = E5_CONTROL_POLICY_OMEGA.agenticAutonomy.verification;
    expect(verification.executionClaimIsNotCompletionEvidence).toBe(true);
    expect(verification.verifiedCompleteRequiresDeclaredPostconditions).toBe(true);
    expect(verification.verifiedCompleteRequiresIndependentReadback).toBe(true);
    expect(verification.modelSelfReportCannotVerifyCompletion).toBe(true);
    expect(verification.duplicateExecutionAttemptsFailClosed).toBe(true);
    expect(verification.unknownPostStateNeverMeansComplete).toBe(true);
  });

  it('defines all eight verified shutdown requirements', () => {
    expect(E5_CONTROL_POLICY_OMEGA.shutdownRequirements).toHaveLength(8);
    expect(E5_CONTROL_POLICY_OMEGA.shutdownRequirements).toContain('SCHEDULED_JOBS_STOPPED');
    expect(E5_CONTROL_POLICY_OMEGA.shutdownRequirements).toContain('TEMP_CREDENTIALS_REVOKED');
    expect(E5_CONTROL_POLICY_OMEGA.shutdownRequirements).toContain('RESTART_PATH_DISABLED');
  });

  it('treats unknown world state as volatile and fails closed on stale assumptions', () => {
    expect(E5_CONTROL_POLICY_OMEGA.worldStateRefresh.unknownTreatment).toBe('TREAT_AS_VOLATILE');
    expect(E5_CONTROL_POLICY_OMEGA.worldStateRefresh.failureState).toBe('ACTION_BLOCKED_STALE_ASSUMPTION');
  });
});
