import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  auditProspectiveFirstTranche,
  bucketCountsFromMarketCaps,
  dedupeSeedByEconomicEntity,
  economicEntityId,
  parseRawSeedTickers,
  type ProspectiveUniverseRow,
} from './t0-universe-seed-builder';

function parseExpansionCsv(text: string): ProspectiveUniverseRow[] {
  const lines = text.trim().split(/\r?\n/);
  return lines.slice(1).map((line) => {
    const [rank,ticker,discoverySource,sourceUniverseType,marketCapUsd,selectionReason,provenance] = line.split(',');
    return {
      rank: Number(rank),
      ticker,
      discoverySource,
      sourceUniverseType: sourceUniverseType as ProspectiveUniverseRow['sourceUniverseType'],
      marketCapUsd: marketCapUsd ? Number(marketCapUsd) : null,
      selectionReason,
      provenance: provenance as ProspectiveUniverseRow['provenance'],
    };
  });
}

describe('T0 Universe Seed Builder', () => {
  const raw = readFileSync('data/t0-universe-user-seed-2026-09-05.txt','utf8');
  const expansionRaw = readFileSync('data/t0-universe-prospective-expansion-2026-09-05.csv','utf8');
  const rawTickers = parseRawSeedTickers(raw);
  const entities = dedupeSeedByEconomicEntity(rawTickers);
  const expansion = parseExpansionCsv(expansionRaw);

  it('preserves a large user seed but removes exact duplicate occurrences', () => {
    expect(rawTickers.length).toBeGreaterThan(500);
    expect(entities.length).toBeLessThan(rawTickers.length);
    expect(entities.find((x) => x.canonicalTicker === 'NVDA')?.rawOccurrences).toBeGreaterThan(1);
  });

  it('collapses dual share classes to one economic entity', () => {
    expect(economicEntityId('GOOG')).toBe('GOOGL');
    expect(economicEntityId('GOOGL')).toBe('GOOGL');
    expect(economicEntityId('FOX')).toBe('FOXA');
    expect(economicEntityId('NWS')).toBe('NWSA');
    expect(economicEntityId('BRK.A')).toBe('BRK.B');
  });

  it('keeps the user index list as seed provenance rather than clean T0 authority', () => {
    expect(entities.every((x) => x.source === 'USER_INDEX_SEED')).toBe(true);
  });

  it('adds at least 50 prospective candidates beyond the raw index ordering', () => {
    expect(expansion.length).toBeGreaterThanOrEqual(50);
    expect(expansion.every((x) => x.provenance === 'PROSPECTIVE_AUDITABLE')).toBe(true);
  });

  it('constructs a first tranche with two verified names in every current T0 cap bucket', () => {
    const first10 = expansion.slice(0,10);
    expect(bucketCountsFromMarketCaps(first10)).toEqual({
      LT_1B: 2,
      '1B_10B': 2,
      '10B_100B': 2,
      '100B_1T': 2,
      GT_1T: 2,
      UNKNOWN: 0,
    });
  });

  it('passes the canonical T0 challenger gate before any scoring occurs', () => {
    const audit = auditProspectiveFirstTranche(expansion,10);
    expect(audit.state).toBe('PASS_SIZE_NEUTRAL_DISCOVERY');
    expect(audit.downstreamAuthorized).toBe(true);
    expect(audit.bucketQuotaMet).toBe(true);
    expect(audit.firstTrancheMegaShare).toBe(0.2);
    expect(audit.directScoreContribution).toBe(0);
  });

  it('does not silently infer market caps for later discovery rows', () => {
    expect(expansion.slice(20).some((x) => x.marketCapUsd === null)).toBe(true);
  });

  it('reports the actual raw and deduped counts for audit logs', () => {
    console.log(`T0_UNIVERSE_RAW_ROWS=${rawTickers.length}`);
    console.log(`T0_UNIVERSE_UNIQUE_ECONOMIC_ENTITIES=${entities.length}`);
    console.log(`T0_UNIVERSE_PROSPECTIVE_EXPANSION=${expansion.length}`);
    expect(entities.length).toBeGreaterThan(400);
  });
});
