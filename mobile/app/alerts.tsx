import { StyleSheet, Text, View } from 'react-native';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, EmptyState, Pill, SectionHeader } from '../components/BrokerUi';
import { brokerTheme as t } from '../ui/brokerTheme';

const ALERT_TYPES = [
  ['Decision change', 'Regla definida para cambios BUY/HOLD/REVIEW; requiere un canal de entrega para convertirse en alerta activa.', 'DEFINED'],
  ['Falsifier', 'Regla crítica de escalada de una condición que puede vetar la tesis; no implica notificación push activa.', 'GATE'],
  ['Evidence coverage', 'Regla definida para cobertura insuficiente o fuente degradada; el estado no finge un servicio de notificaciones.', 'DEFINED'],
  ['Price alarm', 'Requiere endpoint de alarmas del broker; no se simula.', 'PENDING'],
] as const;

export default function AlertsScreen() {
  return (
    <AtlasBrokerShell active="more" title="Alertas">
      <Text style={styles.kicker}>CONTROL CENTER</Text>
      <Text style={styles.title}>Alertas Ω</Text>
      <Text style={styles.subtitle}>Catálogo de reglas y capacidades. Solo se marca como activa una integración realmente disponible.</Text>

      <SectionHeader title="Tipos de alerta" />
      <Card>
        {ALERT_TYPES.map(([name, text, state], index) => (
          <View key={name} style={[styles.row, index === ALERT_TYPES.length - 1 && styles.lastRow]}>
            <View style={{ flex: 1 }}><Text style={styles.name}>{name}</Text><Text style={styles.text}>{text}</Text></View>
            <Pill label={state} tone={state === 'GATE' ? 'warning' : 'neutral'} />
          </View>
        ))}
      </Card>
      <EmptyState title="Entrega de alertas pendiente" text="Esta pantalla no simula push, alarmas de precio ni notificaciones. Esas funciones solo pasarán a ACTIVE cuando exista un endpoint y canal de entrega verificables." />
    </AtlasBrokerShell>
  );
}

const styles = StyleSheet.create({
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18 },
  row: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft, paddingVertical: 11 },
  lastRow: { borderBottomWidth: 0 },
  name: { color: t.text, fontWeight: '800', fontSize: 13 },
  text: { color: t.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
});
