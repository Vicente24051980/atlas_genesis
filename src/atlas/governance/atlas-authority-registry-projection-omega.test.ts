import { describe, expect, it } from 'vitest';
import {
  ATLAS_AUTHORITY_REGISTRY_PROJECTION_OMEGA,
  automatedComponentCanWriteCanon,
  getAuthorityRecord,
  getAuthorityRegistryUnknowns,
} from './atlas-authority-registry-projection-omega';

describe('ATLAS Authority Registry projection Ω', () => {
  it('has exactly one sole master selection authority', () => {
    const masters = ATLAS_AUTHORITY_REGISTRY_PROJECTION_OMEGA.filter((record) => record.selectionAuthority === 'SOLE_MASTER');
    expect(masters).toHaveLength(1);
    expect(masters[0].id).toBe('ATLAS_OMEGA_MASTER_UNIVERSE_PROMPT_2026_09_06');
  });

  it('denies automated canon writes for every projected component', () => {
    for (const record of ATLAS_AUTHORITY_REGISTRY_PROJECTION_OMEGA) {
      expect(record.canWriteCanon).toBe(false);
      expect(automatedComponentCanWriteCanon(record.id)).toBe(false);
    }
  });

  it('preserves declared zero-weight shadow/corroborative signals', () => {
    expect(getAuthorityRecord('REVEALED_CAPITAL_INTELLIGENCE_OMEGA_V1')?.directScoreWeight).toBe(0);
    expect(getAuthorityRecord('TRADER_INTELLIGENCE_OMEGA_V1')?.directScoreWeight).toBe(0);
  });

  it('does not silently convert undeclared authority fields into zero or false', () => {
    const unknowns = getAuthorityRegistryUnknowns();
    expect(unknowns.length).toBeGreaterThan(0);
    expect(unknowns.some((record) => record.activationGate === 'UNKNOWN_NOT_DECLARED')).toBe(true);
    expect(unknowns.some((record) => record.directScoreWeight === 'UNKNOWN_NOT_DECLARED')).toBe(true);
  });

  it('keeps the research substrate outside selection authority and direct scoring', () => {
    const research = getAuthorityRecord('RESEARCH_OMEGA');
    expect(research?.selectionAuthority).toBe('NONE');
    expect(research?.directScoreWeight).toBe(0);
    expect(research?.canWriteCanon).toBe(false);
  });
});
