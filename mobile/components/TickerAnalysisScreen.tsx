import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import AtlasActionCard from './AtlasActionCard';
import { AtlasOnlineApi, type AtlasAnalyzeBundle, type CompanyBundle, type MarketHistory } from '../core/api/atlasOnlineApi';

export type AnalysisMode = 'overview' | 'market' | 'growth' | 'quality' | 'capex' | 'valuation' | 'risk' | 'catalysts' | 'news';

type Config = { title: string; subtitle: string; scoreKey?: keyof AtlasAnalyzeBundle['analysis']['scores']; sourceKeys: string[] };

const CONFIG: Record<AnalysisMode, Config> = {
  overview: { title: 'Resumen Ω', subtitle: 'Decisión final cuantitativa y estado de todos los motores.', sourceKeys: [] },
  market: { title: 'Mercado Ω', subtitle: 'Precio, tendencia, retornos y drawdown. El precio no altera la tesis por sí solo.', sourceKeys: [] },
  growth: { title: 'Growth Ω', subtitle: 'Ventas, EPS y FCF: velocidad y dirección del crecimiento.', scoreKey: 'growth', sourceKeys: ['revenueGrowth', 'epsGrowth', 'fcfGrowth'] },
  quality: { title: 'Business Quality Ω', subtitle: 'Retornos, márgenes y eficiencia operativa.', scoreKey: 'businessQuality', sourceKeys: ['roi', 'roe', 'roa', 'grossMargin', 'netMargin', 'operatingMargin', 'assetTurnover'] },
  capex: { title: 'CAPEX Productivity Ω', subtitle: 'Productividad del capital. Sin inputs suficientes, ATLAS no inventa un score.', scoreKey: 'capexProductivity', sourceKeys: ['roi', 'fcfPerShare', 'capexPerShare', 'assetTurnover', 'debtEquity'] },
  valuation: { title: 'Valuation Ω', subtitle: 'P/E, forward P/E, P/B, P/S y expectativas implícitas disponibles.', scoreKey: 'valuation', sourceKeys: ['pe', 'forwardPE', 'pb', 'ps', 'dividendYield'] },
  risk: { title: 'Risk Ω', subtitle: 'Beta, apalancamiento, liquidez e interest coverage.', scoreKey: 'risk', sourceKeys: ['beta', 'debtEquity', 'currentRatio', 'quickRatio', 'interestCoverage'] },
  catalysts: { title: 'Catalysts Ω', subtitle: 'Noticias y consenso como sensores. No son evidencia canónica automática.', sourceKeys: [] },
  news: { title: 'News Ω', subtitle: 'Noticias recientes separadas de la decisión de inversión.', sourceKeys: [] },
};

export default function TickerAnalysisScreen({ mode }: { mode: AnalysisMode }) {
  const router = useRouter();
  const params = useLocalSearchParams<{ ticker?: string | string[]; symbol?: string | string[] }>();
  const initial = Array.isArray(params.ticker) ? params.ticker[0] : params.ticker || (Array.isArray(params.symbol) ? params.symbol[0] : params.symbol) || '';
  const config = CONFIG[mode];
  const [ticker, setTicker] = useState(initial.toUpperCase());
  const [atlas, setAtlas] = useState<AtlasAnalyzeBundle | null>(null);
  const [company, setCompany] = useState<CompanyBundle | null>(null);
  const [history, setHistory] = useState<MarketHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async (requested?: string) => {
    const symbol = (requested || ticker).trim().toUpperCase();
    if (!/^[A-Z0-9.\-]{1,20}$/.test(symbol)) {
      setError('Introduce un ticker válido.');
      return;
    }
    setTicker(symbol);
    setLoading(true);
    setError('');
    const tasks: Promise<unknown>[] = [AtlasOnlineApi.atlasAnalyze(symbol, 'candidate')];
    if (mode === 'market') tasks.push(AtlasOnlineApi.marketHistory(symbol, 430));
    if (mode === 'catalysts' || mode === 'news') tasks.push(AtlasOnlineApi.company(symbol));
    const results = await Promise.allSettled(tasks);
    const atlasResult = results[0];
    if (atlasResult.status === 'fulfilled') setAtlas(atlasResult.value as AtlasAnalyzeBundle);
    else setAtlas(null);
    if (mode === 'market') {
      const result = results[1];
      setHistory(result?.status === 'fulfilled' ? result.value as MarketHistory : null);
    }
    if (mode === 'catalysts' || mode === 'news') {
      const result = results[1];
      setCompany(result?.status === 'fulfilled' ? result.value as CompanyBundle : null);
    }
    if (atlasResult.status === 'rejected') setError(atlasResult.reason instanceof Error ? atlasResult.reason.message : String(atlasResult.reason));
    setLoading(false);
  };

  useEffect(() => { if (initial) void analyze(initial); }, []);

  const score = config.scoreKey && atlas ? atlas.analysis.scores[config.scoreKey] : null;
  const inputs = useMemo(() => config.sourceKeys.map((key) => [key, atlas?.analysis.inputs[key]] as const).filter(([, value]) => value), [atlas, config.sourceKeys]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.engine}>ENGINE VIEW Ω</Text>
      </View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.subtitle}>{config.subtitle}</Text>

      <View style={styles.search}>
        <TextInput value={ticker} onChangeText={setTicker} autoCapitalize="characters" autoCorrect={false} placeholder="Ticker · ej. MSFT" placeholderTextColor="#5f6b75" returnKeyType="search" onSubmitEditing={() => void analyze()} style={styles.input} accessibilityLabel={`Ticker para ${config.title}`} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Analizar ${config.title}`} onPress={() => void analyze()} style={styles.analyze}>{loading ? <ActivityIndicator color="#07110d" /> : <Text style={styles.analyzeText}>ANALIZAR</Text>}</Pressable>
      </View>
      <Text style={styles.onlyTicker}>Solo introduces ticker. Los inputs se obtienen del backend y cada pantalla usa su propio motor/capa.</Text>

      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}

      {atlas ? (
        <>
          <View style={styles.identity}><View><Text style={styles.ticker}>{atlas.symbol}</Text><Text style={styles.company}>{text(atlas.profile.name) || atlas.quote.name || atlas.symbol}</Text></View><View style={styles.priceBox}><Text style={styles.price}>{atlas.quote.price == null ? '—' : number(atlas.quote.price)}</Text><Text style={(atlas.quote.changePct ?? 0) >= 0 ? styles.positive : styles.negative}>{percent(atlas.quote.changePct)}</Text></View></View>

          {mode === 'overview' ? <Overview atlas={atlas} /> : null}
          {mode === 'market' ? <MarketView atlas={atlas} history={history} /> : null}
          {['growth', 'quality', 'valuation', 'risk'].includes(mode) ? <EngineScoreView title={config.title} score={typeof score === 'number' ? score : null} inputs={inputs} state={config.scoreKey ? atlas.analysis.engineStates[engineStateKey(config.scoreKey)] : undefined} inverse={mode === 'risk'} /> : null}
          {mode === 'capex' ? <CapexView atlas={atlas} inputs={inputs} /> : null}
          {mode === 'catalysts' ? <CatalystsView company={company} atlas={atlas} /> : null}
          {mode === 'news' ? <NewsView company={company} /> : null}

          {mode !== 'news' && mode !== 'catalysts' ? <View style={styles.actionCompact}><AtlasActionCard analysis={atlas.analysis} compact /></View> : null}
          <View style={styles.source}><Text style={styles.sourceTitle}>TRAZABILIDAD</Text><Text style={styles.sourceText}>{atlas.analysis.algorithmVersion} · score coverage {atlas.analysis.scoreCoverage.toFixed(0)}% · metric coverage {atlas.analysis.metricCoverage.toFixed(0)}%</Text></View>
        </>
      ) : !loading ? <View style={styles.empty}><Text style={styles.omega}>Ω</Text><Text style={styles.emptyTitle}>Introduce un ticker</Text><Text style={styles.emptyText}>ATLAS ejecutará esta capa concreta; no una plantilla genérica compartida.</Text></View> : null}
    </ScrollView>
  );
}

function Overview({ atlas }: { atlas: AtlasAnalyzeBundle }) {
  return (
    <>
      <AtlasActionCard analysis={atlas.analysis} />
      <Panel title="STACK Ω">
        {Object.entries(atlas.analysis.scores).map(([key, value]) => <ScoreRow key={key} label={humanize(key)} value={value} state={atlas.analysis.engineStates[engineStateKey(key)]} inverse={key === 'risk'} />)}
      </Panel>
    </>
  );
}

function MarketView({ atlas, history }: { atlas: AtlasAnalyzeBundle; history: MarketHistory | null }) {
  const q = atlas.quote;
  return (
    <>
      <View style={styles.marketHero}><Text style={styles.marketEyebrow}>MARKET SENSOR</Text><Text style={styles.marketBig}>{q.price == null ? '—' : number(q.price)}</Text><Text style={(q.changePct ?? 0) >= 0 ? styles.positive : styles.negative}>{percent(q.changePct)}</Text><Text style={styles.marketMeta}>{q.source} · {q.delayed ? 'REFERENCIA/DIFERIDO' : 'PROVEEDOR'}</Text></View>
      <Panel title="SESIÓN">
        <Metric label="Apertura" value={q.open == null ? '—' : number(q.open)} />
        <Metric label="Máximo" value={q.high == null ? '—' : number(q.high)} />
        <Metric label="Mínimo" value={q.low == null ? '—' : number(q.low)} />
        <Metric label="Cierre anterior" value={q.previousClose == null ? '—' : number(q.previousClose)} />
      </Panel>
      <Panel title="TENDENCIA">
        <Metric label="5 sesiones" value={percent(history?.returns['5d'])} />
        <Metric label="20 sesiones" value={percent(history?.returns['20d'])} />
        <Metric label="60 sesiones" value={percent(history?.returns['60d'])} />
        <Metric label="252 sesiones" value={percent(history?.returns['252d'])} />
        <Metric label="Drawdown 1A" value={percent(history?.drawdown252)} />
      </Panel>
      <Guardrail text="Mercado Ω es sensor. Precio, momentum y drawdown no pueden degradar ni mejorar la tesis canónica por sí solos." />
    </>
  );
}

function EngineScoreView({ title, score, inputs, state, inverse = false }: { title: string; score: number | null; inputs: ReadonlyArray<readonly [string, { value: number; sourceKey: string | null } | undefined]>; state?: string; inverse?: boolean }) {
  const good = score != null && (inverse ? score <= 45 : score >= 60);
  return (
    <>
      <View style={styles.scoreHero}><Text style={styles.scoreHeroLabel}>{title.toUpperCase()}</Text><Text style={[styles.scoreHeroValue, score == null ? styles.muted : good ? styles.positive : styles.warning]}>{score == null ? '—' : Math.round(score)}</Text><Text style={styles.scoreHeroState}>{state?.replaceAll('_', ' ') || 'INSUFFICIENT DATA'}</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(100, score ?? 0))}%` }, good ? styles.fillGood : styles.fillWarn]} /></View></View>
      <Panel title="INPUTS DEL MOTOR">{inputs.length ? inputs.map(([key, input]) => input ? <Metric key={key} label={humanize(key)} value={`${formatValue(input.value)} · ${input.sourceKey || 'provider'}`} /> : null) : <Text style={styles.noData}>El proveedor no devuelve inputs suficientes para esta capa.</Text>}</Panel>
    </>
  );
}

function CapexView({ atlas, inputs }: { atlas: AtlasAnalyzeBundle; inputs: ReadonlyArray<readonly [string, { value: number; sourceKey: string | null } | undefined]> }) {
  const score = atlas.analysis.scores.capexProductivity;
  const state = atlas.analysis.engineStates.capexProductivity;
  return (
    <>
      <View style={styles.capexHero}><Text style={styles.capexLabel}>CAPEX PRODUCTIVITY Ω</Text><Text style={styles.capexValue}>{score == null ? 'NO SCORE' : Math.round(score)}</Text><Text style={styles.capexState}>{state.replaceAll('_', ' ')}</Text><Text style={styles.capexReason}>{atlas.analysis.capexReason}</Text></View>
      <Panel title="INPUTS TRAZABLES">{inputs.length ? inputs.map(([key, input]) => input ? <Metric key={key} label={humanize(key)} value={`${formatValue(input.value)} · ${input.sourceKey || 'provider'}`} /> : null) : <Text style={styles.noData}>Sin inputs trazables suficientes.</Text>}</Panel>
      <Guardrail text="El CAPEX Productivity Ω canónico exige sus siete dimensiones y políticas de capital/caja. Un sensor parcial nunca se presenta como score canónico completo." />
    </>
  );
}

function CatalystsView({ company, atlas }: { company: CompanyBundle | null; atlas: AtlasAnalyzeBundle }) {
  return (
    <>
      <View style={styles.catalystHero}><Text style={styles.catalystLabel}>CATALYST SENSOR</Text><Text style={styles.catalystTitle}>{company?.news.length ?? 0} noticias · {atlas.recommendations.length} bloques de consenso</Text><Text style={styles.catalystText}>Catalizadores pueden cambiar prioridad de revisión. Solo evidencia admisible puede cambiar convicción/tesis.</Text></View>
      <NewsList news={company?.news || []} limit={8} />
      <Panel title="CONSENSO ANALISTAS">{atlas.recommendations.length ? atlas.recommendations.slice(0, 8).map((item, index) => <View key={index} style={styles.reco}><Text style={styles.recoPeriod}>{text(item.period) || 'Periodo'}</Text><Text style={styles.recoText}>Strong Buy {num(item.strongBuy) ?? '—'} · Buy {num(item.buy) ?? '—'} · Hold {num(item.hold) ?? '—'} · Sell {num(item.sell) ?? '—'}</Text></View>) : <Text style={styles.noData}>Sin recomendaciones devueltas.</Text>}</Panel>
      <Guardrail text="Consenso, titulares y precio son sensores. No se convierten automáticamente en evidencia canónica ni en falsificadores de tesis." />
    </>
  );
}

function NewsView({ company }: { company: CompanyBundle | null }) { return <><NewsList news={company?.news || []} limit={20} /><Guardrail text="News Ω separa información de evidencia. Una noticia puede abrir revisión; no cambia la tesis sin validación." /></>; }
function NewsList({ news, limit }: { news: Array<Record<string, unknown>>; limit: number }) { return <Panel title="NOTICIAS">{news.length ? news.slice(0, limit).map((item, index) => <View key={`${text(item.headline) || 'news'}-${index}`} style={styles.news}><Text style={styles.newsMeta}>{text(item.source) || 'Fuente'}</Text><Text style={styles.newsTitle}>{text(item.headline) || 'Noticia'}</Text><Text style={styles.newsSummary}>{text(item.summary) || ''}</Text></View>) : <Text style={styles.noData}>Sin noticias disponibles.</Text>}</Panel>; }
function Panel({ title, children }: { title: string; children: ReactNode }) { return <View style={styles.panel}><Text style={styles.panelTitle}>{title}</Text>{children}</View>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }
function ScoreRow({ label, value, state, inverse = false }: { label: string; value: number | null; state?: string; inverse?: boolean }) { const good = value != null && (inverse ? value <= 45 : value >= 60); return <View style={styles.scoreRow}><View style={styles.scoreTop}><Text style={styles.scoreName}>{label}</Text><Text style={[styles.scoreNumber, value == null ? styles.muted : good ? styles.positive : styles.warning]}>{value == null ? '—' : Math.round(value)}</Text></View><Text style={styles.scoreState}>{state?.replaceAll('_', ' ') || '—'}</Text></View>; }
function Guardrail({ text: body }: { text: string }) { return <View style={styles.guardrail}><Text style={styles.guardrailTitle}>GUARDRAIL Ω</Text><Text style={styles.guardrailText}>{body}</Text></View>; }
function engineStateKey(key: string) { if (key === 'businessQuality') return 'businessQuality'; if (key === 'financialQuality') return 'financialQuality'; if (key === 'moatProxy') return 'moat'; if (key === 'managementProxy') return 'management'; if (key === 'capexProductivity') return 'capexProductivity'; return key; }
function humanize(value: string) { return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()); }
function text(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function num(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
function number(value: number) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value); }
function percent(value: number | null | undefined) { return value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`; }
function formatValue(value: number) { return Number.isInteger(value) ? value.toString() : value.toFixed(2); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { padding: 18, paddingBottom: 48, gap: 11 }, muted: { color: '#62707a' }, positive: { color: '#37d59b' }, negative: { color: '#ff667c' }, warning: { color: '#e2bb60' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11161a', borderWidth: 1, borderColor: '#293139' }, backText: { color: '#eef1f3', fontSize: 32, lineHeight: 33, marginTop: -4 }, engine: { color: '#6fcbee', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#f5f7f8', fontSize: 30, fontWeight: '900' }, subtitle: { color: '#87939d', fontSize: 12, lineHeight: 18 },
  search: { flexDirection: 'row', gap: 8, marginTop: 4 }, input: { flex: 1, minHeight: 49, borderRadius: 12, backgroundColor: '#0b1014', borderWidth: 1, borderColor: '#29343d', color: '#f2f5f7', paddingHorizontal: 13, fontSize: 15, fontWeight: '800' }, analyze: { minWidth: 104, borderRadius: 12, backgroundColor: '#62d7ac', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, analyzeText: { color: '#06110d', fontSize: 9, fontWeight: '900' }, onlyTicker: { color: '#5f6c76', fontSize: 8.5, lineHeight: 13 },
  error: { borderRadius: 12, backgroundColor: '#190d11', borderWidth: 1, borderColor: '#5e2937', padding: 11 }, errorText: { color: '#d28b96', fontSize: 10 },
  identity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 74, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#252b30' }, ticker: { color: '#f4f6f7', fontSize: 23, fontWeight: '900' }, company: { color: '#77838d', fontSize: 10, marginTop: 3 }, priceBox: { alignItems: 'flex-end' }, price: { color: '#f1f3f5', fontSize: 20, fontWeight: '900' },
  actionCompact: { marginTop: 3 },
  marketHero: { borderRadius: 16, borderWidth: 1, borderColor: '#284452', backgroundColor: '#0b151b', padding: 15 }, marketEyebrow: { color: '#70cbed', fontSize: 8.5, fontWeight: '900' }, marketBig: { color: '#f3f6f8', fontSize: 34, fontWeight: '900', marginTop: 7 }, marketMeta: { color: '#5f707c', fontSize: 8, fontWeight: '800', marginTop: 5 },
  scoreHero: { borderRadius: 16, borderWidth: 1, borderColor: '#2b3e49', backgroundColor: '#0c1419', padding: 15 }, scoreHeroLabel: { color: '#6fcbee', fontSize: 9, fontWeight: '900' }, scoreHeroValue: { fontSize: 52, fontWeight: '900', marginTop: 6 }, scoreHeroState: { color: '#667681', fontSize: 8.5, fontWeight: '900' }, track: { height: 7, borderRadius: 4, backgroundColor: '#22292f', overflow: 'hidden', marginTop: 11 }, fill: { height: 7, borderRadius: 4 }, fillGood: { backgroundColor: '#2ecb94' }, fillWarn: { backgroundColor: '#c49d47' },
  capexHero: { borderRadius: 16, borderWidth: 1, borderColor: '#5b4821', backgroundColor: '#171307', padding: 15 }, capexLabel: { color: '#deb961', fontSize: 9, fontWeight: '900' }, capexValue: { color: '#f0dfad', fontSize: 38, fontWeight: '900', marginTop: 7 }, capexState: { color: '#aa9459', fontSize: 8, fontWeight: '900' }, capexReason: { color: '#938258', fontSize: 10, lineHeight: 15, marginTop: 8 },
  catalystHero: { borderRadius: 16, borderWidth: 1, borderColor: '#3d3450', backgroundColor: '#120f18', padding: 15 }, catalystLabel: { color: '#b9a2df', fontSize: 9, fontWeight: '900' }, catalystTitle: { color: '#f0edf5', fontSize: 21, fontWeight: '900', marginTop: 7 }, catalystText: { color: '#8d809d', fontSize: 10, lineHeight: 15, marginTop: 6 },
  panel: { borderRadius: 14, borderWidth: 1, borderColor: '#242d33', backgroundColor: '#0c1013', padding: 13 }, panelTitle: { color: '#70cbed', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1, marginBottom: 6 }, noData: { color: '#717e87', fontSize: 10, paddingVertical: 12 },
  metric: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#242a2f', gap: 10 }, metricLabel: { color: '#78848d', fontSize: 10, flex: 1 }, metricValue: { color: '#dbe1e5', fontSize: 9.5, fontWeight: '800', maxWidth: '60%', textAlign: 'right' },
  scoreRow: { paddingVertical: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#242a2f' }, scoreTop: { flexDirection: 'row', justifyContent: 'space-between' }, scoreName: { color: '#cbd2d7', fontSize: 10, fontWeight: '800' }, scoreNumber: { fontSize: 12, fontWeight: '900' }, scoreState: { color: '#5d6972', fontSize: 7.5, marginTop: 3 },
  reco: { paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#242a2f' }, recoPeriod: { color: '#cbd2d7', fontSize: 9, fontWeight: '900' }, recoText: { color: '#77838d', fontSize: 9, marginTop: 4 }, news: { paddingVertical: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#242a2f' }, newsMeta: { color: '#626e78', fontSize: 8 }, newsTitle: { color: '#e0e5e8', fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 4 }, newsSummary: { color: '#7c8891', fontSize: 9.5, lineHeight: 14, marginTop: 4 },
  guardrail: { borderRadius: 13, borderWidth: 1, borderColor: '#344625', backgroundColor: '#0e150b', padding: 12 }, guardrailTitle: { color: '#a7bc77', fontSize: 8.5, fontWeight: '900' }, guardrailText: { color: '#81906c', fontSize: 9.5, lineHeight: 14, marginTop: 5 },
  source: { borderRadius: 12, borderWidth: 1, borderColor: '#293943', backgroundColor: '#0a1217', padding: 11 }, sourceTitle: { color: '#69c6e9', fontSize: 8, fontWeight: '900' }, sourceText: { color: '#697b87', fontSize: 8.5, marginTop: 4 },
  empty: { minHeight: 280, alignItems: 'center', justifyContent: 'center' }, omega: { color: '#355267', fontSize: 48, fontWeight: '900' }, emptyTitle: { color: '#dce2e6', fontSize: 17, fontWeight: '900', marginTop: 8 }, emptyText: { color: '#737f88', fontSize: 10, textAlign: 'center', marginTop: 5, maxWidth: 260 },
});
