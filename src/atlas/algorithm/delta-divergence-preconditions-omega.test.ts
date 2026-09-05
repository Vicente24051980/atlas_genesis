import { describe, expect, it } from 'vitest';
import { evaluateDeltaPreconditions, type DeltaExecutionSeal } from './delta-divergence-preconditions-omega';
import type { DeltaHardenedPass } from './delta-divergence-falsation-omega';

function p(i:number): DeltaHardenedPass {
  const id=`e${i}`;
  return {
    evaluatorId:id, alignedEvidenceGraphId:'graph', independent:true,
    probability:0.40+i*0.08, confidence:0.70+i*0.01,
    dimensionProbabilities:{ thesis:0.40+i*0.08 },
    lineage:{ evaluatorId:id, modelFamilyId:`f${i}`, modelInstanceId:`m${i}`, promptLineageId:`p${i}`, reasoningTemplateId:`r${i}`, evidenceGraphId:'graph', evidenceSnapshotHash:'snap', upstreamProviderIds:[`src${i}`], independenceAttestationId:`att${i}` },
  };
}
const passes=[0,1,2,3,4].map(p);
const seal:DeltaExecutionSeal={ executionId:'d1',question:'P(revenue growth >= 20% YoY at FY27 close)',atomicClauseCount:1,plannedPassCount:5,alignedEvidenceGraphId:'graph',evidenceSnapshotHash:'snap',phi2aCoverageCertified:true,phi2aCoverageCertificateId:'phi2a-cert',orchestrationAuthorityId:'atlas-orchestrator',independentAuthorityIds:['a','b','c','d','e'] };

describe('Δ residual falsation gaps',()=>{
  it('D5 blocks N<5',()=>{ const o=evaluateDeltaPreconditions(passes.slice(0,4),{...seal,plannedPassCount:4}); expect(o.state).toBe('NO_MEDIBLE'); expect(o.findings.map(f=>f.code)).toContain('INSUFFICIENT_PASSES'); });
  it('D9 blocks post-hoc pass selection',()=>{ const o=evaluateDeltaPreconditions(passes,{...seal,plannedPassCount:6}); expect(o.findings.map(f=>f.code)).toContain('PASS_COUNT_MISMATCH'); });
  it('D7 rejects composite questions',()=>{ const o=evaluateDeltaPreconditions(passes,{...seal,atomicClauseCount:2}); expect(o.findings.map(f=>f.code)).toContain('COMPOSITE_QUESTION_REJECTED'); });
  it('D6 blocks uncertified shared ignorance',()=>{ const o=evaluateDeltaPreconditions(passes,{...seal,phi2aCoverageCertified:false,phi2aCoverageCertificateId:null}); expect(o.findings.map(f=>f.code)).toContain('COVERAGE_NOT_CERTIFIED'); });
  it('D2 rejects evidence mismatch',()=>{ const bad=[...passes]; bad[2]={...bad[2],lineage:{...bad[2].lineage,evidenceSnapshotHash:'other'}}; const o=evaluateDeltaPreconditions(bad,seal); expect(o.findings.map(f=>f.code)).toContain('EVIDENCE_SNAPSHOT_MISMATCH'); });
  it('same orchestrator remains SHADOW_ONLY even when all mechanical preconditions pass',()=>{ const o=evaluateDeltaPreconditions(passes,{...seal,independentAuthorityIds:['atlas-orchestrator','b','c','d','e']}); expect(o.state).toBe('SHADOW_ONLY'); expect(o.coreConfidenceEligible).toBe(false); });
});
