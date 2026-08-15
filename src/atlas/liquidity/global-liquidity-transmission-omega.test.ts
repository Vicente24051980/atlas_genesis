import {
  assessBtcLiquidityTrigger,
  assessDestination,
  calculateGlobalLiquidityScore,
  classifyDirection,
} from './global-liquidity-transmission-omega';

describe('Global Liquidity Transmission Omega', () => {
  it('keeps global liquidity separate from destination-specific transmission', () => {
    const score = calculateGlobalLiquidityScore({
      centralBankLiquidity: 70,
      treasuryLiquidity: 30,
      creditLiquidity: 75,
      marketLiquidity: 55,
      destination: { equities: 75, gold: 80, bitcoin: 25, credit: 65, commodities: 60, realEconomyCapex: 85 },
      evidenceIds: ['fed-h41', 'bis-gli'],
    });
    expect(score).not.toBeNull();
    expect(classifyDirection(score)).toBe('MIXED');
    expect(assessDestination(25, ['btc-flow'])).toBe('WEAK');
    expect(assessDestination(80, ['gold-flow'])).toBe('STRONG');
  });

  it('requires macro and market convergence for confirmed BTC trigger', () => {
    expect(assessBtcLiquidityTrigger({
      fedReservesUp: true,
      tgaDown: true,
      realYieldsDown: true,
      dxyDown: true,
      stablecoinLiquidityUp: false,
      btcEtfFlowsUp: true,
      btcRelativeStrengthUp: false,
      evidenceIds: ['fed', 'treasury', 'real-yields', 'btc-etf'],
    }).state).toBe('CONFIRMED_TRIGGER');
  });

  it('does not confirm BTC from price alone', () => {
    expect(assessBtcLiquidityTrigger({
      fedReservesUp: false,
      tgaDown: false,
      realYieldsDown: false,
      dxyDown: false,
      stablecoinLiquidityUp: false,
      btcEtfFlowsUp: false,
      btcRelativeStrengthUp: true,
      evidenceIds: ['btc-price'],
    }).state).toBe('NO_TRIGGER');
  });
});
