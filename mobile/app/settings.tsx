import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { apiBaseUrl, MobileApi, MobileHealth } from '../core/api/mobileApi';

export default function SettingsScreen() {
  const [health, setHealth] = useState<MobileHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setHealth(await MobileApi.health());
    } catch (cause) {
      setHealth(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>← Inicio</Text></Pressable>
      <Text style={styles.eyebrow}>SYSTEM STATUS</Text>
      <Text style={styles.title}>Estado del sistema</Text>
      <Text style={styles.subtitle}>La app nunca contiene la API key de FinancialData.Net. La credencial vive únicamente en el backend como secreto de entorno.</Text>

      <View style={styles.card}>
        <Row label="Backend" value={apiBaseUrl()} />
        <Row label="Servicio" value={health?.service || '—'} />
        <Row label="Versión" value={health?.version || '—'} />
        <Row label="Proveedor preferido" value={health?.preferred_provider || '—'} />
        <Row label="FinancialData.Net" value={health?.financialdatanet_configured ? 'CONFIGURADO' : 'PENDIENTE EN SERVIDOR'} good={health?.financialdatanet_configured} />
        <Row label="Finnhub fallback" value={health?.finnhub_configured ? 'CONFIGURADO' : 'NO CONFIGURADO'} good={health?.finnhub_configured} />
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#7dd3fc" /><Text style={styles.muted}>Comprobando…</Text></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable accessibilityRole="button" accessibilityLabel="Recomprobar sistema" onPress={() => { void load(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>RECOMPROBAR SISTEMA</Text>
      </Pressable>

      <View style={styles.securityCard}>
        <Text style={styles.securityTitle}>SEGURIDAD</Text>
        <Text style={styles.securityText}>FINANCIALDATANET_API_KEY se lee únicamente en Render/backend. No se usa EXPO_PUBLIC para la clave y no se incrusta en el APK.</Text>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={[styles.value, good === true && styles.good, good === false && styles.warn]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#07090d' },
  content: { paddingTop: 54, paddingHorizontal: 18, paddingBottom: 44, gap: 12 },
  back: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 14 },
  backText: { color: '#7dd3fc', fontWeight: '800' },
  eyebrow: { color: '#7dd3fc', fontWeight: '900', fontSize: 12, letterSpacing: 1.2 },
  title: { color: '#f8fafc', fontSize: 31, fontWeight: '900' },
  subtitle: { color: '#94a3b8', lineHeight: 21 },
  card: { backgroundColor: '#0f141c', borderRadius: 16, borderWidth: 1, borderColor: '#223047', padding: 14, gap: 11 },
  row: { gap: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#253044', paddingBottom: 9 },
  label: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  value: { color: '#e2e8f0', fontWeight: '700' },
  good: { color: '#34d399' },
  warn: { color: '#fbbf24' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  muted: { color: '#94a3b8' },
  error: { color: '#fca5a5', backgroundColor: '#241318', padding: 14, borderRadius: 14 },
  button: { backgroundColor: '#0ea5e9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#03111a', fontWeight: '900' },
  pressed: { opacity: 0.7 },
  securityCard: { backgroundColor: '#111827', borderRadius: 14, padding: 14, gap: 7 },
  securityTitle: { color: '#a5b4fc', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  securityText: { color: '#cbd5e1', lineHeight: 19 },
});
