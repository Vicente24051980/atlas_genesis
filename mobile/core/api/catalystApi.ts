import { apiBaseUrl } from './mobileApi';

export type CatalystPanelState = 'READY' | 'DATA_GATE';

export type EarningsCatalyst = {
  date?: string | null;
  symbol?: string | null;
  hour?: string | null;
  quarter?: number | null;
  year?: number | null;
  epsEstimate?: number | null;
  revenueEstimate?: number | null;
};

export type MacroCatalyst = {
  time?: string | null;
  country?: string | null;
  event?: string | null;
  impact?: string | null;
  estimate?: number | null;
  prev?: number | null;
  unit?: string | null;
};

export type CatalystPanel<T> = {
  state: CatalystPanelState;
  count: number;
  items: T[];
  detail: string;
};

export type CatalystPayload = {
  source: string;
  generatedAt: string;
  window: { from: string; to: string };
  earnings: CatalystPanel<EarningsCatalyst>;
  macro: CatalystPanel<MacroCatalyst>;
  guardrails: string[];
};

async function request<T>(path: string, timeoutMs = 20000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const row = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
      const rawDetail = row.detail;
      const detail = typeof rawDetail === 'string'
        ? rawDetail
        : rawDetail && typeof rawDetail === 'object'
          ? JSON.stringify(rawDetail)
          : `Catalyst API HTTP ${response.status}`;
      throw new Error(detail);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Catalyst feed no respondió a tiempo.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const CatalystApi = {
  upcoming: (days = 14) => request<CatalystPayload>(`/v1/mobile/catalysts?days=${Math.min(31, Math.max(1, days))}`),
};
