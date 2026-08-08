import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { desc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { brokerOrder, brokerPosition, syncState } from '../db/schema';
import { runAutomaticSync } from '../services/autoSync';
import { getCredentialStatus } from '../services/credentials';

type BrokerPosition = typeof brokerPosition.$inferSelect;

type PortfolioState = {
  items: BrokerPosition[];
  pendingOrders: number;
  lastSync: Date | null;
  syncStatus: string;
  configured: boolean;
};

export default function PortfolioScreen() {
  const router = useRouter();
  const [state, setState] = useState<PortfolioState>({ items: [], pendingOrders: 0, lastSync: null, syncStatus: 'IDLE', configured: false });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [items, orders, syncRows, credentials] = await Promise.all([
      db.select().from(brokerPosition).orderBy(desc(brokerPosition.marketValue)),
      db.select().from(brokerOrder),
      db.select().from(syncState).where(eq(syncState.key, 'AUTO_SYNC')).limit(1),
      getCredentialStatus(),
    ]);
    setState({
      items,
      pendingOrders: orders.length,
      lastSync: syncRows[0]?.lastSuccessAt ?? null,
      syncStatus: syncRows[0]?.status ?? 'IDLE',
      configured: credentials.trading212,
    });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const syncNow = async () => {
    setRefreshing(true);
    setMessage('');
    try {
      const result = await runAutomaticSync('USER_REFRESH');
      setMessage(`Sincronizado: ${result.brokerPositions} posiciones · ${result.brokerOrders} órdenes.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      await load();
    }
  };

  const totalApprox = state.items.reduce((sum, item) => sum + (item.marketValue ?? ((item.currentPrice ?? 0) * item.quantity)), 0);
  const totalPnl = state.items.reduce((sum, item) => sum + (item.unrealizedPnl ?? 0), 0);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={state.items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void syncNow(); }} tintColor="#71b7ff" />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio automático</Text>
          <Text style={styles.subtitle}>Trading 212 es la fuente de verdad. No se añaden ni borran posiciones a mano en ATLAS Ω.</Text>

          <View style={styles.metrics}>
            <Metric label="Posiciones" value={state.items.length.toString()} />
            <Metric label="Órdenes" value={state.pendingOrders.toString()} />
            <Metric label="P/L broker" value={formatNumber(totalPnl)} />
          </View>

          <View style={styles.syncCard}>
            <View style={styles.syncRow}>
              <Text style={styles.syncTitle}>TRADING 212 · READ ONLY</Text>
              <Text style={[styles.syncBadge, state.configured ? styles.ok : styles.pending]}>{state.configured ? state.syncStatus : 'SETUP'}</Text>
            </View>
            <Text style={styles.syncText}>Última sincronización: {state.lastSync ? state.lastSync.toLocaleString('es-ES') : 'todavía no'}</Text>
            <Text style={styles.syncText}>Valor agregado aproximado: {formatNumber(totalApprox)} · puede mezclar divisas de instrumento.</Text>
            {!state.configured ? (
              <Pressable onPress={() => router.push('/data-sources')} style={styles.primary}><Text style={styles.primaryText}>Conectar Trading 212</Text></Pressable>
            ) : (
              <Pressable onPress={() => { void syncNow(); }} style={styles.secondary}><Text style={styles.secondaryText}>Sincronizar ahora</Text></Pressable>
            )}
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      }
      ListEmptyComponent={loading
        ? <ActivityIndicator size="large" color="#71b7ff" style={styles.loader} />
        : <Text style={styles.empty}>{state.configured ? 'Trading 212 no devolvió posiciones abiertas.' : 'Conecta Trading 212 para cargar automáticamente tu cartera real.'}</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.ticker}>{item.canonicalTicker}</Text>
              <Text style={styles.company}>{item.companyName}</Text>
            </View>
            <Text style={styles.source}>T212</Text>
          </View>
          <View style={styles.detailGrid}>
            <Detail label="Cantidad" value={formatNumber(item.quantity)} />
            <Detail label="Precio medio" value={formatMoney(item.averagePrice, item.currency)} />
            <Detail label="Precio actual" value={formatMoney(item.currentPrice, item.currency)} />
            <Detail label="Valor" value={formatMoney(item.marketValue ?? ((item.currentPrice ?? 0) * item.quantity), item.currency)} />
          </View>
          <Text style={[styles.pnl, (item.unrealizedPnl ?? 0) >= 0 ? styles.pnlPositive : styles.pnlNegative]}>P/L: {formatNumber(item.unrealizedPnl ?? 0)}</Text>
          <Text style={styles.meta}>{item.isin ?? 'ISIN no recibido'} · {item.brokerTicker}</Text>
        </View>
      )}
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : '—';
}

function formatMoney(value: number | null, currency: string | null): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })} ${currency ?? ''}`.trim();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 8, marginBottom: 12 },
  title: { color: '#fff', fontSize: 27, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 20 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 6 },
  metric: { flex: 1, backgroundColor: '#141a22', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#202b38' },
  metricValue: { color: '#fff', fontWeight: '800', fontSize: 17 },
  metricLabel: { color: '#94a3b8', fontSize: 10, marginTop: 3 },
  syncCard: { backgroundColor: '#111923', borderRadius: 14, padding: 13, gap: 8, borderWidth: 1, borderColor: '#29405b' },
  syncRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  syncTitle: { color: '#71b7ff', fontSize: 12, fontWeight: '900' },
  syncBadge: { fontSize: 11, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  ok: { color: '#86efac', backgroundColor: '#123922' },
  pending: { color: '#fcd34d', backgroundColor: '#3a3112' },
  syncText: { color: '#9da9b7', fontSize: 12 },
  primary: { backgroundColor: '#2f81f7', borderRadius: 10, padding: 11, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '900' },
  secondary: { borderWidth: 1, borderColor: '#29405b', borderRadius: 10, padding: 10, alignItems: 'center' },
  secondaryText: { color: '#71b7ff', fontWeight: '800' },
  message: { color: '#cbd5e1', fontSize: 12 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  ticker: { color: '#71b7ff', fontSize: 20, fontWeight: '900' },
  company: { color: '#fff', marginTop: 4, fontWeight: '600' },
  source: { color: '#64748b', fontSize: 11, fontWeight: '800' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  detail: { width: '47%', backgroundColor: '#0f141b', borderRadius: 9, padding: 9 },
  detailLabel: { color: '#64748b', fontSize: 10 },
  detailValue: { color: '#cbd5e1', fontWeight: '700', marginTop: 3 },
  pnl: { marginTop: 10, fontWeight: '800' },
  pnlPositive: { color: '#34d399' },
  pnlNegative: { color: '#f87171' },
  meta: { color: '#64748b', fontSize: 10, marginTop: 8 },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40, lineHeight: 20 },
  loader: { marginTop: 40 },
});
