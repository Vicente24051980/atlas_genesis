import {
  NEXT_GEN_SEMIS_CONTROLS,
  NEXT_GEN_SEMIS_SENSORS,
  evaluateNextGenSemisOmega,
  type NextGenSemisGateInput,
} from './next-gen-semis-omega';

describe('NEXT-GEN SEMIS Omega fail-closed classifier', () => {
  const passing: NextGenSemisGateInput = {
    fundamentalsVerified: true,
    rsVsSoxxPositive: true,
    childParentSpreadExpanding: true,
    canonicalBreadthPct: 60,
    medianReturnPct: 0.1,
    consecutiveQualifyingRegularCloses: 3,
    freeFromExpectationsSaturation: true,
  };

  it('declares MIGRATION_CONFIRMED only when all seven gates pass', () => {
    expect(evaluateNextGenSemisOmega(passing)).toMatchObject({
      state: 'MIGRATION_CONFIRMED',
      confirmed: true,
      failedGate: null,
    });
  });

  it('classifies missing RS as TECHNICAL_REBOUND', () => {
    expect(evaluateNextGenSemisOmega({ ...passing, rsVsSoxxPositive: false })).toMatchObject({
      state: 'TECHNICAL_REBOUND',
      confirmed: false,
      failedGate: 'RS_VS_SOXX',
    });
  });

  it('classifies non-expanding CHILD > PARENT as TECHNICAL_REBOUND', () => {
    expect(evaluateNextGenSemisOmega({ ...passing, childParentSpreadExpanding: false })).toMatchObject({
      state: 'TECHNICAL_REBOUND',
      failedGate: 'CHILD_PARENT',
    });
  });

  it('blocks confirmation when breadth is below 60%', () => {
    expect(evaluateNextGenSemisOmega({ ...passing, canonicalBreadthPct: 59.99 })).toMatchObject({
      state: 'ROTATION_EARLY_MIGRATION',
      failedGate: 'BREADTH_60',
    });
  });

  it('blocks confirmation when complete-link median is not positive', () => {
    expect(evaluateNextGenSemisOmega({ ...passing, medianReturnPct: 0 })).toMatchObject({
      state: 'ROTATION_EARLY_MIGRATION',
      failedGate: 'MEDIAN_POSITIVE',
    });
  });

  it('blocks confirmation before three consecutive qualifying regular closes', () => {
    expect(evaluateNextGenSemisOmega({ ...passing, consecutiveQualifyingRegularCloses: 2 })).toMatchObject({
      state: 'ROTATION_EARLY_MIGRATION',
      failedGate: 'PERSISTENCE_3D',
    });
  });

  it('blocks confirmation under Expectations Saturation Omega', () => {
    expect(evaluateNextGenSemisOmega({ ...passing, freeFromExpectationsSaturation: false })).toMatchObject({
      state: 'ROTATION_EARLY_MIGRATION',
      failedGate: 'EXPECTATIONS_SATURATION',
    });
  });

  it('keeps the canonical sensors and parent/control cohort explicit', () => {
    expect(NEXT_GEN_SEMIS_SENSORS).toEqual(['CRDO', 'ALAB', 'BESI', 'COHR', 'LITE']);
    expect(NEXT_GEN_SEMIS_CONTROLS).toEqual(['AVGO', 'MRVL', 'ASML', 'AMAT', 'LRCX', 'KLAC', 'ANET']);
  });

  it('rejects non-finite metrics instead of silently passing incomplete data', () => {
    expect(() => evaluateNextGenSemisOmega({ ...passing, canonicalBreadthPct: Number.NaN }))
      .toThrow('next_gen_semis_invalid_metric:canonicalBreadthPct');
  });
});
