import React, { useRef } from 'react';
import styles from './ExpenseListPage.styles';
import {
  Alert,
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories, categoryMeta, getLocalDateString, type Expense, type ExpenseCategory } from '../models/Expense';

type Props = {
  expenses: Expense[];
  visibleExpenses: Expense[];
  monthTotal: number;
  filter: 'All' | ExpenseCategory;
  onChangeFilter: (filter: 'All' | ExpenseCategory) => void;
  loading: boolean;
  loadError: string;
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => Promise<void>;
  onOpenInsights: () => void;
  monthlyIncome: number | null;
  totalSavings: number | null;
  weeklySpending: { day: string; label: string; amount: number; isToday: boolean }[];
  showIncomeEditor: boolean;
  incomeInput: string;
  incomeError: string;
  onIncomeInputChange: (value: string) => void;
  onOpenIncomeEditor: () => void;
  onCloseIncomeEditor: () => void;
  onSaveIncome: () => void;
};

const money = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function ExpenseListPage({
  expenses, visibleExpenses, monthTotal, filter, onChangeFilter, loading, loadError, onAdd, onEdit, onDelete, onOpenInsights,
  monthlyIncome, totalSavings, weeklySpending, showIncomeEditor, incomeInput, incomeError,
  onIncomeInputChange, onOpenIncomeEditor, onCloseIncomeEditor, onSaveIncome,
}: Props) {
  const dateHeading = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date());
  const currentMonth = getLocalDateString().slice(0, 7);
  const monthCategories = categories.map((category) => ({
    ...category,
    amount: expenses.filter((expense) => expense.spent_at.startsWith(currentMonth) && expense.category === category.name).reduce((sum, expense) => sum + expense.amount, 0),
  })).filter((category) => category.amount > 0).sort((a, b) => b.amount - a.amount);
  const weeklyTotal = weeklySpending.reduce((sum, day) => sum + day.amount, 0);
  const maxWeeklyAmount = Math.max(1, ...weeklySpending.map((day) => day.amount));
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8f4" />
      <View style={styles.page}>
        <View style={styles.topbar}>
          <View style={styles.brandMark}><Text style={styles.brandGlyph}>↗</Text></View>
          <View style={styles.brandCopy}><Text style={styles.brand}>My Expenses</Text></View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.eyebrow}>MY SPENDING · {dateHeading.toUpperCase()}</Text>
          <View style={styles.summaryCards}>
            <View style={styles.monthCard}>
              <Text style={styles.smallCardLabel}>Spent this month</Text>
              <Text style={styles.smallCardAmount}>{money(monthTotal)}</Text>
              <View style={styles.monthCategoryList}>
                {monthCategories.length ? monthCategories.map((item) => <View key={item.name} style={styles.monthCategoryRow}>
                  <Text style={styles.monthCategoryIcon}>{item.icon}</Text><Text style={styles.monthCategoryName}>{item.name}</Text><Text style={styles.monthCategoryAmount}>{money(item.amount)}</Text>
                </View>) : <Text style={styles.monthEmpty}>No category spending yet</Text>}
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="View weekly spending insights" onPress={onOpenInsights} style={styles.weeklyCard}>
              <View style={styles.weeklyHeader}><Text style={styles.weeklyTitle}>This week</Text><Text style={styles.weeklyTotal}>{money(weeklyTotal)}</Text></View>
              <View style={styles.weeklyGraph}>{weeklySpending.map((day, index) => <View key={`${day.day}-${index}`} style={styles.weekColumn}>
                <View style={styles.weekBarTrack}><View style={[styles.weekBar, { height: day.amount ? Math.max(5, (day.amount / maxWeeklyAmount) * 39) : 3, backgroundColor: day.isToday ? '#1681f7' : ['#27b49a', '#ff9a62', '#9868e8', '#f3b63f', '#3fa6df', '#ed7195', '#62b66a'][index] }]} /></View>
                <Text style={[styles.weekLabel, day.isToday && styles.weekLabelToday]}>{day.label}</Text>
              </View>)}</View>
            </Pressable>
          </View>
          <Pressable onPress={onOpenIncomeEditor} style={styles.cashFlowCard}>
            <View style={styles.cashFlowHeader}><View style={styles.cashFlowTitleRow}><Text style={styles.cashFlowTitle}>Monthly cash flow</Text></View><View style={styles.editIncomePill}><Text style={styles.cashFlowEdit}>✎  Edit income</Text></View></View>
            <View style={styles.cashFlowMetrics}>
              <View style={[styles.cashFlowMetric, styles.creditedTile]}><Text style={styles.cashFlowLabel}>Credited</Text><Text style={styles.creditedAmount}>{monthlyIncome === null ? '—' : money(monthlyIncome)}</Text></View>
              <View style={[styles.cashFlowMetric, styles.spentTile]}><Text style={styles.cashFlowLabel}>Spent</Text><Text style={styles.spentAmount}>{money(monthTotal)}</Text></View>
              <View style={[styles.cashFlowMetric, styles.balanceTile]}><Text style={styles.cashFlowLabel}>Balance</Text><Text style={styles.balanceAmount}>{totalSavings === null ? '—' : money(totalSavings)}</Text></View>
            </View>
          </Pressable>
          <View style={styles.sectionHeader}>
            <View><Text style={styles.sectionTitle}>My expenses</Text></View>
            <Pressable style={styles.addButton} onPress={onAdd}><Text style={styles.plus}>＋</Text><Text style={styles.addLabel}>Add</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {(['All', ...Object.keys(categoryMeta)] as ('All' | ExpenseCategory)[]).map((item) => {
              const active = item === filter;
              return <Pressable key={item} onPress={() => onChangeFilter(item)} style={[styles.filterChip, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{item === 'All' ? 'All' : `${categoryMeta[item].icon}  ${item}`}</Text></Pressable>;
            })}
          </ScrollView>
          {loading ? <View style={styles.centerState}><ActivityIndicator color="#49675b" /></View> : loadError ? (
            <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Your expenses could not load</Text><Text style={styles.emptyCopy}>{loadError}</Text></View>
          ) : visibleExpenses.length ? (
            <FlatList data={visibleExpenses} scrollEnabled={false} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.expenseList} renderItem={({ item, index }) => <ExpenseRow expense={item} last={index === visibleExpenses.length - 1} onEdit={onEdit} onDelete={onDelete} />} />
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}><Text style={{ fontSize: 24 }}>{filter === 'All' ? '🌱' : categoryMeta[filter].icon}</Text></View>
              <Text style={styles.emptyTitle}>{filter === 'All' ? 'Nothing to see just yet' : `No ${filter.toLowerCase()} expenses`}</Text>
              <Text style={styles.emptyCopy}>{filter === 'All' ? 'Add your first expense and keep track of where your money goes.' : 'Try another category or add a new expense.'}</Text>
              {filter === 'All' && <Pressable onPress={onAdd}><Text style={styles.emptyAction}>Add your first expense <Text>→</Text></Text></Pressable>}
            </View>
          )}
        </ScrollView>
      </View>
      <Modal visible={showIncomeEditor} transparent animationType="fade" onRequestClose={onCloseIncomeEditor}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.incomeModal}>
            <Text style={styles.incomeModalTitle}>Monthly credited amount</Text>
            <Text style={styles.incomeModalCopy}>Enter the total credited this month. Balance is credited minus spent.</Text>
            <View style={styles.incomeInputWrap}><Text style={styles.incomeRupee}>₹</Text><TextInput autoFocus value={incomeInput} onChangeText={onIncomeInputChange} placeholder="0" placeholderTextColor="#a5aaa4" keyboardType="decimal-pad" style={styles.incomeInput} /></View>
            {!!incomeError && <Text style={styles.incomeError}>{incomeError}</Text>}
            <View style={styles.incomeActions}><Pressable onPress={onCloseIncomeEditor} style={styles.incomeCancel}><Text style={styles.incomeCancelText}>Cancel</Text></Pressable><Pressable onPress={onSaveIncome} style={styles.incomeSave}><Text style={styles.incomeSaveText}>Save income</Text></Pressable></View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const ACTION_WIDTH = 164;

function ExpenseRow({ expense, last, onEdit, onDelete }: { expense: Expense; last: boolean; onEdit: (expense: Expense) => void; onDelete: (expense: Expense) => Promise<void> }) {
  const meta = categoryMeta[expense.category];
  const date = new Date(`${expense.spent_at}T12:00:00`);
  const dateLabel = expense.spent_at === getLocalDateString() ? 'Today' : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
  const translateX = useRef(new Animated.Value(0)).current;
  const opened = useRef(false);
  const animateSwipe = (open: boolean) => {
    opened.current = open;
    Animated.spring(translateX, { toValue: open ? -ACTION_WIDTH : 0, useNativeDriver: true, bounciness: 0, speed: 24 }).start();
  };
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: () => translateX.stopAnimation(),
    onPanResponderMove: (_, gesture) => {
      const offset = opened.current ? -ACTION_WIDTH : 0;
      translateX.setValue(Math.max(-ACTION_WIDTH, Math.min(0, offset + gesture.dx)));
    },
    onPanResponderRelease: (_, gesture) => {
      const offset = opened.current ? -ACTION_WIDTH : 0;
      animateSwipe(offset + gesture.dx < -ACTION_WIDTH / 2);
    },
    onPanResponderTerminate: () => animateSwipe(opened.current),
  })).current;
  const confirmDelete = () => Alert.alert('Delete expense?', `“${expense.title}” will be removed from this device.`, [
    { text: 'Cancel', style: 'cancel', onPress: () => animateSwipe(false) },
    { text: 'Delete', style: 'destructive', onPress: () => { void onDelete(expense).catch(() => Alert.alert('Could not delete expense', 'Please try again.')); } },
  ]);
  return (
    <View style={styles.swipeContainer}>
      <View style={styles.swipeActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${expense.title}`} onPress={() => { animateSwipe(false); onEdit(expense); }} style={[styles.swipeAction, styles.swipeEdit]}><View style={styles.swipeActionIconBadge}><Text style={styles.swipeActionIcon}>✏️</Text></View><Text style={styles.swipeActionText}>Edit</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${expense.title}`} onPress={confirmDelete} style={[styles.swipeAction, styles.swipeDelete]}><View style={styles.swipeActionIconBadge}><Text style={styles.swipeActionIcon}>🗑️</Text></View><Text style={styles.swipeActionText}>Delete</Text></Pressable>
      </View>
      <Animated.View style={[styles.expenseRow, last && styles.expenseRowLast, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <View style={[styles.expenseIcon, { backgroundColor: meta.tint }]}><Text style={{ fontSize: 20 }}>{meta.icon}</Text></View>
        <View style={styles.expenseDetails}><Text style={styles.expenseName} numberOfLines={1}>{expense.title}</Text><Text style={styles.expenseMeta}>{meta.name} <Text style={styles.dot}>·</Text> {dateLabel}</Text></View>
        <View style={styles.amountColumn}><Text style={styles.expenseAmount}>−{money(expense.amount)}</Text></View>
      </Animated.View>
    </View>
  );
}
