import { ScrollView, StyleSheet, Text, View } from 'react-native';

const modules = [
  ['Portfolio', 'Posiciones, pesos y snapshots'],
  ['Watchlist', 'Candidatos y Screener Ω'],
  ['Radar', 'Señales, Wave Detection y alertas'],
  ['Evidence', 'Tesis, fuentes y falsificadores'],
  ['Daily Intelligence', 'Cambios relevantes y revisión diaria'],
  ['Gemelo Digital', 'Valores, incentivos, decisiones y hábitos'],
  ['Audit', 'Trazabilidad, decisiones y estado del sistema'],
];

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>ATLAS Ω MOBILE</Text>
      <Text style={styles.title}>Sistema operativo de decisión</Text>
      <Text style={styles.subtitle}>Android-only · local-first · evidence-first</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>CORE-00</Text>
        <Text style={styles.statusValue}>UO 1.1 RC1 · 30/30 Spec Frozen</Text>
        <Text style={styles.statusNote}>Runtime initialization pending</Text>
      </View>

      <View style={styles.grid}>
        {modules.map(([name, description]) => (
          <View key={name} style={styles.card}>
            <Text style={styles.cardTitle}>{name}</Text>
            <Text style={styles.cardText}>{description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, backgroundColor: '#0b0f14' },
  eyebrow: { color: '#8ea2b8', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#9da9b7', fontSize: 15 },
  statusCard: { borderWidth: 1, borderColor: '#29405b', backgroundColor: '#111923', borderRadius: 18, padding: 18, gap: 5 },
  statusTitle: { color: '#71b7ff', fontWeight: '800', fontSize: 13 },
  statusValue: { color: '#fff', fontSize: 17, fontWeight: '700' },
  statusNote: { color: '#9da9b7', fontSize: 13 },
  grid: { gap: 12 },
  card: { backgroundColor: '#141a22', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#202b38' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 5 },
  cardText: { color: '#9da9b7', lineHeight: 20 },
});
