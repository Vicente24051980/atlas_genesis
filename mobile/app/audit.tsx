import { useLocalSearchParams } from 'expo-router';

import { TickerAuditTerminal } from '../components/TickerAuditTerminal';

export default function AuditScreen() {
  const params = useLocalSearchParams<{ ticker?: string }>();
  const initialTicker = typeof params.ticker === 'string' ? params.ticker.trim().toUpperCase() : '';
  return <TickerAuditTerminal initialTicker={initialTicker} mode="audit" />;
}
