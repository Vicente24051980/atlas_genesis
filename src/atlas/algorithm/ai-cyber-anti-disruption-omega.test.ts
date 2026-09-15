import { describe, expect, it } from 'vitest';
import {
  AI_CYBER_FUNCTIONAL_EXPOSURE_2026_09_15,
  OBS_AI_CYBER_001,
  evaluateAiCyberAntiDisruption,
} from './ai-cyber-anti-disruption-omega';

describe('OBS-AI-CYBER-001', () => {
  it('is a structural observation with zero direct score and no trading authority', () => {
    expect(OBS_AI_CYBER_001.kind).toBe('R0_E1_STRUCTURAL_OBSERVATION_NOT_NEW_PRIMARY_ENGINE');
    expect(OBS_AI_CYBER_001.directStructuralScoreWeight).toBe(0);
    expect(OBS_AI_CYBER_001.automaticTradeAllowed).toBe(false);
    expect(OBS_AI_CYBER_001.directPortfolioAction).toBe('NONE');
  });

  it('blocks evaluation without traceable evidence', () => {
    const out = evaluateAiCyberAntiDisruption({
      evidenceTraceable: false,
      evidenceIds: [],
      persistenceQuarters: 0,
      aiAdoptionTrend: 'RISING',
      cyberSpendShareOfItTrend: 'RISING',
    });

    expect(out.hypothesisState).toBe('DATA_INSUFFICIENT');
    expect(out.evidenceGate).toBe('BLOCKED');
  });

  it('keeps the hypothesis active when AI and attack surface rise without falsifiers', () => {
    const out = evaluateAiCyberAntiDisruption({
      evidenceTraceable: true,
      evidenceIds: ['E-AI', 'E-CYBER'],
      persistenceQuarters: 2,
      aiAdoptionTrend: 'RISING',
      agentAutonomyTrend: 'RISING',
      machineIdentityTrend: 'RISING',
      attackSurfaceTrend: 'RISING',
      cyberSpendShareOfItTrend: 'RISING',
      leaderArrRpoFcfTrend: 'RISING',
      hyperscalerCommoditizationSeverity: 'NONE',
      aiAutomationSavingsSeverity: 'NONE',
      vendorConsolidationImpact: 'NONE',
      companyCaptureTrend: 'RISING',
    });

    expect(out.hypothesisState).toBe('ACTIVE');
    expect(out.triggeredFalsifierCount).toBe(0);
    expect(out.directPortfolioAction).toBe('NONE');
  });

  it('moves to watch on one falsifier candidate, not automatic falsification', () => {
    const out = evaluateAiCyberAntiDisruption({
      evidenceTraceable: true,
      evidenceIds: ['E-1'],
      persistenceQuarters: 2,
      aiAdoptionTrend: 'RISING',
      cyberSpendShareOfItTrend: 'FALLING',
    });

    expect(out.hypothesisState).toBe('WATCH');
    expect(out.triggeredFalsifierCount).toBe(1);
    expect(out.requiresHumanThesisReview).toBe(false);
  });

  it('opens extraordinary human review on multiple independent falsifier candidates', () => {
    const out = evaluateAiCyberAntiDisruption({
      evidenceTraceable: true,
      evidenceIds: ['E-1', 'E-2'],
      persistenceQuarters: 2,
      aiAdoptionTrend: 'RISING',
      cyberSpendShareOfItTrend: 'FALLING',
      leaderArrRpoFcfTrend: 'FALLING',
    });

    expect(out.hypothesisState).toBe('REVIEW_EXTRAORDINARY');
    expect(out.triggeredFalsifierCount).toBe(2);
    expect(out.requiresHumanThesisReview).toBe(true);
    expect(out.automaticTradeAllowed).toBe(false);
  });

  it('registers the four portfolio exposures only as working hypotheses, not valuation signals', () => {
    const tickers = AI_CYBER_FUNCTIONAL_EXPOSURE_2026_09_15.map((x) => x.ticker);
    expect(tickers).toEqual(['CRWD', 'PANW', 'RBRK', 'FTNT']);
    expect(AI_CYBER_FUNCTIONAL_EXPOSURE_2026_09_15.every(
      (x) => x.status === 'WORKING_HYPOTHESIS_NOT_VALUATION_SIGNAL',
    )).toBe(true);
  });
});
