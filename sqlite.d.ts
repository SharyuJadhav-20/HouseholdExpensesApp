declare module 'react-native-sqlite-storage' {
  export interface SQLiteResult {
    rows: {
      length: number;
      item(index: number): Record<string, unknown>;
    };
  }

  export interface SQLiteDatabase {
    executeSql(
      sql: string,
      params?: Array<string | number | null>,
    ): Promise<[SQLiteResult, ...SQLiteResult[]]>;
  }

  const SQLite: {
    enablePromise(enabled: boolean): void;
    openDatabase(options: { name: string; location?: string }): Promise<SQLiteDatabase>;
  };

  export default SQLite;
}
