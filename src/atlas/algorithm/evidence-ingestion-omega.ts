import { EVIDENCE_INGESTION_ENGINE_ID, EVIDENCE_INGESTION_POSITION } from '../evidence-ingestion/engine';

export const ATLAS_MOBILE_FIRST_RULE = {
  id: 'MOBILE_FIRST_OMEGA',
  status: 'canonical',
  statement:
    'ATLAS Omega is designed for mobile and mobile apps first. Desktop workflows are implementation helpers, not the default user surface.',
} as const;

export const EVIDENCE_INGESTION_OMEGA_ALGORITHM_NODE = {
  id: EVIDENCE_INGESTION_ENGINE_ID,
  name: 'Evidence Ingestion Omega v1.0',
  status: 'canonical',
  position: 'before_validation_and_all_investment_engines',
  mobileFirst: true,
  purpose:
    'Transform public sources, uploaded files, mobile screenshots, shared URLs and pasted text into traceable Evidence Omega records before any Atlas decision engine runs.',
  canonicalPipeline: EVIDENCE_INGESTION_POSITION,
  allowedCoreAdapters: ['markitdown', 'firecrawl', 'crawl4ai', 'scrapy', 'playwright'] as const,
  restrictedAdapters: ['curl-impersonate'] as const,
  requiredOutputs: [
    'source',
    'capturedAt',
    'rawHash',
    'extractedTextHash',
    'evidenceLevel',
    'epistemicClass',
    'relatedEngines',
    'mobile.syncStatus',
  ] as const,
  canonicalGuardrails: [
    'No canonical Atlas state changes from level 3 or 4 sources without primary-source confirmation.',
    'Mobile screenshots and social posts enter Radar or Hypothesis, never Fact by default.',
    'No CAPTCHA, paywall, login, private account or anti-abuse bypass in Atlas Core.',
    'Every Decision Log entry must link to at least one EvidenceRecord.',
  ] as const,
} as const;

export const ATLAS_CANONICAL_ALGORITHM_WITH_EVIDENCE_INGESTION = [
  'MOBILE_INPUT',
  'EVIDENCE_INGESTION_OMEGA_V1',
  'VALIDATION_HARNESS_OMEGA',
  'EPISTEMIC_CLASSIFICATION',
  'GLOBAL_DISCOVERY',
  'MARKET_FILTERS',
  'BUSINESS_QUALITY_OMEGA',
  'GROWTH_OMEGA',
  'CAPEX_PRODUCTIVITY_OMEGA',
  'VALUATION_OMEGA',
  'RISK_OMEGA',
  'CATALYSTS_OMEGA',
  'FINAL_SCORE_OMEGA',
  'DECISION_LOG_OMEGA',
] as const;
