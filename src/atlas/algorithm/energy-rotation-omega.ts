import {
  marketTapePasses,
  type UniversalMarketTapeIntegrityResult,
} from './universal-market-tape-integrity-omega';

export type EnergyRotationPhase = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';

export type EnergyCandidate = {
  ticker: string;
  subsector: 'integrated_major' | 'ep_shale' | 'oil_services' | 'midstream_lng';
};

export const ENERGY_ROTATION_OMEGA = {
  id: 'ENERGY_ROTATION_OMEGA_V1_1',
  name: 'Energy Rotation Omega v1.1',
  status: 'canonical_candidate',
  mission:
    'Find energy companies that can keep creating FCF per share and ROIC when the commodity normalizes; do not chase sector ETF momentum.',
  constitutionalRule:
    'In commodities, Atlas must prefer value creation through normalization over peak-cycle earnings.',
  semanticGuards: [
    'MARKET_CAP_CHANGE != CAPITAL_FLOW',
    'PRICE_RETURN != CAPITAL_FLOW',
    'COMMODITY_PRICE_CHANGE != CAPITAL_FLOW',
    'AUM_CHANGE != NET_FLOW unless explicitly decomposed',
    'PRICE_REACTION_REQUIRES_UNIVERSAL_MARKET_TAPE_PASS',
  ] as const,
  aggregateReferenceSnapshot: {
    asOf: '2026-08-09',
    phase: 'R5' as EnergyRotationPhase,
    note: 'Sector-level snapshot only; must not be inherited automatically by each company and must be recalculated with fresh evidence.',
  },
  stressBrentUsdPerBarrel: [65, 70, 75] as const,
  requiredStressOutputs: [
    'fcf_per_share',
    'roic',
    'breakeven',
    'required_capex',
    'net_debt',
    'dividend_sustainability',
    'buyback_capacity',
    'tier1_inventory',
    'asset_or_well_productivity',
    'valuation_margin_of_safety',
  ] as const,
  scoreInputs: [
    'flow_score',
    'price_momentum',
    'fundamental_momentum',
    'earnings_revisions',
    'commodity_regime',
    'crowding_risk',
    'balance_quality',
    'breakeven_quality',
    'capex_productivity',
    'fcf_per_share_resilience',
    'roic_resilience',
    'capital_returns',
    'valuation',
  ] as const,
  r5ToR6Trigger: [
    'strong_price',
    'persistent_flow_deterioration',
    'falling_eps_revisions',
    'breadth_loss',
  ] as const,
  reentryTrigger: [
    'commodity_stabilization',
    'positive_4w_and_13w_flows',
    'positive_eps_revisions',
    'positive_post_earnings_reaction',
  ] as const,
  initialCandidates: [
    { ticker: 'XOM', subsector: 'integrated_major' },
    { ticker: 'CVX', subsector: 'integrated_major' },
    { ticker: 'COP', subsector: 'ep_shale' },
    { ticker: 'EOG', subsector: 'ep_shale' },
    { ticker: 'FANG', subsector: 'ep_shale' },
    { ticker: 'OXY', subsector: 'ep_shale' },
  ] satisfies EnergyCandidate[],
  pipeline: [
    'EVIDENCE_INGESTION_OMEGA_V1',
    'EVIDENCE_INTEGRITY_OMEGA_V1_1',
    'UNIVERSAL_MARKET_TAPE_INTEGRITY_OMEGA_V1_1',
    'MONEY_ROTATION_OMEGA',
    'ENERGY_ROTATION_OMEGA_V1_1',
    'CAPEX_PRODUCTIVITY_OMEGA',
    'VALUATION_OMEGA',
    'RISK_OMEGA',
    'DECISION_SAFETY_GATE_OMEGA',
    'FINAL_SCORE_OMEGA',
  ] as const,
} as const;

export function isCapitalFlowMetric(metric: string): boolean {
  return [
    'ETF_NET_FLOW',
    'MUTUAL_FUND_NET_FLOW',
    'ETF_CREATION_REDEMPTION',
    'INSTITUTIONAL_ALLOCATION_FLOW',
  ].includes(metric);
}

export function canPromoteEnergyRotation(input: {
  marketTapeSubject: string;
  marketTapeIntegrity?: UniversalMarketTapeIntegrityResult;
  positive4wFlows: boolean;
  positive13wFlows: boolean;
  positiveEpsRevisions: boolean;
  positiveBreadth: boolean;
  positivePostEarningsReaction: boolean;
}): boolean {
  const tapeVerified = Boolean(
    input.marketTapeSubject.trim() &&
    marketTapePasses(input.marketTapeIntegrity) &&
    input.marketTapeIntegrity?.selectedTicker === input.marketTapeSubject,
  );
  return (
    input.positive4wFlows &&
    input.positive13wFlows &&
    input.positiveEpsRevisions &&
    input.positiveBreadth &&
    tapeVerified &&
    input.positivePostEarningsReaction
  );
}
