export const E5_CONTROL_POLICY_OMEGA_VERSION = '2026-09-07-v1.0.0' as const;

export const ATLAS_PERMISSIONS = [
  'READ',
  'WRITE',
  'EXECUTE',
  'COMMUNICATE',
  'PERSIST',
  'SCHEDULE',
  'DELEGATE',
  'MODIFY_CANON',
] as const;

export type AtlasPermission = (typeof ATLAS_PERMISSIONS)[number];
export type PermissionState = 'ALLOW' | 'DENY' | 'HUMAN_APPROVAL_REQUIRED';

const denyAutomaticCanonWrite = {
  MODIFY_CANON: 'DENY',
} as const;

export const E5_CONTROL_POLICY_OMEGA = {
  kind: 'E5_CONTROL_CONFIGURATION_NOT_NEW_ENGINE',
  owner: 'E5_CONTROL_OMEGA',
  invariants: {
    noPermissionImpliedByAnother: true,
    writeDoesNotImplyPersist: true,
    executeDoesNotImplySchedule: true,
    communicateDoesNotImplyDelegate: true,
    predictiveAccuracyCannotExpandPermissions: true,
    automaticCanonWriteForbidden: true,
    liveMaterialActionRequiresSpecificHumanApproval: true,
  },
  componentPermissions: {
    R0_RESEARCH: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
    E1_EVIDENCE: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'ALLOW', SCHEDULE: 'DENY', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
    E2_ASSESSMENT: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
    E3_GATE: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
    E4_DECISION: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'DENY', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
    E5_CONTROL: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'DENY', COMMUNICATE: 'ALLOW',
      PERSIST: 'ALLOW', SCHEDULE: 'HUMAN_APPROVAL_REQUIRED', DELEGATE: 'HUMAN_APPROVAL_REQUIRED', ...denyAutomaticCanonWrite,
    },
    E6_ASSURANCE: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'ALLOW', SCHEDULE: 'DENY', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
    HYPOTHESIS_GENERATOR: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'DENY', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
    SCHEDULER: {
      READ: 'ALLOW', WRITE: 'DENY', EXECUTE: 'DENY', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'HUMAN_APPROVAL_REQUIRED', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
    MONITOR: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'ALLOW',
      PERSIST: 'ALLOW', SCHEDULE: 'DENY', DELEGATE: 'DENY', ...denyAutomaticCanonWrite,
    },
  },
  protectedObjects: [
    'ATLAS_IDENTITY',
    'CANONICAL_MEMORY',
    'DECISION_HISTORY',
    'PROVENANCE_PIT',
    'VICENTE_MODEL',
    'DECISION_RECONSTRUCTION',
    'PERMISSION_LEDGER',
  ],
  shutdownRequirements: [
    'MAIN_PROCESS_STOPPED',
    'SUBAGENTS_STOPPED',
    'SCHEDULED_JOBS_STOPPED',
    'RETRY_QUEUES_STOPPED',
    'TEMP_CREDENTIALS_REVOKED',
    'PENDING_ACTIONS_CANCELLED_OR_ORPHANED_WITH_HUMAN_NOTICE',
    'EXTERNAL_STATE_ACCOUNTED_FOR',
    'RESTART_PATH_DISABLED',
  ],
  worldStateRefresh: {
    classes: ['STABLE', 'TIME_SENSITIVE', 'VOLATILE', 'UNKNOWN'],
    unknownTreatment: 'TREAT_AS_VOLATILE',
    beforeMaterialAction: ['REFRESH_TIME_SENSITIVE', 'REFRESH_VOLATILE', 'REFRESH_UNKNOWN'],
    failureState: 'ACTION_BLOCKED_STALE_ASSUMPTION',
  },
} as const;
