import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import AtlasBottomNav from '../components/AtlasBottomNav';
import { AtlasOnlineApi, type MarketQuote, type MarketSearchItem, type RotationItem, type TrackedUniverse } from '../core/api/atlasOnlineApi';

type Direction = 'all' | 'up' | 'down';

const FALLBACK: MarketQuote[] = [
  { symbol: 'SPY', name: 'S&P 500', sector: 'US Market', price: null, change: null, changePct: null, open: null, high: null, low: null, previousClose: null, volume: null, asOfDate: null, asOfTime: null, source: 'ATLAS', delayed: true },
  { symbol: 'QQQ', name: 'Nasdaq 100', sector: 'US Tech', price: null, change: null, changePct: null, open: null, high: null, low: null, previousClose: null, volume: null, asOfDate: null, asOfTime: null, source: 'ATLAS', delayed: true },
  { symbol: 'DIA', name: 'Dow Jones', sector: 'US Blue Chips', price: null, change: null, changePct: null, open: null, high: null, low: null, previousClose: null, volume: null, asOfDate: null, asOfTime: null, source: 'ATLAS', delayed: true },
  { symbol: 'GLD', name: 'Oro', sector: 'Gold', price: null, change: null, changePct: null, open: null, high: null, low: null, previousClose: null, volume: null, asOfDate: null, asOfTime: null, source: 'ATLAS', delayed: true },
  { symbol: 'USO', name: 'Petróleo', sector: 'Oil', price: null, change: null, changePct: null, open: null, high: null, low: null, previousClose: null, volume: null, asOfDate: null, asOfTime: null, source: 'ATLAS', delayed: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [provider, setProvider] = useState('CARGANDO');
  const [universe, setUniverse] = useState<TrackedUniverse | null>(null);
  const [benchmarks, setBenchmarks] = useState<MarketQuote[]>([]);
  const [scanner, setScanner] = useState<MarketQuote[]>([]);
  const [earlyInflows, setEarlyInflows] = useState<RotationItem[]>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MarketSearchItem[]>([]);
  const [direction, setDirection] = useState<Direction>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const [healthResult, universeResult, snapshotResult, scannerResult, rotationResult] = await Promise.allSettled([
      AtlasOnlineApi.health(),
      AtlasOnlineApi.atlasUniverse(),
      AtlasOnlineApi.marketSnapshot(),
      AtlasOnlineApi.marketScanner('all', 20),
      AtlasOnlineApi.marketRotation(),
    ]);

    if (healthResult.status === 'fulfilled') {
      setApiOnline(Boolean(healthResult.value.ok));
      setProvider(healthResult.value.finnhub_configured ? 'ATLAS + FINNHUB + MARKET' : 'ATLAS + MARKET FALLBACK');
    } else {
      setApiOnline(false);
      setProvider('API NO DISPONIBLE');
    }
    if (universeResult.status === 'fulfilled') setUniverse(universeResult.value);
    if (snapshotResult.status === 'fulfilled') setBenchmarks(snapshotResult.value.items);
    if (scannerResult.status === 'fulfilled') setScanner(scannerResult.value.items);
    if (rotationResult.status === 'fulfilled') setEarlyInflows(rotationResult.value.earlyInflows.slice(0, 5));

    if ([universeResult, snapshotResult, scannerResult].every((result) => result.status === 'rejected')) {
      const first = universeResult.status === 'rejected' ? universeResult.reason : snapshotResult.status === 'rejected' ? snapshotResult.reason : scannerResult.status === 'rejected' ? scannerResult.reason : null;
      setError(first instanceof Error ? first.message : 'ATLAS no pudo cargar la portada.');
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const movers = useMemo(() => {
    if (direction === 'up') return scanner.filter((item) => (item.changePct ?? 0) > 0);
    if (direction === 'down') return scanner.filter((item) => (item.changePct ?? 0) < 0);
    return scanner;
  }, [scanner, direction]);

  const runSearch = async () => {
    const clean = query.trim();
    if (!clean) return;
    setSearching(true);
    setError('');
    try {
      const result = await AtlasOnlineApi.marketSearch(clean, 15);
      setSearchResults(result.items);
      if (result.items.length === 1 && result.items[0].symbol === clean.toUpperCase()) {
        router.push({ pathname: '/ticker', params: { symbol: result.items[0].symbol, context: 'candidate' } });
        setSearchResults([]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSearching(false);
    }
  };

  const openTicker = (symbol: string) => router.push({ pathname: '/ticker', params: { symbol, context: 'candidate' } });
  const marketCards = benchmarks.length ? benchmarks : FALLBACK;

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View><Text style={styles.brand}>ATLAS Ω</Text><Text style={styles.product}>INVESTMENT INTELLIGENCE</Text></View>
          <View style={[styles.status, apiOnline ? styles.statusOnline : styles.statusOffline]}><View style={[styles.dot, apiOnline ? styles.dotOnline : styles.dotOffline]} /><Text style={styles.statusText}>{apiOnline == null ? 'CHECK' : apiOnline ? 'ONLINE' : 'OFFLINE'}</Text></View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={(value) => { setQuery(value); if (!value.trim()) setSearchResults([]); }}
            onSubmitEditing={() => void runSearch()}
            returnKeyType="search"
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Ticker o empresa · NVDA, MSFT, TSLA…"
            placeholderTextColor="#6e7780"
            style={styles.searchInput}
            accessibilityLabel="Buscar ticker o empresa"
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Buscar" onPress={() => void runSearch()} style={styles.searchButton}>
            {searching ? <ActivityIndicator size="small" color="#e7ecef" /> : <Text style={styles.searchButtonText}>IR</Text>}
          </Pressable>
        </View>

        {searchResults.length ? (
          <View style={styles.results}>
            {searchResults.map((item) => (
              <Pressable key={item.symbol} accessibilityRole="button" accessibilityLabel={`Abrir ${item.symbol}`} onPress={() => { setSearchResults([]); openTicker(item.symbol); }} style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
                <View style={styles.flex}><Text style={styles.resultTicker}>{item.symbol}</Text><Text style={styles.resultName}>{item.name}</Text></View><Text style={styles.resultSector}>{item.sector}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.systemLine}><Text style={styles.systemText}>{provider}</Text><Pressable accessibilityRole="button" accessibilityLabel="Actualizar" onPress={() => void load()}><Text style={styles.refresh}>ACTUALIZAR</Text></Pressable></View>
        {error ? <View style={styles.error}><Text style={styles.errorTitle}>ATLAS ONLINE</Text><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.primaryGrid}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir Mi Cartera" onPress={() => router.push('/portfolio')} style={({ pressed }) => [styles.primaryCard, styles.portfolioCard, pressed && styles.pressed]}>
            <Text style={styles.primaryEyebrow}>MI CARTERA Ω</Text>
            <Text style={styles.primaryNumber}>{universe?.counts.portfolio ?? '—'}</Text>
            <Text style={styles.primaryLabel}>posiciones monitorizadas</Text>
            <Text style={styles.primaryAction}>AÑADIR · MANTENER · ESPERAR · REVISAR</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir Watchlist" onPress={() => router.push('/watchlist')} style={({ pressed }) => [styles.primaryCard, styles.watchCard, pressed && styles.pressed]}>
            <Text style={styles.primaryEyebrow}>WATCHLIST Ω</Text>
            <Text style={styles.primaryNumber}>{universe?.counts.watchlist ?? '—'}</Text>
            <Text style={styles.primaryLabel}>candidatos monitorizados</Text>
            <Text style={styles.primaryAction}>COMPRAR · ESPERAR · NO COMPRAR</Text>
          </Pressable>
        </View>

        {universe?.status === 'AWAITING_USER_CONFIRMATION' ? <View style={styles.bootstrap}><Text style={styles.bootstrapTitle}>LISTAS BOOTSTRAP</Text><Text style={styles.bootstrapText}>Motor, monitor y navegación ya están conectados. El servidor marca estas listas como pendientes de confirmación exacta antes de congelarlas como definitivas.</Text></View> : null}

        <SectionHeader title="Mercados" subtitle="Referencia/diferido · no precio de ejecución" action="VER MERCADOS" onPress={() => router.push('/market')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marketStrip}>
          {marketCards.map((item) => <MarketCard key={item.symbol} item={item} onPress={() => openTicker(item.symbol)} />)}
        </ScrollView>

        <SectionHeader title="Money Rotation Ω" subtitle="R3/R4 · primeras entradas de capital" action="ABRIR RADAR" onPress={() => router.push('/radar')} />
        {loading && !earlyInflows.length ? <LoadingLine /> : earlyInflows.length ? earlyInflows.map((item) => <RotationRow key={item.symbol} item={item} onPress={() => openTicker(item.symbol)} />) : <View style={styles.emptyCard}><Text style={styles.emptyText}>Sin señales R3/R4 disponibles ahora.</Text></View>}

        <View style={styles.moversHeader}>
          <View><Text style={styles.sectionTitle}>Tendencias actuales</Text><Text style={styles.sectionSub}>Movimiento diario · descubrimiento, no BUY</Text></View>
          <View style={styles.filters}>
            <Filter label="ALL" active={direction === 'all'} onPress={() => setDirection('all')} />
            <Filter label="↑" active={direction === 'up'} onPress={() => setDirection('up')} />
            <Filter label="↓" active={direction === 'down'} onPress={() => setDirection('down')} />
          </View>
        </View>
        {loading && !movers.length ? <LoadingLine /> : movers.slice(0, 10).map((item) => <MoverRow key={item.symbol} item={item} onPress={() => openTicker(item.symbol)} />)}

        <Pressable accessibilityRole="button" accessibilityLabel="Abrir Motores ATLAS Ω" onPress={() => router.push('/engines')} style={({ pressed }) => [styles.engineStrip, pressed && styles.pressed]}>
          <View style={styles.flex}><Text style={styles.engineEyebrow}>ENGINE ROOM Ω</Text><Text style={styles.engineTitle}>Motores ATLAS Ω</Text><Text style={styles.engineSub}>Quality · Growth · CAPEX · Valuation · Risk · Rotation · Dislocation · Agentic Security · Evidence</Text></View><Text style={styles.chevron}>›</Text>
        </Pressable>
      </ScrollView>
      <AtlasBottomNav active="home" />
    </View>
  );
}

function SectionHeader({ title, subtitle, action, onPress }: { title: string; subtitle: string; action: string; onPress: () => void }) {
  return <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionSub}>{subtitle}</Text></View><Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></Pressable></View>;
}
function MarketCard({ item, onPress }: { item: MarketQuote; onPress: () => void }) {
  const positive = (item.changePct ?? 0) >= 0;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${item.symbol}`} onPress={onPress} style={({ pressed }) => [styles.marketCard, pressed && styles.pressed]}><Text style={styles.marketName}>{item.name}</Text><Text style={styles.marketSymbol}>{item.symbol}</Text><Text style={styles.marketPrice}>{item.price == null ? '—' : number(item.price)}</Text><Text style={[styles.marketChange, positive ? styles.positive : styles.negative]}>{percent(item.changePct)}</Text></Pressable>;
}
function RotationRow({ item, onPress }: { item: RotationItem; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${item.symbol}`} onPress={onPress} style={({ pressed }) => [styles.rotationRow, pressed && styles.pressed]}><View style={styles.flex}><View style={styles.rowTop}><Text style={styles.rowTicker}>{item.symbol}</Text><Text style={styles.phase}>{item.phase.replaceAll('_', ' ')}</Text></View><Text style={styles.rowName}>{item.name} · {item.sector}</Text><Text style={styles.rowMeta}>20d {percent(item.ret20)} · 60d {percent(item.ret60)}</Text></View><View style={styles.rotationScore}><Text style={styles.rotationValue}>{Math.round(item.rotationScore)}</Text><Text style={styles.rotationLabel}>ROT Ω</Text></View></Pressable>;
}
function MoverRow({ item, onPress }: { item: MarketQuote; onPress: () => void }) {
  const positive = (item.changePct ?? 0) >= 0;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${item.symbol}`} onPress={onPress} style={({ pressed }) => [styles.moverRow, pressed && styles.pressed]}><View style={styles.badge}><Text style={styles.badgeText}>{item.symbol.slice(0, 2)}</Text></View><View style={styles.flex}><Text style={styles.rowTicker}>{item.symbol}</Text><Text style={styles.rowName}>{item.name}</Text><Text style={styles.rowSector}>{item.sector}</Text></View><View style={styles.right}><Text style={styles.moverPrice}>{item.price == null ? '—' : number(item.price)}</Text><Text style={[styles.moverChange, positive ? styles.positive : styles.negative]}>{percent(item.changePct)}</Text></View></Pressable>;
}
function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }
function LoadingLine() { return <View style={styles.loading}><ActivityIndicator color="#2ed19a" /><Text style={styles.loadingText}>Actualizando sensores…</Text></View>; }
function number(value: number) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value); }
function percent(value: number | null | undefined) { return value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, scroll: { flex: 1 }, content: { padding: 18, paddingBottom: 34 }, flex: { flex: 1 }, right: { alignItems: 'flex-end' }, pressed: { opacity: 0.58 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, marginBottom: 16 }, brand: { color: '#f6f7f8', fontSize: 27, fontWeight: '900', letterSpacing: 1.2 }, product: { color: '#66717a', fontSize: 8, fontWeight: '900', letterSpacing: 1.7, marginTop: 2 }, status: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }, statusOnline: { backgroundColor: '#071713', borderColor: '#235c49' }, statusOffline: { backgroundColor: '#1a0c10', borderColor: '#682839' }, dot: { width: 7, height: 7, borderRadius: 4 }, dotOnline: { backgroundColor: '#37d69c' }, dotOffline: { backgroundColor: '#ff657b' }, statusText: { color: '#adb7bf', fontSize: 8, fontWeight: '900' },
  searchBox: { minHeight: 58, flexDirection: 'row', alignItems: 'center', backgroundColor: '#111418', borderWidth: 1, borderColor: '#2b3137', borderRadius: 29, paddingLeft: 16, paddingRight: 8 }, searchIcon: { color: '#d9dde0', fontSize: 27, marginRight: 7 }, searchInput: { flex: 1, color: '#f3f5f7', fontSize: 15, paddingVertical: 10 }, searchButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#20262c', alignItems: 'center', justifyContent: 'center' }, searchButtonText: { color: '#dce2e6', fontSize: 10, fontWeight: '900' },
  results: { marginTop: 8, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#272e34', backgroundColor: '#0c1013' }, resultRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#252b30' }, resultTicker: { color: '#f1f4f6', fontSize: 15, fontWeight: '900' }, resultName: { color: '#818b94', fontSize: 10, marginTop: 2 }, resultSector: { color: '#65717a', fontSize: 9, maxWidth: 120, textAlign: 'right' },
  systemLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 2 }, systemText: { color: '#58646e', fontSize: 8, fontWeight: '900', letterSpacing: 0.9 }, refresh: { color: '#73cdf4', fontSize: 8, fontWeight: '900' }, error: { borderRadius: 12, borderWidth: 1, borderColor: '#5a2935', backgroundColor: '#190d11', padding: 11, marginTop: 7 }, errorTitle: { color: '#ff7789', fontSize: 8, fontWeight: '900' }, errorText: { color: '#b78089', fontSize: 9.5, marginTop: 4 },
  primaryGrid: { flexDirection: 'row', gap: 10, marginTop: 14 }, primaryCard: { flex: 1, minHeight: 155, borderRadius: 17, borderWidth: 1, padding: 14 }, portfolioCard: { backgroundColor: '#081711', borderColor: '#255b47' }, watchCard: { backgroundColor: '#0d121c', borderColor: '#2d4567' }, primaryEyebrow: { color: '#77ccef', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, primaryNumber: { color: '#f4f7f8', fontSize: 34, fontWeight: '900', marginTop: 12 }, primaryLabel: { color: '#7e8a92', fontSize: 9.5, marginTop: 1 }, primaryAction: { color: '#779b8b', fontSize: 7.5, fontWeight: '900', lineHeight: 11, marginTop: 13 },
  bootstrap: { borderRadius: 12, borderWidth: 1, borderColor: '#5c4921', backgroundColor: '#171307', padding: 11, marginTop: 10 }, bootstrapTitle: { color: '#dcb85f', fontSize: 8, fontWeight: '900' }, bootstrapText: { color: '#97875c', fontSize: 9.5, lineHeight: 14, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 9 }, sectionTitle: { color: '#f1f3f5', fontSize: 17, fontWeight: '900' }, sectionSub: { color: '#67727b', fontSize: 9, marginTop: 3 }, sectionAction: { color: '#76cdf4', fontSize: 8, fontWeight: '900' },
  marketStrip: { gap: 9, paddingRight: 10 }, marketCard: { width: 145, minHeight: 125, borderRadius: 15, borderWidth: 1, borderColor: '#292f35', backgroundColor: '#111519', padding: 13 }, marketName: { color: '#d9dde0', fontSize: 12, fontWeight: '800' }, marketSymbol: { color: '#626d76', fontSize: 8, fontWeight: '900', marginTop: 2 }, marketPrice: { color: '#f4f6f7', fontSize: 21, fontWeight: '900', marginTop: 17 }, marketChange: { fontSize: 11, fontWeight: '900', marginTop: 4 }, positive: { color: '#30d496' }, negative: { color: '#ff667c' },
  rotationRow: { minHeight: 79, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0c1013', borderRadius: 13, borderWidth: 1, borderColor: '#232b31', padding: 11, marginBottom: 7 }, rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 }, rowTicker: { color: '#f0f3f5', fontSize: 15, fontWeight: '900' }, phase: { color: '#d9b65d', fontSize: 7, fontWeight: '900' }, rowName: { color: '#7d8891', fontSize: 9.5, marginTop: 2 }, rowMeta: { color: '#91a0a9', fontSize: 8.5, fontWeight: '800', marginTop: 7 }, rotationScore: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#091116', borderWidth: 1, borderColor: '#28485a', alignItems: 'center', justifyContent: 'center' }, rotationValue: { color: '#72cff7', fontSize: 17, fontWeight: '900' }, rotationLabel: { color: '#597383', fontSize: 6, fontWeight: '900' },
  moversHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 7 }, filters: { flexDirection: 'row', gap: 5 }, filter: { minWidth: 31, height: 31, borderRadius: 16, borderWidth: 1, borderColor: '#2c353c', backgroundColor: '#0d1114', alignItems: 'center', justifyContent: 'center' }, filterActive: { borderColor: '#367b9b', backgroundColor: '#10222c' }, filterText: { color: '#75818a', fontSize: 8, fontWeight: '900' }, filterTextActive: { color: '#75cff6' },
  moverRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#242a2f' }, badge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#151a1f', borderWidth: 1, borderColor: '#2b333a', alignItems: 'center', justifyContent: 'center', marginRight: 11 }, badgeText: { color: '#e2e7ea', fontSize: 10, fontWeight: '900' }, rowSector: { color: '#59656e', fontSize: 8.5, marginTop: 2 }, moverPrice: { color: '#eef1f3', fontSize: 13, fontWeight: '800' }, moverChange: { fontSize: 10, fontWeight: '900', marginTop: 3 },
  loading: { minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: 8 }, loadingText: { color: '#717d86', fontSize: 9 }, emptyCard: { borderRadius: 12, borderWidth: 1, borderColor: '#252d33', backgroundColor: '#0c1013', padding: 20 }, emptyText: { color: '#71808a', textAlign: 'center', fontSize: 10 },
  engineStrip: { minHeight: 102, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#344826', backgroundColor: '#0e160b', padding: 14, marginTop: 23 }, engineEyebrow: { color: '#a5bd78', fontSize: 8, fontWeight: '900' }, engineTitle: { color: '#f0f3ed', fontSize: 17, fontWeight: '900', marginTop: 5 }, engineSub: { color: '#7d8e69', fontSize: 9, lineHeight: 13, marginTop: 4 }, chevron: { color: '#72885d', fontSize: 31, marginLeft: 8 },
});
