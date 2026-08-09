import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { eq } from 'drizzle-orm';

import { db } from '../db/client';
import { decisionLog, evidence, radar, settings } from '../db/schema';
import { AuditLogRepository } from '../db/repositories/AuditLogRepository';
import { createEventId } from '../core/createEventId';

const TWIN_KEY = 'digital_twin_profile';

type TwinProfile = {
  values: string;
  incentives: string;
  habits: string;
  notes: string;
};

const EMPTY_PROFILE: TwinProfile = { values: '', incentives: '', habits: '', notes: '' };

export default function DigitalTwinScreen() {
  const [counts, setCounts] = useState({ evidence: 0, decisions: 0, signals: 0 });
  const [profile, setProfile] = useState<TwinProfile>(EMPTY_PROFILE);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [evidenceRows, decisionRows, radarRows, settingRows] = await Promise.all([
      db.select().from(evidence),
      db.select().from(decisionLog),
      db.select().from(radar),
      db.select().from(settings).where(eq(settings.key, TWIN_KEY)).limit(1),
    ]);
    setCounts({ evidence: evidenceRows.length, decisions: decisionRows.length, signals: radarRows.length });
    const raw = settingRows[0]?.valueJson;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<TwinProfile>;
        setProfile({
          values: parsed.values ?? '',
          incentives: parsed.incentives ?? '',
          habits: parsed.habits ?? '',
          notes: parsed.notes ?? '',
        });
      } catch {
        setProfile(EMPTY_PROFILE);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const save = async () => {
    const now = new Date();
    await db.insert(settings).values({ key: TWIN_KEY, valueJson: JSON.stringify(profile), updatedAt: now }).onConflictDoUpdate({
      target: settings.key,
      set: { valueJson: JSON.stringify(profile), updatedAt: now },
    });
    await AuditLogRepository.insert({
      id: createEventId('AUD'),
      action: 'DIGITAL_TWIN_UPDATE',
      actor: 'USER',
      target: TWIN_KEY,
      payloadHash: null,
      createdAt: now,
    });
    setMessage('Gemelo Digital guardado en el dispositivo.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Gemelo Digital</Text>
      <Text style={styles.subtitle}>Estado decisional local. Edita únicamente lo que quieras declarar explícitamente; ATLAS no infiere hechos desde ausencia de datos.</Text>

      <View style={styles.grid}>
        <Metric label="Evidencias" value={counts.evidence} />
        <Metric label="Decisiones" value={counts.decisions} />
        <Metric label="Señales" value={counts.signals} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Matriz causal Ω</Text>
        <Text style={styles.label}>Valores demostrados / declarados</Text>
        <TextInput value={profile.values} onChangeText={(values) => setProfile((current) => ({ ...current, values }))} multiline placeholder="Qué valores quieres registrar y con qué evidencia..." placeholderTextColor="#64748b" style={styles.input} />
        <Text style={styles.label}>Incentivos</Text>
        <TextInput value={profile.incentives} onChangeText={(incentives) => setProfile((current) => ({ ...current, incentives }))} multiline placeholder="Qué comportamientos recompensa realmente el sistema..." placeholderTextColor="#64748b" style={styles.input} />
        <Text style={styles.label}>Hábitos / patrones</Text>
        <TextInput value={profile.habits} onChangeText={(habits) => setProfile((current) => ({ ...current, habits }))} multiline placeholder="Patrones observados y repetidos..." placeholderTextColor="#64748b" style={styles.input} />
        <Text style={styles.label}>Notas</Text>
        <TextInput value={profile.notes} onChangeText={(notes) => setProfile((current) => ({ ...current, notes }))} multiline placeholder="Notas adicionales..." placeholderTextColor="#64748b" style={styles.input} />
        <Pressable onPress={() => { void save(); }} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Guardar Gemelo Digital</Text></Pressable>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Regla epistémica</Text>
        <Text style={styles.body}>Observed conduct → incentive structure → motivation hypothesis → additional evidence required. Una interpretación guardada no se convierte automáticamente en verdad ni en evidencia canónica.</Text>
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' }, content: { padding: 16, gap: 14 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#94a3b8', lineHeight: 20 },
  grid: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, backgroundColor: '#141a22', borderRadius: 12, padding: 12 },
  metricValue: { color: '#71b7ff', fontWeight: '800', fontSize: 22 }, metricLabel: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  card: { backgroundColor: '#141a22', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#202b38', gap: 8 }, cardTitle: { color: '#fff', fontSize: 17, fontWeight: '800' }, body: { color: '#9da9b7', lineHeight: 21 },
  label: { color: '#cbd5e1', fontWeight: '700', fontSize: 12, marginTop: 4 }, input: { minHeight: 70, backgroundColor: '#0f141b', color: '#fff', borderWidth: 1, borderColor: '#263241', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, textAlignVertical: 'top' },
  button: { backgroundColor: '#2f81f7', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 4 }, buttonText: { color: '#fff', fontWeight: '800' }, pressed: { opacity: 0.7 }, message: { color: '#9da9b7', fontSize: 12 },
});
