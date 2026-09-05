import { describe, expect, it } from 'vitest';
import {
  classifyMarketCapBucket,
  evaluateT0DiscoveryGate,
  rankAfterT0,
  type T0DiscoveryCandidate,
} from './t0-anti-megacap-discovery-gate-omega';

const candidate = (
  ticker: string,
  rank: number,
  marketCapUsd: number,
  overrides: Partial<T0DiscoveryCandidate> = {},
): T0DiscoveryCandidate => ({
  ticker,
  discoverySource: 'bucket-screen',
  candidateRankBeforeSize: rank,
  selectionReason: 'economic evidence candidate',
  enteredBeforeSizeKnown: true,
  sizeInfluencedDiscovery: false,
  marketCapUsd,
  ...overrides,
});

describe('T0 Anti-Megacap Discovery Gate Ω', () => {
  it('classifies capitalization only after discovery and gives size zero score contribution', () => {
    expect(classifyMarketCapBucket(250_000_000_000)).toBe('MEGA');
    const result = evaluateT0DiscoveryGate([
      candidate('MEGA', 1, 250_000_000_000),
      candidate('MID', 2, 8_000_000_000),
      candidate('SMALL', 3, 1_000_000_000),
    ]);
    expect(result.marketCapContribution).toBe(0);
    expect(result.directScoreContribution).toBe(0);
    expect(result.state).toBe('PASS_SIZE_NEUTRAL_DISCOVERY');
  });

  it('allows a megacap to rank first after T0 when evidence is strongest', () => {
    const ranked = rankAfterT0([
      { ticker: 'SMALL', evidenceScore: 84 },
      { ticker: 'MEGA', evidenceScore: 96 },
      { ticker: 'MID', evidenceScore: 90 },
    ]);
    expect(ranked.map((row) => row.ticker)).toEqual(['MEGA', 'MID', 'SMALL']);
  });

  it('flags explicit upstream size/familiarity bias even if final scores are zeroed later', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('A', 1, 500_000_000_000, { sizeInfluencedDiscovery: true }),
      candidate('B', 2, 5_000_000_000),
      candidate('C', 3, 1_000_000_000),
    ]);
    expect(result.state).toBe('DISCOVERY_BIAS_DETECTED');
    expect(result.reasons).toContain('UPSTREAM_DISCOVERY_BIAS_PRESENT');
  });

  it('enforces the 20% first-tranche megacap ceiling in challenger discovery', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('M1', 1, 800_000_000_000),
      candidate('M2', 2, 500_000_000_000),
      candidate('M3', 3, 250_000_000_000),
      candidate('L1', 4, 50_000_000_000),
      candidate('S1', 5, 1_000_000_000),
    ], 'CHALLENGER', 5);
    expect(result.firstTrancheMegaShare).toBe(0.6);
    expect(result.state).toBe('DISCOVERY_BIAS_DETECTED');
    expect(result.reasons).toContain('FIRST_TRANCHE_MEGACAP_SHARE_ABOVE_20_PERCENT');
  });

  it('does not apply the 20% challenger ceiling as a universal portfolio penalty', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('M1', 1, 800_000_000_000),
      candidate('M2', 2, 500_000_000_000),
      candidate('M3', 3, 250_000_000_000),
      candidate('L1', 4, 50_000_000_000),
      candidate('S1', 5, 1_000_000_000),
    ], 'GENERAL', 5);
    expect(result.state).not.toBe('DISCOVERY_BIAS_DETECTED');
  });

  it('warns when discovery coverage collapses into too few capitalization buckets', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('A', 1, 40_000_000_000),
      candidate('B', 2, 30_000_000_000),
      candidate('C', 3, 20_000_000_000),
      candidate('D', 4, 15_000_000_000),
      candidate('E', 5, 12_000_000_000),
      candidate('F', 6, 11_000_000_000),
    ]);
    expect(result.state).toBe('PASS_WITH_COVERAGE_WARNING');
    expect(result.reasons).toContain('INSUFFICIENT_CAPITALIZATION_BUCKET_COVERAGE');
  });

  it('fails closed to evidence pending when there is no discovery universe', () => {
    const result = evaluateT0DiscoveryGate([]);
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.firstTrancheMegaShare).toBeNull();
  });

  it('records analyst, familiarity and raw-data discovery contamination in the audit trail', () => {
    const result = evaluateT0DiscoveryGate([
      candidate('X', 1, 100_000_000_000, {
        analystCoverageInfluencedDiscovery: true,
        brandFamiliarityInfluencedDiscovery: true,
        rawDataAvailabilityInfluencedDiscovery: true,
      }),
      candidate('Y', 2, 5_000_000_000),
    ]);
    expect(result.state).toBe('DISCOVERY_BIAS_DETECTED');
    expect(result.audit[0].discoveryBiasReasons).toEqual(expect.arrayContaining([
      'ANALYST_COVERAGE_INFLUENCED_DISCOVERY',
      'BRAND_FAMILIARITY_INFLUENCED_DISCOVERY',
      'RAW_DATA_AVAILABILITY_INFLUENCED_DISCOVERY',
    ]));
  });
});
