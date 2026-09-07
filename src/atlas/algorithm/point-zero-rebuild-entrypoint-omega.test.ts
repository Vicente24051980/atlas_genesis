import { describe, expect, it } from 'vitest';
import { OMEGA_DATA_CONTRACT_VERSION, type SecuritySnapshot } from '../governance/omega-data-integrity';
import { runCanonicalPointZeroRebuildOmega } from './point-zero-rebuild-entrypoint-omega';

function snapshot(publicationTimestamp = '2026-09-01T10:00:00Z'): SecuritySnapshot {
  return {
    schemaVersion: OMEGA_DATA_CONTRACT_VERSION,
    identity: { issuerId: 'ISSUER-1', securityId: 'SEC-1', tickerAtTime: 'AAA' },
    timestamp: '2026-09-01T12:00:00Z',
    reportingCurrency: 'USD',
    securityCurrency: 'USD',
    portfolioBaseCurrency: 'EUR',
    source: 'TEST',
    valuation: { pe: { value: 20, publicationTimestamp, source: 'TEST', confidence: 1 } },
    fundamentals: {}, estimates: {}, revisions: {}, priceHistory: [], volatility: {}, balanceSheet: {}, shareCount: {}, sbc: {},
    corporateActions: [], confidence: 1, missingFields: [], lastUpdatedByField: { valuation: '2026-09-01T12:00:00Z' },
  };
}

const projector = (s: any) => ({
  ticker: s.identity.tickerAtTime,
  canonicalEntityId: s.identity.issuerId,
  hardGatesPassed: true,
  expectedCompoundReturnPct: 15,
  permanentLossRiskPct: 4,
  fragilityPenaltyPct: 2,
});

describe('Canonical Point Zero rebuild Ω — PIT boundary', () => {
  it('selects only after every snapshot is validated as-of', () => {
    const result = runCanonicalPointZeroRebuildOmega({
      asOfTimestamp: '2026-09-02T00:00:00Z', snapshots: [snapshot()], projectCandidate: projector,
    });
    expect(result.status).toBe('SELECTED');
    expect(result.selectedTickers).toEqual(['AAA']);
    expect(result.pitValidatedSnapshotCount).toBe(1);
  });

  it('fails closed on future-published fundamentals/valuation', () => {
    expect(() => runCanonicalPointZeroRebuildOmega({
      asOfTimestamp: '2026-09-02T00:00:00Z', snapshots: [snapshot('2026-09-03T00:00:00Z')], projectCandidate: projector,
    })).toThrow('PIT_UNSAFE:valuation.pe');
  });

  it('fails closed when the snapshot itself is from the future', () => {
    const s = snapshot(); s.timestamp = '2026-09-05T00:00:00Z';
    expect(() => runCanonicalPointZeroRebuildOmega({
      asOfTimestamp: '2026-09-02T00:00:00Z', snapshots: [s], projectCandidate: projector,
    })).toThrow('PIT_UNSAFE:SNAPSHOT_TIMESTAMP');
  });

  it('fails closed on future last-update metadata', () => {
    const s = snapshot(); s.lastUpdatedByField.valuation = '2026-09-04T00:00:00Z';
    expect(() => runCanonicalPointZeroRebuildOmega({
      asOfTimestamp: '2026-09-02T00:00:00Z', snapshots: [s], projectCandidate: projector,
    })).toThrow('PIT_UNSAFE:lastUpdatedByField.valuation');
  });

  it('requires explicit provenance', () => {
    const s = snapshot(); s.valuation.pe.source = '';
    expect(() => runCanonicalPointZeroRebuildOmega({
      asOfTimestamp: '2026-09-02T00:00:00Z', snapshots: [s], projectCandidate: projector,
    })).toThrow('MISSING_PROVENANCE:valuation.pe');
  });
});
