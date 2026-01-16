'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Surat Permintaan',
    url: '/dashboard/surat-permintaan',
    icon: FileText,
  },
  {
    title: 'Inventaris',
    url: '/dashboard/inventaris',
    icon: FolderOpen,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in');
        },
      },
    });
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="p-6 flex items-center gap-2 font-bold text-xl border-b">
        <div className="relative h-8 w-8">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <span>Sibarkumen</span>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {items.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                pathname === item.url
                  ? 'bg-muted text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
