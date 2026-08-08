import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { AuditLogRepository } from '../db/repositories/AuditLogRepository';
import type { AuditLogRecord } from '../db/repositories/AuditLogRepository';

export default function AuditScreen() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, quarantined: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [items, metrics] = await Promise.all([
        AuditLogRepository.getAll(100),
        AuditLogRepository.getSummary(),
      ]);
      setLogs(items);
      setSummary(metrics);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={logs}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadData();
          }}
          tintColor="#4A90E2"
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Auditoría y trazabilidad</Text>
          <Text style={styles.subtitle}>Eventos persistidos localmente en ATLAS Ω</Text>
          <View style={styles.metrics}>
            <Metric label="Total" value={summary.total} />
            <Metric label="Pass" value={summary.passed} />
            <Metric label="Quarantine" value={summary.quarantined} />
            <Metric label="Rejected" value={summary.rejected} />
          </View>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
        ) : (
          <Text style={styles.empty}>Todavía no hay eventos de auditoría locales.</Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.action}>{item.action}</Text>
            <Text style={styles.time}>{item.createdAt.toLocaleString('es-ES')}</Text>
          </View>
          <Text style={styles.actor}>Actor: {item.actor}</Text>
          {item.target ? <Text style={styles.detail}>Target: {item.target}</Text> : null}
          {item.payloadHash ? <Text style={styles.hash}>Hash: {item.payloadHash}</Text> : null}
        </View>
      )}
    />
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  content: { padding: 16, gap: 10 },
  header: { marginBottom: 10, gap: 6 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#94A3B8', fontSize: 14 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 10 },
  metric: { flex: 1, backgroundColor: '#161B22', borderRadius: 10, padding: 10 },
  metricValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  metricLabel: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  card: { backgroundColor: '#161B22', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#21262D' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  action: { color: '#58A6FF', fontSize: 14, fontWeight: '800', flex: 1 },
  time: { color: '#6E7681', fontSize: 10 },
  actor: { color: '#E6EDF3', marginTop: 8, fontWeight: '600' },
  detail: { color: '#8B949E', marginTop: 4 },
  hash: { color: '#6E7681', marginTop: 4, fontSize: 11 },
  empty: { color: '#8B949E', textAlign: 'center', padding: 40 },
  loader: { marginTop: 40 },
});
