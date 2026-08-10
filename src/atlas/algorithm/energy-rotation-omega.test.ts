import { canPromoteEnergyRotation, isCapitalFlowMetric } from './energy-rotation-omega';

describe('Energy Rotation Omega', () => {
  it('does not treat market cap or price return as capital flow', () => {
    expect(isCapitalFlowMetric('MARKET_CAP_CHANGE')).toBe(false);
    expect(isCapitalFlowMetric('PRICE_RETURN')).toBe(false);
    expect(isCapitalFlowMetric('COMMODITY_PRICE_CHANGE')).toBe(false);
    expect(isCapitalFlowMetric('ETF_NET_FLOW')).toBe(true);
  });

  it('requires multi-window and fundamental confirmation before promotion', () => {
    expect(
      canPromoteEnergyRotation({
        positive4wFlows: true,
        positive13wFlows: false,
        positiveEpsRevisions: true,
        positiveBreadth: true,
        positivePostEarningsReaction: true,
      }),
    ).toBe(false);

    expect(
      canPromoteEnergyRotation({
        positive4wFlows: true,
        positive13wFlows: true,
        positiveEpsRevisions: true,
        positiveBreadth: true,
        positivePostEarningsReaction: true,
      }),
    ).toBe(true);
  });
});
