'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Home, ArrowRightLeft, PiggyBank, Landmark, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard Overview';
  if (pathname.startsWith('/transactions')) return 'Transaction Manager';
  if (pathname.startsWith('/savings')) return 'Savings Pot Tracker';
  if (pathname.startsWith('/bills')) return 'Recurring Bills Monitor';
  if (pathname.startsWith('/advice')) return 'Smart Advice Tool';
  return 'FinTrack Lite';
};

export function AppHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        {/* Placeholder for global search or user menu if needed later */}
        {/* 
        <form className="relative ml-auto flex-1 sm:flex-initial">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
          />
        </form>
        <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">User Profile</span>
        </Button>
        */}
      </div>
    </header>
  );
}
