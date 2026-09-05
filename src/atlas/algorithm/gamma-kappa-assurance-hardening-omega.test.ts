import { describe, expect, it } from 'vitest';
import {
  applyOmegaNEPolicy,
  evaluateGammaV12,
  OMEGA_NE_POLICY_V1,
  validateGammaRelativeFalsifier,
  type GammaRelativeFalsifier,
} from './gamma-kappa-assurance-hardening-omega';

const base = (overrides: Partial<GammaRelativeFalsifier> = {}): GammaRelativeFalsifier => ({
  id: 'G-1', ticker: 'TEST', metric: 'Operating margin', baseline: 60, unit: 'pct',
  baselineSource: '10-Q', baselinePeriodEnd: '2026-06-30', latestPublishedPeriodEndAtSeal: '2026-06-30',
  amberOperator: '<', amberThreshold: 55, redOperator: '<', redThreshold: 50,
  window: '1Q', weight: 1, severity: 'MAJOR', observable: true, causal: true, thesisRelevant: true,
  ...overrides,
});

describe('Γ v1.2 falsation hardening', () => {
  it('A1 rejects a falsifier born already beyond AMBER', () => {
    const result = validateGammaRelativeFalsifier(base({ baseline: 54 }));
    expect(result.valid).toBe(false);
    expect(result.codes).toContain('THRESHOLD_ALREADY_BREACHED');
  });

  it('A7 rejects discretionary historical baseline selection', () => {
    const result = validateGammaRelativeFalsifier(base({ baselinePeriodEnd:'2026-03-31' }));
    expect(result.valid).toBe(false);
    expect(result.codes).toContain('BASELINE_NON_STANDARD');
  });

  it('A8 detects a sealed definition fingerprint mismatch', () => {
    const result = validateGammaRelativeFalsifier(base({ sealedDefinitionHash:'abc', currentDefinitionHash:'def' }));
    expect(result.valid).toBe(false);
    expect(result.codes).toContain('WEIGHTS_TAMPERED');
  });

  it('rejects a red threshold that is not more severe than amber', () => {
    const result = validateGammaRelativeFalsifier(base({ redThreshold: 58 }));
    expect(result.codes).toContain('RED_NOT_MORE_SEVERE_THAN_AMBER');
  });

  it('keeps a bad but stable baseline conceptually separate from deterioration', () => {
    const definition = base({ baseline: 7, amberThreshold: 5, redThreshold: 0, metric:'OCF/CAPEX', unit:'ratio' });
    const result = evaluateGammaV12([definition],[{ falsifierId:'G-1', observedValue:7 }]);
    expect(result.state).toBe('VIGENTE_MEDIBLE');
    expect(result.vOmega).toBe(1);
    expect(result.interpretation).toBe('NO_DETERIORATION_RELATIVE_TO_SEALED_BASELINE');
  });

  it('weights AMBER at 0.5 and RED at 1 for non-critical falsifiers', () => {
    const defs = [
      base({ id:'A', weight:0.5 }),
      base({ id:'B', weight:0.5, metric:'Leverage', baseline:1, amberOperator:'>', amberThreshold:2, redOperator:'>', redThreshold:3 }),
    ];
    const result = evaluateGammaV12(defs,[
      { falsifierId:'A', observedValue:54 },
      { falsifierId:'B', observedValue:3.5 },
    ]);
    expect(result.vOmega).toBeCloseTo(0.25,10);
  });

  it('keeps CRITICAL outside V_Ω and surfaces it separately', () => {
    const defs = [
      base({ id:'A', weight:0.5, severity:'CRITICAL' }),
      base({ id:'B', weight:0.5 }),
    ];
    const result = evaluateGammaV12(defs,[
      { falsifierId:'A', observedValue:49 },
      { falsifierId:'B', observedValue:60 },
    ]);
    expect(result.vOmega).toBe(1);
    expect(result.criticalRed).toEqual(['A']);
  });

  it('A10 returns NO_EVALUABLE when no current observation exists', () => {
    const result = evaluateGammaV12([base()],[]);
    expect(result.state).toBe('VIGENCIA_NO_EVALUABLE');
    expect(result.vOmega).toBeNull();
  });
});

describe('Ω-NE policy', () => {
  it('does not translate missing vigencia into quality deterioration or verified safety', () => {
    const result = applyOmegaNEPolicy({ entityIdentityVerified:true, gammaState:'VIGENCIA_NO_EVALUABLE', consecutiveNoEvaluableQuarters:1 });
    expect(result.state).toBe('NO_EVALUABLE_CAP');
    expect(result.maxEquityWeight).toBe(0.02);
    expect(result.qualityPenalty).toBe(0);
    expect(result.excludeVOmegaFromUtility).toBe(true);
    expect(result.escalateToXi).toBe(false);
    expect(OMEGA_NE_POLICY_V1.vOmegaSubstitution).toBeNull();
  });

  it('escalates prolonged opacity to Xi after two consecutive quarters', () => {
    const result = applyOmegaNEPolicy({ entityIdentityVerified:true, gammaState:'VIGENCIA_NO_EVALUABLE', consecutiveNoEvaluableQuarters:2 });
    expect(result.escalateToXi).toBe(true);
  });

  it('does not let Ω-NE rescue an unidentified entity', () => {
    const result = applyOmegaNEPolicy({ entityIdentityVerified:false, gammaState:'VIGENCIA_NO_EVALUABLE', consecutiveNoEvaluableQuarters:3 });
    expect(result.state).toBe('ENTITY_IDENTITY_NOT_VERIFIED');
    expect(result.downstreamAuthorized).toBe(false);
    expect(result.maxEquityWeight).toBeNull();
  });
});
