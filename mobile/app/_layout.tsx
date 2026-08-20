import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { TerminalShell } from '../core/ui/TerminalShell';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <TerminalShell>
        <Slot />
      </TerminalShell>
    </>
  );
}
