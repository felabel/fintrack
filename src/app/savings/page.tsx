"use client";

import { useState, useEffect } from "react";
import {
  getSavingsPotsSync,
  getUserCurrencySync,
  formatCurrency,
  formatDate,
} from "@/lib/data-loader";
import type { SavingsPot } from "@/data/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import * as LucideIcons from "lucide-react"; // For dynamic icons
import { PiggyBank, MinusCircle, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type IconName = keyof typeof LucideIcons;

const IconComponent = ({
  name,
  ...props
}: { name?: string } & LucideIcons.LucideProps) => {
  if (!name || !(name in LucideIcons)) {
    return <PiggyBank {...props} />;
  }
  const LucideIcon = LucideIcons[name as IconName] as React.ElementType;
  return <LucideIcon {...props} />;
};

export default function SavingsPotsPage() {
  const [savingsPots, setSavingsPots] = useState<SavingsPot[]>([]);
  const [currency, setCurrency] = useState<string>("");
  const [selectedPot, setSelectedPot] = useState<SavingsPot | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    setSavingsPots(getSavingsPotsSync());
    setCurrency(getUserCurrencySync());
  }, []);

  const handleAmountChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setAmount(num);
    } else if (value === "") {
      setAmount(0);
    }
  };

  const handleTransaction = (type: "add" | "withdraw") => {
    if (!selectedPot || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    setSavingsPots((prevPots) =>
      prevPots.map((pot) => {
        if (pot.id === selectedPot.id) {
          let newAmount = pot.currentAmount;
          if (type === "add") {
            newAmount += amount;
          } else {
            newAmount -= amount;
            if (newAmount < 0) {
              toast({
                title: "Insufficient Funds",
                description:
                  "Withdrawal amount exceeds current balance in the pot.",
                variant: "destructive",
              });
              return pot; // No change if withdrawal leads to negative
            }
          }
          return { ...pot, currentAmount: newAmount };
        }
        return pot;
      })
    );

    toast({
      title: "Success",
      description: `Successfully ${
        type === "add" ? "added" : "withdrew"
      } ${formatCurrency(amount, currency)} ${type === "add" ? "to" : "from"} ${
        selectedPot.name
      }.`,
    });
    setAmount(0); // Reset amount
    // DialogClose will be triggered by button click, closing the dialog
  };

  if (!savingsPots.length) {
    return (
      <Card>
        <CardContent>
          <p className="p-4 text-center">Loading savings pots...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {savingsPots.map((pot) => (
        <Card key={pot.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <IconComponent name={pot.icon} className="h-8 w-8 text-primary" />
              <Badge
                variant={
                  pot.currentAmount >= pot.goal ? "default" : "secondary"
                }
                className={
                  pot.currentAmount >= pot.goal ? "bg-green-500 text-white" : ""
                }
              >
                {pot.currentAmount >= pot.goal
                  ? "Goal Reached!"
                  : "In Progress"}
              </Badge>
            </div>
            <CardTitle>{pot.name}</CardTitle>
            <CardDescription>
              Goal: {formatCurrency(pot.goal, currency)}
              {pot.targetDate && ` by ${formatDate(pot.targetDate)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Progress
              value={(pot.currentAmount / pot.goal) * 100}
              className="mb-2 h-4"
            />
            <div className="text-sm font-medium">
              {formatCurrency(pot.currentAmount, currency)} saved (
              {Math.round((pot.currentAmount / pot.goal) * 100)}%)
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pot.currentAmount < pot.goal
                ? `${formatCurrency(
                    pot.goal - pot.currentAmount,
                    currency
                  )} more to go.`
                : `You've reached your goal!`}
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Dialog
              onOpenChange={(isOpen) => {
                if (!isOpen) setAmount(0);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPot(pot)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money to {selectedPot?.name}</DialogTitle>
                  <DialogDescription>
                    Current balance:{" "}
                    {selectedPot &&
                      formatCurrency(selectedPot.currentAmount, currency)}
                  </DialogDescription>
                </DialogHeader>
                <Input
                  type="number"
                  placeholder={`Amount in ${currency}`}
                  value={amount === 0 ? "" : amount.toString()}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="my-4"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      onClick={() => handleTransaction("add")}
                      disabled={amount <= 0}
                    >
                      Add Funds
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              onOpenChange={(isOpen) => {
                if (!isOpen) setAmount(0);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPot(pot)}
                  disabled={pot.currentAmount === 0}
                >
                  <MinusCircle className="mr-2 h-4 w-4" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Withdraw Money from {selectedPot?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Current balance:{" "}
                    {selectedPot &&
                      formatCurrency(selectedPot.currentAmount, currency)}
                  </DialogDescription>
                </DialogHeader>
                <Input
                  type="number"
                  placeholder={`Amount in ${currency}`}
                  value={amount === 0 ? "" : amount.toString()}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="my-4"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      onClick={() => handleTransaction("withdraw")}
                      variant="destructive"
                      disabled={amount <= 0}
                    >
                      Withdraw Funds
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
