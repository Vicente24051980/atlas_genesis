import { evaluateUniversalMarketTapeIntegrity } from '../algorithm/universal-market-tape-integrity-omega';
import {
  assessBtcLiquidityTrigger,
  assessDestination,
  calculateGlobalLiquidityScore,
  classifyDirection,
} from './global-liquidity-transmission-omega';

function tape(subject: string) {
  return evaluateUniversalMarketTapeIntegrity({
    ticker: subject,
    primaryListing: 'CRYPTO_PROXY',
    currency: 'USD',
    quotationUnit: 'USD',
    asOfTimestamp: '2026-08-21T21:20:00+02:00',
    expectedSessionState: 'OPEN',
    observations: [{
      ticker: subject,
      primaryListing: 'CRYPTO_PROXY',
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

const btcMarket = { marketTapeSubject: 'BTCUSD', marketTapeIntegrity: tape('BTCUSD') };

describe('Global Liquidity Transmission Omega v1.1', () => {
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
      ...btcMarket,
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
      ...btcMarket,
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

  it('excludes BTC relative strength when market tape is missing instead of treating it as valid confirmation', () => {
    const result = assessBtcLiquidityTrigger({
      marketTapeSubject: 'BTCUSD',
      marketTapeIntegrity: undefined,
      fedReservesUp: true,
      tgaDown: true,
      realYieldsDown: true,
      dxyDown: false,
      stablecoinLiquidityUp: false,
      btcEtfFlowsUp: false,
      btcRelativeStrengthUp: true,
      evidenceIds: ['fed', 'treasury', 'real-yields', 'btc-price'],
    });
    expect(result.marketTapeVerified).toBe(false);
    expect(result.reasons).toContain('btc_relative_strength_excluded_without_universal_market_tape');
    expect(result.state).toBe('EARLY_WATCH');
  });

  it('rejects cross-asset tape reuse for BTC relative strength', () => {
    const result = assessBtcLiquidityTrigger({
      marketTapeSubject: 'BTCUSD',
      marketTapeIntegrity: tape('ETHUSD'),
      fedReservesUp: false,
      tgaDown: false,
      realYieldsDown: false,
      dxyDown: false,
      stablecoinLiquidityUp: false,
      btcEtfFlowsUp: false,
      btcRelativeStrengthUp: true,
      evidenceIds: ['btc-price'],
    });
    expect(result.marketTapeVerified).toBe(false);
    expect(result.reasons).toContain('market_tape_subject_mismatch');
  });
});
