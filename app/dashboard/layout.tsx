'use client';

import { Sidebar } from '@/components/layout/sidebar';
import Image from 'next/image';
import { useState } from 'react';
import {
  PanelLeft,
  LogOut,
  ChevronDown,
  MoonIcon,
  SunIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { setTheme, resolvedTheme } = useTheme();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in');
          toast.success('Sign out successfully');
        },
        onError: (error) => {
          toast.error('Sign out failed');
        },
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-sidebar">
      {/* SIDEBAR (Desktop) */}
      <aside
        className={cn(
          'hidden flex-col md:flex transition-all duration-300 ease-in-out bg-background dark:bg-sidebar',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        <div
          className={cn(
            'h-14 flex items-center border-b border-sidebar-border px-3 shrink-0',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <Button
              variant="ghost"
              className="px-2"
              onClick={() => router.push('/')}
            >
              <Image
                src="/logo.png"
                alt="Sibarkumen Logo"
                width={20}
                height={20}
                className="h-5 w-auto object-contain shrink-0"
              />
              <span className="text-lg font-semibold tracking-tight whitespace-nowrap text-sidebar-foreground">
                Sibarkumen
              </span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <PanelLeft
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isCollapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="p-3">
          {isPending ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              {!isCollapsed && (
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-16" />
                </div>
              )}
            </div>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full h-auto p-2 justify-start',
                    isCollapsed && 'justify-center px-0'
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ''}
                      alt={session.user.name}
                    />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-medium">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex flex-col items-start ml-1 text-left overflow-hidden">
                        <span className="text-sm font-semibold text-sidebar-foreground leading-none truncate w-full">
                          {session.user.name}
                        </span>
                        <span className="text-xs text-sidebar-foreground/70 mt-0.5 capitalize truncate w-full">
                          {session.user.role || 'User'}
                        </span>
                      </div>
                      <ChevronDown className="ml-auto h-4 w-4 text-sidebar-foreground/50 shrink-0" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                align="center"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session.user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled className="text-xs font-semibold">
                    Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    disabled={resolvedTheme === 'dark'}
                    className={cn(resolvedTheme === 'dark' && 'text-primary')}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <MoonIcon className="h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    disabled={resolvedTheme === 'light'}
                    className={cn(resolvedTheme === 'light' && 'text-primary')}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <SunIcon className="h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <div
          className={cn(
            'flex-1 overflow-y-auto py-4',
            isCollapsed ? 'px-2' : 'px-3'
          )}
        >
          <Sidebar isCollapsed={isCollapsed} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 rounded-tl-none lg:rounded-tl-2xl border border-border bg-sidebar dark:bg-background mt-0 lg:mt-2 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
