import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { desc } from 'drizzle-orm';

import { db } from '../db/client';
import { evidence } from '../db/schema';

type EvidenceItem = typeof evidence.$inferSelect;

export default function EvidenceScreen() {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const load = useCallback(async () => {
    setItems(await db.select().from(evidence).orderBy(desc(evidence.createdAt)));
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Evidence Ω</Text><Text style={styles.subtitle}>Solo evidencia persistida con estado epistemológico explícito.</Text></View>}
      ListEmptyComponent={<Text style={styles.empty}>No hay evidencias locales todavía.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.subject}>{item.subjectId}</Text><Text style={styles.state}>{item.validationState}</Text></View>
          <Text style={styles.summary}>{item.summary}</Text>
          <Text style={styles.meta}>{item.sourceType} · {item.epistemicClass}</Text>
          <Text style={styles.ref}>{item.sourceRef}</Text>
          {item.contentHash ? <Text style={styles.hash}>Hash: {item.contentHash}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' }, content: { padding: 16, gap: 10 }, header: { gap: 6, marginBottom: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#94a3b8' }, empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  subject: { color: '#71b7ff', fontWeight: '800', flex: 1 }, state: { color: '#22c55e', fontWeight: '700', fontSize: 12 }, summary: { color: '#fff', marginTop: 8, lineHeight: 20 },
  meta: { color: '#9da9b7', marginTop: 8, fontSize: 12 }, ref: { color: '#8ea2b8', marginTop: 4, fontSize: 12 }, hash: { color: '#64748b', marginTop: 4, fontSize: 10 },
});
