import { evaluateGreenProviderQuorum, type GreenProvider, type GreenProviderObservation } from './green-provider-quorum-omega';
import { evaluateVerifiedGreenContinuity } from './green-verified-continuity-omega';
import type { GreenContinuityWindow } from './green-continuity-omega';

const WINDOWS: GreenContinuityWindow[] = ['oneWeek', 'oneMonth', 'threeMonths', 'oneYear', 'total'];
const CORE: GreenProvider[] = ['TRADINGVIEW', 'YAHOO_FINANCE', 'BARCHART'];
const CUT = '2026-08-20';

const START_DATES: Record<GreenContinuityWindow, string> = {
  oneWeek: '2026-08-13',
  oneMonth: '2026-07-20',
  threeMonths: '2026-05-20',
  oneYear: '2025-08-20',
  total: '2014-06-06',
};

const ROST_RETURNS: Record<GreenContinuityWindow, number> = {
  oneWeek: -6.52,
  oneMonth: -2.89,
  threeMonths: 5.43,
  oneYear: 57.25,
  total: 120,
};

function startFromReturn(end: number, returnPct: number): number {
  return end / (1 + returnPct / 100);
}

function observation(
  provider: GreenProvider,
  window: GreenContinuityWindow,
  returnPct: number,
  endRegularClose = 228.99,
  overrides: Partial<GreenProviderObservation> = {},
): GreenProviderObservation {
  return {
    provider,
    ticker: 'ROST',
    canonicalIdentifier: 'US7782961038',
    exchange: 'NASDAQ',
    currency: 'USD',
    window,
    startDate: START_DATES[window],
    endDate: CUT,
    startRegularClose: startFromReturn(endRegularClose, returnPct),
    endRegularClose,
    returnPct,
    corporateActionPolicy: 'SPLIT_ADJUSTED_DIVIDEND_UNADJUSTED',
    capturedAt: '2026-08-21T12:40:00Z',
    sourceRef: `${provider}:${window}`,
    rawCloseDerived: provider !== 'TRADING212_USER_EVIDENCE',
    ...overrides,
  };
}

function fullCoreObservations(): GreenProviderObservation[] {
  const observations: GreenProviderObservation[] = [];
  for (const window of WINDOWS) {
    CORE.forEach((provider, index) => {
      const end = 228.99 + (index - 1) * 0.01;
      observations.push(observation(provider, window, ROST_RETURNS[window], end));
    });
  }
  return observations;
}

describe('GREEN verified continuity Ω', () => {
  it('does not count Trading212 evidence toward the mandatory 3-core-provider quorum', () => {
    const observations: GreenProviderObservation[] = [];
    for (const window of WINDOWS) {
      observations.push(observation('TRADINGVIEW', window, ROST_RETURNS[window]));
      observations.push(observation('YAHOO_FINANCE', window, ROST_RETURNS[window]));
      observations.push(observation('TRADING212_USER_EVIDENCE', window, ROST_RETURNS[window], 228.99, {
        rawCloseDerived: false,
      }));
    }

    const result = evaluateGreenProviderQuorum({ ticker: 'ROST', expectedMarketCut: CUT, observations });
    expect(result.allFiveVerified).toBe(false);
    expect(result.windows.oneWeek.coreProviderCount).toBe(2);
    expect(result.windows.oneWeek.brokerCrossCheckCount).toBe(1);
  });

  it('quarantines a horizon when Trading212 visible evidence conflicts with core sign consensus', () => {
    const observations = fullCoreObservations();
    observations.push(observation('TRADING212_USER_EVIDENCE', 'oneWeek', 1.2, 228.99, {
      rawCloseDerived: false,
    }));

    const result = evaluateGreenProviderQuorum({ ticker: 'ROST', expectedMarketCut: CUT, observations });
    expect(result.windows.oneWeek.brokerSignConflict).toBe(true);
    expect(result.windows.oneWeek.verified).toBe(false);
    expect(result.allFiveVerified).toBe(false);
  });

  it('quarantines a horizon when core providers do not use the same start date', () => {
    const observations = fullCoreObservations();
    const target = observations.find((item) => item.provider === 'BARCHART' && item.window === 'oneMonth');
    if (!target) throw new Error('test fixture missing');
    target.startDate = '2026-07-21';

    const result = evaluateGreenProviderQuorum({ ticker: 'ROST', expectedMarketCut: CUT, observations });
    expect(result.windows.oneMonth.startDateConsensus).toBe(false);
    expect(result.windows.oneMonth.verified).toBe(false);
  });

  it('reproduces a ROST-like GREEN 3/5 only from verified raw-close consensus', () => {
    const result = evaluateVerifiedGreenContinuity({
      ticker: 'ROST',
      expectedMarketCut: CUT,
      observations: fullCoreObservations(),
      existingPosition: false,
      hasOneYearHistory: true,
    });

    expect(result.verified).toBe(true);
    expect(result.decision).toBe('MIXED_3OF5');
    expect(result.continuity).toMatchObject({
      greenCount: 3,
      pass5of5: false,
      green: {
        oneWeek: false,
        oneMonth: false,
        threeMonths: true,
        oneYear: true,
        total: true,
      },
    });
  });
});
