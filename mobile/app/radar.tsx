import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import AtlasBottomNav from '../components/AtlasBottomNav';
import { AtlasOnlineApi, type AgenticSecurityPayload, type DislocationPayload, type MarketScanner, type RotationItem, type RotationPayload } from '../core/api/atlasOnlineApi';

type Tab = 'rotation' | 'dislocation' | 'security' | 'scanner';

export default function RadarScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('rotation');
  const [rotation, setRotation] = useState<RotationPayload | null>(null);
  const [dislocation, setDislocation] = useState<DislocationPayload | null>(null);
  const [security, setSecurity] = useState<AgenticSecurityPayload | null>(null);
  const [scanner, setScanner] = useState<MarketScanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      AtlasOnlineApi.marketRotation(),
      AtlasOnlineApi.marketDislocation(20),
      AtlasOnlineApi.agenticSecurity(),
      AtlasOnlineApi.marketScanner('all', 30),
    ]);
    if (results[0].status === 'fulfilled') setRotation(results[0].value);
    if (results[1].status === 'fulfilled') setDislocation(results[1].value);
    if (results[2].status === 'fulfilled') setSecurity(results[2].value);
    if (results[3].status === 'fulfilled') setScanner(results[3].value);
    if (results.every((result) => result.status === 'rejected')) {
      const first = results[0];
      setError(first.status === 'rejected' && first.reason instanceof Error ? first.reason.message : 'Radar Ω no disponible.');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#2ed19a" />}>
        <Text style={styles.eyebrow}>EARLY SIGNALS · NO THESIS MUTATION</Text>
        <Text style={styles.title}>Radar Ω</Text>
        <Text style={styles.subtitle}>Dónde se mueve el mercado, dónde aparece una dislocación y qué candidatos deben pasar después por evidencia, Money Rotation Ω y el scorer ATLAS.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          <TabButton label="ROTACIÓN Ω" active={tab === 'rotation'} onPress={() => setTab('rotation')} />
          <TabButton label="DISLOCATION Ω" active={tab === 'dislocation'} onPress={() => setTab('dislocation')} />
          <TabButton label="AGENTIC SECURITY" active={tab === 'security'} onPress={() => setTab('security')} />
          <TabButton label="MOVERS" active={tab === 'scanner'} onPress={() => setTab('scanner')} />
        </ScrollView>

        {error ? <View style={styles.error}><Text style={styles.errorTitle}>RADAR NO DISPONIBLE</Text><Text style={styles.errorText}>{error}</Text></View> : null}
        {loading ? <View style={styles.loading}><ActivityIndicator size="large" color="#2ed19a" /><Text style={styles.loadingText}>Calculando señales de régimen…</Text></View> : null}

        {!loading && tab === 'rotation' ? <RotationView payload={rotation} onTicker={(symbol) => router.push({ pathname: '/ticker', params: { symbol, context: 'candidate' } })} /> : null}
        {!loading && tab === 'dislocation' ? <DislocationView payload={dislocation} onTicker={(symbol) => router.push({ pathname: '/ticker', params: { symbol, context: 'candidate' } })} /> : null}
        {!loading && tab === 'security' ? <SecurityView payload={security} onTicker={(symbol) => router.push({ pathname: '/ticker', params: { symbol, context: 'candidate' } })} /> : null}
        {!loading && tab === 'scanner' ? <ScannerView payload={scanner} onTicker={(symbol) => router.push({ pathname: '/ticker', params: { symbol, context: 'candidate' } })} /> : null}
      </ScrollView>
      <AtlasBottomNav active="radar" />
    </View>
  );
}

function RotationView({ payload, onTicker }: { payload: RotationPayload | null; onTicker: (symbol: string) => void }) {
  if (!payload) return <Empty text="Money Rotation Ω no devolvió datos." />;
  return (
    <>
      <View style={styles.heroCard}>
        <Text style={styles.cardLabel}>MONEY ROTATION Ω · MARKET SENSOR</Text>
        <Text style={styles.heroTitle}>{payload.earlyInflows.length} proxies tempranos</Text>
        <Text style={styles.cardText}>Este feed móvil es solo un sensor de precio/retornos. No declara R3 ni R4 canónicos. MONEY ROTATION Ω v1.3 exige flujos comparables, fuerza relativa, revisiones, breadth/volumen y reacción a fundamentales antes de promover una fase.</Text>
      </View>
      <SectionTitle title="CANDIDATOS PARA VALIDAR" subtitle="Proxy de mercado · todavía no R3/R4 canónico" />
      {payload.earlyInflows.length ? payload.earlyInflows.map((item) => <RotationRow key={item.symbol} item={item} onPress={() => onTicker(item.symbol)} />) : <Empty text="No hay proxies tempranos detectados con el sensor actual." />}
      <SectionTitle title="RANKING DEL SENSOR" subtitle="Sectores + macro proxies · precio, no flujo institucional demostrado" />
      {payload.items.map((item) => <RotationRow key={`all-${item.symbol}`} item={item} onPress={() => onTicker(item.symbol)} />)}
      <Guardrail text={`${payload.guardrail} MONEY ROTATION Ω v1.3 mantiene las fases canónicas separadas de este ranking de precio.`} />
    </>
  );
}

function DislocationView({ payload, onTicker }: { payload: DislocationPayload | null; onTicker: (symbol: string) => void }) {
  if (!payload) return <Empty text="Historical Dislocation Ω no devolvió datos." />;
  return (
    <>
      <View style={styles.heroCard}>
        <Text style={styles.cardLabel}>HISTORICAL DISLOCATION Ω</Text>
        <Text style={styles.heroTitle}>{payload.items.length} candidatos</Text>
        <Text style={styles.cardText}>Busca 1 año aún negativo con giro positivo de 20 sesiones. El precio abre investigación; no demuestra que el negocio esté sano ni que haya pasado a R3.</Text>
      </View>
      {payload.items.map((item) => <RotationRow key={item.symbol} item={item} onPress={() => onTicker(item.symbol)} showYear />)}
      <Guardrail text={payload.guardrail} />
    </>
  );
}

function SecurityView({ payload, onTicker }: { payload: AgenticSecurityPayload | null; onTicker: (symbol: string) => void }) {
  if (!payload) return <Empty text="Agentic Security Ω no devolvió datos." />;
  return (
    <>
      <View style={styles.heroCard}>
        <Text style={styles.cardLabel}>{payload.engine.toUpperCase()}</Text>
        <Text style={styles.heroTitle}>Futuros Protectores Digitales</Text>
        <Text style={styles.cardText}>Seguridad, identidad, runtime, Zero Trust, protección de datos/modelos y observabilidad para agentes autónomos.</Text>
      </View>
      {payload.items.map((item) => (
        <Pressable key={item.ticker} onPress={() => onTicker(item.ticker)} accessibilityRole="button" accessibilityLabel={`Analizar ${item.ticker}`} style={({ pressed }) => [styles.securityRow, pressed && styles.pressed]}>
          <View style={styles.flex}><Text style={styles.symbol}>{item.ticker}</Text><Text style={styles.name}>{item.role}</Text></View>
          <Text style={styles.pending}>{item.state.replaceAll('_', ' ')}</Text>
        </Pressable>
      ))}
      <Guardrail text={payload.guardrail} />
    </>
  );
}

function ScannerView({ payload, onTicker }: { payload: MarketScanner | null; onTicker: (symbol: string) => void }) {
  if (!payload) return <Empty text="Scanner no devolvió datos." />;
  return (
    <>
      <View style={styles.heroCard}><Text style={styles.cardLabel}>MARKET MOVERS</Text><Text style={styles.heroTitle}>{payload.count} movimientos</Text><Text style={styles.cardText}>Movimiento diario absoluto. Sirve para descubrimiento, nunca como criterio de compra por sí solo.</Text></View>
      {payload.items.map((item) => (
        <Pressable key={item.symbol} onPress={() => onTicker(item.symbol)} style={({ pressed }) => [styles.moverRow, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Abrir ${item.symbol}`}>
          <View style={styles.flex}><Text style={styles.symbol}>{item.symbol}</Text><Text style={styles.name}>{item.name}</Text></View>
          <View style={styles.right}><Text style={styles.price}>{item.price == null ? '—' : format(item.price)}</Text><Text style={(item.changePct ?? 0) >= 0 ? styles.positive : styles.negative}>{pct(item.changePct)}</Text></View>
        </Pressable>
      ))}
      <Guardrail text={payload.guardrail} />
    </>
  );
}

function RotationRow({ item, onPress, showYear = false }: { item: RotationItem; onPress: () => void; showYear?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${item.symbol}`} onPress={onPress} style={({ pressed }) => [styles.rotationRow, pressed && styles.pressed]}>
      <View style={styles.flex}>
        <View style={styles.symbolRow}><Text style={styles.symbol}>{item.symbol}</Text><Text style={styles.phase}>PRECIO · {item.phase.replaceAll('_', ' ')}</Text></View>
        <Text style={styles.name}>{item.name} · {item.sector}</Text>
        <Text style={styles.returnLine}>20d {pct(item.ret20)} · 60d {pct(item.ret60)}{showYear ? ` · 1A ${pct(item.ret252)}` : ''}</Text>
      </View>
      <View style={styles.rotationScore}><Text style={styles.rotationValue}>{Math.round(item.rotationScore)}</Text><Text style={styles.rotationLabel}>PX Ω</Text></View>
    </Pressable>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>;
}
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionSub}>{subtitle}</Text></View>; }
function Guardrail({ text }: { text: string }) { return <View style={styles.guardrail}><Text style={styles.guardrailTitle}>GUARDRAIL Ω</Text><Text style={styles.guardrailText}>{text}</Text></View>; }
function Empty({ text }: { text: string }) { return <Text style={styles.empty}>{text}</Text>; }
function pct(value: number | null | undefined) { return value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`; }
function format(value: number) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, scroll: { flex: 1 }, content: { padding: 18, paddingBottom: 38, gap: 11 }, flex: { flex: 1 }, right: { alignItems: 'flex-end' }, pressed: { opacity: 0.58 },
  eyebrow: { color: '#68c9ef', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 6 }, title: { color: '#f5f7f8', fontSize: 32, fontWeight: '900' }, subtitle: { color: '#87939e', fontSize: 12, lineHeight: 18 },
  tabs: { gap: 8, paddingVertical: 8 }, tab: { borderWidth: 1, borderColor: '#29343c', backgroundColor: '#0d1115', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }, tabActive: { borderColor: '#367c9e', backgroundColor: '#10232d' }, tabText: { color: '#7d8993', fontSize: 9, fontWeight: '900' }, tabTextActive: { color: '#78d0fa' },
  loading: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 12 }, loadingText: { color: '#798690', fontSize: 11 }, error: { borderRadius: 13, backgroundColor: '#1a0d11', borderWidth: 1, borderColor: '#5f2937', padding: 12 }, errorTitle: { color: '#ff788b', fontSize: 9, fontWeight: '900' }, errorText: { color: '#b7838c', fontSize: 10, marginTop: 5 },
  heroCard: { borderRadius: 17, backgroundColor: '#0d151a', borderWidth: 1, borderColor: '#294250', padding: 15 }, cardLabel: { color: '#68caef', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }, heroTitle: { color: '#f4f7f8', fontSize: 23, fontWeight: '900', marginTop: 8 }, cardText: { color: '#87949e', fontSize: 11, lineHeight: 17, marginTop: 6 },
  section: { marginTop: 8 }, sectionTitle: { color: '#dfe4e8', fontSize: 12, fontWeight: '900' }, sectionSub: { color: '#63717c', fontSize: 9, marginTop: 2 },
  rotationRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0c1013', borderRadius: 13, borderWidth: 1, borderColor: '#232c33', padding: 12 }, symbolRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, symbol: { color: '#f3f5f6', fontSize: 16, fontWeight: '900' }, phase: { color: '#d8b760', fontSize: 7.5, fontWeight: '900' }, name: { color: '#78858e', fontSize: 10, marginTop: 3 }, returnLine: { color: '#91a0aa', fontSize: 9, marginTop: 7, fontWeight: '800' }, rotationScore: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#091117', borderWidth: 1, borderColor: '#29465a' }, rotationValue: { color: '#74d0f8', fontSize: 18, fontWeight: '900' }, rotationLabel: { color: '#587384', fontSize: 6.5, fontWeight: '900' },
  securityRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0c1013', borderRadius: 13, borderWidth: 1, borderColor: '#232c33', padding: 12 }, pending: { color: '#c7a95d', fontSize: 7, fontWeight: '900', maxWidth: 110, textAlign: 'right' },
  moverRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0c1013', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#242b31', paddingVertical: 9, paddingHorizontal: 5 }, price: { color: '#e6eaed', fontSize: 13, fontWeight: '800' }, positive: { color: '#35d89b', fontSize: 11, fontWeight: '900', marginTop: 3 }, negative: { color: '#ff6a80', fontSize: 11, fontWeight: '900', marginTop: 3 },
  guardrail: { borderRadius: 13, borderWidth: 1, borderColor: '#334525', backgroundColor: '#0e150b', padding: 13, marginTop: 6 }, guardrailTitle: { color: '#a7bc76', fontSize: 9, fontWeight: '900' }, guardrailText: { color: '#82916d', fontSize: 10, lineHeight: 15, marginTop: 5 }, empty: { color: '#71808a', textAlign: 'center', paddingVertical: 38 },
});