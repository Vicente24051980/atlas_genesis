import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AtlasOnlineApi, type LivePortfolio } from '../core/api/atlasOnlineApi';

export default function PortfolioLiveScreen() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<LivePortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else if (!portfolio) setLoading(true);
    try {
      setPortfolio(await AtlasOnlineApi.portfolioLive());
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [portfolio]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#63caff" />}
    >
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver al menú" onPress={() => router.replace('/')} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>‹ MENÚ</Text>
        </Pressable>
        <Text style={styles.live}>READ-ONLY · AUTO 20s</Text>
      </View>

      <Text style={styles.title}>Mi Cartera Ω</Text>
      <Text style={styles.subtitle}>Posiciones reales del broker y última cotización disponible. Sin introducir posiciones manualmente.</Text>

      {loading ? <View style={styles.loading}><ActivityIndicator color="#63caff" size="large" /><Text style={styles.loadingText}>Sincronizando cartera…</Text></View> : null}
      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}

      {portfolio && !portfolio.configured ? (
        <View style={styles.unconfigured}>
          <Text style={styles.unconfiguredTitle}>TRADING 212 NO CONECTADO</Text>
          <Text style={styles.unconfiguredText}>La pantalla ya está preparada, pero para mostrar tu cartera exacta ATLAS necesita las credenciales read-only de Trading 212 configuradas en Render. No se pedirán posiciones ni precios manuales dentro de la app.</Text>
          <Text style={styles.meta}>{portfolio.message || 'Broker no configurado.'}</Text>
        </View>
      ) : null}

      {portfolio?.configured ? (
        <>
          <View style={styles.summary}>
            <View><Text style={styles.eyebrow}>CARTERA LIVE</Text><Text style={styles.count}>{portfolio.positions.length} posiciones</Text></View>
            <View style={styles.right}><Text style={styles.provider}>{portfolio.provider}</Text><Text style={styles.meta}>{formatTimestamp(portfolio.observedAt)}</Text></View>
          </View>

          {portfolio.positions.map((position, index) => {
            const price = position.livePrice ?? position.currentPrice ?? null;
            const pnlPct = position.pnlPct ?? null;
            const day = position.dayChangePct ?? null;
            return (
              <View key={`${position.ticker}-${index}`} style={styles.position}>
                <View style={styles.positionTop}>
                  <View style={styles.flex}>
                    <Text style={styles.ticker}>{position.ticker || '—'}</Text>
                    <Text style={styles.name} numberOfLines={1}>{position.name || 'Posición'}</Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.price}>{price == null ? '—' : formatNumber(price)}</Text>
                    <Text style={[styles.day, (day ?? 0) < 0 ? styles.red : styles.green]}>{day == null ? '—' : `${day >= 0 ? '+' : ''}${day.toFixed(2)}% día`}</Text>
                  </View>
                </View>
                <View style={styles.row}><Text style={styles.label}>Cantidad</Text><Text style={styles.value}>{position.quantity == null ? '—' : formatNumber(position.quantity)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Precio medio</Text><Text style={styles.value}>{position.averagePrice == null ? '—' : formatNumber(position.averagePrice)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>P/L posición</Text><Text style={[styles.value, (pnlPct ?? 0) < 0 ? styles.red : styles.green]}>{pnlPct == null ? '—' : `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`}</Text></View>
                <Text style={styles.quoteTime}>{position.quoteTimestamp ? `Quote ${formatTimestamp(position.quoteTimestamp)}` : 'Precio broker / última cotización disponible'}</Text>
              </View>
            );
          })}
        </>
      ) : null}

      <View style={styles.guard}>
        <Text style={styles.guardTitle}>GUARDRAIL</Text>
        <Text style={styles.guardText}>La integración es de lectura. ATLAS muestra cartera y decisión, pero no envía órdenes al broker.</Text>
      </View>
    </ScrollView>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-ES');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#070b10' },
  content: { padding: 18, paddingBottom: 54, gap: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuButton: { borderWidth: 1, borderColor: '#28415b', backgroundColor: '#0d1620', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  menuButtonText: { color: '#6fc3ff', fontWeight: '900', fontSize: 12 },
  live: { color: '#5fcaff', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  title: { color: '#f7fafc', fontSize: 32, fontWeight: '900' },
  subtitle: { color: '#93a2b5', fontSize: 14, lineHeight: 21 },
  loading: { minHeight: 190, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#8192a4' },
  error: { backgroundColor: '#211015', borderWidth: 1, borderColor: '#6d2d3b', borderRadius: 12, padding: 12 },
  errorText: { color: '#ff8da0' },
  unconfigured: { backgroundColor: '#1b160a', borderWidth: 1, borderColor: '#68531e', borderRadius: 16, padding: 16, gap: 7 },
  unconfiguredTitle: { color: '#f4c85e', fontWeight: '900', fontSize: 14 },
  unconfiguredText: { color: '#c2ae79', lineHeight: 20 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0e151d', borderWidth: 1, borderColor: '#26394c', borderRadius: 15, padding: 15 },
  eyebrow: { color: '#63caff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  count: { color: '#fff', fontSize: 25, fontWeight: '900', marginTop: 5 },
  right: { alignItems: 'flex-end' },
  provider: { color: '#cdd8e2', fontWeight: '900', fontSize: 11 },
  meta: { color: '#6f8195', fontSize: 9, marginTop: 4 },
  position: { backgroundColor: '#0e151d', borderWidth: 1, borderColor: '#1f3040', borderRadius: 15, padding: 15, gap: 2 },
  positionTop: { flexDirection: 'row', gap: 10, marginBottom: 7 },
  flex: { flex: 1 },
  ticker: { color: '#fff', fontSize: 22, fontWeight: '900' },
  name: { color: '#91a1b2', fontSize: 11, marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  price: { color: '#fff', fontSize: 19, fontWeight: '900' },
  day: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  row: { minHeight: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#17212b' },
  label: { color: '#8192a5', fontSize: 11 },
  value: { color: '#edf3f7', fontSize: 11, fontWeight: '800' },
  quoteTime: { color: '#526b80', fontSize: 8, marginTop: 6 },
  green: { color: '#4ade9f' },
  red: { color: '#ff7488' },
  guard: { backgroundColor: '#10170d', borderWidth: 1, borderColor: '#33451f', borderRadius: 14, padding: 14 },
  guardTitle: { color: '#a4bd70', fontSize: 9, fontWeight: '900' },
  guardText: { color: '#87956c', fontSize: 10, lineHeight: 16, marginTop: 5 },
});
