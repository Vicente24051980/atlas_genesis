import {
  FUJIKURA_FURUKAWA_AI_OPTICS_CASES,
  assessAiInfrastructureRotation,
  rankAiInfrastructureRotation,
  type AiInfrastructureCompanyInput,
} from './ai-infrastructure-rotation-omega';

describe('AI Infrastructure Rotation Omega v1', () => {
  const [fujikura, furukawa] = FUJIKURA_FURUKAWA_AI_OPTICS_CASES;

  it('classifies Fujikura as discovered R5 instead of an early R3 opportunity', () => {
    expect(assessAiInfrastructureRotation(fujikura)).toMatchObject({
      company: 'Fujikura',
      phase: 'R5_DISCOVERED_BY_ATLAS_MAIN',
      decision: 'BUY_REVIEW',
    });
  });

  it('classifies Furukawa as the relative R4 to R5 opportunity', () => {
    expect(assessAiInfrastructureRotation(furukawa)).toMatchObject({
      company: 'Furukawa Electric',
      phase: 'R4_TO_R5_RELATIVE_OPPORTUNITY',
      decision: 'BUY_REVIEW',
    });
  });

  it('ranks Furukawa above Fujikura on relative opportunity despite lower pure business quality', () => {
    const ranking = rankAiInfrastructureRotation(FUJIKURA_FURUKAWA_AI_OPTICS_CASES);
    expect(ranking.map((result) => result.company)).toEqual(['Furukawa Electric', 'Fujikura']);
    expect(ranking[0].qualityComposite).toBeLessThan(ranking[1].qualityComposite);
    expect(ranking[0].opportunityScore).toBeGreaterThan(ranking[1].opportunityScore);
  });

  it('rejects rankings that mix incomparable AI infrastructure theses', () => {
    const mixed: readonly AiInfrastructureCompanyInput[] = [
      fujikura,
      { ...furukawa, id: 'FURUKAWA_GRID_MIXED_CASE', thesis: 'AI_POWER_GRID' },
    ];
    expect(() => rankAiInfrastructureRotation(mixed)).toThrow('ai_infra_rotation_ranking_requires_single_thesis');
  });

  it('rejects untraceable or structurally unconfirmed claims', () => {
    expect(assessAiInfrastructureRotation({
      ...furukawa,
      id: 'VAGUE_AI_WINNER',
      evidenceIds: ['single-blog-post'],
      structuralIntegrity: false,
    })).toMatchObject({
      phase: 'REJECT_INSUFFICIENT_EVIDENCE',
      decision: 'REJECT',
      reasons: expect.arrayContaining([
        'requires_at_least_two_traceable_evidence_ids',
        'structural_integrity_not_confirmed',
      ]),
    });
  });
});
