import { atlasApiBaseUrl } from './atlasOnlineApi';

export type PrimaryEvidence = {
  form: string;
  filingDate: string | null;
  reportDate: string | null;
  accessionNumber: string | null;
  primaryDocument: string | null;
  items: string[];
  sourceUrl: string | null;
  eventClass: string;
  reviewPriority: number;
  sourceQuality: 'PRIMARY';
  admissibility: string;
  thesisImpact: string;
  falsifierConfirmed: boolean;
};

export type EvidenceBundle = {
  symbol: string;
  companyName?: string | null;
  cik?: string | null;
  status: string;
  source: string;
  primaryEvidence: PrimaryEvidence[];
  highPriority?: PrimaryEvidence[];
  observedAt: string;
  guardrail: string;
};

export async function fetchEvidence(symbol: string): Promise<EvidenceBundle> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${atlasApiBaseUrl()}/v1/evidence/${encodeURIComponent(symbol.trim().toUpperCase())}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = typeof payload?.detail === 'string' ? payload.detail : `Evidence API HTTP ${response.status}`;
      throw new Error(detail);
    }
    return payload as EvidenceBundle;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('SEC Evidence Ω no respondió a tiempo.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
