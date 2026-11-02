import SQLite, { type SQLiteDatabase } from 'react-native-sqlite-storage';
import type { Expense, ExpenseDraft } from './Expense';

SQLite.enablePromise(true);

export class ExpenseRepository {
  private constructor(private readonly database: SQLiteDatabase) {}

  static async create(): Promise<ExpenseRepository> {
    const database = await SQLite.openDatabase({ name: 'pocket-expenses.db', location: 'default' });
    await database.executeSql('PRAGMA journal_mode = WAL');
    await database.executeSql(`CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL,
      spent_at TEXT NOT NULL,
      note TEXT
    )`);
    await database.executeSql(
      'CREATE INDEX IF NOT EXISTS expenses_spent_at_idx ON expenses(spent_at DESC, id DESC)',
    );
    await database.executeSql(`CREATE TABLE IF NOT EXISTS app_settings (
      setting_key TEXT PRIMARY KEY NOT NULL,
      value REAL NOT NULL
    )`);
    return new ExpenseRepository(database);
  }

  async getAll(): Promise<Expense[]> {
    const [result] = await this.database.executeSql(
      'SELECT * FROM expenses ORDER BY spent_at DESC, id DESC',
    );
    const expenses: Expense[] = [];
    for (let index = 0; index < result.rows.length; index += 1) {
      expenses.push(result.rows.item(index) as Expense);
    }
    return expenses;
  }

  async add(expense: ExpenseDraft): Promise<void> {
    await this.database.executeSql(
      'INSERT INTO expenses (title, amount, category, spent_at, note) VALUES (?, ?, ?, ?, ?)',
      [expense.title, expense.amount, expense.category, expense.spentAt, expense.note],
    );
  }

  async update(id: number, expense: ExpenseDraft): Promise<void> {
    await this.database.executeSql(
      'UPDATE expenses SET title = ?, amount = ?, category = ?, spent_at = ?, note = ? WHERE id = ?',
      [expense.title, expense.amount, expense.category, expense.spentAt, expense.note, id],
    );
  }

  async remove(id: number): Promise<void> {
    await this.database.executeSql('DELETE FROM expenses WHERE id = ?', [id]);
  }

  async getMonthlyIncome(month: string): Promise<number | null> {
    const [result] = await this.database.executeSql(
      'SELECT value FROM app_settings WHERE setting_key = ?',
      [`monthly_income_${month}`],
    );
    if (result.rows.length) return Number(result.rows.item(0).value);
    // Keep an older single monthly income value usable when upgrading this app version.
    const [legacyResult] = await this.database.executeSql(
      'SELECT value FROM app_settings WHERE setting_key = ?',
      ['monthly_income'],
    );
    return legacyResult.rows.length ? Number(legacyResult.rows.item(0).value) : null;
  }

  async setMonthlyIncome(month: string, income: number): Promise<void> {
    await this.database.executeSql(
      'INSERT OR REPLACE INTO app_settings (setting_key, value) VALUES (?, ?)',
      [`monthly_income_${month}`, income],
    );
  }
}
