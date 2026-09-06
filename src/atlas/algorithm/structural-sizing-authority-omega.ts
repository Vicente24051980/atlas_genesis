export const STRUCTURAL_SIZING_AUTHORITY_VERSION = '2026-09-06-v0.1.0' as const;

export const STRUCTURAL_SIZING_AUTHORITY = {
  version: STRUCTURAL_SIZING_AUTHORITY_VERSION,
  status: 'RESEARCH_PENDING',
  canonicalReady: false,
  requiredMethod: 'COVARIANCE_AWARE',
  validatedSizingEngineVersion: null,
  validatedSizingPolicyHash: null,
  laws: [
    'Equal test weights are not structural position sizing.',
    'A caller-provided covariance label or volatility hash is not sufficient attestation.',
    'Canonical sizing requires a versioned deterministic sizing engine and versioned policy.',
    'Expected-return inputs and risk inputs must have explicit units before they may be combined in an optimizer objective.',
    'Covariance must be PIT-tagged, symmetric, finite and positive-semidefinite within declared numerical tolerance.',
    'Sector, geography, style and aesthetic diversification have zero independent sizing authority.',
    'Concentration may be high when supported by return/risk utility; concentration constraints may exist only as calibrated ruin/liquidity/risk controls.',
    'Sizing validation requires walk-forward/OOS and parameter-sensitivity evidence before canonical activation.',
    'Until validation is complete, structural publication remains blocked.',
  ],
} as const;

export type StructuralSizingAttestation = {
  sizingEngineVersion: string;
  sizingPolicyHash: string;
  sizingEvidenceHash: string;
  validationState: 'RESEARCH_ONLY' | 'VALIDATED';
};

export function isCanonicalSizingAttestationValid(attestation?: StructuralSizingAttestation): boolean {
  if (!STRUCTURAL_SIZING_AUTHORITY.canonicalReady) return false;
  if (!attestation) return false;
  if (attestation.validationState !== 'VALIDATED') return false;
  if (!attestation.sizingEvidenceHash.trim()) return false;
  return attestation.sizingEngineVersion === STRUCTURAL_SIZING_AUTHORITY.validatedSizingEngineVersion
    && attestation.sizingPolicyHash === STRUCTURAL_SIZING_AUTHORITY.validatedSizingPolicyHash;
}
