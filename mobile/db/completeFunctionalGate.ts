import { db } from './client';
import { runAutomationFunctionalSelfTest } from './automationSelfTest';
import {
  FunctionalGateResult,
  MOBILE_FUNCTIONAL_GATE_KEY,
  runMobileFunctionalSelfTest,
} from './runtimeSelfTest';
import { settings } from './schema';

export async function runCompleteFunctionalSelfTest(): Promise<FunctionalGateResult> {
  const [base, automation] = await Promise.all([
    runMobileFunctionalSelfTest(),
    runAutomationFunctionalSelfTest(),
  ]);

  const result: FunctionalGateResult = {
    ok: base.ok && automation.ok,
    checkedAt: new Date().toISOString(),
    checks: [...base.checks, ...automation.checks],
  };

  await db.insert(settings).values({
    key: MOBILE_FUNCTIONAL_GATE_KEY,
    valueJson: JSON.stringify(result),
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: settings.key,
    set: { valueJson: JSON.stringify(result), updatedAt: new Date() },
  });

  return result;
}
