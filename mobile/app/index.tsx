import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AtlasOnlineApi, atlasApiBaseUrl } from '../core/api/atlasOnlineApi';

const modules = [
  { code: 'OVR', title: 'Resumen', subtitle: 'Empresa · precio · métricas clave', route: '/overview' },
  { code: 'MKT', title: 'Mercado', subtitle: 'Precio · rango · beta · volumen', route: '/market' },
  { code: 'GRW', title: 'Growth Ω', subtitle: 'Ventas · EPS · crecimiento', route: '/growth' },
  { code: 'QLT', title: 'Business Quality Ω', subtitle: 'ROE · ROA · márgenes · eficiencia', route: '/quality' },
  { code: 'CPX', title: 'CAPEX Productivity Ω', subtitle: 'FCF · CAPEX · ROIC · deuda', route: '/capex-productivity' },
  { code: 'VAL', title: 'Valuation Ω', subtitle: 'P/E · P/B · múltiplos · yield', route: '/valuation' },
  { code: 'RSK', title: 'Risk Ω', subtitle: 'Beta · deuda · liquidez · volatilidad', route: '/risk' },
  { code: 'CAT', title: 'Catalysts Ω', subtitle: 'Noticias · consenso · cambios', route: '/catalysts' },
  { code: 'NWS', title: 'News Ω', subtitle: 'Noticias recientes del ticker', route: '/news' },
  { code: 'BRK', title: 'Broker Ω', subtitle: 'Trading 212 · paper/live · posiciones · órdenes', route: '/broker' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [apiState, setApiState] = useState<'CHECKING' | 'ONLINE' | 'OFFLINE'>('CHECKING');
  const [apiVersion, setApiVersion] = useState('');
  const [brokerState, setBrokerState] = useState('BROKER CHECKING');

  useEffect(() => {
    let active = true;
    void AtlasOnlineApi.health()
      .then((health) => {
        if (!active) return;
        setApiState(health.ok && health.finnhub_configured ? 'ONLINE' : 'OFFLINE');
        setApiVersion(health.version || '');
        setBrokerState(health.broker_configured ? `BROKER ${(health.broker_environment || 'demo').toUpperCase()}` : 'BROKER UNCONFIGURED');
      })
      .catch(() => {
        if (active) {
          setApiState('OFFLINE');
          setBrokerState('BROKER OFFLINE');
        }
      });
    return () => { active = false; };
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.top}>
        <View>
          <Text style={styles.brand}>ATLAS Ω</Text>
          <Text style={styles.product}>TICKER-FIRST MOBILE</Text>
        </View>
        <View style={[styles.status, apiState === 'ONLINE' ? styles.online : apiState === 'OFFLINE' ? styles.offline : styles.checking]}>
          <View style={[styles.dot, apiState === 'ONLINE' ? styles.dotOnline : apiState === 'OFFLINE' ? styles.dotOffline : styles.dotChecking]} />
          <Text style={styles.statusText}>{apiState}</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>ATLAS Ω MOBILE</Text>
        <Text style={styles.title}>Analiza. Decide. Ejecuta con guardrails.</Text>
        <Text style={styles.subtitle}>Los módulos de análisis consultan ATLAS online. Broker Ω añade Trading 212 con paper trading por defecto y LIVE bloqueado hasta activación explícita del servidor.</Text>
        <View style={styles.apiBox}>
          <Text style={styles.apiLabel}>BACKEND</Text>
          <Text style={styles.apiValue} numberOfLines={1}>{atlasApiBaseUrl()}</Text>
          <Text style={styles.apiMeta}>{apiVersion ? `API ${apiVersion}` : 'Render + Finnhub'} · {brokerState}</Text>
        </View>
      </View>

      <Text style={styles.section}>MENÚ</Text>
      <View style={styles.grid}>
        {modules.map((module) => (
          <Pressable
            key={module.code}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${module.title}`}
            onPress={() => router.push(module.route)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed, module.code === 'BRK' && styles.brokerCard]}
          >
            <Text style={styles.code}>{module.code}</Text>
            <Text style={styles.cardTitle}>{module.title}</Text>
            <Text style={styles.cardText}>{module.subtitle}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.ruleCard}>
        <Text style={styles.ruleTitle}>REGLA DE USO</Text>
        <Text style={styles.ruleText}>1 ticker → datos automáticos. Broker Ω mantiene las claves de Trading 212 fuera del APK. Las órdenes reales permanecen bloqueadas si el servidor no habilita LIVE explícitamente.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#070b10' },
  content: { padding: 18, paddingBottom: 54, gap: 16 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#f7fafc', fontSize: 25, fontWeight: '900', letterSpacing: 1.5 },
  product: { color: '#566b80', fontSize: 9, fontWeight: '900', letterSpacing: 1.6, marginTop: 3 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  online: { backgroundColor: '#0a1b15', borderColor: '#20523d' },
  offline: { backgroundColor: '#1d0d12', borderColor: '#632536' },
  checking: { backgroundColor: '#1b180d', borderColor: '#5a4d20' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOnline: { backgroundColor: '#43dfa0' },
  dotOffline: { backgroundColor: '#ff6f84' },
  dotChecking: { backgroundColor: '#e4bd57' },
  statusText: { color: '#a7b4c1', fontSize: 9, fontWeight: '900' },
  hero: { backgroundColor: '#0d151e', borderWidth: 1, borderColor: '#263d52', borderRadius: 18, padding: 18, gap: 8 },
  eyebrow: { color: '#62caff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: '#ffffff', fontSize: 31, lineHeight: 37, fontWeight: '900' },
  subtitle: { color: '#93a3b5', fontSize: 14, lineHeight: 21 },
  apiBox: { marginTop: 6, backgroundColor: '#080d13', borderRadius: 11, padding: 11, borderWidth: 1, borderColor: '#1c2d3b' },
  apiLabel: { color: '#5b7085', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  apiValue: { color: '#b9d9ee', fontSize: 11, fontWeight: '800', marginTop: 4 },
  apiMeta: { color: '#536579', fontSize: 9, marginTop: 3 },
  section: { color: '#65798d', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  grid: { gap: 10 },
  card: { minHeight: 104, backgroundColor: '#0e151d', borderWidth: 1, borderColor: '#1f3040', borderRadius: 16, padding: 15, position: 'relative' },
  brokerCard: { borderColor: '#2a5c4b', backgroundColor: '#0c1714' },
  cardPressed: { opacity: 0.65, transform: [{ scale: 0.99 }] },
  code: { color: '#63caff', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  cardTitle: { color: '#f1f5f9', fontSize: 19, fontWeight: '900', marginTop: 8 },
  cardText: { color: '#8292a5', fontSize: 12, marginTop: 4, paddingRight: 28 },
  arrow: { position: 'absolute', right: 15, top: 35, color: '#4f718e', fontSize: 32 },
  ruleCard: { backgroundColor: '#11180d', borderWidth: 1, borderColor: '#33451f', borderRadius: 14, padding: 14 },
  ruleTitle: { color: '#a4bd70', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  ruleText: { color: '#87956c', fontSize: 11, lineHeight: 17, marginTop: 5 },
});
