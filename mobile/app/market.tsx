import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AtlasOnlineApi, type MarketOverview, type MarketQuote } from '../core/api/atlasOnlineApi';

export default function MarketScreen() {
  const router = useRouter();
  const [data, setData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      setData(await AtlasOnlineApi.marketOverview());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const open = (symbol: string) => router.push({ pathname: '/ticker', params: { symbol, context: 'candidate' } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2ed19a" />}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View><Text style={styles.title}>Mercados Ω</Text><Text style={styles.subtitle}>Índices · sectores · macro régimen</Text></View>
      </View>

      <View style={styles.notice}><Text style={styles.noticeTitle}>MARKET SENSOR</Text><Text style={styles.noticeText}>Oro, petróleo, dólar, duración y crédito se leen junto con la rotación sectorial. Son sensores de contexto; no cambian una tesis de empresa por sí solos.</Text></View>

      {loading ? <View style={styles.loading}><ActivityIndicator size="large" color="#2ed19a" /><Text style={styles.loadingText}>Leyendo mercados…</Text></View> : null}
      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}

      {data ? (
        <>
          <Section title="ÍNDICES / ACTIVOS" subtitle="Panorama rápido">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>{data.benchmarks.map((item) => <QuoteCard key={item.symbol} item={item} onPress={() => open(item.symbol)} />)}</ScrollView>
          </Section>
          <Section title="ROTACIÓN SECTORIAL" subtitle="Proxies líquidos por sector">
            {data.sectors.map((item) => <QuoteRow key={item.symbol} item={item} onPress={() => open(item.symbol)} />)}
          </Section>
          <Section title="MACRO RÉGIMEN Ω" subtitle="Oro · petróleo · dólar · duración · crédito">
            {data.macro.map((item) => <QuoteRow key={item.symbol} item={item} onPress={() => open(item.symbol)} />)}
          </Section>
          <View style={styles.guardrail}><Text style={styles.guardrailTitle}>FUENTE / FRESCURA</Text><Text style={styles.guardrailText}>{data.source} · {data.delayed ? 'referencia/diferido' : 'proveedor'} · {data.guardrail}</Text></View>
        </>
      ) : null}
    </ScrollView>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionSub}>{subtitle}</Text><View style={styles.sectionBody}>{children}</View></View>;
}
function QuoteCard({ item, onPress }: { item: MarketQuote; onPress: () => void }) {
  const positive = (item.changePct ?? 0) >= 0;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quoteCard, pressed && styles.pressed]}><Text style={styles.quoteName}>{item.name}</Text><Text style={styles.quoteSymbol}>{item.symbol}</Text><Text style={styles.quotePrice}>{item.price == null ? '—' : format(item.price)}</Text><Text style={[styles.quotePct, positive ? styles.positive : styles.negative]}>{pct(item.changePct)}</Text></Pressable>;
}
function QuoteRow({ item, onPress }: { item: MarketQuote; onPress: () => void }) {
  const positive = (item.changePct ?? 0) >= 0;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Abrir ${item.symbol}`} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.flex}><Text style={styles.rowSymbol}>{item.symbol}</Text><Text style={styles.rowName}>{item.name}</Text></View><View style={styles.right}><Text style={styles.rowPrice}>{item.price == null ? '—' : format(item.price)}</Text><Text style={[styles.rowPct, positive ? styles.positive : styles.negative]}>{pct(item.changePct)}</Text></View></Pressable>;
}
function pct(value: number | null | undefined) { return value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`; }
function format(value: number) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { padding: 18, paddingBottom: 50, gap: 14 }, flex: { flex: 1 }, right: { alignItems: 'flex-end' }, pressed: { opacity: 0.58 }, positive: { color: '#32d399' }, negative: { color: '#ff657b' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }, back: { width: 43, height: 43, borderRadius: 22, backgroundColor: '#11161a', borderWidth: 1, borderColor: '#293139', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#edf1f3', fontSize: 33, lineHeight: 34, marginTop: -4 }, title: { color: '#f5f7f8', fontSize: 26, fontWeight: '900' }, subtitle: { color: '#67747e', fontSize: 9, marginTop: 2 },
  notice: { borderRadius: 15, borderWidth: 1, borderColor: '#2a4250', backgroundColor: '#0a151a', padding: 14 }, noticeTitle: { color: '#6fcbed', fontSize: 9, fontWeight: '900' }, noticeText: { color: '#7d8c96', fontSize: 10, lineHeight: 15, marginTop: 5 }, loading: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 12 }, loadingText: { color: '#77838c' }, error: { borderRadius: 13, backgroundColor: '#1a0d11', borderWidth: 1, borderColor: '#5e2937', padding: 12 }, errorText: { color: '#d28a96', fontSize: 10 },
  section: { marginTop: 4 }, sectionTitle: { color: '#e9edef', fontSize: 12, fontWeight: '900', letterSpacing: 0.7 }, sectionSub: { color: '#68747e', fontSize: 8.5, marginTop: 2 }, sectionBody: { marginTop: 9 }, horizontal: { gap: 9, paddingRight: 10 }, quoteCard: { width: 143, minHeight: 122, borderRadius: 15, borderWidth: 1, borderColor: '#292f35', backgroundColor: '#101419', padding: 13 }, quoteName: { color: '#d7dce0', fontSize: 11.5, fontWeight: '800' }, quoteSymbol: { color: '#626f78', fontSize: 8, marginTop: 2, fontWeight: '900' }, quotePrice: { color: '#f3f5f6', fontSize: 20, fontWeight: '900', marginTop: 17 }, quotePct: { fontSize: 10.5, fontWeight: '900', marginTop: 4 },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#252b30', paddingHorizontal: 4 }, rowSymbol: { color: '#f0f3f5', fontSize: 14, fontWeight: '900' }, rowName: { color: '#737f88', fontSize: 9.5, marginTop: 3 }, rowPrice: { color: '#e4e8eb', fontSize: 12, fontWeight: '800' }, rowPct: { fontSize: 9.5, fontWeight: '900', marginTop: 3 },
  guardrail: { borderRadius: 13, borderWidth: 1, borderColor: '#344625', backgroundColor: '#0e150b', padding: 13 }, guardrailTitle: { color: '#a7bc77', fontSize: 8.5, fontWeight: '900' }, guardrailText: { color: '#81906c', fontSize: 9.5, lineHeight: 14, marginTop: 5 },
});
