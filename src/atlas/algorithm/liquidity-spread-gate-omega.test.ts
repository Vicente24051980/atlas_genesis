import { evaluateLiquiditySpreadGate } from './liquidity-spread-gate-omega';
import { evaluateExecutionSafeEntryTiming } from './execution-safe-entry-timing-omega';

const baseTiming = {
  ticker: 'ATYM',
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

describe('Liquidity / Spread Gate Omega', () => {
  it('flags the observed ATYM-like 939.5p -> 964.5p execution as a post-trade breach', () => {
    const result = evaluateLiquiditySpreadGate({
      ticker: 'ATYM',
      side: 'BUY',
      orderType: 'MARKET',
      lastTradePrice: 939.5,
      bidPrice: 935,
      askPrice: 964.5,
      executedPrice: 964.5,
      venue: 'LSE',
      lowLiquidityFlag: true,
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
    });

    expect(result.executionAllowed).toBe(false);
    expect(['LIMIT_ONLY', 'WAIT_SPREAD']).toContain(result.decision);
    expect(result.limitOrderRequired).toBe(true);
  });

  it('allows a protected limit even when the live spread is wide', () => {
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
    });

    expect(result.decision).toBe('PASS_LIMIT_PROTECTED');
    expect(result.executionAllowed).toBe(true);
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
    });

    expect(result.decision).toBe('PASS');
    expect(result.executionAllowed).toBe(true);
    expect(result.marketOrderAllowed).toBe(true);
  });
});

describe('Execution-Safe Entry Timing Omega', () => {
  it('converts a timing BUY into WAIT_SPREAD when execution is unsafe', () => {
    const result = evaluateExecutionSafeEntryTiming({
      timing: baseTiming,
      liquidity: {
        ticker: 'ATYM',
        side: 'BUY',
        orderType: 'MARKET',
        lastTradePrice: 939.5,
        bidPrice: 915,
        askPrice: 964.5,
        lowLiquidityFlag: true,
      },
    });

    expect(result.timing.state).toBe('BUY_NOW');
    expect(result.state).toBe('WAIT_SPREAD');
    expect(result.executionAllowed).toBe(false);
  });

  it('restores the timing state when a protected limit passes', () => {
    const result = evaluateExecutionSafeEntryTiming({
      timing: baseTiming,
      liquidity: {
        ticker: 'ATYM',
        side: 'BUY',
        orderType: 'LIMIT',
        lastTradePrice: 939.5,
        bidPrice: 915,
        askPrice: 964.5,
        proposedLimitPrice: 942,
        lowLiquidityFlag: true,
      },
    });

    expect(result.state).toBe('BUY_NOW');
    expect(result.executionAllowed).toBe(true);
  });
});
