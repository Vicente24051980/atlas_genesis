import { describe, expect, it } from 'vitest';
import { handleContinuityRequest } from './continuity-runtime';

const token = process.env.NOTION_API_KEY ?? '';
const dataSourceId = process.env.ATLAS_CONTINUITY_DATA_SOURCE_ID ?? '';

if (!token || !dataSourceId) {
  throw new Error('real_continuity_integration_requires_NOTION_API_KEY_and_ATLAS_CONTINUITY_DATA_SOURCE_ID');
}

const cases = [
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

describe('ATLAS AI Ω — REAL Notion-backed continuity runtime', () => {
  it.each(cases)('recovers %s from the live Notion registry without epistemic promotion', async (expectedProject, title, context) => {
    const result = await handleContinuityRequest({
      utterance: 'Sigue',
      conversationTitle: title,
      recentTurns: [
        { role: 'user', content: context },
        { role: 'assistant', content: `Último estado local: ${context}` },
      ],
    }, {
      notionToken: token,
      notionDataSourceId: dataSourceId,
    });

    expect(result.runtime).toBe('ATLAS_CONTINUITY_RUNTIME_V1');
    expect(result.registryRead).toBe(true);
    expect(result.status).toBe('RESOLVED');
    expect(result.matchedProjectId).toBe(expectedProject);
    expect(result.state?.activeProject).toBe(expectedProject);
    expect(result.state?.established.length).toBeGreaterThan(0);
    expect(result.state?.hypotheses.length).toBeGreaterThan(0);
    expect(result.state?.openLoops.length).toBeGreaterThan(0);
    expect(result.state?.nextBestAction).toBeTruthy();

    for (const hypothesis of result.state?.hypotheses ?? []) {
      expect(result.state?.established).not.toContain(hypothesis);
    }
  });
});
