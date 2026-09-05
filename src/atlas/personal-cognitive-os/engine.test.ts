import {
  atlasParser,
  buildDailyBrief,
  contextRouter,
  openLoopsEngine,
  processCapture,
  resolveContinuity,
  resolveZeroInbox,
  type ContinuityState,
} from './engine';

describe('ATLAS AI Personal Cognitive OS Ω — Memory Foundation v1', () => {
  it('parses one capture into multiple atomic cognitive units without losing provenance', () => {
    const units = atlasParser({
      id: 'CAP-2026-09-05-001',
      source: 'CONVERSATION',
      createdAt: '2026-09-05T11:30:00+02:00',
      provenance: 'chat:atlas-ai:2026-09-05',
      text: 'He decidido que Atlas use solo GitHub y Notion. También quiero investigar cómo aplicar Astra a Atlas AI.',
    });

    expect(units.some((unit) => unit.type === 'DECISION')).toBe(true);
    expect(units.some((unit) => unit.type === 'ACTION')).toBe(true);
    expect(units.every((unit) => unit.provenance === 'chat:atlas-ai:2026-09-05')).toBe(true);
    expect(units.every((unit) => unit.inferenceStrength === 'EXPLICIT')).toBe(true);
  });

  it('routes one unit to multiple contexts rather than forcing a single folder', () => {
    const units = atlasParser({
      id: 'CAP-ROUTE-1',
      source: 'TEXT',
      createdAt: '2026-09-05T11:31:00+02:00',
      provenance: 'chat:test',
      text: 'Hay que revisar Atlas AI y dejarlo como open loop.',
    });
    const actionUnit = units.find((candidate) => candidate.type === 'ACTION');
    expect(actionUnit).toBeDefined();
    if (!actionUnit) throw new Error('expected_action_unit');

    const routed = contextRouter(actionUnit);
    expect(routed.projects).toContain('ATLAS_AI');
    expect(routed.contexts).toContain('ACTIONS');
  });

  it('creates a persistent open loop with next best action and context', () => {
    const result = processCapture({
      id: 'CAP-OL-1',
      source: 'CONVERSATION',
      createdAt: '2026-09-05T11:32:00+02:00',
      provenance: 'chat:dinastia:artsruni',
      text: 'Queda pendiente comprobar Artsruni → Mesopotamia con evidencia académica.',
    });

    expect(result.openLoops).toHaveLength(1);
    expect(result.openLoops[0].project).toBe('DINASTIA_OMEGA');
    expect(result.openLoops[0].status).toBe('ACTIVE');
    expect(result.openLoops[0].nextBestAction).toContain('comprobar Artsruni');
    expect(result.openLoops[0].createdFrom).toBe('chat:dinastia:artsruni');
  });

  it('marks date-dependent loose ends as WAITING under Zero-Inbox', () => {
    const result = processCapture({
      id: 'CAP-WAIT-1',
      source: 'TEXT',
      createdAt: '2026-09-05T11:33:00+02:00',
      provenance: 'chat:portfolio',
      text: 'Queda pendiente: el martes revisamos si merece la pena meter más dinero en la cartera.',
    });

    const waitingLoop = result.openLoops.find((loop) => loop.status === 'WAITING');
    expect(waitingLoop).toBeDefined();
    if (!waitingLoop) throw new Error('expected_waiting_loop');

    const sourceUnit = result.units.find((unit) => unit.id === waitingLoop.sourceUnitId);
    expect(sourceUnit).toBeDefined();
    if (!sourceUnit) throw new Error('expected_source_unit');

    const resolution = resolveZeroInbox(sourceUnit, waitingLoop);
    expect(resolution.state).toBe('WAITING');
  });

  it('never promotes an evidence mention to FACT before validation', () => {
    const units = atlasParser({
      id: 'CAP-EVIDENCE-1',
      source: 'TEXT',
      createdAt: '2026-09-05T11:33:30+02:00',
      provenance: 'chat:research',
      text: 'La evidencia académica parece apoyar esta conexión.',
    });
    const evidence = units.find((unit) => unit.type === 'EVIDENCE');
    expect(evidence?.epistemicClass).toBe('USER_STATED');
  });

  it('never stores an explicit user preference as an inferred prediction', () => {
    const units = atlasParser({
      id: 'CAP-PREF-1',
      source: 'TEXT',
      createdAt: '2026-09-05T11:34:00+02:00',
      provenance: 'chat:portfolio',
      text: 'Prefiero mantener LMB mientras la tesis estructural siga intacta.',
    });

    const preference = units.find((unit) => unit.type === 'PREFERENCE');
    expect(preference?.epistemicClass).toBe('PREFERENCE');
    expect(preference?.inferenceStrength).toBe('EXPLICIT');
    expect(preference?.confidence).toBe(1);
  });

  it('builds a briefing from surfaced items rather than exposing all internal processing', () => {
    const result = processCapture({
      id: 'CAP-BRIEF-1',
      source: 'CONVERSATION',
      createdAt: '2026-09-05T11:35:00+02:00',
      provenance: 'chat:mixed',
      text: 'He visto Astra y puede ser interesante. Hay que revisar cómo aplicarlo a Atlas AI. Queda pendiente acabar Artsruni.',
    });

    const brief = buildDailyBrief(result.units, result.openLoops, result.executive);
    expect(brief.length).toBeGreaterThan(0);
    expect(brief.length).toBeLessThanOrEqual(5);
    expect(brief.some((item) => item.includes('ATLAS_AI') || item.includes('Atlas AI'))).toBe(true);
  });

  it('passes the first MVP acceptance test: a bare Sigue resumes the correct open loop', () => {
    const state: ContinuityState = {
      activeProject: 'DINASTIA_OMEGA',
      established: [
        'Artsruni is a historically attested Armenian noble house.',
        'The proposed deep lineage remains incomplete.',
      ],
      hypotheses: [
        'A defensible path may connect the Artsruni context toward Mesopotamian political networks.',
      ],
      openLoops: [
        {
          id: 'OL-DINASTIA-ARTSRUNI',
          project: 'DINASTIA_OMEGA',
          subject: 'Artsruni → Mesopotamia',
          status: 'ACTIVE',
          createdFrom: 'chat:dinastia:artsruni',
          objective: 'Establish strongest defensible lineage toward Mesopotamia',
          evidenceRequired: 'PRIMARY_OR_ACADEMIC',
          lastProgress: 'Lineage remains partially unresolved',
          nextBestAction: 'Test the strongest remaining Artsruni-to-Mesopotamia bridge against primary or academic evidence',
          waitingFor: null,
          confidence: 0.87,
          sourceUnitId: 'U-ARTSRUNI',
        },
        {
          id: 'OL-ATLAS-AI',
          project: 'ATLAS_AI',
          subject: 'Memory Foundation',
          status: 'ACTIVE',
          createdFrom: 'chat:atlas-ai',
          objective: 'Implement capture continuity',
          evidenceRequired: null,
          lastProgress: null,
          nextBestAction: 'Implement persistence adapter',
          waitingFor: null,
          confidence: 0.99,
          sourceUnitId: 'U-ATLAS-AI',
        },
      ],
      nextBestAction: null,
      provenance: [],
    };

    const resumed = resolveContinuity('Sigue', state);
    expect(resumed.activeProject).toBe('DINASTIA_OMEGA');
    expect(resumed.nextBestAction).toContain('Artsruni-to-Mesopotamia');
    expect(resumed.provenance).toContain('chat:dinastia:artsruni');
    expect(resumed.established).toHaveLength(2);
    expect(resumed.hypotheses).toHaveLength(1);
  });

  it('does not invent continuity when no open loop exists', () => {
    const resumed = resolveContinuity('Sigue', {
      activeProject: null,
      established: [],
      hypotheses: [],
      openLoops: [],
      nextBestAction: 'stale value',
      provenance: [],
    });
    expect(resumed.nextBestAction).toBeNull();
  });

  it('creates open loop objects only from OPEN_LOOP units', () => {
    const unit = contextRouter(atlasParser({
      id: 'CAP-IDEA-1',
      source: 'TEXT',
      createdAt: '2026-09-05T11:36:00+02:00',
      provenance: 'chat:idea',
      text: 'Astra puede tener implicaciones para Atlas AI.',
    })[0]);

    expect(openLoopsEngine(unit)).toBeNull();
  });
});
