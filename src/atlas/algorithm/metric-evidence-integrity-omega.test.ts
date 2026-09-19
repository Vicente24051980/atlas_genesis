import { describe, expect, it } from 'vitest';
import {
  METRIC_EVIDENCE_INTEGRITY_OMEGA,
  validateMetricEvidenceIntegrity,
} from './metric-evidence-integrity-omega';

const source = { sourceId: 'issuer-ir-q2-2026' };

describe('METRIC_EVIDENCE_INTEGRITY Ω — v3.4 extension', () => {
  it('has zero scoring and decision authority', () => {
    expect(METRIC_EVIDENCE_INTEGRITY_OMEGA.directScoreWeight).toBe(0);
    expect(METRIC_EVIDENCE_INTEGRITY_OMEGA.buySellAuthority).toBe(false);
    expect(METRIC_EVIDENCE_INTEGRITY_OMEGA.createsEngine).toBe(false);
    expect(METRIC_EVIDENCE_INTEGRITY_OMEGA.createsGate).toBe(false);
  });

  it('blocks ambiguous EPS without an explicit accounting basis', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'EPS',
      value: 2.15,
      availableAt: '2026-08-01T12:00:00Z',
      decisionAsOf: '2026-08-02T12:00:00Z',
      source,
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.reasons).toContain('EPS_ACCOUNTING_BASIS_AMBIGUOUS');
  });

  it('accepts explicitly labelled non-GAAP EPS when provenance and PIT timing pass', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'non-GAAP EPS',
      value: 2.15,
      periodEnd: '2026-06-30',
      observedAt: '2026-06-30',
      availableAt: '2026-08-01T12:00:00Z',
      decisionAsOf: '2026-08-02T12:00:00Z',
      source,
    });

    expect(result.status).toBe('ACCEPTED');
    expect(result.resolvedAccountingBasis).toBe('NON_GAAP');
  });

  it('blocks look-ahead when the metric was not yet available at decision time', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'GAAP EPS',
      value: 2.15,
      availableAt: '2026-08-03T12:00:00Z',
      decisionAsOf: '2026-08-02T12:00:00Z',
      source,
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.reasons).toContain('LOOK_AHEAD_BLOCKED');
  });

  it('blocks a critical metric without a traceable source', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'GAAP EPS',
      value: 2.15,
      availableAt: '2026-08-01T12:00:00Z',
      decisionAsOf: '2026-08-02T12:00:00Z',
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.reasons).toContain('SOURCE_MISSING');
  });
});
