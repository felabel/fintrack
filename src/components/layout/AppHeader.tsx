'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
// Icons are illustrative; actual icons used are determined by AppSidebar
// import { Home, ArrowRightLeft, PiggyBank, Landmark, Wallet, Sparkles } from 'lucide-react'; 

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard Overview';
  if (pathname.startsWith('/transactions')) return 'Transaction Manager';
  if (pathname.startsWith('/savings')) return 'Savings Pot Tracker';
  if (pathname.startsWith('/budgets')) return 'Budget Manager'; // Added Budgets
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
      </div>
    </header>
  );
}
