import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { desc } from 'drizzle-orm';

import { db } from '../db/client';
import { decisionLog } from '../db/schema';

type DecisionRecord = typeof decisionLog.$inferSelect;

export default function DecisionsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<DecisionRecord[]>([]);

  const load = useCallback(async () => {
    const rows = await db.select().from(decisionLog).orderBy(desc(decisionLog.createdAt)).limit(250);
    setItems(rows);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const monitorItems = items.filter((item) => item.decisionType.startsWith('ATLAS_MONITOR_'));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Text style={styles.engine}>DECISION LOG Ω</Text>
      </View>
      <Text style={styles.title}>Historial de decisiones</Text>
      <Text style={styles.subtitle}>Cambios detectados en Cartera Ω y Watchlist Ω quedan persistidos localmente con acción, score, razones y timestamp.</Text>

      <View style={styles.summary}><Text style={styles.summaryValue}>{monitorItems.length}</Text><Text style={styles.summaryLabel}>SNAPSHOTS/CAMBIOS DE MONITOR</Text></View>

      {monitorItems.length ? monitorItems.map((item) => <DecisionCard key={item.id} item={item} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>Aún no hay historial</Text><Text style={styles.emptyText}>Abre Cartera Ω o Watchlist Ω. La primera lectura crea baseline; los cambios posteriores quedan registrados.</Text></View>}
    </ScrollView>
  );
}

function DecisionCard({ item }: { item: DecisionRecord }) {
  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(item.rationale) as Record<string, unknown>; } catch { parsed = {}; }
  const action = typeof parsed.actionLabel === 'string' ? parsed.actionLabel : typeof parsed.action === 'string' ? parsed.action : item.decisionType;
  const score = typeof parsed.atlasScore === 'number' ? parsed.atlasScore : null;
  const previous = typeof parsed.previousAction === 'string' ? parsed.previousAction : null;
  const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.filter((value): value is string => typeof value === 'string') : [];
  const positive = action === 'COMPRAR' || action === 'AÑADIR';
  const warning = action === 'REVISAR' || action === 'ESPERAR';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}><Text style={styles.ticker}>{item.subjectId || '—'}</Text><Text style={[styles.action, positive ? styles.positive : warning ? styles.warning : styles.negative]}>{action}</Text></View>
      <Text style={styles.meta}>{item.decisionType.replaceAll('_', ' ')} · {item.createdAt instanceof Date ? item.createdAt.toLocaleString('es-ES') : String(item.createdAt)}</Text>
      <View style={styles.scoreRow}><Text style={styles.scoreLabel}>SCORE Ω</Text><Text style={styles.score}>{score == null ? '—' : Math.round(score)}</Text>{previous ? <Text style={styles.previous}>desde {previous}</Text> : <Text style={styles.previous}>baseline</Text>}</View>
      {reasons.slice(0, 3).map((reason, index) => <Text key={`${index}-${reason}`} style={styles.reason}>• {reason}</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { padding: 18, paddingBottom: 50, gap: 11 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#11161a', borderWidth: 1, borderColor: '#283139', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#edf1f3', fontSize: 31, lineHeight: 33, marginTop: -4 }, engine: { color: '#6fcbee', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#f5f7f8', fontSize: 30, fontWeight: '900' }, subtitle: { color: '#87939d', fontSize: 12, lineHeight: 18 },
  summary: { borderRadius: 14, borderWidth: 1, borderColor: '#294354', backgroundColor: '#0b151b', padding: 14, flexDirection: 'row', alignItems: 'baseline', gap: 10 }, summaryValue: { color: '#75cff6', fontSize: 29, fontWeight: '900' }, summaryLabel: { color: '#6c7d89', fontSize: 8, fontWeight: '900' },
  card: { borderRadius: 14, borderWidth: 1, borderColor: '#252e34', backgroundColor: '#0c1013', padding: 13 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, ticker: { color: '#f1f4f5', fontSize: 17, fontWeight: '900' }, action: { fontSize: 10, fontWeight: '900' }, positive: { color: '#3bd69d' }, warning: { color: '#e1bb61' }, negative: { color: '#ff6d82' }, meta: { color: '#65717a', fontSize: 8, marginTop: 4 }, scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 10 }, scoreLabel: { color: '#6fcbee', fontSize: 8, fontWeight: '900' }, score: { color: '#e7ecef', fontSize: 20, fontWeight: '900' }, previous: { color: '#6f7c85', fontSize: 8.5 }, reason: { color: '#8b969e', fontSize: 9.5, lineHeight: 14, marginTop: 5 },
  empty: { minHeight: 250, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }, emptyTitle: { color: '#dfe4e7', fontSize: 17, fontWeight: '900' }, emptyText: { color: '#727f88', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 6 },
});
