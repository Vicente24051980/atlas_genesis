import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { desc } from 'drizzle-orm';

import { db } from '../db/client';
import { radar } from '../db/schema';

type RadarItem = typeof radar.$inferSelect;

export default function RadarScreen() {
  const [items, setItems] = useState<RadarItem[]>([]);
  const load = useCallback(async () => {
    setItems(await db.select().from(radar).orderBy(desc(radar.createdAt)));
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Radar Ω</Text><Text style={styles.subtitle}>Señales persistidas, Wave Score y severidad.</Text></View>}
      ListEmptyComponent={<Text style={styles.empty}>No hay señales activas en Radar Ω.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.type}>{item.signalType}</Text><Text style={styles.score}>{item.score == null ? '—' : item.score.toFixed(0)}</Text></View>
          <Text style={styles.subject}>{item.subjectId}</Text>
          <Text style={styles.severity}>Severidad: {item.severity}</Text>
          <Text style={styles.time}>{item.createdAt.toLocaleString('es-ES')}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' }, content: { padding: 16, gap: 10 }, header: { gap: 6, marginBottom: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#94a3b8' }, empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' }, row: { flexDirection: 'row', justifyContent: 'space-between' },
  type: { color: '#71b7ff', fontWeight: '800', fontSize: 16 }, score: { color: '#fff', fontWeight: '800', fontSize: 20 }, subject: { color: '#fff', marginTop: 6 }, severity: { color: '#f59e0b', marginTop: 4 }, time: { color: '#64748b', fontSize: 11, marginTop: 6 },
});
