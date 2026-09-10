import { describe, expect, it } from 'vitest';
import type { ContinuityRegistryRecord } from './continuity-registry';
import { handleContinuityRequest } from './continuity-runtime';
import type { ContinuityRegistryProvider } from './live-continuity-binding';

function record(
  projectId: string,
  name: string,
  aliases: string[],
  established: string,
  hypothesis: string,
  openLoop: string,
  nextBestAction: string,
): ContinuityRegistryRecord {
  return {
    projectId,
    name,
    aliases,
    state: projectId === 'ATLAS_AI' || projectId === 'ACCIDENT_MEDICO_LEGAL' ? 'BLOCKED' : 'ACTIVE',
    active: true,
    established: [established],
    hypotheses: [hypothesis],
    openLoop,
    nextBestAction,
    evidenceStandard: 'LOCKED_TEST',
    provenance: [`runtime-test:${projectId}`],
    updatedAt: '2026-09-06',
  };
}

const registry: ContinuityRegistryRecord[] = [
  record('DINASTIA_ARTSRUNI', 'DINASTÍA Ω / Artsruni', ['artsruni', 'reconstruir casa artsruni'], 'Homonym Firewall and documentary-hiatus discipline remain valid.', 'Artsruni → Mesopotamia remains unproven.', 'Establish strongest defensible Artsruni line.', 'Test the strongest remaining bridge against primary or academic evidence.'),
  record('ELITE_CAPITAL_SIGNAL', 'Elite Capital Signal Ω', ['lingotto', 'backtest post-filing'], 'Investor prestige does not demonstrate predictive skill.', 'Institutional signal produces post-filing alpha.', 'Run complete post-filing backtest.', 'Execute the complete post-filing backtest under the predefined rule.'),
  record('STRATEGY_FACTORY', 'Strategy Factory Ω', ['strategy factory', 'brazo nulo'], 'Architecture exists; complete robustness validation is not established.', 'The pipeline discovers genuine edge rather than noise.', 'Run complete null arm.', 'Execute the null arm before expanding architecture.'),
  record('EUROPE_RECOGNITION_BASE', 'European institutional-recognition base', ['base europea', 'patrones europeos', 'cohorte censurada'], 'Inquiry-only selection conditions on the dependent variable.', 'A particular sensitivity causally explains observed lag.', 'Design no-T4/censored arm and survival analysis.', 'Construct the censored cohort and survival-analysis design.'),
  record('ATLAS_AI', 'ATLAS AI Ω', ['atlas ai', 'continuity mvp'], 'GitHub + Notion are persistent layers; Memory != Digital Twin.', 'A live runtime binding may solve cross-project contamination.', 'Establish real live runtime binding.', 'Read Notion before resolving Sigue and rerun the locked test.'),
  record('CEUTA_RABAT', 'Ceuta/Rabat research', ['ceuta', 'rabat', 'auditoría ceuta'], 'Documented triggers must be separated from demonstrated coordination.', 'A central actor coordinated inducement beyond available evidence.', 'Separate documented causes from inferred coordination.', 'Build the claim/evidence/falsifier matrix.'),
  record('ATLAS_PORTFOLIO_37', 'ATLAS Ω portfolio 37', ['cartera 37', 'atlas 37'], 'Experimental 37-name cut exists; scores do not replace market validation.', 'The selection will outperform benchmarks.', 'Observe predefined benchmark-relative performance.', 'Continue observation without post-hoc reinterpretation.'),
  record('HOBBIECODE_STRATEGYQUANT', 'HobbieCode / StrategyQuant', ['hobbiecode', 'strategyquant', 'robot nasdaq'], 'The identified approach uses strategy generation and robustness testing.', 'The specific robot has genuine edge.', 'Reconstruct/test process and rules.', 'Run out-of-sample robustness checks.'),
  record('ACCIDENT_MEDICO_LEGAL', 'Accident / medical-legal', ['accidente', 'lesión mano', 'análisis penal médico'], 'Hand-injury origin/date and causal link remain ambiguous.', 'The hand injury is attributable to the accident.', 'Establish documentary causal chain.', 'Locate the earliest documentary evidence of timing and causation.'),
  record('PROPICKS_REVERSE_ENGINEERING', 'ProPicks reverse engineering', ['propicks', 'algoritmo propicks'], 'Own scores are not the proprietary algorithm signal.', 'Exact internal weights/rules are known.', 'Design prospective ex-ante tests.', 'Predefine features and negative controls.'),
];

class Provider implements ContinuityRegistryProvider {
  reads = 0;
  async listActive() {
    this.reads += 1;
    return registry;
  }
}

const lockedCases = [
  ['DINASTIA_ARTSRUNI', 'Reconstruir Casa Artsruni', 'Toumanoff no basta: el puente Artsruni a Mesopotamia sigue sin prueba independiente.'],
  ['ELITE_CAPITAL_SIGNAL', 'Actualizar snapshots Exor verificados', 'Lingotto: skill/alpha post-filing sigue sin demostrarse; falta ejecutar el backtest completo.'],
  ['STRATEGY_FACTORY', 'Strategy Factory', 'La factoría no se amplía: falta correr el brazo nulo completo.'],
  ['EUROPE_RECOGNITION_BASE', 'Comparar patrones europeos', 'Hay sesgo por seleccionar inquiry; falta cohorte censurada y survival analysis.'],
  ['ATLAS_AI', 'Atlas AI', 'La continuidad live falla por contaminación entre proyectos; el registry debe leerse antes de Sigue.'],
  ['CEUTA_RABAT', 'Auditar Ceuta Ω', 'Separar detonantes documentados de coordinación inferida y buscar falsificadores.'],
  ['ATLAS_PORTFOLIO_37', 'Cartera de 37', 'El corte 37 debe observarse contra benchmarks sin reinterpretación post hoc.'],
  ['HOBBIECODE_STRATEGYQUANT', 'HobbieCode StrategyQuant', 'Reconstruir reglas del robot Nasdaq y comprobar robustez out-of-sample.'],
  ['ACCIDENT_MEDICO_LEGAL', 'Análisis penal médico', 'La lesión de mano necesita fecha y cadena causal documental antes de integrarla.'],
  ['PROPICKS_REVERSE_ENGINEERING', 'ProPicks ingeniería inversa', 'No atribuir pesos al algoritmo sin features y controles negativos definidos ex ante.'],
] as const;

describe('ATLAS AI Ω — minimal continuity runtime acceptance', () => {
  it.each(lockedCases)('routes %s through runtime and preserves epistemic separation', async (projectId, title, localContext) => {
    const provider = new Provider();
    const response = await handleContinuityRequest({
      utterance: 'Sigue',
      conversationTitle: title,
      recentTurns: [
        { role: 'user', content: localContext },
        { role: 'assistant', content: `Último estado local: ${localContext}` },
      ],
    }, { provider });

    expect(provider.reads).toBe(1);
    expect(response.runtime).toBe('ATLAS_CONTINUITY_RUNTIME_V1');
    expect(response.status).toBe('RESOLVED');
    expect(response.matchedProjectId).toBe(projectId);
    expect(response.state?.activeProject).toBe(projectId);
    expect(response.state?.established.length).toBeGreaterThan(0);
    expect(response.state?.hypotheses.length).toBeGreaterThan(0);
    expect(response.state?.openLoops.length).toBeGreaterThan(0);
    expect(response.state?.nextBestAction).toBeTruthy();

    for (const hypothesis of response.state?.hypotheses ?? []) {
      expect(response.state?.established).not.toContain(hypothesis);
    }
  });

  it('does not construct a Notion provider without runtime credentials', async () => {
    await expect(handleContinuityRequest({
      utterance: 'Sigue',
      conversationTitle: 'Atlas AI',
      recentTurns: [{ role: 'user', content: 'Seguimos Atlas AI.' }],
    }, { notionToken: '', notionDataSourceId: '' })).rejects.toThrow(/missing_NOTION_API_KEY/);
  });
});
