export type ExecutionSide = 'BUY' | 'SELL';
export type ExecutionOrderType = 'MARKET' | 'LIMIT';

export type LiquiditySpreadDecision =
  | 'PASS'
  | 'PASS_LIMIT_PROTECTED'
  | 'LIMIT_ONLY'
  | 'WAIT_SPREAD'
  | 'EVIDENCE_REQUIRED'
  | 'EXECUTION_BREACH';

export interface LiquiditySpreadGateInput {
  ticker: string;
  side: ExecutionSide;
  orderType: ExecutionOrderType;

  // Quote snapshot. All prices must use the same currency/unit (e.g. GBX/pence).
  lastTradePrice?: number | null;
  bidPrice?: number | null;
  askPrice?: number | null;

  // Quote provenance/freshness. Required for every pre-trade decision.
  quoteTimestamp?: string | null;
  quoteSource?: string | null;

  // Optional deterministic clock for tests/replay. Defaults to now.
  evaluatedAt?: string | null;

  // Required for LIMIT orders.
  proposedLimitPrice?: number | null;

  // Optional post-trade audit field.
  executedPrice?: number | null;

  venue?: string | null;
  lowLiquidityFlag?: boolean;

  // Optional ticker/venue-specific overrides. Percent units, not decimals.
  maxQuotedSpreadPct?: number;
  maxReferencePremiumPct?: number;
  maxExecutionSlippagePct?: number;
  severeQuotedSpreadPct?: number;
  maxQuoteAgeSeconds?: number;
}

export interface LiquiditySpreadGateResult {
  ticker: string;
  decision: LiquiditySpreadDecision;
  executionAllowed: boolean;
  orderPlacementAllowed: boolean;
  immediateExecutionPossible: boolean | null;
  marketOrderAllowed: boolean;
  limitOrderRequired: boolean;
  quotedSpreadPct: number | null;
  referencePremiumPct: number | null;
  executionSlippagePct: number | null;
  referencePrice: number | null;
  quoteAgeSeconds: number | null;
  quoteFresh: boolean;
  quoteSource: string | null;
  maxAcceptableBuyPrice: number | null;
  minAcceptableSellPrice: number | null;
  reasons: string[];
}

export const LIQUIDITY_SPREAD_GATE_OMEGA = {
  id: 'LIQUIDITY_SPREAD_GATE_OMEGA_V1_1',
  name: 'Liquidity / Spread Gate Ω v1.1',
  status: 'canonical',
  defaults: {
    maxQuotedSpreadPct: 1.0,
    maxReferencePremiumPct: 0.75,
    maxExecutionSlippagePct: 0.75,
    severeQuotedSpreadPct: 2.0,
    maxQuoteAgeSeconds: 30,
  },
  constitutionalRules: [
    'FUNDAMENTAL PASS != EXECUTION PASS.',
    'Displayed last-trade price is not an executable buy price; execution must be evaluated against bid/ask or a protected limit.',
    'FX conversion cost is separate from spread/slippage and must not be used to explain an execution-price gap without evidence.',
    'A market order is blocked when spread or executable-price premium breaches the configured execution budget.',
    'A protected limit order may remain valid even when the live spread is wide, provided the limit itself stays inside the configured execution budget.',
    'Every pre-trade decision requires a timestamped, attributable and fresh quote snapshot.',
    'Configuration overrides must be finite, non-negative and internally coherent; invalid configuration fails closed.',
    'Liquidity / Spread Gate Ω may block execution but never rewrites Economic Proof, valuation, thesis quality or Equity Monetization.',
    'Post-trade slippage above budget is an execution breach and must be logged for calibration.',
  ] as const,
} as const;

function validPrice(value?: number | null): value is number {
  return value != null && Number.isFinite(value) && value > 0;
}

function validNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function parseTimestamp(value?: string | null): number | null {
  if (!value?.trim()) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value: number, decimals = 4): number {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}

function pct(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : (numerator / denominator) * 100;
}

export function evaluateLiquiditySpreadGate(input: LiquiditySpreadGateInput): LiquiditySpreadGateResult {
  const maxQuotedSpreadPct = input.maxQuotedSpreadPct ?? LIQUIDITY_SPREAD_GATE_OMEGA.defaults.maxQuotedSpreadPct;
  const maxReferencePremiumPct = input.maxReferencePremiumPct ?? LIQUIDITY_SPREAD_GATE_OMEGA.defaults.maxReferencePremiumPct;
  const maxExecutionSlippagePct = input.maxExecutionSlippagePct ?? LIQUIDITY_SPREAD_GATE_OMEGA.defaults.maxExecutionSlippagePct;
  const severeQuotedSpreadPct = input.severeQuotedSpreadPct ?? LIQUIDITY_SPREAD_GATE_OMEGA.defaults.severeQuotedSpreadPct;
  const maxQuoteAgeSeconds = input.maxQuoteAgeSeconds ?? LIQUIDITY_SPREAD_GATE_OMEGA.defaults.maxQuoteAgeSeconds;

  const reasons: string[] = [];
  const configurationValid = [
    maxQuotedSpreadPct,
    maxReferencePremiumPct,
    maxExecutionSlippagePct,
    severeQuotedSpreadPct,
  ].every(validNonNegative)
    && Number.isFinite(maxQuoteAgeSeconds)
    && maxQuoteAgeSeconds > 0
    && severeQuotedSpreadPct >= maxQuotedSpreadPct;

  const hasBidAsk = validPrice(input.bidPrice) && validPrice(input.askPrice) && input.askPrice >= input.bidPrice;
  const midpoint = hasBidAsk ? (input.bidPrice! + input.askPrice!) / 2 : null;
  const referencePrice = validPrice(input.lastTradePrice) ? input.lastTradePrice : midpoint;

  const evaluatedTimestamp = input.evaluatedAt == null
    ? Date.now()
    : parseTimestamp(input.evaluatedAt);
  const quoteTimestamp = parseTimestamp(input.quoteTimestamp);
  const quoteAgeSeconds = quoteTimestamp != null && evaluatedTimestamp != null
    ? round((evaluatedTimestamp - quoteTimestamp) / 1000, 3)
    : null;
  const quoteFresh = quoteAgeSeconds != null
    && quoteAgeSeconds >= -5
    && quoteAgeSeconds <= maxQuoteAgeSeconds;
  const quoteSource = input.quoteSource?.trim() || null;

  const quotedSpreadPct = hasBidAsk && midpoint
    ? round(pct(input.askPrice! - input.bidPrice!, midpoint))
    : null;

  let referencePremiumPct: number | null = null;
  if (referencePrice != null) {
    if (input.side === 'BUY' && validPrice(input.askPrice)) {
      referencePremiumPct = round(pct(input.askPrice - referencePrice, referencePrice));
    } else if (input.side === 'SELL' && validPrice(input.bidPrice)) {
      referencePremiumPct = round(pct(referencePrice - input.bidPrice, referencePrice));
    }
  }

  let executionSlippagePct: number | null = null;
  if (referencePrice != null && validPrice(input.executedPrice)) {
    executionSlippagePct = input.side === 'BUY'
      ? round(pct(input.executedPrice - referencePrice, referencePrice))
      : round(pct(referencePrice - input.executedPrice, referencePrice));
  }

  const maxAcceptableBuyPrice = referencePrice != null
    && validNonNegative(maxReferencePremiumPct)
    ? round(referencePrice * (1 + maxReferencePremiumPct / 100), 6)
    : null;
  const minAcceptableSellPrice = referencePrice != null
    && validNonNegative(maxReferencePremiumPct)
    ? round(referencePrice * (1 - maxReferencePremiumPct / 100), 6)
    : null;

  const build = (
    decision: LiquiditySpreadDecision,
    orderPlacementAllowed: boolean,
    immediateExecutionPossible: boolean | null,
    marketOrderAllowed: boolean,
    limitOrderRequired: boolean,
  ): LiquiditySpreadGateResult => ({
    ticker: input.ticker,
    decision,
    executionAllowed: orderPlacementAllowed,
    orderPlacementAllowed,
    immediateExecutionPossible,
    marketOrderAllowed,
    limitOrderRequired,
    quotedSpreadPct,
    referencePremiumPct,
    executionSlippagePct,
    referencePrice,
    quoteAgeSeconds,
    quoteFresh,
    quoteSource,
    maxAcceptableBuyPrice,
    minAcceptableSellPrice,
    reasons,
  });

  if (!configurationValid) {
    reasons.push('Liquidity / Spread Gate Ω configuration is invalid; execution fails closed.');
    return build('EVIDENCE_REQUIRED', false, null, false, true);
  }

  if (!input.ticker.trim()) {
    reasons.push('A non-empty ticker is required for execution evidence.');
    return build('EVIDENCE_REQUIRED', false, null, false, true);
  }

  if (!quoteSource) {
    reasons.push('Quote provenance is missing; quoteSource is required.');
    return build('EVIDENCE_REQUIRED', false, null, false, true);
  }

  if (evaluatedTimestamp == null || quoteTimestamp == null) {
    reasons.push('Quote freshness cannot be verified from valid quoteTimestamp/evaluatedAt evidence.');
    return build('EVIDENCE_REQUIRED', false, null, false, true);
  }

  if (!quoteFresh) {
    reasons.push(`Quote age ${quoteAgeSeconds ?? 'unknown'}s is outside the permitted ${maxQuoteAgeSeconds}s freshness window.`);
    return build('EVIDENCE_REQUIRED', false, null, false, true);
  }

  reasons.push(`Quote evidence from ${quoteSource} is attributable and fresh (${quoteAgeSeconds}s old).`);

  if (executionSlippagePct != null && executionSlippagePct > maxExecutionSlippagePct) {
    reasons.push(`Post-trade execution slippage ${executionSlippagePct}% exceeds the ${maxExecutionSlippagePct}% budget.`);
    reasons.push('Log as an execution breach; do not attribute the gap to FX without separate FX evidence.');
    return build('EXECUTION_BREACH', false, false, false, true);
  }

  if (!hasBidAsk) {
    reasons.push('A valid bid/ask snapshot with ask >= bid is required; last-trade alone is not executable evidence.');
    return build('EVIDENCE_REQUIRED', false, null, false, true);
  }

  if (input.orderType === 'LIMIT') {
    if (!validPrice(input.proposedLimitPrice) || referencePrice == null) {
      reasons.push('A LIMIT order requires both a valid proposed limit and an executable reference price for this gate.');
      return build('EVIDENCE_REQUIRED', false, null, false, true);
    }

    const protectedBuy = input.side === 'BUY' && maxAcceptableBuyPrice != null && input.proposedLimitPrice <= maxAcceptableBuyPrice;
    const protectedSell = input.side === 'SELL' && minAcceptableSellPrice != null && input.proposedLimitPrice >= minAcceptableSellPrice;

    if (protectedBuy || protectedSell) {
      if (quotedSpreadPct != null && quotedSpreadPct > severeQuotedSpreadPct) {
        reasons.push(`Quoted spread ${quotedSpreadPct}% is severe, but the limit price caps execution inside the configured budget.`);
      } else if (quotedSpreadPct != null && quotedSpreadPct > maxQuotedSpreadPct) {
        reasons.push(`Quoted spread ${quotedSpreadPct}% is wide; execution remains acceptable only because the order is price-protected.`);
      }
      reasons.push('Limit protection is inside the configured reference-price premium/discount budget.');
      const immediatelyExecutable = input.side === 'BUY'
        ? input.proposedLimitPrice >= input.askPrice!
        : input.proposedLimitPrice <= input.bidPrice!;
      if (!immediatelyExecutable) {
        reasons.push('Protected limit placement is allowed, but no immediate fill is asserted at the current bid/ask.');
      }
      return build('PASS_LIMIT_PROTECTED', true, immediatelyExecutable, false, true);
    }

    reasons.push('Proposed limit is too aggressive relative to the reference-price execution budget.');
    return build('WAIT_SPREAD', false, false, false, true);
  }

  if (quotedSpreadPct != null && quotedSpreadPct > severeQuotedSpreadPct) {
    reasons.push(`Quoted spread ${quotedSpreadPct}% exceeds the severe-spread threshold ${severeQuotedSpreadPct}%.`);
    reasons.push('Block the market order. Use a protected limit or wait for liquidity to normalize.');
    return build('WAIT_SPREAD', false, false, false, true);
  }

  const spreadTooWide = quotedSpreadPct != null && quotedSpreadPct > maxQuotedSpreadPct;
  const premiumTooHigh = referencePremiumPct != null && referencePremiumPct > maxReferencePremiumPct;

  if (spreadTooWide || premiumTooHigh || input.lowLiquidityFlag) {
    if (spreadTooWide) reasons.push(`Quoted spread ${quotedSpreadPct}% exceeds the ${maxQuotedSpreadPct}% market-order budget.`);
    if (premiumTooHigh) reasons.push(`Executable ${input.side === 'BUY' ? 'ask premium' : 'bid discount'} ${referencePremiumPct}% exceeds the ${maxReferencePremiumPct}% budget.`);
    if (input.lowLiquidityFlag) reasons.push('Instrument is flagged as low-liquidity; price protection is mandatory.');
    reasons.push('Market order blocked; submit a price-protected limit order instead.');
    return build('LIMIT_ONLY', false, false, false, true);
  }

  reasons.push('Bid/ask spread and executable-price premium are inside the configured execution budget.');
  return build('PASS', true, true, true, false);
}
