import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrokerApi, BrokerStatus } from '../core/api/brokerApi';
import { apiBaseUrl, MobileApi, MobileHealth } from '../core/api/mobileApi';

export default function SettingsScreen() {
  const [health, setHealth] = useState<MobileHealth | null>(null);
  const [broker, setBroker] = useState<BrokerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [healthResult, brokerResult] = await Promise.allSettled([MobileApi.health(), BrokerApi.status()]);
    setHealth(healthResult.status === 'fulfilled' ? healthResult.value : null);
    setBroker(brokerResult.status === 'fulfilled' ? brokerResult.value : null);
    const failures: string[] = [];
    if (healthResult.status === 'rejected') failures.push(healthResult.reason instanceof Error ? healthResult.reason.message : String(healthResult.reason));
    if (brokerResult.status === 'rejected') failures.push(`T212: ${brokerResult.reason instanceof Error ? brokerResult.reason.message : String(brokerResult.reason)}`);
    if (failures.length) setError(failures.join('\n'));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.codeBox}><Text style={styles.code}>SYS</Text></View>
        <View style={styles.flex}><Text style={styles.eyebrow}>ATLAS Ω · SYSTEM</Text><Text style={styles.title}>System status</Text><Text style={styles.subtitle}>Provider keys stay server-side. Mobile receives only certified API responses.</Text></View>
      </View>

      <TerminalPanel title="DATA / EVIDENCE">
        <Row label="Backend" value={apiBaseUrl()} />
        <Row label="Service" value={health?.service || 'DATA GATE'} />
        <Row label="Version" value={health?.version || '—'} />
        <Row label="Preferred provider" value={health?.preferred_provider || '—'} />
        <Row label="FinancialData.Net" value={health?.financialdatanet_configured ? 'READY' : 'SERVER GATE'} tone={health?.financialdatanet_configured ? 'good' : 'warn'} />
        <Row label="Finnhub fallback" value={health?.finnhub_configured ? 'READY' : 'NOT CONFIGURED'} tone={health?.finnhub_configured ? 'good' : 'neutral'} />
        <Row label="Firecrawl" value="SERVER SECRET · APK EXCLUDED" tone="good" />
      </TerminalPanel>

      <TerminalPanel title="TRADING 212 · READ BRIDGE">
        <Row label="Bridge" value={broker ? 'ONLINE' : 'NO RESPONSE'} tone={broker ? 'good' : 'warn'} />
        <Row label="API" value={broker?.apiVersion || 'v0 beta'} />
        <Row label="Environment" value={broker ? `${broker.environment.toUpperCase()} · ${broker.mode}` : '—'} />
        <Row label="Credentials" value={broker?.credentialsConfigured ? 'SERVER-SIDE READY' : 'SERVER GATE'} tone={broker?.credentialsConfigured ? 'good' : 'warn'} />
        <Row label="Read account/positions" value={broker?.readReady ? 'READY' : 'BLOCKED'} tone={broker?.readReady ? 'good' : 'warn'} />
        <Row label="Live execution" value={broker?.liveExecutionLocked === false ? 'SERVER FLAG OPEN' : 'LOCKED'} tone={broker?.liveExecutionLocked === false ? 'warn' : 'good'} />
        <Row label="Broker-key policy" value="READ ONLY AT SOURCE" tone="good" />
      </TerminalPanel>

      <TerminalPanel title="AUDIT GOVERNANCE">
        <Row label="Engine order" value="GREEN FIRST → FULL SWEEP" tone="good" />
        <Row label="GREEN quorum" value=">=3 PROVIDERS / SAME CUT" tone="good" />
        <Row label="Falsifiers" value="INDEPENDENT VETO" tone="good" />
        <Row label="Final authority" value="INVESTMENT COMMITTEE Ω" tone="good" />
        <Row label="Missing evidence" value="DATA GATE · NEVER FABRICATED" tone="good" />
      </TerminalPanel>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#54efbd" /><Text style={styles.muted}>RECHECKING SYSTEM…</Text></View> : null}
      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}

      <Pressable onPress={() => { void load(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>RECHECK SYSTEM</Text></Pressable>

      <View style={styles.rule}><Text style={styles.ruleCode}>SECURITY</Text><Text style={styles.ruleText}>NO PROVIDER SECRET IN APK · T212 READ ONLY · FIRECRAWL ACQUISITION ≠ EVIDENCE SOURCE · EXECUTION FAIL-CLOSED</Text></View>
    </ScrollView>
  );
}

function TerminalPanel({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.panel}><View style={styles.panelHeader}><Text style={styles.panelTitle}>{title}</Text></View>{children}</View>;
}
function Row({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'good' | 'warn' | 'neutral' }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={[styles.value, tone === 'good' ? styles.good : tone === 'warn' ? styles.warn : styles.neutral]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 28, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#1a262b', paddingBottom: 10 }, codeBox: { width: 42, height: 42, borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', alignItems: 'center', justifyContent: 'center' }, code: { color: '#54efbd', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, flex: { flex: 1 }, eyebrow: { color: '#607278', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, title: { color: '#eef5f2', fontFamily: 'monospace', fontSize: 22, fontWeight: '900', marginTop: 2 }, subtitle: { color: '#596b70', fontSize: 9, marginTop: 3 },
  panel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#070c0e' }, panelHeader: { paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1b292e', backgroundColor: '#080d0f' }, panelTitle: { color: '#54efbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  row: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#10191c' }, label: { width: 120, color: '#53646a', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', textTransform: 'uppercase' }, value: { flex: 1, textAlign: 'right', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, good: { color: '#4de7b4' }, warn: { color: '#d3b45d' }, neutral: { color: '#829095' },
  loading: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 9 }, muted: { color: '#718087', fontFamily: 'monospace', fontSize: 8 }, error: { borderWidth: 1, borderColor: '#633535', backgroundColor: '#160909', padding: 10 }, errorText: { color: '#d98c8c', fontSize: 9 },
  button: { minHeight: 40, borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#54efbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, pressed: { opacity: 0.68 },
  rule: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#1a2428', paddingTop: 9 }, ruleCode: { color: '#54efbd', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, ruleText: { flex: 1, color: '#627277', fontFamily: 'monospace', fontSize: 7, lineHeight: 12 },
});
