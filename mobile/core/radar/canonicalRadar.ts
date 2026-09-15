export type RadarLane = 'MACRO' | 'IPO_2026_2027' | 'PRIVATE_WATCH' | 'EVIDENCE_ONLY';
export type RadarPriority = 'MAX' | 'HIGH' | 'MEDIUM_HIGH' | 'MEDIUM';
export type IpoLifecycle =
  | 'F0_PRIVATE_DISCOVERY'
  | 'F1_CONFIDENTIAL_FILING_REPORTED'
  | 'F2_PUBLIC_S1_AVAILABLE'
  | 'F3_PRICED'
  | 'F4_LISTED_PRICE_DISCOVERY'
  | 'F5_LOCKUP_SUPPLY_DISCOVERY'
  | 'F6_NORMALIZED_PUBLIC_COMPANY'
  | 'NOT_APPLICABLE';

export type CanonicalRadarItem = {
  id: string;
  name: string;
  lane: RadarLane;
  priority: RadarPriority;
  lifecycle: IpoLifecycle;
  state: string;
  function: string;
  investable: boolean;
  verified: string[];
  pending: string[];
  nextGate: string;
  asOf: string;
};

export const RADAR_AS_OF = '2026-09-15';

/**
 * R0 research-order data only.
 * No item in this file has capital authority, portfolio weight authority or BUY authority.
 * Sources are intentionally summarized here; the canonical evidence record lives in
 * CURRENT_CANON/2026-09-15_RADAR_IPO_PRIVATE_REGIME_OMEGA.md.
 */
export const CANONICAL_RADAR: CanonicalRadarItem[] = [
  {
    id: 'REGIME-2026-09-15',
    name: 'RISK-FREE REPRICING',
    lane: 'MACRO',
    priority: 'MAX',
    lifecycle: 'NOT_APPLICABLE',
    state: 'ACTIVE',
    function: 'Valuation context / hurdle-rate pressure',
    investable: false,
    verified: [
      'UST 10Y traded above 5% on 2026-09-15.',
      'Oil remained above $100 while markets priced a material probability of Fed tightening.',
      'Equities were pressured without evidence of systemic panic.'
    ],
    pending: [
      'Persistence of 10Y >5% across sessions.',
      'Transmission into credit spreads, estimate revisions and realized FCF.'
    ],
    nextGate: 'Raise valuation hurdle; do not convert macro repricing into an automatic SELL.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'AI-CAPEX-SLOWDOWN-WATCH-2026-09-15',
    name: 'AI CAPEX SLOWDOWN WATCH',
    lane: 'MACRO',
    priority: 'HIGH',
    lifecycle: 'NOT_APPLICABLE',
    state: 'WATCH',
    function: 'Separate safety/regulatory narrative from real spending deterioration',
    investable: false,
    verified: [
      'Investors are explicitly repricing the risk of slower AI spending after industry warnings.',
      'Current concern is concentrated in semiconductors and long-duration AI infrastructure.'
    ],
    pending: [
      'Hyperscaler project cancellations or material deferrals.',
      'Backlog, orders, RPO, utilization and FCF deterioration across the physical AI stack.'
    ],
    nextGate: 'Escalate only on economic evidence; statements alone are not a thesis falsifier.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'ANTHROPIC-PREIPO-2026',
    name: 'Anthropic',
    lane: 'IPO_2026_2027',
    priority: 'MAX',
    lifecycle: 'F1_CONFIDENTIAL_FILING_REPORTED',
    state: 'PRE_IPO_MAX_PRIORITY',
    function: 'Enterprise cognitive infrastructure / agents / coding',
    investable: false,
    verified: [
      'Reuters reports a confidential U.S. IPO filing and active preparation for a late-2026 listing.',
      'Reuters reported annualized revenue run rate above $65B by mid-2026.',
      'Financial Times reported positive adjusted operating income for a second consecutive quarter and gross margin above 80% before revenue sharing and training costs.'
    ],
    pending: [
      'Public S-1/prospectus.',
      'Audited revenue quality, customer concentration, OCF/FCF, SBC, compute commitments and dilution.',
      'Offer valuation, float, lock-up and governance.'
    ],
    nextGate: 'F2_PUBLIC_S1_AVAILABLE -> full Point Zero / reverse DCF / FRU audit. No automatic IPO buy.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'ALTERA-PREIPO-2026',
    name: 'Altera',
    lane: 'IPO_2026_2027',
    priority: 'HIGH',
    lifecycle: 'F1_CONFIDENTIAL_FILING_REPORTED',
    state: 'PRE_IPO_HIGH_PRIORITY',
    function: 'Programmable compute / FPGA / networking / inference complement',
    investable: false,
    verified: [
      'Reuters confirmed a confidential U.S. IPO filing on 2026-09-15.',
      'Silver Lake owns 51% and Intel retains 49% after the 2025 standalone transaction.',
      'Management has projected mid-20% revenue growth for 2026.'
    ],
    pending: [
      'Public S-1 and audited segment economics.',
      'Hyperscaler/customer concentration, gross margin, FCF, capex intensity and offer valuation.'
    ],
    nextGate: 'Wait for public filing; then run IPO gate and Point Zero.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'AGILITY-ROBOTICS-12M',
    name: 'Agility Robotics',
    lane: 'PRIVATE_WATCH',
    priority: 'HIGH',
    lifecycle: 'F0_PRIVATE_DISCOVERY',
    state: '12M_CANDIDATE',
    function: 'Physical AI / humanoid industrial labour',
    investable: false,
    verified: [
      'Digit 5 was unveiled on 2026-09-15.',
      'Agility reports more than 65,000 real-world operating hours for Digit 4.',
      'Agility reports more than $300M of multi-year Digit 5 orders subject to contractual milestones.',
      'Early access is expected in H1 2027 and general availability by end-2027.'
    ],
    pending: [
      'Independent renewal economics, uptime, intervention rate and cost per productive hour.',
      'Conversion of conditional orders into recognized revenue and recurring service economics.'
    ],
    nextGate: 'PROMISE -> COMMERCIAL ROBOTICS BUSINESS only after operating and unit-economic gates remain satisfied.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'OPENAI-PRIVATE-2027PLUS',
    name: 'OpenAI',
    lane: 'PRIVATE_WATCH',
    priority: 'HIGH',
    lifecycle: 'F0_PRIVATE_DISCOVERY',
    state: 'PRIVATE_2026_IPO_OFF',
    function: 'Cognitive platform / multimodal interface / agents / hardware optionality',
    investable: false,
    verified: [
      'Sam Altman said OpenAI will not pursue an IPO in 2026.',
      'OpenAI is coordinating with Anthropic and Google on AI safety discussions.'
    ],
    pending: [
      'Any verified 2027+ listing timetable.',
      'Audited economics and hardware/vision strategy disclosures.'
    ],
    nextGate: 'Keep strategic watch; do not assign a 2026 IPO window.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'TEMPORAL-PRIVATE-WATCH',
    name: 'Temporal',
    lane: 'PRIVATE_WATCH',
    priority: 'HIGH',
    lifecycle: 'F0_PRIVATE_DISCOVERY',
    state: 'PRIVATE_WATCH',
    function: 'Durable execution / orchestration infrastructure for agents and critical workflows',
    investable: false,
    verified: [
      'Temporal announced a $550M Series E at a $12.55B valuation.',
      'The company reports annualized revenue run rate above $250M and growth above 200% YoY.',
      'The company reports more than 4,300 paying customers.'
    ],
    pending: [
      'Audited revenue, retention, gross margin, FCF and customer concentration.',
      'Evidence that agentic demand remains durable rather than funding-cycle dependent.',
      'Any verified IPO filing.'
    ],
    nextGate: 'Private research only; valuation implies extreme expectations until public economics are available.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'EUCLYD-PRIVATE-WATCH',
    name: 'Euclyd',
    lane: 'PRIVATE_WATCH',
    priority: 'MEDIUM_HIGH',
    lifecycle: 'F0_PRIVATE_DISCOVERY',
    state: 'PRIVATE_WATCH_TECH_VALIDATION',
    function: 'Inference silicon / memory-bandwidth and power-efficiency architecture',
    investable: false,
    verified: [
      'Euclyd announced a Series A above €200M on 2026-09-15.',
      'Samsung is a co-lead investor and former ASML CEO Peter Wennink joined as chairman.'
    ],
    pending: [
      'Independent silicon benchmarks, tape-out/foundry evidence, customer deployments and cost-per-token economics.',
      'Commercial revenue and margin proof.'
    ],
    nextGate: 'Funding and team quality are signals, not Economic Proof. Require independent technical validation.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'EXEIN-PRIVATE-WATCH',
    name: 'Exein',
    lane: 'PRIVATE_WATCH',
    priority: 'MEDIUM_HIGH',
    lifecycle: 'F0_PRIVATE_DISCOVERY',
    state: 'PRIVATE_WATCH_PHYSICAL_CYBER',
    function: 'Embedded / physical-AI cybersecurity',
    investable: false,
    verified: [
      'Exein announced $270M of funding at a $1.7B valuation on 2026-09-15.',
      'The company describes its security layer as embedded across robots, drones, vehicles and connected machines.'
    ],
    pending: [
      'Audited ARR/revenue, retention, margins and customer concentration.',
      'Independent verification of deployment scale and attack telemetry.',
      'Any verified IPO filing.'
    ],
    nextGate: 'Track as a distinct Physical Cyber function; do not infer investability from funding valuation.',
    asOf: RADAR_AS_OF
  },
  {
    id: 'CHINA-EVIDENCE-ONLY',
    name: 'China market / China-only listings',
    lane: 'EVIDENCE_ONLY',
    priority: 'MEDIUM',
    lifecycle: 'NOT_APPLICABLE',
    state: 'NON_INVESTABLE_EVIDENCE_ONLY',
    function: 'External demand, manufacturing, supply-chain and competitive evidence',
    investable: false,
    verified: [
      'User investment-universe constraint: China is not a target investment universe.',
      'Chinese data may still be material evidence for demand affecting investable Western/global companies.'
    ],
    pending: [],
    nextGate: 'Never surface China-only securities as portfolio candidates unless the user explicitly changes the universe constraint.',
    asOf: RADAR_AS_OF
  }
];

const PRIORITY_ORDER: Record<RadarPriority, number> = { MAX: 0, HIGH: 1, MEDIUM_HIGH: 2, MEDIUM: 3 };

export function radarByLane(lane: RadarLane): CanonicalRadarItem[] {
  return CANONICAL_RADAR.filter((item) => item.lane === lane).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}
