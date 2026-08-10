import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import AtlasActionCard from '../components/AtlasActionCard';
import { AtlasOnlineApi, type AtlasAnalyzeBundle, type CompanyBundle, type MarketHistory, type MarketHistoryRow, type MarketQuote } from '../core/api/atlasOnlineApi';

type Tab = 'summary' | 'atlas' | 'financial' | 'news';
type Period = '1M' | '3M' | '6M' | '1A';

type AnalysisContext = 'candidate' | 'portfolio' | 'watchlist';

export default function TickerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string | string[]; context?: string | string[]; tab?: string | string[] }>();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const rawContext = Array.isArray(params.context) ? params.context[0] : params.context;
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const symbol = (rawSymbol || '').trim().toUpperCase();
  const context: AnalysisContext = rawContext === 'portfolio' || rawContext === 'watchlist' ? rawContext : 'candidate';
  const [tab, setTab] = useState<Tab>(rawTab === 'atlas' ? 'atlas' : 'summary');
  const [period, setPeriod] = useState<Period>('3M');
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [history, setHistory] = useState<MarketHistory | null>(null);
  const [company, setCompany] = useState<CompanyBundle | null>(null);
  const [atlas, setAtlas] = useState<AtlasAnalyzeBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!/^[A-Z0-9.\-]{1,20}$/.test(symbol)) {
      setError('Ticker no válido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const [quoteResult, historyResult, companyResult, atlasResult] = await Promise.allSettled([
      AtlasOnlineApi.marketQuote(symbol),
      AtlasOnlineApi.marketHistory(symbol, 430),
      AtlasOnlineApi.company(symbol),
      AtlasOnlineApi.atlasAnalyze(symbol, context),
    ]);
    if (quoteResult.status === 'fulfilled') setQuote(quoteResult.value);
    if (historyResult.status === 'fulfilled') setHistory(historyResult.value);
    if (companyResult.status === 'fulfilled') setCompany(companyResult.value);
    if (atlasResult.status === 'fulfilled') setAtlas(atlasResult.value);
    if ([quoteResult, companyResult, atlasResult].every((result) => result.status === 'rejected')) {
      const reason = quoteResult.status === 'rejected' ? quoteResult.reason : companyResult.status === 'rejected' ? companyResult.reason : atlasResult.status === 'rejected' ? atlasResult.reason : null;
      setError(reason instanceof Error ? reason.message : 'No hay datos para este ticker.');
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, [symbol, context]);

  const chartRows = useMemo(() => selectPeriod(history?.rows || [], period), [history, period]);
  const profile = atlas?.profile || company?.profile || {};
  const rawMetrics = atlas?.analysis.rawMetrics || company?.metrics || {};
  const news = company?.news || [];
  const recommendations = atlas?.recommendations || company?.recommendations || [];
  const name = text(profile.name) || quote?.name || symbol;
  const sector = text(profile.finnhubIndustry) || quote?.sector || 'Mercado';
  const pctValue = quote?.changePct;
  const positive = (pctValue ?? 0) >= 0;

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.circleButton}><Text style={styles.back}>‹</Text></Pressable>
          <View style={styles.symbolPill}><Text style={styles.symbolPillText}>{symbol || '—'}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Actualizar ticker" onPress={() => void load()} style={styles.circleButton}><Text style={styles.refresh}>↻</Text></Pressable>
        </View>

        {loading && !quote && !company && !atlas ? <View style={styles.loading}><ActivityIndicator size="large" color="#2bd09a" /><Text style={styles.loadingText}>Cargando {symbol} y ejecutando ATLAS Ω…</Text></View> : null}
        {error ? <View style={styles.error}><Text style={styles.errorTitle}>SIN DATOS COMPLETOS</Text><Text style={styles.errorText}>{error}</Text></View> : null}

        {(quote || company || atlas) ? (
          <>
            <View style={styles.identity}>
              <View style={styles.logo}><Text style={styles.logoText}>{symbol.slice(0, 2)}</Text></View>
              <View style={styles.flex}><Text style={styles.companyName}>{name}</Text><Text style={styles.companyMeta}>{symbol} · {sector}{text(profile.exchange) ? ` · ${text(profile.exchange)}` : ''}</Text></View>
            </View>

            <Text style={styles.price}>{quote?.price == null ? maybeNumber(company?.quote.c) : number(quote.price)}</Text>
            <View style={styles.changeRow}>
              <Text style={[styles.change, positive ? styles.positive : styles.negative]}>{quote?.change == null ? '' : signed(quote.change)}</Text>
              <Text style={[styles.change, positive ? styles.positive : styles.negative]}>{percent(pctValue)}</Text>
              <Text style={styles.asOf}>{quote?.asOfDate ? `· ${quote.asOfDate}` : '· último dato disponible'}</Text>
            </View>
            <Text style={styles.sourceLine}>{quote?.source || company?.source || 'ATLAS'}{quote?.delayed ? ' · REFERENCIA/DIFERIDO' : ''}</Text>

            <PriceChart rows={chartRows} />
            <View style={styles.periods}>{(['1M', '3M', '6M', '1A'] as Period[]).map((item) => <PeriodButton key={item} label={item} active={period === item} onPress={() => setPeriod(item)} />)}</View>

            <View style={styles.tabs}>
              <TabButton label="Resumen" active={tab === 'summary'} onPress={() => setTab('summary')} />
              <TabButton label="ATLAS Ω" active={tab === 'atlas'} onPress={() => setTab('atlas')} />
              <TabButton label="Financiero" active={tab === 'financial'} onPress={() => setTab('financial')} />
              <TabButton label="Noticias" active={tab === 'news'} onPress={() => setTab('news')} />
            </View>

            {tab === 'summary' ? <SummaryTab quote={quote} history={history} profile={profile} atlas={atlas} onAtlas={() => setTab('atlas')} /> : null}
            {tab === 'atlas' ? <AtlasTab atlas={atlas} onEngines={() => router.push('/engines')} /> : null}
            {tab === 'financial' ? <FinancialTab metrics={rawMetrics} atlas={atlas} /> : null}
            {tab === 'news' ? <NewsTab news={news} recommendations={recommendations} /> : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SummaryTab({ quote, history, profile, atlas, onAtlas }: { quote: MarketQuote | null; history: MarketHistory | null; profile: Record<string, unknown>; atlas: AtlasAnalyzeBundle | null; onAtlas: () => void }) {
  return (
    <>
      {atlas ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir decisión ATLAS Ω" onPress={onAtlas} style={({ pressed }) => pressed ? styles.pressed : undefined}>
          <AtlasActionCard analysis={atlas.analysis} compact />
        </Pressable>
      ) : <Unavailable title="DECISIÓN ATLAS Ω" text="El proveedor fundamental no permite calcular aún una decisión auditable." />}

      <Panel title="MERCADO">
        <Metric label="Apertura" value={quote?.open == null ? '—' : number(quote.open)} />
        <Metric label="Máximo sesión" value={quote?.high == null ? '—' : number(quote.high)} />
        <Metric label="Mínimo sesión" value={quote?.low == null ? '—' : number(quote.low)} />
        <Metric label="Cierre anterior" value={quote?.previousClose == null ? '—' : number(quote.previousClose)} />
        <Metric label="1 mes" value={percent(history?.returns['20d'])} tone={history?.returns['20d']} />
        <Metric label="3 meses" value={percent(history?.returns['60d'])} tone={history?.returns['60d']} />
        <Metric label="1 año" value={percent(history?.returns['252d'])} tone={history?.returns['252d']} />
        <Metric label="Drawdown 1A" value={percent(history?.drawdown252)} tone={history?.drawdown252} />
      </Panel>

      <Panel title="EMPRESA">
        <Metric label="País" value={text(profile.country) || '—'} />
        <Metric label="Moneda" value={text(profile.currency) || '—'} />
        <Metric label="Industria" value={text(profile.finnhubIndustry) || '—'} />
        <Metric label="Capitalización" value={compact(num(profile.marketCapitalization))} />
      </Panel>
    </>
  );
}

function AtlasTab({ atlas, onEngines }: { atlas: AtlasAnalyzeBundle | null; onEngines: () => void }) {
  if (!atlas) return <Unavailable title="ATLAS Ω" text="No se puede emitir COMPRAR/ESPERAR/NO COMPRAR sin los datos mínimos. ATLAS no rellena huecos." />;
  const a = atlas.analysis;
  return (
    <>
      <AtlasActionCard analysis={a} />
      <Panel title="MOTORES">
        <ScoreMetric label="Business Quality Ω" value={a.scores.businessQuality} state={a.engineStates.businessQuality} />
        <ScoreMetric label="Growth Ω" value={a.scores.growth} state={a.engineStates.growth} />
        <ScoreMetric label="Moat Ω" value={a.scores.moatProxy} state={a.engineStates.moat} />
        <ScoreMetric label="Financial Quality Ω" value={a.scores.financialQuality} state={a.engineStates.financialQuality} />
        <ScoreMetric label="Management Ω" value={a.scores.managementProxy} state={a.engineStates.management} />
        <ScoreMetric label="Valuation Ω" value={a.scores.valuation} state={a.engineStates.valuation} />
        <ScoreMetric label="Risk Ω" value={a.scores.risk} state={a.engineStates.risk} inverse />
        <ScoreMetric label="CAPEX Productivity Ω" value={a.scores.capexProductivity} state={a.engineStates.capexProductivity} />
      </Panel>
      <View style={styles.capexNote}><Text style={styles.capexTitle}>CAPEX PRODUCTIVITY Ω</Text><Text style={styles.capexText}>{a.capexReason}</Text></View>
      {(a.flags.severe.length || a.flags.watch.length) ? <Panel title="FLAGS Ω">{a.flags.severe.map((flag) => <Flag key={flag} value={flag} severe />)}{a.flags.watch.map((flag) => <Flag key={flag} value={flag} />)}</Panel> : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir Motores ATLAS Ω" onPress={onEngines} style={styles.enginesButton}><Text style={styles.enginesText}>ABRIR ENGINE ROOM Ω</Text></Pressable>
    </>
  );
}

function FinancialTab({ metrics, atlas }: { metrics: Record<string, number | string | null>; atlas: AtlasAnalyzeBundle | null }) {
  const groups = [
    { title: 'RENTABILIDAD', keys: ['roi', 'roe', 'roa', 'margin', 'assetturnover'] },
    { title: 'CRECIMIENTO', keys: ['revenuegrowth', 'epsgrowth', 'freecashflowgrowth', 'cashflowpersharegrowth'] },
    { title: 'VALORACIÓN', keys: ['pettm', 'forwardpe', 'pban', 'pbquarterly', 'psttm', 'dividendyield'] },
    { title: 'BALANCE / RIESGO', keys: ['debt', 'currentratio', 'quickratio', 'interestcoverage', 'beta'] },
    { title: 'CAPEX / FCF', keys: ['freecashflowpershare', 'cashflowpershare', 'capitalspendingpershare', 'capex'] },
  ];
  return (
    <>
      {groups.map((group) => {
        const rows = pickMetrics(metrics, group.keys, 12);
        return <Panel key={group.title} title={group.title}>{rows.length ? rows.map(([key, value]) => <Metric key={key} label={humanize(key)} value={formatMetric(key, value)} />) : <Text style={styles.emptyText}>Sin datos suficientes en esta capa.</Text>}</Panel>;
      })}
      {atlas ? <View style={styles.sourceCard}><Text style={styles.sourceTitle}>COBERTURA</Text><Text style={styles.sourceText}>Score {atlas.analysis.scoreCoverage.toFixed(0)}% · métricas {atlas.analysis.metricCoverage.toFixed(0)}% · {atlas.analysis.algorithmVersion}</Text></View> : null}
    </>
  );
}

function NewsTab({ news, recommendations }: { news: Array<Record<string, unknown>>; recommendations: Array<Record<string, unknown>> }) {
  return (
    <>
      <Panel title="NOTICIAS RECIENTES">
        {news.length ? news.slice(0, 15).map((item, index) => {
          const headline = text(item.headline) || 'Noticia';
          const source = text(item.source) || 'Fuente';
          const timestamp = num(item.datetime);
          return <View key={`${headline}-${index}`} style={styles.newsRow}><Text style={styles.newsMeta}>{source}{timestamp ? ` · ${new Date(timestamp * 1000).toLocaleDateString('es-ES')}` : ''}</Text><Text style={styles.newsTitle}>{headline}</Text><Text style={styles.newsSummary} numberOfLines={3}>{text(item.summary) || ''}</Text></View>;
        }) : <Text style={styles.emptyText}>Sin noticias devueltas por el proveedor.</Text>}
      </Panel>
      <Panel title="CONSENSO · SENSOR">
        {recommendations.length ? recommendations.slice(0, 8).map((item, index) => <View key={index} style={styles.recommendation}><Text style={styles.recoPeriod}>{text(item.period) || 'Periodo'}</Text><Text style={styles.recoText}>Strong Buy {num(item.strongBuy) ?? '—'} · Buy {num(item.buy) ?? '—'} · Hold {num(item.hold) ?? '—'} · Sell {num(item.sell) ?? '—'}</Text></View>) : <Text style={styles.emptyText}>Sin consenso disponible.</Text>}
        <Text style={styles.sensorNote}>El consenso de analistas es sensor; no se convierte en evidencia canónica ni cambia la tesis por sí solo.</Text>
      </Panel>
    </>
  );
}

function PriceChart({ rows }: { rows: MarketHistoryRow[] }) {
  if (rows.length < 2) return <View style={styles.chartEmpty}><Text style={styles.emptyText}>Histórico no disponible.</Text></View>;
  const sampled = sample(rows, 48);
  const closes = sampled.map((row) => row.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const first = closes[0];
  const last = closes[closes.length - 1];
  const positive = last >= first;
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}><Text style={styles.chartLabel}>HISTÓRICO</Text><Text style={[styles.chartReturn, positive ? styles.positive : styles.negative]}>{first ? `${((last / first - 1) * 100).toFixed(2)}%` : '—'}</Text></View>
      <View style={styles.chart}>
        {sampled.map((row, index) => {
          const ratio = max === min ? 0.5 : (row.close - min) / (max - min);
          return <View key={`${row.date}-${index}`} style={styles.barSlot}><View style={[styles.chartBar, { height: `${Math.max(8, ratio * 88 + 8)}%` }, positive ? styles.chartPositive : styles.chartNegative]} /></View>;
        })}
      </View>
      <View style={styles.chartFooter}><Text style={styles.chartAxis}>{sampled[0]?.date || '—'}</Text><Text style={styles.chartAxis}>{sampled[sampled.length - 1]?.date || '—'}</Text></View>
    </View>
  );
}

function selectPeriod(rows: MarketHistoryRow[], period: Period): MarketHistoryRow[] {
  const sessions = period === '1M' ? 23 : period === '3M' ? 66 : period === '6M' ? 132 : 270;
  return rows.slice(-sessions);
}
function sample(rows: MarketHistoryRow[], maxPoints: number): MarketHistoryRow[] {
  if (rows.length <= maxPoints) return rows;
  const step = (rows.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, index) => rows[Math.round(index * step)]).filter(Boolean);
}
function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={`Pestaña ${label}`} onPress={onPress} style={[styles.tab, active && styles.tabActive]}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>; }
function PeriodButton({ label, active, onPress }: { label: Period; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.period, active && styles.periodActive]}><Text style={[styles.periodText, active && styles.periodTextActive]}>{label}</Text></Pressable>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.panel}><Text style={styles.panelTitle}>{title}</Text>{children}</View>; }
function Metric({ label, value, tone }: { label: string; value: string; tone?: number | null }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, tone == null ? null : tone >= 0 ? styles.positive : styles.negative]}>{value}</Text></View>; }
function ScoreMetric({ label, value, state, inverse = false }: { label: string; value: number | null; state?: string; inverse?: boolean }) { const good = value != null && (inverse ? value <= 45 : value >= 60); return <View style={styles.scoreMetric}><View style={styles.scoreTop}><Text style={styles.scoreName}>{label}</Text><Text style={[styles.scoreNumber, value == null ? styles.muted : good ? styles.positive : styles.warning]}>{value == null ? '—' : Math.round(value)}</Text></View><View style={styles.scoreTrack}><View style={[styles.scoreFill, { width: `${Math.max(0, Math.min(100, value ?? 0))}%` }, good ? styles.fillPositive : styles.fillWarning]} /></View><Text style={styles.scoreState}>{state?.replaceAll('_', ' ') || '—'}</Text></View>; }
function Flag({ value, severe = false }: { value: string; severe?: boolean }) { return <View style={[styles.flag, severe && styles.flagSevere]}><Text style={[styles.flagText, severe && styles.flagSevereText]}>{value.replaceAll('_', ' ')}</Text></View>; }
function Unavailable({ title, text: body }: { title: string; text: string }) { return <View style={styles.unavailable}><Text style={styles.unavailableTitle}>{title}</Text><Text style={styles.unavailableText}>{body}</Text></View>; }

function pickMetrics(metrics: Record<string, number | string | null>, needles: string[], limit: number): Array<[string, number | string | null]> {
  return Object.entries(metrics).filter(([, value]) => value !== null && value !== '').filter(([key]) => needles.some((needle) => key.toLowerCase().replace(/[^a-z0-9]/g, '').includes(needle))).slice(0, limit);
}
function humanize(value: string) { return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase()); }
function formatMetric(key: string, value: number | string | null) { if (value == null) return '—'; if (typeof value === 'number') { const lower = key.toLowerCase(); if (lower.includes('margin') || lower.includes('growth') || lower.includes('yield') || lower.includes('roe') || lower.includes('roa') || lower.includes('roi')) return `${value.toFixed(2)}%`; return number(value); } return String(value); }
function text(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function num(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
function number(value: number) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value); }
function maybeNumber(value: unknown) { const n = num(value); return n == null ? '—' : number(n); }
function signed(value: number) { return `${value >= 0 ? '+' : ''}${number(value)}`; }
function percent(value: number | null | undefined) { return value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`; }
function compact(value: number | null) { return value == null ? '—' : new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 2 }).format(value); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050607' }, scroll: { flex: 1 }, content: { padding: 18, paddingBottom: 48 }, flex: { flex: 1 }, pressed: { opacity: 0.58 }, muted: { color: '#64717b' }, warning: { color: '#e5bd61' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 24 }, circleButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11151a', borderWidth: 1, borderColor: '#293039' }, back: { color: '#edf0f2', fontSize: 34, lineHeight: 35, marginTop: -5 }, refresh: { color: '#b7c1c9', fontSize: 21, fontWeight: '900' }, symbolPill: { minWidth: 100, height: 43, borderRadius: 22, backgroundColor: '#171b20', borderWidth: 1, borderColor: '#353c43', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, symbolPillText: { color: '#dde2e5', fontSize: 17, fontWeight: '900' },
  loading: { minHeight: 330, alignItems: 'center', justifyContent: 'center', gap: 12 }, loadingText: { color: '#7d8790', fontSize: 11 }, error: { borderRadius: 13, borderWidth: 1, borderColor: '#5e2937', backgroundColor: '#1a0d11', padding: 12, marginBottom: 14 }, errorTitle: { color: '#ff788a', fontSize: 9, fontWeight: '900' }, errorText: { color: '#b8818a', fontSize: 10, marginTop: 4 },
  identity: { flexDirection: 'row', alignItems: 'center' }, logo: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#13181d', borderWidth: 1, borderColor: '#2d353d', marginRight: 13 }, logoText: { color: '#f4f6f7', fontSize: 14, fontWeight: '900' }, companyName: { color: '#f4f6f7', fontSize: 24, fontWeight: '900' }, companyMeta: { color: '#747f88', fontSize: 10, marginTop: 4 },
  price: { color: '#f6f7f8', fontSize: 49, fontWeight: '900', letterSpacing: -1.5, marginTop: 25 }, changeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 2 }, change: { fontSize: 19, fontWeight: '900' }, positive: { color: '#25cf91' }, negative: { color: '#ff6178' }, asOf: { color: '#727c84', fontSize: 9 }, sourceLine: { color: '#56616a', fontSize: 8, fontWeight: '900', marginTop: 5 },
  chartCard: { minHeight: 245, marginTop: 27, backgroundColor: '#070a0c', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#242a2f', paddingVertical: 12 }, chartHeader: { flexDirection: 'row', justifyContent: 'space-between' }, chartLabel: { color: '#66737d', fontSize: 8, fontWeight: '900' }, chartReturn: { fontSize: 10, fontWeight: '900' }, chart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 12 }, barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' }, chartBar: { width: '100%', minHeight: 2, borderRadius: 1 }, chartPositive: { backgroundColor: '#158c6f' }, chartNegative: { backgroundColor: '#9c4353' }, chartFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }, chartAxis: { color: '#56616a', fontSize: 7.5 }, chartEmpty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  periods: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 13 }, period: { width: 48, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, periodActive: { backgroundColor: '#e8ebed' }, periodText: { color: '#a9b0b6', fontSize: 10, fontWeight: '900' }, periodTextActive: { color: '#0d1012' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#282e33', marginTop: 6, marginBottom: 17 }, tab: { flex: 1, alignItems: 'center', paddingVertical: 13, borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabActive: { borderBottomColor: '#78ccf5' }, tabText: { color: '#a9afb4', fontSize: 10, fontWeight: '800' }, tabTextActive: { color: '#7ed0f8' },
  panel: { borderRadius: 15, borderWidth: 1, borderColor: '#242c32', backgroundColor: '#0c1013', padding: 14, marginBottom: 11 }, panelTitle: { color: '#70cbed', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7 }, metric: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#242a2f' }, metricLabel: { color: '#78838c', fontSize: 10.5, flex: 1 }, metricValue: { color: '#e7ebee', fontSize: 10.5, fontWeight: '800', maxWidth: '55%', textAlign: 'right' },
  scoreMetric: { paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#242a2f' }, scoreTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, scoreName: { color: '#cdd4d9', fontSize: 10.5, fontWeight: '800' }, scoreNumber: { fontSize: 13, fontWeight: '900' }, scoreTrack: { height: 5, backgroundColor: '#20262b', borderRadius: 4, overflow: 'hidden', marginTop: 7 }, scoreFill: { height: 5, borderRadius: 4 }, fillPositive: { backgroundColor: '#28c991' }, fillWarning: { backgroundColor: '#c49e47' }, scoreState: { color: '#59656e', fontSize: 7.5, marginTop: 4, fontWeight: '800' },
  capexNote: { borderRadius: 13, borderWidth: 1, borderColor: '#53451f', backgroundColor: '#171307', padding: 12, marginBottom: 11 }, capexTitle: { color: '#dcb75d', fontSize: 8.5, fontWeight: '900' }, capexText: { color: '#99885a', fontSize: 9.5, lineHeight: 14, marginTop: 5 }, flag: { alignSelf: 'flex-start', backgroundColor: '#172026', borderWidth: 1, borderColor: '#33434e', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6, marginVertical: 3 }, flagSevere: { backgroundColor: '#1d0e12', borderColor: '#5d2c39' }, flagText: { color: '#91a5b3', fontSize: 8, fontWeight: '900' }, flagSevereText: { color: '#ed7e90' }, enginesButton: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#2c6b53', backgroundColor: '#0d2119', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, enginesText: { color: '#9ae4c3', fontSize: 9, fontWeight: '900' },
  unavailable: { borderRadius: 14, borderWidth: 1, borderColor: '#594921', backgroundColor: '#171307', padding: 14, marginBottom: 11 }, unavailableTitle: { color: '#dcb85e', fontSize: 9, fontWeight: '900' }, unavailableText: { color: '#9c8a5a', fontSize: 10, lineHeight: 15, marginTop: 5 }, emptyText: { color: '#727e87', fontSize: 10, paddingVertical: 12 }, sourceCard: { borderRadius: 13, borderWidth: 1, borderColor: '#293a45', backgroundColor: '#0b1318', padding: 12 }, sourceTitle: { color: '#6fcbed', fontSize: 8.5, fontWeight: '900' }, sourceText: { color: '#778894', fontSize: 9.5, marginTop: 4 },
  newsRow: { paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#252b30' }, newsMeta: { color: '#63717a', fontSize: 8.5, fontWeight: '800' }, newsTitle: { color: '#e2e6e9', fontSize: 12.5, lineHeight: 17, fontWeight: '800', marginTop: 4 }, newsSummary: { color: '#7d8992', fontSize: 9.5, lineHeight: 14, marginTop: 4 }, recommendation: { paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#252b30' }, recoPeriod: { color: '#b8c1c8', fontSize: 9, fontWeight: '900' }, recoText: { color: '#7d8992', fontSize: 9, marginTop: 4 }, sensorNote: { color: '#9b8757', fontSize: 8.5, lineHeight: 13, marginTop: 8 },
});
