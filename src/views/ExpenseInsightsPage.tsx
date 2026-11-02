import React, { useMemo, useState } from 'react';
import styles from './ExpenseInsightsPage.styles';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories, categoryMeta, getLocalDateString, type Expense } from '../models/Expense';

type Period = 'Day' | 'Week' | 'Month';
type ChartItem = { label: string; value: number; color: string };
const money = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const localDate = (value: Date) => getLocalDateString(value);
const dateAtNoon = (value: string) => new Date(`${value}T12:00:00`);
const shiftDate = (value: string, days: number) => {
  const date = dateAtNoon(value);
  date.setDate(date.getDate() + days);
  return localDate(date);
};

export default function ExpenseInsightsPage({ expenses, onBack }: { expenses: Expense[]; onBack: () => void }) {
  const [period, setPeriod] = useState<Period>('Day');
  const today = getLocalDateString();
  const currentDate = dateAtNoon(today);
  const monthPrefix = today.slice(0, 7);
  const monday = shiftDate(today, -((currentDate.getDay() + 6) % 7));
  const sunday = shiftDate(monday, 6);

  const periodExpenses = useMemo(() => expenses.filter((expense) => {
    if (period === 'Day') return expense.spent_at === today;
    if (period === 'Week') return expense.spent_at >= monday && expense.spent_at <= sunday;
    return expense.spent_at.startsWith(monthPrefix);
  }), [expenses, monday, monthPrefix, period, sunday, today]);
  const total = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const dayCount = period === 'Day' ? 1 : period === 'Week'
    ? ((currentDate.getDay() + 6) % 7) + 1
    : currentDate.getDate();
  const dailyAverage = total / dayCount;
  const dateTitle = period === 'Day'
    ? `Today, ${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long' }).format(currentDate)}`
    : period === 'Week'
      ? `${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(dateAtNoon(monday))} – ${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(dateAtNoon(sunday))}`
      : new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(currentDate);

  const chartItems: ChartItem[] = useMemo(() => {
    if (period === 'Day') {
      return categories.map((category) => ({
        label: category.icon,
        color: category.color,
        value: periodExpenses.filter((expense) => expense.category === category.name).reduce((sum, expense) => sum + expense.amount, 0),
      }));
    }
    if (period === 'Week') {
      return Array.from({ length: 7 }, (_, index) => {
        const date = shiftDate(monday, index);
        return {
          label: new Intl.DateTimeFormat('en-IN', { weekday: 'narrow' }).format(dateAtNoon(date)),
          color: date === today ? '#1681f7' : ['#a9c9ec', '#b8d8c5', '#f0c8a9', '#d4c1e8', '#f1d992', '#b9d9df', '#d7c8b8'][index],
          value: periodExpenses.filter((expense) => expense.spent_at === date).reduce((sum, expense) => sum + expense.amount, 0),
        };
      });
    }
    const days = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, index) => {
      const date = `${monthPrefix}-${String(index + 1).padStart(2, '0')}`;
      return {
        label: index % 5 === 0 || index === days - 1 ? String(index + 1) : '',
        color: date === today ? '#1681f7' : ['#a9c9ec', '#b8d8c5', '#f0c8a9', '#d4c1e8', '#f1d992', '#b9d9df', '#d7c8b8'][index % 7],
        value: periodExpenses.filter((expense) => expense.spent_at === date).reduce((sum, expense) => sum + expense.amount, 0),
      };
    });
  }, [currentDate, monday, monthPrefix, period, periodExpenses, today]);

  const maxChartValue = Math.max(1, ...chartItems.map((item) => item.value));
  const categoriesForPeriod = categories.map((category) => {
    const items = periodExpenses.filter((expense) => expense.category === category.name);
    return { ...category, total: items.reduce((sum, expense) => sum + expense.amount, 0), count: items.length };
  }).filter((item) => item.count > 0).sort((a, b) => b.total - a.total);

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f4f8" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back to expenses" onPress={onBack} style={styles.backButton}><Text style={styles.backArrow}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>Spending details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.segment}>
          {(['Day', 'Week', 'Month'] as Period[]).map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: period === item }} onPress={() => setPeriod(item)} style={[styles.segmentItem, period === item && styles.segmentSelected]}><Text style={[styles.segmentText, period === item && styles.segmentTextSelected]}>{item}</Text></Pressable>)}
        </View>

        <Text style={styles.sectionTitle}>Expenses</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.periodTitle}>{dateTitle}</Text>
          <Text style={styles.total}>{money(total)}</Text>
          <Text style={styles.periodCaption}>{periodExpenses.length} {periodExpenses.length === 1 ? 'expense' : 'expenses'} · {money(dailyAverage)} average per day</Text>
          <Text style={styles.chartTitle}>{period === 'Day' ? 'By category' : period === 'Week' ? 'Daily spending this week' : 'Daily spending this month'}</Text>
          <View style={styles.chart}>
            <View style={[styles.gridLine, { top: 0 }]} /><View style={[styles.gridLine, { top: '50%' }]} />
            {chartItems.map((item, index) => {
              const height = item.value === 0 ? 3 : Math.max(5, (item.value / maxChartValue) * 104);
              return <View key={`${item.label}-${index}`} style={styles.barColumn}>
                <View style={[styles.bar, { height, backgroundColor: item.color }]} />
                <Text style={styles.chartLabel}>{item.label}</Text>
              </View>;
            })}
          </View>
          <View style={styles.chartFooter}><Text style={styles.axisText}>0</Text><Text style={styles.axisText}>{money(maxChartValue)}</Text></View>
        </View>

        <View style={styles.listHeader}><Text style={styles.sectionTitle}>Categories</Text><Text style={styles.muted}>{categoriesForPeriod.length} categories</Text></View>
        <View style={styles.categoryCard}>
          {categoriesForPeriod.length ? categoriesForPeriod.map((item, index) => (
            <View key={item.name} style={[styles.categoryRow, index === categoriesForPeriod.length - 1 && styles.lastRow]}>
              <View style={[styles.categoryIcon, { backgroundColor: item.tint }]}><Text style={{ fontSize: 18 }}>{item.icon}</Text></View>
              <View style={styles.categoryInfo}><View style={styles.categoryTop}><Text style={styles.categoryName}>{item.name}</Text><Text style={styles.categoryAmount}>{money(item.total)}</Text></View><View style={styles.progressTrack}><View style={[styles.progress, { width: `${total ? Math.max(3, (item.total / total) * 100) : 0}%` as `${number}%`, backgroundColor: item.color }]} /></View><Text style={styles.categoryCount}>{item.count} {item.count === 1 ? 'expense' : 'expenses'}</Text></View>
            </View>
          )) : <Text style={styles.noData}>No expenses in this period yet.</Text>}
        </View>

        <View style={styles.listHeader}><Text style={styles.sectionTitle}>Transactions</Text><Text style={styles.muted}>{periodExpenses.length} total</Text></View>
        <View style={styles.transactionCard}>
          {periodExpenses.length ? periodExpenses.map((expense, index) => {
            const category = categoryMeta[expense.category];
            const date = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(dateAtNoon(expense.spent_at));
            return <View key={expense.id} style={[styles.transactionRow, index === periodExpenses.length - 1 && styles.lastRow]}>
              <View style={[styles.categoryIcon, { backgroundColor: category.tint }]}><Text style={{ fontSize: 18 }}>{category.icon}</Text></View>
              <View style={styles.transactionInfo}><Text style={styles.categoryName} numberOfLines={1}>{expense.title}</Text><Text style={styles.transactionMeta}>{category.name} · {date}</Text></View>
              <Text style={styles.categoryAmount}>−{money(expense.amount)}</Text>
            </View>;
          }) : <Text style={styles.noData}>Add an expense to see it here.</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
