import { describe, expect, it } from 'vitest';
import { ATLAS_PORTFOLIO_SELECTION_CANON } from './portfolio-selection-canon-omega';

describe('ATLAS Portfolio Selection Canon Ω', () => {
  it('uses fully endogenous N with no fixed cardinality bounds', () => {
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.cardinalityBounds).toBe('NONE');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.optimalN).toBe('FULLY_ENDOGENOUS_FROM_MARGINAL_PORTFOLIO_UTILITY');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.prohibitedSelectionInputs).toContain('FIXED_MIN_POSITION_COUNT');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.prohibitedSelectionInputs).toContain('FIXED_MAX_POSITION_COUNT');
  });

  it('forbids personal capital state and incumbency from clean selection', () => {
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.prohibitedSelectionInputs).toContain('CURRENT_INVESTED_EUR');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.prohibitedSelectionInputs).toContain('PERSONAL_AVERAGE_COST');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.prohibitedSelectionInputs).toContain('INCUMBENCY_BONUS');
  });

  it('anchors the exact 487-entity universe and Point Zero pipeline', () => {
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.universeVersion).toBe('ATLAS_CORE_650_RAW_490_UNIQUE_487_ENTITY_2026-09-06');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.upstream[0]).toBe('CANONICAL_ENTITY_DEDUP_650_RAW_TO_487_ENTITIES');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.upstream).toContain('POINT_ZERO_ZERO_PRIOR_ADVANTAGE');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.upstream).toContain('T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA');
  });

  it('keeps sizing and timing downstream from clean membership selection', () => {
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.downstream).toContain('UPSILON_ALLOCATION_OMEGA_V1');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.downstream).toContain('ENTRY_TIMING_RETURN_AWARE_OMEGA_V2_2');
  });
});