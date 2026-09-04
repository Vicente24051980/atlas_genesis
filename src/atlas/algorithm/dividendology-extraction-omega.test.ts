import {
  DIVIDENDOLOGY_EXTRACTION_OMEGA_GOVERNANCE,
  evaluateCompounderEfficiencyDiagnostic,
  evaluateDividendSustainabilityOverlay,
  evaluateDividendologyExtraction,
} from './dividendology-extraction-omega';

describe('Dividendology Extraction Ω', () => {
  it('keeps the compounder synthesis diagnostic and prevents direct ATLAS double-counting', () => {
    const result = evaluateCompounderEfficiencyDiagnostic({
      evidenceTraceable: true,
      evidenceIds: ['filing', 'valuation-workpaper'],
      reinvestmentRunwayRoicScore: 90,
      fcfQualityScore: 88,
      forwardGrowthScore: 84,
      expectationGapScore: 92,
      capitalAllocationScore: 86,
      moatConfirmationScore: 80,
    });

    expect(result.state).toBe('ELITE');
    expect(result.diagnosticScore).toBe(88.1);
    expect(result.directAtlasScoreDelta).toBe(0);
  });

  it('does not penalize a company for paying no dividend', () => {
    const result = evaluateDividendSustainabilityOverlay({
      evidenceTraceable: true,
      evidenceIds: ['filing', 'cashflow'],
      paysDividend: false,
    });

    expect(result.state).toBe('NOT_APPLICABLE');
    expect(result.noDividendPenalty).toBe(0);
    expect(result.directAtlasScoreDelta).toBe(0);
  });

  it('recognizes a resilient distribution when FCF growth covers dividend growth', () => {
    const result = evaluateDividendSustainabilityOverlay({
      evidenceTraceable: true,
      evidenceIds: ['10k', 'capital-return-history'],
      paysDividend: true,
      fcfCagr5Pct: 10,
      dividendCagr5Pct: 8,
      fcfPayoutPct: 45,
      netDebtToEbitda: 1.2,
      interestCoverageX: 15,
      dividendCutLast10y: false,
    });

    expect(result.state).toBe('RESILIENT');
    expect(result.sustainableDistributionDeltaPct).toBe(2);
    expect(result.fcfCoverageX).toBe(2.22);
    expect(result.diagnosticScore).toBe(100);
  });

  it('flags a dividend that outruns FCF and is supported by a weak balance sheet', () => {
    const result = evaluateDividendSustainabilityOverlay({
      evidenceTraceable: true,
      evidenceIds: ['10k', 'debt-schedule'],
      paysDividend: true,
      fcfCagr5Pct: 2,
      dividendCagr5Pct: 13,
      fcfPayoutPct: 125,
      netDebtToEbitda: 5,
      interestCoverageX: 2.5,
      dividendCutLast10y: true,
    });

    expect(result.state).toBe('UNSUSTAINABLE');
    expect(result.sustainableDistributionDeltaPct).toBe(-11);
    expect(result.directAtlasScoreDelta).toBe(0);
  });

  it('requires traceable evidence before classifying a dividend payer', () => {
    const result = evaluateDividendSustainabilityOverlay({
      evidenceTraceable: false,
      evidenceIds: [],
      paysDividend: true,
      fcfCagr5Pct: 8,
      dividendCagr5Pct: 7,
      fcfPayoutPct: 50,
      netDebtToEbitda: 1,
    });

    expect(result.state).toBe('EVIDENCE_PENDING');
  });

  it('registers only Sustainable Distribution Delta as a candidate new signal', () => {
    const result = evaluateDividendologyExtraction({
      compounder: {
        evidenceTraceable: true,
        evidenceIds: ['filing', 'reverse-dcf'],
        reinvestmentRunwayRoicScore: 80,
        fcfQualityScore: 80,
        forwardGrowthScore: 80,
        expectationGapScore: 80,
        capitalAllocationScore: 80,
        moatConfirmationScore: 80,
      },
      dividend: {
        evidenceTraceable: true,
        evidenceIds: ['filing', 'distribution-history'],
        paysDividend: true,
        fcfCagr5Pct: 9,
        dividendCagr5Pct: 8,
        fcfPayoutPct: 55,
        interestCoverageX: 10,
      },
    });

    expect(result.uniqueCandidateSignal).toBe('SUSTAINABLE_DISTRIBUTION_DELTA_OMEGA_V1');
    expect(result.directAtlasScoreDelta).toBe(0);
    expect(DIVIDENDOLOGY_EXTRACTION_OMEGA_GOVERNANCE.directAtlasScoreWeight).toBe(0);
  });
});
