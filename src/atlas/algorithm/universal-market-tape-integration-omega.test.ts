import { evaluateUniversalMarketTapeIntegrity } from './universal-market-tape-integrity-omega';
import { assessAiEconomicProofEquity } from './ai-economic-proof-equity-monetization-omega';
import { evaluateReturnObjective } from './return-objective-separation-omega';

function tape(ticker: string) {
  return evaluateUniversalMarketTapeIntegrity({
    ticker,
    primaryListing: 'NYSE',
    currency: 'USD',
    quotationUnit: 'USD',
    asOfTimestamp: '2026-08-21T21:20:00+02:00',
    expectedSessionState: 'OPEN',
    observations: [{
      ticker,
      primaryListing: 'NYSE',
      currency: 'USD',
      quotationUnit: 'USD',
      observationDate: '2026-08-21',
      observationType: 'INTRADAY_SNAPSHOT',
      observationTimestamp: '2026-08-21T21:19:00+02:00',
      sessionState: 'OPEN',
      price: 100,
      sourceId: `live-${ticker}`,
      sourceClass: 'REGULATED_FEED',
      capturedAt: '2026-08-21T21:19:10+02:00',
      corporateActionsReconciled: true,
    }],
  });
}

describe('Universal Market Tape downstream integration', () => {
  it('cannot reuse a PASS tape from another ticker for AI Equity Monetization', () => {
    const result = assessAiEconomicProofEquity({
      ticker: 'SPGI',
      asOf: '2026-08-21',
      evidenceIds: ['economic', 'market'],
      t2RevenueCapture: 85,
      t3FreeCashFlow: 85,
      t5AiRoic: 80,
      t6MoatPersistence: 90,
      economicProofTrend: 'UP',
      capitalEfficiency: 80,
      expectedReturn: 70,
      riskFragility: 25,
      priceMatrixVerified: true,
      marketTapeIntegrity: tape('ACN'),
      drawdownFromTmaxPct: -10,
      greenContinuity: 4,
      relativeStrength: 70,
      breadthSupport: 65,
      flowPositioning: 65,
      priceResponse: 65,
    });

    expect(result.economicProofState).toBe('PROVEN_STRONG');
    expect(result.equityMonetizationState).toBe('UNVERIFIED');
    expect(result.finalOpportunityVerified).toBe(false);
    expect(result.reasons).toContain('equity:market_tape_ticker_mismatch');
  });

  it('cannot reuse another ticker market tape as Motor 13 P0 evidence', () => {
    const result = evaluateReturnObjective({
      ticker: 'SPGI',
      objective: 'EXPECTED_RETURN',
      evidenceTraceable: true,
      evidenceIds: ['filing', 'valuation'],
      marketTapeIntegrity: tape('ACN'),
      expectedReturnIntegrity: {
        currentPrice: 100,
        currency: 'USD',
        primaryListing: 'NYSE',
        quotationUnit: 'USD',
        observationDate: '2026-08-21',
        observationType: 'INTRADAY_SNAPSHOT',
        observationTimestamp: '2026-08-21T21:19:00+02:00',
        priceEvidenceId: 'live-ACN',
        corporateActionsReconciled: true,
        terminalTargetsRebuiltFromCurrentFundamentals: true,
        terminalTargetsSameCurrencyAndShareScale: true,
      },
      expectedHorizonYears: 3,
      expectedScenarios: [{ probability: 1, totalReturnPct: 100 }],
      economicProofPassCount: 5,
    });

    expect(result.verdict).toBe('DATA_INTEGRITY_REJECT');
    expect(result.rankingMetric).toBeNull();
  });
});
