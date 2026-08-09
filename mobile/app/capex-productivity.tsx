import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { CapexProductivityRepository } from '../db/repositories/CapexProductivityRepository';
import { capexProductivityAssessment } from '../db/schema';

type Assessment = typeof capexProductivityAssessment.$inferSelect;

const stateLabel: Record<string, string> = {
  CAPEX_HIGHLY_PRODUCTIVE: '🟢 HIGHLY PRODUCTIVE',
  CAPEX_PRODUCTIVE: '🟢 PRODUCTIVE',
  CAPEX_WATCH: '🟡 WATCH',
  CAPEX_DETERIORATION: '🟠 DETERIORATION',
  CAPEX_VALUE_DESTRUCTION_RISK: '🔴 VALUE DESTRUCTION RISK',
  CAPEX_UNDER_MONETIZATION: '🟡 UNDER MONETIZATION',
  INSUFFICIENT_DATA: '⚪ INSUFFICIENT DATA',
};

export default function CapexProductivityScreen() {
  const [items, setItems] = useState<Assessment[]>([]);

  const load = useCallback(async () => {
    setItems(await CapexProductivityRepository.listLatest());
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ATLAS Ω ENGINE</Text>
          <Text style={styles.title}>CAPEX Productivity Ω</Text>
          <Text style={styles.subtitle}>Mide si el capital incremental crea valor económico por acción. El motor exige ≥60% de completitud y al menos 5 componentes antes de emitir score.</Text>
          <View style={styles.flowCard}>
            <Text style={styles.flowTitle}>Orden canónico</Text>
            <Text style={styles.flow}>Discovery → Market Filters → Business Quality → Growth → CAPEX Productivity → Valuation → Risk → Catalysts → Final Score</Text>
          </View>
          <Text style={styles.count}>{items.length} evaluaciones persistidas</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin evaluaciones todavía</Text>
          <Text style={styles.empty}>El motor ya está operativo. Las evaluaciones se almacenarán aquí cuando el pipeline financiero entregue datos primarios suficientes.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.ticker}>{item.canonicalTicker}</Text>
              <Text style={styles.state}>{stateLabel[item.state] ?? item.state}</Text>
            </View>
            <Text style={styles.score}>{item.score == null ? '—' : Math.round(item.score)}</Text>
          </View>
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>Completitud {Math.round(item.completeness)}%</Text>
            <Text style={styles.metric}>Señales {item.signalCount}</Text>
          </View>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('es-ES')}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 8, marginBottom: 12 },
  eyebrow: { color: '#8ea2b8', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#94a3b8', lineHeight: 20 },
  flowCard: { backgroundColor: '#111923', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#29405b', gap: 6 },
  flowTitle: { color: '#71b7ff', fontWeight: '800' },
  flow: { color: '#cbd5e1', lineHeight: 20 },
  count: { color: '#71b7ff', fontWeight: '700' },
  emptyCard: { backgroundColor: '#111923', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#202b38' },
  emptyTitle: { color: '#fff', fontWeight: '800', marginBottom: 6 },
  empty: { color: '#8ea2b8', lineHeight: 20 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  ticker: { color: '#71b7ff', fontSize: 18, fontWeight: '800' },
  state: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  score: { color: '#fff', fontSize: 28, fontWeight: '900' },
  metricsRow: { flexDirection: 'row', gap: 14 },
  metric: { color: '#94a3b8', fontSize: 12 },
  date: { color: '#64748b', fontSize: 10 },
});
