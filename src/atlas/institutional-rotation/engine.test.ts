import { evaluateUniversalMarketTapeIntegrity } from '../algorithm/universal-market-tape-integrity-omega';
import {
  assessInstitutionalRotation,
  calculateInstitutionalFlowScore,
  classifyInstitutionalFlowState,
  detectCapitalFlowDivergence,
  detectDistributionWarning,
} from './engine';

const fullScore = {
  realFlows: 100,
  breadth: 100,
  relativeStrength: 100,
  persistentVolume: 100,
  leaderAccumulation: 100,
  positioningOptions: 100,
  revisionsFundamentals: 100,
  macroRegime: 100,
};

const strongEvidence = {
  realFlowEvidence: true,
  independentPositioningEvidence: true,
  breadthEvidence: true,
  persistentVolumeEvidence: true,
  relativeStrengthEvidence: true,
  revisionsOrFundamentalEvidence: true,
  macroCompatible: true,
  evidenceIds: ['lipper-weekly', 'cftc-positioning', 'breadth-feed'],
  unreconciledConflicts: 0,
};

function tape(subject = 'XLB') {
  return evaluateUniversalMarketTapeIntegrity({
    ticker: subject,
    primaryListing: 'NYSE_ARCA',
    currency: 'USD',
    quotationUnit: 'USD',
    asOfTimestamp: '2026-08-21T21:20:00+02:00',
    expectedSessionState: 'OPEN',
    observations: [{
      ticker: subject,
      primaryListing: 'NYSE_ARCA',
      currency: 'USD',
      quotationUnit: 'USD',
      observationDate: '2026-08-21',
      observationType: 'INTRADAY_SNAPSHOT',
      observationTimestamp: '2026-08-21T21:19:00+02:00',
      sessionState: 'OPEN',
      price: 100,
      sourceId: `regulated-${subject}`,
      sourceClass: 'REGULATED_FEED',
      capturedAt: '2026-08-21T21:19:10+02:00',
      corporateActionsReconciled: true,
    }],
  });
}

const verifiedMarket = { marketTapeSubject: 'XLB', marketTapeIntegrity: tape('XLB') };

describe('Institutional Capital Rotation Omega v1.1', () => {
  it('uses the canonical 25/15/15/15/10/5/10/5 score when market tape is verified', () => {
    expect(calculateInstitutionalFlowScore(fullScore)).toBe(100);
  });

  it('maps score thresholds deterministically', () => {
    expect(classifyInstitutionalFlowState(39)).toBe('NO_FLOW');
    expect(classifyInstitutionalFlowState(54)).toBe('NEUTRAL');
    expect(classifyInstitutionalFlowState(64)).toBe('EARLY_ROTATION');
    expect(classifyInstitutionalFlowState(74)).toBe('INSTITUTIONAL_ACCUMULATION_PROBABLE');
    expect(classifyInstitutionalFlowState(84)).toBe('CONFIRMED_RECEIVER');
    expect(classifyInstitutionalFlowState(85)).toBe('STRONG_CAPITAL_ROTATION');
  });

  it('cannot confirm institutional rotation from price/volume alone', () => {
    const result = assessInstitutionalRotation({
      ...verifiedMarket,
      score: fullScore,
      evidence: {
        ...strongEvidence,
        realFlowEvidence: false,
        independentPositioningEvidence: false,
      },
      priceTrend: 'UP',
      breadthTrend: 'UP',
      flowTrend: 'UNKNOWN',
    });
    expect(result.state).toBe('INSTITUTIONAL_ACCUMULATION_PROBABLE');
    expect(result.reasons).toContain('confirmed_receiver_requires_real_flow_or_independent_positioning');
  });

  it('confirms strong rotation only with independent capital evidence and multidimensional confirmation', () => {
    const result = assessInstitutionalRotation({
      ...verifiedMarket,
      score: fullScore,
      evidence: strongEvidence,
      priorScore: 79,
      priorState: 'CONFIRMED_RECEIVER',
      priceTrend: 'UP',
      breadthTrend: 'UP',
      flowTrend: 'UP',
    });
    expect(result.state).toBe('STRONG_CAPITAL_ROTATION');
    expect(result.confidence).toBe('HIGH');
    expect(result.marketTapeVerified).toBe(true);
    expect(result.deltaScore).toBe(21);
    expect(result.stateChanged).toBe(true);
  });

  it('detects pre-price capital flow divergence only with verified market tape', () => {
    const input = {
      ...verifiedMarket,
      score: fullScore,
      evidence: strongEvidence,
      priceTrend: 'FLAT' as const,
      breadthTrend: 'UP' as const,
      flowTrend: 'UP' as const,
    };
    expect(detectCapitalFlowDivergence(input)).toBe(true);
    expect(assessInstitutionalRotation(input).capitalFlowDivergence).toBe(true);
  });

  it('detects distribution only with verified market tape', () => {
    const input = {
      ...verifiedMarket,
      score: fullScore,
      evidence: strongEvidence,
      priceTrend: 'UP' as const,
      breadthTrend: 'DOWN' as const,
      flowTrend: 'DOWN' as const,
    };
    expect(detectDistributionWarning(input)).toBe(true);
    expect(assessInstitutionalRotation(input).action).toBe('AVOID_CHASING');
  });

  it('removes relative strength and price-trend signals when market tape is missing', () => {
    const input = {
      marketTapeSubject: 'XLB',
      marketTapeIntegrity: undefined,
      score: { ...fullScore, relativeStrength: 0 },
      evidence: strongEvidence,
      priceTrend: 'UP' as const,
      breadthTrend: 'DOWN' as const,
      flowTrend: 'DOWN' as const,
    };
    const result = assessInstitutionalRotation(input);
    expect(result.marketTapeVerified).toBe(false);
    expect(result.distributionWarning).toBe(false);
    expect(result.reasons).toContain('universal_market_tape_integrity_required_for_relative_strength_and_price_trend');
    expect(result.score).toBe(100);
  });

  it('rejects a PASS tape for a different subject', () => {
    const result = assessInstitutionalRotation({
      marketTapeSubject: 'XLB',
      marketTapeIntegrity: tape('XLK'),
      score: fullScore,
      evidence: strongEvidence,
      priceTrend: 'UP',
      breadthTrend: 'DOWN',
      flowTrend: 'DOWN',
    });
    expect(result.marketTapeVerified).toBe(false);
    expect(result.distributionWarning).toBe(false);
    expect(result.reasons).toContain('market_tape_subject_mismatch');
  });

  it('caps state when evidence conflicts are unresolved', () => {
    const result = assessInstitutionalRotation({
      ...verifiedMarket,
      score: fullScore,
      evidence: { ...strongEvidence, unreconciledConflicts: 1 },
    });
    expect(result.state).toBe('EARLY_ROTATION');
    expect(result.confidence).toBe('LOW');
  });
});
