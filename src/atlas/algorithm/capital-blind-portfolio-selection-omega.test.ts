import { describe, expect, it } from 'vitest';
import {
  calculateMarginalPortfolioContribution,
  selectCapitalBlindPortfolioOmega,
  type CapitalBlindCandidate,
} from './capital-blind-portfolio-selection-omega';

function candidate(i: number, utility = 10): CapitalBlindCandidate {
  return {
    ticker: `T${String(i).padStart(2, '0')}`,
    canonicalEntityId: `ENTITY-${i}`,
    hardGatesPassed: true,
    expectedCompoundReturnPct: utility + 3,
    permanentLossRiskPct: 1,
    fragilityPenaltyPct: 1,
    robustnessBenefitPct: 0,
    causalDiversificationBenefitPct: 0,
    complexityPenaltyPct: 1,
    causalDrivers: [`driver-${i}`],
  };
}

describe('Capital-Blind Portfolio Selection Ω — Point Zero / endogenous N', () => {
  it('is invariant to invested euros, current weight, P/L, cost basis and holding status', () => {
    const base = Array.from({ length: 24 }, (_, i) => candidate(i + 1, 20 - i * 0.2));
    const richPersonalState = base.map((c, i) => ({
      ...c,
      currentInvestedEur: i === 0 ? 100000 : 1,
      currentPositionWeight: i === 0 ? 0.5 : 0.001,
      personalPnLPct: i === 0 ? 250 : -80,
      personalAverageCost: i === 0 ? 1 : 9999,
      isCurrentlyHeld: i % 2 === 0,
    }));
    const zeroState = base.map(c => ({
      ...c,
      currentInvestedEur: 0,
      currentPositionWeight: 0,
      personalPnLPct: 0,
      personalAverageCost: 0,
      isCurrentlyHeld: false,
    }));

    const a = selectCapitalBlindPortfolioOmega(richPersonalState);
    const b = selectCapitalBlindPortfolioOmega(zeroState);
    expect(a.status).toBe('SELECTED');
    expect(a.selectedTickers).toEqual(b.selectedTickers);
    expect(a.optimalN).toBe(b.optimalN);
    expect(a.marginalUtilityByTicker).toEqual(b.marginalUtilityByTicker);
  });

  it('can select a single position when only one candidate has positive marginal utility', () => {
    const result = selectCapitalBlindPortfolioOmega([
      candidate(1, 10),
      candidate(2, -1),
      candidate(3, -5),
    ]);
    expect(result.status).toBe('SELECTED');
    expect(result.optimalN).toBe(1);
    expect(result.selectedTickers).toEqual(['T01']);
  });

  it('has no fixed ceiling: all 60 names may enter when every marginal contribution remains positive', () => {
    const universe = Array.from({ length: 60 }, (_, i) => candidate(i + 1, 10));
    const result = selectCapitalBlindPortfolioOmega(universe);
    expect(result.status).toBe('SELECTED');
    expect(result.optimalN).toBe(60);
  });

  it('stops exactly when the best next candidate fails the marginal-utility test', () => {
    const positive = Array.from({ length: 7 }, (_, i) => candidate(i + 1, 8));
    const negative = Array.from({ length: 8 }, (_, i) => candidate(i + 8, -5));
    const result = selectCapitalBlindPortfolioOmega([...positive, ...negative]);
    expect(result.optimalN).toBe(7);
  });

  it('rejects caller-supplied fixed cardinality bounds', () => {
    const universe = Array.from({ length: 12 }, (_, i) => candidate(i + 1, 10));
    expect(selectCapitalBlindPortfolioOmega(universe, { minPositions: 10 }).status).toBe('EVIDENCE_PENDING');
    expect(selectCapitalBlindPortfolioOmega(universe, { maxPositions: 10 }).status).toBe('EVIDENCE_PENDING');
  });

  it('deduplicates repeated appearances of the same canonical economic entity', () => {
    const a = candidate(1, 10);
    const duplicate = { ...a, ticker: 'ALT_SHARE_CLASS' };
    const result = selectCapitalBlindPortfolioOmega([a, duplicate, candidate(2, 9)]);
    expect(result.status).toBe('SELECTED');
    expect(result.optimalN).toBe(2);
    expect(result.selectedTickers.filter(t => t === 'T01' || t === 'ALT_SHARE_CLASS')).toHaveLength(1);
  });

  it('fails closed when duplicate entity appearances contain conflicting normalized evidence', () => {
    const a = candidate(1, 10);
    const conflictingDuplicate = { ...a, ticker: 'ALT_SHARE_CLASS', expectedCompoundReturnPct: 99 };
    const result = selectCapitalBlindPortfolioOmega([a, conflictingDuplicate]);
    expect(result.status).toBe('EVIDENCE_PENDING');
  });

  it('excludes hard-gate failures even when their standalone return is huge', () => {
    const universe = Array.from({ length: 10 }, (_, i) => candidate(i + 1, 10));
    universe.push({ ...candidate(99, 1000), ticker: 'FAILED', hardGatesPassed: false });
    const result = selectCapitalBlindPortfolioOmega(universe);
    expect(result.selectedTickers).not.toContain('FAILED');
  });

  it('keeps selection separate from sizing and entry timing', () => {
    const result = selectCapitalBlindPortfolioOmega(Array.from({ length: 10 }, (_, i) => candidate(i + 1, 10)));
    expect(result.emitsTargetWeights).toBe(false);
    expect(result.emitsEntryTiming).toBe(false);
  });

  it('charges pairwise redundancy only after candidates meet quality/hard gates', () => {
    const a = { ...candidate(1, 10), ticker: 'AAA', causalDrivers: ['grid'] };
    const b = { ...candidate(2, 10), ticker: 'BBB', causalDrivers: ['grid'] };
    const c = { ...candidate(3, 10), ticker: 'CCC', causalDrivers: ['payments'] };
    expect(calculateMarginalPortfolioContribution(b, [a])).toBeLessThan(
      calculateMarginalPortfolioContribution(c, [a]),
    );
  });
});