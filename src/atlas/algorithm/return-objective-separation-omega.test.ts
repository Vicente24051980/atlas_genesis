import {
  evaluateReturnObjective,
  rankByReturnObjective,
  resolveReturnRankingObjective,
  type ReturnObjectiveInput,
} from './return-objective-separation-omega';

const base: Omit<ReturnObjectiveInput, 'ticker' | 'objective'> = {
  evidenceTraceable: true,
  evidenceIds: ['filing-q2', 'valuation-model'],
};

describe('Return Objective Separation Omega', () => {
  it('routes generic max-return language to forward EXPECTED_RETURN', () => {
    expect(resolveReturnRankingObjective('Tickers europeos con más retorno')).toBe('EXPECTED_RETURN');
    expect(resolveReturnRankingObjective('ordena por retorno')).toBe('EXPECTED_RETURN');
    expect(resolveReturnRankingObjective('máximo retorno futuro')).toBe('EXPECTED_RETURN');
  });

  it('routes explicitly backward-looking requests to HISTORICAL_RETURN', () => {
    expect(resolveReturnRankingObjective('mejores por rentabilidad 2026 YTD')).toBe('HISTORICAL_RETURN');
    expect(resolveReturnRankingObjective('qué acciones han subido más este último año')).toBe('HISTORICAL_RETURN');
  });

  it('keeps business quality on a separate ranking surface', () => {
    expect(resolveReturnRankingObjective('cuál es la mejor empresa por calidad del negocio')).toBe('BUSINESS_QUALITY');
  });

  it('ranks EXPECTED_RETURN by expected CAGR, not by company quality', () => {
    const highReturnLowerQuality = evaluateReturnObjective({
      ...base,
      ticker: 'HIGH_RETURN',
      objective: 'EXPECTED_RETURN',
      expectedHorizonYears: 3,
      expectedScenarios: [
        { probability: 0.25, totalReturnPct: -20 },
        { probability: 0.5, totalReturnPct: 120 },
        { probability: 0.25, totalReturnPct: 260 },
      ],
      businessQualityScore: 70,
      economicProofPassCount: 4,
      economicProofMaterialFail: false,
    });

    const lowerReturnBestQuality = evaluateReturnObjective({
      ...base,
      ticker: 'LOWER_RETURN',
      objective: 'EXPECTED_RETURN',
      expectedHorizonYears: 3,
      expectedScenarios: [
        { probability: 0.25, totalReturnPct: -5 },
        { probability: 0.5, totalReturnPct: 55 },
        { probability: 0.25, totalReturnPct: 100 },
      ],
      businessQualityScore: 100,
      economicProofPassCount: 5,
      economicProofMaterialFail: false,
    });

    const ranked = rankByReturnObjective([lowerReturnBestQuality, highReturnLowerQuality]);
    expect(ranked.map((item) => item.ticker)).toEqual(['HIGH_RETURN', 'LOWER_RETURN']);
    expect(highReturnLowerQuality.qualityWasUsedAsReturnBonus).toBe(false);
    expect(lowerReturnBestQuality.qualityWasUsedAsReturnBonus).toBe(false);
  });

  it('uses Economic Proof as a survival gate: 5/5 passes and non-material 4/5 passes', () => {
    const pass5 = evaluateReturnObjective({
      ...base,
      ticker: 'PASS5',
      objective: 'EXPECTED_RETURN',
      expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 100 }],
      economicProofPassCount: 5,
    });

    const pass4 = evaluateReturnObjective({
      ...base,
      ticker: 'PASS4',
      objective: 'EXPECTED_RETURN',
      expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 120 }],
      economicProofPassCount: 4,
      economicProofMaterialFail: false,
    });

    expect(pass5.verdict).toBe('RANK_ELIGIBLE');
    expect(pass5.economicProofGate).toBe('PASS_5_OF_5');
    expect(pass4.verdict).toBe('RANK_ELIGIBLE');
    expect(pass4.economicProofGate).toBe('PASS_4_OF_5');
  });

  it('rejects <=3/5 or a material 4/5 fail from the expected-return ranking', () => {
    const fail3 = evaluateReturnObjective({
      ...base,
      ticker: 'FAIL3',
      objective: 'EXPECTED_RETURN',
      expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 200 }],
      economicProofPassCount: 3,
    });

    const fail4Material = evaluateReturnObjective({
      ...base,
      ticker: 'FAIL4',
      objective: 'EXPECTED_RETURN',
      expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 220 }],
      economicProofPassCount: 4,
      economicProofMaterialFail: true,
    });

    expect(fail3.verdict).toBe('ECONOMIC_PROOF_REJECT');
    expect(fail4Material.verdict).toBe('ECONOMIC_PROOF_REJECT');
    expect(rankByReturnObjective([fail3, fail4Material])).toEqual([]);
  });

  it('ranks HISTORICAL_RETURN only by the verified past-window return', () => {
    const a = evaluateReturnObjective({
      ...base,
      ticker: 'A',
      objective: 'HISTORICAL_RETURN',
      historicalTotalReturnPct: 80,
      businessQualityScore: 20,
    });
    const b = evaluateReturnObjective({
      ...base,
      ticker: 'B',
      objective: 'HISTORICAL_RETURN',
      historicalTotalReturnPct: 30,
      businessQualityScore: 100,
    });

    expect(rankByReturnObjective([b, a]).map((item) => item.ticker)).toEqual(['A', 'B']);
  });

  it('marks composite opportunity as non-pure-return output', () => {
    const result = evaluateReturnObjective({
      ...base,
      ticker: 'COMPOSITE',
      objective: 'COMPOSITE_OPPORTUNITY',
      compositeOpportunityScore: 95,
    });

    expect(result.rankingMetric).toBe(95);
    expect(result.compositeMayAnswerPureReturnQuery).toBe(false);
    expect(result.reasons.join(' ')).toContain('not a pure-return ranking');
  });

  it('keeps Falsifiers Omega as an absolute veto', () => {
    const result = evaluateReturnObjective({
      ...base,
      ticker: 'VETO',
      objective: 'EXPECTED_RETURN',
      expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 300 }],
      economicProofPassCount: 5,
      falsifierVeto: true,
      falsifierReasons: ['structural accounting falsifier'],
    });

    expect(result.rankingMetric).not.toBeNull();
    expect(result.verdict).toBe('FALSIFIER_VETO');
    expect(result.eligibleForRanking).toBe(false);
  });
});
