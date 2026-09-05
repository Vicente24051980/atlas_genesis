import { describe, expect, it } from 'vitest';
import {
  calculateHardenedCoreConfidence,
  falsifyDeltaIndependence,
  type DeltaHardenedPass,
} from './delta-divergence-falsation-omega';

const makePass = (id: string, probability: number, family: string, instance: string, prompt: string, template: string, providers: string[] = ['SEC','COMPANY']) : DeltaHardenedPass => ({
  evaluatorId: id,
  alignedEvidenceGraphId: 'graph-1',
  independent: true,
  probability,
  confidence: 0.75,
  dimensionProbabilities: { moat: probability, valuation: Math.max(0, probability - 0.1), expectations: Math.min(1, probability + 0.05) },
  lineage: {
    evaluatorId: id,
    modelFamilyId: family,
    modelInstanceId: instance,
    promptLineageId: prompt,
    reasoningTemplateId: template,
    evidenceGraphId: 'graph-1',
    evidenceSnapshotHash: 'snapshot-abc',
    upstreamProviderIds: providers,
    independenceAttestationId: `att-${id}`,
  },
});

const good = [
  makePass('fundamental', 0.84, 'family-a', 'instance-a', 'prompt-a', 'template-a', ['SEC','COMPANY']),
  makePass('expectations', 0.61, 'family-b', 'instance-b', 'prompt-b', 'template-b', ['SEC','TRANSCRIPTS']),
  makePass('bear-risk', 0.49, 'family-c', 'instance-c', 'prompt-c', 'template-c', ['SEC','MACRO']),
];

describe('Δ falsation matrix Ω', () => {
  it('D1 rejects declarative independence without auditable attestation', () => {
    const bad = good.map((p) => ({ ...p, lineage: { ...p.lineage, independenceAttestationId: null } }));
    const out = falsifyDeltaIndependence(bad);
    expect(out.state).toBe('NO_MEDIBLE');
    expect(out.findings.map((f) => f.code)).toContain('DECLARATIVE_INDEPENDENCE_ONLY');
    expect(out.coreConfidenceEligible).toBe(false);
  });

  it('D2 rejects shared model instance even with unique evaluator IDs', () => {
    const bad = good.map((p, i) => i === 2 ? ({ ...p, lineage: { ...p.lineage, modelInstanceId: 'instance-a' } }) : p);
    const out = falsifyDeltaIndependence(bad);
    expect(out.state).toBe('NO_MEDIBLE');
    expect(out.findings.map((f) => f.code)).toContain('SHARED_MODEL_INSTANCE');
  });

  it('D3 degrades shared model family to SHADOW_ONLY rather than canonical MEDIBLE', () => {
    const shadow = good.map((p) => ({ ...p, lineage: { ...p.lineage, modelFamilyId: 'same-family' } }));
    const out = falsifyDeltaIndependence(shadow);
    expect(out.state).toBe('SHADOW_ONLY');
    expect(out.shadowDelta?.state).toBe('MEDIBLE');
    expect(out.canonicalDelta).toBeNull();
    expect(out.coreConfidenceEligible).toBe(false);
  });

  it('D4 rejects shared prompt lineage and does not let personas manufacture independence', () => {
    const bad = good.map((p) => ({ ...p, lineage: { ...p.lineage, promptLineageId: 'same-prompt' } }));
    const out = falsifyDeltaIndependence(bad);
    expect(out.state).toBe('NO_MEDIBLE');
    expect(out.findings.map((f) => f.code)).toContain('SHARED_PROMPT_LINEAGE');
  });

  it('D5 shared upstream source set becomes SHADOW_ONLY because common-source risk remains', () => {
    const shadow = good.map((p) => ({ ...p, lineage: { ...p.lineage, upstreamProviderIds: ['SEC','COMPANY'] } }));
    const out = falsifyDeltaIndependence(shadow);
    expect(out.state).toBe('SHADOW_ONLY');
    expect(out.findings.map((f) => f.code)).toContain('SHARED_UPSTREAM_PROVIDER_SET');
  });

  it('D6 rejects different frozen evidence snapshots even if graph ID is the same', () => {
    const bad = good.map((p, i) => i === 1 ? ({ ...p, lineage: { ...p.lineage, evidenceSnapshotHash: 'snapshot-other' } }) : p);
    const out = falsifyDeltaIndependence(bad);
    expect(out.state).toBe('NO_MEDIBLE');
    expect(out.findings.map((f) => f.code)).toContain('EVIDENCE_SNAPSHOT_MISMATCH');
  });

  it('D7 rejects numerical near-duplicates', () => {
    const bad = [good[0], { ...good[0], evaluatorId: 'copy', lineage: { ...good[0].lineage, evaluatorId:'copy', modelFamilyId:'family-x', modelInstanceId:'instance-x', promptLineageId:'prompt-x', reasoningTemplateId:'template-x', independenceAttestationId:'att-copy' } }, good[2]];
    const out = falsifyDeltaIndependence(bad);
    expect(out.state).toBe('NO_MEDIBLE');
    expect(out.findings.map((f) => f.code)).toContain('NEAR_DUPLICATE_PASS');
  });

  it('D8 incomplete dimensions cannot be cherry-picked into canonical per-dimension disagreement', () => {
    const bad = good.map((p, i) => i === 2 ? ({ ...p, dimensionProbabilities: { moat: 0.49 } }) : p);
    const out = falsifyDeltaIndependence(bad);
    expect(out.state).toBe('SHADOW_ONLY');
    expect(out.findings.map((f) => f.code)).toContain('DIMENSION_CHERRY_PICK_RISK');
  });

  it('D10 fewer than three passes remains NO_MEDIBLE regardless of clean lineage', () => {
    const out = falsifyDeltaIndependence(good.slice(0,2));
    expect(out.state).toBe('NO_MEDIBLE');
    expect(out.findings.map((f) => f.code)).toContain('INSUFFICIENT_PASSES');
  });

  it('canonical MEDIBLE requires no block or shadow findings', () => {
    const out = falsifyDeltaIndependence(good);
    expect(out.state).toBe('MEDIBLE');
    expect(out.canonicalDelta?.state).toBe('MEDIBLE');
    expect(out.coreConfidenceEligible).toBe(true);
  });

  it('Core confidence fails closed for SHADOW_ONLY even when raw dispersion is numerically available', () => {
    const shadow = good.map((p) => ({ ...p, lineage: { ...p.lineage, modelFamilyId: 'same-family' } }));
    const delta = falsifyDeltaIndependence(shadow);
    const conf = calculateHardenedCoreConfidence([0.75,0.75,0.75], delta, { divergencePenaltyK:2, policyId:'test' });
    expect(conf.state).toBe('NO_MEDIBLE');
    expect(conf.effectiveConfidence).toBeNull();
  });
});
