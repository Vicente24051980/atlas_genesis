import { describe, expect, it } from 'vitest';
import { certifyDeltaIndependenceAuthority } from './delta-independence-authority-omega';
import { falsifyDeltaIndependence, type DeltaHardenedPass } from './delta-divergence-falsation-omega';

function p(id:string, family:string, provider:string): DeltaHardenedPass {
  return {
    evaluatorId:id, alignedEvidenceGraphId:'g', independent:true, probability:id==='a'?0.8:id==='b'?0.6:0.4, confidence:0.7,
    dimensionProbabilities:{ thesis:id==='a'?0.8:id==='b'?0.6:0.4 },
    lineage:{ evaluatorId:id, modelFamilyId:family, modelInstanceId:`i-${id}`, promptLineageId:`p-${id}`, reasoningTemplateId:`r-${id}`,
      evidenceGraphId:'g', evidenceSnapshotHash:'snap', upstreamProviderIds:[provider], independenceAttestationId:`att-${id}` },
  };
}

const passes = [p('a','fa','SEC'),p('b','fb','COMPANY'),p('c','fc','TRANSCRIPT')];
const delta = falsifyDeltaIndependence(passes);

describe('Δ independence authority Ω', () => {
  it('defaults to SHADOW_ONLY when no external receipts exist', () => {
    const out = certifyDeltaIndependenceAuthority(delta,['a','b','c'],'snap',[],new Set());
    expect(out.state).toBe('SHADOW_ONLY');
    expect(out.coreConfidenceAuthorized).toBe(false);
  });

  it('rejects nominal separation under one execution and attestation domain', () => {
    const receipts = ['a','b','c'].map((id,i)=>({ evaluatorId:id, executionDomainId:'same-domain', attestationAuthorityId:'same-authority', verifierPublicKeyFingerprint:i<2?'key1':'key2', receiptHash:`h${i}`, evidenceSnapshotHash:'snap', issuedAt:'2026-09-05T06:00:00Z' }));
    const out = certifyDeltaIndependenceAuthority(delta,['a','b','c'],'snap',receipts,new Set(['key1','key2']));
    expect(out.state).toBe('SHADOW_ONLY');
    expect(out.reasons.join(' ')).toContain('execution domains');
    expect(out.reasons.join(' ')).toContain('attestation authorities');
  });

  it('authorizes canonical Δ only with multiple trusted administration domains', () => {
    const receipts = [
      { evaluatorId:'a', executionDomainId:'domain-1', attestationAuthorityId:'auth-1', verifierPublicKeyFingerprint:'key1', receiptHash:'h1', evidenceSnapshotHash:'snap', issuedAt:'2026-09-05T06:00:00Z' },
      { evaluatorId:'b', executionDomainId:'domain-2', attestationAuthorityId:'auth-2', verifierPublicKeyFingerprint:'key2', receiptHash:'h2', evidenceSnapshotHash:'snap', issuedAt:'2026-09-05T06:00:01Z' },
      { evaluatorId:'c', executionDomainId:'domain-2', attestationAuthorityId:'auth-2', verifierPublicKeyFingerprint:'key2', receiptHash:'h3', evidenceSnapshotHash:'snap', issuedAt:'2026-09-05T06:00:02Z' },
    ];
    const out = certifyDeltaIndependenceAuthority(delta,['a','b','c'],'snap',receipts,new Set(['key1','key2']));
    expect(out.state).toBe('CANONICAL_MEDIBLE');
    expect(out.coreConfidenceAuthorized).toBe(true);
  });
});
