import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_KEY = 'atlas.watchlist.v1';
const AUDIT_RESULTS_KEY = 'atlas.audit-results.v1';

export type AuditResultRecord = {
  id: string;
  ticker: string;
  createdAt: string;
  provider: string;
  companyName: string;
  sector: string | null;
  price: number | null;
  marketCap: number | null;
  pe: number | null;
  capexPosition: string | null;
  note: string;
};

function normalizeTicker(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9.\-]/g, '').slice(0, 24);
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const WatchlistStore = {
  async list(): Promise<string[]> {
    const rows = await readJson<string[]>(WATCHLIST_KEY, []);
    return Array.from(new Set(rows.map(normalizeTicker).filter(Boolean)));
  },
  async add(ticker: string): Promise<string[]> {
    const symbol = normalizeTicker(ticker);
    if (!symbol) return this.list();
    const next = Array.from(new Set([symbol, ...(await this.list())]));
    await writeJson(WATCHLIST_KEY, next);
    return next;
  },
  async remove(ticker: string): Promise<string[]> {
    const symbol = normalizeTicker(ticker);
    const next = (await this.list()).filter((item) => item !== symbol);
    await writeJson(WATCHLIST_KEY, next);
    return next;
  },
};

export const AuditResultStore = {
  async list(): Promise<AuditResultRecord[]> {
    const rows = await readJson<AuditResultRecord[]>(AUDIT_RESULTS_KEY, []);
    return rows
      .filter((row) => row && typeof row.id === 'string' && typeof row.ticker === 'string')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async save(record: AuditResultRecord): Promise<AuditResultRecord[]> {
    const current = await this.list();
    const next = [record, ...current.filter((row) => row.id !== record.id)].slice(0, 250);
    await writeJson(AUDIT_RESULTS_KEY, next);
    return next;
  },
  async remove(id: string): Promise<AuditResultRecord[]> {
    const next = (await this.list()).filter((row) => row.id !== id);
    await writeJson(AUDIT_RESULTS_KEY, next);
    return next;
  },
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(AUDIT_RESULTS_KEY);
  },
};
