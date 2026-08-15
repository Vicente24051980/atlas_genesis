export type GoldAccumulationState =
  | 'NO_SIGNAL'
  | 'MIXED'
  | 'ACCUMULATING'
  | 'STRONG_CONFIRMED';

export interface SovereignGoldInput {
  reportedCentralBankPurchasesTonnes: number;
  consecutiveBuyingMonths: number;
  buyingDuringPriceCorrection: boolean;
  goldShareOfFxReservesTrend: 'UP' | 'FLAT' | 'DOWN' | 'UNKNOWN';
  privateInvestmentDemandTrend: 'UP' | 'MIXED' | 'DOWN' | 'UNKNOWN';
  jewelleryDemandTrend: 'UP' | 'MIXED' | 'DOWN' | 'UNKNOWN';
  realYieldTrend: 'UP' | 'FLAT' | 'DOWN' | 'UNKNOWN';
  dollarTrend: 'UP' | 'FLAT' | 'DOWN' | 'UNKNOWN';
  verifiedHiddenStateBuying: boolean;
}

export interface SovereignGoldOutput {
  score: number;
  state: GoldAccumulationState;
  sovereignAccumulationConfirmed: boolean;
  privateDemandState: 'POSITIVE' | 'MIXED' | 'WEAK' | 'UNKNOWN';
  hiddenBuyingState: 'VERIFIED' | 'UNVERIFIED';
  falsifierRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  rulesTriggered: string[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function sovereignGoldAccumulationOmega(input: SovereignGoldInput): SovereignGoldOutput {
  let score = 0;
  const rulesTriggered: string[] = [];

  if (input.reportedCentralBankPurchasesTonnes > 0) {
    score += 30;
    rulesTriggered.push('REPORTED_CENTRAL_BANK_NET_BUYING');
  }

  if (input.consecutiveBuyingMonths >= 6) {
    score += 20;
    rulesTriggered.push('MULTI_MONTH_PERSISTENCE');
  }

  if (input.buyingDuringPriceCorrection) {
    score += 20;
    rulesTriggered.push('BUYING_INTO_WEAKNESS');
  }

  if (input.goldShareOfFxReservesTrend === 'UP') {
    score += 15;
    rulesTriggered.push('GOLD_SHARE_OF_RESERVES_RISING');
  }

  if (input.privateInvestmentDemandTrend === 'UP') score += 10;
  if (input.realYieldTrend === 'DOWN') score += 5;

  score = clamp(score);

  const sovereignAccumulationConfirmed =
    input.reportedCentralBankPurchasesTonnes > 0 &&
    input.consecutiveBuyingMonths >= 3;

  let state: GoldAccumulationState = 'NO_SIGNAL';
  if (score >= 75 && sovereignAccumulationConfirmed) state = 'STRONG_CONFIRMED';
  else if (score >= 55 && sovereignAccumulationConfirmed) state = 'ACCUMULATING';
  else if (score >= 35) state = 'MIXED';

  const privateDemandState =
    input.privateInvestmentDemandTrend === 'UP'
      ? 'POSITIVE'
      : input.privateInvestmentDemandTrend === 'DOWN'
        ? 'WEAK'
        : input.privateInvestmentDemandTrend === 'UNKNOWN'
          ? 'UNKNOWN'
          : 'MIXED';

  const hiddenBuyingState = input.verifiedHiddenStateBuying ? 'VERIFIED' : 'UNVERIFIED';

  const falsifierCount = [
    input.realYieldTrend === 'UP',
    input.dollarTrend === 'UP',
    input.reportedCentralBankPurchasesTonnes < 0,
    input.privateInvestmentDemandTrend === 'DOWN',
  ].filter(Boolean).length;

  const falsifierRisk = falsifierCount >= 3 ? 'HIGH' : falsifierCount >= 2 ? 'MEDIUM' : 'LOW';

  return {
    score,
    state,
    sovereignAccumulationConfirmed,
    privateDemandState,
    hiddenBuyingState,
    falsifierRisk,
    rulesTriggered,
  };
}

export const SOVEREIGN_GOLD_ACCUMULATION_OMEGA = {
  id: 'SOVEREIGN_GOLD_ACCUMULATION_OMEGA_V1',
  version: '1.0',
  laws: [
    'REPORTED OFFICIAL PURCHASES != ESTIMATED HIDDEN PURCHASES',
    'CENTRAL BANK DEMAND != PRIVATE CHINA DEMAND',
    'GOLD PRICE RISE != PROOF OF SOVEREIGN FLOW',
    'BUYING DURING CORRECTIONS STRENGTHENS STRATEGIC-ACCUMULATION EVIDENCE',
    'UNVERIFIED HIDDEN BUYING CANNOT INCREASE CONVICTION',
  ],
} as const;
