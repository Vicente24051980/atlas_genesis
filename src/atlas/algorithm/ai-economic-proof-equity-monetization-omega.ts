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

  // AI Economic Proof Ω: business evidence only.
  t2RevenueCapture: number;
  t3FreeCashFlow: number;
  t5AiRoic: number;
  t6MoatPersistence: number;
  economicProofTrend: 'UP' | 'FLAT' | 'DOWN';

  // Orthogonal valuation / risk inputs used only after proof is assessed.
  capitalEfficiency: number;
  expectedReturn: number;
  riskFragility: number;

  // AI Equity Monetization Ω: market evidence only.
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
  finalOpportunityVerified: boolean;
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

const ECONOMIC_SCORE_FIELDS = ['t2RevenueCapture', 't3FreeCashFlow', 't5AiRoic', 't6MoatPersistence'] as const;
const OPPORTUNITY_SCORE_FIELDS = ['capitalEfficiency', 'expectedReturn', 'riskFragility'] as const;
const EQUITY_SCORE_FIELDS = ['relativeStrength', 'breadthSupport', 'flowPositioning', 'priceResponse'] as const;

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

function validateIdentity(input: AiEconomicProofEquityInput): string[] {
  const violations: string[] = [];
  if (!input.ticker.trim()) violations.push('missing_ticker');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.asOf)) violations.push('invalid_as_of');
  if (input.evidenceIds.length < 2) violations.push('requires_at_least_two_traceable_evidence_ids');
  return violations;
}

function validateScoreRange(input: AiEconomicProofEquityInput, fields: readonly (keyof AiEconomicProofEquityInput)[]): string[] {
  const violations: string[] = [];
  for (const field of fields) {
    const value = input[field];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
      violations.push(`score_out_of_range:${String(field)}`);
    }
  }
  return violations;
}

export function validateAiEconomicProofInput(input: AiEconomicProofEquityInput): readonly string[] {
  return [
    ...validateIdentity(input),
    ...validateScoreRange(input, ECONOMIC_SCORE_FIELDS),
  ];
}

export function validateAiEquityMonetizationInput(input: AiEconomicProofEquityInput): readonly string[] {
  const violations = [
    ...validateIdentity(input),
    ...validateScoreRange(input, EQUITY_SCORE_FIELDS),
  ];

  if (!input.priceMatrixVerified) violations.push('price_matrix_not_verified');
  if (!Number.isFinite(input.drawdownFromTmaxPct) || input.drawdownFromTmaxPct > 0 || input.drawdownFromTmaxPct < -100) {
    violations.push('invalid_drawdown_from_tmax_pct');
  }
  if (!Number.isInteger(input.greenContinuity) || input.greenContinuity < 0 || input.greenContinuity > 5) {
    violations.push('invalid_green_continuity');
  }
  return violations;
}

export function validateAiOpportunityInputs(input: AiEconomicProofEquityInput): readonly string[] {
  return validateScoreRange(input, OPPORTUNITY_SCORE_FIELDS);
}

/** Backward-compatible aggregate validation. Never use this to score Economic Proof. */
export function validateAiEconomicProofEquityInput(input: AiEconomicProofEquityInput): readonly string[] {
  return [
    ...validateAiEconomicProofInput(input),
    ...validateAiEquityMonetizationInput(input),
    ...validateAiOpportunityInputs(input),
  ];
}

export function scoreAiEconomicProof(input: AiEconomicProofEquityInput): number {
  if (validateAiEconomicProofInput(input).length > 0) return 0;
  return round(
    input.t2RevenueCapture * 0.32 +
      input.t3FreeCashFlow * 0.28 +
      input.t5AiRoic * 0.24 +
      input.t6MoatPersistence * 0.16,
  );
}

export function classifyAiEconomicProof(input: AiEconomicProofEquityInput): AiEconomicProofState {
  if (validateAiEconomicProofInput(input).length > 0) return 'UNVERIFIED';
  const score = scoreAiEconomicProof(input);
  if (score >= 82 && input.economicProofTrend !== 'DOWN') return 'PROVEN_STRONG';
  if (score >= 70 && input.economicProofTrend === 'UP') return 'IMPROVING';
  if (score >= 55) return 'MIXED';
  return 'WEAKENING';
}

export function scoreAiEquityMonetization(input: AiEconomicProofEquityInput): number {
  if (validateAiEquityMonetizationInput(input).length > 0) return 0;
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
  if (validateAiEquityMonetizationInput(input).length > 0) return false;
  return (
    input.drawdownFromTmaxPct >= -5 &&
    input.greenContinuity >= 4 &&
    input.relativeStrength >= 70 &&
    input.flowPositioning >= 65 &&
    input.priceResponse >= 65
  );
}

export function classifyAiEquityMonetization(input: AiEconomicProofEquityInput): AiEquityMonetizationState {
  if (validateAiEquityMonetizationInput(input).length > 0) return 'UNVERIFIED';
  const score = scoreAiEquityMonetization(input);
  if (isAiCleanWinner(input) && score >= 72) return 'CONFIRMED_RECEIVER';
  if (input.drawdownFromTmaxPct >= -10 && input.relativeStrength >= 65 && input.priceResponse >= 55) return 'EARLY_RECEIVER';
  if (score >= 50) return 'NEUTRAL';
  if (input.drawdownFromTmaxPct <= -30 || (input.priceResponse <= 35 && input.flowPositioning <= 40)) return 'DISTRIBUTION';
  return 'REPRICING';
}

export function classifyAiProofMonetizationDivergence(input: AiEconomicProofEquityInput): AiProofMonetizationDivergence {
  const proofViolations = validateAiEconomicProofInput(input);
  const equityViolations = validateAiEquityMonetizationInput(input);
  if (proofViolations.length > 0 || equityViolations.length > 0) return 'UNVERIFIED';

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
  const proofViolations = validateAiEconomicProofInput(input);
  const equityViolations = validateAiEquityMonetizationInput(input);
  const opportunityViolations = validateAiOpportunityInputs(input);

  const economicProofScore = proofViolations.length === 0 ? scoreAiEconomicProof(input) : 0;
  const economicProofState = proofViolations.length === 0 ? classifyAiEconomicProof(input) : 'UNVERIFIED';
  const equityMonetizationScore = equityViolations.length === 0 ? scoreAiEquityMonetization(input) : 0;
  const equityMonetizationState = equityViolations.length === 0 ? classifyAiEquityMonetization(input) : 'UNVERIFIED';
  const cleanWinner = equityViolations.length === 0 && isAiCleanWinner(input);
  const divergence = proofViolations.length === 0 && equityViolations.length === 0
    ? classifyAiProofMonetizationDivergence(input)
    : 'UNVERIFIED';

  const finalOpportunityVerified = proofViolations.length === 0 && equityViolations.length === 0 && opportunityViolations.length === 0;
  const finalOpportunityScore = finalOpportunityVerified
    ? round(
        clamp(
          economicProofScore * 0.34 +
            input.capitalEfficiency * 0.20 +
            input.expectedReturn * 0.22 +
            equityMonetizationScore * 0.14 -
            input.riskFragility * 0.10,
        ),
      )
    : 0;

  const reasons: string[] = [];
  reasons.push(...proofViolations.map((violation) => `economic:${violation}`));
  reasons.push(...equityViolations.map((violation) => `equity:${violation}`));
  reasons.push(...opportunityViolations.map((violation) => `opportunity:${violation}`));

  if (economicProofState === 'PROVEN_STRONG') reasons.push('economic_proof_strong');
  if (proofViolations.length === 0 && input.economicProofTrend === 'UP') reasons.push('economic_proof_trend_up');
  if (equityViolations.length === 0 && !cleanWinner) reasons.push('not_a_clean_bursatile_winner');
  if (divergence === 'PROOF_UP_MONETIZATION_DOWN') reasons.push('economic_proof_up_equity_monetization_down');
  if (equityMonetizationState === 'CONFIRMED_RECEIVER') reasons.push('confirmed_receiver');
  if (equityViolations.length === 0 && input.drawdownFromTmaxPct <= -20) reasons.push('drawdown_from_tmax_exceeds_20pct');
  if (proofViolations.length === 0 && equityViolations.length > 0) reasons.push('economic_proof_preserved_while_equity_unverified');

  let decision: AiProofMonetizationDecision = 'MONITOR';
  if (!finalOpportunityVerified) {
    decision = proofViolations.length > 0 ? 'REJECT' : 'MONITOR';
  } else if (divergence === 'PROOF_UP_MONETIZATION_DOWN' && finalOpportunityScore >= 60) {
    decision = 'WATCH_FOR_REMONETIZATION';
  } else if (cleanWinner && economicProofScore >= 72 && finalOpportunityScore >= 68) {
    decision = 'BUY_REVIEW';
  } else if (equityMonetizationState === 'CONFIRMED_RECEIVER' && economicProofScore < 55) {
    decision = 'AVOID_CHASING';
  }

  return {
    ticker: input.ticker,
    economicProofScore,
    economicProofState,
    equityMonetizationScore,
    equityMonetizationState,
    divergence,
    cleanWinner,
    finalOpportunityScore,
    finalOpportunityVerified,
    decision,
    reasons,
    guardrails: [
      'Economic Proof validation is independent from GREEN, Price Matrix, drawdown, relative strength, flow and price response.',
      'GREEN belongs only to Equity Monetization / market behavior and can never make valid Economic Proof UNVERIFIED.',
      'Economic Proof up does not imply Equity Monetization up.',
      'Equity Monetization down or unverified does not imply Economic Proof down or unverified.',
      'Price weakness is not a fundamental falsifier by itself.',
      'A clean winner requires verified price continuity, strong RS and proximity to Tmax.',
      'Final Opportunity is unverified until Economic Proof, Equity Monetization and opportunity inputs independently pass.',
    ],
  };
}

export function summarizeAiEquityCohort(inputs: readonly AiEconomicProofEquityInput[]): AiEquityCohortSummary {
  const verified = inputs.filter((input) => validateAiEquityMonetizationInput(input).length === 0);
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
  id: 'AI_ECONOMIC_PROOF_EQUITY_MONETIZATION_OMEGA_V1_1',
  status: 'canonical',
  mission:
    'Compose independently verified AI Economic Proof and AI Equity Monetization without allowing market-data failures to contaminate fundamental proof.',
  economicProofQuestion: 'Does the business capture AI value?',
  equityMonetizationQuestion: 'Is the stock market rewarding that value?',
  cleanWinnerRule: 'Verified Price Matrix + drawdown from Tmax >= -5% + Green Continuity >= 4/5 + RS >= 70 + flow >= 65 + price response >= 65.',
  antiConfusionRules: [
    'Economic Proof has its own validator and never depends on GREEN or Price Matrix.',
    'GREEN is market-behavior evidence only and is consumed only by Equity Monetization.',
    'Economic Proof up does not imply Equity Monetization up.',
    'Equity Monetization down does not imply Economic Proof down.',
    'No UNVERIFIED market axis may be silently promoted to a verified Final Opportunity score.',
  ],
  assess: assessAiEconomicProofEquity,
  summarizeCohort: summarizeAiEquityCohort,
} as const;
