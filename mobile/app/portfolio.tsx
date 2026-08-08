import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { PortfolioPosition, PortfolioRepository } from '../db/repositories/PortfolioRepository';

export default function PortfolioScreen() {
  const [items, setItems] = useState<PortfolioPosition[]>([]);
  const [metrics, setMetrics] = useState({ totalCostBasis: 0, activeCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [positions, summary] = await Promise.all([
        PortfolioRepository.getAll(),
        PortfolioRepository.getMetrics(),
      ]);
      setItems(positions);
      setMetrics(summary);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#71b7ff" />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>Persistencia local SQLite · posiciones canónicas</Text>
          <View style={styles.metrics}>
            <Metric label="Activas" value={metrics.activeCount.toString()} />
            <Metric label="Total" value={metrics.totalCount.toString()} />
            <Metric label="Coste" value={`${metrics.totalCostBasis.toFixed(2)} €`} />
          </View>
        </View>
      }
      ListEmptyComponent={loading ? <ActivityIndicator size="large" color="#71b7ff" style={styles.loader} /> : <Text style={styles.empty}>No hay posiciones guardadas todavía.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.ticker}>{item.canonicalTicker}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
          <Text style={styles.company}>{item.companyName}</Text>
          <Text style={styles.detail}>Cantidad: {item.quantity}</Text>
          <Text style={styles.detail}>Coste medio: {item.costBasis == null ? '—' : `${item.costBasis.toFixed(2)} €`}</Text>
        </View>
      )}
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 6, marginBottom: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#94a3b8' },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 10 },
  metric: { flex: 1, backgroundColor: '#141a22', borderRadius: 12, padding: 10 },
  metricValue: { color: '#fff', fontWeight: '800', fontSize: 16 },
  metricLabel: { color: '#94a3b8', fontSize: 11, marginTop: 3 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  ticker: { color: '#71b7ff', fontSize: 18, fontWeight: '800' },
  status: { color: '#8ea2b8', fontSize: 12 },
  company: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 5 },
  detail: { color: '#9da9b7', marginTop: 4 },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  loader: { marginTop: 40 },
});
