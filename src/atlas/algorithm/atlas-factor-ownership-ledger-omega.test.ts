import { describe, expect, it } from 'vitest';
import {
  ATLAS_FACTOR_OWNERSHIP_LEDGER_OMEGA,
  getFactorOwnership,
  getUnresolvedScoringOwnershipFactors,
  isFactorOwnershipCanonicalPublicationReady,
  validateFactorClaim,
} from './atlas-factor-ownership-ledger-omega';

describe('ATLAS Factor Ownership Ledger Ω', () => {
  it('registers every factor exactly once with one canonical normalizer', () => {
    const ids = ATLAS_FACTOR_OWNERSHIP_LEDGER_OMEGA.map((record) => record.factorId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const record of ATLAS_FACTOR_OWNERSHIP_LEDGER_OMEGA) {
      expect(record.canonicalNormalizer).toBeTruthy();
      expect(record.duplicatePointPolicy).toBe('FORBID');
    }
  });

  it('blocks raw backlog from direct scoring', () => {
    expect(getFactorOwnership('BACKLOG').scoringOwner).toBe('NONE_RAW_FACTOR');
    expect(validateFactorClaim('BACKLOG', 'QUALITY_ADJUSTED_BACKLOG_OMEGA_V1', 'ADD_POINTS')).toEqual({
      allowed: false,
      reason: 'raw_factor_has_no_direct_scoring_authority',
    });
  });

  it('keeps valuation scoring single-owner and cross-check diagnostic-only', () => {
    expect(validateFactorClaim('VALUATION', 'VALUATION_OMEGA', 'ADD_POINTS').allowed).toBe(true);
    expect(validateFactorClaim('VALUATION', 'EXTERNAL_VALUATION_CROSS_CHECK_OMEGA_V1', 'ADD_POINTS')).toEqual({
      allowed: false,
      reason: 'secondary_consumer_cannot_add_independent_points',
    });
    expect(validateFactorClaim('VALUATION', 'EXTERNAL_VALUATION_CROSS_CHECK_OMEGA_V1', 'CONSUME').allowed).toBe(true);
  });

  it('fails closed when the live scoring owner has not yet been mapped', () => {
    for (const factor of ['FREE_CASH_FLOW', 'ROIC', 'CAPEX', 'EXPECTATION_GAP', 'ORGANIC_GROWTH'] as const) {
      const record = getFactorOwnership(factor);
      expect(record.scoringOwner).toBe('UNRESOLVED_RUNTIME_MAPPING');
      expect(validateFactorClaim(factor, record.canonicalNormalizer, 'ADD_POINTS')).toEqual({
        allowed: false,
        reason: 'scoring_owner_unresolved_fail_closed',
      });
    }
  });

  it('blocks canonical publication while any high-risk scoring owner is unresolved', () => {
    expect(getUnresolvedScoringOwnershipFactors()).toEqual([
      'FREE_CASH_FLOW', 'ROIC', 'CAPEX', 'EXPECTATION_GAP', 'ORGANIC_GROWTH',
    ]);
    expect(isFactorOwnershipCanonicalPublicationReady()).toBe(false);
  });

  it('allows registered engines to consume normalized factors without creating new points', () => {
    expect(validateFactorClaim('FREE_CASH_FLOW', 'VALUATION_OMEGA', 'CONSUME').allowed).toBe(true);
    expect(validateFactorClaim('ROIC', 'CAPITAL_ALLOCATION_QUALITY_OMEGA_V1', 'CONSUME').allowed).toBe(true);
    expect(validateFactorClaim('CAPEX', 'AI_CAPEX_PAYBACK_OMEGA_V2_1', 'CONSUME').allowed).toBe(true);
    expect(validateFactorClaim('EXPECTATION_GAP', 'EVENT_PRICING_OPTIONS_EXPECTATIONS_OMEGA_V1', 'CONSUME').allowed).toBe(true);
  });

  it('rejects unknown consumers instead of silently admitting them', () => {
    expect(validateFactorClaim('FREE_CASH_FLOW', 'UNREGISTERED_ENGINE', 'CONSUME')).toEqual({
      allowed: false,
      reason: 'unregistered_factor_consumer',
    });
  });
});
