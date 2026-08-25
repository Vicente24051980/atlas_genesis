import {
  evaluateUniversalMarketTapeIntegrity,
  type MarketTapeObservation,
} from './universal-market-tape-integrity-omega';

function capture(overrides: Partial<MarketTapeObservation> = {}): MarketTapeObservation {
  return {
    ticker: 'SPGI',
    primaryListing: 'NYSE',
    currency: 'USD',
    quotationUnit: 'USD',
    observationDate: '2026-08-21',
    observationType: 'INTRADAY_SNAPSHOT',
    observationTimestamp: '2026-08-21T21:18:00+02:00',
    sessionState: 'OPEN',
    price: 430.05,
    sourceId: 'user-capture-spgi-2118',
    sourceClass: 'USER_CAPTURE',
    capturedAt: '2026-08-21T21:18:30+02:00',
    corporateActionsReconciled: true,
    returns: {
      '1D': { valuePct: -0.50, kind: 'PRICE_RETURN' },
      '1W': { valuePct: 1.74, kind: 'PRICE_RETURN' },
      '1M': { valuePct: -0.29, kind: 'PRICE_RETURN' },
      '3M': { valuePct: 3.44, kind: 'PRICE_RETURN' },
      '1Y': { valuePct: -22.72, kind: 'PRICE_RETURN' },
    },
    ...overrides,
  };
}

describe('Universal Market Tape Integrity Omega', () => {
  it('accepts the coherent SPGI user capture and preserves every historical window exactly', () => {
    const result = evaluateUniversalMarketTapeIntegrity({
      ticker: 'SPGI',
      primaryListing: 'NYSE',
      currency: 'USD',
      quotationUnit: 'USD',
      asOfTimestamp: '2026-08-21T21:19:00+02:00',
      expectedSessionState: 'OPEN',
      requiredReturnKind: 'PRICE_RETURN',
      requiredReturnWindows: ['1D', '1W', '1M', '3M', '1Y'],
      observations: [capture()],
    });

    expect(result.status).toBe('PASS');
    expect(result.canonicalVerified).toBe(true);
    expect(result.selectedPrice).toBe(430.05);
    expect(result.selectedReturns['1D']?.valuePct).toBe(-0.50);
    expect(result.selectedReturns['1W']?.valuePct).toBe(1.74);
    expect(result.selectedReturns['1M']?.valuePct).toBe(-0.29);
    expect(result.selectedReturns['3M']?.valuePct).toBe(3.44);
    expect(result.selectedReturns['1Y']?.valuePct).toBe(-22.72);
  });

  it('keeps ACN one-month +30.15% distinct from its three-month +3.07%', () => {
    const acn = capture({
      ticker: 'ACN',
      price: 183.33,
      sourceId: 'user-capture-acn-2119',
      observationTimestamp: '2026-08-21T21:19:00+02:00',
      capturedAt: '2026-08-21T21:19:20+02:00',
      returns: {
        '1D': { valuePct: 1.09, kind: 'PRICE_RETURN' },
        '1W': { valuePct: 2.71, kind: 'PRICE_RETURN' },
        '1M': { valuePct: 30.15, kind: 'PRICE_RETURN' },
        '3M': { valuePct: 3.07, kind: 'PRICE_RETURN' },
      },
    });

    const result = evaluateUniversalMarketTapeIntegrity({
      ticker: 'ACN', primaryListing: 'NYSE', currency: 'USD', quotationUnit: 'USD',
      asOfTimestamp: '2026-08-21T21:20:00+02:00', expectedSessionState: 'OPEN',
      requiredReturnKind: 'PRICE_RETURN', requiredReturnWindows: ['1M', '3M'], observations: [acn],
    });

    expect(result.status).toBe('PASS');
    expect(result.selectedReturns['1M']?.valuePct).toBe(30.15);
    expect(result.selectedReturns['3M']?.valuePct).toBe(3.07);
  });

  it('prefers a fresh coherent observation over a stale higher-priority source', () => {
    const staleExchange = capture({
      sourceId: 'exchange-stale',
      sourceClass: 'EXCHANGE_OFFICIAL',
      observationTimestamp: '2026-08-21T20:30:00+02:00',
      capturedAt: '2026-08-21T20:30:10+02:00',
      price: 425,
    });
    const freshUser = capture();

    const result = evaluateUniversalMarketTapeIntegrity({
      ticker: 'SPGI', primaryListing: 'NYSE', currency: 'USD', quotationUnit: 'USD',
      asOfTimestamp: '2026-08-21T21:19:00+02:00', expectedSessionState: 'OPEN', observations: [staleExchange, freshUser],
    });

    expect(result.status).toBe('PASS');
    expect(result.selectedSourceId).toBe('user-capture-spgi-2118');
    expect(result.selectedPrice).toBe(430.05);
  });

  it('fails closed when two fresh coherent canonical sources materially disagree on price', () => {
    const broker = capture({ sourceId: 'broker-live', sourceClass: 'BROKER_LIVE', price: 430.05 });
    const vendor = capture({ sourceId: 'vendor-live', sourceClass: 'VENDOR_REALTIME', price: 440.00 });
    const result = evaluateUniversalMarketTapeIntegrity({
      ticker: 'SPGI', primaryListing: 'NYSE', currency: 'USD', quotationUnit: 'USD',
      asOfTimestamp: '2026-08-21T21:19:00+02:00', expectedSessionState: 'OPEN', observations: [broker, vendor],
    });

    expect(result.status).toBe('FAIL_CONFLICT');
    expect(result.canonicalVerified).toBe(false);
    expect(result.violations.some((x) => x.startsWith('price_conflict:'))).toBe(true);
  });

  it('fails closed when return windows disagree instead of choosing the convenient source', () => {
    const a = capture({ sourceId: 'broker-live', sourceClass: 'BROKER_LIVE' });
    const b = capture({
      sourceId: 'vendor-live',
      sourceClass: 'VENDOR_REALTIME',
      returns: { ...capture().returns, '1M': { valuePct: 8.0, kind: 'PRICE_RETURN' } },
    });
    const result = evaluateUniversalMarketTapeIntegrity({
      ticker: 'SPGI', primaryListing: 'NYSE', currency: 'USD', quotationUnit: 'USD',
      asOfTimestamp: '2026-08-21T21:19:00+02:00', expectedSessionState: 'OPEN',
      requiredReturnKind: 'PRICE_RETURN', requiredReturnWindows: ['1M'], observations: [a, b],
    });

    expect(result.status).toBe('FAIL_CONFLICT');
    expect(result.violations.some((x) => x.startsWith('return_conflict:1M:'))).toBe(true);
  });

  it('never promotes search snippets or secondary research to canonical market tape', () => {
    const result = evaluateUniversalMarketTapeIntegrity({
      ticker: 'SPGI', primaryListing: 'NYSE', currency: 'USD', quotationUnit: 'USD',
      asOfTimestamp: '2026-08-21T21:19:00+02:00', expectedSessionState: 'OPEN',
      observations: [capture({ sourceClass: 'SEARCH_SNIPPET', sourceId: 'search-snippet' })],
    });
    expect(result.status).toBe('FAIL_MISSING');
    expect(result.violations).toContain('no_canonical_market_tape_source');
  });

  it('does not silently substitute PRICE_RETURN for TOTAL_RETURN', () => {
    const result = evaluateUniversalMarketTapeIntegrity({
      ticker: 'SPGI', primaryListing: 'NYSE', currency: 'USD', quotationUnit: 'USD',
      asOfTimestamp: '2026-08-21T21:19:00+02:00', expectedSessionState: 'OPEN',
      requiredReturnKind: 'TOTAL_RETURN', requiredReturnWindows: ['1Y'], observations: [capture()],
    });
    expect(result.status).toBe('FAIL_MISSING');
    expect(result.violations).toContain('missing_required_return_window:1Y:TOTAL_RETURN');
  });

  it('blocks unreconciled corporate actions before any downstream engine sees the tape', () => {
    const result = evaluateUniversalMarketTapeIntegrity({
      ticker: 'SPGI', primaryListing: 'NYSE', currency: 'USD', quotationUnit: 'USD',
      asOfTimestamp: '2026-08-21T21:19:00+02:00', expectedSessionState: 'OPEN',
      observations: [capture({ corporateActionsReconciled: false })],
    });
    expect(result.status).toBe('FAIL_CORPORATE_ACTION');
  });
});
