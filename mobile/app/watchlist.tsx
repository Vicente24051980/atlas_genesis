import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { WatchlistStore } from '../core/storage/localStore';

export default function WatchlistScreen() {
  const [rows, setRows] = useState<string[]>([]);
  const [ticker, setTicker] = useState('');

  const load = async () => setRows(await WatchlistStore.list());
  useEffect(() => { void load(); }, []);

  const add = async () => {
    if (!ticker.trim()) return;
    setRows(await WatchlistStore.add(ticker));
    setTicker('');
  };

  const remove = async (symbol: string) => setRows(await WatchlistStore.remove(symbol));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.code}>WL</Text>
        <View style={styles.headerText}><Text style={styles.eyebrow}>ATLAS TERMINAL · WATCHLIST</Text><Text style={styles.title}>Watchlist</Text></View>
      </View>
      <Text style={styles.description}>Lista persistente local para candidatos, no-chase, catalizadores y nombres que deben volver a auditarse. El precio en vivo se conectará por el market feed; guardar un ticker no es una recomendación.</Text>

      <View style={styles.addRow}>
        <TextInput value={ticker} onChangeText={setTicker} autoCapitalize="characters" autoCorrect={false} placeholder="Añadir ticker" placeholderTextColor="#4f5e63" style={styles.input} returnKeyType="done" onSubmitEditing={() => { void add(); }} />
        <Pressable onPress={() => { void add(); }} style={({ pressed }) => [styles.add, pressed && styles.pressed]}><Text style={styles.addText}>ADD</Text></Pressable>
      </View>

      <View style={styles.tableHeader}><Text style={[styles.h, styles.flex]}>SYMBOL</Text><Text style={styles.h}>AUDIT</Text><Text style={styles.h}>REMOVE</Text></View>
      {rows.length ? rows.map((symbol) => (
        <View key={symbol} style={styles.row}>
          <Pressable onPress={() => router.push(`/analyze?ticker=${encodeURIComponent(symbol)}` as never)} style={styles.flex}>
            <Text style={styles.symbol}>{symbol}</Text><Text style={styles.hint}>Security Hub</Text>
          </Pressable>
          <Pressable onPress={() => router.push(`/audit?ticker=${encodeURIComponent(symbol)}` as never)} style={styles.cellButton}><Text style={styles.cellText}>AUD</Text></Pressable>
          <Pressable onPress={() => { void remove(symbol); }} style={styles.cellButton}><Text style={[styles.cellText, styles.removeText]}>×</Text></Pressable>
        </View>
      )) : <View style={styles.empty}><Text style={styles.emptyTitle}>WATCHLIST VACÍA</Text><Text style={styles.emptyText}>Añade un ticker aquí o desde la pantalla AUDIT.</Text></View>}

      <View style={styles.rule}><Text style={styles.ruleTitle}>WATCHLIST RULE</Text><Text style={styles.ruleText}>Watchlist es memoria operativa. La prioridad real la determinan evidencia, motores aplicables, falsificadores y entrada.</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050708' }, content: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 28, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#1b272c', paddingBottom: 12 },
  code: { width: 48, height: 48, textAlign: 'center', textAlignVertical: 'center', borderWidth: 1, borderColor: '#315b75', backgroundColor: '#071019', color: '#8cccf3', fontFamily: 'monospace', fontWeight: '900' },
  headerText: { flex: 1 }, eyebrow: { color: '#5e7379', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, title: { color: '#eff5f3', fontFamily: 'monospace', fontSize: 24, fontWeight: '900', marginTop: 3 },
  description: { color: '#8c9a9f', fontSize: 12, lineHeight: 18 }, addRow: { flexDirection: 'row', gap: 8 }, input: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: '#26383e', backgroundColor: '#080d0f', color: '#eef5f3', paddingHorizontal: 12, fontFamily: 'monospace' },
  add: { justifyContent: 'center', borderWidth: 1, borderColor: '#315b75', backgroundColor: '#071019', paddingHorizontal: 15 }, addText: { color: '#8cccf3', fontFamily: 'monospace', fontWeight: '900', fontSize: 9 }, pressed: { opacity: 0.67 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1b292e', paddingVertical: 6, gap: 8 }, h: { width: 56, color: '#4f6066', fontFamily: 'monospace', fontSize: 7, fontWeight: '900' }, flex: { flex: 1 },
  row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#111a1e' }, symbol: { color: '#e9f1ef', fontFamily: 'monospace', fontWeight: '900', fontSize: 15 }, hint: { color: '#526167', fontSize: 9, marginTop: 2 },
  cellButton: { width: 56, minHeight: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#213138', backgroundColor: '#080d0f' }, cellText: { color: '#76d6b7', fontFamily: 'monospace', fontSize: 9, fontWeight: '900' }, removeText: { color: '#d98c8c', fontSize: 16 },
  empty: { paddingVertical: 35, alignItems: 'center', borderWidth: 1, borderColor: '#172328', backgroundColor: '#070b0d' }, emptyTitle: { color: '#67777c', fontFamily: 'monospace', fontWeight: '900', fontSize: 10 }, emptyText: { color: '#4f5d62', fontSize: 10, marginTop: 5 },
  rule: { borderTopWidth: 1, borderTopColor: '#1a2428', paddingTop: 12 }, ruleTitle: { color: '#4fe8b6', fontFamily: 'monospace', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, ruleText: { color: '#718087', fontSize: 10, lineHeight: 16, marginTop: 5 },
});
