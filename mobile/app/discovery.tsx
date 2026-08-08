import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AtlasApi, type DiscoveryItem } from '../core/api/atlasApi';

export default function DiscoveryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');

  const load = async () => {
    try {
      setError('');
      const result = await AtlasApi.discovery(30);
      setItems(result.items);
      setGeneratedAt(result.generatedAt);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#64d8ff" />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ATLAS Ω · DISCOVERY RADAR</Text>
          <Text style={styles.title}>Detectar fuerza antes de auditar calidad</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>TICKER-FIRST</Text></View>
      </View>
      <Text style={styles.subtitle}>Ranking observacional por momentum, Wave Ω de mercado y riesgo de deterioro. Discovery no equivale a Watchlist ni a recomendación de compra.</Text>

      <View style={styles.methodCard}>
        <Text style={styles.methodTitle}>COVERAGE</Text>
        <Text style={styles.methodText}>La API actual usa un universo inicial explícito mientras se conecta un proveedor de screener global. ATLAS no lo etiqueta como “global” hasta que esa cobertura exista de verdad.</Text>
        {generatedAt ? <Text style={styles.timestamp}>Último cálculo: {new Date(generatedAt).toLocaleString('es-ES')}</Text> : null}
      </View>

      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}
      {loading ? <ActivityIndicator color="#64d8ff" size="large" style={{ marginTop: 28 }} /> : null}

      <View style={styles.tableHeader}>
        <Text style={[styles.th, styles.rank]}>#</Text><Text style={[styles.th, styles.symbol]}>TICKER</Text><Text style={styles.th}>DISC</Text><Text style={styles.th}>MOM</Text><Text style={styles.th}>WAVE</Text><Text style={styles.th}>RISK</Text>
      </View>
      {items.map((item, index) => (
        <Pressable key={item.ticker} onPress={() => router.push({ pathname: '/terminal', params: { ticker: item.ticker } })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <Text style={[styles.rankText, styles.rank]}>{index + 1}</Text>
          <View style={styles.symbol}>
            <Text style={styles.ticker}>{item.ticker}</Text>
            <Text style={styles.streak}>{item.streak.direction} {item.streak.length} · 60D {fmtPct(item.metrics?.ret60)}</Text>
          </View>
          <Score value={item.discoveryScore} />
          <Score value={item.momentumScore} />
          <Score value={item.waveScore} />
          <Risk value={item.downsideScore} />
        </Pressable>
      ))}
      {!loading && !items.length ? <Text style={styles.empty}>No hay candidatos disponibles con los filtros actuales.</Text> : null}
    </ScrollView>
  );
}

function Score({ value }: { value: number | null }) {
  return <Text style={[styles.value, value != null && value >= 70 ? styles.good : value != null && value < 40 ? styles.muted : undefined]}>{value == null ? '—' : value.toFixed(0)}</Text>;
}
function Risk({ value }: { value: number | null }) {
  return <Text style={[styles.value, value != null && value >= 50 ? styles.bad : value != null && value >= 25 ? styles.warn : styles.good]}>{value == null ? '—' : value.toFixed(0)}</Text>;
}
const fmtPct = (value?: number | null) => value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05080c' },
  content: { padding: 14, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  eyebrow: { color: '#617589', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#eff4f8', fontSize: 23, fontWeight: '900', marginTop: 5, maxWidth: 310 },
  badge: { borderWidth: 1, borderColor: '#235041', backgroundColor: '#0a1915', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  badgeText: { color: '#64d9a9', fontSize: 8, fontWeight: '900' },
  subtitle: { color: '#728497', fontSize: 11, lineHeight: 17, marginTop: 8 },
  methodCard: { marginTop: 12, padding: 11, borderRadius: 8, borderWidth: 1, borderColor: '#26351e', backgroundColor: '#0d130c' },
  methodTitle: { color: '#a9c078', fontSize: 9, fontWeight: '900' },
  methodText: { color: '#7f9075', fontSize: 10, lineHeight: 15, marginTop: 4 },
  timestamp: { color: '#53634e', fontSize: 8, marginTop: 5 },
  error: { marginTop: 10, padding: 10, borderRadius: 7, backgroundColor: '#1b0c10', borderWidth: 1, borderColor: '#5c202b' },
  errorText: { color: '#ff8794', fontSize: 10 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingVertical: 7, borderBottomWidth: 1, borderColor: '#1a2632' },
  th: { flex: 1, color: '#506274', fontSize: 8, fontWeight: '900', textAlign: 'right' },
  rank: { width: 24, flex: 0, textAlign: 'left' },
  symbol: { flex: 1.8, textAlign: 'left' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 55, borderBottomWidth: 1, borderBottomColor: '#101923' },
  pressed: { opacity: 0.6 },
  rankText: { color: '#4d6072', fontSize: 9, fontWeight: '800' },
  ticker: { color: '#dfe8f0', fontWeight: '900', fontSize: 13 },
  streak: { color: '#526476', fontSize: 8, marginTop: 3 },
  value: { flex: 1, color: '#aebdca', fontWeight: '900', fontSize: 11, textAlign: 'right', fontVariant: ['tabular-nums'] },
  good: { color: '#55dca4' },
  warn: { color: '#e7c15c' },
  bad: { color: '#ff697c' },
  muted: { color: '#748596' },
  empty: { color: '#617386', textAlign: 'center', marginTop: 30 },
});
