export type CapitalMigrationState = 'STRONG_MIGRATION' | 'EARLY_MIGRATION' | 'NEUTRAL' | 'EXIT_SIGNAL' | 'EVIDENCE_PENDING';
export type FalseAiState = 'FALSE_DISRUPTION_CONFIRMED' | 'POSSIBLE_FALSE_DISRUPTION' | 'AI_RISK_REAL' | 'MIXED' | 'EVIDENCE_PENDING';

export type CapitalMigrationInput = {
  ticker: string;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  valuationGapScore: number;
  privateEquityStrategicActivityScore: number;
  fcfQualityScore: number;
  buybackNetShareReductionScore: number;
  insiderStrategicActivityScore: number;
  estimateRevisionScore: number;
  publicFlowConfirmationScore: number;
  structuralDisruptionRiskScore: number;
};

export type FalseAiDisruptionInput = {
  ticker: string;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];
  recurringRevenueQualityScore: number;
  switchingCostSystemOfRecordScore: number;
  fcfPerShareTrendScore: number;
  retentionScore: number;
  aiMonetizationScore: number;
  sbcShareCountDisciplineScore: number;
  grossMarginResilienceScore: number;
  valuationCompressionScore: number;
  organicGrowthResilienceScore: number;
  actualAiSubstitutionRiskScore: number;
};

const clamp = (x: number): number => Math.max(0, Math.min(100, x));
const round1 = (x: number): number => Math.round(x * 10) / 10;

const validate = (scores: readonly number[], error: string): void => {
  if (scores.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) throw new Error(error);
};

export function evaluateCapitalMigration(input: CapitalMigrationInput) {
  const scores = [input.valuationGapScore, input.privateEquityStrategicActivityScore, input.fcfQualityScore, input.buybackNetShareReductionScore, input.insiderStrategicActivityScore, input.estimateRevisionScore, input.publicFlowConfirmationScore, input.structuralDisruptionRiskScore];
  validate(scores, 'capital_migration_scores_must_be_between_0_and_100');

  const score = round1(
    clamp(input.valuationGapScore) * 0.20 +
      clamp(input.privateEquityStrategicActivityScore) * 0.18 +
      clamp(input.fcfQualityScore) * 0.18 +
      clamp(input.buybackNetShareReductionScore) * 0.12 +
      clamp(input.insiderStrategicActivityScore) * 0.08 +
      clamp(input.estimateRevisionScore) * 0.10 +
      clamp(input.publicFlowConfirmationScore) * 0.08 +
      (100 - clamp(input.structuralDisruptionRiskScore)) * 0.06,
  );

  const evidenceGate = input.evidenceTraceable && input.evidenceIds.length >= 3 ? 'CONFIRMED' : input.evidenceTraceable && input.evidenceIds.length ? 'PROVISIONAL' : 'BLOCKED';
  let state: CapitalMigrationState;
  if (evidenceGate === 'BLOCKED') state = 'EVIDENCE_PENDING';
  else if (score >= 78) state = 'STRONG_MIGRATION';
  else if (score >= 62) state = 'EARLY_MIGRATION';
  else if (score < 40 && input.publicFlowConfirmationScore < 35) state = 'EXIT_SIGNAL';
  else state = 'NEUTRAL';

  return {
    ticker: input.ticker,
    score,
    evidenceGate,
    state,
    action: state === 'STRONG_MIGRATION' ? 'ADVANCE_DEEP_RESEARCH' : state === 'EARLY_MIGRATION' ? 'WATCH' : state === 'EVIDENCE_PENDING' ? 'EVIDENCE_REQUIRED' : 'NO_ACTION',
    reasons: [
      ...(input.privateEquityStrategicActivityScore >= 70 ? ['Sophisticated private/strategic capital is showing interest before full public-flow confirmation.'] : []),
      ...(input.publicFlowConfirmationScore < 45 && input.privateEquityStrategicActivityScore >= 70 ? ['Private capital leads public capital; classify as early migration rather than confirmed market rotation.'] : []),
      ...(input.buybackNetShareReductionScore >= 70 ? ['Capital return is reducing share count rather than merely offsetting SBC.'] : []),
    ],
    falsifiers: ['pe_or_strategic_interest_disappears_without_transaction_or_replacement_bidder', 'fcf_quality_deteriorates', 'net_share_count_resumes_material_growth', 'valuation_gap_closes_without_earnings_revision_support', 'public_flows_and_revisions_confirm_structural_exit'],
  } as const;
}

export function evaluateFalseAiDisruption(input: FalseAiDisruptionInput) {
  const scores = [input.recurringRevenueQualityScore, input.switchingCostSystemOfRecordScore, input.fcfPerShareTrendScore, input.retentionScore, input.aiMonetizationScore, input.sbcShareCountDisciplineScore, input.grossMarginResilienceScore, input.valuationCompressionScore, input.organicGrowthResilienceScore, input.actualAiSubstitutionRiskScore];
  validate(scores, 'false_ai_disruption_scores_must_be_between_0_and_100');

  const resilienceScore = round1(
    clamp(input.recurringRevenueQualityScore) * 0.12 +
      clamp(input.switchingCostSystemOfRecordScore) * 0.14 +
      clamp(input.fcfPerShareTrendScore) * 0.15 +
      clamp(input.retentionScore) * 0.10 +
      clamp(input.aiMonetizationScore) * 0.10 +
      clamp(input.sbcShareCountDisciplineScore) * 0.10 +
      clamp(input.grossMarginResilienceScore) * 0.08 +
      clamp(input.valuationCompressionScore) * 0.08 +
      clamp(input.organicGrowthResilienceScore) * 0.08 +
      (100 - clamp(input.actualAiSubstitutionRiskScore)) * 0.05,
  );

  const evidenceGate = input.evidenceTraceable && input.evidenceIds.length >= 3 ? 'CONFIRMED' : input.evidenceTraceable && input.evidenceIds.length ? 'PROVISIONAL' : 'BLOCKED';
  let state: FalseAiState;
  if (evidenceGate === 'BLOCKED') state = 'EVIDENCE_PENDING';
  else if (resilienceScore >= 78 && input.actualAiSubstitutionRiskScore <= 45) state = 'FALSE_DISRUPTION_CONFIRMED';
  else if (resilienceScore >= 62 && input.actualAiSubstitutionRiskScore <= 60) state = 'POSSIBLE_FALSE_DISRUPTION';
  else if (input.actualAiSubstitutionRiskScore >= 70 && input.organicGrowthResilienceScore < 50) state = 'AI_RISK_REAL';
  else state = 'MIXED';

  return {
    ticker: input.ticker,
    resilienceScore,
    evidenceGate,
    state,
    action: state === 'FALSE_DISRUPTION_CONFIRMED' ? 'ADVANCE_GCC_AND_PRINCIPAL' : state === 'POSSIBLE_FALSE_DISRUPTION' ? 'WATCH' : state === 'EVIDENCE_PENDING' ? 'EVIDENCE_REQUIRED' : 'NO_AUTOMATIC_BUY',
    reasons: [
      ...(input.switchingCostSystemOfRecordScore >= 75 ? ['System-of-record/workflow switching costs can make AI a product layer rather than a replacement.'] : []),
      ...(input.fcfPerShareTrendScore >= 70 ? ['Per-share cash economics remain resilient despite AI disruption fears.'] : []),
      ...(input.sbcShareCountDisciplineScore < 50 ? ['SBC/share-count dilution weakens the per-share thesis even if reported FCF is strong.'] : []),
    ],
    falsifiers: ['net_retention_or_renewal_rates_break', 'organic_growth_and_pricing_deteriorate_together', 'ai_native_competitors_win_core_system_of_record_workflows', 'fcf_per_share_falls_despite_cost_cuts', 'sbc_and_dilution_absorb_buybacks', 'gross_margin_or_unit_economics_structurally_reset_lower'],
  } as const;
}

export function evaluateCapitalMigrationFalseAiConvergence(migration: ReturnType<typeof evaluateCapitalMigration>, falseAi: ReturnType<typeof evaluateFalseAiDisruption>) {
  const sameTicker = migration.ticker === falseAi.ticker;
  const confirmed = migration.evidenceGate === 'CONFIRMED' && falseAi.evidenceGate === 'CONFIRMED';
  const strong = ['STRONG_MIGRATION', 'EARLY_MIGRATION'].includes(migration.state) && ['FALSE_DISRUPTION_CONFIRMED', 'POSSIBLE_FALSE_DISRUPTION'].includes(falseAi.state);
  return {
    ticker: sameTicker ? migration.ticker : 'MISMATCH',
    convergence: sameTicker && confirmed && strong ? 'MULTI_MOTOR_CONVERGENCE' : sameTicker && strong ? 'PROVISIONAL_CONVERGENCE' : 'NO_CONVERGENCE',
    rule: 'CONVERGENCE_RAISES_RESEARCH_PRIORITY_BUT_NEVER_OVERWRITES_MOTOR_ORIGEN_OR_BUY_DECISION',
  } as const;
}

export const CAPITAL_MIGRATION_OMEGA = { id: 'CAPITAL_MIGRATION_OMEGA_V1', name: 'Capital Migration Ω v1.0' } as const;
export const FALSE_AI_DISRUPTION_OMEGA = { id: 'FALSE_AI_DISRUPTION_OMEGA_V1', name: 'False AI Disruption Ω v1.0' } as const;
