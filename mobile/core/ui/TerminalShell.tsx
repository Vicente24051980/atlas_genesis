import { ReactNode, useEffect, useMemo, useState } from 'react';
import { router, usePathname } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlobalIndexQuote, MarketApi } from '../api/marketApi';

export type TerminalRoute = {
  key: string;
  label: string;
  short: string;
  route: string;
  hint: string;
};

export const TERMINAL_ROUTES: TerminalRoute[] = [
  { key: 'home', label: 'Cockpit', short: 'HOME', route: '/', hint: 'Cartera live, índices y prioridades' },
  { key: 'markets', label: 'Markets', short: 'MKT', route: '/workspace/markets', hint: 'Mercados, índices, movers y macro' },
  { key: 'portfolio', label: 'Portfolio', short: 'PORT', route: '/portfolio', hint: 'Cartera, P&L, exposición y contribución' },
  { key: 'audit', label: 'Auditar', short: 'AUD', route: '/audit', hint: 'Auditoría ticker-first y motores ATLAS' },
  { key: 'watchlist', label: 'Watchlist', short: 'WL', route: '/watchlist', hint: 'Candidatos, no-chase y alertas' },
  { key: 'results', label: 'Resultados', short: 'RES', route: '/results', hint: 'Historial guardado e inmutable de auditorías' },
  { key: 'opportunities', label: 'Opportunities', short: 'OPP', route: '/workspace/opportunities', hint: 'Prioridades, Wave Score y receptores de capital' },
  { key: 'atlas', label: 'ATLAS Ω', short: 'Ω', route: '/workspace/atlas', hint: 'Investment Committee, motores y Falsifiers' },
  { key: 'screener', label: 'Screener', short: 'SCR', route: '/workspace/screener', hint: 'Universos, filtros y rankings' },
  { key: 'research', label: 'Research', short: 'RSR', route: '/workspace/research', hint: 'Firecrawl Search Ω, evidencia y tesis' },
  { key: 'catalysts', label: 'Catalysts', short: 'CAL', route: '/workspace/catalysts', hint: 'Resultados, FDA, macro y eventos' },
  { key: 'news', label: 'News', short: 'NEWS', route: '/workspace/news', hint: 'Noticias con procedencia y relevancia ATLAS' },
  { key: 'orders', label: 'Orders', short: 'ORD', route: '/workspace/orders', hint: 'Órdenes, execution gate e historial' },
  { key: 'risk', label: 'Risk', short: 'RSK', route: '/workspace/risk', hint: 'Concentración, drawdown y correlación' },
  { key: 'analyze', label: 'Security Hub', short: 'SEC', route: '/analyze', hint: 'Ficha profunda de un valor' },
  { key: 'broker', label: 'Broker Ω', short: 'T212', route: '/broker', hint: 'Trading 212, sesión y control' },
  { key: 'settings', label: 'System', short: 'SYS', route: '/settings', hint: 'Proveedores, backend y configuración' },
];

const TOP_KEYS = ['markets', 'portfolio', 'audit', 'watchlist', 'results', 'opportunities', 'atlas', 'screener', 'research', 'catalysts', 'news', 'orders', 'risk'];
const TOP_MODULES = TERMINAL_ROUTES.filter((item) => TOP_KEYS.includes(item.key));
const BOTTOM_KEYS = ['home', 'portfolio', 'audit', 'watchlist'];

export function TerminalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');

  const navigate = (route: string) => {
    setPaletteOpen(false);
    setQuery('');
    router.push(route as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <TerminalHeader onOpenPalette={() => setPaletteOpen(true)} />
        <WorldIndexTape />
        {!wide ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleStrip} contentContainerStyle={styles.moduleStripContent}>
            {TOP_MODULES.map((item) => <ModuleChip key={item.key} item={item} active={isActive(pathname, item.route)} onPress={() => navigate(item.route)} />)}
          </ScrollView>
        ) : null}
        <View style={styles.body}>
          {wide ? <DesktopRail pathname={pathname} onNavigate={navigate} /> : null}
          <View style={styles.content}>{children}</View>
        </View>
        {!wide ? (
          <View style={styles.bottomNav}>
            {BOTTOM_KEYS.map((key) => {
              const item = TERMINAL_ROUTES.find((row) => row.key === key)!;
              return <BottomItem key={key} item={item} active={isActive(pathname, item.route)} onPress={() => navigate(item.route)} />;
            })}
            <Pressable onPress={() => setPaletteOpen(true)} style={({ pressed }) => [styles.bottomItem, pressed && styles.pressed]}>
              <Text style={styles.bottomShort}>GO</Text><Text style={styles.bottomLabel}>Más</Text>
            </Pressable>
          </View>
        ) : null}
        <CommandPalette open={paletteOpen} query={query} onChangeQuery={setQuery} onClose={() => { setPaletteOpen(false); setQuery(''); }} onNavigate={navigate} />
      </View>
    </SafeAreaView>
  );
}

function TerminalHeader({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.push('/' as never)} style={styles.brandWrap}>
        <View style={styles.brandMark}><Text style={styles.brandOmega}>Ω</Text></View>
        <View><Text style={styles.brand}>ATLAS</Text><Text style={styles.brandSub}>INVESTMENT TERMINAL</Text></View>
      </Pressable>
      <Pressable onPress={onOpenPalette} style={({ pressed }) => [styles.goBar, pressed && styles.pressed]}>
        <Text style={styles.goPrompt}>GO</Text><Text numberOfLines={1} style={styles.goText}>ticker, AUD, WL, RES…</Text><View style={styles.keycap}><Text style={styles.keycapText}>⌘K</Text></View>
      </Pressable>
      <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
    </View>
  );
}

function WorldIndexTape() {
  const [items, setItems] = useState<GlobalIndexQuote[]>([]);
  const [gate, setGate] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const payload = await MarketApi.indices();
        if (mounted) { setItems(payload.items.filter((row) => row.status === 'OK')); setGate(null); }
      } catch (cause) {
        if (mounted) setGate(cause instanceof Error ? cause.message : 'INDEX DATA GATE');
      }
    };
    void load();
    const timer = setInterval(() => { void load(); }, 15000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tape} contentContainerStyle={styles.tapeContent}>
      {items.length ? items.map((item) => <IndexChip key={item.symbol} item={item} />) : (
        <View style={styles.gateTape}><Text style={styles.gateLabel}>GLOBAL INDICES</Text><Text style={styles.gateText}>{gate || 'CONECTANDO FEED…'}</Text></View>
      )}
    </ScrollView>
  );
}

function IndexChip({ item }: { item: GlobalIndexQuote }) {
  const pct = item.percentageChange;
  const positive = typeof pct === 'number' && pct > 0;
  const negative = typeof pct === 'number' && pct < 0;
  return (
    <View style={styles.indexChip}>
      <View><Text style={styles.indexName}>{item.name}</Text><Text style={styles.indexRegion}>{item.region}</Text></View>
      <Text style={styles.indexPrice}>{formatMarket(item.price)}</Text>
      <Text style={[styles.indexChange, positive && styles.positive, negative && styles.negative]}>{formatPct(pct)}</Text>
    </View>
  );
}

function DesktopRail({ pathname, onNavigate }: { pathname: string; onNavigate: (route: string) => void }) {
  return (
    <ScrollView style={styles.rail} contentContainerStyle={styles.railContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.railTitle}>FUNCTIONS</Text>
      {TERMINAL_ROUTES.map((item) => (
        <Pressable key={item.key} onPress={() => onNavigate(item.route)} style={({ pressed }) => [styles.railItem, isActive(pathname, item.route) && styles.railItemActive, pressed && styles.pressed]}>
          <Text style={[styles.railCode, isActive(pathname, item.route) && styles.railCodeActive]}>{item.short}</Text>
          <View style={styles.railTextWrap}><Text style={[styles.railLabel, isActive(pathname, item.route) && styles.railLabelActive]}>{item.label}</Text><Text numberOfLines={1} style={styles.railHint}>{item.hint}</Text></View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ModuleChip({ item, active, onPress }: { item: TerminalRoute; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.moduleChip, active && styles.moduleChipActive, pressed && styles.pressed]}><Text style={[styles.moduleCode, active && styles.moduleCodeActive]}>{item.short}</Text><Text style={[styles.moduleLabel, active && styles.moduleLabelActive]}>{item.label}</Text></Pressable>;
}
function BottomItem({ item, active, onPress }: { item: TerminalRoute; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.bottomItem, active && styles.bottomItemActive, pressed && styles.pressed]}><Text style={[styles.bottomShort, active && styles.bottomShortActive]}>{item.short}</Text><Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{item.label}</Text></Pressable>;
}

function CommandPalette({ open, query, onChangeQuery, onClose, onNavigate }: { open: boolean; query: string; onChangeQuery: (value: string) => void; onClose: () => void; onNavigate: (route: string) => void }) {
  const normalized = query.trim().toLowerCase();
  const rows = useMemo(() => !normalized ? TERMINAL_ROUTES : TERMINAL_ROUTES.filter((item) => `${item.label} ${item.short} ${item.hint}`.toLowerCase().includes(normalized)), [normalized]);
  const ticker = query.trim().toUpperCase();
  const tickerCandidate = /^[A-Z0-9.\-]{1,12}$/.test(ticker);
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.palette}>
          <View style={styles.paletteHeader}><Text style={styles.paletteLabel}>ATLAS GO BAR</Text><Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>ESC</Text></Pressable></View>
          <TextInput autoFocus value={query} onChangeText={onChangeQuery} autoCapitalize="characters" autoCorrect={false} placeholder="Ticker, AUD, WATCHLIST, RESULTS…" placeholderTextColor="#5f6b70" style={styles.paletteInput} returnKeyType="search" onSubmitEditing={() => { if (tickerCandidate) onNavigate(`/analyze?ticker=${encodeURIComponent(ticker)}`); }} />
          <ScrollView style={styles.paletteResults} keyboardShouldPersistTaps="handled">
            {tickerCandidate ? <CommandRow code="SEC" title={`Analizar ${ticker}`} hint="Security Hub" onPress={() => onNavigate(`/analyze?ticker=${encodeURIComponent(ticker)}`)} /> : null}
            {rows.map((item) => <CommandRow key={item.key} code={item.short} title={item.label} hint={item.hint} onPress={() => onNavigate(item.route)} />)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
function CommandRow({ code, title, hint, onPress }: { code: string; title: string; hint: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.commandRow, pressed && styles.pressed]}><View style={styles.commandCodeBox}><Text style={styles.commandCode}>{code}</Text></View><View style={styles.commandTextWrap}><Text style={styles.commandTitle}>{title}</Text><Text style={styles.commandHint}>{hint}</Text></View><Text style={styles.commandArrow}>→</Text></Pressable>;
}

function isActive(pathname: string, route: string): boolean { return route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`); }
function formatMarket(value: number | null): string { return value === null ? '—' : value.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function formatPct(value: number | null): string { return value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#030506' }, root: { flex: 1, backgroundColor: '#030506' },
  header: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#1a2428', backgroundColor: '#050809' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 }, brandMark: { width: 30, height: 30, borderWidth: 1, borderColor: '#23d9a7', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07130f' }, brandOmega: { color: '#51f2c5', fontFamily: 'monospace', fontSize: 18, fontWeight: '900' }, brand: { color: '#f3f6f5', fontFamily: 'monospace', fontWeight: '900', fontSize: 14, letterSpacing: 1.5 }, brandSub: { color: '#66757b', fontFamily: 'monospace', fontWeight: '700', fontSize: 7, letterSpacing: 1.1 },
  goBar: { flex: 1, minWidth: 0, height: 34, borderWidth: 1, borderColor: '#26343a', backgroundColor: '#0a0f11', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, gap: 8 }, goPrompt: { color: '#42e8b4', fontFamily: 'monospace', fontWeight: '900', fontSize: 11 }, goText: { color: '#7d8c92', fontFamily: 'monospace', fontSize: 10, flex: 1 }, keycap: { borderWidth: 1, borderColor: '#2d3a3f', paddingHorizontal: 5, paddingVertical: 2, backgroundColor: '#0f1517' }, keycapText: { color: '#829197', fontFamily: 'monospace', fontSize: 8, fontWeight: '800' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#214b3d', backgroundColor: '#081510', paddingHorizontal: 7, height: 28 }, liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#31e6a3' }, liveText: { color: '#7ff5ce', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  tape: { maxHeight: 42, borderBottomWidth: 1, borderBottomColor: '#172126', backgroundColor: '#060a0c' }, tapeContent: { alignItems: 'stretch' }, indexChip: { minWidth: 172, height: 41, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#172126' }, indexName: { color: '#b9c5c2', fontFamily: 'monospace', fontWeight: '800', fontSize: 8 }, indexRegion: { color: '#45545a', fontFamily: 'monospace', fontSize: 7, marginTop: 2 }, indexPrice: { color: '#e5ecea', fontFamily: 'monospace', fontWeight: '900', fontSize: 10 }, indexChange: { minWidth: 48, textAlign: 'right', color: '#849197', fontFamily: 'monospace', fontWeight: '900', fontSize: 9 }, positive: { color: '#4fe0ad' }, negative: { color: '#e37c83' }, gateTape: { minHeight: 41, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10 }, gateLabel: { color: '#d0c16f', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, gateText: { color: '#6e7b80', fontFamily: 'monospace', fontSize: 8 },
  moduleStrip: { maxHeight: 39, borderBottomWidth: 1, borderBottomColor: '#182226', backgroundColor: '#050809' }, moduleStripContent: { alignItems: 'center', paddingHorizontal: 5 }, moduleChip: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, borderRightWidth: 1, borderRightColor: '#111b1f' }, moduleChipActive: { backgroundColor: '#09130f' }, moduleCode: { color: '#54646a', fontFamily: 'monospace', fontWeight: '900', fontSize: 8 }, moduleCodeActive: { color: '#4fe8b6' }, moduleLabel: { color: '#88969b', fontSize: 9, fontWeight: '700' }, moduleLabelActive: { color: '#dbe7e3' },
  body: { flex: 1, flexDirection: 'row' }, content: { flex: 1, minWidth: 0 }, rail: { width: 228, backgroundColor: '#050809', borderRightWidth: 1, borderRightColor: '#172126' }, railContent: { paddingBottom: 20 }, railTitle: { color: '#3e4d53', fontFamily: 'monospace', fontSize: 7, fontWeight: '900', letterSpacing: 1.1, paddingHorizontal: 10, paddingVertical: 9 }, railItem: { minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 9, borderTopWidth: 1, borderTopColor: '#0d1518' }, railItemActive: { backgroundColor: '#08130f', borderLeftWidth: 2, borderLeftColor: '#3de1ad' }, railCode: { width: 34, color: '#536269', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, railCodeActive: { color: '#4fe8b6' }, railTextWrap: { flex: 1 }, railLabel: { color: '#98a5a9', fontSize: 10, fontWeight: '800' }, railLabelActive: { color: '#e3ece9' }, railHint: { color: '#445258', fontSize: 8, marginTop: 2 },
  bottomNav: { minHeight: 55, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1a2529', backgroundColor: '#050809' }, bottomItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 3 }, bottomItemActive: { backgroundColor: '#08120f' }, bottomShort: { color: '#637178', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, bottomShortActive: { color: '#51e8b7' }, bottomLabel: { color: '#66757a', fontSize: 8, fontWeight: '700' }, bottomLabelActive: { color: '#d8e4e0' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', paddingTop: 80, paddingHorizontal: 12 }, palette: { width: '100%', maxWidth: 680, maxHeight: '78%', borderWidth: 1, borderColor: '#2a3b40', backgroundColor: '#070b0d' }, paletteHeader: { minHeight: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, borderBottomWidth: 1, borderBottomColor: '#1c292e' }, paletteLabel: { flex: 1, color: '#4fe8b6', fontFamily: 'monospace', fontSize: 9, fontWeight: '900', letterSpacing: 1 }, closeButton: { borderWidth: 1, borderColor: '#2a383d', paddingHorizontal: 7, paddingVertical: 4 }, closeText: { color: '#718086', fontFamily: 'monospace', fontSize: 8 }, paletteInput: { minHeight: 50, color: '#edf4f2', fontFamily: 'monospace', fontSize: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#1c292e' }, paletteResults: { maxHeight: 430 }, commandRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 11, borderBottomWidth: 1, borderBottomColor: '#101a1d' }, commandCodeBox: { width: 42, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#26383e', backgroundColor: '#091012' }, commandCode: { color: '#63d9b7', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, commandTextWrap: { flex: 1 }, commandTitle: { color: '#dfe8e5', fontSize: 11, fontWeight: '800' }, commandHint: { color: '#526168', fontSize: 9, marginTop: 2 }, commandArrow: { color: '#55d9b2', fontFamily: 'monospace' }, pressed: { opacity: 0.65 },
});
