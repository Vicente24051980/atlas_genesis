import { describe, expect, it } from 'vitest';
import {
  OMEGA_NE_POLICY_V1,
  applyOmegaNE,
  canonicalJson,
  expectedRecordHash,
  gammaEligibility,
  gammaSealPayload,
  gammaWeightsHash,
  sha256Canonical,
  validateGammaV12Ingestion,
  validateKappaCase,
  verifyGammaWeights,
  verifyHashChain,
  type GammaV12Falsifier,
  type HashChainEvent,
} from './ledger-integrity-omega';

const baseGamma = (overrides: Partial<GammaV12Falsifier> = {}): GammaV12Falsifier => ({
  falsifierId: 'C-F1',
  ticker: 'COHR',
  metric: 'OCF annual / CAPEX annual',
  operator: 'LT',
  baseline: 0.07,
  baselineSource: 'FY26 results',
  baselinePeriodEnd: '2026-06-30',
  baselineIsLatestPublishedPeriod: true,
  amber: 0.05,
  red: 0,
  window: 'annual',
  weight: 0.30,
  severity: 'NORMAL',
  sealedAt: '2026-09-05T06:30:00Z',
  sourceVersion: 'GAMMA_VIGENCIA_OMEGA_V1_2',
  ...overrides,
});

describe('Ledger Integrity Ω / Γ falsation matrix', () => {
  it('A1 rejects a falsifier whose baseline already breaches AMBER', () => {
    const result = validateGammaV12Ingestion(baseGamma({ baseline: 0.04 }));
    expect(result.code).toBe('THRESHOLD_ALREADY_BREACHED');
    expect(result.accepted).toBe(false);
  });

  it('A7 rejects a non-latest baseline', () => {
    const result = validateGammaV12Ingestion(baseGamma({ baselineIsLatestPublishedPeriod: false }));
    expect(result.code).toBe('BASELINE_NON_STANDARD');
  });

  it('rejects threshold direction that would make RED less severe than AMBER', () => {
    expect(validateGammaV12Ingestion(baseGamma({ red: 0.06 })).code).toBe('INVALID_THRESHOLD_ORDER');
    expect(validateGammaV12Ingestion(baseGamma({ operator: 'GT', baseline: 1, amber: 2, red: 1.5 })).code)
      .toBe('INVALID_THRESHOLD_ORDER');
  });

  it('A8 detects post-seal weight changes', () => {
    const defs = [baseGamma({ falsifierId: 'F1', weight: 0.4 }), baseGamma({ falsifierId: 'F2', weight: 0.6 })];
    const sealed = gammaWeightsHash(defs);
    const tampered = [defs[0], { ...defs[1], weight: 0.5 }];
    expect(verifyGammaWeights(defs, sealed)).toBe('WEIGHTS_OK');
    expect(verifyGammaWeights(tampered, sealed)).toBe('WEIGHTS_TAMPERED');
  });

  it('canonical serialization is deterministic across object-key order', () => {
    expect(canonicalJson({ z: 1, a: { y: 2, x: 3 } })).toBe(canonicalJson({ a: { x: 3, y: 2 }, z: 1 }));
    expect(sha256Canonical({ b: 2, a: 1 })).toBe(sha256Canonical({ a: 1, b: 2 }));
  });

  it('A5 detects payload tampering and chain breaks', () => {
    const firstWithoutHash = {
      seq: 1,
      stream: 'GAMMA' as const,
      eventType: 'FALSIFIER_SEALED',
      aggregateId: 'C-F1',
      payload: gammaSealPayload(baseGamma()),
      sealedAt: '2026-09-05T06:30:00Z',
      prevHash: 'GENESIS',
    };
    const first: HashChainEvent = { ...firstWithoutHash, recordHash: expectedRecordHash(firstWithoutHash) };
    const secondWithoutHash = {
      seq: 2,
      stream: 'GAMMA' as const,
      eventType: 'OBSERVATION_RECORDED',
      aggregateId: 'C-F1',
      payload: { state: 'NORMAL' },
      sealedAt: '2026-11-30T21:00:00Z',
      prevHash: first.recordHash,
    };
    const second: HashChainEvent = { ...secondWithoutHash, recordHash: expectedRecordHash(secondWithoutHash) };
    expect(verifyHashChain([first, second])).toBe('LEDGER_OK');
    expect(verifyHashChain([{ ...first, payload: { ...first.payload, amber: 0.08 } }, second])).toBe('LEDGER_TAMPERED');
    expect(verifyHashChain([first, { ...second, prevHash: 'fork' }])).toBe('LEDGER_TAMPERED');
  });

  it('Kappa requires immutable resolution criteria and emitter metadata', () => {
    expect(validateKappaCase({
      caseId: 'K-001-R1', ticker: 'V', claim: 'volume and margin hold', claimType: 'fundamental', probability: 0.70,
      horizonEnd: '2027-06-30', horizonClass: '4Q', resolutionCriteria: 'payment volume >=7% CC and operating margin >=56% for four quarters',
      resolutionSource: '10-Q/10-K', emitterVersion: 'ATLAS_KAPPA_2026-09-05', replacesCaseId: 'K-001',
    })).toEqual([]);
  });

  it('Ω-NE is uncertainty control, not a quality penalty', () => {
    const oneQuarter = applyOmegaNE('NO_EVALUABLE', 1);
    const twoQuarters = applyOmegaNE('NO_EVALUABLE', 2);
    expect(oneQuarter.qualityPenalty).toBe(0);
    expect(oneQuarter.hardMaxWeight).toBe(OMEGA_NE_POLICY_V1.maxEquityWeight);
    expect(oneQuarter.excludeVOmegaFromUtility).toBe(true);
    expect(oneQuarter.escalateToXi).toBe(false);
    expect(twoQuarters.escalateToXi).toBe(true);
  });

  it('identity failure is pre-Gamma and cannot be converted into Ω-NE', () => {
    expect(gammaEligibility('ENTITY_IDENTITY_NOT_VERIFIED', false)).toBe('BLOCKED_IDENTITY');
    expect(gammaEligibility('VERIFIED', false)).toBe('NO_EVALUABLE');
  });
});
