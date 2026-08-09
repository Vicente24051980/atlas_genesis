import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AtlasBottomNav from './AtlasBottomNav';
import { actionTone } from './AtlasActionCard';
import { AtlasOnlineApi, type MonitorItem, type MonitorPage, type TrackedUniverse } from '../core/api/atlasOnlineApi';

type Kind = 'portfolio' | 'watchlist';
type Filter = 'ALL' | 'ACTION' | 'REVIEW';

export default function TrackedMonitorScreen({ kind }: { kind: Kind }) {
  const router = useRouter();
  const [universe, setUniverse] = useState<TrackedUniverse | null>(null);
  const [pages, setPages] = useState<MonitorPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');

  const pageLimit = kind === 'portfolio' ? 8 : 10;

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [universeResult, monitorResult] = await Promise.all([
        AtlasOnlineApi.atlasUniverse(),
        AtlasOnlineApi.atlasMonitor(kind, 0, pageLimit),
      ]);
      setUniverse(universeResult);
      setPages([monitorResult]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [kind, pageLimit]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(true), 120000);
    return () => clearInterval(timer);
  }, [load]);

  const rows = useMemo(() => pages.flatMap((page) => page.items), [pages]);
  const nextOffset = pages.length ? pages[pages.length - 1].nextOffset : null;
  const total = pages.length ? pages[pages.length - 1].total : (kind === 'portfolio' ? universe?.counts.portfolio : universe?.counts.watchlist) ?? 0;

  const filtered = useMemo(() => rows.filter((row) => {
    if (filter === 'ALL') return true;
    const action = row.analysis?.action;
    if (filter === 'REVIEW') return action === 'REVIEW' || action === 'NO_BUY';
    return kind === 'portfolio' ? action === 'ADD' : action === 'BUY';
  }), [rows, filter, kind]);

  const actionCount = rows.filter((row) => kind === 'portfolio' ? row.analysis?.action === 'ADD' : row.analysis?.action === 'BUY').length;
  const reviewCount = rows.filter((row) => row.analysis?.action === 'REVIEW' || row.analysis?.action === 'NO_BUY').length;

  const loadMore = async () => {
    if (nextOffset == null || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await AtlasOnlineApi.atlasMonitor(kind, nextOffset, pageLimit);
      setPages((current) => [...current, page]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoadingMore(false);
    }
  };

  const isPortfolio = kind === 'portfolio';
  const title = isPortfolio ? 'Mi Cartera Ω' : 'Watchlist Ω';
  const subtitle = isPortfolio
    ? 'Monitor de posiciones: AÑADIR · MANTENER · ESPERAR · REVISAR. Nunca vende por precio.'
    : 'Radar de candidatos: COMPRAR · ESPERAR · NO COMPRAR con el algoritmo ATLAS Ω.';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2ed19a" />}
      >
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{isPortfolio ? 'PORTFOLIO INTELLIGENCE' : 'CANDIDATE INTELLIGENCE'}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.countBubble}><Text style={styles.count}>{total}</Text><Text style={styles.countLabel}>{isPortfolio ? 'POS.' : 'WATCH'}</Text></View>
        </View>

        {universe ? (
          <View style={[styles.snapshot, universe.status === 'AWAITING_USER_CONFIRMATION' && styles.snapshotWarning]}>
            <Text style={styles.snapshotTitle}>{universe.status === 'AWAITING_USER_CONFIRMATION' ? 'LISTA BOOTSTRAP · PENDIENTE DE CONFIRMACIÓN' : 'UNIVERSO CONFIRMADO'}</Text>
            <Text style={styles.snapshotText}>{universe.snapshotId}</Text>
          </View>
        ) : null}

        <View style={styles.summaryRow}>
          <SummaryCard label={isPortfolio ? 'AÑADIR' : 'COMPRAR'} value={actionCount} tone="positive" />
          <SummaryCard label="REVISAR" value={reviewCount} tone="warning" />
          <SummaryCard label="CARGADOS" value={rows.length} tone="neutral" />
        </View>

        <View style={styles.filters}>
          <FilterButton label="TODOS" active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
          <FilterButton label={isPortfolio ? 'AÑADIR' : 'COMPRAR'} active={filter === 'ACTION'} onPress={() => setFilter('ACTION')} />
          <FilterButton label="REVISAR" active={filter === 'REVIEW'} onPress={() => setFilter('REVIEW')} />
        </View>

        {error ? <View style={styles.error}><Text style={styles.errorTitle}>MONITOR NO DISPONIBLE</Text><Text style={styles.errorText}>{error}</Text></View> : null}
        {loading && !rows.length ? <View style={styles.loading}><ActivityIndicator size="large" color="#2ed19a" /><Text style={styles.loadingText}>Ejecutando motores ATLAS Ω…</Text></View> : null}

        {filtered.map((row) => (
          <TrackedRow
            key={`${row.item.ticker}-${row.symbol || ''}`}
            row={row}
            onPress={() => router.push({ pathname: '/ticker', params: { symbol: row.item.symbol || row.item.ticker, context: kind } })}
          />
        ))}

        {!loading && filtered.length === 0 && !error ? <Text style={styles.empty}>No hay valores en este filtro dentro de la página cargada.</Text> : null}

        {nextOffset != null ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Cargar más" onPress={() => void loadMore()} disabled={loadingMore} style={[styles.moreButton, loadingMore && styles.disabled]}>
            {loadingMore ? <ActivityIndicator color="#cfefff" /> : <Text style={styles.moreText}>CARGAR MÁS · {rows.length}/{total}</Text>}
          </Pressable>
        ) : rows.length ? <Text style={styles.complete}>UNIVERSO CARGADO · {rows.length}/{total}</Text> : null}

        {isPortfolio && universe?.portfolioPending?.length ? (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingTitle}>PENDIENTE DE EJECUCIÓN</Text>
            {universe.portfolioPending.map((item) => <Text key={item.ticker} style={styles.pendingText}>{item.ticker} · {item.name}</Text>)}
          </View>
        ) : null}

        <View style={styles.guardrail}>
          <Text style={styles.guardrailTitle}>GUARDRAIL Ω</Text>
          <Text style={styles.guardrailText}>{isPortfolio ? 'Precio y señales de mercado pueden elevar REVISAR, pero no generan EXIT. La venta exige falsificador de tesis confirmado con evidencia válida.' : 'COMPRAR es salida del scorer cuantitativo disponible, no una orden de broker. La evidencia incompleta resuelve a ESPERAR/NO COMPRAR.'}</Text>
        </View>
      </ScrollView>
      <AtlasBottomNav active={isPortfolio ? 'portfolio' : 'watchlist'} />
    </View>
  );
}

function TrackedRow({ row, onPress }: { row: MonitorItem; onPress: () => void }) {
  const analysis = row.analysis;
  const quote = row.quote;
  const tone = analysis ? actionTone(analysis.action) : 'neutral';
  const pct = quote?.changePct;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${row.item.ticker}`} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.symbolBadge}><Text style={styles.symbolText}>{row.item.ticker.slice(0, 2)}</Text></View>
      <View style={styles.flex}>
        <View style={styles.rowTop}>
          <Text style={styles.ticker}>{row.item.ticker}</Text>
          <Text style={[styles.action, tone === 'positive' ? styles.positive : tone === 'negative' ? styles.negative : tone === 'warning' ? styles.warning : styles.neutral]}>{analysis?.actionLabel || (row.ok ? 'ANALIZANDO' : 'SIN DATOS')}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{row.item.name}{row.item.sector ? ` · ${row.item.sector}` : ''}</Text>
        <View style={styles.rowBottom}>
          <Text style={styles.score}>Ω {analysis?.atlasScore == null ? '—' : Math.round(analysis.atlasScore)}</Text>
          <Text style={styles.market}>{quote?.price == null ? '—' : formatNumber(quote.price)} {pct == null ? '' : ` · ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`}</Text>
        </View>
        {!row.ok && row.error ? <Text style={styles.rowError} numberOfLines={1}>{row.error}</Text> : null}
      </View>
    </Pressable>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'positive' | 'warning' | 'neutral' }) {
  return <View style={styles.summaryCard}><Text style={[styles.summaryValue, tone === 'positive' ? styles.positive : tone === 'warning' ? styles.warning : styles.neutral]}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

function FilterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 35, gap: 12 },
  flex: { flex: 1 },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.45 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 8 },
  eyebrow: { color: '#66c9ef', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#f5f7f8', fontSize: 31, fontWeight: '900', marginTop: 5 },
  subtitle: { color: '#87939e', fontSize: 12, lineHeight: 18, marginTop: 5 },
  countBubble: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d151a', borderWidth: 1, borderColor: '#2a404e' },
  count: { color: '#f5f8fa', fontSize: 22, fontWeight: '900' },
  countLabel: { color: '#617381', fontSize: 7, fontWeight: '900' },
  snapshot: { borderWidth: 1, borderColor: '#284233', backgroundColor: '#0b1711', borderRadius: 12, padding: 11 },
  snapshotWarning: { borderColor: '#5b4822', backgroundColor: '#191408' },
  snapshotTitle: { color: '#c5ae65', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  snapshotText: { color: '#7f7350', fontSize: 8, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { flex: 1, minHeight: 68, borderRadius: 13, backgroundColor: '#0d1115', borderWidth: 1, borderColor: '#222d35', alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: '#677581', fontSize: 7.5, fontWeight: '900', marginTop: 2 },
  filters: { flexDirection: 'row', gap: 8 },
  filter: { borderRadius: 999, borderWidth: 1, borderColor: '#29343d', backgroundColor: '#0d1115', paddingHorizontal: 14, paddingVertical: 9 },
  filterActive: { borderColor: '#3d819f', backgroundColor: '#10232d' },
  filterText: { color: '#7d8993', fontSize: 9, fontWeight: '900' },
  filterTextActive: { color: '#75d0fa' },
  loading: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#798690', fontSize: 11 },
  error: { borderRadius: 13, backgroundColor: '#1a0d11', borderWidth: 1, borderColor: '#5f2937', padding: 12 },
  errorTitle: { color: '#ff788b', fontSize: 9, fontWeight: '900' },
  errorText: { color: '#b7838c', fontSize: 10, lineHeight: 15, marginTop: 5 },
  row: { minHeight: 90, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0c1013', borderRadius: 14, borderWidth: 1, borderColor: '#222b32', padding: 12 },
  symbolBadge: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#151b20', borderWidth: 1, borderColor: '#2b353e' },
  symbolText: { color: '#e5e9ec', fontSize: 11, fontWeight: '900' },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ticker: { color: '#f3f5f6', fontSize: 17, fontWeight: '900' },
  action: { fontSize: 10, fontWeight: '900' },
  name: { color: '#78838c', fontSize: 10, marginTop: 3 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  score: { color: '#6fcbed', fontSize: 10, fontWeight: '900' },
  market: { color: '#a5afb7', fontSize: 10, fontWeight: '800' },
  rowError: { color: '#b77a84', fontSize: 8, marginTop: 5 },
  positive: { color: '#42dfa2' },
  negative: { color: '#ff7187' },
  warning: { color: '#ecc463' },
  neutral: { color: '#76cfff' },
  moreButton: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#28526a', backgroundColor: '#0e1c25', alignItems: 'center', justifyContent: 'center' },
  moreText: { color: '#a8ddf6', fontSize: 10, fontWeight: '900' },
  complete: { color: '#60717d', textAlign: 'center', fontSize: 9, fontWeight: '900', paddingVertical: 10 },
  empty: { color: '#727f89', textAlign: 'center', paddingVertical: 30 },
  pendingCard: { borderRadius: 13, borderWidth: 1, borderColor: '#5d4b22', backgroundColor: '#171306', padding: 13 },
  pendingTitle: { color: '#e4bd5d', fontSize: 9, fontWeight: '900' },
  pendingText: { color: '#aa965f', fontSize: 10, marginTop: 6 },
  guardrail: { borderRadius: 13, borderWidth: 1, borderColor: '#314326', backgroundColor: '#0e150b', padding: 13 },
  guardrailTitle: { color: '#a6bd78', fontSize: 9, fontWeight: '900' },
  guardrailText: { color: '#83916f', fontSize: 10, lineHeight: 15, marginTop: 5 },
});
