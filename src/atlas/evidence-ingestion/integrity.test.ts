import {
  PHOENIX_2026_MONETARY_REGIME_PREDICTION,
  validatePredictionAttempt,
} from '../algorithm/prediction-attempt-omega';
import {
  routeEvidenceToEngines,
} from './engine';
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

  it('routes Phoenix 2026 / Big Mac monetary cover evidence into the right ATLAS engines', () => {
    const routed = routeEvidenceToEngines({
      id: 'e-phoenix-2026',
      sourceType: 'news',
      capturedAt: '2026-08-09T00:00:00Z',
      publisher: 'The Economist',
      title: 'The Global Currency Beef',
      rawHash: 'raw',
      extractedTextHash: 'text',
      extractionAdapter: 'manual',
      evidenceLevel: 3,
      epistemicClass: 'interpretation',
      relatedTickers: [],
      relatedEngines: [],
      summary: 'Big Mac Index 40 years, SDR, BRICS, dollar reserve currency, gold and oil regime stress.',
      keyClaims: [],
      limitations: [],
      mobile: { inputKind: 'manual_note', offlineReady: true, syncStatus: 'pending_sync' },
    });

    expect(routed).toEqual(expect.arrayContaining([
      'CONSPIRACIONES_ATLAS',
      'MONEY_ROTATION_OMEGA',
      'HISTORICAL_DISLOCATION_OMEGA',
    ]));
  });

  it('accepts the frozen Phoenix 2026 monetary-regime prediction attempt', () => {
    expect(validatePredictionAttempt(PHOENIX_2026_MONETARY_REGIME_PREDICTION)).toEqual([]);
  });

  it('rejects unauditable prediction attempts', () => {
    expect(validatePredictionAttempt({
      ...PHOENIX_2026_MONETARY_REGIME_PREDICTION,
      question: '',
      scenarios: [
        { id: 'only-one', label: 'Single vague scenario', probability: 90, expectedSignals: [] },
      ],
      evidenceIds: [],
      falsifiers: [],
    })).toEqual(expect.arrayContaining([
      'missing_question',
      'requires_at_least_two_scenarios',
      'probability_sum_must_equal_100:90',
      'requires_traceable_evidence',
      'requires_falsifiers',
    ]));
  });
});