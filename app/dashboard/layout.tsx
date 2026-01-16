'use client';

import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effect to redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session && isMounted) {
      router.push('/sign-in');
    }
  }, [session, isPending, router, isMounted]);

  if (!isMounted || isPending) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <ThemeToggle />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{session.user.name}</span>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
