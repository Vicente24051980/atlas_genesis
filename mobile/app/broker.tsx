import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrokerApi, BrokerEnvelope, BrokerStatus } from '../core/api/brokerApi';
import { BrokerSession } from '../core/security/brokerSession';

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
  const [sessionSaved, setSessionSaved] = useState(false);

  const loadStatus = async () => {
    try {
      setStatus(await BrokerApi.status());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  useEffect(() => {
    void loadStatus();
    void BrokerSession.getControlToken().then((token) => {
      if (token) {
        setControlToken(token);
        setSessionSaved(true);
      }
    });
  }, []);

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
    const success = [accountResult, positionsResult, ordersResult].some((item) => item.status === 'fulfilled');
    if (success) {
      try {
        await BrokerSession.saveControlToken(controlToken);
        setSessionSaved(true);
      } catch (cause) {
        failures.push(cause instanceof Error ? cause.message : String(cause));
      }
    }
    if (failures.length) setError(failures.join('\n'));
    setLoading(false);
  };

  const forgetSession = async () => {
    await BrokerSession.clearControlToken();
    setControlToken('');
    setSessionSaved(false);
    setAccount(null);
    setPositions(null);
    setOrders(null);
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
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>← Terminal</Text></Pressable>
      <Text style={styles.eyebrow}>BROKER Ω · TRADING 212</Text>
      <Text style={styles.title}>Cuenta conectada</Text>
      <Text style={styles.subtitle}>Bridge server-side. La APK no contiene tu API key ni tu API secret de Trading 212. El token de control puede guardarse cifrado en SecureStore para cargar la cartera automáticamente al abrir ATLAS.</Text>

      <View style={styles.card}>
        <Row label="Bridge" value={status ? 'ONLINE' : 'CONECTANDO'} good={Boolean(status)} />
        <Row label="Entorno" value={status ? `${status.environment.toUpperCase()} · ${status.mode}` : '—'} />
        <Row label="Credenciales" value={status?.credentialsConfigured ? 'CONFIGURADAS' : 'PENDIENTES EN SERVIDOR'} good={status?.credentialsConfigured} />
        <Row label="Lectura" value={status?.readReady ? 'LISTA' : 'BLOQUEADA'} good={status?.readReady} />
        <Row label="Sesión local" value={sessionSaved ? 'CIFRADA EN DISPOSITIVO' : 'NO GUARDADA'} good={sessionSaved} />
        <Row label="Órdenes live" value={status?.liveExecutionLocked === false ? 'HABILITADAS' : 'BLOQUEADAS'} good={status?.liveExecutionLocked !== false} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ACCESO PRIVADO</Text>
        <TextInput accessibilityLabel="Token de control ATLAS Broker" value={controlToken} onChangeText={setControlToken} secureTextEntry autoCapitalize="none" autoCorrect={false} placeholder="ATLAS_BROKER_CONTROL_TOKEN" placeholderTextColor="#64748b" style={styles.input} />
        <Pressable accessibilityRole="button" accessibilityLabel="Sincronizar cuenta" onPress={() => { void syncPrivate(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>SINCRONIZAR + GUARDAR SESIÓN</Text></Pressable>
        {sessionSaved ? <Pressable onPress={() => { void forgetSession(); }} style={({ pressed }) => [styles.forgetButton, pressed && styles.pressed]}><Text style={styles.forgetText}>OLVIDAR TOKEN LOCAL</Text></Pressable> : null}
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#53efbd" /><Text style={styles.muted}>Consultando Trading 212…</Text></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {account ? <JsonCard title="ACCOUNT SUMMARY" envelope={account} /> : null}
      {positions ? <JsonCard title="POSITIONS" envelope={positions} /> : null}
      {orders ? <JsonCard title="PENDING ORDERS" envelope={orders} /> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>INSTRUMENTOS TRADING 212</Text>
        <TextInput accessibilityLabel="Buscar instrumento Trading 212" value={query} onChangeText={setQuery} autoCapitalize="characters" autoCorrect={false} placeholder="AAPL / ASML / TSM" placeholderTextColor="#64748b" style={styles.input} returnKeyType="search" onSubmitEditing={() => { void search(); }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar instrumento" onPress={() => { void search(); }} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryText}>BUSCAR TICKER EXACTO T212</Text></Pressable>
        {instruments ? <Text style={styles.jsonText}>{prettyJson(instruments.data)}</Text> : null}
      </View>

      <View style={styles.guardrailCard}>
        <Text style={styles.guardrailTitle}>EXECUTION GUARDRAIL</Text>
        <Text style={styles.guardrailText}>SecureStore guarda sólo el token de control local. Las credenciales de Trading 212 permanecen server-side. LIVE sigue fail-closed y ninguna señal ATLAS puede ejecutar una orden automáticamente.</Text>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={[styles.value, good === true && styles.good, good === false && styles.warn]}>{value}</Text></View>; }
function JsonCard({ title, envelope }: { title: string; envelope: BrokerEnvelope }) { return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.rate}>Rate remaining: {envelope.rateLimit?.remaining ?? 'N/D'} · reset: {envelope.rateLimit?.reset ?? 'N/D'}</Text><Text style={styles.jsonText}>{prettyJson(envelope.data)}</Text></View>; }
function prettyJson(value: unknown): string { try { const text = JSON.stringify(value, null, 2); return text.length > 6000 ? `${text.slice(0, 6000)}\n…` : text; } catch { return String(value); } }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingTop: 18, paddingHorizontal: 12, paddingBottom: 34, gap: 12 },
  back: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 14 }, backText: { color: '#65ddb9', fontFamily: 'monospace', fontWeight: '800', fontSize: 9 },
  eyebrow: { color: '#5f7379', fontFamily: 'monospace', fontWeight: '900', fontSize: 8, letterSpacing: 1.1 }, title: { color: '#eff5f3', fontFamily: 'monospace', fontSize: 26, fontWeight: '900' }, subtitle: { color: '#819097', lineHeight: 18, fontSize: 11 },
  card: { backgroundColor: '#080d0f', borderWidth: 1, borderColor: '#213138', padding: 12, gap: 10 }, cardTitle: { color: '#b8c5c1', fontFamily: 'monospace', fontWeight: '900', fontSize: 8, letterSpacing: 1 },
  row: { gap: 3, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1b292e', paddingBottom: 8 }, label: { color: '#526168', fontSize: 8, fontFamily: 'monospace', fontWeight: '800', textTransform: 'uppercase' }, value: { color: '#dce6e2', fontFamily: 'monospace', fontWeight: '800', fontSize: 9 }, good: { color: '#4de7b4' }, warn: { color: '#ddb95f' },
  input: { backgroundColor: '#050809', borderWidth: 1, borderColor: '#2c3a40', color: '#eef5f3', paddingHorizontal: 12, paddingVertical: 12, fontFamily: 'monospace' }, button: { backgroundColor: '#0b2b21', borderWidth: 1, borderColor: '#2f725b', paddingVertical: 13, alignItems: 'center' }, buttonText: { color: '#65e9bd', fontFamily: 'monospace', fontWeight: '900', fontSize: 9 }, forgetButton: { borderWidth: 1, borderColor: '#55383a', paddingVertical: 10, alignItems: 'center' }, forgetText: { color: '#c78084', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, secondaryButton: { borderWidth: 1, borderColor: '#315b75', paddingVertical: 12, alignItems: 'center' }, secondaryText: { color: '#8bc8eb', fontFamily: 'monospace', fontWeight: '900', fontSize: 8 },
  pressed: { opacity: 0.68 }, loading: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 8 }, muted: { color: '#7e8c91', fontFamily: 'monospace', fontSize: 9 }, error: { color: '#e79a9a', backgroundColor: '#1d0e10', padding: 11, fontSize: 10 }, rate: { color: '#56656b', fontSize: 8, fontFamily: 'monospace' }, jsonText: { color: '#b8c6c2', fontFamily: 'monospace', fontSize: 9, lineHeight: 14 },
  guardrailCard: { backgroundColor: '#0b1013', borderTopWidth: 1, borderTopColor: '#223039', padding: 12, gap: 7 }, guardrailTitle: { color: '#8ba9c0', fontFamily: 'monospace', fontWeight: '900', fontSize: 8, letterSpacing: 1 }, guardrailText: { color: '#7e8d92', lineHeight: 16, fontSize: 10 },
});
