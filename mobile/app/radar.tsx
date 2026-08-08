import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { desc } from 'drizzle-orm';

import { db } from '../db/client';
import { radar } from '../db/schema';
import { runAutomaticSync } from '../services/autoSync';
import { getCredentialStatus } from '../services/credentials';

type RadarItem = typeof radar.$inferSelect;

type RadarPayload = {
  source?: string;
  canonical?: boolean;
  classification?: string;
  changePercent?: number | null;
  price?: number | null;
  priceAvg50?: number | null;
  priceAvg200?: number | null;
  reasons?: string[];
  note?: string;
};

export default function RadarScreen() {
  const router = useRouter();
  const [items, setItems] = useState<RadarItem[]>([]);
  const [configured, setConfigured] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [rows, credentials] = await Promise.all([
      db.select().from(radar).orderBy(desc(radar.score)),
      getCredentialStatus(),
    ]);
    setItems(rows);
    setConfigured(credentials.fmp);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const syncNow = async () => {
    setRefreshing(true);
    setMessage('');
    try {
      const result = await runAutomaticSync('USER_REFRESH');
      setMessage(`${result.radarSignals} señales recalculadas con datos de mercado actuales.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      await load();
    }
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void syncNow(); }} tintColor="#71b7ff" />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Radar Ω automático</Text>
          <Text style={styles.subtitle}>ATLAS recalcula el Wave Score desde cotización, medias 50/200 días y posición en rango anual. No se introducen señales manualmente.</Text>
          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>MARKET SIGNAL ≠ EVIDENCE</Text>
            <Text style={styles.ruleText}>Una señal fuerte puede priorizar revisión, pero nunca modifica por sí sola Quality Ω, Conviction Ω o la tesis fundamental.</Text>
            {!configured ? (
              <Pressable onPress={() => router.push('/data-sources')} style={styles.primary}><Text style={styles.primaryText}>Conectar FMP</Text></Pressable>
            ) : (
              <Pressable onPress={() => { void syncNow(); }} style={styles.secondary}><Text style={styles.secondaryText}>Recalcular Radar</Text></Pressable>
            )}
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          <Text style={styles.count}>{items.length} señales automáticas activas</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>{configured ? 'No hay señales con Wave Score ≥ 60.' : 'Conecta FMP para activar Radar Ω.'}</Text>}
      renderItem={({ item, index }) => {
        const payload = parsePayload(item.payloadJson);
        const reasons = payload.reasons ?? [];
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.subject}>{item.subjectId}</Text>
                <Text style={styles.type}>{item.signalType}</Text>
              </View>
              <View style={[styles.scoreBadge, (item.score ?? 0) >= 80 ? styles.high : styles.medium]}>
                <Text style={styles.score}>{item.score == null ? '—' : item.score.toFixed(0)}</Text>
              </View>
            </View>
            <View style={styles.marketRow}>
              <Metric label="Día" value={formatPercent(payload.changePercent)} positive={(payload.changePercent ?? 0) >= 0} />
              <Metric label="Precio" value={formatNumber(payload.price)} />
              <Metric label="50d" value={formatNumber(payload.priceAvg50)} />
              <Metric label="200d" value={formatNumber(payload.priceAvg200)} />
            </View>
            {reasons.length ? (
              <View style={styles.reasons}>{reasons.map((reason) => <Text key={reason} style={styles.reason}>• {reason}</Text>)}</View>
            ) : null}
            <Text style={styles.meta}>{payload.source ?? 'MARKET'} · {item.severity} · NO CANÓNICO</Text>
            <Text style={styles.time}>{item.createdAt.toLocaleString('es-ES')}</Text>
          </View>
        );
      }}
    />
  );
}

function parsePayload(raw: string): RadarPayload {
  try { return JSON.parse(raw) as RadarPayload; } catch { return {}; }
}

function formatNumber(value: number | null | undefined): string {
  return value == null ? '—' : value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function Metric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, positive === true && styles.positive, positive === false && styles.negative]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 8, marginBottom: 12 },
  title: { color: '#fff', fontSize: 27, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 20 },
  ruleCard: { backgroundColor: '#111923', borderRadius: 14, padding: 13, gap: 8, borderWidth: 1, borderColor: '#29405b' },
  ruleTitle: { color: '#71b7ff', fontSize: 12, fontWeight: '900' },
  ruleText: { color: '#9da9b7', fontSize: 12, lineHeight: 18 },
  primary: { backgroundColor: '#2f81f7', borderRadius: 9, padding: 10, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '900' },
  secondary: { borderWidth: 1, borderColor: '#29405b', borderRadius: 9, padding: 10, alignItems: 'center' },
  secondaryText: { color: '#71b7ff', fontWeight: '800' },
  message: { color: '#cbd5e1', fontSize: 12 },
  count: { color: '#71b7ff', fontWeight: '800' },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0f141b', alignItems: 'center', justifyContent: 'center' },
  rankText: { color: '#64748b', fontWeight: '900' },
  flex: { flex: 1 },
  subject: { color: '#fff', fontWeight: '900', fontSize: 20 },
  type: { color: '#64748b', fontSize: 10, marginTop: 2 },
  scoreBadge: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  high: { backgroundColor: '#123922', borderColor: '#245638' },
  medium: { backgroundColor: '#3a3112', borderColor: '#66551c' },
  score: { color: '#fff', fontSize: 20, fontWeight: '900' },
  marketRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  metric: { flex: 1, backgroundColor: '#0f141b', borderRadius: 8, padding: 8 },
  metricLabel: { color: '#64748b', fontSize: 9 },
  metricValue: { color: '#cbd5e1', fontSize: 11, fontWeight: '800', marginTop: 3 },
  positive: { color: '#34d399' },
  negative: { color: '#f87171' },
  reasons: { marginTop: 10, gap: 3 },
  reason: { color: '#cbd5e1', fontSize: 12 },
  meta: { color: '#f59e0b', fontSize: 10, marginTop: 10, fontWeight: '700' },
  time: { color: '#64748b', fontSize: 10, marginTop: 4 },
});
