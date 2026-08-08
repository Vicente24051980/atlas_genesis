import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { db } from '../db/client';
import { decisionLog, evidence, radar } from '../db/schema';

export default function DigitalTwinScreen() {
  const [counts, setCounts] = useState({ evidence: 0, decisions: 0, signals: 0 });

  const load = useCallback(async () => {
    const [evidenceRows, decisionRows, radarRows] = await Promise.all([
      db.select().from(evidence),
      db.select().from(decisionLog),
      db.select().from(radar),
    ]);
    setCounts({ evidence: evidenceRows.length, decisions: decisionRows.length, signals: radarRows.length });
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gemelo Digital</Text>
      <Text style={styles.subtitle}>Vista local del estado decisional construido a partir de evidencia, decisiones y señales.</Text>

      <View style={styles.grid}>
        <Metric label="Evidencias" value={counts.evidence} />
        <Metric label="Decisiones" value={counts.decisions} />
        <Metric label="Señales" value={counts.signals} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Matriz causal Ω</Text>
        <Text style={styles.body}>Esta pantalla ya lee el estado persistido de SQLite. La modelización avanzada de valores, incentivos, hábitos y relaciones causales seguirá siendo una capa separada del CORE-00.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Regla epistémica</Text>
        <Text style={styles.body}>La ausencia de registros no se interpreta como evidencia negativa. La IA no crea hechos: solo puede operar sobre evidencia previamente validada.</Text>
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' }, content: { padding: 16, gap: 14 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#94a3b8', lineHeight: 20 },
  grid: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, backgroundColor: '#141a22', borderRadius: 12, padding: 12 },
  metricValue: { color: '#71b7ff', fontWeight: '800', fontSize: 22 }, metricLabel: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#202b38' }, cardTitle: { color: '#fff', fontSize: 17, fontWeight: '800' }, body: { color: '#9da9b7', lineHeight: 21, marginTop: 8 },
});
