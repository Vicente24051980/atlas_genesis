import {
  auditFrozenRankingBySize,
  evaluateSizeNeutralReturn,
  type SizeNeutralReturnInput,
} from './size-neutral-return-ranking-omega';

const base: SizeNeutralReturnInput = {
  ticker: 'BASE',
  evidenceTraceable: true,
  evidenceIds: ['filing-q2', 'cashflow-q2'],
  economicProof: 90,
  cashEfficiency: 88,
  growthAcceleration: 86,
  expectedReturnValuation: 84,
  consensusRevisions: 82,
  moneyRotation: 80,
  momentumBreadth: 78,
  dislocationAsymmetry: 76,
  specialistEngineCapture: 74,
  riskDurability: 72,
};

describe('Size-Neutral Return Ranking Omega', () => {
  it('starts from zero and sums ten universal blocks to a 0..1000 score', () => {
    const zero = evaluateSizeNeutralReturn({
      ...base,
      ticker: 'ZERO',
      economicProof: 0,
      cashEfficiency: 0,
      growthAcceleration: 0,
      expectedReturnValuation: 0,
      consensusRevisions: 0,
      moneyRotation: 0,
      momentumBreadth: 0,
      dislocationAsymmetry: 0,
      specialistEngineCapture: 0,
      riskDurability: 0,
    });
    const perfect = evaluateSizeNeutralReturn({
      ...base,
      ticker: 'PERFECT',
      economicProof: 100,
      cashEfficiency: 100,
      growthAcceleration: 100,
      expectedReturnValuation: 100,
      consensusRevisions: 100,
      moneyRotation: 100,
      momentumBreadth: 100,
      dislocationAsymmetry: 100,
      specialistEngineCapture: 100,
      riskDurability: 100,
    });
    expect(zero.score).toBe(0);
    expect(perfect.score).toBe(1000);
  });

  it('gives identical scores to a mosquito and dinosaur with identical economics', () => {
    const mosquito = evaluateSizeNeutralReturn({ ...base, ticker: 'SMALL', marketCapUsd: 5e9 });
    const dinosaur = evaluateSizeNeutralReturn({ ...base, ticker: 'MEGA', marketCapUsd: 5e12 });
    expect(mosquito.score).toBe(dinosaur.score);
    expect(mosquito.businessScore).toBe(dinosaur.businessScore);
    expect(mosquito.opportunityScore).toBe(dinosaur.opportunityScore);
    expect(mosquito.sizeBucket).toBe('MOSQUITO');
    expect(dinosaur.sizeBucket).toBe('DINOSAURIO');
    expect(mosquito.sizeWasUsedInScore).toBe(false);
    expect(dinosaur.sizeWasUsedInScore).toBe(false);
  });

  it('blocks hidden prestige and market-cap scoring proxies', () => {
    expect(() => evaluateSizeNeutralReturn({
      ...base,
      marketCapScore: 100,
    } as SizeNeutralReturnInput)).toThrow('SIZE_NEUTRALITY_VIOLATION:marketCapScore');

    expect(() => evaluateSizeNeutralReturn({
      ...base,
      qualityScore: 100,
    } as SizeNeutralReturnInput)).toThrow('SIZE_NEUTRALITY_VIOLATION:qualityScore');
  });

  it('uses Growth Saturation Omega only when economics justify it', () => {
    const unsaturated = evaluateSizeNeutralReturn({ ...base, growthAcceleration: 90 });
    const saturated = evaluateSizeNeutralReturn({
      ...base,
      growthAcceleration: 90,
      growthSaturationPenalty: 30,
    });
    expect(unsaturated.growthAccelerationAdjusted).toBe(90);
    expect(saturated.growthAccelerationAdjusted).toBe(60);
    expect(saturated.score).toBe(unsaturated.score - 30);
  });

  it('keeps Falsifiers Omega as an absolute veto without erasing diagnostics', () => {
    const result = evaluateSizeNeutralReturn({
      ...base,
      falsifierVeto: true,
      falsifierReasons: ['accounting evidence invalidated'],
    });
    expect(result.score).toBeGreaterThan(0);
    expect(result.verdict).toBe('FALSIFIER_VETO');
    expect(result.eligibleForRanking).toBe(false);
  });

  it('requires traceable evidence before a score can enter the confirmed ranking', () => {
    const result = evaluateSizeNeutralReturn({
      ...base,
      evidenceTraceable: false,
      evidenceIds: [],
    });
    expect(result.verdict).toBe('EVIDENCE_PENDING');
    expect(result.eligibleForRanking).toBe(false);
  });

  it('audits size distribution only after frozen scores and never adjusts them', () => {
    const results = [
      evaluateSizeNeutralReturn({ ...base, ticker: 'M1', marketCapUsd: 4e9 }),
      evaluateSizeNeutralReturn({ ...base, ticker: 'P1', marketCapUsd: 40e9 }),
      evaluateSizeNeutralReturn({ ...base, ticker: 'E1', marketCapUsd: 400e9 }),
      evaluateSizeNeutralReturn({ ...base, ticker: 'D1', marketCapUsd: 4e12 }),
    ];
    const before = results.map((result) => result.score);
    const audit = auditFrozenRankingBySize(results);
    const after = results.map((result) => result.score);

    expect(before).toEqual(after);
    expect(audit.bySize.MOSQUITO).toBe(1);
    expect(audit.bySize.PERIQUITO).toBe(1);
    expect(audit.bySize.ELEFANTE).toBe(1);
    expect(audit.bySize.DINOSAURIO).toBe(1);
    expect(audit.neutralityInvariant).toBe(true);
  });
});
