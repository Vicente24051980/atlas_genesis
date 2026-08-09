import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AtlasOnlineApi, type CompanyBundle, type DecisionBundle, type LiveQuote } from '../core/api/atlasOnlineApi';

export type AnalysisMode =
  | 'overview'
  | 'market'
  | 'growth'
  | 'quality'
  | 'capex'
  | 'valuation'
  | 'risk'
  | 'catalysts'
  | 'news';

type ModeConfig = {
  title: string;
  subtitle: string;
  keywords: string[];
  maxMetrics: number;
};

const CONFIG: Record<AnalysisMode, ModeConfig> = {
  overview: { title: 'Resumen Ω', subtitle: 'Precio, empresa y métricas clave', keywords: ['roe', 'roa', 'roi', 'margin', 'growth', 'pe', 'pb', 'currentratio', 'beta'], maxMetrics: 14 },
  market: { title: 'Mercado Ω', subtitle: 'Precio, rango, volumen, beta y comportamiento', keywords: ['52week', 'beta', 'volume', 'price', 'return', 'volatility'], maxMetrics: 18 },
  growth: { title: 'Growth Ω', subtitle: 'Crecimiento de ventas, EPS y tendencias disponibles', keywords: ['growth', 'cagr', 'revenue', 'eps'], maxMetrics: 20 },
  quality: { title: 'Business Quality Ω', subtitle: 'Rentabilidad, márgenes, eficiencia y solvencia', keywords: ['roe', 'roa', 'roi', 'margin', 'currentratio', 'quickratio', 'assetturnover'], maxMetrics: 20 },
  capex: { title: 'CAPEX Productivity Ω', subtitle: 'FCF, caja, inversión, retornos y deuda disponibles', keywords: ['cashflow', 'freecashflow', 'capex', 'roi', 'roic', 'assetturnover', 'debt', 'interest'], maxMetrics: 22 },
  valuation: { title: 'Valuation Ω', subtitle: 'Múltiplos y valoración devueltos por el proveedor', keywords: ['pe', 'pb', 'ps', 'ev', 'valuation', 'yield', 'dividend', 'price'], maxMetrics: 20 },
  risk: { title: 'Risk Ω', subtitle: 'Beta, liquidez, deuda, volatilidad y rango', keywords: ['beta', 'debt', 'currentratio', 'quickratio', '52week', 'volatility', 'interest'], maxMetrics: 20 },
  catalysts: { title: 'Catalysts Ω', subtitle: 'Noticias y cambios recientes del ticker', keywords: [], maxMetrics: 8 },
  news: { title: 'News Ω', subtitle: 'Noticias recientes de la compañía', keywords: [], maxMetrics: 0 },
};

export default function TickerAnalysisScreen({ mode }: { mode: AnalysisMode }) {
  const router = useRouter();
  const config = CONFIG[mode];
  const [ticker, setTicker] = useState('');
  const [bundle, setBundle] = useState<CompanyBundle | null>(null);
  const [decision, setDecision] = useState<DecisionBundle | null>(null);
  const [liveQuote, setLiveQuote] = useState<LiveQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [decisionError, setDecisionError] = useState('');

  const analyze = async () => {
    const symbol = ticker.trim().toUpperCase();
    if (!/^[A-Z0-9.\-]{1,20}$/.test(symbol)) {
      setError('Introduce un ticker válido, por ejemplo KO, MSFT o NVDA.');
      return;
    }
    setTicker(symbol);
    setLoading(true);
    setError('');
    setDecisionError('');
    setDecision(null);
    setLiveQuote(null);
    try {
      const [companyResult, decisionResult] = await Promise.allSettled([
        AtlasOnlineApi.company(symbol),
        AtlasOnlineApi.decision(symbol),
      ]);
      if (companyResult.status === 'rejected') throw companyResult.reason;
      setBundle(companyResult.value);
      if (decisionResult.status === 'fulfilled') {
        setDecision(decisionResult.value);
      } else {
        setDecisionError(decisionResult.reason instanceof Error ? decisionResult.reason.message : String(decisionResult.reason));
      }
    } catch (cause) {
      setBundle(null);
      setDecision(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const symbol = bundle?.symbol;
    if (!symbol) return;
    let active = true;
    const refresh = async () => {
      try {
        const quote = await AtlasOnlineApi.quote(symbol);
        if (active) setLiveQuote(quote);
      } catch {
        // Keep the last known quote on screen. Freshness label exposes staleness.
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [bundle?.symbol]);

  const metrics = bundle ? selectMetrics(bundle.metrics, config.keywords, config.maxMetrics) : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver al menú" onPress={() => router.replace('/')} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>‹ MENÚ</Text>
        </Pressable>
        <Text style={styles.online}>RENDER · FINNHUB · AUTO 15s</Text>
      </View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.subtitle}>{config.subtitle}</Text>

      <View style={styles.searchCard}>
        <TextInput
          accessibilityLabel={`Ticker para ${config.title}`}
          value={ticker}
          onChangeText={setTicker}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="Ticker · ej. KO"
          placeholderTextColor="#657386"
          returnKeyType="search"
          onSubmitEditing={() => void analyze()}
          style={styles.input}
        />
        <Pressable accessibilityRole="button" accessibilityLabel={`Analizar ${config.title}`} onPress={() => void analyze()} style={styles.analyzeButton}>
          {loading ? <ActivityIndicator color="#041018" /> : <Text style={styles.analyzeText}>ANALIZAR</Text>}
        </Pressable>
      </View>

      <Text style={styles.onlyTicker}>Solo introduces el ticker. ATLAS devuelve datos + decisión COMPRAR / NO COMPRAR.</Text>

      {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

      {bundle ? (
        <>
          {decision ? <DecisionCard decision={decision} /> : <DecisionUnavailable message={decisionError} />}
          <CompanyHeader bundle={bundle} liveQuote={liveQuote} />
          {mode === 'overview' ? <Overview bundle={bundle} metrics={metrics} /> : null}
          {mode === 'market' ? <Market bundle={bundle} metrics={metrics} liveQuote={liveQuote} /> : null}
          {mode === 'growth' || mode === 'quality' || mode === 'capex' || mode === 'valuation' || mode === 'risk' ? (
            <MetricPanel title={config.title} metrics={metrics} emptyText="El proveedor no devolvió métricas suficientes para esta capa. ATLAS las deja como no disponibles; no inventa valores." />
          ) : null}
          {mode === 'capex' ? <Guardrail text="CAPEX Productivity Ω solo produce score cuando existen inputs suficientes y trazables. Un dato ausente no se sustituye con una estimación opaca." /> : null}
          {mode === 'catalysts' || mode === 'news' ? <NewsPanel bundle={bundle} /> : null}
          {mode === 'catalysts' ? <RecommendationPanel bundle={bundle} /> : null}
          <SourcePanel bundle={bundle} />
        </>
      ) : (
        <View style={styles.empty}><Text style={styles.omega}>Ω</Text><Text style={styles.emptyTitle}>Introduce un ticker</Text><Text style={styles.emptyText}>ATLAS hace la interpretación y devuelve una decisión binaria junto a los datos.</Text></View>
      )}
    </ScrollView>
  );
}

function DecisionCard({ decision }: { decision: DecisionBundle }) {
  return (
    <View accessibilityLabel={`Decisión ATLAS ${decision.label}`} style={[styles.decisionCard, decision.buy ? styles.buyCard : styles.noBuyCard]}>
      <Text style={styles.decisionEyebrow}>DECISIÓN Ω · {decision.algorithmVersion}</Text>
      <View style={styles.decisionTop}>
        <Text style={[styles.decisionLabel, decision.buy ? styles.buyText : styles.noBuyText]}>{decision.label}</Text>
        <Text style={styles.coverage}>{Math.round(decision.evidenceCoverage)}% evidencia</Text>
      </View>
      <View style={styles.scoreGrid}>
        <Score label="Quality" value={decision.scores.quality} />
        <Score label="Growth" value={decision.scores.growth} />
        <Score label="Valuation" value={decision.scores.valuation} />
        <Score label="Risk" value={decision.scores.risk} />
        <Score label="Opportunity" value={decision.scores.opportunity} />
        <Score label="Conviction" value={decision.scores.conviction} />
      </View>
      {decision.reasons.slice(0, 4).map((reason, index) => <Text key={`${index}-${reason}`} style={styles.reason}>• {reason}</Text>)}
      <Text style={styles.decisionMeta}>{decision.auditStatus} · {decision.epistemicState}</Text>
    </View>
  );
}

function DecisionUnavailable({ message }: { message: string }) {
  return (
    <View style={[styles.decisionCard, styles.noBuyCard]}>
      <Text style={styles.decisionEyebrow}>DECISIÓN Ω</Text>
      <Text style={[styles.decisionLabel, styles.noBuyText]}>NO COMPRAR</Text>
      <Text style={styles.reason}>La decisión no está disponible de forma auditable. ATLAS resuelve conservadoramente a NO COMPRAR.</Text>
      {message ? <Text style={styles.decisionMeta}>{message}</Text> : null}
    </View>
  );
}

function Score({ label, value }: { label: string; value: number | null }) {
  return <View style={styles.score}><Text style={styles.scoreLabel}>{label}</Text><Text style={styles.scoreValue}>{value == null ? '—' : value.toFixed(0)}</Text></View>;
}

function CompanyHeader({ bundle, liveQuote }: { bundle: CompanyBundle; liveQuote: LiveQuote | null }) {
  const q = bundle.quote;
  const p = bundle.profile;
  const price = liveQuote?.price ?? numValue(q.c);
  const changePct = liveQuote?.changePct ?? numValue(q.dp);
  const rawTimestamp = liveQuote?.timestamp || (numValue(q.t) ? new Date(numValue(q.t)! * 1000).toISOString() : null);
  const freshness = quoteFreshness(rawTimestamp);
  return (
    <View style={styles.hero}>
      <View style={styles.flex}>
        <Text style={styles.ticker}>{bundle.symbol}</Text>
        <Text style={styles.company}>{textValue(p.name) || 'Compañía'}</Text>
        <Text style={styles.meta}>{[textValue(p.exchange), textValue(p.country), textValue(p.currency), textValue(p.finnhubIndustry)].filter(Boolean).join(' · ') || 'Datos de perfil no disponibles'}</Text>
        <Text style={styles.quoteTime}>{freshness.label}{rawTimestamp ? ` · ${formatTime(rawTimestamp)}` : ''}</Text>
      </View>
      <View style={styles.priceBox}>
        <Text style={styles.price}>{price == null ? '—' : formatNumber(price)}</Text>
        <Text style={[styles.change, (changePct ?? 0) < 0 ? styles.red : styles.green]}>{changePct == null ? '—' : `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`}</Text>
      </View>
    </View>
  );
}

function Overview({ bundle, metrics }: { bundle: CompanyBundle; metrics: MetricRow[] }) {
  const p = bundle.profile;
  return (
    <>
      <Panel title="EMPRESA">
        <Row label="Sector / industria" value={textValue(p.finnhubIndustry) || '—'} />
        <Row label="Capitalización" value={numValue(p.marketCapitalization) == null ? '—' : `${formatNumber(numValue(p.marketCapitalization)!)} M`} />
        <Row label="País" value={textValue(p.country) || '—'} />
        <Row label="Moneda" value={textValue(p.currency) || '—'} />
      </Panel>
      <MetricPanel title="MÉTRICAS CLAVE" metrics={metrics} emptyText="Sin métricas clave devueltas." />
      <NewsPanel bundle={bundle} limit={5} />
    </>
  );
}

function Market({ bundle, metrics, liveQuote }: { bundle: CompanyBundle; metrics: MetricRow[]; liveQuote: LiveQuote | null }) {
  const q = bundle.quote;
  return (
    <>
      <Panel title="SESIÓN / ÚLTIMA COTIZACIÓN">
        <Row label="Último precio" value={liveQuote?.price == null ? formatMaybe(q.c) : formatNumber(liveQuote.price)} />
        <Row label="Apertura" value={liveQuote?.open == null ? formatMaybe(q.o) : formatNumber(liveQuote.open)} />
        <Row label="Máximo" value={liveQuote?.high == null ? formatMaybe(q.h) : formatNumber(liveQuote.high)} />
        <Row label="Mínimo" value={liveQuote?.low == null ? formatMaybe(q.l) : formatNumber(liveQuote.low)} />
        <Row label="Cierre anterior" value={liveQuote?.previousClose == null ? formatMaybe(q.pc) : formatNumber(liveQuote.previousClose)} />
        <Row label="Cambio %" value={liveQuote?.changePct == null ? formatMaybe(q.dp) : `${liveQuote.changePct.toFixed(2)}%`} />
        <Row label="Timestamp proveedor" value={liveQuote?.timestamp ? new Date(liveQuote.timestamp).toLocaleString('es-ES') : '—'} />
      </Panel>
      <MetricPanel title="MERCADO" metrics={metrics} emptyText="Sin métricas adicionales de mercado." />
    </>
  );
}

type MetricRow = { key: string; label: string; value: number | string | null };

function selectMetrics(metrics: CompanyBundle['metrics'], keywords: string[], limit: number): MetricRow[] {
  return Object.entries(metrics)
    .filter(([, value]) => value !== null && value !== '')
    .filter(([key]) => !keywords.length || keywords.some((keyword) => key.toLowerCase().includes(keyword)))
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, limit)
    .map(([key, value]) => ({ key, label: humanize(key), value }));
}

function MetricPanel({ title, metrics, emptyText }: { title: string; metrics: MetricRow[]; emptyText: string }) {
  return (
    <Panel title={title.toUpperCase()}>
      {metrics.length ? metrics.map((metric) => <Row key={metric.key} label={metric.label} value={formatMetric(metric.key, metric.value)} />) : <Text style={styles.body}>{emptyText}</Text>}
    </Panel>
  );
}

function NewsPanel({ bundle, limit = 12 }: { bundle: CompanyBundle; limit?: number }) {
  return (
    <Panel title="NOTICIAS">
      {bundle.news.length ? bundle.news.slice(0, limit).map((item, index) => {
        const headline = textValue(item.headline) || 'Noticia';
        const source = textValue(item.source) || 'Fuente';
        const timestamp = numValue(item.datetime);
        const dateText = timestamp ? new Date(timestamp * 1000).toLocaleDateString('es-ES') : '';
        return <View key={`${headline}-${index}`} style={styles.newsItem}><Text style={styles.newsMeta}>{[source, dateText].filter(Boolean).join(' · ')}</Text><Text style={styles.newsTitle}>{headline}</Text></View>;
      }) : <Text style={styles.body}>Finnhub no devolvió noticias recientes para este ticker.</Text>}
    </Panel>
  );
}

function RecommendationPanel({ bundle }: { bundle: CompanyBundle }) {
  const latest = bundle.recommendations[0];
  return (
    <Panel title="CONSENSO SENSOR">
      {latest ? (
        <>
          <Row label="Strong buy" value={formatMaybe(latest.strongBuy)} />
          <Row label="Buy" value={formatMaybe(latest.buy)} />
          <Row label="Hold" value={formatMaybe(latest.hold)} />
          <Row label="Sell" value={formatMaybe(latest.sell)} />
          <Row label="Strong sell" value={formatMaybe(latest.strongSell)} />
          <Text style={styles.guardText}>Consenso de analistas = sensor, no evidencia canónica ni decisión ATLAS.</Text>
        </>
      ) : <Text style={styles.body}>Consenso no disponible.</Text>}
    </Panel>
  );
}

function SourcePanel({ bundle }: { bundle: CompanyBundle }) {
  return (
    <Panel title="FUENTES / ESTADO">
      {Object.entries(bundle.sourceStatus).map(([key, value]) => <Row key={key} label={humanize(key)} value={value} />)}
      <Text style={styles.guardText}>{bundle.guardrail}</Text>
    </Panel>
  );
}

function Guardrail({ text }: { text: string }) {
  return <View style={styles.guard}><Text style={styles.guardText}>{text}</Text></View>;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.panel}><Text style={styles.panelTitle}>{title}</Text>{children}</View>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}

function textValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatMaybe(value: unknown): string {
  const n = numValue(value);
  return n == null ? '—' : formatNumber(n);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

function formatMetric(key: string, value: number | string | null): string {
  if (value == null) return '—';
  if (typeof value === 'string') return value;
  const lower = key.toLowerCase();
  const percentLike = ['margin', 'growth', 'roe', 'roa', 'roi', 'yield', 'return'].some((token) => lower.includes(token));
  return `${formatNumber(value)}${percentLike ? '%' : ''}`;
}

function humanize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function quoteFreshness(timestamp: string | null): { label: string } {
  if (!timestamp) return { label: 'COTIZACIÓN SIN TIMESTAMP' };
  const age = Date.now() - new Date(timestamp).getTime();
  if (!Number.isFinite(age)) return { label: 'TIMESTAMP INVÁLIDO' };
  if (age <= 30000) return { label: 'LIVE' };
  if (age <= 15 * 60000) return { label: 'DELAYED' };
  return { label: 'ÚLTIMA COTIZACIÓN' };
}

function formatTime(timestamp: string): string {
  const value = new Date(timestamp);
  return Number.isNaN(value.getTime()) ? '—' : value.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#070b10' },
  content: { padding: 18, paddingBottom: 54, gap: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuButton: { borderWidth: 1, borderColor: '#28415b', backgroundColor: '#0d1620', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  menuButtonText: { color: '#6fc3ff', fontWeight: '900', fontSize: 12 },
  online: { color: '#617184', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: '#f7fafc', fontSize: 30, fontWeight: '900' },
  subtitle: { color: '#93a2b5', fontSize: 15, lineHeight: 21 },
  searchCard: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: '#101821', borderWidth: 1, borderColor: '#26394c', borderRadius: 16 },
  input: { flex: 1, height: 52, borderRadius: 11, backgroundColor: '#080d13', borderWidth: 1, borderColor: '#263442', color: '#ffffff', paddingHorizontal: 14, fontSize: 18, fontWeight: '800' },
  analyzeButton: { width: 108, height: 52, borderRadius: 11, backgroundColor: '#58c9ff', alignItems: 'center', justifyContent: 'center' },
  analyzeText: { color: '#041018', fontSize: 12, fontWeight: '900' },
  onlyTicker: { color: '#6f8195', fontSize: 11, textAlign: 'center' },
  errorCard: { backgroundColor: '#211015', borderWidth: 1, borderColor: '#6d2d3b', borderRadius: 12, padding: 12 },
  errorText: { color: '#ff8da0', lineHeight: 19 },
  decisionCard: { borderWidth: 2, borderRadius: 17, padding: 16, gap: 8 },
  buyCard: { backgroundColor: '#071b13', borderColor: '#1f7a52' },
  noBuyCard: { backgroundColor: '#200c11', borderColor: '#8b2f43' },
  decisionEyebrow: { color: '#8da0b3', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  decisionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 },
  decisionLabel: { fontSize: 31, fontWeight: '900' },
  buyText: { color: '#45e19c' },
  noBuyText: { color: '#ff7187' },
  coverage: { color: '#91a0af', fontSize: 10, fontWeight: '800', paddingBottom: 4 },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginVertical: 2 },
  score: { width: '31.8%', backgroundColor: '#0a1016', borderRadius: 8, borderWidth: 1, borderColor: '#24303b', padding: 7 },
  scoreLabel: { color: '#68798a', fontSize: 7, fontWeight: '800' },
  scoreValue: { color: '#e7eef4', fontSize: 15, fontWeight: '900', marginTop: 2 },
  reason: { color: '#c5d0da', fontSize: 10, lineHeight: 15 },
  decisionMeta: { color: '#68798a', fontSize: 8, fontWeight: '800', marginTop: 2 },
  hero: { flexDirection: 'row', gap: 12, backgroundColor: '#101821', borderWidth: 1, borderColor: '#273d52', borderRadius: 16, padding: 16 },
  flex: { flex: 1 },
  ticker: { color: '#ffffff', fontSize: 30, fontWeight: '900' },
  company: { color: '#cbd5e1', fontSize: 14, fontWeight: '700', marginTop: 2 },
  meta: { color: '#718196', fontSize: 10, marginTop: 5, lineHeight: 15 },
  quoteTime: { color: '#5acbfa', fontSize: 8, fontWeight: '900', marginTop: 7 },
  priceBox: { alignItems: 'flex-end' },
  price: { color: '#ffffff', fontSize: 25, fontWeight: '900' },
  change: { fontSize: 12, fontWeight: '900', marginTop: 4 },
  green: { color: '#4ade9f' },
  red: { color: '#ff7488' },
  panel: { backgroundColor: '#0e151d', borderWidth: 1, borderColor: '#1f3040', borderRadius: 15, padding: 15, gap: 2 },
  panelTitle: { color: '#67c8ff', fontSize: 11, fontWeight: '900', letterSpacing: 1.1, marginBottom: 8 },
  row: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottomWidth: 1, borderBottomColor: '#17212b' },
  rowLabel: { flex: 1, color: '#8fa0b3', fontSize: 12 },
  rowValue: { maxWidth: '48%', color: '#eef4f8', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  body: { color: '#8595a8', lineHeight: 20 },
  newsItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#17212b' },
  newsMeta: { color: '#607286', fontSize: 9, marginBottom: 4 },
  newsTitle: { color: '#dce6ed', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  guard: { backgroundColor: '#15170d', borderWidth: 1, borderColor: '#3b4420', borderRadius: 12, padding: 12 },
  guardText: { color: '#9ba66f', fontSize: 10, lineHeight: 16, marginTop: 8 },
  empty: { minHeight: 340, alignItems: 'center', justifyContent: 'center', padding: 24 },
  omega: { color: '#20384f', fontSize: 70, fontWeight: '900' },
  emptyTitle: { color: '#e6edf3', fontSize: 20, fontWeight: '900', marginTop: 8 },
  emptyText: { color: '#75869a', textAlign: 'center', lineHeight: 20, marginTop: 8 },
});
