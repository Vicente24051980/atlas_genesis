export const STRUCTURAL_RISK_UNIT_AUTHORITY_VERSION = '2026-09-06-v0.1.0' as const;

/**
 * Fail-closed authority for the units used by the structural portfolio utility.
 *
 * Current implementation evidence:
 * - Expected Return is expressed in percentage points.
 * - permanentLossRisk / tailRisk / volatilityRisk / fragility / convexity are
 *   plain numbers and their common economic unit/normalization is not encoded
 *   in PortfolioCandidateV2.
 *
 * Therefore the absolute trade-off between ER and risk is not yet invariant to
 * upstream scoring scale. Canonical optimization must stay blocked until this
 * contract is explicit and calibrated.
 */
export const STRUCTURAL_RISK_UNIT_AUTHORITY = {
  version: STRUCTURAL_RISK_UNIT_AUTHORITY_VERSION,
  status: 'RESEARCH_PENDING',
  canonicalReady: false,
  expectedReturnUnit: 'PERCENTAGE_POINTS_PER_YEAR_FORWARD_COMPOUNDING_BRIDGE',
  permanentLossRiskUnit: null,
  tailRiskUnit: null,
  volatilityRiskUnit: null,
  fragilityUnit: null,
  convexityUnit: null,
  requirementsToActivate: [
    'Declare an explicit economic/statistical unit or normalized transform for every risk term.',
    'Freeze deterministic transforms from raw evidence into those units.',
    'Prove that equivalent source scales map to identical normalized portfolio inputs.',
    'Calibrate ER-versus-risk trade-offs without using the current portfolio as the target.',
    'Run sensitivity analysis so small unit/parameter changes do not arbitrarily rewrite membership/N.',
    'Validate on out-of-sample or prospective decisions before granting publication authority.',
  ],
} as const;

export function structuralRiskUnitsCanonicalReady(): boolean {
  return STRUCTURAL_RISK_UNIT_AUTHORITY.canonicalReady;
}
