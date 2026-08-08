import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { desc } from 'drizzle-orm';

import { db } from '../db/client';
import { decisionLog } from '../db/schema';
import { runAutomaticSync } from '../services/autoSync';

type Decision = typeof decisionLog.$inferSelect;

export default function DailyIntelligenceScreen() {
  const [items, setItems] = useState<Decision[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setItems(await db.select().from(decisionLog).orderBy(desc(decisionLog.createdAt)));
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const syncNow = async () => {
    setRefreshing(true);
    setMessage('');
    try {
      const result = await runAutomaticSync('USER_REFRESH');
      setMessage(`${result.dailyObservations} observaciones automáticas · ${result.secFilings} fuentes SEC nuevas/detectadas.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      await load();
    }
  };

  const counts = useMemo(() => ({
    priority: items.filter((item) => item.decisionType === 'MARKET_REVIEW_PRIORITY').length,
    primary: items.filter((item) => item.decisionType === 'PRIMARY_SOURCE_UPDATE').length,
    orders: items.filter((item) => item.decisionType === 'BROKER_ORDER_OBSERVATION').length,
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
          <Text style={styles.title}>Daily Intelligence automático</Text>
          <Text style={styles.subtitle}>ATLAS genera observaciones desde órdenes del broker, Radar Ω y nuevas fuentes primarias. No genera decisiones BUY/SELL por sí mismo.</Text>
          <View style={styles.metrics}>
            <Metric label="Prioridad" value={counts.priority} />
            <Metric label="SEC" value={counts.primary} />
            <Metric label="Órdenes" value={counts.orders} />
          </View>
          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>OBSERVAR ≠ DECIDIR</Text>
            <Text style={styles.ruleText}>Esta pantalla prioriza qué revisar. Una señal de mercado o una orden detectada no altera la tesis. Las fuentes SEC descubiertas quedan pendientes de extracción y validación CORE-00.</Text>
            <Pressable onPress={() => { void syncNow(); }} style={styles.secondary}><Text style={styles.secondaryText}>Actualizar inteligencia</Text></Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          <Text style={styles.count}>{items.length} observaciones</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>La próxima sincronización generará las observaciones relevantes automáticamente.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.type}>{prettyType(item.decisionType)}</Text>
            <Text style={styles.time}>{item.createdAt.toLocaleString('es-ES')}</Text>
          </View>
          {item.subjectId ? <Text style={styles.subject}>{item.subjectId}</Text> : null}
          <Text style={styles.rationale}>{item.rationale}</Text>
          <Text style={styles.auto}>SYSTEM GENERATED · READ ONLY</Text>
        </View>
      )}
    />
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function prettyType(type: string): string {
  return type.replaceAll('_', ' ');
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
  ruleCard: { backgroundColor: '#111923', borderRadius: 14, padding: 13, gap: 8, borderWidth: 1, borderColor: '#29405b' },
  ruleTitle: { color: '#71b7ff', fontSize: 12, fontWeight: '900' },
  ruleText: { color: '#9da9b7', fontSize: 12, lineHeight: 18 },
  secondary: { borderWidth: 1, borderColor: '#29405b', borderRadius: 9, padding: 10, alignItems: 'center' },
  secondaryText: { color: '#71b7ff', fontWeight: '800' },
  message: { color: '#cbd5e1', fontSize: 12 },
  count: { color: '#71b7ff', fontWeight: '800' },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40, lineHeight: 20 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  type: { color: '#71b7ff', fontWeight: '800', flex: 1, fontSize: 11 },
  time: { color: '#64748b', fontSize: 10 },
  subject: { color: '#fff', marginTop: 8, fontWeight: '900', fontSize: 18 },
  rationale: { color: '#cbd5e1', marginTop: 8, lineHeight: 20 },
  auto: { color: '#64748b', marginTop: 10, fontSize: 9, fontWeight: '800' },
});
