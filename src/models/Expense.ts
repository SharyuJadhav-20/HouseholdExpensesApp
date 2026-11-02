export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Other';

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  spent_at: string;
  note: string | null;
};

export type ExpenseDraft = {
  title: string;
  amount: number;
  category: ExpenseCategory;
  note: string | null;
  spentAt: string;
};

export type ExpensePage = 'list' | 'form' | 'insights';

export const categories: { name: ExpenseCategory; icon: string; color: string; tint: string }[] = [
  { name: 'Food', icon: '🍽️', color: '#df7049', tint: '#fff0e9' },
  { name: 'Transport', icon: '🚲', color: '#4e7c71', tint: '#eaf3ef' },
  { name: 'Shopping', icon: '🛍️', color: '#9471b1', tint: '#f2ecf7' },
  { name: 'Bills', icon: '🧾', color: '#bd8b39', tint: '#faf2df' },
  { name: 'Other', icon: '✨', color: '#6180a4', tint: '#edf2f8' },
];

export const categoryMeta = Object.fromEntries(
  categories.map((category) => [category.name, category]),
) as Record<ExpenseCategory, (typeof categories)[number]>;

export function getLocalDateString(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
