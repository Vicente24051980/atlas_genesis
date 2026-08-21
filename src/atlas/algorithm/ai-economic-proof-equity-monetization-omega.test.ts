import {
  assessAiEconomicProofEquity,
  summarizeAiEquityCohort,
  type AiEconomicProofEquityInput,
} from './ai-economic-proof-equity-monetization-omega';

const base: Omit<AiEconomicProofEquityInput, 'ticker' | 'drawdownFromTmaxPct'> = {
  asOf: '2026-08-20',
  evidenceIds: ['verified-economic-evidence', 'verified-price-matrix'],
  t2RevenueCapture: 88,
  t3FreeCashFlow: 84,
  t5AiRoic: 80,
  t6MoatPersistence: 86,
  economicProofTrend: 'UP',
  capitalEfficiency: 82,
  expectedReturn: 76,
  riskFragility: 30,
  priceMatrixVerified: true,
  greenContinuity: 5,
  relativeStrength: 85,
  breadthSupport: 75,
  flowPositioning: 80,
  priceResponse: 80,
};

function caseFor(ticker: string, drawdownFromTmaxPct: number): AiEconomicProofEquityInput {
  return { ...base, ticker, drawdownFromTmaxPct };
}

describe('AI Economic Proof x Equity Monetization Omega v1.1', () => {
  it('keeps Economic Proof strong while Equity Monetization can be weak', () => {
    expect(assessAiEconomicProofEquity({
      ...caseFor('MU', -22.78),
      flowPositioning: 20,
      priceResponse: 20,
    })).toMatchObject({
      economicProofState: 'PROVEN_STRONG',
      cleanWinner: false,
      divergence: 'PROOF_UP_MONETIZATION_DOWN',
      decision: 'WATCH_FOR_REMONETIZATION',
      finalOpportunityVerified: true,
    });
  });

  it('does not call the least damaged stock a clean winner when it remains materially below Tmax', () => {
    const result = assessAiEconomicProofEquity(caseFor('ETN', -7.67));
    expect(result.cleanWinner).toBe(false);
    expect(result.equityMonetizationState).toBe('EARLY_RECEIVER');
    expect(result.reasons).toContain('not_a_clean_bursatile_winner');
  });

  it('preserves valid Economic Proof when Price Matrix / GREEN market evidence is unverified', () => {
    expect(assessAiEconomicProofEquity({ ...caseFor('NVDA', -7.71), priceMatrixVerified: false })).toMatchObject({
      economicProofState: 'PROVEN_STRONG',
      equityMonetizationState: 'UNVERIFIED',
      finalOpportunityScore: 0,
      finalOpportunityVerified: false,
      decision: 'MONITOR',
      reasons: expect.arrayContaining([
        'equity:price_matrix_not_verified',
        'economic_proof_preserved_while_equity_unverified',
      ]),
    });
  });

  it('does not let invalid GREEN continuity contaminate Economic Proof', () => {
    const input = { ...caseFor('GREEN_BAD', -7.71), greenContinuity: 7 as AiEconomicProofEquityInput['greenContinuity'] };
    expect(assessAiEconomicProofEquity(input)).toMatchObject({
      economicProofState: 'PROVEN_STRONG',
      equityMonetizationState: 'UNVERIFIED',
      finalOpportunityVerified: false,
      decision: 'MONITOR',
      reasons: expect.arrayContaining(['equity:invalid_green_continuity']),
    });
  });

  it('reproduces the 20-name calibration snapshot as 0/20 clean winners with median drawdown -19.58%', () => {
    const snapshot: readonly AiEconomicProofEquityInput[] = [
      caseFor('ETN', -7.67),
      caseFor('NVDA', -7.71),
      caseFor('APH', -11.50),
      caseFor('PWR', -13.73),
      caseFor('HUBB', -14.74),
      caseFor('GEV', -15.95),
      caseFor('VST', -16.12),
      caseFor('CMI', -16.39),
      caseFor('CEG', -17.44),
      caseFor('FIX', -17.93),
      caseFor('PRY.MI', -21.22),
      caseFor('LITE', -21.41),
      caseFor('MU', -22.78),
      caseFor('CAT', -23.36),
      caseFor('COHR', -24.18),
      caseFor('GNRC', -28.67),
      caseFor('VRT', -30.63),
      caseFor('MTZ', -37.81),
      caseFor('POWL', -38.45),
      caseFor('GLW', -43.53),
    ];

    expect(summarizeAiEquityCohort(snapshot)).toEqual({
      count: 20,
      cleanWinners: 0,
      confirmedReceivers: 0,
      medianDrawdownFromTmaxPct: -19.58,
      leastDamaged: ['ETN', 'NVDA', 'APH', 'PWR'],
      mostDamaged: ['GLW', 'POWL', 'MTZ', 'VRT'],
    });
  });

  it('allows a true clean winner only when proximity, continuity, RS, flow and price response all pass', () => {
    expect(assessAiEconomicProofEquity(caseFor('CLEAN', -2.5))).toMatchObject({
      cleanWinner: true,
      equityMonetizationState: 'CONFIRMED_RECEIVER',
      divergence: 'PROOF_UP_MONETIZATION_UP',
      decision: 'BUY_REVIEW',
      finalOpportunityVerified: true,
    });
  });
});
