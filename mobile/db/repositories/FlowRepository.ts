import type { TerminalBundle } from '../../core/api/atlasApi';
import { db } from '../client';
import { auditSnapshot, engineResult } from '../schema';

const uid=(p:string,t:string)=>`${p}-${t}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
export const FlowRepository={
  async persist(companyId:string,ticker:string,bundle:TerminalBundle){
    const s=bundle.marketSignals;
    if(s.status!=='OK'||s.flowScore==null||!s.algorithmVersion)return;
    const auditId=uid('AUDIT-FLOW',ticker);const createdAt=new Date(bundle.generatedAt);
    await db.insert(auditSnapshot).values({id:auditId,companyId,algorithmVersion:s.algorithmVersion,status:'PASS',inputManifestJson:JSON.stringify({ret5:s.metrics?.ret5,ret20:s.metrics?.ret20,volumeRatio:s.metrics?.volumeRatio,streak:s.streak}),outputManifestJson:JSON.stringify({flowScore:s.flowScore,flowState:s.flowState}),explanationJson:JSON.stringify({reasons:s.reasons,guardrail:s.guardrail}),createdAt});
    await db.insert(engineResult).values({id:uid('ENGINE-FLOW',ticker),auditSnapshotId:auditId,companyId,engine:'FLOW_LITE',score:s.flowScore,state:s.flowState||'NEUTRAL',algorithmVersion:s.algorithmVersion,inputsJson:JSON.stringify(s.metrics||{}),explanationJson:JSON.stringify({reasons:s.reasons,guardrail:s.guardrail}),evidenceRefsJson:'[]',createdAt});
  }
};
