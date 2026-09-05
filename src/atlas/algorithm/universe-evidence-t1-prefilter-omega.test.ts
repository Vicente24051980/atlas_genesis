import { describe, expect, it } from 'vitest';
import { evaluateT1Batch, evaluateT1UniverseEvidence, type T1UniverseEvidence } from './universe-evidence-t1-prefilter-omega';

const verified = (value: boolean) => ({ value, grade: 'VERIFIED_PRIMARY' as const, sourceId: 'filing', asOf: '2026-09-05' });
const missing = () => ({ value: null, grade: 'MISSING' as const });

const base = (ticker='TEST'): T1UniverseEvidence => ({
  ticker,
  economicEntityId: ticker,
  identityVerified: true,
  thesisIdentity: 'Explicit economic thesis',
  aiCapexLinked: false,
  goingConcernSafe: verified(true),
  positiveEconomicThroughputOrVerifiedInflection: verified(true),
  cashConversionVisible: verified(true),
  refinancingFragilityAcceptable: verified(true),
  accountingDisclosureIntegrityAcceptable: verified(true),
  marketCapUsd: 1,
  indexMembership: ['ANY'],
  currentHolding: true,
  personalCapitalEur: 100000,
});

describe('Universe Evidence Ladder + T1 Prefilter Ω', () => {
  it('preserves Point Zero and authorizes a fully evidenced survivor', () => {
    const r = evaluateT1UniverseEvidence(base());
    expect(r.state).toBe('SURVIVOR');
    expect(r.directScoreContribution).toBe(0);
    expect(r.pointZeroPreserved).toBe(true);
    expect(r.downstreamFundamentalScoringAuthorized).toBe(true);
  });

  it('treats missing evidence as pending, never as a fail or pass', () => {
    const e = base();
    e.cashConversionVisible = missing();
    const r = evaluateT1UniverseEvidence(e);
    expect(r.state).toBe('EVIDENCE_PENDING');
    expect(r.reasons).toContain('CASH_CONVERSION_EVIDENCE_MISSING');
  });

  it('does not allow proxy evidence to hard-fail or pass a gate', () => {
    const e = base();
    e.goingConcernSafe = { value: false, grade: 'PROXY' };
    const r = evaluateT1UniverseEvidence(e);
    expect(r.state).toBe('EVIDENCE_PENDING');
    expect(r.reasons).toContain('SOLVENCY_EVIDENCE_MISSING');
    expect(r.reasons).not.toContain('SOLVENCY_HARD_FAIL');
  });

  it('hard-fails only on verified adverse evidence', () => {
    const e = base();
    e.refinancingFragilityAcceptable = verified(false);
    const r = evaluateT1UniverseEvidence(e);
    expect(r.state).toBe('HARD_GATE_FAIL');
    expect(r.reasons).toContain('REFINANCING_HARD_FAIL');
  });

  it('routes AI-CAPEX-linked names through Financing Quality and Circular Demand', () => {
    const e = base('AI');
    e.aiCapexLinked = true;
    e.financingQualityCompleted = false;
    e.circularDemandCompleted = false;
    const r = evaluateT1UniverseEvidence(e);
    expect(r.state).toBe('EVIDENCE_PENDING');
    expect(r.reasons).toContain('AI_FINANCING_QUALITY_REQUIRED');
    expect(r.reasons).toContain('AI_CIRCULAR_DEMAND_REQUIRED');
  });

  it('does not use market cap, index membership, incumbent status or personal capital as gate inputs', () => {
    const a = base('A');
    const b = base('B');
    a.marketCapUsd = 100_000_000;
    a.currentHolding = false;
    a.personalCapitalEur = 0;
    a.indexMembership = [];
    b.marketCapUsd = 5_000_000_000_000;
    b.currentHolding = true;
    b.personalCapitalEur = 999999;
    b.indexMembership = ['NASDAQ100','SP500'];
    expect(evaluateT1UniverseEvidence(a).state).toBe('SURVIVOR');
    expect(evaluateT1UniverseEvidence(b).state).toBe('SURVIVOR');
  });

  it('requires verified entity and explicit thesis identity', () => {
    const e = base();
    e.identityVerified = false;
    e.thesisIdentity = null;
    const r = evaluateT1UniverseEvidence(e);
    expect(r.state).toBe('EVIDENCE_PENDING');
    expect(r.reasons).toContain('IDENTITY_NOT_VERIFIED');
    expect(r.reasons).toContain('THESIS_IDENTITY_MISSING');
  });

  it('summarizes a batch without inventing missing company evidence', () => {
    const survivor = base('S');
    const pending = base('P'); pending.accountingDisclosureIntegrityAcceptable = missing();
    const fail = base('F'); fail.goingConcernSafe = verified(false);
    const out = evaluateT1Batch([survivor,pending,fail]);
    expect(out).toMatchObject({ total:3, survivors:1, evidencePending:1, hardGateFails:1 });
  });
});
