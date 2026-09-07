import { describe, expect, it } from 'vitest';
import {
  ATLAS_FACTOR_KEYS,
  FACTOR_OWNERSHIP_HARD_RULES,
  FACTOR_OWNERSHIP_LEDGER_OMEGA,
  assertSingleOwnerFactorScoring,
  uniqueEvidenceIdsForConfidence,
} from './factor-ownership-ledger-omega';

describe('Factor Ownership Ledger Ω', () => {
  it('is an E2 boundary and never a seventh canonical engine', () => {
    expect(FACTOR_OWNERSHIP_HARD_RULES.canonicalEngine).toBe('E2_ASSESSMENT_OMEGA');
    expect(FACTOR_OWNERSHIP_HARD_RULES.createsNewEngine).toBe(false);
    expect(FACTOR_OWNERSHIP_HARD_RULES.oneDirectScoreClaimPerFactor).toBe(true);
    expect(FACTOR_OWNERSHIP_HARD_RULES.multipleEvidenceEffect).toBe('CONFIDENCE_ONLY');
    expect(FACTOR_OWNERSHIP_HARD_RULES.shadowSignalDirectScoreWeight).toBe(0);
  });

  it('has exactly one explicit scoring owner for every registered factor', () => {
    expect(ATLAS_FACTOR_KEYS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(ATLAS_FACTOR_KEYS).size).toBe(ATLAS_FACTOR_KEYS.length);

    for (const factor of ATLAS_FACTOR_KEYS) {
      const entry = FACTOR_OWNERSHIP_LEDGER_OMEGA[factor];
      expect(entry.scoringOwner).toBe(`E2_SLOT:${factor}`);
      expect(entry.directScoreClaimsAllowed).toBe(1);
      expect(entry.evidenceMayIncreaseConfidence).toBe(true);
      expect(entry.evidenceMayCreateAdditionalScore).toBe(false);
    }
  });

  it('accepts one score claim from the canonical factor owner', () => {
    expect(() =>
      assertSingleOwnerFactorScoring(
        ATLAS_FACTOR_KEYS.map((factor, index) => ({
          factor,
          claimant: FACTOR_OWNERSHIP_LEDGER_OMEGA[factor].scoringOwner,
          value: index / 10,
        })),
      ),
    ).not.toThrow();
  });

  it('rejects a score claim from an evidence contributor', () => {
    const factor = 'BACKLOG' as const;
    const contributor = FACTOR_OWNERSHIP_LEDGER_OMEGA[factor].evidenceContributors[0];

    expect(() =>
      assertSingleOwnerFactorScoring([
        { factor, claimant: contributor, value: 1 },
      ]),
    ).toThrow(/FACTOR_OWNER_VIOLATION:BACKLOG/);
  });

  it('rejects duplicate points even when both claims use the correct owner', () => {
    const factor = 'FCF' as const;
    const owner = FACTOR_OWNERSHIP_LEDGER_OMEGA[factor].scoringOwner;

    expect(() =>
      assertSingleOwnerFactorScoring([
        { factor, claimant: owner, value: 0.7 },
        { factor, claimant: owner, value: 0.8 },
      ]),
    ).toThrow('DUPLICATE_FACTOR_SCORE:FCF');
  });

  it('deduplicates corroborating evidence without manufacturing another score', () => {
    const evidence = uniqueEvidenceIdsForConfidence([
      { factor: 'VALUATION', evidenceIds: ['dcf-1', 'cross-check-1', 'dcf-1'] },
      { factor: 'VALUATION', evidenceIds: ['cross-check-1', 'consensus-1'] },
    ]);

    expect(evidence.VALUATION).toEqual(['dcf-1', 'cross-check-1', 'consensus-1']);
    expect(evidence.FCF).toEqual([]);
  });
});
