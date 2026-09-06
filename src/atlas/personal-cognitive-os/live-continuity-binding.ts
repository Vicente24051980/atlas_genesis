import {
  assertNoEpistemicPromotion,
  retrieveContinuityFromRegistry,
  type ContinuityRegistryRecord,
  type ContinuityRetrievalResult,
} from './continuity-registry';
import type { ContinuityState } from './engine';

export type LocalConversationTurn = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type LiveContinuityBindingInput = {
  utterance: string;
  conversationTitle?: string | null;
  recentTurns: LocalConversationTurn[];
  explicitProjectId?: string | null;
};

export interface ContinuityRegistryProvider {
  listActive(): Promise<ContinuityRegistryRecord[]>;
}

export type LiveContinuityStatus =
  | 'RESOLVED'
  | 'AMBIGUOUS'
  | 'NO_PROJECT'
  | 'REGISTRY_UNAVAILABLE';

export type LiveContinuityBindingResult = {
  status: LiveContinuityStatus;
  matchedProjectId: string | null;
  state: ContinuityState | null;
  confidence: number;
  reason: string;
  registryRead: boolean;
  diagnostics: {
    bestProjectId: string | null;
    bestScore: number;
    secondScore: number;
  };
};

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'then', 'than',
  'que', 'para', 'con', 'del', 'las', 'los', 'una', 'uno', 'por', 'como', 'esto',
  'esta', 'este', 'hay', 'sigue', 'seguir', 'seguimos', 'continue', 'continua',
]);

function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(' ')
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function stem(token: string): string {
  if (token.length <= 5) return token;
  return token.slice(0, Math.min(7, token.length));
}

function tokenMatches(a: string, b: string): boolean {
  if (a === b) return true;
  const sa = stem(a);
  const sb = stem(b);
  return sa.length >= 5 && sb.length >= 5 && (sa.startsWith(sb) || sb.startsWith(sa));
}

function identityPhrases(record: ContinuityRegistryRecord): string[] {
  return [record.projectId, record.name, ...(record.aliases ?? [])].filter(Boolean);
}

function identityTokens(record: ContinuityRegistryRecord): string[] {
  return [...new Set(identityPhrases(record).flatMap(tokens))];
}

function signatureTokens(record: ContinuityRegistryRecord): string[] {
  return [...new Set([
    ...identityTokens(record),
    ...tokens(record.openLoop ?? ''),
    ...tokens(record.nextBestAction ?? ''),
    ...record.established.flatMap(tokens),
    ...record.hypotheses.flatMap(tokens),
  ])];
}

function sharedTokenCount(left: string[], right: string[]): number {
  const matched = new Set<number>();
  let count = 0;
  for (const token of left) {
    const index = right.findIndex((candidate, i) => !matched.has(i) && tokenMatches(token, candidate));
    if (index >= 0) {
      matched.add(index);
      count += 1;
    }
  }
  return count;
}

function containsIdentityPhrase(text: string, record: ContinuityRegistryRecord): boolean {
  const n = normalize(text);
  return identityPhrases(record).some((phrase) => {
    const p = normalize(phrase);
    return p.length >= 5 && n.includes(p);
  });
}

function scoreConversationEvidence(
  input: LiveContinuityBindingInput,
  record: ContinuityRegistryRecord,
): number {
  let score = 0;
  const idTokens = identityTokens(record);
  const sigTokens = signatureTokens(record);

  if (input.conversationTitle) {
    if (containsIdentityPhrase(input.conversationTitle, record)) score += 40;
    score += sharedTokenCount(tokens(input.conversationTitle), idTokens) * 7;
  }

  const turns = input.recentTurns.slice(-8);
  turns.forEach((turn, index) => {
    const recency = 1 + ((index + 1) / Math.max(1, turns.length));
    if (containsIdentityPhrase(turn.content, record)) score += 20 * recency;
    const turnTokens = tokens(turn.content);
    score += sharedTokenCount(turnTokens, idTokens) * 3 * recency;
    score += Math.min(8, sharedTokenCount(turnTokens, sigTokens)) * recency;
  });

  return Math.round(score * 100) / 100;
}

function inferProjectFromLocalConversation(
  input: LiveContinuityBindingInput,
  records: ContinuityRegistryRecord[],
): { projectId: string | null; ambiguous: boolean; bestScore: number; secondScore: number } {
  const ranked = records
    .map((record) => ({ record, score: scoreConversationEvidence(input, record) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];
  const bestScore = best?.score ?? 0;
  const secondScore = second?.score ?? 0;

  if (!best || bestScore < 6) {
    return { projectId: null, ambiguous: false, bestScore, secondScore };
  }

  const requiredMargin = Math.max(3, bestScore * 0.2);
  if (second && bestScore - secondScore < requiredMargin) {
    return { projectId: null, ambiguous: true, bestScore, secondScore };
  }

  return { projectId: best.record.projectId, ambiguous: false, bestScore, secondScore };
}

function exactProject(
  projectId: string,
  records: ContinuityRegistryRecord[],
): ContinuityRegistryRecord | null {
  const wanted = normalize(projectId);
  return records.find((record) => normalize(record.projectId) === wanted || normalize(record.name) === wanted) ?? null;
}

function fromRetrieval(
  retrieval: ContinuityRetrievalResult,
  reason: string,
  diagnostics: LiveContinuityBindingResult['diagnostics'],
): LiveContinuityBindingResult {
  return {
    status: retrieval.state ? 'RESOLVED' : retrieval.ambiguous ? 'AMBIGUOUS' : 'NO_PROJECT',
    matchedProjectId: retrieval.matchedProjectId,
    state: retrieval.state,
    confidence: retrieval.confidence,
    reason,
    registryRead: true,
    diagnostics,
  };
}

export async function resolveLiveContinuity(
  input: LiveContinuityBindingInput,
  provider: ContinuityRegistryProvider,
): Promise<LiveContinuityBindingResult> {
  let records: ContinuityRegistryRecord[];
  try {
    records = (await provider.listActive()).filter((record) => record.active && record.state !== 'CLOSED');
  } catch {
    return {
      status: 'REGISTRY_UNAVAILABLE',
      matchedProjectId: null,
      state: null,
      confidence: 0,
      reason: 'registry_read_failed',
      registryRead: false,
      diagnostics: { bestProjectId: null, bestScore: 0, secondScore: 0 },
    };
  }

  if (input.explicitProjectId) {
    const exact = exactProject(input.explicitProjectId, records);
    if (!exact) {
      return {
        status: 'NO_PROJECT',
        matchedProjectId: null,
        state: null,
        confidence: 0,
        reason: 'explicit_runtime_project_not_in_registry',
        registryRead: true,
        diagnostics: { bestProjectId: null, bestScore: 0, secondScore: 0 },
      };
    }
    const retrieval = retrieveContinuityFromRegistry(
      { utterance: input.utterance, activeProjectHint: exact.projectId },
      records,
    );
    if (retrieval.state) assertNoEpistemicPromotion(exact, retrieval.state);
    return fromRetrieval(retrieval, 'explicit_runtime_project', {
      bestProjectId: exact.projectId,
      bestScore: 1,
      secondScore: 0,
    });
  }

  const inferred = inferProjectFromLocalConversation(input, records);
  if (!inferred.projectId) {
    return {
      status: inferred.ambiguous ? 'AMBIGUOUS' : 'NO_PROJECT',
      matchedProjectId: null,
      state: null,
      confidence: 0,
      reason: inferred.ambiguous ? 'local_conversation_project_ambiguous' : 'insufficient_local_project_evidence',
      registryRead: true,
      diagnostics: {
        bestProjectId: null,
        bestScore: inferred.bestScore,
        secondScore: inferred.secondScore,
      },
    };
  }

  const record = records.find((candidate) => candidate.projectId === inferred.projectId);
  if (!record) {
    return {
      status: 'NO_PROJECT',
      matchedProjectId: null,
      state: null,
      confidence: 0,
      reason: 'inferred_project_missing_from_registry',
      registryRead: true,
      diagnostics: {
        bestProjectId: inferred.projectId,
        bestScore: inferred.bestScore,
        secondScore: inferred.secondScore,
      },
    };
  }

  const retrieval = retrieveContinuityFromRegistry(
    { utterance: input.utterance, activeProjectHint: record.projectId },
    records,
  );
  if (retrieval.state) assertNoEpistemicPromotion(record, retrieval.state);

  return fromRetrieval(retrieval, 'local_conversation_to_registry_binding', {
    bestProjectId: record.projectId,
    bestScore: inferred.bestScore,
    secondScore: inferred.secondScore,
  });
}

type NotionRichText = { plain_text?: string };
type NotionProperty = {
  type?: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  select?: { name?: string } | null;
  checkbox?: boolean;
  date?: { start?: string } | null;
};
type NotionPage = { properties?: Record<string, NotionProperty> };
type NotionQueryResponse = {
  results?: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
};

function textProperty(properties: Record<string, NotionProperty>, name: string): string {
  const property = properties[name];
  const values = property?.type === 'title' ? property.title : property?.rich_text;
  return (values ?? []).map((item) => item.plain_text ?? '').join('').trim();
}

function selectProperty(properties: Record<string, NotionProperty>, name: string): string {
  return properties[name]?.select?.name?.trim() ?? '';
}

function checkboxProperty(properties: Record<string, NotionProperty>, name: string): boolean {
  return properties[name]?.checkbox === true;
}

function dateProperty(properties: Record<string, NotionProperty>, name: string): string {
  return properties[name]?.date?.start?.trim() ?? '';
}

function optionalText(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

function splitAliases(value: string): string[] {
  return value
    .split(/\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function validState(value: string): ContinuityRegistryRecord['state'] {
  if (value === 'ACTIVE' || value === 'WAITING' || value === 'BLOCKED' || value === 'CLOSED') return value;
  throw new Error(`invalid_notion_continuity_state:${value || 'EMPTY'}`);
}

export function mapNotionPageToContinuityRecord(page: NotionPage): ContinuityRegistryRecord {
  const properties = page.properties ?? {};
  const projectId = textProperty(properties, 'Project ID');
  const name = textProperty(properties, 'Name');
  if (!projectId || !name) throw new Error('invalid_notion_continuity_row_missing_identity');

  const established = textProperty(properties, 'Established');
  const hypotheses = textProperty(properties, 'Hypotheses');
  const provenance = textProperty(properties, 'Provenance');
  const aliases = textProperty(properties, 'Aliases');

  return {
    projectId,
    name,
    aliases: splitAliases(aliases),
    state: validState(selectProperty(properties, 'State')),
    active: checkboxProperty(properties, 'Active'),
    established: established ? [established] : [],
    hypotheses: hypotheses ? [hypotheses] : [],
    openLoop: optionalText(textProperty(properties, 'Open Loop')),
    nextBestAction: optionalText(textProperty(properties, 'Next Best Action')),
    evidenceStandard: optionalText(textProperty(properties, 'Evidence Standard')),
    provenance: provenance ? [provenance] : ['notion:continuity-registry'],
    updatedAt: dateProperty(properties, 'Updated'),
  };
}

export type NotionHttpContinuityRegistryProviderOptions = {
  token: string;
  dataSourceId: string;
  fetchImpl?: typeof fetch;
  notionVersion?: string;
};

export class NotionHttpContinuityRegistryProvider implements ContinuityRegistryProvider {
  private readonly token: string;
  private readonly dataSourceId: string;
  private readonly fetchImpl: typeof fetch;
  private readonly notionVersion: string;

  constructor(options: NotionHttpContinuityRegistryProviderOptions) {
    if (!options.token.trim()) throw new Error('notion_token_required');
    if (!options.dataSourceId.trim()) throw new Error('notion_data_source_id_required');
    this.token = options.token;
    this.dataSourceId = options.dataSourceId.replace(/^collection:\/\//, '');
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.notionVersion = options.notionVersion ?? '2026-03-11';
  }

  async listActive(): Promise<ContinuityRegistryRecord[]> {
    const records: ContinuityRegistryRecord[] = [];
    let startCursor: string | null = null;

    do {
      const body: Record<string, unknown> = {
        filter: { property: 'Active', checkbox: { equals: true } },
        page_size: 100,
      };
      if (startCursor) body.start_cursor = startCursor;

      const response = await this.fetchImpl(
        `https://api.notion.com/v1/data_sources/${this.dataSourceId}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Notion-Version': this.notionVersion,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error(`notion_continuity_query_failed:${response.status}`);
      }

      const payload = await response.json() as NotionQueryResponse;
      for (const page of payload.results ?? []) {
        const record = mapNotionPageToContinuityRecord(page);
        if (record.active && record.state !== 'CLOSED') records.push(record);
      }

      startCursor = payload.has_more ? (payload.next_cursor ?? null) : null;
    } while (startCursor);

    return records;
  }
}
