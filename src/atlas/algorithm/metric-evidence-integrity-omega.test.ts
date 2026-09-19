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
    expect(result.reasons).toContain('ACCOUNTING_BASIS_AMBIGUOUS');
  });

  it('accepts explicitly labelled non-GAAP EPS when provenance and PIT timing pass', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'non-GAAP EPS',
      value: 2.15,
      periodEnd: '2026-06-30',
      observedAt: '2026-09-19T10:00:00Z',
      availableAt: '2026-08-01T12:00:00Z',
      decisionAsOf: '2026-09-19T12:00:00Z',
      source,
    });

    expect(result.status).toBe('ACCEPTED');
    expect(result.resolvedAccountingBasis).toBe('NON_GAAP');
  });

  it('accepts explicitly labelled GAAP EPS', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'GAAP EPS',
      value: 9.11,
      observedAt: '2026-09-19T10:00:00Z',
      availableAt: '2026-07-29T20:00:00Z',
      decisionAsOf: '2026-09-19T12:00:00Z',
      source,
    });

    expect(result.status).toBe('ACCEPTED');
    expect(result.resolvedAccountingBasis).toBe('GAAP');
  });

  it('does not treat later retrieval than publication as a temporal inconsistency', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'GAAP EPS',
      value: 2.15,
      observedAt: '2026-09-19T10:00:00Z',
      availableAt: '2026-08-01T12:00:00Z',
      decisionAsOf: '2026-09-19T12:00:00Z',
      source,
    });

    expect(result.status).toBe('ACCEPTED');
  });

  it('permits a future fiscal period for a point-in-time estimate when the estimate was available by T0', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'consensus normalized EPS',
      value: 4.25,
      accountingBasis: 'CONSENSUS_NORMALIZED',
      periodEnd: '2027-12-31',
      observedAt: '2026-09-19T10:00:00Z',
      availableAt: '2026-09-19T09:00:00Z',
      decisionAsOf: '2026-09-19T12:00:00Z',
      source,
    });

    expect(result.status).toBe('ACCEPTED');
  });

  it('blocks look-ahead when the metric was not yet available at decision time', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'GAAP EPS',
      value: 2.15,
      availableAt: '2026-09-20T12:00:00Z',
      decisionAsOf: '2026-09-19T12:00:00Z',
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
      decisionAsOf: '2026-09-19T12:00:00Z',
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.reasons).toContain('SOURCE_MISSING');
  });

  it('blocks a missing metric value', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'GAAP EPS',
      value: undefined,
      availableAt: '2026-08-01T12:00:00Z',
      decisionAsOf: '2026-09-19T12:00:00Z',
      source,
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.reasons).toContain('METRIC_VALUE_MISSING');
  });

  it('blocks a missing availableAt timestamp', () => {
    const result = validateMetricEvidenceIntegrity({
      metricName: 'GAAP EPS',
      value: 2.15,
      decisionAsOf: '2026-09-19T12:00:00Z',
      source,
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.reasons).toContain('AVAILABLE_AT_MISSING');
  });
});
