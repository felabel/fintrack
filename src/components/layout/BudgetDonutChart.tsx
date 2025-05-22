
'use client';

import type { ChartConfig } from '@/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/data-loader';
import * as React from 'react';
import { Label, Pie, PieChart, Cell } from 'recharts';

interface BudgetDonutChartProps {
  spent: number;
  total: number;
  currency: string;
}

export function BudgetDonutChart({ spent, total, currency }: BudgetDonutChartProps) {
  const remaining = Math.max(0, total - spent);
  const chartData = [
    { name: 'Spent', value: spent, fill: 'hsl(var(--chart-1))' }, // Primary color for spent
    { name: 'Remaining', value: remaining, fill: 'hsl(var(--chart-3))' }, // A muted or secondary color for remaining
  ];

  const chartConfig = {
    spent: {
      label: 'Spent',
      color: 'hsl(var(--chart-1))',
    },
    remaining: {
      label: 'Remaining',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;

  const totalCalculated = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);


  if (total === 0 && spent === 0) {
    return (
         <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Palette className="h-10 w-10 mb-2" />
            <p className="text-sm">No budget data to display.</p>
            <p className="text-xs">Set a budget to see your progress.</p>
        </div>
    )
  }


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
          strokeWidth={5}
          activeIndex={0} // Optional: to "pop out" the first segment slightly
          activeShape={({cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value}) => {
            return (
              <g>
                <text x={cx} y={cy! - 10} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--foreground))" className="text-2xl font-bold">
                  {formatCurrency(spent, currency)}
                </text>
                 <text x={cx} y={cy! + 15} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--muted-foreground))" className="text-xs">
                  of {formatCurrency(total, currency)} limit
                </text>
                <path d={`M${cx! + (outerRadius! + 10) * Math.cos(-startAngle * (Math.PI / 180))} ${cy! + (outerRadius! + 10) * Math.sin(-startAngle * (Math.PI / 180))} A${outerRadius! + 10} ${outerRadius! + 10} 0 ${endAngle - startAngle > 180 ? 1 : 0} 0 ${cx! + (outerRadius! + 10) * Math.cos(-endAngle * (Math.PI / 180))} ${cy! + (outerRadius! + 10) * Math.sin(-endAngle * (Math.PI / 180))}`} stroke={fill} fill="none" strokeWidth={1} />
                <path d={`M${cx! + (outerRadius! + 15) * Math.cos(-startAngle * (Math.PI / 180))} ${cy! + (outerRadius! + 15) * Math.sin(-startAngle * (Math.PI / 180))} L${cx! + (outerRadius! + 25) * Math.cos(-startAngle * (Math.PI / 180))} ${cy! + (outerRadius! + 25) * Math.sin(-startAngle * (Math.PI / 180))}`} stroke={fill} fill="none" strokeWidth={2} />

                <path d={`M${cx! + (innerRadius! - 10) * Math.cos(-startAngle * (Math.PI / 180))} ${cy! + (innerRadius! - 10) * Math.sin(-startAngle * (Math.PI / 180))} A${innerRadius! - 10} ${innerRadius! - 10} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx! + (innerRadius! - 10) * Math.cos(-endAngle * (Math.PI / 180))} ${cy! + (innerRadius! - 10) * Math.sin(-endAngle * (Math.PI / 180))}`} stroke={fill} fill="none" strokeWidth={1} />
                <path d={`M${cx! + (innerRadius! - 15) * Math.cos(-startAngle * (Math.PI / 180))} ${cy! + (innerRadius! - 15) * Math.sin(-startAngle * (Math.PI / 180))} L${cx! + (innerRadius! - 25) * Math.cos(-startAngle * (Math.PI / 180))} ${cy! + (innerRadius! - 25) * Math.sin(-startAngle * (Math.PI / 180))}`} stroke={fill} fill="none" strokeWidth={2} />
                
                <sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} stroke={fill} strokeWidth={1} />
              </g>
            )
          }}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
