import { ATLAS_CANONICAL_PIPELINE_V1_1 } from './evidence-integrity-omega';
import {
  ROTATION_SCORE_WEIGHTS,
  assessRotationGate,
  assertComparableFlowSeries,
  assertFlowTotalUsesOnlyAdditiveMetrics,
  calculateRotationScore,
  sumNonOverlappingFlows,
} from '../money-rotation/engine';

export const MONEY_ROTATION_OMEGA_V1_2 = {
  id: 'MONEY_ROTATION_OMEGA_V1_2',
  status: 'canonical_candidate',
  mobileFirst: true,
  mission: 'Detect early capital rotation without converting price, AUM, budgets or valuations into flows.',
  scoreWeights: ROTATION_SCORE_WEIGHTS,
  rules: [
    'Use one provider, universe, period and metric per comparable flow series.',
    'Never add market-cap changes, price returns, AUM, budgets, private valuations or physical demand to a flow total.',
    'R3 requires at least three of five core signals.',
    'R4 requires persistent positive flows plus a positive reaction to good news after destruction.',
    'R3 emits MONITOR; only confirmed R4 is promoted to the main ATLAS algorithm.',
    'Rotation evidence never emits a portfolio order by itself.',
  ] as const,
  gates: {
    comparableSeries: assertComparableFlowSeries,
    additiveTotal: assertFlowTotalUsesOnlyAdditiveMetrics,
    nonOverlappingTotal: sumNonOverlappingFlows,
    phase: assessRotationGate,
  },
  calculateScore: calculateRotationScore,
} as const;

export const ATLAS_CANONICAL_PIPELINE_V1_2 = ATLAS_CANONICAL_PIPELINE_V1_1;
