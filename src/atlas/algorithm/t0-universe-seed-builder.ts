import { classifyMarketCapBucket, evaluateT0DiscoveryGate, type T0DiscoveryCandidate, type T0MarketCapBucket } from './t0-anti-megacap-discovery-gate-omega';

export type UniverseSeedSource = 'USER_INDEX_SEED' | 'PROSPECTIVE_BROAD_DISCOVERY';

export interface SeedEntityRecord {
  economicEntityId: string;
  canonicalTicker: string;
  aliases: string[];
  rawOccurrences: number;
  source: UniverseSeedSource;
}

export interface ProspectiveUniverseRow {
  rank: number;
  ticker: string;
  discoverySource: string;
  sourceUniverseType: 'BROAD' | 'CUSTOM' | 'INDEX_ONLY';
  marketCapUsd: number | null;
  selectionReason: string;
  provenance: 'PROSPECTIVE_AUDITABLE' | 'LEGACY_UNKNOWN';
}

const ECONOMIC_ENTITY_ALIASES: Record<string, string> = {
  GOOG: 'GOOGL',
  GOOGL: 'GOOGL',
  FOX: 'FOXA',
  FOXA: 'FOXA',
  NWS: 'NWSA',
  NWSA: 'NWSA',
  'BRK.A': 'BRK.B',
  'BRK.B': 'BRK.B',
};

export function normalizeTicker(raw: string): string {
  return raw.trim().toUpperCase().replace(/,$/, '');
}

export function economicEntityId(ticker: string): string {
  const normalized = normalizeTicker(ticker);
  return ECONOMIC_ENTITY_ALIASES[normalized] ?? normalized;
}

export function parseRawSeedTickers(text: string): string[] {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .join(' ')
    .split(/\s+/)
    .map(normalizeTicker)
    .filter(Boolean);
}

export function dedupeSeedByEconomicEntity(tickers: readonly string[]): SeedEntityRecord[] {
  const byEntity = new Map<string, SeedEntityRecord>();
  for (const rawTicker of tickers) {
    const ticker = normalizeTicker(rawTicker);
    const entity = economicEntityId(ticker);
    const existing = byEntity.get(entity);
    if (existing) {
      existing.rawOccurrences += 1;
      if (!existing.aliases.includes(ticker)) existing.aliases.push(ticker);
      continue;
    }
    byEntity.set(entity, {
      economicEntityId: entity,
      canonicalTicker: entity,
      aliases: [ticker],
      rawOccurrences: 1,
      source: 'USER_INDEX_SEED',
    });
  }
  return [...byEntity.values()].sort((a, b) => a.canonicalTicker.localeCompare(b.canonicalTicker));
}

export function bucketCountsFromMarketCaps(rows: readonly ProspectiveUniverseRow[]): Record<T0MarketCapBucket, number> {
  const counts: Record<T0MarketCapBucket, number> = {
    LT_1B: 0,
    '1B_10B': 0,
    '10B_100B': 0,
    '100B_1T': 0,
    GT_1T: 0,
    UNKNOWN: 0,
  };
  for (const row of rows) counts[classifyMarketCapBucket(row.marketCapUsd)] += 1;
  return counts;
}

export function toT0Candidates(rows: readonly ProspectiveUniverseRow[]): T0DiscoveryCandidate[] {
  return rows.map((row) => ({
    ticker: row.ticker,
    discoverySource: row.discoverySource,
    sourceUniverseType: row.sourceUniverseType,
    candidateRankBeforeScore: row.rank,
    selectionReason: row.selectionReason,
    sizeInfluencedDiscovery: false,
    discoveryProvenance: row.provenance,
    marketCapUsd: row.marketCapUsd,
    analystCoverageInfluencedDiscovery: false,
    brandFamiliarityInfluencedDiscovery: false,
    rawDataAvailabilityInfluencedDiscovery: false,
  }));
}

export function auditProspectiveFirstTranche(rows: readonly ProspectiveUniverseRow[], firstTrancheSize = 10) {
  return evaluateT0DiscoveryGate(toT0Candidates(rows), 'CHALLENGER', firstTrancheSize);
}

export const T0_UNIVERSE_SEED_RULES = {
  version: '2026-09-05-v1.0.0',
  rawSeedAuthority: 'DISCOVERY_SEED_ONLY',
  indexOnlySeedDownstreamAuthorized: false,
  scoringBeforeT0Authorized: false,
  directScoreContribution: 0,
  laws: [
    'Raw Nasdaq/S&P membership is seed provenance, not discovery merit.',
    'Exact ticker duplicates collapse before analysis.',
    'Multiple listed share classes of one economic company collapse to one economic entity for portfolio selection.',
    'Off-index discovery is prospective and auditable; market cap is assigned only after discovery rank is frozen.',
    'No candidate receives points for market cap, index membership, analyst coverage, fame or data convenience.',
    'No BUY/SELL or portfolio membership decision is emitted at universe-construction stage.',
  ] as const,
} as const;
