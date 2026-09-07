export const E5_CONTROL_POLICY_OMEGA_VERSION = '2026-09-07-v1.1.0' as const;

/**
 * Capability and authority are intentionally orthogonal.
 *
 * WRITE is limited to producing/transformation of working state. It does not
 * imply durable persistence or lifecycle authority over named resources.
 * CREATE/MODIFY/DELETE govern resource lifecycle separately. PERSIST governs
 * append-only durable state on an already approved persistence surface.
 */
export const ATLAS_PERMISSIONS = [
  'READ',
  'WRITE',
  'CREATE',
  'MODIFY',
  'DELETE',
  'EXECUTE',
  'COMMUNICATE',
  'PURCHASE',
  'FINANCIAL',
  'LEGAL',
  'IDENTITY',
  'EXTERNAL_WEB',
  'PERSONAL_DATA',
  'PERSIST',
  'SCHEDULE',
  'DELEGATE',
  'MODIFY_CANON',
] as const;

export type AtlasPermission = (typeof ATLAS_PERMISSIONS)[number];
export type PermissionState = 'ALLOW' | 'DENY' | 'HUMAN_APPROVAL_REQUIRED';

const denyResourceLifecycle = {
  CREATE: 'DENY',
  MODIFY: 'DENY',
  DELETE: 'DENY',
} as const;

const denySensitiveStandingAuthority = {
  PURCHASE: 'DENY',
  FINANCIAL: 'DENY',
  LEGAL: 'DENY',
  IDENTITY: 'DENY',
  PERSONAL_DATA: 'DENY',
} as const;

const denyAutomaticCanonWrite = {
  MODIFY_CANON: 'DENY',
} as const;

const denyExtendedStandingAuthority = {
  ...denyResourceLifecycle,
  ...denySensitiveStandingAuthority,
  EXTERNAL_WEB: 'DENY',
} as const;

export const E5_CONTROL_POLICY_OMEGA = {
  kind: 'E5_CONTROL_CONFIGURATION_NOT_NEW_ENGINE',
  owner: 'E5_CONTROL_OMEGA',
  enforcementStatus: 'POLICY_ENCODED_RUNTIME_WIRING_PARTIAL',
  permissionSemantics: {
    READ: 'OBSERVE_AUTHORIZED_STATE',
    WRITE: 'PRODUCE_OR_TRANSFORM_WORKING_STATE_NOT_DURABLE_BY_ITSELF',
    CREATE: 'CREATE_NAMED_RESOURCE_OR_EXTERNAL_OBJECT',
    MODIFY: 'CHANGE_EXISTING_NAMED_RESOURCE_OR_EXTERNAL_OBJECT',
    DELETE: 'REMOVE_EXISTING_NAMED_RESOURCE_OR_EXTERNAL_OBJECT',
    EXECUTE: 'RUN_TOOL_OR_OPERATION_WITHOUT_IMPLIED_SIDE_EFFECT_AUTHORITY',
    COMMUNICATE: 'SEND_INFORMATION_TO_AN_EXTERNAL_OR_HUMAN_RECIPIENT',
    PURCHASE: 'COMMIT_SPEND_FOR_GOODS_OR_SERVICES',
    FINANCIAL: 'INITIATE_OR_CHANGE_REAL_FINANCIAL_STATE',
    LEGAL: 'CREATE_ACCEPT_SUBMIT_ORALTER_LEGAL_COMMITMENT',
    IDENTITY: 'REPRESENT_VICENTE_OR_ASSERT_IDENTITY_EXTERNALLY',
    EXTERNAL_WEB: 'ACCESS_PUBLIC_EXTERNAL_WEB_RESOURCES',
    PERSONAL_DATA: 'ACCESS_OR_PROCESS_PRIVATE_PERSONAL_DATA',
    PERSIST: 'APPEND_DURABLE_STATE_TO_AN_ALREADY_APPROVED_PERSISTENCE_SURFACE',
    SCHEDULE: 'CREATE_FUTURE_OR_RECURRING_EXECUTION',
    DELEGATE: 'CREATE_OR_CONTROL_SUBAGENT_OR_DELEGATED_WORKER',
    MODIFY_CANON: 'CHANGE_ATLAS_AUTHORITATIVE_CANON',
  },
  invariants: {
    noPermissionImpliedByAnother: true,
    writeDoesNotImplyPersist: true,
    writeDoesNotImplyCreate: true,
    writeDoesNotImplyModify: true,
    writeDoesNotImplyDelete: true,
    executeDoesNotImplySchedule: true,
    executeDoesNotImplyDelegate: true,
    executeDoesNotImplyFinancial: true,
    communicateDoesNotImplyPersist: true,
    communicateDoesNotImplyDelegate: true,
    communicateDoesNotImplyIdentity: true,
    externalWebDoesNotImplyPersonalData: true,
    canPredictVicenteDoesNotImplyCanRepresentVicente: true,
    predictiveAccuracyCannotExpandPermissions: true,
    automaticCanonWriteForbidden: true,
    liveMaterialActionRequiresSpecificHumanApproval: true,
  },
  sensitivePermissions: [
    'PURCHASE',
    'FINANCIAL',
    'LEGAL',
    'IDENTITY',
    'PERSONAL_DATA',
    'DELETE',
    'MODIFY_CANON',
  ] as const,
  requestScopedElevation: {
    standingAllowForSensitivePermissions: false,
    authoritySource: 'EXPLICIT_HUMAN_OWNER_SCOPE_ONLY',
    mustBeSpecificToAction: true,
    transferableToOtherActions: false,
    predictiveAccuracyCanSatisfyApproval: false,
    currentRuntimeWiring: 'PARTIAL_REQUIRES_CALLSITE_AUDIT',
  },
  componentPermissions: {
    R0_RESEARCH: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, EXTERNAL_WEB: 'ALLOW', ...denyAutomaticCanonWrite,
    },
    E1_EVIDENCE: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'ALLOW', SCHEDULE: 'DENY', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, EXTERNAL_WEB: 'ALLOW', ...denyAutomaticCanonWrite,
    },
    E2_ASSESSMENT: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, ...denyAutomaticCanonWrite,
    },
    E3_GATE: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, ...denyAutomaticCanonWrite,
    },
    E4_DECISION: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'DENY', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, ...denyAutomaticCanonWrite,
    },
    E5_CONTROL: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'DENY', COMMUNICATE: 'ALLOW',
      PERSIST: 'ALLOW', SCHEDULE: 'HUMAN_APPROVAL_REQUIRED', DELEGATE: 'HUMAN_APPROVAL_REQUIRED',
      ...denyExtendedStandingAuthority, ...denyAutomaticCanonWrite,
    },
    E6_ASSURANCE: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'DENY',
      PERSIST: 'ALLOW', SCHEDULE: 'DENY', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, EXTERNAL_WEB: 'ALLOW', ...denyAutomaticCanonWrite,
    },
    HYPOTHESIS_GENERATOR: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'DENY', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'DENY', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, ...denyAutomaticCanonWrite,
    },
    SCHEDULER: {
      READ: 'ALLOW', WRITE: 'DENY', EXECUTE: 'DENY', COMMUNICATE: 'DENY',
      PERSIST: 'DENY', SCHEDULE: 'HUMAN_APPROVAL_REQUIRED', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, ...denyAutomaticCanonWrite,
    },
    MONITOR: {
      READ: 'ALLOW', WRITE: 'ALLOW', EXECUTE: 'ALLOW', COMMUNICATE: 'ALLOW',
      PERSIST: 'ALLOW', SCHEDULE: 'DENY', DELEGATE: 'DENY',
      ...denyExtendedStandingAuthority, EXTERNAL_WEB: 'ALLOW', ...denyAutomaticCanonWrite,
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
