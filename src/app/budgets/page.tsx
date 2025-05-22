'use client';

import { useState, useEffect, useMemo } from 'react';
import { getBudgetsSync, getUserCurrencySync, formatCurrency, formatDate, getTransactionCategoriesSync } from '@/lib/data-loader';
import type { Budget } from '@/data/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import * as LucideIcons from 'lucide-react';
import { Wallet, Trash2, Edit3, Calendar as CalendarIcon, PackagePlus, ShoppingBasket, Film } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

type IconName = keyof typeof LucideIcons;

const IconComponent = ({ name, ...props }: { name?: string } & LucideIcons.LucideProps) => {
  if (!name || !(name in LucideIcons)) {
    return <Wallet {...props} />; // Default budget icon
  }
  const LucideIcon = LucideIcons[name as IconName] as React.ElementType;
  return <LucideIcon {...props} />;
};

const initialNewBudgetState: Omit<Budget, 'id'> = {
  name: '',
  category: '',
  amount: 0,
  spentAmount: 0,
  period: 'monthly',
  startDate: new Date().toISOString(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(), // Default to one month from now
  icon: 'Wallet',
};


export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currency, setCurrency] = useState<string>('');
  const [transactionCategories, setTransactionCategories] = useState<string[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Omit<Budget, 'id'> | Budget>(initialNewBudgetState);
  const [isEditing, setIsEditing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setBudgets(getBudgetsSync());
    setCurrency(getUserCurrencySync());
    setTransactionCategories(['Overall', ...getTransactionCategoriesSync()]);
  }, []);

  const handleInputChange = (field: keyof Budget, value: string | number) => {
    setCurrentBudget(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    setCurrentBudget(prev => ({ ...prev, [field]: date ? date.toISOString() : '' }));
  };
  
  const handlePeriodChange = (value: Budget['period']) => {
    setCurrentBudget(prev => ({ ...prev, period: value }));
    // Optionally adjust start/end dates based on period
    const today = new Date();
    let newStartDate = today;
    let newEndDate = new Date(today);

    if (value === 'monthly') {
      newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
      newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (value === 'weekly') {
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        newEndDate = new Date(firstDayOfWeek);
        newEndDate.setDate(newEndDate.getDate() + 6);
        newStartDate = firstDayOfWeek;

    } else if (value === 'yearly') {
      newStartDate = new Date(today.getFullYear(), 0, 1);
      newEndDate = new Date(today.getFullYear(), 11, 31);
    }
    // For 'custom', user sets dates manually
    if (value !== 'custom') {
        setCurrentBudget(prev => ({
        ...prev,
        startDate: newStartDate.toISOString(),
        endDate: newEndDate.toISOString(),
        }));
    }
  };


  const openCreateForm = () => {
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
    
    setCurrentBudget({
        ...initialNewBudgetState,
        startDate: defaultStartDate,
        endDate: defaultEndDate,
    });
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEditForm = (budget: Budget) => {
    setCurrentBudget(budget);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    if (!currentBudget.name || !currentBudget.category || currentBudget.amount <= 0) {
      toast({ title: "Error", description: "Budget name, category, and a valid amount are required.", variant: "destructive" });
      return;
    }
    if (new Date(currentBudget.startDate) >= new Date(currentBudget.endDate)) {
        toast({ title: "Error", description: "Start date must be before end date.", variant: "destructive"});
        return;
    }

    if (isEditing) {
      setBudgets(prev => prev.map(b => b.id === (currentBudget as Budget).id ? (currentBudget as Budget) : b));
      toast({ title: "Success", description: `Budget "${currentBudget.name}" updated.` });
    } else {
      const newBudget: Budget = {
        ...(currentBudget as Omit<Budget, 'id'>),
        id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      };
      setBudgets(prev => [...prev, newBudget]);
      toast({ title: "Success", description: `Budget "${newBudget.name}" created.` });
    }
    setIsFormOpen(false);
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
    toast({ title: "Success", description: "Budget deleted." });
  };
  
  const getBudgetProgress = (budget: Budget) => {
    if (budget.amount === 0) return 0;
    const progress = (budget.spentAmount / budget.amount) * 100;
    return Math.min(Math.max(progress, 0), 100); // Cap progress between 0 and 100
  };

  const getBudgetStatusColor = (budget: Budget): string => {
    const progress = getBudgetProgress(budget);
    if (progress > 100) return "bg-red-500"; // Overspent
    if (progress > 80) return "bg-yellow-500"; // Nearing limit
    return "bg-primary"; // Default progress color from theme
  };


  if (!budgets.length && !currency) {
    return <Card><CardContent><p className="p-4 text-center">Loading budgets...</p></CardContent></Card>;
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreateForm}>
          <PackagePlus className="mr-2 h-4 w-4" /> Create New Budget
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details of your budget.' : 'Set up a new budget to track your spending.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="budgetName">Budget Name</Label>
              <Input id="budgetName" value={currentBudget.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="e.g., Monthly Groceries" />
            </div>
            <div>
              <Label htmlFor="budgetCategory">Category</Label>
              <Select value={currentBudget.category} onValueChange={value => handleInputChange('category', value)}>
                <SelectTrigger id="budgetCategory">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {transactionCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="budgetAmount">Budgeted Amount ({currency})</Label>
              <Input id="budgetAmount" type="number" value={currentBudget.amount === 0 ? '' : currentBudget.amount.toString()} onChange={e => handleInputChange('amount', parseFloat(e.target.value) || 0)} placeholder="e.g., 500" />
            </div>
             <div>
              <Label htmlFor="budgetSpentAmount">Spent Amount ({currency})</Label>
              <Input id="budgetSpentAmount" type="number" value={currentBudget.spentAmount === 0 ? '' : currentBudget.spentAmount.toString()} onChange={e => handleInputChange('spentAmount', parseFloat(e.target.value) || 0)} placeholder="e.g., 150" />
            </div>
            <div>
              <Label htmlFor="budgetPeriod">Period</Label>
              <Select value={currentBudget.period} onValueChange={(value: Budget['period']) => handlePeriodChange(value)}>
                <SelectTrigger id="budgetPeriod">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="budgetStartDate">Start Date</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button id="budgetStartDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !currentBudget.startDate && "text-muted-foreground")} disabled={currentBudget.period !== 'custom' && !isEditing /* Allow editing custom dates even if period is not custom */}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentBudget.startDate ? formatDate(currentBudget.startDate) : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={currentBudget.startDate ? new Date(currentBudget.startDate) : undefined} onSelect={date => handleDateChange('startDate', date)} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <Label htmlFor="budgetEndDate">End Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button id="budgetEndDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !currentBudget.endDate && "text-muted-foreground")} disabled={currentBudget.period !== 'custom' && !isEditing}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {currentBudget.endDate ? formatDate(currentBudget.endDate) : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={currentBudget.endDate ? new Date(currentBudget.endDate) : undefined} onSelect={date => handleDateChange('endDate', date)} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div>
              <Label htmlFor="budgetIcon">Icon Name (Optional)</Label>
              <Input id="budgetIcon" value={currentBudget.icon || 'Wallet'} onChange={e => handleInputChange('icon', e.target.value)} placeholder="e.g., ShoppingBasket (Lucide Icon)" />
              <p className="text-xs text-muted-foreground mt-1">Use any icon name from <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">lucide.dev</a>.</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button onClick={handleSubmit}>{isEditing ? 'Save Changes' : 'Create Budget'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {budgets.length === 0 && (
         <Card>
            <CardContent className="p-6 text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Budgets Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first budget to start tracking your spending.</p>
                <Button onClick={openCreateForm}>
                    <PackagePlus className="mr-2 h-4 w-4" /> Create New Budget
                </Button>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const progress = getBudgetProgress(budget);
          const isOverspent = budget.spentAmount > budget.amount;
          return (
            <Card key={budget.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <IconComponent name={budget.icon} className="h-8 w-8 text-primary" />
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(budget)} className="h-7 w-7">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the "{budget.name}" budget.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteBudget(budget.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardTitle>{budget.name}</CardTitle>
                <CardDescription>
                  Category: {budget.category} | Period: {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                  <br/>({formatDate(budget.startDate, {month:'short', day:'numeric'})} - {formatDate(budget.endDate, {month:'short', day:'numeric', year:'numeric'})})
                </CardDescription>
                <Badge 
                    variant={isOverspent ? "destructive" : (progress >= 100 ? "default" : "secondary")}
                    className={cn("mt-2 w-fit", progress >= 100 && !isOverspent ? "bg-green-500 text-white" : "")}
                >
                    {isOverspent ? "Overspent" : (progress >= 100 ? "Limit Reached" : "In Progress")}
                </Badge>
              </CardHeader>
              <CardContent className="flex-grow">
                <Progress value={progress} className="mb-2 h-4" indicatorClassName={getBudgetStatusColor(budget)} />
                <div className="text-sm font-medium">
                  {formatCurrency(budget.spentAmount, currency)} spent of {formatCurrency(budget.amount, currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isOverspent
                    ? `Overspent by ${formatCurrency(budget.spentAmount - budget.amount, currency)}`
                    : (budget.amount - budget.spentAmount >= 0 
                        ? `${formatCurrency(budget.amount - budget.spentAmount, currency)} remaining` 
                        : `Limit reached`)}
                </p>
              </CardContent>
               <CardFooter>
                 <p className="text-xs text-muted-foreground">
                    {Math.round(progress)}% of budget used.
                 </p>
               </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
