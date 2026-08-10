export type AICapitalEfficiencyState = 'VALUE_CREATION' | 'NEUTRAL' | 'VALUE_DESTRUCTION' | 'INSUFFICIENT_EVIDENCE';

export type AICapitalEfficiencyInput = {
  ticker: string;
  aiMaterialToThesis: boolean;
  evidenceTraceable: boolean;
  capexGrowthPct?: number;
  incrementalRevenue?: number;
  incrementalNopat?: number;
  incrementalInvestedCapital?: number;
  waccPct?: number;
  fcfPerShareGrowthPct?: number;
  netDebtToEbitda?: number;
  interestCoverage?: number;
  dilutionPct?: number;
  competitivePassThroughRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type AICapitalEfficiencyResult = {
  ticker: string;
  state: AICapitalEfficiencyState;
  marginalRoicPct: number | null;
  spreadVsWaccPct: number | null;
  decisionGate: 'PASS' | 'REVIEW' | 'BLOCK';
  reasons: string[];
};

export const AI_CAPITAL_EFFICIENCY_GATE_OMEGA = {
  id: 'AI_CAPITAL_EFFICIENCY_GATE_OMEGA_V1',
  name: 'AI Capital Efficiency Gate Ω v1.0',
  role: 'transversal_falsification_gate',
  constitutionalRule:
    'AI growth is not evidence of value creation. Incremental AI capital must earn an adequate return after CAPEX, financing, dilution and competitive pass-through.',
  requiredSequence: [
    'capex_growth',
    'incremental_revenue',
    'incremental_nopat',
    'marginal_roic',
    'wacc_comparison',
    'fcf_per_share',
    'debt_and_dilution',
    'competitive_pass_through',
  ] as const,
  monitoredGroups: {
    hyperscalers: ['MSFT', 'GOOG', 'AMZN', 'META', 'ORCL'],
    semiconductors: ['NVDA', 'AVGO', 'TSM', 'AMD', 'MU'],
    infrastructure: ['VRT', 'ETN', 'ANET', 'POWL', 'CEG'],
    software: ['NOW', 'PLTR', 'CRM', 'ADBE'],
    speculativeAi: ['IREN', 'RGTI'],
  },
} as const;

export function evaluateAICapitalEfficiency(input: AICapitalEfficiencyInput): AICapitalEfficiencyResult {
  const reasons: string[] = [];
  if (!input.aiMaterialToThesis) {
    return { ticker: input.ticker, state: 'INSUFFICIENT_EVIDENCE', marginalRoicPct: null, spreadVsWaccPct: null, decisionGate: 'REVIEW', reasons: ['AI is not material to the investment thesis; gate is not determinative.'] };
  }
  if (!input.evidenceTraceable || input.incrementalNopat == null || input.incrementalInvestedCapital == null || input.waccPct == null || input.incrementalInvestedCapital <= 0) {
    return { ticker: input.ticker, state: 'INSUFFICIENT_EVIDENCE', marginalRoicPct: null, spreadVsWaccPct: null, decisionGate: 'REVIEW', reasons: ['Traceable evidence for incremental NOPAT, invested capital and WACC is required.'] };
  }

  const marginalRoicPct = (input.incrementalNopat / input.incrementalInvestedCapital) * 100;
  const spreadVsWaccPct = marginalRoicPct - input.waccPct;
  const fcfBad = input.fcfPerShareGrowthPct != null && input.fcfPerShareGrowthPct < 0;
  const leverageBad = input.netDebtToEbitda != null && input.netDebtToEbitda > 3;
  const coverageBad = input.interestCoverage != null && input.interestCoverage < 4;
  const dilutionBad = input.dilutionPct != null && input.dilutionPct > 3;
  const passThroughBad = input.competitivePassThroughRisk === 'HIGH';

  if (spreadVsWaccPct < 0 && (fcfBad || leverageBad || coverageBad || dilutionBad || passThroughBad)) {
    reasons.push('Marginal ROIC is below WACC and at least one capital-quality falsifier is active.');
    return { ticker: input.ticker, state: 'VALUE_DESTRUCTION', marginalRoicPct, spreadVsWaccPct, decisionGate: 'BLOCK', reasons };
  }
  if (spreadVsWaccPct >= 3 && !leverageBad && !coverageBad && !dilutionBad && !fcfBad) {
    reasons.push('Marginal ROIC exceeds WACC with no active financing, dilution or FCF falsifier.');
    return { ticker: input.ticker, state: 'VALUE_CREATION', marginalRoicPct, spreadVsWaccPct, decisionGate: 'PASS', reasons };
  }
  reasons.push('Economic return is too close to the cost of capital or secondary risks require review.');
  return { ticker: input.ticker, state: 'NEUTRAL', marginalRoicPct, spreadVsWaccPct, decisionGate: 'REVIEW', reasons };
}
