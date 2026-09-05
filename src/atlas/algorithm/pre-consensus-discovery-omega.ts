export const PRE_CONSENSUS_DISCOVERY_OMEGA_VERSION = '2026-09-05-v1.0.0' as const;

export const PRE_CONSENSUS_DISCOVERY_OMEGA_GOVERNANCE = {
  status: 'ACTIVE_SHADOW_OOS_REQUIRED',
  directAtlasScoreWeight: 0,
  canOverrideT0: false,
  canOverrideHardGates: false,
  canOverrideFalsifierVeto: false,
  canOverrideCapitalBlindSelection: false,
  canOverrideEndogenousN: false,
  obscurityIsNeverAlphaByItself: true,
  promotionAuthority: 'STATISTICAL_BACKTEST_FIREWALL_OMEGA_V1 + MODEL_LEARNING_GOVERNANCE_OMEGA_V1',
  inspirations: ['ASSAY_TRAJECTORY', 'STOCKSERA_ATTENTION', 'ALTERNATE_ALPHA_VALIDATION', 'QUANTAMENTAL_FEATURE_CHALLENGER', 'INSTITUTIONAL_RECOGNITION_GAP'],
} as const;

export type EvidenceState = 'CONFIRMED' | 'EVIDENCE_PENDING';
export type PreConsensusState = 'PRE_CONSENSUS_CANDIDATE' | 'EARLY_RECOGNITION' | 'CONSENSUS_SATURATED' | 'FUNDAMENTALS_INSUFFICIENT' | 'EVIDENCE_PENDING';

function finite(v: number): boolean { return Number.isFinite(v); }
function clamp(v: number, lo = 0, hi = 100): number { return Math.max(lo, Math.min(hi, v)); }

export interface FundamentalTrajectoryInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  roicDeltaPctPts: number;
  grossMarginDeltaPctPts: number;
  fcfMarginDeltaPctPts: number;
  netDebtToEbitdaDelta: number;
  dilutedSharesDeltaPct: number;
  revenueGrowthAccelerationPctPts: number;
  epsGrowthAccelerationPctPts: number;
}

export interface FundamentalTrajectoryResult {
  evidence: EvidenceState;
  score: number | null;
  improvingDimensions: number;
  deterioratingDimensions: number;
  directAtlasScoreDelta: 0;
  reasons: string[];
}

export function evaluateFundamentalTrajectory(input: FundamentalTrajectoryInput): FundamentalTrajectoryResult {
  const nums = [input.roicDeltaPctPts, input.grossMarginDeltaPctPts, input.fcfMarginDeltaPctPts, input.netDebtToEbitdaDelta,
    input.dilutedSharesDeltaPct, input.revenueGrowthAccelerationPctPts, input.epsGrowthAccelerationPctPts];
  const evidenceOk = input.evidenceTraceable && input.evidenceIds.filter(Boolean).length >= 2 && nums.every(finite);
  if (!evidenceOk) return { evidence: 'EVIDENCE_PENDING', score: null, improvingDimensions: 0, deterioratingDimensions: 0, directAtlasScoreDelta: 0, reasons: ['Trajectory requires traceable point-in-time evidence and finite comparable-period inputs.'] };

  const normalized = [
    clamp(50 + input.roicDeltaPctPts * 5),
    clamp(50 + input.grossMarginDeltaPctPts * 5),
    clamp(50 + input.fcfMarginDeltaPctPts * 5),
    clamp(50 - input.netDebtToEbitdaDelta * 15),
    clamp(50 - input.dilutedSharesDeltaPct * 3),
    clamp(50 + input.revenueGrowthAccelerationPctPts * 3),
    clamp(50 + input.epsGrowthAccelerationPctPts * 3),
  ];
  const score = normalized.reduce((a, b) => a + b, 0) / normalized.length;
  const directional = [input.roicDeltaPctPts, input.grossMarginDeltaPctPts, input.fcfMarginDeltaPctPts, -input.netDebtToEbitdaDelta,
    -input.dilutedSharesDeltaPct, input.revenueGrowthAccelerationPctPts, input.epsGrowthAccelerationPctPts];
  return {
    evidence: 'CONFIRMED', score, improvingDimensions: directional.filter(v => v > 0).length,
    deterioratingDimensions: directional.filter(v => v < 0).length, directAtlasScoreDelta: 0,
    reasons: ['Trajectory measures direction of owner economics; it does not convert improvement into canonical score points.', 'Debt reduction and per-share accretion are treated as improvements; dilution and leverage growth are deterioration.'],
  };
}

export interface RecognitionInput {
  evidenceTraceable: boolean;
  evidenceIds: string[];
  analystCoveragePercentile: number;
  newsAttentionPercentile: number;
  searchAttentionPercentile: number;
  socialAttentionPercentile: number;
  institutionalOwnershipPercentile: number;
  attentionChangePctPts90d: number;
  analystCoverageChangePctPts180d: number;
  institutionalOwnershipChangePctPts180d: number;
}

export interface RecognitionResult {
  evidence: EvidenceState;
  attentionLevel: number | null;
  institutionalRecognition: number | null;
  attentionGap: number | null;
  institutionalRecognitionGap: number | null;
  recognitionVelocity: number | null;
  directAtlasScoreDelta: 0;
  reasons: string[];
}

export function evaluateRecognition(input: RecognitionInput): RecognitionResult {
  const levels = [input.analystCoveragePercentile, input.newsAttentionPercentile, input.searchAttentionPercentile,
    input.socialAttentionPercentile, input.institutionalOwnershipPercentile];
  const changes = [input.attentionChangePctPts90d, input.analystCoverageChangePctPts180d, input.institutionalOwnershipChangePctPts180d];
  const validPercentiles = levels.every(v => finite(v) && v >= 0 && v <= 100);
  const evidenceOk = input.evidenceTraceable && input.evidenceIds.filter(Boolean).length >= 2 && validPercentiles && changes.every(finite);
  if (!evidenceOk) return { evidence: 'EVIDENCE_PENDING', attentionLevel: null, institutionalRecognition: null, attentionGap: null, institutionalRecognitionGap: null, recognitionVelocity: null, directAtlasScoreDelta: 0, reasons: ['Recognition requires traceable attention/institutional evidence normalized to comparable percentiles.'] };

  const attentionLevel = (input.analystCoveragePercentile + input.newsAttentionPercentile + input.searchAttentionPercentile + input.socialAttentionPercentile) / 4;
  const institutionalRecognition = input.institutionalOwnershipPercentile;
  const recognitionVelocity = clamp(50 + input.attentionChangePctPts90d * 2 + input.analystCoverageChangePctPts180d + input.institutionalOwnershipChangePctPts180d);
  return {
    evidence: 'CONFIRMED', attentionLevel, institutionalRecognition,
    attentionGap: 100 - attentionLevel, institutionalRecognitionGap: 100 - institutionalRecognition,
    recognitionVelocity, directAtlasScoreDelta: 0,
    reasons: ['Low attention is diagnostic opportunity only; obscurity never establishes quality or alpha.', 'Recognition velocity measures whether discovery is beginning, not whether the business is investable.'],
  };
}

export interface PreConsensusDiscoveryInput {
  qualityGatePassed: boolean;
  falsifierVetoTriggered: boolean;
  expectedReturnGatePassed: boolean;
  fundamentalTrajectory: FundamentalTrajectoryResult;
  recognition: RecognitionResult;
  expectationGapScore: number;
  catalystEvidenceScore: number;
  valuationOpportunityScore: number;
}

export interface PreConsensusDiscoveryResult {
  state: PreConsensusState;
  shadowScore: number | null;
  directAtlasScoreDelta: 0;
  eligibleForResearchPriority: boolean;
  reasons: string[];
}

export function evaluatePreConsensusDiscovery(input: PreConsensusDiscoveryInput): PreConsensusDiscoveryResult {
  if (input.fundamentalTrajectory.evidence !== 'CONFIRMED' || input.recognition.evidence !== 'CONFIRMED' ||
      ![input.expectationGapScore, input.catalystEvidenceScore, input.valuationOpportunityScore].every(v => finite(v) && v >= 0 && v <= 100)) {
    return { state: 'EVIDENCE_PENDING', shadowScore: null, directAtlasScoreDelta: 0, eligibleForResearchPriority: false, reasons: ['Fail-closed: complete trajectory, recognition, expectation, catalyst and valuation evidence is required.'] };
  }
  if (input.falsifierVetoTriggered || !input.qualityGatePassed || !input.expectedReturnGatePassed) {
    return { state: 'FUNDAMENTALS_INSUFFICIENT', shadowScore: null, directAtlasScoreDelta: 0, eligibleForResearchPriority: false, reasons: ['Attention can never rescue a failed quality, Expected Return or falsifier gate.'] };
  }

  const trajectory = input.fundamentalTrajectory.score as number;
  const attentionGap = input.recognition.attentionGap as number;
  const institutionalGap = input.recognition.institutionalRecognitionGap as number;
  const recognitionVelocity = input.recognition.recognitionVelocity as number;

  const shadowScore = 0.30 * trajectory + 0.20 * input.expectationGapScore + 0.15 * input.catalystEvidenceScore +
    0.15 * input.valuationOpportunityScore + 0.10 * attentionGap + 0.05 * institutionalGap + 0.05 * recognitionVelocity;

  let state: PreConsensusState = 'EARLY_RECOGNITION';
  if ((input.recognition.attentionLevel as number) >= 80 && (input.recognition.institutionalRecognition as number) >= 80) state = 'CONSENSUS_SATURATED';
  else if (trajectory >= 60 && input.expectationGapScore >= 55 && attentionGap >= 55 && institutionalGap >= 40) state = 'PRE_CONSENSUS_CANDIDATE';

  return {
    state, shadowScore, directAtlasScoreDelta: 0,
    eligibleForResearchPriority: state === 'PRE_CONSENSUS_CANDIDATE' || state === 'EARLY_RECOGNITION',
    reasons: [
      'Shadow score prioritizes research only and has zero canonical ATLAS score authority.',
      'Fundamental trajectory and expectation gap dominate; low recognition is a secondary amplifier, never a substitute for quality.',
      'Promotion requires out-of-sample evidence through Statistical Backtest Firewall and Model Learning Governance.',
    ],
  };
}
