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

export interface AppData {
  transactions: Transaction[];
  savingsPots: SavingsPot[];
  recurringBills: RecurringBill[];
  user: {
    name: string;
    currency: string; // e.g., "USD", "EUR"
  };
}
