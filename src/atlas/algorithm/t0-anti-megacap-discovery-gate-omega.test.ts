import { describe, expect, it } from 'vitest';
import {
  ATLAS_CANONICAL_DECISION_SEQUENCE,
  ATLAS_PRIMARY_ENGINE_HIERARCHY,
} from './atlas-primary-engine-hierarchy';
import {
  classifyMarketCapBucket,
  evaluateT0DiscoveryGate,
  rankAfterT0,
  T0_POLICY_V1_1,
  type T0DiscoveryCandidate,
} from './t0-anti-megacap-discovery-gate-omega';

const candidate = (
  ticker: string,
  rank: number,
  marketCapUsd: number | null,
  overrides: Partial<T0DiscoveryCandidate> = {},
): T0DiscoveryCandidate => ({
  ticker,
  discoverySource: 'bucket-screen',
  sourceUniverseType: 'BROAD',
  candidateRankBeforeScore: rank,
  selectionReason: 'economic evidence candidate',
  sizeInfluencedDiscovery: false,
  discoveryProvenance: 'PROSPECTIVE_AUDITABLE',
  marketCapUsd,
  ...overrides,
});

const balancedTen = (): T0DiscoveryCandidate[] => [
  candidate('A1',1,500_000_000), candidate('A2',2,800_000_000),
  candidate('B1',3,2_000_000_000), candidate('B2',4,8_000_000_000),
  candidate('C1',5,20_000_000_000), candidate('C2',6,80_000_000_000),
  candidate('D1',7,200_000_000_000), candidate('D2',8,900_000_000_000),
  candidate('E1',9,1_200_000_000_000), candidate('E2',10,2_000_000_000_000),
];

describe('T0 Anti-Megacap Discovery Gate Ω v1.1', () => {
  it('remains the constitutional first gate through the v1 compatibility alias', () => {
    expect(ATLAS_PRIMARY_ENGINE_HIERARCHY.version).toBe('2026-09-05-v4.17.0');
    expect(ATLAS_PRIMARY_ENGINE_HIERARCHY.firstConstitutionalGate)
      .toBe('T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1');
    expect(ATLAS_CANONICAL_DECISION_SEQUENCE[0]).toBe('INPUT');
    expect(ATLAS_CANONICAL_DECISION_SEQUENCE[1]).toBe('T0_ANTI_MEGACAP_DISCOVERY_GATE_OMEGA_V1');
  });

  it('uses the auditable five-bucket policy', () => {
    expect(classifyMarketCapBucket(900_000_000)).toBe('LT_1B');
    expect(classifyMarketCapBucket(5_000_000_000)).toBe('1B_10B');
    expect(classifyMarketCapBucket(50_000_000_000)).toBe('10B_100B');
    expect(classifyMarketCapBucket(500_000_000_000)).toBe('100B_1T');
    expect(classifyMarketCapBucket(1_500_000_000_000)).toBe('GT_1T');
    expect(T0_POLICY_V1_1.minimumCandidatesPerBucket).toBe(2);
  });

  it('passes a prospectively auditable balanced discovery tranche', () => {
    const result = evaluateT0DiscoveryGate(balancedTen(), 'GENERAL', 10);
    expect(result.bucketQuotaMet).toBe(true);
    expect(result.state).toBe('PASS_SIZE_NEUTRAL_DISCOVERY');
    expect(result.downstreamAuthorized).toBe(true);
    expect(result.directScoreContribution).toBe(0);
    expect(result.marketCapContribution).toBe(0);
  });

  it('blocks scoring when quota is applicable but not met', () => {
    const rows = balancedTen();
    rows[0] = candidate('D3',1,300_000_000_000);
    const result = evaluateT0DiscoveryGate(rows, 'GENERAL', 10);
    expect(result.bucketQuotaMet).toBe(false);
    expect(result.state).toBe('COVERAGE_INSUFFICIENT');
    expect(result.downstreamAuthorized).toBe(false);
    expect(result.requiredAction).toBe('EXPAND_BUCKET_COVERAGE');
  });

  it('rejects index-only discovery before consumption', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('A',1,5_000_000_000,{ sourceUniverseType: 'INDEX_ONLY' }),
      candidate('B',2,20_000_000_000),
    ]);
    expect(result.state).toBe('DISCOVERY_BIAS_DETECTED');
    expect(result.reasons).toContain('UPSTREAM_DISCOVERY_BIAS_PRESENT');
    expect(result.downstreamAuthorized).toBe(false);
  });

  it('does not pretend historical positions were discovered size-neutrally', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('NVDA',1,4_000_000_000_000,{ discoveryProvenance:'LEGACY_UNKNOWN', sizeInfluencedDiscovery:'UNKNOWN' }),
      candidate('LMB',2,5_000_000_000,{ discoveryProvenance:'LEGACY_UNKNOWN', sizeInfluencedDiscovery:'UNKNOWN' }),
    ]);
    expect(result.state).toBe('LEGACY_PROVENANCE_UNKNOWN');
    expect(result.requiredAction).toBe('NO_RETROACTIVE_CLAIM');
    expect(result.bucketQuotaMet).toBeNull();
  });

  it('allows a >1T company to rank first after T0 when evidence is strongest', () => {
    const ranked = rankAfterT0([
      { ticker: 'SMALL', evidenceScore: 84 },
      { ticker: 'MEGA', evidenceScore: 96 },
      { ticker: 'MID', evidenceScore: 90 },
    ]);
    expect(ranked.map((row) => row.ticker)).toEqual(['MEGA','MID','SMALL']);
  });

  it('keeps the challenger >1T share ceiling without making it a score penalty', () => {
    const rows = [
      candidate('M1',1,2_000_000_000_000),
      candidate('M2',2,1_500_000_000_000),
      candidate('A',3,500_000_000),
      candidate('B',4,5_000_000_000),
      candidate('C',5,50_000_000_000),
    ];
    const challenger = evaluateT0DiscoveryGate(rows,'CHALLENGER',5);
    expect(challenger.firstTrancheMegaShare).toBe(0.4);
    expect(challenger.state).toBe('DISCOVERY_BIAS_DETECTED');
    const general = evaluateT0DiscoveryGate(rows,'GENERAL',5);
    expect(general.state).not.toBe('DISCOVERY_BIAS_DETECTED');
  });

  it('fails closed when post-freeze size evidence is incomplete in challenger mode', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('X',1,null), candidate('A',2,5_000_000_000), candidate('B',3,50_000_000_000),
    ],'NO_AI',3);
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.downstreamAuthorized).toBe(false);
  });

  it('flags familiar-brand/data-availability contamination instead of silently shifting bias downstream', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('X',1,50_000_000_000,{ brandFamiliarityInfluencedDiscovery:true, rawDataAvailabilityInfluencedDiscovery:true }),
      candidate('Y',2,5_000_000_000),
    ]);
    expect(result.state).toBe('DISCOVERY_BIAS_DETECTED');
    expect(result.audit[0].discoveryBiasReasons).toEqual(expect.arrayContaining([
      'BRAND_FAMILIARITY_INFLUENCED_DISCOVERY','RAW_DATA_AVAILABILITY_INFLUENCED_DISCOVERY',
    ]));
  });
});
