import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AtlasBottomNav from './AtlasBottomNav';
import { actionTone } from './AtlasActionCard';
import { AtlasOnlineApi, type AtlasAnalyzeBundle, type TrackedTicker, type TrackedUniverse } from '../core/api/atlasOnlineApi';
import { DecisionMonitorRepository } from '../db/repositories/DecisionMonitorRepository';
import { parseTickerList, UserUniverseRepository, type UserUniverseKind } from '../db/repositories/UserUniverseRepository';

type Filter = 'ALL' | 'ACTION' | 'REVIEW' | 'CHANGED';

const PAGE_SIZE = 12;

export default function UserTrackedMonitorScreen({ kind }: { kind: UserUniverseKind }) {
  const router = useRouter();
  const [remote, setRemote] = useState<TrackedUniverse | null>(null);
  const [items, setItems] = useState<TrackedTicker[]>([]);
  const [results, setResults] = useState<Record<string, AtlasAnalyzeBundle>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isPortfolio = kind === 'portfolio';
  const context = isPortfolio ? 'portfolio' : 'watchlist';

  const analyzeRows = useCallback(async (rows: TrackedTicker[]) => {
    const nextResults: Record<string, AtlasAnalyzeBundle> = {};
    const nextErrors: Record<string, string> = {};
    const changedNow: string[] = [];

    for (let index = 0; index < rows.length; index += 4) {
      const batch = rows.slice(index, index + 4);
      const settled = await Promise.allSettled(batch.map((item) => AtlasOnlineApi.atlasAnalyze(item.symbol || item.ticker, context)));
      for (let offset = 0; offset < settled.length; offset += 1) {
        const item = batch[offset];
        const result = settled[offset];
        if (result.status === 'fulfilled') {
          nextResults[item.ticker] = result.value;
          try {
            const didChange = await DecisionMonitorRepository.recordIfChanged({
              ticker: item.ticker,
              context,
              action: result.value.analysis.action,
              actionLabel: result.value.analysis.actionLabel,
              atlasScore: result.value.analysis.atlasScore,
              generatedAt: result.value.analysis.generatedAt,
              reasons: result.value.analysis.reasons,
            });
            if (didChange) changedNow.push(item.ticker);
          } catch {
            // Decision monitoring remains usable if local persistence fails.
          }
        } else {
          nextErrors[item.ticker] = result.reason instanceof Error ? result.reason.message : String(result.reason);
        }
      }
      if (index + 4 < rows.length) await new Promise((resolve) => setTimeout(resolve, 250));
    }

    setResults((current) => ({ ...current, ...nextResults }));
    setErrors((current) => ({ ...current, ...nextErrors }));
    if (changedNow.length) setChanged((current) => new Set([...current, ...changedNow]));
  }, [context]);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true); else setLoading(true);
    setMessage('');
    try {
      const universe = await AtlasOnlineApi.atlasUniverse();
      setRemote(universe);
      await UserUniverseRepository.initializeFromRemote(universe);
      const local = await UserUniverseRepository.list(kind);
      setItems(local);
      const page = local.slice(0, Math.max(PAGE_SIZE, visibleCount));
      await analyzeRows(page);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [analyzeRows, kind, visibleCount]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(true), 120000);
    return () => clearInterval(timer);
  }, [load]);

  const visible = items.slice(0, visibleCount);
  const filtered = useMemo(() => visible.filter((item) => {
    const analysis = results[item.ticker]?.analysis;
    if (filter === 'ALL') return true;
    if (filter === 'CHANGED') return changed.has(item.ticker);
    if (filter === 'REVIEW') return analysis?.action === 'REVIEW' || analysis?.action === 'NO_BUY';
    return isPortfolio ? analysis?.action === 'ADD' : analysis?.action === 'BUY';
  }), [changed, filter, isPortfolio, results, visible]);

  const actionCount = items.filter((item) => isPortfolio ? results[item.ticker]?.analysis.action === 'ADD' : results[item.ticker]?.analysis.action === 'BUY').length;
  const reviewCount = items.filter((item) => ['REVIEW', 'NO_BUY'].includes(results[item.ticker]?.analysis.action || '')).length;

  const addTickers = async () => {
    const tickers = parseTickerList(input);
    if (!tickers.length) return;
    setSaving(true);
    setMessage('');
    try {
      const added = await UserUniverseRepository.add(kind, tickers);
      setInput('');
      const local = await UserUniverseRepository.list(kind);
      setItems(local);
      if (added.length) {
        setMessage(`${added.join(', ')} añadido${added.length > 1 ? 's' : ''}. ATLAS los monitoriza desde ahora.`);
        await analyzeRows(local.filter((item) => added.includes(item.ticker)));
      } else {
        setMessage('Esos tickers ya estaban en la lista.');
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  };

  const removeTicker = (ticker: string) => {
    Alert.alert(
      `Quitar ${ticker}`,
      `Se eliminará de ${isPortfolio ? 'Mi Cartera Ω' : 'Watchlist Ω'} en este dispositivo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => void (async () => {
            await UserUniverseRepository.remove(kind, ticker);
            setItems(await UserUniverseRepository.list(kind));
            setResults((current) => { const copy = { ...current }; delete copy[ticker]; return copy; });
          })(),
        },
      ],
    );
  };

  const reset = () => {
    if (!remote) return;
    Alert.alert(
      'Restaurar lista base',
      'Se borrarán los cambios locales de esta lista y se restaurará el snapshot del servidor.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => void (async () => {
            await UserUniverseRepository.resetToRemote(kind, remote);
            setResults({});
            setChanged(new Set());
            setVisibleCount(PAGE_SIZE);
            setItems(await UserUniverseRepository.list(kind));
            await load(true);
          })(),
        },
      ],
    );
  };

  const loadMore = async () => {
    const nextCount = Math.min(items.length, visibleCount + PAGE_SIZE);
    const newRows = items.slice(visibleCount, nextCount);
    setVisibleCount(nextCount);
    if (newRows.length) await analyzeRows(newRows);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2ed19a" />}
      >
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>{isPortfolio ? 'PORTFOLIO INTELLIGENCE' : 'CANDIDATE INTELLIGENCE'}</Text>
            <Text style={styles.title}>{isPortfolio ? 'Mi Cartera Ω' : 'Watchlist Ω'}</Text>
            <Text style={styles.subtitle}>{isPortfolio ? 'AÑADIR · MANTENER · ESPERAR · REVISAR. Precio nunca vende una tesis.' : 'COMPRAR · ESPERAR · NO COMPRAR. Cada ticker pasa por ATLAS Ω.'}</Text>
          </View>
          <View style={styles.countBubble}><Text style={styles.count}>{items.length}</Text><Text style={styles.countLabel}>{isPortfolio ? 'POS.' : 'WATCH'}</Text></View>
        </View>

        <View style={styles.editor}>
          <View style={styles.editorTop}><View style={styles.flex}><Text style={styles.editorTitle}>EDITAR LISTA · SOLO TICKERS</Text><Text style={styles.editorSub}>Uno o varios separados por coma/espacio. Nunca introduces métricas.</Text></View><Pressable onPress={reset}><Text style={styles.reset}>RESTAURAR BASE</Text></Pressable></View>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => void addTickers()}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder={isPortfolio ? 'Ej. MSFT, TSM, V' : 'Ej. PANW NET CRWD'}
              placeholderTextColor="#59656e"
              style={styles.input}
            />
            <Pressable disabled={saving || !input.trim()} onPress={() => void addTickers()} style={[styles.addButton, (saving || !input.trim()) && styles.disabled]}>
              {saving ? <ActivityIndicator color="#082019" size="small" /> : <Text style={styles.addText}>AÑADIR</Text>}
            </Pressable>
          </View>
          <Text style={styles.sourceText}>Persistencia local SQLite · bootstrap remoto {remote?.snapshotId || 'pendiente'} · sin duplicados Cartera/Watchlist.</Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard label={isPortfolio ? 'AÑADIR' : 'COMPRAR'} value={actionCount} tone="positive" />
          <SummaryCard label="REVISAR" value={reviewCount} tone="warning" />
          <SummaryCard label="CAMBIOS" value={changed.size} tone={changed.size ? 'warning' : 'neutral'} />
        </View>

        <View style={styles.filters}>
          <FilterButton label="TODOS" active={filter === 'ALL'} onPress={() => setFilter('ALL')} />
          <FilterButton label={isPortfolio ? 'AÑADIR' : 'COMPRAR'} active={filter === 'ACTION'} onPress={() => setFilter('ACTION')} />
          <FilterButton label="REVISAR" active={filter === 'REVIEW'} onPress={() => setFilter('REVIEW')} />
          <FilterButton label="CAMBIOS" active={filter === 'CHANGED'} onPress={() => setFilter('CHANGED')} />
        </View>

        {message ? <View style={styles.message}><Text style={styles.messageText}>{message}</Text></View> : null}
        {loading && !items.length ? <View style={styles.loading}><ActivityIndicator size="large" color="#2ed19a" /><Text style={styles.loadingText}>Inicializando lista y ejecutando ATLAS Ω…</Text></View> : null}

        {filtered.map((item) => {
          const bundle = results[item.ticker];
          const analysis = bundle?.analysis;
          const quote = bundle?.quote;
          const tone = analysis ? actionTone(analysis.action) : 'neutral';
          const companyName = typeof bundle?.profile?.name === 'string' && bundle.profile.name ? bundle.profile.name : item.name;
          return (
            <Pressable key={item.ticker} accessibilityRole="button" accessibilityLabel={`Abrir ${item.ticker}`} onPress={() => router.push({ pathname: '/ticker', params: { symbol: item.symbol || item.ticker, context } })} style={({ pressed }) => [styles.row, changed.has(item.ticker) && styles.changedRow, pressed && styles.pressed]}>
              <View style={styles.badge}><Text style={styles.badgeText}>{item.ticker.slice(0, 2)}</Text></View>
              <View style={styles.flex}>
                <View style={styles.rowTop}>
                  <View style={styles.tickerLine}><Text style={styles.ticker}>{item.ticker}</Text>{item.state === 'PENDING' ? <Text style={styles.pending}>PENDING</Text> : null}{changed.has(item.ticker) ? <Text style={styles.changedBadge}>CAMBIO</Text> : null}</View>
                  <Text style={[styles.action, tone === 'positive' ? styles.positive : tone === 'negative' ? styles.negative : tone === 'warning' ? styles.warning : styles.neutral]}>{analysis?.actionLabel || 'ANALIZANDO'}</Text>
                </View>
                <Text style={styles.name} numberOfLines={1}>{companyName}</Text>
                <View style={styles.rowBottom}><Text style={styles.score}>Ω {analysis?.atlasScore == null ? '—' : Math.round(analysis.atlasScore)}</Text><Text style={styles.market}>{quote?.price == null ? '—' : formatNumber(quote.price)}{quote?.changePct == null ? '' : ` · ${quote.changePct >= 0 ? '+' : ''}${quote.changePct.toFixed(2)}%`}</Text></View>
                {errors[item.ticker] ? <Text style={styles.rowError} numberOfLines={1}>{errors[item.ticker]}</Text> : null}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Quitar ${item.ticker}`} hitSlop={10} onPress={(event) => { event.stopPropagation(); removeTicker(item.ticker); }} style={styles.remove}><Text style={styles.removeText}>×</Text></Pressable>
            </Pressable>
          );
        })}

        {!loading && !filtered.length ? <Text style={styles.empty}>No hay valores en este filtro.</Text> : null}
        {visibleCount < items.length ? <Pressable onPress={() => void loadMore()} style={styles.more}><Text style={styles.moreText}>CARGAR MÁS · {visibleCount}/{items.length}</Text></Pressable> : items.length ? <Text style={styles.complete}>LISTA CARGADA · {items.length}/{items.length}</Text> : null}

        <View style={styles.guardrail}><Text style={styles.guardrailTitle}>DECISION SAFETY GATE Ω</Text><Text style={styles.guardrailText}>{isPortfolio ? 'La pantalla puede elevar AÑADIR/MANTENER/ESPERAR/REVISAR. REDUCIR/VENDER solo puede existir tras falsificador de tesis confirmado con evidencia primaria trazable; precio, rotación o una noticia aislada no bastan.' : 'COMPRAR/ESPERAR/NO COMPRAR son decisiones de análisis. Ninguna salida del monitor ejecuta órdenes en Broker Ω.'}</Text></View>
      </ScrollView>
      <AtlasBottomNav active={isPortfolio ? 'portfolio' : 'watchlist'} />
    </View>
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
  screen: { flex: 1, backgroundColor: '#050708' }, scroll: { flex: 1 }, content: { padding: 18, paddingBottom: 38, gap: 12 }, flex: { flex: 1 }, pressed: { opacity: 0.58 }, disabled: { opacity: 0.4 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 7 }, eyebrow: { color: '#68c9ef', fontSize: 9, fontWeight: '900', letterSpacing: 1.35 }, title: { color: '#f5f7f8', fontSize: 31, fontWeight: '900', marginTop: 4 }, subtitle: { color: '#83909a', fontSize: 11, lineHeight: 17, marginTop: 5 }, countBubble: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d151a', borderWidth: 1, borderColor: '#2a404e' }, count: { color: '#f4f7f8', fontSize: 22, fontWeight: '900' }, countLabel: { color: '#61737f', fontSize: 7, fontWeight: '900' },
  editor: { borderRadius: 15, borderWidth: 1, borderColor: '#2b4250', backgroundColor: '#0c151a', padding: 13 }, editorTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' }, editorTitle: { color: '#6fcbee', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1 }, editorSub: { color: '#75838d', fontSize: 9.5, marginTop: 4 }, reset: { color: '#ba9a59', fontSize: 7.5, fontWeight: '900' }, inputRow: { flexDirection: 'row', gap: 8, marginTop: 10 }, input: { flex: 1, minHeight: 46, borderRadius: 11, borderWidth: 1, borderColor: '#2a353d', backgroundColor: '#070a0d', color: '#eef2f4', paddingHorizontal: 12, fontSize: 13, fontWeight: '800' }, addButton: { minWidth: 82, borderRadius: 11, backgroundColor: '#183e31', borderWidth: 1, borderColor: '#2f745a', alignItems: 'center', justifyContent: 'center' }, addText: { color: '#a4e7cb', fontSize: 8.5, fontWeight: '900' }, sourceText: { color: '#586872', fontSize: 8.5, lineHeight: 13, marginTop: 8 },
  summaryRow: { flexDirection: 'row', gap: 8 }, summaryCard: { flex: 1, minHeight: 66, borderRadius: 13, backgroundColor: '#0d1115', borderWidth: 1, borderColor: '#222d35', alignItems: 'center', justifyContent: 'center' }, summaryValue: { fontSize: 22, fontWeight: '900' }, summaryLabel: { color: '#677581', fontSize: 7.5, fontWeight: '900', marginTop: 2 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, filter: { borderRadius: 999, borderWidth: 1, borderColor: '#29343d', backgroundColor: '#0d1115', paddingHorizontal: 12, paddingVertical: 8 }, filterActive: { borderColor: '#3d819f', backgroundColor: '#10232d' }, filterText: { color: '#7d8993', fontSize: 8.5, fontWeight: '900' }, filterTextActive: { color: '#75d0fa' },
  message: { borderRadius: 12, borderWidth: 1, borderColor: '#30404b', backgroundColor: '#0d151a', padding: 11 }, messageText: { color: '#91a8b7', fontSize: 9.5, lineHeight: 14 }, loading: { minHeight: 200, alignItems: 'center', justifyContent: 'center', gap: 11 }, loadingText: { color: '#78858e', fontSize: 10 },
  row: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#0c1013', borderRadius: 14, borderWidth: 1, borderColor: '#222b32', padding: 11 }, changedRow: { borderColor: '#705622', backgroundColor: '#131006' }, badge: { width: 43, height: 43, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#151b20', borderWidth: 1, borderColor: '#2b353e' }, badgeText: { color: '#e5e9ec', fontSize: 10, fontWeight: '900' }, rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, tickerLine: { flexDirection: 'row', gap: 5, alignItems: 'center', flexShrink: 1 }, ticker: { color: '#edf1f3', fontSize: 15, fontWeight: '900' }, pending: { color: '#d7b45e', borderWidth: 1, borderColor: '#55451f', borderRadius: 999, paddingHorizontal: 5, paddingVertical: 2, fontSize: 6.5, fontWeight: '900' }, changedBadge: { color: '#edc76b', fontSize: 6.5, fontWeight: '900' }, action: { fontSize: 8.5, fontWeight: '900' }, name: { color: '#75838d', fontSize: 9.5, marginTop: 3 }, rowBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }, score: { color: '#7cc7e7', fontSize: 9, fontWeight: '900' }, market: { color: '#a9b3ba', fontSize: 9, fontWeight: '800' }, rowError: { color: '#d17c89', fontSize: 8, marginTop: 5 }, remove: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#181014', borderWidth: 1, borderColor: '#4e2c35' }, removeText: { color: '#cf7d89', fontSize: 18, lineHeight: 19 },
  positive: { color: '#3ed49b' }, negative: { color: '#ff6f83' }, warning: { color: '#e8bd5f' }, neutral: { color: '#88a2b2' }, empty: { color: '#75818a', textAlign: 'center', paddingVertical: 28, fontSize: 10 }, more: { borderRadius: 12, borderWidth: 1, borderColor: '#2d4858', backgroundColor: '#0e1b22', alignItems: 'center', padding: 13 }, moreText: { color: '#79caeb', fontSize: 9, fontWeight: '900' }, complete: { color: '#53616a', textAlign: 'center', fontSize: 8, fontWeight: '900', marginTop: 3 },
  guardrail: { borderRadius: 14, borderWidth: 1, borderColor: '#3a4525', backgroundColor: '#101509', padding: 14 }, guardrailTitle: { color: '#aabe78', fontSize: 8.5, fontWeight: '900' }, guardrailText: { color: '#84916d', fontSize: 10, lineHeight: 15, marginTop: 5 },
});
