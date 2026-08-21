import { evaluateReturnObjective, rankByReturnObjective, resolveReturnRankingObjective, type ReturnObjectiveInput } from './return-objective-separation-omega';

const integrity = {
  currentPrice: 100,
  currency: 'USD',
  primaryListing: 'NASDAQ',
  observationDate: '2026-08-21',
  observationType: 'OFFICIAL_CLOSE' as const,
  priceEvidenceId: 'official-price',
  corporateActionsReconciled: true,
  terminalTargetsRebuiltFromCurrentFundamentals: true,
  terminalTargetsSameCurrencyAndShareScale: true,
};

const base: Omit<ReturnObjectiveInput, 'ticker' | 'objective'> = {
  evidenceTraceable: true,
  evidenceIds: ['filing-q2', 'valuation-model'],
  expectedReturnIntegrity: integrity,
};

describe('Return Objective Separation Omega', () => {
  it('routes generic max-return language to forward EXPECTED_RETURN', () => {
    expect(resolveReturnRankingObjective('Tickers europeos con más retorno')).toBe('EXPECTED_RETURN');
    expect(resolveReturnRankingObjective('ordena por retorno')).toBe('EXPECTED_RETURN');
  });

  it('routes explicitly backward-looking requests to HISTORICAL_RETURN', () => {
    expect(resolveReturnRankingObjective('mejores por rentabilidad 2026 YTD')).toBe('HISTORICAL_RETURN');
  });

  it('ranks EXPECTED_RETURN by expected terminal capital CAGR, not company quality', () => {
    const high = evaluateReturnObjective({ ...base, ticker: 'HIGH', objective: 'EXPECTED_RETURN', expectedHorizonYears: 3,
      expectedScenarios: [{ probability: .2, totalReturnPct: -20 }, { probability: .6, totalReturnPct: 120 }, { probability: .2, totalReturnPct: 260 }],
      businessQualityScore: 70, economicProofPassCount: 4, economicProofMaterialFail: false });
    const low = evaluateReturnObjective({ ...base, ticker: 'LOW', objective: 'EXPECTED_RETURN', expectedHorizonYears: 3,
      expectedScenarios: [{ probability: .2, totalReturnPct: -5 }, { probability: .6, totalReturnPct: 55 }, { probability: .2, totalReturnPct: 100 }],
      businessQualityScore: 100, economicProofPassCount: 5 });
    expect(rankByReturnObjective([low, high]).map(x => x.ticker)).toEqual(['HIGH', 'LOW']);
  });

  it('fails closed when P0/P3 integrity metadata is missing', () => {
    const result = evaluateReturnObjective({
      ticker: 'STALE', objective: 'EXPECTED_RETURN', evidenceTraceable: true, evidenceIds: ['price', 'model'],
      expectedHorizonYears: 3, expectedScenarios: [{ probability: 1, totalReturnPct: 100 }], economicProofPassCount: 5,
    });
    expect(result.verdict).toBe('DATA_INTEGRITY_REJECT');
    expect(result.rankingMetric).toBeNull();
    expect(result.eligibleForRanking).toBe(false);
  });

  it('rejects inherited terminal targets after a P0 reset', () => {
    const result = evaluateReturnObjective({ ...base, ticker: 'OLD_TARGET', objective: 'EXPECTED_RETURN', expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 50 }], economicProofPassCount: 5,
      expectedReturnIntegrity: { ...integrity, terminalTargetsRebuiltFromCurrentFundamentals: false } });
    expect(result.verdict).toBe('DATA_INTEGRITY_REJECT');
  });

  it('requires a timestamp for intraday P0 and never silently treats it as a close', () => {
    const result = evaluateReturnObjective({ ...base, ticker: 'INTRADAY', objective: 'EXPECTED_RETURN', expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 50 }], economicProofPassCount: 5,
      expectedReturnIntegrity: { ...integrity, observationType: 'INTRADAY_SNAPSHOT', observationTimestamp: undefined } });
    expect(result.verdict).toBe('DATA_INTEGRITY_REJECT');
  });

  it('requires corporate-action reconciliation', () => {
    const result = evaluateReturnObjective({ ...base, ticker: 'SPLIT', objective: 'EXPECTED_RETURN', expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 50 }], economicProofPassCount: 5,
      expectedReturnIntegrity: { ...integrity, corporateActionsReconciled: false } });
    expect(result.verdict).toBe('DATA_INTEGRITY_REJECT');
  });

  it('uses Economic Proof only as survival gate', () => {
    const pass4 = evaluateReturnObjective({ ...base, ticker: 'PASS4', objective: 'EXPECTED_RETURN', expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 120 }], economicProofPassCount: 4, economicProofMaterialFail: false });
    const fail3 = evaluateReturnObjective({ ...base, ticker: 'FAIL3', objective: 'EXPECTED_RETURN', expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 220 }], economicProofPassCount: 3 });
    expect(pass4.verdict).toBe('RANK_ELIGIBLE');
    expect(fail3.verdict).toBe('ECONOMIC_PROOF_REJECT');
  });

  it('keeps Falsifiers Omega as absolute veto', () => {
    const result = evaluateReturnObjective({ ...base, ticker: 'VETO', objective: 'EXPECTED_RETURN', expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 300 }], economicProofPassCount: 5, falsifierVeto: true });
    expect(result.verdict).toBe('FALSIFIER_VETO');
    expect(result.eligibleForRanking).toBe(false);
  });
});
