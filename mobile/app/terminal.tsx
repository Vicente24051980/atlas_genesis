import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AtlasApi, type HistoryPoint, type TerminalBundle } from '../core/api/atlasApi';
import { TerminalRepository, type TerminalCompany } from '../db/repositories/TerminalRepository';

type Tab = 'OVERVIEW' | 'FINANCIALS' | 'NEWS' | 'EVIDENCE';
const ranges = ['1M', '3M', 'YTD', '1Y', '3Y', '5Y'] as const;

export default function TerminalScreen() {
  const [ticker, setTicker] = useState('NVDA');
  const [entity, setEntity] = useState<TerminalCompany | null>(null);
  const [bundle, setBundle] = useState<TerminalBundle | null>(null);
  const [tab, setTab] = useState<Tab>('OVERVIEW');
  const [range, setRange] = useState<(typeof ranges)[number]>('1Y');
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const run = async () => {
    const normalized = ticker.trim().toUpperCase();
    if (!/^[A-Z0-9.\-]{1,12}$/.test(normalized)) {
      setMessage('Ticker no válido.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const live = await AtlasApi.terminal(normalized);
      const saved = await TerminalRepository.persistLiveBundle(live);
      setEntity(saved);
      setBundle(live);
      setHistory(live.history);
      setTicker(saved.canonicalTicker);
    } catch (error) {
      const pending = await TerminalRepository.ensurePendingCompany(normalized);
      setEntity(pending);
      setBundle(null);
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const loadRange = async (nextRange: (typeof ranges)[number]) => {
    setRange(nextRange);
    if (!entity) return;
    try {
      const result = await AtlasApi.history(entity.canonicalTicker, nextRange);
      setHistory(result.rows);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const addWatch = async () => {
    if (!entity) return;
    const inserted = await TerminalRepository.addToWatchlist(entity);
    setMessage(inserted ? `${entity.canonicalTicker} añadido a Watchlist.` : `${entity.canonicalTicker} ya estaba en Watchlist.`);
  };

  const price = bundle?.quote.price;
  const changePct = bundle?.quote.changePct;
  const signals = bundle?.marketSignals;
  const metric = bundle?.fundamentals?.metric || {};

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topline}>
        <View>
          <Text style={styles.brand}>ATLAS Ω</Text>
          <Text style={styles.product}>INTELLIGENCE TERMINAL</Text>
        </View>
        <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>{bundle ? 'LIVE' : 'LOCAL'}</Text></View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={ticker}
          onChangeText={setTicker}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="Ticker"
          placeholderTextColor="#526070"
          style={styles.searchInput}
          onSubmitEditing={() => { void run(); }}
        />
        <Pressable onPress={() => { void run(); }} style={({ pressed }) => [styles.auditButton, pressed && styles.pressed]}>
          {loading ? <ActivityIndicator color="#061018" /> : <Text style={styles.auditText}>AUDIT Ω</Text>}
        </Pressable>
      </View>

      {message ? <View style={styles.notice}><Text style={styles.noticeText}>{message}</Text></View> : null}

      {entity ? (
        <>
          <View style={styles.securityHeader}>
            <View style={styles.flex}>
              <View style={styles.tickerRow}>
                <Text style={styles.ticker}>{entity.canonicalTicker}</Text>
                <Text style={styles.exchange}>{entity.exchange || '—'}</Text>
              </View>
              <Text style={styles.company}>{entity.companyName}</Text>
              <Text style={styles.meta}>{[entity.sector, entity.country, entity.currency].filter(Boolean).join(' · ') || 'Identificador local pendiente'}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>{price == null ? '—' : formatNumber(price)}</Text>
              <Text style={[styles.change, changePct != null && changePct < 0 ? styles.negative : styles.positive]}>
                {changePct == null ? '—' : `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`}
              </Text>
              <Text style={styles.session}>{bundle?.quote.session || 'OFFLINE'}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={() => { void addWatch(); }}><Text style={styles.secondaryText}>+ WATCHLIST</Text></Pressable>
            <View style={[styles.statusChip, entity.identifierStatus === 'RESOLVED' ? styles.okChip : styles.warnChip]}>
              <Text style={styles.statusText}>{entity.identifierStatus}</Text>
            </View>
            <View style={styles.statusChip}><Text style={styles.statusText}>{bundle?.quote.provider || 'NO API'}</Text></View>
          </View>

          <ScoreGrid bundle={bundle} />

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>PRICE ACTION</Text>
              <Text style={styles.panelHint}>{range}</Text>
            </View>
            <MiniChart history={history} />
            <View style={styles.rangeRow}>
              {ranges.map((item) => (
                <Pressable key={item} onPress={() => { void loadRange(item); }} style={[styles.rangeButton, item === range && styles.rangeActive]}>
                  <Text style={[styles.rangeText, item === range && styles.rangeTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.tabs}>
            {(['OVERVIEW', 'FINANCIALS', 'NEWS', 'EVIDENCE'] as Tab[]).map((item) => (
              <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}>
                <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 'OVERVIEW' ? <Overview bundle={bundle} /> : null}
          {tab === 'FINANCIALS' ? <Financials metric={metric} canonicalStatus={bundle?.canonicalAudit.status} canonicalMessage={bundle?.canonicalAudit.message} /> : null}
          {tab === 'NEWS' ? <NewsPanel bundle={bundle} /> : null}
          {tab === 'EVIDENCE' ? <EvidencePanel bundle={bundle} /> : null}
        </>
      ) : (
        <View style={styles.heroEmpty}>
          <Text style={styles.heroNumber}>Ω</Text>
          <Text style={styles.heroTitle}>Una terminal. Todo el proceso.</Text>
          <Text style={styles.heroText}>Busca cualquier ticker para resolver mercado, histórico, fundamentales, señales, noticias y filings. Las capas canónicas permanecen bloqueadas hasta disponer del motor validado.</Text>
          <View style={styles.heroGrid}>
            <HeroMetric label="AUDIT" value="EXPLAINABLE" />
            <HeroMetric label="RADAR" value="PROBABILISTIC" />
            <HeroMetric label="EVIDENCE" value="TRACEABLE" />
            <HeroMetric label="HISTORY" value="VERSIONED" />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function ScoreGrid({ bundle }: { bundle: TerminalBundle | null }) {
  const s = bundle?.marketSignals;
  return (
    <View style={styles.scoreGrid}>
      <Score label="QUALITY Ω" value={null} state="CANONICAL" />
      <Score label="GROWTH Ω" value={null} state="CANONICAL" />
      <Score label="VALUATION Ω" value={null} state="CANONICAL" />
      <Score label="RISK Ω" value={null} state="CANONICAL" />
      <Score label="MOMENTUM Ω" value={s?.momentumScore ?? null} state="MARKET" />
      <Score label="WAVE Ω" value={s?.waveScore ?? null} state="MARKET" />
      <Score label="DOWNSIDE Ω" value={s?.downsideScore ?? null} state={s?.downsideSeverity || 'MARKET'} inverse />
      <Score label="CONVICTION Ω" value={null} state="CANONICAL" />
    </View>
  );
}

function Score({ label, value, state, inverse = false }: { label: string; value: number | null; state: string; inverse?: boolean }) {
  const high = value != null && value >= 70;
  const medium = value != null && value >= 40 && value < 70;
  const tone = inverse ? (high ? styles.scoreBad : medium ? styles.scoreWarn : styles.scoreGood) : (high ? styles.scoreGood : medium ? styles.scoreWarn : styles.scoreNeutral);
  return (
    <View style={[styles.scoreCard, tone]}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value == null ? '—' : value.toFixed(0)}</Text>
      <Text style={styles.scoreState}>{value == null ? 'LOCKED' : state}</Text>
    </View>
  );
}

function MiniChart({ history }: { history: HistoryPoint[] }) {
  const points = useMemo(() => {
    if (!history.length) return [];
    const sampleCount = 46;
    const step = Math.max(1, Math.floor(history.length / sampleCount));
    return history.filter((_, index) => index % step === 0).slice(-sampleCount);
  }, [history]);
  if (!points.length) return <View style={styles.chartEmpty}><Text style={styles.chartEmptyText}>Sin histórico disponible</Text></View>;
  const closes = points.map((x) => x.c);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = Math.max(max - min, 0.0001);
  const positive = closes.at(-1)! >= closes[0];
  return (
    <View style={styles.chart}>
      {points.map((point, index) => {
        const height = 8 + ((point.c - min) / range) * 92;
        return <View key={`${point.t}-${index}`} style={[styles.chartBar, { height }, positive ? styles.chartPositive : styles.chartNegative]} />;
      })}
    </View>
  );
}

function Overview({ bundle }: { bundle: TerminalBundle | null }) {
  const s = bundle?.marketSignals;
  const m = s?.metrics;
  return (
    <>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>MARKET INTELLIGENCE</Text>
        <View style={styles.statRows}>
          <Stat label="Racha actual" value={s ? `${s.streak.direction} · ${s.streak.length} sesiones` : '—'} />
          <Stat label="Días verdes / 20" value={s ? `${s.streak.upDays20} / ${s.streak.downDays20} rojos` : '—'} />
          <Stat label="Retorno 20D" value={formatPct(m?.ret20)} />
          <Stat label="Retorno 60D" value={formatPct(m?.ret60)} />
          <Stat label="Retorno 1Y aprox." value={formatPct(m?.ret252)} />
          <Stat label="Volumen 5D / 20D" value={m?.volumeRatio == null ? '—' : `${m.volumeRatio.toFixed(2)}x`} />
        </View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>WHY IT MOVED</Text>
        {(s?.reasons || []).map((reason) => <Text key={reason} style={styles.bullet}>• {reason}</Text>)}
        <Text style={styles.guardrail}>{s?.guardrail || 'Sin señal de mercado calculada.'}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>THESIS Ω</Text>
        <View style={styles.lockedRow}><Text style={styles.lockedTitle}>CANONICAL ENGINE LOCKED</Text><Text style={styles.lockedBadge}>SAFE</Text></View>
        <Text style={styles.bodyText}>{bundle?.canonicalAudit.message || 'El precio no puede cambiar una tesis automáticamente.'}</Text>
      </View>
    </>
  );
}

function Financials({ metric, canonicalStatus, canonicalMessage }: { metric: Record<string, number | string | null>; canonicalStatus?: string; canonicalMessage?: string }) {
  const selected = [
    ['Market Cap', metric.marketCapitalization], ['52W High', metric['52WeekHigh']], ['52W Low', metric['52WeekLow']],
    ['Beta', metric.beta], ['P/E TTM', metric.peTTM], ['P/B', metric.pbAnnual], ['ROE TTM', metric.roeTTM],
    ['ROA TTM', metric.roaTTM], ['Net Margin', metric.netProfitMarginTTM], ['Revenue Growth 3Y', metric.revenueGrowth3Y],
    ['EPS Growth 3Y', metric.epsGrowth3Y], ['Dividend Yield', metric.dividendYieldIndicatedAnnual],
  ].filter(([, value]) => value !== undefined && value !== null);
  return (
    <>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>FUNDAMENTALS · SENSOR DATA</Text>
        {selected.length ? selected.map(([label, value]) => <Stat key={String(label)} label={String(label)} value={typeof value === 'number' ? formatNumber(value) : String(value)} />) : <Text style={styles.bodyText}>El proveedor no devolvió métricas fundamentales para este activo/plan.</Text>}
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>CANONICAL AUDIT</Text>
        <Text style={styles.lockedTitle}>{canonicalStatus || 'NOT EXECUTED'}</Text>
        <Text style={styles.bodyText}>{canonicalMessage || 'No hay salida canónica persistida.'}</Text>
      </View>
    </>
  );
}

function NewsPanel({ bundle }: { bundle: TerminalBundle | null }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>COMPANY NEWS · SENSOR</Text>
      {bundle?.news.length ? bundle.news.slice(0, 12).map((item) => (
        <Pressable key={String(item.id)} onPress={() => { if (item.url) void Linking.openURL(item.url); }} style={styles.newsItem}>
          <Text style={styles.newsSource}>{item.source} · {item.datetime?.slice(0, 10) || '—'}</Text>
          <Text style={styles.newsHeadline}>{item.headline}</Text>
          {item.summary ? <Text numberOfLines={3} style={styles.newsSummary}>{item.summary}</Text> : null}
        </Pressable>
      )) : <Text style={styles.bodyText}>Sin noticias disponibles.</Text>}
    </View>
  );
}

function EvidencePanel({ bundle }: { bundle: TerminalBundle | null }) {
  const filings = bundle?.edgar.filings || [];
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}><Text style={styles.panelTitle}>EDGAR · PRIMARY SOURCE DISCOVERED</Text><Text style={styles.panelHint}>{bundle?.edgar.cik ? `CIK ${bundle.edgar.cik}` : '—'}</Text></View>
      <Text style={styles.guardrail}>Todo filing entra como PENDING PRIMARY VALIDATION. Descubrir una fuente primaria no equivale a verificar una afirmación.</Text>
      {filings.length ? filings.slice(0, 16).map((filing) => (
        <View key={`${filing.accessionNumber}-${filing.form}`} style={styles.filing}>
          <View style={styles.filingTop}><Text style={styles.filingForm}>{filing.form}</Text><Text style={styles.filingDate}>{filing.filingDate || '—'}</Text></View>
          <Text style={styles.filingClass}>{filing.eventClass} · materialidad {filing.materialityScore}/100</Text>
          <Text style={styles.pending}>PENDING PRIMARY VALIDATION · HUMAN REVIEW</Text>
          {filing.items.length ? <Text style={styles.filingItems}>Items: {filing.items.join(', ')}</Text> : null}
        </View>
      )) : <Text style={styles.bodyText}>Sin filings SEC asociados o emisor fuera de EDGAR.</Text>}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}
function HeroMetric({ label, value }: { label: string; value: string }) {
  return <View style={styles.heroMetric}><Text style={styles.heroMetricLabel}>{label}</Text><Text style={styles.heroMetricValue}>{value}</Text></View>;
}
const formatPct = (value: number | null | undefined) => value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
const formatNumber = (value: number) => Intl.NumberFormat('en-US', { maximumFractionDigits: value < 10 ? 2 : 1 }).format(value);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05080c' },
  content: { padding: 14, paddingBottom: 44, gap: 12 },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  brand: { color: '#f2f6fa', fontWeight: '900', fontSize: 23, letterSpacing: 1.5 },
  product: { color: '#556579', fontWeight: '800', fontSize: 9, letterSpacing: 2.1, marginTop: 2 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#1e3440', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: '#091117' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34d399' },
  liveText: { color: '#8aa1b2', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: { flex: 1, height: 48, backgroundColor: '#0a0f15', color: '#f5f7fa', borderWidth: 1, borderColor: '#1a2633', borderRadius: 9, paddingHorizontal: 14, fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  auditButton: { width: 105, height: 48, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#64d8ff' },
  auditText: { color: '#041018', fontWeight: '950', fontSize: 12, letterSpacing: 0.5 },
  pressed: { opacity: 0.68 },
  notice: { padding: 10, backgroundColor: '#18150d', borderWidth: 1, borderColor: '#4f421a', borderRadius: 8 },
  noticeText: { color: '#e2c267', fontSize: 11, lineHeight: 16 },
  securityHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 8 },
  flex: { flex: 1 },
  tickerRow: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  ticker: { color: '#f5f7fa', fontSize: 29, fontWeight: '950', letterSpacing: 0.5 },
  exchange: { color: '#607286', fontSize: 10, fontWeight: '800' },
  company: { color: '#b8c3cf', fontSize: 14, fontWeight: '700', marginTop: 2 },
  meta: { color: '#59697a', fontSize: 10, marginTop: 4 },
  priceBox: { alignItems: 'flex-end' },
  price: { color: '#f5f7fa', fontSize: 25, fontWeight: '950', fontVariant: ['tabular-nums'] },
  change: { fontSize: 12, fontWeight: '900', marginTop: 2 },
  positive: { color: '#39d98a' },
  negative: { color: '#ff6577' },
  session: { color: '#586a7b', fontSize: 9, fontWeight: '800', marginTop: 3 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  secondaryButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: '#26394a', backgroundColor: '#0a1118' },
  secondaryText: { color: '#94adc2', fontSize: 9, fontWeight: '900' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#24303e', backgroundColor: '#0b1016' },
  okChip: { borderColor: '#1d5942', backgroundColor: '#0c1c17' },
  warnChip: { borderColor: '#594a1d', backgroundColor: '#1b170c' },
  statusText: { color: '#8295a8', fontSize: 8, fontWeight: '900' },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  scoreCard: { width: '23.5%', minHeight: 78, borderRadius: 8, padding: 8, borderWidth: 1 },
  scoreGood: { backgroundColor: '#091a15', borderColor: '#174e39' },
  scoreWarn: { backgroundColor: '#19160c', borderColor: '#4b4019' },
  scoreBad: { backgroundColor: '#1c0d10', borderColor: '#5c202b' },
  scoreNeutral: { backgroundColor: '#0b1118', borderColor: '#1d2b38' },
  scoreLabel: { color: '#718398', fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
  scoreValue: { color: '#f2f5f8', fontSize: 23, fontWeight: '950', marginTop: 5, fontVariant: ['tabular-nums'] },
  scoreState: { color: '#536477', fontSize: 7, fontWeight: '900', marginTop: 2 },
  panel: { backgroundColor: '#090e14', borderRadius: 10, borderWidth: 1, borderColor: '#17222e', padding: 12, gap: 8 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { color: '#bac8d6', fontSize: 10, fontWeight: '950', letterSpacing: 1 },
  panelHint: { color: '#546476', fontSize: 9, fontWeight: '800' },
  chart: { height: 112, flexDirection: 'row', alignItems: 'flex-end', gap: 2, paddingVertical: 6, overflow: 'hidden' },
  chartBar: { flex: 1, minWidth: 2, borderRadius: 1, opacity: 0.8 },
  chartPositive: { backgroundColor: '#43d9a3' },
  chartNegative: { backgroundColor: '#ff6577' },
  chartEmpty: { height: 112, alignItems: 'center', justifyContent: 'center' },
  chartEmptyText: { color: '#536477', fontSize: 11 },
  rangeRow: { flexDirection: 'row', gap: 5 },
  rangeButton: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 5, backgroundColor: '#0b1219' },
  rangeActive: { backgroundColor: '#143447' },
  rangeText: { color: '#617386', fontSize: 8, fontWeight: '900' },
  rangeTextActive: { color: '#8bdfff' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#192530' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#64d8ff' },
  tabText: { color: '#586a7d', fontSize: 8, fontWeight: '900' },
  tabTextActive: { color: '#bdeeff' },
  statRows: { gap: 0 },
  stat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 31, borderBottomWidth: 1, borderBottomColor: '#111b24' },
  statLabel: { color: '#708195', fontSize: 10 },
  statValue: { color: '#dce4eb', fontSize: 11, fontWeight: '900', fontVariant: ['tabular-nums'] },
  bullet: { color: '#93a5b6', fontSize: 11, lineHeight: 17 },
  guardrail: { color: '#d9b95e', fontSize: 10, lineHeight: 15, marginTop: 2 },
  lockedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lockedTitle: { color: '#e0bd62', fontWeight: '900', fontSize: 10 },
  lockedBadge: { color: '#7edfb0', fontSize: 8, fontWeight: '900', borderWidth: 1, borderColor: '#23523f', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  bodyText: { color: '#788b9e', fontSize: 11, lineHeight: 17 },
  newsItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#14202b' },
  newsSource: { color: '#5f7387', fontSize: 8, fontWeight: '800' },
  newsHeadline: { color: '#d9e2ea', fontSize: 12, fontWeight: '800', lineHeight: 17, marginTop: 3 },
  newsSummary: { color: '#76889a', fontSize: 10, lineHeight: 15, marginTop: 4 },
  filing: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#14202b', gap: 3 },
  filingTop: { flexDirection: 'row', justifyContent: 'space-between' },
  filingForm: { color: '#c9eefe', fontWeight: '950', fontSize: 12 },
  filingDate: { color: '#63778a', fontSize: 9 },
  filingClass: { color: '#a5b3c1', fontSize: 10, fontWeight: '700' },
  pending: { color: '#d1ae54', fontSize: 8, fontWeight: '950' },
  filingItems: { color: '#607285', fontSize: 9 },
  heroEmpty: { marginTop: 26, gap: 15, alignItems: 'center' },
  heroNumber: { color: '#64d8ff', fontSize: 70, fontWeight: '200' },
  heroTitle: { color: '#edf3f8', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  heroText: { color: '#728497', lineHeight: 20, textAlign: 'center', maxWidth: 430 },
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  heroMetric: { width: '48.5%', padding: 12, backgroundColor: '#090e14', borderWidth: 1, borderColor: '#17222e', borderRadius: 8 },
  heroMetricLabel: { color: '#5a6b7d', fontSize: 8, fontWeight: '900' },
  heroMetricValue: { color: '#b8c8d6', fontSize: 11, fontWeight: '900', marginTop: 4 },
});
