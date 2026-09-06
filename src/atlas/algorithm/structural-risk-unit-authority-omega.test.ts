import { describe, expect, it } from 'vitest';
import { STRUCTURAL_RISK_UNIT_AUTHORITY, structuralRiskUnitsCanonicalReady } from './structural-risk-unit-authority-omega';
import { isCanonicalSizingAttestationValid } from './structural-sizing-authority-omega';

// This test deliberately asserts the blocker. It must be changed only together
// with a versioned, calibrated unit contract and its validation evidence.
describe('ATLAS Ω Structural Risk Unit Authority', () => {
  it('fails closed while risk-unit semantics are unresolved', () => {
    expect(STRUCTURAL_RISK_UNIT_AUTHORITY.status).toBe('RESEARCH_PENDING');
    expect(structuralRiskUnitsCanonicalReady()).toBe(false);
    expect(STRUCTURAL_RISK_UNIT_AUTHORITY.permanentLossRiskUnit).toBeNull();
    expect(STRUCTURAL_RISK_UNIT_AUTHORITY.tailRiskUnit).toBeNull();
    expect(STRUCTURAL_RISK_UNIT_AUTHORITY.volatilityRiskUnit).toBeNull();
    expect(STRUCTURAL_RISK_UNIT_AUTHORITY.fragilityUnit).toBeNull();
    expect(STRUCTURAL_RISK_UNIT_AUTHORITY.requirementsToActivate.length).toBeGreaterThanOrEqual(6);
  });

  it('keeps forward expected return explicitly in percentage-point semantics', () => {
    expect(STRUCTURAL_RISK_UNIT_AUTHORITY.expectedReturnUnit).toBe('PERCENTAGE_POINTS_PER_YEAR_FORWARD_COMPOUNDING_BRIDGE');
  });

  it('prevents sizing activation from bypassing unresolved risk units', () => {
    expect(isCanonicalSizingAttestationValid({
      sizingEngineVersion: 'fake-engine',
      sizingPolicyHash: 'fake-policy',
      sizingEvidenceHash: 'fake-evidence',
      validationState: 'VALIDATED',
    })).toBe(false);
  });
});
