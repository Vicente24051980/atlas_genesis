import { ReactNode, useEffect, useMemo, useState } from 'react';
import { router, usePathname } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlobalIndexQuote, MarketApi } from '../api/marketApi';

type RouteGroup = 'MARKETS' | 'PORTFOLIO' | 'ANALYSIS' | 'RESEARCH' | 'EXECUTION' | 'SYSTEM';

export type TerminalRoute = {
  key: string;
  label: string;
  short: string;
  route: string;
  hint: string;
  group: RouteGroup;
};

export const TERMINAL_ROUTES: TerminalRoute[] = [
  { key: 'home', label: 'Cockpit', short: 'HOME', route: '/', hint: 'Cartera live, índices y prioridades', group: 'MARKETS' },
  { key: 'markets', label: 'Markets', short: 'MKT', route: '/workspace/markets', hint: 'Índices, breadth, macro y rotación', group: 'MARKETS' },
  { key: 'opportunities', label: 'Opportunities', short: 'OPP', route: '/workspace/opportunities', hint: 'Wave Score, receptores y dislocaciones', group: 'MARKETS' },
  { key: 'screener', label: 'Screener', short: 'SCR', route: '/screener', hint: 'Filtros, universos, rankings y discovery', group: 'MARKETS' },
  { key: 'portfolio', label: 'Portfolio', short: 'PORT', route: '/portfolio', hint: 'Cartera, P&L, exposición y contribución', group: 'PORTFOLIO' },
  { key: 'watchlist', label: 'Watchlist', short: 'WL', route: '/watchlist', hint: 'Candidatos, no-chase y alertas', group: 'PORTFOLIO' },
  { key: 'results', label: 'Resultados', short: 'RES', route: '/results', hint: 'Journal inmutable de auditorías', group: 'PORTFOLIO' },
  { key: 'risk', label: 'Risk', short: 'RSK', route: '/workspace/risk', hint: 'Concentración, drawdown y correlación', group: 'PORTFOLIO' },
  { key: 'audit', label: 'Auditar', short: 'AUD', route: '/audit', hint: 'Auditoría ticker-first y motores ATLAS', group: 'ANALYSIS' },
  { key: 'analyze', label: 'Security Hub', short: 'SEC', route: '/analyze', hint: 'Ficha profunda de un valor', group: 'ANALYSIS' },
  { key: 'atlas', label: 'ATLAS Ω', short: 'Ω', route: '/workspace/atlas', hint: 'Investment Committee, motores y Falsifiers', group: 'ANALYSIS' },
  { key: 'research', label: 'Research', short: 'RSR', route: '/workspace/research', hint: 'Evidencia, provenance y tesis', group: 'RESEARCH' },
  { key: 'catalysts', label: 'Catalysts', short: 'CAL', route: '/workspace/catalysts', hint: 'Resultados, FDA, macro y eventos', group: 'RESEARCH' },
  { key: 'news', label: 'News', short: 'NEWS', route: '/workspace/news', hint: 'Noticias con procedencia y materialidad', group: 'RESEARCH' },
  { key: 'orders', label: 'Orders', short: 'ORD', route: '/workspace/orders', hint: 'Execution gate e historial', group: 'EXECUTION' },
  { key: 'broker', label: 'Broker Ω', short: 'T212', route: '/broker', hint: 'Trading 212, sesión y control', group: 'EXECUTION' },
  { key: 'settings', label: 'System', short: 'SYS', route: '/settings', hint: 'Proveedores, backend y configuración', group: 'SYSTEM' },
];

const TOP_KEYS = ['markets', 'portfolio', 'screener', 'opportunities', 'audit', 'watchlist', 'results', 'research', 'catalysts', 'news', 'atlas', 'risk', 'orders'];
const TOP_MODULES = TERMINAL_ROUTES.filter((item) => TOP_KEYS.includes(item.key));
const BOTTOM_KEYS = ['home', 'portfolio', 'audit', 'screener'];
const GROUPS: RouteGroup[] = ['MARKETS', 'PORTFOLIO', 'ANALYSIS', 'RESEARCH', 'EXECUTION', 'SYSTEM'];
const QUICK_KEYS = ['audit', 'screener', 'watchlist', 'results'];

export function TerminalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = routeForPath(pathname);

  const navigate = (route: string) => {
    setPaletteOpen(false);
    setQuery('');
    router.push(route as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <TerminalHeader current={current} onOpenPalette={() => setPaletteOpen(true)} />
        <WorldIndexTape />
        <RouteContextBar current={current} onNavigate={navigate} />
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

function TerminalHeader({ current, onOpenPalette }: { current: TerminalRoute; onOpenPalette: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.push('/' as never)} style={styles.brandWrap}>
        <View style={styles.brandMark}><Text style={styles.brandOmega}>Ω</Text></View>
        <View><Text style={styles.brand}>ATLAS</Text><Text style={styles.brandSub}>INVESTMENT TERMINAL</Text></View>
      </Pressable>
      <Pressable onPress={onOpenPalette} style={({ pressed }) => [styles.goBar, pressed && styles.pressed]}>
        <Text style={styles.goPrompt}>GO</Text>
        <Text numberOfLines={1} style={styles.goText}>{current.short} · ticker, función, workspace…</Text>
        <View style={styles.keycap}><Text style={styles.keycapText}>⌘K</Text></View>
      </Pressable>
      <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
    </View>
  );
}

function RouteContextBar({ current, onNavigate }: { current: TerminalRoute; onNavigate: (route: string) => void }) {
  return (
    <View style={styles.contextBar}>
      <View style={styles.contextCode}><Text style={styles.contextCodeText}>{current.short}</Text></View>
      <View style={styles.contextText}><Text style={styles.contextTitle}>{current.label}</Text><Text numberOfLines={1} style={styles.contextHint}>{current.group} · {current.hint}</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        {QUICK_KEYS.filter((key) => key !== current.key).map((key) => {
          const item = TERMINAL_ROUTES.find((row) => row.key === key)!;
          return <Pressable key={key} onPress={() => onNavigate(item.route)} style={styles.quickChip}><Text style={styles.quickCode}>{item.short}</Text></Pressable>;
        })}
      </ScrollView>
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
      {GROUPS.map((group) => (
        <View key={group} style={styles.railGroup}>
          <Text style={styles.railTitle}>{group}</Text>
          {TERMINAL_ROUTES.filter((item) => item.group === group).map((item) => (
            <Pressable key={item.key} onPress={() => onNavigate(item.route)} style={({ pressed }) => [styles.railItem, isActive(pathname, item.route) && styles.railItemActive, pressed && styles.pressed]}>
              <Text style={[styles.railCode, isActive(pathname, item.route) && styles.railCodeActive]}>{item.short}</Text>
              <View style={styles.railTextWrap}><Text style={[styles.railLabel, isActive(pathname, item.route) && styles.railLabelActive]}>{item.label}</Text><Text numberOfLines={1} style={styles.railHint}>{item.hint}</Text></View>
            </Pressable>
          ))}
        </View>
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
  const rows = useMemo(() => !normalized ? TERMINAL_ROUTES : TERMINAL_ROUTES.filter((item) => `${item.label} ${item.short} ${item.hint} ${item.group}`.toLowerCase().includes(normalized)), [normalized]);
  const ticker = query.trim().toUpperCase();
  const tickerCandidate = /^[A-Z0-9.\-]{1,12}$/.test(ticker);
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.palette}>
          <View style={styles.paletteHeader}><Text style={styles.paletteLabel}>ATLAS GO · WORKSPACES + TICKERS</Text><Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>ESC</Text></Pressable></View>
          <TextInput autoFocus value={query} onChangeText={onChangeQuery} autoCapitalize="characters" autoCorrect={false} placeholder="Ticker, SCR, AUD, WATCHLIST, RESEARCH…" placeholderTextColor="#5f6b70" style={styles.paletteInput} returnKeyType="search" onSubmitEditing={() => { if (tickerCandidate) onNavigate(`/analyze?ticker=${encodeURIComponent(ticker)}`); }} />
          <ScrollView style={styles.paletteResults} keyboardShouldPersistTaps="handled">
            {tickerCandidate ? <CommandRow code="SEC" title={`Analizar ${ticker}`} hint="Security Hub" onPress={() => onNavigate(`/analyze?ticker=${encodeURIComponent(ticker)}`)} /> : null}
            {GROUPS.map((group) => {
              const groupRows = rows.filter((item) => item.group === group);
              if (!groupRows.length) return null;
              return <View key={group}><Text style={styles.commandGroup}>{group}</Text>{groupRows.map((item) => <CommandRow key={item.key} code={item.short} title={item.label} hint={item.hint} onPress={() => onNavigate(item.route)} />)}</View>;
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
function CommandRow({ code, title, hint, onPress }: { code: string; title: string; hint: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.commandRow, pressed && styles.pressed]}><View style={styles.commandCodeBox}><Text style={styles.commandCode}>{code}</Text></View><View style={styles.commandTextWrap}><Text style={styles.commandTitle}>{title}</Text><Text style={styles.commandHint}>{hint}</Text></View><Text style={styles.commandArrow}>→</Text></Pressable>;
}

function routeForPath(pathname: string): TerminalRoute {
  return TERMINAL_ROUTES.find((item) => isActive(pathname, item.route)) || TERMINAL_ROUTES[0]!;
}
function isActive(pathname: string, route: string): boolean { return route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`); }
function formatMarket(value: number | null): string { return value === null ? '—' : value.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function formatPct(value: number | null): string { return value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#030506' }, root: { flex: 1, backgroundColor: '#030506' }, body: { flex: 1, flexDirection: 'row' }, content: { flex: 1, minWidth: 0 }, pressed: { opacity: 0.66 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: '#1a2428', backgroundColor: '#050809' }, brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 7 }, brandMark: { width: 29, height: 29, borderWidth: 1, borderColor: '#23d9a7', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07130f' }, brandOmega: { color: '#51f2c5', fontFamily: 'monospace', fontSize: 17, fontWeight: '900' }, brand: { color: '#f3f6f5', fontFamily: 'monospace', fontWeight: '900', fontSize: 13, letterSpacing: 1.4 }, brandSub: { color: '#66757b', fontFamily: 'monospace', fontWeight: '700', fontSize: 6, letterSpacing: 1 },
  goBar: { flex: 1, minWidth: 0, height: 32, borderWidth: 1, borderColor: '#26343a', backgroundColor: '#0a0f11', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 7 }, goPrompt: { color: '#42e8b4', fontFamily: 'monospace', fontWeight: '900', fontSize: 10 }, goText: { color: '#7d8c92', fontFamily: 'monospace', fontSize: 9, flex: 1 }, keycap: { borderWidth: 1, borderColor: '#2d3a3f', paddingHorizontal: 4, paddingVertical: 2, backgroundColor: '#0f1517' }, keycapText: { color: '#829197', fontFamily: 'monospace', fontSize: 7, fontWeight: '800' }, livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#214b3d', backgroundColor: '#081510', paddingHorizontal: 6, height: 26 }, liveDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: '#31e6a3' }, liveText: { color: '#7ff5ce', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' },
  tape: { maxHeight: 40, borderBottomWidth: 1, borderBottomColor: '#172126', backgroundColor: '#040708' }, tapeContent: { alignItems: 'stretch' }, indexChip: { minWidth: 168, height: 39, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 8, borderRightWidth: 1, borderRightColor: '#172126' }, indexName: { color: '#c7d1ce', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, indexRegion: { color: '#45545a', fontFamily: 'monospace', fontSize: 6, marginTop: 1 }, indexPrice: { color: '#e2e9e7', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, indexChange: { color: '#77868b', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, positive: { color: '#4de7b4' }, negative: { color: '#e47c7c' }, gateTape: { height: 39, minWidth: 260, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10 }, gateLabel: { color: '#54efbd', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, gateText: { color: '#69787d', fontFamily: 'monospace', fontSize: 7 },
  contextBar: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: '#172126', backgroundColor: '#060a0c' }, contextCode: { width: 34, height: 22, borderWidth: 1, borderColor: '#285544', backgroundColor: '#07110d', alignItems: 'center', justifyContent: 'center' }, contextCodeText: { color: '#54efbd', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, contextText: { flex: 1, minWidth: 90 }, contextTitle: { color: '#dce5e2', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, contextHint: { color: '#4f6066', fontFamily: 'monospace', fontSize: 6, marginTop: 1 }, quickRow: { gap: 4, paddingVertical: 5 }, quickChip: { minWidth: 34, height: 22, borderWidth: 1, borderColor: '#253238', backgroundColor: '#080d0f', alignItems: 'center', justifyContent: 'center' }, quickCode: { color: '#718087', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' },
  moduleStrip: { maxHeight: 36, borderBottomWidth: 1, borderBottomColor: '#182328', backgroundColor: '#040708' }, moduleStripContent: { paddingHorizontal: 6, alignItems: 'center', gap: 4 }, moduleChip: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#1d2a2f', backgroundColor: '#070b0d', paddingHorizontal: 7 }, moduleChipActive: { borderColor: '#2d6754', backgroundColor: '#07130f' }, moduleCode: { color: '#516167', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' }, moduleCodeActive: { color: '#50e6b5' }, moduleLabel: { color: '#728087', fontFamily: 'monospace', fontSize: 7, fontWeight: '800' }, moduleLabelActive: { color: '#cbe5dc' },
  rail: { width: 224, borderRightWidth: 1, borderRightColor: '#172126', backgroundColor: '#040708' }, railContent: { paddingVertical: 8 }, railGroup: { marginBottom: 10 }, railTitle: { color: '#405158', fontFamily: 'monospace', fontSize: 6, fontWeight: '900', letterSpacing: 1.2, paddingHorizontal: 9, marginBottom: 4 }, railItem: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, borderLeftWidth: 2, borderLeftColor: 'transparent' }, railItemActive: { backgroundColor: '#07110d', borderLeftColor: '#42dca9' }, railCode: { width: 34, color: '#526269', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, railCodeActive: { color: '#52e8b7' }, railTextWrap: { flex: 1 }, railLabel: { color: '#96a4a1', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, railLabelActive: { color: '#e2ece8' }, railHint: { color: '#46565b', fontSize: 6, marginTop: 2 },
  bottomNav: { minHeight: 49, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1b292e', backgroundColor: '#050809' }, bottomItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 2, borderTopWidth: 2, borderTopColor: 'transparent' }, bottomItemActive: { backgroundColor: '#07110d', borderTopColor: '#43dbaa' }, bottomShort: { color: '#5d6d72', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, bottomShortActive: { color: '#58e8b8' }, bottomLabel: { color: '#637278', fontFamily: 'monospace', fontSize: 6 }, bottomLabelActive: { color: '#c8ddd5' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', paddingTop: 66, paddingHorizontal: 12 }, palette: { width: '100%', maxWidth: 700, maxHeight: '82%', borderWidth: 1, borderColor: '#304048', backgroundColor: '#060a0c' }, paletteHeader: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: '#1b292e' }, paletteLabel: { color: '#55e9b9', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, closeButton: { borderWidth: 1, borderColor: '#26353b', paddingHorizontal: 7, paddingVertical: 4 }, closeText: { color: '#718087', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, paletteInput: { height: 46, borderBottomWidth: 1, borderBottomColor: '#1b292e', color: '#e3ebe8', fontFamily: 'monospace', fontSize: 11, paddingHorizontal: 10, backgroundColor: '#050809' }, paletteResults: { maxHeight: 520 }, commandGroup: { color: '#42545b', fontFamily: 'monospace', fontSize: 6, fontWeight: '900', letterSpacing: 1.2, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 4 }, commandRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: '#10191c' }, commandCodeBox: { width: 39, height: 27, borderWidth: 1, borderColor: '#285544', backgroundColor: '#07110d', alignItems: 'center', justifyContent: 'center' }, commandCode: { color: '#54efbd', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, commandTextWrap: { flex: 1 }, commandTitle: { color: '#dbe5e1', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, commandHint: { color: '#54656a', fontSize: 7, marginTop: 2 }, commandArrow: { color: '#4ddfad', fontFamily: 'monospace', fontSize: 13 },
});
