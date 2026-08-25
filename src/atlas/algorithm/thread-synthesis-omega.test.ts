import {
  calculateCycleAdjustedValuation,
  calculateEarningsDurability,
  calculateMarginalPortfolioContribution,
  calculateNormalizedOwnerEarnings,
  calculatePeakEarningsProbability,
  calculateRealExpectedReturn,
  calculateTimeInPortfolioScore,
} from './owner-economics-normalization-omega';
import {
  calculateEventPremiumRatio,
  calculateInstitutionalConsensusQuality,
  calculatePolicyEffectivenessDecay,
  evaluateFundamentalFlowDivergence,
} from './rotation-event-policy-omega';
import {
  calculateAiFundingQuality,
  calculateAiTimeToMonetization,
  calculateGoldTorque,
  calculateRefiningCaptureEfficiency,
} from './specialized-economics-omega';

describe('Thread synthesis Ω', () => {
  it('normalizes owner earnings before valuation', () => {
    const result = calculateNormalizedOwnerEarnings({
      normalizedRevenue: 1000,
      normalizedOperatingMarginPct: 20,
      cashTaxRatePct: 20,
      maintenanceCapex: 30,
      normalizedWorkingCapitalInvestment: 10,
      dilutedShares: 10,
    });
    expect(result.normalizedOwnerEarnings).toBe(120);
    expect(result.normalizedOwnerEarningsPerShare).toBe(12);
  });

  it('disables spot multiples when peak-earnings probability is high', () => {
    const result = calculatePeakEarningsProbability({ marginZ: 2, spreadZ: 2, roicZ: 1.5, fcfMarginZ: 1.5, utilizationGapZ: 1.5, commodityGapZ: 1.5 });
    expect(result.disableSpotMultiples).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('uses normalized cash flow for cycle-adjusted valuation', () => {
    const result = calculateCycleAdjustedValuation({ marketCap: 1000, normalizedEarnings: 100, normalizedFcf: 80 });
    expect(result.cycleAdjustedPE).toBe(10);
    expect(result.normalizedFcfYieldPct).toBe(8);
  });

  it('converts nominal return to real expected return geometrically', () => {
    expect(calculateRealExpectedReturn(12, 3)).toBeCloseTo(8.7379, 3);
  });

  it('requires portfolio contribution after duplication and friction', () => {
    const result = calculateMarginalPortfolioContribution({ expectedReturnPct: 15, proofScore: 80, riskPenaltyPct: 2, factorDuplicationPenaltyPct: 2, diversificationBenefitPct: 1, taxAndTurnoverFrictionPct: 1 });
    expect(result).toBe(8);
  });

  it('keeps durable earnings bounded', () => {
    const score = calculateEarningsDurability({ recurrence: 90, switchingCosts: 80, pricingPower: 80, secularDemand: 90, competitivePosition: 85, cyclicality: 20, disruptionRisk: 20, customerConcentration: 20 });
    expect(score).toBeGreaterThan(75);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('classifies strong fundamentals with weak flow as divergence, not thesis failure', () => {
    const result = evaluateFundamentalFlowDivergence({ fundamentalScore: 90, capitalFlowScore: 25, valuationMarginOfSafetyScore: 60, proofPersistenceScore: 90 });
    expect(result.state).toBe('PROOF_UP_FLOW_DOWN');
    expect(result.opportunityScore).toBeGreaterThan(0);
  });

  it('does not let lagged institutional positioning masquerade as current flow', () => {
    const result = calculateInstitutionalConsensusQuality({ hedgeFundBreadth: 80, mutualFundBreadth: 80, persistenceScore: 80, capitalScaleScore: 90, fundamentalAlignmentScore: 90, crowdingPenalty: 20, valuationPenalty: 20, observationLagDays: 45, currentFlowIndependentlyVerified: false });
    expect(result.currentFlowConfirmed).toBe(false);
    expect(result.lagPenalty).toBeGreaterThan(0);
  });

  it('measures policy-impact decay', () => {
    expect(calculatePolicyEffectivenessDecay(20, 5)).toBe(25);
  });

  it('measures event premium relative to historical moves', () => {
    expect(calculateEventPremiumRatio(6.1, 4)).toBeCloseTo(1.525, 3);
  });

  it('normalizes refinery capture and gold torque', () => {
    expect(calculateRefiningCaptureEfficiency(24, 30)).toBeCloseTo(0.8, 4);
    expect(calculateGoldTorque(4000, 4400, 1600)).toBeGreaterThan(1);
  });

  it('requires AI owner economics to clear funding costs', () => {
    const result = calculateAiFundingQuality({ incrementalAiFcf: 30, incrementalAiCapex: 100, incrementalInterest: 5, economicDilutionCost: 0, incrementalAiNopat: 20, incrementalAiInvestedCapital: 100, marginalWaccPct: 9 });
    expect(result.incrementalAiRoicPct).toBe(20);
    expect(result.aiEconomicSpreadPct).toBe(11);
    expect(calculateAiTimeToMonetization(100, 25)).toBe(4);
  });

  it('classifies durable compounders as long-duration portfolio greens', () => {
    const result = calculateTimeInPortfolioScore({
      earningsDurabilityScore: 92,
      forwardMoatScore: 90,
      reinvestmentRunwayScore: 88,
      perShareEconomicsScore: 90,
      balanceSheetResilienceScore: 95,
      valuationSurvivabilityScore: 82,
      eventDependencyScore: 15,
      cyclicalDependencyScore: 15,
    });
    expect(result.state).toBe('GREEN_LONG_DURATION');
    expect(result.score).toBeGreaterThanOrEqual(85);
  });
});
