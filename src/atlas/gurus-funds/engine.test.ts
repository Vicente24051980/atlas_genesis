import {
  assessGurusFundsCandidate,
  calculateGurusFundsScore,
  classifyGuruSignalState,
  rankGurusFundsCandidates,
} from './engine';

const fullScore = {
  conviction: 100,
  accumulation: 100,
  convergence: 100,
  persistence: 100,
  exceptionality: 100,
  contrarian: 100,
  evidenceFreshness: 100,
};

const obs = (
  manager: string,
  style: 'QUALITY_VALUE' | 'MACRO_INFLECTION' | 'CONCENTRATED_QUALITY',
  action: 'NEW' | 'INCREASE' | 'HOLD' | 'REDUCE' | 'EXIT',
  portfolioWeightPct: number,
  positionChangePct: number,
  evidenceId: string,
) => ({
  manager,
  style,
  action,
  portfolioWeightPct,
  positionChangePct,
  quartersHeld: action === 'NEW' ? 0 : 8,
  sourceQuality: 95,
  ageDays: 4,
  evidenceId,
});

describe('Gurus & Funds Omega v1.0', () => {
  it('uses the canonical 25/20/15/10/10/10/10 score', () => {
    expect(calculateGurusFundsScore(fullScore)).toBe(100);
  });

  it('maps signal states deterministically', () => {
    expect(classifyGuruSignalState(39)).toBe('WEAK_SIGNAL');
    expect(classifyGuruSignalState(54)).toBe('NEUTRAL');
    expect(classifyGuruSignalState(64)).toBe('DISCOVERY');
    expect(classifyGuruSignalState(74)).toBe('ACCUMULATION');
    expect(classifyGuruSignalState(84)).toBe('SMART_MONEY_CONVERGENCE');
    expect(classifyGuruSignalState(85)).toBe('STRONG_GURU_CONVICTION');
  });

  it('rewards independent cross-style convergence and hands strong signals to downstream gates', () => {
    const result = assessGurusFundsCandidate({
      ticker: 'abc',
      observations: [
        obs('Manager A', 'QUALITY_VALUE', 'INCREASE', 14, 80, 'sec:a'),
        obs('Manager B', 'MACRO_INFLECTION', 'NEW', 8, 100, 'sec:b'),
        obs('Manager C', 'CONCENTRATED_QUALITY', 'INCREASE', 10, 30, 'sec:c'),
      ],
      contrarianScore: 70,
    });

    expect(result.ticker).toBe('ABC');
    expect(result.managerCount).toBe(3);
    expect(result.styleCount).toBe(3);
    expect(result.outputs).toContain('SMART_MONEY_CONVERGENCE_OMEGA');
    expect(result.outputs).toContain('ACCUMULATION_OMEGA');
    expect(result.reasons).toContain('independent_cross_style_convergence');
    expect(['SMART_MONEY_CONVERGENCE', 'STRONG_GURU_CONVICTION']).toContain(result.state);
    expect(result.action).toBe('HANDOFF_TO_ATLAS_GATES');
  });

  it('keeps distribution visible instead of averaging it away', () => {
    const result = assessGurusFundsCandidate({
      ticker: 'xyz',
      observations: [
        obs('Manager A', 'QUALITY_VALUE', 'INCREASE', 15, 40, 'sec:a'),
        obs('Manager B', 'MACRO_INFLECTION', 'REDUCE', 12, -50, 'sec:b'),
        obs('Manager C', 'CONCENTRATED_QUALITY', 'REDUCE', 11, -30, 'sec:c'),
      ],
    });

    expect(result.divergence).toBe(true);
    expect(result.distributors).toBe(2);
    expect(result.outputs).toContain('DISTRIBUTION_OMEGA');
    expect(result.reasons).toContain('cross_manager_divergence_visible');
    expect(result.reasons).toContain('material_distribution_requires_review');
    expect(['WEAK_SIGNAL', 'NEUTRAL', 'DISCOVERY', 'ACCUMULATION']).toContain(result.state);
  });

  it('marks a high-weight new position as exceptional but never calls one manager convergence', () => {
    const result = assessGurusFundsCandidate({
      ticker: 'new',
      observations: [obs('Manager A', 'CONCENTRATED_QUALITY', 'NEW', 18, 100, 'sec:a')],
    });

    expect(result.factors.exceptionality).toBe(100);
    expect(result.outputs).toContain('NEW_POSITION_OMEGA');
    expect(result.outputs).not.toContain('SMART_MONEY_CONVERGENCE_OMEGA');
    expect(result.state).toBe('ACCUMULATION');
    expect(result.action).toBe('RESEARCH');
    expect(result.reasons).toContain('single_manager_signal_cannot_be_smart_money_convergence');
    expect(result.reasons).toContain(
      'guru_signal_requires_economic_proof_quality_valuation_expected_return_and_falsifiers_before_portfolio_action',
    );
  });

  it('ranks candidates by score and then by breadth of manager evidence', () => {
    const ranked = rankGurusFundsCandidates([
      {
        ticker: 'low',
        observations: [obs('A', 'QUALITY_VALUE', 'HOLD', 1, 0, 'sec:a')],
      },
      {
        ticker: 'high',
        observations: [
          obs('A', 'QUALITY_VALUE', 'INCREASE', 12, 40, 'sec:a'),
          obs('B', 'MACRO_INFLECTION', 'NEW', 8, 100, 'sec:b'),
          obs('C', 'CONCENTRATED_QUALITY', 'INCREASE', 10, 40, 'sec:c'),
        ],
      },
    ]);

    expect(ranked[0].ticker).toBe('HIGH');
  });
});
