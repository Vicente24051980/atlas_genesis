import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import AtlasBrokerShell from '../components/AtlasBrokerShell';
import { Card, Pill, SectionHeader } from '../components/BrokerUi';
import { AtlasOnlineApi, type EnginesPayload } from '../core/api/atlasOnlineUiCompat';
import { brokerTheme as t } from '../ui/brokerTheme';

const CANON = [
  { name: 'Economic Proof Ω', state: 'GATE', text: 'Demand → Capture → Conversion → FCF → ROIC. Evidencia económica antes de narrativa.' },
  { name: 'Valuation / Implied Return Ω', state: 'GATE', text: 'Valoración y retorno esperado permanecen ortogonales a Economic Proof.' },
  { name: 'Falsifiers Ω', state: 'VETO', text: 'Veto independiente por disrupción, gobernanza, regulación, deterioro financiero o pérdida de moat.' },
  { name: 'Global CAPEX Chain Ω', state: 'ACTIVE', text: 'EDD, posición en la cadena, convergencia, bottleneck persistence y fragilidad CAPEX.' },
  { name: 'AI Routing Tollbooth Ω', state: 'RESEARCH', text: 'Nuevo radar: routing, switching, take-rate, volumen dirigido y captura económica de la capa de orquestación.' },
];

export default function EvidenceScreen() {
  const [engines, setEngines] = useState<EnginesPayload | null>(null);
  useEffect(() => { void AtlasOnlineApi.atlasEngines().then(setEngines).catch(() => undefined); }, []);

  return (
    <AtlasBrokerShell active="more" title="Evidence Center">
      <Text style={styles.kicker}>EVIDENCE ARCHITECTURE</Text>
      <Text style={styles.title}>Decisión antes que interfaz</Text>
      <Text style={styles.subtitle}>La estética de bróker no modifica la constitución de ATLAS: FACT / HYPOTHESIS / INTERPRETATION / NOISE y gates separados.</Text>

      <SectionHeader title="Arquitectura canónica" />
      <Card>
        {CANON.map((item, index) => (
          <View key={item.name} style={[styles.row, index === CANON.length - 1 && styles.lastRow]}>
            <View style={{ flex: 1 }}><Text style={styles.name}>{item.name}</Text><Text style={styles.text}>{item.text}</Text></View>
            <Pill label={item.state} tone={item.state === 'VETO' ? 'negative' : item.state === 'RESEARCH' ? 'info' : item.state === 'GATE' ? 'warning' : 'positive'} />
          </View>
        ))}
      </Card>

      <SectionHeader title="Sensores expuestos por backend" />
      <Card>
        {!engines ? <ActivityIndicator color={t.accent} /> : engines.items.map((engine, index) => (
          <View key={engine.id} style={[styles.row, index === engines.items.length - 1 && styles.lastRow]}>
            <View style={{ flex: 1 }}><Text style={styles.name}>{engine.name}</Text><Text style={styles.text}>{engine.description}</Text></View>
            <Pill label={engine.state} tone={engine.state === 'LIVE' ? 'positive' : 'warning'} />
          </View>
        ))}
      </Card>

      <Card><Text style={styles.flowTitle}>PIPELINE</Text><Text style={styles.flow}>Objective → Context → Specialists → Evidence → Adversarial Debate → Contradictions → Decision → Execution → Measurement → Learning</Text></Card>
    </AtlasBrokerShell>
  );
}

const styles = StyleSheet.create({
  kicker: { color: t.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: t.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: t.textMuted, fontSize: 12, lineHeight: 18 },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.borderSoft, paddingVertical: 11 },
  lastRow: { borderBottomWidth: 0 },
  name: { color: t.text, fontWeight: '800', fontSize: 13 },
  text: { color: t.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  flowTitle: { color: t.info, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  flow: { color: t.text, fontSize: 12, lineHeight: 19, marginTop: 7 },
});
