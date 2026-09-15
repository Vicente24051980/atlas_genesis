export type AiCyberTrend = 'RISING' | 'FLAT' | 'FALLING' | 'UNKNOWN';
export type AiCyberSeverity = 'NONE' | 'WATCH' | 'TRIGGERED' | 'UNKNOWN';
export type AiCyberHypothesisState = 'DATA_INSUFFICIENT' | 'ACTIVE' | 'WATCH' | 'REVIEW_EXTRAORDINARY';
export type AiAntiDisruptionBand = -2 | -1 | 0 | 1 | 2;

export type AiCyberFalsifierKey =
  | 'F1_CYBER_SPEND_DIVERGES_NEGATIVELY_FROM_AI_ADOPTION'
  | 'F2_LEADER_FUNDAMENTALS_DETERIORATE_WITH_AI_ADOPTION'
  | 'F3_HYPERSCALER_SECURITY_COMMODITIZATION'
  | 'F4_AI_AUTOMATION_SAVINGS_EXCEED_NEW_SECURITY_DEMAND'
  | 'F5_VENDOR_CONSOLIDATION_HARMS_COMPANY'
  | 'F6_TAM_GROWS_BUT_COMPANY_FAILS_TO_CAPTURE';

export interface AiCyberAntiDisruptionInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  persistenceQuarters: number;
  aiAdoptionTrend?: AiCyberTrend | null;
  agentAutonomyTrend?: AiCyberTrend | null;
  machineIdentityTrend?: AiCyberTrend | null;
  attackSurfaceTrend?: AiCyberTrend | null;
  cyberSpendShareOfItTrend?: AiCyberTrend | null;
  leaderArrRpoFcfTrend?: AiCyberTrend | null;
  hyperscalerCommoditizationSeverity?: AiCyberSeverity | null;
  aiAutomationSavingsSeverity?: AiCyberSeverity | null;
  vendorConsolidationImpact?: AiCyberSeverity | null;
  companyCaptureTrend?: AiCyberTrend | null;
}

export interface AiCyberAntiDisruptionOutput {
  hypothesisState: AiCyberHypothesisState;
  evidenceGate: 'PASS' | 'BLOCKED';
  falsifiers: Record<AiCyberFalsifierKey, boolean>;
  triggeredFalsifierCount: number;
  requiresHumanThesisReview: boolean;
  directPortfolioAction: 'NONE';
  automaticTradeAllowed: false;
  reasons: string[];
}

export interface AiCyberFunctionalExposure {
  ticker: string;
  function: string;
  aiAntiDisruptionBand: readonly [AiAntiDisruptionBand, AiAntiDisruptionBand];
  status: 'WORKING_HYPOTHESIS_NOT_VALUATION_SIGNAL';
}

export const OBS_AI_CYBER_001 = {
  id: 'OBS-AI-CYBER-001',
  version: '1.0.0',
  status: 'ACTIVE_HYPOTHESIS',
  kind: 'R0_E1_STRUCTURAL_OBSERVATION_NOT_NEW_PRIMARY_ENGINE',
  authority: 'R0_E1_WITH_E5_E6_GOVERNANCE',
  thesis:
    'As AI capability and agentic adoption rise, selected cybersecurity functions may become more economically necessary because attack surface, machine identity and autonomous execution expand.',
  directStructuralScoreWeight: 0,
  automaticTradeAllowed: false,
  directPortfolioAction: 'NONE',
  antiDisruptionScale: {
    minus2: 'AI_DIRECTLY_THREATENS_FUNCTION',
    minus1: 'MATERIAL_SUBSTITUTION_RISK',
    zero: 'INDETERMINATE',
    plus1: 'AI_PARTIALLY_EXPANDS_DEMAND',
    plus2: 'AI_STRUCTURALLY_INCREASES_NECESSITY',
  },
  falsifiers: [
    'F1_CYBER_SPEND_DIVERGES_NEGATIVELY_FROM_AI_ADOPTION',
    'F2_LEADER_FUNDAMENTALS_DETERIORATE_WITH_AI_ADOPTION',
    'F3_HYPERSCALER_SECURITY_COMMODITIZATION',
    'F4_AI_AUTOMATION_SAVINGS_EXCEED_NEW_SECURITY_DEMAND',
    'F5_VENDOR_CONSOLIDATION_HARMS_COMPANY',
    'F6_TAM_GROWS_BUT_COMPANY_FAILS_TO_CAPTURE',
  ] as const,
  invariants: [
    'SECTOR_WINNER_IS_NOT_COMPANY_WINNER',
    'COMPANY_WINNER_IS_NOT_STOCK_WINNER',
    'PRICE_MOVE_IS_NOT_ECONOMIC_PROOF',
    'TAM_GROWTH_IS_NOT_CAPTURE_PROOF',
    'EXTERNAL_NARRATIVE_IS_EVIDENCE_CANDIDATE_NOT_CANONICAL_FACT',
    'ANALYSIS_IS_NOT_EXECUTION',
    'NO_AUTOMATIC_BUY_OR_SELL',
  ] as const,
} as const;

export const AI_CYBER_FUNCTIONAL_EXPOSURE_2026_09_15: readonly AiCyberFunctionalExposure[] = [
  {
    ticker: 'CRWD',
    function: 'endpoint / workload / identity / detection',
    aiAntiDisruptionBand: [2, 2],
    status: 'WORKING_HYPOTHESIS_NOT_VALUATION_SIGNAL',
  },
  {
    ticker: 'PANW',
    function: 'network / cloud / SOC / platform',
    aiAntiDisruptionBand: [2, 2],
    status: 'WORKING_HYPOTHESIS_NOT_VALUATION_SIGNAL',
  },
  {
    ticker: 'RBRK',
    function: 'data resilience / recovery / cyber survivability',
    aiAntiDisruptionBand: [2, 2],
    status: 'WORKING_HYPOTHESIS_NOT_VALUATION_SIGNAL',
  },
  {
    ticker: 'FTNT',
    function: 'network / firewall / SASE / security fabric',
    aiAntiDisruptionBand: [1, 2],
    status: 'WORKING_HYPOTHESIS_NOT_VALUATION_SIGNAL',
  },
] as const;

function rising(value?: AiCyberTrend | null): boolean {
  return value === 'RISING';
}

function falling(value?: AiCyberTrend | null): boolean {
  return value === 'FALLING';
}

function triggered(value?: AiCyberSeverity | null): boolean {
  return value === 'TRIGGERED';
}

export function evaluateAiCyberAntiDisruption(
  input: AiCyberAntiDisruptionInput,
): AiCyberAntiDisruptionOutput {
  const emptyFalsifiers: Record<AiCyberFalsifierKey, boolean> = {
    F1_CYBER_SPEND_DIVERGES_NEGATIVELY_FROM_AI_ADOPTION: false,
    F2_LEADER_FUNDAMENTALS_DETERIORATE_WITH_AI_ADOPTION: false,
    F3_HYPERSCALER_SECURITY_COMMODITIZATION: false,
    F4_AI_AUTOMATION_SAVINGS_EXCEED_NEW_SECURITY_DEMAND: false,
    F5_VENDOR_CONSOLIDATION_HARMS_COMPANY: false,
    F6_TAM_GROWS_BUT_COMPANY_FAILS_TO_CAPTURE: false,
  };

  if (!input.evidenceTraceable || input.evidenceIds.length === 0) {
    return {
      hypothesisState: 'DATA_INSUFFICIENT',
      evidenceGate: 'BLOCKED',
      falsifiers: emptyFalsifiers,
      triggeredFalsifierCount: 0,
      requiresHumanThesisReview: false,
      directPortfolioAction: 'NONE',
      automaticTradeAllowed: false,
      reasons: ['Traceable evidence is required; narrative or price action alone cannot validate or falsify the hypothesis.'],
    };
  }

  const aiExpansion = rising(input.aiAdoptionTrend) || rising(input.agentAutonomyTrend) || rising(input.machineIdentityTrend);
  const demandSurfaceExpansion = rising(input.attackSurfaceTrend) || rising(input.machineIdentityTrend);

  const falsifiers: Record<AiCyberFalsifierKey, boolean> = {
    F1_CYBER_SPEND_DIVERGES_NEGATIVELY_FROM_AI_ADOPTION:
      aiExpansion && falling(input.cyberSpendShareOfItTrend) && input.persistenceQuarters >= 2,
    F2_LEADER_FUNDAMENTALS_DETERIORATE_WITH_AI_ADOPTION:
      aiExpansion && falling(input.leaderArrRpoFcfTrend) && input.persistenceQuarters >= 2,
    F3_HYPERSCALER_SECURITY_COMMODITIZATION: triggered(input.hyperscalerCommoditizationSeverity),
    F4_AI_AUTOMATION_SAVINGS_EXCEED_NEW_SECURITY_DEMAND: triggered(input.aiAutomationSavingsSeverity),
    F5_VENDOR_CONSOLIDATION_HARMS_COMPANY: triggered(input.vendorConsolidationImpact),
    F6_TAM_GROWS_BUT_COMPANY_FAILS_TO_CAPTURE:
      demandSurfaceExpansion && falling(input.companyCaptureTrend) && input.persistenceQuarters >= 2,
  };

  const triggeredKeys = (Object.entries(falsifiers) as Array<[AiCyberFalsifierKey, boolean]>)
    .filter(([, value]) => value)
    .map(([key]) => key);
  const triggeredFalsifierCount = triggeredKeys.length;
  const reasons: string[] = [];

  if (triggeredFalsifierCount >= 2) {
    reasons.push(`Multiple independent falsifier candidates are active: ${triggeredKeys.join(', ')}.`);
    reasons.push('Open human extraordinary review; do not auto-change portfolio or thesis state.');
    return {
      hypothesisState: 'REVIEW_EXTRAORDINARY',
      evidenceGate: 'PASS',
      falsifiers,
      triggeredFalsifierCount,
      requiresHumanThesisReview: true,
      directPortfolioAction: 'NONE',
      automaticTradeAllowed: false,
      reasons,
    };
  }

  if (triggeredFalsifierCount === 1) {
    reasons.push(`One falsifier candidate is active: ${triggeredKeys[0]}.`);
    reasons.push('Keep the hypothesis under watch; one trigger does not establish falsification.');
    return {
      hypothesisState: 'WATCH',
      evidenceGate: 'PASS',
      falsifiers,
      triggeredFalsifierCount,
      requiresHumanThesisReview: false,
      directPortfolioAction: 'NONE',
      automaticTradeAllowed: false,
      reasons,
    };
  }

  reasons.push('No registered falsifier candidate is currently triggered by the supplied evidence.');
  return {
    hypothesisState: 'ACTIVE',
    evidenceGate: 'PASS',
    falsifiers,
    triggeredFalsifierCount,
    requiresHumanThesisReview: false,
    directPortfolioAction: 'NONE',
    automaticTradeAllowed: false,
    reasons,
  };
}
