import { describe, expect, it } from 'vitest';
import {
  buildFourSessionEqualWeightExperiment,
  runStructuralPortfolioPublicationGate,
} from './structural-portfolio-publication-gate-omega';
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

function req(candidates: PortfolioCandidateV2[]) {
  return {
    rawUniverseSource: 'data/t0-universe-user-seed-2026-09-05.txt',
    normalizedUniverseHash: 'universe-hash', snapshotHash: 'pit-2026-09-06', policyHash: 'policy-v1',
    allowedTickers: candidates.map(x => x.ticker), expectedCanonicalEntityCount: new Set(candidates.map(x => x.canonicalEntityId)).size,
    candidates, reproducibilityRuns: 12,
  };
}

describe('Structural Portfolio Publication Gate Ω', () => {
  it('blocks any ticker outside the canonical universe before selection', () => {
    const xs = [c('AVGO','AVGO'), c('NVDA','NVDA'), c('KEYENCE','KEYENCE')];
    const r = runStructuralPortfolioPublicationGate({ ...req(xs), allowedTickers: ['AVGO','NVDA'] });
    expect(r.publicationState).toBe('BLOCKED_UNIVERSE_MISMATCH');
    expect(r.selectedTickers).toEqual([]);
  });

  it('blocks publication when full canonical entity evidence is not present', () => {
    const xs = [c('AVGO','AVGO'), c('NVDA','NVDA')];
    const r = runStructuralPortfolioPublicationGate({ ...req(xs), expectedCanonicalEntityCount: 3 });
    expect(r.publicationState).toBe('BLOCKED_INCOMPLETE_UNIVERSE_EVIDENCE');
  });

  it('is invariant to caller order and emits the same portfolio hash', () => {
    const xs = [c('AVGO','AVGO',16), c('NVDA','NVDA',15), c('ASML','ASML',14), c('ICE','ICE',10), c('REGN','REGN',11)];
    const a = runStructuralPortfolioPublicationGate(req(xs));
    const b = runStructuralPortfolioPublicationGate(req([...xs].reverse()));
    expect(a.selectedTickers).toEqual(b.selectedTickers);
    expect(a.optimalN).toBe(b.optimalN);
    expect(a.portfolioHash).toBe(b.portfolioHash);
  });

  it('chooses a deterministic representative for duplicate share-class/entity rows', () => {
    const a = c('GOOGL','ALPHABET',13);
    const b = { ...a, ticker: 'GOOG' };
    const other = c('MSFT','MSFT',12);
    const x = runStructuralPortfolioPublicationGate(req([a,b,other]));
    const y = runStructuralPortfolioPublicationGate(req([b,a,other]));
    expect(x.portfolioHash).toBe(y.portfolioHash);
    expect(x.selectedTickers).toEqual(y.selectedTickers);
  });

  it('refuses to call reproducible selection a structural portfolio before sizing exists', () => {
    const xs = [c('AVGO','AVGO',16), c('NVDA','NVDA',15), c('ICE','ICE',10)];
    const r = runStructuralPortfolioPublicationGate(req(xs));
    expect(r.selectedTickers.length).toBeGreaterThan(0);
    expect(r.publicationState).toBe('BLOCKED_SIZING_NOT_IMPLEMENTED');
    expect(r.weights).toBeNull();
    expect(r.marginalRanking.length).toBe(3);
  });

  it('requires covariance-aware sizing evidence and exact normalized weights', () => {
    const xs = [c('AVGO','AVGO',16), c('NVDA','NVDA',15), c('ICE','ICE',10)];
    const first = runStructuralPortfolioPublicationGate(req(xs));
    const selected = first.selectedTickers;
    const weights = Object.fromEntries(selected.map(t => [t, 1 / selected.length]));
    const r = runStructuralPortfolioPublicationGate({
      ...req(xs),
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
