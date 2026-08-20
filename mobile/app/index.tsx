import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MobileApi, MobileHealth } from '../core/api/mobileApi';

const MARKET_TAPE = [
  { symbol: 'SPX', state: 'LIVE', meta: 'US Large Cap' },
  { symbol: 'NDX', state: 'LIVE', meta: 'AI / Growth' },
  { symbol: 'STOXX', state: 'WATCH', meta: 'Europe Receiver' },
  { symbol: 'GOLD', state: 'FLOW', meta: 'Macro Hedge' },
  { symbol: 'BRENT', state: 'RISK', meta: 'Energy Gate' },
];

const COMMANDS = ['AUDIT TICKER', 'PORTFOLIO FIRST', 'WATCHLIST', 'RESULTS', 'SYSTEM'];

export default function HomeScreen() {
  const [health, setHealth] = useState<MobileHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setHealth(await MobileApi.health());
    } catch (cause) {
      setHealth(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  useEffect(() => { void load(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const online = health?.ok === true;
  const provider = health?.preferred_provider || 'Conectando';
  const systemState = useMemo(() => (online ? 'ONLINE' : health ? 'DEGRADED' : 'CONNECTING'), [online, health]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor="#38bdf8" />}
    >
      <View style={styles.terminalTopBar}>
        <View>
          <Text style={styles.product}>ATLAS Ω TERMINAL</Text>
          <Text style={styles.version}>OPEN TERMINAL UI · MOBILE DESK</Text>
        </View>
        <View style={[styles.statusPill, online ? styles.statusPillOnline : styles.statusPillWarn]}>
          <Text style={styles.statusPillText}>{systemState}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tape}>
        {MARKET_TAPE.map((item) => (
          <View key={item.symbol} style={styles.tapeCell}>
            <Text style={styles.tapeSymbol}>{item.symbol}</Text>
            <Text style={styles.tapeState}>{item.state}</Text>
            <Text style={styles.tapeMeta}>{item.meta}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.commandBar}>
        <Text style={styles.commandPrompt}>⌘</Text>
        <View style={styles.commandTextWrap}>
          <Text style={styles.commandTitle}>Command Center</Text>
          <Text style={styles.commandSub}>Portfolio First · Audit · Watchlist · Resultados · Sistema</Text>
        </View>
      </View>

      <View style={styles.providerPanel}>
        <View style={styles.panelHeaderRow}>
          <Text style={styles.panelTitle}>DATA ENGINE</Text>
          {!health && !error ? <ActivityIndicator color="#38bdf8" /> : null}
        </View>
        <Text style={styles.panelMain}>{online ? 'Motor conectado al backend real' : health ? 'Motor degradado' : 'Conectando con backend'}</Text>
        <Text style={styles.panelMuted}>Proveedor preferido: {provider}</Text>
        {health ? (
          <View style={styles.providerRow}>
            <Badge label="FinancialData.Net" active={health.financialdatanet_configured} />
            <Badge label="Finnhub fallback" active={health.finnhub_configured} />
          </View>
        ) : null}
        {error ? <Text style={styles.error}>Backend no disponible: {error}</Text> : null}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Portfolio First</Text>
        <Text style={styles.sectionHint}>Abrir → auditar → decidir</Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Portfolio First" onPress={() => router.push('/portfolio')} style={({ pressed }) => [styles.mainDeck, pressed && styles.pressed]}>
        <View style={styles.deckHeader}>
          <View>
            <Text style={styles.deckKicker}>LIVE DESK</Text>
            <Text style={styles.deckTitle}>Cartera 36</Text>
          </View>
          <Text style={styles.deckAction}>OPEN</Text>
        </View>
        <View style={styles.metricsGrid}>
          <Metric label="Evidence" value="REAL" tone="blue" />
          <Metric label="Trading" value="T212" tone="cyan" />
          <Metric label="Risk" value="GATED" tone="amber" />
        </View>
        <Text style={styles.deckNote}>Snapshot de cartera primero. Sin scores inventados; cada ticker entra después en Evidence Director Ω.</Text>
      </Pressable>

      <View style={styles.moduleGrid}>
        <ModuleCard
          label="Audit Console"
          eyebrow="Ticker / Company"
          body="Análisis con datos reales, EDD y Global CAPEX Chain Ω."
          action="AUDIT"
          route="/analyze"
        />
        <ModuleCard
          label="Watchlist"
          eyebrow="Universe / Candidates"
          body="Candidatos, vigilancia y disponibilidad operativa sin promover por narrativa."
          action="WATCH"
          route="/portfolio"
        />
        <ModuleCard
          label="Resultados"
          eyebrow="Runs / Outputs"
          body="Panel de resultados y trazabilidad para comparar auditorías."
          action="OPEN"
          route="/settings"
        />
        <ModuleCard
          label="Broker Ω"
          eyebrow="Trading 212 bridge"
          body="Bridge, cuenta, posiciones y órdenes. Ejecución live bloqueada por defecto."
          action="CHECK"
          route="/broker"
        />
      </View>

      <View style={styles.evidencePanel}>
        <Text style={styles.panelTitle}>EVIDENCE STACK</Text>
        <EvidenceRow left="FACT" right="Backend real, proveedores y trazas" />
        <EvidenceRow left="HYPOTHESIS" right="Watchlist y auditorías en revisión" />
        <EvidenceRow left="INTERPRETATION" right="Lectura ATLAS, nunca prueba primaria" />
        <EvidenceRow left="NOISE" right="Precio corto plazo y narrativa aislada" />
      </View>

      <View style={styles.quickStrip}>
        {COMMANDS.map((command) => <Text key={command} style={styles.quickCommand}>{command}</Text>)}
      </View>
    </ScrollView>
  );
}

function Badge({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={[styles.badge, active ? styles.badgeOn : styles.badgeOff]}>
      <Text style={styles.badgeText}>{label}: {active ? 'OK' : 'pendiente'}</Text>
    </View>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'cyan' | 'amber' }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, tone === 'blue' ? styles.toneBlue : tone === 'cyan' ? styles.toneCyan : styles.toneAmber]}>{value}</Text>
    </View>
  );
}

function ModuleCard({ label, eyebrow, body, action, route }: { label: string; eyebrow: string; body: string; action: string; route: '/analyze' | '/portfolio' | '/settings' | '/broker' }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => router.push(route)} style={({ pressed }) => [styles.moduleCard, pressed && styles.pressed]}>
      <Text style={styles.moduleEyebrow}>{eyebrow}</Text>
      <Text style={styles.moduleTitle}>{label}</Text>
      <Text style={styles.moduleBody}>{body}</Text>
      <Text style={styles.moduleAction}>{action} →</Text>
    </Pressable>
  );
}

function EvidenceRow({ left, right }: { left: string; right: string }) {
  return (
    <View style={styles.evidenceRow}>
      <Text style={styles.evidenceLeft}>{left}</Text>
      <Text style={styles.evidenceRight}>{right}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070a' },
  content: { paddingTop: 48, paddingHorizontal: 14, paddingBottom: 36, gap: 12 },
  terminalTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  product: { color: '#e5f4ff', fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  version: { color: '#38bdf8', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 3 },
  statusPill: { borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10 },
  statusPillOnline: { borderColor: '#14532d', backgroundColor: '#062b1d' },
  statusPillWarn: { borderColor: '#713f12', backgroundColor: '#24180a' },
  statusPillText: { color: '#e2e8f0', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  tape: { gap: 8, paddingVertical: 2 },
  tapeCell: { minWidth: 104, borderColor: '#1f2a37', borderWidth: 1, backgroundColor: '#07111b', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12 },
  tapeSymbol: { color: '#f8fafc', fontSize: 14, fontWeight: '900' },
  tapeState: { color: '#22d3ee', fontSize: 11, fontWeight: '900', marginTop: 2 },
  tapeMeta: { color: '#64748b', fontSize: 10, marginTop: 2 },
  commandBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1d4ed8', backgroundColor: '#08111f', borderRadius: 14, padding: 13, gap: 11 },
  commandPrompt: { color: '#38bdf8', fontSize: 20, fontWeight: '900' },
  commandTextWrap: { flex: 1 },
  commandTitle: { color: '#f8fafc', fontWeight: '900', fontSize: 14 },
  commandSub: { color: '#94a3b8', marginTop: 2, fontSize: 11 },
  providerPanel: { backgroundColor: '#0b1119', borderColor: '#1e293b', borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  panelHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { color: '#93c5fd', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  panelMain: { color: '#f8fafc', fontSize: 17, fontWeight: '900' },
  panelMuted: { color: '#94a3b8', fontSize: 12 },
  providerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10, borderWidth: 1 },
  badgeOn: { backgroundColor: '#0d2a22', borderColor: '#1e6b53' },
  badgeOff: { backgroundColor: '#221b14', borderColor: '#5f472c' },
  badgeText: { color: '#dbeafe', fontSize: 11, fontWeight: '800' },
  error: { color: '#fca5a5', lineHeight: 19, fontSize: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { color: '#f8fafc', fontWeight: '900', fontSize: 18, letterSpacing: -0.3 },
  sectionHint: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  mainDeck: { backgroundColor: '#0a1220', borderColor: '#1d4ed8', borderWidth: 1, borderRadius: 18, padding: 15, gap: 12 },
  deckHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deckKicker: { color: '#38bdf8', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  deckTitle: { color: '#ffffff', fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  deckAction: { color: '#05070a', backgroundColor: '#38bdf8', borderRadius: 999, overflow: 'hidden', paddingVertical: 7, paddingHorizontal: 11, fontWeight: '900', fontSize: 11 },
  metricsGrid: { flexDirection: 'row', gap: 8 },
  metricBox: { flex: 1, borderWidth: 1, borderColor: '#263244', backgroundColor: '#070d15', borderRadius: 12, padding: 10 },
  metricLabel: { color: '#64748b', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  metricValue: { fontSize: 17, fontWeight: '900', marginTop: 4 },
  toneBlue: { color: '#93c5fd' },
  toneCyan: { color: '#22d3ee' },
  toneAmber: { color: '#fbbf24' },
  deckNote: { color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moduleCard: { width: '48.5%', minHeight: 164, backgroundColor: '#091018', borderColor: '#1e293b', borderWidth: 1, borderRadius: 16, padding: 13, gap: 7 },
  moduleEyebrow: { color: '#38bdf8', fontSize: 9, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase' },
  moduleTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  moduleBody: { color: '#94a3b8', fontSize: 11, lineHeight: 16, flex: 1 },
  moduleAction: { color: '#e0f2fe', fontWeight: '900', fontSize: 11 },
  evidencePanel: { backgroundColor: '#0b1119', borderColor: '#1e293b', borderWidth: 1, borderRadius: 16, padding: 14, gap: 9 },
  evidenceRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#162032', paddingTop: 8 },
  evidenceLeft: { width: 104, color: '#f8fafc', fontWeight: '900', fontSize: 11 },
  evidenceRight: { flex: 1, color: '#94a3b8', fontSize: 11, lineHeight: 16 },
  quickStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 2 },
  quickCommand: { color: '#7dd3fc', borderColor: '#1e3a8a', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, fontSize: 9, fontWeight: '900' },
  pressed: { opacity: 0.72 },
});
