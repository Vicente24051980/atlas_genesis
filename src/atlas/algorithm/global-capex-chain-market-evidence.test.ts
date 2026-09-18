import { describe, expect, it } from 'vitest';
import {
  evaluateChainBreadth,
  evaluateMarketEventConfounders,
  integrateGlobalCapexMarketEvidence,
  type ChainBreadthObservation,
  type ChainBreadthPolicy,
  type GlobalCapexChainResult,
} from './global-capex-chain-omega';

const policy: ChainBreadthPolicy = {
  minExcessReturnPct: 0.5,
  minLayerParticipation: 0.5,
  minIndependentLayers: 2,
  minIndependentTickers: 4,
  minMembersPerLayer: 2,
  requireRthForConfirmation: true,
};

const premarketBreadth: ChainBreadthObservation[] = [
  { symbol: 'VRT', layer: 'DATA_CENTER_PHYSICAL', returnPct: 2.4, benchmarkReturnPct: 0.6, session: 'PREMARKET', catalystScope: 'CHAIN' },
  { symbol: 'TT', layer: 'DATA_CENTER_PHYSICAL', returnPct: 1.9, benchmarkReturnPct: 0.6, session: 'PREMARKET', catalystScope: 'CHAIN' },
  { symbol: 'ANET', layer: 'NETWORKING_OPTICS', returnPct: 2.2, benchmarkReturnPct: 0.6, session: 'PREMARKET', catalystScope: 'CHAIN' },
  { symbol: 'CIEN', layer: 'NETWORKING_OPTICS', returnPct: 1.7, benchmarkReturnPct: 0.6, session: 'PREMARKET', catalystScope: 'CHAIN' },
];

describe('Global CAPEX Chain market evidence separation', () => {
  it('keeps multi-layer premarket breadth provisional until RTH revalidation', () => {
    const result = evaluateChainBreadth(premarketBreadth, policy);

    expect(result.status).toBe('PROVISIONAL_MULTI_LAYER');
    expect(result.rthRevalidationRequired).toBe(true);
    expect(result.canConfirmFundamentalBottom).toBe(false);
    expect(result.fundamentalAuthority).toBe('NONE');
  });

  it('confirms the same breadth only after RTH participation', () => {
    const rth = premarketBreadth.map((x) => ({ ...x, session: 'RTH' as const }));
    const result = evaluateChainBreadth(rth, policy);

    expect(result.status).toBe('CONFIRMED_MULTI_LAYER');
    expect(result.rthRevalidationRequired).toBe(false);
  });

  it('does not let an idiosyncratic GNRC-style jump confirm chain breadth', () => {
    const result = evaluateChainBreadth(
      [
        { symbol: 'GNRC', layer: 'POWER_EQUIPMENT', returnPct: 30, benchmarkReturnPct: 0.5, session: 'RTH', catalystScope: 'IDIOSYNCRATIC' },
        { symbol: 'ETN', layer: 'POWER_EQUIPMENT', returnPct: 0.6, benchmarkReturnPct: 0.5, session: 'RTH', catalystScope: 'NONE' },
      ],
      {
        ...policy,
        minIndependentLayers: 1,
        minIndependentTickers: 1,
        minMembersPerLayer: 1,
      },
    );

    expect(result.participatingTickers).toContain('GNRC');
    expect(result.confirmationTickers).not.toContain('GNRC');
    expect(result.idiosyncraticTickers).toContain('GNRC');
    expect(result.status).toBe('NOT_CONFIRMED');
  });

  it('normalizes broad market rallies instead of treating beta as chain confirmation', () => {
    const result = evaluateChainBreadth(
      [
        { symbol: 'VRT', layer: 'DATA_CENTER_PHYSICAL', returnPct: 3, benchmarkReturnPct: 3, session: 'RTH', catalystScope: 'MACRO' },
        { symbol: 'TT', layer: 'DATA_CENTER_PHYSICAL', returnPct: 3.1, benchmarkReturnPct: 3, session: 'RTH', catalystScope: 'MACRO' },
        { symbol: 'ANET', layer: 'NETWORKING_OPTICS', returnPct: 3.2, benchmarkReturnPct: 3, session: 'RTH', catalystScope: 'MACRO' },
        { symbol: 'CIEN', layer: 'NETWORKING_OPTICS', returnPct: 3, benchmarkReturnPct: 3, session: 'RTH', catalystScope: 'MACRO' },
      ],
      policy,
    );

    expect(result.status).toBe('NOT_CONFIRMED');
    expect(result.benchmarkNormalized).toBe(true);
    expect(result.magnitudeWeighted).toBe(false);
  });

  it('treats a FOMC plus quarterly-expiry window as heavily confounded price discovery', () => {
    const result = evaluateMarketEventConfounders([
      'FOMC_RATE_DECISION',
      'QUARTERLY_OPTIONS_EXPIRY',
    ]);

    expect(result.priceDiscoveryQuality).toBe('HEAVILY_CONFOUNDED');
    expect(result.canConfirmFloorAlone).toBe(false);
    expect(result.requiresPostEventPersistence).toBe(true);
    expect(result.authority).toBe('TIMING_CONTEXT_ONLY');
  });

  it('preserves zero decision authority when market evidence is attached to the base result', () => {
    const base: GlobalCapexChainResult = {
      ticker: 'TEST',
      edd: 3,
      role: 'PHYSICAL_INFRASTRUCTURE',
      economicMode: 'CAPTURE',
      comparisonCohort: 'SUPPLIER_CAPTURE',
      capexPositionScore: 80,
      capexConvergenceScore: 70,
      bottleneckPersistenceScore: 75,
      structuralOpportunityScore: 78,
      capexFragilityScore: 40,
      economicProofLevel: 'E3_REVENUE_MARGIN',
      evidenceGate: 'CONFIRMED',
      state: 'PRIVILEGED_CHOKEPOINT',
      action: 'ADVANCE_DEEP_RESEARCH',
      reasons: [],
      falsifiers: [],
    };

    const chainBreadth = evaluateChainBreadth(premarketBreadth, policy);
    const integrated = integrateGlobalCapexMarketEvidence(
      base,
      {
        individualPricePath: 'IMPROVING',
        relativeReturnPct: 1.2,
        chainBreadth,
        persistenceAfterOpen: 'PENDING',
        mediaLag: {
          state: 'PRICE_LEADS_MEDIA',
          authority: 'DISCOVERY_ONLY',
          canAlterEconomicProof: false,
        },
        capitalCompetitionFeedback: {
          state: 'TIGHTENING',
          source: 'MIXED',
          externalFinancingPressure: true,
          bondSupplyPressure: true,
          creditSpreadPressure: null,
          longEndYieldPressure: true,
          selfFundingAdequate: null,
          authority: 'RISK_CONTEXT_ONLY',
          canConfirmFundamentalBreak: false,
        },
        fundamentalAuthority: 'NONE',
      },
      {
        demand: 'INTACT',
        backlogOrUsage: 'INTACT',
        revenue: 'INTACT',
        margins: 'MIXED',
        fcf: 'MIXED',
        roic: 'NOT_ASSESSED',
        fundamentalBottom: 'UNCONFIRMED',
        aiCapexBreak: 'NOT_ESTABLISHED',
        pricePathAuthority: 'NONE',
      },
    );

    expect(integrated.decisionAuthority).toBe('NONE');
    expect(integrated.pricePath.fundamentalAuthority).toBe('NONE');
    expect(integrated.fundamentalPath.pricePathAuthority).toBe('NONE');
  });
});
