import {
  calculateReplacementAlpha,
  createMonthlyChallengerReview,
  evaluateProPicksChallenger,
  type AtlasCandidateGateInput,
  type ProPicksSignalInput,
} from './propicks-challenger-replacement-alpha-omega';

const signal: ProPicksSignalInput = {
  ticker: 'ESTC',
  provider: 'PROPICKS_AI',
  signalType: 'NEW_ENTRY',
  reviewMonth: '2026-09',
  asOfDate: '2026-09-01',
  currentRank: 7,
  providerEvidenceIds: ['investingpro-propicks-2026-09-01'],
  providerMethodologyAuditable: false,
  providerPerformanceClaimAuditable: false,
  investingProAccessibleAtReview: true,
};

const atlasPass: AtlasCandidateGateInput = {
  atlasVerdict: 'PASS',
  integrityGatePass: true,
  expectedReturnGatePass: true,
  valuationGatePass: true,
  economicProofGatePass: true,
  competitionForCapitalPass: true,
  falsifierVeto: false,
  trading212Available: true,
  evidenceIds: ['atlas-integrity', 'atlas-er', 'atlas-valuation'],
  expectedCagrPct: 15,
  atlasScore: 91,
};

describe('ProPicks Challenger and Replacement Alpha Omega', () => {
  it('treats ProPicks plus ATLAS agreement as independent confirmation, not a trade order', () => {
    const result = evaluateProPicksChallenger({ signal, atlas: atlasPass });
    expect(result.decision).toBe('PASS');
    expect(result.independentConfirmation).toBe(true);
    expect(result.externalSignalCanTrade).toBe(false);
    expect(result.portfolioChangeAuthorized).toBe(false);
  });

  it('rejects a ProPicks pick when ATLAS has a falsifier veto', () => {
    const result = evaluateProPicksChallenger({
      signal,
      atlas: { ...atlasPass, atlasVerdict: 'FALSIFIER_VETO', falsifierVeto: true },
    });
    expect(result.decision).toBe('REJECT');
    expect(result.independentConfirmation).toBe(false);
  });

  it('keeps ProPicks removals as WATCH when ATLAS still defends the thesis', () => {
    const result = evaluateProPicksChallenger({
      signal: { ...signal, signalType: 'REMOVED', previousRank: 6, currentRank: undefined },
      atlas: atlasPass,
    });
    expect(result.decision).toBe('WATCH');
    expect(result.reasons.join(' ')).toContain('force thesis defense');
  });

  it('keeps new ProPicks discoveries on WATCH when ATLAS evidence is incomplete', () => {
    const result = evaluateProPicksChallenger({
      signal,
      atlas: { ...atlasPass, atlasVerdict: 'WATCH', economicProofGatePass: false },
    });
    expect(result.decision).toBe('WATCH');
    expect(result.independentConfirmation).toBe(false);
  });

  it('blocks untraceable external signals', () => {
    const result = evaluateProPicksChallenger({
      signal: { ...signal, providerEvidenceIds: [], investingProAccessibleAtReview: false },
      atlas: atlasPass,
    });
    expect(result.decision).toBe('REJECT');
    expect(result.externalEvidenceState).toBe('UNTRACEABLE');
  });

  it('authorizes replacement only when net alpha clears the hurdle and all gates pass', () => {
    const result = calculateReplacementAlpha({
      incumbentTicker: 'ESTC',
      challengerTicker: 'NOW',
      reviewDate: '2026-09-01',
      incumbentExpectedCagrPct: 11,
      challengerExpectedCagrPct: 16,
      marginalPortfolioContributionDeltaPct: 0.5,
      rotationFrictionPct: 0.4,
      incrementalRiskPenaltyPct: 0.5,
      evidenceUncertaintyPenaltyPct: 0.3,
      concentrationPenaltyPct: 0.2,
      trading212AvailabilityGatePass: true,
      valuationGatePass: true,
      economicProofGatePass: true,
      dataIntegrityGatePass: true,
      competitionForCapitalPass: true,
      incumbentEvidenceIds: ['estc-atlas-packet'],
      challengerEvidenceIds: ['now-atlas-packet'],
    });
    expect(result.state).toBe('RA4_REPLACE_CONFIRMED');
    expect(result.netReplacementAlphaPct).toBeCloseTo(4.1);
    expect(result.replacementAuthorized).toBe(true);
  });

  it('prevents rotation when the replacement spread is only marginal', () => {
    const result = calculateReplacementAlpha({
      incumbentTicker: 'ESTC',
      challengerTicker: 'TEAM',
      reviewDate: '2026-09-01',
      incumbentExpectedCagrPct: 13,
      challengerExpectedCagrPct: 14.2,
      marginalPortfolioContributionDeltaPct: 0.1,
      rotationFrictionPct: 0.4,
      incrementalRiskPenaltyPct: 0.3,
      evidenceUncertaintyPenaltyPct: 0.2,
      concentrationPenaltyPct: 0.2,
      trading212AvailabilityGatePass: true,
      valuationGatePass: true,
      economicProofGatePass: true,
      dataIntegrityGatePass: true,
      competitionForCapitalPass: true,
      incumbentEvidenceIds: ['estc-atlas-packet'],
      challengerEvidenceIds: ['team-atlas-packet'],
    });
    expect(result.state).toBe('RA1_KEEP_INCUMBENT');
    expect(result.replacementAuthorized).toBe(false);
  });

  it('separates fundamental exit from buying a replacement', () => {
    const result = calculateReplacementAlpha({
      incumbentTicker: 'BROKEN',
      challengerTicker: 'ADBE',
      reviewDate: '2026-09-01',
      incumbentExpectedCagrPct: 4,
      challengerExpectedCagrPct: 13,
      marginalPortfolioContributionDeltaPct: 0,
      rotationFrictionPct: 0.2,
      incrementalRiskPenaltyPct: 0.2,
      evidenceUncertaintyPenaltyPct: 0.2,
      concentrationPenaltyPct: 0.2,
      incumbentFalsifierVeto: true,
      trading212AvailabilityGatePass: true,
      valuationGatePass: true,
      economicProofGatePass: true,
      dataIntegrityGatePass: true,
      competitionForCapitalPass: true,
      incumbentEvidenceIds: ['broken-falsifier'],
      challengerEvidenceIds: ['adbe-packet'],
    });
    expect(result.state).toBe('RA5_EXIT_FUNDAMENTAL');
    expect(result.replacementAuthorized).toBe(false);
  });

  it('creates monthly PASS WATCH REJECT buckets without authorizing portfolio changes', () => {
    const review = createMonthlyChallengerReview('2026-09', '2026-09-01T12:00:00+02:00', [
      { signal, atlas: atlasPass },
      { signal: { ...signal, ticker: 'BAD', providerEvidenceIds: [] }, atlas: atlasPass },
      { signal: { ...signal, ticker: 'WATCH' }, atlas: { ...atlasPass, atlasVerdict: 'WATCH', valuationGatePass: false } },
    ]);
    expect(review.passTickers).toEqual(['ESTC']);
    expect(review.watchTickers).toEqual(['WATCH']);
    expect(review.rejectTickers).toEqual(['BAD']);
    expect(review.portfolioChangeAuthorized).toBe(false);
  });
});
