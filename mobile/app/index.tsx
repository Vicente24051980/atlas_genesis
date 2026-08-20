import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MobileApi, MobileHealth } from '../core/api/mobileApi';

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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor="#45e8b4" />}
    >
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.eyebrow}>ATLAS Ω · TERMINAL COCKPIT</Text>
          <Text style={styles.title}>Investment OS</Text>
        </View>
        <View style={[styles.engineBadge, online ? styles.engineOnline : styles.engineOffline]}>
          <View style={[styles.engineDot, online ? styles.dotOnline : styles.dotOffline]} />
          <Text style={styles.engineText}>{online ? 'ENGINE ONLINE' : health ? 'DEGRADED' : 'CONNECTING'}</Text>
        </View>
      </View>

      <View style={styles.statusStrip}>
        <StatusCell label="DATA PROVIDER" value={provider} tone={online ? 'good' : 'neutral'} />
        <StatusCell label="FINANCIALDATA.NET" value={health?.financialdatanet_configured ? 'READY' : 'GATE'} tone={health?.financialdatanet_configured ? 'good' : 'warn'} />
        <StatusCell label="FINNHUB" value={health?.finnhub_configured ? 'FALLBACK READY' : 'OFF'} tone={health?.finnhub_configured ? 'good' : 'neutral'} />
      </View>

      {error ? <View style={styles.errorPanel}><Text style={styles.errorText}>BACKEND · {error}</Text></View> : null}
      {!health && !error ? <View style={styles.loading}><ActivityIndicator color="#45e8b4" /><Text style={styles.loadingText}>SYNCING ATLAS RUNTIME…</Text></View> : null}

      <SectionHeader code="01" title="Priority Stack" />
      <View style={styles.stack}>
        <PriorityRow rank="01" title="Evidence integrity" detail="Evidence Director → specialist engines → Falsifiers Ω → decision." state="ACTIVE" route="/workspace/atlas" />
        <PriorityRow rank="02" title="Market rotation" detail="Current-flow questions route through Money Rotation Ω before quality filters." state="ACTIVE" route="/workspace/markets" />
        <PriorityRow rank="03" title="Execution safety" detail="Trading 212 remains demo/paper-first; live execution is fail-closed." state="GATED" route="/workspace/orders" />
        <PriorityRow rank="04" title="Provider certification" detail="Uncertified feeds remain DATA GATE instead of becoming fabricated numbers." state="GATED" route="/settings" />
      </View>

      <SectionHeader code="02" title="Workspaces" />
      <View style={styles.tiles}>
        <WorkspaceTile code="MKT" title="Markets" meta="Rotation · macro · movers" route="/workspace/markets" />
        <WorkspaceTile code="PORT" title="Portfolio" meta="Positions · exposure · P&L" route="/portfolio" />
        <WorkspaceTile code="Ω" title="ATLAS" meta="Engines · evidence · falsifiers" route="/workspace/atlas" />
        <WorkspaceTile code="SCR" title="Screener" meta="Universes · GREEN · Return" route="/workspace/screener" />
        <WorkspaceTile code="RSR" title="Research" meta="Firecrawl · clinical · CAPEX" route="/workspace/research" />
        <WorkspaceTile code="ORD" title="Orders" meta="T212 · ticket · history" route="/workspace/orders" />
      </View>

      <SectionHeader code="03" title="Security Hub" />
      <Pressable onPress={() => router.push('/analyze' as never)} style={({ pressed }) => [styles.securityHub, pressed && styles.pressed]}>
        <View style={styles.securityCode}><Text style={styles.securityCodeText}>SEC</Text></View>
        <View style={styles.securityText}>
          <Text style={styles.securityTitle}>Ticker-first analysis</Text>
          <Text style={styles.securityMeta}>Company data · CAPEX chain · provenance · no fabricated scores</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Pressable>

      <View style={styles.ruleBar}>
        <Text style={styles.ruleCode}>RULE</Text>
        <Text style={styles.ruleText}>EVIDENCE &gt; NARRATIVE · PRICE ≠ EVIDENCE · MISSING DATA = GATE</Text>
      </View>
    </ScrollView>
  );
}

function SectionHeader({ code, title }: { code: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionCode}>{code}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function StatusCell({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' | 'neutral' }) {
  return (
    <View style={styles.statusCell}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, tone === 'good' ? styles.good : tone === 'warn' ? styles.warn : styles.neutral]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function PriorityRow({ rank, title, detail, state, route }: { rank: string; title: string; detail: string; state: 'ACTIVE' | 'GATED'; route: string }) {
  return (
    <Pressable onPress={() => router.push(route as never)} style={({ pressed }) => [styles.priorityRow, pressed && styles.pressed]}>
      <Text style={styles.rank}>{rank}</Text>
      <View style={styles.priorityText}>
        <Text style={styles.priorityTitle}>{title}</Text>
        <Text style={styles.priorityDetail}>{detail}</Text>
      </View>
      <View style={[styles.stateBadge, state === 'ACTIVE' ? styles.stateActive : styles.stateGated]}><Text style={styles.stateText}>{state}</Text></View>
    </Pressable>
  );
}

function WorkspaceTile({ code, title, meta, route }: { code: string; title: string; meta: string; route: string }) {
  return (
    <Pressable onPress={() => router.push(route as never)} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <Text style={styles.tileCode}>{code}</Text>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileMeta}>{meta}</Text>
      <Text style={styles.tileArrow}>OPEN →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' },
  content: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 22, gap: 10 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1a262b' },
  eyebrow: { color: '#607278', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: '#eef5f2', fontFamily: 'monospace', fontSize: 24, fontWeight: '900', marginTop: 2 },
  engineBadge: { marginLeft: 'auto', minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 8 },
  engineOnline: { borderColor: '#23634f', backgroundColor: '#07150f' },
  engineOffline: { borderColor: '#5e3535', backgroundColor: '#170b0b' },
  engineDot: { width: 6, height: 6, borderRadius: 99 },
  dotOnline: { backgroundColor: '#38e7aa' },
  dotOffline: { backgroundColor: '#ef7676' },
  engineText: { color: '#b9c9c3', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  statusStrip: { flexDirection: 'row', borderWidth: 1, borderColor: '#1a282d', backgroundColor: '#080d0f' },
  statusCell: { flex: 1, minWidth: 0, paddingHorizontal: 8, paddingVertical: 8, borderRightWidth: 1, borderRightColor: '#172328' },
  statusLabel: { color: '#506168', fontFamily: 'monospace', fontSize: 6, fontWeight: '900', letterSpacing: 0.7 },
  statusValue: { marginTop: 3, fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  good: { color: '#49e8b7' },
  warn: { color: '#e0b761' },
  neutral: { color: '#87969b' },
  errorPanel: { borderWidth: 1, borderColor: '#653333', backgroundColor: '#190b0b', padding: 9 },
  errorText: { color: '#ee9999', fontFamily: 'monospace', fontSize: 8, lineHeight: 13 },
  loading: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#1a282d' },
  loadingText: { color: '#687b82', fontFamily: 'monospace', fontSize: 8, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  sectionCode: { color: '#41e6b2', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  sectionTitle: { color: '#bdc9c6', fontFamily: 'monospace', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#1a262b' },
  stack: { borderWidth: 1, borderColor: '#1a282d', backgroundColor: '#070b0d' },
  priorityRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#152126' },
  rank: { width: 21, color: '#52636a', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  priorityText: { flex: 1, minWidth: 0 },
  priorityTitle: { color: '#dce6e2', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' },
  priorityDetail: { color: '#6c7c82', fontSize: 9, lineHeight: 13, marginTop: 3 },
  stateBadge: { borderWidth: 1, paddingHorizontal: 5, paddingVertical: 3 },
  stateActive: { borderColor: '#245f4d', backgroundColor: '#07140f' },
  stateGated: { borderColor: '#5d4c2d', backgroundColor: '#171208' },
  stateText: { color: '#aab8b4', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tile: { width: '48.8%', minHeight: 112, borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#080d0f', padding: 9 },
  tileCode: { color: '#45e7b3', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  tileTitle: { color: '#e3ebe8', fontFamily: 'monospace', fontSize: 13, fontWeight: '900', marginTop: 8 },
  tileMeta: { color: '#697980', fontSize: 9, lineHeight: 13, marginTop: 4 },
  tileArrow: { color: '#739188', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', marginTop: 'auto', paddingTop: 8 },
  securityHub: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#2a654f', backgroundColor: '#07140f', padding: 9 },
  securityCode: { width: 37, height: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2d6f57' },
  securityCodeText: { color: '#53edbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  securityText: { flex: 1 },
  securityTitle: { color: '#e8f1ed', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' },
  securityMeta: { color: '#708078', fontSize: 9, marginTop: 3 },
  arrow: { color: '#4ce9b7', fontFamily: 'monospace', fontSize: 14 },
  ruleBar: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#1a262b', marginTop: 3 },
  ruleCode: { color: '#4ae8b6', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  ruleText: { flex: 1, color: '#65767c', fontFamily: 'monospace', fontSize: 7, lineHeight: 11 },
  pressed: { opacity: 0.66 },
});
