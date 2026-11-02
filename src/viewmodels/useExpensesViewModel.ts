import { useCallback, useEffect, useMemo, useState } from 'react';
import { categories, getLocalDateString, type Expense, type ExpenseCategory, type ExpensePage } from '../models/Expense';
import { ExpenseRepository } from '../models/ExpenseRepository';

export function useExpensesViewModel() {
  const [repository, setRepository] = useState<ExpenseRepository | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | ExpenseCategory>('All');
  const [page, setPage] = useState<ExpensePage>('list');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [monthlyIncome, setMonthlyIncomeValue] = useState<number | null>(null);
  const [showIncomeEditor, setShowIncomeEditor] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [incomeError, setIncomeError] = useState('');
  const currentMonth = getLocalDateString().slice(0, 7);

  const refreshExpenses = useCallback(async (source: ExpenseRepository) => {
    setExpenses(await source.getAll());
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const source = await ExpenseRepository.create();
        const [savedExpenses, savedIncome] = await Promise.all([source.getAll(), source.getMonthlyIncome(currentMonth)]);
        if (!active) return;
        setRepository(source);
        setExpenses(savedExpenses);
        setMonthlyIncomeValue(savedIncome);
      } catch {
        if (active) setLoadError('Could not open your local expense database.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void initialize();
    return () => { active = false; };
  }, [currentMonth]);

  const monthTotal = useMemo(
    () => expenses
      .filter((expense) => expense.spent_at.startsWith(currentMonth))
      .reduce((sum, expense) => sum + expense.amount, 0),
    [currentMonth, expenses],
  );
  const visibleExpenses = filter === 'All'
    ? expenses
    : expenses.filter((expense) => expense.category === filter);
  const weeklySpending = useMemo(() => {
    const today = new Date();
    const offset = (today.getDay() + 6) % 7;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset, 12);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index, 12);
      const day = getLocalDateString(date);
      return {
        day,
        label: new Intl.DateTimeFormat('en-IN', { weekday: 'narrow' }).format(date),
        amount: expenses.filter((expense) => expense.spent_at === day).reduce((sum, expense) => sum + expense.amount, 0),
        isToday: day === getLocalDateString(),
      };
    });
  }, [expenses]);

  const saveExpense = async () => {
    const parsedAmount = Number(amount.replace(/,/g, ''));
    if (!title.trim()) { setFormError('Add a name for this expense.'); return; }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Enter an amount greater than zero.');
      return;
    }
    if (!repository) { setFormError('Your local database is still starting. Please try again.'); return; }

    setSaving(true);
    try {
      const draft = {
        title: title.trim(),
        amount: parsedAmount,
        category,
        note: note.trim() || null,
        spentAt: editingExpense?.spent_at ?? getLocalDateString(),
      };
      if (editingExpense) await repository.update(editingExpense.id, draft);
      else await repository.add(draft);
      await refreshExpenses(repository);
      setTitle('');
      setAmount('');
      setCategory('Food');
      setNote('');
      setFormError('');
      setEditingExpense(null);
      setPage('list');
    } catch {
      setFormError('Could not save this expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (expense: Expense) => {
    if (!repository) throw new Error('Your local database is not available.');
    await repository.remove(expense.id);
    await refreshExpenses(repository);
  };

  const closeForm = () => {
    setEditingExpense(null);
    setPage('list');
    setFormError('');
  };

  const startAdd = () => {
    setEditingExpense(null);
    setTitle('');
    setAmount('');
    setCategory('Food');
    setNote('');
    setFormError('');
    setPage('form');
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setTitle(expense.title);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setNote(expense.note ?? '');
    setFormError('');
    setPage('form');
  };

  const openInsights = () => setPage('insights');
  const closeInsights = () => setPage('list');

  const openIncomeEditor = () => {
    setIncomeInput(monthlyIncome === null ? '' : String(monthlyIncome));
    setIncomeError('');
    setShowIncomeEditor(true);
  };

  const saveMonthlyIncome = async () => {
    const parsedIncome = Number(incomeInput.replace(/,/g, ''));
    if (!incomeInput.trim() || !Number.isFinite(parsedIncome) || parsedIncome < 0) {
      setIncomeError('Enter a valid income amount.');
      return;
    }
    if (!repository) {
      setIncomeError('Your local database is still starting. Please try again.');
      return;
    }
    try {
      await repository.setMonthlyIncome(currentMonth, parsedIncome);
      setMonthlyIncomeValue(parsedIncome);
      setShowIncomeEditor(false);
      setIncomeError('');
    } catch {
      setIncomeError('Could not save your income. Please try again.');
    }
  };

  return {
    expenses,
    visibleExpenses,
    monthTotal,
    monthlyIncome,
    totalSavings: monthlyIncome === null ? null : monthlyIncome - monthTotal,
    weeklySpending,
    showIncomeEditor,
    setShowIncomeEditor,
    incomeInput,
    setIncomeInput,
    incomeError,
    openIncomeEditor,
    saveMonthlyIncome,
    categories,
    filter,
    setFilter,
    page,
    editingExpense,
    closeForm,
    startAdd,
    startEdit,
    openInsights,
    closeInsights,
    loading,
    loadError,
    saving,
    title,
    setTitle,
    amount,
    setAmount,
    category,
    setCategory,
    note,
    setNote,
    formError,
    saveExpense,
    deleteExpense,
  };
}
