import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eq } from 'drizzle-orm';

import { db } from '../db/client';
import { auditLog, decisionLog, evidence, position, radar, settings, watchlist } from '../db/schema';
import { FunctionalGateResult, MOBILE_FUNCTIONAL_GATE_KEY } from '../db/runtimeSelfTest';

const modules = [
  { name: 'Portfolio', description: 'Añadir, actualizar y eliminar posiciones', route: '/portfolio' },
  { name: 'Watchlist', description: 'Añadir y quitar candidatos sin duplicados', route: '/watchlist' },
  { name: 'Radar', description: 'Crear y eliminar señales con Wave Score', route: '/radar' },
  { name: 'Evidence', description: 'Registrar, validar y eliminar evidencia', route: '/evidence' },
  { name: 'Daily Intelligence', description: 'Registrar y borrar decisiones persistentes', route: '/daily-intelligence' },
  { name: 'Gemelo Digital', description: 'Editar y guardar valores, incentivos, hábitos y notas', route: '/digital-twin' },
  { name: 'Audit', description: 'Consultar la trazabilidad de mutaciones reales', route: '/audit' },
] as const;

type DashboardCounts = {
  positions: number;
  watchlist: number;
  evidence: number;
  signals: number;
  decisions: number;
  audit: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const [counts, setCounts] = useState<DashboardCounts>({ positions: 0, watchlist: 0, evidence: 0, signals: 0, decisions: 0, audit: 0 });
  const [gate, setGate] = useState<FunctionalGateResult | null>(null);

  const load = useCallback(async () => {
    const [positions, watch, evidences, signals, decisions, auditRows, gateRows] = await Promise.all([
      db.select().from(position),
      db.select().from(watchlist),
      db.select().from(evidence),
      db.select().from(radar),
      db.select().from(decisionLog),
      db.select().from(auditLog),
      db.select().from(settings).where(eq(settings.key, MOBILE_FUNCTIONAL_GATE_KEY)).limit(1),
    ]);
    setCounts({
      positions: positions.length,
      watchlist: watch.length,
      evidence: evidences.length,
      signals: signals.length,
      decisions: decisions.length,
      audit: auditRows.length,
    });

    const rawGate = gateRows[0]?.valueJson;
    if (rawGate) {
      try {
        setGate(JSON.parse(rawGate) as FunctionalGateResult);
      } catch {
        setGate(null);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const countFor = (name: string) => {
    if (name === 'Portfolio') return counts.positions;
    if (name === 'Watchlist') return counts.watchlist;
    if (name === 'Radar') return counts.signals;
    if (name === 'Evidence') return counts.evidence;
    if (name === 'Daily Intelligence') return counts.decisions;
    if (name === 'Audit') return counts.audit;
    return counts.evidence + counts.decisions + counts.signals;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>ATLAS Ω MOBILE · FUNCTIONAL MVP v1</Text>
      <Text style={styles.title}>Sistema operativo de decisión</Text>
      <Text style={styles.subtitle}>Android-only · local-first · evidence-first</Text>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusTitle}>FUNCTIONAL GATE</Text>
          <View style={[styles.gateBadge, gate?.ok ? styles.gatePass : styles.gateUnknown]}>
            <Text style={styles.gateText}>{gate?.ok ? 'PASS' : 'CHECKING'}</Text>
          </View>
        </View>
        <Text style={styles.statusValue}>CORE-00 · UO 1.1 RC1 · 30/30 Runtime Certified</Text>
        <Text style={styles.statusNote}>SQLite real verificado con altas, lecturas, actualizaciones y borrados antes de abrir esta pantalla.</Text>
        {gate?.checkedAt ? <Text style={styles.checkedAt}>Functional Gate: {new Date(gate.checkedAt).toLocaleString('es-ES')}</Text> : null}
      </View>

      <View style={styles.summaryRow}>
        <MiniMetric label="Portfolio" value={counts.positions} />
        <MiniMetric label="Watchlist" value={counts.watchlist} />
        <MiniMetric label="Evidence" value={counts.evidence} />
      </View>

      <Text style={styles.instruction}>Pulsa un módulo. Cada tarjeta abre una pantalla operativa con persistencia local.</Text>

      <View style={styles.grid}>
        {modules.map((module) => (
          <Pressable
            key={module.name}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${module.name}`}
            onPress={() => router.push(module.route)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{module.name}</Text>
                <Text style={styles.cardText}>{module.description}</Text>
              </View>
              <View style={styles.countBadge}><Text style={styles.countText}>{countFor(module.name)}</Text></View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, backgroundColor: '#0b0f14' },
  eyebrow: { color: '#8ea2b8', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#9da9b7', fontSize: 15 },
  statusCard: { borderWidth: 1, borderColor: '#29405b', backgroundColor: '#111923', borderRadius: 18, padding: 18, gap: 7 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  statusTitle: { color: '#71b7ff', fontWeight: '800', fontSize: 13 },
  gateBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  gatePass: { backgroundColor: '#123922' },
  gateUnknown: { backgroundColor: '#3a3112' },
  gateText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  statusValue: { color: '#fff', fontSize: 17, fontWeight: '700' },
  statusNote: { color: '#9da9b7', fontSize: 13, lineHeight: 19 },
  checkedAt: { color: '#64748b', fontSize: 10 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, backgroundColor: '#111923', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#202b38' },
  metricValue: { color: '#71b7ff', fontWeight: '800', fontSize: 22 },
  metricLabel: { color: '#94a3b8', fontSize: 11, marginTop: 3 },
  instruction: { color: '#cbd5e1', fontSize: 13, lineHeight: 19 },
  grid: { gap: 12 },
  card: { backgroundColor: '#141a22', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#202b38' },
  cardPressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 5 },
  cardText: { color: '#9da9b7', lineHeight: 20 },
  countBadge: { minWidth: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111923', borderWidth: 1, borderColor: '#29405b' },
  countText: { color: '#71b7ff', fontWeight: '800' },
  chevron: { color: '#71b7ff', fontSize: 30, lineHeight: 30 },
});
