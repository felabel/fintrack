
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Corrected import
import { GeistMono } from 'geist/font/mono'; // Corrected import
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'FinTrack Lite',
  description: 'Your personal finance companion, simplified.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          GeistSans.variable, // Use .variable
          GeistMono.variable  // Use .variable
        )}
      >
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
