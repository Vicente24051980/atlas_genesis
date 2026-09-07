import { describe, expect, it } from 'vitest';
import { ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA } from './atlas-kernel-contract-registry-omega';
import { ATLAS_PERMISSIONS, E5_CONTROL_POLICY_OMEGA } from './e5-control-policy-omega';

describe('E5 Control Ω policy', () => {
  it('forbids automatic canon modification everywhere', () => {
    for (const permissions of Object.values(E5_CONTROL_POLICY_OMEGA.componentPermissions)) {
      expect(permissions.MODIFY_CANON).toBe('DENY');
    }
  });

  it('defines every required permission independently on every component', () => {
    expect(ATLAS_PERMISSIONS).toEqual([
      'READ', 'WRITE', 'CREATE', 'MODIFY', 'DELETE', 'EXECUTE', 'COMMUNICATE',
      'PURCHASE', 'FINANCIAL', 'LEGAL', 'IDENTITY', 'EXTERNAL_WEB', 'PERSONAL_DATA',
      'PERSIST', 'SCHEDULE', 'DELEGATE', 'MODIFY_CANON',
    ]);

    for (const permissions of Object.values(E5_CONTROL_POLICY_OMEGA.componentPermissions)) {
      for (const permission of ATLAS_PERMISSIONS) {
        expect(permissions).toHaveProperty(permission);
      }
    }
  });

  it('keeps the kernel permission registry identical to executable E5 policy', () => {
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.permissionModel.permissions).toEqual(ATLAS_PERMISSIONS);
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.permissionModel.sensitivePermissions).toEqual(
      E5_CONTROL_POLICY_OMEGA.sensitivePermissions,
    );
    expect(ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.permissionModel.standingSensitiveAuthorityAllowed).toBe(false);
    expect(
      ATLAS_KERNEL_CONTRACT_REGISTRY_OMEGA.permissionModel
        .requestScopedSensitiveElevationRequiresExplicitHumanOwnerScope,
    ).toBe(true);
  });

  it('does not let capability imply persistence, lifecycle, delegation, finance or identity', () => {
    const i = E5_CONTROL_POLICY_OMEGA.invariants;
    expect(i.writeDoesNotImplyPersist).toBe(true);
    expect(i.writeDoesNotImplyCreate).toBe(true);
    expect(i.writeDoesNotImplyModify).toBe(true);
    expect(i.writeDoesNotImplyDelete).toBe(true);
    expect(i.executeDoesNotImplySchedule).toBe(true);
    expect(i.executeDoesNotImplyDelegate).toBe(true);
    expect(i.executeDoesNotImplyFinancial).toBe(true);
    expect(i.communicateDoesNotImplyPersist).toBe(true);
    expect(i.communicateDoesNotImplyIdentity).toBe(true);
    expect(i.externalWebDoesNotImplyPersonalData).toBe(true);
    expect(i.canPredictVicenteDoesNotImplyCanRepresentVicente).toBe(true);
    expect(i.noPermissionImpliedByAnother).toBe(true);
  });

  it('grants no standing sensitive authority to automated components', () => {
    for (const permissions of Object.values(E5_CONTROL_POLICY_OMEGA.componentPermissions)) {
      for (const permission of E5_CONTROL_POLICY_OMEGA.sensitivePermissions) {
        expect(permissions[permission]).not.toBe('ALLOW');
      }
    }
    expect(E5_CONTROL_POLICY_OMEGA.requestScopedElevation.standingAllowForSensitivePermissions).toBe(false);
    expect(E5_CONTROL_POLICY_OMEGA.requestScopedElevation.authoritySource).toBe('EXPLICIT_HUMAN_OWNER_SCOPE_ONLY');
    expect(E5_CONTROL_POLICY_OMEGA.requestScopedElevation.predictiveAccuracyCanSatisfyApproval).toBe(false);
  });

  it('allows public-web evidence acquisition only on explicitly named evidence/research/assurance roles', () => {
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.R0_RESEARCH.EXTERNAL_WEB).toBe('ALLOW');
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E1_EVIDENCE.EXTERNAL_WEB).toBe('ALLOW');
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E6_ASSURANCE.EXTERNAL_WEB).toBe('ALLOW');
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.MONITOR.EXTERNAL_WEB).toBe('ALLOW');
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E4_DECISION.EXTERNAL_WEB).toBe('DENY');
  });

  it('requires human approval for scheduling/delegation in E5', () => {
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E5_CONTROL.SCHEDULE).toBe('HUMAN_APPROVAL_REQUIRED');
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E5_CONTROL.DELEGATE).toBe('HUMAN_APPROVAL_REQUIRED');
  });

  it('keeps E4 decision from directly executing or changing financial state', () => {
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E4_DECISION.EXECUTE).toBe('DENY');
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E4_DECISION.FINANCIAL).toBe('DENY');
    expect(E5_CONTROL_POLICY_OMEGA.componentPermissions.E4_DECISION.PURCHASE).toBe('DENY');
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
