import { assertNoEpistemicPromotion, retrieveContinuityFromRegistry, type ContinuityRegistryRecord } from './continuity-registry';

const registry: ContinuityRegistryRecord[] = [
  { projectId: 'DINASTIA_ARTSRUNI', name: 'DINASTÍA Ω / Artsruni', state: 'ACTIVE', active: true, established: ['Tree/prosopography separation and Homonym Firewall remain valid.'], hypotheses: ['Artsruni → Mesopotamia bridge remains unproven.'], openLoop: 'Establish strongest defensible Artsruni line.', nextBestAction: 'Test strongest Artsruni→Mesopotamia bridge against primary or academic evidence.', evidenceStandard: 'PRIMARY_OR_ACADEMIC', provenance: ['T01'], updatedAt: '2026-09-06' },
  { projectId: 'ELITE_CAPITAL_SIGNAL', name: 'Elite Capital Signal Ω', state: 'ACTIVE', active: true, established: ['Investor prestige does not demonstrate predictive skill.'], hypotheses: ['Institutional signal produces post-filing alpha.'], openLoop: 'Run complete post-filing backtest.', nextBestAction: 'Execute complete post-filing backtest under predefined rule.', evidenceStandard: 'PREDEFINED_BACKTEST', provenance: ['T02'], updatedAt: '2026-09-06' },
  { projectId: 'STRATEGY_FACTORY', name: 'Strategy Factory Ω', state: 'ACTIVE', active: true, established: ['Architecture exists; complete robustness validation is not established.'], hypotheses: ['Pipeline discovers genuine edge rather than noise.'], openLoop: 'Run complete null arm.', nextBestAction: 'Execute complete null arm before expanding architecture.', evidenceStandard: 'NULL_ARM', provenance: ['T03'], updatedAt: '2026-09-06' },
  { projectId: 'EUROPE_RECOGNITION_BASE', name: 'European institutional-recognition base', state: 'ACTIVE', active: true, established: ['Inquiry-only selection conditions on the dependent variable.'], hypotheses: ['A particular sensitivity causally explains observed lag.'], openLoop: 'Design censored/no-T4 arm.', nextBestAction: 'Construct censored cohort and survival-analysis design.', evidenceStandard: 'COHORT_WITH_CENSORING', provenance: ['T04'], updatedAt: '2026-09-06' },
  { projectId: 'ATLAS_AI', name: 'ATLAS AI Ω', state: 'BLOCKED', active: true, established: ['GitHub + Notion are persistent layers.', 'Memory != Digital Twin.', 'Continuity MVP failed retrieval at 1/10.'], hypotheses: ['Continuity can work once explicit persistent retrieval is fixed.'], openLoop: 'Repair retrieval and rerun preregistered test.', nextBestAction: 'Wire retrieval to persistent registry and rerun unchanged test.', evidenceStandard: 'PREREGISTERED_CONTINUITY_TEST', provenance: ['T05'], updatedAt: '2026-09-06' },
  { projectId: 'CEUTA_RABAT', name: 'Ceuta/Rabat research', state: 'ACTIVE', active: true, established: ['Documented triggers must be separated from demonstrated coordination.'], hypotheses: ['Coordinated inducement or a central actor beyond available evidence.'], openLoop: 'Separate documented causes from inferred coordination.', nextBestAction: 'Build claim/evidence/falsifier matrix.', evidenceStandard: 'PRIMARY_OR_HIGH_QUALITY_SECONDARY', provenance: ['T06'], updatedAt: '2026-09-06' },
  { projectId: 'ATLAS_PORTFOLIO_37', name: 'ATLAS Ω portfolio 37', state: 'ACTIVE', active: true, established: ['Experimental 37-name cut exists; scores do not replace market validation.'], hypotheses: ['Selection will outperform benchmarks.'], openLoop: 'Observe predefined benchmark-relative performance.', nextBestAction: 'Continue predefined observation without post-hoc reinterpretation.', evidenceStandard: 'PREDEFINED_MARKET_VALIDATION', provenance: ['T07'], updatedAt: '2026-09-06' },
  { projectId: 'HOBBIECODE_STRATEGYQUANT', name: 'HobbieCode / StrategyQuant', state: 'ACTIVE', active: true, established: ['Approach is compatible with StrategyQuant + MT5 + robustness testing.'], hypotheses: ['Specific robot has genuine edge.'], openLoop: 'Reconstruct and test process/rules.', nextBestAction: 'Obtain testable rules and run out-of-sample robustness checks.', evidenceStandard: 'REPRODUCIBLE_BACKTEST', provenance: ['T08'], updatedAt: '2026-09-06' },
  { projectId: 'ACCIDENT_MEDICO_LEGAL', name: 'Accident / medical-legal', state: 'BLOCKED', active: true, established: ['Hand-injury origin/date and causal link remain ambiguous.'], hypotheses: ['Hand injury is attributable to the original accident.'], openLoop: 'Establish documentary causal chain.', nextBestAction: 'Locate and reconcile earliest hand-injury documentation.', evidenceStandard: 'ORIGINAL_MEDICAL_DOCUMENTATION', provenance: ['T09'], updatedAt: '2026-09-06' },
  { projectId: 'PROPICKS_REVERSE_ENGINEERING', name: 'ProPicks reverse engineering', state: 'ACTIVE', active: true, established: ['Own scores are not the proprietary algorithm signal; retrospective precision contaminates inference.'], hypotheses: ['Exact internal weights/rules are known.'], openLoop: 'Design prospective ex-ante tests.', nextBestAction: 'Predefine features and negative controls, then score future recommendations prospectively.', evidenceStandard: 'PROSPECTIVE_EX_ANTE_TEST', provenance: ['T10'], updatedAt: '2026-09-06' },
];

const cases: Array<[string, string]> = [
  ['DINASTIA_ARTSRUNI', 'DINASTIA_ARTSRUNI'],
  ['ELITE_CAPITAL_SIGNAL', 'ELITE_CAPITAL_SIGNAL'],
  ['STRATEGY_FACTORY', 'STRATEGY_FACTORY'],
  ['EUROPE_RECOGNITION_BASE', 'EUROPE_RECOGNITION_BASE'],
  ['ATLAS_AI', 'ATLAS_AI'],
  ['CEUTA_RABAT', 'CEUTA_RABAT'],
  ['ATLAS_PORTFOLIO_37', 'ATLAS_PORTFOLIO_37'],
  ['HOBBIECODE_STRATEGYQUANT', 'HOBBIECODE_STRATEGYQUANT'],
  ['ACCIDENT_MEDICO_LEGAL', 'ACCIDENT_MEDICO_LEGAL'],
  ['PROPICKS_REVERSE_ENGINEERING', 'PROPICKS_REVERSE_ENGINEERING'],
];

describe('ATLAS AI Ω — persistent continuity registry retrieval', () => {
  it.each(cases)('resolves bare Sigue for %s from explicit active-project context', (hint, expected) => {
    const result = retrieveContinuityFromRegistry({ utterance: 'Sigue', activeProjectHint: hint }, registry);
    expect(result.matchedProjectId).toBe(expected);
    expect(result.ambiguous).toBe(false);
    expect(result.confidence).toBe(1);
    expect(result.state?.activeProject).toBe(expected);
    expect(result.state?.nextBestAction).toBeTruthy();
  });

  it('refuses to guess when Sigue has no active-project context and several projects are active', () => {
    const result = retrieveContinuityFromRegistry({ utterance: 'Sigue' }, registry);
    expect(result.state).toBeNull();
    expect(result.ambiguous).toBe(true);
    expect(result.reason).toBe('bare_continue_requires_active_project_context');
  });

  it('keeps hypotheses separate from established memory for all registry records', () => {
    for (const record of registry) {
      const result = retrieveContinuityFromRegistry({ utterance: 'Sigue', activeProjectHint: record.projectId }, registry);
      expect(result.state).not.toBeNull();
      if (!result.state) throw new Error('expected_state');
      expect(() => assertNoEpistemicPromotion(record, result.state!)).not.toThrow();
      for (const hypothesis of record.hypotheses) {
        expect(result.state.established).not.toContain(hypothesis);
        expect(result.state.hypotheses).toContain(hypothesis);
      }
    }
  });

  it('does not retrieve a project from weak lexical evidence', () => {
    const result = retrieveContinuityFromRegistry({ utterance: 'mira esto' }, registry);
    expect(result.state).toBeNull();
    expect(result.reason).toBe('insufficient_retrieval_evidence');
  });
});
