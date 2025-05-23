'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/data-loader'; // Assuming formatCurrency is here

interface SavingsPotCardProps {
  name: string;
  savedAmount: number;
  targetAmount: number;
  currency: string;
}
 
export function SavingsPotCard({
  name,
  savedAmount,
  targetAmount,
  currency,
}: SavingsPotCardProps) {
  const progress = (savedAmount / targetAmount) * 100;

  return (
    <Card className="bg-white rounded-lg shadow-md p-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        </div>
        {/* Three dots icon placeholder */}
        <div className="text-gray-400">...</div>
      </CardHeader>
      <CardContent>
        <div className="text-gray-500 text-sm mb-1">Total Saved</div>
        <div className="text-3xl font-bold mb-4">
          {formatCurrency(savedAmount, currency)}
        </div>
        <Progress value={progress} className="w-full mb-2" />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{progress.toFixed(2)}%</span>
          <span>Target of {formatCurrency(targetAmount, currency)}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
            + Add Money
          </Button>
          <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}