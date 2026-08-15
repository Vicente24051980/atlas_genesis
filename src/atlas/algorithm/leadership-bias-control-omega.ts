export const LEADERSHIP_BIAS_CONTROL_OMEGA_V1 = {
  id: 'LEADERSHIP_BIAS_CONTROL_OMEGA_V1',
  status: 'canonical',
  mission:
    'Prevent ATLAS from repeatedly defaulting to incumbent mega-cap winners while preserving legitimate exposure to proven leaders and continuously surfacing consolidated emerging leaders with superior forward asymmetry.',
  principles: [
    'Mega-cap size is neither a quality bonus nor a disqualifier.',
    'Past index leadership cannot substitute for forward growth, incremental ROIC, valuation runway or current capital sponsorship.',
    'Do not remove a proven leader merely because it is large; require a challenger to beat it on forward expected return after risk.',
    'Do not keep a mature incumbent merely because it is familiar, liquid or historically successful.',
    'Portfolio construction should combine best incumbent leaders, best consolidated challengers and a bounded discovery sleeve.',
    'Price momentum alone cannot promote a challenger; business quality, earnings inflection and evidence quality remain mandatory.',
    'A company with exhausted runway may be demoted even if absolute business quality remains high.',
  ] as const,
  scoreWeights: {
    forwardGrowthRunway: 0.20,
    incrementalRoicAndFcf: 0.15,
    earningsRevisionTrend: 0.10,
    institutionalSponsorship: 0.10,
    valuationAsymmetry: 0.15,
    competitivePosition: 0.10,
    consolidationAndExecutionProof: 0.10,
    balanceSheetAndRisk: 0.10,
  } as const,
  incumbentPenaltyWeights: {
    sizeSaturation: 0.25,
    multipleCompressionRisk: 0.20,
    growthDeceleration: 0.25,
    capexPaybackRisk: 0.15,
    crowdingAndConsensus: 0.15,
  } as const,
  classifications: [
    'PROVEN_LEADER',
    'PROVEN_LEADER_MATURING',
    'CONSOLIDATED_CHALLENGER',
    'EMERGING_LEADER',
    'DISCOVERY_OPTION',
    'AVOID_CHASING',
    'INSUFFICIENT_EVIDENCE',
  ] as const,
  portfolioRules: {
    challengerCanReplaceIncumbentOnlyIf: [
      'forward_asymmetry_score_exceeds_incumbent_by_material_margin',
      'quality_and_balance_sheet_pass_minimum_gates',
      'growth_or_earnings_revision_trend_is_superior',
      'valuation_is_not_disqualifying_after_growth_normalization',
      'replacement_improves_or_preserves portfolio risk architecture',
    ],
    challengerStarterRule:
      'When uncertainty remains high but evidence is strong, prefer a smaller starter position over waiting for perfect certainty or replacing a proven leader at full size.',
    incumbentRetentionRule:
      'Retain mega-cap leaders when forward economics remain elite; no anti-megacap quota is permitted.',
    diversityRule:
      'Each review must explicitly compare incumbent leaders with consolidated challengers from the same economic function and with adjacent beneficiaries receiving capital.',
  },
  output: [
    'incumbent_score',
    'challenger_score',
    'forward_asymmetry_gap',
    'maturity_penalty',
    'evidence_confidence',
    'recommended_role',
    'replacement_candidate_if_any',
    'starter_size_preference_if_uncertain',
  ] as const,
} as const;

export type LeadershipBiasCandidateInput = {
  forwardGrowthRunway: number;
  incrementalRoicAndFcf: number;
  earningsRevisionTrend: number;
  institutionalSponsorship: number;
  valuationAsymmetry: number;
  competitivePosition: number;
  consolidationAndExecutionProof: number;
  balanceSheetAndRisk: number;
};

export type IncumbentMaturityInput = {
  sizeSaturation: number;
  multipleCompressionRisk: number;
  growthDeceleration: number;
  capexPaybackRisk: number;
  crowdingAndConsensus: number;
};

function validScore(value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error('leadership_bias_score_out_of_range');
  }
}

export function calculateForwardAsymmetryScore(input: LeadershipBiasCandidateInput): number {
  const w = LEADERSHIP_BIAS_CONTROL_OMEGA_V1.scoreWeights;
  let score = 0;
  for (const [key, weight] of Object.entries(w) as Array<[keyof LeadershipBiasCandidateInput, number]>) {
    validScore(input[key]);
    score += input[key] * weight;
  }
  return Math.round(score * 100) / 100;
}

export function calculateMaturityPenalty(input: IncumbentMaturityInput): number {
  const w = LEADERSHIP_BIAS_CONTROL_OMEGA_V1.incumbentPenaltyWeights;
  let penalty = 0;
  for (const [key, weight] of Object.entries(w) as Array<[keyof IncumbentMaturityInput, number]>) {
    validScore(input[key]);
    penalty += input[key] * weight;
  }
  return Math.round(penalty * 100) / 100;
}

export function compareLeaderVsChallenger(params: {
  incumbentForwardScore: number;
  incumbentMaturityPenalty: number;
  challengerForwardScore: number;
  challengerQualityPass: boolean;
  challengerRiskPass: boolean;
  minimumMaterialGap?: number;
}): {
  incumbentAdjustedScore: number;
  challengerScore: number;
  forwardAsymmetryGap: number;
  decision: 'KEEP_INCUMBENT' | 'STARTER_CHALLENGER' | 'CHALLENGER_CAN_COMPETE_FOR_REPLACEMENT';
} {
  const minimumGap = params.minimumMaterialGap ?? 8;
  [params.incumbentForwardScore, params.incumbentMaturityPenalty, params.challengerForwardScore].forEach(validScore);
  const incumbentAdjustedScore = Math.max(0, params.incumbentForwardScore - params.incumbentMaturityPenalty);
  const gap = Math.round((params.challengerForwardScore - incumbentAdjustedScore) * 100) / 100;

  if (!params.challengerQualityPass || !params.challengerRiskPass) {
    return { incumbentAdjustedScore, challengerScore: params.challengerForwardScore, forwardAsymmetryGap: gap, decision: 'KEEP_INCUMBENT' };
  }
  if (gap >= minimumGap) {
    return { incumbentAdjustedScore, challengerScore: params.challengerForwardScore, forwardAsymmetryGap: gap, decision: 'CHALLENGER_CAN_COMPETE_FOR_REPLACEMENT' };
  }
  if (gap > 0) {
    return { incumbentAdjustedScore, challengerScore: params.challengerForwardScore, forwardAsymmetryGap: gap, decision: 'STARTER_CHALLENGER' };
  }
  return { incumbentAdjustedScore, challengerScore: params.challengerForwardScore, forwardAsymmetryGap: gap, decision: 'KEEP_INCUMBENT' };
}
