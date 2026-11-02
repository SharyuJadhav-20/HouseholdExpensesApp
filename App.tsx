import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ExpensesScreen from './src/views/ExpensesScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <ExpensesScreen />
    </SafeAreaProvider>
  );
}
