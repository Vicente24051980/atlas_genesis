import { StyleSheet, Text, View } from 'react-native';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, MenuRow, Pill, SectionHeader } from '../components/BrokerUi';
import { brokerTheme as t } from '../ui/brokerTheme';

export default function MoreScreen() {
  return (
    <AtlasBrokerShell active="more" title="Más">
      <View style={styles.heading}><View style={{ flex: 1 }}><Text style={styles.kicker}>ATLAS TERMINAL</Text><Text style={styles.title}>Todas las herramientas</Text><Text style={styles.subtitle}>Menú único para investigación, ejecución, alertas y estado del sistema.</Text></View><Pill label="Ω" tone="positive" /></View>

      <SectionHeader title="Mercado e investigación" />
      <Card style={styles.menuCard}>
        <MenuRow glyph="⌕" title="Mercados" subtitle="Buscar instrumentos, índices, sectores y macro." route="/markets" />
        <MenuRow glyph="A" title="Analizar empresa" subtitle="Datos fundamentales + Global CAPEX Chain Ω." route="/analyze" />
        <MenuRow glyph="E" title="Evidence Center" subtitle="Motores, gates, Economic Proof y falsificadores." route="/evidence" />
        <MenuRow glyph="◎" title="Radar Ω" subtitle="Snapshot de mercado, macro y sensores." route="/radar" />
      </Card>

      <SectionHeader title="Broker" />
      <Card style={styles.menuCard}>
        <MenuRow glyph="T" title="Trading 212 · Broker Ω" subtitle="Cuenta, posiciones, órdenes y bridge seguro." route="/broker" />
        <MenuRow glyph="↕" title="Órdenes" subtitle="Órdenes pendientes e historial de ejecución." route="/orders" />
        <MenuRow glyph="!" title="Alertas" subtitle="Centro de alarmas y guardrails de decisión." route="/alerts" />
      </Card>

      <SectionHeader title="Sistema" />
      <Card style={styles.menuCard}>
        <MenuRow glyph="⚙" title="Ajustes y estado" subtitle="Backend, proveedores, conexión y seguridad." route="/settings" />
      </Card>

      <Text style={styles.footer}>ATLAS Ω separa señal, evidencia, decisión y ejecución. La interfaz no elimina esos gates.</Text>
    </AtlasBrokerShell>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  menuCard: { paddingTop: 0, paddingBottom: 0 },
  footer: { color: t.textFaint, fontSize: 10, lineHeight: 16, paddingVertical: 6 },
});
