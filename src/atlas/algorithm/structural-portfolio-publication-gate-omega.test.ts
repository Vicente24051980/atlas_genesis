import { describe, expect, it } from 'vitest';
import {
  buildFourSessionEqualWeightExperiment,
  runStructuralPortfolioPublicationGate,
  runStructuralPortfolioPublicationGateUnsafe,
} from './structural-portfolio-publication-gate-omega';
import {
  ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION,
  ATLAS_CORE_UNIVERSE_VERSION,
  isTickerAllowedByStructuralUniverse,
  resolveStructuralUniverseAuthority,
} from './structural-universe-authority-omega';
import { CANONICAL_SCENARIOS, type PortfolioCandidateV2 } from './endogenous-portfolio-engine-v2';

function c(ticker: string, entity: string, er = 12): PortfolioCandidateV2 {
  const scenarios = Object.fromEntries(CANONICAL_SCENARIOS.map(s => [s, -0.5])) as PortfolioCandidateV2['scenarios'];
  return {
    ticker, canonicalEntityId: entity, hardGatesPassed: true, falsifierVetoPassed: true,
    expectedReturn: { fundamentalGrowthPct: er - 4, cashYieldPct: 2, capitalReturnsPct: 1, multipleNormalizationPct: 1 },
    permanentLossRisk: 2, tailRisk: 1, volatilityRisk: 2, fragility: 1, convexity: 1,
    confidence: 0.9, individualScore: 90, causalDrivers: { core: 1 }, fundingSources: [], scenarios,
  };
}

function unsafeReq(candidates: PortfolioCandidateV2[]) {
  return {
    rawUniverseSource: 'test-universe',
    normalizedUniverseHash: 'test-universe-hash', snapshotHash: 'pit-2026-09-06', policyHash: 'policy-v1',
    allowedTickers: candidates.map(x => x.ticker), expectedCanonicalEntityCount: new Set(candidates.map(x => x.canonicalEntityId)).size,
    candidates, reproducibilityRuns: 12,
  };
}

describe('Structural Portfolio Publication Gate Ω v1.1', () => {
  it('registry contains exactly 487 core entities and VRT only in the 488 extension', () => {
    const core = resolveStructuralUniverseAuthority(ATLAS_CORE_UNIVERSE_VERSION);
    const ext = resolveStructuralUniverseAuthority(ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION);
    expect(core.expectedCanonicalEntityCount).toBe(487);
    expect(core.allowedTickers).toHaveLength(487);
    expect(new Set(core.allowedTickers).size).toBe(487);
    expect(core.allowedTickers).not.toContain('VRT');
    expect(ext.expectedCanonicalEntityCount).toBe(488);
    expect(ext.allowedTickers).toHaveLength(488);
    expect(ext.allowedTickers).toContain('VRT');
    expect(ext.admittedExternalTickers).toEqual(['VRT']);
  });

  it('does not admit historical external names merely because they were once held', () => {
    expect(isTickerAllowedByStructuralUniverse(ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION, 'VRT')).toBe(true);
    expect(isTickerAllowedByStructuralUniverse(ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION, '6861.T')).toBe(false);
    expect(isTickerAllowedByStructuralUniverse(ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION, 'TSM')).toBe(false);
    expect(isTickerAllowedByStructuralUniverse(ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION, 'IBKR')).toBe(false);
  });

  it('canonical API cannot shrink the universe by lying about expected count or whitelist', () => {
    const xs = [c('AVGO','AVGO'), c('NVDA','NVDA')];
    const r = runStructuralPortfolioPublicationGate({
      universeVersion: ATLAS_CORE_UNIVERSE_VERSION,
      snapshotHash: 'pit', policyHash: 'policy', candidates: xs, reproducibilityRuns: 2,
    });
    expect(r.publicationState).toBe('BLOCKED_INCOMPLETE_UNIVERSE_EVIDENCE');
    expect(r.reason).toContain('487');
  });

  it('canonical core rejects VRT while the versioned 488 extension permits it but still requires full evidence', () => {
    const xs = [c('AVGO','AVGO'), c('VRT','VRT')];
    const core = runStructuralPortfolioPublicationGate({
      universeVersion: ATLAS_CORE_UNIVERSE_VERSION,
      snapshotHash: 'pit', policyHash: 'policy', candidates: xs, reproducibilityRuns: 2,
    });
    expect(core.publicationState).toBe('BLOCKED_UNIVERSE_MISMATCH');

    const ext = runStructuralPortfolioPublicationGate({
      universeVersion: ATLAS_CORE_PLUS_VRT_UNIVERSE_VERSION,
      snapshotHash: 'pit', policyHash: 'policy', candidates: xs, reproducibilityRuns: 2,
    });
    expect(ext.publicationState).toBe('BLOCKED_INCOMPLETE_UNIVERSE_EVIDENCE');
    expect(ext.reason).toContain('488');
  });

  it('unsafe primitive blocks any ticker outside its explicitly supplied test whitelist', () => {
    const xs = [c('AVGO','AVGO'), c('NVDA','NVDA'), c('KEYENCE','KEYENCE')];
    const r = runStructuralPortfolioPublicationGateUnsafe({ ...unsafeReq(xs), allowedTickers: ['AVGO','NVDA'] });
    expect(r.publicationState).toBe('BLOCKED_UNIVERSE_MISMATCH');
    expect(r.selectedTickers).toEqual([]);
  });

  it('unsafe primitive blocks publication when its complete test entity evidence is not present', () => {
    const xs = [c('AVGO','AVGO'), c('NVDA','NVDA')];
    const r = runStructuralPortfolioPublicationGateUnsafe({ ...unsafeReq(xs), expectedCanonicalEntityCount: 3 });
    expect(r.publicationState).toBe('BLOCKED_INCOMPLETE_UNIVERSE_EVIDENCE');
  });

  it('unsafe deterministic mechanics are invariant to caller order and emit the same portfolio hash', () => {
    const xs = [c('AVGO','AVGO',16), c('NVDA','NVDA',15), c('ASML','ASML',14), c('ICE','ICE',10), c('REGN','REGN',11)];
    const a = runStructuralPortfolioPublicationGateUnsafe(unsafeReq(xs));
    const b = runStructuralPortfolioPublicationGateUnsafe(unsafeReq([...xs].reverse()));
    expect(a.selectedTickers).toEqual(b.selectedTickers);
    expect(a.optimalN).toBe(b.optimalN);
    expect(a.portfolioHash).toBe(b.portfolioHash);
  });

  it('chooses a deterministic representative for duplicate share-class/entity rows', () => {
    const a = c('GOOGL','ALPHABET',13);
    const b = { ...a, ticker: 'GOOG' };
    const other = c('MSFT','MSFT',12);
    const x = runStructuralPortfolioPublicationGateUnsafe(unsafeReq([a,b,other]));
    const y = runStructuralPortfolioPublicationGateUnsafe(unsafeReq([b,a,other]));
    expect(x.portfolioHash).toBe(y.portfolioHash);
    expect(x.selectedTickers).toEqual(y.selectedTickers);
  });

  it('refuses to call reproducible selection a structural portfolio before sizing exists', () => {
    const xs = [c('AVGO','AVGO',16), c('NVDA','NVDA',15), c('ICE','ICE',10)];
    const r = runStructuralPortfolioPublicationGateUnsafe(unsafeReq(xs));
    expect(r.selectedTickers.length).toBeGreaterThan(0);
    expect(r.publicationState).toBe('BLOCKED_SIZING_NOT_IMPLEMENTED');
    expect(r.weights).toBeNull();
    expect(r.marginalRanking.length).toBe(3);
  });

  it('requires covariance-aware sizing evidence and exact normalized weights', () => {
    const xs = [c('AVGO','AVGO',16), c('NVDA','NVDA',15), c('ICE','ICE',10)];
    const first = runStructuralPortfolioPublicationGateUnsafe(unsafeReq(xs));
    const selected = first.selectedTickers;
    const weights = Object.fromEntries(selected.map(t => [t, 1 / selected.length]));
    const r = runStructuralPortfolioPublicationGateUnsafe({
      ...unsafeReq(xs),
      sizing: { method: 'COVARIANCE_AWARE', portfolioVolatilityModelHash: 'cov-pit-hash', weights },
    });
    expect(r.publicationState).toBe('CANONICAL_READY');
    expect(Object.values(r.weights ?? {}).reduce((a,b)=>a+b,0)).toBeCloseTo(1,10);
  });

  it('keeps the four-session equal-weight basket explicitly experimental', () => {
    const x = buildFourSessionEqualWeightExperiment(['NVDA','AVGO'], 500, ['AVGO','NVDA','ASML']);
    expect(x.mode).toBe('EXPERIMENT_4D_EQUAL_WEIGHT');
    expect(x.authority).toBe('EXPERIMENT_ONLY');
    expect(x.equalWeight).toBeCloseTo(0.5,12);
    expect(x.amountPerPosition).toBeCloseTo(250,12);
  });
});
