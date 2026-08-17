export type EProofStage = 'DEMAND' | 'CAPTURE' | 'CONVERSION' | 'FCF' | 'ROIC';

export type FalsifierCategory =
  | 'TECHNOLOGICAL_DISRUPTION'
  | 'FRAUD_GOVERNANCE'
  | 'MATERIAL_REGULATION'
  | 'FINANCIAL_DETERIORATION'
  | 'DESTRUCTIVE_CAPITAL_ALLOCATION'
  | 'MOAT_LOSS';

export type FalsifierState = 'CLEAR' | 'WATCH' | 'CONFIRMED';

export interface EconomicProofInput {
  demand: number;
  capture: number;
  conversion: number;
  fcf: number;
  roic: number;
}

export interface InvestmentStructureInput {
  eRating: number;
  moat: number;
  valuation: number;
  expectedReturn3to6Y: number;
}

export interface FalsifierEvidence {
  category: FalsifierCategory;
  state: FalsifierState;
  evidence?: string[];
}

export interface AtlasEconomicDecisionInput {
  economicProof: EconomicProofInput;
  investment: InvestmentStructureInput;
  falsifiers: FalsifierEvidence[];
}

export interface AtlasEconomicDecision {
  eProofScore: number;
  expectedReturn3to6Y: number;
  veto: boolean;
  confirmedFalsifiers: FalsifierCategory[];
  status: 'VETO' | 'ELIGIBLE_FOR_PORTFOLIO_DECISION';
}

const clamp100 = (value: number) => Math.max(0, Math.min(100, value));

/**
 * ECONOMIC THROUGHPUT GATE Ω
 * Demand -> Capture -> Conversion -> FCF -> ROIC.
 * A weak link limits economic proof; activity or utilization alone is not proof.
 */
export function economicThroughputGateOmega(input: EconomicProofInput): number {
  const stages = [input.demand, input.capture, input.conversion, input.fcf, input.roic].map(clamp100);
  const bottleneck = Math.min(...stages);
  const average = stages.reduce((sum, value) => sum + value, 0) / stages.length;
  return Number((0.6 * bottleneck + 0.4 * average).toFixed(2));
}

/**
 * FALSIFIERS Ω — independent absolute veto.
 * This function never derives its state from E-Proof, valuation, price or expected return.
 */
export function falsifierVetoOmega(falsifiers: FalsifierEvidence[]) {
  const confirmed = falsifiers
    .filter((item) => item.state === 'CONFIRMED')
    .map((item) => item.category);

  return {
    veto: confirmed.length > 0,
    confirmed,
  } as const;
}

/**
 * Canonical three-layer protocol.
 * Layer 1: economic capture.
 * Layer 2: investment structure / expected return.
 * Layer 3: independent falsifier veto, which can invalidate any result above.
 */
export function atlasEconomicDecisionOmega(input: AtlasEconomicDecisionInput): AtlasEconomicDecision {
  const eProofScore = economicThroughputGateOmega(input.economicProof);
  const falsifier = falsifierVetoOmega(input.falsifiers);

  return {
    eProofScore,
    expectedReturn3to6Y: input.investment.expectedReturn3to6Y,
    veto: falsifier.veto,
    confirmedFalsifiers: [...falsifier.confirmed],
    status: falsifier.veto ? 'VETO' : 'ELIGIBLE_FOR_PORTFOLIO_DECISION',
  };
}

export const ECONOMIC_THROUGHPUT_FALSIFIER_OMEGA_CANON = {
  version: '2026-08-17-v1.0',
  layer1: ['DEMAND', 'CAPTURE', 'CONVERSION', 'FCF', 'ROIC'],
  layer2: ['E_RATING', 'MOAT', 'VALUATION', 'EXPECTED_RETURN_3_6Y'],
  layer3IndependentVeto: [
    'TECHNOLOGICAL_DISRUPTION',
    'FRAUD_GOVERNANCE',
    'MATERIAL_REGULATION',
    'FINANCIAL_DETERIORATION',
    'DESTRUCTIVE_CAPITAL_ALLOCATION',
    'MOAT_LOSS',
  ],
  invariants: [
    'E-Proof cannot override a confirmed falsifier.',
    'Expected Return cannot override a confirmed falsifier.',
    'A company may be E5 and still be vetoed.',
    'Unverified evidence remains WATCH/UNVERIFIED and cannot create a confirmed veto.',
    'Price action alone is not a structural falsifier.',
  ],
} as const;
