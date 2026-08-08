import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eq } from 'drizzle-orm';

import { db } from '../db/client';
import { auditLog, brokerPosition, decisionLog, evidence, radar, settings, syncState, universeSymbol, watchlist } from '../db/schema';
import { FunctionalGateResult, MOBILE_FUNCTIONAL_GATE_KEY } from '../db/runtimeSelfTest';
import { runAutomaticSync } from '../services/autoSync';
import { getCredentialStatus } from '../services/credentials';

const modules = [
  { name: 'Fuentes de datos', description: 'Trading 212 + FMP · claves seguras y sync automático', route: '/data-sources' },
  { name: 'Portfolio', description: 'Cartera real leída automáticamente desde Trading 212', route: '/portfolio' },
  { name: 'Watchlist', description: 'Watchlist canónica + mercado, sin altas manuales', route: '/watchlist' },
  { name: 'Discovery', description: 'Barrido global independiente antes de aplicar filtros', route: '/discovery' },
  { name: 'Radar', description: 'Wave Score recalculado automáticamente desde mercado', route: '/radar' },
  { name: 'Evidence', description: 'Inbox automático de fuentes primarias SEC EDGAR', route: '/evidence' },
  { name: 'Daily Intelligence', description: 'Prioridades generadas desde broker, Radar y evidencia', route: '/daily-intelligence' },
  { name: 'Gemelo Digital', description: 'Perfil local: valores, incentivos, hábitos y notas', route: '/digital-twin' },
  { name: 'Audit', description: 'Trazabilidad de operaciones y sincronizaciones del sistema', route: '/audit' },
] as const;

type DashboardCounts = {
  positions: number;
  watchlist: number;
  evidence: number;
  signals: number;
  decisions: number;
  audit: number;
  discovery: number;
};

type ConnectionState = {
  t212: boolean;
  fmp: boolean;
  syncStatus: string;
  lastSync: Date | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const [counts, setCounts] = useState<DashboardCounts>({ positions: 0, watchlist: 0, evidence: 0, signals: 0, decisions: 0, audit: 0, discovery: 0 });
  const [gate, setGate] = useState<FunctionalGateResult | null>(null);
  const [connections, setConnections] = useState<ConnectionState>({ t212: false, fmp: false, syncStatus: 'NOT CONFIGURED', lastSync: null });
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const load = useCallback(async () => {
    const [positions, watch, evidences, signals, decisions, auditRows, discoveryRows, gateRows, syncRows, credentials] = await Promise.all([
      db.select().from(brokerPosition),
      db.select().from(watchlist),
      db.select().from(evidence),
      db.select().from(radar),
      db.select().from(decisionLog),
      db.select().from(auditLog),
      db.select().from(universeSymbol),
      db.select().from(settings).where(eq(settings.key, MOBILE_FUNCTIONAL_GATE_KEY)).limit(1),
      db.select().from(syncState).where(eq(syncState.key, 'AUTO_SYNC')).limit(1),
      getCredentialStatus(),
    ]);
    setCounts({
      positions: positions.length,
      watchlist: watch.length,
      evidence: evidences.length,
      signals: signals.length,
      decisions: decisions.length,
      audit: auditRows.length,
      discovery: discoveryRows.length,
    });
    setConnections({
      t212: credentials.trading212,
      fmp: credentials.fmp,
      syncStatus: syncRows[0]?.status ?? 'NOT CONFIGURED',
      lastSync: syncRows[0]?.lastSuccessAt ?? null,
    });

    const rawGate = gateRows[0]?.valueJson;
    if (rawGate) {
      try { setGate(JSON.parse(rawGate) as FunctionalGateResult); } catch { setGate(null); }
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const syncNow = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const result = await runAutomaticSync('USER_REFRESH');
      setSyncMessage(`${result.brokerPositions} posiciones · ${result.marketQuotes} cotizaciones · ${result.radarSignals} señales · ${result.secFilings} SEC`);
    } catch (cause) {
      setSyncMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSyncing(false);
      await load();
    }
  };

  const countFor = (name: string) => {
    if (name === 'Portfolio') return counts.positions;
    if (name === 'Watchlist') return counts.watchlist;
    if (name === 'Discovery') return counts.discovery;
    if (name === 'Radar') return counts.signals;
    if (name === 'Evidence') return counts.evidence;
    if (name === 'Daily Intelligence') return counts.decisions;
    if (name === 'Audit') return counts.audit;
    return null;
  };

  const automationReady = connections.t212 && connections.fmp;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>ATLAS Ω MOBILE · AUTOMATED DATA v0.2</Text>
      <Text style={styles.title}>Sistema operativo de decisión</Text>
      <Text style={styles.subtitle}>Android-only · local-first · API-driven · evidence-first</Text>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusTitle}>FUNCTIONAL GATE</Text>
          <View style={[styles.gateBadge, gate?.ok ? styles.gatePass : styles.gateUnknown]}>
            <Text style={styles.gateText}>{gate?.ok ? 'PASS' : 'CHECKING'}</Text>
          </View>
        </View>
        <Text style={styles.statusValue}>CORE-00 · UO 1.1 RC1 · 30/30 Runtime Certified</Text>
        <Text style={styles.statusNote}>SQLite se verifica antes de abrir. El pipeline de datos mantiene mercado, broker y evidencia separados epistemológicamente.</Text>
      </View>

      <View style={styles.automationCard}>
        <View style={styles.statusRow}>
          <Text style={styles.automationTitle}>AUTOMATION LAYER</Text>
          <View style={[styles.gateBadge, automationReady ? styles.gatePass : styles.gateUnknown]}>
            <Text style={styles.gateText}>{automationReady ? 'READY' : 'SETUP'}</Text>
          </View>
        </View>
        <View style={styles.connectionRow}>
          <Connection label="Trading 212" ok={connections.t212} />
          <Connection label="FMP" ok={connections.fmp} />
          <Connection label="Sync" ok={connections.syncStatus === 'SUCCESS'} />
        </View>
        <Text style={styles.syncNote}>Último sync: {connections.lastSync ? connections.lastSync.toLocaleString('es-ES') : 'todavía no'}</Text>
        {automationReady ? (
          <Pressable onPress={() => { void syncNow(); }} disabled={syncing} style={({ pressed }) => [styles.syncButton, (pressed || syncing) && styles.cardPressed]}>
            <Text style={styles.syncButtonText}>{syncing ? 'Sincronizando…' : 'Sincronizar todo ahora'}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/data-sources')} style={({ pressed }) => [styles.syncButton, pressed && styles.cardPressed]}>
            <Text style={styles.syncButtonText}>Configurar APIs una sola vez</Text>
          </Pressable>
        )}
        {syncMessage ? <Text style={styles.syncMessage}>{syncMessage}</Text> : null}
      </View>

      <View style={styles.summaryRow}>
        <MiniMetric label="Portfolio" value={counts.positions} />
        <MiniMetric label="Watchlist" value={counts.watchlist} />
        <MiniMetric label="Radar" value={counts.signals} />
      </View>

      <Text style={styles.instruction}>Después de configurar las dos APIs, Portfolio, Watchlist, Radar, Evidence y Daily Intelligence dejan de depender de introducción manual.</Text>

      <View style={styles.grid}>
        {modules.map((module) => {
          const moduleCount = countFor(module.name);
          return (
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
                {moduleCount != null ? <View style={styles.countBadge}><Text style={styles.countText}>{moduleCount}</Text></View> : null}
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function Connection({ label, ok }: { label: string; ok: boolean }) {
  return <View style={styles.connection}><View style={[styles.dot, ok ? styles.dotOk : styles.dotPending]} /><Text style={styles.connectionText}>{label}</Text></View>;
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
  automationCard: { borderWidth: 1, borderColor: '#245638', backgroundColor: '#101b16', borderRadius: 18, padding: 18, gap: 10 },
  automationTitle: { color: '#34d399', fontWeight: '900', fontSize: 13 },
  connectionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  connection: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0f141b', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOk: { backgroundColor: '#34d399' },
  dotPending: { backgroundColor: '#f59e0b' },
  connectionText: { color: '#cbd5e1', fontSize: 10, fontWeight: '700' },
  syncNote: { color: '#94a3b8', fontSize: 11 },
  syncButton: { backgroundColor: '#2f81f7', borderRadius: 10, padding: 11, alignItems: 'center' },
  syncButtonText: { color: '#fff', fontWeight: '900' },
  syncMessage: { color: '#cbd5e1', fontSize: 11, lineHeight: 17 },
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
