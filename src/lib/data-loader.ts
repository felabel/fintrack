import type { AppData, Transaction, SavingsPot, RecurringBill, Budget } from '@/data/types';
// Note: In a real app, you might fetch this. For Next.js, direct import for SSG/SSR.
// However, to ensure it's treated as a static asset that can be updated without rebuilding server code,
// we'll assume it's in `public` and fetched on the client or during server request time if needed.
// For this exercise, we'll change to a direct import for simplicity in server components.
import jsonData from '@/data/data.json';

const appData: AppData = jsonData as AppData;

export function getAppDataSync(): AppData {
  return appData;
}

export function getTransactionsSync(): Transaction[] {
  return appData.transactions;
}

export function getSavingsPotsSync(): SavingsPot[] {
  return appData.savingsPots;
}

export function getRecurringBillsSync(): RecurringBill[] {
  return appData.recurringBills;
}

export function getBudgetsSync(): Budget[] {
  return appData.budgets;
}

export function getUserCurrencySync(): string {
  return appData.user.currency;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

// Helper to get categories for select dropdowns, e.g., in budget creation
export function getTransactionCategoriesSync(): string[] {
  const categories = new Set(appData.transactions.filter(t => t.type === 'expense').map(t => t.category));
  return Array.from(categories);
}
