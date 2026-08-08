import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const modules = [
  { name: 'Portfolio', description: 'Posiciones, pesos y snapshots', route: '/portfolio' },
  { name: 'Watchlist', description: 'Candidatos y Screener Ω', route: '/watchlist' },
  { name: 'Radar', description: 'Señales, Wave Detection y alertas', route: '/radar' },
  { name: 'Evidence', description: 'Tesis, fuentes y falsificadores', route: '/evidence' },
  { name: 'Daily Intelligence', description: 'Cambios relevantes y revisión diaria', route: '/daily-intelligence' },
  { name: 'Gemelo Digital', description: 'Valores, incentivos, decisiones y hábitos', route: '/digital-twin' },
  { name: 'Audit', description: 'Trazabilidad, decisiones y estado del sistema', route: '/audit' },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>ATLAS Ω MOBILE</Text>
      <Text style={styles.title}>Sistema operativo de decisión</Text>
      <Text style={styles.subtitle}>Android-only · local-first · evidence-first</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>CORE-00</Text>
        <Text style={styles.statusValue}>UO 1.1 RC1 · 30/30 Runtime Certified</Text>
        <Text style={styles.statusNote}>SQLite + Drizzle inicializados · navegación activa</Text>
      </View>

      <View style={styles.grid}>
        {modules.map((module) => (
          <Pressable
            key={module.name}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${module.name}`}
            onPress={() => router.push(module.route)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{module.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
            <Text style={styles.cardText}>{module.description}</Text>
          </Pressable>
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
  cardPressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 5 },
  cardText: { color: '#9da9b7', lineHeight: 20 },
  chevron: { color: '#71b7ff', fontSize: 30, lineHeight: 30 },
});
