import { describe, expect, it } from 'vitest';
import {
  ATLAS_PORTFOLIO_RECONCILIATION_POLICY,
  ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE,
  assertFrozenReconciliationUniverse,
  canonicalizeReconciliationUniverse,
} from './portfolio-reconciliation-universe-2026-09-06';

describe('ATLAS portfolio reconciliation reproducibility', () => {
  it('freezes exactly 41 unique reconciliation tickers', () => {
    expect(ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE).toHaveLength(41);
    expect(new Set(ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE).size).toBe(41);
  });

  it('is invariant to input ordering and duplicates', () => {
    const noisy = [
      ...ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE.slice().reverse(),
      ' avgo ',
      'TSM',
    ];
    expect(canonicalizeReconciliationUniverse(noisy)).toEqual([...ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE]);
    expect(() => assertFrozenReconciliationUniverse(noisy)).not.toThrow();
  });

  it('fails closed on universe drift', () => {
    expect(() => assertFrozenReconciliationUniverse(ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE.slice(1))).toThrow('ATLAS_RECONCILIATION_UNIVERSE_DRIFT');
    expect(() => assertFrozenReconciliationUniverse([...ATLAS_PORTFOLIO_RECONCILIATION_UNIVERSE, 'AAPL'])).toThrow('ATLAS_RECONCILIATION_UNIVERSE_DRIFT');
  });

  it('locks MAX RETURN / LOW VOL risk policy and removes aesthetic authority', () => {
    expect(ATLAS_PORTFOLIO_RECONCILIATION_POLICY.riskWeights).toEqual({ permanentLoss: 0.40, tailRisk: 0.20, volatility: 0.40 });
    expect(ATLAS_PORTFOLIO_RECONCILIATION_POLICY.diversificationAuthority).toBe(0);
    expect(ATLAS_PORTFOLIO_RECONCILIATION_POLICY.sectorAuthority).toBe(0);
    expect(ATLAS_PORTFOLIO_RECONCILIATION_POLICY.geographyAuthority).toBe(0);
    expect(ATLAS_PORTFOLIO_RECONCILIATION_POLICY.noCardinalityFilling).toBe(true);
    expect(ATLAS_PORTFOLIO_RECONCILIATION_POLICY.cardinality).toBe('ENDOGENOUS');
  });
});
