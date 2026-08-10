import { ATLAS_CANONICAL_PIPELINE_V1_1 } from './evidence-integrity-omega';
import {
  MARKET_REGIME_FAMILIES,
  R3_TO_R4_TRIGGER_OMEGA,
  ROTATION_SCORE_WEIGHTS,
  assessGoldRegime,
  assessOilScenario,
  assessRotationGate,
  assertComparableFlowSeries,
  assertFlowTotalUsesOnlyAdditiveMetrics,
  calculateRotationScore,
  classifyRotationLifecycle,
  inferGoldOilRegime,
  sumNonOverlappingFlows,
} from '../money-rotation/engine';

export const MONEY_ROTATION_OMEGA_V1_3 = {
  id: 'MONEY_ROTATION_OMEGA_V1_3',
  status: 'canonical_candidate',
  mobileFirst: true,
  mission: 'Detect early capital rotation and historical dislocations before consensus without confusing price action with canonical R1-R6 phases.',
  scoreWeights: ROTATION_SCORE_WEIGHTS,
  marketRegimeFamilies: MARKET_REGIME_FAMILIES,
  r3ToR4Trigger: R3_TO_R4_TRIGGER_OMEGA,
  rules: [
    'Use one provider, universe, period and metric per comparable flow series.',
    'Never add market-cap changes, price returns, AUM, budgets, private valuations or physical demand to a flow total.',
    'Price-only momentum is a market sensor, never proof of a canonical R3 or R4 phase.',
    'R3 requires at least three of five core signals for confirmation; one or two signals remain candidate/monitor only.',
    'R4 requires persistent positive comparable flows plus a positive reaction to good news after destruction.',
    'R1 and R2 are research states only when the underlying business remains structurally intact.',
    'R5 is the handoff to the main ATLAS discovery/scoring stack; R6 represents consensus/crowding and must not be chased mechanically.',
    'Gold is split into structural and tactical signals; one cannot substitute for the other.',
    'Oil forecasts remain conditional when primary supply-demand evidence or geopolitical transmission is unresolved.',
    'The gold/oil matrix selects what to investigate; it never emits a mechanical sector trade.',
    'Rotation evidence never emits a portfolio order by itself.',
  ] as const,
  gates: {
    comparableSeries: assertComparableFlowSeries,
    additiveTotal: assertFlowTotalUsesOnlyAdditiveMetrics,
    nonOverlappingTotal: sumNonOverlappingFlows,
    phase: assessRotationGate,
    lifecycle: classifyRotationLifecycle,
  },
  macro: {
    gold: assessGoldRegime,
    oil: assessOilScenario,
    goldOilRegime: inferGoldOilRegime,
  },
  calculateScore: calculateRotationScore,
} as const;

// Compatibility alias for code that still imports the previous candidate name.
export const MONEY_ROTATION_OMEGA_V1_2 = MONEY_ROTATION_OMEGA_V1_3;

export const ATLAS_CANONICAL_PIPELINE_V1_3 = ATLAS_CANONICAL_PIPELINE_V1_1;
export const ATLAS_CANONICAL_PIPELINE_V1_2 = ATLAS_CANONICAL_PIPELINE_V1_3;
