'use client';

import { useState, useMemo, useEffect } from 'react';
import { getRecurringBillsSync, getUserCurrencySync, formatCurrency, formatDate } from '@/lib/data-loader';
import type { RecurringBill } from '@/data/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type BillSortKeys = keyof RecurringBill | 'statusOrder';

const statusOrderMapping = {
  'overdue': 1,
  'due': 2,
  'paid': 3,
};

export default function RecurringBillsPage() {
  const [allBills, setAllBills] = useState<RecurringBill[]>([]);
  const [currency, setCurrency] = useState<string>('');

  useEffect(() => {
    setAllBills(getRecurringBillsSync());
    setCurrency(getUserCurrencySync());
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: BillSortKeys | null; direction: 'ascending' | 'descending' }>({ key: 'nextDueDate', direction: 'ascending' });

  const filteredAndSortedBills = useMemo(() => {
    let bills = [...allBills];

    if (searchTerm) {
      bills = bills.filter(bill =>
        bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.key) {
      bills.sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'statusOrder') {
          valA = statusOrderMapping[a.status];
          valB = statusOrderMapping[b.status];
        } else {
          valA = a[sortConfig.key as keyof RecurringBill];
          valB = b[sortConfig.key as keyof RecurringBill];
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return bills;
  }, [allBills, searchTerm, sortConfig]);

  const requestSort = (key: BillSortKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const SortableButton = ({ columnKey, label }: { columnKey: BillSortKeys; label: string }) => (
    <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-1">
      {label}
      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.key === columnKey ? '' : 'opacity-50'}`} />
    </Button>
  );
  
  const getStatusBadgeVariant = (status: RecurringBill['status']): "destructive" | "secondary" | "default" => {
    if (status === 'overdue') return 'destructive';
    if (status === 'due') return 'secondary'; // Using secondary for 'due' which might be yellow-ish or similar
    return 'default'; // Using default for 'paid' (e.g. primary color or green)
  };

  if (!allBills.length) {
    return <Card><CardContent><p className="p-4 text-center">Loading bills...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Bills</CardTitle>
        <CardDescription>Monitor your upcoming and past recurring payments.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bills by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><SortableButton columnKey="name" label="Bill Name" /></TableHead>
                <TableHead><SortableButton columnKey="category" label="Category" /></TableHead>
                <TableHead className="text-right"><SortableButton columnKey="amount" label="Amount" /></TableHead>
                <TableHead><SortableButton columnKey="nextDueDate" label="Next Due Date" /></TableHead>
                <TableHead><SortableButton columnKey="statusOrder" label="Status" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedBills.length > 0 ? filteredAndSortedBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.name}</TableCell>
                  <TableCell>{bill.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(bill.amount, currency)}</TableCell>
                  <TableCell>{formatDate(bill.nextDueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(bill.status)} 
                           className={bill.status === 'paid' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                                      bill.status === 'due' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : ''}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No bills found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
