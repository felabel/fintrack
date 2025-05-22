'use client';

import { useState, useEffect } from 'react';
import { getSavingsPotsSync, getUserCurrencySync, formatCurrency, formatDate } from '@/lib/data-loader';
import type { SavingsPot } from '@/data/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import * as LucideIcons from 'lucide-react';
import { PiggyBank, MinusCircle, PlusCircle, Trash2, Edit3, Calendar as CalendarIcon, PackagePlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type IconName = keyof typeof LucideIcons;

const IconComponent = ({ name, ...props }: { name?: string } & LucideIcons.LucideProps) => {
  if (!name || !(name in LucideIcons)) {
    return <PiggyBank {...props} />;
  }
  const LucideIcon = LucideIcons[name as IconName] as React.ElementType;
  return <LucideIcon {...props} />;
};

const initialNewPotState = {
  id: '',
  name: '',
  goal: 0,
  currentAmount: 0,
  targetDate: undefined as string | undefined,
  icon: 'PiggyBank' as IconName | string,
};

export default function SavingsPotsPage() {
  const [savingsPots, setSavingsPots] = useState<SavingsPot[]>([]);
  const [currency, setCurrency] = useState<string>('');
  const [selectedPot, setSelectedPot] = useState<SavingsPot | null>(null);
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [isCreatePotDialogOpen, setIsCreatePotDialogOpen] = useState(false);
  const [newPotDetails, setNewPotDetails] = useState<typeof initialNewPotState>(initialNewPotState);
  const [editingPotDetails, setEditingPotDetails] = useState<SavingsPot | null>(null);
  const [isEditPotDialogOpen, setIsEditPotDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setSavingsPots(getSavingsPotsSync());
    setCurrency(getUserCurrencySync());
  }, []);

  const handleTransactionAmountChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setTransactionAmount(num);
    } else if (value === '') {
      setTransactionAmount(0);
    }
  };

  const handlePotTransaction = (type: 'add' | 'withdraw') => {
    if (!selectedPot || transactionAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    setSavingsPots(prevPots =>
      prevPots.map(pot => {
        if (pot.id === selectedPot.id) {
          let newAmount = pot.currentAmount;
          if (type === 'add') {
            newAmount += transactionAmount;
          } else {
            newAmount -= transactionAmount;
            if (newAmount < 0) {
              toast({
                title: "Insufficient Funds",
                description: "Withdrawal amount exceeds current balance in the pot.",
                variant: "destructive",
              });
              return pot;
            }
          }
          return { ...pot, currentAmount: newAmount };
        }
        return pot;
      })
    );
    
    toast({
      title: "Success",
      description: `Successfully ${type === 'add' ? 'added' : 'withdrew'} ${formatCurrency(transactionAmount, currency)} ${type === 'add' ? 'to' : 'from'} ${selectedPot.name}.`,
    });
    setTransactionAmount(0);
    // Dialog will be closed by DialogClose trigger
  };

  const handleCreatePotInputChange = (field: keyof typeof initialNewPotState, value: string | number | undefined) => {
    setNewPotDetails(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCreatePotDateChange = (date: Date | undefined) => {
    setNewPotDetails(prev => ({ ...prev, targetDate: date ? date.toISOString() : undefined }));
  };

  const handleCreateNewPot = () => {
    if (!newPotDetails.name || newPotDetails.goal <= 0) {
      toast({ title: "Error", description: "Pot name and a valid goal amount are required.", variant: "destructive" });
      return;
    }
    const newPot: SavingsPot = {
      ...newPotDetails,
      id: `pot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      currentAmount: newPotDetails.currentAmount > 0 ? newPotDetails.currentAmount : 0, // Ensure current amount is not negative
    };
    setSavingsPots(prev => [...prev, newPot]);
    toast({ title: "Success", description: `Savings pot "${newPot.name}" created.` });
    setIsCreatePotDialogOpen(false);
    setNewPotDetails(initialNewPotState);
  };

  const handleDeletePot = (potId: string) => {
    setSavingsPots(prev => prev.filter(p => p.id !== potId));
    toast({ title: "Success", description: "Savings pot deleted." });
  };

  const openEditDialog = (pot: SavingsPot) => {
    setEditingPotDetails({...pot, targetDate: pot.targetDate ? pot.targetDate : undefined});
    setIsEditPotDialogOpen(true);
  };

  const handleEditPotInputChange = (field: keyof SavingsPot, value: string | number | undefined) => {
    setEditingPotDetails(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleEditPotDateChange = (date: Date | undefined) => {
    setEditingPotDetails(prev => prev ? ({ ...prev, targetDate: date ? date.toISOString() : undefined }) : null);
  };

  const handleUpdatePot = () => {
    if (!editingPotDetails || !editingPotDetails.name || editingPotDetails.goal <= 0) {
      toast({ title: "Error", description: "Pot name and a valid goal amount are required.", variant: "destructive" });
      return;
    }
    setSavingsPots(prevPots => prevPots.map(p => p.id === editingPotDetails.id ? editingPotDetails : p));
    toast({ title: "Success", description: `Savings pot "${editingPotDetails.name}" updated.` });
    setIsEditPotDialogOpen(false);
    setEditingPotDetails(null);
  };
  
  if (!savingsPots.length && !currency) { // Check currency too, as it's loaded in useEffect
    return <Card><CardContent><p className="p-4 text-center">Loading savings pots...</p></CardContent></Card>;
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Dialog open={isCreatePotDialogOpen} onOpenChange={setIsCreatePotDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setNewPotDetails(initialNewPotState)}>
              <PackagePlus className="mr-2 h-4 w-4" /> Create New Pot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Savings Pot</DialogTitle>
              <DialogDescription>Set up a new goal to save towards.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="potName">Pot Name</Label>
                <Input id="potName" value={newPotDetails.name} onChange={e => handleCreatePotInputChange('name', e.target.value)} placeholder="e.g., Dream Vacation" />
              </div>
              <div>
                <Label htmlFor="potGoal">Goal Amount ({currency})</Label>
                <Input id="potGoal" type="number" value={newPotDetails.goal === 0 ? '' : newPotDetails.goal.toString()} onChange={e => handleCreatePotInputChange('goal', parseFloat(e.target.value) || 0)} placeholder="e.g., 2000" />
              </div>
              <div>
                <Label htmlFor="potCurrentAmount">Initial Amount ({currency}) (Optional)</Label>
                <Input id="potCurrentAmount" type="number" value={newPotDetails.currentAmount === 0 ? '' : newPotDetails.currentAmount.toString()} onChange={e => handleCreatePotInputChange('currentAmount', parseFloat(e.target.value) || 0)} placeholder="e.g., 100" />
              </div>
              <div>
                <Label htmlFor="potTargetDate">Target Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="potTargetDate"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newPotDetails.targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newPotDetails.targetDate ? formatDate(newPotDetails.targetDate) : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newPotDetails.targetDate ? new Date(newPotDetails.targetDate) : undefined}
                      onSelect={handleCreatePotDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="potIcon">Icon Name (Optional)</Label>
                <Input id="potIcon" value={newPotDetails.icon} onChange={e => handleCreatePotInputChange('icon', e.target.value)} placeholder="e.g., Plane, Laptop (Lucide Icon)" />
                 <p className="text-xs text-muted-foreground mt-1">Use any icon name from <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">lucide.dev</a>.</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button onClick={handleCreateNewPot}>Create Pot</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savingsPots.map((pot) => (
          <Card key={pot.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <IconComponent name={pot.icon} className="h-8 w-8 text-primary" />
                <div className="flex items-center gap-2">
                   <Dialog open={isEditPotDialogOpen && editingPotDetails?.id === pot.id} onOpenChange={(isOpen) => { if (!isOpen) setEditingPotDetails(null); setIsEditPotDialogOpen(isOpen); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(pot)} className="h-7 w-7">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {/* Edit Dialog Content will be a single instance reused */}
                  </Dialog>
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
                          This action cannot be undone. This will permanently delete the "{pot.name}" savings pot and all its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePot(pot.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardTitle>{pot.name}</CardTitle>
              <CardDescription>
                Goal: {formatCurrency(pot.goal, currency)}
                {pot.targetDate && ` by ${formatDate(pot.targetDate)}`}
              </CardDescription>
               <Badge variant={pot.currentAmount >= pot.goal ? "default" : "secondary"} className={cn("mt-2 w-fit", pot.currentAmount >= pot.goal ? "bg-green-500 text-white" : "")}>
                {pot.currentAmount >= pot.goal ? "Goal Reached!" : "In Progress"}
              </Badge>
            </CardHeader>
            <CardContent className="flex-grow">
              <Progress value={(pot.currentAmount / pot.goal) * 100} className="mb-2 h-4" />
              <div className="text-sm font-medium">
                {formatCurrency(pot.currentAmount, currency)} saved ({Math.round((pot.currentAmount / pot.goal) * 100)}%)
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {pot.currentAmount < pot.goal 
                  ? `${formatCurrency(pot.goal - pot.currentAmount, currency)} more to go.`
                  : `You've reached your goal!`}
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Dialog onOpenChange={(isOpen) => { if (!isOpen) setTransactionAmount(0); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPot(pot)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Money to {selectedPot?.name}</DialogTitle>
                    <DialogDescription>
                      Current balance: {selectedPot && formatCurrency(selectedPot.currentAmount, currency)}
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="number"
                    placeholder={`Amount in ${currency}`}
                    value={transactionAmount === 0 ? '' : transactionAmount.toString()}
                    onChange={(e) => handleTransactionAmountChange(e.target.value)}
                    className="my-4"
                  />
                  <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => handlePotTransaction('add')} disabled={transactionAmount <=0}>Add Funds</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog onOpenChange={(isOpen) => { if (!isOpen) setTransactionAmount(0); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPot(pot)} disabled={pot.currentAmount === 0}>
                    <MinusCircle className="mr-2 h-4 w-4" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Money from {selectedPot?.name}</DialogTitle>
                    <DialogDescription>
                      Current balance: {selectedPot && formatCurrency(selectedPot.currentAmount, currency)}
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="number"
                    placeholder={`Amount in ${currency}`}
                    value={transactionAmount === 0 ? '' : transactionAmount.toString()}
                    onChange={(e) => handleTransactionAmountChange(e.target.value)}
                    className="my-4"
                  />
                  <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => handlePotTransaction('withdraw')} variant="destructive" disabled={transactionAmount <=0}>Withdraw Funds</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
      {/* Reusable Edit Pot Dialog */}
      {editingPotDetails && (
        <Dialog open={isEditPotDialogOpen && editingPotDetails !== null} onOpenChange={(isOpen) => { if (!isOpen) setEditingPotDetails(null); setIsEditPotDialogOpen(isOpen); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Savings Pot: {editingPotDetails.name}</DialogTitle>
              <DialogDescription>Update the details for your savings pot.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="editPotName">Pot Name</Label>
                <Input id="editPotName" value={editingPotDetails.name} onChange={e => handleEditPotInputChange('name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="editPotGoal">Goal Amount ({currency})</Label>
                <Input id="editPotGoal" type="number" value={editingPotDetails.goal === 0 ? '' : editingPotDetails.goal.toString()} onChange={e => handleEditPotInputChange('goal', parseFloat(e.target.value) || 0)} />
              </div>
               <div>
                <Label htmlFor="editPotCurrentAmount">Current Amount ({currency})</Label>
                <Input id="editPotCurrentAmount" type="number" value={editingPotDetails.currentAmount === 0 ? '' : editingPotDetails.currentAmount.toString()} onChange={e => handleEditPotInputChange('currentAmount', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label htmlFor="editPotTargetDate">Target Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="editPotTargetDate"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editingPotDetails.targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingPotDetails.targetDate ? formatDate(editingPotDetails.targetDate) : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingPotDetails.targetDate ? new Date(editingPotDetails.targetDate) : undefined}
                      onSelect={handleEditPotDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="editPotIcon">Icon Name (Optional)</Label>
                <Input id="editPotIcon" value={editingPotDetails.icon || ''} onChange={e => handleEditPotInputChange('icon', e.target.value)} />
                 <p className="text-xs text-muted-foreground mt-1">Use any icon name from <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">lucide.dev</a>.</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost" onClick={() => setIsEditPotDialogOpen(false)}>Cancel</Button></DialogClose>
              <Button onClick={handleUpdatePot}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
