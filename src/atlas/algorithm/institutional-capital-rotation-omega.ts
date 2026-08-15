import {
  INSTITUTIONAL_CAPITAL_ROTATION_MANIFEST,
  INSTITUTIONAL_FLOW_SCORE_WEIGHTS,
  assessInstitutionalRotation,
  calculateInstitutionalFlowScore,
  classifyInstitutionalFlowState,
  detectCapitalFlowDivergence,
  detectDistributionWarning,
} from '../institutional-rotation/engine';

export const INSTITUTIONAL_CAPITAL_ROTATION_OMEGA_V1 = {
  ...INSTITUTIONAL_CAPITAL_ROTATION_MANIFEST,
  scoreWeights: INSTITUTIONAL_FLOW_SCORE_WEIGHTS,
  states: [
    'NO_FLOW',
    'NEUTRAL',
    'EARLY_ROTATION',
    'INSTITUTIONAL_ACCUMULATION_PROBABLE',
    'CONFIRMED_RECEIVER',
    'STRONG_CAPITAL_ROTATION',
  ] as const,
  rules: [
    'Run independently from MONEY_ROTATION_OMEGA; neither engine overwrites the other.',
    'Use sector, subsector, factor and region as first-class rotation entities before selecting ticker beneficiaries.',
    'MARKET_CAP_CHANGE is never CAPITAL_FLOW.',
    'Price and volume may create an early warning but cannot alone produce CONFIRMED_RECEIVER.',
    'CONFIRMED_RECEIVER requires real fund/ETF flow evidence or an independent institutional positioning signal.',
    'Capital Flow Divergence Omega searches for flows and breadth improving before price confirmation.',
    'Distribution Warning Omega searches for price still rising while breadth and flows deteriorate.',
    'After sector confirmation, identify 3-5 liquid ticker beneficiaries and hand them to the relevant ATLAS selection engine.',
    'This engine emits research/rotation state only; it cannot issue a portfolio BUY or SELL order by itself.',
    'Every daily execution must compare current score/state with prior observations to measure lead/lag and detection latency.',
  ] as const,
  calculateScore: calculateInstitutionalFlowScore,
  classifyState: classifyInstitutionalFlowState,
  assess: assessInstitutionalRotation,
  detectCapitalFlowDivergence,
  detectDistributionWarning,
} as const;
