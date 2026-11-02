# Little Ledger

A bare React Native Community CLI app written in TypeScript. Expenses are saved in a local SQLite database on the device and are available again when the app is reopened.

## Run the app

Install JavaScript packages:

```sh
npm install
```

For iOS, install CocoaPods once and then install the native pods:

```sh
cd ios
bundle install
bundle exec pod install
cd ..
```

Start Metro and launch a platform:

```sh
npm start
npm run ios
# or
npm run android
```

You need Xcode for iOS builds and Android Studio with an emulator or device for Android builds.

## What is included

- Add an expense with a name, amount, category, and optional note.
- Open a separate list page and add/edit expense page; edit an existing row from its Edit action.
- Open spending insights from the chart shortcut to review day, week, and month totals, charts, categories, and transactions.
- Set the current month's credited amount locally to calculate the balance as credited minus this month's expenses.
- The home summary includes compact month spending, a Monday–Sunday mini chart, and the calculated savings total.
- Browse saved expenses and filter by category.
- See a running total for the current month.
- Store everything in `pocket-expenses.db` with SQLite; no account or network connection is used.

## MVVM layout

- `src/models/Expense.ts` defines expense and category data.
- `src/models/ExpenseRepository.ts` owns SQLite setup and data operations.
- `src/viewmodels/useExpensesViewModel.ts` manages screen state, validation, filtering, totals, and save actions.
- `src/views/ExpensesScreen.tsx` switches between the list page and form page.
- `src/views/ExpenseListPage.tsx` and `src/views/ExpenseFormPage.tsx` render those pages and bind controls to the viewmodel.
- `src/views/ExpenseInsightsPage.tsx` shows period totals, charts, category summaries, and transactions.
- `App.tsx` is the React Native entry component that displays the screen.
