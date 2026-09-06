import {
  falsifyDeltaIndependence,
  type DeltaFalsationResult,
  type DeltaHardenedPass,
} from './delta-divergence-falsation-omega';

export const DELTA_PRECONDITIONS_OMEGA_VERSION = '2026-09-05-v1.2.0' as const;
export const DELTA_MIN_PASSES = 5 as const;

export interface DeltaExecutionSeal {
  executionId: string;
  question: string;
  atomicClauseCount: number;
  plannedPassCount: number;
  alignedEvidenceGraphId: string;
  evidenceSnapshotHash: string;
  phi2aCoverageCertified: boolean;
  phi2aCoverageCertificateId?: string | null;
  orchestrationAuthorityId: string;
  independentAuthorityIds?: string[];
}

export type DeltaPreconditionCode =
  | 'PASS'
  | 'INSUFFICIENT_PASSES'
  | 'PASS_COUNT_MISMATCH'
  | 'COMPOSITE_QUESTION_REJECTED'
  | 'COVERAGE_NOT_CERTIFIED'
  | 'EVIDENCE_GRAPH_MISMATCH'
  | 'EVIDENCE_SNAPSHOT_MISMATCH'
  | 'COMMON_ORCHESTRATOR_ONLY';

export interface DeltaPreconditionFinding {
  code: DeltaPreconditionCode;
  severity: 'BLOCK' | 'SHADOW' | 'INFO';
  detail: string;
}

export interface DeltaPreconditionResult {
  state: 'NO_MEDIBLE' | 'SHADOW_ONLY' | 'ELIGIBLE_FOR_FALSATION';
  findings: DeltaPreconditionFinding[];
  downstream: DeltaFalsationResult | null;
  coreConfidenceEligible: boolean;
}

export function evaluateDeltaPreconditions(
  passes: readonly DeltaHardenedPass[],
  seal: DeltaExecutionSeal,
): DeltaPreconditionResult {
  const findings: DeltaPreconditionFinding[] = [];
  if (passes.length < DELTA_MIN_PASSES) findings.push({ code:'INSUFFICIENT_PASSES', severity:'BLOCK', detail:`Δ requires at least ${DELTA_MIN_PASSES} passes.` });
  if (seal.plannedPassCount !== passes.length) findings.push({ code:'PASS_COUNT_MISMATCH', severity:'BLOCK', detail:'Actual pass count differs from pre-sealed pass count.' });
  if (seal.atomicClauseCount !== 1) findings.push({ code:'COMPOSITE_QUESTION_REJECTED', severity:'BLOCK', detail:'PREU requires exactly one atomic clause per Δ execution.' });
  if (!seal.phi2aCoverageCertified || !seal.phi2aCoverageCertificateId?.trim()) findings.push({ code:'COVERAGE_NOT_CERTIFIED', severity:'BLOCK', detail:'Φ₂a evidence coverage must be certified before Δ runs.' });
  if (passes.some(p => p.alignedEvidenceGraphId !== seal.alignedEvidenceGraphId || p.lineage.evidenceGraphId !== seal.alignedEvidenceGraphId)) findings.push({ code:'EVIDENCE_GRAPH_MISMATCH', severity:'BLOCK', detail:'Every pass must consume the pre-sealed Aligned Evidence Graph.' });
  if (passes.some(p => p.lineage.evidenceSnapshotHash !== seal.evidenceSnapshotHash)) findings.push({ code:'EVIDENCE_SNAPSHOT_MISMATCH', severity:'BLOCK', detail:'Every pass must consume the same frozen evidence snapshot.' });

  const authorities = new Set(seal.independentAuthorityIds ?? []);
  if (authorities.size < DELTA_MIN_PASSES || authorities.has(seal.orchestrationAuthorityId)) {
    findings.push({ code:'COMMON_ORCHESTRATOR_ONLY', severity:'SHADOW', detail:'Heterogeneous authority domains are not proven; result may only be SHADOW.' });
  }

  if (findings.some(f => f.severity === 'BLOCK')) return { state:'NO_MEDIBLE', findings, downstream:null, coreConfidenceEligible:false };

  const downstream = falsifyDeltaIndependence(passes);
  const shadow = findings.some(f => f.severity === 'SHADOW') || downstream.state !== 'MEDIBLE';
  if (shadow) return { state:'SHADOW_ONLY', findings:[...findings, ...downstream.findings.map(f=>({code:'PASS' as const,severity:f.severity==='BLOCK'?'BLOCK' as const:'SHADOW' as const,detail:`Downstream: ${f.code} — ${f.detail}`}))], downstream, coreConfidenceEligible:false };

  return { state:'ELIGIBLE_FOR_FALSATION', findings:[{code:'PASS',severity:'INFO',detail:'Residual Δ preconditions passed.'}], downstream, coreConfidenceEligible:downstream.coreConfidenceEligible };
}
