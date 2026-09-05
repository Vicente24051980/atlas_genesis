import { describe, expect, it } from 'vitest';
import { ATLAS_PORTFOLIO_SELECTION_CANON } from './portfolio-selection-canon-omega';

describe('ATLAS Portfolio Selection Canon Ω', () => {
  it('uses endogenous N bounded 20-35', () => {
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.minPositions).toBe(20);
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.maxPositions).toBe(35);
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.optimalN).toBe('ENDOGENOUS');
  });

  it('forbids personal capital state from selection', () => {
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.prohibitedSelectionInputs).toContain('CURRENT_INVESTED_EUR');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.prohibitedSelectionInputs).toContain('PERSONAL_AVERAGE_COST');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.prohibitedSelectionInputs).toContain('INCUMBENCY_BONUS');
  });

  it('keeps T0 upstream and sizing/timing downstream', () => {
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.upstream[0]).toBe('T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1_1');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.downstream).toContain('UPSILON_ALLOCATION_OMEGA_V1');
    expect(ATLAS_PORTFOLIO_SELECTION_CANON.downstream).toContain('ENTRY_TIMING_RETURN_AWARE_OMEGA_V2_2');
  });
});
