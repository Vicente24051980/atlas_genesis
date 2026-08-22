import { describe, expect, it } from 'vitest';
import { evaluateLiveMarketValidation } from './recommendation-performance-audit-omega';

describe('Recommendation Performance + Live Validation Omega regressions', () => {
  it('marks the opportunity WEAKENING when price rises, valuation gets richer and Expected Return falls', () => {
    const result = evaluateLiveMarketValidation({
      ticker: 'TEST',
      previousAuditTimestamp: '2026-08-01T20:00:00Z',
      currentAuditTimestamp: '2026-08-22T20:00:00Z',
      previousPrice: 100,
      currentPrice: 130,
      previousExpectedCagrPct: 20,
      currentExpectedCagrPct: 12,
      fundamentalsDelta: 'FLAT',
      revisionsDelta: 'FLAT',
      valuationDelta: 'RICHER',
      relativeStrengthDelta: 'IMPROVING',
      flowDelta: 'UNVERIFIED',
      economicProofDelta: 'FLAT',
      thesisState: 'ON_TRACK',
      marketEvidenceIds: ['price-tape', 'relative-strength'],
      fundamentalEvidenceIds: ['last-filing'],
    });

    expect(result.state).toBe('WEAKENING');
    expect(result.expectedReturnDeltaPct).toBe(-8);
    expect(result.flowInferredFromPrice).toBe(false);
    expect(result.reasons.join(' ')).toMatch(/Expected Return deteriorated while valuation became richer/);
  });
});
