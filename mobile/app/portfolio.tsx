import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, InstrumentRow, MetricTile, Pill, SectionHeader } from '../components/BrokerUi';
import { MobileApi, type PortfolioPayload } from '../core/api/mobileApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function PortfolioScreen() {
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try { setPortfolio(await MobileApi.portfolio()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <AtlasBrokerShell active="portfolio" title="Cartera" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor={t.accent} />}>
      <View style={styles.heading}>
        <View style={{ flex: 1 }}><Text style={styles.kicker}>PORTFOLIO Ω</Text><Text style={styles.title}>Cartera ATLAS</Text><Text style={styles.subtitle}>Vista estructural. Sin P/L fabricado cuando el snapshot no trae cantidades o precios.</Text></View>
        <Pill label="CANON" tone="info" />
      </View>

      <View style={styles.metrics}>
        <MetricTile label="Posiciones" value={portfolio ? String(portfolio.count) : '—'} />
        <MetricTile label="Estado" value={portfolio ? 'SYNC' : '—'} tone={portfolio ? 'positive' : 'default'} hint="snapshot ATLAS" />
      </View>

      {portfolio ? <Card><Text style={styles.snapshotLabel}>SNAPSHOT</Text><Text style={styles.snapshot}>{portfolio.snapshotId}</Text></Card> : null}

      <SectionHeader title="Posiciones" action="Analizar" onAction={() => router.push('/analyze')} />
      {!portfolio && !error ? <View style={styles.loading}><ActivityIndicator color={t.accent} /><Text style={styles.muted}>Cargando cartera…</Text></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {portfolio ? (
        <Card style={styles.listCard}>
          {portfolio.items.map(({ ticker }, index) => (
            <InstrumentRow key={ticker} ticker={ticker} name={`Posición ${String(index + 1).padStart(2, '0')}`} meta="Toca para abrir análisis" onPress={() => router.push({ pathname: '/analyze', params: { ticker } })} />
          ))}
        </Card>
      ) : null}

      {portfolio ? <Card><Text style={styles.guardrailTitle}>GOBERNANZA</Text><Text style={styles.guardrail}>{portfolio.guardrail}</Text></Card> : null}
    </AtlasBrokerShell>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  metrics: { flexDirection: 'row', gap: 9 },
  snapshotLabel: { color: t.textFaint, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  snapshot: { color: t.text, fontSize: 12, fontWeight: '700', marginTop: 6 },
  listCard: { paddingTop: 2, paddingBottom: 2 },
  loading: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 },
  muted: { color: t.textMuted, fontSize: 12 },
  error: { color: t.negative, backgroundColor: t.negativeSoft, padding: 12, borderRadius: 12 },
  guardrailTitle: { color: t.info, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  guardrail: { color: t.textMuted, fontSize: 11, lineHeight: 17, marginTop: 6 },
});
