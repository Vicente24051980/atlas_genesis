import { NEOCLOUD_CUSTOMER_ACCEPTANCE_GATE_OMEGA_V1 } from './neocloud-customer-acceptance-gate-omega';

export type AtlasSpecializedEngineAuthority = 'SPECIALIZED';

export interface AtlasSpecializedEngineManifest {
  id: string;
  version: string;
  authority: AtlasSpecializedEngineAuthority;
  role: string;
  emitsAutomaticTrade: false;
  states: readonly string[];
  rules: readonly string[];
}

export const AI_DEMAND_MONETIZATION_PROOF_OMEGA_V1: AtlasSpecializedEngineManifest = {
  id: 'AI_DEMAND_MONETIZATION_PROOF_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'prove whether AI usage is converting into durable paying demand and monetization before CAPEX payback is judged',
  emitsAutomaticTrade: false,
  states: [
    'D0_UNPROVEN',
    'D1_USAGE_ACCELERATION',
    'D2_DEMAND_CONFIRMED',
    'D3_MONETIZATION_CONFIRMED',
    'D4_ECONOMIC_SCALE_CONFIRMED',
    'DX_DEMAND_DETERIORATION_REVIEW',
  ],
  rules: [
    'Run rate is not TTM revenue and must always be normalized by source and period.',
    'Model usage is not economic demand unless paying or economically valuable workload evidence exists.',
    'Token/API price compression alone is neither demand deterioration nor a falsifier.',
    'Test workload volume, realized pricing, retention/backlog, gross-profit conversion and cash conversion independently.',
    'For neocloud deployments, Customer Acceptance Gate must sit between Deployment and Revenue Recognition.',
    'A single vendor cannot establish industry-wide demand proof; measure breadth across model, cloud and application layers.',
    'Secondary media can trigger research but cannot promote state without primary or strongly corroborated evidence.',
    'Feed AI CAPEX PAYBACK OMEGA with demand/utilization evidence without double-counting the same observations.',
    'Never emit an automatic BUY or SELL.',
  ],
};

export const GRID_BOTTLENECK_POWER_CAPTURE_OMEGA_V1: AtlasSpecializedEngineManifest = {
  id: 'GRID_BOTTLENECK_POWER_CAPTURE_OMEGA_V1',
  version: '1.0.0',
  authority: 'SPECIALIZED',
  role: 'verify persistent grid and power scarcity and identify economic capture across equipment, EPC, generation and utilities',
  emitsAutomaticTrade: false,
  states: [
    'G0_NORMAL',
    'G1_TIGHTENING',
    'G2_BOTTLENECK_CONFIRMED',
    'G3_CAPTURE_CONFIRMED',
    'G4_CRITICAL_SCARCITY',
    'GN_NORMALIZATION',
  ],
  rules: [
    'Queued MW is not committed MW and is never treated as firm load without stage normalization.',
    'Use the funnel requested -> study -> security posted -> agreement signed -> equipment/construction -> energized -> billed.',
    'Transformer or switchgear lead time is bottleneck evidence, not profit evidence by itself.',
    'Promote capture only when scarcity converts into backlog, pricing, margins, contracted revenue and/or FCF/ROIC.',
    'Separate equipment, EPC, generation and regulated-utility capture because their economics and risks differ.',
    'Secondary media can trigger research but primary grid-operator, regulator, company and government evidence is required for state promotion.',
    'Feed Global CAPEX Chain OMEGA and Power Owners OMEGA without replacing their independent gates.',
    'Never emit an automatic BUY or SELL.',
  ],
};

export const AI_DEMAND_AND_GRID_BOTTLENECK_ENGINES = [
  AI_DEMAND_MONETIZATION_PROOF_OMEGA_V1,
  NEOCLOUD_CUSTOMER_ACCEPTANCE_GATE_OMEGA_V1,
  GRID_BOTTLENECK_POWER_CAPTURE_OMEGA_V1,
] as const;
