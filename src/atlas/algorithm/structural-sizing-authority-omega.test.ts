import { describe, expect, it } from 'vitest';
import { STRUCTURAL_SIZING_AUTHORITY, isCanonicalSizingAttestationValid } from './structural-sizing-authority-omega';
import { canonicalSizingAttestationState, type StructuralSizingEvidence } from './structural-portfolio-publication-gate-omega';

const forgedButWellFormed: StructuralSizingEvidence = {
  method: 'COVARIANCE_AWARE',
  portfolioVolatilityModelHash: 'covariance-hash',
  weights: { AVGO: 0.5, NVDA: 0.5 },
  attestation: {
    sizingEngineVersion: 'caller-invented-engine',
    sizingPolicyHash: 'caller-invented-policy',
    sizingEvidenceHash: 'caller-invented-evidence',
    validationState: 'VALIDATED',
  },
};

describe('ATLAS Ω Structural Sizing Authority', () => {
  it('starts fail-closed until a sizing engine/policy is actually validated', () => {
    expect(STRUCTURAL_SIZING_AUTHORITY.status).toBe('RESEARCH_PENDING');
    expect(STRUCTURAL_SIZING_AUTHORITY.canonicalReady).toBe(false);
    expect(STRUCTURAL_SIZING_AUTHORITY.validatedSizingEngineVersion).toBeNull();
    expect(STRUCTURAL_SIZING_AUTHORITY.validatedSizingPolicyHash).toBeNull();
  });

  it('rejects caller self-attestation even when it says VALIDATED', () => {
    expect(isCanonicalSizingAttestationValid(forgedButWellFormed.attestation)).toBe(false);
    expect(canonicalSizingAttestationState(forgedButWellFormed)).toBe('BLOCKED_SIZING_POLICY_UNVALIDATED');
  });

  it('distinguishes no sizing from unvalidated sizing', () => {
    expect(canonicalSizingAttestationState()).toBe('BLOCKED_SIZING_NOT_IMPLEMENTED');
  });
});
