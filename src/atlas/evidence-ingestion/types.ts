export type EvidenceSourceType =
  | 'sec_filing'
  | 'investor_relations'
  | 'earnings_transcript'
  | 'press_release'
  | 'regulatory'
  | 'macro_source'
  | 'news'
  | 'uploaded_document'
  | 'web_page'
  | 'mobile_capture'
  | 'social_post';

export type IngestionAdapter =
  | 'markitdown'
  | 'firecrawl'
  | 'crawl4ai'
  | 'scrapy'
  | 'playwright'
  | 'crawlee'
  | 'manual'
  | 'mobile_capture';

export type EvidenceLevel = 1 | 2 | 3 | 4;

export type EpistemicClass =
  | 'fact'
  | 'evidence'
  | 'hypothesis'
  | 'interpretation'
  | 'speculation'
  | 'noise';

export type AtlasEngineId =
  | 'GLOBAL_DISCOVERY'
  | 'MARKET_FILTERS'
  | 'BUSINESS_QUALITY_OMEGA'
  | 'GROWTH_OMEGA'
  | 'CAPEX_PRODUCTIVITY_OMEGA'
  | 'VALUATION_OMEGA'
  | 'RISK_OMEGA'
  | 'CATALYSTS_OMEGA'
  | 'MONEY_ROTATION_OMEGA'
  | 'HISTORICAL_DISLOCATION_OMEGA'
  | 'FUTUROS_PROTECTORES_DIGITALES'
  | 'CONSPIRACIONES_ATLAS'
  | 'NARRATIVE_SATURATION_OMEGA'
  | 'PHOENIX_2026_MONITOR_OMEGA'
  | 'FINAL_SCORE_OMEGA';

export type MobileInputKind =
  | 'share_url'
  | 'upload_file'
  | 'paste_text'
  | 'screenshot'
  | 'manual_note'
  | 'synced_source';

export type EvidenceRecord = {
  id: string;
  sourceUrl?: string;
  sourceFile?: string;
  sourceType: EvidenceSourceType;
  capturedAt: string;
  publisher?: string;
  title?: string;
  rawHash: string;
  extractedTextHash: string;
  extractionAdapter: IngestionAdapter;
  evidenceLevel: EvidenceLevel;
  epistemicClass: EpistemicClass;
  relatedTickers: string[];
  relatedEngines: AtlasEngineId[];
  summary: string;
  keyClaims: string[];
  limitations: string[];
  mobile: {
    inputKind: MobileInputKind;
    offlineReady: boolean;
    syncStatus: 'local_only' | 'pending_sync' | 'synced' | 'failed';
  };
};

export type EvidenceIngestionInput = {
  inputKind: MobileInputKind;
  sourceUrl?: string;
  sourceFile?: string;
  extractedText: string;
  sourceType: EvidenceSourceType;
  adapter: IngestionAdapter;
  capturedAt: string;
  publisher?: string;
  title?: string;
  relatedTickers?: string[];
  relatedEngines?: AtlasEngineId[];
};

export type EvidenceValidationResult = {
  status: 'PASS' | 'QUARANTINED' | 'REJECT';
  reasons: string[];
  evidenceLevel: EvidenceLevel;
  epistemicClass: EpistemicClass;
};