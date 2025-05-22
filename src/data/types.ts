export interface Transaction {
  id: string;
  date: string; // ISO 8601 format
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface SavingsPot {
  id: string;
  name: string;
  goal: number;
  currentAmount: number;
  targetDate?: string; // ISO 8601 format
  icon?: string; // Lucide icon name
}

export interface RecurringBill {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDateDescription: string; // e.g., "Monthly on 5th", "Yearly on Jan 15th"
  nextDueDate: string; // ISO 8601 format for the upcoming payment
  status: 'paid' | 'due' | 'overdue';
}

export interface Budget {
  id: string;
  name: string;
  category: string; // Can be a specific category or "Overall"
  amount: number; // Total budgeted amount for the period
  spentAmount: number; // Amount spent against this budget in the period
  period: 'monthly' | 'yearly' | 'weekly' | 'custom';
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  icon?: string; // Lucide icon name
}

export interface AppData {
  transactions: Transaction[];
  savingsPots: SavingsPot[];
  recurringBills: RecurringBill[];
  budgets: Budget[];
  user: {
    name: string;
    currency: string; // e.g., "USD", "EUR"
  };
}
