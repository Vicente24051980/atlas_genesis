import {
  evaluateInsiderConviction,
  validateAICapexEvidence,
  type InsiderConvictionInput,
} from './insider-conviction-leading-indicator-omega';

const strongCase: InsiderConvictionInput = {
  ticker: 'TECH_CASE',
  asOfDate: '2026-08-23',
  evidenceTraceable: true,
  evidenceIds: ['form4-1', 'form4-2', 'form4-3'],
  verifiedOpenMarketPurchase: true,
  verifiedTransactionCount: 6,
  uniqueInsiderCount: 4,
  insiderRoles: ['CEO', 'CFO', 'DIRECTOR', 'DIRECTOR'],
  purchaseMaterialityScore: 82,
  postDrawdownContextScore: 80,
  sectorBreadthScore: 85,
  offsettingSalesRiskScore: 15,
  recencyDays: 18,
};

describe('Insider Conviction Leading Indicator Omega', () => {
  it('elevates audit priority for broad verified open-market buying but never creates BUY', () => {
    const result = evaluateInsiderConviction(strongCase);
    expect(result.evidenceGate).toBe('CONFIRMED');
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.state).toBe('HIGH_CONVICTION_LEADING');
    expect(result.action).toBe('ELEVATE_AUDIT_PRIORITY');
    expect(result.buySignal).toBe(false);
    expect(result.institutionalFlowInference).toBe('PROHIBITED_FROM_INSIDER_DATA');
  });

  it('blocks grants/exercises/non-open-market activity from producing a positive signal', () => {
    const result = evaluateInsiderConviction({
      ...strongCase,
      ticker: 'GRANT_CASE',
      verifiedOpenMarketPurchase: false,
    });
    expect(result).toMatchObject({
      evidenceGate: 'NO_QUALIFYING_PURCHASE',
      score: 0,
      state: 'NO_QUALIFYING_PURCHASE',
      action: 'NO_CHANGE',
      buySignal: false,
    });
  });

  it('fails closed when evidence is not traceable', () => {
    const result = evaluateInsiderConviction({
      ...strongCase,
      ticker: 'UNVERIFIED_CASE',
      evidenceTraceable: false,
      evidenceIds: [],
    });
    expect(result).toMatchObject({
      evidenceGate: 'DATA_INCOMPLETE',
      state: 'DATA_INCOMPLETE',
      action: 'DATA_REQUIRED',
      score: 0,
    });
  });

  it('does not infer institutional accumulation even when conviction is high', () => {
    const result = evaluateInsiderConviction(strongCase);
    expect(result.institutionalFlowInference).toBe('PROHIBITED_FROM_INSIDER_DATA');
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('cannot be used to infer institutional fund flow'),
    ]));
  });
});

describe('AI CAPEX Validation Amendment Omega', () => {
  it('downgrades AI-specific labeling when the source does not explicitly isolate AI', () => {
    const result = validateAICapexEvidence({
      reportedScope: 'AI_SPECIFIC',
      sourceExplicitlyAiSpecific: false,
      capacityDeployed: false,
      utilizationVisible: false,
      attributableRevenueVisible: false,
      marginAndCashConversionVisible: false,
      incrementalRoicPaybackVisible: false,
    });
    expect(result.normalizedScope).toBe('SCOPE_UNVERIFIED');
    expect(result.paybackState).toBe('P0_SPENDING_ONLY');
    expect(result.ownerEconomicProof).toBe(false);
  });

  it('does not promote deployment or utilization alone to owner-economic proof', () => {
    const result = validateAICapexEvidence({
      reportedScope: 'AI_SPECIFIC',
      sourceExplicitlyAiSpecific: true,
      capacityDeployed: true,
      utilizationVisible: true,
      attributableRevenueVisible: false,
      marginAndCashConversionVisible: false,
      incrementalRoicPaybackVisible: false,
    });
    expect(result.paybackState).toBe('P2_UTILIZATION_VISIBLE');
    expect(result.ownerEconomicProof).toBe(false);
  });

  it('requires full revenue, cash conversion and incremental ROIC chain for payback proof', () => {
    const result = validateAICapexEvidence({
      reportedScope: 'AI_SPECIFIC',
      sourceExplicitlyAiSpecific: true,
      capacityDeployed: true,
      utilizationVisible: true,
      attributableRevenueVisible: true,
      marginAndCashConversionVisible: true,
      incrementalRoicPaybackVisible: true,
    });
    expect(result.paybackState).toBe('P5_INCREMENTAL_ROIC_PAYBACK');
    expect(result.ownerEconomicProof).toBe(true);
  });
});
