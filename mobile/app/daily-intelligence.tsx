import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { desc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { decisionLog } from '../db/schema';
import { AuditLogRepository } from '../db/repositories/AuditLogRepository';
import { createEventId } from '../core/createEventId';

type Decision = typeof decisionLog.$inferSelect;

export default function DailyIntelligenceScreen() {
  const [items, setItems] = useState<Decision[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [decisionType, setDecisionType] = useState('REVIEW');
  const [rationale, setRationale] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setItems(await db.select().from(decisionLog).orderBy(desc(decisionLog.createdAt)));
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const add = async () => {
    const type = decisionType.trim().toUpperCase();
    const reason = rationale.trim();
    const subject = subjectId.trim().toUpperCase();
    if (!type || !reason) {
      setMessage('Tipo y razonamiento son obligatorios.');
      return;
    }
    await db.insert(decisionLog).values({
      id: createEventId('DEC'),
      subjectId: subject || null,
      decisionType: type,
      rationale: reason,
      evidenceRefsJson: '[]',
      createdAt: new Date(),
    });
    await AuditLogRepository.insert({
      id: createEventId('AUD'),
      action: 'DECISION_ADD',
      actor: 'USER',
      target: subject || type,
      payloadHash: null,
      createdAt: new Date(),
    });
    setSubjectId('');
    setRationale('');
    setMessage('Decisión registrada.');
    await load();
  };

  const remove = async (item: Decision) => {
    await db.delete(decisionLog).where(eq(decisionLog.id, item.id));
    await AuditLogRepository.insert({
      id: createEventId('AUD'),
      action: 'DECISION_DELETE',
      actor: 'USER',
      target: item.subjectId ?? item.decisionType,
      payloadHash: null,
      createdAt: new Date(),
    });
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
          <Text style={styles.title}>Daily Intelligence</Text>
          <Text style={styles.subtitle}>Diario local de decisiones, revisiones y cambios relevantes.</Text>
          <View style={styles.form}>
            <TextInput value={subjectId} onChangeText={setSubjectId} autoCapitalize="characters" placeholder="Ticker / sujeto (opcional)" placeholderTextColor="#64748b" style={styles.input} />
            <TextInput value={decisionType} onChangeText={setDecisionType} placeholder="REVIEW / HOLD / BUY / WATCH" placeholderTextColor="#64748b" style={styles.input} />
            <TextInput value={rationale} onChangeText={setRationale} placeholder="Razonamiento / qué cambió / qué vigilar" placeholderTextColor="#64748b" style={[styles.input, styles.multiline]} multiline />
            <Pressable onPress={() => { void add(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Registrar decisión</Text></Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          <Text style={styles.count}>{items.length} entradas</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No hay decisiones registradas todavía.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.type}>{item.decisionType}</Text><Text style={styles.time}>{item.createdAt.toLocaleString('es-ES')}</Text></View>
          {item.subjectId ? <Text style={styles.subject}>{item.subjectId}</Text> : null}
          <Text style={styles.rationale}>{item.rationale}</Text>
          <Pressable onPress={() => { void remove(item); }} style={styles.remove}><Text style={styles.removeText}>Eliminar entrada</Text></Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' }, content: { padding: 16, gap: 10 }, header: { gap: 6, marginBottom: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#94a3b8' }, empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  form: { backgroundColor: '#111923', borderRadius: 14, padding: 12, gap: 8, marginTop: 8, borderWidth: 1, borderColor: '#29405b' }, input: { backgroundColor: '#0f141b', color: '#fff', borderWidth: 1, borderColor: '#263241', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }, multiline: { minHeight: 76, textAlignVertical: 'top' },
  button: { backgroundColor: '#2f81f7', borderRadius: 10, padding: 12, alignItems: 'center' }, buttonText: { color: '#fff', fontWeight: '800' }, pressed: { opacity: 0.7 }, message: { color: '#9da9b7', fontSize: 12 }, count: { color: '#71b7ff', fontWeight: '700', marginTop: 6 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  type: { color: '#71b7ff', fontWeight: '800', flex: 1 }, time: { color: '#64748b', fontSize: 10 }, subject: { color: '#cbd5e1', marginTop: 6, fontWeight: '600' }, rationale: { color: '#fff', marginTop: 8, lineHeight: 20 },
  remove: { alignSelf: 'flex-start', marginTop: 10, borderWidth: 1, borderColor: '#51323a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }, removeText: { color: '#f87171', fontWeight: '700', fontSize: 12 },
});
