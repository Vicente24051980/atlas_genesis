export type EProofStage = 'DEMAND' | 'BOTTLENECK' | 'BOTTLENECK_RELIEF' | 'UTILIZATION' | 'CAPTURE' | 'CONVERSION' | 'FCF' | 'ROIC';

export type FalsifierCategory =
  | 'TECHNOLOGICAL_DISRUPTION'
  | 'FRAUD_GOVERNANCE'
  | 'MATERIAL_REGULATION'
  | 'FINANCIAL_DETERIORATION'
  | 'DESTRUCTIVE_CAPITAL_ALLOCATION'
  | 'MOAT_LOSS';

export type FalsifierState = 'CLEAR' | 'WATCH' | 'CONFIRMED';

export interface BottleneckProofInput {
  bottleneckIdentification: number;
  bottleneckRelief: number;
  utilization: number;
  throughputDelta?: number;
  capacityDelta?: number;
}

export interface EconomicProofInput {
  demand: number;
  bottleneck: BottleneckProofInput;
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
  bottleneckProofScore: number;
  bottleneckReliefRatio: number | null;
  strandedCapexWatch: boolean;
  expectedReturn3to6Y: number;
  veto: boolean;
  confirmedFalsifiers: FalsifierCategory[];
  status: 'VETO' | 'ELIGIBLE_FOR_PORTFOLIO_DECISION';
}

const clamp100 = (value: number) => Math.max(0, Math.min(100, value));

/** BOTTLENECK PROOF Ω
 * Identifies whether new capacity actually relieves the system constraint.
 * Utilization is evidence only when it translates into system throughput.
 */
export function bottleneckProofOmega(input: BottleneckProofInput) {
  const identification = clamp100(input.bottleneckIdentification);
  const relief = clamp100(input.bottleneckRelief);
  const utilization = clamp100(input.utilization);
  const score = Number((0.35 * identification + 0.5 * relief + 0.15 * utilization).toFixed(2));

  const ratio = input.throughputDelta !== undefined && input.capacityDelta !== undefined && input.capacityDelta > 0
    ? Number((input.throughputDelta / input.capacityDelta).toFixed(4))
    : null;

  // High utilization/capacity expansion with weak relief or weak throughput conversion is a warning,
  // not a structural falsifier by itself.
  const strandedCapexWatch = relief < 40 || (ratio !== null && ratio < 0.35);

  return { score, bottleneckReliefRatio: ratio, strandedCapexWatch } as const;
}

/** ECONOMIC THROUGHPUT GATE Ω
 * Demand -> Bottleneck -> Bottleneck Relief -> Utilization -> Capture -> Conversion -> FCF -> ROIC.
 * A weak link limits proof. Local efficiency, activity and utilization are never sufficient proof.
 */
export function economicThroughputGateOmega(input: EconomicProofInput) {
  const bottleneck = bottleneckProofOmega(input.bottleneck);
  const stages = [input.demand, bottleneck.score, input.capture, input.conversion, input.fcf, input.roic].map(clamp100);
  const weakestLink = Math.min(...stages);
  const average = stages.reduce((sum, value) => sum + value, 0) / stages.length;
  const score = Number((0.6 * weakestLink + 0.4 * average).toFixed(2));
  return { score, ...bottleneck } as const;
}

/** FALSIFIERS Ω — independent absolute veto. */
export function falsifierVetoOmega(falsifiers: FalsifierEvidence[]) {
  const confirmed = falsifiers.filter((item) => item.state === 'CONFIRMED').map((item) => item.category);
  return { veto: confirmed.length > 0, confirmed } as const;
}

export function atlasEconomicDecisionOmega(input: AtlasEconomicDecisionInput): AtlasEconomicDecision {
  const eProof = economicThroughputGateOmega(input.economicProof);
  const falsifier = falsifierVetoOmega(input.falsifiers);
  return {
    eProofScore: eProof.score,
    bottleneckProofScore: eProof.score,
    bottleneckReliefRatio: eProof.bottleneckReliefRatio,
    strandedCapexWatch: eProof.strandedCapexWatch,
    expectedReturn3to6Y: input.investment.expectedReturn3to6Y,
    veto: falsifier.veto,
    confirmedFalsifiers: [...falsifier.confirmed],
    status: falsifier.veto ? 'VETO' : 'ELIGIBLE_FOR_PORTFOLIO_DECISION',
  };
}

export const ECONOMIC_THROUGHPUT_FALSIFIER_OMEGA_CANON = {
  version: '2026-08-17-v1.1',
  layer1: ['DEMAND', 'BOTTLENECK_IDENTIFICATION', 'BOTTLENECK_RELIEF', 'UTILIZATION', 'CAPTURE', 'CONVERSION', 'FCF', 'ROIC'],
  layer2: ['E_RATING', 'MOAT', 'VALUATION', 'EXPECTED_RETURN_3_6Y'],
  layer3IndependentVeto: ['TECHNOLOGICAL_DISRUPTION','FRAUD_GOVERNANCE','MATERIAL_REGULATION','FINANCIAL_DETERIORATION','DESTRUCTIVE_CAPITAL_ALLOCATION','MOAT_LOSS'],
  aiCapexChainExample: ['ENERGY','GRID','TRANSFORMERS','DATACENTER','GPU','HBM','NETWORK','MODEL','INFERENCE','CUSTOMER_DEMAND','MONETIZATION'],
  invariants: [
    'UTILIZATION is not PRODUCTIVITY.',
    'CAPACITY ADDED is not THROUGHPUT CREATED.',
    'Optimizing a non-bottleneck cannot be credited as economic proof without system-level throughput.',
    'Bottleneck Relief Ratio = delta economic throughput / delta capacity added when measurable.',
    'Weak Bottleneck Relief may create STRANDED_CAPEX_WATCH but is not automatically a structural falsifier.',
    'E-Proof cannot override a confirmed falsifier.',
    'Expected Return cannot override a confirmed falsifier.',
    'A company may be E5 and still be vetoed.',
    'Unverified evidence remains WATCH/UNVERIFIED and cannot create a confirmed veto.',
    'Price action alone is not a structural falsifier.',
  ],
} as const;
