import { describe, expect, it } from 'vitest';
import {
  AI_CAPEX_MARGINAL_DEMAND_DETECTOR_OMEGA,
  evaluateAiCapexMarginalDemand,
  type AiCapexMarginalDemandInput,
} from './ai-capex-marginal-demand-detector-omega';

const base = (overrides: Partial<AiCapexMarginalDemandInput> = {}): AiCapexMarginalDemandInput => ({
  evidenceTraceable: true,
  evidenceIds: ['E1', 'E2', 'E3'],
  priceBreakPersistenceWeeks: 0,
  brokenChainLayers: 0,
  negativeRelativeStrengthBreadthPct: 0,
  buyerForwardCapexDeteriorating: false,
  newOrdersDeteriorating: false,
  bookToBillBelowOne: false,
  bookingsGrowthBelowRevenueGrowth: false,
  backlogAbsoluteStrong: false,
  backlogSequentialDeteriorating: false,
  cancellationsOrDeferralsRising: false,
  leadTimesCompressing: false,
  capacityReservationsReleasing: false,
  revenueGuidanceDeteriorating: false,
  marginConversionDeteriorating: false,
  fcfDeteriorating: false,
  utilizationDeteriorating: false,
  ...overrides,
});

describe('AI CAPEX Marginal Demand Detector Omega', () => {
  it('is explicitly an E5/E6 detector with zero structural-score weight', () => {
    expect(AI_CAPEX_MARGINAL_DEMAND_DETECTOR_OMEGA.kind).toBe(
      'E5_CONTROL_E6_ASSURANCE_DETECTOR_NOT_NEW_PRIMARY_ENGINE',
    );
    expect(AI_CAPEX_MARGINAL_DEMAND_DETECTOR_OMEGA.directStructuralScoreWeight).toBe(0);
  });

  it('classifies a persistent cross-chain break without inventing fundamental failure', () => {
    const out = evaluateAiCapexMarginalDemand(base({
      priceBreakPersistenceWeeks: 12,
      brokenChainLayers: 4,
      negativeRelativeStrengthBreadthPct: 72,
    }));
    expect(out.state).toBe('PRICE_REGIME_BREAK');
    expect(out.marketRegimeBreak).toBe(true);
    expect(out.reviewAction).toBe('RF2_OPEN');
    expect(out.automaticSellAllowed).toBe(false);
  });

  it('detects the backlog lag mask when strong backlog coexists with weaker fresh flow', () => {
    const out = evaluateAiCapexMarginalDemand(base({
      priceBreakPersistenceWeeks: 12,
      brokenChainLayers: 4,
      negativeRelativeStrengthBreadthPct: 70,
      backlogAbsoluteStrong: true,
      newOrdersDeteriorating: true,
      bookToBillBelowOne: true,
      cancellationsOrDeferralsRising: true,
    }));
    expect(out.supplierOrderFlowDeteriorating).toBe(true);
    expect(out.pipelineVelocityDeteriorating).toBe(true);
    expect(out.marginalDemandCategoryCount).toBe(2);
    expect(out.backlogLagMask).toBe(true);
    expect(out.state).toBe('BACKLOG_LAG_MASK_WARNING');
    expect(out.reviewAction).toBe('RF2_OPEN');
  });

  it('does not let record backlog veto deterioration across all marginal-demand categories', () => {
    const out = evaluateAiCapexMarginalDemand(base({
      backlogAbsoluteStrong: true,
      buyerForwardCapexDeteriorating: true,
      newOrdersDeteriorating: true,
      backlogSequentialDeteriorating: true,
    }));
    expect(out.marginalDemandCategoryCount).toBe(3);
    expect(out.state).toBe('MARGINAL_DEMAND_DETERIORATING');
    expect(out.reviewAction).toBe('RF2_OPEN');
    expect(out.automaticSellAllowed).toBe(false);
  });

  it('requires downstream propagation before confirming a fundamental break', () => {
    const notYet = evaluateAiCapexMarginalDemand(base({
      buyerForwardCapexDeteriorating: true,
      newOrdersDeteriorating: true,
      backlogSequentialDeteriorating: true,
      revenueGuidanceDeteriorating: true,
    }));
    expect(notYet.state).toBe('MARGINAL_DEMAND_DETERIORATING');

    const confirmed = evaluateAiCapexMarginalDemand(base({
      buyerForwardCapexDeteriorating: true,
      newOrdersDeteriorating: true,
      backlogSequentialDeteriorating: true,
      revenueGuidanceDeteriorating: true,
      fcfDeteriorating: true,
    }));
    expect(confirmed.state).toBe('FUNDAMENTAL_BREAK_CONFIRMED');
    expect(confirmed.downstreamConfirmationCount).toBe(2);
    expect(confirmed.reviewAction).toBe('THESIS_AUDIT_REQUIRED');
    expect(confirmed.automaticSellAllowed).toBe(false);
  });

  it('does not double-count multiple order indicators as independent demand categories', () => {
    const out = evaluateAiCapexMarginalDemand(base({
      newOrdersDeteriorating: true,
      bookToBillBelowOne: true,
      bookingsGrowthBelowRevenueGrowth: true,
    }));
    expect(out.supplierOrderFlowDeteriorating).toBe(true);
    expect(out.marginalDemandCategoryCount).toBe(1);
    expect(out.state).toBe('MARGINAL_FLOW_WARNING');
  });

  it('treats unknown disclosures as unknown rather than negative evidence', () => {
    const out = evaluateAiCapexMarginalDemand(base({
      buyerForwardCapexDeteriorating: null,
      newOrdersDeteriorating: null,
      bookToBillBelowOne: null,
      bookingsGrowthBelowRevenueGrowth: null,
      backlogSequentialDeteriorating: null,
      cancellationsOrDeferralsRising: null,
      leadTimesCompressing: null,
      capacityReservationsReleasing: null,
      revenueGuidanceDeteriorating: null,
      marginConversionDeteriorating: null,
      fcfDeteriorating: null,
      utilizationDeteriorating: null,
    }));
    expect(out.marginalDemandCategoryCount).toBe(0);
    expect(out.state).toBe('CLEAR');
  });

  it('fails closed when no traceable evidence exists', () => {
    const out = evaluateAiCapexMarginalDemand(base({
      evidenceTraceable: false,
      evidenceIds: [],
      priceBreakPersistenceWeeks: 20,
      brokenChainLayers: 5,
      negativeRelativeStrengthBreadthPct: 90,
    }));
    expect(out.state).toBe('DATA_INSUFFICIENT');
    expect(out.evidenceGate).toBe('BLOCKED');
  });

  it('rejects impossible market breadth values', () => {
    expect(() => evaluateAiCapexMarginalDemand(base({
      negativeRelativeStrengthBreadthPct: 101,
    }))).toThrow('ai_capex_marginal_demand_invalid_metric:negativeRelativeStrengthBreadthPct');
  });
});
