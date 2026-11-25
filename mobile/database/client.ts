import { Platform } from 'react-native';
import type * as SQLiteTypes from 'expo-sqlite';
import { runMigrations } from '@/database/migrations';
import { DATABASE_NAME } from '@/database/schema';
import { DatabaseRunner, SQLBindValue, SQLQueryExecutor } from '@/database/types';

function loadSQLiteModule(): typeof SQLiteTypes {
  try {
    return require('expo-sqlite') as typeof SQLiteTypes;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ExpoSQLite') || msg.includes('native module')) {
      throw new Error(
        "Native module 'ExpoSQLite' was not found in this binary. Rebuild your native app with 'npx expo prebuild --clean && npx expo run:android' (or update Expo Go to match SDK 58) and restart Metro with 'npx expo start -c'."
      );
    }
    throw err;
  }
}

function wrapExecutor(
  target: Pick<
    SQLiteTypes.SQLiteDatabase,
    'execAsync' | 'runAsync' | 'getFirstAsync' | 'getAllAsync'
  >
): SQLQueryExecutor {
  return {
    execAsync: (source: string) => target.execAsync(source),
    runAsync: async (source: string, params: SQLBindValue[] = []) => {
      const result = await target.runAsync(source, params);
      return {
        changes: result.changes,
        lastInsertRowId: result.lastInsertRowId,
      };
    },
    getFirstAsync: <T,>(source: string, params: SQLBindValue[] = []) =>
      target.getFirstAsync<T>(source, params),
    getAllAsync: <T,>(source: string, params: SQLBindValue[] = []) =>
      target.getAllAsync<T>(source, params),
  };
}

export function createExpoDatabaseRunner(db: SQLiteTypes.SQLiteDatabase): DatabaseRunner {
  const base = wrapExecutor(db);
  // Serialize write transactions on this runner so concurrent async operations
  // do not collide on native exclusive transactions (SQLITE_BUSY).
  let txChain: Promise<void> = Promise.resolve();

  return {
    ...base,
    withTransaction: <T,>(task: (tx: SQLQueryExecutor) => Promise<T>): Promise<T> => {
      const run = txChain.then(async () => {
        let output!: T;
        if (Platform.OS === 'web') {
          await db.withTransactionAsync(async () => {
            await base.execAsync('PRAGMA foreign_keys = ON;');
            output = await task(base);
          });
        } else {
          // expo-sqlite opens a separate native connection for withExclusiveTransactionAsync
          // (useNewConnection: true), so per-connection PRAGMAs must be applied on txn itself.
          await db.withExclusiveTransactionAsync(async (txn) => {
            const wrappedTxn = wrapExecutor(txn);
            await wrappedTxn.execAsync('PRAGMA foreign_keys = ON;');
            try {
              await wrappedTxn.execAsync('PRAGMA busy_timeout = 5000;');
            } catch {
              // Ignore if unsupported by the underlying SQLite build
            }
            output = await task(wrappedTxn);
          });
        }
        return output;
      });

      txChain = run.then(
        () => undefined,
        () => undefined
      );

      return run;
    },
  };
}

let dbPromise: Promise<DatabaseRunner> | null = null;
let rawDbInstance: SQLiteTypes.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<DatabaseRunner> {
  if (!dbPromise) {
    dbPromise = (async () => {
      let sqliteDb: SQLiteTypes.SQLiteDatabase | null = null;
      try {
        const SQLite = loadSQLiteModule();
        sqliteDb = await SQLite.openDatabaseAsync(DATABASE_NAME);
        rawDbInstance = sqliteDb;
        try {
          await sqliteDb.execAsync('PRAGMA journal_mode = WAL;');
        } catch {
          // WAL mode may be ignored on web/in-memory VFS; safe to continue
        }
        try {
          await sqliteDb.execAsync('PRAGMA busy_timeout = 5000;');
        } catch {
          // Ignore if unsupported
        }
        const runner = createExpoDatabaseRunner(sqliteDb);
        await runMigrations(runner);
        return runner;
      } catch (err) {
        dbPromise = null;
        if (sqliteDb) {
          try {
            await sqliteDb.closeAsync();
          } catch {
            // Ignore cleanup failure
          }
        }
        rawDbInstance = null;
        throw err;
      }
    })();
  }
  return dbPromise;
}

export async function closeDatabase(): Promise<void> {
  if (rawDbInstance) {
    await rawDbInstance.closeAsync();
    rawDbInstance = null;
    dbPromise = null;
  }
}
