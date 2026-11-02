import React from 'react';
import styles from './ExpenseFormPage.styles';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories, type ExpenseCategory } from '../models/Expense';

type Props = {
  editing: boolean;
  title: string;
  onChangeTitle: (value: string) => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  category: ExpenseCategory;
  onChangeCategory: (value: ExpenseCategory) => void;
  note: string;
  onChangeNote: (value: string) => void;
  error: string;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export default function ExpenseFormPage({
  editing, title, onChangeTitle, amount, onChangeAmount, category, onChangeCategory,
  note, onChangeNote, error, saving, onCancel, onSave,
}: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8f4" />
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={{ width: 48 }} />
          <Text style={styles.headerTitle}>{editing ? 'Edit expense' : 'New expense'}</Text>
          <View style={{ width: 48 }} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.inputLabel}>What was it for?</Text>
          <TextInput value={title} onChangeText={onChangeTitle} placeholder="add where you have spent money" placeholderTextColor="#a5aaa4" style={styles.titleInput} returnKeyType="next" maxLength={60} />
          <Text style={[styles.inputLabel, styles.spaced]}>How much?</Text>
          <View style={styles.amountWrap}><Text style={styles.rupee}>₹</Text><TextInput value={amount} onChangeText={onChangeAmount} placeholder="0" placeholderTextColor="#b8bdb7" style={styles.amountInput} keyboardType="decimal-pad" /></View>
          <Text style={[styles.inputLabel, styles.spaced]}>Pick a category</Text>
          <View style={styles.categoryGrid}>{categories.map((item) => {
            const selected = category === item.name;
            return <Pressable key={item.name} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onChangeCategory(item.name)} style={[styles.categoryOption, { backgroundColor: selected ? item.tint : '#fff', borderColor: selected ? item.color : '#edf0ea' }]}><View style={[styles.categoryIcon, { backgroundColor: item.tint }]}><Text style={{ fontSize: 16 }}>{item.icon}</Text></View><Text style={[styles.categoryText, selected && { color: item.color }]}>{item.name}</Text>{selected && <Text style={[styles.checkMark, { color: item.color }]}>✓</Text>}</Pressable>;
          })}</View>
          <Text style={[styles.inputLabel, styles.spaced]}>A note <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput value={note} onChangeText={onChangeNote} placeholder="Anything you want to remember…" placeholderTextColor="#a5aaa4" style={styles.noteInput} multiline maxLength={160} />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Pressable disabled={saving} onPress={onSave} style={[styles.primaryButton, saving && styles.saving]}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{editing ? 'Update' : 'Add'}</Text>}</Pressable>
            <Pressable disabled={saving} onPress={onCancel} style={styles.cancelButton}><Text style={styles.cancelButtonText}>Cancel</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
