
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAppDataSync, formatCurrency, formatDate } from "@/lib/data-loader";
import type { Transaction, SavingsPot, Budget, RecurringBill, AppData } from "@/data/types";
import { DollarSign, ChevronRight, TrendingUp, TrendingDown, ReceiptText, Palette, ShoppingBag, Heart, Car, Briefcase, Home as HomeIcon } from 'lucide-react';
import { BudgetDonutChart } from '@/components/layout/BudgetDonutChart';
import { BudgetCategoryDonutChart } from '@/components/layout/BudgetCategoryDonutChart';


// Helper to get a color for index, cycling through chart colors
const getSafeChartColor = (index: number) => {
  const chartColors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
  return `hsl(var(${chartColors[index % chartColors.length]}))`;
};

// Helper for transaction icons (simplified)
const getTransactionIcon = (category: string, description: string) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('emma') || lowerDesc.includes('daniel') || lowerDesc.includes('sun park')) {
        return <Image src={`https://placehold.co/40x40.png`} alt={description} width={40} height={40} className="rounded-full" data-ai-hint="person" />;
    }
    switch (category) {
        case 'Food': return <ShoppingBag className="h-5 w-5 text-muted-foreground" />;
        case 'Utilities': return <HomeIcon className="h-5 w-5 text-muted-foreground" />;
        case 'Transport': return <Car className="h-5 w-5 text-muted-foreground" />;
        case 'Income': return <DollarSign className="h-5 w-5 text-muted-foreground" />;
        default: return <ReceiptText className="h-5 w-5 text-muted-foreground" />;
    }
};


export default function DashboardPage() {
  const [appData, setAppData] = useState<AppData | null>(null);

  useEffect(() => {
    setAppData(getAppDataSync());
  }, []);

  if (!appData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { transactions, savingsPots, budgets, recurringBills, user } = appData;
  const currency = user.currency;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 5);

  const totalSavedInPots = savingsPots.reduce((sum, pot) => sum + pot.currentAmount, 0);

  const overallBudget = budgets.find(b => b.category === "Overall") || budgets[0] || 
    { name: "Overall Spending", amount: 2000, spentAmount: 0, category: "Overall" } as Budget;
  
  const budgetItemsForDisplay = budgets.filter(b => b.category !== "Overall").slice(0, 4);

  const paidBillsAmount = recurringBills
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);
  const upcomingBillsAmount = recurringBills
    .filter(b => b.status === 'due' || b.status === 'overdue')
    .reduce((sum, b) => sum + b.amount, 0);
  const dueSoonBillsAmount = recurringBills
    .filter(b => b.status === 'due')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 bg-foreground text-background dark:bg-card dark:text-card-foreground rounded-xl shadow-lg">
          <CardHeader>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground/80">Current Balance</CardDescription>
            <CardTitle className="text-4xl font-bold text-background dark:text-primary">{formatCurrency(currentBalance, currency)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardDescription>Income</CardDescription>
            <CardTitle className="text-3xl font-semibold text-green-600">{formatCurrency(totalIncome, currency)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardDescription>Expenses</CardDescription>
            <CardTitle className="text-3xl font-semibold text-red-600">{formatCurrency(totalExpenses, currency)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pots Section */}
        <Card className="lg:col-span-1 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pots</CardTitle>
            <Link href="/savings" legacyBehavior passHref>
              <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80">
                See Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/30 p-4 rounded-lg flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSavedInPots, currency)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {savingsPots.slice(0, 4).map((pot, index) => (
                <div key={pot.id} className="flex items-center space-x-2">
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: getSafeChartColor(index) }}></div>
                  <div>
                    <p className="text-sm font-medium truncate">{pot.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(pot.currentAmount, currency)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budgets Section */}
        <Card className="lg:col-span-2 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Budgets</CardTitle>
            <Link href="/budgets" legacyBehavior passHref>
              <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80">
                See Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          {/* <CardContent className="grid md:grid-cols-2 gap-6 items-center"> */}
            <BudgetCategoryDonutChart />
          {/* </CardContent> */}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transactions Section */}
        <Card className="lg:col-span-2 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <Link href="/transactions" legacyBehavior passHref>
              <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center py-3 border-b last:border-b-0">
                  <Avatar className="h-10 w-10 mr-3">
                     {getTransactionIcon(transaction.category, transaction.description)}
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, currency)}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recurring Bills Section */}
        <Card className="lg:col-span-1 rounded-xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recurring Bills</CardTitle>
            <Link href="/bills" legacyBehavior passHref>
              <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80">
                See Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Paid Bills', amount: paidBillsAmount, colorIndex: 0 },
              { label: 'Total Upcoming', amount: upcomingBillsAmount, colorIndex: 1 },
              { label: 'Due Soon', amount: dueSoonBillsAmount, colorIndex: 2 },
            ].map((item, index) => (
              <div key={item.label} className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: getSafeChartColor(item.colorIndex) }}></div>
                <div className="flex-grow">
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(item.amount, currency)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

