import { evaluateStructuralTierPriority } from './structural-tier-priority-omega';

describe('Structural Tier Priority Ω', () => {
  it('assigns S only with elite quality, E3+ proof, moat, funding and controlled fragility', () => {
    const result = evaluateStructuralTierPriority({
      evidenceTraceable: true,
      evidenceIds: ['10q', 'earnings-release', 'segment-note'],
      businessQualityScore: 97,
      economicProofLevel: 4,
      forwardMoatScore: 94,
      reinvestmentRunwayScore: 94,
      perShareEconomicsScore: 92,
      fundingRobustnessScore: 95,
      structuralFragilityScore: 35,
    });

    expect(result.tier).toBe('S');
    expect(result.portfolioAction).toBe('NOT_AUTHORIZED_BY_STRUCTURAL_TIER');
  });

  it('keeps a structurally elite company separate from an open event gate', () => {
    const result = evaluateStructuralTierPriority({
      evidenceTraceable: true,
      evidenceIds: ['10q', 'earnings-release', 'investor-presentation'],
      businessQualityScore: 98,
      economicProofLevel: 4,
      forwardMoatScore: 96,
      reinvestmentRunwayScore: 95,
      perShareEconomicsScore: 90,
      fundingRobustnessScore: 96,
      structuralFragilityScore: 40,
      eventGateOpen: true,
    });

    expect(result.tier).toBe('S');
    expect(result.eventGateOpen).toBe(true);
    expect(result.capitalDecisionAuthority).toBe('NONE');
  });

  it('caps pre-commercial narratives below B+', () => {
    const result = evaluateStructuralTierPriority({
      evidenceTraceable: true,
      evidenceIds: ['source-a', 'source-b', 'source-c'],
      businessQualityScore: 95,
      economicProofLevel: 1,
      forwardMoatScore: 90,
      reinvestmentRunwayScore: 95,
      perShareEconomicsScore: 70,
      fundingRobustnessScore: 80,
      structuralFragilityScore: 40,
    });

    expect(result.tier).toBe('BELOW_B_PLUS');
  });

  it('applies an absolute structural falsifier veto', () => {
    const result = evaluateStructuralTierPriority({
      evidenceTraceable: true,
      evidenceIds: ['10k', 'regulator', 'counterparty'],
      businessQualityScore: 99,
      economicProofLevel: 4,
      forwardMoatScore: 95,
      reinvestmentRunwayScore: 95,
      perShareEconomicsScore: 95,
      fundingRobustnessScore: 95,
      structuralFragilityScore: 20,
      confirmedStructuralFalsifier: true,
    });

    expect(result.tier).toBe('BELOW_B_PLUS');
  });

  it('returns evidence pending when the evidence quorum is insufficient', () => {
    const result = evaluateStructuralTierPriority({
      evidenceTraceable: true,
      evidenceIds: ['only-one'],
      businessQualityScore: 90,
      economicProofLevel: 4,
      forwardMoatScore: 90,
      reinvestmentRunwayScore: 90,
      perShareEconomicsScore: 90,
      fundingRobustnessScore: 90,
      structuralFragilityScore: 30,
    });

    expect(result.tier).toBe('EVIDENCE_PENDING');
  });
});
