import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { runAutomaticSync } from './autoSync';

export const ATLAS_BACKGROUND_SYNC_TASK = 'atlas-omega-automatic-data-sync';

if (!TaskManager.isTaskDefined(ATLAS_BACKGROUND_SYNC_TASK)) {
  TaskManager.defineTask(ATLAS_BACKGROUND_SYNC_TASK, async () => {
    try {
      const result = await runAutomaticSync('BACKGROUND');
      return result.ok
        ? BackgroundTask.BackgroundTaskResult.Success
        : BackgroundTask.BackgroundTaskResult.Failed;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

export async function registerAtlasBackgroundSync(): Promise<boolean> {
  const available = await TaskManager.isAvailableAsync();
  if (!available) return false;

  const registered = await TaskManager.isTaskRegisteredAsync(ATLAS_BACKGROUND_SYNC_TASK);
  if (!registered) {
    await BackgroundTask.registerTaskAsync(ATLAS_BACKGROUND_SYNC_TASK, {
      minimumInterval: 60,
    });
  }
  return true;
}

export async function isAtlasBackgroundSyncRegistered(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(ATLAS_BACKGROUND_SYNC_TASK);
}
