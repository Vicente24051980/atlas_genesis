export type AiInfrastructureRotationPhase =
  | 'R3_CANDIDATE_MONITOR'
  | 'R4_EARLY_ACCUMULATION'
  | 'R4_TO_R5_RELATIVE_OPPORTUNITY'
  | 'R5_DISCOVERED_BY_ATLAS_MAIN'
  | 'R6_CONSENSUS_CROWDING'
  | 'REJECT_INSUFFICIENT_EVIDENCE';

export type AiInfrastructureDecision =
  | 'BUY_REVIEW'
  | 'WATCHLIST_PRIORITY'
  | 'MONITOR_ONLY'
  | 'AVOID_CHASING'
  | 'REJECT';

export type AiInfrastructureCompanyInput = {
  id: string;
  company: string;
  thesis: 'AI_DATA_CENTER_OPTICS' | 'AI_POWER_GRID' | 'INDUSTRIAL_NETWORKING' | 'DEFENSE_CONNECTIVITY';
  asOf: string;
  evidenceIds: readonly string[];
  businessQuality: number;
  normalizedGrowth: number;
  capexProductivity: number;
  valuationMarginOfSafety: number;
  financialInflection: number;
  aiInfrastructurePurity: number;
  cashGeneration: number;
  balanceSheetStrength: number;
  narrativeCrowding: number;
  priceDiscovery: number;
  structuralIntegrity: boolean;
  notes?: readonly string[];
};

export type AiInfrastructureRotationResult = {
  id: string;
  company: string;
  thesis: AiInfrastructureCompanyInput['thesis'];
  phase: AiInfrastructureRotationPhase;
  decision: AiInfrastructureDecision;
  qualityComposite: number;
  opportunityScore: number;
  crowdingPenalty: number;
  reasons: readonly string[];
  guardrails: readonly string[];
};

const SCORE_FIELDS = [
  'businessQuality',
  'normalizedGrowth',
  'capexProductivity',
  'valuationMarginOfSafety',
  'financialInflection',
  'aiInfrastructurePurity',
  'cashGeneration',
  'balanceSheetStrength',
  'narrativeCrowding',
  'priceDiscovery',
] as const;

function assertScore(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`ai_infra_rotation_score_out_of_range:${name}`);
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function validateAiInfrastructureInput(input: AiInfrastructureCompanyInput): readonly string[] {
  const violations: string[] = [];
  if (!input.id.trim()) violations.push('missing_id');
  if (!input.company.trim()) violations.push('missing_company');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.asOf)) violations.push('invalid_as_of');
  if (input.evidenceIds.length < 2) violations.push('requires_at_least_two_traceable_evidence_ids');
  for (const field of SCORE_FIELDS) {
    try {
      assertScore(field, input[field]);
    } catch (error) {
      violations.push((error as Error).message);
    }
  }
  if (!input.structuralIntegrity) violations.push('structural_integrity_not_confirmed');
  return violations;
}

export function classifyAiInfrastructurePhase(input: AiInfrastructureCompanyInput): AiInfrastructureRotationPhase {
  if (validateAiInfrastructureInput(input).length > 0) return 'REJECT_INSUFFICIENT_EVIDENCE';

  if (input.narrativeCrowding >= 88 || input.priceDiscovery >= 90) return 'R6_CONSENSUS_CROWDING';
  if (input.narrativeCrowding >= 72 || input.priceDiscovery >= 75) return 'R5_DISCOVERED_BY_ATLAS_MAIN';

  const hasVisibleFinancialTurn = input.financialInflection >= 72 && input.normalizedGrowth >= 70;
  const hasRotationAsymmetry = input.valuationMarginOfSafety >= 72 && input.narrativeCrowding <= 65;
  if (hasVisibleFinancialTurn && hasRotationAsymmetry) return 'R4_TO_R5_RELATIVE_OPPORTUNITY';

  if (input.financialInflection >= 62 && input.capexProductivity >= 70) return 'R4_EARLY_ACCUMULATION';
  return 'R3_CANDIDATE_MONITOR';
}

export function scoreAiInfrastructureOpportunity(input: AiInfrastructureCompanyInput): number {
  const violations = validateAiInfrastructureInput(input);
  if (violations.length > 0) return 0;

  const gross =
    input.businessQuality * 0.14 +
    input.normalizedGrowth * 0.15 +
    input.capexProductivity * 0.15 +
    input.valuationMarginOfSafety * 0.20 +
    input.financialInflection * 0.18 +
    input.aiInfrastructurePurity * 0.10 +
    input.cashGeneration * 0.05 +
    input.balanceSheetStrength * 0.03;
  const crowdingPenalty = Math.max(0, input.narrativeCrowding - 65) * 0.35 + Math.max(0, input.priceDiscovery - 75) * 0.30;
  return round(Math.max(0, Math.min(100, gross - crowdingPenalty)));
}

export function assessAiInfrastructureRotation(input: AiInfrastructureCompanyInput): AiInfrastructureRotationResult {
  const violations = validateAiInfrastructureInput(input);
  const qualityComposite = round(
    input.businessQuality * 0.35 + input.normalizedGrowth * 0.25 + input.capexProductivity * 0.25 + input.cashGeneration * 0.15,
  );

  if (violations.length > 0) {
    return {
      id: input.id,
      company: input.company,
      thesis: input.thesis,
      phase: 'REJECT_INSUFFICIENT_EVIDENCE',
      decision: 'REJECT',
      qualityComposite,
      opportunityScore: 0,
      crowdingPenalty: 0,
      reasons: violations,
      guardrails: ['Do not rank or act until evidence and structural integrity requirements are met.'],
    };
  }

  const phase = classifyAiInfrastructurePhase(input);
  const opportunityScore = scoreAiInfrastructureOpportunity(input);
  const crowdingPenalty = round(Math.max(0, input.narrativeCrowding - 65) * 0.35 + Math.max(0, input.priceDiscovery - 75) * 0.30);
  const reasons: string[] = [];

  if (qualityComposite >= 88) reasons.push('elite_or_near_elite_business_quality');
  if (input.financialInflection >= 72) reasons.push('visible_financial_inflection');
  if (input.capexProductivity >= 88) reasons.push('capex_follows_demonstrated_demand');
  if (input.valuationMarginOfSafety >= 80) reasons.push('valuation_asymmetry_vs_quality');
  if (phase === 'R5_DISCOVERED_BY_ATLAS_MAIN') reasons.push('market_has_already_discovered_the_story');
  if (phase === 'R6_CONSENSUS_CROWDING') reasons.push('consensus_or_price_discovery_is_extreme');

  let decision: AiInfrastructureDecision = 'MONITOR_ONLY';
  if (phase === 'R6_CONSENSUS_CROWDING') decision = 'AVOID_CHASING';
  else if (phase === 'R5_DISCOVERED_BY_ATLAS_MAIN' && opportunityScore >= 70) decision = 'BUY_REVIEW';
  else if (phase === 'R4_TO_R5_RELATIVE_OPPORTUNITY' && opportunityScore >= 78) decision = 'BUY_REVIEW';
  else if (phase === 'R4_EARLY_ACCUMULATION' || phase === 'R4_TO_R5_RELATIVE_OPPORTUNITY') decision = 'WATCHLIST_PRIORITY';

  return {
    id: input.id,
    company: input.company,
    thesis: input.thesis,
    phase,
    decision,
    qualityComposite,
    opportunityScore,
    crowdingPenalty,
    reasons,
    guardrails: [
      'This engine ranks relative opportunity; it does not place orders.',
      'R5 quality can be investable but is not an early rotation entry.',
      'A lower-quality peer can rank higher when financial inflection and valuation asymmetry are stronger.',
      'Re-score after earnings, guidance, capex updates or material multiple expansion/compression.',
    ],
  };
}

export function rankAiInfrastructureRotation(inputs: readonly AiInfrastructureCompanyInput[]): readonly AiInfrastructureRotationResult[] {
  const thesisSet = new Set(inputs.map((input) => input.thesis));
  if (thesisSet.size !== 1) throw new Error('ai_infra_rotation_ranking_requires_single_thesis');
  return [...inputs]
    .map(assessAiInfrastructureRotation)
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.qualityComposite - a.qualityComposite || a.company.localeCompare(b.company));
}

export const AI_INFRASTRUCTURE_ROTATION_OMEGA_V1 = {
  id: 'AI_INFRASTRUCTURE_ROTATION_OMEGA_V1',
  status: 'canonical_candidate',
  mission:
    'Rank AI infrastructure beneficiaries by quality, financial inflection, capex productivity, valuation asymmetry and narrative crowding without confusing discovered winners with early rotation opportunities.',
  requiredEvidence: ['at_least_two_traceable_evidence_ids', 'structural_integrity_confirmed', 'same_thesis_for_relative_ranking'],
  scoringWeights: {
    businessQuality: 0.14,
    normalizedGrowth: 0.15,
    capexProductivity: 0.15,
    valuationMarginOfSafety: 0.20,
    financialInflection: 0.18,
    aiInfrastructurePurity: 0.10,
    cashGeneration: 0.05,
    balanceSheetStrength: 0.03,
  } as const,
  crowdingPenalty: 'Narrative crowding above 65 and price discovery above 75 reduce opportunity score.',
  classify: classifyAiInfrastructurePhase,
  assess: assessAiInfrastructureRotation,
  rank: rankAiInfrastructureRotation,
} as const;

export const FUJIKURA_FURUKAWA_AI_OPTICS_CASES: readonly AiInfrastructureCompanyInput[] = [
  {
    id: 'FUJIKURA_AI_OPTICS_2026_08_10',
    company: 'Fujikura',
    thesis: 'AI_DATA_CENTER_OPTICS',
    asOf: '2026-08-10',
    evidenceIds: ['reuters-ai-infra-winners-2025', 'marketwatch-ultra-high-density-share'],
    businessQuality: 91,
    normalizedGrowth: 95,
    capexProductivity: 94,
    valuationMarginOfSafety: 67,
    financialInflection: 86,
    aiInfrastructurePurity: 94,
    cashGeneration: 78,
    balanceSheetStrength: 78,
    narrativeCrowding: 78,
    priceDiscovery: 82,
    structuralIntegrity: true,
    notes: ['Best optical pure-play in the comparison, but already discovered by the market.'],
  },
  {
    id: 'FURUKAWA_AI_OPTICS_2026_08_10',
    company: 'Furukawa Electric',
    thesis: 'AI_DATA_CENTER_OPTICS',
    asOf: '2026-08-10',
    evidenceIds: ['furukawa-fy2025-communications-turnaround', 'furukawa-fy2026-guidance'],
    businessQuality: 84,
    normalizedGrowth: 90,
    capexProductivity: 89,
    valuationMarginOfSafety: 86,
    financialInflection: 92,
    aiInfrastructurePurity: 82,
    cashGeneration: 73,
    balanceSheetStrength: 76,
    narrativeCrowding: 58,
    priceDiscovery: 66,
    structuralIntegrity: true,
    notes: ['Same AI optics wave, stronger relative inflection and less mature consensus.'],
  },
] as const;
