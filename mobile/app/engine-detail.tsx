import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import AtlasActionCard from '../components/AtlasActionCard';
import { AtlasOnlineApi, type AtlasAnalyzeBundle, type CompanyBundle } from '../core/api/atlasOnlineApi';

type EngineId = 'decision' | 'quality' | 'growth' | 'moat' | 'financial' | 'management' | 'capex' | 'valuation' | 'risk' | 'catalysts' | 'news';

type EngineConfig = {
  title: string;
  subtitle: string;
  scoreKey?: keyof AtlasAnalyzeBundle['analysis']['scores'];
  inputKeys?: string[];
};

const ENGINES: Record<EngineId, EngineConfig> = {
  decision: { title: 'ATLAS Ω Decision', subtitle: 'Salida final, score, cobertura, razones y guardrails.' },
  quality: { title: 'Business Quality Ω', subtitle: 'Retornos sobre capital, márgenes y eficiencia operativa.', scoreKey: 'businessQuality', inputKeys: ['roi', 'roe', 'roa', 'grossMargin', 'netMargin', 'operatingMargin', 'assetTurnover'] },
  growth: { title: 'Growth Ω', subtitle: 'Crecimiento de ingresos, EPS y flujo de caja libre.', scoreKey: 'growth', inputKeys: ['revenueGrowth', 'epsGrowth', 'fcfGrowth'] },
  moat: { title: 'Moat Ω', subtitle: 'Proxy cuantitativo; el moat canónico exige evidencia primaria cualitativa.', scoreKey: 'moatProxy', inputKeys: ['grossMargin', 'roi', 'revenueGrowth'] },
  financial: { title: 'Financial Quality Ω', subtitle: 'Liquidez, deuda y capacidad de servicio financiero.', scoreKey: 'financialQuality', inputKeys: ['currentRatio', 'quickRatio', 'debtEquity', 'interestCoverage'] },
  management: { title: 'Management Ω', subtitle: 'Proxy cuantitativo de ejecución; no sustituye evidencia primaria.', scoreKey: 'managementProxy', inputKeys: ['roe', 'epsGrowth', 'currentRatio', 'debtEquity'] },
  capex: { title: 'CAPEX Productivity Ω', subtitle: 'Productividad del capital, FCF/CAPEX, ROIC y estado de evidencia.', scoreKey: 'capexProductivity', inputKeys: ['roi', 'fcfPerShare', 'capexPerShare', 'assetTurnover', 'debtEquity', 'interestCoverage'] },
  valuation: { title: 'Valuation Ω', subtitle: 'Múltiplos y expectativas implícitas disponibles en el proveedor.', scoreKey: 'valuation', inputKeys: ['pe', 'forwardPE', 'pb', 'ps', 'dividendYield'] },
  risk: { title: 'Risk Ω', subtitle: 'Beta, deuda, liquidez y flags de riesgo cuantitativo.', scoreKey: 'risk', inputKeys: ['beta', 'debtEquity', 'currentRatio', 'quickRatio', 'interestCoverage'] },
  catalysts: { title: 'Catalysts Ω', subtitle: 'Noticias recientes y consenso como sensores, nunca como evidencia canónica automática.' },
  news: { title: 'News Ω', subtitle: 'Flujo de noticias del ticker separado del score fundamental.' },
};

function normalizeEngine(value: string | undefined): EngineId {
  return value && value in ENGINES ? value as EngineId : 'decision';
}

export default function EngineDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string | string[]; engine?: string | string[]; context?: string | string[] }>();
  const initialSymbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const rawEngine = Array.isArray(params.engine) ? params.engine[0] : params.engine;
  const rawContext = Array.isArray(params.context) ? params.context[0] : params.context;
  const engine = normalizeEngine(rawEngine);
  const config = ENGINES[engine];
  const context = rawContext === 'portfolio' || rawContext === 'watchlist' ? rawContext : 'candidate';

  const [ticker, setTicker] = useState((initialSymbol || '').toUpperCase());
  const [atlas, setAtlas] = useState<AtlasAnalyzeBundle | null>(null);
  const [company, setCompany] = useState<CompanyBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async (value = ticker) => {
    const symbol = value.trim().toUpperCase();
    if (!/^[A-Z0-9.\-]{1,20}$/.test(symbol)) {
      setError('Introduce un ticker válido.');
      return;
    }
    setTicker(symbol);
    setLoading(true);
    setError('');
    const needsCompany = engine === 'catalysts' || engine === 'news';
    const [atlasResult, companyResult] = await Promise.allSettled([
      AtlasOnlineApi.atlasAnalyze(symbol, context),
      needsCompany ? AtlasOnlineApi.company(symbol) : Promise.resolve(null),
    ]);
    if (atlasResult.status === 'fulfilled') setAtlas(atlasResult.value);
    else {
      setAtlas(null);
      setError(atlasResult.reason instanceof Error ? atlasResult.reason.message : String(atlasResult.reason));
    }
    if (companyResult.status === 'fulfilled') setCompany(companyResult.value);
    else if (needsCompany && !error) setError(companyResult.reason instanceof Error ? companyResult.reason.message : String(companyResult.reason));
    setLoading(false);
  };

  useEffect(() => {
    if (initialSymbol && /^[A-Z0-9.\-]{1,20}$/.test(initialSymbol.toUpperCase())) void analyze(initialSymbol);
    // Engine/symbol navigation should trigger a new isolated engine analysis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSymbol, engine, context]);

  const metrics = useMemo(() => {
    if (!atlas || !config.inputKeys) return [];
    return config.inputKeys.map((key) => {
      const direct = atlas.analysis.inputs[key];
      return { key, value: direct?.value ?? findRawMetric(atlas.analysis.rawMetrics, key), sourceKey: direct?.sourceKey || null };
    });
  }, [atlas, config.inputKeys]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View style={styles.flex}><Text style={styles.eyebrow}>ENGINE DETAIL Ω</Text><Text style={styles.title}>{config.title}</Text></View>
      </View>
      <Text style={styles.subtitle}>{config.subtitle}</Text>

      <View style={styles.searchCard}>
        <TextInput value={ticker} onChangeText={setTicker} onSubmitEditing={() => void analyze()} autoCapitalize="characters" autoCorrect={false} placeholder="Ticker · NVDA" placeholderTextColor="#5a6670" style={styles.input} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Analizar ${config.title}`} disabled={loading} onPress={() => void analyze()} style={[styles.run, loading && styles.disabled]}>
          {loading ? <ActivityIndicator color="#071a14" size="small" /> : <Text style={styles.runText}>ANALIZAR</Text>}
        </Pressable>
      </View>
      <Text style={styles.rule}>Solo ticker. Esta pantalla muestra únicamente datos y salidas pertinentes a {config.title}; no reutiliza una tabla genérica de todos los motores.</Text>

      {error ? <View style={styles.error}><Text style={styles.errorTitle}>DATOS NO DISPONIBLES</Text><Text style={styles.errorText}>{error}</Text></View> : null}

      {atlas ? (
        <>
          <Identity atlas={atlas} />
          {engine === 'decision' ? <AtlasActionCard analysis={atlas.analysis} /> : null}
          {config.scoreKey ? <EngineScore atlas={atlas} engine={engine} config={config} /> : null}
          {metrics.length ? <MetricPanel metrics={metrics} /> : null}
          {engine === 'capex' ? <CapexPanel atlas={atlas} /> : null}
          {engine === 'risk' ? <RiskFlags atlas={atlas} /> : null}
          {engine === 'moat' || engine === 'management' ? <PrimaryEvidenceWarning engine={engine} /> : null}
          {engine === 'catalysts' ? <CatalystsPanel company={company} /> : null}
          {engine === 'news' ? <NewsPanel company={company} /> : null}

          <Pressable accessibilityRole="button" accessibilityLabel="Abrir terminal completo" onPress={() => router.push({ pathname: '/ticker', params: { symbol: atlas.symbol, context, tab: 'atlas' } })} style={styles.terminalButton}><Text style={styles.terminalText}>ABRIR TERMINAL COMPLETO · {atlas.symbol} ›</Text></Pressable>
        </>
      ) : !loading ? (
        <View style={styles.empty}><Text style={styles.omega}>Ω</Text><Text style={styles.emptyTitle}>Selecciona ticker</Text><Text style={styles.emptyText}>Ejecuta este motor de forma aislada y después abre el terminal si necesitas el stack completo.</Text></View>
      ) : null}
    </ScrollView>
  );
}

function Identity({ atlas }: { atlas: AtlasAnalyzeBundle }) {
  const name = text(atlas.profile.name) || atlas.symbol;
  const industry = text(atlas.profile.finnhubIndustry) || atlas.quote.sector || 'Mercado';
  return <View style={styles.identity}><View><Text style={styles.symbol}>{atlas.symbol}</Text><Text style={styles.name}>{name}</Text><Text style={styles.meta}>{industry}</Text></View><View style={styles.priceBox}><Text style={styles.price}>{atlas.quote.price == null ? '—' : number(atlas.quote.price)}</Text><Text style={[styles.change, (atlas.quote.changePct ?? 0) >= 0 ? styles.positive : styles.negative]}>{percent(atlas.quote.changePct)}</Text></View></View>;
}

function EngineScore({ atlas, engine, config }: { atlas: AtlasAnalyzeBundle; engine: EngineId; config: EngineConfig }) {
  const score = config.scoreKey ? atlas.analysis.scores[config.scoreKey] : null;
  const stateKey = engine === 'quality' ? 'businessQuality' : engine === 'financial' ? 'financialQuality' : engine === 'management' ? 'management' : engine === 'moat' ? 'moat' : engine === 'capex' ? 'capexProductivity' : engine;
  const state = atlas.analysis.engineStates[stateKey] || 'UNKNOWN';
  return (
    <View style={styles.scoreCard}>
      <View><Text style={styles.scoreEyebrow}>SCORE DEL MOTOR</Text><Text style={styles.state}>{state.replaceAll('_', ' ')}</Text></View>
      <View style={styles.scoreCircle}><Text style={styles.scoreNumber}>{score == null ? '—' : Math.round(score)}</Text><Text style={styles.scoreUnit}>/100</Text></View>
    </View>
  );
}

function MetricPanel({ metrics }: { metrics: Array<{ key: string; value: number | null; sourceKey: string | null }> }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>INPUTS DEL MOTOR</Text>
      {metrics.map((metric) => <View key={metric.key} style={styles.metricRow}><View style={styles.flex}><Text style={styles.metricLabel}>{label(metric.key)}</Text>{metric.sourceKey ? <Text style={styles.metricSource}>{metric.sourceKey}</Text> : null}</View><Text style={styles.metricValue}>{metric.value == null ? '—' : formatMetric(metric.key, metric.value)}</Text></View>)}
    </View>
  );
}

function CapexPanel({ atlas }: { atlas: AtlasAnalyzeBundle }) {
  const partial = atlas.analysis.engineStates.capexProductivity === 'PARTIAL_SENSOR';
  return <View style={[styles.note, partial ? styles.noteWarning : styles.noteOk]}><Text style={styles.noteTitle}>{partial ? 'CAPEX CANÓNICO · EVIDENCIA INCOMPLETA' : 'CAPEX PRODUCTIVITY Ω'}</Text><Text style={styles.noteText}>{atlas.analysis.capexReason}</Text><Text style={styles.noteText}>El motor canónico de 7 dimensiones no se sustituye por una estimación opaca. Si faltan estados primarios trazables, el estado permanece parcial o INSUFFICIENT_DATA.</Text></View>;
}

function RiskFlags({ atlas }: { atlas: AtlasAnalyzeBundle }) {
  return <View style={styles.panel}><Text style={styles.panelTitle}>FLAGS Ω</Text>{atlas.analysis.flags.severe.length ? atlas.analysis.flags.severe.map((flag) => <Text key={flag} style={styles.severe}>● {flag}</Text>) : <Text style={styles.okText}>Sin alertas severas cuantitativas activas.</Text>}{atlas.analysis.flags.watch.map((flag) => <Text key={flag} style={styles.watch}>● {flag}</Text>)}</View>;
}

function PrimaryEvidenceWarning({ engine }: { engine: 'moat' | 'management' }) {
  return <View style={[styles.note, styles.noteWarning]}><Text style={styles.noteTitle}>EVIDENCIA PRIMARIA REQUERIDA</Text><Text style={styles.noteText}>{engine === 'moat' ? 'La persistencia del moat no puede probarse solo con márgenes/ROIC. La cifra visible es un proxy cuantitativo hasta validación primaria.' : 'La calidad de management no puede inferirse solo de ratios. El proxy cuantitativo mide ejecución observable, no intención ni calidad completa de asignación de capital.'}</Text></View>;
}

function CatalystsPanel({ company }: { company: CompanyBundle | null }) {
  return (
    <>
      <View style={styles.panel}><Text style={styles.panelTitle}>CATALIZADORES · NOTICIAS</Text>{company?.news.length ? company.news.slice(0, 8).map((item, index) => <NewsRow key={index} item={item} />) : <Text style={styles.emptyText}>Sin noticias devueltas por el proveedor.</Text>}</View>
      <View style={styles.panel}><Text style={styles.panelTitle}>CONSENSO · SENSOR</Text>{company?.recommendations.length ? company.recommendations.slice(0, 6).map((item, index) => <View key={index} style={styles.reco}><Text style={styles.recoPeriod}>{text(item.period) || 'Periodo'}</Text><Text style={styles.recoText}>Strong Buy {num(item.strongBuy) ?? '—'} · Buy {num(item.buy) ?? '—'} · Hold {num(item.hold) ?? '—'} · Sell {num(item.sell) ?? '—'}</Text></View>) : <Text style={styles.emptyText}>Sin consenso disponible.</Text>}<Text style={styles.sensor}>News/consenso pueden elevar prioridad de revisión; no confirman por sí solos una tesis ni un falsificador.</Text></View>
    </>
  );
}

function NewsPanel({ company }: { company: CompanyBundle | null }) {
  return <View style={styles.panel}><Text style={styles.panelTitle}>NEWS Ω</Text>{company?.news.length ? company.news.slice(0, 15).map((item, index) => <NewsRow key={index} item={item} />) : <Text style={styles.emptyText}>Sin noticias devueltas por el proveedor.</Text>}</View>;
}

function NewsRow({ item }: { item: Record<string, unknown> }) {
  const timestamp = num(item.datetime);
  return <View style={styles.newsRow}><Text style={styles.newsMeta}>{text(item.source) || 'Fuente'}{timestamp ? ` · ${new Date(timestamp * 1000).toLocaleDateString('es-ES')}` : ''}</Text><Text style={styles.newsTitle}>{text(item.headline) || 'Noticia'}</Text>{text(item.summary) ? <Text style={styles.newsSummary} numberOfLines={3}>{text(item.summary)}</Text> : null}</View>;
}

function findRawMetric(metrics: Record<string, number | string | null>, logicalKey: string): number | null {
  const aliases: Record<string, string[]> = {
    roi: ['roi', 'roic', 'returnoninvestment'], roe: ['roe', 'returnonequity'], roa: ['roa', 'returnonassets'], grossMargin: ['grossmargin'], netMargin: ['netprofitmargin', 'netmargin'], operatingMargin: ['operatingmargin'], assetTurnover: ['assetturnover'],
    revenueGrowth: ['revenuegrowth'], epsGrowth: ['epsgrowth'], fcfGrowth: ['freecashflowgrowth', 'cashflowpersharegrowth'], currentRatio: ['currentratio'], quickRatio: ['quickratio'], debtEquity: ['totaldebttototalequity', 'totaldebttoequity'], interestCoverage: ['interestcoverage'], beta: ['beta'],
    fcfPerShare: ['freecashflowpershare', 'cashflowpershare'], capexPerShare: ['capitalspendingpershare', 'capexpershare'], pe: ['pettm', 'peannual', 'priceearnings'], forwardPE: ['forwardpe'], pb: ['pbannual', 'pbquarterly', 'pricebook'], ps: ['psttm', 'psannual', 'pricesales'], dividendYield: ['dividendyield'],
  };
  const needles = aliases[logicalKey] || [logicalKey.toLowerCase()];
  for (const [key, value] of Object.entries(metrics)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!needles.some((needle) => normalized.includes(needle))) continue;
    const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/,/g, '').replace(/%/g, '')) : NaN;
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function label(key: string): string {
  const labels: Record<string, string> = { roi: 'ROIC / ROI', roe: 'ROE', roa: 'ROA', grossMargin: 'Margen bruto', netMargin: 'Margen neto', operatingMargin: 'Margen operativo', assetTurnover: 'Asset turnover', revenueGrowth: 'Crecimiento ingresos', epsGrowth: 'Crecimiento EPS', fcfGrowth: 'Crecimiento FCF', currentRatio: 'Current ratio', quickRatio: 'Quick ratio', debtEquity: 'Deuda / Equity', interestCoverage: 'Cobertura intereses', beta: 'Beta', fcfPerShare: 'FCF por acción', capexPerShare: 'CAPEX por acción', pe: 'P/E', forwardPE: 'Forward P/E', pb: 'P/B', ps: 'P/S', dividendYield: 'Dividend yield' };
  return labels[key] || key;
}
function formatMetric(key: string, value: number): string { return ['roi','roe','roa','grossMargin','netMargin','operatingMargin','revenueGrowth','epsGrowth','fcfGrowth','dividendYield'].includes(key) ? `${value.toFixed(2)}%` : number(value); }
function number(value: number): string { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value); }
function percent(value: number | null | undefined): string { return value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`; }
function text(value: unknown): string { return typeof value === 'string' ? value : ''; }
function num(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { padding: 18, paddingBottom: 52, gap: 12 }, flex: { flex: 1 }, disabled: { opacity: 0.45 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 43, height: 43, borderRadius: 22, backgroundColor: '#11161a', borderWidth: 1, borderColor: '#293139', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#edf1f3', fontSize: 31, lineHeight: 33, marginTop: -4 }, eyebrow: { color: '#68c9ef', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2 }, title: { color: '#f5f7f8', fontSize: 25, fontWeight: '900', marginTop: 3 }, subtitle: { color: '#85919a', fontSize: 11, lineHeight: 17 },
  searchCard: { flexDirection: 'row', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: '#2b3e49', backgroundColor: '#0c1418', padding: 10 }, input: { flex: 1, minHeight: 45, borderRadius: 10, borderWidth: 1, borderColor: '#29343c', backgroundColor: '#070b0d', color: '#eef2f4', paddingHorizontal: 12, fontSize: 14, fontWeight: '800' }, run: { minWidth: 92, borderRadius: 10, backgroundColor: '#1b4938', borderWidth: 1, borderColor: '#34765b', alignItems: 'center', justifyContent: 'center' }, runText: { color: '#acf0d2', fontSize: 8.5, fontWeight: '900' }, rule: { color: '#5f6d76', fontSize: 8.5, lineHeight: 13 },
  error: { borderRadius: 13, borderWidth: 1, borderColor: '#5f2937', backgroundColor: '#1a0d11', padding: 12 }, errorTitle: { color: '#ff788b', fontSize: 8.5, fontWeight: '900' }, errorText: { color: '#bd858f', fontSize: 9.5, marginTop: 5 },
  identity: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderRadius: 15, borderWidth: 1, borderColor: '#252e34', backgroundColor: '#0c1013', padding: 14 }, symbol: { color: '#f5f8fa', fontSize: 21, fontWeight: '900' }, name: { color: '#aab4ba', fontSize: 11, fontWeight: '800', marginTop: 2 }, meta: { color: '#64727b', fontSize: 8.5, marginTop: 3 }, priceBox: { alignItems: 'flex-end' }, price: { color: '#f3f6f7', fontSize: 21, fontWeight: '900' }, change: { fontSize: 10, fontWeight: '900', marginTop: 3 }, positive: { color: '#3ed49b' }, negative: { color: '#ff6f83' },
  scoreCard: { minHeight: 105, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#2a4552', backgroundColor: '#0a151b', padding: 15 }, scoreEyebrow: { color: '#68caef', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1 }, state: { color: '#82929c', fontSize: 9, fontWeight: '800', marginTop: 6, maxWidth: 210 }, scoreCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#071014', borderWidth: 1, borderColor: '#315367' }, scoreNumber: { color: '#f2f6f8', fontSize: 26, fontWeight: '900' }, scoreUnit: { color: '#617681', fontSize: 7, fontWeight: '900' },
  panel: { borderRadius: 15, borderWidth: 1, borderColor: '#252e34', backgroundColor: '#0c1013', padding: 14 }, panelTitle: { color: '#6fcbee', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2, marginBottom: 5 }, metricRow: { minHeight: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#282e33' }, metricLabel: { color: '#a8b1b7', fontSize: 10.5, fontWeight: '700' }, metricSource: { color: '#56646d', fontSize: 7.5, marginTop: 2 }, metricValue: { color: '#eef2f4', fontSize: 12, fontWeight: '900' },
  note: { borderRadius: 13, borderWidth: 1, padding: 13 }, noteWarning: { backgroundColor: '#181307', borderColor: '#5b4922' }, noteOk: { backgroundColor: '#0b1711', borderColor: '#2b5a46' }, noteTitle: { color: '#dfbd67', fontSize: 8.5, fontWeight: '900' }, noteText: { color: '#94865f', fontSize: 9.5, lineHeight: 15, marginTop: 5 }, severe: { color: '#ff7588', fontSize: 10, fontWeight: '800', marginTop: 7 }, watch: { color: '#e3bb61', fontSize: 10, fontWeight: '800', marginTop: 7 }, okText: { color: '#83b7a0', fontSize: 10, marginTop: 7 },
  newsRow: { paddingVertical: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#292e32' }, newsMeta: { color: '#61717b', fontSize: 7.5, fontWeight: '800' }, newsTitle: { color: '#e3e8eb', fontSize: 11, fontWeight: '900', lineHeight: 16, marginTop: 3 }, newsSummary: { color: '#7b8790', fontSize: 9, lineHeight: 14, marginTop: 4 }, reco: { paddingVertical: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#292e32' }, recoPeriod: { color: '#9eabb3', fontSize: 9, fontWeight: '900' }, recoText: { color: '#6f7d86', fontSize: 8.5, marginTop: 3 }, sensor: { color: '#716d55', fontSize: 8.5, lineHeight: 13, marginTop: 8 },
  terminalButton: { borderRadius: 12, borderWidth: 1, borderColor: '#2c5061', backgroundColor: '#0c1a21', alignItems: 'center', padding: 13 }, terminalText: { color: '#79ceeF', fontSize: 8.5, fontWeight: '900' }, empty: { minHeight: 270, alignItems: 'center', justifyContent: 'center', gap: 6 }, omega: { color: '#31566a', fontSize: 48, fontWeight: '900' }, emptyTitle: { color: '#dce2e5', fontSize: 16, fontWeight: '900' }, emptyText: { color: '#6e7b84', fontSize: 10, lineHeight: 15, textAlign: 'center', maxWidth: 280 },
});
