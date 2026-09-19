import { describe, expect, it, vi } from 'vitest';
import type { ContinuityRegistryRecord } from './continuity-registry';
import {
  NotionHttpContinuityRegistryProvider,
  resolveLiveContinuity,
  type ContinuityRegistryProvider,
  type LocalConversationTurn,
} from './live-continuity-binding';

function r(
  projectId: string,
  name: string,
  established: string,
  hypothesis: string,
  openLoop: string,
  nextBestAction: string,
): ContinuityRegistryRecord {
  return {
    projectId,
    name,
    state: 'ACTIVE',
    active: true,
    established: [established],
    hypotheses: [hypothesis],
    openLoop,
    nextBestAction,
    evidenceStandard: 'TEST',
    provenance: [`registry:${projectId}`],
    updatedAt: '2026-09-06',
  };
}

const registry: ContinuityRegistryRecord[] = [
  r('DINASTIA_ARTSRUNI', 'DINASTÍA Ω / Artsruni', 'Homonym Firewall remains valid.', 'Artsruni to Mesopotamia remains unproven.', 'Establish strongest defensible Artsruni line.', 'Test the remaining Artsruni bridge against primary or academic evidence.'),
  r('ELITE_CAPITAL_SIGNAL', 'Elite Capital Signal Ω', 'Prestige does not prove predictive skill.', 'Institutional signal produces post-filing alpha.', 'Run complete post-filing backtest.', 'Execute the complete post-filing backtest under the predefined rule.'),
  r('STRATEGY_FACTORY', 'Strategy Factory Ω', 'Architecture exists; robustness is not established.', 'Pipeline discovers genuine edge.', 'Run the complete null arm.', 'Execute the null arm before expanding architecture.'),
  r('EUROPE_RECOGNITION_BASE', 'European institutional-recognition base', 'Inquiry-only selection conditions on the dependent variable.', 'Sensitivity causally explains lag.', 'Design censored/no-inquiry arm.', 'Construct the censored cohort and survival-analysis design.'),
  r('ATLAS_AI', 'ATLAS AI Ω', 'GitHub and Notion are the persistent layers.', 'Live continuity binding will solve cross-project contamination.', 'Bind live chat to the Continuity Registry.', 'Read Notion before resolving Sigue, then rerun the locked test.'),
  r('CEUTA_RABAT', 'Ceuta/Rabat research', 'Documented triggers must be separated from demonstrated coordination.', 'A central actor coordinated inducement.', 'Separate causes from inferred coordination.', 'Build the claim/evidence/falsifier matrix.'),
  r('ATLAS_PORTFOLIO_37', 'ATLAS Ω portfolio 37', 'The experimental 37-name cut exists.', 'The selection will outperform benchmarks.', 'Observe predefined benchmark-relative performance.', 'Continue observation without post-hoc reinterpretation.'),
  r('HOBBIECODE_STRATEGYQUANT', 'HobbieCode / StrategyQuant', 'The process uses strategy generation and robustness testing.', 'The specific robot has genuine edge.', 'Reconstruct and test the robot process.', 'Run out-of-sample robustness checks.'),
  r('ACCIDENT_MEDICO_LEGAL', 'Accident / medical-legal', 'Hand-injury causation remains ambiguous.', 'The hand injury is attributable to the accident.', 'Establish documentary causal chain.', 'Locate the earliest hand-injury documentation.'),
  r('PROPICKS_REVERSE_ENGINEERING', 'ProPicks reverse engineering', 'Own scores are not the proprietary algorithm signal.', 'Exact internal weights are known.', 'Design prospective ex-ante tests.', 'Predefine features and negative controls.'),
];

class MemoryProvider implements ContinuityRegistryProvider {
  calls = 0;
  async listActive(): Promise<ContinuityRegistryRecord[]> {
    this.calls += 1;
    return registry;
  }
}

const titleCases: Array<[string, string, string]> = [
  ['DINASTIA_ARTSRUNI', 'Reconstruir Casa Artsruni', 'Toumanoff y el puente Artsruni a Mesopotamia siguen sin prueba independiente.'],
  ['ELITE_CAPITAL_SIGNAL', 'Actualizar snapshots Exor verificados', 'Seguimos con el backtest post-filing de Lingotto; habilidad predictiva sigue no demostrada.'],
  ['STRATEGY_FACTORY', 'Strategy Factory', 'Falta correr el brazo nulo antes de diseñar otra versión de la factoría.'],
  ['EUROPE_RECOGNITION_BASE', 'Comparar patrones europeos', 'Tenemos que construir la cohorte censurada y el análisis de supervivencia.'],
  ['ATLAS_AI', 'Atlas AI', 'La continuidad live falló por contaminación entre proyectos; hay que leer el Continuity Registry antes de responder.'],
  ['CEUTA_RABAT', 'Auditar Ceuta Ω', 'Separar detonantes documentados de coordinación inferida y buscar falsificadores.'],
  ['ATLAS_PORTFOLIO_37', 'Cartera de 37', 'El corte experimental de 37 debe compararse contra benchmarks sin reinterpretación post hoc.'],
  ['HOBBIECODE_STRATEGYQUANT', 'HobbieCode StrategyQuant', 'Reconstruir las reglas del robot Nasdaq y someterlas a robustez out-of-sample.'],
  ['ACCIDENT_MEDICO_LEGAL', 'Análisis penal médico', 'La prioridad es documentar fecha y causalidad de la lesión de mano antes de integrarla en la reclamación.'],
  ['PROPICKS_REVERSE_ENGINEERING', 'ProPicks ingeniería inversa', 'Hay que predefinir features y controles negativos antes de atribuir pesos al algoritmo.'],
];

describe('ATLAS AI Ω — live continuity binding', () => {
  it.each(titleCases)('resolves %s from local conversation evidence before answering Sigue', async (expected, title, context) => {
    const provider = new MemoryProvider();
    const recentTurns: LocalConversationTurn[] = [
      { role: 'user', content: context },
      { role: 'assistant', content: `Estado actual del proyecto: ${context}` },
    ];

    const result = await resolveLiveContinuity({
      utterance: 'Sigue',
      conversationTitle: title,
      recentTurns,
    }, provider);

    expect(provider.calls).toBe(1);
    expect(result.status).toBe('RESOLVED');
    expect(result.matchedProjectId).toBe(expected);
    expect(result.state?.activeProject).toBe(expected);
    expect(result.state?.hypotheses.length).toBeGreaterThan(0);
    expect(result.state?.nextBestAction).toBeTruthy();
  });

  it('uses an explicit runtime project id over noisy local transcript text', async () => {
    const provider = new MemoryProvider();
    const result = await resolveLiveContinuity({
      utterance: 'Sigue',
      explicitProjectId: 'STRATEGY_FACTORY',
      conversationTitle: 'Mixed notes',
      recentTurns: [
        { role: 'assistant', content: 'Ayer también trabajamos Exor, Lingotto, Artsruni y ProPicks.' },
      ],
    }, provider);

    expect(result.status).toBe('RESOLVED');
    expect(result.matchedProjectId).toBe('STRATEGY_FACTORY');
    expect(result.reason).toBe('explicit_runtime_project');
  });

  it('fails closed instead of selecting a project when local context is genuinely ambiguous', async () => {
    const provider = new MemoryProvider();
    const result = await resolveLiveContinuity({
      utterance: 'Sigue',
      conversationTitle: 'Investigaciones',
      recentTurns: [
        { role: 'user', content: 'Strategy Factory: falta el brazo nulo. Elite Capital Signal: falta el backtest post-filing.' },
      ],
    }, provider);

    expect(result.status).toBe('AMBIGUOUS');
    expect(result.state).toBeNull();
    expect(result.matchedProjectId).toBeNull();
  });

  it('fails closed when the Notion registry cannot be read', async () => {
    const provider: ContinuityRegistryProvider = {
      async listActive() {
        throw new Error('notion_unavailable');
      },
    };

    const result = await resolveLiveContinuity({
      utterance: 'Sigue',
      conversationTitle: 'Atlas AI',
      recentTurns: [{ role: 'user', content: 'Seguimos con Atlas AI.' }],
    }, provider);

    expect(result.status).toBe('REGISTRY_UNAVAILABLE');
    expect(result.state).toBeNull();
    expect(result.matchedProjectId).toBeNull();
  });

  it('queries the real Notion data-source endpoint shape and maps active rows into registry records', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe('https://api.notion.com/v1/data_sources/ds-123/query');
      expect(init?.method).toBe('POST');
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer secret-token');
      expect(headers['Notion-Version']).toBe('2026-03-11');
      const body = JSON.parse(String(init?.body));
      expect(body.filter).toEqual({ property: 'Active', checkbox: { equals: true } });

      return new Response(JSON.stringify({
        object: 'list',
        has_more: false,
        next_cursor: null,
        results: [{
          object: 'page',
          properties: {
            'Name': { type: 'title', title: [{ plain_text: 'ATLAS AI Ω' }] },
            'Project ID': { type: 'rich_text', rich_text: [{ plain_text: 'ATLAS_AI' }] },
            'State': { type: 'select', select: { name: 'BLOCKED' } },
            'Active': { type: 'checkbox', checkbox: true },
            'Established': { type: 'rich_text', rich_text: [{ plain_text: 'GitHub + Notion are persistent layers.' }] },
            'Hypotheses': { type: 'rich_text', rich_text: [{ plain_text: 'Live binding may solve routing.' }] },
            'Open Loop': { type: 'rich_text', rich_text: [{ plain_text: 'Bind live runtime.' }] },
            'Next Best Action': { type: 'rich_text', rich_text: [{ plain_text: 'Read Notion before Sigue.' }] },
            'Evidence Standard': { type: 'rich_text', rich_text: [{ plain_text: 'PREREGISTERED_CONTINUITY_TEST' }] },
            'Provenance': { type: 'rich_text', rich_text: [{ plain_text: 'live-retest' }] },
            'Updated': { type: 'date', date: { start: '2026-09-06' } },
          },
        }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    });

    const provider = new NotionHttpContinuityRegistryProvider({
      token: 'secret-token',
      dataSourceId: 'ds-123',
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const rows = await provider.listActive();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(1);
    expect(rows[0].projectId).toBe('ATLAS_AI');
    expect(rows[0].state).toBe('BLOCKED');
    expect(rows[0].active).toBe(true);
    expect(rows[0].hypotheses).toEqual(['Live binding may solve routing.']);
  });
});
