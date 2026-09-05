import { describe, expect, it } from 'vitest';
import {
  MAX_PORTFOLIO_POSITIONS,
  MIN_PORTFOLIO_POSITIONS,
  calculateMarginalPortfolioContribution,
  selectCapitalBlindPortfolioOmega,
  type CapitalBlindCandidate,
} from './capital-blind-portfolio-selection-omega';

function candidate(i: number, utility = 10): CapitalBlindCandidate {
  return {
    ticker: `T${String(i).padStart(2, '0')}`,
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

describe('Capital-Blind Portfolio Selection Ω', () => {
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

  it('can stop at the endogenous floor when every further marginal contribution is non-positive', () => {
    const good = Array.from({ length: MIN_PORTFOLIO_POSITIONS }, (_, i) => candidate(i + 1, 10));
    const bad = Array.from({ length: 8 }, (_, i) => candidate(i + 21, -10));
    const result = selectCapitalBlindPortfolioOmega([...good, ...bad]);
    expect(result.status).toBe('SELECTED');
    expect(result.optimalN).toBe(MIN_PORTFOLIO_POSITIONS);
  });

  it('can expand all the way to 35 when marginal contribution remains positive', () => {
    const universe = Array.from({ length: 40 }, (_, i) => candidate(i + 1, 10));
    const result = selectCapitalBlindPortfolioOmega(universe);
    expect(result.status).toBe('SELECTED');
    expect(result.optimalN).toBe(MAX_PORTFOLIO_POSITIONS);
  });

  it('can select an interior N rather than a fixed 25 or 30', () => {
    const positive = Array.from({ length: 27 }, (_, i) => candidate(i + 1, 8));
    const negative = Array.from({ length: 8 }, (_, i) => candidate(i + 28, -5));
    const result = selectCapitalBlindPortfolioOmega([...positive, ...negative]);
    expect(result.optimalN).toBe(27);
  });

  it('excludes hard-gate failures even when their standalone return is huge', () => {
    const universe = Array.from({ length: 20 }, (_, i) => candidate(i + 1, 10));
    universe.push({ ...candidate(99, 1000), ticker: 'FAILED', hardGatesPassed: false });
    const result = selectCapitalBlindPortfolioOmega(universe);
    expect(result.selectedTickers).not.toContain('FAILED');
  });

  it('keeps selection separate from sizing and entry timing', () => {
    const result = selectCapitalBlindPortfolioOmega(Array.from({ length: 20 }, (_, i) => candidate(i + 1, 10)));
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
