import { evaluateUniversalMarketTapeIntegrity } from './universal-market-tape-integrity-omega';
import { canPromoteEnergyRotation, isCapitalFlowMetric } from './energy-rotation-omega';

function tape(subject: string) {
  return evaluateUniversalMarketTapeIntegrity({
    ticker: subject,
    primaryListing: 'NYSE_ARCA',
    currency: 'USD',
    quotationUnit: 'USD',
    asOfTimestamp: '2026-08-21T21:20:00+02:00',
    expectedSessionState: 'OPEN',
    observations: [{
      ticker: subject,
      primaryListing: 'NYSE_ARCA',
      currency: 'USD',
      quotationUnit: 'USD',
      observationDate: '2026-08-21',
      observationType: 'INTRADAY_SNAPSHOT',
      observationTimestamp: '2026-08-21T21:19:00+02:00',
      sessionState: 'OPEN',
      price: 100,
      sourceId: `regulated-${subject}`,
      sourceClass: 'REGULATED_FEED',
      capturedAt: '2026-08-21T21:19:10+02:00',
      corporateActionsReconciled: true,
    }],
  });
}

const verified = { marketTapeSubject: 'XLE', marketTapeIntegrity: tape('XLE') };

describe('Energy Rotation Omega v1.1', () => {
  it('does not treat market cap or price return as capital flow', () => {
    expect(isCapitalFlowMetric('MARKET_CAP_CHANGE')).toBe(false);
    expect(isCapitalFlowMetric('PRICE_RETURN')).toBe(false);
    expect(isCapitalFlowMetric('COMMODITY_PRICE_CHANGE')).toBe(false);
    expect(isCapitalFlowMetric('ETF_NET_FLOW')).toBe(true);
  });

  it('requires multi-window, fundamental and verified price-reaction confirmation before promotion', () => {
    expect(
      canPromoteEnergyRotation({
        ...verified,
        positive4wFlows: true,
        positive13wFlows: false,
        positiveEpsRevisions: true,
        positiveBreadth: true,
        positivePostEarningsReaction: true,
      }),
    ).toBe(false);

    expect(
      canPromoteEnergyRotation({
        ...verified,
        positive4wFlows: true,
        positive13wFlows: true,
        positiveEpsRevisions: true,
        positiveBreadth: true,
        positivePostEarningsReaction: true,
      }),
    ).toBe(true);
  });

  it('cannot promote from an asserted positive reaction when market tape is missing', () => {
    expect(
      canPromoteEnergyRotation({
        marketTapeSubject: 'XLE',
        marketTapeIntegrity: undefined,
        positive4wFlows: true,
        positive13wFlows: true,
        positiveEpsRevisions: true,
        positiveBreadth: true,
        positivePostEarningsReaction: true,
      }),
    ).toBe(false);
  });

  it('cannot reuse a PASS market tape from another sector', () => {
    expect(
      canPromoteEnergyRotation({
        marketTapeSubject: 'XLE',
        marketTapeIntegrity: tape('XLK'),
        positive4wFlows: true,
        positive13wFlows: true,
        positiveEpsRevisions: true,
        positiveBreadth: true,
        positivePostEarningsReaction: true,
      }),
    ).toBe(false);
  });
});
