export const STRUCTURAL_TIER_PRIORITY_OMEGA_VERSION = '2026-08-24-v1.0.0' as const;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function evidencePasses(traceable: boolean, ids: string[], minimum = 3): boolean {
  return traceable && ids.filter((id) => id.trim().length > 0).length >= minimum;
}

export type StructuralTier = 'S' | 'A+' | 'A' | 'B+' | 'BELOW_B_PLUS' | 'EVIDENCE_PENDING';
export type EconomicProofLevel = 0 | 1 | 2 | 3 | 4;

export interface StructuralTierPriorityInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  businessQualityScore: number;
  economicProofLevel: EconomicProofLevel;
  forwardMoatScore: number;
  reinvestmentRunwayScore: number;
  perShareEconomicsScore: number;
  fundingRobustnessScore: number;
  structuralFragilityScore: number;
  confirmedStructuralFalsifier?: boolean;
  eventGateOpen?: boolean;
}

export interface StructuralTierPriorityResult {
  tier: StructuralTier;
  structuralScore: number | null;
  preFragilityScore: number | null;
  fragilityPenalty: number | null;
  capitalDecisionAuthority: 'NONE';
  portfolioAction: 'NOT_AUTHORIZED_BY_STRUCTURAL_TIER';
  eventGateOpen: boolean;
  reasons: string[];
}

/**
 * STRUCTURAL TIER PRIORITY Ω
 *
 * S/A+/A/B+ is a research and structural-quality classification only.
 * It deliberately excludes price, current valuation, analyst targets, market cap,
 * recent stock performance and portfolio weights. Those belong downstream in
 * Valuation Ω, Expected Return Ω and Competition for Capital Ω.
 */
export function evaluateStructuralTierPriority(input: StructuralTierPriorityInput): StructuralTierPriorityResult {
  const raw = [
    input.businessQualityScore,
    input.forwardMoatScore,
    input.reinvestmentRunwayScore,
    input.perShareEconomicsScore,
    input.fundingRobustnessScore,
    input.structuralFragilityScore,
  ];

  if (!evidencePasses(input.evidenceTraceable, input.evidenceIds) || !raw.every(Number.isFinite)) {
    return {
      tier: 'EVIDENCE_PENDING', structuralScore: null, preFragilityScore: null, fragilityPenalty: null,
      capitalDecisionAuthority: 'NONE', portfolioAction: 'NOT_AUTHORIZED_BY_STRUCTURAL_TIER',
      eventGateOpen: input.eventGateOpen ?? false,
      reasons: ['Structural tier requires traceable multi-source evidence and finite structural inputs.'],
    };
  }

  const quality = clamp(input.businessQualityScore);
  const proof = clamp(input.economicProofLevel * 25);
  const moat = clamp(input.forwardMoatScore);
  const runway = clamp(input.reinvestmentRunwayScore);
  const perShare = clamp(input.perShareEconomicsScore);
  const funding = clamp(input.fundingRobustnessScore);
  const fragility = clamp(input.structuralFragilityScore);

  const preFragilityScore =
    quality * 0.25 +
    proof * 0.20 +
    moat * 0.20 +
    runway * 0.15 +
    perShare * 0.10 +
    funding * 0.10;

  // Up to 10 points of structural penalty. The fragility vector stays visible
  // and is not allowed to masquerade as a valuation discount.
  const fragilityPenalty = Math.max(0, (fragility - 30) / 7);
  const structuralScore = clamp(preFragilityScore - fragilityPenalty);
  const reasons: string[] = [];

  if (input.confirmedStructuralFalsifier === true) {
    return {
      tier: 'BELOW_B_PLUS', structuralScore, preFragilityScore, fragilityPenalty,
      capitalDecisionAuthority: 'NONE', portfolioAction: 'NOT_AUTHORIZED_BY_STRUCTURAL_TIER',
      eventGateOpen: input.eventGateOpen ?? false,
      reasons: ['Confirmed structural falsifier vetoes S/A+/A/B+ promotion regardless of score.'],
    };
  }

  let tier: StructuralTier = 'BELOW_B_PLUS';
  if (
    structuralScore >= 88 &&
    quality >= 90 &&
    input.economicProofLevel >= 3 &&
    moat >= 80 &&
    funding >= 70 &&
    fragility <= 50
  ) {
    tier = 'S';
  } else if (structuralScore >= 80 && quality >= 80 && input.economicProofLevel >= 3) {
    tier = 'A+';
  } else if (structuralScore >= 70 && input.economicProofLevel >= 2) {
    tier = 'A';
  } else if (structuralScore >= 60 && input.economicProofLevel >= 2) {
    tier = 'B+';
  }

  if (input.economicProofLevel < 2) reasons.push('Economic Proof below E2 prevents B+ or higher regardless of narrative quality.');
  if (fragility > 60) reasons.push('Structural fragility is material and reduces the tier score; financing/risk engines remain independently authoritative.');
  if (input.eventGateOpen === true) reasons.push('Open event gate blocks fresh capital conclusions but does not erase structural business quality.');
  reasons.push('Structural tier is not an Expected Return ranking and has no BUY/SELL/portfolio authority.');

  return {
    tier,
    structuralScore,
    preFragilityScore,
    fragilityPenalty,
    capitalDecisionAuthority: 'NONE',
    portfolioAction: 'NOT_AUTHORIZED_BY_STRUCTURAL_TIER',
    eventGateOpen: input.eventGateOpen ?? false,
    reasons,
  };
}

export const STRUCTURAL_TIER_PRIORITY_LAWS = [
  'STRUCTURAL_TIER != EXPECTED_RETURN',
  'STRUCTURAL_TIER != PORTFOLIO_WEIGHT',
  'BUSINESS_QUALITY != GOOD_STOCK_AT_ANY_PRICE',
  'ANALYST_TARGET != STRUCTURAL_EVIDENCE',
  'MARKET_CAP != STRUCTURAL_SCORE',
  'RECENT_PRICE_RETURN != BUSINESS_QUALITY',
  'CONFIRMED_STRUCTURAL_FALSIFIER > STRUCTURAL_SCORE',
] as const;
