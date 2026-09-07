export const FACTOR_OWNERSHIP_LEDGER_OMEGA_VERSION = '2026-09-07-v1.0.0' as const;

export const ATLAS_FACTOR_KEYS = [
  'BUSINESS_QUALITY',
  'GROWTH',
  'EARNINGS_REVISIONS',
  'PER_SHARE_ECONOMICS',
  'VALUATION',
  'EXPECTED_RETURN_3_6Y',
  'FCF',
  'MARGINS',
  'ROIC',
  'BALANCE_SHEET',
  'MOAT_DURABILITY',
  'DISRUPTION_RISK',
  'CUSTOMER_CONCENTRATION',
  'BACKLOG',
  'CAPEX_BOTTLENECK',
  'MOMENTUM',
  'MACRO_RISK',
  'REGULATORY_RISK',
  'GEOPOLITICAL_RISK',
  'FINANCING_RISK',
  'CREDIT_RISK',
  'AI_VALUE_CAPTURE',
  'AI_CAPITAL_FORMATION_QUALITY',
] as const;

export type AtlasFactorKey = (typeof ATLAS_FACTOR_KEYS)[number];

export type FactorOwnershipRecord = Readonly<{
  scoringOwner: `E2_SLOT:${string}`;
  evidenceContributors: readonly string[];
  directScoreClaimsAllowed: 1;
  evidenceMayIncreaseConfidence: true;
  evidenceMayCreateAdditionalScore: false;
}>;

const factor = (
  key: string,
  evidenceContributors: readonly string[],
): FactorOwnershipRecord => ({
  scoringOwner: `E2_SLOT:${key}`,
  evidenceContributors,
  directScoreClaimsAllowed: 1,
  evidenceMayIncreaseConfidence: true,
  evidenceMayCreateAdditionalScore: false,
});

/**
 * E2 ASSESSMENT Ω factor ownership boundary.
 *
 * This is deliberately not a seventh engine. It prevents subordinate engines,
 * research families and specialized signals from turning corroborating evidence
 * into duplicate points for the same economic fact.
 *
 * Hard rule:
 *   MULTIPLE_EVIDENCE -> CONFIDENCE
 *   MULTIPLE_ENGINES  -/-> MULTIPLE_POINTS
 */
export const FACTOR_OWNERSHIP_LEDGER_OMEGA: Readonly<
  Record<AtlasFactorKey, FactorOwnershipRecord>
> = {
  BUSINESS_QUALITY: factor('BUSINESS_QUALITY', [
    'BUSINESS_QUALITY_OMEGA',
    'PRINCIPAL_OMEGA',
    'INVESTMENT_DISCIPLINE_COMPOUNDING_OMEGA_V1',
  ]),
  GROWTH: factor('GROWTH', [
    'GROWTH_AND_REVISIONS_OMEGA',
    'DURABLE_REVISION_GAP_OMEGA_V1',
  ]),
  EARNINGS_REVISIONS: factor('EARNINGS_REVISIONS', [
    'GROWTH_AND_REVISIONS_OMEGA',
    'DURABLE_REVISION_GAP_OMEGA_V1',
    'PRE_CONSENSUS_OMEGA_SHADOW',
  ]),
  PER_SHARE_ECONOMICS: factor('PER_SHARE_ECONOMICS', [
    'PER_SHARE_ECONOMICS_OMEGA_V1',
    'OWNER_ECONOMICS_NORMALIZATION_OMEGA_V1',
    'CAPITAL_ALLOCATION_QUALITY_OMEGA_V1',
  ]),
  VALUATION: factor('VALUATION', [
    'VALUATION_OMEGA',
    'VALUATION_METHOD_INTEGRITY_OMEGA_V1',
    'EXTERNAL_VALUATION_CROSS_CHECK_OMEGA_V1',
    'EXPECTATION_GAP_OMEGA',
  ]),
  EXPECTED_RETURN_3_6Y: factor('EXPECTED_RETURN_3_6Y', [
    'VALUATION_OMEGA',
    'EXPECTATION_GAP_OMEGA',
    'BULL_BASE_BEAR_SENSITIVITY',
  ]),
  FCF: factor('FCF', [
    'BUSINESS_QUALITY_OMEGA',
    'CAPEX_PRODUCTIVITY_OMEGA',
    'PER_SHARE_ECONOMICS_OMEGA_V1',
  ]),
  MARGINS: factor('MARGINS', [
    'BUSINESS_QUALITY_OMEGA',
    'CAPEX_PRODUCTIVITY_OMEGA',
  ]),
  ROIC: factor('ROIC', [
    'BUSINESS_QUALITY_OMEGA',
    'CAPEX_PRODUCTIVITY_OMEGA',
    'CAPITAL_ALLOCATION_QUALITY_OMEGA_V1',
  ]),
  BALANCE_SHEET: factor('BALANCE_SHEET', [
    'BUSINESS_QUALITY_OMEGA',
    'FINANCING_QUALITY_GATE_OMEGA_V1',
    'RISK_OMEGA',
  ]),
  MOAT_DURABILITY: factor('MOAT_DURABILITY', [
    'MOAT_MIGRATION_OMEGA_V1',
    'BUSINESS_QUALITY_OMEGA',
    'AI_VALUE_MIGRATION_OMEGA',
  ]),
  DISRUPTION_RISK: factor('DISRUPTION_RISK', [
    'MOAT_MIGRATION_OMEGA_V1',
    'RISK_OMEGA',
    'AI_VALUE_MIGRATION_OMEGA',
  ]),
  CUSTOMER_CONCENTRATION: factor('CUSTOMER_CONCENTRATION', [
    'RHO_COUNTERPARTY_EXPOSURE_OMEGA_V1',
    'BUSINESS_QUALITY_OMEGA',
    'AI_DEMAND_PROVENANCE_OMEGA',
  ]),
  BACKLOG: factor('BACKLOG', [
    'T4_QUALITY_ADJUSTED_BACKLOG_OMEGA_V1',
    'GLOBAL_CAPEX_CHAIN_OMEGA',
    'POWER_INFRASTRUCTURE_DUELS_OMEGA',
    'AI_DEMAND_PROVENANCE_OMEGA',
  ]),
  CAPEX_BOTTLENECK: factor('CAPEX_BOTTLENECK', [
    'CAPEX_PRODUCTIVITY_OMEGA',
    'GLOBAL_CAPEX_CHAIN_OMEGA',
    'AI_VALUE_MIGRATION_OMEGA',
    'POWER_INFRASTRUCTURE_DUELS_OMEGA',
  ]),
  MOMENTUM: factor('MOMENTUM', [
    'TAPE_RS_OMEGA',
    'MONEY_ROTATION_OMEGA',
    'INSTITUTIONAL_CAPITAL_ROTATION_OMEGA_V1',
  ]),
  MACRO_RISK: factor('MACRO_RISK', [
    'RISK_OMEGA',
    'MACRO_RISK_GATE_OMEGA',
    'P3_REGIME_TRANSMISSION_RESEARCH',
  ]),
  REGULATORY_RISK: factor('REGULATORY_RISK', [
    'RISK_OMEGA',
    'REGULATORY_RESEARCH',
  ]),
  GEOPOLITICAL_RISK: factor('GEOPOLITICAL_RISK', [
    'RISK_OMEGA',
    'GEOPOLITICAL_RESEARCH',
  ]),
  FINANCING_RISK: factor('FINANCING_RISK', [
    'RISK_OMEGA',
    'FINANCING_QUALITY_GATE_OMEGA_V1',
    'AI_CAPITAL_FORMATION_OMEGA',
  ]),
  CREDIT_RISK: factor('CREDIT_RISK', [
    'RISK_OMEGA',
    'FINANCING_QUALITY_GATE_OMEGA_V1',
    'CREDIT_RESEARCH',
  ]),
  AI_VALUE_CAPTURE: factor('AI_VALUE_CAPTURE', [
    'AI_VALUE_MIGRATION_OMEGA',
    'AI_DEMAND_PROVENANCE_OMEGA',
    'P2_VALUE_CAPTURE_RESEARCH',
  ]),
  AI_CAPITAL_FORMATION_QUALITY: factor('AI_CAPITAL_FORMATION_QUALITY', [
    'AI_CAPITAL_FORMATION_OMEGA',
    'FINANCING_QUALITY_GATE_OMEGA_V1',
    'P1_CAPITAL_FLOW_RESEARCH',
  ]),
};

export type FactorScoreClaim = Readonly<{
  factor: AtlasFactorKey;
  claimant: string;
  value: number;
  evidenceIds?: readonly string[];
}>;

export function assertSingleOwnerFactorScoring(
  claims: readonly FactorScoreClaim[],
): void {
  const scored = new Set<AtlasFactorKey>();

  for (const claim of claims) {
    const ownership = FACTOR_OWNERSHIP_LEDGER_OMEGA[claim.factor];
    if (claim.claimant !== ownership.scoringOwner) {
      throw new Error(
        `FACTOR_OWNER_VIOLATION:${claim.factor}:expected=${ownership.scoringOwner}:received=${claim.claimant}`,
      );
    }
    if (scored.has(claim.factor)) {
      throw new Error(`DUPLICATE_FACTOR_SCORE:${claim.factor}`);
    }
    if (!Number.isFinite(claim.value)) {
      throw new Error(`INVALID_FACTOR_SCORE:${claim.factor}`);
    }
    scored.add(claim.factor);
  }
}

export function uniqueEvidenceIdsForConfidence(
  claims: readonly Pick<FactorScoreClaim, 'factor' | 'evidenceIds'>[],
): Readonly<Record<AtlasFactorKey, readonly string[]>> {
  const result = Object.fromEntries(
    ATLAS_FACTOR_KEYS.map((factorKey) => [factorKey, [] as string[]]),
  ) as Record<AtlasFactorKey, string[]>;

  for (const claim of claims) {
    const seen = new Set(result[claim.factor]);
    for (const evidenceId of claim.evidenceIds ?? []) {
      const normalized = evidenceId.trim();
      if (normalized) seen.add(normalized);
    }
    result[claim.factor] = [...seen];
  }

  return result;
}

export const FACTOR_OWNERSHIP_HARD_RULES = {
  canonicalEngine: 'E2_ASSESSMENT_OMEGA',
  createsNewEngine: false,
  oneDirectScoreClaimPerFactor: true,
  nonOwnerScoreClaim: 'REJECT',
  multipleEvidenceEffect: 'CONFIDENCE_ONLY',
  shadowSignalDirectScoreWeight: 0,
  integrationStatus: 'ACTIVE_BOUNDARY_REQUIRES_CALLSITE_AUDIT',
} as const;
