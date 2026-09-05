export const DURABLE_REVISION_GAP_OMEGA_VERSION = '2026-09-06-v1.0.0' as const;

export type RevisionOpportunityFamily =
  | 'COMPOUNDER_ACCELERATION'
  | 'NORMALIZATION'
  | 'SCARCITY_PHYSICAL'
  | 'TURNAROUND'
  | 'SPECIAL_SITUATION';

export type DurableRevisionGapInput = {
  ticker: string;
  family: RevisionOpportunityFamily;
  evidenceTraceable: boolean;
  evidenceIds: readonly string[];

  // 0-100 evidence-normalized company economics.
  survivabilityScore: number;
  structuralRepeatabilityScore: number;
  forwardFundamentalInflectionScore: number;
  expectationGapScore: number;
  inflectionDurabilityScore: number;
  cashConversionScore: number;
  revisionTorqueScore: number;
  incrementalCapitalEfficiencyScore: number;

  // 0-100 risk/saturation scores. Higher is worse.
  valuationSaturationScore: number;
  balanceFragilityScore: number;
  integrationDistanceScore: number;
  driverConcentrationScore: number;

  // Optional external revealed-capital evidence. It never creates score points.
  eliteCapitalEvidence?: {
    source: string;
    signalDateIso: string;
    concentrationScore: number;
    persistenceScore: number;
    marginalDirection: 'NEW' | 'ACCELERATING' | 'ADDING' | 'HOLDING' | 'HARVESTING' | 'EXITING';
    informationProximity: 'P0_PUBLIC_ONLY' | 'P1_CONCENTRATED_OWNER' | 'P2_NEGOTIATED_CAPITAL' | 'P3_GOVERNANCE' | 'P4_CONTROL_OR_OPERATING';
    copyabilityScore: number;
  };
};

export type DurableRevisionGapState =
  | 'CORE_REVISION_OPPORTUNITY'
  | 'POSITIVE_REVISION_GAP'
  | 'WATCH'
  | 'SATURATED'
  | 'FAIL_SURVIVABILITY'
  | 'EVIDENCE_PENDING';

export type DurableRevisionGapResult = {
  ticker: string;
  family: RevisionOpportunityFamily;
  evidenceGate: 'CONFIRMED' | 'PROVISIONAL' | 'BLOCKED';
  eligible: boolean;
  revisionCoreScore: number;
  penaltyScore: number;
  durableRevisionGapScore: number;
  eliteCapitalDirectScoreContribution: 0;
  revealedCapitalConfidence: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  state: DurableRevisionGapState;
  reasons: string[];
  falsifiers: string[];
};

const clamp = (x: number): number => Math.max(0, Math.min(100, x));
const round1 = (x: number): number => Math.round(x * 10) / 10;

function requireScore(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${name}_must_be_between_0_and_100`);
  }
}

function validate(input: DurableRevisionGapInput): void {
  const fields: Array<[string, number]> = [
    ['survivability_score', input.survivabilityScore],
    ['structural_repeatability_score', input.structuralRepeatabilityScore],
    ['forward_fundamental_inflection_score', input.forwardFundamentalInflectionScore],
    ['expectation_gap_score', input.expectationGapScore],
    ['inflection_durability_score', input.inflectionDurabilityScore],
    ['cash_conversion_score', input.cashConversionScore],
    ['revision_torque_score', input.revisionTorqueScore],
    ['incremental_capital_efficiency_score', input.incrementalCapitalEfficiencyScore],
    ['valuation_saturation_score', input.valuationSaturationScore],
    ['balance_fragility_score', input.balanceFragilityScore],
    ['integration_distance_score', input.integrationDistanceScore],
    ['driver_concentration_score', input.driverConcentrationScore],
  ];
  fields.forEach(([name, value]) => requireScore(name, value));

  if (input.eliteCapitalEvidence) {
    requireScore('elite_concentration_score', input.eliteCapitalEvidence.concentrationScore);
    requireScore('elite_persistence_score', input.eliteCapitalEvidence.persistenceScore);
    requireScore('elite_copyability_score', input.eliteCapitalEvidence.copyabilityScore);
  }
}

function revealedCapitalConfidence(input: DurableRevisionGapInput): DurableRevisionGapResult['revealedCapitalConfidence'] {
  const e = input.eliteCapitalEvidence;
  if (!e) return 'NONE';
  const base = (e.concentrationScore + e.persistenceScore + e.copyabilityScore) / 3;
  const proximityBoost = e.informationProximity === 'P3_GOVERNANCE' || e.informationProximity === 'P4_CONTROL_OR_OPERATING' ? 10 : 0;
  const directionBoost = e.marginalDirection === 'NEW' || e.marginalDirection === 'ACCELERATING' || e.marginalDirection === 'ADDING' ? 5 : 0;
  const confidence = clamp(base + proximityBoost + directionBoost);
  if (confidence >= 80) return 'HIGH';
  if (confidence >= 55) return 'MEDIUM';
  return 'LOW';
}

export function evaluateDurableRevisionGapOmega(input: DurableRevisionGapInput): DurableRevisionGapResult {
  validate(input);

  const evidenceGate: DurableRevisionGapResult['evidenceGate'] =
    input.evidenceTraceable && input.evidenceIds.length >= 6
      ? 'CONFIRMED'
      : input.evidenceTraceable && input.evidenceIds.length > 0
        ? 'PROVISIONAL'
        : 'BLOCKED';

  // Main-engine economics. No allocator/family-office variable appears here.
  // Expectation gap + forward inflection lead; durability and cash conversion
  // prevent transient growth or narrative-only acceleration from dominating.
  const revisionCoreScore = round1(
    input.forwardFundamentalInflectionScore * 0.24 +
      input.expectationGapScore * 0.24 +
      input.inflectionDurabilityScore * 0.16 +
      input.cashConversionScore * 0.14 +
      input.revisionTorqueScore * 0.10 +
      input.structuralRepeatabilityScore * 0.06 +
      input.incrementalCapitalEfficiencyScore * 0.06,
  );

  const penaltyScore = round1(
    input.valuationSaturationScore * 0.12 +
      input.balanceFragilityScore * 0.12 +
      input.integrationDistanceScore * 0.08 +
      input.driverConcentrationScore * 0.08,
  );

  let durableRevisionGapScore = round1(clamp(revisionCoreScore - penaltyScore));

  // Survivability is a hard gate, not an averageable variable.
  if (input.survivabilityScore < 40) durableRevisionGapScore = Math.min(durableRevisionGapScore, 39.9);
  // Structural repeatability can be weaker for special situations, but a fully
  // non-repeatable thesis cannot be promoted as a core revision opportunity.
  if (input.structuralRepeatabilityScore < 35 && input.family !== 'SPECIAL_SITUATION') {
    durableRevisionGapScore = Math.min(durableRevisionGapScore, 54.9);
  }
  if (input.valuationSaturationScore >= 85) durableRevisionGapScore = Math.min(durableRevisionGapScore, 59.9);
  durableRevisionGapScore = round1(durableRevisionGapScore);

  const eligible =
    evidenceGate === 'CONFIRMED' &&
    input.survivabilityScore >= 40 &&
    (input.structuralRepeatabilityScore >= 35 || input.family === 'SPECIAL_SITUATION');

  let state: DurableRevisionGapState;
  const reasons: string[] = [];

  if (evidenceGate !== 'CONFIRMED') {
    state = 'EVIDENCE_PENDING';
    reasons.push('Durable Revision Gap requires at least six traceable evidence records.');
  } else if (input.survivabilityScore < 40) {
    state = 'FAIL_SURVIVABILITY';
    reasons.push('Survivability is a hard gate and cannot be rescued by revision upside.');
  } else if (input.valuationSaturationScore >= 85) {
    state = 'SATURATED';
    reasons.push('Fundamental improvement may be real, but expectations/valuation already imply excessive success.');
  } else if (durableRevisionGapScore >= 78) {
    state = 'CORE_REVISION_OPPORTUNITY';
    reasons.push('Durable forward economics are improving faster than implied expectations with cash-quality support.');
  } else if (durableRevisionGapScore >= 65) {
    state = 'POSITIVE_REVISION_GAP';
    reasons.push('A positive durable revision gap exists but does not clear the strongest core threshold.');
  } else {
    state = 'WATCH';
    reasons.push('Evidence is valid but the remaining revision gap is insufficient after saturation and risk penalties.');
  }

  if (input.eliteCapitalEvidence) {
    reasons.push('Revealed-capital evidence is corroborative only and contributes exactly zero direct score points.');
  }

  const falsifiers = [
    'forward_eps_or_fcf_trajectory_fails_to_outgrow_consensus_trajectory',
    'margin_or_cash_conversion_reverses_before_the_revision_gap_closes',
    'inflection_is_one_off_project_or_peak_cycle_instead_of_durable_economics',
    'valuation_reprices_faster_than_fundamental_revisions',
    'balance_sheet_or_refinancing_risk_breaks_survivability',
    'integration_distance_or_dilution_consumes_the_expected_owner_economics',
    'driver_concentration_turns_one_theme_into_portfolio_level_tail_risk',
    'revealed_capital_signal_is_stale_or_reversed_and_had_no_independent_fundamental_confirmation',
  ];

  return {
    ticker: input.ticker,
    family: input.family,
    evidenceGate,
    eligible,
    revisionCoreScore,
    penaltyScore,
    durableRevisionGapScore,
    eliteCapitalDirectScoreContribution: 0,
    revealedCapitalConfidence: revealedCapitalConfidence(input),
    state,
    reasons,
    falsifiers,
  };
}
