import { useEffect, useState } from 'react';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../drizzle/migrations';
import { db } from './client';

export function useDatabaseInitialization() {
  const { success, error } = useMigrations(db, migrations);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (success) {
      setIsReady(true);
    }
  }, [success]);

  return { isReady, error };
}
