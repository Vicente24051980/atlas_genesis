import {
  marketTapePasses,
  type UniversalMarketTapeIntegrityResult,
} from '../algorithm/universal-market-tape-integrity-omega';

export type LiquidityDirection = 'EXPANDING' | 'CONTRACTING' | 'MIXED' | 'UNKNOWN';
export type TransmissionState = 'WEAK' | 'NEUTRAL' | 'STRONG' | 'INSUFFICIENT_EVIDENCE';

export type GlobalLiquidityInput = {
  centralBankLiquidity: number;
  treasuryLiquidity: number;
  creditLiquidity: number;
  marketLiquidity: number;
  destination: {
    equities: number;
    gold: number;
    bitcoin: number;
    credit: number;
    commodities: number;
    realEconomyCapex: number;
  };
  evidenceIds: string[];
};

export type BtcLiquidityTriggerInput = {
  marketTapeSubject: string;
  marketTapeIntegrity?: UniversalMarketTapeIntegrityResult;
  fedReservesUp: boolean;
  tgaDown: boolean;
  realYieldsDown: boolean;
  dxyDown: boolean;
  stablecoinLiquidityUp: boolean;
  btcEtfFlowsUp: boolean;
  btcRelativeStrengthUp: boolean;
  evidenceIds: string[];
};

export type BtcLiquidityTriggerResult = {
  score: number;
  state: 'NO_TRIGGER' | 'EARLY_WATCH' | 'PROBABLE_TRIGGER' | 'CONFIRMED_TRIGGER';
  marketTapeVerified: boolean;
  reasons: string[];
};

export const GLOBAL_LIQUIDITY_TRANSMISSION_OMEGA = {
  id: 'GLOBAL_LIQUIDITY_TRANSMISSION_OMEGA_V1_1',
  version: '1.1.0',
  status: 'canonical',
  laws: [
    'MONETARY_LIQUIDITY != MARKET_LIQUIDITY',
    'MARKET_LIQUIDITY != ASSET_SPECIFIC_LIQUIDITY',
    'GLOBAL_LIQUIDITY_GROWTH != UNIVERSAL_RISK_ASSET_INFLOW',
    'LIQUIDITY_SOURCE != LIQUIDITY_DESTINATION',
    'PRICE_MOVE != LIQUIDITY_FLOW',
    'BTC_RELATIVE_STRENGTH_REQUIRES_UNIVERSAL_MARKET_TAPE_PASS',
  ] as const,
  weights: {
    centralBankLiquidity: 0.25,
    treasuryLiquidity: 0.20,
    creditLiquidity: 0.20,
    marketLiquidity: 0.20,
    destinationBreadth: 0.15,
  } as const,
} as const;

function assertScore(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`liquidity_score_out_of_range:${name}`);
}

function btcMarketTapeVerified(input: BtcLiquidityTriggerInput): boolean {
  return Boolean(
    input.marketTapeSubject.trim() &&
    marketTapePasses(input.marketTapeIntegrity) &&
    input.marketTapeIntegrity?.selectedTicker === input.marketTapeSubject,
  );
}

export function calculateGlobalLiquidityScore(input: GlobalLiquidityInput): number | null {
  if (input.evidenceIds.length === 0) return null;
  const d = input.destination;
  Object.entries({
    centralBankLiquidity: input.centralBankLiquidity,
    treasuryLiquidity: input.treasuryLiquidity,
    creditLiquidity: input.creditLiquidity,
    marketLiquidity: input.marketLiquidity,
    equities: d.equities,
    gold: d.gold,
    bitcoin: d.bitcoin,
    credit: d.credit,
    commodities: d.commodities,
    realEconomyCapex: d.realEconomyCapex,
  }).forEach(([k, v]) => assertScore(k, v));
  const destinationBreadth = (d.equities + d.gold + d.bitcoin + d.credit + d.commodities + d.realEconomyCapex) / 6;
  const w = GLOBAL_LIQUIDITY_TRANSMISSION_OMEGA.weights;
  const score =
    input.centralBankLiquidity * w.centralBankLiquidity +
    input.treasuryLiquidity * w.treasuryLiquidity +
    input.creditLiquidity * w.creditLiquidity +
    input.marketLiquidity * w.marketLiquidity +
    destinationBreadth * w.destinationBreadth;
  return Math.round(score * 100) / 100;
}

export function classifyDirection(score: number | null): LiquidityDirection {
  if (score == null) return 'UNKNOWN';
  if (score >= 65) return 'EXPANDING';
  if (score <= 35) return 'CONTRACTING';
  return 'MIXED';
}

export function assessDestination(score: number, evidenceIds: string[]): TransmissionState {
  if (evidenceIds.length === 0) return 'INSUFFICIENT_EVIDENCE';
  assertScore('destination', score);
  if (score >= 67) return 'STRONG';
  if (score <= 33) return 'WEAK';
  return 'NEUTRAL';
}

export function assessBtcLiquidityTrigger(input: BtcLiquidityTriggerInput): BtcLiquidityTriggerResult {
  const tapeVerified = btcMarketTapeVerified(input);
  if (input.evidenceIds.length === 0) {
    return { score: 0, state: 'NO_TRIGGER', marketTapeVerified: tapeVerified, reasons: ['missing_evidence'] };
  }

  const signals = [
    input.fedReservesUp,
    input.tgaDown,
    input.realYieldsDown,
    input.dxyDown,
    input.stablecoinLiquidityUp,
    input.btcEtfFlowsUp,
  ];
  if (tapeVerified) signals.push(input.btcRelativeStrengthUp);

  const count = signals.filter(Boolean).length;
  const score = Math.round((count / signals.length) * 10000) / 100;
  const macroCore = input.fedReservesUp && input.tgaDown && input.realYieldsDown;
  const marketCore = input.btcEtfFlowsUp || input.stablecoinLiquidityUp || (tapeVerified && input.btcRelativeStrengthUp);
  const reasons: string[] = [];
  if (!tapeVerified) {
    reasons.push('btc_relative_strength_excluded_without_universal_market_tape');
    if (input.marketTapeIntegrity?.selectedTicker && input.marketTapeIntegrity.selectedTicker !== input.marketTapeSubject) {
      reasons.push('market_tape_subject_mismatch');
    }
  }

  if (count >= 5 && macroCore && marketCore) return { score, state: 'CONFIRMED_TRIGGER', marketTapeVerified: tapeVerified, reasons };
  if (count >= 4 && marketCore) return { score, state: 'PROBABLE_TRIGGER', marketTapeVerified: tapeVerified, reasons: ['needs_full_macro_confirmation', ...reasons] };
  if (count >= 2) return { score, state: 'EARLY_WATCH', marketTapeVerified: tapeVerified, reasons: ['partial_liquidity_convergence', ...reasons] };
  return { score, state: 'NO_TRIGGER', marketTapeVerified: tapeVerified, reasons: ['insufficient_signal_convergence', ...reasons] };
}
