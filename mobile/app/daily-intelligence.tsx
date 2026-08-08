import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { desc } from 'drizzle-orm';

import { db } from '../db/client';
import { decisionLog } from '../db/schema';

type Decision = typeof decisionLog.$inferSelect;

export default function DailyIntelligenceScreen() {
  const [items, setItems] = useState<Decision[]>([]);
  const load = useCallback(async () => {
    setItems(await db.select().from(decisionLog).orderBy(desc(decisionLog.createdAt)));
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Daily Intelligence</Text><Text style={styles.subtitle}>Decisiones y cambios persistidos localmente.</Text></View>}
      ListEmptyComponent={<Text style={styles.empty}>No hay decisiones registradas todavía.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.type}>{item.decisionType}</Text><Text style={styles.time}>{item.createdAt.toLocaleString('es-ES')}</Text></View>
          {item.subjectId ? <Text style={styles.subject}>{item.subjectId}</Text> : null}
          <Text style={styles.rationale}>{item.rationale}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' }, content: { padding: 16, gap: 10 }, header: { gap: 6, marginBottom: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#94a3b8' }, empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  type: { color: '#71b7ff', fontWeight: '800', flex: 1 }, time: { color: '#64748b', fontSize: 10 }, subject: { color: '#cbd5e1', marginTop: 6, fontWeight: '600' }, rationale: { color: '#fff', marginTop: 8, lineHeight: 20 },
});
