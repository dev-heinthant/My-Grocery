export type SQLBindValue = string | number | null;

export interface SQLQueryExecutor {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params?: SQLBindValue[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync<T>(source: string, params?: SQLBindValue[]): Promise<T | null>;
  getAllAsync<T>(source: string, params?: SQLBindValue[]): Promise<T[]>;
}

export interface DatabaseRunner extends SQLQueryExecutor {
  withTransaction<T>(task: (tx: SQLQueryExecutor) => Promise<T>): Promise<T>;
}
