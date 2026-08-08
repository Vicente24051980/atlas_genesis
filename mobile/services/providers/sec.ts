export type SecTickerMap = {
  cik: number;
  name: string;
  ticker: string;
  exchange: string | null;
};

export type SecFiling = {
  cik: number;
  companyName: string;
  ticker: string;
  form: string;
  filingDate: string;
  reportDate: string | null;
  accessionNumber: string;
  primaryDocument: string | null;
  filingUrl: string;
};

type JsonObject = Record<string, unknown>;

const SEC_USER_AGENT = 'ATLAS-Omega/0.2 Vicente24051980 github.com/Vicente24051980/atlas_genesis';
const MATERIAL_FORMS = new Set(['10-K', '10-K/A', '10-Q', '10-Q/A', '8-K', '8-K/A', '20-F', '20-F/A', '6-K', '6-K/A', '40-F', '40-F/A']);

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' ? value as JsonObject : {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function secFetch(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': SEC_USER_AGENT,
    },
  });
  if (!response.ok) throw new Error(`SEC EDGAR HTTP ${response.status}`);
  return response.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSecTickerMap(): Promise<Map<string, SecTickerMap>> {
  const raw = asObject(await secFetch('https://www.sec.gov/files/company_tickers_exchange.json'));
  const fields = Array.isArray(raw.fields) ? raw.fields.map(String) : [];
  const data = Array.isArray(raw.data) ? raw.data : [];
  const index = (field: string) => fields.indexOf(field);
  const cikIndex = index('cik');
  const nameIndex = index('name');
  const tickerIndex = index('ticker');
  const exchangeIndex = index('exchange');

  if (cikIndex < 0 || tickerIndex < 0) throw new Error('SEC ticker map: formato no reconocido.');

  const map = new Map<string, SecTickerMap>();
  for (const row of data) {
    if (!Array.isArray(row)) continue;
    const ticker = String(row[tickerIndex] ?? '').trim().toUpperCase();
    const cik = Number(row[cikIndex]);
    if (!ticker || !Number.isFinite(cik)) continue;
    map.set(ticker, {
      cik,
      ticker,
      name: String(row[nameIndex] ?? ticker),
      exchange: exchangeIndex >= 0 ? asString(row[exchangeIndex]) : null,
    });
  }
  return map;
}

export async function fetchRecentSecFilings(
  mapping: SecTickerMap,
  since: Date,
): Promise<SecFiling[]> {
  const cikPadded = String(mapping.cik).padStart(10, '0');
  const raw = asObject(await secFetch(`https://data.sec.gov/submissions/CIK${cikPadded}.json`));
  const filings = asObject(raw.filings);
  const recent = asObject(filings.recent);
  const forms = Array.isArray(recent.form) ? recent.form : [];
  const filingDates = Array.isArray(recent.filingDate) ? recent.filingDate : [];
  const reportDates = Array.isArray(recent.reportDate) ? recent.reportDate : [];
  const accessions = Array.isArray(recent.accessionNumber) ? recent.accessionNumber : [];
  const primaryDocuments = Array.isArray(recent.primaryDocument) ? recent.primaryDocument : [];
  const output: SecFiling[] = [];

  for (let i = 0; i < forms.length; i += 1) {
    const form = String(forms[i] ?? '').trim().toUpperCase();
    const filingDate = String(filingDates[i] ?? '');
    if (!MATERIAL_FORMS.has(form) || !filingDate) continue;
    const filingTime = new Date(`${filingDate}T00:00:00Z`).getTime();
    if (!Number.isFinite(filingTime) || filingTime < since.getTime()) continue;

    const accessionNumber = String(accessions[i] ?? '').trim();
    if (!accessionNumber) continue;
    const accessionNoDashes = accessionNumber.replace(/-/g, '');
    const primaryDocument = asString(primaryDocuments[i]);
    const base = `https://www.sec.gov/Archives/edgar/data/${mapping.cik}/${accessionNoDashes}`;
    const filingUrl = primaryDocument ? `${base}/${primaryDocument}` : `${base}/`;

    output.push({
      cik: mapping.cik,
      companyName: asString(raw.name) ?? mapping.name,
      ticker: mapping.ticker,
      form,
      filingDate,
      reportDate: asString(reportDates[i]),
      accessionNumber,
      primaryDocument,
      filingUrl,
    });
  }

  await sleep(120);
  return output;
}

export async function discoverSecFilingsForTickers(
  tickers: string[],
  sinceDays = 14,
): Promise<{ filings: SecFiling[]; mapped: number; unmapped: string[] }> {
  const map = await fetchSecTickerMap();
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const unique = [...new Set(tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean))];
  const filings: SecFiling[] = [];
  const unmapped: string[] = [];
  let mapped = 0;

  for (const ticker of unique) {
    const mapping = map.get(ticker);
    if (!mapping) {
      unmapped.push(ticker);
      continue;
    }
    mapped += 1;
    const recent = await fetchRecentSecFilings(mapping, since);
    filings.push(...recent);
  }

  return { filings, mapped, unmapped };
}
