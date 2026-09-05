import { describe, expect, it } from 'vitest';
import { falsifyDeltaIndependence, type DeltaHardenedPass } from './delta-divergence-falsation-omega';

function p(id:string, probability:number, family:string, provider:string): DeltaHardenedPass {
  return {
    evaluatorId:id, alignedEvidenceGraphId:'g', independent:true, probability, confidence:0.7,
    dimensionProbabilities:{ thesis: probability },
    lineage:{
      evaluatorId:id, modelFamilyId:family, modelInstanceId:`i-${id}`, promptLineageId:`p-${id}`,
      reasoningTemplateId:`r-${id}`, evidenceGraphId:'g', evidenceSnapshotHash:'snap',
      upstreamProviderIds:[provider], independenceAttestationId:`att-${id}`,
    },
  };
}

describe('Δ D9 boundary normalization attack', () => {
  it('degrades near-one mean with nonzero dispersion to SHADOW_ONLY', () => {
    const out = falsifyDeltaIndependence([
      p('a',1.00,'fa','SEC'),
      p('b',0.99,'fb','COMPANY'),
      p('c',0.96,'fc','TRANSCRIPT'),
    ]);
    expect(out.shadowDelta?.meanProbability as number).toBeGreaterThanOrEqual(0.98);
    expect(out.shadowDelta?.dOmega as number).toBeGreaterThan(0);
    expect(out.state).toBe('SHADOW_ONLY');
    expect(out.findings.map(f=>f.code)).toContain('BOUNDARY_NORMALIZATION_UNSTABLE');
    expect(out.coreConfidenceEligible).toBe(false);
  });
});
