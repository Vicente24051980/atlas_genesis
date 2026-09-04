import { describe, expect, it } from 'vitest';
import {
  evaluateBreadthRotation,
  evaluateUniversalPointZero,
  type UniversalPointZeroInput,
} from './size-blind-point-zero-omega';

const baseCase: UniversalPointZeroInput = {
  ticker: 'P0_CASE',
  pointZeroMode: 'P0_RESET',
  marketCapUsd: 4_000_000_000,
  evidenceTraceable: true,
  evidenceIds: ['earnings', 'cash-flow', 'valuation-history', 'catalyst'],
  revenueAccelerationScore: 88,
  epsFcfAccelerationScore: 94,
  marginInflectionScore: 90,
  perShareEconomicQualityScore: 92,
  absoluteValuationScore: 82,
  priceCagr3yPct: 32,
  fundamentalPerShareCagr3yPct: 40,
  startValuationMultiple: 18,
  currentValuationMultiple: 20,
  capitalEfficiencyScore: 90,
  balanceSheetQualityScore: 90,
  catalystDurabilityScore: 88,
  earningsRevisionScore: 84,
  breadthRegimeScore: 72,
  relativeMomentumScore: 70,
  liquidityQualityScore: 86,
  drawdownRiskScore: 25,
  valueTrapRiskScore: 15,
  dilutionRiskScore: 10,
};

describe('Size-Blind Point Zero Omega v1', () => {
  it('gives identical economics the same score regardless of market cap', () => {
    const small = evaluateUniversalPointZero({ ...baseCase, marketCapUsd: 3_000_000_000 });
    const mega = evaluateUniversalPointZero({ ...baseCase, marketCapUsd: 3_000_000_000_000 });

    expect(small.marketCapBucket).not.toBe(mega.marketCapBucket);
    expect(small.sizeBiasContribution).toBe(0);
    expect(mega.sizeBiasContribution).toBe(0);
    expect(small.sizeBlindP0Score).toBe(mega.sizeBlindP0Score);
  });

  it('does not punish a large stock-price run-up when per-share fundamentals grew faster', () => {
    const result = evaluateUniversalPointZero({
      ...baseCase,
      priceCagr3yPct: 70,
      fundamentalPerShareCagr3yPct: 82,
      startValuationMultiple: 24,
      currentValuationMultiple: 24,
    });

    expect(result.excessReratingPp).toBeLessThanOrEqual(0);
    expect(result.excessReratingDebtScore).toBe(0);
    expect(result.multipleExpansionDebtScore).toBe(0);
    expect(result.expectationsDebtScore).toBe(0);
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('raw run-up is therefore not penalized'),
    ]));
  });

  it('blocks a cheap stock from elite status when value-trap risk is extreme', () => {
    const result = evaluateUniversalPointZero({
      ...baseCase,
      absoluteValuationScore: 100,
      valueTrapRiskScore: 90,
    });

    expect(result.sizeBlindP0Score).toBeLessThanOrEqual(64.9);
    expect(result.state).toBe('VALUE_TRAP_RISK');
    expect(result.action).toBe('REJECT_FOR_NOW');
  });

  it('fails closed when balance-sheet quality is below the funding gate', () => {
    const result = evaluateUniversalPointZero({
      ...baseCase,
      balanceSheetQualityScore: 20,
    });

    expect(result.sizeBlindP0Score).toBeLessThanOrEqual(59.9);
    expect(result.state).toBe('FUNDING_RISK');
    expect(result.action).toBe('REJECT_FOR_NOW');
  });

  it('keeps breadth as a minor input that cannot rescue weak company economics', () => {
    const weak = evaluateUniversalPointZero({
      ...baseCase,
      revenueAccelerationScore: 20,
      epsFcfAccelerationScore: 20,
      marginInflectionScore: 20,
      perShareEconomicQualityScore: 20,
      absoluteValuationScore: 40,
      capitalEfficiencyScore: 30,
      catalystDurabilityScore: 30,
      earningsRevisionScore: 25,
      relativeMomentumScore: 25,
      breadthRegimeScore: 100,
    });

    expect(weak.sizeBlindP0Score).toBeLessThan(62);
    expect(['WATCH', 'NO_EDGE']).toContain(weak.state);
  });

  it('fails closed when evidence is not sufficiently traceable', () => {
    const result = evaluateUniversalPointZero({
      ...baseCase,
      evidenceIds: ['single-source'],
    });

    expect(result.evidenceGate).toBe('PROVISIONAL');
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.action).toBe('EVIDENCE_REQUIRED');
  });

  it('labels a strong smaller company as a sprinter without changing its score', () => {
    const small = evaluateUniversalPointZero({ ...baseCase, marketCapUsd: 8_000_000_000 });
    const mega = evaluateUniversalPointZero({ ...baseCase, marketCapUsd: 800_000_000_000 });

    expect(small.sizeBlindP0Score).toBe(mega.sizeBlindP0Score);
    expect(small.discoveryTag).toBe('SMALL_MID_SPRINTER');
    expect(mega.discoveryTag).toBe('SIZE_BLIND_P0');
  });
});

describe('Breadth Rotation Omega v1', () => {
  it('detects a genuine broadening regime from earnings, valuation, revisions and relative strength', () => {
    const result = evaluateBreadthRotation({
      smallMidForwardEpsGrowthPct: 28,
      largeMegaForwardEpsGrowthPct: 12,
      smallMidForwardPe: 17,
      largeMegaForwardPe: 23,
      smallMidRelativeStrength6mPp: 10,
      positiveRevisionBreadthPct: 75,
    });

    expect(result.epsGrowthSpreadPp).toBe(16);
    expect(result.valuationDiscountPct).toBeGreaterThan(20);
    expect(result.breadthRotationScore).toBeGreaterThanOrEqual(60);
    expect(['BROADENING', 'BROADENING_CONFIRMED']).toContain(result.state);
  });

  it('does not call a regime broadening when small/mid earnings and relative strength lag', () => {
    const result = evaluateBreadthRotation({
      smallMidForwardEpsGrowthPct: 5,
      largeMegaForwardEpsGrowthPct: 18,
      smallMidForwardPe: 20,
      largeMegaForwardPe: 22,
      smallMidRelativeStrength6mPp: -12,
      positiveRevisionBreadthPct: 30,
    });

    expect(result.breadthRotationScore).toBeLessThan(40);
    expect(result.state).toBe('NARROWING');
  });
});
