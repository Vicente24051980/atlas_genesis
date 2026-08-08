import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eq } from 'drizzle-orm';

import { AtlasApi, type ApiHealth } from '../core/api/atlasApi';
import { db } from '../db/client';
import { auditLog, evidence, position, radar, settings, watchlist } from '../db/schema';
import { type FunctionalGateResult, MOBILE_FUNCTIONAL_GATE_KEY } from '../db/runtimeSelfTest';

type Dashboard = { positions: number; watchlist: number; evidence: number; signals: number; audit: number };

const primary = [
  { code: 'TRM', title: 'Terminal', subtitle: 'Ticker → Audit Ω', route: '/terminal' },
  { code: 'PRT', title: 'Portfolio Live', subtitle: 'Valor, P/L, pesos', route: '/portfolio' },
  { code: 'DSC', title: 'Discovery', subtitle: 'Fuerza y rachas', route: '/discovery' },
  { code: 'RSK', title: 'Downside Radar', subtitle: 'Deterioro temprano', route: '/radar' },
  { code: 'SCT', title: 'Sectores', subtitle: 'Exposición y concentración', route: '/sectors' },
  { code: 'WCH', title: 'Watchlist', subtitle: 'Candidatos persistidos', route: '/watchlist' },
] as const;

const secondary = [
  { title: 'Evidence Ω', route: '/evidence' },
  { title: 'Decision Log', route: '/daily-intelligence' },
  { title: 'Audit History', route: '/audit' },
  { title: 'Gemelo Digital', route: '/digital-twin' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [counts, setCounts] = useState<Dashboard>({ positions: 0, watchlist: 0, evidence: 0, signals: 0, audit: 0 });
  const [gate, setGate] = useState<FunctionalGateResult | null>(null);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [apiError, setApiError] = useState('');

  const load = useCallback(async () => {
    const [positions, watches, evidences, signals, audits, gateRows] = await Promise.all([
      db.select().from(position), db.select().from(watchlist), db.select().from(evidence), db.select().from(radar), db.select().from(auditLog), db.select().from(settings).where(eq(settings.key, MOBILE_FUNCTIONAL_GATE_KEY)).limit(1),
    ]);
    setCounts({ positions: positions.length, watchlist: watches.length, evidence: evidences.length, signals: signals.length, audit: audits.length });
    const rawGate = gateRows[0]?.valueJson;
    if (rawGate) try { setGate(JSON.parse(rawGate) as FunctionalGateResult); } catch { setGate(null); }
    try {
      setHealth(await AtlasApi.health());
      setApiError('');
    } catch (error) {
      setHealth(null);
      setApiError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const countFor = (code: string) => code === 'PRT' ? counts.positions : code === 'WCH' ? counts.watchlist : code === 'RSK' ? counts.signals : undefined;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topline}>
        <View><Text style={styles.brand}>ATLAS Ω</Text><Text style={styles.product}>PERSONAL INVESTMENT INTELLIGENCE</Text></View>
        <View style={[styles.connection, health?.ok ? styles.online : styles.offline]}><View style={[styles.dot, health?.ok ? styles.dotOnline : styles.dotOffline]} /><Text style={styles.connectionText}>{health?.ok ? 'API ONLINE' : 'API OFFLINE'}</Text></View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>COMMAND CENTER</Text>
        <Text style={styles.heroTitle}>Auditar. Vigilar. Descubrir.</Text>
        <Text style={styles.heroText}>Cartera live, rachas, sectores, riesgo temprano, evidencia primaria y auditorías versionadas en una sola terminal.</Text>
        <View style={styles.statusLine}>
          <Status label="RUNTIME" value={gate?.ok ? 'PASS' : 'CHECK'} ok={gate?.ok} />
          <Status label="FINNHUB" value={health?.providers.finnhub || '—'} ok={health?.providers.finnhub === 'CONFIGURED'} />
          <Status label="EDGAR" value={health?.providers.secEdgar || '—'} ok={health?.providers.secEdgar === 'CONFIGURED'} />
        </View>
      </View>

      {apiError ? <View style={styles.apiWarning}><Text style={styles.apiWarningTitle}>BACKEND NOT CONNECTED</Text><Text style={styles.apiWarningText}>{apiError}</Text></View> : null}

      <View style={styles.kpis}>
        <Kpi label="PORTFOLIO" value={counts.positions} />
        <Kpi label="WATCHLIST" value={counts.watchlist} />
        <Kpi label="EVIDENCE" value={counts.evidence} />
        <Kpi label="ALERTS" value={counts.signals} />
      </View>

      <Text style={styles.section}>INTELLIGENCE</Text>
      <View style={styles.grid}>
        {primary.map((item) => (
          <Pressable
            key={item.code}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.title}`}
            onPress={() => router.push(item.route)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardTop}><Text style={styles.code}>{item.code}</Text>{countFor(item.code) != null ? <Text style={styles.count}>{countFor(item.code)}</Text> : null}</View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
            <Text style={styles.arrow}>↗</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>GOVERNANCE & MEMORY</Text>
      <View style={styles.list}>
        {secondary.map((item) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.title}`}
            onPress={() => router.push(item.route)}
            style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}
          >
            <Text style={styles.listText}>{item.title}</Text><Text style={styles.listArrow}>›</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>CORE RULES</Text>
        <Text style={styles.footerText}>MARKET DATA = SENSOR · EVIDENCE = SOURCE OF TRUTH · AI ≠ EVIDENCE · PRICE ≠ THESIS FALSIFIER</Text>
        <Text style={styles.footerMeta}>Runtime gate validates execution. Semantic gate validates known-value cases. Canonical scores remain locked without reproducible engine code.</Text>
      </View>
    </ScrollView>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <View style={styles.kpi}><Text style={styles.kpiValue}>{value}</Text><Text style={styles.kpiLabel}>{label}</Text></View>;
}
function Status({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return <View style={styles.status}><Text style={styles.statusLabel}>{label}</Text><Text style={[styles.statusValue, ok ? styles.good : undefined]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05080c' },
  content: { padding: 14, paddingBottom: 46, gap: 12 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: '#f0f5f8', fontSize: 24, fontWeight: '950', letterSpacing: 1.6 },
  product: { color: '#536678', fontSize: 7, fontWeight: '950', letterSpacing: 1.8, marginTop: 2 },
  connection: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 },
  online: { backgroundColor: '#091814', borderColor: '#1e4e3d' },
  offline: { backgroundColor: '#180d10', borderColor: '#54202a' },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotOnline: { backgroundColor: '#4ddca2' },
  dotOffline: { backgroundColor: '#ff6c7e' },
  connectionText: { color: '#7e91a3', fontSize: 7, fontWeight: '950' },
  hero: { backgroundColor: '#081018', borderWidth: 1, borderColor: '#183044', borderRadius: 11, padding: 15, gap: 7 },
  heroEyebrow: { color: '#64d8ff', fontSize: 8, fontWeight: '950', letterSpacing: 1.4 },
  heroTitle: { color: '#edf4f8', fontSize: 26, fontWeight: '950', letterSpacing: -0.5 },
  heroText: { color: '#778b9d', fontSize: 11, lineHeight: 17, maxWidth: 470 },
  statusLine: { flexDirection: 'row', gap: 6, marginTop: 4 },
  status: { flex: 1, backgroundColor: '#090f15', borderRadius: 6, padding: 7, borderWidth: 1, borderColor: '#17232f' },
  statusLabel: { color: '#4e6173', fontSize: 6, fontWeight: '950' },
  statusValue: { color: '#8c9cab', fontSize: 8, fontWeight: '950', marginTop: 2 },
  good: { color: '#50dba3' },
  apiWarning: { borderWidth: 1, borderColor: '#5a421b', backgroundColor: '#181208', borderRadius: 8, padding: 10 },
  apiWarningTitle: { color: '#ddba59', fontSize: 8, fontWeight: '950' },
  apiWarningText: { color: '#917b49', fontSize: 9, lineHeight: 14, marginTop: 3 },
  kpis: { flexDirection: 'row', gap: 5 },
  kpi: { flex: 1, backgroundColor: '#090e14', borderWidth: 1, borderColor: '#17222e', borderRadius: 8, padding: 9 },
  kpiValue: { color: '#d7e1e9', fontSize: 20, fontWeight: '950' },
  kpiLabel: { color: '#506274', fontSize: 6, fontWeight: '950', marginTop: 3 },
  section: { color: '#566a7d', fontSize: 8, fontWeight: '950', letterSpacing: 1.3, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  card: { width: '48.9%', minHeight: 116, backgroundColor: '#090e14', borderWidth: 1, borderColor: '#17222e', borderRadius: 9, padding: 11, position: 'relative' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  code: { color: '#5ecfea', fontSize: 8, fontWeight: '950', letterSpacing: 1 },
  count: { color: '#667b8e', fontSize: 8, fontWeight: '900' },
  cardTitle: { color: '#dce6ed', fontSize: 14, fontWeight: '950', marginTop: 12 },
  cardSub: { color: '#607285', fontSize: 9, marginTop: 3 },
  arrow: { position: 'absolute', bottom: 9, right: 10, color: '#405467', fontSize: 15 },
  pressed: { opacity: 0.6 },
  list: { borderWidth: 1, borderColor: '#17222e', borderRadius: 9, overflow: 'hidden' },
  listRow: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#111b24', backgroundColor: '#090e14' },
  listText: { color: '#9aacbb', fontSize: 11, fontWeight: '800' },
  listArrow: { color: '#4d6072', fontSize: 20 },
  footerCard: { borderWidth: 1, borderColor: '#26351e', backgroundColor: '#0d130c', borderRadius: 9, padding: 11, gap: 4 },
  footerTitle: { color: '#9fb86d', fontSize: 8, fontWeight: '950' },
  footerText: { color: '#768b63', fontSize: 8, lineHeight: 13, fontWeight: '800' },
  footerMeta: { color: '#526047', fontSize: 8, lineHeight: 13 },
});
