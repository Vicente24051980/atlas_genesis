import {
  realizedReturnPct,
  reconstructLongitudinalTrades,
  summarizeObservableSurface,
  validateObservableRecord,
  type ObservableSurfaceRecord,
} from './investing-observable-surface-omega';

describe('INVESTING OBSERVABLE SURFACE Ω', () => {
  test('keeps general Investing evidence separate from ProPicks-specific evidence', () => {
    const rows: ObservableSurfaceRecord[] = [
      {
        ticker: 'AVGO',
        observedAt: '2026-09-05T12:44:00+02:00',
        source: 'INVESTING_APP_SCREENSHOT',
        scope: 'GENERAL_INVESTING_SURFACE',
        signalType: 'ANALYST_TARGET',
        value: 600,
        currency: 'USD',
        evidenceId: 'screenshot-avgo-target',
      },
      {
        ticker: 'CNX',
        observedAt: '2026-09-05T12:44:00+02:00',
        source: 'PROPICKS_SCREENSHOT',
        scope: 'PROPICKS_SPECIFIC',
        signalType: 'PROPICKS_ENTRY',
        entryDate: '2016-03-01',
        entryPrice: 9.05,
        evidenceId: 'screenshot-cnx-entry',
      },
    ];

    const summary = summarizeObservableSurface(rows);
    expect(summary.find((x) => x.ticker === 'AVGO')?.eligibleForPropicksReverseEngineering).toBe(false);
    expect(summary.find((x) => x.ticker === 'CNX')?.eligibleForPropicksReverseEngineering).toBe(true);
  });

  test('maps observable general-surface features to canonical factor families without changing score weights', () => {
    const rows: ObservableSurfaceRecord[] = [
      {
        ticker: 'TSLA',
        observedAt: '2026-09-05T12:44:00+02:00',
        source: 'INVESTING_APP_SCREENSHOT',
        scope: 'GENERAL_INVESTING_SURFACE',
        signalType: 'FAIR_VALUE_GAP',
        value: -25.97,
        evidenceId: 'tsla-fv-gap',
      },
      {
        ticker: 'TSLA',
        observedAt: '2026-09-05T12:44:00+02:00',
        source: 'INVESTING_APP_SCREENSHOT',
        scope: 'GENERAL_INVESTING_SURFACE',
        signalType: 'RISK_LABEL',
        value: 'MEDIO',
        evidenceId: 'tsla-risk',
      },
    ];

    const summary = summarizeObservableSurface(rows)[0];
    expect(summary.inferredFactorLinks).toContain('F5_VALUATION');
    expect(summary.inferredFactorLinks).toContain('F9_MARKET_RISK_DIAGNOSTIC');
    expect(summary.constraints).toContain('NO_SCORE_WEIGHT_CHANGE_WITHOUT_WALK_FORWARD_EVIDENCE');
  });

  test('reconstructs a ProPicks trade from entry/exit/return evidence', () => {
    const rows: ObservableSurfaceRecord[] = [
      {
        ticker: 'CNX',
        observedAt: '2026-09-05T12:44:00+02:00',
        source: 'PROPICKS_SCREENSHOT',
        scope: 'PROPICKS_SPECIFIC',
        signalType: 'PROPICKS_ENTRY',
        entryDate: '2016-03-01',
        entryPrice: 9.05,
        evidenceId: 'cnx-entry',
      },
      {
        ticker: 'CNX',
        observedAt: '2026-09-05T12:44:00+02:00',
        source: 'PROPICKS_SCREENSHOT',
        scope: 'PROPICKS_SPECIFIC',
        signalType: 'PROPICKS_EXIT',
        exitDate: '2016-07-01',
        exitPrice: 16.4,
        evidenceId: 'cnx-exit',
      },
      {
        ticker: 'CNX',
        observedAt: '2026-09-05T12:44:00+02:00',
        source: 'PROPICKS_SCREENSHOT',
        scope: 'PROPICKS_SPECIFIC',
        signalType: 'REALIZED_RETURN',
        value: 81.2,
        evidenceId: 'cnx-return',
      },
    ];

    const trade = reconstructLongitudinalTrades(rows)[0];
    expect(trade.ticker).toBe('CNX');
    expect(trade.entryPrice).toBe(9.05);
    expect(trade.exitPrice).toBe(16.4);
    expect(trade.reportedReturnPct).toBe(81.2);
  });

  test('computes arithmetic realized return independently for consistency checks', () => {
    expect(realizedReturnPct(9.05, 16.4)).toBe(81.22);
    expect(realizedReturnPct(0, 16.4)).toBeNull();
  });

  test('rejects ProPicks selection labels when screenshot scope is not ProPicks-specific', () => {
    const invalid: ObservableSurfaceRecord = {
      ticker: 'CNX',
      observedAt: '2026-09-05T12:44:00+02:00',
      source: 'INVESTING_APP_SCREENSHOT',
      scope: 'GENERAL_INVESTING_SURFACE',
      signalType: 'PROPICKS_ENTRY',
      evidenceId: 'bad-scope',
    };
    expect(validateObservableRecord(invalid)).toContain('PROPICKS_SIGNAL_REQUIRES_PROPICKS_SPECIFIC_SCOPE');
  });
});
