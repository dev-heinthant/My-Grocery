import { DEFAULT_GROCERY_CATEGORIES } from '@/constants/categories';
import { CURRENT_SCHEMA_VERSION, MIGRATION_V1_STATEMENTS } from '@/database/schema';
import { DatabaseRunner, SQLQueryExecutor } from '@/database/types';

export async function runMigrations(db: DatabaseRunner): Promise<number> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    return currentVersion;
  }

  if (currentVersion < 1) {
    await db.withTransaction(async (tx) => {
      for (const stmt of MIGRATION_V1_STATEMENTS) {
        await tx.execAsync(stmt);
      }
      await tx.execAsync('PRAGMA user_version = 3;');
    });
    return CURRENT_SCHEMA_VERSION;
  }

  if (currentVersion < 2) {
    await db.withTransaction(async (tx) => {
      const columns = await tx.getAllAsync<{ name: string }>(
        `PRAGMA table_info(grocery_items);`
      );
      const hasPurchasedAt = columns.some((c) => c.name === 'purchased_at');
      if (!hasPurchasedAt) {
        await tx.execAsync(`ALTER TABLE grocery_items ADD COLUMN purchased_at INTEGER;`);
      }
      await tx.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_grocery_items_user_purchased_at
         ON grocery_items(user_id, is_purchased, purchased_at);`
      );
      await tx.execAsync('PRAGMA user_version = 2;');
    });
  }

  if (currentVersion < 3) {
    await db.withTransaction(async (tx) => {
      const columns = await tx.getAllAsync<{ name: string }>(
        `PRAGMA table_info(grocery_items);`
      );
      const hasCatalogKey = columns.some((c) => c.name === 'catalog_key');
      if (!hasCatalogKey) {
        await tx.execAsync(`ALTER TABLE grocery_items ADD COLUMN catalog_key TEXT;`);
      }
      await tx.execAsync('PRAGMA user_version = 3;');
    });
  }

  return CURRENT_SCHEMA_VERSION;
}

/**
 * Ensures an account has at least one default grocery list and its 10 built-in categories.
 * Strictly scoped to the given userId so accounts never share rows.
 */
export async function ensureAccountSeeded(
  executor: SQLQueryExecutor,
  userId: string,
  defaultListName = 'My Grocery List'
): Promise<string> {
  if (!userId || !userId.trim()) {
    throw new Error('Account userId is required for SQLite isolation');
  }

  const now = Date.now();

  // Seed default categories if missing for this account
  for (let i = 0; i < DEFAULT_GROCERY_CATEGORIES.length; i++) {
    const catName = DEFAULT_GROCERY_CATEGORIES[i];
    const catId = `${userId}:cat:${catName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    await executor.runAsync(
      `INSERT OR IGNORE INTO categories (id, user_id, name, is_default, created_at)
       VALUES (?, ?, ?, 1, ?)`,
      [catId, userId, catName, now + i]
    );
  }

  // Ensure at least one list exists for this account
  const existingDefault = await executor.getFirstAsync<{ id: string }>(
    `SELECT id FROM grocery_lists WHERE user_id = ? ORDER BY is_default DESC, created_at ASC LIMIT 1`,
    [userId]
  );

  if (existingDefault?.id) {
    return existingDefault.id;
  }

  const defaultListId = `${userId}:list:default`;
  await executor.runAsync(
    `INSERT OR IGNORE INTO grocery_lists (id, user_id, name, is_default, created_at, updated_at)
     VALUES (?, ?, ?, 1, ?, NULL)`,
    [defaultListId, userId, defaultListName, now]
  );

  return defaultListId;
}
