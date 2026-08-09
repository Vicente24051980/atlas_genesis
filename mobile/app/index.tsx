import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  AtlasOnlineApi,
  type MarketQuote,
  type MarketSearchItem,
} from '../core/api/atlasOnlineApi';

type HomeTab = 'market' | 'scanner' | 'atlas';
type Direction = 'all' | 'up' | 'down';

const modules = [
  { code: 'OVR', title: 'Resumen', route: '/overview' },
  { code: 'MKT', title: 'Mercado', route: '/market' },
  { code: 'GRW', title: 'Growth Ω', route: '/growth' },
  { code: 'QLT', title: 'Business Quality Ω', route: '/quality' },
  { code: 'CPX', title: 'CAPEX Productivity Ω', route: '/capex-productivity' },
  { code: 'VAL', title: 'Valuation Ω', route: '/valuation' },
  { code: 'RSK', title: 'Risk Ω', route: '/risk' },
  { code: 'CAT', title: 'Catalysts Ω', route: '/catalysts' },
  { code: 'NWS', title: 'News Ω', route: '/news' },
] as const;

const fallbackBenchmarks = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq 100' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'GLD', name: 'Oro' },
  { symbol: 'USO', name: 'Petróleo' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<HomeTab>('market');
  const [direction, setDirection] = useState<Direction>('all');
  const [apiState, setApiState] = useState<'CHECKING' | 'ONLINE' | 'OFFLINE'>('CHECKING');
  const [providerState, setProviderState] = useState('CARGANDO');
  const [benchmarks, setBenchmarks] = useState<MarketQuote[]>([]);
  const [scanner, setScanner] = useState<MarketQuote[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MarketSearchItem[]>([]);

  const loadHome = async () => {
    setMarketLoading(true);
    setMarketError('');
    try {
      const [health, snapshot, movers] = await Promise.all([
        AtlasOnlineApi.health(),
        AtlasOnlineApi.marketSnapshot(),
        AtlasOnlineApi.marketScanner('all', 20),
      ]);
      setApiState(health.ok ? 'ONLINE' : 'OFFLINE');
      setProviderState(health.finnhub_configured ? 'FINNHUB + MARKET' : 'MARKET FALLBACK');
      setBenchmarks(snapshot.items);
      setScanner(movers.items);
    } catch (cause) {
      setApiState('OFFLINE');
      setProviderState('SIN DATOS');
      setMarketError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    void loadHome();
  }, []);

  const filteredScanner = useMemo(() => {
    if (direction === 'up') return scanner.filter((item) => (item.changePct ?? 0) > 0);
    if (direction === 'down') return scanner.filter((item) => (item.changePct ?? 0) < 0);
    return scanner;
  }, [scanner, direction]);

  const runSearch = async () => {
    const clean = query.trim();
    if (!clean) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const result = await AtlasOnlineApi.marketSearch(clean);
      setSearchResults(result.items);
    } catch (cause) {
      setSearchResults([]);
      setMarketError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSearching(false);
    }
  };

  const openTicker = (symbol: string) => {
    setSearchResults([]);
    router.push({ pathname: '/ticker', params: { symbol } });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>ATLAS Ω</Text>
            <Text style={styles.product}>MARKET SCANNER</Text>
          </View>
          <View style={[styles.statusPill, apiState === 'ONLINE' ? styles.statusOnline : apiState === 'OFFLINE' ? styles.statusOffline : styles.statusChecking]}>
            <View style={[styles.statusDot, apiState === 'ONLINE' ? styles.dotOnline : apiState === 'OFFLINE' ? styles.dotOffline : styles.dotChecking]} />
            <Text style={styles.statusText}>{apiState === 'ONLINE' ? 'API' : apiState}</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={(value) => {
              setQuery(value);
              if (!value.trim()) setSearchResults([]);
            }}
            onSubmitEditing={() => void runSearch()}
            returnKeyType="search"
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Buscar ticker o empresa"
            placeholderTextColor="#6d7580"
            style={styles.searchInput}
            accessibilityLabel="Buscar ticker o empresa"
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Buscar mercado" onPress={() => void runSearch()} style={styles.searchButton}>
            {searching ? <ActivityIndicator size="small" color="#dce3e9" /> : <Text style={styles.searchButtonText}>BUSCAR</Text>}
          </Pressable>
        </View>

        {searchResults.length ? (
          <View style={styles.searchResults}>
            {searchResults.map((item) => (
              <Pressable
                key={item.symbol}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${item.symbol}`}
                onPress={() => openTicker(item.symbol)}
                style={({ pressed }) => [styles.searchResultRow, pressed && styles.pressed]}
              >
                <View style={styles.flex}>
                  <Text style={styles.resultSymbol}>{item.symbol}</Text>
                  <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                </View>
                <Text style={styles.resultSector} numberOfLines={1}>{item.sector}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.tabs}>
          <TabButton label="MERCADO" active={tab === 'market'} onPress={() => setTab('market')} />
          <TabButton label="SCANNER Ω" active={tab === 'scanner'} onPress={() => setTab('scanner')} />
          <TabButton label="ATLAS Ω" active={tab === 'atlas'} onPress={() => setTab('atlas')} />
        </View>

        <View style={styles.marketStateRow}>
          <Text style={styles.marketState}>{providerState}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Actualizar mercado" onPress={() => void loadHome()}>
            <Text style={styles.refresh}>ACTUALIZAR</Text>
          </Pressable>
        </View>

        {marketError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>DATOS NO DISPONIBLES</Text>
            <Text style={styles.errorText}>{marketError}</Text>
          </View>
        ) : null}

        {tab === 'market' ? (
          <>
            <Text style={styles.sectionTitle}>MERCADOS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.benchmarkStrip}>
              {(benchmarks.length ? benchmarks : fallbackBenchmarks).map((item) => (
                <BenchmarkCard
                  key={item.symbol}
                  quote={'price' in item ? item : undefined}
                  symbol={item.symbol}
                  name={item.name}
                  onPress={() => openTicker(item.symbol)}
                />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Tendencias actuales</Text>
                <Text style={styles.sectionSub}>Movimiento diario · ranking por variación absoluta</Text>
              </View>
              <Pressable onPress={() => setTab('scanner')} accessibilityRole="button" accessibilityLabel="Abrir SCANNER Ω">
                <Text style={styles.seeAll}>VER TODO</Text>
              </Pressable>
            </View>

            {marketLoading && !scanner.length ? <LoadingBlock /> : scanner.slice(0, 8).map((item) => <MoverRow key={item.symbol} item={item} onPress={() => openTicker(item.symbol)} />)}
          </>
        ) : null}

        {tab === 'scanner' ? (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>SCANNER Ω</Text>
                <Text style={styles.sectionSub}>Exploración de mercado. No emite BUY/SELL.</Text>
              </View>
            </View>
            <View style={styles.filters}>
              <FilterButton label="TODOS" active={direction === 'all'} onPress={() => setDirection('all')} />
              <FilterButton label="SUBEN" active={direction === 'up'} onPress={() => setDirection('up')} />
              <FilterButton label="BAJAN" active={direction === 'down'} onPress={() => setDirection('down')} />
            </View>
            {marketLoading && !scanner.length ? <LoadingBlock /> : filteredScanner.map((item) => <MoverRow key={item.symbol} item={item} onPress={() => openTicker(item.symbol)} />)}
            {!marketLoading && !filteredScanner.length ? <Text style={styles.emptyText}>No hay valores para este filtro.</Text> : null}
          </>
        ) : null}

        {tab === 'atlas' ? (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>MÓDULOS ATLAS Ω</Text>
                <Text style={styles.sectionSub}>Análisis completo después del descubrimiento.</Text>
              </View>
            </View>
            <View style={styles.moduleGrid}>
              {modules.map((module) => (
                <Pressable
                  key={module.code}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${module.title}`}
                  onPress={() => router.push(module.route)}
                  style={({ pressed }) => [styles.moduleCard, pressed && styles.pressed]}
                >
                  <Text style={styles.moduleCode}>{module.code}</Text>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleArrow}>›</Text>
                </Pressable>
              ))}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir Broker Ω" onPress={() => router.push('/broker')} style={styles.brokerCard}>
              <View>
                <Text style={styles.moduleCode}>BRK</Text>
                <Text style={styles.moduleTitle}>Broker Ω</Text>
                <Text style={styles.brokerMeta}>Trading 212 · paper/live con guardrails</Text>
              </View>
              <Text style={styles.moduleArrow}>›</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomButton label="Inicio" active={tab === 'market'} onPress={() => setTab('market')} />
        <BottomButton label="Scanner" active={tab === 'scanner'} onPress={() => setTab('scanner')} />
        <BottomButton label="Atlas" active={tab === 'atlas'} onPress={() => setTab('atlas')} />
        <BottomButton label="Broker" active={false} onPress={() => router.push('/broker')} />
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${label}`} onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function FilterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

function BottomButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.bottomButton}>
      <Text style={[styles.bottomGlyph, active && styles.bottomActive]}>●</Text>
      <Text style={[styles.bottomText, active && styles.bottomActive]}>{label}</Text>
    </Pressable>
  );
}

function BenchmarkCard({ quote, symbol, name, onPress }: { quote?: MarketQuote; symbol: string; name: string; onPress: () => void }) {
  const pct = quote?.changePct;
  const positive = (pct ?? 0) >= 0;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${symbol}`} onPress={onPress} style={({ pressed }) => [styles.benchmarkCard, pressed && styles.pressed]}>
      <Text style={styles.benchmarkName}>{name}</Text>
      <Text style={styles.benchmarkSymbol}>{symbol}</Text>
      <Text style={styles.benchmarkPrice}>{formatPrice(quote?.price)}</Text>
      <Text style={[styles.change, positive ? styles.positive : styles.negative]}>{formatPct(pct)}</Text>
    </Pressable>
  );
}

function MoverRow({ item, onPress }: { item: MarketQuote; onPress: () => void }) {
  const positive = (item.changePct ?? 0) >= 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${item.symbol}`}
      onPress={onPress}
      style={({ pressed }) => [styles.moverRow, pressed && styles.pressed]}
    >
      <View style={styles.symbolBadge}><Text style={styles.symbolBadgeText}>{item.symbol.slice(0, 2)}</Text></View>
      <View style={styles.flex}>
        <Text style={styles.moverSymbol}>{item.symbol}</Text>
        <Text style={styles.moverName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.moverSector} numberOfLines={1}>{item.sector}</Text>
      </View>
      <View style={styles.moverRight}>
        <Text style={styles.moverPrice}>{formatPrice(item.price)}</Text>
        <View style={[styles.changePill, positive ? styles.changePillPositive : styles.changePillNegative]}>
          <Text style={[styles.changePillText, positive ? styles.positive : styles.negative]}>{formatPct(item.changePct)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function LoadingBlock() {
  return <View style={styles.loadingBlock}><ActivityIndicator color="#38c996" /><Text style={styles.loadingText}>Cargando mercado…</Text></View>;
}

function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(value);
}

function formatPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  flex: { flex: 1 },
  pressed: { opacity: 0.62 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  brand: { color: '#f6f7f8', fontSize: 27, fontWeight: '900', letterSpacing: 1.2 },
  product: { color: '#65707b', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  statusOnline: { backgroundColor: '#071713', borderColor: '#245f4d' },
  statusOffline: { backgroundColor: '#1a0c10', borderColor: '#6d2b3a' },
  statusChecking: { backgroundColor: '#17150c', borderColor: '#5d5125' },
  statusDot: { width: 7, height: 7, borderRadius: 7 },
  dotOnline: { backgroundColor: '#38c996' },
  dotOffline: { backgroundColor: '#ff556c' },
  dotChecking: { backgroundColor: '#d8b34c' },
  statusText: { color: '#b7c0c8', fontSize: 9, fontWeight: '900' },
  searchBox: { minHeight: 58, flexDirection: 'row', alignItems: 'center', backgroundColor: '#111418', borderWidth: 1, borderColor: '#2a3037', borderRadius: 29, paddingLeft: 17, paddingRight: 8 },
  searchIcon: { color: '#d4d9de', fontSize: 28, marginRight: 7, marginTop: -2 },
  searchInput: { flex: 1, color: '#f3f5f7', fontSize: 17, paddingVertical: 10 },
  searchButton: { height: 42, minWidth: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: '#20262d', paddingHorizontal: 10 },
  searchButtonText: { color: '#dfe5ea', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  searchResults: { marginTop: 8, backgroundColor: '#0d1013', borderRadius: 16, borderWidth: 1, borderColor: '#232a31', overflow: 'hidden' },
  searchResultRow: { minHeight: 64, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#262c31' },
  resultSymbol: { color: '#f4f6f8', fontSize: 16, fontWeight: '900' },
  resultName: { color: '#8f99a3', fontSize: 12, marginTop: 2, maxWidth: 230 },
  resultSector: { color: '#5f6e7a', fontSize: 10, maxWidth: 120, textAlign: 'right' },
  tabs: { marginTop: 18, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#252b31' },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: '#78ccff' },
  tabText: { color: '#b7bbc0', fontWeight: '800', fontSize: 13 },
  tabTextActive: { color: '#83d1ff' },
  marketStateRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  marketState: { color: '#56616c', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  refresh: { color: '#78ccff', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  errorCard: { marginTop: 12, borderRadius: 12, backgroundColor: '#160d10', borderWidth: 1, borderColor: '#4f2530', padding: 12 },
  errorTitle: { color: '#ff8898', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  errorText: { color: '#bd8c95', marginTop: 5, fontSize: 11, lineHeight: 16 },
  sectionHeader: { marginTop: 24, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { color: '#f2f4f5', fontSize: 17, fontWeight: '900', marginTop: 22 },
  sectionSub: { color: '#66727c', fontSize: 10, marginTop: 4 },
  seeAll: { color: '#77cfff', fontSize: 9, fontWeight: '900', paddingBottom: 2 },
  benchmarkStrip: { gap: 10, paddingTop: 10, paddingRight: 12 },
  benchmarkCard: { width: 154, minHeight: 132, backgroundColor: '#12161a', borderWidth: 1, borderColor: '#2a3036', borderRadius: 16, padding: 14 },
  benchmarkName: { color: '#d7dce1', fontSize: 14, fontWeight: '800' },
  benchmarkSymbol: { color: '#606b74', fontSize: 9, fontWeight: '900', marginTop: 2 },
  benchmarkPrice: { color: '#f5f7f8', fontSize: 22, fontWeight: '900', marginTop: 16 },
  change: { fontSize: 13, fontWeight: '900', marginTop: 5 },
  positive: { color: '#22c98b' },
  negative: { color: '#ff5f76' },
  moverRow: { minHeight: 86, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0c0f12', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#24292f', paddingVertical: 10 },
  symbolBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#171d22', borderWidth: 1, borderColor: '#2b343c', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  symbolBadgeText: { color: '#dfe5ea', fontWeight: '900', fontSize: 12 },
  moverSymbol: { color: '#f1f3f4', fontSize: 16, fontWeight: '900' },
  moverName: { color: '#89939c', fontSize: 12, marginTop: 2, maxWidth: 200 },
  moverSector: { color: '#58636c', fontSize: 9, marginTop: 3, maxWidth: 200 },
  moverRight: { alignItems: 'flex-end', marginLeft: 8 },
  moverPrice: { color: '#f1f3f4', fontSize: 15, fontWeight: '800' },
  changePill: { marginTop: 6, minWidth: 72, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7, alignItems: 'center' },
  changePillPositive: { backgroundColor: '#093024' },
  changePillNegative: { backgroundColor: '#34121a' },
  changePillText: { fontSize: 12, fontWeight: '900' },
  filters: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  filter: { borderWidth: 1, borderColor: '#30363c', borderRadius: 999, paddingHorizontal: 15, paddingVertical: 9, backgroundColor: '#101316' },
  filterActive: { borderColor: '#39799c', backgroundColor: '#10212c' },
  filterText: { color: '#7d8790', fontSize: 10, fontWeight: '900' },
  filterTextActive: { color: '#7ed0ff' },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 10 },
  moduleCard: { width: '48.6%', minHeight: 96, borderRadius: 14, backgroundColor: '#101419', borderWidth: 1, borderColor: '#27303a', padding: 13, position: 'relative' },
  moduleCode: { color: '#68c9ff', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  moduleTitle: { color: '#f1f4f6', fontSize: 14, fontWeight: '900', marginTop: 17, paddingRight: 18 },
  moduleArrow: { position: 'absolute', right: 12, top: 32, color: '#597387', fontSize: 27 },
  brokerCard: { minHeight: 92, marginTop: 12, borderRadius: 14, backgroundColor: '#0c1713', borderWidth: 1, borderColor: '#285445', padding: 14, justifyContent: 'center', position: 'relative' },
  brokerMeta: { color: '#688579', fontSize: 10, marginTop: 4 },
  loadingBlock: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: '#77818a', fontSize: 11 },
  emptyText: { color: '#707982', paddingVertical: 30, textAlign: 'center' },
  bottomNav: { height: 72, borderTopWidth: 1, borderTopColor: '#252b31', backgroundColor: '#0d1114', flexDirection: 'row', paddingBottom: 6 },
  bottomButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottomGlyph: { color: '#5c656d', fontSize: 9, marginBottom: 5 },
  bottomText: { color: '#aeb5bb', fontSize: 11, fontWeight: '800' },
  bottomActive: { color: '#23c991' },
});
