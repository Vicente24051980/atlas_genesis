import {
  assertMoneyRotationSemantics,
  decisionSafetyGate,
  independentSignalCount,
  requiresReconciliation,
  type ClaimRecord,
} from './integrity';

const baseClaim: ClaimRecord = {
  id: 'c1', evidenceId: 'e1', text: 'primary claim', claimClass: 'fact', sourceLevel: 1,
  independenceScore: 1, isNewInformation: true, confirmedByPrimaryEvidenceIds: ['e1'],
};

describe('Evidence Integrity Omega v1.1', () => {
  it('rejects market-cap change as money flow', () => {
    expect(() => assertMoneyRotationSemantics({
      metric: 'MARKET_CAP_CHANGE', value: -1.5e12, unit: 'USD', currency: 'USD', asOf: '2026-08-09', sourceEvidenceId: 'e1',
    })).toThrow('money_rotation_non_flow_metric:MARKET_CAP_CHANGE');
  });

  it('accepts explicit ETF net flow', () => {
    expect(() => assertMoneyRotationSemantics({
      metric: 'ETF_NET_FLOW', value: 1.44e9, unit: 'USD', currency: 'USD', asOf: '2026-08-05', sourceEvidenceId: 'e2',
    })).not.toThrow();
  });

  it('deduplicates claims in the same causal cluster', () => {
    expect(independentSignalCount([
      { ...baseClaim, id: 'c1', eventClusterId: 'google-ai-reorg' },
      { ...baseClaim, id: 'c2', eventClusterId: 'google-ai-reorg' },
    ])).toBe(1);
  });

  it('degrades REDUCE to WATCH without confirmed falsifier', () => {
    expect(decisionSafetyGate({ requestedAction: 'REDUCE', claims: [baseClaim], confirmedThesisFalsifier: false, falsifierEvidenceIds: [] }).action).toBe('WATCH');
  });

  it('quarantines conflicting equivalent quantitative observations for reconciliation', () => {
    const a = { metric: 'ETF_NET_FLOW' as const, value: 10, unit: 'USD', currency: 'USD', asOf: '2026-08-09', universe: 'XLV', sourceEvidenceId: 'e1' };
    const b = { ...a, value: 20, sourceEvidenceId: 'e2' };
    expect(requiresReconciliation(a, b)).toBe(true);
  });
});
