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

// E5/E4 hosted AI policy evaluator; consumes admitted evidence, never admits it.
import { evidenceUsable, type EvidenceStamp } from './scenario-owner-return-omega';
export type AiPositionEvidence = {
  entityId: string; weight: number;
  classification: 'AI_CORE' | 'AI_TIER2_SENSITIVITY' | 'NON_AI' | 'AI_CLASSIFICATION_UNKNOWN';
  evidence: EvidenceStamp;
  directAiDependency?: {basis:'REVENUE'|'GROSS_PROFIT'|'DOMINANT_THESIS'; fraction:number};
};
export const AI_OVERRIDE_CONDITIONS = ['momentum','fundamentals','revisions','expectedReturn','expectationGap','correlatedStress'] as const;
export type AiControlRequest = {
  asOf: string; decisionId: string; action: 'INCREASE' | 'PASSIVE_DRIFT' | 'REVIEW';
  positions: AiPositionEvidence[]; cashWeight: number;
  conditions?: Partial<Record<typeof AI_OVERRIDE_CONDITIONS[number], { passed: boolean; evidence: EvidenceStamp }>>;
  humanApproval?: { decisionId: string; sizingScope: string; approved: boolean; evidence: EvidenceStamp };
};
export type AiControlResult = {
  status: 'WITHIN_CEILING' | 'AI_OVER_30_JUSTIFIED' | 'AI_OVER_30_REVIEW' | 'BLOCKED' | 'EVIDENCE_PENDING';
  aiCoreWeight: number | null; unknownWeight: number | null;
  override: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN'; allowsIncrease: boolean;
  autoSell: false; reasons: string[];
};
export function aiSizingScope(req: AiControlRequest): string {
  return JSON.stringify({decisionId:req.decisionId,asOf:req.asOf,action:req.action,cashWeight:req.cashWeight,
    positions:req.positions.map(p=>({entityId:p.entityId.trim().toUpperCase(),weight:p.weight,classification:p.classification})).sort((a,b)=>a.entityId.localeCompare(b.entityId))});
}
export function evaluateAiExposureControl(req: AiControlRequest): AiControlResult {
  const pending=(reason:string):AiControlResult=>({status:'EVIDENCE_PENDING',aiCoreWeight:null,unknownWeight:null,override:'UNKNOWN',allowsIncrease:false,autoSell:false,reasons:[reason]});
  if (!req || !req.decisionId?.trim() || !Number.isFinite(Date.parse(req.asOf)) || !['INCREASE','PASSIVE_DRIFT','REVIEW'].includes(req.action) || !Array.isArray(req.positions) || !Number.isFinite(req.cashWeight) || req.cashWeight<0 || req.cashWeight>1) return pending('INVALID_REQUEST');
  const entities=new Set<string>(); let core=0,unknown=0,total=req.cashWeight;
  for (const p of req.positions) {
    const entity=p?.entityId?.trim().toUpperCase();
    if (!entity || entities.has(entity) || !Number.isFinite(p.weight) || p.weight<0 || p.weight>1 || !['AI_CORE','AI_TIER2_SENSITIVITY','NON_AI','AI_CLASSIFICATION_UNKNOWN'].includes(p.classification)) return pending('INVALID_POSITION');
    entities.add(entity);total+=p.weight;
    if (p.classification==='AI_CLASSIFICATION_UNKNOWN' || !evidenceUsable(p.evidence,req.asOf)) unknown+=p.weight;
    else if (p.classification==='AI_CORE') {
      const d=p.directAiDependency;
      if (!d || !['REVENUE','GROSS_PROFIT','DOMINANT_THESIS'].includes(d.basis) || !Number.isFinite(d.fraction) || d.fraction<=0.5 || d.fraction>1) unknown+=p.weight;
      else core+=p.weight;
    }
  }
  if (Math.abs(total-1)>1e-8) return pending('WEIGHTS_AND_CASH_MUST_SUM_TO_ONE');
  if (unknown>0) return {...pending('CLASSIFICATION_EVIDENCE_PENDING'),aiCoreWeight:core,unknownWeight:unknown};
  const result=(status:AiControlResult['status'],override:AiControlResult['override'],allowsIncrease:boolean,reasons:string[]):AiControlResult=>({status,override,allowsIncrease,aiCoreWeight:core,unknownWeight:0,autoSell:false,reasons});
  if (core<=0.30+1e-10) return result('WITHIN_CEILING','INACTIVE',true,[]);
  const failed: string[]=AI_OVERRIDE_CONDITIONS.filter(k=>req.conditions?.[k]?.passed!==true || !evidenceUsable(req.conditions[k].evidence,req.asOf));
  const approved=req.humanApproval?.approved===true && req.humanApproval.decisionId===req.decisionId && req.humanApproval.sizingScope===aiSizingScope(req) && evidenceUsable(req.humanApproval.evidence,req.asOf);
  if (req.action==='INCREASE' && !approved) failed.push('humanApproval');
  if (failed.length) return result(req.action==='INCREASE'?'BLOCKED':'AI_OVER_30_REVIEW','INACTIVE',false,failed);
  return result('AI_OVER_30_JUSTIFIED','ACTIVE',req.action==='INCREASE' && approved,[]);
}
