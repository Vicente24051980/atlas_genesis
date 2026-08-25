import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenerApi, ScreenerFilters, ScreenerPayload, ScreenerRow, ScreenerSortKey } from '../core/api/screenerApi';

type PresetKey = 'NONE' | 'ATLAS_BASE' | 'MOMENTUM' | 'QUALITY' | 'VALUE';

const EMPTY_FILTERS: ScreenerFilters = { sort: 'ret1y', direction: 'desc', limit: 50 };
const PRESETS: Record<PresetKey, ScreenerFilters> = {
  NONE: EMPTY_FILTERS,
  ATLAS_BASE: { minMarketCap: 10, minROIC: 20, maxBeta: 1.2, positiveDay: true, above200dma: true, positive1Y: true, positive2Y: true, sort: 'ret1y', direction: 'desc', limit: 50 },
  MOMENTUM: { positiveDay: true, above200dma: true, positive1Y: true, positive2Y: true, sort: 'ret1y', direction: 'desc', limit: 50 },
  QUALITY: { minMarketCap: 10, maxBeta: 1.2, maxPE: 40, sort: 'marketCap', direction: 'desc', limit: 50 },
  VALUE: { minMarketCap: 10, maxPE: 25, above200dma: true, sort: 'pe', direction: 'asc', limit: 50 },
};

export default function ScreenerScreen() {
  const [filters, setFilters] = useState<ScreenerFilters>(EMPTY_FILTERS);
  const [preset, setPreset] = useState<PresetKey>('NONE');
  const [customUniverse, setCustomUniverse] = useState('');
  const [payload, setPayload] = useState<ScreenerPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => [
    filters.minMarketCap, filters.maxPE, filters.maxBeta, filters.minROIC,
    filters.positiveDay, filters.above200dma, filters.positive1Y, filters.positive2Y,
  ].filter((value) => value !== null && value !== undefined && value !== false).length, [filters]);

  const run = async () => {
    setLoading(true);
    setError(null);
    const symbols = customUniverse.split(/[\s,;]+/).map((value) => value.trim().toUpperCase()).filter(Boolean);
    try {
      const next = await ScreenerApi.screen({ ...filters, symbols: symbols.length ? symbols : undefined });
      setPayload(next);
    } catch (cause) {
      setPayload(null);
      setError(cause instanceof Error ? cause.message : 'SCREENER DATA GATE');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    setFilters({ ...PRESETS[key] });
    setPayload(null);
    setError(null);
  };

  const toggle = (key: keyof ScreenerFilters) => {
    setPreset('NONE');
    setFilters((current) => ({ ...current, [key]: !current[key] }));
  };

  const setNumeric = (key: 'minMarketCap' | 'maxPE' | 'maxBeta' | 'minROIC', value: number | null) => {
    setPreset('NONE');
    setFilters((current) => ({ ...current, [key]: current[key] === value ? null : value }));
  };

  const setSort = (key: ScreenerSortKey) => {
    setFilters((current) => ({ ...current, sort: key, direction: current.sort === key && current.direction === 'desc' ? 'asc' : 'desc' }));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.codeBox}><Text style={styles.code}>SCR</Text></View>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>ATLAS Ω · DISCOVERY TERMINAL</Text>
          <Text style={styles.title}>Screener</Text>
          <Text style={styles.subtitle}>Investing-style workflow · ATLAS evidence gates · candidate ≠ decision.</Text>
        </View>
        <View style={styles.countBadge}><Text style={styles.countValue}>{activeFilterCount}</Text><Text style={styles.countLabel}>FILTERS</Text></View>
      </View>

      <View style={styles.universePanel}>
        <View style={styles.sectionHead}><Text style={styles.sectionCode}>UNIVERSE</Text><Text style={styles.sectionMeta}>ATLAS CORE US · CUSTOM ≤60</Text></View>
        <TextInput
          value={customUniverse}
          onChangeText={setCustomUniverse}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="Custom tickers: HBM, FCX, NVDA, WMT…  (blank = ATLAS Core US)"
          placeholderTextColor="#526269"
          style={styles.input}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
        <PresetChip label="RESET" active={preset === 'NONE'} onPress={() => applyPreset('NONE')} />
        <PresetChip label="ATLAS BASE" active={preset === 'ATLAS_BASE'} onPress={() => applyPreset('ATLAS_BASE')} />
        <PresetChip label="MOMENTUM" active={preset === 'MOMENTUM'} onPress={() => applyPreset('MOMENTUM')} />
        <PresetChip label="QUALITY" active={preset === 'QUALITY'} onPress={() => applyPreset('QUALITY')} />
        <PresetChip label="VALUE" active={preset === 'VALUE'} onPress={() => applyPreset('VALUE')} />
      </ScrollView>

      <View style={styles.filterPanel}>
        <FilterGroup title="FUNDAMENTALS" hint="Missing values cannot pass an active gate.">
          <Choice label="MCAP ≥ $10B" active={filters.minMarketCap === 10} onPress={() => setNumeric('minMarketCap', 10)} />
          <Choice label="MCAP ≥ $50B" active={filters.minMarketCap === 50} onPress={() => setNumeric('minMarketCap', 50)} />
          <Choice label="P/E ≤ 25" active={filters.maxPE === 25} onPress={() => setNumeric('maxPE', 25)} />
          <Choice label="P/E ≤ 40" active={filters.maxPE === 40} onPress={() => setNumeric('maxPE', 40)} />
          <Choice label="BETA ≤ 1.2" active={filters.maxBeta === 1.2} onPress={() => setNumeric('maxBeta', 1.2)} />
          <Choice label="ROIC ≥ 20%" active={filters.minROIC === 20} onPress={() => setNumeric('minROIC', 20)} />
        </FilterGroup>
        <FilterGroup title="TECHNICAL / PERFORMANCE" hint="Daily history: Stooq. No synthetic prices.">
          <Choice label="DAY > 0" active={Boolean(filters.positiveDay)} onPress={() => toggle('positiveDay')} />
          <Choice label="PRICE > 200DMA" active={Boolean(filters.above200dma)} onPress={() => toggle('above200dma')} />
          <Choice label="1Y > 0" active={Boolean(filters.positive1Y)} onPress={() => toggle('positive1Y')} />
          <Choice label="2Y > 0" active={Boolean(filters.positive2Y)} onPress={() => toggle('positive2Y')} />
        </FilterGroup>
      </View>

      <View style={styles.sortPanel}>
        <Text style={styles.sectionCode}>SORT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {(['ret1y','ret2y','day','marketCap','roic','beta','pe','symbol'] as ScreenerSortKey[]).map((key) => (
            <Pressable key={key} onPress={() => setSort(key)} style={[styles.sortChip, filters.sort === key && styles.sortChipActive]}>
              <Text style={[styles.sortText, filters.sort === key && styles.sortTextActive]}>{sortLabel(key)}{filters.sort === key ? ` ${filters.direction === 'desc' ? '↓' : '↑'}` : ''}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Pressable onPress={() => void run()} disabled={loading} style={({ pressed }) => [styles.runButton, pressed && styles.pressed, loading && styles.disabled]}>
        {loading ? <ActivityIndicator color="#08120f" /> : <Text style={styles.runCode}>RUN</Text>}
        <Text style={styles.runText}>{loading ? 'SCREENING…' : 'RUN SCREENER Ω'}</Text>
        <Text style={styles.runArrow}>→</Text>
      </Pressable>

      {error ? <View style={styles.errorPanel}><Text style={styles.errorCode}>DATA GATE</Text><Text style={styles.errorText}>{error}</Text></View> : null}

      {payload ? (
        <View style={styles.resultsPanel}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionCode}>RESULTS</Text>
            <Text style={styles.sectionMeta}>{payload.returned}/{payload.scanned} · {payload.universe} · {payload.fundamentalDataGates} FUND GATES</Text>
          </View>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.symbolCol]}>TICKER</Text><Text style={styles.th}>DAY</Text><Text style={styles.th}>1Y</Text><Text style={styles.th}>MCAP</Text>
          </View>
          {payload.items.map((row) => (
            <ScreenerResult key={row.symbol} row={row} expanded={expanded === row.symbol} onToggle={() => setExpanded((current) => current === row.symbol ? null : row.symbol)} />
          ))}
          {!payload.items.length ? <Text style={styles.empty}>NO CANDIDATES PASS THE ACTIVE FILTERS</Text> : null}
          <View style={styles.guardrail}><Text style={styles.guardrailCode}>GUARDRAIL</Text><Text style={styles.guardrailText}>{payload.guardrail}</Text></View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function PresetChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.presetChip, active && styles.presetChipActive]}><Text style={[styles.presetText, active && styles.presetTextActive]}>{label}</Text></Pressable>;
}
function FilterGroup({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return <View style={styles.filterGroup}><View style={styles.filterGroupTop}><Text style={styles.filterTitle}>{title}</Text><Text style={styles.filterHint}>{hint}</Text></View><View style={styles.choices}>{children}</View></View>;
}
function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}><View style={[styles.check, active && styles.checkActive]}><Text style={styles.checkText}>{active ? '✓' : ''}</Text></View><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text></Pressable>;
}
function ScreenerResult({ row, expanded, onToggle }: { row: ScreenerRow; expanded: boolean; onToggle: () => void }) {
  return (
    <View style={styles.resultWrap}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.symbolCol}><Text style={styles.symbol}>{row.symbol}</Text><Text numberOfLines={1} style={styles.company}>{row.name} · {row.sector}</Text></View>
        <MetricCell value={fmtPct(row.day)} tone={tone(row.day)} />
        <MetricCell value={fmtPct(row.ret1y)} tone={tone(row.ret1y)} />
        <MetricCell value={row.marketCap === null ? 'GATE' : `$${row.marketCap.toFixed(1)}B`} />
      </Pressable>
      {expanded ? (
        <View style={styles.detail}>
          <View style={styles.detailGrid}>
            <DetailMetric label="PRICE" value={fmt(row.price)} />
            <DetailMetric label="2Y" value={fmtPct(row.ret2y)} tone={tone(row.ret2y)} />
            <DetailMetric label="200DMA" value={row.above200dma === null ? 'GATE' : row.above200dma ? 'ABOVE' : 'BELOW'} tone={row.above200dma ? 'good' : row.above200dma === false ? 'bad' : 'neutral'} />
            <DetailMetric label="P/E" value={fmt(row.pe)} />
            <DetailMetric label="BETA" value={fmt(row.beta)} />
            <DetailMetric label="ROIC" value={fmtPct(row.roic)} />
            <DetailMetric label="FUND COVER" value={`${Math.round(row.fundamentalCoverage * 100)}%`} />
            <DetailMetric label="TECH COVER" value={`${Math.round(row.technicalCoverage * 100)}%`} />
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => router.push(`/audit?ticker=${encodeURIComponent(row.symbol)}` as never)} style={styles.action}><Text style={styles.actionCode}>AUD</Text><Text style={styles.actionText}>Auditar</Text></Pressable>
            <Pressable onPress={() => router.push(`/analyze?ticker=${encodeURIComponent(row.symbol)}` as never)} style={styles.action}><Text style={styles.actionCode}>SEC</Text><Text style={styles.actionText}>Security Hub</Text></Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
function MetricCell({ value, tone: metricTone = 'neutral' }: { value: string; tone?: 'good' | 'bad' | 'neutral' }) { return <Text style={[styles.td, metricTone === 'good' && styles.good, metricTone === 'bad' && styles.bad]}>{value}</Text>; }
function DetailMetric({ label, value, tone: metricTone = 'neutral' }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) { return <View style={styles.detailMetric}><Text style={styles.detailLabel}>{label}</Text><Text style={[styles.detailValue, metricTone === 'good' && styles.good, metricTone === 'bad' && styles.bad]}>{value}</Text></View>; }
function tone(value: number | null): 'good' | 'bad' | 'neutral' { return value === null || value === 0 ? 'neutral' : value > 0 ? 'good' : 'bad'; }
function fmt(value: number | null): string { return value === null ? 'GATE' : value.toLocaleString('es-ES', { maximumFractionDigits: 2 }); }
function fmtPct(value: number | null): string { return value === null ? 'GATE' : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`; }
function sortLabel(key: ScreenerSortKey): string { return ({ ret1y: '1Y', ret2y: '2Y', day: 'DAY', marketCap: 'MCAP', roic: 'ROIC', beta: 'BETA', pe: 'P/E', symbol: 'ABC' })[key]; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 30, gap: 9 }, flex: { flex: 1 }, pressed: { opacity: 0.68 }, disabled: { opacity: 0.55 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#1a262b', paddingBottom: 10 }, codeBox: { width: 46, height: 42, borderWidth: 1, borderColor: '#2f725b', backgroundColor: '#071510', alignItems: 'center', justifyContent: 'center' }, code: { color: '#54efbd', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' }, eyebrow: { color: '#607278', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, title: { color: '#eef5f2', fontFamily: 'monospace', fontSize: 22, fontWeight: '900', marginTop: 2 }, subtitle: { color: '#596b70', fontSize: 9, marginTop: 3 }, countBadge: { minWidth: 48, borderWidth: 1, borderColor: '#233238', backgroundColor: '#080d0f', padding: 6, alignItems: 'center' }, countValue: { color: '#54efbd', fontFamily: 'monospace', fontSize: 14, fontWeight: '900' }, countLabel: { color: '#5d6d72', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' },
  universePanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#070c0e' }, sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 9, borderBottomWidth: 1, borderBottomColor: '#1b292e' }, sectionCode: { color: '#54efbd', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, sectionMeta: { color: '#53656a', fontFamily: 'monospace', fontSize: 7, fontWeight: '800' }, input: { height: 42, color: '#dce6e2', fontFamily: 'monospace', fontSize: 9, paddingHorizontal: 10, backgroundColor: '#050809' },
  presetRow: { gap: 6, paddingVertical: 1 }, presetChip: { borderWidth: 1, borderColor: '#243239', backgroundColor: '#080d0f', paddingHorizontal: 10, height: 30, justifyContent: 'center' }, presetChipActive: { borderColor: '#35745f', backgroundColor: '#081610' }, presetText: { color: '#718087', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, presetTextActive: { color: '#64efc0' },
  filterPanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#060a0b' }, filterGroup: { padding: 9, borderBottomWidth: 1, borderBottomColor: '#162126' }, filterGroupTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 }, filterTitle: { color: '#b9c7c3', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, filterHint: { flex: 1, color: '#4c5c61', fontSize: 7, textAlign: 'right' }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, choice: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#243239', paddingHorizontal: 8, backgroundColor: '#080d0f' }, choiceActive: { borderColor: '#35745f', backgroundColor: '#081610' }, check: { width: 13, height: 13, borderWidth: 1, borderColor: '#3b494e', alignItems: 'center', justifyContent: 'center' }, checkActive: { borderColor: '#52dcae', backgroundColor: '#0e271d' }, checkText: { color: '#6df0c2', fontSize: 8, fontWeight: '900' }, choiceText: { color: '#74848a', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, choiceTextActive: { color: '#cce9df' },
  sortPanel: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#18242a', backgroundColor: '#070b0d', paddingLeft: 9 }, sortRow: { gap: 5, paddingVertical: 6, paddingRight: 8 }, sortChip: { borderWidth: 1, borderColor: '#253238', paddingHorizontal: 8, height: 26, justifyContent: 'center' }, sortChipActive: { borderColor: '#35745f', backgroundColor: '#081610' }, sortText: { color: '#627277', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, sortTextActive: { color: '#5aeaba' },
  runButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#43a27e', backgroundColor: '#49e3ad', paddingHorizontal: 12 }, runCode: { color: '#05100c', fontFamily: 'monospace', fontSize: 8, fontWeight: '900' }, runText: { flex: 1, color: '#05100c', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' }, runArrow: { color: '#05100c', fontFamily: 'monospace', fontSize: 16, fontWeight: '900' },
  errorPanel: { borderWidth: 1, borderColor: '#673b3b', backgroundColor: '#160909', padding: 10, gap: 4 }, errorCode: { color: '#e47c7c', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, errorText: { color: '#c89595', fontSize: 9, lineHeight: 14 },
  resultsPanel: { borderWidth: 1, borderColor: '#1b292e', backgroundColor: '#060a0b' }, tableHeader: { flexDirection: 'row', paddingHorizontal: 9, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1b292e' }, th: { width: 62, color: '#46565b', fontFamily: 'monospace', fontSize: 6, fontWeight: '900', textAlign: 'right' }, symbolCol: { flex: 1, textAlign: 'left' }, resultWrap: { borderBottomWidth: 1, borderBottomColor: '#10181b' }, row: { minHeight: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9 }, symbol: { color: '#e9f1ef', fontFamily: 'monospace', fontSize: 10, fontWeight: '900' }, company: { color: '#53646a', fontSize: 7, marginTop: 2, maxWidth: 190 }, td: { width: 62, color: '#aab8b4', fontFamily: 'monospace', fontSize: 8, textAlign: 'right' }, good: { color: '#4de7b4' }, bad: { color: '#e47c7c' }, empty: { color: '#5d6b70', fontFamily: 'monospace', fontSize: 8, padding: 15 },
  detail: { borderTopWidth: 1, borderTopColor: '#142025', backgroundColor: '#050809', padding: 9, gap: 8 }, detailGrid: { flexDirection: 'row', flexWrap: 'wrap' }, detailMetric: { width: '25%', minWidth: 78, paddingVertical: 6, paddingRight: 7 }, detailLabel: { color: '#46565b', fontFamily: 'monospace', fontSize: 6, fontWeight: '900' }, detailValue: { color: '#cbd7d3', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', marginTop: 3 }, actions: { flexDirection: 'row', gap: 6 }, action: { flex: 1, minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#285544', paddingHorizontal: 8, backgroundColor: '#07110d' }, actionCode: { color: '#53e7b7', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, actionText: { color: '#b9ccc5', fontFamily: 'monospace', fontSize: 8, fontWeight: '800' },
  guardrail: { borderTopWidth: 1, borderTopColor: '#1b292e', padding: 9, flexDirection: 'row', gap: 8 }, guardrailCode: { color: '#d2b45c', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, guardrailText: { flex: 1, color: '#746d57', fontSize: 8, lineHeight: 13 },
});
