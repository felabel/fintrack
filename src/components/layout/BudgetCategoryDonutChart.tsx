'use client';

import type { ChartConfig } from '@/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Label } from 'recharts';
import * as React from 'react';
import { Pie, PieChart } from 'recharts';
import { formatCurrency } from '@/lib/utils'; // Assuming formatCurrency is available here

const chartData = [
 { name: 'Spent', value: 338, fill: 'hsl(var(--chart-1))' }, // Combined spent amount for initial display
  { name: 'Entertainment', value: 50, fill: 'hsl(var(--chart-1))' },
  { name: 'Bills', value: 750, fill: 'hsl(var(--chart-2))' },
  { name: 'Dining Out', value: 75, fill: 'hsl(var(--chart-3))' },
  { name: 'Personal Care', value: 100, fill: 'hsl(var(--chart-4))' },
];


const totalSpent = 338; // Hardcoded total spent
const totalLimit = 975; // Hardcoded total limit
const currency = 'USD'; // Hardcoded currency
const remaining = totalLimit - totalSpent;

const chartConfig = {
  Entertainment: {
    label: 'Entertainment',
    color: 'hsl(var(--chart-1))',
  },
  Bills: {
    label: 'Bills',
    color: 'hsl(var(--chart-2))',
  },
  DiningOut: {
    label: 'Dining Out',
    color: 'hsl(var(--chart-3))',
  },
  PersonalCare: {
    label: 'Personal Care',
    color: 'hsl(var(--chart-4))',
  },
  Remaining: {
    label: 'Remaining',
    color: 'hsl(var(--chart-5))', // Use a consistent color for remaining
  },
} satisfies ChartConfig;

export function BudgetCategoryDonutChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius="60%"
          strokeWidth={1}
        >
          <Label
            value={` ${formatCurrency(totalSpent, currency)} spent`}
            offset={100}
            position="center"
            className="fill-foreground text-lg font-bold"
          />
          {/* <div className='mt-8'>
              <Label
            value={`of ${formatCurrency(totalLimit, currency)} limit`}
            offset={0}
            position="center"
            className="fill-muted-foreground text-xs mt-8"
          /> 
          </div> */}
       
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}