import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  clearFmpApiKey,
  clearTrading212Credentials,
  getCredentialStatus,
  saveFmpApiKey,
  saveTrading212Credentials,
  Trading212Environment,
} from '../services/credentials';
import { registerAtlasBackgroundSync, isAtlasBackgroundSyncRegistered } from '../services/backgroundSync';
import { runAutomaticSync } from '../services/autoSync';
import { testFmpConnection } from '../services/providers/fmp';
import { testTrading212Connection } from '../services/providers/trading212';

type SourceStatus = {
  trading212: boolean;
  fmp: boolean;
  environment: Trading212Environment;
  background: boolean;
};

export default function DataSourcesScreen() {
  const [status, setStatus] = useState<SourceStatus>({ trading212: false, fmp: false, environment: 'live', background: false });
  const [t212Key, setT212Key] = useState('');
  const [t212Secret, setT212Secret] = useState('');
  const [fmpKey, setFmpKey] = useState('');
  const [environment, setEnvironment] = useState<Trading212Environment>('live');
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [credentials, background] = await Promise.all([
      getCredentialStatus(),
      isAtlasBackgroundSyncRegistered().catch(() => false),
    ]);
    setStatus({ ...credentials, background });
    setEnvironment(credentials.environment);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const saveAndActivate = async () => {
    setWorking(true);
    setMessage('');
    try {
      if (t212Key.trim() || t212Secret.trim()) {
        await saveTrading212Credentials(t212Key, t212Secret, environment);
      }
      if (fmpKey.trim()) await saveFmpApiKey(fmpKey);

      const current = await getCredentialStatus();
      if (!current.trading212 && !current.fmp) {
        setMessage('Introduce al menos una fuente de datos.');
        return;
      }

      await registerAtlasBackgroundSync();
      const sync = await runAutomaticSync('SETUP_TEST');
      setT212Key('');
      setT212Secret('');
      setFmpKey('');
      setMessage(`Automatización activa: ${sync.brokerPositions} posiciones, ${sync.marketQuotes} cotizaciones, ${sync.radarSignals} señales.`);
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setWorking(false);
    }
  };

  const testConnections = async () => {
    setWorking(true);
    setMessage('');
    try {
      const current = await getCredentialStatus();
      const notes: string[] = [];
      if (current.trading212) {
        const result = await testTrading212Connection();
        notes.push(`Trading 212 OK (${result.positions} posiciones, ${result.environment}).`);
      }
      if (current.fmp) {
        const quote = await testFmpConnection();
        notes.push(`FMP OK (MSFT ${quote.price}).`);
      }
      if (!notes.length) notes.push('No hay credenciales guardadas.');
      setMessage(notes.join(' '));
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setWorking(false);
    }
  };

  const clearAll = async () => {
    setWorking(true);
    try {
      await Promise.all([clearTrading212Credentials(), clearFmpApiKey()]);
      setMessage('Credenciales eliminadas del dispositivo.');
      await load();
    } finally {
      setWorking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Fuentes de datos</Text>
      <Text style={styles.subtitle}>Configuración única. Después ATLAS Ω sincroniza cartera, órdenes, cotizaciones, watchlist y Radar automáticamente.</Text>

      <View style={styles.statusCard}>
        <StatusRow label="Trading 212" ok={status.trading212} detail={status.trading212 ? status.environment.toUpperCase() : 'Pendiente'} />
        <StatusRow label="FMP Market Data" ok={status.fmp} detail={status.fmp ? 'Configurado' : 'Pendiente'} />
        <StatusRow label="Background Sync" ok={status.background} detail={status.background ? 'Cada ≥60 min' : 'Pendiente'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trading 212 · solo lectura</Text>
        <Text style={styles.help}>Genera una API Key en Trading 212 → Settings → API (Beta). Concede únicamente permisos de lectura para cuenta, portfolio y órdenes. ATLAS Ω no incluye endpoints para comprar, vender o cancelar órdenes.</Text>
        <View style={styles.segmentRow}>
          {(['live', 'demo'] as const).map((value) => (
            <Pressable key={value} onPress={() => setEnvironment(value)} style={[styles.segment, environment === value && styles.segmentActive]}>
              <Text style={[styles.segmentText, environment === value && styles.segmentTextActive]}>{value === 'live' ? 'REAL' : 'DEMO'}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput value={t212Key} onChangeText={setT212Key} autoCapitalize="none" placeholder={status.trading212 ? 'API Key ya guardada · pega otra para sustituir' : 'Trading 212 API Key'} placeholderTextColor="#64748b" style={styles.input} />
        <TextInput value={t212Secret} onChangeText={setT212Secret} autoCapitalize="none" secureTextEntry placeholder={status.trading212 ? 'API Secret ya guardado · pega otro para sustituir' : 'Trading 212 API Secret'} placeholderTextColor="#64748b" style={styles.input} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>FMP · mercado y discovery</Text>
        <Text style={styles.help}>Se usa para cotizaciones batch, medias 50/200, capitalización y discovery global. La clave queda cifrada en SecureStore del dispositivo.</Text>
        <TextInput value={fmpKey} onChangeText={setFmpKey} autoCapitalize="none" secureTextEntry placeholder={status.fmp ? 'FMP Key ya guardada · pega otra para sustituir' : 'FMP API Key'} placeholderTextColor="#64748b" style={styles.input} />
      </View>

      <Pressable disabled={working} onPress={() => { void saveAndActivate(); }} style={({ pressed }) => [styles.primary, (pressed || working) && styles.pressed]}>
        <Text style={styles.primaryText}>{working ? 'Procesando…' : 'Guardar · sincronizar · automatizar'}</Text>
      </Pressable>
      <Pressable disabled={working} onPress={() => { void testConnections(); }} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
        <Text style={styles.secondaryText}>Probar conexiones guardadas</Text>
      </Pressable>
      <Pressable disabled={working} onPress={() => { void clearAll(); }} style={({ pressed }) => [styles.danger, pressed && styles.pressed]}>
        <Text style={styles.dangerText}>Eliminar credenciales del dispositivo</Text>
      </Pressable>

      {message ? <View style={styles.messageCard}><Text style={styles.message}>{message}</Text></View> : null}

      <View style={styles.ruleCard}>
        <Text style={styles.ruleTitle}>Regla de seguridad</Text>
        <Text style={styles.ruleText}>Las API keys no se guardan en SQLite ni en GitHub. Portfolio y órdenes se leen de Trading 212; FMP aporta datos de mercado. Datos de proveedor no se convierten por sí solos en evidencia canónica ni modifican tesis o Conviction Ω.</Text>
      </View>
    </ScrollView>
  );
}

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <View style={styles.statusRow}>
      <View style={[styles.dot, ok ? styles.dotOk : styles.dotPending]} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 18, gap: 14 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 21 },
  statusCard: { backgroundColor: '#111923', borderWidth: 1, borderColor: '#29405b', borderRadius: 16, padding: 14, gap: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOk: { backgroundColor: '#34d399' },
  dotPending: { backgroundColor: '#f59e0b' },
  statusLabel: { color: '#fff', fontWeight: '700', flex: 1 },
  statusDetail: { color: '#94a3b8', fontSize: 12 },
  card: { backgroundColor: '#141a22', borderWidth: 1, borderColor: '#202b38', borderRadius: 16, padding: 14, gap: 10 },
  cardTitle: { color: '#71b7ff', fontSize: 17, fontWeight: '800' },
  help: { color: '#9da9b7', lineHeight: 19, fontSize: 13 },
  input: { backgroundColor: '#0f141b', color: '#fff', borderWidth: 1, borderColor: '#263241', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 9, borderWidth: 1, borderColor: '#263241' },
  segmentActive: { borderColor: '#2f81f7', backgroundColor: '#10243f' },
  segmentText: { color: '#94a3b8', fontWeight: '800' },
  segmentTextActive: { color: '#71b7ff' },
  primary: { backgroundColor: '#2f81f7', borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '900' },
  secondary: { borderWidth: 1, borderColor: '#29405b', borderRadius: 12, padding: 13, alignItems: 'center' },
  secondaryText: { color: '#71b7ff', fontWeight: '800' },
  danger: { borderWidth: 1, borderColor: '#51323a', borderRadius: 12, padding: 13, alignItems: 'center' },
  dangerText: { color: '#f87171', fontWeight: '800' },
  pressed: { opacity: 0.65 },
  messageCard: { borderRadius: 12, padding: 12, backgroundColor: '#111923' },
  message: { color: '#cbd5e1', lineHeight: 19 },
  ruleCard: { borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#314155', backgroundColor: '#0f151d' },
  ruleTitle: { color: '#fff', fontWeight: '800', marginBottom: 6 },
  ruleText: { color: '#94a3b8', lineHeight: 19, fontSize: 12 },
});
