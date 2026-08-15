import {
  calculateForwardAsymmetryScore,
  calculateMaturityPenalty,
  compareLeaderVsChallenger,
} from './leadership-bias-control-omega';

describe('Leadership Bias Control Omega v1', () => {
  it('scores a challenger without rewarding market-cap size', () => {
    expect(calculateForwardAsymmetryScore({
      forwardGrowthRunway: 90,
      incrementalRoicAndFcf: 80,
      earningsRevisionTrend: 85,
      institutionalSponsorship: 75,
      valuationAsymmetry: 70,
      competitivePosition: 80,
      consolidationAndExecutionProof: 85,
      balanceSheetAndRisk: 75,
    })).toBeGreaterThan(75);
  });

  it('penalizes mature incumbents for slowing forward economics, not for size alone', () => {
    expect(calculateMaturityPenalty({
      sizeSaturation: 60,
      multipleCompressionRisk: 50,
      growthDeceleration: 80,
      capexPaybackRisk: 40,
      crowdingAndConsensus: 70,
    })).toBeGreaterThan(50);
  });

  it('allows a challenger to compete only with material forward asymmetry and gates passed', () => {
    expect(compareLeaderVsChallenger({
      incumbentForwardScore: 82,
      incumbentMaturityPenalty: 18,
      challengerForwardScore: 78,
      challengerQualityPass: true,
      challengerRiskPass: true,
    }).decision).toBe('CHALLENGER_CAN_COMPETE_FOR_REPLACEMENT');
  });

  it('keeps incumbent when challenger fails quality/risk even if headline growth is higher', () => {
    expect(compareLeaderVsChallenger({
      incumbentForwardScore: 80,
      incumbentMaturityPenalty: 10,
      challengerForwardScore: 92,
      challengerQualityPass: false,
      challengerRiskPass: true,
    }).decision).toBe('KEEP_INCUMBENT');
  });

  it('prefers starter exposure when challenger edge is positive but not decisive', () => {
    expect(compareLeaderVsChallenger({
      incumbentForwardScore: 82,
      incumbentMaturityPenalty: 8,
      challengerForwardScore: 78,
      challengerQualityPass: true,
      challengerRiskPass: true,
    }).decision).toBe('STARTER_CHALLENGER');
  });
});
