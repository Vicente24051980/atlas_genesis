import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
    assert.throws(() => assertMoneyRotationSemantics({
      metric: 'MARKET_CAP_CHANGE', value: -1.5e12, unit: 'USD', currency: 'USD', asOf: '2026-08-09', sourceEvidenceId: 'e1',
    }), /money_rotation_non_flow_metric:MARKET_CAP_CHANGE/);
  });

  it('accepts explicit ETF net flow', () => {
    assert.doesNotThrow(() => assertMoneyRotationSemantics({
      metric: 'ETF_NET_FLOW', value: 1.44e9, unit: 'USD', currency: 'USD', asOf: '2026-08-05', sourceEvidenceId: 'e2',
    }));
  });

  it('deduplicates claims in the same causal cluster', () => {
    assert.equal(independentSignalCount([
      { ...baseClaim, id: 'c1', eventClusterId: 'google-ai-reorg' },
      { ...baseClaim, id: 'c2', eventClusterId: 'google-ai-reorg' },
    ]), 1);
  });

  it('degrades REDUCE to WATCH without confirmed falsifier', () => {
    assert.equal(decisionSafetyGate({ requestedAction: 'REDUCE', claims: [baseClaim], confirmedThesisFalsifier: false, falsifierEvidenceIds: [] }).action, 'WATCH');
  });

  it('quarantines conflicting equivalent quantitative observations for reconciliation', () => {
    const a = { metric: 'ETF_NET_FLOW' as const, value: 10, unit: 'USD', currency: 'USD', asOf: '2026-08-09', universe: 'XLV', sourceEvidenceId: 'e1' };
    const b = { ...a, value: 20, sourceEvidenceId: 'e2' };
    assert.equal(requiresReconciliation(a, b), true);
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

    for (const expectedEngine of [
      'CONSPIRACIONES_ATLAS',
      'MONEY_ROTATION_OMEGA',
      'HISTORICAL_DISLOCATION_OMEGA',
    ]) {
      assert.ok(routed.includes(expectedEngine as typeof routed[number]));
    }
  });

  it('routes a publication record when The Economist appears only as publisher', () => {
    const routed = routeEvidenceToEngines({
      id: 'e-economist-publisher',
      sourceType: 'news',
      capturedAt: '2026-08-09T00:00:00Z',
      publisher: 'The Economist',
      title: 'Monetary systems',
      rawHash: 'raw',
      extractedTextHash: 'text',
      extractionAdapter: 'manual',
      evidenceLevel: 3,
      epistemicClass: 'interpretation',
      relatedTickers: [],
      relatedEngines: [],
      summary: 'A publication record without cover keywords.',
      keyClaims: [],
      limitations: [],
      mobile: { inputKind: 'manual_note', offlineReady: true, syncStatus: 'pending_sync' },
    });

    assert.ok(routed.includes('CONSPIRACIONES_ATLAS'));
  });

  it('accepts the frozen Phoenix 2026 monetary-regime prediction attempt', () => {
    assert.deepEqual(validatePredictionAttempt(PHOENIX_2026_MONETARY_REGIME_PREDICTION), []);
  });

  it('rejects unauditable prediction attempts', () => {
    const violations = validatePredictionAttempt({
      ...PHOENIX_2026_MONETARY_REGIME_PREDICTION,
      question: '',
      scenarios: [
        { id: 'only-one', label: 'Single vague scenario', probability: 90, expectedSignals: [] },
      ],
      evidenceIds: [],
      falsifiers: [],
    });

    for (const expectedViolation of [
      'missing_question',
      'requires_at_least_two_scenarios',
      'probability_sum_must_equal_100:90',
      'requires_traceable_evidence',
      'requires_falsifiers',
    ]) {
      assert.ok(violations.includes(expectedViolation), `missing violation: ${expectedViolation}`);
    }
  });

  it('rejects duplicate scenarios and a review scheduled outside the horizon', () => {
    const scenario = PHOENIX_2026_MONETARY_REGIME_PREDICTION.scenarios[0];
    const violations = validatePredictionAttempt({
      ...PHOENIX_2026_MONETARY_REGIME_PREDICTION,
      nextReviewAt: '2027-01-01',
      scenarios: [
        { ...scenario, probability: 50 },
        { ...scenario, probability: 50 },
      ],
    });

    assert.ok(violations.includes('scenario_ids_must_be_unique'));
    assert.ok(violations.includes('invalid_next_review_at'));
  });
});
