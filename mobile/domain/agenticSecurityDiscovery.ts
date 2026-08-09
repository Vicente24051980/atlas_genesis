export type AgenticSecurityDimension =
  | 'DIRECT_AGENTIC_SECURITY'
  | 'AGENT_IDENTITY'
  | 'RUNTIME_TOOL_CONTROL'
  | 'ZERO_TRUST_EGRESS'
  | 'DATA_MODEL_PROTECTION'
  | 'SECRETS_PRIVILEGED_ACCESS'
  | 'AI_GATEWAY_PROMPT_SECURITY'
  | 'AGENT_OBSERVABILITY';

export type AgenticSecurityStatus = 'DISCOVER' | 'WATCH' | 'REJECT' | 'INSUFFICIENT_EVIDENCE';

export type EvidenceQuality = 'PRIMARY' | 'SECONDARY' | 'UNVERIFIED';

export interface AgenticSecurityEvidence {
  id: string;
  text: string;
  sourceUrl?: string | null;
  publishedAt?: string | null;
  quality: EvidenceQuality;
}

export interface AgenticSecurityCandidate {
  ticker: string;
  companyName?: string | null;
  evidence: AgenticSecurityEvidence[];
  listed?: boolean | null;
  commercialTraction?: number | null; // 0..100; ARR/customers/contracts evidence, if available.
  distributionStrength?: number | null; // 0..100; installed base / enterprise distribution, if available.
}

export interface AgenticSecuritySeedProfile {
  ticker: string;
  label: string;
  dimensions: Partial<Record<AgenticSecurityDimension, number>>;
}

export interface AgenticSecurityDiscoveryResult {
  ticker: string;
  status: AgenticSecurityStatus;
  capabilityScore: number;
  seedSimilarity: number;
  evidenceScore: number;
  discoveryScore: number;
  dimensions: Record<AgenticSecurityDimension, number>;
  matchedSeeds: Array<{ ticker: string; similarity: number }>;
  evidenceRefs: string[];
  flags: string[];
  nextStep: 'ATLAS_FULL_SCORER' | 'RESEARCH_QUEUE' | 'NONE';
}

const DIMENSIONS: AgenticSecurityDimension[] = [
  'DIRECT_AGENTIC_SECURITY',
  'AGENT_IDENTITY',
  'RUNTIME_TOOL_CONTROL',
  'ZERO_TRUST_EGRESS',
  'DATA_MODEL_PROTECTION',
  'SECRETS_PRIVILEGED_ACCESS',
  'AI_GATEWAY_PROMPT_SECURITY',
  'AGENT_OBSERVABILITY',
];

// Heuristic discovery priors, not certified company fundamentals. They are seeds used only
// to identify similar security capability patterns. A seed never receives BUY automatically.
export const AGENTIC_SECURITY_SEEDS: AgenticSecuritySeedProfile[] = [
  {
    ticker: 'PANW',
    label: 'agentic platform / runtime / network / data security',
    dimensions: {
      DIRECT_AGENTIC_SECURITY: 100,
      AGENT_IDENTITY: 85,
      RUNTIME_TOOL_CONTROL: 100,
      ZERO_TRUST_EGRESS: 90,
      DATA_MODEL_PROTECTION: 90,
      SECRETS_PRIVILEGED_ACCESS: 80,
      AI_GATEWAY_PROMPT_SECURITY: 95,
      AGENT_OBSERVABILITY: 95,
    },
  },
  {
    ticker: 'NET',
    label: 'network edge / zero trust / AI gateway / agent identity',
    dimensions: {
      DIRECT_AGENTIC_SECURITY: 70,
      AGENT_IDENTITY: 85,
      RUNTIME_TOOL_CONTROL: 65,
      ZERO_TRUST_EGRESS: 100,
      DATA_MODEL_PROTECTION: 70,
      SECRETS_PRIVILEGED_ACCESS: 55,
      AI_GATEWAY_PROMPT_SECURITY: 95,
      AGENT_OBSERVABILITY: 80,
    },
  },
  {
    ticker: 'CRWD',
    label: 'endpoint / identity / behavior / runtime protection',
    dimensions: {
      DIRECT_AGENTIC_SECURITY: 70,
      AGENT_IDENTITY: 90,
      RUNTIME_TOOL_CONTROL: 90,
      ZERO_TRUST_EGRESS: 65,
      DATA_MODEL_PROTECTION: 65,
      SECRETS_PRIVILEGED_ACCESS: 70,
      AI_GATEWAY_PROMPT_SECURITY: 55,
      AGENT_OBSERVABILITY: 95,
    },
  },
  {
    ticker: 'OKTA',
    label: 'identity / non-human identity / authorization',
    dimensions: {
      DIRECT_AGENTIC_SECURITY: 55,
      AGENT_IDENTITY: 100,
      RUNTIME_TOOL_CONTROL: 55,
      ZERO_TRUST_EGRESS: 65,
      DATA_MODEL_PROTECTION: 40,
      SECRETS_PRIVILEGED_ACCESS: 80,
      AI_GATEWAY_PROMPT_SECURITY: 35,
      AGENT_OBSERVABILITY: 65,
    },
  },
  {
    ticker: 'ZS',
    label: 'zero trust / workload access / egress / data controls',
    dimensions: {
      DIRECT_AGENTIC_SECURITY: 65,
      AGENT_IDENTITY: 75,
      RUNTIME_TOOL_CONTROL: 70,
      ZERO_TRUST_EGRESS: 100,
      DATA_MODEL_PROTECTION: 85,
      SECRETS_PRIVILEGED_ACCESS: 60,
      AI_GATEWAY_PROMPT_SECURITY: 75,
      AGENT_OBSERVABILITY: 85,
    },
  },
];

const KEYWORDS: Record<AgenticSecurityDimension, RegExp[]> = {
  DIRECT_AGENTIC_SECURITY: [
    /agentic security/i,
    /ai agent security/i,
    /secure ai agents?/i,
    /agent security platform/i,
    /agentic runtime security/i,
  ],
  AGENT_IDENTITY: [
    /agent identity/i,
    /non[- ]human identit/i,
    /machine identit/i,
    /workload identit/i,
    /service account/i,
    /identity for ai agents?/i,
  ],
  RUNTIME_TOOL_CONTROL: [
    /runtime secur/i,
    /tool (?:access|control|permission|governance)/i,
    /agent runtime/i,
    /sandbox/i,
    /execution polic/i,
    /mcp secur/i,
    /model context protocol/i,
  ],
  ZERO_TRUST_EGRESS: [
    /zero trust/i,
    /network egress/i,
    /egress control/i,
    /secure access service edge|sase/i,
    /microsegmentation/i,
    /network polic/i,
  ],
  DATA_MODEL_PROTECTION: [
    /model secur/i,
    /ai data secur/i,
    /data loss prevention|\bdlp\b/i,
    /vector database secur/i,
    /model theft/i,
    /training data secur/i,
    /model artifact/i,
  ],
  SECRETS_PRIVILEGED_ACCESS: [
    /secrets? management/i,
    /privileged access/i,
    /credential secur/i,
    /api key secur/i,
    /vault/i,
    /least privilege/i,
  ],
  AI_GATEWAY_PROMPT_SECURITY: [
    /ai gateway/i,
    /llm gateway/i,
    /prompt injection/i,
    /prompt secur/i,
    /model firewall/i,
    /ai firewall/i,
    /guardrails?/i,
  ],
  AGENT_OBSERVABILITY: [
    /agent observability/i,
    /ai observability/i,
    /agent monitoring/i,
    /behavior analytics/i,
    /agent trace/i,
    /tool call(?:s)? observ/i,
    /siem/i,
  ],
};

const DIMENSION_WEIGHTS: Record<AgenticSecurityDimension, number> = {
  DIRECT_AGENTIC_SECURITY: 25,
  AGENT_IDENTITY: 15,
  RUNTIME_TOOL_CONTROL: 15,
  ZERO_TRUST_EGRESS: 10,
  DATA_MODEL_PROTECTION: 10,
  SECRETS_PRIVILEGED_ACCESS: 10,
  AI_GATEWAY_PROMPT_SECURITY: 10,
  AGENT_OBSERVABILITY: 5,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function normalizedTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

function scoreEvidenceQuality(evidence: AgenticSecurityEvidence[]): number {
  if (evidence.length === 0) return 0;
  const points = evidence.map((item) => item.quality === 'PRIMARY' ? 100 : item.quality === 'SECONDARY' ? 55 : 15);
  const primaryBonus = evidence.some((item) => item.quality === 'PRIMARY') ? 10 : 0;
  return clamp(points.reduce((a, b) => a + b, 0) / points.length + primaryBonus);
}

function extractDimensions(evidence: AgenticSecurityEvidence[]): Record<AgenticSecurityDimension, number> {
  const result = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, 0])) as Record<AgenticSecurityDimension, number>;

  for (const dimension of DIMENSIONS) {
    const patterns = KEYWORDS[dimension];
    let primaryHits = 0;
    let secondaryHits = 0;
    let unverifiedHits = 0;

    for (const item of evidence) {
      if (!patterns.some((pattern) => pattern.test(item.text))) continue;
      if (item.quality === 'PRIMARY') primaryHits += 1;
      else if (item.quality === 'SECONDARY') secondaryHits += 1;
      else unverifiedHits += 1;
    }

    // Repeated marketing text cannot manufacture a perfect score. Primary evidence dominates.
    result[dimension] = clamp(
      Math.min(primaryHits, 2) * 42
      + Math.min(secondaryHits, 2) * 14
      + Math.min(unverifiedHits, 1) * 4,
    );
  }

  return result;
}

function weightedCapabilityScore(dimensions: Record<AgenticSecurityDimension, number>): number {
  const total = DIMENSIONS.reduce((sum, dimension) => sum + dimensions[dimension] * DIMENSION_WEIGHTS[dimension] / 100, 0);
  return Math.round(total);
}

function vector(profile: Partial<Record<AgenticSecurityDimension, number>>): number[] {
  return DIMENSIONS.map((dimension) => profile[dimension] ?? 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const magA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  if (magA === 0 || magB === 0) return 0;
  return clamp(dot / (magA * magB) * 100);
}

function activeDimensions(dimensions: Record<AgenticSecurityDimension, number>): number {
  return DIMENSIONS.filter((dimension) => dimensions[dimension] >= 35).length;
}

export function evaluateAgenticSecurityCandidate(
  candidate: AgenticSecurityCandidate,
  seeds: AgenticSecuritySeedProfile[] = AGENTIC_SECURITY_SEEDS,
): AgenticSecurityDiscoveryResult {
  const ticker = normalizedTicker(candidate.ticker);
  const dimensions = extractDimensions(candidate.evidence);
  const capabilityScore = weightedCapabilityScore(dimensions);
  const evidenceScore = Math.round(scoreEvidenceQuality(candidate.evidence));
  const candidateVector = vector(dimensions);
  const matchedSeeds = seeds
    .map((seed) => ({ ticker: seed.ticker, similarity: Math.round(cosineSimilarity(candidateVector, vector(seed.dimensions))) }))
    .sort((a, b) => b.similarity - a.similarity);
  const seedSimilarity = matchedSeeds[0]?.similarity ?? 0;
  const dimensionsCount = activeDimensions(dimensions);
  const flags: string[] = [];

  if (candidate.listed === false) flags.push('NOT_LISTED');
  if (!candidate.evidence.some((item) => item.quality === 'PRIMARY')) flags.push('NO_PRIMARY_EVIDENCE');
  if (dimensionsCount < 2) flags.push('INSUFFICIENT_AGENTIC_BREADTH');
  if (dimensions.DIRECT_AGENTIC_SECURITY < 35) flags.push('NO_DIRECT_AGENTIC_PRODUCT_EVIDENCE');

  const commercialTraction = clamp(candidate.commercialTraction ?? 50);
  const distributionStrength = clamp(candidate.distributionStrength ?? 50);
  const baseScore = capabilityScore * 0.55 + seedSimilarity * 0.20 + evidenceScore * 0.15 + commercialTraction * 0.05 + distributionStrength * 0.05;

  let penalty = 0;
  if (flags.includes('NO_PRIMARY_EVIDENCE')) penalty += 15;
  if (flags.includes('INSUFFICIENT_AGENTIC_BREADTH')) penalty += 15;
  if (flags.includes('NO_DIRECT_AGENTIC_PRODUCT_EVIDENCE')) penalty += 5;
  if (candidate.listed === false) penalty += 100;

  const discoveryScore = Math.round(clamp(baseScore - penalty));

  let status: AgenticSecurityStatus;
  if (candidate.evidence.length === 0 || evidenceScore < 25) status = 'INSUFFICIENT_EVIDENCE';
  else if (candidate.listed === false) status = 'REJECT';
  else if (discoveryScore >= 70 && dimensionsCount >= 3 && candidate.evidence.some((item) => item.quality === 'PRIMARY')) status = 'DISCOVER';
  else if (discoveryScore >= 50 && dimensionsCount >= 2) status = 'WATCH';
  else status = 'REJECT';

  return {
    ticker,
    status,
    capabilityScore,
    seedSimilarity,
    evidenceScore,
    discoveryScore,
    dimensions,
    matchedSeeds: matchedSeeds.slice(0, 3),
    evidenceRefs: candidate.evidence.map((item) => item.id),
    flags,
    nextStep: status === 'DISCOVER' ? 'ATLAS_FULL_SCORER' : status === 'WATCH' ? 'RESEARCH_QUEUE' : 'NONE',
  };
}

export function rankAgenticSecurityCandidates(
  candidates: AgenticSecurityCandidate[],
  seeds: AgenticSecuritySeedProfile[] = AGENTIC_SECURITY_SEEDS,
): AgenticSecurityDiscoveryResult[] {
  return candidates
    .map((candidate) => evaluateAgenticSecurityCandidate(candidate, seeds))
    .sort((a, b) => b.discoveryScore - a.discoveryScore || a.ticker.localeCompare(b.ticker));
}

// Fail-fast deterministic contract check usable by CI/runtime self-tests without a test framework.
export function agenticSecurityDiscoveryContractCheck(): void {
  const direct = evaluateAgenticSecurityCandidate({
    ticker: 'TEST',
    listed: true,
    commercialTraction: 80,
    distributionStrength: 80,
    evidence: [
      {
        id: 'primary-1',
        quality: 'PRIMARY',
        text: 'Agentic security platform with agent identity, runtime security, tool access control, AI gateway, prompt injection protection, zero trust network egress and agent observability.',
      },
      {
        id: 'primary-2',
        quality: 'PRIMARY',
        text: 'Secrets management and least privilege protect API keys and credentials used by AI agents.',
      },
    ],
  });
  if (direct.status !== 'DISCOVER') throw new Error('Agentic Security Ω contract: direct candidate must DISCOVER');
  if (direct.nextStep !== 'ATLAS_FULL_SCORER') throw new Error('Agentic Security Ω contract: DISCOVER must route to ATLAS full scorer');

  const generic = evaluateAgenticSecurityCandidate({
    ticker: 'GENERIC',
    listed: true,
    evidence: [{ id: 'generic-1', quality: 'PRIMARY', text: 'Enterprise software company reports quarterly revenue growth.' }],
  });
  if (generic.status === 'DISCOVER') throw new Error('Agentic Security Ω contract: generic SaaS cannot DISCOVER');
}
