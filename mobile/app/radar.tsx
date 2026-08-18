import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, EmptyState, InstrumentRow, Pill, SectionHeader } from '../components/BrokerUi';
import { AtlasOnlineApi, type EnginesPayload, type MarketOverview, type MarketScanner } from '../core/api/atlasOnlineApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function RadarScreen() {
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [scanner, setScanner] = useState<MarketScanner | null>(null);
  const [engines, setEngines] = useState<EnginesPayload | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    const [overviewResult, scannerResult, enginesResult] = await Promise.allSettled([
      AtlasOnlineApi.marketOverview(), AtlasOnlineApi.marketScanner('all', 12), AtlasOnlineApi.atlasEngines(),
    ]);
    setOverview(overviewResult.status === 'fulfilled' ? overviewResult.value : null);
    setScanner(scannerResult.status === 'fulfilled' ? scannerResult.value : null);
    setEngines(enginesResult.status === 'fulfilled' ? enginesResult.value : null);
    if (overviewResult.status === 'rejected' && scannerResult.status === 'rejected') setError('No se pudo cargar el radar de mercado.');
  }, []);

  useEffect(() => { void load(); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <AtlasBrokerShell active="radar" title="Radar Ω" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor={t.accent} />}>
      <View style={styles.heading}><View style={{ flex: 1 }}><Text style={styles.kicker}>MARKET INTELLIGENCE</Text><Text style={styles.title}>Radar Ω</Text><Text style={styles.subtitle}>Mercado, macro y estado real de motores. Lo no disponible se muestra como no disponible.</Text></View><Pill label="EVIDENCE" tone="positive" /></View>

      {!overview && !scanner && !error ? <View style={styles.loading}><ActivityIndicator color={t.accent} /><Text style={styles.muted}>Escaneando mercado…</Text></View> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <SectionHeader title="Benchmarks" action="Mercados" onAction={() => router.push('/markets')} />
      <Card>
        {overview?.benchmarks?.length ? overview.benchmarks.map((item) => <InstrumentRow key={item.symbol} ticker={item.symbol} name={item.name} meta={item.source} value={formatPrice(item.price)} change={item.changePct} />) : <EmptyState title="Sin benchmark" text="El backend no devolvió benchmarks verificables." />}
      </Card>

      <SectionHeader title="Macro" />
      <Card>
        {overview?.macro?.length ? overview.macro.map((item) => <InstrumentRow key={item.symbol} ticker={item.symbol} name={item.name} meta={item.sector} value={formatPrice(item.price)} change={item.changePct} />) : <EmptyState title="Sin macro" text="No se fabrican series cuando la fuente no responde." />}
      </Card>

      <SectionHeader title="Movimientos del snapshot" />
      <Card>
        {scanner?.items?.length ? scanner.items.map((item) => <InstrumentRow key={item.symbol} ticker={item.symbol} name={item.name} meta={item.sector} value={formatPrice(item.price)} change={item.changePct} />) : <EmptyState title="Scanner vacío" text="Sin datos suficientes para ordenar movimientos." />}
      </Card>

      <SectionHeader title="Motores" action="Ver todos" onAction={() => router.push('/evidence')} />
      <Card>
        {engines?.items.map((engine, index) => (
          <View key={engine.id} style={[styles.engineRow, index === engines.items.length - 1 && styles.lastRow]}>
            <View style={{ flex: 1 }}><Text style={styles.engineName}>{engine.name}</Text><Text style={styles.engineText}>{engine.description}</Text></View>
            <Pill label={engine.state} tone={engine.state === 'LIVE' ? 'positive' : 'warning'} />
          </View>
        ))}
      </Card>
      {overview ? <Text style={styles.guardrail}>{overview.guardrail}</Text> : null}
    </AtlasBrokerShell>
  );
}

function formatPrice(value: number | null): string { return value == null ? '—' : value.toFixed(2); }

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  loading: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12 },
  muted: { color: t.textMuted, fontSize: 12 },
  error: { color: t.negative, backgroundColor: t.negativeSoft, padding: 12, borderRadius: 12 },
  engineRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft, paddingVertical: 10 },
  lastRow: { borderBottomWidth: 0 },
  engineName: { color: t.text, fontWeight: '800', fontSize: 13 },
  engineText: { color: t.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  guardrail: { color: t.textFaint, fontSize: 10, lineHeight: 15 },
});
