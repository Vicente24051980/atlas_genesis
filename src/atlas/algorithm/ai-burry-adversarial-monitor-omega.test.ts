import { describe, expect, it } from 'vitest';
import {
  AI_BURRY_ADVERSARIAL_MONITOR_OMEGA_V1,
  evaluateAiBurryAdversarialMonitor,
  evaluateAiFundingStress,
  type AiBurryAdversarialInput,
} from './ai-burry-adversarial-monitor-omega';

const base = (overrides: Partial<AiBurryAdversarialInput> = {}): AiBurryAdversarialInput => ({
  evidenceTraceable: true,
  evidenceIds: ['E1', 'E2', 'E3'],
  persistenceQuarters: 0,
  gpuRentalPriceChangePct: 0,
  gpuRentalPriceBreadthVerified: true,
  gpuUtilizationTrend: 'STABLE_OR_RISING',
  energyBacklogTrend: 'GROWING',
  hyperscalerCapexTrend: 'GROWING_FUNDED',
  fcfCapexFunding: 'SELF_FUNDED',
  aiMonetizationTrend: 'DEMAND_OUTRUNS_PRICE_DECLINE',
  capitalEfficiencyState: 'VALUE_CREATION',
  gpuEconomicLifeYears: 5,
  impairmentTrend: 'NORMAL',
  ...overrides,
});

describe('AI Burry Adversarial Monitor Omega', () => {
  it('has zero structural-score weight and cannot trade automatically', () => {
    expect(AI_BURRY_ADVERSARIAL_MONITOR_OMEGA_V1.directStructuralScoreWeight).toBe(0);
    expect(AI_BURRY_ADVERSARIAL_MONITOR_OMEGA_V1.emitsAutomaticTrade).toBe(false);
  });

  it('fails closed when evidence is not traceable', () => {
    const out = evaluateAiBurryAdversarialMonitor(base({
      evidenceTraceable: false,
      evidenceIds: [],
      gpuUtilizationTrend: 'PERSISTENT_DECLINE',
      hyperscalerCapexTrend: 'GENERALIZED_CUTS',
      capitalEfficiencyState: 'VALUE_DESTRUCTION',
      persistenceQuarters: 4,
    }));

    expect(out.state).toBe('DATA_INSUFFICIENT');
    expect(out.thesisState).toBe('ACTIVE');
    expect(out.evidenceGate).toBe('BLOCKED');
    expect(out.automaticTradeAllowed).toBe(false);
  });

  it('does not treat one severe GPU rental-price drop as thesis falsification', () => {
    const out = evaluateAiBurryAdversarialMonitor(base({
      gpuRentalPriceChangePct: -45,
      persistenceQuarters: 3,
    }));

    expect(out.signals.GPU_RENTAL_PRICE).toBe('RED');
    expect(out.redSignalCount).toBe(1);
    expect(out.state).toBe('WATCH');
    expect(out.thesisState).toBe('ACTIVE');
    expect(out.reviewAction).toBe('RF2_OPEN');
  });

  it('requires cross-channel breadth before classifying GPU rental-price deterioration', () => {
    const out = evaluateAiBurryAdversarialMonitor(base({
      gpuRentalPriceChangePct: -60,
      gpuRentalPriceBreadthVerified: false,
    }));

    expect(out.signals.GPU_RENTAL_PRICE).toBe('UNKNOWN');
    expect(out.redSignalCount).toBe(0);
  });

  it('blocks extraordinary review when 3 RED signals do not include a core signal', () => {
    const out = evaluateAiBurryAdversarialMonitor(base({
      persistenceQuarters: 3,
      gpuRentalPriceChangePct: -45,
      energyBacklogTrend: 'CANCELLATIONS_OR_DECLINE',
      gpuEconomicLifeYears: 2.5,
    }));

    expect(out.redSignalCount).toBe(3);
    expect(out.coreRedSignalCount).toBe(0);
    expect(out.state).toBe('WATCH');
    expect(out.thesisState).toBe('ACTIVE');
  });

  it('blocks extraordinary review until composite deterioration persists for 2 quarters', () => {
    const out = evaluateAiBurryAdversarialMonitor(base({
      persistenceQuarters: 1,
      gpuUtilizationTrend: 'PERSISTENT_DECLINE',
      hyperscalerCapexTrend: 'GENERALIZED_CUTS',
      capitalEfficiencyState: 'VALUE_DESTRUCTION',
      aiMonetizationTrend: 'DETERIORATING',
    }));

    expect(out.redSignalCount).toBe(3);
    expect(out.coreRedSignalCount).toBe(3);
    expect(out.persistenceSatisfied).toBe(false);
    expect(out.state).toBe('WATCH');
    expect(out.thesisState).toBe('ACTIVE');
  });

  it('opens extraordinary thesis review only after 3+ RED signals, a core RED and 2-quarter persistence', () => {
    const out = evaluateAiBurryAdversarialMonitor(base({
      persistenceQuarters: 2,
      gpuUtilizationTrend: 'PERSISTENT_DECLINE',
      hyperscalerCapexTrend: 'GENERALIZED_CUTS',
      capitalEfficiencyState: 'VALUE_DESTRUCTION',
      aiMonetizationTrend: 'DETERIORATING',
    }));

    expect(out.redSignalCount).toBe(3);
    expect(out.coreRedSignalCount).toBe(3);
    expect(out.state).toBe('COMPOSITE_FALSIFIER_TRIGGERED');
    expect(out.thesisState).toBe('REVIEW_EXTRAORDINARY');
    expect(out.reviewAction).toBe('THESIS_AUDIT_REQUIRED');
    expect(out.automaticTradeAllowed).toBe(false);
  });

  it('reuses the existing capital-efficiency state inside ROI/monetization instead of duplicating ROIC logic', () => {
    const out = evaluateAiBurryAdversarialMonitor(base({
      capitalEfficiencyState: 'VALUE_DESTRUCTION',
      aiMonetizationTrend: 'UNKNOWN',
    }));

    expect(out.signals.ROI_MONETIZATION).toBe('RED');
  });

  it('maps 5+ year verified GPU economic life to GREEN and <=3 years to RED', () => {
    expect(evaluateAiBurryAdversarialMonitor(base({ gpuEconomicLifeYears: 5 })).signals.GPU_ECONOMIC_LIFE).toBe('GREEN');
    expect(evaluateAiBurryAdversarialMonitor(base({ gpuEconomicLifeYears: 3 })).signals.GPU_ECONOMIC_LIFE).toBe('RED');
  });

  it('rejects invalid persistence and economic-life values', () => {
    expect(() => evaluateAiBurryAdversarialMonitor(base({ persistenceQuarters: -1 }))).toThrow(
      'ai_burry_adversarial_invalid_metric:persistenceQuarters',
    );
    expect(() => evaluateAiBurryAdversarialMonitor(base({ gpuEconomicLifeYears: -0.1 }))).toThrow(
      'ai_burry_adversarial_invalid_metric:gpuEconomicLifeYears',
    );
  });
});

describe('Macro AI Funding Stress Omega', () => {
  it('keeps macro stress separate from structural falsification', () => {
    const out = evaluateAiFundingStress({
      evidenceTraceable: true,
      evidenceIds: ['UST', 'SPREADS'],
      treasury10yPct: 5.05,
      corporateSpreadTrend: 'WIDENING',
      aiInfrastructureDebtFunding: 'MIXED',
      energyCostTrend: 'RISING',
      fcfTrend: 'DETERIORATING',
    });

    expect(out.state).toBe('ELEVATED');
    expect(out.automaticTradeAllowed).toBe(false);
  });

  it('requires UST10Y >= 5% plus at least two severe companion channels for SEVERE', () => {
    const out = evaluateAiFundingStress({
      evidenceTraceable: true,
      evidenceIds: ['UST', 'SPREADS', 'FCF'],
      treasury10yPct: 5.1,
      corporateSpreadTrend: 'SHARPLY_WIDENING',
      aiInfrastructureDebtFunding: 'FCF_DOMINANT',
      energyCostTrend: 'STABLE_OR_DOWN',
      fcfTrend: 'NEGATIVE_OR_COLLAPSING',
    });

    expect(out.state).toBe('SEVERE');
    expect(out.stressPointCount).toBe(2);
  });

  it('fails closed without traceable macro evidence', () => {
    const out = evaluateAiFundingStress({
      evidenceTraceable: false,
      evidenceIds: [],
      treasury10yPct: 6,
      corporateSpreadTrend: 'SHARPLY_WIDENING',
    });

    expect(out.state).toBe('DATA_INSUFFICIENT');
  });
});
