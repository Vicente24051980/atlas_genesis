import type { ContinuityState, OpenLoop } from './engine';

export type ContinuityRegistryState = 'ACTIVE' | 'WAITING' | 'BLOCKED' | 'CLOSED';

export type ContinuityRegistryRecord = {
  projectId: string;
  name: string;
  aliases?: string[];
  state: ContinuityRegistryState;
  active: boolean;
  established: string[];
  hypotheses: string[];
  openLoop: string | null;
  nextBestAction: string | null;
  evidenceStandard: string | null;
  provenance: string[];
  updatedAt: string;
};

export type ContinuityRetrievalInput = {
  utterance: string;
  activeProjectHint?: string | null;
  projectHint?: string | null;
};

export type ContinuityRetrievalResult = {
  matchedProjectId: string | null;
  confidence: number;
  ambiguous: boolean;
  state: ContinuityState | null;
  reason: string;
};

const CONTINUE_PATTERN = /^(?:sigue|contin[uú]a|seguimos|retoma|continua)$/i;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9_]+/i)
    .filter((token) => token.length >= 3);
}

function lexicalScore(query: string, record: ContinuityRegistryRecord): number {
  const q = new Set(tokenize(query));
  if (q.size === 0) return 0;
  const corpus = new Set(tokenize([
    record.projectId,
    record.name,
    ...(record.aliases ?? []),
    record.openLoop ?? '',
    record.nextBestAction ?? '',
    ...record.established,
    ...record.hypotheses,
  ].join(' ')));
  const hits = [...q].filter((token) => corpus.has(token)).length;
  return hits / q.size;
}

function toOpenLoop(record: ContinuityRegistryRecord): OpenLoop[] {
  if (!record.openLoop || !record.nextBestAction || record.state === 'CLOSED') return [];
  return [{
    id: `OL-REGISTRY-${record.projectId}`,
    project: record.projectId,
    subject: record.openLoop,
    status: record.state === 'WAITING' ? 'WAITING' : record.state === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
    createdFrom: record.provenance[0] ?? 'notion:continuity-registry',
    objective: record.openLoop,
    evidenceRequired: record.evidenceStandard,
    lastProgress: null,
    nextBestAction: record.nextBestAction,
    waitingFor: record.state === 'WAITING' ? 'external dependency' : null,
    confidence: 1,
    sourceUnitId: `REGISTRY-${record.projectId}`,
  }];
}

function toState(record: ContinuityRegistryRecord): ContinuityState {
  return {
    activeProject: record.projectId,
    established: [...record.established],
    hypotheses: [...record.hypotheses],
    openLoops: toOpenLoop(record),
    nextBestAction: record.nextBestAction,
    provenance: [...record.provenance],
  };
}

export function retrieveContinuityFromRegistry(
  input: ContinuityRetrievalInput,
  records: ContinuityRegistryRecord[],
): ContinuityRetrievalResult {
  const available = records.filter((record) => record.active && record.state !== 'CLOSED');
  if (available.length === 0) {
    return { matchedProjectId: null, confidence: 0, ambiguous: false, state: null, reason: 'no_active_registry_records' };
  }

  const explicitHint = input.projectHint ?? input.activeProjectHint ?? null;
  if (explicitHint) {
    const normalizedHint = normalize(explicitHint);
    const exact = available.filter((record) =>
      normalize(record.projectId) === normalizedHint ||
      normalize(record.name) === normalizedHint ||
      (record.aliases ?? []).some((alias) => normalize(alias) === normalizedHint),
    );
    if (exact.length === 1) {
      return {
        matchedProjectId: exact[0].projectId,
        confidence: 1,
        ambiguous: false,
        state: toState(exact[0]),
        reason: 'exact_project_hint',
      };
    }
  }

  if (CONTINUE_PATTERN.test(input.utterance.trim())) {
    if (input.activeProjectHint) {
      const normalizedHint = normalize(input.activeProjectHint);
      const active = available.filter((record) =>
        normalize(record.projectId) === normalizedHint ||
        normalize(record.name) === normalizedHint ||
        (record.aliases ?? []).some((alias) => normalize(alias) === normalizedHint),
      );
      if (active.length === 1) {
        return {
          matchedProjectId: active[0].projectId,
          confidence: 1,
          ambiguous: false,
          state: toState(active[0]),
          reason: 'bare_continue_resolved_by_active_project',
        };
      }
    }

    if (available.length === 1) {
      return {
        matchedProjectId: available[0].projectId,
        confidence: 1,
        ambiguous: false,
        state: toState(available[0]),
        reason: 'single_active_project',
      };
    }

    return {
      matchedProjectId: null,
      confidence: 0,
      ambiguous: true,
      state: null,
      reason: 'bare_continue_requires_active_project_context',
    };
  }

  const ranked = available
    .map((record) => ({ record, score: lexicalScore(input.utterance, record) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];
  if (!best || best.score < 0.5) {
    return { matchedProjectId: null, confidence: best?.score ?? 0, ambiguous: false, state: null, reason: 'insufficient_retrieval_evidence' };
  }
  if (second && best.score - second.score < 0.2) {
    return { matchedProjectId: null, confidence: best.score, ambiguous: true, state: null, reason: 'ambiguous_project_retrieval' };
  }

  return {
    matchedProjectId: best.record.projectId,
    confidence: Math.round(best.score * 100) / 100,
    ambiguous: false,
    state: toState(best.record),
    reason: 'lexical_project_match',
  };
}

export function assertNoEpistemicPromotion(record: ContinuityRegistryRecord, state: ContinuityState): void {
  for (const hypothesis of record.hypotheses) {
    if (state.established.includes(hypothesis)) {
      throw new Error(`epistemic_promotion_detected:${record.projectId}`);
    }
  }
}
