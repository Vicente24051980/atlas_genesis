export type EventAttribution =
  | 'FUNDAMENTAL'
  | 'MACRO_RATES'
  | 'POSITIONING_VOLATILITY'
  | 'MIXED'
  | 'INSUFFICIENT_EVIDENCE';

export interface EventPricingInput {
  ticker: string;
  event: string;
  spot: number;
  impliedMovePct?: number;
  historicalAvgMovePct?: number;
  putWall?: number;
  hedgeWall?: number;
  callWall?: number;
}

export interface AiCapitalEfficiencyInput {
  aiRevenueGrowthPct?: number;
  capexGrowthPct?: number;
  fcfGrowthPct?: number;
  incrementalRevenue?: number;
  incrementalCapex?: number;
  incrementalFcf?: number;
}

export const EVENT_PRICING_OPTIONS_EXPECTATIONS_OMEGA = {
  id: 'EVENT_PRICING_OPTIONS_EXPECTATIONS_OMEGA_V1',
  version: '1.0.0',
  status: 'CANONICAL_INDEPENDENT_TACTICAL_ENGINE',
  role: 'event_expectations_and_post_event_attribution',
  independence: true,
  structuralDecisionAuthority: false,
  rules: [
    'Options positioning is tactical context, not structural business evidence.',
    'Put, hedge and call walls are not guaranteed support or resistance.',
    'A yield-driven equity rally is MARKET/VALUATION EFFECT, not automatic thesis improvement.',
    'Engine output must not overwrite GREEN CONTINUITY Ω or any independent ATLAS engine.',
  ] as const,
} as const;

export function impliedRange(input: EventPricingInput) {
  if (input.impliedMovePct == null) return null;
  const move = input.impliedMovePct / 100;
  return {
    low: input.spot * (1 - move),
    high: input.spot * (1 + move),
  };
}

export function impliedVsHistory(input: EventPricingInput) {
  if (
    input.impliedMovePct == null ||
    input.historicalAvgMovePct == null ||
    input.historicalAvgMovePct === 0
  ) return null;
  return input.impliedMovePct / input.historicalAvgMovePct;
}

export function aiCapitalEfficiencyCheckpoint(input: AiCapitalEfficiencyInput) {
  const revenuePerCapex =
    input.incrementalRevenue != null && input.incrementalCapex != null && input.incrementalCapex !== 0
      ? input.incrementalRevenue / input.incrementalCapex
      : null;
  const fcfPerCapex =
    input.incrementalFcf != null && input.incrementalCapex != null && input.incrementalCapex !== 0
      ? input.incrementalFcf / input.incrementalCapex
      : null;

  const deteriorationFlag =
    input.aiRevenueGrowthPct != null &&
    input.capexGrowthPct != null &&
    input.fcfGrowthPct != null &&
    input.capexGrowthPct > input.aiRevenueGrowthPct &&
    input.fcfGrowthPct < input.aiRevenueGrowthPct;

  return {
    revenuePerIncrementalCapex: revenuePerCapex,
    fcfPerIncrementalCapex: fcfPerCapex,
    deteriorationFlag,
    chain: 'AI_REVENUE_GROWTH -> INCREMENTAL_CAPEX -> DEPRECIATION -> FINANCING_COST -> FCF -> INCREMENTAL_ROIC',
  } as const;
}
