import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { desc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { watchlist } from '../db/schema';

type WatchItem = typeof watchlist.$inferSelect;

export default function WatchlistScreen() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const rows = await db.select().from(watchlist).orderBy(desc(watchlist.addedAt));
    setItems(rows);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const add = async () => {
    const normalizedTicker = ticker.trim().toUpperCase();
    const normalizedName = companyName.trim();
    if (!normalizedTicker || !normalizedName) {
      setMessage('Ticker y empresa son obligatorios.');
      return;
    }
    try {
      await db.insert(watchlist).values({
        id: `WL-${Date.now()}`,
        canonicalTicker: normalizedTicker,
        companyName: normalizedName,
        state: 'ACTIVE',
        addedAt: new Date(),
      });
      setTicker('');
      setCompanyName('');
      setMessage('Añadido a Watchlist Ω.');
      await load();
    } catch {
      setMessage('Ese ticker ya existe o no pudo guardarse.');
    }
  };

  const remove = async (id: string) => {
    await db.delete(watchlist).where(eq(watchlist.id, id));
    await load();
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Watchlist Ω</Text>
          <Text style={styles.subtitle}>Persistencia local, sin duplicados por ticker.</Text>
          <View style={styles.form}>
            <TextInput value={ticker} onChangeText={setTicker} autoCapitalize="characters" placeholder="Ticker (MSFT)" placeholderTextColor="#64748b" style={styles.input} />
            <TextInput value={companyName} onChangeText={setCompanyName} placeholder="Empresa" placeholderTextColor="#64748b" style={styles.input} />
            <Pressable onPress={() => { void add(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.buttonText}>Añadir candidato</Text>
            </Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          <Text style={styles.count}>{items.length} candidatos</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Watchlist vacía. Añade el primer candidato.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.ticker}>{item.canonicalTicker}</Text>
              <Text style={styles.company}>{item.companyName}</Text>
              <Text style={styles.state}>{item.state}</Text>
            </View>
            <Pressable onPress={() => { void remove(item.id); }} style={styles.remove}><Text style={styles.removeText}>Quitar</Text></Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  content: { padding: 16, gap: 10 },
  header: { gap: 8, marginBottom: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#94a3b8' },
  form: { backgroundColor: '#111923', borderRadius: 14, padding: 12, gap: 8, borderWidth: 1, borderColor: '#29405b' },
  input: { backgroundColor: '#0f141b', color: '#fff', borderWidth: 1, borderColor: '#263241', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  button: { backgroundColor: '#2f81f7', borderRadius: 10, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  pressed: { opacity: 0.7 },
  message: { color: '#9da9b7', fontSize: 12 },
  count: { color: '#71b7ff', fontWeight: '700' },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  ticker: { color: '#71b7ff', fontSize: 18, fontWeight: '800' },
  company: { color: '#fff', marginTop: 4 },
  state: { color: '#8ea2b8', fontSize: 11, marginTop: 4 },
  remove: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#51323a' },
  removeText: { color: '#f87171', fontWeight: '700', fontSize: 12 },
  empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
});
