import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { AtlasApi, type Quote } from '../core/api/atlasApi';
import { AuditLogRepository } from '../db/repositories/AuditLogRepository';
import { type PortfolioPosition, PortfolioRepository } from '../db/repositories/PortfolioRepository';

const MAIN_PORTFOLIO_ID = 'PORTFOLIO-MAIN';

type LiveRow = PortfolioPosition & { quote?: Quote; liveError?: string };

export default function PortfolioScreen() {
  const router = useRouter();
  const [items, setItems] = useState<LiveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [message, setMessage] = useState('');
  const [syncingLive, setSyncingLive] = useState(false);

  const refreshQuotes = useCallback(async (positions: PortfolioPosition[]) => {
    if (!positions.length) return [] as LiveRow[];
    setSyncingLive(true);
    const rows: LiveRow[] = [];
    for (let i = 0; i < positions.length; i += 6) {
      const batch = positions.slice(i, i + 6);
      const resolved = await Promise.all(batch.map(async (pos): Promise<LiveRow> => {
        try {
          const quote = await AtlasApi.quote(pos.canonicalTicker);
          return { ...pos, quote };
        } catch (error) {
          return { ...pos, liveError: error instanceof Error ? error.message : String(error) };
        }
      }));
      rows.push(...resolved);
    }
    setSyncingLive(false);
    return rows;
  }, []);

  const load = useCallback(async () => {
    try {
      const positions = await PortfolioRepository.getAll();
      const live = await refreshQuotes(positions);
      setItems(live.length ? live : positions);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshQuotes]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const savePosition = async () => {
    const normalizedTicker = ticker.trim().toUpperCase();
    const parsedQuantity = Number(quantity.replace(',', '.'));
    const parsedCost = costBasis.trim() ? Number(costBasis.replace(',', '.')) : null;
    if (!/^[A-Z0-9.\-]{1,12}$/.test(normalizedTicker) || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setMessage('Ticker y cantidad > 0 son obligatorios.');
      return;
    }
    if (parsedCost !== null && (!Number.isFinite(parsedCost) || parsedCost < 0)) {
      setMessage('Coste medio no válido.');
      return;
    }

    let resolvedName = normalizedTicker;
    try {
      const profile = await AtlasApi.search(normalizedTicker);
      if (profile?.companyName) resolvedName = profile.companyName;
    } catch {}

    const existing = await PortfolioRepository.getByTicker(normalizedTicker);
    await PortfolioRepository.upsert({
      id: existing?.id ?? `POS-${normalizedTicker}-${Date.now()}`,
      portfolioId: MAIN_PORTFOLIO_ID,
      canonicalTicker: normalizedTicker,
      companyName: resolvedName,
      quantity: parsedQuantity,
      costBasis: parsedCost,
      status: 'ACTIVE',
      updatedAt: new Date(),
    });
    await AuditLogRepository.insert({
      id: `AUD-${Date.now()}`,
      action: existing ? 'PORTFOLIO_UPDATE' : 'PORTFOLIO_ADD',
      actor: 'USER',
      target: normalizedTicker,
      payloadHash: null,
      createdAt: new Date(),
    });
    setTicker('');
    setQuantity('');
    setCostBasis('');
    setMessage(existing ? `${normalizedTicker} actualizado.` : `${normalizedTicker} añadido.`);
    await load();
  };

  const removePosition = async (item: LiveRow) => {
    await PortfolioRepository.delete(item.id);
    await AuditLogRepository.insert({ id: `AUD-${Date.now()}`, action: 'PORTFOLIO_DELETE', actor: 'USER', target: item.canonicalTicker, payloadHash: null, createdAt: new Date() });
    setMessage(`${item.canonicalTicker} eliminado.`);
    await load();
  };

  const summary = useMemo(() => {
    let cost = 0;
    let value = 0;
    let dayPnl = 0;
    let liveCount = 0;
    for (const item of items) {
      const invested = (item.costBasis || 0) * item.quantity;
      const marketValue = item.quote?.price == null ? invested : item.quote.price * item.quantity;
      cost += invested;
      value += marketValue;
      if (item.quote?.changePct != null && item.quote.price != null) {
        const previous = item.quote.price / (1 + item.quote.changePct / 100);
        dayPnl += (item.quote.price - previous) * item.quantity;
        liveCount += 1;
      }
    }
    return { cost, value, pnl: value - cost, pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0, dayPnl, liveCount };
  }, [items]);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#64d8ff" />}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.topline}>
            <View><Text style={styles.eyebrow}>ATLAS Ω · PORTFOLIO LIVE</Text><Text style={styles.title}>Cartera</Text></View>
            <Text style={styles.liveState}>{syncingLive ? 'SYNCING' : `${summary.liveCount}/${items.length} LIVE`}</Text>
          </View>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>VALOR ACTUAL</Text>
            <Text style={styles.heroValue}>{money(summary.value)}</Text>
            <View style={styles.heroBottom}>
              <Text style={[styles.heroPnl, summary.pnl < 0 ? styles.negative : styles.positive]}>{signedMoney(summary.pnl)} · {signedPct(summary.pnlPct)}</Text>
              <Text style={[styles.heroDay, summary.dayPnl < 0 ? styles.negative : styles.positive]}>Día {signedMoney(summary.dayPnl)}</Text>
            </View>
          </View>
          <View style={styles.metrics}>
            <Metric label="COSTE" value={money(summary.cost)} />
            <Metric label="POSICIONES" value={String(items.length)} />
            <Metric label="P/L %" value={signedPct(summary.pnlPct)} tone={summary.pnlPct < 0 ? 'bad' : 'good'} />
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>AÑADIR / ACTUALIZAR</Text>
            <Text style={styles.formHint}>Solo ticker, cantidad y coste. ATLAS resuelve el nombre automáticamente cuando la API está disponible.</Text>
            <View style={styles.inputRow}>
              <TextInput value={ticker} onChangeText={setTicker} autoCapitalize="characters" placeholder="MSFT" placeholderTextColor="#536477" style={[styles.input, styles.tickerInput]} />
              <TextInput value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="Cantidad" placeholderTextColor="#536477" style={styles.input} />
              <TextInput value={costBasis} onChangeText={setCostBasis} keyboardType="decimal-pad" placeholder="Coste" placeholderTextColor="#536477" style={styles.input} />
            </View>
            <Pressable onPress={() => { void savePosition(); }} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Text style={styles.addText}>GUARDAR POSICIÓN</Text></Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.symbolCol]}>ACTIVO</Text><Text style={styles.th}>DÍA</Text><Text style={styles.th}>VALOR</Text><Text style={styles.th}>P/L</Text>
          </View>
        </View>
      }
      ListEmptyComponent={loading ? <ActivityIndicator size="large" color="#64d8ff" style={{ marginTop: 30 }} /> : <Text style={styles.empty}>Sin posiciones.</Text>}
      renderItem={({ item }) => {
        const invested = (item.costBasis || 0) * item.quantity;
        const value = item.quote?.price == null ? invested : item.quote.price * item.quantity;
        const pnl = value - invested;
        const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
        return (
          <Pressable onPress={() => router.push({ pathname: '/terminal', params: { ticker: item.canonicalTicker } })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.symbolCol}>
              <Text style={styles.ticker}>{item.canonicalTicker}</Text>
              <Text numberOfLines={1} style={styles.company}>{item.companyName}</Text>
              <Text style={styles.positionMeta}>{item.quantity} × {item.costBasis == null ? '—' : item.costBasis.toFixed(2)}</Text>
            </View>
            <View style={styles.cell}><Text style={[styles.cellMain, (item.quote?.changePct || 0) < 0 ? styles.negative : styles.positive]}>{item.quote?.changePct == null ? '—' : signedPct(item.quote.changePct)}</Text><Text style={styles.cellSub}>{item.quote?.price == null ? 'offline' : item.quote.price.toFixed(2)}</Text></View>
            <View style={styles.cell}><Text style={styles.cellMain}>{compactMoney(value)}</Text><Text style={styles.cellSub}>{summary.value > 0 ? `${((value / summary.value) * 100).toFixed(1)}% peso` : '—'}</Text></View>
            <View style={styles.cell}><Text style={[styles.cellMain, pnl < 0 ? styles.negative : styles.positive]}>{signedPct(pnlPct)}</Text><Text style={styles.cellSub}>{signedMoney(pnl)}</Text></View>
            <Pressable onPress={(event) => { event.stopPropagation(); void removePosition(item); }} style={styles.delete}><Text style={styles.deleteText}>×</Text></Pressable>
          </Pressable>
        );
      }}
    />
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, tone === 'good' ? styles.positive : tone === 'bad' ? styles.negative : undefined]}>{value}</Text></View>;
}
const money = (v: number) => `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(v)} €`;
const compactMoney = (v: number) => `${new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 }).format(v)} €`;
const signedMoney = (v: number) => `${v >= 0 ? '+' : ''}${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(v)} €`;
const signedPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05080c' },
  content: { padding: 14, paddingBottom: 42 },
  header: { gap: 10 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: '#617589', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#eff4f8', fontSize: 26, fontWeight: '900', marginTop: 3 },
  liveState: { color: '#58d8a5', fontSize: 8, fontWeight: '900', borderWidth: 1, borderColor: '#1d5140', backgroundColor: '#0b1915', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  hero: { backgroundColor: '#081018', borderWidth: 1, borderColor: '#183044', borderRadius: 10, padding: 14 },
  heroLabel: { color: '#587086', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  heroValue: { color: '#eef5fa', fontSize: 31, fontWeight: '900', marginTop: 4, fontVariant: ['tabular-nums'] },
  heroBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  heroPnl: { fontSize: 11, fontWeight: '900' },
  heroDay: { fontSize: 10, fontWeight: '900' },
  metrics: { flexDirection: 'row', gap: 6 },
  metric: { flex: 1, backgroundColor: '#090e14', borderWidth: 1, borderColor: '#17222e', borderRadius: 8, padding: 9 },
  metricLabel: { color: '#546678', fontSize: 7, fontWeight: '900' },
  metricValue: { color: '#b9c7d3', fontSize: 12, fontWeight: '900', marginTop: 3 },
  positive: { color: '#4ddca2' },
  negative: { color: '#ff6c7e' },
  form: { backgroundColor: '#090e14', borderWidth: 1, borderColor: '#17222e', borderRadius: 9, padding: 10, gap: 7 },
  formTitle: { color: '#b7c6d3', fontSize: 9, fontWeight: '900' },
  formHint: { color: '#5d7082', fontSize: 9, lineHeight: 13 },
  inputRow: { flexDirection: 'row', gap: 6 },
  input: { flex: 1, backgroundColor: '#060a0f', color: '#eaf0f5', borderWidth: 1, borderColor: '#1b2936', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 9, fontSize: 11 },
  tickerInput: { maxWidth: 90, fontWeight: '900' },
  addButton: { backgroundColor: '#173a4e', borderRadius: 7, alignItems: 'center', padding: 9 },
  addText: { color: '#91e3ff', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  pressed: { opacity: 0.62 },
  message: { color: '#d9b95e', fontSize: 9 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', minHeight: 27, borderBottomWidth: 1, borderColor: '#1a2632' },
  th: { flex: 1, color: '#506274', fontSize: 7, fontWeight: '900', textAlign: 'right' },
  symbolCol: { flex: 1.8, textAlign: 'left' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 62, borderBottomWidth: 1, borderBottomColor: '#101923', position: 'relative' },
  ticker: { color: '#dfe8ef', fontSize: 13, fontWeight: '900' },
  company: { color: '#617386', fontSize: 8, marginTop: 2, maxWidth: 130 },
  positionMeta: { color: '#46586a', fontSize: 7, marginTop: 2 },
  cell: { flex: 1, alignItems: 'flex-end' },
  cellMain: { color: '#b6c4d0', fontSize: 10, fontWeight: '900', fontVariant: ['tabular-nums'] },
  cellSub: { color: '#4f6173', fontSize: 7, marginTop: 2 },
  delete: { position: 'absolute', right: -4, top: 1, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: '#4e5f70', fontSize: 16 },
  empty: { color: '#607285', textAlign: 'center', padding: 40 },
});
