import { evaluateExecutionSafeEntryTiming } from './execution-safe-entry-timing-omega';
import { evaluateLiquiditySpreadGate } from './liquidity-spread-gate-omega';
import {
  evaluateReturnAwareEntryTiming,
  type ReturnAwareEntryTimingInput,
} from './entry-timing-return-aware-omega';
import { evaluateUniversalMarketTapeIntegrity } from './universal-market-tape-integrity-omega';

const quoteEvidence = {
  quoteTimestamp: '2026-08-25T12:00:00Z',
  evaluatedAt: '2026-08-25T12:00:10Z',
  quoteSource: 'TEST_REGULATED_FEED',
};

const baseTiming: Omit<ReturnAwareEntryTimingInput, 'marketTapeIntegrity'> = {
  ticker: 'ATYM',
  peakMetricEvidenceIds: ['verified-peak-series'],
  returnScore: 900,
  greenCount: 5,
  oneWeekReturnPct: 1,
  oneMonthReturnPct: 4,
  threeMonthReturnPct: 12,
  athDistancePct: -3,
  normalPullbackPct: 7,
  elevatedPullbackPct: 14,
  stressDrawdownPct: 28,
  extensionZscore: 0.4,
  accelerationPercentile: 60,
  thesisIntact: true,
  evidenceTraceable: true,
};

function verifiedTimingInput(ticker = 'ATYM'): ReturnAwareEntryTimingInput {
  const timing = { ...baseTiming, ticker };
  const marketTapeIntegrity = evaluateUniversalMarketTapeIntegrity({
    ticker,
    primaryListing: 'TEST',
    currency: 'GBX',
    quotationUnit: 'GBX',
    asOfTimestamp: '2026-08-25T12:00:10Z',
    expectedSessionState: 'OPEN',
    requiredReturnKind: 'PRICE_RETURN',
    requiredReturnWindows: ['1W', '1M', '3M'],
    observations: [{
      ticker,
      primaryListing: 'TEST',
      currency: 'GBX',
      quotationUnit: 'GBX',
      observationDate: '2026-08-25',
      observationType: 'INTRADAY_SNAPSHOT',
      observationTimestamp: '2026-08-25T12:00:00Z',
      sessionState: 'OPEN',
      price: 939.5,
      sourceId: `regulated-${ticker}`,
      sourceClass: 'REGULATED_FEED',
      capturedAt: '2026-08-25T12:00:01Z',
      corporateActionsReconciled: true,
      returns: {
        '1W': { valuePct: timing.oneWeekReturnPct, kind: 'PRICE_RETURN' },
        '1M': { valuePct: timing.oneMonthReturnPct, kind: 'PRICE_RETURN' },
        '3M': { valuePct: timing.threeMonthReturnPct, kind: 'PRICE_RETURN' },
      },
    }],
  });
  return { ...timing, marketTapeIntegrity };
}

describe('Liquidity / Spread Gate Omega', () => {
  it('flags the observed ATYM-like 939.5p -> 964.5p execution without inventing bid/ask evidence', () => {
    const result = evaluateLiquiditySpreadGate({
      ticker: 'ATYM',
      side: 'BUY',
      orderType: 'MARKET',
      lastTradePrice: 939.5,
      executedPrice: 964.5,
      venue: 'LSE',
      lowLiquidityFlag: true,
      ...quoteEvidence,
    });

    expect(result.executionSlippagePct).toBeCloseTo(2.66, 2);
    expect(result.decision).toBe('EXECUTION_BREACH');
    expect(result.executionAllowed).toBe(false);
  });

  it('blocks a market order when a low-liquidity quote has a wide spread', () => {
    const result = evaluateLiquiditySpreadGate({
      ticker: 'SMALL_LSE',
      side: 'BUY',
      orderType: 'MARKET',
      lastTradePrice: 100,
      bidPrice: 99,
      askPrice: 102,
      lowLiquidityFlag: true,
      ...quoteEvidence,
    });

    expect(result.executionAllowed).toBe(false);
    expect(result.decision).toBe('WAIT_SPREAD');
    expect(result.limitOrderRequired).toBe(true);
  });

  it('allows protected limit placement without claiming an immediate fill', () => {
    const result = evaluateLiquiditySpreadGate({
      ticker: 'ATYM',
      side: 'BUY',
      orderType: 'LIMIT',
      lastTradePrice: 939.5,
      bidPrice: 915,
      askPrice: 964.5,
      proposedLimitPrice: 942,
      venue: 'LSE',
      lowLiquidityFlag: true,
      ...quoteEvidence,
    });

    expect(result.decision).toBe('PASS_LIMIT_PROTECTED');
    expect(result.orderPlacementAllowed).toBe(true);
    expect(result.immediateExecutionPossible).toBe(false);
    expect(result.marketOrderAllowed).toBe(false);
  });

  it('allows a normal market order when spread and executable premium are inside budget', () => {
    const result = evaluateLiquiditySpreadGate({
      ticker: 'LIQUID',
      side: 'BUY',
      orderType: 'MARKET',
      lastTradePrice: 100,
      bidPrice: 99.95,
      askPrice: 100.05,
      ...quoteEvidence,
    });

    expect(result.decision).toBe('PASS');
    expect(result.executionAllowed).toBe(true);
    expect(result.immediateExecutionPossible).toBe(true);
    expect(result.quoteFresh).toBe(true);
  });

  it('applies the same executable-price protection to SELL market orders', () => {
    const pass = evaluateLiquiditySpreadGate({
      ticker: 'LIQUID',
      side: 'SELL',
      orderType: 'MARKET',
      lastTradePrice: 100,
      bidPrice: 99.95,
      askPrice: 100.05,
      ...quoteEvidence,
    });
    const blocked = evaluateLiquiditySpreadGate({
      ticker: 'ILLIQUID',
      side: 'SELL',
      orderType: 'MARKET',
      lastTradePrice: 100,
      bidPrice: 97,
      askPrice: 100,
      ...quoteEvidence,
    });

    expect(pass.decision).toBe('PASS');
    expect(blocked.decision).toBe('WAIT_SPREAD');
  });

  it('fails closed for stale, missing or reversed quote evidence', () => {
    const stale = evaluateLiquiditySpreadGate({
      ticker: 'STALE',
      side: 'BUY',
      orderType: 'MARKET',
      lastTradePrice: 100,
      bidPrice: 99.95,
      askPrice: 100.05,
      ...quoteEvidence,
      evaluatedAt: '2026-08-25T12:01:00Z',
    });
    const missingBook = evaluateLiquiditySpreadGate({
      ticker: 'NO_BOOK',
      side: 'BUY',
      orderType: 'LIMIT',
      lastTradePrice: 100,
      proposedLimitPrice: 100.5,
      ...quoteEvidence,
    });
    const reversedBook = evaluateLiquiditySpreadGate({
      ticker: 'REVERSED',
      side: 'BUY',
      orderType: 'MARKET',
      lastTradePrice: 100,
      bidPrice: 101,
      askPrice: 100,
      ...quoteEvidence,
    });

    expect(stale.decision).toBe('EVIDENCE_REQUIRED');
    expect(missingBook.decision).toBe('EVIDENCE_REQUIRED');
    expect(reversedBook.decision).toBe('EVIDENCE_REQUIRED');
  });

  it('fails closed when threshold overrides are NaN, infinite or incoherent', () => {
    const common = {
      ticker: 'BAD_CONFIG',
      side: 'BUY' as const,
      orderType: 'MARKET' as const,
      lastTradePrice: 100,
      bidPrice: 80,
      askPrice: 120,
      ...quoteEvidence,
    };

    expect(evaluateLiquiditySpreadGate({ ...common, maxQuotedSpreadPct: Number.NaN }).decision)
      .toBe('EVIDENCE_REQUIRED');
    expect(evaluateLiquiditySpreadGate({ ...common, maxReferencePremiumPct: Number.POSITIVE_INFINITY }).decision)
      .toBe('EVIDENCE_REQUIRED');
    expect(evaluateLiquiditySpreadGate({ ...common, maxQuotedSpreadPct: 3, severeQuotedSpreadPct: 2 }).decision)
      .toBe('EVIDENCE_REQUIRED');
  });
});

describe('Execution-Safe Entry Timing Omega', () => {
  it('converts a verified timing BUY into WAIT_SPREAD when execution is unsafe', () => {
    const result = evaluateExecutionSafeEntryTiming({
      timing: verifiedTimingInput(),
      liquidity: {
        ticker: 'ATYM',
        side: 'BUY',
        orderType: 'MARKET',
        lastTradePrice: 939.5,
        bidPrice: 915,
        askPrice: 964.5,
        lowLiquidityFlag: true,
        ...quoteEvidence,
      },
    });

    expect(result.timing.state).toBe('BUY_NOW');
    expect(result.state).toBe('WAIT_SPREAD');
    expect(result.executionAllowed).toBe(false);
  });

  it('restores the timing state only for protected order placement', () => {
    const result = evaluateExecutionSafeEntryTiming({
      timing: verifiedTimingInput(),
      liquidity: {
        ticker: 'ATYM',
        side: 'BUY',
        orderType: 'LIMIT',
        lastTradePrice: 939.5,
        bidPrice: 915,
        askPrice: 964.5,
        proposedLimitPrice: 942,
        lowLiquidityFlag: true,
        ...quoteEvidence,
      },
    });

    expect(result.state).toBe('BUY_NOW');
    expect(result.executionAllowed).toBe(true);
    expect(result.liquidity.immediateExecutionPossible).toBe(false);
  });

  it('fails closed when timing and liquidity identify different tickers', () => {
    const result = evaluateExecutionSafeEntryTiming({
      timing: verifiedTimingInput('NVDA'),
      liquidity: {
        ticker: 'ATYM',
        side: 'BUY',
        orderType: 'MARKET',
        lastTradePrice: 100,
        bidPrice: 99.95,
        askPrice: 100.05,
        ...quoteEvidence,
      },
    });

    expect(result.timing.state).toBe('BUY_NOW');
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.tickerIdentityVerified).toBe(false);
    expect(result.executionAllowed).toBe(false);
  });

  it('preserves a non-executable timing state even when liquidity passes', () => {
    const timing = verifiedTimingInput();
    const result = evaluateExecutionSafeEntryTiming({
      timing: { ...timing, returnScore: 800 },
      liquidity: {
        ticker: 'ATYM',
        side: 'BUY',
        orderType: 'MARKET',
        lastTradePrice: 100,
        bidPrice: 99.95,
        askPrice: 100.05,
        ...quoteEvidence,
      },
    });

    expect(evaluateReturnAwareEntryTiming({ ...timing, returnScore: 800 }).state).toBe('WAIT_RETURN');
    expect(result.state).toBe('WAIT_RETURN');
    expect(result.executionAllowed).toBe(false);
  });
});
