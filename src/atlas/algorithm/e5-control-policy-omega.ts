export const E5_CONTROL_POLICY_OMEGA_VERSION = '2026-09-07-v1.1.0' as const;

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
    autonomyLevelCannotExpandComponentPermissions: true,
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
  agenticAutonomy: {
    status: 'CONTROL_POLICY_DOES_NOT_AUTO_PROMOTE_RUNTIME_AUTONOMY',
    runtimeReference: 'runtime/agentic_omega/execution_control.py',
    levels: {
      L0_READ_ONLY: {
        authority: 'READ_ONLY',
        externalMutation: false,
        humanApproval: false,
      },
      L1_PROPOSE: {
        authority: 'PREPARE_ACTION_NO_EXECUTION',
        externalMutation: false,
        humanApproval: false,
      },
      L2_SAFE_WRITE: {
        authority: 'REVERSIBLE_LOW_IMPACT_WRITE',
        externalMutation: true,
        humanApproval: false,
        requiresCompensationPlan: true,
      },
      L3_CONTROLLED_EXECUTION: {
        authority: 'MATERIAL_EXECUTION_WITH_E5_GATES_AND_E6_VERIFICATION',
        externalMutation: true,
        humanApproval: 'POLICY_DEPENDENT',
      },
      L4_HUMAN_APPROVAL_REQUIRED: {
        authority: 'HIGH_IMPACT_OR_SOVEREIGN_ACTION',
        externalMutation: true,
        humanApproval: true,
      },
    },
    mandatoryL4Domains: [
      'EXTERNAL',
      'FINANCIAL',
      'LEGAL',
      'MEDICAL',
      'CREDENTIAL',
      'PRODUCTION',
    ],
    verification: {
      executionClaimIsNotCompletionEvidence: true,
      verifiedCompleteRequiresDeclaredPostconditions: true,
      verifiedCompleteRequiresIndependentReadback: true,
      modelSelfReportCannotVerifyCompletion: true,
      writesRequireIdempotencyKey: true,
      duplicateExecutionAttemptsFailClosed: true,
      unknownPostStateNeverMeansComplete: true,
      reversibleFailureRequiresRollbackState: true,
      staleOrUnknownMaterialPreStateFailsClosed: true,
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
