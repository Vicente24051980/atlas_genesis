import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, InstrumentRow, MetricTile, Pill, SectionHeader } from '../components/BrokerUi';
import { AtlasOnlineApi, type TrackedUniverse } from '../core/api/atlasOnlineApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function WatchlistScreen() {
  const [universe, setUniverse] = useState<TrackedUniverse | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try { setUniverse(await AtlasOnlineApi.atlasUniverse()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <AtlasBrokerShell active="watchlist" title="Watchlist" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor={t.accent} />}>
      <View style={styles.heading}><View style={{ flex: 1 }}><Text style={styles.kicker}>DISCOVERY Ω</Text><Text style={styles.title}>Watchlist</Text><Text style={styles.subtitle}>Universo en observación separado de cartera. Abrir un ticker no ejecuta ninguna orden.</Text></View><Pill label="TRACK" tone="info" /></View>

      <View style={styles.metrics}>
        <MetricTile label="Seguimiento" value={universe ? String(universe.counts.watchlist) : '—'} />
        <MetricTile label="En cartera" value={universe ? String(universe.counts.portfolio) : '—'} hint="separación estricta" />
      </View>

      <SectionHeader title="Instrumentos vigilados" action="Buscar" onAction={() => router.push('/markets')} />
      {!universe && !error ? <View style={styles.loading}><ActivityIndicator color={t.accent} /><Text style={styles.muted}>Cargando watchlist…</Text></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {universe ? (
        <Card style={styles.listCard}>
          {universe.watchlist.map((item) => (
            <InstrumentRow key={item.ticker} ticker={item.ticker} name={item.name} meta={item.sector || 'Watchlist Ω'} onPress={() => router.push({ pathname: '/analyze', params: { ticker: item.symbol || item.ticker } })} />
          ))}
        </Card>
      ) : null}
      {universe ? <Text style={styles.guardrail}>{universe.guardrail}</Text> : null}
    </AtlasBrokerShell>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  metrics: { flexDirection: 'row', gap: 9 },
  listCard: { paddingTop: 2, paddingBottom: 2 },
  loading: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 },
  muted: { color: t.textMuted, fontSize: 12 },
  error: { color: t.negative, backgroundColor: t.negativeSoft, padding: 12, borderRadius: 12 },
  guardrail: { color: t.textFaint, fontSize: 10, lineHeight: 15 },
});
