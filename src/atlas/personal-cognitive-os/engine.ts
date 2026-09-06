export type CaptureSource = 'VOICE' | 'TEXT' | 'CONVERSATION' | 'IMPORT';

export type CognitiveUnitType =
  | 'IDEA'
  | 'DECISION'
  | 'ACTION'
  | 'COMMITMENT'
  | 'PERSON'
  | 'QUESTION'
  | 'EVIDENCE'
  | 'PREFERENCE'
  | 'OPEN_LOOP';

export type ZeroInboxState =
  | 'ARCHIVED'
  | 'KNOWLEDGE'
  | 'ACTION'
  | 'WAITING'
  | 'DISMISSED';

export type EpistemicClass =
  | 'FACT'
  | 'USER_STATED'
  | 'INFERENCE'
  | 'PREFERENCE'
  | 'HYPOTHESIS'
  | 'PREDICTION'
  | 'STALE_MEMORY'
  | 'CONTRADICTION';

export type InferenceStrength =
  | 'EXPLICIT'
  | 'DERIVED_HIGH'
  | 'DERIVED_MEDIUM'
  | 'DERIVED_LOW'
  | 'UNKNOWN';

export type CaptureInput = {
  id: string;
  text: string;
  source: CaptureSource;
  createdAt: string;
  projectHints?: string[];
  contextHints?: string[];
  provenance: string;
};

export type CognitiveUnit = {
  id: string;
  captureId: string;
  type: CognitiveUnitType;
  text: string;
  epistemicClass: EpistemicClass;
  inferenceStrength: InferenceStrength;
  confidence: number;
  provenance: string;
  createdAt: string;
  projectHints: string[];
  contextHints: string[];
};

export type RoutedUnit = CognitiveUnit & {
  projects: string[];
  contexts: string[];
  routingConfidence: number;
};

export type OpenLoopStatus =
  | 'ACTIVE'
  | 'WAITING'
  | 'BLOCKED'
  | 'RESOLVED'
  | 'DISMISSED';

export type OpenLoop = {
  id: string;
  project: string | null;
  subject: string;
  status: OpenLoopStatus;
  createdFrom: string;
  objective: string;
  evidenceRequired: string | null;
  lastProgress: string | null;
  nextBestAction: string;
  waitingFor: string | null;
  confidence: number;
  sourceUnitId: string;
};

export type InboxResolution = {
  unitId: string;
  state: ZeroInboxState;
  reason: string;
};

export type ExecutiveItem = {
  unitId: string;
  priority: number;
  reason: string;
  surface: 'LIVE' | 'DAILY_BRIEF' | 'SILENT';
};

export type ContinuityState = {
  activeProject: string | null;
  established: string[];
  hypotheses: string[];
  openLoops: OpenLoop[];
  nextBestAction: string | null;
  provenance: string[];
};

export const PERSONAL_COGNITIVE_OS_MANIFEST = {
  id: 'ATLAS_AI_PERSONAL_COGNITIVE_OS_MEMORY_FOUNDATION_OMEGA_V1',
  version: '1.0.0',
  status: 'experimental',
  persistentStores: ['NOTION', 'GITHUB'] as const,
  invariants: [
    'MEMORY_IS_NOT_DIGITAL_TWIN',
    'EXPLICIT_USER_STATEMENT_MUST_NOT_BE_DOWNCAST_TO_INFERENCE',
    'EVIDENCE_MENTION_MUST_NOT_BE_AUTOMATICALLY_PROMOTED_TO_FACT',
    'PREDICTION_MUST_NOT_BE_STORED_AS_EXPLICIT_MEMORY',
    'ZERO_INBOX_REQUIRES_TERMINAL_CLASSIFICATION',
    'OPEN_LOOPS_ARE_FIRST_CLASS_PERSISTENT_OBJECTS',
    'ROUTING_IS_MANY_TO_MANY',
    'SIMPLE_FOLLOWUP_MUST_RESOLVE_ACTIVE_CONTEXT_WHEN_EVIDENCE_IS_SUFFICIENT',
    'GITHUB_AND_NOTION_REMAIN_ONLY_PERSISTENT_KNOWLEDGE_LAYERS',
  ] as const,
} as const;

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
}

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

const OPEN_LOOP_PATTERNS = [
  /\bqueda(?:n)? pendiente\b/i,
  /\bmañana (?:miramos|vemos|revisamos)\b/i,
  /\bsigue\b/i,
  /\bacu[eé]rdate\b/i,
  /\bfalta (?:comprobar|revisar|cerrar|terminar)\b/i,
  /\bcuando (?:ocurra|publiquen|salga|llegue)\b/i,
  /\bhay que (?:terminar|cerrar|comprobar|revisar|investigar)\b/i,
  /\bquiero investigar\b/i,
  /\bno hemos (?:cerrado|terminado|resuelto)\b/i,
  /\baverigua\b/i,
];

const ACTION_PATTERNS = [
  /\bhay que\b/i,
  /\bquiero (?:revisar|hacer|comprobar|analizar|auditar|investigar)\b/i,
  /\brevisa\b/i,
  /\banaliza\b/i,
  /\baudita\b/i,
  /\bcomprueba\b/i,
  /\baverigua\b/i,
];

const DECISION_PATTERNS = [
  /\bhe decidido\b/i,
  /\bdecido\b/i,
  /\bse queda\b/i,
  /\bno sale\b/i,
  /\bqueda como\b/i,
  /\bpasamos a\b/i,
];

const PREFERENCE_PATTERNS = [
  /\bprefiero\b/i,
  /\bno quiero\b/i,
  /\bme gusta\b/i,
  /\bquiero que\b/i,
  /\bmi objetivo\b/i,
];

const EVIDENCE_PATTERNS = [
  /\bfuente\b/i,
  /\bevidencia\b/i,
  /\bfiling\b/i,
  /\bdocumenta\b/i,
  /\bconfirmado\b/i,
  /\bdemostrado\b/i,
];

const COMMITMENT_PATTERNS = [
  /\bme comprometo\b/i,
  /\blo har[eé]\b/i,
  /\bte digo el\b/i,
  /\bmañana har[eé]\b/i,
];

function splitAtomicFragments(text: string): string[] {
  return normalize(text)
    .split(/(?<=[.!?;])\s+|\s+(?:y adem[aá]s|adem[aá]s|también)\s+/i)
    .map(normalize)
    .filter(Boolean);
}

function classifyFragment(fragment: string): CognitiveUnitType[] {
  const types = new Set<CognitiveUnitType>();
  if (hasAny(fragment, OPEN_LOOP_PATTERNS)) types.add('OPEN_LOOP');
  if (hasAny(fragment, ACTION_PATTERNS)) types.add('ACTION');
  if (hasAny(fragment, DECISION_PATTERNS)) types.add('DECISION');
  if (hasAny(fragment, PREFERENCE_PATTERNS)) types.add('PREFERENCE');
  if (hasAny(fragment, EVIDENCE_PATTERNS)) types.add('EVIDENCE');
  if (hasAny(fragment, COMMITMENT_PATTERNS)) types.add('COMMITMENT');
  if (/\?$/.test(fragment)) types.add('QUESTION');
  if (/\b(?:persona|madre|padre|hija|amigo|contacto|cliente|abogado|m[eé]dico)\b/i.test(fragment)) types.add('PERSON');
  if (types.size === 0) types.add('IDEA');
  return [...types];
}

function epistemicFor(type: CognitiveUnitType): EpistemicClass {
  if (type === 'PREFERENCE') return 'PREFERENCE';
  if (type === 'QUESTION') return 'HYPOTHESIS';
  // Parsing a mention of evidence does not verify the underlying claim.
  // Promotion to FACT belongs to a later validator with traceable provenance.
  return 'USER_STATED';
}

export function atlasCapture(input: CaptureInput): CaptureInput {
  if (!input.id.trim()) throw new Error('atlas_capture_requires_id');
  if (!normalize(input.text)) throw new Error('atlas_capture_requires_text');
  if (!input.createdAt.trim()) throw new Error('atlas_capture_requires_created_at');
  if (!input.provenance.trim()) throw new Error('atlas_capture_requires_provenance');
  return {
    ...input,
    text: normalize(input.text),
    projectHints: [...(input.projectHints ?? [])],
    contextHints: [...(input.contextHints ?? [])],
  };
}

export function atlasParser(capture: CaptureInput): CognitiveUnit[] {
  const normalized = atlasCapture(capture);
  const fragments = splitAtomicFragments(normalized.text);
  const units: CognitiveUnit[] = [];

  fragments.forEach((fragment, fragmentIndex) => {
    const types = classifyFragment(fragment);
    types.forEach((type, typeIndex) => {
      units.push({
        id: `${normalized.id}:U${fragmentIndex + 1}.${typeIndex + 1}`,
        captureId: normalized.id,
        type,
        text: fragment,
        epistemicClass: epistemicFor(type),
        inferenceStrength: 'EXPLICIT',
        confidence: 1,
        provenance: normalized.provenance,
        createdAt: normalized.createdAt,
        projectHints: [...(normalized.projectHints ?? [])],
        contextHints: [...(normalized.contextHints ?? [])],
      });
    });
  });

  return units;
}

export function contextRouter(unit: CognitiveUnit, knownProjects: string[] = []): RoutedUnit {
  const text = unit.text.toLocaleLowerCase('es');
  const projects = new Set(unit.projectHints);
  const contexts = new Set(unit.contextHints);

  for (const project of knownProjects) {
    if (text.includes(project.toLocaleLowerCase('es'))) projects.add(project);
  }

  const domainRules: Array<[RegExp, string]> = [
    [/\b(?:cartera|ticker|inversi[oó]n|mercado|lmb|atlas financiero)\b/i, 'ATLAS_FINANCIERO_OMEGA'],
    [/\b(?:artsruni|dinast[ií]a|genealog[ií]a|mesopotamia)\b/i, 'DINASTIA_OMEGA'],
    [/\b(?:atlas ai|cognitive kernel|capture|open loops|gemelo digital)\b/i, 'ATLAS_AI'],
    [/\b(?:nerea|estudios|aprendizaje)\b/i, 'NEREA_OMEGA'],
    [/\b(?:legado|nietos|historia familiar)\b/i, 'LEGADO_OMEGA'],
  ];

  for (const [pattern, project] of domainRules) {
    if (pattern.test(unit.text)) projects.add(project);
  }

  if (unit.type === 'PERSON') contexts.add('RELATIONSHIPS');
  if (unit.type === 'DECISION') contexts.add('DECISION_HISTORY');
  if (unit.type === 'OPEN_LOOP') contexts.add('OPEN_LOOPS');
  if (unit.type === 'ACTION') contexts.add('ACTIONS');

  const routingConfidence = projects.size > 0 || contexts.size > 0 ? 0.95 : 0.5;

  return {
    ...unit,
    projects: [...projects],
    contexts: [...contexts],
    routingConfidence,
  };
}

function deriveObjective(text: string): string {
  return normalize(text)
    .replace(/^(?:sigue|acu[eé]rdate de|queda pendiente|hay que|quiero investigar|averigua)[:\s-]*/i, '')
    .replace(/[.!?]+$/, '');
}

export function openLoopsEngine(unit: RoutedUnit): OpenLoop | null {
  if (unit.type !== 'OPEN_LOOP') return null;

  const subject = deriveObjective(unit.text) || unit.text;
  const waitingMatch = unit.text.match(/\b(?:mañana|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|cuando [^,.!?]+)/i);

  return {
    id: `OL-${unit.id.replace(/[^A-Za-z0-9]/g, '-')}`,
    project: unit.projects[0] ?? null,
    subject,
    status: waitingMatch ? 'WAITING' : 'ACTIVE',
    createdFrom: unit.provenance,
    objective: subject,
    evidenceRequired: /\b(?:fuente|evidencia|comprobar|confirmar|demostrar)\b/i.test(unit.text)
      ? 'TRACEABLE_EVIDENCE_REQUIRED'
      : null,
    lastProgress: null,
    nextBestAction: subject,
    waitingFor: waitingMatch?.[0] ?? null,
    confidence: clampConfidence(unit.routingConfidence),
    sourceUnitId: unit.id,
  };
}

export function resolveZeroInbox(unit: RoutedUnit, openLoop: OpenLoop | null): InboxResolution {
  if (openLoop?.status === 'WAITING') {
    return { unitId: unit.id, state: 'WAITING', reason: 'open_loop_waiting_for_event_or_date' };
  }
  if (unit.type === 'ACTION' || unit.type === 'OPEN_LOOP' || unit.type === 'COMMITMENT') {
    return { unitId: unit.id, state: 'ACTION', reason: 'unit_requires_follow_through' };
  }
  if (unit.type === 'IDEA' || unit.type === 'EVIDENCE' || unit.type === 'DECISION' || unit.type === 'PREFERENCE' || unit.type === 'PERSON') {
    return { unitId: unit.id, state: 'KNOWLEDGE', reason: 'unit_has_durable_context_value' };
  }
  if (unit.type === 'QUESTION') {
    return { unitId: unit.id, state: 'ACTION', reason: 'question_requires_resolution' };
  }
  return { unitId: unit.id, state: 'ARCHIVED', reason: 'no_action_or_durable_knowledge_required' };
}

export function atlasExecutive(
  unit: RoutedUnit,
  resolution: InboxResolution,
  openLoop: OpenLoop | null,
): ExecutiveItem {
  let priority = 0;
  let surface: ExecutiveItem['surface'] = 'SILENT';
  const reasons: string[] = [];

  if (resolution.state === 'ACTION') {
    priority += 50;
    reasons.push('requires_action');
    surface = 'DAILY_BRIEF';
  }
  if (resolution.state === 'WAITING') {
    priority += 35;
    reasons.push('waiting_dependency');
    surface = 'DAILY_BRIEF';
  }
  if (openLoop && openLoop.status === 'ACTIVE') {
    priority += 30;
    reasons.push('active_open_loop');
  }
  if (unit.type === 'DECISION') {
    priority += 20;
    reasons.push('decision_context');
  }
  if (/\b(?:ahora|hoy|urgente|inmediato)\b/i.test(unit.text)) {
    priority += 40;
    reasons.push('time_sensitive');
    surface = 'LIVE';
  }

  return {
    unitId: unit.id,
    priority,
    reason: reasons.join('|') || 'silent_background_processing',
    surface,
  };
}

export function processCapture(
  input: CaptureInput,
  knownProjects: string[] = [],
): {
  units: RoutedUnit[];
  openLoops: OpenLoop[];
  resolutions: InboxResolution[];
  executive: ExecutiveItem[];
} {
  const units = atlasParser(input).map((unit) => contextRouter(unit, knownProjects));
  const openLoops: OpenLoop[] = [];
  const resolutions: InboxResolution[] = [];
  const executive: ExecutiveItem[] = [];

  for (const unit of units) {
    const openLoop = openLoopsEngine(unit);
    if (openLoop) openLoops.push(openLoop);
    const resolution = resolveZeroInbox(unit, openLoop);
    resolutions.push(resolution);
    executive.push(atlasExecutive(unit, resolution, openLoop));
  }

  return { units, openLoops, resolutions, executive };
}

export function buildDailyBrief(
  units: RoutedUnit[],
  openLoops: OpenLoop[],
  executive: ExecutiveItem[],
): string[] {
  const top = [...executive]
    .filter((item) => item.surface !== 'SILENT')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  return top.map((item) => {
    const unit = units.find((candidate) => candidate.id === item.unitId);
    const loop = openLoops.find((candidate) => candidate.sourceUnitId === item.unitId);
    if (!unit) return `Asunto ${item.unitId}`;
    if (loop) return `${loop.project ? `${loop.project}: ` : ''}${loop.nextBestAction}`;
    return unit.text;
  });
}

export function resolveContinuity(
  prompt: string,
  state: ContinuityState,
): ContinuityState {
  const normalizedPrompt = normalize(prompt);
  const isBareContinue = /^(?:sigue|contin[uú]a|adelante|dale)[.!]?$/i.test(normalizedPrompt);
  if (!isBareContinue) return state;

  const candidates = state.openLoops
    .filter((loop) => loop.status === 'ACTIVE' || loop.status === 'WAITING' || loop.status === 'BLOCKED')
    .sort((a, b) => b.confidence - a.confidence);

  if (candidates.length === 0) {
    return { ...state, nextBestAction: null };
  }

  const projectCandidates = state.activeProject
    ? candidates.filter((loop) => loop.project === state.activeProject)
    : candidates;
  const selected = projectCandidates[0] ?? candidates[0];

  return {
    ...state,
    activeProject: selected.project ?? state.activeProject,
    nextBestAction: selected.nextBestAction,
    provenance: Array.from(new Set([...state.provenance, selected.createdFrom])),
  };
}
