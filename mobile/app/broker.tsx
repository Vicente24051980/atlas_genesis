import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrokerApi, BrokerEnvelope, BrokerStatus } from '../core/api/brokerApi';

export default function BrokerScreen() {
  const [status, setStatus] = useState<BrokerStatus | null>(null);
  const [controlToken, setControlToken] = useState('');
  const [account, setAccount] = useState<BrokerEnvelope | null>(null);
  const [positions, setPositions] = useState<BrokerEnvelope | null>(null);
  const [orders, setOrders] = useState<BrokerEnvelope | null>(null);
  const [query, setQuery] = useState('');
  const [instruments, setInstruments] = useState<BrokerEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      setStatus(await BrokerApi.status());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  useEffect(() => { void loadStatus(); }, []);

  const syncPrivate = async () => {
    if (!controlToken.trim()) {
      setError('Introduce el token de control ATLAS Broker configurado en el servidor.');
      return;
    }
    setLoading(true);
    setError(null);
    const [accountResult, positionsResult, ordersResult] = await Promise.allSettled([
      BrokerApi.account(controlToken),
      BrokerApi.positions(controlToken),
      BrokerApi.orders(controlToken),
    ]);
    setAccount(accountResult.status === 'fulfilled' ? accountResult.value : null);
    setPositions(positionsResult.status === 'fulfilled' ? positionsResult.value : null);
    setOrders(ordersResult.status === 'fulfilled' ? ordersResult.value : null);
    const failures = [accountResult, positionsResult, ordersResult]
      .filter((item): item is PromiseRejectedResult => item.status === 'rejected')
      .map((item) => item.reason instanceof Error ? item.reason.message : String(item.reason));
    if (failures.length) setError(failures.join('\n'));
    setLoading(false);
  };

  const search = async () => {
    if (!query.trim() || !controlToken.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setInstruments(await BrokerApi.instruments(controlToken, query));
    } catch (cause) {
      setInstruments(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>← Inicio</Text></Pressable>
      <Text style={styles.eyebrow}>BROKER Ω · TRADING 212</Text>
      <Text style={styles.title}>Cuenta conectada</Text>
      <Text style={styles.subtitle}>Bridge server-side. La APK no contiene tu API key ni tu API secret de Trading 212. Esta pantalla es de lectura y verificación.</Text>

      <View style={styles.card}>
        <Row label="Bridge" value={status ? 'ONLINE' : 'CONECTANDO'} good={Boolean(status)} />
        <Row label="Entorno" value={status ? `${status.environment.toUpperCase()} · ${status.mode}` : '—'} />
        <Row label="Credenciales" value={status?.credentialsConfigured ? 'CONFIGURADAS' : 'PENDIENTES EN SERVIDOR'} good={status?.credentialsConfigured} />
        <Row label="Lectura" value={status?.readReady ? 'LISTA' : 'BLOQUEADA'} good={status?.readReady} />
        <Row label="Órdenes live" value={status?.liveExecutionLocked === false ? 'HABILITADAS' : 'BLOQUEADAS'} good={status?.liveExecutionLocked !== false} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ACCESO PRIVADO</Text>
        <TextInput
          accessibilityLabel="Token de control ATLAS Broker"
          value={controlToken}
          onChangeText={setControlToken}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="ATLAS_BROKER_CONTROL_TOKEN"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Sincronizar cuenta" onPress={() => { void syncPrivate(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>SINCRONIZAR CUENTA</Text>
        </Pressable>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#7dd3fc" /><Text style={styles.muted}>Consultando Trading 212…</Text></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {account ? <JsonCard title="ACCOUNT SUMMARY" envelope={account} /> : null}
      {positions ? <JsonCard title="POSITIONS" envelope={positions} /> : null}
      {orders ? <JsonCard title="PENDING ORDERS" envelope={orders} /> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>INSTRUMENTOS TRADING 212</Text>
        <TextInput
          accessibilityLabel="Buscar instrumento Trading 212"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="AAPL / ASML / TSM"
          placeholderTextColor="#64748b"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => { void search(); }}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar instrumento" onPress={() => { void search(); }} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>BUSCAR TICKER EXACTO T212</Text>
        </Pressable>
        {instruments ? <Text style={styles.jsonText}>{prettyJson(instruments.data)}</Text> : null}
      </View>

      <View style={styles.guardrailCard}>
        <Text style={styles.guardrailTitle}>EXECUTION GUARDRAIL</Text>
        <Text style={styles.guardrailText}>La infraestructura market/limit/stop/stop-limit está preparada en el backend, pero esta pantalla no ofrece botones de ejecución. LIVE permanece bloqueado por defecto y nunca se activa por una señal de inversión automáticamente.</Text>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={[styles.value, good === true && styles.good, good === false && styles.warn]}>{value}</Text></View>;
}

function JsonCard({ title, envelope }: { title: string; envelope: BrokerEnvelope }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.rate}>Rate remaining: {envelope.rateLimit?.remaining ?? 'N/D'} · reset: {envelope.rateLimit?.reset ?? 'N/D'}</Text>
      <Text style={styles.jsonText}>{prettyJson(envelope.data)}</Text>
    </View>
  );
}

function prettyJson(value: unknown): string {
  try {
    const text = JSON.stringify(value, null, 2);
    return text.length > 6000 ? `${text.slice(0, 6000)}\n…` : text;
  } catch {
    return String(value);
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#07090d' },
  content: { paddingTop: 54, paddingHorizontal: 18, paddingBottom: 44, gap: 12 },
  back: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 14 },
  backText: { color: '#7dd3fc', fontWeight: '800' },
  eyebrow: { color: '#7dd3fc', fontWeight: '900', fontSize: 12, letterSpacing: 1.1 },
  title: { color: '#f8fafc', fontSize: 31, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 21 },
  card: { backgroundColor: '#0f141c', borderRadius: 16, borderWidth: 1, borderColor: '#223047', padding: 14, gap: 10 },
  cardTitle: { color: '#cbd5e1', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  row: { gap: 3, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#253044', paddingBottom: 8 },
  label: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  value: { color: '#e2e8f0', fontWeight: '800' },
  good: { color: '#34d399' },
  warn: { color: '#fbbf24' },
  input: { backgroundColor: '#070a0f', borderRadius: 12, borderWidth: 1, borderColor: '#334155', color: '#f8fafc', paddingHorizontal: 14, paddingVertical: 13 },
  button: { backgroundColor: '#0ea5e9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#03111a', fontWeight: '900' },
  secondaryButton: { borderWidth: 1, borderColor: '#0ea5e9', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  secondaryText: { color: '#7dd3fc', fontWeight: '900' },
  pressed: { opacity: 0.7 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 8 },
  muted: { color: '#94a3b8' },
  error: { color: '#fca5a5', backgroundColor: '#241318', padding: 13, borderRadius: 12 },
  rate: { color: '#64748b', fontSize: 11 },
  jsonText: { color: '#cbd5e1', fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
  guardrailCard: { backgroundColor: '#111827', borderRadius: 14, padding: 14, gap: 7 },
  guardrailTitle: { color: '#a5b4fc', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  guardrailText: { color: '#cbd5e1', lineHeight: 19 },
});
