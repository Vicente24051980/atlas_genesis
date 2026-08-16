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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor="#7dd3fc" />}
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>ATLAS Ω · MOBILE 1.0</Text>
        <Text style={styles.title}>Investment Intelligence</Text>
        <Text style={styles.subtitle}>Una app pequeña, estable y conectada al backend real. Sin formularios fantasma, sin datos inventados.</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, online ? styles.dotOnline : styles.dotOffline]} />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>{online ? 'MOTOR ONLINE' : health ? 'MOTOR DEGRADADO' : 'CONECTANDO'}</Text>
            <Text style={styles.statusMeta}>Proveedor preferido: {provider}</Text>
          </View>
          {!health && !error ? <ActivityIndicator color="#7dd3fc" /> : null}
        </View>
        {health ? (
          <View style={styles.providerRow}>
            <Badge label="FinancialData.Net" active={health.financialdatanet_configured} />
            <Badge label="Finnhub fallback" active={health.finnhub_configured} />
          </View>
        ) : null}
        {error ? <Text style={styles.error}>Backend no disponible: {error}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Acciones principales</Text>
      <ActionCard
        label="Analizar ticker"
        description="Consulta empresa y datos reales; añade la posición EDD y el mapa Global CAPEX Chain Ω sin fabricar scores no auditados."
        onPress={() => router.push('/analyze')}
      />
      <ActionCard
        label="Cartera 36"
        description="Abre el snapshot de cartera de ATLAS y entra en cualquier ticker con un toque."
        onPress={() => router.push('/portfolio')}
      />
      <ActionCard
        label="Broker Ω · Trading 212"
        description="Verifica el bridge, sincroniza cuenta/posiciones/órdenes e identifica tickers exactos T212. Ejecución live bloqueada por defecto."
        onPress={() => router.push('/broker')}
      />
      <ActionCard
        label="Estado del sistema"
        description="Comprueba backend, proveedor de datos y preparación de Trading 212 sin exponer credenciales."
        onPress={() => router.push('/settings')}
      />

      <View style={styles.ruleCard}>
        <Text style={styles.ruleTitle}>REGLA DE DATOS</Text>
        <Text style={styles.ruleText}>EVIDENCE &gt; NARRATIVE · precio ≠ evidencia fundamental · market cap change ≠ capital flow.</Text>
      </View>
    </ScrollView>
  );
}

function Badge({ label, active }: { label: string; active: boolean }) {
  return <View style={[styles.badge, active ? styles.badgeOn : styles.badgeOff]}><Text style={styles.badgeText}>{label}: {active ? 'OK' : 'pendiente'}</Text></View>;
}

function ActionCard({ label, description, onPress }: { label: string; description: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <Text style={styles.actionTitle}>{label}</Text>
      <Text style={styles.actionText}>{description}</Text>
      <Text style={styles.actionArrow}>Abrir →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#07090d' },
  content: { paddingTop: 56, paddingHorizontal: 18, paddingBottom: 40, gap: 12 },
  hero: { gap: 8, marginBottom: 8 },
  eyebrow: { color: '#7dd3fc', fontWeight: '800', fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#f8fafc', fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: '#94a3b8', fontSize: 15, lineHeight: 22 },
  statusCard: { backgroundColor: '#0f141c', borderColor: '#233044', borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 11, height: 11, borderRadius: 99 },
  dotOnline: { backgroundColor: '#34d399' },
  dotOffline: { backgroundColor: '#f87171' },
  statusTextWrap: { flex: 1 },
  statusTitle: { color: '#f8fafc', fontWeight: '900', fontSize: 16 },
  statusMeta: { color: '#94a3b8', marginTop: 3 },
  providerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10, borderWidth: 1 },
  badgeOn: { backgroundColor: '#0d2a22', borderColor: '#1e6b53' },
  badgeOff: { backgroundColor: '#221b14', borderColor: '#5f472c' },
  badgeText: { color: '#dbeafe', fontSize: 12, fontWeight: '700' },
  error: { color: '#fca5a5', lineHeight: 20 },
  sectionTitle: { color: '#cbd5e1', fontWeight: '900', fontSize: 13, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
  action: { backgroundColor: '#0c1118', borderRadius: 18, padding: 17, borderWidth: 1, borderColor: '#1e293b', gap: 7 },
  pressed: { opacity: 0.72 },
  actionTitle: { color: '#f8fafc', fontSize: 19, fontWeight: '900' },
  actionText: { color: '#94a3b8', lineHeight: 20 },
  actionArrow: { color: '#7dd3fc', fontWeight: '800', marginTop: 3 },
  ruleCard: { marginTop: 6, backgroundColor: '#111827', borderRadius: 14, padding: 14 },
  ruleTitle: { color: '#a5b4fc', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  ruleText: { color: '#cbd5e1', marginTop: 6, lineHeight: 19 },
});
