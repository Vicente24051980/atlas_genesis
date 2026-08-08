import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

import { AtlasApi, type MarketSignals } from '../core/api/atlasApi';
import { db } from '../db/client';
import { position, radar, watchlist } from '../db/schema';

type ScanRow = { ticker: string; source: 'PORTFOLIO' | 'WATCHLIST'; signals?: MarketSignals; error?: string };

export default function RadarScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const [positions, watches] = await Promise.all([db.select().from(position), db.select().from(watchlist)]);
      const sources = new Map<string, 'PORTFOLIO' | 'WATCHLIST'>();
      for (const item of watches.filter((x) => x.state === 'ACTIVE')) sources.set(item.canonicalTicker, 'WATCHLIST');
      for (const item of positions.filter((x) => x.status === 'ACTIVE')) sources.set(item.canonicalTicker, 'PORTFOLIO');
      const tickers = [...sources.keys()];
      const scanned: ScanRow[] = [];

      for (let i = 0; i < tickers.length; i += 6) {
        const batch = tickers.slice(i, i + 6);
        const result = await Promise.all(batch.map(async (ticker): Promise<ScanRow> => {
          try {
            const signals = await AtlasApi.signals(ticker);
            return { ticker, source: sources.get(ticker) || 'WATCHLIST', signals };
          } catch (error) {
            return { ticker, source: sources.get(ticker) || 'WATCHLIST', error: error instanceof Error ? error.message : String(error) };
          }
        }));
        scanned.push(...result);
      }

      scanned.sort((a, b) => (b.signals?.downsideScore || -1) - (a.signals?.downsideScore || -1));
      setRows(scanned);
      setMessage(tickers.length ? `${tickers.length} activos revisados. Radar ordenado por riesgo probabilístico.` : 'Añade activos a Portfolio o Watchlist para activar Radar.');

      const hourBucket = new Date().toISOString().slice(0, 13).replace(/[-T:]/g, '');
      for (const row of scanned) {
        const score = row.signals?.downsideScore;
        if (score == null || score < 25) continue;
        const id = `AUTO-DOWNSIDE-${row.ticker}-${hourBucket}`;
        const existing = await db.select().from(radar).where(eq(radar.id, id)).limit(1);
        if (existing.length) continue;
        await db.insert(radar).values({
          id,
          subjectId: row.ticker,
          signalType: 'DOWNSIDE_ALERT',
          score,
          severity: row.signals?.downsideSeverity || 'WATCH',
          payloadJson: JSON.stringify({
            automatic: true,
            source: row.source,
            reasons: row.signals?.reasons || [],
            waveScore: row.signals?.waveScore,
            momentumScore: row.signals?.momentumScore,
            streak: row.signals?.streak,
            algorithmVersion: row.signals?.algorithmVersion,
          }),
          createdAt: new Date(),
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const critical = rows.filter((x) => (x.signals?.downsideScore || 0) >= 75).length;
  const elevated = rows.filter((x) => (x.signals?.downsideScore || 0) >= 50 && (x.signals?.downsideScore || 0) < 75).length;
  const watch = rows.filter((x) => (x.signals?.downsideScore || 0) >= 25 && (x.signals?.downsideScore || 0) < 50).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#64d8ff" />}>
      <Text style={styles.eyebrow}>ATLAS Ω · EARLY DOWNSIDE RADAR</Text>
      <Text style={styles.title}>Deterioro probabilístico</Text>
      <Text style={styles.subtitle}>Busca pérdida de tendencia, aceleración negativa, volatilidad, volumen y rachas. No predice caídas con certeza y nunca cambia Thesis Ω.</Text>

      <View style={styles.metrics}>
        <Metric label="CRITICAL" value={critical} tone="bad" />
        <Metric label="ELEVATED" value={elevated} tone="warn" />
        <Metric label="WATCH" value={watch} tone="warn" />
        <Metric label="SCANNED" value={rows.length} />
      </View>
      <View style={styles.guard}><Text style={styles.guardTitle}>GUARDRAIL</Text><Text style={styles.guardText}>Downside Alert Ω = señal observacional. Precio, momentum o volumen no pueden convertirse por sí solos en Evidence, falsificador ni orden de venta.</Text></View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {loading ? <ActivityIndicator color="#64d8ff" size="large" style={{ marginTop: 30 }} /> : null}

      {rows.map((row) => {
        const s = row.signals;
        const severity = s?.downsideSeverity || 'UNKNOWN';
        return (
          <Pressable key={row.ticker} onPress={() => router.push({ pathname: '/terminal', params: { ticker: row.ticker } })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.topRow}>
              <View><View style={styles.tickerLine}><Text style={styles.ticker}>{row.ticker}</Text><Text style={styles.source}>{row.source}</Text></View><Text style={styles.streak}>{s ? `${s.streak.direction} streak ${s.streak.length} · ${s.streak.downDays20} rojos/20` : 'Sin señal'}</Text></View>
              <View style={[styles.severity, severity === 'CRITICAL' ? styles.critical : severity === 'ELEVATED' ? styles.elevated : severity === 'WATCH' ? styles.watching : styles.normal]}><Text style={styles.severityText}>{severity}</Text></View>
            </View>
            <View style={styles.scoreRow}>
              <SmallScore label="DOWNSIDE" value={s?.downsideScore} bad />
              <SmallScore label="MOMENTUM" value={s?.momentumScore} />
              <SmallScore label="WAVE" value={s?.waveScore} />
            </View>
            {s?.reasons.slice(0, 3).map((reason) => <Text key={reason} style={styles.reason}>• {reason}</Text>)}
            {row.error ? <Text style={styles.error}>{row.error}</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: 'bad' | 'warn' }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, tone === 'bad' ? styles.redText : tone === 'warn' ? styles.amberText : undefined]}>{value}</Text></View>;
}
function SmallScore({ label, value, bad = false }: { label: string; value?: number | null; bad?: boolean }) {
  const tone = value == null ? undefined : bad ? (value >= 50 ? styles.redText : value >= 25 ? styles.amberText : styles.greenText) : value >= 70 ? styles.greenText : value < 40 ? styles.amberText : undefined;
  return <View style={styles.smallScore}><Text style={styles.smallLabel}>{label}</Text><Text style={[styles.smallValue, tone]}>{value == null ? '—' : value.toFixed(0)}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05080c' },
  content: { padding: 14, paddingBottom: 42, gap: 10 },
  eyebrow: { color: '#617589', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: '#eff4f8', fontSize: 24, fontWeight: '950' },
  subtitle: { color: '#728497', fontSize: 11, lineHeight: 17 },
  metrics: { flexDirection: 'row', gap: 5 },
  metric: { flex: 1, backgroundColor: '#090e14', borderWidth: 1, borderColor: '#17222e', borderRadius: 7, padding: 8 },
  metricLabel: { color: '#526476', fontSize: 6, fontWeight: '950' },
  metricValue: { color: '#b9c7d3', fontSize: 18, fontWeight: '950', marginTop: 3 },
  guard: { backgroundColor: '#161309', borderWidth: 1, borderColor: '#4e4219', borderRadius: 8, padding: 10 },
  guardTitle: { color: '#d8b958', fontSize: 8, fontWeight: '950' },
  guardText: { color: '#92804c', fontSize: 9, lineHeight: 14, marginTop: 3 },
  message: { color: '#65798c', fontSize: 9 },
  card: { backgroundColor: '#090e14', borderWidth: 1, borderColor: '#17222e', borderRadius: 9, padding: 11, gap: 7 },
  pressed: { opacity: 0.62 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  tickerLine: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  ticker: { color: '#dfe8ef', fontSize: 15, fontWeight: '950' },
  source: { color: '#586b7d', fontSize: 7, fontWeight: '900' },
  streak: { color: '#5d7082', fontSize: 8, marginTop: 3 },
  severity: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start' },
  critical: { backgroundColor: '#240c12', borderColor: '#702536' },
  elevated: { backgroundColor: '#22130a', borderColor: '#754420' },
  watching: { backgroundColor: '#201b0a', borderColor: '#65551e' },
  normal: { backgroundColor: '#0b1915', borderColor: '#1d5140' },
  severityText: { color: '#c5d0da', fontSize: 7, fontWeight: '950' },
  scoreRow: { flexDirection: 'row', gap: 5 },
  smallScore: { flex: 1, backgroundColor: '#0b1219', borderRadius: 6, padding: 7 },
  smallLabel: { color: '#506274', fontSize: 6, fontWeight: '950' },
  smallValue: { color: '#b7c5d1', fontSize: 14, fontWeight: '950', marginTop: 2 },
  reason: { color: '#778a9c', fontSize: 9, lineHeight: 14 },
  error: { color: '#ff7182', fontSize: 8 },
  redText: { color: '#ff697c' },
  amberText: { color: '#e6bd54' },
  greenText: { color: '#4fdca3' },
});
