"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAppDataSync, formatCurrency, formatDate } from "@/lib/data-loader";
import type { Transaction, SavingsPot } from "@/data/types";
import {
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank as PiggyBankIcon,
  Target,
  TrendingUp,
  FileText,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const { transactions, savingsPots, recurringBills, user } = getAppDataSync();
  const currency = user.currency;

  const recentTransactions = transactions.slice(0, 5);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const spendingByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const spendingChartData = Object.entries(spendingByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const chartConfig = {
    value: { label: currency, color: "hsl(var(--primary))" },
  } satisfies import("@/components/ui/chart").ChartConfig;

  const PIE_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const upcomingBills = recurringBills
    .filter((b) => b.status === "due" || b.status === "overdue")
    .slice(0, 3);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Current Balance</CardDescription>
          <CardTitle className="text-4xl text-primary">
            {formatCurrency(balance, currency)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(totalIncome, currency)} income vs{" "}
            {formatCurrency(totalExpenses, currency)} expenses
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/transactions" legacyBehavior passHref>
            <Button size="sm" variant="outline">
              View All Transactions
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction: Transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription>
            Top 5 spending categories this period.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={spendingChartData}
                layout="vertical"
                margin={{ right: 20 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  dataKey="value"
                  tickFormatter={(value) =>
                    formatCurrency(value, currency).replace(currency, "")
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={4}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {savingsPots.slice(0, 3).map((pot: SavingsPot) => (
        <Card key={pot.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {pot.icon ? (
                <PiggyBankIcon className="h-6 w-6 text-primary" />
              ) : (
                <Target className="h-6 w-6 text-primary" />
              )}
              {pot.name}
            </CardTitle>
            <CardDescription>
              Goal: {formatCurrency(pot.goal, currency)}
              {pot.targetDate && ` by ${formatDate(pot.targetDate)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress
              value={(pot.currentAmount / pot.goal) * 100}
              className="mb-2 h-3"
            />
            <div className="text-sm font-medium">
              {formatCurrency(pot.currentAmount, currency)} saved (
              {Math.round((pot.currentAmount / pot.goal) * 100)}%)
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/savings" legacyBehavior passHref>
              <Button size="sm" variant="outline">
                Manage Pots
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}

      {upcomingBills.length > 0 && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Upcoming Bills
            </CardTitle>
            <CardDescription>Key bills needing attention.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className="mb-3 pb-3 border-b last:border-b-0 last:mb-0 last:pb-0"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{bill.name}</span>
                  <Badge
                    variant={
                      bill.status === "overdue" ? "destructive" : "secondary"
                    }
                  >
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(bill.amount, currency)} due{" "}
                  {formatDate(bill.nextDueDate)}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Link href="/bills" legacyBehavior passHref>
              <Button size="sm" variant="outline">
                View All Bills
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Smart Advice
          </CardTitle>
          <CardDescription>
            Get personalized financial insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Analyze your spending habits and get AI-powered recommendations to
            improve your financial health.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/advice" legacyBehavior passHref>
            <Button
              size="sm"
              variant="default"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Get Advice Now
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
