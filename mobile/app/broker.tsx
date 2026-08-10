import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AtlasOnlineApi, atlasApiBaseUrl, type BrokerStatus } from '../core/api/atlasOnlineApi';

export default function BrokerScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<BrokerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setStatus(await AtlasOnlineApi.brokerStatus());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const configured = Boolean(status?.configured);
  const live = status?.mode === 'LIVE';
  const liveLocked = live && !status?.liveTradingEnabled;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View><Text style={styles.brand}>BROKER Ω</Text><Text style={styles.subbrand}>TRADING 212 · SECURE ADAPTER</Text></View>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator size="large" color="#2ed19a" /><Text style={styles.loadingText}>Comprobando conexión segura…</Text></View> : null}

      {!loading ? (
        <View style={[styles.statusCard, configured ? styles.connectedCard : styles.disconnectedCard]}>
          <Text style={styles.label}>ESTADO</Text>
          <Text style={[styles.big, configured ? styles.connected : styles.disconnected]}>{configured ? 'CONECTADO' : 'NO CONECTADO'}</Text>
          <Text style={styles.statusLine}>{status ? `${status.provider} · ${status.mode} · ${status.environment.toUpperCase()}` : 'Trading 212'}</Text>
          <Text style={styles.statusMeta}>{configured ? 'Credenciales detectadas en backend.' : 'Faltan credenciales o token de control en el servidor.'}</Text>
        </View>
      ) : null}

      {error ? <View style={styles.error}><Text style={styles.errorTitle}>BROKER API NO DISPONIBLE</Text><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>REINTENTAR</Text></Pressable></View> : null}

      <View style={styles.card}>
        <Text style={styles.label}>SEGURIDAD</Text>
        <StatusRow label="Claves dentro del APK" value="NO" positive />
        <StatusRow label="Control token manual en móvil" value="ELIMINADO" positive />
        <StatusRow label="Entorno" value={status?.environment?.toUpperCase() || '—'} />
        <StatusRow label="Modo" value={status?.mode || '—'} />
        <StatusRow label="LIVE servidor" value={status?.liveTradingEnabled ? 'HABILITADO' : 'BLOQUEADO'} positive={!status?.liveTradingEnabled} warning={status?.liveTradingEnabled} />
      </View>

      {!configured ? (
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>CONFIGURACIÓN SERVER-SIDE NECESARIA</Text>
          <Text style={styles.setupText}>Render debe tener TRADING212_API_KEY, TRADING212_API_SECRET y ATLAS_BROKER_CONTROL_TOKEN. La app no vuelve a pedirte que pegues tokens ni claves en una pantalla.</Text>
          <Text style={styles.setupText}>Hasta que el backend confirme la conexión, órdenes y posiciones privadas permanecen cerradas.</Text>
        </View>
      ) : (
        <View style={styles.readyCard}>
          <Text style={styles.readyTitle}>BROKER ADAPTER READY</Text>
          <Text style={styles.readyText}>La conexión está preparada en servidor. La cartera ATLAS permanece separada de la ejecución: una decisión COMPRAR/AÑADIR nunca genera una orden automática.</Text>
          {liveLocked ? <Text style={styles.liveLocked}>LIVE está bloqueado server-side. Correcto para validación.</Text> : null}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>ARQUITECTURA DE EJECUCIÓN</Text>
        <Flow number="1" title="ATLAS analiza" text="Ticker → Quality → Growth → CAPEX → Valuation → Risk → Catalysts → acción." />
        <Flow number="2" title="Usuario decide" text="La salida COMPRAR / AÑADIR / MANTENER / ESPERAR / REVISAR no equivale a una orden." />
        <Flow number="3" title="Broker valida" text="Trading 212 solo recibe una orden desde una superficie autenticada y con guardrails de entorno." />
      </View>

      <View style={styles.backend}><Text style={styles.backendLabel}>BACKEND</Text><Text style={styles.backendValue}>{atlasApiBaseUrl()}</Text></View>

      <View style={styles.guardrail}>
        <Text style={styles.guardrailTitle}>GUARDRAIL Ω</Text>
        <Text style={styles.guardrailText}>No hay credenciales de Trading 212 en el APK. No se expone un token privado en una caja de texto. LIVE permanece bloqueado salvo activación explícita en servidor. ATLAS nunca convierte una recomendación del algoritmo en una orden automática.</Text>
      </View>
    </ScrollView>
  );
}

function StatusRow({ label, value, positive = false, warning = false }: { label: string; value: string; positive?: boolean; warning?: boolean }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={[styles.rowValue, positive && styles.connected, warning && styles.warning]}>{value}</Text></View>;
}

function Flow({ number, title, text }: { number: string; title: string; text: string }) {
  return <View style={styles.flow}><View style={styles.flowNumber}><Text style={styles.flowNumberText}>{number}</Text></View><View style={styles.flex}><Text style={styles.flowTitle}>{title}</Text><Text style={styles.flowText}>{text}</Text></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { padding: 18, paddingBottom: 58, gap: 12 }, flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 7 }, back: { width: 43, height: 43, borderRadius: 22, backgroundColor: '#11161a', borderWidth: 1, borderColor: '#293139', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#edf1f3', fontSize: 33, lineHeight: 34, marginTop: -4 }, brand: { color: '#f5f7f8', fontSize: 25, fontWeight: '900', letterSpacing: 1.1 }, subbrand: { color: '#61717d', fontSize: 8, fontWeight: '900', letterSpacing: 1.3, marginTop: 2 },
  loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12 }, loadingText: { color: '#7c8891', fontSize: 10 },
  statusCard: { borderRadius: 17, borderWidth: 1, padding: 15 }, connectedCard: { backgroundColor: '#071813', borderColor: '#275e49' }, disconnectedCard: { backgroundColor: '#18100a', borderColor: '#5d4423' }, label: { color: '#6fcbee', fontSize: 8.5, fontWeight: '900', letterSpacing: 1.2 }, big: { fontSize: 33, fontWeight: '900', marginTop: 8 }, connected: { color: '#3bd69d' }, disconnected: { color: '#e6b95b' }, warning: { color: '#edbe63' }, statusLine: { color: '#d2d9dd', fontSize: 12, fontWeight: '800', marginTop: 4 }, statusMeta: { color: '#7d8992', fontSize: 10, lineHeight: 15, marginTop: 5 },
  error: { borderRadius: 13, borderWidth: 1, borderColor: '#5f2937', backgroundColor: '#1a0d11', padding: 13 }, errorTitle: { color: '#ff788a', fontSize: 9, fontWeight: '900' }, errorText: { color: '#bd858f', fontSize: 10, marginTop: 5 }, retry: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#613340', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8, marginTop: 9 }, retryText: { color: '#e88a99', fontSize: 8.5, fontWeight: '900' },
  card: { borderRadius: 15, borderWidth: 1, borderColor: '#252e34', backgroundColor: '#0c1013', padding: 14 }, row: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#252b30' }, rowLabel: { color: '#7a858e', fontSize: 10 }, rowValue: { color: '#dce2e5', fontSize: 10, fontWeight: '900' },
  setupCard: { borderRadius: 14, borderWidth: 1, borderColor: '#604923', backgroundColor: '#181307', padding: 14 }, setupTitle: { color: '#e0bb60', fontSize: 9, fontWeight: '900' }, setupText: { color: '#9a895a', fontSize: 10, lineHeight: 15, marginTop: 6 },
  readyCard: { borderRadius: 14, borderWidth: 1, borderColor: '#285f49', backgroundColor: '#081813', padding: 14 }, readyTitle: { color: '#42d79e', fontSize: 9, fontWeight: '900' }, readyText: { color: '#7fa894', fontSize: 10, lineHeight: 15, marginTop: 6 }, liveLocked: { color: '#e0ba61', fontSize: 9, fontWeight: '800', marginTop: 7 },
  flow: { flexDirection: 'row', gap: 11, paddingVertical: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#252b30' }, flowNumber: { width: 31, height: 31, borderRadius: 16, backgroundColor: '#112029', borderWidth: 1, borderColor: '#2a4a5d', alignItems: 'center', justifyContent: 'center' }, flowNumberText: { color: '#72cbf0', fontSize: 10, fontWeight: '900' }, flowTitle: { color: '#dce2e5', fontSize: 11, fontWeight: '900' }, flowText: { color: '#78858e', fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  backend: { borderRadius: 12, borderWidth: 1, borderColor: '#293943', backgroundColor: '#0a1217', padding: 12 }, backendLabel: { color: '#65c4e9', fontSize: 8, fontWeight: '900' }, backendValue: { color: '#71838f', fontSize: 9, marginTop: 4 },
  guardrail: { borderRadius: 14, borderWidth: 1, borderColor: '#344625', backgroundColor: '#0e150b', padding: 14 }, guardrailTitle: { color: '#a8bd78', fontSize: 9, fontWeight: '900' }, guardrailText: { color: '#81906c', fontSize: 10, lineHeight: 15, marginTop: 5 },
});
