import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { EvidenceRepository } from '../db/repositories/EvidenceRepository';
import type { EvidenceRecord } from '../db/repositories/EvidenceRepository';
import { AuditLogRepository } from '../db/repositories/AuditLogRepository';

export default function EvidenceScreen() {
  const [items, setItems] = useState<EvidenceRecord[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [summary, setSummary] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [sourceType, setSourceType] = useState('PRIMARY');
  const [epistemicClass, setEpistemicClass] = useState('EVIDENCE');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setItems(await EvidenceRepository.getAll());
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const add = async () => {
    const subject = subjectId.trim().toUpperCase();
    const text = summary.trim();
    const ref = sourceRef.trim();
    if (!subject || !text || !ref) {
      setMessage('Sujeto, resumen y referencia de fuente son obligatorios.');
      return;
    }
    const id = `EVD-${Date.now()}`;
    await EvidenceRepository.insert({
      id,
      subjectId: subject,
      sourceType: sourceType.trim().toUpperCase() || 'PRIMARY',
      sourceRef: ref,
      validationState: 'PENDING_PRIMARY_VALIDATION',
      epistemicClass: epistemicClass.trim().toUpperCase() || 'EVIDENCE',
      contentHash: null,
      summary: text,
      createdAt: new Date(),
    });
    await AuditLogRepository.insert({
      id: `AUD-${Date.now()}`,
      action: 'EVIDENCE_ADD',
      actor: 'USER',
      target: subject,
      payloadHash: null,
      createdAt: new Date(),
    });
    setSubjectId('');
    setSummary('');
    setSourceRef('');
    setMessage('Evidencia guardada como Pending Primary Validation.');
    await load();
  };

  const markVerified = async (item: EvidenceRecord) => {
    await EvidenceRepository.updateValidationState(item.id, 'VERIFIED_FACT');
    await AuditLogRepository.insert({
      id: `AUD-${Date.now()}`,
      action: 'EVIDENCE_VERIFY',
      actor: 'USER',
      target: item.subjectId,
      payloadHash: item.contentHash,
      createdAt: new Date(),
    });
    setMessage(`${item.subjectId}: marcado como Verified Fact.`);
    await load();
  };

  const remove = async (item: EvidenceRecord) => {
    await EvidenceRepository.delete(item.id);
    await AuditLogRepository.insert({
      id: `AUD-${Date.now()}`,
      action: 'EVIDENCE_DELETE',
      actor: 'USER',
      target: item.subjectId,
      payloadHash: item.contentHash,
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
          <Text style={styles.title}>Evidence Ω</Text>
          <Text style={styles.subtitle}>Registra evidencia con estado explícito. Nada entra como verificado por defecto.</Text>
          <View style={styles.form}>
            <TextInput value={subjectId} onChangeText={setSubjectId} autoCapitalize="characters" placeholder="Sujeto / ticker" placeholderTextColor="#64748b" style={styles.input} />
            <TextInput value={summary} onChangeText={setSummary} placeholder="Resumen de la evidencia" placeholderTextColor="#64748b" style={[styles.input, styles.multiline]} multiline />
            <TextInput value={sourceRef} onChangeText={setSourceRef} placeholder="Fuente / URL / filing / referencia" placeholderTextColor="#64748b" style={styles.input} />
            <View style={styles.inputRow}>
              <TextInput value={sourceType} onChangeText={setSourceType} placeholder="PRIMARY" placeholderTextColor="#64748b" style={[styles.input, styles.half]} />
              <TextInput value={epistemicClass} onChangeText={setEpistemicClass} placeholder="EVIDENCE" placeholderTextColor="#64748b" style={[styles.input, styles.half]} />
            </View>
            <Pressable onPress={() => { void add(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Guardar evidencia</Text></Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          <Text style={styles.count}>{items.length} registros</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No hay evidencias locales todavía.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.subject}>{item.subjectId}</Text><Text style={styles.state}>{item.validationState}</Text></View>
          <Text style={styles.summary}>{item.summary}</Text>
          <Text style={styles.meta}>{item.sourceType} · {item.epistemicClass}</Text>
          <Text style={styles.ref}>{item.sourceRef}</Text>
          {item.contentHash ? <Text style={styles.hash}>Hash: {item.contentHash}</Text> : null}
          <View style={styles.actions}>
            {item.validationState !== 'VERIFIED_FACT' ? <Pressable onPress={() => { void markVerified(item); }} style={styles.verify}><Text style={styles.verifyText}>Validar primaria</Text></Pressable> : null}
            <Pressable onPress={() => { void remove(item); }} style={styles.remove}><Text style={styles.removeText}>Eliminar</Text></Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' }, content: { padding: 16, gap: 10 }, header: { gap: 6, marginBottom: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#94a3b8' }, empty: { color: '#8ea2b8', textAlign: 'center', padding: 40 },
  form: { backgroundColor: '#111923', borderRadius: 14, padding: 12, gap: 8, marginTop: 8, borderWidth: 1, borderColor: '#29405b' },
  input: { backgroundColor: '#0f141b', color: '#fff', borderWidth: 1, borderColor: '#263241', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }, multiline: { minHeight: 72, textAlignVertical: 'top' },
  inputRow: { flexDirection: 'row', gap: 8 }, half: { flex: 1 }, button: { backgroundColor: '#2f81f7', borderRadius: 10, padding: 12, alignItems: 'center' }, buttonText: { color: '#fff', fontWeight: '800' }, pressed: { opacity: 0.7 }, message: { color: '#9da9b7', fontSize: 12 }, count: { color: '#71b7ff', fontWeight: '700', marginTop: 6 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#202b38' }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  subject: { color: '#71b7ff', fontWeight: '800', flex: 1 }, state: { color: '#22c55e', fontWeight: '700', fontSize: 11, maxWidth: '55%' }, summary: { color: '#fff', marginTop: 8, lineHeight: 20 },
  meta: { color: '#9da9b7', marginTop: 8, fontSize: 12 }, ref: { color: '#8ea2b8', marginTop: 4, fontSize: 12 }, hash: { color: '#64748b', marginTop: 4, fontSize: 10 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 }, verify: { borderWidth: 1, borderColor: '#245638', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }, verifyText: { color: '#4ade80', fontWeight: '700', fontSize: 12 }, remove: { borderWidth: 1, borderColor: '#51323a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }, removeText: { color: '#f87171', fontWeight: '700', fontSize: 12 },
});
