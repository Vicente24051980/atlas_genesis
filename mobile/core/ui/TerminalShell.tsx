import { ReactNode, useMemo, useState } from 'react';
import { router, usePathname } from 'expo-router';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type TerminalRoute = {
  key: string;
  label: string;
  short: string;
  route: string | null;
  hint: string;
};

export const TERMINAL_ROUTES: TerminalRoute[] = [
  { key: 'home', label: 'Cockpit', short: 'HOME', route: '/', hint: 'Priority stack y estado del sistema' },
  { key: 'markets', label: 'Markets', short: 'MKT', route: '/workspace/markets', hint: 'Mercados, movers, sectores y macro' },
  { key: 'portfolio', label: 'Portfolio', short: 'PORT', route: '/portfolio', hint: 'Cartera, exposición y contribución' },
  { key: 'watchlist', label: 'Watchlists', short: 'WL', route: '/workspace/watchlist', hint: 'Listas, heatmap y alertas' },
  { key: 'atlas', label: 'ATLAS Ω', short: 'Ω', route: '/workspace/atlas', hint: 'Motores, evidencia y falsificadores' },
  { key: 'screener', label: 'Screener', short: 'SCR', route: '/workspace/screener', hint: 'Universos, filtros y rankings' },
  { key: 'research', label: 'Research', short: 'RSR', route: '/workspace/research', hint: 'Evidence Search, tesis y catalizadores' },
  { key: 'orders', label: 'Orders', short: 'ORD', route: '/workspace/orders', hint: 'Órdenes, broker gate e historial' },
  { key: 'risk', label: 'Risk', short: 'RSK', route: '/workspace/risk', hint: 'Concentración, drawdown y correlación' },
  { key: 'analyze', label: 'Security Hub', short: 'SEC', route: '/analyze', hint: 'Análisis ticker-first' },
  { key: 'broker', label: 'Broker Ω', short: 'T212', route: '/broker', hint: 'Trading 212 bridge y control' },
  { key: 'settings', label: 'System', short: 'SYS', route: '/settings', hint: 'Proveedores, backend y configuración' },
];

const TOP_MODULES = TERMINAL_ROUTES.filter((item) => ['markets', 'portfolio', 'watchlist', 'atlas', 'screener', 'research', 'orders', 'risk'].includes(item.key));
const BOTTOM_KEYS = ['home', 'markets', 'atlas', 'portfolio'];

export function TerminalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');

  const closePalette = () => {
    setPaletteOpen(false);
    setQuery('');
  };

  const navigate = (route: string | null) => {
    if (!route) return;
    closePalette();
    router.push(route as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <TerminalHeader onOpenPalette={() => setPaletteOpen(true)} />
        <PulseTape />

        {!wide ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.moduleStrip}
            contentContainerStyle={styles.moduleStripContent}
          >
            {TOP_MODULES.map((item) => (
              <ModuleChip
                key={item.key}
                item={item}
                active={isActive(pathname, item.route)}
                onPress={() => navigate(item.route)}
              />
            ))}
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
              return (
                <BottomItem
                  key={key}
                  item={item}
                  active={isActive(pathname, item.route)}
                  onPress={() => navigate(item.route)}
                />
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Más funciones"
              onPress={() => setPaletteOpen(true)}
              style={({ pressed }) => [styles.bottomItem, pressed && styles.pressed]}
            >
              <Text style={styles.bottomShort}>GO</Text>
              <Text style={styles.bottomLabel}>Más</Text>
            </Pressable>
          </View>
        ) : null}

        <CommandPalette
          open={paletteOpen}
          query={query}
          onChangeQuery={setQuery}
          onClose={closePalette}
          onNavigate={navigate}
        />
      </View>
    </SafeAreaView>
  );
}

function TerminalHeader({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.push('/' as never)} style={styles.brandWrap}>
        <View style={styles.brandMark}><Text style={styles.brandOmega}>Ω</Text></View>
        <View>
          <Text style={styles.brand}>ATLAS</Text>
          <Text style={styles.brandSub}>INVESTMENT OS</Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir GO Bar"
        onPress={onOpenPalette}
        style={({ pressed }) => [styles.goBar, pressed && styles.pressed]}
      >
        <Text style={styles.goPrompt}>GO</Text>
        <Text numberOfLines={1} style={styles.goText}>símbolo o función</Text>
        <View style={styles.keycap}><Text style={styles.keycapText}>⌘K</Text></View>
      </Pressable>

      <View style={styles.livePill}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>ATLAS</Text>
      </View>
    </View>
  );
}

function PulseTape() {
  const items = ['EVIDENCE > NARRATIVE', 'T212 · FAIL-CLOSED', 'FIRECRAWL · SEARCH Ω', 'NO FABRICATED DATA', 'REGULAR HOURS FIRST'];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tape} contentContainerStyle={styles.tapeContent}>
      {items.map((item, index) => (
        <View key={item} style={styles.tapeItem}>
          <Text style={styles.tapeIndex}>{String(index + 1).padStart(2, '0')}</Text>
          <Text style={styles.tapeText}>{item}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function DesktopRail({ pathname, onNavigate }: { pathname: string; onNavigate: (route: string | null) => void }) {
  return (
    <View style={styles.rail}>
      <Text style={styles.railTitle}>FUNCTIONS</Text>
      {TERMINAL_ROUTES.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => onNavigate(item.route)}
          style={({ pressed }) => [styles.railItem, isActive(pathname, item.route) && styles.railItemActive, pressed && styles.pressed]}
        >
          <Text style={[styles.railCode, isActive(pathname, item.route) && styles.railCodeActive]}>{item.short}</Text>
          <View style={styles.railTextWrap}>
            <Text style={[styles.railLabel, isActive(pathname, item.route) && styles.railLabelActive]}>{item.label}</Text>
            <Text numberOfLines={1} style={styles.railHint}>{item.hint}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function ModuleChip({ item, active, onPress }: { item: TerminalRoute; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.moduleChip, active && styles.moduleChipActive, pressed && styles.pressed]}>
      <Text style={[styles.moduleCode, active && styles.moduleCodeActive]}>{item.short}</Text>
      <Text style={[styles.moduleLabel, active && styles.moduleLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

function BottomItem({ item, active, onPress }: { item: TerminalRoute; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.bottomItem, active && styles.bottomItemActive, pressed && styles.pressed]}>
      <Text style={[styles.bottomShort, active && styles.bottomShortActive]}>{item.short}</Text>
      <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

function CommandPalette({
  open,
  query,
  onChangeQuery,
  onClose,
  onNavigate,
}: {
  open: boolean;
  query: string;
  onChangeQuery: (value: string) => void;
  onClose: () => void;
  onNavigate: (route: string | null) => void;
}) {
  const normalized = query.trim().toLowerCase();
  const rows = useMemo(() => {
    if (!normalized) return TERMINAL_ROUTES;
    return TERMINAL_ROUTES.filter((item) => `${item.label} ${item.short} ${item.hint}`.toLowerCase().includes(normalized));
  }, [normalized]);

  const ticker = query.trim().toUpperCase();
  const tickerCandidate = /^[A-Z0-9.\-]{1,12}$/.test(ticker) && ticker.length >= 1;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.palette}>
          <View style={styles.paletteHeader}>
            <Text style={styles.paletteLabel}>ATLAS GO BAR</Text>
            <Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>ESC</Text></Pressable>
          </View>
          <TextInput
            autoFocus
            value={query}
            onChangeText={onChangeQuery}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Ticker, módulo o función…"
            placeholderTextColor="#5f6b70"
            style={styles.paletteInput}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (tickerCandidate) onNavigate(`/analyze?ticker=${encodeURIComponent(ticker)}`);
            }}
          />

          <ScrollView style={styles.paletteResults} keyboardShouldPersistTaps="handled">
            {tickerCandidate ? (
              <Pressable
                onPress={() => onNavigate(`/analyze?ticker=${encodeURIComponent(ticker)}`)}
                style={({ pressed }) => [styles.commandRow, styles.commandTicker, pressed && styles.pressed]}
              >
                <View style={styles.commandCodeBox}><Text style={styles.commandCode}>SEC</Text></View>
                <View style={styles.commandTextWrap}>
                  <Text style={styles.commandTitle}>Analizar {ticker}</Text>
                  <Text style={styles.commandHint}>Abrir Security Hub con evidencia real</Text>
                </View>
                <Text style={styles.commandArrow}>↵</Text>
              </Pressable>
            ) : null}

            {rows.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => onNavigate(item.route)}
                style={({ pressed }) => [styles.commandRow, pressed && styles.pressed]}
              >
                <View style={styles.commandCodeBox}><Text style={styles.commandCode}>{item.short}</Text></View>
                <View style={styles.commandTextWrap}>
                  <Text style={styles.commandTitle}>{item.label}</Text>
                  <Text style={styles.commandHint}>{item.hint}</Text>
                </View>
                <Text style={styles.commandArrow}>→</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function isActive(pathname: string, route: string | null): boolean {
  if (!route) return false;
  if (route === '/') return pathname === '/';
  return pathname === route || pathname.startsWith(`${route}/`);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#030506' },
  root: { flex: 1, backgroundColor: '#030506' },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2428',
    backgroundColor: '#050809',
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 30, height: 30, borderWidth: 1, borderColor: '#23d9a7', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07130f' },
  brandOmega: { color: '#51f2c5', fontFamily: 'monospace', fontSize: 18, fontWeight: '900' },
  brand: { color: '#f3f6f5', fontFamily: 'monospace', fontWeight: '900', fontSize: 14, letterSpacing: 1.5 },
  brandSub: { color: '#66757b', fontFamily: 'monospace', fontWeight: '700', fontSize: 7, letterSpacing: 1.2, marginTop: 1 },
  goBar: { flex: 1, minWidth: 0, height: 34, borderWidth: 1, borderColor: '#26343a', backgroundColor: '#0a0f11', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, gap: 8 },
  goPrompt: { color: '#42e8b4', fontFamily: 'monospace', fontWeight: '900', fontSize: 11 },
  goText: { color: '#7d8c92', fontFamily: 'monospace', fontSize: 10, flex: 1 },
  keycap: { borderWidth: 1, borderColor: '#2d3a3f', paddingHorizontal: 5, paddingVertical: 2, backgroundColor: '#0f1517' },
  keycapText: { color: '#829197', fontFamily: 'monospace', fontSize: 8, fontWeight: '800' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#214b3d', backgroundColor: '#081510', paddingHorizontal: 7, height: 28 },
  liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#31e6a3' },
  liveText: { color: '#7ff5ce', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  tape: { maxHeight: 27, borderBottomWidth: 1, borderBottomColor: '#172126', backgroundColor: '#070b0d' },
  tapeContent: { alignItems: 'center' },
  tapeItem: { minHeight: 26, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: '#172126' },
  tapeIndex: { color: '#405057', fontFamily: 'monospace', fontSize: 8 },
  tapeText: { color: '#9ca9ad', fontFamily: 'monospace', fontWeight: '700', fontSize: 8, letterSpacing: 0.35 },
  moduleStrip: { maxHeight: 39, borderBottomWidth: 1, borderBottomColor: '#182226', backgroundColor: '#050809' },
  moduleStripContent: { paddingHorizontal: 4, alignItems: 'stretch' },
  moduleChip: { minHeight: 38, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  moduleChipActive: { backgroundColor: '#0b1113', borderBottomColor: '#2ee6aa' },
  moduleCode: { color: '#526169', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  moduleCodeActive: { color: '#49ebbb' },
  moduleLabel: { color: '#94a2a7', fontFamily: 'monospace', fontSize: 9, fontWeight: '700' },
  moduleLabelActive: { color: '#eef5f2' },
  body: { flex: 1, flexDirection: 'row', minHeight: 0 },
  content: { flex: 1, minWidth: 0, backgroundColor: '#050708' },
  rail: { width: 230, backgroundColor: '#050809', borderRightWidth: 1, borderRightColor: '#1b2529', paddingTop: 8 },
  railTitle: { color: '#435158', fontFamily: 'monospace', fontWeight: '900', fontSize: 8, letterSpacing: 1.2, paddingHorizontal: 12, paddingVertical: 7 },
  railItem: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10, borderLeftWidth: 2, borderLeftColor: 'transparent' },
  railItemActive: { backgroundColor: '#0a1110', borderLeftColor: '#2ee6aa' },
  railCode: { width: 31, color: '#596a70', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  railCodeActive: { color: '#4af1bd' },
  railTextWrap: { flex: 1, minWidth: 0 },
  railLabel: { color: '#c1cccf', fontFamily: 'monospace', fontSize: 10, fontWeight: '800' },
  railLabelActive: { color: '#f1f7f5' },
  railHint: { color: '#526269', fontSize: 8, marginTop: 2 },
  bottomNav: { minHeight: 57, flexDirection: 'row', alignItems: 'stretch', borderTopWidth: 1, borderTopColor: '#1b262b', backgroundColor: '#050809' },
  bottomItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 3, borderTopWidth: 2, borderTopColor: 'transparent' },
  bottomItemActive: { backgroundColor: '#09100f', borderTopColor: '#2ee6aa' },
  bottomShort: { color: '#58676d', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  bottomShortActive: { color: '#49ebbb' },
  bottomLabel: { color: '#8c9a9f', fontSize: 9, fontWeight: '700' },
  bottomLabelActive: { color: '#eff5f3' },
  pressed: { opacity: 0.68 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-start', paddingTop: 76, paddingHorizontal: 12 },
  palette: { alignSelf: 'center', width: '100%', maxWidth: 760, maxHeight: '78%', backgroundColor: '#070b0d', borderWidth: 1, borderColor: '#2b3c42' },
  paletteHeader: { minHeight: 35, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#1b272c' },
  paletteLabel: { flex: 1, color: '#5be7bd', fontFamily: 'monospace', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  closeButton: { borderWidth: 1, borderColor: '#2a363b', paddingHorizontal: 6, paddingVertical: 3 },
  closeText: { color: '#718087', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  paletteInput: { height: 49, borderBottomWidth: 1, borderBottomColor: '#1b272c', paddingHorizontal: 12, color: '#f3f8f6', fontFamily: 'monospace', fontSize: 15, fontWeight: '800' },
  paletteResults: { flexGrow: 0 },
  commandRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#151e22' },
  commandTicker: { backgroundColor: '#071410' },
  commandCodeBox: { width: 38, minHeight: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#26363c', backgroundColor: '#0c1214' },
  commandCode: { color: '#50e9b9', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' },
  commandTextWrap: { flex: 1, minWidth: 0 },
  commandTitle: { color: '#e9efed', fontFamily: 'monospace', fontSize: 11, fontWeight: '800' },
  commandHint: { color: '#65757b', fontSize: 9, marginTop: 3 },
  commandArrow: { color: '#506067', fontFamily: 'monospace', fontSize: 12 },
});
