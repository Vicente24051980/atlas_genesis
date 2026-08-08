import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { db } from '../db/client';
import { syncState, universeSymbol } from '../db/schema';
import { eq } from 'drizzle-orm';

type Candidate = typeof universeSymbol.$inferSelect;

type DiscoveryMeta = {
  sequence?: string[];
  globalUniverseSize?: number;
  marketFilteredSize?: number;
  stageOneSize?: number;
  note?: string;
};

export default function DiscoveryScreen() {
  const [items, setItems] = useState<Candidate[]>([]);
  const [meta, setMeta] = useState<DiscoveryMeta>({});
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [status, setStatus] = useState('PENDING');

  const load = useCallback(async () => {
    const [rows, stateRows] = await Promise.all([
      db.select().from(universeSymbol),
      db.select().from(syncState).where(eq(syncState.key, 'GLOBAL_UNIVERSE')).limit(1),
    ]);
    setItems(rows.sort((a, b) => a.symbol.localeCompare(b.symbol)));
    const state = stateRows[0];
    setStatus(state?.status ?? 'PENDING');
    setLastSync(state?.lastSuccessAt ?? null);
    if (state?.payloadJson) {
      try { setMeta(JSON.parse(state.payloadJson) as DiscoveryMeta); } catch { setMeta({}); }
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.symbol}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Discovery Ω global</Text>
          <Text style={styles.subtitle}>Barrido independiente antes de calidad, narrativa, sectores favoritos, cartera o watchlist. Se ejecuta automáticamente en segundo plano y se renueva cada 24 horas.</Text>

          <View style={styles.metrics}>
            <Metric label="Global" value={meta.globalUniverseSize ?? 0} />
            <Metric label="Mercado" value={meta.marketFilteredSize ?? 0} />
            <Metric label="Stage 1" value={meta.stageOneSize ?? items.length} />
          </View>

          <View style={styles.flowCard}>
            <Text style={styles.flowTitle}>SECUENCIA INVIOLABLE</Text>
            {(meta.sequence ?? ['GLOBAL_DISCOVERY', 'MARKET_FILTERS', 'EXCLUDE_PORTFOLIO_WATCHLIST']).map((step, index) => (
              <Text key={`${index}-${step}`} style={styles.flowStep}>{index + 1}. {step.replaceAll('_', ' ')}</Text>
            ))}
            <Text style={styles.flowNote}>{meta.note ?? 'Esperando el primer barrido global automático.'}</Text>
            <Text style={styles.sync}>Estado: {status} · {lastSync ? lastSync.toLocaleString('es-ES') : 'sin ejecución todavía'}</Text>
          </View>

          <Text style={styles.count}>{items.length} candidatos Stage 1</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>El primer background sync con FMP cargará el universo global y aplicará después los filtros de mercado.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.ticker}>{item.symbol}</Text>
            <Text style={styles.exchange}>{item.exchangeShortName ?? item.exchange ?? 'GLOBAL'}</Text>
          </View>
          <Text style={styles.company}>{item.companyName ?? 'Nombre pendiente'}</Text>
          <Text style={styles.source}>{item.source}</Text>
        </View>
      )}
    />
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value.toLocaleString('es-ES')}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 8, marginBottom: 12 },
  title: { color: '#fff', fontSize: 27, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 20 },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, padding: 10, borderRadius: 11, backgroundColor: '#141a22', borderWidth: 1, borderColor: '#202b38' },
  metricValue: { color: '#71b7ff', fontSize: 20, fontWeight: '900' },
  metricLabel: { color: '#64748b', fontSize: 10, marginTop: 3 },
  flowCard: { backgroundColor: '#111923', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#29405b', gap: 5 },
  flowTitle: { color: '#71b7ff', fontSize: 12, fontWeight: '900', marginBottom: 4 },
  flowStep: { color: '#cbd5e1', fontSize: 12 },
  flowNote: { color: '#94a3b8', fontSize: 11, lineHeight: 17, marginTop: 4 },
  sync: { color: '#64748b', fontSize: 10, marginTop: 4 },
  count: { color: '#71b7ff', fontWeight: '800' },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40, lineHeight: 20 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  ticker: { color: '#71b7ff', fontSize: 19, fontWeight: '900' },
  exchange: { color: '#64748b', fontSize: 10, fontWeight: '800' },
  company: { color: '#fff', marginTop: 5 },
  source: { color: '#64748b', marginTop: 7, fontSize: 9 },
});
