import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const FINNHUB_TOKEN = process.env.FINNHUB_TOKEN || '';
const SEC_USER_AGENT = process.env.SEC_USER_AGENT || 'ATLAS-Omega/0.1 contact@example.com';
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 15_000);

const cache = new Map();
const json = (res, status, body, headers = {}) => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, authorization',
    ...headers,
  });
  res.end(JSON.stringify(body));
};

const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const avg = (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const stdev = (values) => {
  if (values.length < 2) return 0;
  const m = avg(values);
  return Math.sqrt(avg(values.map((v) => (v - m) ** 2)));
};
const pct = (a, b) => finite(a) && finite(b) && b !== 0 ? ((a - b) / b) * 100 : null;
const nowIso = () => new Date().toISOString();

async function cached(key, ttl, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  const value = await loader();
  cache.set(key, { at: Date.now(), value });
  return value;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(12_000),
    ...options,
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`upstream ${response.status}: ${body.slice(0, 220)}`);
  }
  return response.json();
}

function requireFinnhub() {
  if (!FINNHUB_TOKEN) {
    const error = new Error('FINNHUB_TOKEN is not configured on the ATLAS backend.');
    error.code = 'PROVIDER_UNCONFIGURED';
    throw error;
  }
}

async function finnhub(path, params = {}) {
  requireFinnhub();
  const url = new URL(`https://finnhub.io/api/v1/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  url.searchParams.set('token', FINNHUB_TOKEN);
  return fetchJson(url);
}

async function resolveSecurity(query) {
  const normalized = query.trim().toUpperCase();
  const [search, profile] = await Promise.all([
    finnhub('search', { q: normalized }),
    finnhub('stock/profile2', { symbol: normalized }).catch(() => ({})),
  ]);
  const exact = Array.isArray(search?.result)
    ? search.result.find((item) => String(item.symbol || '').toUpperCase() === normalized) || search.result[0]
    : null;
  if (!exact) return null;
  return {
    canonicalTicker: String(exact.symbol || normalized).toUpperCase(),
    companyName: profile?.name || exact.description || normalized,
    exchange: profile?.exchange || exact.displaySymbol || null,
    mic: null,
    isin: null,
    country: profile?.country || null,
    sector: profile?.finnhubIndustry || null,
    industry: profile?.finnhubIndustry || null,
    currency: profile?.currency || null,
    marketCap: finite(profile?.marketCapitalization) ? profile.marketCapitalization : null,
    logo: profile?.logo || null,
    weburl: profile?.weburl || null,
    provider: 'FINNHUB',
    resolvedAt: nowIso(),
  };
}

async function quote(symbol) {
  const q = await finnhub('quote', { symbol });
  const price = finite(q?.c) ? q.c : null;
  const previousClose = finite(q?.pc) ? q.pc : null;
  return {
    provider: 'FINNHUB',
    ticker: symbol,
    price,
    change: finite(q?.d) ? q.d : null,
    changePct: finite(q?.dp) ? q.dp : pct(price, previousClose),
    open: finite(q?.o) ? q.o : null,
    high: finite(q?.h) ? q.h : null,
    low: finite(q?.l) ? q.l : null,
    previousClose,
    timestamp: finite(q?.t) ? new Date(q.t * 1000).toISOString() : nowIso(),
    session: 'UNKNOWN',
  };
}

function rangeToWindow(range) {
  const day = 86_400;
  const windows = { '1M': 35 * day, '3M': 100 * day, '6M': 200 * day, 'YTD': 370 * day, '1Y': 380 * day, '3Y': 1120 * day, '5Y': 1900 * day };
  const to = Math.floor(Date.now() / 1000);
  let from = to - (windows[range] || windows['1Y']);
  if (range === 'YTD') from = Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000) - 7 * day;
  return { from, to };
}

async function candles(symbol, range = '1Y') {
  const { from, to } = rangeToWindow(range);
  const raw = await finnhub('stock/candle', { symbol, resolution: 'D', from, to });
  if (raw?.s !== 'ok' || !Array.isArray(raw?.c)) return [];
  return raw.c.map((close, index) => ({
    t: new Date(raw.t[index] * 1000).toISOString(),
    o: raw.o[index], h: raw.h[index], l: raw.l[index], c: close, v: raw.v[index],
  })).filter((row) => finite(row.c));
}

function streakStats(rows) {
  if (rows.length < 2) return { direction: 'FLAT', length: 0, upDays20: 0, downDays20: 0 };
  let direction = 'FLAT';
  let length = 0;
  for (let i = rows.length - 1; i > 0; i -= 1) {
    const delta = rows[i].c - rows[i - 1].c;
    const d = delta > 0 ? 'UP' : delta < 0 ? 'DOWN' : 'FLAT';
    if (direction === 'FLAT') direction = d;
    if (d !== direction || d === 'FLAT') break;
    length += 1;
  }
  const recent = rows.slice(-21);
  let upDays20 = 0; let downDays20 = 0;
  for (let i = 1; i < recent.length; i += 1) {
    if (recent[i].c > recent[i - 1].c) upDays20 += 1;
    if (recent[i].c < recent[i - 1].c) downDays20 += 1;
  }
  return { direction, length, upDays20, downDays20 };
}

function marketSignals(rows) {
  if (rows.length < 22) {
    return {
      status: 'INSUFFICIENT_DATA', momentumScore: null, waveScore: null, downsideScore: null,
      streak: streakStats(rows), reasons: ['At least 22 daily observations are required.'],
    };
  }
  const closes = rows.map((r) => r.c);
  const volumes = rows.map((r) => finite(r.v) ? r.v : 0);
  const last = closes.at(-1);
  const ret5 = pct(last, closes.at(-6));
  const ret20 = pct(last, closes.at(-21));
  const ret60 = rows.length >= 61 ? pct(last, closes.at(-61)) : ret20;
  const ret252 = rows.length >= 253 ? pct(last, closes.at(-253)) : ret60;
  const ma20 = avg(closes.slice(-20));
  const ma50 = avg(closes.slice(-50));
  const dailyReturns = closes.slice(1).map((v, i) => pct(v, closes[i]) || 0);
  const vol20 = stdev(dailyReturns.slice(-20));
  const recentVolume = avg(volumes.slice(-5));
  const baseVolume = avg(volumes.slice(-20));
  const volumeRatio = baseVolume && baseVolume > 0 ? recentVolume / baseVolume : 1;
  const streak = streakStats(rows);

  const trend = clamp(50 + (ret20 || 0) * 2 + (ret60 || 0) * 0.8 + (last > ma20 ? 8 : -8) + (last > ma50 ? 8 : -8));
  const momentumScore = Math.round(trend * 10) / 10;
  const waveScore = Math.round(clamp(
    momentumScore * 0.55 +
    clamp(50 + (ret5 || 0) * 4) * 0.20 +
    clamp(50 + (volumeRatio - 1) * 35) * 0.15 +
    clamp(50 + (ret252 || 0) * 0.4) * 0.10,
  ) * 10) / 10;

  const downsideRaw =
    (last < ma20 ? 18 : 0) +
    (last < ma50 ? 18 : 0) +
    ((ret5 || 0) < -3 ? 16 : 0) +
    ((ret20 || 0) < -8 ? 16 : 0) +
    (vol20 > 3 ? 12 : vol20 > 2 ? 6 : 0) +
    (volumeRatio > 1.35 && (ret5 || 0) < 0 ? 12 : 0) +
    (streak.direction === 'DOWN' ? Math.min(streak.length * 4, 16) : 0);
  const downsideScore = Math.round(clamp(downsideRaw) * 10) / 10;
  const severity = downsideScore >= 75 ? 'CRITICAL' : downsideScore >= 50 ? 'ELEVATED' : downsideScore >= 25 ? 'WATCH' : 'NORMAL';

  return {
    status: 'OK',
    algorithmVersion: 'ATLAS-MARKET-LAB-1.0.0',
    momentumScore,
    waveScore,
    downsideScore,
    downsideSeverity: severity,
    streak,
    metrics: { ret5, ret20, ret60, ret252, ma20, ma50, vol20, volumeRatio },
    reasons: [
      `20D return ${ret20?.toFixed(2) ?? 'n/a'}%`,
      `60D return ${ret60?.toFixed(2) ?? 'n/a'}%`,
      `price ${last > ma20 ? 'above' : 'below'} MA20`,
      `price ${last > ma50 ? 'above' : 'below'} MA50`,
      `5D/20D volume ratio ${volumeRatio.toFixed(2)}x`,
      `${streak.direction} streak ${streak.length} sessions`,
    ],
    guardrail: 'Market-layer signal only. It cannot mutate Evidence, Thesis or canonical Conviction.',
  };
}

async function metrics(symbol) {
  const raw = await finnhub('stock/metric', { symbol, metric: 'all' });
  return { provider: 'FINNHUB', ticker: symbol, metric: raw?.metric || {}, series: raw?.series || {}, observedAt: nowIso() };
}

async function companyNews(symbol, days = 14) {
  const to = new Date();
  const from = new Date(Date.now() - days * 86_400_000);
  const iso = (d) => d.toISOString().slice(0, 10);
  const raw = await finnhub('company-news', { symbol, from: iso(from), to: iso(to) });
  return (Array.isArray(raw) ? raw : []).slice(0, 30).map((item) => ({
    id: item.id || `${symbol}-${item.datetime}-${item.headline}`,
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    category: item.category,
    datetime: finite(item.datetime) ? new Date(item.datetime * 1000).toISOString() : null,
    related: item.related,
  }));
}

async function secTickerMap() {
  return cached('sec:ticker-map', 24 * 3600_000, async () => {
    const payload = await fetchJson('https://www.sec.gov/files/company_tickers.json', { headers: { 'user-agent': SEC_USER_AGENT } });
    const map = new Map();
    for (const value of Object.values(payload || {})) map.set(String(value.ticker).toUpperCase(), value);
    return map;
  });
}

async function edgarForTicker(symbol) {
  const map = await secTickerMap();
  const item = map.get(symbol.toUpperCase());
  if (!item) return { ticker: symbol, cik: null, filings: [], status: 'NO_SEC_MATCH' };
  const cik = String(item.cik_str).padStart(10, '0');
  const submissions = await fetchJson(`https://data.sec.gov/submissions/CIK${cik}.json`, { headers: { 'user-agent': SEC_USER_AGENT } });
  const recent = submissions?.filings?.recent || {};
  const forms = recent.form || [];
  const filings = forms.map((form, i) => ({
    form,
    filingDate: recent.filingDate?.[i] || null,
    reportDate: recent.reportDate?.[i] || null,
    accessionNumber: recent.accessionNumber?.[i] || null,
    primaryDocument: recent.primaryDocument?.[i] || null,
    items: String(recent.items?.[i] || '').split(',').map((x) => x.trim()).filter(Boolean),
  })).filter((f) => ['10-K', '10-Q', '8-K', '20-F', '6-K'].includes(f.form)).slice(0, 30);
  return { ticker: symbol, cik, companyName: submissions?.name || item.title, filings, status: 'OK', observedAt: nowIso() };
}

function classifyFiling(filing) {
  const items = filing.items || [];
  const rules = [
    ['1.03', 'LEGAL_OR_DISTRESS', 100],
    ['2.02', 'EARNINGS_RESULTS', 85],
    ['2.05', 'RESTRUCTURING', 80],
    ['2.06', 'IMPAIRMENT', 80],
    ['3.01', 'LISTING_RISK', 85],
    ['5.02', 'LEADERSHIP_CHANGE', 70],
    ['7.01', 'REG_FD', 55],
    ['8.01', 'OTHER_MATERIAL_EVENT', 55],
    ['5.03', 'GOVERNANCE_CHANGE', 25],
  ];
  const matches = rules.filter(([prefix]) => items.some((i) => i.startsWith(prefix)));
  const strongest = matches.sort((a, b) => b[2] - a[2])[0];
  return {
    ...filing,
    eventClass: strongest?.[1] || (filing.form === '10-K' || filing.form === '10-Q' ? 'PERIODIC_REPORT' : 'OTHER_PRIMARY_DISCLOSURE'),
    materialityScore: strongest?.[2] || (filing.form === '10-K' ? 75 : filing.form === '10-Q' ? 70 : 20),
    validationState: 'PENDING_PRIMARY_VALIDATION',
    requiresHumanReview: true,
    ruleVersion: 'EDGAR-TRIAGE-1.0.0',
  };
}

const DISCOVERY_UNIVERSE = [
  'MSFT','GOOG','AMZN','NVDA','AVGO','TSM','ASML','AMAT','LRCX','KLAC','AMD','MU','MRVL','ARM','STX','WDC','SNDK','INTC',
  'V','MA','SPGI','ICE','JPM','GS','MS','BRK.B','BKNG','UBER','ADP','CTAS','FAST','ROP','VRSK','CPRT','HEI','PH','ETN','TT','GE',
  'LLY','NVO','TMO','DHR','ISRG','NTRA','HALO','ABT','WELL','CEG','NEM','NOC','KO','SU','ORCL','SAP','PANW','PLTR','NET','LITE','COHR'
];

async function discovery(limit = 25) {
  requireFinnhub();
  const candidates = [];
  const pool = DISCOVERY_UNIVERSE.slice(0, Math.min(DISCOVERY_UNIVERSE.length, 80));
  for (let i = 0; i < pool.length; i += 5) {
    const batch = pool.slice(i, i + 5);
    const rows = await Promise.all(batch.map(async (ticker) => {
      try {
        const history = await candles(ticker, '1Y');
        const signals = marketSignals(history);
        const q = await quote(ticker);
        if (signals.status !== 'OK') return null;
        const score = clamp((signals.momentumScore || 0) * 0.45 + (signals.waveScore || 0) * 0.40 + (100 - (signals.downsideScore || 0)) * 0.15);
        return { ticker, price: q.price, dayPct: q.changePct, discoveryScore: Math.round(score * 10) / 10, ...signals };
      } catch { return null; }
    }));
    candidates.push(...rows.filter(Boolean));
  }
  return candidates
    .filter((x) => (x.metrics?.ret60 ?? -999) > 0 && (x.metrics?.ret252 ?? -999) > 0)
    .sort((a, b) => b.discoveryScore - a.discoveryScore)
    .slice(0, Math.max(1, Math.min(limit, 50)));
}

async function terminalBundle(symbol) {
  const [security, q, history, fundamentalMetrics, news, edgar] = await Promise.all([
    resolveSecurity(symbol),
    quote(symbol),
    candles(symbol, '1Y'),
    metrics(symbol).catch(() => null),
    companyNews(symbol).catch(() => []),
    edgarForTicker(symbol).catch(() => ({ ticker: symbol, filings: [], status: 'ERROR' })),
  ]);
  return {
    security,
    quote: q,
    history,
    marketSignals: marketSignals(history),
    fundamentals: fundamentalMetrics,
    news,
    edgar: { ...edgar, filings: (edgar.filings || []).map(classifyFiling) },
    canonicalAudit: {
      status: 'BLOCKED_NO_CANONICAL_ENGINE',
      message: 'Canonical Quality/Growth/Valuation/Conviction engine source is not present in this repository; ATLAS refuses to fabricate canonical scores.',
    },
    generatedAt: nowIso(),
  };
}

function routeMatch(pathname, prefix) {
  return pathname.startsWith(prefix) ? decodeURIComponent(pathname.slice(prefix.length)) : null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/health') {
      return json(res, 200, {
        ok: true,
        service: 'ATLAS Ω Backend',
        version: '0.2.0',
        providers: { finnhub: FINNHUB_TOKEN ? 'CONFIGURED' : 'UNCONFIGURED', secEdgar: 'CONFIGURED' },
        invariants: { marketDataIsSensor: true, aiIsNeverEvidence: true, priceCannotMutateThesisDirectly: true },
        time: nowIso(),
      });
    }
    if (url.pathname === '/v1/search') {
      const q = url.searchParams.get('q') || '';
      if (!q.trim()) return json(res, 400, { error: 'q is required' });
      return json(res, 200, await cached(`search:${q.toUpperCase()}`, 3600_000, () => resolveSecurity(q)));
    }
    const quoteSymbol = routeMatch(url.pathname, '/v1/quote/');
    if (quoteSymbol !== null) return json(res, 200, await cached(`quote:${quoteSymbol}`, CACHE_TTL_MS, () => quote(quoteSymbol.toUpperCase())));

    const historySymbol = routeMatch(url.pathname, '/v1/history/');
    if (historySymbol !== null) {
      const range = url.searchParams.get('range') || '1Y';
      return json(res, 200, { ticker: historySymbol.toUpperCase(), range, rows: await cached(`history:${historySymbol}:${range}`, 60_000, () => candles(historySymbol.toUpperCase(), range)) });
    }
    const signalsSymbol = routeMatch(url.pathname, '/v1/signals/');
    if (signalsSymbol !== null) {
      const history = await cached(`history:${signalsSymbol}:1Y`, 60_000, () => candles(signalsSymbol.toUpperCase(), '1Y'));
      return json(res, 200, { ticker: signalsSymbol.toUpperCase(), ...marketSignals(history) });
    }
    const metricsSymbol = routeMatch(url.pathname, '/v1/fundamentals/');
    if (metricsSymbol !== null) return json(res, 200, await cached(`metrics:${metricsSymbol}`, 3600_000, () => metrics(metricsSymbol.toUpperCase())));

    const newsSymbol = routeMatch(url.pathname, '/v1/news/');
    if (newsSymbol !== null) return json(res, 200, { ticker: newsSymbol.toUpperCase(), items: await cached(`news:${newsSymbol}`, 300_000, () => companyNews(newsSymbol.toUpperCase())) });

    const edgarSymbol = routeMatch(url.pathname, '/v1/edgar/');
    if (edgarSymbol !== null) {
      const edgar = await cached(`edgar:${edgarSymbol}`, 300_000, () => edgarForTicker(edgarSymbol.toUpperCase()));
      return json(res, 200, { ...edgar, filings: (edgar.filings || []).map(classifyFiling) });
    }
    const terminalSymbol = routeMatch(url.pathname, '/v1/terminal/');
    if (terminalSymbol !== null) return json(res, 200, await terminalBundle(terminalSymbol.toUpperCase()));

    if (url.pathname === '/v1/discovery') {
      const limit = Number(url.searchParams.get('limit') || 25);
      return json(res, 200, { generatedAt: nowIso(), methodology: 'Ticker-first market discovery; no canonical Quality filter applied before discovery.', items: await cached(`discovery:${limit}`, 300_000, () => discovery(limit)) });
    }

    return json(res, 404, { error: 'NOT_FOUND' });
  } catch (error) {
    const status = error?.code === 'PROVIDER_UNCONFIGURED' ? 503 : 502;
    return json(res, status, { error: error?.code || 'UPSTREAM_ERROR', message: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`ATLAS Ω backend listening on http://${HOST}:${PORT}`);
});
