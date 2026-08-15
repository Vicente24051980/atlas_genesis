import { sovereignGoldAccumulationOmega } from './sovereign-gold-accumulation-omega';

describe('Sovereign Gold Accumulation Ω', () => {
  it('confirms persistent official accumulation without counting hidden buying', () => {
    const out = sovereignGoldAccumulationOmega({
      reportedCentralBankPurchasesTonnes: 15,
      consecutiveBuyingMonths: 20,
      buyingDuringPriceCorrection: true,
      goldShareOfFxReservesTrend: 'UP',
      privateInvestmentDemandTrend: 'MIXED',
      jewelleryDemandTrend: 'DOWN',
      realYieldTrend: 'FLAT',
      dollarTrend: 'FLAT',
      verifiedHiddenStateBuying: false,
    });

    expect(out.sovereignAccumulationConfirmed).toBe(true);
    expect(out.state).toBe('STRONG_CONFIRMED');
    expect(out.hiddenBuyingState).toBe('UNVERIFIED');
  });

  it('does not confirm sovereign accumulation from private demand alone', () => {
    const out = sovereignGoldAccumulationOmega({
      reportedCentralBankPurchasesTonnes: 0,
      consecutiveBuyingMonths: 0,
      buyingDuringPriceCorrection: false,
      goldShareOfFxReservesTrend: 'FLAT',
      privateInvestmentDemandTrend: 'UP',
      jewelleryDemandTrend: 'UP',
      realYieldTrend: 'DOWN',
      dollarTrend: 'DOWN',
      verifiedHiddenStateBuying: false,
    });

    expect(out.sovereignAccumulationConfirmed).toBe(false);
    expect(out.state).not.toBe('STRONG_CONFIRMED');
  });
});
