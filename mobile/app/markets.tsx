import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, InstrumentRow, Pill, SectionHeader } from '../components/BrokerUi';
import { AtlasOnlineApi, type MarketOverview, type MarketSearch } from '../core/api/atlasOnlineApi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function MarketsScreen() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<MarketSearch | null>(null);
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { void AtlasOnlineApi.marketOverview().then(setOverview).catch(() => undefined); }, []);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError('');
    try { setResult(await AtlasOnlineApi.marketSearch(query)); }
    catch (cause) { setResult(null); setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setLoading(false); }
  };

  return (
    <AtlasBrokerShell active="home" title="Mercados" keyboardShouldPersistTaps="handled">
      <View style={styles.heading}><View style={{ flex: 1 }}><Text style={styles.kicker}>DISCOVER</Text><Text style={styles.title}>Buscar mercados</Text><Text style={styles.subtitle}>Búsqueda ticker-first y descubrimiento con datos que devuelve el backend.</Text></View><Pill label="SEARCH" tone="info" /></View>

      <View style={styles.searchBox}>
        <Text style={styles.searchGlyph}>⌕</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Ticker o empresa" placeholderTextColor={t.textFaint} autoCapitalize="characters" autoCorrect={false} returnKeyType="search" onSubmitEditing={() => { void search(); }} style={styles.input} />
        <Pressable onPress={() => { void search(); }} style={styles.searchButton}><Text style={styles.searchButtonText}>Buscar</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color={t.accent} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {result ? <><SectionHeader title={`Resultados · ${result.count}`} /><Card>{result.items.map((item) => <InstrumentRow key={item.symbol} ticker={item.symbol} name={item.name} meta={item.sector} onPress={() => router.push({ pathname: '/analyze', params: { ticker: item.symbol } })} />)}</Card></> : null}

      <SectionHeader title="Índices" />
      <Card>{overview?.benchmarks?.map((item) => <InstrumentRow key={item.symbol} ticker={item.symbol} name={item.name} meta={item.sector} value={item.price == null ? '—' : item.price.toFixed(2)} change={item.changePct} />) || <Text style={styles.muted}>Cargando…</Text>}</Card>

      <SectionHeader title="Sectores" />
      <Card>{overview?.sectors?.map((item) => <InstrumentRow key={item.symbol} ticker={item.symbol} name={item.name} meta={item.sector} value={item.price == null ? '—' : item.price.toFixed(2)} change={item.changePct} />) || <Text style={styles.muted}>Cargando…</Text>}</Card>
    </AtlasBrokerShell>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  searchBox: { minHeight: 52, backgroundColor: t.surface, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, flexDirection: 'row', alignItems: 'center', paddingLeft: 13, gap: 7 },
  searchGlyph: { color: t.textMuted, fontSize: 19 },
  input: { flex: 1, color: t.text, fontSize: 14, paddingVertical: 12 },
  searchButton: { paddingHorizontal: 13, alignSelf: 'stretch', justifyContent: 'center', borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: t.border },
  searchButtonText: { color: t.accent, fontWeight: '800', fontSize: 12 },
  error: { color: t.negative, backgroundColor: t.negativeSoft, padding: 12, borderRadius: 12 },
  muted: { color: t.textMuted, padding: 10 },
});
