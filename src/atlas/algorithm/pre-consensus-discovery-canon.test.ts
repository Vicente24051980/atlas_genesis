import { describe, expect, it } from 'vitest';
import { ATLAS_PRE_CONSENSUS_DISCOVERY_CANON } from './pre-consensus-discovery-canon';

describe('ATLAS Pre-Consensus Discovery Canon', () => {
  it('registers the engine as shadow under open-source quant governance', () => {
    expect(ATLAS_PRE_CONSENSUS_DISCOVERY_CANON.status).toBe('ACTIVE_SHADOW_OOS_REQUIRED');
    expect(ATLAS_PRE_CONSENSUS_DISCOVERY_CANON.parentSystem).toBe('OPEN_SOURCE_QUANT_AI_OMEGA_V1');
    expect(ATLAS_PRE_CONSENSUS_DISCOVERY_CANON.placement.portfolioAuthorityRemains).toBe('CAPITAL_BLIND_PORTFOLIO_SELECTION_OMEGA_V1');
  });

  it('preserves constitutional veto and selection boundaries', () => {
    expect(ATLAS_PRE_CONSENSUS_DISCOVERY_CANON.invariants).toContain('NO_OVERRIDE_T0');
    expect(ATLAS_PRE_CONSENSUS_DISCOVERY_CANON.invariants).toContain('NO_OVERRIDE_HARD_GATES');
    expect(ATLAS_PRE_CONSENSUS_DISCOVERY_CANON.invariants).toContain('NO_OVERRIDE_FALSIFIER_VETO');
    expect(ATLAS_PRE_CONSENSUS_DISCOVERY_CANON.invariants).toContain('NO_OVERRIDE_CAPITAL_BLIND_SELECTION');
    expect(ATLAS_PRE_CONSENSUS_DISCOVERY_CANON.invariants).toContain('DIRECT_ATLAS_SCORE_WEIGHT_ZERO');
  });
});
