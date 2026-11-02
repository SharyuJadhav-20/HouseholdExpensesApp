import React from 'react';
import ExpenseFormPage from './ExpenseFormPage';
import ExpenseInsightsPage from './ExpenseInsightsPage';
import ExpenseListPage from './ExpenseListPage';
import { useExpensesViewModel } from '../viewmodels/useExpensesViewModel';

export default function ExpensesScreen() {
  const viewModel = useExpensesViewModel();

  if (viewModel.page === 'form') {
    return (
      <ExpenseFormPage
        editing={Boolean(viewModel.editingExpense)}
        title={viewModel.title}
        onChangeTitle={viewModel.setTitle}
        amount={viewModel.amount}
        onChangeAmount={viewModel.setAmount}
        category={viewModel.category}
        onChangeCategory={viewModel.setCategory}
        note={viewModel.note}
        onChangeNote={viewModel.setNote}
        error={viewModel.formError}
        saving={viewModel.saving}
        onCancel={viewModel.closeForm}
        onSave={viewModel.saveExpense}
      />
    );
  }

  if (viewModel.page === 'insights') {
    return <ExpenseInsightsPage expenses={viewModel.expenses} onBack={viewModel.closeInsights} />;
  }

  return (
    <ExpenseListPage
      expenses={viewModel.expenses}
      visibleExpenses={viewModel.visibleExpenses}
      monthTotal={viewModel.monthTotal}
      filter={viewModel.filter}
      onChangeFilter={viewModel.setFilter}
      loading={viewModel.loading}
      loadError={viewModel.loadError}
      onAdd={viewModel.startAdd}
      onEdit={viewModel.startEdit}
      onDelete={viewModel.deleteExpense}
      onOpenInsights={viewModel.openInsights}
      monthlyIncome={viewModel.monthlyIncome}
      totalSavings={viewModel.totalSavings}
      weeklySpending={viewModel.weeklySpending}
      showIncomeEditor={viewModel.showIncomeEditor}
      incomeInput={viewModel.incomeInput}
      incomeError={viewModel.incomeError}
      onIncomeInputChange={viewModel.setIncomeInput}
      onOpenIncomeEditor={viewModel.openIncomeEditor}
      onCloseIncomeEditor={() => viewModel.setShowIncomeEditor(false)}
      onSaveIncome={viewModel.saveMonthlyIncome}
    />
  );
}
