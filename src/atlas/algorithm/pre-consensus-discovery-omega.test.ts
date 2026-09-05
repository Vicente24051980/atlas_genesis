import { describe, expect, it } from 'vitest';
import {
  evaluateFundamentalTrajectory,
  evaluatePreConsensusDiscovery,
  evaluateRecognition,
} from './pre-consensus-discovery-omega';

const strongTrajectory = evaluateFundamentalTrajectory({
  evidenceTraceable: true,
  evidenceIds: ['10q:t0', '10q:t-4'],
  roicDeltaPctPts: 4,
  grossMarginDeltaPctPts: 2,
  fcfMarginDeltaPctPts: 3,
  netDebtToEbitdaDelta: -0.6,
  dilutedSharesDeltaPct: -1,
  revenueGrowthAccelerationPctPts: 5,
  epsGrowthAccelerationPctPts: 7,
});

const lowRecognition = evaluateRecognition({
  evidenceTraceable: true,
  evidenceIds: ['analysts:pit', 'attention:pit', '13f:pit'],
  analystCoveragePercentile: 20,
  newsAttentionPercentile: 15,
  searchAttentionPercentile: 25,
  socialAttentionPercentile: 10,
  institutionalOwnershipPercentile: 30,
  attentionChangePctPts90d: 4,
  analystCoverageChangePctPts180d: 2,
  institutionalOwnershipChangePctPts180d: 3,
});

describe('Pre-Consensus Discovery Omega', () => {
  it('detects improving owner economics without adding structural score authority', () => {
    expect(strongTrajectory.evidence).toBe('CONFIRMED');
    expect(strongTrajectory.score as number).toBeGreaterThan(60);
    expect(strongTrajectory.improvingDimensions).toBe(7);
    expect(strongTrajectory.directAtlasScoreDelta).toBe(0);
  });

  it('measures low attention separately from institutional recognition', () => {
    expect(lowRecognition.evidence).toBe('CONFIRMED');
    expect(lowRecognition.attentionGap as number).toBeGreaterThan(70);
    expect(lowRecognition.institutionalRecognitionGap).toBe(70);
    expect(lowRecognition.directAtlasScoreDelta).toBe(0);
  });

  it('prioritizes a strong improving business before consensus recognition', () => {
    const result = evaluatePreConsensusDiscovery({
      qualityGatePassed: true,
      falsifierVetoTriggered: false,
      expectedReturnGatePassed: true,
      fundamentalTrajectory: strongTrajectory,
      recognition: lowRecognition,
      expectationGapScore: 75,
      catalystEvidenceScore: 70,
      valuationOpportunityScore: 65,
    });
    expect(result.state).toBe('PRE_CONSENSUS_CANDIDATE');
    expect(result.shadowScore as number).toBeGreaterThan(60);
    expect(result.eligibleForResearchPriority).toBe(true);
    expect(result.directAtlasScoreDelta).toBe(0);
  });

  it('never lets obscurity rescue failed fundamentals or a falsifier veto', () => {
    const qualityFail = evaluatePreConsensusDiscovery({
      qualityGatePassed: false,
      falsifierVetoTriggered: false,
      expectedReturnGatePassed: true,
      fundamentalTrajectory: strongTrajectory,
      recognition: lowRecognition,
      expectationGapScore: 100,
      catalystEvidenceScore: 100,
      valuationOpportunityScore: 100,
    });
    expect(qualityFail.state).toBe('FUNDAMENTALS_INSUFFICIENT');
    expect(qualityFail.shadowScore).toBeNull();

    const veto = evaluatePreConsensusDiscovery({
      qualityGatePassed: true,
      falsifierVetoTriggered: true,
      expectedReturnGatePassed: true,
      fundamentalTrajectory: strongTrajectory,
      recognition: lowRecognition,
      expectationGapScore: 100,
      catalystEvidenceScore: 100,
      valuationOpportunityScore: 100,
    });
    expect(veto.state).toBe('FUNDAMENTALS_INSUFFICIENT');
    expect(veto.eligibleForResearchPriority).toBe(false);
  });

  it('marks already crowded high-recognition names as consensus saturated', () => {
    const crowded = evaluateRecognition({
      evidenceTraceable: true,
      evidenceIds: ['analysts:pit', 'attention:pit'],
      analystCoveragePercentile: 95,
      newsAttentionPercentile: 90,
      searchAttentionPercentile: 85,
      socialAttentionPercentile: 95,
      institutionalOwnershipPercentile: 90,
      attentionChangePctPts90d: 3,
      analystCoverageChangePctPts180d: 1,
      institutionalOwnershipChangePctPts180d: 1,
    });
    const result = evaluatePreConsensusDiscovery({
      qualityGatePassed: true,
      falsifierVetoTriggered: false,
      expectedReturnGatePassed: true,
      fundamentalTrajectory: strongTrajectory,
      recognition: crowded,
      expectationGapScore: 70,
      catalystEvidenceScore: 70,
      valuationOpportunityScore: 65,
    });
    expect(result.state).toBe('CONSENSUS_SATURATED');
    expect(result.directAtlasScoreDelta).toBe(0);
  });

  it('fails closed on missing or malformed evidence', () => {
    const badRecognition = evaluateRecognition({
      evidenceTraceable: false,
      evidenceIds: [],
      analystCoveragePercentile: 20,
      newsAttentionPercentile: 20,
      searchAttentionPercentile: 20,
      socialAttentionPercentile: 20,
      institutionalOwnershipPercentile: 20,
      attentionChangePctPts90d: 0,
      analystCoverageChangePctPts180d: 0,
      institutionalOwnershipChangePctPts180d: 0,
    });
    const result = evaluatePreConsensusDiscovery({
      qualityGatePassed: true,
      falsifierVetoTriggered: false,
      expectedReturnGatePassed: true,
      fundamentalTrajectory: strongTrajectory,
      recognition: badRecognition,
      expectationGapScore: 80,
      catalystEvidenceScore: 80,
      valuationOpportunityScore: 80,
    });
    expect(result.state).toBe('EVIDENCE_PENDING');
    expect(result.shadowScore).toBeNull();
  });
});
