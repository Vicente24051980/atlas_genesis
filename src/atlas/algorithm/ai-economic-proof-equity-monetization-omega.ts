export type AiEconomicProofState =
  | 'PROVEN_STRONG'
  | 'IMPROVING'
  | 'MIXED'
  | 'WEAKENING'
  | 'UNVERIFIED';

export type AiEquityMonetizationState =
  | 'CONFIRMED_RECEIVER'
  | 'EARLY_RECEIVER'
  | 'NEUTRAL'
  | 'REPRICING'
  | 'DISTRIBUTION'
  | 'UNVERIFIED';

export type AiProofMonetizationDivergence =
  | 'PROOF_UP_MONETIZATION_UP'
  | 'PROOF_UP_MONETIZATION_DOWN'
  | 'PROOF_DOWN_MONETIZATION_UP'
  | 'PROOF_DOWN_MONETIZATION_DOWN'
  | 'NO_CLEAR_DIVERGENCE'
  | 'UNVERIFIED';

export type AiProofMonetizationDecision =
  | 'BUY_REVIEW'
  | 'WATCH_FOR_REMONETIZATION'
  | 'MONITOR'
  | 'AVOID_CHASING'
  | 'REJECT';

export type AiEconomicProofEquityInput = {
  ticker: string;
  asOf: string;
  evidenceIds: readonly string[];

  // AI Economic Proof Ω: does the business capture AI value?
  t2RevenueCapture: number;
  t3FreeCashFlow: number;
  t5AiRoic: number;
  t6MoatPersistence: number;
  economicProofTrend: 'UP' | 'FLAT' | 'DOWN';

  // Orthogonal valuation / risk inputs used only after proof is assessed.
  capitalEfficiency: number;
  expectedReturn: number;
  riskFragility: number;

  // AI Equity Monetization Ω: is the stock market paying for that value?
  priceMatrixVerified: boolean;
  drawdownFromTmaxPct: number;
  greenContinuity: 0 | 1 | 2 | 3 | 4 | 5;
  relativeStrength: number;
  breadthSupport: number;
  flowPositioning: number;
  priceResponse: number;
};

export type AiEconomicProofEquityResult = {
  ticker: string;
  economicProofScore: number;
  economicProofState: AiEconomicProofState;
  equityMonetizationScore: number;
  equityMonetizationState: AiEquityMonetizationState;
  divergence: AiProofMonetizationDivergence;
  cleanWinner: boolean;
  finalOpportunityScore: number;
  decision: AiProofMonetizationDecision;
  reasons: readonly string[];
  guardrails: readonly string[];
};

export type AiEquityCohortSummary = {
  count: number;
  cleanWinners: number;
  confirmedReceivers: number;
  medianDrawdownFromTmaxPct: number | null;
  leastDamaged: readonly string[];
  mostDamaged: readonly string[];
};

const SCORE_FIELDS = [
  't2RevenueCapture',
  't3FreeCashFlow',
  't5AiRoic',
  't6MoatPersistence',
  'capitalEfficiency',
  'expectedReturn',
  'riskFragility',
  'relativeStrength',
  'breadthSupport',
  'flowPositioning',
  'priceResponse',
] as const;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return round(sorted[middle]);
  return round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function validateAiEconomicProofEquityInput(input: AiEconomicProofEquityInput): readonly string[] {
  const violations: string[] = [];
  if (!input.ticker.trim()) violations.push('missing_ticker');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.asOf)) violations.push('invalid_as_of');
  if (input.evidenceIds.length < 2) violations.push('requires_at_least_two_traceable_evidence_ids');

  for (const field of SCORE_FIELDS) {
    const value = input[field];
    if (!Number.isFinite(value) || value < 0 || value > 100) violations.push(`score_out_of_range:${field}`);
  }

  if (!Number.isFinite(input.drawdownFromTmaxPct) || input.drawdownFromTmaxPct > 0 || input.drawdownFromTmaxPct < -100) {
    violations.push('invalid_drawdown_from_tmax_pct');
  }
  if (!Number.isInteger(input.greenContinuity) || input.greenContinuity < 0 || input.greenContinuity > 5) {
    violations.push('invalid_green_continuity');
  }
  return violations;
}

export function scoreAiEconomicProof(input: AiEconomicProofEquityInput): number {
  if (validateAiEconomicProofEquityInput(input).length > 0) return 0;
  return round(
    input.t2RevenueCapture * 0.32 +
      input.t3FreeCashFlow * 0.28 +
      input.t5AiRoic * 0.24 +
      input.t6MoatPersistence * 0.16,
  );
}

export function classifyAiEconomicProof(input: AiEconomicProofEquityInput): AiEconomicProofState {
  if (validateAiEconomicProofEquityInput(input).length > 0) return 'UNVERIFIED';
  const score = scoreAiEconomicProof(input);
  if (score >= 82 && input.economicProofTrend !== 'DOWN') return 'PROVEN_STRONG';
  if (score >= 70 && input.economicProofTrend === 'UP') return 'IMPROVING';
  if (score >= 55) return 'MIXED';
  return 'WEAKENING';
}

export function scoreAiEquityMonetization(input: AiEconomicProofEquityInput): number {
  if (validateAiEconomicProofEquityInput(input).length > 0 || !input.priceMatrixVerified) return 0;

  // Tmax proximity is deliberately nonlinear: being merely "less down" is not leadership.
  const tmaxProximity = clamp(100 + input.drawdownFromTmaxPct * 4);
  const continuity = input.greenContinuity * 20;
  return round(
    tmaxProximity * 0.28 +
      continuity * 0.18 +
      input.relativeStrength * 0.18 +
      input.breadthSupport * 0.10 +
      input.flowPositioning * 0.14 +
      input.priceResponse * 0.12,
  );
}

export function isAiCleanWinner(input: AiEconomicProofEquityInput): boolean {
  if (validateAiEconomicProofEquityInput(input).length > 0 || !input.priceMatrixVerified) return false;

  // CONFIRMED RECEIVER is intentionally strict. A stock 8%, 20% or 40% below Tmax
  // can be economically attractive, but it is not a clean bursatile winner yet.
  return (
    input.drawdownFromTmaxPct >= -5 &&
    input.greenContinuity >= 4 &&
    input.relativeStrength >= 70 &&
    input.flowPositioning >= 65 &&
    input.priceResponse >= 65
  );
}

export function classifyAiEquityMonetization(input: AiEconomicProofEquityInput): AiEquityMonetizationState {
  if (validateAiEconomicProofEquityInput(input).length > 0 || !input.priceMatrixVerified) return 'UNVERIFIED';
  const score = scoreAiEquityMonetization(input);
  if (isAiCleanWinner(input) && score >= 72) return 'CONFIRMED_RECEIVER';
  if (input.drawdownFromTmaxPct >= -10 && input.relativeStrength >= 65 && input.priceResponse >= 55) return 'EARLY_RECEIVER';
  if (score >= 50) return 'NEUTRAL';
  if (input.drawdownFromTmaxPct <= -30 || (input.priceResponse <= 35 && input.flowPositioning <= 40)) return 'DISTRIBUTION';
  return 'REPRICING';
}

export function classifyAiProofMonetizationDivergence(
  input: AiEconomicProofEquityInput,
): AiProofMonetizationDivergence {
  if (validateAiEconomicProofEquityInput(input).length > 0 || !input.priceMatrixVerified) return 'UNVERIFIED';

  const proof = scoreAiEconomicProof(input);
  const equity = scoreAiEquityMonetization(input);
  const proofUp = input.economicProofTrend === 'UP' && proof >= 70;
  const proofDown = input.economicProofTrend === 'DOWN' || proof < 55;
  const monetizationUp = isAiCleanWinner(input) || equity >= 68;
  const monetizationDown = equity < 50 || ['REPRICING', 'DISTRIBUTION'].includes(classifyAiEquityMonetization(input));

  if (proofUp && monetizationUp) return 'PROOF_UP_MONETIZATION_UP';
  if (proofUp && monetizationDown) return 'PROOF_UP_MONETIZATION_DOWN';
  if (proofDown && monetizationUp) return 'PROOF_DOWN_MONETIZATION_UP';
  if (proofDown && monetizationDown) return 'PROOF_DOWN_MONETIZATION_DOWN';
  return 'NO_CLEAR_DIVERGENCE';
}

export function assessAiEconomicProofEquity(input: AiEconomicProofEquityInput): AiEconomicProofEquityResult {
  const violations = validateAiEconomicProofEquityInput(input);
  if (violations.length > 0 || !input.priceMatrixVerified) {
    return {
      ticker: input.ticker,
      economicProofScore: 0,
      economicProofState: 'UNVERIFIED',
      equityMonetizationScore: 0,
      equityMonetizationState: 'UNVERIFIED',
      divergence: 'UNVERIFIED',
      cleanWinner: false,
      finalOpportunityScore: 0,
      decision: 'REJECT',
      reasons: [...violations, ...(!input.priceMatrixVerified ? ['price_matrix_not_verified'] : [])],
      guardrails: ['No final classification is allowed until evidence and Price Matrix verification pass.'],
    };
  }

  const economicProofScore = scoreAiEconomicProof(input);
  const economicProofState = classifyAiEconomicProof(input);
  const equityMonetizationScore = scoreAiEquityMonetization(input);
  const equityMonetizationState = classifyAiEquityMonetization(input);
  const divergence = classifyAiProofMonetizationDivergence(input);
  const cleanWinner = isAiCleanWinner(input);

  // Orthogonal composition. Weak Equity Monetization lowers present opportunity;
  // it does not erase Economic Proof and cannot be relabelled as a fundamental failure.
  const finalOpportunityScore = round(
    clamp(
      economicProofScore * 0.34 +
        input.capitalEfficiency * 0.20 +
        input.expectedReturn * 0.22 +
        equityMonetizationScore * 0.14 -
        input.riskFragility * 0.10,
    ),
  );

  const reasons: string[] = [];
  if (economicProofState === 'PROVEN_STRONG') reasons.push('economic_proof_strong');
  if (input.economicProofTrend === 'UP') reasons.push('economic_proof_trend_up');
  if (!cleanWinner) reasons.push('not_a_clean_bursatile_winner');
  if (divergence === 'PROOF_UP_MONETIZATION_DOWN') reasons.push('economic_proof_up_equity_monetization_down');
  if (equityMonetizationState === 'CONFIRMED_RECEIVER') reasons.push('confirmed_receiver');
  if (input.drawdownFromTmaxPct <= -20) reasons.push('drawdown_from_tmax_exceeds_20pct');

  let decision: AiProofMonetizationDecision = 'MONITOR';
  if (divergence === 'PROOF_UP_MONETIZATION_DOWN' && finalOpportunityScore >= 60) decision = 'WATCH_FOR_REMONETIZATION';
  else if (cleanWinner && economicProofScore >= 72 && finalOpportunityScore >= 68) decision = 'BUY_REVIEW';
  else if (equityMonetizationState === 'CONFIRMED_RECEIVER' && economicProofScore < 55) decision = 'AVOID_CHASING';

  return {
    ticker: input.ticker,
    economicProofScore,
    economicProofState,
    equityMonetizationScore,
    equityMonetizationState,
    divergence,
    cleanWinner,
    finalOpportunityScore,
    decision,
    reasons,
    guardrails: [
      'Economic Proof and Equity Monetization are orthogonal axes.',
      'Price weakness is not a fundamental falsifier by itself.',
      'Relative strength or smaller drawdown does not equal CONFIRMED_RECEIVER.',
      'A clean winner requires verified price continuity, strong RS and proximity to Tmax.',
      'PROOF_UP_MONETIZATION_DOWN is a watch-for-remonetization state, not an automatic BUY.',
    ],
  };
}

export function summarizeAiEquityCohort(
  inputs: readonly AiEconomicProofEquityInput[],
): AiEquityCohortSummary {
  const verified = inputs.filter((input) => validateAiEconomicProofEquityInput(input).length === 0 && input.priceMatrixVerified);
  const rankedByDamage = [...verified].sort((a, b) => b.drawdownFromTmaxPct - a.drawdownFromTmaxPct);
  const assessed = verified.map(assessAiEconomicProofEquity);

  return {
    count: verified.length,
    cleanWinners: assessed.filter((result) => result.cleanWinner).length,
    confirmedReceivers: assessed.filter((result) => result.equityMonetizationState === 'CONFIRMED_RECEIVER').length,
    medianDrawdownFromTmaxPct: median(verified.map((input) => input.drawdownFromTmaxPct)),
    leastDamaged: rankedByDamage.slice(0, Math.min(4, rankedByDamage.length)).map((input) => input.ticker),
    mostDamaged: rankedByDamage.slice(Math.max(0, rankedByDamage.length - 4)).reverse().map((input) => input.ticker),
  };
}

export const AI_ECONOMIC_PROOF_EQUITY_MONETIZATION_OMEGA_V1 = {
  id: 'AI_ECONOMIC_PROOF_EQUITY_MONETIZATION_OMEGA_V1',
  status: 'canonical',
  mission:
    'Separate verified AI Economic Proof from AI Equity Monetization, detect Economic Proof up while Equity Monetization is down, and forbid relative outperformance from being mislabeled as a clean winner.',
  economicProofQuestion: 'Does the business capture AI value?',
  equityMonetizationQuestion: 'Is the stock market rewarding that value?',
  cleanWinnerRule: 'Verified Price Matrix + drawdown from Tmax >= -5% + Green Continuity >= 4/5 + RS >= 70 + flow >= 65 + price response >= 65.',
  antiConfusionRules: [
    'Economic Proof up does not imply Equity Monetization up.',
    'Equity Monetization down does not imply Economic Proof down.',
    'Less damaged is not the same as winner.',
    'No UNVERIFIED row may enter the final verified matrix.',
  ],
  assess: assessAiEconomicProofEquity,
  summarizeCohort: summarizeAiEquityCohort,
} as const;
