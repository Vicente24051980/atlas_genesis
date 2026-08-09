import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { desc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { radar } from '../db/schema';
import { AuditLogRepository } from '../db/repositories/AuditLogRepository';
import { createEventId } from '../core/createEventId';

type RadarItem = typeof radar.$inferSelect;

export default function RadarScreen() {
  const [items, setItems] = useState<RadarItem[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [signalType, setSignalType] = useState('WAVE');
  const [score, setScore] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setItems(await db.select().from(radar).orderBy(desc(radar.createdAt)));
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const add = async () => {
    const subject = subjectId.trim().toUpperCase();
    const type = signalType.trim().toUpperCase();
    const level = severity.trim().toUpperCase();
    const parsedScore = score.trim() ? Number(score.replace(',', '.')) : null;
    if (!subject || !type || !level) {
      setMessage('Sujeto, tipo y severidad son obligatorios.');
      return;
    }
    if (parsedScore !== null && (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100)) {
      setMessage('Wave Score debe estar entre 0 y 100.');
      return;
    }
    const id = createEventId('RAD');
    await db.insert(radar).values({
      id,
      subjectId: subject,
      signalType: type,
      score: parsedScore,
      severity: level,
      payloadJson: JSON.stringify({ note: note.trim() }),
      createdAt: new Date(),
    });
    await AuditLogRepository.insert({
      id: createEventId('AUD'),
      action: 'RADAR_ADD',
      actor: 'USER',
      target: subject,
      payloadHash: null,
      createdAt: new Date(),
    });
    setSubjectId('');
    setScore('');
    setNote('');
    setMessage('Señal guardada en Radar Ω.');
    await load();
  };

  const remove = async (item: RadarItem) => {
    await db.delete(radar).where(eq(radar.id, item.id));
    await AuditLogRepository.insert({
      id: createEventId('AUD'),
      action: 'RADAR_DELETE',
      actor: 'USER',
      target: item.subjectId,
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
          <Text style={styles.title}>Radar Ω</Text>
          <Text style={styles.subtitle}>Crea señales manuales con Wave Score y severidad; quedan persistidas localmente.</Text>
          <View style={styles.form}>
            <TextInput value={subjectId} onChangeText={setSubjectId} autoCapitalize="characters" placeholder="Ticker / sujeto" placeholderTextColor="#64748b" style={styles.input} />
            <View style={styles.inputRow}>
              <TextInput value={signalType} onChangeText={setSignalType} placeholder="WAVE" placeholderTextColor="#64748b" style={[styles.input, styles.half]} />
              <TextInput value={severity} onChangeText={setSeverity} placeholder="MEDIUM" placeholderTextColor="#64748b" style={[styles.input, styles.half]} />
            </View>
            <TextInput value={score} onChangeText={setScore} keyboardType="decimal-pad" placeholder="Wave Score 0-100 (opcional)" placeholderTextColor="#64748b" style={styles.input} />
            <TextInput value={note} onChangeText={setNote} placeholder="Nota / catalizador / riesgo" placeholderTextColor="#64748b" style={[styles.input, styles.multiline]} multiline />
            <Pressable onPress={() => { void add(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Guardar señal</Text></Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          <Text style={styles.count}>{items.length} señales</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No hay señales activas en Radar Ω.</Text>}
      renderItem={({ item }) => {
        let parsedNote = '';
        try {
          const payload = JSON.parse(item.payloadJson) as { note?: string };
          parsedNote = payload.note ?? '';
        } catch {
          parsedNote = item.payloadJson;
        }
        return (
          <View style={styles.card}>
            <View style={styles.row}><Text style={styles.type}>{item.signalType}</Text><Text style={styles.score}>{item.score == null ? '—' : item.score.toFixed(0)}</Text></View>
            <Text style={styles.subject}>{item.subjectId}</Text>
            <Text style={styles.severity}>Severidad: {item.severity}</Text>
            {parsedNote ? <Text style={styles.note}>{parsedNote}</Text> : null}
            <Text style={styles.time}>{item.createdAt.toLocaleString('es-ES')}</Text>
            <Pressable onPress={() => { void remove(item); }} style={styles.remove}><Text style={styles.removeText}>Eliminar señal</Text></Pressable>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' }, content: { padding: 16, gap: 10 }, header: { gap: 6, marginBottom: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#94a3b8' }, empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  form: { backgroundColor: '#111923', borderRadius: 14, padding: 12, gap: 8, marginTop: 8, borderWidth: 1, borderColor: '#29405b' }, input: { backgroundColor: '#0f141b', color: '#fff', borderWidth: 1, borderColor: '#263241', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }, inputRow: { flexDirection: 'row', gap: 8 }, half: { flex: 1 }, multiline: { minHeight: 64, textAlignVertical: 'top' },
  button: { backgroundColor: '#2f81f7', borderRadius: 10, padding: 12, alignItems: 'center' }, buttonText: { color: '#fff', fontWeight: '800' }, pressed: { opacity: 0.7 }, message: { color: '#9da9b7', fontSize: 12 }, count: { color: '#71b7ff', fontWeight: '700', marginTop: 6 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' }, row: { flexDirection: 'row', justifyContent: 'space-between' },
  type: { color: '#71b7ff', fontWeight: '800', fontSize: 16 }, score: { color: '#fff', fontWeight: '800', fontSize: 20 }, subject: { color: '#fff', marginTop: 6 }, severity: { color: '#f59e0b', marginTop: 4 }, note: { color: '#cbd5e1', marginTop: 8, lineHeight: 19 }, time: { color: '#64748b', fontSize: 11, marginTop: 6 },
  remove: { alignSelf: 'flex-start', marginTop: 10, borderWidth: 1, borderColor: '#51323a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }, removeText: { color: '#f87171', fontWeight: '700', fontSize: 12 },
});
