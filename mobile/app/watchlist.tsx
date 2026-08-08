import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { desc } from 'drizzle-orm';

import { db } from '../db/client';
import { marketSnapshot, watchlist } from '../db/schema';
import { runAutomaticSync, seedCanonicalWatchlist } from '../services/autoSync';
import { getCredentialStatus } from '../services/credentials';

type WatchItem = typeof watchlist.$inferSelect;
type Snapshot = typeof marketSnapshot.$inferSelect;

type WatchRow = WatchItem & { snapshot: Snapshot | null };

export default function WatchlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<WatchRow[]>([]);
  const [fmpConfigured, setFmpConfigured] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    await seedCanonicalWatchlist();
    const [watchRows, snapshotRows, credentials] = await Promise.all([
      db.select().from(watchlist).orderBy(desc(watchlist.addedAt)),
      db.select().from(marketSnapshot),
      getCredentialStatus(),
    ]);
    const byTicker = new Map(snapshotRows.map((row) => [row.canonicalTicker, row]));
    setItems(watchRows.map((row) => ({ ...row, snapshot: byTicker.get(row.canonicalTicker) ?? null }))
      .sort((a, b) => (b.snapshot?.changePercent ?? -999) - (a.snapshot?.changePercent ?? -999)));
    setFmpConfigured(credentials.fmp);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const syncNow = async () => {
    setRefreshing(true);
    setMessage('');
    try {
      const result = await runAutomaticSync('USER_REFRESH');
      setMessage(`${result.marketQuotes} cotizaciones actualizadas · ${result.radarSignals} señales automáticas.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      await load();
    }
  };

  const counts = useMemo(() => ({
    watchlist: items.filter((item) => item.state === 'WATCHLIST').length,
    discovery: items.filter((item) => item.state === 'DISCOVERY').length,
    green: items.filter((item) => (item.snapshot?.changePercent ?? 0) > 0).length,
  }), [items]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void syncNow(); }} tintColor="#71b7ff" />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Watchlist Ω automática</Text>
          <Text style={styles.subtitle}>La lista canónica se carga sola, elimina duplicados contra la cartera real y FMP actualiza el estado de mercado.</Text>

          <View style={styles.metrics}>
            <Metric label="Watchlist" value={counts.watchlist} />
            <Metric label="Discovery" value={counts.discovery} />
            <Metric label="Día > 0" value={counts.green} />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>DISCOVERY PRIMERO · FILTROS DESPUÉS</Text>
            <Text style={styles.infoText}>La cohorte de discovery no implica compra. Se preserva separada de Quality Ω, valoración y tesis. Los datos FMP son mercado, no evidencia canónica.</Text>
            {!fmpConfigured ? (
              <Pressable onPress={() => router.push('/data-sources')} style={styles.primary}><Text style={styles.primaryText}>Conectar FMP</Text></Pressable>
            ) : (
              <Pressable onPress={() => { void syncNow(); }} style={styles.secondary}><Text style={styles.secondaryText}>Sincronizar mercado ahora</Text></Pressable>
            )}
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No hay candidatos después de reconciliar la cartera.</Text>}
      renderItem={({ item }) => {
        const change = item.snapshot?.changePercent;
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <View style={styles.titleRow}>
                  <Text style={styles.ticker}>{item.canonicalTicker}</Text>
                  <Text style={[styles.state, item.state === 'DISCOVERY' ? styles.discovery : styles.watch]}>{item.state}</Text>
                </View>
                <Text style={styles.company}>{item.companyName}</Text>
              </View>
              <View style={styles.quoteBlock}>
                <Text style={styles.price}>{formatPrice(item.snapshot?.price)}</Text>
                <Text style={[styles.change, (change ?? 0) >= 0 ? styles.positive : styles.negative]}>{change == null ? 'sin dato' : `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}</Text>
              </View>
            </View>
            {item.snapshot ? (
              <View style={styles.marketRow}>
                <Text style={styles.marketText}>50d {formatPrice(item.snapshot.priceAvg50)}</Text>
                <Text style={styles.marketText}>200d {formatPrice(item.snapshot.priceAvg200)}</Text>
                <Text style={styles.marketText}>{item.snapshot.exchange ?? '—'}</Text>
              </View>
            ) : (
              <Text style={styles.noData}>Pendiente de cotización automática.</Text>
            )}
          </View>
        );
      }}
    />
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function formatPrice(value: number | null | undefined): string {
  return value == null ? '—' : value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 9, marginBottom: 12 },
  title: { color: '#fff', fontSize: 27, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 20 },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, padding: 10, borderRadius: 11, backgroundColor: '#141a22', borderWidth: 1, borderColor: '#202b38' },
  metricValue: { color: '#71b7ff', fontSize: 20, fontWeight: '900' },
  metricLabel: { color: '#64748b', fontSize: 10, marginTop: 3 },
  infoCard: { backgroundColor: '#111923', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#29405b', gap: 8 },
  infoTitle: { color: '#71b7ff', fontSize: 12, fontWeight: '900' },
  infoText: { color: '#9da9b7', lineHeight: 18, fontSize: 12 },
  primary: { backgroundColor: '#2f81f7', borderRadius: 9, padding: 10, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '900' },
  secondary: { borderWidth: 1, borderColor: '#29405b', borderRadius: 9, padding: 10, alignItems: 'center' },
  secondaryText: { color: '#71b7ff', fontWeight: '800' },
  message: { color: '#cbd5e1', fontSize: 12 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticker: { color: '#71b7ff', fontSize: 20, fontWeight: '900' },
  state: { fontSize: 9, fontWeight: '900', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  discovery: { color: '#fcd34d', backgroundColor: '#3a3112' },
  watch: { color: '#93c5fd', backgroundColor: '#10243f' },
  company: { color: '#fff', marginTop: 5 },
  quoteBlock: { alignItems: 'flex-end' },
  price: { color: '#fff', fontWeight: '800', fontSize: 16 },
  change: { fontWeight: '900', marginTop: 3 },
  positive: { color: '#34d399' },
  negative: { color: '#f87171' },
  marketRow: { flexDirection: 'row', gap: 14, marginTop: 12 },
  marketText: { color: '#64748b', fontSize: 11 },
  noData: { color: '#64748b', fontSize: 11, marginTop: 10 },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
});
