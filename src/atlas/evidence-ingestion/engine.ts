import type {
  AtlasEngineId,
  EvidenceIngestionInput,
  EvidenceRecord,
  EvidenceValidationResult,
} from './types';

const PRIMARY_SOURCE_TYPES = new Set([
  'sec_filing', 'investor_relations', 'earnings_transcript', 'press_release', 'regulatory',
]);
const SECONDARY_SOURCE_TYPES = new Set(['macro_source', 'news', 'web_page', 'uploaded_document']);
const RADAR_SOURCE_TYPES = new Set(['mobile_capture', 'social_post']);

export const EVIDENCE_INGESTION_ENGINE_ID = 'EVIDENCE_INGESTION_OMEGA_V1' as const;
export const EVIDENCE_INGESTION_POSITION = [
  'MOBILE_INPUT', 'EVIDENCE_INGESTION_OMEGA_V1', 'VALIDATION_HARNESS_OMEGA',
  'EPISTEMIC_CLASSIFICATION', 'GLOBAL_DISCOVERY', 'MARKET_FILTERS',
  'BUSINESS_QUALITY_OMEGA', 'GROWTH_OMEGA', 'CAPEX_PRODUCTIVITY_OMEGA',
  'MONEY_ROTATION_OMEGA', 'HISTORICAL_DISLOCATION_OMEGA', 'CONSPIRACIONES_ATLAS',
  'NARRATIVE_SATURATION_OMEGA', 'PHOENIX_2026_MONITOR_OMEGA',
  'VALUATION_OMEGA', 'RISK_OMEGA', 'CATALYSTS_OMEGA', 'FINAL_SCORE_OMEGA', 'DECISION_LOG_OMEGA',
] as const;

export function validateEvidenceInput(input: EvidenceIngestionInput): EvidenceValidationResult {
  const reasons: string[] = [];
  if (!input.extractedText.trim()) reasons.push('empty_extracted_text');
  if (!input.sourceUrl && !input.sourceFile && input.inputKind !== 'manual_note') reasons.push('missing_traceable_source');
  if (input.adapter === 'playwright' && input.sourceType === 'social_post') reasons.push('browser_adapter_social_post_requires_manual_review');

  if (input.adapter === 'manual' || RADAR_SOURCE_TYPES.has(input.sourceType)) {
    return { status: reasons.length ? 'QUARANTINED' : 'PASS', reasons, evidenceLevel: 4, epistemicClass: 'hypothesis' };
  }
  if (PRIMARY_SOURCE_TYPES.has(input.sourceType)) {
    return { status: reasons.length ? 'QUARANTINED' : 'PASS', reasons, evidenceLevel: 1, epistemicClass: 'evidence' };
  }
  if (SECONDARY_SOURCE_TYPES.has(input.sourceType)) {
    return {
      status: reasons.length ? 'QUARANTINED' : 'PASS', reasons,
      evidenceLevel: input.sourceType === 'macro_source' ? 2 : 3,
      epistemicClass: input.sourceType === 'uploaded_document' ? 'evidence' : 'interpretation',
    };
  }
  return { status: 'QUARANTINED', reasons: [...reasons, 'unknown_source_type'], evidenceLevel: 4, epistemicClass: 'noise' };
}

// Canonical state changes require Level 1 primary evidence. Level 2 may trigger WATCH only.
export function canModifyCanonicalAtlasState(record: EvidenceRecord): boolean {
  return record.evidenceLevel === 1 && (record.epistemicClass === 'fact' || record.epistemicClass === 'evidence');
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function routeEvidenceToEngines(record: EvidenceRecord): AtlasEngineId[] {
  const engines = new Set<AtlasEngineId>(record.relatedEngines);
  const text = `${record.title ?? ''} ${record.summary} ${record.keyClaims.join(' ')}`.toLowerCase();

  if (text.includes('capex') || text.includes('free cash flow') || text.includes('fcf') || text.includes('roic')) {
    engines.add('CAPEX_PRODUCTIVITY_OMEGA');
  }

  const macroRotation = includesAny(text, [
    'gold', 'oil', 'rates', 'dollar', 'flows', 'treasury', 'yield', 'reserve currency', 'foreign exchange', 'currency',
  ]);
  if (macroRotation) {
    engines.add('MONEY_ROTATION_OMEGA');
    engines.add('HISTORICAL_DISLOCATION_OMEGA');
  }

  if (text.includes('security') || text.includes('agent') || text.includes('identity') || text.includes('zero trust')) {
    engines.add('FUTUROS_PROTECTORES_DIGITALES');
  }

  const economistNarrative = includesAny(text, [
    'the economist', 'economist cover', 'magazine cover', 'big mac index', 'global currency beef', 'world currency', 'phoenix',
  ]);
  if (economistNarrative) {
    engines.add('CONSPIRACIONES_ATLAS');
    engines.add('NARRATIVE_SATURATION_OMEGA');
  }

  const monetaryArchitecture = includesAny(text, [
    'phoenix', 'world currency', 'reserve currency', 'sdr', 'special drawing rights', 'brics', 'dedollar', 'de-dollar',
    'central bank gold', 'currency reserves', 'foreign exchange reserves', 'petrodollar', 'cross-border payment',
  ]);
  if (monetaryArchitecture) {
    engines.add('CONSPIRACIONES_ATLAS');
    engines.add('PHOENIX_2026_MONITOR_OMEGA');
    engines.add('MONEY_ROTATION_OMEGA');
    engines.add('HISTORICAL_DISLOCATION_OMEGA');
  }

  if (record.evidenceLevel === 4) engines.add('CONSPIRACIONES_ATLAS');
  return Array.from(engines);
}

export async function buildEvidenceRecord(input: EvidenceIngestionInput, hash: (value: string) => Promise<string>): Promise<EvidenceRecord> {
  const validation = validateEvidenceInput(input);
  const rawHash = await hash(`${input.sourceUrl ?? ''}${input.sourceFile ?? ''}${input.extractedText}`);
  const extractedTextHash = await hash(input.extractedText);
  const draft: EvidenceRecord = {
    id: `evidence_${rawHash.slice(0, 16)}`, sourceUrl: input.sourceUrl, sourceFile: input.sourceFile,
    sourceType: input.sourceType, capturedAt: input.capturedAt, publisher: input.publisher, title: input.title,
    rawHash, extractedTextHash, extractionAdapter: input.adapter, evidenceLevel: validation.evidenceLevel,
    epistemicClass: validation.epistemicClass, relatedTickers: input.relatedTickers ?? [], relatedEngines: input.relatedEngines ?? [],
    summary: input.extractedText.trim().slice(0, 500), keyClaims: [], limitations: validation.reasons,
    mobile: { inputKind: input.inputKind, offlineReady: true, syncStatus: 'pending_sync' },
  };
  return { ...draft, relatedEngines: routeEvidenceToEngines(draft) };
}

export function classifyCanonicalImpact(record: EvidenceRecord): 'canonical' | 'watch' | 'radar' | 'reject' {
  if (canModifyCanonicalAtlasState(record)) return 'canonical';
  if (record.evidenceLevel === 2 || record.evidenceLevel === 3) return 'watch';
  if (record.evidenceLevel === 4 && record.epistemicClass !== 'noise') return 'radar';
  return 'reject';
}