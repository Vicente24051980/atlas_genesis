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
  reasons: string[];
};

export const GLOBAL_LIQUIDITY_TRANSMISSION_OMEGA = {
  id: 'GLOBAL_LIQUIDITY_TRANSMISSION_OMEGA_V1',
  version: '1.0.0',
  status: 'canonical',
  laws: [
    'MONETARY_LIQUIDITY != MARKET_LIQUIDITY',
    'MARKET_LIQUIDITY != ASSET_SPECIFIC_LIQUIDITY',
    'GLOBAL_LIQUIDITY_GROWTH != UNIVERSAL_RISK_ASSET_INFLOW',
    'LIQUIDITY_SOURCE != LIQUIDITY_DESTINATION',
    'PRICE_MOVE != LIQUIDITY_FLOW',
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
  if (input.evidenceIds.length === 0) return { score: 0, state: 'NO_TRIGGER', reasons: ['missing_evidence'] };
  const signals = [
    input.fedReservesUp,
    input.tgaDown,
    input.realYieldsDown,
    input.dxyDown,
    input.stablecoinLiquidityUp,
    input.btcEtfFlowsUp,
    input.btcRelativeStrengthUp,
  ];
  const count = signals.filter(Boolean).length;
  const score = Math.round((count / signals.length) * 10000) / 100;
  const macroCore = input.fedReservesUp && input.tgaDown && input.realYieldsDown;
  const marketCore = input.btcEtfFlowsUp || input.btcRelativeStrengthUp || input.stablecoinLiquidityUp;
  if (count >= 5 && macroCore && marketCore) return { score, state: 'CONFIRMED_TRIGGER', reasons: [] };
  if (count >= 4 && marketCore) return { score, state: 'PROBABLE_TRIGGER', reasons: ['needs_full_macro_confirmation'] };
  if (count >= 2) return { score, state: 'EARLY_WATCH', reasons: ['partial_liquidity_convergence'] };
  return { score, state: 'NO_TRIGGER', reasons: ['insufficient_signal_convergence'] };
}
