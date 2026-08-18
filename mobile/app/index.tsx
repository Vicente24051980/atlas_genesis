import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, InstrumentRow, MetricTile, Pill, SectionHeader } from '../components/BrokerUi';
import { MobileApi, type MobileHealth, type PortfolioPayload } from '../core/api/mobileApi';
import { AtlasOnlineApi, type MarketSnapshot } from '../core/api/atlasOnlineUiCompat';
import { BrokerApi, type BrokerStatus } from '../core/api/brokerApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function HomeScreen() {
  const [health, setHealth] = useState<MobileHealth | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [market, setMarket] = useState<MarketSnapshot | null>(null);
  const [broker, setBroker] = useState<BrokerStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const [healthResult, portfolioResult, marketResult, brokerResult] = await Promise.allSettled([
      MobileApi.health(),
      MobileApi.portfolio(),
      AtlasOnlineApi.marketSnapshot(),
      BrokerApi.status(),
    ]);
    setHealth(healthResult.status === 'fulfilled' ? healthResult.value : null);
    setPortfolio(portfolioResult.status === 'fulfilled' ? portfolioResult.value : null);
    setMarket(marketResult.status === 'fulfilled' ? marketResult.value : null);
    setBroker(brokerResult.status === 'fulfilled' ? brokerResult.value : null);
    const failed = [healthResult, portfolioResult, marketResult].filter((item) => item.status === 'rejected');
    if (failed.length === 3) setError('ATLAS no pudo cargar los datos principales. Desliza para reintentar.');
  }, []);

  useEffect(() => { void load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const provider = health?.preferred_provider || 'Conectando';
  const brokerReady = broker?.readReady === true;

  return (
    <AtlasBrokerShell active="home" title="Inicio" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void refresh(); }} tintColor={t.accent} />}>
      <View style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>CENTRO DE INVERSIÓN</Text>
          <Text style={styles.heroTitle}>ATLAS está {health?.ok ? 'online' : 'conectando'}</Text>
          <Text style={styles.heroSub}>Datos, cartera, inteligencia y broker en una sola interfaz.</Text>
        </View>
        {!health && !error ? <ActivityIndicator color={t.accent} /> : <Pill label={health?.ok ? 'LIVE' : 'CHECK'} tone={health?.ok ? 'positive' : 'warning'} />}
      </View>

      <View style={styles.metrics}>
        <MetricTile label="Cartera ATLAS" value={portfolio ? String(portfolio.count) : '—'} hint="posiciones en snapshot" />
        <MetricTile label="Proveedor" value={provider} tone="info" hint="fuente preferida" />
        <MetricTile label="Trading 212" value={brokerReady ? 'READY' : broker ? 'LOCKED' : '—'} tone={brokerReady ? 'positive' : 'default'} hint="bridge server-side" />
        <MetricTile label="Ejecución live" value={broker?.liveExecutionLocked === false ? 'ON' : 'OFF'} tone={broker?.liveExecutionLocked === false ? 'negative' : 'positive'} hint="guardrail" />
      </View>

      <SectionHeader title="Acciones rápidas" />
      <View style={styles.quickGrid}>
        <QuickAction glyph="⌕" label="Analizar" onPress={() => router.push('/analyze')} />
        <QuickAction glyph="↗" label="Mercados" onPress={() => router.push('/markets')} />
        <QuickAction glyph="T" label="Broker Ω" onPress={() => router.push('/broker')} />
        <QuickAction glyph="E" label="Evidence" onPress={() => router.push('/evidence')} />
      </View>

      <SectionHeader title="Mercado" action="Explorar" onAction={() => router.push('/markets')} />
      <Card>
        {market?.items?.length ? market.items.map((item) => (
          <InstrumentRow
            key={item.symbol}
            ticker={item.symbol}
            name={item.name}
            meta={item.delayed ? 'Referencia / delayed' : item.source}
            value={formatPrice(item.price)}
            change={item.changePct}
            onPress={() => router.push({ pathname: '/analyze', params: { ticker: item.symbol } })}
          />
        )) : <Text style={styles.muted}>Esperando snapshot de mercado…</Text>}
      </Card>

      <SectionHeader title="Inteligencia ATLAS Ω" action="Radar" onAction={() => router.push('/radar')} />
      <Card>
        <IntelRow title="Global CAPEX Chain Ω" text="Dependencia económica, bottlenecks y captura de CAPEX." state="ACTIVE" />
        <IntelRow title="Economic Proof Ω" text="Demanda → captura → conversión → FCF → ROIC." state="ACTIVE" />
        <IntelRow title="Falsifiers Ω" text="Veto independiente antes de cualquier decisión." state="GATE" />
        <IntelRow title="AI Routing Tollbooth Ω" text="Capa de routing/orquestación como nuevo radar estructural." state="RESEARCH" last />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.disclaimer}>Los precios mostrados por ATLAS son informativos/de referencia cuando la fuente lo indica. La interfaz no convierte una señal en una orden automáticamente.</Text>
    </AtlasBrokerShell>
  );
}

function QuickAction({ glyph, label, onPress }: { glyph: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <View style={styles.quickGlyph}><Text style={styles.quickGlyphText}>{glyph}</Text></View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function IntelRow({ title, text, state, last = false }: { title: string; text: string; state: string; last?: boolean }) {
  return (
    <View style={[styles.intelRow, last && styles.lastRow]}>
      <View style={styles.intelBody}><Text style={styles.intelTitle}>{title}</Text><Text style={styles.intelText}>{text}</Text></View>
      <Pill label={state} tone={state === 'RESEARCH' ? 'info' : state === 'GATE' ? 'warning' : 'positive'} />
    </View>
  );
}

function formatPrice(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value >= 1000 ? value.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : value.toFixed(2);
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  heroCopy: { flex: 1 },
  heroLabel: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  heroTitle: { color: t.text, fontSize: 27, fontWeight: '900', letterSpacing: -0.8, marginTop: 5 },
  heroSub: { color: t.textMuted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quickGrid: { flexDirection: 'row', gap: 8 },
  quickAction: { flex: 1, backgroundColor: t.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 15, minHeight: 82, alignItems: 'center', justifyContent: 'center', gap: 7 },
  quickGlyph: { width: 31, height: 31, borderRadius: 10, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' },
  quickGlyphText: { color: t.accent, fontWeight: '900', fontSize: 15 },
  quickLabel: { color: t.text, fontSize: 10, fontWeight: '800' },
  pressed: { opacity: 0.6 },
  muted: { color: t.textMuted, fontSize: 12, paddingVertical: 10 },
  intelRow: { minHeight: 67, flexDirection: 'row', gap: 12, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft, paddingVertical: 10 },
  lastRow: { borderBottomWidth: 0 },
  intelBody: { flex: 1 },
  intelTitle: { color: t.text, fontSize: 13, fontWeight: '800' },
  intelText: { color: t.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  error: { color: t.negative, backgroundColor: t.negativeSoft, padding: 12, borderRadius: 12 },
  disclaimer: { color: t.textFaint, fontSize: 10, lineHeight: 15, paddingVertical: 4 },
});
